import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isKrNonBusinessDay, krTaxDeadline } from './kr-business-day.ts';

const d = (s: string) => new Date(`${s}T00:00:00`);
const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

test('keeps a weekday deadline', () => assert.equal(iso(krTaxDeadline(d('2026-03-31'))), '2026-03-31'));
test('moves a Saturday deadline to Monday', () => assert.equal(iso(krTaxDeadline(d('2026-07-25'))), '2026-07-27'));
test('skips a weekend and a substitute holiday', () => assert.equal(iso(krTaxDeadline(d('2026-10-03'))), '2026-10-06'));
test('moves past 설날 into the next business day', () => assert.equal(iso(krTaxDeadline(d('2027-02-06'))), '2027-02-10'));
test('treats 제헌절 as a holiday from 2026', () => assert.equal(isKrNonBusinessDay(d('2026-07-17')), true));
test('moves the 2026 comprehensive income tax deadline (Sun 5/31) to 6/1', () => assert.equal(iso(krTaxDeadline(d('2026-05-31'))), '2026-06-01'));
test('2026 종부세 (12/15 Tue) and 중간예납 (11/30 Mon) stay put', () => {
  assert.equal(iso(krTaxDeadline(d('2026-12-15'))), '2026-12-15');
  assert.equal(iso(krTaxDeadline(d('2026-11-30'))), '2026-11-30');
});
