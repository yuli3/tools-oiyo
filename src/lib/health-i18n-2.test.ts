import test from "node:test";
import assert from "node:assert/strict";
import * as H from "./health-i18n-2.ts";
import type { WL } from "./world-money-i18n.ts";

const LANGS: WL[] = ["en", "ja", "zh", "fr", "es"];
const bad = /[가-힣]|NaN|undefined/;
const ok = (p: { headline: string; reasons: string[] }) => !bad.test(p.headline + p.reasons.join(""));

test("건강 2차 다른 언어 판: 문구에 한글·NaN이 없고 일본 표준 체중은 BMI 22예요", () => {
  for (const lang of LANGS) {
    for (const [p, f] of [[0.3, 0.3], [0.1, 0.2], [0.25, 0.7]]) assert.ok(ok(H.macroPlainL(lang)({ calories: 2000, weight: 70, protein: p, fat: f })), `${lang} macro ${p}`);
    for (const w of [45, 64, 95]) for (const sex of ["m", "f"] as const) assert.ok(ok(H.idealPlainL(lang)({ sex, height: 170, weight: w })), `${lang} ideal ${w}`);
    for (const resting of [0, 60]) for (const zone of [0, 4]) assert.ok(ok(H.heartPlainL(lang)({ age: 40, resting, zone })), `${lang} hr`);
    for (const reps of [5, 15]) assert.ok(ok(H.oneRmPlainL(lang)({ weight: 60, reps })), `${lang} 1rm`);
    for (const sex of ["m", "f"] as const) assert.ok(ok(H.childPlainL(lang)({ father: 175, mother: 162, sex })), `${lang} child`);
    for (const a of [...H.macroAssumptionsL(lang), ...H.idealAssumptionsL(lang), ...H.heartAssumptionsL(lang), ...H.oneRmAssumptionsL(lang), ...H.childAssumptionsL(lang)]) assert.ok(!bad.test(a.label + a.plain), `${lang} ${a.key}`);
    for (const x of [...H.idealFormulasL({ sex: "f", height: 165, weight: 60 }, lang), ...H.repTableL({ weight: 60, reps: 8 }, lang), ...H.macroBarsL({ calories: 2000, weight: 70, protein: 0.3, fat: 0.3 }, lang)]) assert.ok(!bad.test(x.label + x.value), `${lang} label`);
  }
  const f = { sex: "f" as const, height: 160, weight: 55 };
  assert.equal(Math.round(H.idealResultL(f, "ja").std * 10) / 10, 56.3);
  assert.equal(Math.round(H.idealResultL(f, "en").std * 10) / 10, 53.8);
});
