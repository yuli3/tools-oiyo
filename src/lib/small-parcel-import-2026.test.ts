import { test } from "node:test";
import assert from "node:assert/strict";
import { caMailParcel, jpSmallParcel, ukSmallParcel } from "./small-parcel-import-2026.ts";

test("日本: 1万円以下は関税・消費税免税、超えると免税なし", () => {
  assert.equal(jpSmallParcel({ taxableValue: 10_000 }).exempt, true);
  assert.equal(jpSmallParcel({ taxableValue: 10_001 }).exempt, false);
  assert.ok(jpSmallParcel({ taxableValue: 5_000, alcoholOrTobacco: true }).items.some((i) => i.text.includes("酒税")));
});

test("UK: £39 gifts, £135 VAT and duty lines", () => {
  assert.equal(ukSmallParcel({ value: 39, gift: true }).vat, "none");
  assert.equal(ukSmallParcel({ value: 40, gift: true }).vat, "pay-courier");
  assert.equal(ukSmallParcel({ value: 135 }).vat, "paid-to-seller");
  assert.equal(ukSmallParcel({ value: 135 }).duty, false);
  assert.equal(ukSmallParcel({ value: 136 }).vat, "pay-courier");
  assert.equal(ukSmallParcel({ value: 136 }).duty, true);
  assert.equal(ukSmallParcel({ value: 10, excise: true }).duty, true);
});

test("Canada mail: $20 exemption", () => {
  assert.equal(caMailParcel({ value: 20 }).exempt, true);
  assert.equal(caMailParcel({ value: 20.01 }).exempt, false);
});
