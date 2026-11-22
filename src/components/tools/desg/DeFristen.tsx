// Widerruf, Mietkaution, Verjährung (BGB). Logic: lib/de-life-law-2026.ts
import { useState } from "react";
import { DE_LIFE_AS_OF, mietkaution, verjaehrung, widerruf, type WiderrufKind } from "../../../lib/de-life-law-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { DE_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "widerruf-kaution-verjaehrung-rechner";
type Topic = "widerruf" | "kaution" | "verjaehrung";
type YN = "y" | "n";
const eur = (n: number) => `${n.toLocaleString("de-DE", { maximumFractionDigits: 2 })} €`;

export default function DeFristen() {
  const [x, setX] = useState({ topic: "widerruf" as Topic, start: "2026-11-20", kind: "goods" as WiderrufKind, informed: "y" as YN, rent: 800, asked: 2400, arose: "2026-03-10", known: "2026-03-10" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const k = mietkaution({ coldRent: x.rent, asked: x.asked });
  const w = widerruf({ start: x.start, kind: x.kind, informed: x.informed === "y" });
  const v = verjaehrung({ arose: x.arose, known: x.known });
  const body = (mode: "easy" | "expert") => {
    if (x.topic === "kaution") return <LaborResult mode={mode} headline={`Höchstens ${eur(k.max)} Kaution`} sub={k.over ? `${eur(k.over)} zu viel verlangt` : `In drei Raten zu je ${eur(k.instalment)} möglich`} items={k.items} dates={[]} datesTitle="" note={`Nach § 551 BGB. Keine Rechtsberatung. Stand ${DE_LIFE_AS_OF}.`} />;
    if (x.topic === "verjaehrung") return <LaborResult mode={mode} headline={v.ok ? `Verjährt mit Ablauf des ${v.end}` : "Datum fehlt"} sub="Regelmäßige Verjährung" items={v.ok ? v.items : []} dates={[]} datesTitle="" note={`Nach §§ 195, 199 BGB. Keine Rechtsberatung. Stand ${DE_LIFE_AS_OF}.`} />;
    return <LaborResult mode={mode} headline={w.ok ? `Widerruf absenden bis ${w.deadline}` : "Datum fehlt"} sub={w.ok ? `Spätestens erlischt das Recht am ${w.latest}` : ""} items={w.ok ? w.items : []} dates={[]} datesTitle="" note={`Nach §§ 355-357 BGB. Keine Rechtsberatung. Stand ${DE_LIFE_AS_OF}.`} />;
  };
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="EUR" text={DE_VIZ_TEXT}
      curve={{ title: "Höchstkaution nach Kaltmiete", caption: "Drei Monatsmieten ohne Betriebskosten (§ 551 BGB).", xLabel: "Kaltmiete im Monat", yLabel: "Höchstkaution", min: 0, max: 3_000, step: 50, current: Math.min(3_000, x.rent), f: (n) => mietkaution({ coldRent: n }).max, formatX: eur, formatY: eur, onPick: (n) => upd({ rent: n, topic: "kaution" }), marks: [] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<Topic> legend="Thema" value={x.topic} options={[{ value: "widerruf", label: "Widerruf" }, { value: "kaution", label: "Mietkaution" }, { value: "verjaehrung", label: "Verjährung" }]} onChange={(t) => upd({ topic: t })} />
          {x.topic === "widerruf" && <>
            <ChoiceChips<WiderrufKind> legend="Was haben Sie gekauft?" value={x.kind} options={[{ value: "goods", label: "Ware" }, { value: "service", label: "Dienstleistung" }, { value: "digital", label: "Strom, Gas, digitale Inhalte" }]} onChange={(n) => upd({ kind: n })} />
            <DateField label={x.kind === "goods" ? "Ware erhalten am" : "Vertrag geschlossen am"} value={x.start} onChange={(n) => upd({ start: n })} />
            <ChoiceChips<YN> legend="Wurden Sie über das Widerrufsrecht informiert?" value={x.informed} options={[{ value: "y", label: "Ja" }, { value: "n", label: "Nein" }]} onChange={(n) => upd({ informed: n })} />
          </>}
          {x.topic === "kaution" && <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Kaltmiete im Monat (€)" value={x.rent} onChange={(n) => upd({ rent: n })} step={50} />
            <NumberField label="Verlangte Kaution (€)" value={x.asked} onChange={(n) => upd({ asked: n })} step={100} />
          </div>}
          {x.topic === "verjaehrung" && <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Anspruch entstanden am" value={x.arose} onChange={(n) => upd({ arose: n })} />
            <DateField label="Kenntnis von Umständen und Schuldner am" value={x.known} onChange={(n) => upd({ known: n })} />
          </div>}
          {body(mode)}
        </>
      )}
    </CurveShell>
  );
}
