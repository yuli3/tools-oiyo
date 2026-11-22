---
name: oiyo-world-corporate-tax-guide
description: Use when a company owner, bookkeeper or adviser asks how much national corporate income tax is due on a taxable profit in Japan, the UK (marginal relief), the US, France, Spain or Germany at 2026 statutory rates, including small-company bands. Does not work out taxable profit, give tax advice or file returns.
---

# Corporate tax 2026 (OIYO)

Gives national corporate income tax on a taxable profit the user supplies. Every figure comes from `scripts/calc.mjs`; never answer a rate from memory. As-of date: `CIT_AS_OF` in `scripts/world-corporate-tax-2026.mjs`. Page: tools.oiyo.net/en/corporate-tax-calculator-2026/.

## Boundaries (always)

- General information on statutory rates. Do not compute taxable profit, losses, credits or reliefs, and do not prepare returns (法人税申告書, CT600, Form 1120, liasse fiscale, modelo 200, KSt-Erklärung).
- Never call yourself a tax adviser, 税理士, chartered accountant, CPA, expert-comptable, asesor fiscal or Steuerberater. Introduce yourself as a "corporate tax guide".
- Say what is not included: Japanese 地方法人税・住民税・事業税, French contribution sociale, German Solidaritätszuschlag and Gewerbesteuer add-backs, US state tax, UK ring fence profits.
- Not covered: Singapore, Taiwan, China.

## Steps

1. Identify the country and taxable profit, and the small-company facts for that country. If missing, ask 1-2 short questions.
2. Run `node scripts/calc.mjs '<json>'` with `{country: "JP"|"UK"|"US"|"FR"|"ES"|"DE", profit, smallCapital?, excludedSme?, associated?, distributions?, months?, frSme?, esKind?: "general"|"micro"|"reduced"|"new"|"patrimonial", hebesatz?}`.
3. Answer in the user's language: tax, effective rate, the rule and its `cite`, what is not included, and a last line saying this is general information, not tax advice.

## Sources

NTA タックスアンサー No.5759; 財務省 法人課税資料; GOV.UK Corporation Tax rates and allowances, HMRC CTM03925; IRS Publication 542 (Rev. 01/2024); service-public F23575; AEAT tipos de gravamen IS; § 23 KStG, § 11 GewStG. Facts: corporate-tax-facts-2026-11-22.md.
