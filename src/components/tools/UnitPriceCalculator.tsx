import { useState, type CSSProperties } from "react";
import type { Locale } from "../../lib/i18n";

interface UiLabels {
  item: string;
  price: string;
  amount: string;
  unit: string;
  unitPrice: string;
  add: string;
  best: string;
  perUnit: string;
}

const L: Record<string, UiLabels> = {
  en: { item: "Item", price: "Price", amount: "Amount", unit: "Unit", unitPrice: "Unit price", add: "+ Add item", best: "Best value", perUnit: "per" },
  ko: { item: "상품", price: "가격", amount: "용량", unit: "단위", unitPrice: "단위가격", add: "+ 상품 추가", best: "최저가", perUnit: "당" },
  ja: { item: "商品", price: "価格", amount: "容量", unit: "単位", unitPrice: "単価", add: "+ 商品を追加", best: "最安", perUnit: "あたり" },
  zh: { item: "商品", price: "价格", amount: "容量", unit: "单位", unitPrice: "单价", add: "+ 添加商品", best: "最划算", perUnit: "每" },
  fr: { item: "Article", price: "Prix", amount: "Quantité", unit: "Unité", unitPrice: "Prix unitaire", add: "+ Ajouter", best: "Meilleur prix", perUnit: "par" },
  es: { item: "Artículo", price: "Precio", amount: "Cantidad", unit: "Unidad", unitPrice: "Precio unitario", add: "+ Añadir", best: "Mejor precio", perUnit: "por" },
};

interface Row {
  name: string;
  price: string;
  amount: string;
  unit: string;
}

interface Props {
  locale: Locale;
}

function round(n: number): number {
  if (!isFinite(n)) return 0;
  return Math.round(n * 1000) / 1000;
}

// Item, price, quantity, unit and remove-button columns.
const UNIT_COLS = { '--cols': '3rem 1fr 1fr 3rem auto' } as CSSProperties;

export default function UnitPriceCalculator({ locale }: Props) {
  const t = L[locale] ?? L.en;
  const [rows, setRows] = useState<Row[]>([
    { name: "A", price: "3000", amount: "500", unit: "g" },
    { name: "B", price: "5000", amount: "1000", unit: "g" },
  ]);

  const unitPrice = (r: Row): number => {
    const p = parseFloat(r.price);
    const a = parseFloat(r.amount);
    return a > 0 && isFinite(p) ? p / a : NaN;
  };
  const valid = rows.map(unitPrice).filter((n) => isFinite(n) && n > 0);
  const min = valid.length ? Math.min(...valid) : NaN;

  const update = (i: number, key: keyof Row, val: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const add = () => setRows((prev) => [...prev, { name: "", price: "", amount: "", unit: prev[0]?.unit ?? "" }]);
  const remove = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const inputCls =
    "min-h-11 w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-base text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-primary";

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="space-y-2">
        <div style={UNIT_COLS} className="hidden gap-2 text-xs sm:grid sm:grid-cols-(--cols) font-bold uppercase tracking-wider text-muted-foreground">
          <span>{t.item}</span>
          <span>{t.price}</span>
          <span>{t.amount}</span>
          <span>{t.unit}</span>
          <span>{t.unitPrice}</span>
        </div>
        {rows.map((r, i) => {
          const up = unitPrice(r);
          const isBest = isFinite(up) && up > 0 && up === min && valid.length > 1;
          return (
            <div key={i} style={UNIT_COLS} className="grid grid-cols-2 items-center gap-2 border-b border-border pb-3 sm:grid-cols-(--cols) sm:border-0 sm:pb-0">
              <input value={r.name} onChange={(e) => update(i, "name", e.target.value)} aria-label={t.item} placeholder={t.item} className={inputCls} />
              <input type="number" inputMode="decimal" value={r.price} onChange={(e) => update(i, "price", e.target.value)} aria-label={t.price} placeholder={t.price} className={inputCls} />
              <input type="number" inputMode="decimal" value={r.amount} onChange={(e) => update(i, "amount", e.target.value)} aria-label={t.amount} placeholder={t.amount} className={inputCls} />
              <input value={r.unit} onChange={(e) => update(i, "unit", e.target.value)} aria-label={t.unit} placeholder={t.unit} className={inputCls} />
              <span className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:justify-start">
                <span className={`font-mono text-sm font-semibold ${isBest ? "text-primary" : "text-foreground"}`}>
                  {isFinite(up) ? `${round(up)}/${r.unit || "?"}` : "—"}
                  {isBest && <span className="ml-1 rounded bg-muted px-1 text-xs font-bold text-primary">{t.best}</span>}
                </span>
                <button type="button" onClick={() => remove(i)} aria-label="remove" className="inline-flex size-11 items-center justify-center text-muted-foreground hover:text-destructive">
                  ×
                </button>
              </span>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={add} className="mt-4 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-muted">
        {t.add}
      </button>
    </div>
  );
}
