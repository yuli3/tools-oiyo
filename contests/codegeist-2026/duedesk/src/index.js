// Forge entry points: Jira project page resolver, Rovo agent / MCP actions, daily scheduled trigger.
import Resolver from '@forge/resolver';
import api, { assumeTrustedRoute } from '@forge/api';
import { kvs } from '@forge/kvs';
import { createService } from './core.js';
import { COUNTRIES, LEVEL_LABEL, RULES_AS_OF, describeDeadline } from './engine/deadlines.js';

const store = { get: (k) => kvs.get(k), set: (k, v) => kvs.set(k, v) };

/**
 * Wraps @forge/api requestJira; `as` is api.asUser() or api.asApp().
 * Paths come only from fixed strings in core.js plus encoded project keys and Jira-issued issue keys,
 * so they are marked as trusted routes.
 */
const jiraClient = (as) => ({
  async request(path, { method = 'GET', body } = {}) {
    const res = await as.requestJira(assumeTrustedRoute(path), {
      method,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let json = null;
    try { json = await res.json(); } catch { json = null; }
    return { status: res.status, json };
  },
});

const userService = () => createService({ store, jira: jiraClient(api.asUser()) });
const appService = () => createService({ store, jira: jiraClient(api.asApp()) });

// ── Jira project page (UI Kit) ───────────────────────────────────────
const resolver = new Resolver();
resolver.define('getBoard', async ({ payload }) => {
  const svc = userService();
  const [board, clients, settings] = await Promise.all([svc.upcoming({ days: payload?.days ?? 120 }), svc.getClients(), svc.getSettings()]);
  return { board, clients, settings, rulesAsOf: RULES_AS_OF, countries: COUNTRIES };
});
resolver.define('addClient', ({ payload }) => userService().addClient(payload ?? {}));
resolver.define('removeClient', ({ payload }) => userService().removeClient(payload?.id));
resolver.define('loadSample', () => userService().loadSample());
resolver.define('createTasks', ({ payload }) => userService().createTasks(payload ?? {}));
export const handler = resolver.getDefinitions();

// ── Rovo agent + MCP actions ─────────────────────────────────────────
const projectFrom = (payload) => payload?.projectKey || payload?.context?.jira?.projectKey || undefined;

export async function getUpcomingDeadlines(payload) {
  const r = await userService().upcoming({ days: payload?.days ?? 60, client: payload?.client, includeDone: false });
  if (!r.clients) return 'DueDesk has no clients yet. Add one with the add-client action (name, country JP/UK/US/FR/KR, financial year end).';
  if (!r.rows.length) return `No open filing deadlines between ${r.from} and ${r.to}.`;
  return JSON.stringify({
    today: r.today,
    counts: r.counts,
    deadlines: r.rows.map((x) => ({
      client: x.clientName, country: x.country, deadline: x.label, due: x.due, when: LEVEL_LABEL[x.level], daysLeft: x.days,
      jiraIssue: x.issueKey ?? 'not created yet', status: x.status ?? null, assignee: x.assignee, ifLate: x.penalty ?? null, source: x.cite,
    })),
  });
}

export async function addClientAction(payload) {
  const r = await userService().addClient(payload ?? {});
  return r.ok ? `Saved client ${r.client.name} (${r.client.country}, year end ${r.client.yearEnd}). Id: ${r.client.id}.` : `Could not save the client: ${r.errors.join(' ')}`;
}

export async function createFilingTasks(payload) {
  const r = await userService().createTasks({ projectKey: projectFrom(payload), client: payload?.client, days: payload?.days ?? 120 });
  if (r.errors) return r.errors.join(' ');
  if (!r.created.length && !r.failed?.length) return `Every deadline in the window already has a Jira task in ${r.projectKey}.`;
  return JSON.stringify({ projectKey: r.projectKey, created: r.created, failed: r.failed });
}

export async function getClientReminderFacts(payload) {
  const r = await userService().reminderContext({ client: payload?.client, days: payload?.days ?? 90 });
  if (!r.ok) return r.errors.join(' ');
  return JSON.stringify({ client: r.client.name, country: COUNTRIES[r.client.country]?.name, deadlines: r.deadlines });
}

export async function explainDeadlines(payload) {
  const r = await userService().upcoming({ days: payload?.days ?? 90, client: payload?.client });
  return r.rows.map((x) => describeDeadline(x, r.today)).join('\n\n') || 'Nothing due in that window.';
}

// ── Daily trigger ────────────────────────────────────────────────────
export async function dailyCheck() {
  const r = await appService().dailyCheck();
  console.log(`DueDesk daily check: ${r.checked} near-due tasks, ${r.commented.length} comments`);
  return r;
}
