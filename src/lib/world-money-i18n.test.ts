import test from "node:test";
import assert from "node:assert/strict";
import * as W from "./world-money-i18n.ts";
import * as M from "./world-money-scenarios.ts";

const LANGS: W.WL[] = ["en", "ja", "zh", "fr", "es"];
const HANGUL = /[가-힣]/;

test("세계 공용 돈 다른 언어 판: 계산은 한국어 판과 같고 문구에 한글이 없어요", () => {
  for (const lang of LANGS) {
    const cur = W.WL_CURRENCY[lang];
    const c = W.COMPOUND_EXAMPLE[lang];
    const cp = W.compoundPlainI(lang, cur)(c);
    assert.ok(cp.headline.length > 10 && !HANGUL.test(cp.headline + cp.reasons.join("")), lang);
    assert.equal(W.compoundBridgeI(c, lang).at(-1)?.value, M.compoundFv(c));

    const l = W.LOAN_EXAMPLE[lang];
    for (const method of ["annuity", "principal", "bullet"] as const) {
      const lp = W.loanPlainI(lang, cur)({ ...l, method });
      assert.ok(!HANGUL.test(lp.headline + lp.reasons.join("")), `${lang} ${method}`);
    }
    assert.equal(W.loanCompareI(l, lang).find((x) => x.current)?.value, M.loanInterest(l));

    const m = W.MORTGAGE_EXAMPLE[lang];
    assert.ok(!HANGUL.test(W.mortgagePlainI(lang, cur)(m).reasons.join("")));
    assert.equal(W.mortgageBridgeI(m, lang).at(-1)?.value, M.mortgageResult(m).total);

    const f = W.FIRE_EXAMPLE[lang];
    const fp = W.firePlainI(lang, cur)(f);
    assert.ok(M.fireResult(f).reached, lang);
    assert.ok(!HANGUL.test(fp.headline + fp.reasons.join("")));

    for (const a of [...W.compoundAssumptions(lang, cur), ...W.loanAssumptions(lang, cur), ...W.mortgageAssumptions(lang, cur), ...W.fireAssumptions(lang, cur)]) {
      assert.ok(!HANGUL.test(a.label + a.plain), `${lang} ${a.key}`);
    }
  }
});

test("짧은 금액 표기·핵심 가정 문장·연수 표기", () => {
  assert.equal(W.cash(1_234_567, "en", "USD"), "$1.2M");
  assert.equal(W.cash(40_000, "fr", "EUR").replace(/\s/g, " "), "40 k €");
  assert.equal(W.cashExact(1234.4, "en", "USD"), "$1,234");
  assert.equal(W.driverOf("en", { key: "rate", plain: "the return", low: 10, high: 20, span: 10 } as never, "x", String), "The biggest driver is the return. Moving it 20% up or down puts x between 10 and 20.");
  assert.equal(W.fireYearsText("en")(1), "1 year");
  assert.equal(W.fireYearsText("ja")(80), "70年以上");
});
