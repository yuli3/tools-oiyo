#!/usr/bin/env node
// 직업별 창구·인생 사건 내비 + 전문가 상담 전 준비 + 내용증명 뼈대 + 가계 재무 건강검진 CLI.
// Data: same libs as tools.oiyo.net/ko/job-desk/, /ko/life-event-navigator/, /ko/before-expert-visit/,
// /ko/demand-letter-builder/, /ko/household-money-checkup/.
//   node scripts/desk.mjs list | find '<question>' [job|event] | show <id>
//   node scripts/desk.mjs expert '<question>' | expert-show <tax|labor|cpa|court|admin|broker|plan>
//   node scripts/desk.mjs letter '<json LetterInput>'
//   node scripts/desk.mjs checkup '<json CheckupInput>'
import { KR_DESKS, KR_DESKS_AS_OF, deskById, findDesks } from "./kr-desks-2026.mjs";
import { EXPERTS, findExpertNeeds, expertById } from "./expert-visit-2026.mjs";
import { LETTER_TYPES, buildDemandLetter } from "./demand-letter-2026.mjs";
import { householdCheckup } from "./household-checkup-2026.mjs";

const T = "https://tools.oiyo.net";
const link = (t) => ({ ...t, url: `${T}${t.href}` });
const full = (d) => ({ ...d, tools: d.tools.map(link) });
const fullExpert = (e) => ({ ...e, guide: `${T}${e.guide}`, needs: e.needs.map((n) => ({ ...n, tools: n.tools.map(link) })) });
export function run(cmd, arg, kind) {
  if (cmd === "list") return KR_DESKS.map((d) => ({ id: d.id, kind: d.kind, title: d.title }));
  if (cmd === "find") return findDesks(arg ?? "", kind).map(full);
  if (cmd === "show") { const d = deskById(arg ?? ""); return d ? full(d) : null; }
  if (cmd === "expert") return arg ? findExpertNeeds(arg).map((h) => { const e = expertById(h.expert); return { expert: h.expert, name: e?.name, need: { ...h.need, tools: h.need.tools.map(link) }, bring: e?.bring, free: e?.free }; }) : EXPERTS.map((e) => ({ id: e.id, name: e.name, scope: e.scope }));
  if (cmd === "expert-show") { const e = expertById(arg ?? ""); return e ? fullExpert(e) : null; }
  if (cmd === "letter") return arg ? buildDemandLetter(JSON.parse(arg)) : LETTER_TYPES;
  if (cmd === "checkup") return arg ? householdCheckup(JSON.parse(arg)) : null;
  return null;
}
if (process.argv[1] && process.argv[1].endsWith("desk.mjs")) {
  const [cmd, arg, kind] = process.argv.slice(2);
  const result = run(cmd, arg, kind);
  if (result === null) { console.error("usage: node scripts/desk.mjs list | find '<question>' [job|event] | show <id> | expert ['<question>'] | expert-show <id> | letter ['<json>'] | checkup '<json>'"); process.exit(2); }
  console.log(JSON.stringify({ asOf: KR_DESKS_AS_OF, note: "General information only; no filing, tax or legal advice.", result }, null, 2));
}
