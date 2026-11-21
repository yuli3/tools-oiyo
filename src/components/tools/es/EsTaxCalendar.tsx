// Calendario fiscal España (2026-11-21, localización por país: España). Cálculo: lib/es-tax-pack-2026.ts
import { useState } from "react";
import { ES_TAX_AS_OF, ES_TAX_NOTE, esTaxCalendar } from "../../../lib/es-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items, useToday } from "../nts/Items";

const TOOL_ID = "calendario-fiscal-autonomos-2026";
type YN = "y" | "n";
type Pago = "130" | "131" | "none";
const yn = [{ value: "y", label: "Sí" }, { value: "n", label: "No" }] as const;

export default function EsTaxCalendar() {
  const today = useToday();
  const [x, setX] = useState({ year: 2026, iva: "y" as YN, pago: "130" as Pago, ret: "n" as YN, soc: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = esTaxCalendar({ year: x.year, iva: x.iva === "y", pago: x.pago, retenciones: x.ret === "y", sociedad: x.soc === "y", today });
  return (
    <div className="space-y-5">
      <NumberField label="Año" value={x.year} onChange={(v) => upd({ year: Math.min(2030, Math.max(2025, Math.round(v) || 2026)) })} />
      <ChoiceChips<YN> legend="¿Presentas IVA trimestral (modelo 303)?" value={x.iva} options={yn} onChange={(v) => upd({ iva: v })} />
      <ChoiceChips<Pago> legend="Pago fraccionado del IRPF" value={x.pago} options={[{ value: "130", label: "Modelo 130 (estimación directa)" }, { value: "131", label: "Modelo 131 (módulos)" }, { value: "none", label: "No presento" }]} onChange={(v) => upd({ pago: v })} />
      <ChoiceChips<YN> legend="¿Practicas retenciones (111) o alquilas un local (115)?" value={x.ret} options={yn} onChange={(v) => upd({ ret: v })} />
      <ChoiceChips<YN> legend="¿Sociedad en el Impuesto sobre Sociedades (ejercicio = año natural)?" value={x.soc} options={yn} onChange={(v) => upd({ soc: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <ol className="space-y-3">
          {r.events.map((e) => (
            <li key={e.id}>
              <p className="font-semibold text-foreground"><span className="font-mono">{e.date ?? e.month}{e.until ? ` → ${e.until}` : ""}</span>{e.daysLeft != null && <span className="ml-2 font-normal text-muted-foreground">{e.daysLeft >= 0 ? `faltan ${e.daysLeft} días` : `hace ${-e.daysLeft} días`}</span>}</p>
              <p>{e.label} <span className="text-xs text-muted-foreground">({e.cite})</span></p>
            </li>
          ))}
        </ol>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{ES_TAX_NOTE} Actualizado el {ES_TAX_AS_OF}. Los datos se quedan en tu navegador.</p>
    </div>
  );
}
