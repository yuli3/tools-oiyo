// Pendlerpauschale + Homeoffice-Pauschale 2026 gegen Arbeitnehmer-Pauschbetrag. Logic: lib/de-tax-return-2026.ts
import { useState } from "react";
import { DE_RETURN_AS_OF, deCommuteDeduction } from "../../../lib/de-tax-return-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "pendlerpauschale-homeoffice-rechner-2026";
type YN = "y" | "n";
const eur = (n: number) => `${n.toLocaleString("de-DE", { maximumFractionDigits: 2 })} €`;

export default function DeCommute() {
  const [x, setX] = useState({ km: 25, officeDays: 120, homeDays: 90, car: "y" as YN, otherCosts: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = deCommuteDeduction({ ...x, car: x.car === "y" });
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Einfache Entfernung zur Arbeit (km)" value={x.km} onChange={(v) => upd({ km: v })} step={1} />
        <NumberField label="Tage im Büro" value={x.officeDays} onChange={(v) => upd({ officeDays: v })} step={1} />
        <NumberField label="Tage im Homeoffice" value={x.homeDays} onChange={(v) => upd({ homeDays: v })} step={1} />
        <NumberField label="Andere Werbungskosten (€)" value={x.otherCosts} onChange={(v) => upd({ otherCosts: v })} step={50} />
      </div>
      <ChoiceChips<YN> legend="Mit dem eigenen Auto?" value={x.car} options={[{ value: "y", label: "Ja" }, { value: "n", label: "Nein (Bahn, Rad …)" }]} onChange={(v) => upd({ car: v })} />
      <LaborResult headline={`Werbungskosten: ${eur(r.total)}`} sub={r.extra > 0 ? `${eur(r.extra)} über dem Pauschbetrag von 1.230 €` : "Nicht über dem Pauschbetrag von 1.230 €"} items={r.items} dates={[]} datesTitle="" note={`Werte für 2026: 0,38 € ab dem ersten Kilometer, 6 € je Homeoffice-Tag (höchstens 210 Tage), Arbeitnehmer-Pauschbetrag 1.230 €. Die Steuerersparnis hängt von Ihrem Steuersatz ab und wird hier nicht berechnet. Stand ${DE_RETURN_AS_OF}. Ihre Eingaben bleiben im Browser.`} />
    </div>
  );
}
