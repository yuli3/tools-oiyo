#!/usr/bin/env node
// OIYO 지원금·노동권 길잡이 계산기. tools.oiyo.net과 같은 공식(kr-welfare-2026.mjs는 생성 파일, 고치지 않아요).
// Usage: node scripts/calc.mjs <tool> '<json>'   ·   node scripts/calc.mjs help
import { WELFARE_AS_OF, workChildCredit, maternityLeavePay, spouseLeavePay, wageGuarantee, injuryLeavePay, averageDailyWage, monthlyRentCredit, dbVsDc, breakEvenReturn } from "./kr-welfare-2026.mjs";

const EXAMPLES = {
  "work-child-incentive": { household: "oneEarner", income: 24000000, assets: 120000000, children: 1, late: false },
  "maternity-leave": { monthlyWage: 3200000, priorityFirm: true, kind: "single" },
  "wage-guarantee": { kind: "simpleRetired", age: 35, monthlyWage: 3000000, unpaidMonths: 3, unpaidSeverance: 9000000, serviceYears: 3, afterReform: true },
  "injury-leave": { avgDailyWage: 120000, days: 60, threeMonthWages: null, calendarDays: 92 },
  "rent-credit": { income: 42000000, incomeType: "wage", monthlyRent: 600000, months: 12 },
  "pension-db-dc": { monthlyWage: 4000000, yearsServed: 5, yearsLeft: 20, wageGrowth: 0.03, dcReturn: 0.04 },
};

const [tool, json] = process.argv.slice(2);
if (!tool || tool === "help" || !EXAMPLES[tool]) {
  console.log(`기준일 ${WELFARE_AS_OF}\ntools: ${Object.keys(EXAMPLES).join(", ")}\n`);
  for (const [k, v] of Object.entries(EXAMPLES)) console.log(`node scripts/calc.mjs ${k} '${JSON.stringify(v)}'`);
  process.exit(tool && tool !== "help" ? 1 : 0);
}
const i = { ...EXAMPLES[tool], ...(json ? JSON.parse(json) : {}) };
let result;
switch (tool) {
  case "work-child-incentive": result = workChildCredit(i); break;
  case "maternity-leave": result = { maternity: maternityLeavePay(i), spouse: spouseLeavePay(i.monthlyWage, i.priorityFirm) }; break;
  case "wage-guarantee": result = wageGuarantee(i); break;
  case "injury-leave": {
    const avg = i.threeMonthWages ? averageDailyWage(i.threeMonthWages, i.calendarDays ?? 92, i.annualBonus ?? 0, i.annualLeavePay ?? 0) : i.avgDailyWage;
    result = { avgDailyWage: Math.round(avg), ...injuryLeavePay({ avgDailyWage: avg, days: i.days }) };
    break;
  }
  case "rent-credit": result = monthlyRentCredit(i); break;
  case "pension-db-dc": {
    const r = dbVsDc(i);
    result = { db: r.db, dc: r.dc, diff: r.diff, better: r.better, finalWage: r.finalWage, breakEvenReturn: breakEvenReturn(i) };
    break;
  }
}
console.log(JSON.stringify({ tool, asOf: WELFARE_AS_OF, input: i, result }, null, 2));
