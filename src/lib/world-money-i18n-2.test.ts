import test from "node:test";
import assert from "node:assert/strict";
import * as W from "./world-money-i18n-2.ts";
import { WL_CURRENCY, type WL } from "./world-money-i18n.ts";
import * as M from "./world-money-scenarios.ts";

const LANGS: WL[] = ["en", "ja", "zh", "fr", "es"];
const HANGUL = /[가-힣]/;
const clean = (p: { headline: string; reasons: string[] }) => !HANGUL.test(p.headline + p.reasons.join("")) && !/NaN|undefined/.test(p.headline + p.reasons.join(""));

test("세계 공용 돈 2차 다른 언어 판: 계산은 한국어 판과 같고 문구에 한글이 없어요", () => {
  for (const lang of LANGS) {
    const cur = WL_CURRENCY[lang];
    assert.ok(clean(W.inflationPlainI(lang, cur)(W.INFLATION_EXAMPLE[lang])), `${lang} inflation`);
    assert.ok(clean(W.roiPlainI(lang, cur)(W.ROI_EXAMPLE[lang])), `${lang} roi`);
    assert.ok(clean(W.roiPlainI(lang, cur)({ ...W.ROI_EXAMPLE[lang], value: W.ROI_EXAMPLE[lang].cost / 2 })), `${lang} roi loss`);
    const rent = W.RENTAL_EXAMPLE[lang];
    assert.equal(rent.deposit, 0);
    assert.ok(clean(W.rentalPlainI(lang, cur)(rent)), `${lang} rental`);
    assert.ok(clean(W.rentalPlainI(lang, cur)({ ...rent, loan: rent.price })), `${lang} rental full loan`);
    assert.equal(W.rentalBridgeI(rent, lang).at(-1)?.value, M.rentalNet(rent));
    assert.ok(M.rentalNet(rent) > 0, `${lang} rental example is profitable`);
    const avg = W.AVG_EXAMPLE[lang];
    assert.ok(clean(W.avgPlainI(lang, cur)(avg)), `${lang} avg`);
    assert.ok(clean(W.avgPlainI(lang, cur)({ ...avg, market: 0 })), `${lang} avg no market`);
    assert.ok(clean(W.lattePlainI(lang, cur)(W.LATTE_EXAMPLE[lang])), `${lang} latte`);
    for (const a of [...W.inflationAssumptions(lang, cur), ...W.roiAssumptions(lang, cur), ...W.rentalAssumptions(lang, cur), ...W.avgAssumptions(lang, cur), ...W.latteAssumptions(lang, cur)]) {
      assert.ok(!HANGUL.test(a.label + a.plain), `${lang} ${a.key}`);
    }
  }
  assert.equal(W.price(12.345, "en", "USD"), "$12.35");
  assert.equal(W.SHARES.ja(1200), "1,200株");
});
