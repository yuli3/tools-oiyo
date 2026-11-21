// US federal tax deadline calendar (2026-11-21, per-country localization: US). Logic: lib/us-tax-pack-2026.ts (same code as skill calc calendar)
import { useState } from "react";
import { US_TAX_AS_OF, US_TAX_NOTE, usTaxCalendar } from "../../../lib/us-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { useToday } from "../nts/Items";

const TOOL_ID = "us-tax-deadline-calendar";
type YN = "y" | "n";
type Entity = "none" | "partnership" | "scorp" | "ccorp";
const yn = [{ value: "y", label: "Yes" }, { value: "n", label: "No" }] as const;

export default function UsTaxCalendar() {
  const today = useToday();
  const [x, setX] = useState({ year: 2026, se: "y" as YN, nec: "n" as YN, ext: "n" as YN, entity: "none" as Entity });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usTaxCalendar({ taxYear: x.year, selfEmployed: x.se === "y", pays1099: x.nec === "y", extension: x.ext === "y", entity: x.entity, today });
  return (
    <div className="space-y-5">
      <NumberField label="Tax year" value={x.year} onChange={(v) => upd({ year: Math.min(2030, Math.max(2025, Math.round(v) || 2026)) })} />
      <ChoiceChips<YN> legend="Self-employed or freelance income (estimated tax)?" value={x.se} options={yn} onChange={(v) => upd({ se: v })} />
      <ChoiceChips<YN> legend="Did you pay contractors $600 or more (Form 1099-NEC)?" value={x.nec} options={yn} onChange={(v) => upd({ nec: v })} />
      <ChoiceChips<YN> legend="Will you file an extension (Form 4868)?" value={x.ext} options={yn} onChange={(v) => upd({ ext: v })} />
      <ChoiceChips<Entity> legend="Business entity return" value={x.entity} options={[{ value: "none", label: "None / Schedule C" }, { value: "partnership", label: "Partnership (1065)" }, { value: "scorp", label: "S corporation (1120-S)" }, { value: "ccorp", label: "C corporation (1120)" }]} onChange={(v) => upd({ entity: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <ol className="space-y-3">
          {r.events.map((e) => (
            <li key={e.id}>
              <p className="font-semibold text-foreground"><span className="font-mono">{e.date}</span>{e.daysLeft != null && <span className="ml-2 font-normal text-muted-foreground">{e.daysLeft >= 0 ? `${e.daysLeft} days left` : `${-e.daysLeft} days ago`}</span>}</p>
              <p>{e.label}{e.date !== e.nominal && <span className="text-muted-foreground"> (normally {e.nominal}; moved for a weekend or legal holiday)</span>} <span className="text-xs text-muted-foreground">({e.cite})</span></p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-muted-foreground">{r.note}</p>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{US_TAX_NOTE} As of {US_TAX_AS_OF}. Inputs stay in your browser.</p>
    </div>
  );
}
