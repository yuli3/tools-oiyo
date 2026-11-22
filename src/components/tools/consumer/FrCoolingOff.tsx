// Délai de rétractation (Code de la consommation L221-18 s.). Calcul : lib/world-consumer-pack-2026.ts
import { useState } from "react";
import { CONSUMER_AS_OF, frCoolingOff, type FrKind } from "../../../lib/world-consumer-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { coolingCurve } from "./CoolingCurve";

const TOOL_ID = "delai-retractation-achat-distance";

export default function FrCoolingOff() {
  const [x, setX] = useState({ kind: "biens" as FrKind, date: "2026-11-20", infoGiven: true, infoDate: "", withdrawalSent: "", elapsed: 3 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const svc = x.kind === "services";
  const r = frCoolingOff({ kind: x.kind, delivered: svc ? undefined : x.date, contractDate: svc ? x.date : undefined, infoGiven: x.infoGiven, infoDate: x.infoDate || undefined, withdrawalSent: x.withdrawalSent || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="fr" currency="EUR"
      curve={coolingCurve({ start: x.date, lastDay: r.lastDay, title: "Jours restants pour vous rétracter", caption: "Compté à partir de la date saisie. Envoyez votre rétractation avant d'arriver à zéro.", xLabel: "Jours écoulés", yLabel: "Jours restants", unit: (n) => `${Math.round(n)} j`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 20 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<FrKind> legend="Qu'avez-vous acheté ?" value={x.kind} options={[{ value: "biens", label: "Un bien" }, { value: "plusieursBiens", label: "Plusieurs biens livrés séparément" }, { value: "services", label: "Un service" }]} onChange={(v) => upd({ kind: v })} />
          <DateField label={svc ? "Date de conclusion du contrat" : "Date de réception du bien (du dernier bien)"} value={x.date} onChange={(v) => upd({ date: v })} />
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="Le vendeur vous a-t-il informé du droit de rétractation ?" value={x.infoGiven ? "y" : "n"} options={[{ value: "y", label: "Oui" }, { value: "n", label: "Non" }]} onChange={(v) => upd({ infoGiven: v === "y" })} />}
          {mode === "expert" && !x.infoGiven && <DateField label="Date où vous avez reçu l'information (le cas échéant)" value={x.infoDate} onChange={(v) => upd({ infoDate: v })} />}
          {mode === "expert" && <DateField label="Date d'envoi de votre rétractation" value={x.withdrawalSent} onChange={(v) => upd({ withdrawalSent: v })} />}
          <LaborResult mode={mode} headline={r.lastDay ? `Rétractez-vous au plus tard le ${r.lastDay}` : "Vous avez 14 jours"} sub="Achat à distance (internet, téléphone) ou hors établissement" items={r.items} dates={r.dates} datesTitle="Dates" note={`Information générale (Code de la consommation, fiche service-public.gouv.fr F10485). Pas un conseil juridique. En cas de litige : SignalConso ou un conciliateur de justice. Mis à jour le ${CONSUMER_AS_OF}. Vos saisies restent dans votre navigateur.`} />
        </>
      )}
    </CurveShell>
  );
}
