import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deadlinesForYear, deadlinesBetween, addMonths, nextWeekday, urgency, normaliseClient, validateClient } from '../src/engine/deadlines.js';

const byId = (list) => Object.fromEntries(list.map((d) => [d.id, d]));

test('addMonths keeps month ends', () => {
  assert.equal(addMonths('2026-02-28', 1), '2026-03-31');
  assert.equal(addMonths('2026-08-31', 6), '2027-02-28');
  assert.equal(addMonths('2026-01-15', 1), '2026-02-15');
});

test('nextWeekday moves Saturday and Sunday to Monday', () => {
  assert.equal(nextWeekday('2026-11-28'), '2026-11-30');
  assert.equal(nextWeekday('2026-11-29'), '2026-11-30');
  assert.equal(nextWeekday('2026-11-30'), '2026-11-30');
});

test('Japan: March year end, final return end of May, interim end of November', () => {
  const d = byId(deadlinesForYear({ country: 'JP', consumptionTax: true }, '2026-03-31'));
  assert.equal(d['jp-corp'].statutory, '2026-05-31');
  assert.equal(d['jp-corp'].due, '2026-06-01'); // 31 May 2026 is a Sunday
  assert.equal(d['jp-interim'].statutory, '2025-11-30');
  assert.equal(d['jp-ct'].statutory, '2026-05-31');
});

test('UK: accounts 9 months, CT payment 9 months + 1 day, CT600 12 months, no weekend shift', () => {
  const d = byId(deadlinesForYear({ country: 'UK' }, '2026-03-31'));
  assert.equal(d['uk-accounts'].due, '2026-12-31');
  assert.equal(d['uk-ctpay'].due, '2027-01-01');
  assert.equal(d['uk-ct600'].due, '2027-03-31');
  const first = byId(deadlinesForYear({ country: 'UK', firstAccounts: true, incorporated: '2025-06-10' }, '2026-06-30'));
  assert.equal(first['uk-accounts'].due, '2027-03-10');
});

test('US: calendar-year C corp due April 15, June year end due 15th of 3rd month', () => {
  const d = byId(deadlinesForYear({ country: 'US', entity: 'ccorp' }, '2026-12-31'));
  assert.equal(d['us-1120'].due, '2027-04-15');
  assert.equal(d['us-1120-ext'].due, '2027-10-15');
  const june = byId(deadlinesForYear({ country: 'US', entity: 'ccorp' }, '2026-06-30'));
  assert.equal(june['us-1120'].statutory, '2026-09-15');
  const p = byId(deadlinesForYear({ country: 'US', entity: 'partnership' }, '2026-12-31'));
  assert.equal(p['us-1065'].due, '2027-03-15');
});

test('France: approval 6 months, greffe 1 or 2 months after', () => {
  const d = byId(deadlinesForYear({ country: 'FR', online: true }, '2026-12-31'));
  assert.equal(d['fr-ag'].statutory, '2027-06-30');
  assert.equal(d['fr-greffe'].statutory, '2027-08-30');
  const paper = byId(deadlinesForYear({ country: 'FR' }, '2026-12-31'));
  assert.equal(paper['fr-greffe'].statutory, '2027-07-30');
});

test('Korea: December year end, CIT March 31, local April 30, interim August 31', () => {
  const d = byId(deadlinesForYear({ country: 'KR' }, '2026-12-31'));
  assert.equal(d['kr-cit'].statutory, '2027-03-31');
  assert.equal(d['kr-local'].statutory, '2027-04-30');
  assert.equal(d['kr-interim'].statutory, '2026-08-31');
  const s = byId(deadlinesForYear({ country: 'KR', sincere: true }, '2026-12-31'));
  assert.equal(s['kr-cit'].statutory, '2027-04-30');
  assert.equal(s['kr-local'].statutory, '2027-05-31');
  const june = byId(deadlinesForYear({ country: 'KR' }, '2026-06-30'));
  assert.equal(june['kr-cit'].statutory, '2026-09-30');
});

test('deadlinesBetween: window, sorted, unique keys, includes late UK first accounts', () => {
  const c = { id: 'a', name: 'A', country: 'UK', yearEnd: '2025-03-31' };
  const rows = deadlinesBetween(c, '2026-11-24', '2027-04-30');
  assert.deepEqual(rows.map((r) => r.due), ['2026-12-31', '2027-01-01', '2027-03-31']);
  assert.equal(new Set(rows.map((r) => r.key)).size, rows.length);
  assert.ok(rows.every((r) => r.yearEnd === '2026-03-31'));
});

test('urgency levels', () => {
  assert.equal(urgency('2026-11-24', '2026-11-20').level, 'overdue');
  assert.equal(urgency('2026-11-24', '2026-11-24').level, 'today');
  assert.equal(urgency('2026-11-24', '2026-11-30').level, 'week');
  assert.equal(urgency('2026-11-24', '2026-12-20').level, 'month');
  assert.equal(urgency('2026-11-24', '2027-02-01').level, 'later');
});

test('normaliseClient accepts loose agent input', () => {
  const c = normaliseClient({ name: 'Acme Corp', country: 'usa', yearEnd: '2026-12-31', entity: 'S corporation' });
  assert.equal(c.country, 'US');
  assert.equal(c.entity, 'scorp');
  assert.equal(c.id, 'acme-corp');
  assert.deepEqual(validateClient(c), []);
  assert.equal(normaliseClient({ name: 'Acme Corp', country: 'UK', yearEnd: '2026-12-31' }, ['acme-corp']).id, 'acme-corp-2');
  assert.ok(validateClient(normaliseClient({ name: '', country: 'XX', yearEnd: 'soon' })).length >= 3);
});
