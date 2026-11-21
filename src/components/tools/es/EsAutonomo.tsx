// Cuota de autónomos por tramos e IRPF estimado. Cálculo: lib/es-tax-pack-2026.ts
import { useState } from "react";
import { ES_TAX_AS_OF, ES_TAX_NOTE, RETA_TRAMOS_2026, esAutonomo } from "../../../lib/es-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "cuota-autonomos-tramos-irpf";
const eur = (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`;
type YN = "y" | "n";

export default function EsAutonomo() {
  const [x, setX] = useState({ net: 1_800, ingresos: 36_000, gastos: 9_000, nuevo: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = esAutonomo({ netMonthly: x.net, ingresos: x.ingresos, gastos: x.gastos, nuevo: x.nuevo === "y" });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="es"
      currency="EUR"
      curve={{
        title: "Cuota mínima mensual según los rendimientos netos", caption: "Tabla de tramos 2026: la cuota sube por escalones.",
        xLabel: "Rendimiento neto mensual", yLabel: "Cuota mínima", min: 0, max: 7000, step: 50, current: x.net,
        f: (v) => esAutonomo({ netMonthly: v, ingresos: x.ingresos, gastos: x.gastos, nuevo: x.nuevo === "y" }).cuotaMin, formatX: (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`, formatY: (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`,
        onPick: (v) => upd({ net: v }), marks: [],
      }}
    >
      {() => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Rendimiento neto mensual previsto (Seguridad Social)" value={x.net} onChange={(v) => upd({ net: v })} suffix="€" step={50} />
        <NumberField label="Ingresos anuales sin IVA" value={x.ingresos} onChange={(v) => upd({ ingresos: v })} suffix="€" step={1000} />
        <NumberField label="Gastos deducibles anuales (incluida tu cuota)" value={x.gastos} onChange={(v) => upd({ gastos: v })} suffix="€" step={500} />
      </div>
      <ChoiceChips<YN> legend="¿Inicias la actividad (primer alta o sin alta en 2 años)?" value={x.nuevo} options={[{ value: "y", label: "Sí" }, { value: "n", label: "No" }]} onChange={(v) => upd({ nuevo: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">Cuota mínima del tramo {r.tramo.n}: unos {r.cuotaMin.toLocaleString("es-ES")} € al mes</p>
        <progress className="mt-2 h-2 w-full accent-(--primary)" max={RETA_TRAMOS_2026.length} value={r.tramo.n} aria-label={`Tramo ${r.tramo.n} de ${RETA_TRAMOS_2026.length}`} />
        {r.irpf && <p className="mt-3">IRPF aproximado del año: <strong>{eur(r.irpf.cuota)}</strong> sobre una base de {eur(r.irpf.base)}. Retenciones en factura: {eur(r.irpf.retencion)} → {r.irpf.diferencia >= 0 ? `a pagar unos ${eur(r.irpf.diferencia)}` : `a devolver unos ${eur(-r.irpf.diferencia)}`} (antes de pagos fraccionados).</p>}
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{ES_TAX_NOTE} Actualizado el {ES_TAX_AS_OF}.</p>
    </>
      )}
    </CurveShell>
  );
}
