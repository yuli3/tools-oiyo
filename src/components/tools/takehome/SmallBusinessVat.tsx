// Small business VAT/GST registration check (DE Kleinunternehmer, SG GST). Logic: lib/world-small-business-vat-2026.ts
import { useState } from "react";
import { SMALL_VAT_AS_OF, deKleinunternehmer, sgGstRegistration } from "../../../lib/world-small-business-vat-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

type C = "DE" | "SG";
type YN = "no" | "yes";
const TOOL_ID = "small-business-vat-registration-check";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const STATUS: Record<string, string> = { kleinunternehmer: "Kleinunternehmer: no VAT on invoices", regelbesteuerung: "Regular VAT (Regelbesteuerung)", wechsel_unterjaehrig: "Switch to regular VAT during the year", verzicht: "Opted out: regular VAT for 5 years" };

export default function SmallBusinessVat() {
  const [x, setX] = useState({ country: "DE" as C, prior: 20_000, current: 60_000, founded: "no" as YN, opted: "no" as YN, past: 800_000, forecast: 1_200_000, fdate: "2026-09-02" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const de = x.country === "DE";
  const d = deKleinunternehmer({ priorYear: x.prior, currentYear: x.current, founded: x.founded === "yes", optedOut: x.opted === "yes" });
  const s = sgGstRegistration({ calendarYearTurnover: x.past, forecastNext12: x.forecast, forecastDate: x.fdate });
  const curve = de
    ? { title: "Headroom to the €100,000 limit", caption: "Net turnover this year; above €100,000 you switch to regular VAT during the year.", xLabel: "Turnover this year (EUR, net)", yLabel: "Headroom left", min: 0, max: 150_000, step: 1_000, current: x.current, f: (v: number) => Math.max(0, 100_000 - v), formatX: fmt, formatY: fmt, onPick: (v: number) => upd({ current: Math.round(v) }), marks: [] }
    : { title: "GST at 9% once you must register", caption: "Turnover expected in the next 12 months; registration is compulsory above S$1 million.", xLabel: "Expected turnover next 12 months (SGD)", yLabel: "GST to charge", min: 0, max: 2_000_000, step: 10_000, current: x.forecast, f: (v: number) => (v > 1_000_000 ? v * 0.09 : 0), formatX: fmt, formatY: fmt, onPick: (v: number) => upd({ forecast: Math.round(v) }), marks: [] };
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency={de ? "EUR" : "SGD"} curve={curve}>
      {(mode) => (
        <>
          <ChoiceChips<C> legend="Country" value={x.country} options={[{ value: "DE", label: "Germany (§ 19 UStG)" }, { value: "SG", label: "Singapore (GST)" }]} onChange={(v) => upd({ country: v })} />
          {de ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField label="Net turnover last year (EUR)" value={x.prior} onChange={(v) => upd({ prior: v })} step={1000} />
                <NumberField label="Expected net turnover this year (EUR)" value={x.current} onChange={(v) => upd({ current: v })} step={1000} />
              </div>
              <ChoiceChips<YN> legend="Business founded this year" value={x.founded} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} onChange={(v) => upd({ founded: v })} />
              <ChoiceChips<YN> legend="Opted out of the small business rule (Verzicht)" value={x.opted} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} onChange={(v) => upd({ opted: v })} />
              <LaborResult mode={mode} headline={STATUS[d.status]} sub={d.chargesVat ? "Charge VAT on your invoices." : "Invoices without VAT, with a note on the exemption."} items={d.items as never} dates={[]} datesTitle="" note={`Limits from IHK and the Saxony-Anhalt finance ministry. Not tax advice. Updated ${SMALL_VAT_AS_OF}. What you type stays in your browser.`} />
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField label="Turnover last calendar year (SGD)" value={x.past} onChange={(v) => upd({ past: v })} step={10_000} />
                <NumberField label="Expected turnover next 12 months (SGD)" value={x.forecast} onChange={(v) => upd({ forecast: v })} step={10_000} />
              </div>
              <DateField label="Date of the forecast" value={x.fdate} onChange={(v) => upd({ fdate: v })} />
              <LaborResult mode={mode} headline={s.liable ? "You must register for GST" : "No compulsory GST registration"} sub={s.applyBy ? `Apply by ${s.applyBy}; registered from ${s.registeredFrom}` : s.retrospective ? "Retrospective view: over S$1 million last calendar year" : "Both views at or under S$1 million"} items={s.items as never} dates={[]} datesTitle="" note={`Rules from IRAS pages. Not tax advice. Updated ${SMALL_VAT_AS_OF}. What you type stays in your browser.`} />
            </>
          )}
        </>
      )}
    </CurveShell>
  );
}
