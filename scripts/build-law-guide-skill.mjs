// Builds the downloadable Claude skill (skills/oiyo-kr-law-guide → public/downloads/oiyo-kr-law-guide-skill.zip).
// WHY 2026-11-16: the skill asks the same questions, cites the same articles and computes the same deadlines as
//   tools.oiyo.net/ko/law-guide/ (src/lib/kr-expert-guide-2026.ts, types stripped). references/*.md are generated too.
//   node scripts/build-law-guide-skill.mjs      (Node >= 22.13; needs the `zip` command)
// scripts/law-guide-skill.test.mjs fails when the committed files drift from src/lib.
import { writeFileSync, mkdirSync, rmSync, readFileSync, mkdtempSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { renderSkillLib } from "./build-advisor-skill.mjs";

// 2026-11-17: 역량 지도 빈칸을 채운 실무 도구(pro-practice-*)도 같은 스킬에 넣어요. scenario는 그 의존성이에요.
export const LAW_SKILL_LIBS = ["kr-expert-guide-2026", "kr-law-packs-2026", "kr-legal-2026", "kr-business-day", "pro-practice-2026", "pro-practice-guides-2026", "scenario"];
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const LAW_SKILL_DIR = resolve(root, "skills/oiyo-kr-law-guide");

/** references/<domain>.md: 업무 범위, 주제별 선제 질문·기한·조문. lib에서 만들어요. */
export async function renderReferences() {
  const lib = await import(resolve(LAW_SKILL_DIR, "scripts/kr-expert-guide-2026.mjs"));
  const out = {};
  for (const p of Object.values(lib.PROFESSIONS)) {
    const lines = [`# ${p.name} (${p.licensed} 업무 영역)`, "", `GENERATED from tools-oiyo src/lib/kr-expert-guide-2026.ts. 기준일 ${lib.LAW_GUIDE_AS_OF}.`, "", `## ${p.licensed}의 법정 업무 (${p.act} ${p.scopeCite.article})`, ""];
    for (const x of p.scope) lines.push(`- ${x}`);
    lines.push("", "## 자격 없는 사람이 하면 안 되는 일", "");
    for (const x of p.exclusive) lines.push(`- ${x.text} (${x.cite.law} ${x.cite.article})`);
    lines.push("", "## 이 길잡이의 경계", "", ...p.guideDoes.map((x) => `- 한다: ${x}`), ...p.guideDoesNot.map((x) => `- 안 한다: ${x}`), ...p.handOffWhen.map((x) => `- 자격사에게: ${x}`));
    lines.push("", "## 무료 공공 창구", "", ...p.freeHelp.map((h) => `- ${h.name} (${h.how}): ${h.what}`));
    for (const t of lib.TOPICS.filter((x) => x.domain === p.domain)) {
      lines.push("", `## 주제 \`${t.id}\`: ${t.label}`, "", t.plain, "", "먼저 물을 질문(필수부터):", "");
      for (const q of t.questions) {
        const opts = q.options ? ` [${q.options.map((o) => `${o.value}=${o.label}`).join(" / ")}]` : q.kind === "yesno" ? " [yes / no]" : q.kind === "date" ? " [YYYY-MM-DD]" : q.unit ? ` [${q.unit}]` : "";
        lines.push(`- \`${q.key}\`${q.required ? " (필수)" : ""}${q.askIf ? " (조건부)" : ""}: ${q.ask}${opts} — 왜: ${q.why}`);
      }
      if (t.deadlines.length) {
        lines.push("", "기한:", "");
        for (const r of t.deadlines) {
          const span = [r.fromMonthEnd ? "그 달 말일부터" : "", r.years ? `${r.years}년` : "", r.months ? `${r.months}개월` : "", r.days !== undefined ? `${r.days}일` : ""].filter(Boolean).join(" ");
          lines.push(`- ${r.label}: \`${r.from}\` 기준 ${span} (${r.cite})${r.note ? ` — ${r.note}` : ""}`);
        }
      }
      lines.push("", `근거 조문: ${t.statutes.map((id) => { const s = lib.STATUTES.find((x) => x.id === id); return `${s.law} ${s.article}`; }).join(", ")}`);
      lines.push("", `계산 도구: ${t.tools.length ? t.tools.map((x) => `${x.label} https://tools.oiyo.net${x.href}`).join(" · ") : "없음"}`);
      lines.push("", `가져갈 서류: ${t.documents.join(", ")}`);
    }
    lines.push("", "## 조문 색인 (쉬운 말 풀이, 원문 아님)", "");
    for (const s of lib.STATUTES.filter((x) => x.domain === p.domain)) lines.push(`- ${s.law} ${s.article} ${s.title}: ${s.plain} ${lib.statuteUrl(s)}`);
    out[p.domain] = lines.join("\n") + "\n";
  }
  return out;
}

/** references/competencies.md: 직업 8개 역량 지도와 연결 도구 (src/data/pro-competencies.ts에서 만들어요). */
export async function renderCompetencies() {
  const src = stripTypeScriptTypes(readFileSync(resolve(root, "src/data/pro-competencies.ts"), "utf8"));
  const tmp = resolve(mkdtempSync(resolve(tmpdir(), "oiyo-comp-")), "pro-competencies.mjs");
  writeFileSync(tmp, src);
  const d = await import(pathToFileURL(tmp).href);
  const lines = ["# 전문 직업 역량 지도", "", `GENERATED from tools-oiyo src/data/pro-competencies.ts. 기준일 ${d.COMPETENCY_AS_OF}. 웹: https://tools.oiyo.net/ko/pro-competency-map/`, "", "질문이 어느 직업의 어떤 역량에 해당하는지 고른 뒤, 연결된 도구·MCP로 계산하고 업무 범위(ethics) 역량으로 경계를 확인한다. '준비 중'은 아직 도구가 없으니 계산하지 말고 공공 창구나 자격사로 안내한다.", "", "## 역량 분류", ""];
  for (const c of d.CATEGORIES) lines.push(`- \`${c.id}\` ${c.name}: ${c.desc}`);
  for (const j of d.JOBS) {
    lines.push("", `## ${j.name} (${j.act})`, "", j.summary, "");
    for (const x of d.COMPETENCIES.filter((y) => y.job === j.id)) {
      const cat = d.CATEGORIES.find((c) => c.id === x.cat).name;
      const tags = [x.audience.includes("public") ? "일반인도 씀" : "", x.exclusive ? "자격사 업무와 맞닿음: 정보만" : "", d.isGap(x) ? "준비 중" : ""].filter(Boolean).join(", ");
      lines.push(`- **${x.name}** [${cat}]${tags ? ` (${tags})` : ""}: ${x.desc}`);
      if (x.tools.length) lines.push(`  - 도구: ${x.tools.map((t) => `${d.TOOL_NAMES[t]} https://tools.oiyo.net${d.toolHref(t)}`).join(" · ")}`);
      if (x.mcp.length) lines.push(`  - MCP: ${x.mcp.map((m) => `\`${m}\``).join(", ")}`);
      if (x.skills.length) lines.push(`  - 스킬: ${x.skills.join(", ")}`);
    }
  }
  return lines.join("\n") + "\n";
}

/** references/practice.md: 실무 길잡이(준비물·확인할 점·기한·창구)와 계산 도구 명령. lib/pro-practice-guides-2026.ts에서 만들어요. */
export async function renderPractice() {
  const g = await import(resolve(LAW_SKILL_DIR, "scripts/pro-practice-guides-2026.mjs"));
  const lines = ["# 실무 길잡이와 계산 도구", "", "GENERATED from tools-oiyo src/lib/pro-practice-guides-2026.ts. 계산은 `node scripts/guide.mjs calc <도구> '<json>'`로만 한다.", "", "## 계산 도구 (scripts/pro-practice-2026.mjs)", "",
    "- `fine` 과태료 감경·가산금: `{fine, noticeDate, opinionDays, when: early|due|late, monthsLate, vulnerable}` → https://tools.oiyo.net/ko/fine-reduction-calculator/",
    "- `duty` 수입 관세·FTA: `{price, freight, insurance, fx, baseRate, ftaRate, hasOrigin, personal, fromUS}`(세율은 0.13처럼) → https://tools.oiyo.net/ko/import-duty-fta-calculator/",
    "- `csm` IFRS 17 CSM 원리: `{premium, years, claims, expense, acquisition, rate, ra}` → https://tools.oiyo.net/ko/ifrs17-csm-simulator/",
    "- `kics` 지급여력비율 원리: `{available, life, nonlife, market, credit, operational, taxAdj}`(원) → https://tools.oiyo.net/ko/kics-solvency-ratio-calculator/",
    "- `claim` 장해·과실 보험금: `{kind: disability|fault, sum, rates:[..], prior, damage, fault, deductible, limit}` → https://tools.oiyo.net/ko/disability-fault-claim-calculator/",
    "- `entries` 전표 분석: 파일 경로(날짜,계정,금액,적요,입력자 CSV)와 결재 한도 → https://tools.oiyo.net/ko/journal-entry-analytics/",
    "- `record` 보험 설명·적합성 기록: `{customer, product, date, suitability:[..], explained:[..], delivered, confirm, replace, note}` → https://tools.oiyo.net/ko/insurance-explanation-record/",
  ];
  for (const guide of g.GUIDES) {
    lines.push("", `## ${guide.title}`, "", guide.intro, "", `웹: https://tools.oiyo.net/ko/${guide.slug}/ · 명령: \`node scripts/guide.mjs practice ${guide.slug} <상황> '{"<기한id>":"YYYY-MM-DD"}'\``);
    for (const c of guide.cases) {
      lines.push("", `### \`${c.id}\` ${c.label}`, "", c.summary, "", `누가: ${c.who}`, "", "준비할 것:", "", ...c.prepare.map((x) => `- ${x.text}${x.cite ? ` (${x.cite})` : ""}`), "", "확인할 점:", "", ...c.check.map((x) => `- ${x.text}${x.cite ? ` (${x.cite})` : ""}`));
      if (c.deadlines.length) lines.push("", "기한:", "", ...c.deadlines.map((d) => `- \`${d.id}\` ${d.label}: ${d.from} 기준 (${d.cite})`));
      lines.push("", `창구: ${c.links.map((l) => `${l.label} ${l.href}`).join(" · ")}`);
    }
  }
  return lines.join("\n") + "\n";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const name of LAW_SKILL_LIBS) writeFileSync(resolve(LAW_SKILL_DIR, "scripts", `${name}.mjs`), renderSkillLib(name));
  for (const [d, md] of Object.entries(await renderReferences())) writeFileSync(resolve(LAW_SKILL_DIR, "references", `${d}.md`), md);
  writeFileSync(resolve(LAW_SKILL_DIR, "references", "competencies.md"), await renderCompetencies());
  writeFileSync(resolve(LAW_SKILL_DIR, "references", "practice.md"), await renderPractice());
  const out = resolve(root, "public/downloads/oiyo-kr-law-guide-skill.zip");
  mkdirSync(dirname(out), { recursive: true });
  rmSync(out, { force: true });
  execFileSync("zip", ["-r", "-X", out, "oiyo-kr-law-guide"], { cwd: resolve(root, "skills"), stdio: "inherit" });
  console.log(`wrote ${out}`);
}
