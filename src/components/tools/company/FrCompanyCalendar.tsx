// France: approbation des comptes et dépôt au greffe. Logic: lib/world-company-calendar-2026.ts
import { useState } from "react";
import { CALENDAR_AS_OF, frCompanyCalendar } from "../../../lib/world-company-calendar-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { calCurve } from "./CalCurve";

const TOOL_ID = "delai-approbation-depot-comptes-annuels";

export default function FrCompanyCalendar() {
  const [x, setX] = useState({ yearEnd: "2026-06-30", approvedOn: "", online: "y", today: "2026-11-22", day: 30 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frCompanyCalendar({ yearEnd: x.yearEnd, approvedOn: x.approvedOn || undefined, online: x.online === "y", today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="fr" currency="EUR"
      curve={calCurve({ yearEnd: x.yearEnd, dates: r.dates, title: "Échéances restantes après la clôture", caption: "Nombre d'échéances (approbation, dépôt) encore à venir selon les jours écoulés depuis la clôture.", xLabel: "Jours après la clôture", yLabel: "Échéances restantes", day: (n) => `${Math.round(n)} j`, current: x.day, onPick: (v) => upd({ day: v }), max: 300 })}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Date de clôture de l'exercice" value={x.yearEnd} onChange={(v) => upd({ yearEnd: v })} />
            <DateField label="Date d'approbation (si déjà faite)" value={x.approvedOn} onChange={(v) => upd({ approvedOn: v })} />
            {mode === "expert" && <DateField label="Date du jour" value={x.today} onChange={(v) => upd({ today: v })} />}
          </div>
          <ChoiceChips<"y" | "n"> legend="Dépôt en ligne (guichet unique) ?" value={x.online as "y" | "n"} options={[{ value: "y", label: "Oui, en ligne" }, { value: "n", label: "Non, papier" }]} onChange={(v) => upd({ online: v })} />
          <LaborResult mode={mode} headline={r.next ? `Prochaine échéance : ${r.next.date}` : r.dates.length ? "Les échéances de cet exercice sont passées" : "Indiquez la date de clôture"} sub={r.next?.label} items={r.items} dates={r.dates} datesTitle="Échéances" note={`D'après entreprendre.service-public.gouv.fr et justice.fr (dépôt des comptes annuels). Sociétés commerciales. Pas un conseil juridique ou comptable. Mis à jour le ${CALENDAR_AS_OF}. Vos saisies restent dans votre navigateur.`} />
        </>
      )}
    </CurveShell>
  );
}
