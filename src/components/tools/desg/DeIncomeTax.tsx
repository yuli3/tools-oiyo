// Einkommensteuer 2026 nach § 32a EStG (Grund- und Splittingtabelle). Logic: lib/world-de-sg-pack-2026.ts
import { useState } from "react";
import { DESG_AS_OF, deIncomeTax } from "../../../lib/world-de-sg-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell, { DE_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "einkommensteuer-rechner-2026";
const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;
type J = "single" | "joint";

export default function DeIncomeTax() {
  const [x, setX] = useState({ zvE: 50_000, j: "single" as J });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const joint = x.j === "joint";
  const r = deIncomeTax({ zvE: x.zvE, joint });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="EUR" text={DE_VIZ_TEXT}
      curve={{ title: "Einkommensteuer nach zu versteuerndem Einkommen", caption: joint ? "Splittingtabelle (Ehe- oder Lebenspartner, Zusammenveranlagung)." : "Grundtabelle (Einzelveranlagung).", xLabel: "Zu versteuerndes Einkommen", yLabel: "Einkommensteuer", min: 0, max: 300_000, step: 1_000, current: Math.min(300_000, x.zvE), f: (v) => deIncomeTax({ zvE: v, joint }).tax, formatX: eur, formatY: eur, onPick: (v) => upd({ zvE: v }), marks: joint ? [{ at: 24_696, label: "24.696" }, { at: 139_758, label: "42 %" }] : [{ at: 12_348, label: "12.348" }, { at: 69_879, label: "42 %" }, { at: 277_826, label: "45 %" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<J> legend="Veranlagung" value={x.j} options={[{ value: "single", label: "Einzeln" }, { value: "joint", label: "Zusammen (Splitting)" }]} onChange={(v) => upd({ j: v })} />
          <NumberField label="Zu versteuerndes Einkommen im Jahr (€)" value={x.zvE} onChange={(v) => upd({ zvE: v })} step={1000} />
          <LaborResult mode={mode} headline={`Einkommensteuer: ${eur(r.tax)}`} sub={`Durchschnittssteuersatz ${r.average.toLocaleString("de-DE")} %, Grenzsteuersatz ${r.marginal.toLocaleString("de-DE")} %`} items={r.items} dates={[]} datesTitle="" note={`Nach § 32a EStG (Tarif ab 2026). Keine Steuerberatung. Stand ${DESG_AS_OF}. Ihre Eingaben bleiben im Browser.`} />
        </>
      )}
    </CurveShell>
  );
}
