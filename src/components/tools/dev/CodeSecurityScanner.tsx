// 코드 보안 빠른 점검 (2026-11-16, Gemini 이전 D2 — SQL 주입·XSS·프롬프트 유출·CORS·JWT·비밀키 가드 통합). 계산: lib/dev-security.ts scanCode.
import { useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { codeRisk, scanCode, type RuleGroup, type Severity } from "../../../lib/dev-security";
import BarTrack from "../viz/BarTrack";
import { CopyButton, Field, areaCls, langOf, t } from "./common";

const SAMPLE = `import jwt from "jsonwebtoken";
const OPENAI_KEY = "sk-proj-abcdefghijklmnopqrstuvwx";

app.use(cors({ origin: true, credentials: true }));

app.get("/user", async (req, res) => {
  const rows = await db.query("SELECT * FROM users WHERE id = " + req.query.id);
  const user = jwt.verify(req.headers.token, "secret");
  const system = \`You are a support bot. Customer note: \${req.body.note}\`;
  res.send(rows);
});

document.getElementById("bio").innerHTML = profile.bio;`;

const RULE: Record<string, { ko: [string, string]; en: [string, string] }> = {
  "aws-key": { ko: ["AWS 접근 키가 코드에 있어요", "키를 바로 폐기·재발급하고 환경변수나 비밀 저장소로 옮기세요."], en: ["AWS access key in code", "Revoke and rotate it now; load it from env vars or a secrets manager."] },
  "private-key": { ko: ["개인키가 코드에 있어요", "저장소 기록에도 남으니 키를 교체하세요."], en: ["Private key in code", "It stays in git history; rotate the key."] },
  "api-token": { ko: ["API 토큰(OpenAI·Anthropic·GitHub·Slack·Google 형식)이 보여요", "즉시 폐기하고 서버 환경변수로만 읽으세요."], en: ["API token (OpenAI/Anthropic/GitHub/Slack/Google format)", "Revoke it and read it only from server-side env vars."] },
  "hardcoded-secret": { ko: ["비밀번호·토큰이 문자열로 박혀 있어요", "환경변수로 옮기세요."], en: ["Hard-coded password or token", "Move it to environment variables."] },
  "sql-concat": { ko: ["SQL을 문자열로 이어 붙여요 (SQL 주입)", "자리표시자($1, ?)와 매개변수 배열을 쓰세요."], en: ["SQL built by string concatenation (SQL injection)", "Use placeholders ($1, ?) with a parameter array."] },
  "cmd-exec": { ko: ["셸 명령에 값을 이어 붙여요 (명령 주입)", "execFile/spawn에 인자 배열로 넘기세요."], en: ["Shell command built from input (command injection)", "Use execFile/spawn with an argument array."] },
  eval: { ko: ["eval·new Function 사용", "문자열을 코드로 실행하지 마세요. JSON.parse나 명시적 분기로 바꾸세요."], en: ["eval / new Function", "Do not execute strings; use JSON.parse or explicit logic."] },
  "inner-html": { ko: ["innerHTML에 값을 넣어요 (XSS)", "textContent를 쓰거나 DOMPurify로 정리한 뒤 넣으세요."], en: ["Assigning to innerHTML (XSS)", "Use textContent, or sanitize with DOMPurify first."] },
  "react-dangerous": { ko: ["dangerouslySetInnerHTML·v-html 사용", "넣는 값이 사용자 입력이면 반드시 정리(sanitize)하세요."], en: ["dangerouslySetInnerHTML / v-html", "Sanitize anything that can contain user input."] },
  "jwt-weak-secret": { ko: ["JWT 비밀키가 짧은 문자열이에요", "32바이트 이상 무작위 키를 환경변수에서 읽으세요."], en: ["Short literal JWT secret", "Use 32+ random bytes from an env var."] },
  "jwt-no-alg": { ko: ["jwt.verify에 algorithms가 없어요", "{ algorithms: ['RS256'] }처럼 허용 알고리즘을 고정하세요."], en: ["jwt.verify without algorithms", "Pin them, e.g. { algorithms: ['RS256'] }."] },
  "jwt-decode-trust": { ko: ["jwt.decode는 서명을 확인하지 않아요", "권한 판단에는 jwt.verify 결과만 쓰세요."], en: ["jwt.decode does not check signatures", "Use only jwt.verify results for authorization."] },
  "cors-wildcard-cred": { ko: ["모든 출처 허용 + 쿠키 전송 (CORS)", "허용할 도메인 목록을 명시하세요."], en: ["Any origin plus credentials (CORS)", "List the allowed origins explicitly."] },
  "cors-wildcard": { ko: ["모든 출처 허용 (CORS *)", "공개 API가 아니라면 출처를 제한하세요."], en: ["Any origin allowed (CORS *)", "Restrict origins unless the API is truly public."] },
  "prompt-user-concat": { ko: ["사용자 입력을 시스템 프롬프트에 이어 붙여요 (프롬프트 주입)", "사용자 입력은 user 메시지로 분리하고, 지시와 데이터를 태그로 구분하세요."], en: ["User input concatenated into the system prompt (prompt injection)", "Send user text as a user message and fence data from instructions."] },
  "llm-output-exec": { ko: ["모델 응답을 코드로 실행해요", "응답은 스키마로 검증한 데이터로만 쓰세요."], en: ["Executing model output", "Treat responses as data validated against a schema."] },
  "secret-in-prompt": { ko: ["프롬프트에 비밀값이 들어가요 (프롬프트 유출)", "모델은 프롬프트 내용을 말할 수 있어요. 비밀은 도구 호출 뒤 서버에서만 쓰세요."], en: ["Secret inside a prompt (prompt leak)", "Models can repeat prompts; keep secrets server-side behind tools."] },
  "weak-hash": { ko: ["MD5·SHA-1 사용", "비밀번호에는 argon2·bcrypt, 무결성에는 SHA-256 이상을 쓰세요."], en: ["MD5 / SHA-1", "Use argon2/bcrypt for passwords and SHA-256+ for integrity."] },
  "math-random-token": { ko: ["Math.random으로 토큰을 만들어요", "crypto.getRandomValues나 crypto.randomUUID를 쓰세요."], en: ["Token from Math.random", "Use crypto.getRandomValues or crypto.randomUUID."] },
  "tls-off": { ko: ["TLS 인증서 검증을 껐어요", "운영 코드에서는 켜 두세요."], en: ["TLS certificate verification disabled", "Keep it on in production."] },
};
const GROUP: Record<RuleGroup, { ko: string; en: string }> = { secret: { ko: "비밀키", en: "Secrets" }, injection: { ko: "주입", en: "Injection" }, xss: { ko: "XSS", en: "XSS" }, jwt: { ko: "JWT", en: "JWT" }, cors: { ko: "CORS", en: "CORS" }, llm: { ko: "LLM 프롬프트", en: "LLM prompts" }, crypto: { ko: "암호", en: "Crypto" } };
const SEV: Record<Severity, { ko: string; en: string }> = { critical: { ko: "심각", en: "Critical" }, high: { ko: "높음", en: "High" }, medium: { ko: "중간", en: "Medium" }, low: { ko: "낮음", en: "Low" } };

export default function CodeSecurityScanner({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const [code, setCode] = useState(SAMPLE);
  const findings = useMemo(() => scanCode(code), [code]);
  const risk = codeRisk(findings);
  const groups = (Object.keys(GROUP) as RuleGroup[]).map((g) => ({ g, n: findings.filter((f) => f.group === g).length })).filter((x) => x.n);
  const maxN = Math.max(1, ...groups.map((x) => x.n));
  const report = () => findings.map((f) => `L${f.line} [${f.severity}] ${RULE[f.id].en[0]} — ${f.excerpt}`).join("\n") || "no findings";

  return (
    <div className="space-y-5">
      <Field label={t(lang, "코드 붙여 넣기 (JS·TS·Python 등, AI가 쓴 코드도)", "Paste code (JS, TS, Python… including AI-written code)")}>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={14} spellCheck={false} className={areaCls} />
      </Field>
      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        <div>
          <p className="text-base font-semibold text-foreground">
            {findings.length ? t(lang, `의심 위치 ${findings.length}곳, 위험도 ${risk}/100.`, `${findings.length} suspicious spot(s), risk ${risk}/100.`) : t(lang, "알려진 위험 패턴은 보이지 않아요.", "No known risky patterns found.")}
          </p>
          <div className="mt-2"><BarTrack segments={[{ from: 0, to: risk, tone: risk >= 60 ? "destructive" : risk >= 20 ? "warning" : "primary" }]} /></div>
        </div>
        {groups.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {groups.map(({ g, n }) => (
              <li key={g}>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{GROUP[g][lang]}</span><span className="font-mono text-foreground">{n}</span></div>
                <BarTrack segments={[{ from: 0, to: (n / maxN) * 100, tone: "warning" }]} />
              </li>
            ))}
          </ul>
        )}
        <ul className="space-y-2">
          {findings.map((f, i) => (
            <li key={i} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className={"font-semibold " + (f.severity === "critical" || f.severity === "high" ? "text-destructive" : "text-foreground")}>{SEV[f.severity][lang]}</span>
                <span className="text-foreground">{RULE[f.id][lang][0]}</span>
                <span className="font-mono text-xs text-muted-foreground">L{f.line}</span>
              </div>
              <code className="mt-1 block break-all font-mono text-xs text-muted-foreground">{f.excerpt}</code>
              <span className="mt-1 block text-xs leading-5 text-foreground">{RULE[f.id][lang][1]}</span>
            </li>
          ))}
        </ul>
        <CopyButton text={report} lang={lang} label={t(lang, "점검 결과 복사", "Copy report")} />
        <p className="text-xs leading-5 text-muted-foreground">{t(lang, "코드는 이 브라우저 안에서만 읽어요. 정규식으로 흔한 실수 패턴을 찾는 빠른 점검이라 놓치는 것도, 잘못 잡는 것도 있어요. 배포 전에는 Semgrep·CodeQL 같은 정식 도구와 사람 리뷰를 함께 쓰세요. 줄 앞에 // nosec 주석을 달면 그 줄은 건너뛰어요.", "Code is read only in this browser. This is a fast regex check for common mistakes, so it can miss issues or flag safe code. Before shipping, use tools such as Semgrep or CodeQL plus human review. Lines starting with // nosec are skipped.")}</p>
      </div>
    </div>
  );
}
