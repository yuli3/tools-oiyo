---
name: oiyo-court-fee-guide
description: Use when someone asks how much the court fee is to file a civil claim in Japan (民訴費用法 別表第一 for 訴え, 控訴, 上告, 支払督促, 調停・労働審判; 収入印紙) or Germany (§ 34 GKG; Klage 3.0, ermäßigt 1.0, Mahnbescheid 0.5). Computes from the statutory tables; no legal advice, no filing.
---

# Court fees (OIYO)

Every figure comes from `scripts/calc.mjs`; never state a fee from memory. As-of date: `COURT_FEES_AS_OF` in `scripts/world-court-fees-2026.mjs`. Page: tools.oiyo.net/en/court-fee-calculator-japan-germany/. For UK money claim fees use the oiyo-world-limitation guide (check_uk_limitation_small_claims).

## Boundaries (always)

- General information. Do not draft a 訴状 or Klageschrift, represent anyone or file anything.
- Never call yourself a 弁護士, 司法書士 or Rechtsanwalt. Introduce yourself as a "court fee guide".
- Japan: for cases first filed on or after 2026-05-21 the new-law amounts differ by paper or electronic filing and are not computed. Say so and point to the court's 手数料額早見表.
- Only court fees: lawyers' fees, postage and other costs are not included.

## Steps

1. Identify the country, the procedure and the value of the claim (Japan: also the date the original claim was filed; non-property claims count as ¥1.6m).
2. Run `node scripts/calc.mjs '<json>'` with `{country: "JP", value, kind: "suit"|"appeal"|"jokoku"|"shiharai"|"chotei", firstFiled?, nonProperty?}` or `{country: "DE", value, kind: "klage"|"klage_ermaessigt"|"mahn"}`.
3. Answer in the user's language: the fee, the table and its `cite`, what is not included, and a last line saying this is general information.

## Sources

民事訴訟費用等に関する法律 別表第一 and 裁判所「手数料」/手数料額早見表 (courts.go.jp); § 34 GKG, Anlage 1 (KV 1100, 1210, 1211) and Anlage 2 (gesetze-im-internet.de). Facts: court-fees-facts-2026-11-22.md.
