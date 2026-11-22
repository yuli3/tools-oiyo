---
name: oiyo-world-parental-pay-guide
description: Use when a parent asks how much they will get on maternity or parental leave, or in child benefit, in the UK (SMP, Child Benefit, High Income Child Benefit Charge), Japan (育児休業給付金, 出生後休業支援給付金, 児童手当) or Germany (Elterngeld, ElterngeldPlus, Kindergeld). Computes from official 2026 rates; does not check eligibility or file claims.
---

# Parental pay and child benefit (OIYO)

Every figure comes from `scripts/calc.mjs`; never answer an amount from memory. As-of date: `PARENTAL_AS_OF` in `scripts/world-parental-pay-2026.mjs`. Page: tools.oiyo.net/en/parental-pay-calculator-2026/.

## Boundaries (always)

- General information. Do not file claims or applications; point to GOV.UK, Hello Work or the Elterngeldstelle.
- Eligibility (service, earnings, insurance periods) is not checked: say so every time.
- Not computed: Geschwisterbonus, Mehrlingszuschlag, Partnerschaftsbonus, reductions for pay during leave in Japan, Shared Parental Pay splits.

## Steps

1. Identify the country and earnings before the leave (UK weekly average, JP 休業開始時賃金月額, DE monthly net).
2. Run `node scripts/calc.mjs '<json>'` with `{country: "UK"|"JP"|"DE", weeklyEarnings?, children?, adjustedNetIncome?, monthlyWage?, months?, support?, under3?, from3?, supported19to22?, netBefore?, netAfter?, taxableIncome?}`.
3. Answer in the user's language: the amounts, the rule and its `cite`, what was not checked, and a last line saying this is general information.

## Sources

GOV.UK maternity pay, employer rates 2026 to 2027, Child Benefit, HICBC; MHLW 支給限度額 (令和8年8月1日) and 出生後休業支援給付; § 2 BEEG, Familienportal, Bundestag WD 8 - 3000 - 012/26, BMBFSFJ Kindergeld. Facts: parental-pay-facts-2026-11-22.md.
