// IRS late filing / late payment penalties, interest and appeal deadlines. Logic: lib/us-tax-pack-2026.ts
import { useState } from "react";
import { US_TAX_AS_OF, US_TAX_NOTE, usAppealDeadlines, usPenalty } from "../../../lib/us-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "irs-penalty-interest-calculator";
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
type YN = "y" | "n";
type Kind = "deficiency" | "cdp";

export default function UsPenalty() {
  const [x, setX] = useState({ tax: 5_000, due: "2027-04-15", filed: "2027-07-01", paid: "2027-07-01", ext: "n" as YN, plan: "n" as YN, notice: "", kind: "deficiency" as Kind, abroad: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usPenalty({ tax: x.tax, due: x.due || "2027-04-15", filed: x.filed || undefined, paid: x.paid || undefined, extension: x.ext === "y", installment: x.plan === "y" });
  const ap = x.notice ? usAppealDeadlines({ notice: x.notice, kind: x.kind, abroad: x.abroad === "y" }) : [];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Unpaid tax on the due date" value={x.tax} onChange={(v) => upd({ tax: v })} suffix="USD" step={100} />
        <DateField label="Original due date" value={x.due} onChange={(v) => upd({ due: v })} />
        <DateField label="Date filed" value={x.filed} onChange={(v) => upd({ filed: v })} />
        <DateField label="Date paid" value={x.paid} onChange={(v) => upd({ paid: v })} />
      </div>
      <ChoiceChips<YN> legend="Did you file an extension on time?" value={x.ext} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ ext: v })} />
      <ChoiceChips<YN> legend="Are you on an approved IRS payment plan?" value={x.plan} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ plan: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">About {usd(r.total)} on top of the tax (estimate)</p>
        <Items items={r.items} />
      </div>
      <section className="space-y-3 rounded-md border border-border bg-card px-4 py-4 text-sm">
        <h3 className="font-semibold">Got an IRS notice you disagree with?</h3>
        <ChoiceChips<Kind> legend="Notice type" value={x.kind} options={[{ value: "deficiency", label: "Notice of deficiency (90-day letter)" }, { value: "cdp", label: "Collection due process notice" }]} onChange={(v) => upd({ kind: v })} />
        {x.kind === "deficiency" && <ChoiceChips<YN> legend="Addressed to you outside the United States?" value={x.abroad} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ abroad: v })} />}
        <DateField label="Date on the notice" value={x.notice} onChange={(v) => upd({ notice: v })} />
        {ap.length > 0 && <ul className="space-y-2">{ap.map((a) => <li key={a.id}><span className="font-mono font-semibold">{a.date}</span> {a.label} <span className="text-xs text-muted-foreground">({a.cite})</span></li>)}</ul>}
        <p className="text-xs text-muted-foreground">The last day printed on a notice of deficiency controls if it is later.</p>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">{US_TAX_NOTE} As of {US_TAX_AS_OF}.</p>
    </div>
  );
}
