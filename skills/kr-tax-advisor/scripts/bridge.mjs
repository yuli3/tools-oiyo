#!/usr/bin/env node
// OIYO 장부 입력 자료 정리 (세무 프로그램 연결). tools.oiyo.net/ko/bookkeeping-data-bridge/ 와 같은 코드.
// Usage:
//   node scripts/bridge.mjs journal <통장·카드.csv | -> [bank|card] ["프로그램 샘플 머리글"] [--csv]
//   node scripts/bridge.mjs season <YYYY-MM-DD> [employer,vat,individual,corp]
//   node scripts/bridge.mjs sample [bank|card]
import { readFileSync } from "node:fs";
import { BRIDGE_AS_OF, DEFAULT_ORDER, PROGRAM_NOTES, SAMPLE_BANK, SAMPLE_CARD, orderFromHeader, parseStatement, summarize, toCsv, toJournal, upcomingTasks } from "./bookkeeping-bridge-2026.mjs";

const [cmd, ...args] = process.argv.slice(2);
const csvOnly = args.includes("--csv");
const pos = args.filter((a) => a !== "--csv");

if (cmd === "journal") {
  const [file, source = "bank", header] = pos;
  if (!file) {
    console.error("파일 경로(또는 -)가 필요해요");
    process.exit(1);
  }
  const text = readFileSync(file === "-" ? 0 : file, "utf8");
  const src = source === "card" ? "card" : "bank";
  const parsed = parseStatement(text, src);
  const lines = toJournal(parsed.rows, src);
  const order = header ? orderFromHeader(header) : DEFAULT_ORDER;
  const csv = toCsv(lines, order.length ? order : DEFAULT_ORDER);
  if (csvOnly) {
    console.log(csv);
  } else {
    console.log(JSON.stringify({ asOf: BRIDGE_AS_OF, source: src, skipped: parsed.skipped, guessedColumns: parsed.guessed, summary: summarize(lines), check: lines.filter((l) => l.flags.length).map(({ suggestion, ...l }) => ({ ...l, note: suggestion.note })), csv, programs: PROGRAM_NOTES }, null, 2));
  }
} else if (cmd === "season") {
  const [today = new Date().toISOString().slice(0, 10), who = "employer,vat,individual,corp"] = pos;
  console.log(JSON.stringify({ asOf: BRIDGE_AS_OF, tasks: upcomingTasks(today, ["all", ...who.split(",")], 3) }, null, 2));
} else if (cmd === "sample") {
  console.log(pos[0] === "card" ? SAMPLE_CARD : SAMPLE_BANK);
} else {
  console.log("commands: journal <file|-> [bank|card] [header] [--csv] · season <YYYY-MM-DD> [who] · sample [bank|card]");
  process.exit(cmd ? 1 : 0);
}
