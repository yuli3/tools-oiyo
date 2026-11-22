// Court fees for civil claims (JP 民訴費用法 別表第一, DE GKG). Logic: lib/world-court-fees-2026.ts
import { useState } from "react";
import { COURT_FEES_AS_OF, deCourtFee, jpCourtFee, type DeKind, type JpKind } from "../../../lib/world-court-fees-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

type C = "JP" | "DE";
const TOOL_ID = "court-fee-calculator-japan-germany";
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const JPK: { value: JpKind; label: string }[] = [{ value: "suit", label: "訴え" }, { value: "shiharai", label: "支払督促" }, { value: "chotei", label: "調停・労働審判" }, { value: "appeal", label: "控訴" }, { value: "jokoku", label: "上告" }];
const DEK: { value: DeKind; label: string }[] = [{ value: "klage", label: "Klage (3,0)" }, { value: "klage_ermaessigt", label: "Ermäßigt (1,0)" }, { value: "mahn", label: "Mahnbescheid (0,5)" }];

export default function CourtFees() {
  const [x, setX] = useState({ country: "JP" as C, jpValue: 3_000_000, jpKind: "suit" as JpKind, filed: "2026-11-22", deValue: 5_000, deKind: "klage" as DeKind });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const jp = x.country === "JP";
  const j = jpCourtFee({ value: x.jpValue, kind: x.jpKind, firstFiled: x.filed });
  const d = deCourtFee({ value: x.deValue, kind: x.deKind });
  const curve = jp
    ? { title: "手数料 by claim value", caption: "民事訴訟費用等に関する法律 別表第一 (旧法の表).", xLabel: "訴額 (円)", yLabel: "手数料 (円)", min: 0, max: Math.max(10_000_000, x.jpValue * 2), step: 100_000, current: x.jpValue, f: (v: number) => { const r = jpCourtFee({ value: Math.max(1, v), kind: x.jpKind, firstFiled: x.filed }); return r.ok ? r.fee : 0; }, formatX: fmt, formatY: fmt, onPick: (v: number) => upd({ jpValue: Math.round(v) }), marks: [] }
    : { title: "Gerichtsgebühr by Streitwert", caption: "§ 34 GKG times the rate of the Kostenverzeichnis.", xLabel: "Streitwert (€)", yLabel: "Gerichtsgebühr (€)", min: 0, max: Math.max(20_000, x.deValue * 2), step: 100, current: x.deValue, f: (v: number) => { const r = deCourtFee({ value: Math.max(1, v), kind: x.deKind }); return r.ok ? r.fee : 0; }, formatX: fmt, formatY: fmt, onPick: (v: number) => upd({ deValue: Math.round(v) }), marks: [] };
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency={jp ? "JPY" : "EUR"} curve={curve}>
      {(mode) => (
        <>
          <ChoiceChips<C> legend="Country" value={x.country} options={[{ value: "JP", label: "Japan" }, { value: "DE", label: "Germany" }]} onChange={(v) => upd({ country: v })} />
          {jp ? (
            <>
              <ChoiceChips<JpKind> legend="手続" value={x.jpKind} options={JPK} onChange={(v) => upd({ jpKind: v })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField label="訴額 (円)" value={x.jpValue} onChange={(v) => upd({ jpValue: v })} step={100_000} />
                <DateField label="当初の訴えを起こした日" value={x.filed} onChange={(v) => upd({ filed: v })} />
              </div>
              {j.ok ? <LaborResult mode={mode} headline={`手数料 ${fmt(j.fee)}円`} sub="収入印紙の額 (旧法の表による)" items={j.items as never} dates={[]} datesTitle="" note={`Court fee table from courts.go.jp. Not legal advice. Updated ${COURT_FEES_AS_OF}. What you type stays in your browser.`} /> : <LaborResult mode={mode} headline="Missing input" sub={j.error} items={[]} dates={[]} datesTitle="" note="" />}
            </>
          ) : (
            <>
              <ChoiceChips<DeKind> legend="Verfahren" value={x.deKind} options={DEK} onChange={(v) => upd({ deKind: v })} />
              <NumberField label="Streitwert (€)" value={x.deValue} onChange={(v) => upd({ deValue: v })} step={500} />
              {d.ok ? <LaborResult mode={mode} headline={`Gerichtsgebühr ${fmt(d.fee)} €`} sub={`${d.rate.toLocaleString("de-DE")} × ${fmt(d.oneFee)} €`} items={d.items as never} dates={[]} datesTitle="" note={`GKG from gesetze-im-internet.de. Not legal advice. Updated ${COURT_FEES_AS_OF}. What you type stays in your browser.`} /> : <LaborResult mode={mode} headline="Missing input" sub={d.error} items={[]} dates={[]} datesTitle="" note="" />}
            </>
          )}
        </>
      )}
    </CurveShell>
  );
}
