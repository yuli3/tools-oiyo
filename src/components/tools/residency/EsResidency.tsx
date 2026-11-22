// Spain residencia fiscal: 183 días y núcleo de intereses. Logic: lib/world-tax-residency-2026.ts
import { useState } from "react";
import { RESIDENCY_AS_OF, esResidency } from "../../../lib/world-tax-residency-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "residencia-fiscal-espana-183-dias";
type YN = "y" | "n";

export default function EsResidency() {
  const [x, setX] = useState({ days: 150, eco: "n" as YN, family: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const input = { economicCentre: x.eco === "y", familyInSpain: x.family === "y" };
  const r = esResidency({ days: x.days, ...input });
  return (
    <CurveShell toolId={TOOL_ID} lang="es" currency="EUR"
      curve={{ title: "Residente o no según los días en España", caption: "1 = residente, 0,5 = presunción por la familia, 0 = no residente.", xLabel: "Días en España en el año natural", yLabel: "Residencia", min: 0, max: 366, step: 1, current: x.days, f: (v) => { const t = esResidency({ days: v, ...input }).verdict; return t === "resident" ? 1 : t === "depends" ? 0.5 : 0; }, formatX: (n) => `${Math.round(n)} d`, formatY: (n) => (n >= 1 ? "sí" : n > 0 ? "presunción" : "no"), onPick: (v) => upd({ days: v }), marks: [{ at: 184, label: "184" }] }}
    >
      {(mode) => (
        <>
          <NumberField label="Días en España este año (incluye ausencias esporádicas)" value={x.days} onChange={(v) => upd({ days: v })} step={1} />
          <ChoiceChips<YN> legend="¿Está en España el núcleo principal de sus actividades o intereses económicos?" value={x.eco} options={[{ value: "n", label: "No" }, { value: "y", label: "Sí" }]} onChange={(v) => upd({ eco: v })} />
          <ChoiceChips<YN> legend="¿Residen en España su cónyuge no separado y sus hijos menores dependientes?" value={x.family} options={[{ value: "n", label: "No" }, { value: "y", label: "Sí" }]} onChange={(v) => upd({ family: v })} />
          <LaborResult mode={mode} headline={r.verdict === "resident" ? "Residente fiscal en España este año" : r.verdict === "depends" ? "Se presume residente (admite prueba en contrario)" : "No residente fiscal en España según estos datos"} items={r.items} dates={[]} datesTitle="" note={`Según la Agencia Tributaria (persona física residente en España). No es asesoramiento fiscal. Actualizado ${RESIDENCY_AS_OF}. Lo que escribe no sale de su navegador.`} />
        </>
      )}
    </CurveShell>
  );
}
