import test from "node:test";
import assert from "node:assert/strict";
import * as L from "./life-scenarios.ts";

test("여행: 방은 2명당 1개, 일수는 박+1", () => {
  const r = L.travelResult({ place: "japan", nights: 3, people: 3, flight: 350000, hotel: 80000, daily: 90000 });
  assert.equal(r.flight, 1050000);
  assert.equal(r.hotel, 80000 * 2 * 3);
  assert.equal(r.daily, 90000 * 3 * 4);
});

test("기름값·결혼·팁·할인", () => {
  assert.equal(L.fuelCost({ distance: 300, efficiency: 12, price: 1650, people: 1, roundTrip: true }), 82500);
  const w = L.weddingResult({ guests: 200, gift: 100000, meal: 60000, venue: 3000000, sdm: 3000000, honeymoon: 5000000 });
  assert.equal(w.balance, 20000000 - 12000000 - 11000000);
  assert.equal(w.breakEven, 275);
  assert.equal(L.weddingResult({ guests: 10, gift: 50000, meal: 60000, venue: 0, sdm: 0, honeymoon: 0 }).breakEven, Infinity);
  assert.equal(L.tipPer({ bill: 100, rate: 0.2, split: 2 }), 60);
  const d = L.discountResult({ price: 10000, rate: 0.2, extra: 0.1 });
  assert.equal(d.final, 7200);
  assert.ok(Math.abs(d.effective - 0.28) < 1e-9);
});
