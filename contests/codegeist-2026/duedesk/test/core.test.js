import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../src/core.js';

function fakes(today = '2026-11-24') {
  const mem = new Map();
  const store = { get: async (k) => structuredClone(mem.get(k)), set: async (k, v) => { mem.set(k, structuredClone(v)); } };
  const issues = new Map();
  const calls = [];
  let n = 0;
  const jira = {
    request: async (path, opts = {}) => {
      calls.push({ path, method: opts.method ?? 'GET', body: opts.body });
      if (path.endsWith('/issuetypes')) return { status: 200, json: { issueTypes: [{ id: '10001', name: 'Epic' }, { id: '10002', name: 'Task' }, { id: '10003', name: 'Sub-task', subtask: true }] } };
      if (path === '/rest/api/3/issue' && opts.method === 'POST') {
        const key = `FIRM-${++n}`;
        issues.set(key, { fields: opts.body.fields, done: false });
        return { status: 201, json: { key } };
      }
      if (path === '/rest/api/3/search/jql') {
        const keys = /key in \((.*)\)/.exec(opts.body.jql)[1].split(',');
        return { status: 200, json: { issues: keys.filter((k) => issues.has(k)).map((k) => ({ key: k, fields: { status: { name: issues.get(k).done ? 'Done' : 'To Do', statusCategory: { key: issues.get(k).done ? 'done' : 'new' } } } })) } };
      }
      if (/\/comment$/.test(path)) return { status: 201, json: {} };
      return { status: 404, json: {} };
    },
  };
  let t = today;
  const svc = createService({ store, jira, today: () => t });
  return { svc, issues, calls, setToday: (x) => { t = x; } };
}

test('add client validates and stores', async () => {
  const { svc } = fakes();
  const bad = await svc.addClient({ name: 'X', country: 'ZZ', yearEnd: '2026-12-31' });
  assert.equal(bad.ok, false);
  const ok = await svc.addClient({ name: 'Thames Robotics Ltd', country: 'uk', yearEnd: '2026-03-31' });
  assert.equal(ok.ok, true);
  assert.equal((await svc.getClients()).length, 1);
  assert.equal((await svc.findClient('thames')).id, 'thames-robotics-ltd');
});

test('createTasks creates each deadline once, with due date, labels and Task type', async () => {
  const { svc, calls } = fakes();
  await svc.loadSample();
  const first = await svc.createTasks({ projectKey: 'firm', days: 150 });
  assert.equal(first.ok, true);
  assert.ok(first.created.length >= 5);
  const post = calls.find((c) => c.path === '/rest/api/3/issue');
  assert.equal(post.body.fields.issuetype.id, '10002');
  assert.equal(post.body.fields.project.key, 'FIRM');
  assert.match(post.body.fields.duedate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(post.body.fields.labels.includes('duedesk'));
  const again = await svc.createTasks({ days: 150 });
  assert.equal(again.created.length, 0, 'second run must not duplicate; project key remembered');
  // The optional US extension is never auto-created.
  assert.ok(!first.created.some((c) => /Extended/.test(c.label)));
});

test('upcoming joins Jira status and hides done tasks', async () => {
  const { svc, issues } = fakes();
  await svc.loadSample();
  await svc.createTasks({ projectKey: 'FIRM', days: 60 });
  const before = await svc.upcoming({ days: 60 });
  const withTask = before.rows.find((r) => r.issueKey);
  assert.ok(withTask);
  assert.equal(withTask.status, 'To Do');
  issues.get(withTask.issueKey).done = true;
  const after = await svc.upcoming({ days: 60 });
  assert.ok(!after.rows.some((r) => r.issueKey === withTask.issueKey));
  const all = await svc.upcoming({ days: 60, includeDone: true });
  assert.ok(all.rows.some((r) => r.issueKey === withTask.issueKey && r.done));
});

test('dailyCheck comments once per stage and skips done tasks', async () => {
  const { svc, calls, issues, setToday } = fakes('2026-12-20');
  await svc.addClient({ name: 'Thames Robotics Ltd', country: 'UK', yearEnd: '2026-03-31' });
  const r = await svc.createTasks({ projectKey: 'FIRM', days: 30 });
  assert.equal(r.created[0].due, '2026-12-31');
  setToday('2026-12-26');
  const a = await svc.dailyCheck();
  assert.ok(a.commented.some((c) => c.stage === 'week'));
  const b = await svc.dailyCheck();
  assert.equal(b.commented.length, 0, 'no repeat comment for the same stage');
  setToday('2027-01-03');
  const c = await svc.dailyCheck();
  assert.ok(c.commented.some((x) => x.stage === 'overdue'));
  for (const v of issues.values()) v.done = true;
  setToday('2027-01-05');
  const d = await svc.dailyCheck();
  assert.equal(d.commented.length, 0);
  assert.ok(calls.filter((x) => /\/comment$/.test(x.path)).length >= 2);
});

test('reminderContext returns plain facts with sources', async () => {
  const { svc } = fakes();
  await svc.loadSample();
  const r = await svc.reminderContext({ client: 'Thames', days: 150 });
  assert.equal(r.ok, true);
  assert.ok(r.deadlines.length >= 2);
  assert.match(r.deadlines[0].summary, /Source: gov\.uk/);
  const missing = await svc.reminderContext({ client: 'nobody' });
  assert.equal(missing.ok, false);
});

test('createTasks asks for a project when none is known', async () => {
  const { svc } = fakes();
  await svc.loadSample();
  const r = await svc.createTasks({});
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /project key/);
});
