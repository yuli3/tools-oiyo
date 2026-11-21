// Amortización según la tabla oficial del Impuesto sobre Sociedades. Cálculo: lib/es-tax-pack-2026.ts
import { useState } from "react";
import { ES_TAX_AS_OF, ES_TAX_NOTE, TABLA_LIS, esAmortizacion, type Elemento } from "../../../lib/es-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "amortizacion-tablas-oficiales";
type YN = "y" | "n";

export default function EsAmortizacion() {
  const [x, setX] = useState({ el: "equipos-informaticos" as Elemento, coste: 1_800, inicio: "2026-03-01", coef: 25, nuevo: "y" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = esAmortizacion({ elemento: x.el, coste: x.coste, inicio: x.inicio || "2026-01-01", coef: x.coef / 100, nuevo: x.nuevo === "y" });
  const max = Math.max(1, ...r.schedule.map((s) => s.amount));
  return (
    <div className="space-y-5">
      <ChoiceChips<Elemento> legend="Elemento" value={x.el} options={(Object.keys(TABLA_LIS) as Elemento[]).map((k) => ({ value: k, label: TABLA_LIS[k].label }))} onChange={(v) => upd({ el: v, coef: Math.round(TABLA_LIS[v].coef * 100) })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Precio de adquisición (sin IVA)" value={x.coste} onChange={(v) => upd({ coste: v })} suffix="€" step={100} />
        <DateField label="Puesta en funcionamiento" value={x.inicio} onChange={(v) => upd({ inicio: v })} />
        <NumberField label="Coeficiente elegido" value={x.coef} onChange={(v) => upd({ coef: v })} suffix="%" step={1} />
      </div>
      <ChoiceChips<YN> legend="¿Es un elemento nuevo?" value={x.nuevo} options={[{ value: "y", label: "Sí" }, { value: "n", label: "No, usado" }]} onChange={(v) => upd({ nuevo: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">Coeficiente aplicado: {(r.coef * 100).toLocaleString("es-ES")} % (entre {(r.minCoef * 100).toLocaleString("es-ES")} % y {(r.maxCoef * 100).toLocaleString("es-ES")} %)</p>
        <ul className="mt-3 space-y-1">
          {r.schedule.map((s) => (
            <li key={s.year} className="flex items-center gap-2">
              <span className="w-12 shrink-0 font-mono">{s.year}</span>
              <progress className="h-2 w-full accent-(--primary)" max={max} value={s.amount} aria-label={`${s.year}`} />
              <span className="w-24 shrink-0 text-right font-mono">{s.amount.toLocaleString("es-ES")} €</span>
            </li>
          ))}
        </ul>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{ES_TAX_NOTE} Actualizado el {ES_TAX_AS_OF}.</p>
    </div>
  );
}
