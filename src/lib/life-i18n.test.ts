import test from "node:test";
import assert from "node:assert/strict";
import * as L from "./life-i18n.ts";
import { WL_CURRENCY, type WL } from "./world-money-i18n.ts";

const LANGS: WL[] = ["en", "ja", "zh", "fr", "es"];
const bad = /[가-힣]|NaN|undefined|—/;
const ok = (p: { headline: string; reasons: string[] }) => !bad.test(p.headline + p.reasons.join(""));

test("생활 4종 다른 언어 판: 문구에 한글·NaN이 없고 겹친 할인은 합보다 덜 깎여요", () => {
  for (const lang of LANGS) {
    const cur = WL_CURRENCY[lang];
    for (const people of [1, 3]) assert.ok(ok(L.travelPlainL(lang, cur)({ ...L.TRAVEL_EXAMPLE[lang], people })), `${lang} travel`);
    assert.ok(ok(L.travelPlainL(lang, cur)({ ...L.TRAVEL_EXAMPLE[lang], flight: 0, hotel: 0 })), `${lang} travel daily`);
    for (const roundTrip of [false, true]) assert.ok(ok(L.fuelPlainL(lang, cur)({ ...L.FUEL_EXAMPLE[lang], roundTrip, people: 3 })), `${lang} fuel`);
    assert.ok(ok(L.tipPlainL(lang)(L.TIP_EXAMPLE[lang])), `${lang} tip`);
    for (const extra of [0, 0.1]) assert.ok(ok(L.discountPlainL(lang, cur)({ ...L.DISCOUNT_EXAMPLE[lang], extra })), `${lang} discount`);
    for (const a of [...L.travelAssumptionsL(lang), ...L.fuelAssumptionsL(lang), ...L.tipAssumptionsL(lang), ...L.discountAssumptionsL(lang)]) assert.ok(!bad.test(a.label + a.plain), `${lang} ${a.key}`);
    const [stack, once] = L.stackVsSingleL(L.DISCOUNT_EXAMPLE[lang], lang);
    assert.ok(stack.value > once.value);
  }
  assert.equal(L.moneyL(0.95, "en", "USD"), "$0.95");
  assert.equal(L.moneyL(175, "ja", "JPY"), "￥175");
});
