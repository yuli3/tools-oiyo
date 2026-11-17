// 할인 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 DiscountScenario. 문구: lib/life-i18n.ts
import { useMemo } from "react";
import { DISCOUNT_EXAMPLE, discountAssumptionsL, discountPlainL, moneyL, stackVsSingleL } from "../../../lib/life-i18n";
import { discountFinal, discountResult, type DiscountLite } from "../../../lib/life-scenarios";
import { WL_CURRENCY, pctOf, type WL } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ScenarioLite from "../viz/ScenarioLite";

const KEYS = ["price", "rate", "extra"] as const;
const T = {
  en: { price: "List price", rate: "Discount", extra: "Extra discount (coupon, card)", result: "what you pay", pay: "You pay", saved: "You save", eff: "Real discount", chart: "Stacked vs combined discount", cap: "Discounts taken one after another cut less than their sum." },
  ja: { price: "定価", rate: "割引率", extra: "追加割引（クーポン・カード）", result: "支払う金額", pay: "支払う金額", saved: "お得な金額", eff: "実際の割引率", chart: "重ねた割引とまとめた割引", cap: "順番に割り引くと、合計した率より割引が小さくなります。" },
  zh: { price: "原价", rate: "折扣率", extra: "额外折扣（优惠券、银行卡）", result: "实付金额", pay: "实付", saved: "省下", eff: "实际折扣率", chart: "叠加折扣与合并折扣", cap: "先后叠加的折扣比两者相加要少。" },
  fr: { price: "Prix affiché", rate: "Remise", extra: "Remise en plus (code, carte)", result: "le prix payé", pay: "Vous payez", saved: "Économie", eff: "Remise réelle", chart: "Remises cumulées ou additionnées", cap: "Deux remises successives font moins que leur somme." },
  es: { price: "Precio original", rate: "Descuento", extra: "Descuento adicional (cupón, tarjeta)", result: "lo que pagas", pay: "Pagas", saved: "Ahorras", eff: "Descuento real", chart: "Descuentos encadenados o sumados", cap: "Dos descuentos seguidos rebajan menos que su suma." },
};

export default function DiscountWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const m = (n: number) => moneyL(n, lang, cur);
  const assumptions = useMemo(() => discountAssumptionsL(lang), [lang]);
  const summary = useMemo(() => discountPlainL(lang, cur), [lang, cur]);
  return (
    <ScenarioLite<DiscountLite, (typeof KEYS)[number]>
      lang={lang}
      currency={cur}
      toolId="discount-calculator"
      example={DISCOUNT_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={discountFinal}
      resultName={t.result}
      formatResult={m}
      inputs={(input, edit) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label={t.price} value={input.price} onChange={(v) => edit({ price: v }, ["price"])} suffix={cur} step={cur === "JPY" ? 100 : 1} min={0} />
          <NumberField label={t.rate} value={Math.round(input.rate * 100)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={1} min={0} />
          <NumberField label={t.extra} value={Math.round(input.extra * 100)} onChange={(v) => edit({ extra: v / 100 }, ["extra"])} suffix="%" step={1} min={0} />
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = discountResult(i);
        return [
          { label: t.pay, value: m(r.final), tone: "primary" },
          { label: t.saved, value: m(r.saved) },
          { label: t.eff, value: pctOf(Math.round(r.effective * 1000) / 1000, lang) },
        ];
      }}
      sliders={["rate", "extra", "price"]}
      charts={(i) => (i.extra > 0 ? <CompareBars title={t.chart} caption={t.cap} items={stackVsSingleL(i, lang)} format={m} /> : null)}
    />
  );
}
