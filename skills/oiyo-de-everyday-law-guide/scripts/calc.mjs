#!/usr/bin/env node
// German everyday law pack — CLI. Logic: de-life-law-2026.mjs (same code as the tools.oiyo.net /de/ pages and api.oiyo.net MCP tools).
//   node scripts/calc.mjs <widerruf|kaution|verjaehrung|pfaendung|erbschaft> '<json>'
import { DE_LIFE_AS_OF, erbschaftsteuer, mietkaution, pfaendung, verjaehrung, widerruf } from "./de-life-law-2026.mjs";

const FN = { widerruf, kaution: (i) => mietkaution(i), verjaehrung, pfaendung, erbschaft: (i) => erbschaftsteuer(i) };
const [topic, json] = process.argv.slice(2);
if (!FN[topic] || !json) {
  console.error("usage: node scripts/calc.mjs <widerruf|kaution|verjaehrung|pfaendung|erbschaft> '<json>'");
  process.exit(2);
}
console.log(JSON.stringify({ asOf: DE_LIFE_AS_OF, topic, result: FN[topic](JSON.parse(json)) }, null, 2));
