// IVA y recargo de equivalencia. Cálculo: lib/es-tax-pack-2026.ts
import { useState } from "react";
import { ES_TAX_AS_OF, ES_TAX_NOTE, esIva, type IvaTipo } from "../../../lib/es-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "iva-tipos-recargo-equivalencia";
type YN = "y" | "n";
type T = "21" | "10" | "4";

export default function EsIva() {
  const [x, setX] = useState({ base: 1_000, tipo: "21" as T, rec: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = esIva({ base: x.base, tipo: Number(x.tipo) as IvaTipo, recargo: x.rec === "y" });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="es"
      currency="EUR"
      curve={{
        title: "Total de la factura según la base imponible", caption: "Mismo tipo de IVA y recargo.",
        xLabel: "Base imponible", yLabel: "Total", min: 0, max: 10000, step: 100, current: x.base,
        f: (v) => esIva({ base: v, tipo: Number(x.tipo) as IvaTipo, recargo: x.rec === "y" }).total, formatX: (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`, formatY: (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`,
        onPick: (v) => upd({ base: v }), marks: [],
      }}
    >
      {() => (
    <>
      <NumberField label="Base imponible" value={x.base} onChange={(v) => upd({ base: v })} suffix="€" step={100} />
      <ChoiceChips<T> legend="Tipo de IVA" value={x.tipo} options={[{ value: "21", label: "21 % general" }, { value: "10", label: "10 % reducido" }, { value: "4", label: "4 % superreducido" }]} onChange={(v) => upd({ tipo: v })} />
      <ChoiceChips<YN> legend="¿El cliente es un comerciante minorista en recargo de equivalencia?" value={x.rec} options={[{ value: "y", label: "Sí" }, { value: "n", label: "No" }]} onChange={(v) => upd({ rec: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">Total factura: {r.total.toLocaleString("es-ES")} €</p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{ES_TAX_NOTE} Actualizado el {ES_TAX_AS_OF}.</p>
    </>
      )}
    </CurveShell>
  );
}
