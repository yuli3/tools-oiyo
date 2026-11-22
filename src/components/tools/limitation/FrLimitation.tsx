// Délais de prescription et recouvrement des petites créances. Calcul : lib/world-limitation-pack-2026.ts
import { useState } from "react";
import { FR_YEARS, LIMITATION_AS_OF, frLimitation, type FrClaim } from "../../../lib/world-limitation-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { limitCurve } from "./LimitCurve";

const TOOL_ID = "delai-prescription-dette-injonction";

export default function FrLimitation() {
  const [x, setX] = useState({ claim: "general" as FrClaim, start: "2022-01-15", amount: 3_000, today: "2026-11-22", elapsed: 1 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frLimitation({ claim: x.claim, start: x.start || undefined, amount: x.amount, today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="fr" currency="EUR"
      curve={limitCurve({ start: x.start, deadline: r.deadline, title: "Années restantes avant la prescription", caption: `Délai de ${FR_YEARS[x.claim].years} an(s).`, xLabel: "Années écoulées", yLabel: "Années restantes", unit: (n) => `${n} an`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 5 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<FrClaim> legend="Quelle dette ?" value={x.claim} options={[{ value: "general", label: "Cas général" }, { value: "proConsommateur", label: "Facture d'un professionnel à un particulier" }, { value: "assurance", label: "Assurance" }, { value: "telecom", label: "Téléphone / internet" }, { value: "salaire", label: "Salaires" }]} onChange={(v) => upd({ claim: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Date à laquelle la somme était due (ou date de la facture)" value={x.start} onChange={(v) => upd({ start: v })} />
            <NumberField label="Montant" value={x.amount} onChange={(v) => upd({ amount: v })} suffix="€" step={100} />
            {mode === "expert" && <DateField label="Date du jour" value={x.today} onChange={(v) => upd({ today: v })} />}
          </div>
          <LaborResult mode={mode} headline={r.deadline ? `Prescription le ${r.deadline}${r.status === "expired" ? " (déjà passée)" : ""}` : "Saisissez une date"} items={r.items} dates={r.dates} datesTitle="Délai" note={`Information générale (CIDJ, Que Choisir, justice.fr). Pas un conseil juridique. Mis à jour le ${LIMITATION_AS_OF}. Vos saisies restent dans votre navigateur.`} />
        </>
      )}
    </CurveShell>
  );
}
