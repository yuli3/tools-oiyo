// France facturation électronique: réception, émission, e-reporting by company size. Logic: lib/world-einvoice-pack-2026.ts
import { useState } from "react";
import { EINVOICE_AS_OF, frEInvoice, type FrSize } from "../../../lib/world-einvoice-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "facturation-electronique-calendrier-entreprise";
const START = Date.UTC(2026, 0, 1);
const monthToDate = (m: number) => { const d = new Date(START); d.setUTCMonth(d.getUTCMonth() + Math.round(m)); return d.toISOString().slice(0, 10); };
const dateToMonth = (s: string) => { const d = new Date(Date.parse(s)); return Number.isNaN(d.getTime()) ? 0 : (d.getUTCFullYear() - 2026) * 12 + d.getUTCMonth(); };

export default function FrEInvoice() {
  const [x, setX] = useState({ size: "pme" as FrSize, today: "2026-11-22" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frEInvoice(x);
  const count = (m: number) => r.dates.filter((d) => d.date <= monthToDate(m)).length;
  return (
    <CurveShell toolId={TOOL_ID} lang="fr" currency="EUR"
      curve={{ title: "Obligations en vigueur selon la date", caption: "0 = aucune, 1 = réception, 2 = réception + émission et e-reporting.", xLabel: "Mois", yLabel: "Obligations", min: 0, max: 30, step: 1, current: Math.max(0, Math.min(30, dateToMonth(x.today))), f: count, formatX: (m) => monthToDate(m).slice(0, 7), formatY: (n) => String(n), onPick: (m) => upd({ today: monthToDate(m) }), marks: [{ at: 8, label: "1/9/2026" }, { at: 20, label: "1/9/2027" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<FrSize> legend="Taille de l'entreprise" value={x.size} options={[{ value: "ge", label: "Grande entreprise" }, { value: "eti", label: "ETI" }, { value: "pme", label: "PME" }, { value: "micro", label: "Micro-entreprise" }]} onChange={(v) => upd({ size: v })} />
          {mode === "expert" && <DateField label="Date à vérifier" value={x.today} onChange={(v) => upd({ today: v })} />}
          <LaborResult mode={mode} headline={r.now.issue ? "Vous devez recevoir et émettre des factures électroniques" : r.now.receive ? `Réception obligatoire ; émission à partir du ${r.dates[1].date}` : `Réception obligatoire à partir du ${r.dates[0].date}`} items={r.items} dates={r.dates} datesTitle="Calendrier" note={`D'après entreprendre.service-public.gouv.fr (2 sept. 2026) et la FAQ impots.gouv.fr (01/09/2026). Pas un conseil fiscal. Mis à jour le ${EINVOICE_AS_OF}. Vos saisies restent dans votre navigateur.`} />
        </>
      )}
    </CurveShell>
  );
}
