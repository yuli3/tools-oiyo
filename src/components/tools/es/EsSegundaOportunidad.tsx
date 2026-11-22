// Ley de Segunda Oportunidad (buena fe) and Impuesto sobre Sucesiones deadline. Logic: lib/world-fresh-start-2026.ts
import { useState } from "react";
import { FRESH_START_AS_OF, esInheritanceDeadline, esSecondChance } from "../../../lib/world-fresh-start-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

type T = "deudas" | "herencia";
type YN = "no" | "yes";
type Prior = "none" | "plan" | "liquidation";
const TOOL_ID = "segunda-oportunidad-plazo-sucesiones";
const YESNO: { value: YN; label: string }[] = [{ value: "no", label: "No" }, { value: "yes", label: "Sí" }];
const plus = (s: string, d: number) => new Date(Date.parse(`${s}T00:00:00Z`) + d * 86_400_000).toISOString().slice(0, 10);
const diff = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export default function EsSegundaOportunidad() {
  const [x, setX] = useState({ topic: "deudas" as T, conv: "no" as YN, sanc: "no" as YN, culp: "no" as YN, prior: "none" as Prior, priorDate: "2024-01-15", death: "2026-09-15", today: FRESH_START_AS_OF });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const debt = x.topic === "deudas";
  const s = esSecondChance({ conviction10y: x.conv === "yes", severeSanction10y: x.sanc === "yes", culpable: x.culp === "yes", priorExoneration: x.prior, priorDate: x.priorDate, today: x.today });
  const h = esInheritanceDeadline({ death: x.death, today: x.today });
  const since = Math.max(0, diff(x.death, x.today));
  const curve = { title: "Días que quedan para presentar Sucesiones", caption: "Plazo de 6 meses desde el fallecimiento.", xLabel: "Días desde el fallecimiento", yLabel: "Días que quedan", min: 0, max: 240, step: 1, current: since, f: (v: number) => (h.ok ? Math.max(0, diff(plus(x.death, Math.round(v)), h.deadline)) : 0), formatX: (n: number) => `${Math.round(n)}`, formatY: (n: number) => `${Math.round(n)}`, onPick: (v: number) => upd({ today: plus(x.death, Math.round(v)) }), marks: [] };
  return (
    <CurveShell toolId={TOOL_ID} lang="es" currency="EUR" curve={curve}>
      {(mode) => (
        <>
          <ChoiceChips<T> legend="¿Qué quieres comprobar?" value={x.topic} options={[{ value: "deudas", label: "Segunda oportunidad (deudas)" }, { value: "herencia", label: "Plazo del Impuesto sobre Sucesiones" }]} onChange={(v) => upd({ topic: v })} />
          {debt ? (
            <>
              <ChoiceChips<YN> legend="¿Condena firme a prisión en los últimos 10 años por delitos patrimoniales, contra Hacienda o la Seguridad Social, falsedad documental o contra los trabajadores?" value={x.conv} options={YESNO} onChange={(v) => upd({ conv: v })} />
              <ChoiceChips<YN> legend="¿Sanción firme en los últimos 10 años por infracción tributaria muy grave, o de Seguridad Social u orden social?" value={x.sanc} options={YESNO} onChange={(v) => upd({ sanc: v })} />
              <ChoiceChips<YN> legend="¿Concurso declarado culpable?" value={x.culp} options={YESNO} onChange={(v) => upd({ culp: v })} />
              <ChoiceChips<Prior> legend="¿Exoneración anterior?" value={x.prior} options={[{ value: "none", label: "No" }, { value: "plan", label: "Con plan de pagos" }, { value: "liquidation", label: "Con liquidación" }]} onChange={(v) => upd({ prior: v })} />
              {x.prior !== "none" && <DateField label="Fecha de la exoneración anterior" value={x.priorDate} onChange={(v) => upd({ priorDate: v })} />}
              <LaborResult mode={mode} headline={s.eligible ? "No aparece ningún impedimento de buena fe" : `Hay ${s.blocks.length} impedimento(s)`} sub="Ley de Segunda Oportunidad (exoneración del pasivo insatisfecho)" items={s.items as never} dates={[]} datesTitle="" note={`Información general, no es asesoramiento jurídico. Actualizado ${FRESH_START_AS_OF}. Lo que escribes se queda en tu navegador.`} />
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <DateField label="Fecha del fallecimiento" value={x.death} onChange={(v) => upd({ death: v })} />
                <DateField label="Hoy" value={x.today} onChange={(v) => upd({ today: v })} />
              </div>
              {h.ok ? <LaborResult mode={mode} headline={`Plazo: ${h.deadline}`} sub={h.passed ? "El plazo ya ha pasado" : `Quedan ${Math.max(0, diff(x.today, h.deadline))} días`} items={h.items as never} dates={[]} datesTitle="" note={`Información general. Actualizado ${FRESH_START_AS_OF}.`} /> : <LaborResult mode={mode} headline="Falta un dato" sub={h.error} items={[]} dates={[]} datesTitle="" note="" />}
            </>
          )}
        </>
      )}
    </CurveShell>
  );
}
