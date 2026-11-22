// Erbschaftsteuer nach §§ 15, 16, 19 ErbStG. Logic: lib/de-life-law-2026.ts
import { useState } from "react";
import { DE_LIFE_AS_OF, erbschaftsteuer, type ErbRelation } from "../../../lib/de-life-law-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell, { DE_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "erbschaftsteuer-rechner-2026";
const REL: { value: ErbRelation; label: string }[] = [{ value: "spouse", label: "Ehegatte / Lebenspartner" }, { value: "child", label: "Kind / Stiefkind" }, { value: "grandchild", label: "Enkel" }, { value: "parentInherit", label: "Eltern (Erbfall)" }, { value: "sibling", label: "Geschwister, Nichte, Neffe" }, { value: "classII", label: "Sonst Steuerklasse II" }, { value: "other", label: "Andere (Klasse III)" }];
const eur = (n: number) => `${n.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`;

export default function DeErbschaft() {
  const [x, setX] = useState({ value: 1_000_000, relation: "child" as ErbRelation });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = erbschaftsteuer(x);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="EUR" text={DE_VIZ_TEXT}
      curve={{ title: "Erbschaftsteuer nach Wert des Erwerbs", caption: "Nach Abzug des persönlichen Freibetrags; Härteausgleich an den Stufengrenzen.", xLabel: "Wert des Erwerbs", yLabel: "Steuer", min: 0, max: Math.max(2_000_000, x.value * 2), step: 10_000, current: x.value, f: (v) => erbschaftsteuer({ value: v, relation: x.relation }).tax, formatX: eur, formatY: eur, onPick: (v) => upd({ value: v }), marks: [{ at: r.allowance, label: "Freibetrag" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<ErbRelation> legend="Wer erbt?" value={x.relation} options={REL} onChange={(v) => upd({ relation: v })} />
          <NumberField label="Wert des Erwerbs (€)" value={x.value} onChange={(v) => upd({ value: v })} step={10000} />
          <LaborResult mode={mode} headline={`Erbschaftsteuer ${eur(r.tax)}`} sub={`Steuerpflichtig ${eur(r.taxable)}, Satz ${r.rate} %`} items={r.items} dates={[]} datesTitle="" note={`Nach §§ 15, 16, 19 ErbStG. Keine Steuerberatung. Stand ${DE_LIFE_AS_OF}. Ihre Eingaben bleiben im Browser.`} />
        </>
      )}
    </CurveShell>
  );
}
