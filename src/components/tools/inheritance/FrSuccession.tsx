// Droits de succession : abattements, barème, délai de déclaration. Calcul : lib/world-inheritance-pack-2026.ts
import { useState } from "react";
import { INHERITANCE_AS_OF, frSuccession, type FrRelation } from "../../../lib/world-inheritance-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "droits-succession-abattement-delai";
const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

export default function FrSuccession() {
  const [x, setX] = useState({ part: 200_000, relation: "enfant" as FrRelation, handicap: false, death: "2026-05-31", abroad: false });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frSuccession({ ...x, death: x.death || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="fr" currency="EUR"
      curve={{ title: "Droits à payer selon votre part", caption: "Après l'abattement de votre lien de parenté.", xLabel: "Part reçue", yLabel: "Droits", min: 0, max: 1_000_000, step: 10_000, current: x.part, f: (v) => frSuccession({ ...x, part: v }).droits, formatX: eur, formatY: eur, onPick: (v) => upd({ part: v }) }}
    >
      {(mode) => (
        <>
          <ChoiceChips<FrRelation> legend="Votre lien avec le défunt" value={x.relation} options={[{ value: "enfant", label: "Enfant" }, { value: "conjoint", label: "Conjoint ou PACS" }, { value: "frereSoeur", label: "Frère ou sœur" }, { value: "neveu", label: "Neveu ou nièce" }, { value: "parent4", label: "Autre parent (jusqu'au 4e degré)" }, { value: "nonParent", label: "Sans lien de parenté" }]} onChange={(v) => upd({ relation: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Votre part nette" value={x.part} onChange={(v) => upd({ part: v })} suffix="€" step={5_000} />
            <DateField label="Date du décès" value={x.death} onChange={(v) => upd({ death: v })} />
          </div>
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="Le décès a-t-il eu lieu hors de France ?" value={x.abroad ? "y" : "n"} options={[{ value: "n", label: "Non (6 mois)" }, { value: "y", label: "Oui (12 mois)" }]} onChange={(v) => upd({ abroad: v === "y" })} />}
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="Êtes-vous en situation de handicap ?" value={x.handicap ? "y" : "n"} options={[{ value: "n", label: "Non" }, { value: "y", label: "Oui (+159 325 €)" }]} onChange={(v) => upd({ handicap: v === "y" })} />}
          <LaborResult mode={mode} headline={r.droits ? `Droits estimés ${eur(r.droits)}` : "Pas de droits de succession"} sub={r.abattement !== null ? `Abattement ${eur(r.abattement)}` : "Exonéré"} items={r.items} dates={r.dates} datesTitle="Délai" note={`Information générale et estimation (service-public.gouv.fr F35794, impots.gouv.fr). Pas un conseil fiscal ; le notaire établit la déclaration. Mis à jour le ${INHERITANCE_AS_OF}. Vos saisies restent dans votre navigateur.`} />
        </>
      )}
    </CurveShell>
  );
}
