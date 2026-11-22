// France : dépôt de garantie, préavis, révision IRL. Calcul : lib/world-tenancy-pack-2026.ts
import { useState } from "react";
import { IRL, TENANCY_AS_OF, frLatePenalty, frTenancy, type FrLease } from "../../../lib/world-tenancy-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "depot-de-garantie-preavis-irl";
const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;
type YN = "oui" | "non";
const OUINON = [{ value: "non" as const, label: "Non" }, { value: "oui" as const, label: "Oui" }];

export default function FrTenancy() {
  const [x, setX] = useState({ lease: "vide" as FrLease, rentHC: 900, deposit: 900, keysReturned: "2026-10-15", sameInventory: true, refundedOn: "", noticeDate: "2026-11-30", reducedNotice: false, leaseEnd: "", quarter: "T3 2026", revisionClause: true, dpeFG: false });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frTenancy({ ...x, keysReturned: x.keysReturned || undefined, refundedOn: x.refundedOn || undefined, noticeDate: x.noticeDate || undefined, leaseEnd: x.leaseEnd || undefined });
  const yn = (legend: string, v: boolean, on: (b: boolean) => void) => <ChoiceChips<YN> legend={legend} value={v ? "oui" : "non"} options={OUINON} onChange={(c) => on(c === "oui")} />;
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="fr"
      currency="EUR"
      curve={{
        title: "Majoration selon le retard de restitution", caption: "10 % du loyer mensuel hors charges par mois de retard commencé.",
        xLabel: "Jours de retard", yLabel: "Majoration", min: 0, max: 365, step: 1, current: r.late,
        f: (d) => frLatePenalty(x.rentHC, d), formatX: (d) => `${Math.round(d)} j`, formatY: eur,
        onPick: (d) => r.due && upd({ refundedOn: new Date(Date.parse(r.due) + d * 86_400_000).toISOString().slice(0, 10) }),
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<FrLease> legend="Type de bail" value={x.lease} options={[{ value: "vide", label: "Location vide" }, { value: "meuble", label: "Location meublée" }]} onChange={(v) => upd({ lease: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Loyer mensuel hors charges" value={x.rentHC} onChange={(v) => upd({ rentHC: v })} suffix="€" step={10} />
        <NumberField label="Dépôt de garantie versé" value={x.deposit} onChange={(v) => upd({ deposit: v })} suffix="€" step={10} />
        <DateField label="Remise des clés" value={x.keysReturned} onChange={(v) => upd({ keysReturned: v })} />
        <DateField label="Dépôt rendu le (vide si pas encore)" value={x.refundedOn} onChange={(v) => upd({ refundedOn: v })} />
        <DateField label="Date d'envoi de votre congé" value={x.noticeDate} onChange={(v) => upd({ noticeDate: v })} />
        {mode === "expert" && <DateField label="Échéance du bail (congé du bailleur)" value={x.leaseEnd} onChange={(v) => upd({ leaseEnd: v })} />}
      </div>
      <div className="flex flex-wrap gap-3">
        {yn("État des lieux de sortie conforme à l'entrée", x.sameInventory, (b) => upd({ sameInventory: b }))}
        {x.lease === "vide" && yn("Préavis réduit (zone tendue, mutation, perte d'emploi…)", x.reducedNotice, (b) => upd({ reducedNotice: b }))}
        {mode === "expert" && yn("Clause de révision dans le bail", x.revisionClause, (b) => upd({ revisionClause: b }))}
        {mode === "expert" && yn("Logement classé F ou G (DPE)", x.dpeFG, (b) => upd({ dpeFG: b }))}
      </div>
      {mode === "expert" && <ChoiceChips<string> legend="Trimestre de référence IRL" value={x.quarter} options={Object.keys(IRL).slice(0, 4).map((q) => ({ value: q, label: `${q} (+${IRL[q].change} %)` }))} onChange={(v) => upd({ quarter: v })} />}
      <LaborResult mode={mode} headline={r.due ? `Dépôt à rendre au plus tard le ${r.due}${r.penalty ? ` · majoration ${eur(r.penalty)}` : ""}` : `Dépôt maximum : ${eur(r.cap)}`} sub={`Plafond : ${r.capMonths} mois de loyer hors charges`} items={r.items} dates={r.dates} datesTitle="Dates" note={`Informations générales d'après service-public.gouv.fr, Légifrance (loi du 6 juillet 1989) et l'INSEE. Ce n'est pas un conseil juridique. Conseil gratuit : l'ADIL de votre département (anil.org). Mise à jour : ${TENANCY_AS_OF}. Vos données restent dans votre navigateur.`} />
    </>
      )}
    </CurveShell>
  );
}
