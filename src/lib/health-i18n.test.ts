import test from "node:test";
import assert from "node:assert/strict";
import * as H from "./health-i18n.ts";
import type { WL } from "./world-money-i18n.ts";

const LANGS: WL[] = ["en", "ja", "zh", "fr", "es"];
const bad = /[가-힣]|NaN|undefined/;
const ok = (p: { headline: string; reasons: string[] }) => !bad.test(p.headline + p.reasons.join(""));

test("건강 1차 다른 언어 판: 문구에 한글·NaN이 없고 BMI는 나라 기준을 따라요", () => {
  for (const lang of LANGS) {
    for (const w of [45, 68, 95]) assert.ok(ok(H.bmiPlainL(lang)({ height: 170, weight: w })), `${lang} bmi ${w}`);
    for (const sex of ["m", "f"] as const) assert.ok(ok(H.bodyFatPlainL(lang)({ sex, height: 170, weight: 65, waist: 80, neck: 35, hip: 95 })), `${lang} fat ${sex}`);
    assert.ok(!bad.test(H.bodyFatPlainL(lang)({ sex: "m", height: 170, weight: 65, waist: 30, neck: 35, hip: 95 }).headline));
    assert.ok(ok(H.tdeePlainL(lang)({ sex: "f", age: 40, height: 160, weight: 55, activity: "moderate" })), `${lang} tdee`);
    assert.ok(ok(H.waterPlainL(lang)({ weight: 70, activity: "high", temp: "hot", alcohol: 2 })), `${lang} water`);
    assert.ok(ok(H.caffeinePlainL(lang)({ amount: 200, gap: 6, halfLife: 5 })), `${lang} caffeine`);
    for (const a of [...H.bmiAssumptionsL(lang), ...H.bodyFatAssumptionsL(lang), ...H.tdeeAssumptionsL(lang), ...H.waterAssumptionsL(lang), ...H.caffeineAssumptionsL(lang)]) assert.ok(!bad.test(a.label + a.plain), `${lang} ${a.key}`);
  }
  // BMI 24.2: 중국은 과체중, WHO·일본은 정상
  const i = { height: 170, weight: 70 };
  assert.equal(H.bmiResultL(i, "zh").band, "超重");
  assert.equal(H.bmiResultL(i, "en").band, "Healthy weight");
  assert.equal(H.bmiResultL(i, "ja").band, "普通体重");
  assert.equal(H.bodyFatBandL({ sex: "m", height: 175, weight: 75, waist: 86, neck: 38, hip: 96 }, "en"), "Fit");
});
