import { test } from "node:test";
import assert from "node:assert/strict";
import { bfCart, dealCheck, salePrice, stacked, worthTopUp, type BfCart } from "./black-friday.ts";

const base: BfCart = { items: [{ price: 100, pct: 0.3 }, { price: 50, pct: 0.2 }], couponType: "pct", coupon: 0.1, minSpend: 0, taxRate: 0.07, shipping: 8, freeShipOver: 0 };

test("item sale then cart coupon then tax then shipping", () => {
  const r = bfCart(base);
  assert.equal(r.list, 150);
  assert.equal(r.sale, 110);
  assert.equal(r.couponOff, 11);
  assert.equal(r.afterCoupon, 99);
  assert.equal(r.tax, 6.93);
  assert.equal(r.ship, 8);
  assert.equal(r.total, 113.93);
  assert.equal(r.saved, 51);
  assert.equal(Math.round(r.effective * 1000), 340);
});

test("coupon below minimum spend is not applied and reports the gap", () => {
  const r = bfCart({ ...base, couponType: "amount", coupon: 20, minSpend: 125 });
  assert.equal(r.couponApplied, false);
  assert.equal(r.couponOff, 0);
  assert.equal(r.gapCoupon, 15);
  assert.equal(worthTopUp(r.gapCoupon, 20), true);
  assert.equal(worthTopUp(25, 20), false);
});

test("fixed coupon never exceeds the subtotal", () => {
  const r = bfCart({ ...base, items: [{ price: 10, pct: 0 }], couponType: "amount", coupon: 25, taxRate: 0, shipping: 5 });
  assert.equal(r.afterCoupon, 0);
  assert.equal(r.ship, 0);
  assert.equal(r.total, 0);
});

test("free shipping threshold uses the subtotal after the coupon", () => {
  const under = bfCart({ ...base, freeShipOver: 100 });
  assert.equal(under.ship, 8);
  assert.equal(under.gapShip, 1);
  const over = bfCart({ ...base, coupon: 0, freeShipOver: 100 });
  assert.equal(over.ship, 0);
  assert.equal(over.gapShip, 0);
});

test("stacked discounts multiply", () => {
  assert.equal(Math.round(stacked(0.2, 0.1) * 100), 28);
  assert.equal(salePrice({ price: 59.99, pct: 0.25 }), 44.99);
});

test("deal check against the lowest earlier price", () => {
  assert.equal(dealCheck(80, 100).verdict, "real");
  assert.equal(dealCheck(100, 100).verdict, "same");
  assert.equal(dealCheck(110, 100).verdict, "worse");
  assert.equal(dealCheck(80, 100).pct, 0.2);
});

test("bad input is treated as zero", () => {
  const r = bfCart({ ...base, items: [{ price: Number.NaN, pct: 2 }], shipping: -1 });
  assert.equal(r.total, 0);
});
