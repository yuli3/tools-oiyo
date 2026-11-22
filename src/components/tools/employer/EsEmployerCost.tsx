// Spain employer Social Security (contingencias comunes). Logic: lib/world-employer-cost-pack-2026.ts
import { useState } from "react";
import { EMPLOYER_AS_OF, ES_BASE_MAX, esEmployerCost, type EsGroup } from "../../../lib/world-employer-cost-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "coste-empresa-seguridad-social-2026";
const eur = (n: number) => `${n.toLocaleString("es-ES", { maximumFractionDigits: 2 })} €`;

export default function EsEmployerCost() {
  const [x, setX] = useState({ monthly: 2_000, group: 4 as EsGroup });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = esEmployerCost(x);
  return (
    <CurveShell toolId={TOOL_ID} lang="es" currency="EUR"
      curve={{ title: "Cuota de empresa por contingencias comunes según salario", caption: "23,60 % de la base, entre la mínima del grupo y la máxima de 5.101,20 €.", xLabel: "Salario mensual", yLabel: "Cuota empresa", min: 1_000, max: 8_000, step: 100, current: x.monthly, f: (v) => esEmployerCost({ ...x, monthly: v }).employer, formatX: eur, formatY: eur, onPick: (v) => upd({ monthly: v }), marks: [{ at: ES_BASE_MAX, label: "base máx." }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<"1" | "2" | "3" | "4"> legend="Grupo de cotización" value={String(x.group) as "1" | "2" | "3" | "4"} options={[{ value: "1", label: "Grupo 1" }, { value: "2", label: "Grupo 2" }, { value: "3", label: "Grupo 3" }, { value: "4", label: "Grupos 4 a 7" }]} onChange={(v) => upd({ group: Number(v) as EsGroup })} />
          <NumberField label="Salario bruto mensual (con prorrata de pagas)" value={x.monthly} onChange={(v) => upd({ monthly: v })} suffix="€" step={50} />
          <LaborResult mode={mode} headline={`Cuota de empresa ${eur(r.employer)} al mes (${r.ratio.toLocaleString("es-ES")} % del salario)`} sub={`Coste mínimo estimado ${eur(r.total)} al mes`} items={r.items} dates={r.lines.map((l) => ({ id: l.id, label: `${l.label} (${l.rate})`, date: eur(l.amount), cite: l.cite }))} datesTitle="Desglose (mes)" note={`Tipos y bases de la Orden PJC/297/2026 (BOE 31-3-2026), desde el 1 de enero de 2026. Régimen General, grupos 1 a 7. No es asesoramiento laboral. Actualizado ${EMPLOYER_AS_OF}. Lo que escribe no sale de su navegador.`} />
        </>
      )}
    </CurveShell>
  );
}
