// Amortissement linéaire et dégressif. Calcul : lib/fr-tax-pack-2026.ts
import { useState } from "react";
import { FR_TAX_AS_OF, FR_TAX_NOTE, frAmortissement } from "../../../lib/fr-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "amortissement-lineaire-degressif";
const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;
type M = "lineaire" | "degressif";
type YN = "y" | "n";

export default function FrAmortissement() {
  const [x, setX] = useState({ cost: 10_000, life: 5, start: "2026-04-10", method: "lineaire" as M, small: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frAmortissement({ cost: x.cost, life: x.life, start: x.start || "2026-01-01", method: x.method, toolUnder500: x.small === "y" });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="fr"
      currency="EUR"
      curve={{
        title: "Dotation de la première année selon la durée d'utilisation", caption: "Même coût et même date de mise en service.",
        xLabel: "Durée", yLabel: "Dotation de la 1re année", min: 3, max: 10, step: 1, current: x.life,
        f: (v) => frAmortissement({ cost: x.cost, life: v, start: x.start || "2026-01-01", method: x.method, toolUnder500: x.small === "y" }).schedule[0]?.amount ?? 0, formatX: (v) => `${v} ans`, formatY: (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`,
        onPick: (v) => upd({ life: v }), marks: [],
      }}
    >
      {() => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Valeur d'origine HT" value={x.cost} onChange={(v) => upd({ cost: v })} suffix="€" step={100} />
        <NumberField label="Durée d'utilisation" value={x.life} onChange={(v) => upd({ life: v })} suffix="ans" />
        <DateField label="Date d'acquisition ou de mise en service" value={x.start} onChange={(v) => upd({ start: v })} />
      </div>
      <ChoiceChips<M> legend="Mode" value={x.method} options={[{ value: "lineaire", label: "Linéaire" }, { value: "degressif", label: "Dégressif" }]} onChange={(v) => upd({ method: v })} />
      <ChoiceChips<YN> legend="Petit outillage ou matériel de bureau ?" value={x.small} options={[{ value: "y", label: "Oui" }, { value: "n", label: "Non" }]} onChange={(v) => upd({ small: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{r.method === "charge" ? "Déductible immédiatement en charges" : `1re annuité : environ ${eur(r.schedule[0]?.amount ?? 0)}`}</p>
        <Items items={r.items} />
        {r.method !== "charge" && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-56 text-sm">
              <thead><tr className="text-left"><th className="py-1 pr-2">Exercice</th><th className="py-1 pr-2">Annuité</th><th className="py-1">VNC</th></tr></thead>
              <tbody>{r.schedule.map((s) => <tr key={s.year} className="border-t border-border"><td className="py-1 pr-2">{s.year}</td><td className="py-1 pr-2 font-mono">{eur(s.amount)}</td><td className="py-1 font-mono">{eur(s.vnc)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{FR_TAX_NOTE} À jour au {FR_TAX_AS_OF}.</p>
    </>
      )}
    </CurveShell>
  );
}
