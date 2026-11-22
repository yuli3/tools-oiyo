import test from 'node:test';
import assert from 'node:assert/strict';
import { splitBill, cardInstallment } from './bill-split.ts';

const ppl = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `P${i + 1}` }));

test('equal split always sums to the card total; payer absorbs remainder', () => {
  const r = splitBill({ total: 100000, people: ppl(3), mode: 'equal', unit: 100, payer: 0 });
  assert.deepEqual(r.rows.map((x) => x.share), [33400, 33300, 33300]);
  assert.equal(r.toCollect, 66600);
  assert.equal(r.payerExtra, 67);
  const sum = r.rows.reduce((a, b) => a + b.share, 0);
  assert.equal(sum, 100000);
});

test('unit 1 gives near-exact shares', () => {
  const r = splitBill({ total: 10, people: ppl(3), mode: 'equal', unit: 1, payer: 2 });
  assert.deepEqual(r.rows.map((x) => x.share), [3, 3, 4]);
});

test('ratio split 2:1:1', () => {
  const r = splitBill({ total: 87000, people: [{ name: 'a', weight: 2 }, { name: 'b', weight: 1 }, { name: 'c', weight: 1 }], mode: 'ratio', unit: 1000, payer: 1 });
  assert.deepEqual(r.rows.map((x) => x.share), [43000, 23000, 21000]);
  assert.equal(r.rows.reduce((a, b) => a + b.share, 0), 87000);
});

test('custom: fixed amounts kept, rest split', () => {
  const r = splitBill({ total: 90000, people: [{ name: 'a', fixed: 30000 }, { name: 'b' }, { name: 'c' }], mode: 'custom', unit: 10, payer: 1 });
  assert.deepEqual(r.rows.map((x) => x.share), [30000, 30000, 30000]);
  assert.equal(r.overFixed, false);
  const over = splitBill({ total: 10000, people: [{ name: 'a', fixed: 20000 }, { name: 'b' }], mode: 'custom', unit: 10, payer: 1 });
  assert.equal(over.overFixed, true);
});

test('Korean card installment: fee on remaining principal', () => {
  // 1,200,000원 3개월, 연 12%: 수수료 12,000 + 8,000 + 4,000 = 24,000
  const r = cardInstallment({ principal: 1200000, months: 3, ratePct: 12, method: 'declining' });
  assert.deepEqual(r.rows.map((x) => x.fee), [12000, 8000, 4000]);
  assert.equal(r.totalFee, 24000);
  assert.equal(r.firstPayment, 412000);
  assert.equal(r.rows.at(-1)?.balance, 0);
  assert.ok(Math.abs(r.effectiveAprPct - 12) < 0.05);
});

test('annuity installment matches level payment', () => {
  const r = cardInstallment({ principal: 100000, months: 12, ratePct: 15, method: 'annuity' });
  assert.equal(r.rows.at(-1)?.balance, 0);
  assert.ok(Math.abs(r.totalFee - 8310) <= 12, String(r.totalFee));
  assert.ok(Math.abs(r.effectiveAprPct - 15) < 0.1);
});

test('flat monthly fee (China style) has a higher effective APR', () => {
  // 12,000元 12期, 월 0.6%: 수수료 72×12 = 864, 실질 연율 약 13%
  const r = cardInstallment({ principal: 12000, months: 12, ratePct: 0.6, method: 'flat' });
  assert.equal(r.totalFee, 864);
  assert.ok(r.effectiveAprPct > 12.5 && r.effectiveAprPct < 13.5, String(r.effectiveAprPct));
});
