# DueDesk

**Every client's statutory filing deadline, as Jira work.** A Forge app for accounting firms, company secretaries and
in-house finance teams that look after companies in several countries.

Codegeist 2026 entry, category **Specialized Industries** (professional services / accounting).
Bonus prizes targeted: **Best Rovo agent** (DueDesk agent) and **Best Atlassian MCP app** (`rovo:mcp` exposes the same tools).

## The problem

A small accounting firm with 40 client companies in Japan, the UK, the US, France and Korea tracks roughly 150 statutory
deadlines a year in spreadsheets. Every rule counts from a different anchor: UK accounts are due 9 months after the year
end but Corporation Tax is due 9 months *and one day*; a Japanese return is 2 months after the year end and moves off the
weekend, a UK one does not; a Korean corporate tax return is due at the end of the third month. One missed date costs the
client a penalty (UK: £150 to £1,500 for late accounts; Korea: 20% of tax for non-filing) and costs the firm the client.

## What it does

| Surface | What happens |
|---|---|
| **Jira project page** | Add each client once (name, country, year end, one or two filing options). A deadline board shows every open filing with an urgency lozenge, the legal source, and the linked Jira task and status. Load a sample firm in one click. |
| **Create Jira tasks** | One Task per filing with the due date, labels (`duedesk`, country, client) and a description holding the source and the late-filing consequence. A stable key (client + filing + financial year) means it never creates the same filing twice. |
| **Daily trigger** | Comments on open tasks 7 days before, on the day, and when overdue, once per stage, so the assignee gets a normal Jira notification. Done tasks are skipped. |
| **Rovo agent "DueDesk"** | "What is due for my clients in the next 30 days?", "Add Hudson Labs, US C corp, year end 31 December", "Create tasks for everything due by March", "Draft a reminder email to Thames Robotics". Dates always come from the rules engine, never from the model. |
| **MCP tools** | The same five actions exposed with `rovo:mcp`, so customers can add DueDesk to their own agents in Rovo Studio. |

## Rules covered (annual company obligations)

| Country | Filings |
|---|---|
| Japan | Corporate tax final return (2 months), interim return, consumption tax (with 1-month extension option) |
| United Kingdom | Annual accounts (9 months, or 21 months for first accounts), Corporation Tax payment (9 months + 1 day), CT600 (12 months) |
| United States (federal) | Form 1120 (15th day of 4th month; June year end 3rd month) + extended date, Form 1120-S, Form 1065 |
| France | Approval of the accounts (6 months), filing with the greffe (1 month, or 2 months online) |
| South Korea | Corporate income tax (end of 3rd month, 4th with sincere-filing confirmation), local corporate income tax, interim prepayment |

Every deadline cites its source (NTA, gov.uk, IRS Form 7004 chart, service-public.gouv.fr / justice.fr, Korean Corporate Tax Act).
Weekend due dates move to Monday except UK dates, which are fixed. Public holidays are not applied, and the app says so on
every task. General information, not tax advice; DueDesk files nothing.

## Architecture

```
src/engine/deadlines.js   pure rules engine (no Atlassian APIs), unit-tested
src/core.js               service layer: clients, board, task creation, daily check, reminder facts (injected store + Jira)
src/index.js              Forge wiring: resolver for the page, 5 Rovo/MCP actions, scheduled trigger
src/frontend/index.jsx    UI Kit project page
manifest.yml              jira:projectPage, rovo:agent, rovo:mcp, action x5, scheduledTrigger
```

* Storage: Forge KVS (`storage:app`). Only client name, country, year end and filing options are stored. No financial data.
* Jira calls run **as the user** from the page and the agent, and **as the app** only in the daily trigger.
* Runs on Atlassian (Forge hosted), so it qualifies for Runs on Atlassian.

## Develop

```bash
npm install
npm test                 # 16 tests: rules for 5 countries + service layer against a fake Jira
forge register           # replaces the placeholder app id in manifest.yml
forge deploy && forge install --product jira --site <your-site>.atlassian.net
```

## License

MIT
