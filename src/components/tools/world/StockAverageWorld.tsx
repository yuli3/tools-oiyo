// 평단가(물타기) 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 StockAverageScenario. 문구: lib/world-money-i18n-2.ts
import { useMemo } from "react";
import { AVG_EXAMPLE, SHARES, avgAssumptions, avgPlainI, price } from "../../../lib/world-money-i18n-2";
import { WL_CURRENCY, cashExact, type WL } from "../../../lib/world-money-i18n";
import { avgPrice, avgResult, type AvgLite } from "../../../lib/world-money-scenarios";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { nextLinks } from "./names";

const KEYS = ["price", "qty", "addPrice", "addQty", "market"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<AvgLite>, k: Key[]) => void;

const T = {
  en: { price: "Current average cost", priceQ: "Average cost (from your broker app)", qty: "Shares held", addPrice: "Buy price", addQty: "Shares to buy", market: "Current price (optional)", q1: "How many shares do you hold, at what cost?", q2: "At what price, and how many more?", result: "the average cost", avg: "New average cost", total: "Total shares", pl: "Unrealized P/L", sweep: "The more you buy, the closer the average gets to the new price, but each extra share moves it less.", chart: "Average cost by shares bought", askTitle: "Good to know", ask: ["Trading fees and taxes are left out.", "Before lowering your average, make sure you still want to own more of this company."], s1: "Average cost", s2: "Unrealized P/L" },
  ja: { price: "今の平均取得単価", priceQ: "平均取得単価（証券アプリの取得単価）", qty: "保有株数", addPrice: "買い増し価格", addQty: "買い増し株数", market: "今の株価（任意）", q1: "今、何株をいくらで持っていますか？", q2: "いくらで、何株買い増しますか？", result: "平均取得単価", avg: "新しい平均取得単価", total: "合計株数", pl: "評価損益", sweep: "多く買うほど平均単価は買い値に近づきますが、下がり幅は少しずつ小さくなります。", chart: "買い増し株数ごとの平均取得単価", askTitle: "知っておきたいこと", ask: ["売買手数料と税金は含めていません。", "平均単価を下げることより、その会社をもっと持つ理由があるかが先です。"], s1: "平均取得単価", s2: "評価損益" },
  zh: { price: "当前持仓均价", priceQ: "持仓均价（券商App中的成本价）", qty: "持有股数", addPrice: "加仓价格", addQty: "加仓股数", market: "现价（可选）", q1: "现在持有多少股，成本多少？", q2: "以什么价格加仓多少股？", result: "持仓均价", avg: "新的持仓均价", total: "总股数", pl: "浮动盈亏", sweep: "买得越多，均价越接近加仓价，但每多买一股，下降幅度越小。", chart: "不同加仓股数下的持仓均价", askTitle: "需要了解", ask: ["未计交易佣金、印花税等费用。", "先确认是否还愿意多持有这家公司，再考虑摊低成本。"], s1: "持仓均价", s2: "浮动盈亏" },
  fr: { price: "Prix de revient actuel", priceQ: "Prix de revient (dans votre appli de courtage)", qty: "Actions détenues", addPrice: "Prix d'achat", addQty: "Actions à acheter", market: "Cours actuel (facultatif)", q1: "Combien d'actions détenez-vous, à quel prix ?", q2: "À quel prix, et combien de plus ?", result: "le prix de revient moyen", avg: "Nouveau prix de revient", total: "Total d'actions", pl: "Plus/moins-value latente", sweep: "Plus vous achetez, plus la moyenne se rapproche du nouveau prix, mais chaque action supplémentaire la fait moins bouger.", chart: "Prix de revient selon le nombre d'actions achetées", askTitle: "Bon à savoir", ask: ["Frais de courtage et impôts non inclus.", "Avant de moyenner à la baisse, assurez-vous de vouloir détenir davantage de cette entreprise."], s1: "Prix de revient", s2: "Plus/moins-value latente" },
  es: { price: "Precio medio actual", priceQ: "Precio medio (en la app de tu bróker)", qty: "Acciones en cartera", addPrice: "Precio de compra", addQty: "Acciones a comprar", market: "Cotización actual (opcional)", q1: "¿Cuántas acciones tienes y a qué precio medio?", q2: "¿A qué precio y cuántas más?", result: "el precio medio", avg: "Nuevo precio medio", total: "Total de acciones", pl: "Resultado latente", sweep: "Cuantas más compras, más se acerca la media al nuevo precio, pero cada acción extra la mueve menos.", chart: "Precio medio según las acciones compradas", askTitle: "Conviene saber", ask: ["Sin comisiones de compraventa ni impuestos.", "Antes de promediar a la baja, asegúrate de que quieres tener más de esta empresa."], s1: "Precio medio", s2: "Resultado latente" },
};

export default function StockAverageWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const sh = SHARES[lang];
  const x = (n: number) => price(n, lang, cur);
  const assumptions = useMemo(() => avgAssumptions(lang, cur), [lang, cur]);
  const summary = useMemo(() => avgPlainI(lang, cur), [lang, cur]);
  const step = cur === "JPY" ? 10 : cur === "CNY" ? 0.1 : 0.5;
  const unit = sh(0).replace(/^0\s?/, "");
  const f = (label: string, key: "price" | "addPrice" | "market", i: AvgLite, edit: Edit, alsoMarket = false) => (
    <NumberField label={label} value={i[key]} onChange={(v) => edit((alsoMarket ? { [key]: v, market: v } : { [key]: v }) as Partial<AvgLite>, alsoMarket ? [key, "market"] : [key])} suffix={cur} step={step} />
  );
  const q = (label: string, key: "qty" | "addQty", i: AvgLite, edit: Edit) => <NumberField label={label} value={i[key]} onChange={(v) => edit({ [key]: v } as Partial<AvgLite>, [key])} suffix={unit} step={1} min={0} />;
  return (
    <ScenarioTool<AvgLite, Key>
      lang={lang}
      currency={cur}
      toolId="stock-average-calculator"
      example={AVG_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={avgPrice}
      resultName={t.result}
      formatResult={x}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["price", "qty"], body: <div className="grid gap-3 sm:grid-cols-2">{f(t.priceQ, "price", input, edit)}{q(t.qty, "qty", input, edit)}</div> },
        { title: t.q2, keys: ["addPrice", "addQty", "market"], body: <div className="grid gap-3 sm:grid-cols-2">{f(t.addPrice, "addPrice", input, edit, true)}{q(t.addQty, "addQty", input, edit)}</div> },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          {f(t.price, "price", input, edit)}
          {q(t.qty, "qty", input, edit)}
          {f(t.addPrice, "addPrice", input, edit)}
          {q(t.addQty, "addQty", input, edit)}
          {f(t.market, "market", input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = avgResult(i);
        return [
          { label: t.avg, value: x(r.avg), tone: "primary" },
          { label: t.total, value: sh(r.qty) },
          { label: t.pl, value: s.money(r.pl) },
        ];
      }}
      sliders={["addQty", "addPrice"]}
      sweepCaption={(a) => (a.key === "addQty" ? t.sweep : undefined)}
      charts={(i) => (
        <CompareBars
          title={t.chart}
          items={[0.5, 1, 2].map((k) => ({ label: sh(Math.round(i.addQty * k)), value: avgPrice({ ...i, addQty: Math.round(i.addQty * k) }), current: k === 1 }))}
          format={x}
        />
      )}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = avgResult(i);
        return (
          <ResultSteps
            steps={[`${t.s1} = (${x(i.price)} × ${i.qty} + ${x(i.addPrice)} × ${i.addQty}) ÷ ${r.qty} = ${x(r.avg)}`, `${t.s2} = (${x(i.market)} − ${x(r.avg)}) × ${r.qty} = ${cashExact(r.pl, lang, cur)}`]}
            next={nextLinks(lang, ["roi-calculator", "compound-interest-calculator"])}
          />
        );
      }}
    />
  );
}
