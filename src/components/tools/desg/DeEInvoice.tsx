// E-Rechnung: ab wann Empfang und Ausstellung Pflicht sind. Logic: lib/world-de-sg-pack-2026.ts
import { useState } from "react";
import { DESG_AS_OF, deEInvoice } from "../../../lib/world-de-sg-pack-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import CurveShell, { DE_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "e-rechnung-pflicht-ab-wann";
const eur = (n: number) => `${Math.round(n).toLocaleString("de-DE")} €`;

export default function DeEInvoice() {
  const [x, setX] = useState({ turnover2026: 500_000 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = deEInvoice(x);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="EUR" text={DE_VIZ_TEXT}
      curve={{ title: "Ab welchem Jahr Sie E-Rechnungen ausstellen müssen", caption: "Abhängig vom Gesamtumsatz im Vorjahr 2026.", xLabel: "Umsatz 2026", yLabel: "Pflicht ab", min: 0, max: 2_000_000, step: 10_000, current: Math.min(2_000_000, x.turnover2026), f: (v) => Number(deEInvoice({ turnover2026: v }).issueFrom.slice(0, 4)), formatX: eur, formatY: (n) => String(Math.round(n)), onPick: (v) => upd({ turnover2026: v }), marks: [{ at: 800_000, label: "800.000 €" }] }}
    >
      {(mode) => (
        <>
          <NumberField label="Gesamtumsatz 2026 (€)" value={x.turnover2026} onChange={(v) => upd({ turnover2026: v })} step={10000} />
          <LaborResult mode={mode} headline={`E-Rechnungen ausstellen ab ${r.issueFrom}`} sub="Empfangen müssen alle inländischen Unternehmer schon seit 1. Januar 2025." items={r.items} dates={r.dates} datesTitle="Termine" note={`Nach IHK Stuttgart (15.10.2026). Keine Steuerberatung. Stand ${DESG_AS_OF}. Ihre Eingaben bleiben im Browser.`} />
        </>
      )}
    </CurveShell>
  );
}
