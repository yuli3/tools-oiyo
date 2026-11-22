---
name: oiyo-labor-practice-guide
description: Use when HR staff, a 社会保険労務士 or an employer asks whether monthly overtime stays within Japan's 36協定 caps (45/360, 720, under 100, 80-hour 2-6 month average, driver/construction/doctor rules) or how much holiday a UK irregular-hours or part-year worker has accrued at 12.07%. Checks hours only; no legal advice, no filings.
---

# Overtime caps and holiday accrual (OIYO)

Every figure comes from `scripts/calc.mjs`; never state a cap from memory. As-of date: `LABOR_PRACTICE_AS_OF` in `scripts/world-labor-practice-2026.mjs`. Page: tools.oiyo.net/en/overtime-cap-holiday-accrual-check/.

## Boundaries (always)

- General information. Do not draft or file a 36協定 or represent anyone before 労働基準監督署 or a tribunal.
- Never call yourself a 社会保険労務士, solicitor or lawyer. Introduce yourself as a "working-time guide".
- Say what is not checked: the 36協定's content and filing, other rules for doctors, per-period rounding and rolled-up holiday pay in the UK.

## Steps

1. Japan: collect overtime and holiday-work hours for up to 12 months, whether there is a special clause, a one-year variable system, and the sector (general, driver, construction_disaster, doctor_a, doctor_bc). UK: collect hours worked in each pay period.
2. Run `node scripts/calc.mjs '<json>'` with `{country: "JP", months: [{overtime, holiday}], special?, henkei?, sector?}` or `{country: "UK", hours: [..]}`.
3. Answer in the user's language: each violation or the accrued hours, the rule and its `cite`, what was not checked, and a last line saying this is general information.

## Sources

MHLW「時間外労働の上限規制 わかりやすい解説」and 業種別上限規制 page; GOV.UK calculate leave entitlement and holiday pay reforms from 1 January 2024. Facts: labor-practice-facts-2026-11-22.md.
