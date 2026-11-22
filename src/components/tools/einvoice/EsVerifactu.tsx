// Spain VERI*FACTU deadline. Logic: lib/world-einvoice-pack-2026.ts
import { useState } from "react";
import { EINVOICE_AS_OF, esVerifactu } from "../../../lib/world-einvoice-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "verifactu-plazo-obligatorio-2027";
const START = Date.UTC(2026, 6, 1);
const monthToDate = (m: number) => { const d = new Date(START); d.setUTCMonth(d.getUTCMonth() + Math.round(m)); return d.toISOString().slice(0, 10); };
const dateToMonth = (s: string) => { const d = new Date(Date.parse(s)); return Number.isNaN(d.getTime()) ? 0 : (d.getUTCFullYear() - 2026) * 12 + d.getUTCMonth() - 6; };
type YN = "y" | "n";

export default function EsVerifactu() {
  const [x, setX] = useState({ soc: "n" as YN, sii: "n" as YN, soft: "y" as YN, today: "2026-11-22" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const input = { sociedades: x.soc === "y", sii: x.sii === "y", usesSoftware: x.soft === "y" };
  const r = esVerifactu({ ...input, today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="es" currency="EUR"
      curve={{ title: "¿Ya es obligatorio según la fecha?", caption: "1 = el software de facturación debe cumplir; 0 = todavía no.", xLabel: "Mes", yLabel: "Obligatorio", min: 0, max: 18, step: 1, current: Math.max(0, Math.min(18, dateToMonth(x.today))), f: (m) => (esVerifactu({ ...input, today: monthToDate(m) }).inForce ? 1 : 0), formatX: (m) => monthToDate(m).slice(0, 7), formatY: (n) => (n ? "sí" : "no"), onPick: (m) => upd({ today: monthToDate(m) }), marks: [{ at: 6, label: "1/1/2027" }, { at: 12, label: "1/7/2027" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<YN> legend="¿Tributa por el Impuesto sobre Sociedades?" value={x.soc} options={[{ value: "y", label: "Sí (sociedad)" }, { value: "n", label: "No (autónomo u otro)" }]} onChange={(v) => upd({ soc: v })} />
          <ChoiceChips<YN> legend="¿Factura con un programa informático?" value={x.soft} options={[{ value: "y", label: "Sí" }, { value: "n", label: "No" }]} onChange={(v) => upd({ soft: v })} />
          <ChoiceChips<YN> legend="¿Ya está en el SII?" value={x.sii} options={[{ value: "n", label: "No" }, { value: "y", label: "Sí" }]} onChange={(v) => upd({ sii: v })} />
          {mode === "expert" && <DateField label="Fecha a comprobar" value={x.today} onChange={(v) => upd({ today: v })} />}
          <LaborResult mode={mode} headline={r.applies ? `Su software debe cumplir antes del ${r.due}` : "No le afecta según sus respuestas"} items={r.items} dates={r.dates} datesTitle="Plazo" note={`Según el folleto VERI*FACTU de la Agencia Tributaria. Información general, no asesoramiento fiscal. Actualizado ${EINVOICE_AS_OF}. Lo que escribe no sale de su navegador.`} />
        </>
      )}
    </CurveShell>
  );
}
