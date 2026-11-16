// Builds the downloadable Claude skill (skills/oiyo-kr-law-guide → public/downloads/oiyo-kr-law-guide-skill.zip).
// WHY 2026-11-16: the skill asks the same questions, cites the same articles and computes the same deadlines as
//   tools.oiyo.net/ko/law-guide/ (src/lib/kr-expert-guide-2026.ts, types stripped). references/*.md are generated too.
//   node scripts/build-law-guide-skill.mjs      (Node >= 22.13; needs the `zip` command)
// scripts/law-guide-skill.test.mjs fails when the committed files drift from src/lib.
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { renderSkillLib } from "./build-advisor-skill.mjs";

export const LAW_SKILL_LIBS = ["kr-expert-guide-2026", "kr-legal-2026", "kr-business-day"];
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const name of LAW_SKILL_LIBS) writeFileSync(resolve(LAW_SKILL_DIR, "scripts", `${name}.mjs`), renderSkillLib(name));
  for (const [d, md] of Object.entries(await renderReferences())) writeFileSync(resolve(LAW_SKILL_DIR, "references", `${d}.md`), md);
  const out = resolve(root, "public/downloads/oiyo-kr-law-guide-skill.zip");
  mkdirSync(dirname(out), { recursive: true });
  rmSync(out, { force: true });
  execFileSync("zip", ["-r", "-X", out, "oiyo-kr-law-guide"], { cwd: resolve(root, "skills"), stdio: "inherit" });
  console.log(`wrote ${out}`);
}
