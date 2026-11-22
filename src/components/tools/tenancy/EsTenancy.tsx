// España: fianza, prórroga obligatoria, preaviso y actualización de renta. Cálculo: lib/world-tenancy-pack-2026.ts
import { useState } from "react";
import { TENANCY_AS_OF, esTenancy } from "../../../lib/world-tenancy-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "fianza-alquiler-preaviso-actualizacion";

export default function EsTenancy() {
  const [x, setX] = useState({ rent: 900, fianza: 900, extraGuarantee: 0, start: "2026-03-01", company: false, keysReturned: "", noticeDate: "2026-11-30" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = esTenancy({ ...x, start: x.start || undefined, keysReturned: x.keysReturned || undefined, noticeDate: x.noticeDate || undefined });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="es"
      currency="EUR"
      curve={{
        title: "Cuándo termina el contrato según el mes en que avisa", caption: "Puede desistir con 30 días de preaviso, pero no antes de 6 meses de contrato.",
        xLabel: "Mes de contrato en que avisa", yLabel: "Mes en que termina", min: 0, max: 18, step: 1, current: 6,
        f: (m) => Math.max(m + 1, 6), formatX: (m) => `mes ${Math.round(m)}`, formatY: (n) => `mes ${Math.round(n)}`,
        onPick: () => {}, marks: [{ at: 6, label: "6 meses" }],
      }}
    >
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Renta mensual" value={x.rent} onChange={(v) => upd({ rent: v })} suffix="€" step={10} />
        <NumberField label="Fianza en metálico" value={x.fianza} onChange={(v) => upd({ fianza: v })} suffix="€" step={10} />
        <DateField label="Inicio del contrato" value={x.start} onChange={(v) => upd({ start: v })} />
        <DateField label="Fecha en que avisa que se va" value={x.noticeDate} onChange={(v) => upd({ noticeDate: v })} />
        {mode === "expert" && <NumberField label="Garantía adicional (aval, depósito)" value={x.extraGuarantee} onChange={(v) => upd({ extraGuarantee: v })} suffix="€" step={10} />}
        {mode === "expert" && <DateField label="Entrega de llaves" value={x.keysReturned} onChange={(v) => upd({ keysReturned: v })} />}
      </div>
      <ChoiceChips<"p" | "e"> legend="Arrendador" value={x.company ? "e" : "p"} options={[{ value: "p", label: "Persona física (5 años)" }, { value: "e", label: "Persona jurídica (7 años)" }]} onChange={(v) => upd({ company: v === "e" })} />
      <LaborResult mode={mode} headline={`Actualización máxima sin nuevo acuerdo: ${r.max2.toLocaleString("es-ES")} € (2 %)`} sub={`Prórroga obligatoria: ${r.years} años`} items={r.items} dates={r.dates} datesTitle="Fechas" note={`Información general según la Ley de Arrendamientos Urbanos (BOE) y el INE. No es asesoramiento jurídico. Actualizado: ${TENANCY_AS_OF}. Sus datos no salen del navegador.`} />
    </>
      )}
    </CurveShell>
  );
}
