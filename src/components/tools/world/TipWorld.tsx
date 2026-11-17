// 팁 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 TipScenario. 금액은 계산서 통화 그대로. 문구: lib/life-i18n.ts
import { useMemo } from "react";
import { TIP_EXAMPLE, amtL, tipAssumptionsL, tipPlainL, tipRatesL } from "../../../lib/life-i18n";
import { tipPer, tipResult, type TipLite } from "../../../lib/life-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ScenarioLite from "../viz/ScenarioLite";

const KEYS = ["bill", "rate", "split"] as const;
const T = {
  en: { bill: "Bill (before tax)", rate: "Tip", split: "Split between", ppl: "people", hint: "Enter the amount in the bill's currency, e.g. 80 for $80.", result: "each share", per: "Each", tip: "Tip", total: "Total", chart: "Each share by tip rate" },
  ja: { bill: "飲食代（税抜）", rate: "チップ率", split: "割る人数", ppl: "人", hint: "伝票の通貨のまま入れてください。例：80ドルなら80。", result: "1人の負担", per: "1人あたり", tip: "チップ", total: "合計", chart: "チップ率ごとの1人の負担" },
  zh: { bill: "账单（税前）", rate: "小费比例", split: "分摊人数", ppl: "人", hint: "按账单币种填写，例如80美元就填80。", result: "每人分摊", per: "每人", tip: "小费", total: "合计", chart: "不同小费比例的每人分摊" },
  fr: { bill: "Addition (hors taxes)", rate: "Pourboire", split: "Partagé entre", ppl: "pers.", hint: "Saisissez le montant dans la devise de l'addition, par ex. 80 pour 80 $.", result: "la part de chacun", per: "Par personne", tip: "Pourboire", total: "Total", chart: "Part de chacun selon le pourboire" },
  es: { bill: "Cuenta (sin impuestos)", rate: "Propina", split: "Dividir entre", ppl: "pers.", hint: "Introduce el importe en la moneda de la cuenta, p. ej. 80 para 80 $.", result: "la parte de cada uno", per: "Por persona", tip: "Propina", total: "Total", chart: "Parte de cada uno según la propina" },
};

export default function TipWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const a = (n: number) => amtL(n, lang);
  const assumptions = useMemo(() => tipAssumptionsL(lang), [lang]);
  const summary = useMemo(() => tipPlainL(lang), [lang]);
  return (
    <ScenarioLite<TipLite, (typeof KEYS)[number]>
      lang={lang}
      currency="USD"
      toolId="tip-calculator"
      example={TIP_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={tipPer}
      resultName={t.result}
      formatResult={a}
      inputs={(input, edit) => (
        <div className="space-y-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label={t.bill} value={input.bill} onChange={(v) => edit({ bill: v }, ["bill"])} step={1} min={0} />
            <NumberField label={t.rate} value={Math.round(input.rate * 100)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={1} min={0} />
            <NumberField label={t.split} value={input.split} onChange={(v) => edit({ split: v }, ["split"])} suffix={t.ppl} step={1} min={1} />
          </div>
          <p className="text-xs text-muted-foreground">{t.hint}</p>
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = tipResult(i);
        return [
          { label: t.per, value: a(r.per), tone: "primary" },
          { label: t.tip, value: a(r.tip) },
          { label: t.total, value: a(r.total) },
        ];
      }}
      sliders={["rate", "bill", "split"]}
      charts={(i) => <CompareBars title={t.chart} items={tipRatesL(i, lang)} format={a} />}
    />
  );
}
