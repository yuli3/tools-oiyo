// Pfändungsfreigrenzen für Arbeitseinkommen ab 1. Juli 2026 (§ 850c ZPO). Logic: lib/de-life-law-2026.ts
import { useState } from "react";
import { DE_LIFE_AS_OF, PFAENDUNG_2026, pfaendung } from "../../../lib/de-life-law-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell, { DE_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "pfaendungsfreigrenze-rechner-2026";
const eur = (n: number) => `${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const D = [0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n) as "0", label: String(n) }));

export default function DePfaendung() {
  const [x, setX] = useState({ net: 2_000, dependents: "0" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const d = Number(x.dependents);
  const r = pfaendung({ net: x.net, dependents: d });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="EUR" text={DE_VIZ_TEXT}
      curve={{ title: "Pfändbarer Betrag nach Nettoeinkommen", caption: "Monatlich, ab 1. Juli 2026.", xLabel: "Nettoeinkommen", yLabel: "Pfändbar", min: 0, max: 7_000, step: 50, current: Math.min(7_000, x.net), f: (v) => pfaendung({ net: v, dependents: d }).seizable, formatX: eur, formatY: eur, onPick: (v) => upd({ net: v }), marks: [{ at: r.free, label: "Freibetrag" }, { at: PFAENDUNG_2026.cap, label: "Obergrenze" }] }}
    >
      {(mode) => (
        <>
          <NumberField label="Monatliches Nettoeinkommen (€)" value={x.net} onChange={(v) => upd({ net: v })} step={50} />
          <ChoiceChips<string> legend="Unterhaltsberechtigte Personen" value={x.dependents} options={D} onChange={(v) => upd({ dependents: v })} />
          <LaborResult mode={mode} headline={`Pfändbar ${eur(r.seizable)} im Monat`} sub={`Ihnen bleiben ${eur(r.keeps)}; unpfändbar bis ${eur(r.free)}`} items={r.items} dates={[]} datesTitle="" note={`Nach § 850c ZPO und der Pfändungsfreigrenzenbekanntmachung 2026. Keine Rechtsberatung. Stand ${DE_LIFE_AS_OF}. Ihre Eingaben bleiben im Browser.`} />
        </>
      )}
    </CurveShell>
  );
}
