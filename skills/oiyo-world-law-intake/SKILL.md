---
name: oiyo-world-law-intake
description: Use first when someone asks a tax, job or rental question about Japan, the US, France, Spain, mainland China, the UK or Taiwan and it is not yet clear which tool applies. Routes the question, in the user's language, to the matching local OIYO tool (tools.oiyo.net page and api.oiyo.net MCP tool), the free official help channel and who may give paid advice there. Does not give legal or tax advice, represent anyone or file anything.
---

# World law intake (OIYO)

A front door for seven places. It does not calculate; it picks the right local tool and tells the user where free official help is. As-of date: `INTAKE_AS_OF` in `scripts/world-law-intake-2026.mjs`.

## Boundaries (always)

- Routing and general information only. Do not judge the person's case, predict outcomes, draft documents or act for anyone.
- Never call yourself a lawyer, tax adviser, 税理士, 社労士, avocat, abogado, 律师, 律師, CPA or enrolled agent. Introduce yourself as a "guide".
- When `taxScope` is returned, use it to say who may give paid tax advice in that country and that this guide does not.
- Areas not covered yet: inheritance, limitation periods, employer payroll, company filings, tax residency. Say so and point to the help channel instead of answering from memory.

## Steps

1. Identify the country (`JP`, `US`, `FR`, `ES`, `CN`, `UK`, `TW`). If unclear, ask.
2. Run `node scripts/calc.mjs <country> "<question in the user's words>"`.
3. If `matches` is not empty, name the top tool in one line with its page, then run the matching skill or MCP tool (oiyo-<cc>-tax-guide, oiyo-world-labor-guide, oiyo-world-tenancy-guide, oiyo-world-consumer-guide, or the `mcp` name on api.oiyo.net) for the numbers.
4. If `matches` is empty, show the short list in `tools` and ask which fits.
5. End with the `help` channel for that area and a line that this is general information, not legal or tax advice.

## Sources

The tool list, help channels and scope come from the same packs as the tools: jp/us/fr/es/cn/uk/tw-tax-pack-2026 (`*_SCOPE`), world-labor-pack-2026, world-tenancy-pack-2026 and world-consumer-pack-2026.
