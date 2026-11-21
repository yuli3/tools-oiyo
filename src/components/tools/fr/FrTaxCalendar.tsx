// Calendrier fiscal France (2026-11-21, localisation par pays : France). Calcul : lib/fr-tax-pack-2026.ts
import { useState } from "react";
import { FR_TAX_AS_OF, FR_TAX_NOTE, frTaxCalendar } from "../../../lib/fr-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items, useToday } from "../nts/Items";

const TOOL_ID = "calendrier-fiscal-entreprise";
type YN = "y" | "n";
type Tva = "franchise" | "simplifie" | "normal";
const yn = [{ value: "y", label: "Oui" }, { value: "n", label: "Non" }] as const;

export default function FrTaxCalendar() {
  const today = useToday();
  const [x, setX] = useState({ year: 2027, tva: "franchise" as Tva, cfe: "y" as YN, is: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frTaxCalendar({ year: x.year, tva: x.tva, cfe: x.cfe === "y", is: x.is === "y", today });
  return (
    <div className="space-y-5">
      <NumberField label="Année" value={x.year} onChange={(v) => upd({ year: Math.min(2030, Math.max(2025, Math.round(v) || 2027)) })} />
      <ChoiceChips<Tva> legend="Régime de TVA" value={x.tva} options={[{ value: "franchise", label: "Franchise en base" }, { value: "simplifie", label: "Réel simplifié" }, { value: "normal", label: "Réel normal" }]} onChange={(v) => upd({ tva: v })} />
      <ChoiceChips<YN> legend="Redevable de la CFE ?" value={x.cfe} options={yn} onChange={(v) => upd({ cfe: v })} />
      <ChoiceChips<YN> legend="Société à l'impôt sur les sociétés (exercice civil) ?" value={x.is} options={yn} onChange={(v) => upd({ is: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <ol className="space-y-3">
          {r.events.map((e) => (
            <li key={e.id}>
              <p className="font-semibold text-foreground"><span className="font-mono">{e.date ?? e.month}</span>{e.daysLeft != null && <span className="ml-2 font-normal text-muted-foreground">{e.daysLeft >= 0 ? `dans ${e.daysLeft} jours` : `il y a ${-e.daysLeft} jours`}</span>}</p>
              <p>{e.label} <span className="text-xs text-muted-foreground">({e.cite})</span></p>
            </li>
          ))}
        </ol>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{FR_TAX_NOTE} À jour au {FR_TAX_AS_OF}. Les données saisies restent dans votre navigateur.</p>
    </div>
  );
}
