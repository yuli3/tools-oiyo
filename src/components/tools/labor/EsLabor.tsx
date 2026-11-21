// España: indemnización por despido, paro, SMI y plazo para demandar. Cálculo: lib/world-labor-pack-2026.ts
import { useState } from "react";
import { LABOR_AS_OF, esLaborExit } from "../../../lib/world-labor-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import LaborResult from "./LaborResult";
import LaborShell, { startFor } from "./LaborShell";

const TOOL_ID = "indemnizacion-despido-paro-plazos";
type T = "improcedente" | "objetivo";

export default function EsLabor() {
  const [x, setX] = useState({ type: "improcedente" as T, start: "2016-03-01", end: "2026-11-30", annual: 28_000, monthly: 1_300, days: 1_500, notified: "2026-11-30" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = esLaborExit({ start: x.start || "2016-03-01", end: x.end || "2026-11-30", annualSalary: x.annual, type: x.type, contributedDays: x.days, monthlySalary: x.monthly, notified: x.notified || undefined });
  const end = x.end || "2026-11-30";
  const run = (y: number) => esLaborExit({ start: startFor(end, y), end, annualSalary: x.annual, type: x.type }).indemnizacion;
  return (
    <LaborShell
      toolId={TOOL_ID}
      lang="es"
      currency="EUR"
      curve={{
        title: "Indemnización según la antigüedad", caption: `Mismo salario y tipo de despido. La curva se aplana en el tope de ${x.type === "improcedente" ? "24" : "12"} mensualidades. El tramo anterior a 2012 no se dibuja.`,
        xLabel: "Antigüedad", yLabel: "Indemnización", min: 0, max: 30, step: 0.5, current: r.service.exactYears,
        f: run, formatX: (y) => `${y} años`, formatY: (n) => `${Math.round(n).toLocaleString("es-ES")} €`,
        onPick: (y) => upd({ start: startFor(end, y) }),
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<T> legend="Tipo de despido" value={x.type} options={[{ value: "improcedente", label: "Improcedente (33 días)" }, { value: "objetivo", label: "Objetivo (20 días)" }]} onChange={(v) => upd({ type: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="Fecha de alta" value={x.start} onChange={(v) => upd({ start: v })} />
        <DateField label="Fecha del despido" value={x.end} onChange={(v) => upd({ end: v })} />
        <NumberField label="Salario bruto anual" value={x.annual} onChange={(v) => upd({ annual: v })} suffix="€" step={500} />
        {mode === "expert" && <NumberField label="Salario mensual (control SMI)" value={x.monthly} onChange={(v) => upd({ monthly: v })} suffix="€" step={10} />}
        <NumberField label="Días cotizados en los últimos 6 años" value={x.days} onChange={(v) => upd({ days: v })} />
        <DateField label="Fecha de notificación del despido" value={x.notified} onChange={(v) => upd({ notified: v })} />
      </div>
      <LaborResult mode={mode} headline={`Indemnización: ${Math.round(r.indemnizacion).toLocaleString("es-ES")} €${r.paroDays ? ` · paro ${r.paroDays} días` : ""}`} sub={`Antigüedad: ${r.service.years} años y ${r.service.months} meses`} items={r.items} dates={r.dates} datesTitle="Plazos" note={`Información general y estimaciones según el BOE. No es asesoramiento jurídico; no le representamos ni presentamos nada. Actualizado: ${LABOR_AS_OF}. Sus datos se quedan en su navegador.`} />
    </>
      )}
    </LaborShell>
  );
}
