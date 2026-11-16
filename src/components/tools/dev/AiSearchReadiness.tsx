// AI 검색 노출 준비도 진단 (2026-11-16, Gemini 이전 D). 계산: lib/dev-tools.ts auditAiReadiness·robotsBlocks.
import { useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { AI_CRAWLERS, auditAiReadiness, robotsBlocks, type AuditCheck } from "../../../lib/dev-tools";
import BarTrack from "../viz/BarTrack";
import { CopyButton, Field, areaCls, langOf, t, type Lang } from "./common";

const SAMPLE_HTML = `<!doctype html>
<html lang="en"><head>
<title>Cron Expression Explainer — read any cron schedule</title>
<meta name="description" content="Paste a cron expression to see it in plain words and the next run times in your time zone.">
<link rel="canonical" href="https://example.com/cron/">
</head><body>
<h1>Cron expression explainer</h1>
<p>Paste a schedule like 0 9 * * 1-5 …</p>
</body></html>`;
const SAMPLE_ROBOTS = "User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: CCBot\nDisallow: /";

const LABELS: Record<string, { ko: [string, string]; en: [string, string] }> = {
  title: { ko: ["제목(title) 10~70자", "제목이 없거나 너무 짧거나 길어요. 검색 결과와 AI 답의 출처 이름으로 쓰여요."], en: ["Title 10–70 characters", "Missing, too short or too long. It is the source name in results and AI answers."] },
  description: { ko: ["설명(meta description) 50~170자", "요약 문장이 없거나 길이가 맞지 않아요."], en: ["Meta description 50–170 characters", "Missing or the wrong length."] },
  noindex: { ko: ["색인·인용 허용", "noindex나 nosnippet이 있으면 AI 검색이 인용하지 못해요."], en: ["Indexing and snippets allowed", "noindex or nosnippet stops AI search from citing the page."] },
  canonical: { ko: ["대표 주소(canonical)", "같은 글이 여러 주소에 있을 때 어느 것을 인용할지 알려 줘요."], en: ["Canonical URL", "Tells engines which URL to cite when content is duplicated."] },
  lang: { ko: ["언어 표시(html lang)", "언어가 표시되지 않았어요."], en: ["Language (html lang)", "No language declared."] },
  h1: { ko: ["큰 제목(h1) 정확히 1개", "h1이 없거나 여러 개예요."], en: ["Exactly one h1", "No h1 or several of them."] },
  headings: { ko: ["소제목(h2) 2개 이상", "소제목으로 나뉜 글이 질문별로 잘려 인용되기 쉬워요."], en: ["Two or more h2 sections", "Sectioned pages are easier to quote per question."] },
  jsonld: { ko: ["구조화 데이터(JSON-LD)", "JSON-LD가 없거나 문법 오류가 있어요."], en: ["Structured data (JSON-LD)", "Missing or broken JSON-LD."] },
  faq: { ko: ["질문형 소제목·FAQ", "사람들이 묻는 질문을 소제목이나 FAQ로 두면 답으로 뽑히기 쉬워요."], en: ["Question headings or FAQ", "Questions as headings or an FAQ map directly to prompts."] },
  text: { ko: ["본문 1,500자 이상", "본문이 짧으면 인용할 근거가 부족해요."], en: ["1,500+ characters of body text", "Thin pages give engines little to quote."] },
  structure: { ko: ["목록·표", "목록이나 표는 요약·비교 답에 그대로 쓰여요."], en: ["Lists or tables", "Lists and tables are reused in summaries and comparisons."] },
  date: { ko: ["작성·수정 날짜", "날짜가 있으면 최신 정보로 판단하기 쉬워요."], en: ["Published / modified date", "Dates help engines judge freshness."] },
  og: { ko: ["공유 미리보기(Open Graph)", "og:title·og:description이 없어요."], en: ["Open Graph tags", "og:title and og:description are missing."] },
  robots: { ko: ["robots.txt의 AI 크롤러", "검색용 크롤러(OAI-SearchBot·Claude-SearchBot·PerplexityBot 등)를 막으면 AI 검색 답에 나오지 않아요."], en: ["AI crawlers in robots.txt", "Blocking search crawlers (OAI-SearchBot, Claude-SearchBot, PerplexityBot…) keeps you out of AI answers."] },
};
// WHY: 학습용(GPTBot·ClaudeBot·CCBot·Google-Extended)과 검색·인용용 크롤러는 따로 막을 수 있다. 학습만 막는 건 흔한 선택이라 경고로만 둔다.
const PURPOSE: Record<string, { ko: string; en: string }> = {
  GPTBot: { ko: "OpenAI 학습", en: "OpenAI training" }, "OAI-SearchBot": { ko: "ChatGPT 검색", en: "ChatGPT search" }, "ChatGPT-User": { ko: "ChatGPT 사용자 요청", en: "ChatGPT user fetch" },
  ClaudeBot: { ko: "Anthropic 학습", en: "Anthropic training" }, "Claude-SearchBot": { ko: "Claude 검색", en: "Claude search" }, "Claude-User": { ko: "Claude 사용자 요청", en: "Claude user fetch" },
  PerplexityBot: { ko: "Perplexity 검색", en: "Perplexity search" }, "Google-Extended": { ko: "Gemini 학습", en: "Gemini training" }, Googlebot: { ko: "Google 검색·AI 개요", en: "Google Search & AI Overviews" },
  Bingbot: { ko: "Bing·Copilot 검색", en: "Bing & Copilot search" }, CCBot: { ko: "Common Crawl(여러 모델 학습)", en: "Common Crawl (training)" }, "Applebot-Extended": { ko: "Apple 학습", en: "Apple training" },
};

const statusText = (s: AuditCheck["status"], lang: Lang) => (s === "pass" ? t(lang, "좋아요", "Pass") : s === "warn" ? t(lang, "보완", "Improve") : t(lang, "문제", "Fix"));

export default function AiSearchReadiness({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [robots, setRobots] = useState(SAMPLE_ROBOTS);
  const res = useMemo(() => auditAiReadiness(html, robots), [html, robots]);
  const todo = res.checks.filter((c) => c.status !== "pass").sort((a, b) => b.weight - a.weight);
  const memo = () => [`[AI search readiness] ${res.score}/100`, ...res.checks.map((c) => `- ${statusText(c.status, lang)}: ${LABELS[c.id][lang][0]}${c.detail ? ` (${c.detail})` : ""}`)].join("\n");

  return (
    <div className="space-y-5">
      <Field label={t(lang, "페이지 HTML 붙여 넣기 (브라우저에서 '페이지 소스 보기' → 전체 복사)", "Paste the page HTML (View Source → select all → copy)")}>
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={10} spellCheck={false} className={areaCls} />
      </Field>
      <Field label={t(lang, "robots.txt 붙여 넣기 (선택: https://사이트/robots.txt)", "Paste robots.txt (optional: https://your-site/robots.txt)")}>
        <textarea value={robots} onChange={(e) => setRobots(e.target.value)} rows={5} spellCheck={false} className={areaCls} />
      </Field>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        <div>
          <p className="text-base font-semibold text-foreground">
            {t(lang, `준비도 ${res.score}점 / 100.`, `Readiness ${res.score} / 100.`)} {todo[0] ? t(lang, `가장 먼저 고칠 것: ${LABELS[todo[0].id].ko[0]}.`, `Fix first: ${LABELS[todo[0].id].en[0]}.`) : t(lang, "기본 항목은 모두 갖췄어요.", "All basics are in place.")}
          </p>
          <div className="mt-2"><BarTrack segments={[{ from: 0, to: res.score, tone: res.score >= 80 ? "primary" : res.score >= 50 ? "warning" : "destructive" }]} /></div>
        </div>
        <ul className="space-y-2">
          {res.checks.map((c) => (
            <li key={c.id} className="flex gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <span className={"w-12 shrink-0 font-semibold " + (c.status === "pass" ? "text-success" : c.status === "warn" ? "text-foreground" : "text-destructive")}>{statusText(c.status, lang)}</span>
              <span className="min-w-0">
                <span className="block text-foreground">{LABELS[c.id][lang][0]}{c.detail ? <span className="break-all text-muted-foreground"> · {c.detail}</span> : null}</span>
                {c.status !== "pass" && <span className="block text-xs leading-5 text-muted-foreground">{LABELS[c.id][lang][1]}</span>}
              </span>
            </li>
          ))}
        </ul>
        {robots.trim() && (
          <figure>
            <figcaption className="text-sm font-semibold text-foreground">{t(lang, "크롤러별 접근 (사이트 첫 페이지 기준)", "Access per crawler (site root)")}</figcaption>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {AI_CRAWLERS.map((a) => {
                const blocked = robotsBlocks(robots, a);
                return (
                  <div key={a} className="flex items-baseline justify-between gap-2 border-b border-border py-1 text-xs">
                    <span className="text-foreground"><code className="font-mono">{a}</code> <span className="text-muted-foreground">{PURPOSE[a][lang]}</span></span>
                    <span className={blocked ? "font-semibold text-destructive" : "text-success"}>{blocked ? t(lang, "막힘", "Blocked") : t(lang, "허용", "Allowed")}</span>
                  </div>
                );
              })}
            </div>
          </figure>
        )}
        <CopyButton text={memo} lang={lang} label={t(lang, "점검 결과 복사", "Copy report")} />
        <p className="text-xs leading-5 text-muted-foreground">{t(lang, "붙여 넣은 글만 이 브라우저에서 읽어요(다른 사이트를 직접 불러오지 않아요). 점수는 공개된 검색 가이드에서 뽑은 기본 항목의 가중 합계일 뿐, 실제 AI 답에 나온다는 보장은 아니에요. 자바스크립트로 그리는 페이지는 '소스 보기'에 본문이 없을 수 있어요.", "Only the text you paste is read, in your browser. The score is a weighted checklist from public search guidance, not a guarantee of being cited. Client-rendered pages may show no body text in View Source.")}</p>
      </div>
    </div>
  );
}
