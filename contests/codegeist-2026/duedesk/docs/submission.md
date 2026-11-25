# Codegeist 2026 submission pack: DueDesk

Deadline: **22 Dec 2026, 12:00 PT** (23 Dec 05:00 KST). Submit by 18 Dec to leave room.
Category: **Specialized Industries**. Bonus: Best Rovo/Assignable Agent, Best Atlassian MCP app.

## Devpost fields

**Project name:** DueDesk

**Tagline (≤ 60 chars):** Every client's statutory filing deadline, as Jira work

**Elevator pitch**
Accounting firms juggle hundreds of statutory deadlines for clients in different countries, each counted from a
different anchor. DueDesk turns a client's country and year end into dated Jira tasks with the legal source and the
late-filing penalty, reminds assignees as the date approaches, and lets a Rovo agent answer "what is due?" and draft
client reminder emails. Five countries at launch: Japan, the UK, the US, France and South Korea.

**Inspiration**
We build free tax and labour calculators used by practitioners in Korea and abroad. The question we hear most from
small firms is not "how much tax" but "when is it due, for which client, and who is on it". Their answer is a
spreadsheet. Jira already handles who and status; it was missing the when.

**What it does**
(see README table: project page, task creation, daily trigger, Rovo agent, MCP tools)

**How we built it**
A pure rules engine with one function per country, unit-tested against dates checked by hand from the official sources.
A service layer with injected storage and Jira clients, so the page, the agent, the MCP tools and the trigger share one
code path and one test suite. UI Kit for the project page, Forge KVS for client records, `rovo:agent` + `rovo:mcp`
exposing the same five actions.

**Challenges**
Deadline rules look simple and are not: "9 months" vs "9 months and 1 day", month-end stickiness (a 28 February year end
gives 30 November in the UK), weekend shifts in Japan, the US and Korea but not the UK, and avoiding duplicate tasks when
a trigger retries. The agent must never compute dates itself, so the prompt forces every date through an action.

**Accomplishments**
Zero duplicates by construction, a sample firm loads in one click, and the agent drafts a client reminder that cites
real sources.

**What we learned**
Rovo actions are a clean boundary: the model writes the email, the code owns the facts.

**What's next**
VAT/GST and payroll returns, public holiday calendars per country, Germany, Singapore and Australia, JSM portal so
clients upload documents against each filing, and a Marketplace listing.

**Built with:** forge, ui-kit, rovo, mcp, jira, javascript, node.js

## Demo video (≤ 5 min, YouTube public). Script, about 3 min 30 s

Screen recording only; narration can be read from this script (or captions only).

1. **0:00 to 0:20, the problem.** Show a spreadsheet of 6 clients in 5 countries. "Every one of these counts its deadline
   differently. One miss costs the client up to £1,500 in the UK or 20% of the tax in Korea."
2. **0:20 to 1:00, add clients.** Open the DueDesk project page. Click *Load a sample firm*. Add one client by hand
   (Hudson Labs, US, C corp, 31 Dec). Show the board fill with lozenges: overdue, this week, this month.
3. **1:00 to 1:40, tasks.** Click *Create Jira tasks*. Open the project board: tasks with due dates. Open one: source,
   penalty, holiday warning. Click *Create* again: "Every deadline already has a task" (no duplicates).
4. **1:40 to 2:40, Rovo agent.** Ask "What is due for my clients in the next 30 days?" (table). Ask "Draft a reminder email
   to Thames Robotics". Ask "Add Kimchi Labs, Korea, year end 30 June" then "Create its tasks".
5. **2:40 to 3:10, reminders.** Show a task with the "7 days left" comment from the daily trigger and the notification.
6. **3:10 to 3:30, MCP + close.** Show DueDesk tools in Rovo Studio. "DueDesk: every client's statutory deadline, as Jira work."

## Checklist before pressing Submit

- [ ] App deployed to production environment and installed on the demo site
- [ ] Installation link generated (Developer console → Distribution → sharing on) and pasted in Devpost
- [ ] Demo site has sample firm loaded, tasks created, one trigger comment visible
- [ ] Video uploaded (public), link pasted
- [ ] Category: Specialized Industries; bonus prizes ticked: Rovo agent, MCP
- [ ] Screenshots: board, task detail, agent answer, reminder email
