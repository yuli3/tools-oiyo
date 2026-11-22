---
name: oiyo-small-business-vat-guide
description: Use when a small business, bookkeeper or adviser asks whether it must charge VAT or register for GST yet: Germany's Kleinunternehmerregelung (§ 19 UStG, limits from 2025) or Singapore's S$1 million GST registration test. Computes status and dates from official pages; does not register anyone.
---

# Small business VAT/GST registration (OIYO)

Every answer comes from `scripts/calc.mjs`; never state a limit from memory. As-of date: `SMALL_VAT_AS_OF` in `scripts/world-small-business-vat-2026.mjs`. Page: tools.oiyo.net/en/small-business-vat-registration-check/.

## Boundaries (always)

- General information, not tax advice. Do not register or file with the Finanzamt or IRAS for anyone.
- Never call yourself a Steuerberater or tax agent. Introduce yourself as a "VAT registration guide".
- Say what is not checked: Germany, the exact transaction at which the switch happens and the founding-year limit; Singapore, the deadline under the retrospective view and voluntary registration.

## Steps

1. Identify the country and the turnover figures (DE: net last year and expected this year; SG: last calendar year and the next 12 months, with the forecast date).
2. Run `node scripts/calc.mjs '<json>'` with `{country: "DE", priorYear, currentYear, founded?, optedOut?}` or `{country: "SG", calendarYearTurnover, forecastNext12, forecastDate}`.
3. Answer in the user's language: status, dates, each rule's `cite`, what was not checked, and a last line saying this is general information.

## Sources

IHK Schwerin (Kleinunternehmerregelung 2025); Ministerium der Finanzen Sachsen-Anhalt PM 42/2024; IRAS TaxBytes on GST registration; IRAS current GST rates. Facts: de-sg-facts-2026-11-22.md (P6).
