// DueDesk service layer. Every Atlassian call goes through injected `store` and `jira`
// so the Jira page, the Rovo agent, the MCP tools and the daily trigger share one tested code path.
import {
  COUNTRIES, LEVEL_LABEL, SAMPLE_CLIENTS, RULES_AS_OF, addDays, deadlinesBetween, describeDeadline,
  normaliseClient, urgency, validateClient,
} from './engine/deadlines.js';

const K_CLIENTS = 'duedesk:clients';
const K_TASKS = 'duedesk:tasks';
const K_SETTINGS = 'duedesk:settings';

export const todayUtc = () => new Date().toISOString().slice(0, 10);

const text = (t) => ({ type: 'text', text: t });
const para = (...nodes) => ({ type: 'paragraph', content: nodes });
const adf = (...content) => ({ type: 'doc', version: 1, content });

/** Atlassian Document Format description for a filing task. */
export function taskDescription(d) {
  const rows = [
    para({ type: 'text', text: 'Client: ', marks: [{ type: 'strong' }] }, text(`${d.clientName} (${COUNTRIES[d.country]?.name ?? d.country})`)),
    para({ type: 'text', text: 'Financial year end: ', marks: [{ type: 'strong' }] }, text(d.yearEnd)),
    para({ type: 'text', text: 'Due: ', marks: [{ type: 'strong' }] }, text(d.due === d.statutory ? d.due : `${d.due} (statutory ${d.statutory} falls on a weekend)`)),
    para({ type: 'text', text: 'Source: ', marks: [{ type: 'strong' }] }, text(d.cite)),
  ];
  if (d.penalty) rows.push(para({ type: 'text', text: 'If late: ', marks: [{ type: 'strong' }] }, text(d.penalty)));
  if (d.note) rows.push(para({ type: 'text', text: 'Note: ', marks: [{ type: 'strong' }] }, text(d.note)));
  rows.push({
    type: 'panel', attrs: { panelType: 'info' },
    content: [para(text(`Created by DueDesk (rules as of ${RULES_AS_OF}). Public holidays are not applied, so check the local calendar. General information, not tax advice.`))],
  });
  return adf(...rows);
}

export function createService({ store, jira, today = todayUtc }) {
  const getClients = async () => (await store.get(K_CLIENTS)) ?? [];
  const getTasks = async () => (await store.get(K_TASKS)) ?? {};
  const getSettings = async () => (await store.get(K_SETTINGS)) ?? {};

  async function findClient(ref) {
    const clients = await getClients();
    if (!ref) return null;
    const r = String(ref).trim().toLowerCase();
    return clients.find((c) => c.id === r) ?? clients.find((c) => c.name.toLowerCase() === r) ?? clients.find((c) => c.name.toLowerCase().includes(r)) ?? null;
  }

  async function addClient(input) {
    const clients = await getClients();
    const c = normaliseClient(input, clients.map((x) => x.id));
    const errors = validateClient(c);
    if (errors.length) return { ok: false, errors };
    const i = clients.findIndex((x) => x.id === c.id);
    if (i >= 0) clients[i] = c; else clients.push(c);
    await store.set(K_CLIENTS, clients);
    return { ok: true, client: c };
  }

  async function removeClient(id) {
    const clients = await getClients();
    await store.set(K_CLIENTS, clients.filter((c) => c.id !== id));
    return { ok: true };
  }

  async function loadSample() {
    const clients = await getClients();
    const ids = new Set(clients.map((c) => c.id));
    for (const s of SAMPLE_CLIENTS) if (!ids.has(s.id)) clients.push({ ...s });
    await store.set(K_CLIENTS, clients);
    return { ok: true, count: clients.length };
  }

  /** Jira status for task issue keys, in batches. Missing issues (deleted) come back absent. */
  async function statuses(keys) {
    const out = {};
    for (let i = 0; i < keys.length; i += 50) {
      const batch = keys.slice(i, i + 50);
      const res = await jira.request('/rest/api/3/search/jql', {
        method: 'POST',
        body: { jql: `key in (${batch.join(',')})`, fields: ['status', 'assignee'], maxResults: 50 },
      });
      if (res.status >= 300) continue;
      for (const is of res.json?.issues ?? []) {
        out[is.key] = {
          status: is.fields?.status?.name ?? '',
          done: is.fields?.status?.statusCategory?.key === 'done',
          assignee: is.fields?.assignee?.displayName ?? null,
        };
      }
    }
    return out;
  }

  /**
   * Upcoming (and recently missed) deadlines across all clients, joined with their Jira tasks.
   * days: look-ahead window. client: optional name or id filter.
   */
  async function upcoming({ days = 60, client, includeDone = false } = {}) {
    const t = today();
    const from = addDays(t, -30);
    const to = addDays(t, Math.max(1, Math.min(730, Number(days) || 60)));
    let clients = await getClients();
    if (client) { const c = await findClient(client); clients = c ? [c] : []; }
    const tasks = await getTasks();
    const items = clients.flatMap((c) => deadlinesBetween(c, from, to));
    const keys = [...new Set(items.map((d) => tasks[d.key]?.issueKey).filter(Boolean))];
    const st = keys.length ? await statuses(keys) : {};
    const rows = items.map((d) => {
      const task = tasks[d.key];
      const s = task ? st[task.issueKey] : undefined;
      return { ...d, ...urgency(t, d.due), issueKey: task?.issueKey ?? null, status: s?.status ?? null, done: !!s?.done, assignee: s?.assignee ?? null };
    }).filter((r) => includeDone || !r.done)
      // Past deadlines only matter while their task is open or missing.
      .filter((r) => r.days >= 0 || !r.done);
    const counts = { overdue: 0, today: 0, week: 0, month: 0, later: 0 };
    for (const r of rows) counts[r.level]++;
    return { today: t, from, to, counts, rows, clients: clients.length };
  }

  async function pickIssueType(projectKey) {
    const res = await jira.request(`/rest/api/3/issue/createmeta/${encodeURIComponent(projectKey)}/issuetypes`);
    if (res.status >= 300) throw new Error(`Cannot read issue types for project ${projectKey} (HTTP ${res.status}).`);
    const types = (res.json?.issueTypes ?? res.json?.values ?? []).filter((x) => !x.subtask);
    const pick = types.find((x) => x.name === 'Task') ?? types.find((x) => /task|tâche|タスク|작업/i.test(x.name)) ?? types[0];
    if (!pick) throw new Error(`Project ${projectKey} has no issue type DueDesk can use.`);
    return pick.id;
  }

  /**
   * Creates one Jira task per deadline in the window that has no task yet. Never creates duplicates:
   * the instance key (client + deadline + financial year) is stored with the issue key.
   */
  async function createTasks({ projectKey, client, days = 120 } = {}) {
    const settings = await getSettings();
    const pk = (projectKey || settings.projectKey || '').trim().toUpperCase();
    if (!pk) return { ok: false, errors: ['Which Jira project should the filing tasks go to? Give a project key.'] };
    if (pk !== settings.projectKey) await store.set(K_SETTINGS, { ...settings, projectKey: pk });
    const t = today();
    let clients = await getClients();
    if (client) { const c = await findClient(client); if (!c) return { ok: false, errors: [`No client matches "${client}".`] }; clients = [c]; }
    const tasks = await getTasks();
    const todo = clients.flatMap((c) => deadlinesBetween(c, addDays(t, -30), addDays(t, Math.max(1, Math.min(730, Number(days) || 120)))))
      .filter((d) => !tasks[d.key] && !d.optional);
    if (!todo.length) return { ok: true, created: [], skipped: 0, projectKey: pk };
    const issuetype = await pickIssueType(pk);
    const created = [];
    const failed = [];
    for (const d of todo) {
      const res = await jira.request('/rest/api/3/issue', {
        method: 'POST',
        body: {
          fields: {
            project: { key: pk },
            issuetype: { id: issuetype },
            summary: `[${d.clientName}] ${d.label}`.slice(0, 250),
            duedate: d.due,
            labels: ['duedesk', `duedesk-${d.country.toLowerCase()}`, `client-${d.clientId}`.slice(0, 255)],
            description: taskDescription(d),
          },
        },
      });
      if (res.status >= 300 || !res.json?.key) { failed.push({ key: d.key, status: res.status, error: JSON.stringify(res.json?.errors ?? res.json ?? '').slice(0, 300) }); continue; }
      tasks[d.key] = { issueKey: res.json.key, projectKey: pk, due: d.due, alerted: [] };
      created.push({ issueKey: res.json.key, client: d.clientName, label: d.label, due: d.due });
      // Save as we go so a timeout never causes duplicates on retry.
      await store.set(K_TASKS, tasks);
    }
    return { ok: failed.length === 0, created, failed, projectKey: pk };
  }

  /** Daily trigger: one comment per stage (7 days left, due today, overdue) on open tasks. */
  async function dailyCheck() {
    const t = today();
    const tasks = await getTasks();
    const due = Object.entries(tasks).filter(([, v]) => urgency(t, v.due).days <= 7);
    if (!due.length) return { checked: 0, commented: [] };
    const st = await statuses(due.map(([, v]) => v.issueKey));
    const commented = [];
    for (const [k, v] of due) {
      const s = st[v.issueKey];
      if (!s || s.done) continue;
      const u = urgency(t, v.due);
      const stage = u.level === 'overdue' ? 'overdue' : u.level === 'today' ? 'today' : 'week';
      if ((v.alerted ?? []).includes(stage)) continue;
      const msg = stage === 'overdue'
        ? `⚠️ DueDesk: this filing was due ${v.due} and is ${-u.days} day(s) overdue. Check the late-filing consequences in the description.`
        : stage === 'today' ? `⏰ DueDesk: this filing is due today (${v.due}).` : `📅 DueDesk: ${u.days} day(s) left until ${v.due}.`;
      const res = await jira.request(`/rest/api/3/issue/${v.issueKey}/comment`, { method: 'POST', body: { body: adf(para(text(msg))) } });
      if (res.status < 300) { v.alerted = [...(v.alerted ?? []), stage]; tasks[k] = v; commented.push({ issueKey: v.issueKey, stage }); }
    }
    await store.set(K_TASKS, tasks);
    return { checked: due.length, commented };
  }

  /** Facts the agent needs to draft a reminder to one client. */
  async function reminderContext({ client, days = 90 } = {}) {
    const c = await findClient(client);
    if (!c) return { ok: false, errors: [`No client matches "${client}".`] };
    const up = await upcoming({ client: c.id, days });
    return {
      ok: true,
      client: c,
      deadlines: up.rows.map((r) => ({ label: r.label, due: r.due, status: r.status ?? 'no task yet', when: LEVEL_LABEL[r.level], summary: describeDeadline(r, up.today) })),
    };
  }

  return { getClients, addClient, removeClient, loadSample, upcoming, createTasks, dailyCheck, reminderContext, getSettings, findClient };
}
