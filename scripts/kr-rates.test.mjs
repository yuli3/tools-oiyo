// Parity + vectors for src/lib/kr-rates-2026.mjs (2026-10-17, FAANG audit A-1, S-1~S-4).
// - byte-identical to api-oiyo src/modules/kr-rates-2026.mjs (skipped when no api checkout, e.g. CI)
// - flat values equal blog src/lib/kr-payroll-2026.ts RATES (pinned snapshot always; live file when found)
// - one official-value vector per calculator page that uses the module
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { findApiRates, LOCAL_RATES } from "./sync-kr-rates.mjs";
import {
  KR_RATES_2026,
  RATES_EFFECTIVE_FROM,
  netSalary2026,
  unemploymentDailyBenefit2026,
  unemploymentDays2026,
  parentalLeaveSchedule2026,
  regionalHealthPremium2026,
} from "../src/lib/kr-rates-2026.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("tools copy is byte-identical to the api SSOT", (t) => {
  const api = findApiRates();
  if (!api) {
    t.skip("api checkout not found; set OIYO_API_DIR to run");
    return;
  }
  assert.equal(readFileSync(LOCAL_RATES, "utf8"), readFileSync(api, "utf8"), "run `npm run sync:kr-rates`");
});

const flat = {
  minimumWage: KR_RATES_2026.minimumWage,
  pensionEmployee: KR_RATES_2026.pension.employee,
  healthEmployee: KR_RATES_2026.health.employee,
  longTermCareOfHealth: KR_RATES_2026.health.longTermCareOfHealth,
  employmentEmployee: KR_RATES_2026.employment.employee,
};

test("blog parity: pinned snapshot of kr-payroll-2026.ts (2026-10-12)", () => {
  assert.deepEqual(flat, { minimumWage: 10320, pensionEmployee: 0.0475, healthEmployee: 0.03595, longTermCareOfHealth: 0.1314, employmentEmployee: 0.009 });
});

test("blog parity: live kr-payroll-2026.ts", (t) => {
  const file = [process.env.OIYO_BLOG_DIR, resolve(root, "../blog"), resolve(root, "../../blog")]
    .filter(Boolean)
    .map((d) => resolve(d, "src/lib/kr-payroll-2026.ts"))
    .find((f) => existsSync(f));
  if (!file) {
    t.skip("blog checkout not found; set OIYO_BLOG_DIR to run");
    return;
  }
  const block = readFileSync(file, "utf8").match(/export const RATES = \{([\s\S]*?)\} as const;/);
  assert.ok(block);
  const blog = Object.fromEntries([...block[1].matchAll(/^\s*(\w+):\s*([\d_.]+),/gm)].map((m) => [m[1], Number(m[2].replaceAll("_", ""))]));
  for (const [k, v] of Object.entries(flat)) assert.equal(blog[k], v, k);
});

test("vectors used by the tools pages", () => {
  assert.equal(RATES_EFFECTIVE_FROM, "2026-01-01");
  // net-salary-calculator: 월 350만·비과세 20만 (before: 148,500 / 116,985 / 15,150)
  const n = netSalary2026({ salary: 3_500_000, nonTaxable: 200_000 });
  assert.deepEqual(
    [n.insurances.nationalPension, n.insurances.healthInsurance, n.insurances.longTermCare, n.insurances.employmentInsurance],
    [156_750, 118_635, 15_585, 29_700],
  );
  // unemployment-benefits-calculator: (before: 64,192 / 66,000)
  assert.equal(unemploymentDailyBenefit2026({ monthlyWage: 2_000_000 }).dailyBenefit, 66_048);
  assert.equal(unemploymentDailyBenefit2026({ monthlyWage: 5_000_000 }).dailyBenefit, 68_100);
  assert.equal(unemploymentDays2026("under", "p3"), 180);
  // parental-leave-calculator: no deferred share, 6+6 first month 2.5M (before: 5,775,000 deferred / 2,000,000)
  assert.equal(parentalLeaveSchedule2026({ monthlyWage: 3_000_000 }).totalBenefit, 23_100_000);
  assert.equal(parentalLeaveSchedule2026({ monthlyWage: 5_000_000, isParental6Plus6: true }).monthlyBreakdown[0].grossAmount, 2_500_000);
  // health-insurance-calculator: 과표 9천만 → 재산 0점 (before: 117점·24,383원)
  const h = regionalHealthPremium2026({ propertyTaxBase: 90_000_000 });
  assert.equal(h.propertyScore, 0);
  assert.equal(h.healthPremium, 20_160);
});
