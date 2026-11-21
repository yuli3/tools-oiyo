// Micro-entrepreneur : seuils, cotisations, impôt. Calcul : lib/fr-tax-pack-2026.ts
import { useState } from "react";
import { FR_TAX_AS_OF, FR_TAX_NOTE, MICRO_2026, frMicro, type Activity } from "../../../lib/fr-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "micro-entrepreneur-cotisations-impot";
const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;
type YN = "y" | "n";

export default function FrMicro() {
  const [x, setX] = useState({ activity: "services" as Activity, ca: 50_000, rfr: 20_000, parts: 1, other: 0, vl: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frMicro({ activity: x.activity, ca: x.ca, rfr: x.rfr, parts: x.parts, otherIncome: x.other, vl: x.vl === "y" });
  const bars = [{ l: "Cotisations sociales", v: r.social }, { l: "Impôt sur le revenu", v: r.incomeTax }, { l: "Reste", v: Math.max(0, r.net) }];
  return (
    <div className="space-y-5">
      <ChoiceChips<Activity> legend="Activité" value={x.activity} options={(Object.keys(MICRO_2026) as Activity[]).map((k) => ({ value: k, label: MICRO_2026[k].label }))} onChange={(v) => upd({ activity: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Chiffre d'affaires annuel encaissé" value={x.ca} onChange={(v) => upd({ ca: v })} suffix="€" step={1000} />
        <NumberField label="Revenu fiscal de référence N-2 du foyer" value={x.rfr} onChange={(v) => upd({ rfr: v })} suffix="€" step={1000} />
        <NumberField label="Nombre de parts du foyer" value={x.parts} onChange={(v) => upd({ parts: Math.max(1, v) })} step={0.5} />
        <NumberField label="Autres revenus imposables du foyer" value={x.other} onChange={(v) => upd({ other: v })} suffix="€" step={1000} />
      </div>
      <ChoiceChips<YN> legend="Option pour le versement libératoire ?" value={x.vl} options={[{ value: "y", label: "Oui" }, { value: "n", label: "Non" }]} onChange={(v) => upd({ vl: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">Environ {eur(r.net)} restent sur {eur(x.ca)} (estimation), {Math.round(r.rate * 100)} % de prélèvements</p>
        <ul className="mt-3 space-y-2">{bars.map((b) => <li key={b.l}><div className="flex justify-between gap-2"><span>{b.l}</span><span className="font-mono">{eur(b.v)}</span></div><progress className="mt-1 h-2 w-full accent-(--primary)" max={Math.max(1, x.ca)} value={b.v} aria-label={b.l} /></li>)}</ul>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{FR_TAX_NOTE} À jour au {FR_TAX_AS_OF}.</p>
    </div>
  );
}
