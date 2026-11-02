import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lisaWithdrawal, lisaPlan, cnTax, cnPension, hkProgressive, hkStandard, hkTvc, HK_YEARS, cpfRefund } from './country-finance-3.ts';

const close = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`);

test('LISA: gov.uk £160 example and the 6.25% loss on own money', () => {
  close(lisaWithdrawal(160, 0.25).net, 120);
  const w = lisaWithdrawal(1250, 0.25);
  close(w.ownMoney, 1000); close(w.net, 937.5); close(w.vsOwn, -62.5);
  close(lisaWithdrawal(1250, 0.2).vsOwn, 0); // over-cap home from 29 Oct 2026 returns only the bonus
});

test('LISA plan: £4,000 a year earns the £1,000 cap and stops at 50', () => {
  const r = lisaPlan('45', '0', '4000', '0', '55');
  assert.ok(r && r.error === 'age'); // cannot open at 45 with no account
  const p = lisaPlan('45', '10000', '4000', '0', '55')!;
  assert.equal(p.error, null);
  if (p.error === null) { close(p.paid, 20000); close(p.bonus, 5000); close(p.value, 35000); assert.equal(p.rows.length, 10); }
  assert.equal(lisaPlan('30', '0', '4001', '0', '40')?.error, 'limit');
  assert.equal(lisaPlan('17', '0', '100', '0', '40'), null);
});

test('China IIT table and 个人养老金 net effect', () => {
  close(cnTax(36000), 1080); close(cnTax(144000), 144000 * 0.1 - 2520); close(cnTax(1_000_000), 268080);
  const low = cnPension('20000', '12000')!;
  assert.equal(low.error, null);
  if (low.error === null) { close(low.saving, 360); close(low.withdrawalTax, 360); close(low.net, 0); }
  const mid = cnPension('200000', '12000')!;
  if (mid.error === null) { close(mid.saving, 2400); close(mid.net, 2040); assert.equal(mid.rate, 0.2); }
  assert.equal(cnPension('200000', '12001')?.error, 'limit');
});

test('Hong Kong progressive bands, two-tier standard rate and TVC cap', () => {
  close(hkProgressive(200000), 16000); close(hkProgressive(250000), 24500);
  close(hkStandard(6_000_000), 750000 + 160000);
  const r = hkTvc('400000', String(HK_YEARS['2025/26'].basic), '60000')!;
  // 400,000-132,000=268,000 → 16,000+68,000×17% = 27,560; after TVC 208,000 → 17,360
  close(r.before.tax, 27560); close(r.after.tax, 17360); close(r.saving, 10200);
  const capped = hkTvc('400000', '132000', '80000')!; assert.equal(capped.used, 60000); assert.ok(capped.capped);
  const rich = hkTvc('10000000', '132000', '60000')!; assert.ok(rich.before.standardApplies); close(rich.saving, 60000 * 0.16);
});

test('CPF refund: monthly interest, annual compounding, capped by sale proceeds', () => {
  const lump = cpfRefund('100000', '0', '24', '2.5', '', '')!;
  close(lump.principal, 100000); close(lump.interest, 100000 * (1.025 ** 2 - 1), 1e-6);
  const partial = cpfRefund('100000', '0', '6', '2.5', '', '')!; close(partial.interest, 1250);
  const sale = cpfRefund('100000', '0', '24', '2.5', '150000', '60000')!;
  close(sale.proceeds ?? -1, 90000); close(sale.refund, 90000);
  assert.equal(cpfRefund('1', '1', '0', '2.5', '', ''), null);
});
