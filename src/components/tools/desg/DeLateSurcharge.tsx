// Verspätungszuschlag nach § 152 AO. Logic: lib/de-tax-return-2026.ts
import { useState } from "react";
import { DE_RETURN_AS_OF, deLateSurcharge } from "../../../lib/de-tax-return-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "verspaetungszuschlag-rechner";
type YN = "y" | "n";
const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;

export default function DeLateSurcharge() {
  const [x, setX] = useState({ tax: 8_000, prepaid: 6_500, monthsLate: 4, extended: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = deLateSurcharge({ ...x, extended: x.extended === "y" });
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Festgesetzte Steuer (€)" value={x.tax} onChange={(v) => upd({ tax: v })} step={100} />
        <NumberField label="Vorauszahlungen + Lohnsteuer (€)" value={x.prepaid} onChange={(v) => upd({ prepaid: v })} step={100} />
        <NumberField label="Angefangene Monate zu spät" value={x.monthsLate} onChange={(v) => upd({ monthsLate: v })} step={1} />
      </div>
      <ChoiceChips<YN> legend="Frist vom Finanzamt verlängert (§ 109 AO)?" value={x.extended} options={[{ value: "n", label: "Nein" }, { value: "y", label: "Ja" }]} onChange={(v) => upd({ extended: v })} />
      <LaborResult headline={`Verspätungszuschlag: ${eur(r.surcharge)}`} sub={r.base > 0 ? `Bemessung: Nachzahlung ${eur(r.base)}` : "Keine Nachzahlung"} items={r.items} dates={[]} datesTitle="" note={`Nach § 152 AO. Die Frist für die Erklärung 2025 ohne Berater endete am 31. Juli 2026. Keine Steuerberatung. Stand ${DE_RETURN_AS_OF}. Ihre Eingaben bleiben im Browser.`} />
    </div>
  );
}
