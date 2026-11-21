// France : indemnité légale de licenciement, congés, SMIC, rupture conventionnelle et délais prud'hommes. Calcul : lib/world-labor-pack-2026.ts
import { useState } from "react";
import { LABOR_AS_OF, frLaborExit } from "../../../lib/world-labor-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import LaborResult from "./LaborResult";
import LaborShell, { startFor } from "./LaborShell";

const TOOL_ID = "indemnite-licenciement-delais-prudhommes";
type M = "licenciement" | "rupture";

export default function FrLabor() {
  const [x, setX] = useState({ mode: "licenciement" as M, start: "2012-09-01", end: "2026-11-30", ref: 2_800, hourly: 13, signed: "2026-11-21", notified: "2026-11-21" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frLaborExit({ start: x.start || "2012-09-01", end: x.end || "2026-11-30", monthlyReference: x.ref, hourlyGross: x.hourly, mode: x.mode, signed: x.signed || undefined, notified: x.notified || undefined });
  const end = x.end || "2026-11-30";
  const run = (y: number) => frLaborExit({ start: startFor(end, y), end, monthlyReference: x.ref }).indemnite;
  return (
    <LaborShell
      toolId={TOOL_ID}
      lang="fr"
      currency="EUR"
      curve={{
        title: "Indemnité légale selon l'ancienneté", caption: "Même salaire de référence. Rien avant 8 mois ; 1/4 de mois par an jusqu'à 10 ans, 1/3 au-delà.",
        xLabel: "Ancienneté", yLabel: "Indemnité légale", min: 0, max: 30, step: 0.5, current: r.service.exactYears,
        f: run, formatX: (y) => `${y} ans`, formatY: (n) => `${Math.round(n).toLocaleString("fr-FR")} €`,
        onPick: (y) => upd({ start: startFor(end, y) }), marks: [{ at: 10, label: "10 ans" }],
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<M> legend="Fin du contrat" value={x.mode} options={[{ value: "licenciement", label: "Licenciement" }, { value: "rupture", label: "Rupture conventionnelle" }]} onChange={(v) => upd({ mode: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="Date d'entrée" value={x.start} onChange={(v) => upd({ start: v })} />
        <DateField label="Fin du contrat" value={x.end} onChange={(v) => upd({ end: v })} />
        <NumberField label="Salaire mensuel brut de référence" value={x.ref} onChange={(v) => upd({ ref: v })} suffix="€" step={50} />
        {mode === "expert" && <NumberField label="Salaire horaire brut (contrôle SMIC)" value={x.hourly} onChange={(v) => upd({ hourly: v })} suffix="€" step={0.1} />}
        {x.mode === "rupture" ? <DateField label="Date de signature de la convention" value={x.signed} onChange={(v) => upd({ signed: v })} /> : <DateField label="Date de notification du licenciement" value={x.notified} onChange={(v) => upd({ notified: v })} />}
      </div>
      <LaborResult mode={mode} headline={`Indemnité légale minimale : ${Math.round(r.indemnite).toLocaleString("fr-FR")} €`} sub={`Ancienneté : ${r.service.years} ans ${r.service.months} mois`} items={r.items} dates={r.dates} datesTitle="Délais" note={`Informations générales et estimations d'après service-public.gouv.fr. Ce n'est pas un conseil juridique ; nous ne vous représentons pas et ne déposons rien. Mise à jour : ${LABOR_AS_OF}. Vos données restent dans votre navigateur.`} />
    </>
      )}
    </LaborShell>
  );
}
