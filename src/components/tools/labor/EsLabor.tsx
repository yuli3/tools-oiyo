// España: indemnización por despido, paro, SMI y plazo para demandar. Cálculo: lib/world-labor-pack-2026.ts
import { useState } from "react";
import { LABOR_AS_OF, esLaborExit } from "../../../lib/world-labor-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import LaborResult from "./LaborResult";

const TOOL_ID = "indemnizacion-despido-paro-plazos";
type T = "improcedente" | "objetivo";

export default function EsLabor() {
  const [x, setX] = useState({ type: "improcedente" as T, start: "2016-03-01", end: "2026-11-30", annual: 28_000, monthly: 1_300, days: 1_500, notified: "2026-11-30" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = esLaborExit({ start: x.start || "2016-03-01", end: x.end || "2026-11-30", annualSalary: x.annual, type: x.type, contributedDays: x.days, monthlySalary: x.monthly, notified: x.notified || undefined });
  return (
    <div className="space-y-5">
      <ChoiceChips<T> legend="Tipo de despido" value={x.type} options={[{ value: "improcedente", label: "Improcedente (33 días)" }, { value: "objetivo", label: "Objetivo (20 días)" }]} onChange={(v) => upd({ type: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="Fecha de alta" value={x.start} onChange={(v) => upd({ start: v })} />
        <DateField label="Fecha del despido" value={x.end} onChange={(v) => upd({ end: v })} />
        <NumberField label="Salario bruto anual" value={x.annual} onChange={(v) => upd({ annual: v })} suffix="€" step={500} />
        <NumberField label="Salario mensual (control SMI)" value={x.monthly} onChange={(v) => upd({ monthly: v })} suffix="€" step={10} />
        <NumberField label="Días cotizados en los últimos 6 años" value={x.days} onChange={(v) => upd({ days: v })} />
        <DateField label="Fecha de notificación del despido" value={x.notified} onChange={(v) => upd({ notified: v })} />
      </div>
      <LaborResult headline={`Indemnización: ${Math.round(r.indemnizacion).toLocaleString("es-ES")} €${r.paroDays ? ` · paro ${r.paroDays} días` : ""}`} sub={`Antigüedad: ${r.service.years} años y ${r.service.months} meses`} items={r.items} dates={r.dates} datesTitle="Plazos" note={`Información general y estimaciones según el BOE. No es asesoramiento jurídico; no le representamos ni presentamos nada. Actualizado: ${LABOR_AS_OF}. Sus datos se quedan en su navegador.`} />
    </div>
  );
}
