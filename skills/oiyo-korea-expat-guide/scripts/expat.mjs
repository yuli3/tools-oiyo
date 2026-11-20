#!/usr/bin/env node
// OIYO Korea guide for foreign residents. Same code as https://tools.oiyo.net/en/korea-foreign-resident-guide/
// (korea-expat-guide-2026.mjs and kr-business-day.mjs are generated; do not edit them).
// Usage:
//   node scripts/expat.mjs topics ["<question in English>"]
//   node scripts/expat.mjs deadlines '{"arrival":"2026-09-01","moved":"","expiry":"","leftJob":"","injury":""}' [YYYY-MM-DD today]
import { EXPAT_AS_OF, EXPAT_NOTE, EXPAT_TOPICS, expatDeadlines, holidaysKnown, suggestExpatTopics } from "./korea-expat-guide-2026.mjs";

const [cmd, a1, a2] = process.argv.slice(2);
const print = (x) => console.log(JSON.stringify(x, null, 2));
const today = () => new Date().toISOString().slice(0, 10);

if (cmd === "topics") {
  const picked = a1 ? suggestExpatTopics(a1) : EXPAT_TOPICS;
  print({ asOf: EXPAT_AS_OF, topics: picked.length ? picked : EXPAT_TOPICS, matched: picked.length > 0, note: EXPAT_NOTE });
} else if (cmd === "deadlines") {
  const t = a2 ?? today();
  print({ asOf: EXPAT_AS_OF, today: t, deadlines: expatDeadlines(JSON.parse(a1 ?? "{}"), t), holidaysKnown: holidaysKnown(Number(t.slice(0, 4))), note: EXPAT_NOTE });
} else {
  console.log("commands: topics [question] · deadlines '<json>' [today]");
  process.exit(cmd ? 1 : 0);
}
