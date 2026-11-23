#!/usr/bin/env node
// 직업별 창구·인생 사건 내비 CLI. Data: kr-desks-2026.mjs (same as tools.oiyo.net/ko/job-desk/ and /ko/life-event-navigator/).
//   node scripts/desk.mjs list | find '<question>' [job|event] | show <id>
import { KR_DESKS, KR_DESKS_AS_OF, deskById, findDesks } from "./kr-desks-2026.mjs";

const T = "https://tools.oiyo.net";
const full = (d) => ({ ...d, tools: d.tools.map((t) => ({ ...t, url: `${T}${t.href}` })) });
export function run(cmd, arg, kind) {
  if (cmd === "list") return KR_DESKS.map((d) => ({ id: d.id, kind: d.kind, title: d.title }));
  if (cmd === "find") return findDesks(arg ?? "", kind).map(full);
  if (cmd === "show") { const d = deskById(arg ?? ""); return d ? full(d) : null; }
  return null;
}
if (process.argv[1] && process.argv[1].endsWith("desk.mjs")) {
  const [cmd, arg, kind] = process.argv.slice(2);
  const result = run(cmd, arg, kind);
  if (result === null) { console.error("usage: node scripts/desk.mjs list | find '<question>' [job|event] | show <id>"); process.exit(2); }
  console.log(JSON.stringify({ asOf: KR_DESKS_AS_OF, note: "General information only; no filing, tax or legal advice.", result }, null, 2));
}
