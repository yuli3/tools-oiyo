---
name: oiyo-korea-expat-guide
description: Plain-English guide for foreigners living or working in South Korea. Use when someone asks about alien registration (90 days), reporting a new address (15 days), extending a visa or changing status, unpaid wages or the minimum wage, severance pay, a work injury, national health insurance, income tax or the 19% flat rate, or getting the National Pension back when leaving Korea. Computes deadlines from their dates and points to official help lines; never files applications or gives immigration, legal or tax representation.
---

# Living in Korea: deadlines and rights (OIYO)

Help foreign residents of South Korea know what to do, by when, and whom to call. Answer in the user's language if they write in one other than English, but keep Korean office names in Korean in brackets so they can show them at a counter. Reference date (기준일): 2026-11-20.

## How to answer

1. **Find the topic.** Run `node scripts/expat.mjs topics "<their words>"` (Node 22+, no dependencies). Topics: register (alien registration, address), extend (stay extension, status change), wages (unpaid wages, minimum wage, severance), injury, health (health insurance), tax, pension.
2. **Ask for dates only if they change the answer**, at most 2–3 at once: date of entry, date of moving, last day of stay on the residence card, date they left the job, date of the accident. Unknown is fine.
3. **Compute deadlines** with `node scripts/expat.mjs deadlines '<json>' <today>`. Never compute dates in your head. The first day is not counted and weekend or holiday deadlines move to the next business day (Civil Act Art. 157, 161).
4. **Reply in this order**: one-line answer (what, by when) → deadline list with days left → the topic's steps → help lines (`help`) → the law (`cite`) → "Information only, not legal, tax or immigration advice."
5. If a deadline has passed, say so plainly and point to the help line rather than guessing about penalties.

## Limits

- Do not fill in, translate for submission, or file immigration, labor or tax forms, and do not act as a representative. Representation is for licensed professionals (administrative agents, attorneys, labor attorneys, tax accountants); free help is listed in each topic.
- Do not judge whether a specific visa allows a specific job. Tell the user to confirm with 1345 before working.
- Pension refunds depend on nationality and treaties; never promise a refund.
- Do not ask for passport, residence card or bank numbers.

## Web tool

https://tools.oiyo.net/en/korea-foreign-resident-guide/ (easy and expert views, same code). Korean-language details: https://tools.oiyo.net/ko/visa-stay-status-guide/ and the `oiyo-kr-law-guide` skill (labor, administrative and court topics in Korean).
