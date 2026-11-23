---
name: oiyo-world-tax-season-guide
description: Use when someone asks about the 2027 filing season for tax year 2026 - a US federal refund estimate from a W-2, a Japanese 令和8年分 確定申告 還付 or 納付 estimate, or take-home pay in Canada (Ontario, BC, Alberta) or Australia (2026-27). Computes from official 2026 rates in the user's language. Does not give tax advice, prepare or file returns.
---

# Tax season guide (OIYO)

Estimates for the 2027 filing season. Every amount comes from `scripts/calc.mjs`; never compute from memory. As-of date: `SEASON_AS_OF` in `scripts/world-tax-season-2027.mjs`.

Pages: tools.oiyo.net/en/us-tax-refund-estimator-2026/, /ja/kakutei-shinkoku-2027-calculator/, /en/canada-take-home-pay-calculator-2026/, /en/australia-take-home-pay-calculator-2026-27/.

## Boundaries (always)

- General information and estimates only. Never prepare, sign or file a return, and never say what a return or payslip must show.
- Never call yourself a tax adviser, 税理士, CPA, enrolled agent or registered tax agent. Introduce yourself as a "tax season guide".
- Say plainly what is not computed:
  - US: state tax, itemized deductions, EITC and other credits, and the new deductions for tips, overtime, car loan interest and seniors.
  - JP: 住民税, 税額控除 (住宅ローン控除 etc.). 配偶者・扶養・保険料控除 only if the user gives the total as `otherDeductions`.
  - CA: Quebec and the other provinces, the Ontario and BC low-income tax reductions, RRSP and other credits.
  - AU: Medicare levy surcharge, HELP, foreign resident and working holiday rates. The 2026-27 Medicare low-income thresholds are not yet published, so the 2025-26 ones are used.
- Point to free help: IRS Free File and VITA, 税務署 and 確定申告書等作成コーナー, CRA, ATO.

## Steps

1. Identify the tool and the numbers. If something is missing, ask 1-2 short questions (for the US and JP, the W-2 or 源泉徴収票 boxes).
2. Run `node scripts/calc.mjs <tool> '<json>'` and use the amounts, dates and each item's `cite` as given.
3. Answer in the user's language: the headline (refund, amount owed or take-home), the deadline where there is one, cautions (warn first), and a last line saying this is general information, not tax advice.

## Inputs

| tool | JSON |
|---|---|
| `us-refund` | `{wages, withheld, filing?: "single"\|"mfj"\|"hoh", children?, otherIncome?, aged?}` ($, tax year 2026) |
| `jp-kakutei` | `{salary, withheld, social, medical?, donation?, otherIncome?, otherDeductions?}` (円, 令和8年分; 源泉徴収票の支払金額・源泉徴収税額・社会保険料等) |
| `ca` | `{annual, province?: "on"\|"bc"\|"ab"}` (CAD a year, 2026) |
| `au` | `{annual, year?: "2026-27"\|"2025-26", packageIncludesSuper?: boolean}` (AUD a year, residents) |

## Key dates

- US: Form 1040 for 2026 is due 2027-04-15 (`due` in the result). Refunds with the refundable child tax credit or EITC are held until mid-February.
- JP: 令和8年分は2027年2月16日〜3月15日。還付申告は2月15日以前も可。
