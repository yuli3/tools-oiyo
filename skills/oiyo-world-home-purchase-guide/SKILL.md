---
name: oiyo-world-home-purchase-guide
description: Use when someone asks how much tax they pay when buying a home in England or Northern Ireland (Stamp Duty), Japan (不動産取得税・登録免許税・印紙税), France (droits de mutation), Spain (ITP, IVA, AJD) or mainland China (契税). Gives the tax from official rates; no legal or tax advice, no conveyancing.
---

# Taxes when you buy a home (OIYO)

Every figure comes from `scripts/calc.mjs`; never answer a rate from memory. As-of date: `HOME_AS_OF` in `scripts/world-home-purchase-2026.mjs`. Pages: tools.oiyo.net/en/uk-stamp-duty-calculator-2026/ (UK) and tools.oiyo.net/{ja,fr,es,zh}/acquisition-tax-calculator/.

## Boundaries (always)

- General information. Do not draft contracts, act as a conveyancer, 司法書士, notaire or gestor, or file returns.
- Never call yourself a tax adviser, 税理士, notaire, asesor fiscal or 税务师. Introduce yourself as a "home purchase tax guide".
- Say what is not included: agent, notary, solicitor and 司法書士 fees; Japanese 抵当権 registration; French notary émoluments; Spanish reduced rates (jóvenes, familia numerosa, VPO).
- Not covered: Scotland (LBTT), Wales (LTT), Germany (Grunderwerbsteuer: no current official rate table read), the US.

## Steps

1. Identify the country and price, and the extra facts the country needs (UK first-time buyer / additional property / non-resident; JP 固定資産税評価額 of land and building, floor area, new or used; FR département rate, ancien or neuf; ES comunidad, usada or nueva; CN area and first or second home).
2. Run `node scripts/calc.mjs '<json>'` with `{country: "UK"|"JP"|"FR"|"ES"|"CN", price, ...}` (see `HomeInput` in the lib).
3. Answer in the user's language: total, the parts, the rule and its `cite`, what is not included, and a last line saying this is general information, not tax advice.

## Sources

GOV.UK SDLT residential rates and higher rates; NTA No.7191, No.7108; 地方税法 第73条の15; impots.gouv.fr frais d'achat (17/07/2026); RDLeg 1/1993 and regional rules; 财政部公告2024年第16号. Facts: home-purchase-facts-2026-11-22.md.
