// Intérêt de retard, majorations et délai de réclamation. Calcul : lib/fr-tax-pack-2026.ts
import { useState } from "react";
import { FR_TAX_AS_OF, FR_TAX_NOTE, MAJORATIONS, frClaimDeadline, frPenalty, type Fault } from "../../../lib/fr-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell, { plusMonths } from "../viz/CurveShell";

const TOOL_ID = "interet-de-retard-majoration";
const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;
type YN = "y" | "n";

export default function FrPenalty() {
  const [x, setX] = useState({ tax: 5_000, fault: "retard" as Fault, due: "2027-05-28", paid: "2027-09-30", ir: "n" as YN, year: 2026, local: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frPenalty({ tax: x.tax, fault: x.fault, due: x.due || undefined, paid: x.paid || undefined, incomeTax: x.ir === "y" });
  const c = frClaimDeadline({ eventYear: x.year, local: x.local === "y" });
  const due = x.due || "2027-05-28";
  const lateMonths = x.paid ? Math.max(0, Math.round((Date.parse(x.paid) - Date.parse(due)) / (30.44 * 86_400_000))) : 0;
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="fr"
      currency="EUR"
      curve={{
        title: "Intérêt de retard et majoration selon le nombre de mois de retard", caption: "Même impôt et même manquement. L'intérêt de retard est de 0,20 % par mois.",
        xLabel: "Mois de retard", yLabel: "Total", min: 0, max: 24, step: 1, current: lateMonths,
        f: (m) => frPenalty({ tax: x.tax, fault: x.fault, due, paid: plusMonths(due, m), incomeTax: x.ir === "y" }).total, formatX: (m) => `${m} mois`, formatY: (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`,
        onPick: (m) => upd({ paid: plusMonths(due, m) }), marks: [],
      }}
    >
      {() => (
    <>
      <ChoiceChips<Fault> legend="Situation" value={x.fault} options={(Object.keys(MAJORATIONS) as Fault[]).map((k) => ({ value: k, label: MAJORATIONS[k].label }))} onChange={(v) => upd({ fault: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Droits dus (impôt non payé à temps)" value={x.tax} onChange={(v) => upd({ tax: v })} suffix="€" step={100} />
        <DateField label="Date limite de paiement" value={x.due} onChange={(v) => upd({ due: v })} />
        <DateField label="Date de paiement" value={x.paid} onChange={(v) => upd({ paid: v })} />
      </div>
      <ChoiceChips<YN> legend="S'agit-il de l'impôt sur le revenu ?" value={x.ir} options={[{ value: "y", label: "Oui" }, { value: "n", label: "Non (TVA, IS, autre)" }]} onChange={(v) => upd({ ir: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">Environ {eur(r.total)} en plus des droits (estimation)</p>
        <Items items={r.items} />
      </div>
      <section className="space-y-3 rounded-md border border-border bg-card px-4 py-4 text-sm">
        <h3 className="font-semibold">Contester un impôt : délai de réclamation</h3>
        <NumberField label="Année de la mise en recouvrement, du paiement ou de l'événement" value={x.year} onChange={(v) => upd({ year: Math.round(v) || 2026 })} />
        <ChoiceChips<YN> legend="Impôt direct local (taxe foncière, CFE…) ?" value={x.local} options={[{ value: "y", label: "Oui" }, { value: "n", label: "Non" }]} onChange={(v) => upd({ local: v })} />
        <ul className="space-y-2">{c.map((a) => <li key={a.id}>{a.date && <span className="font-mono font-semibold">{a.date} </span>}{a.label} <span className="text-xs text-muted-foreground">({a.cite})</span></li>)}</ul>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">{FR_TAX_NOTE} À jour au {FR_TAX_AS_OF}.</p>
    </>
      )}
    </CurveShell>
  );
}
