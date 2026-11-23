// Turkey thaw + roast planner (en, 2026-11-23). Math: lib/turkey.ts (USDA FSIS timetable).
import { useState } from "react";
import { LB_PER_KG, MAX_LB, plan, roastHours, suggestLb, type Thaw } from "../../../lib/turkey";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import { VizLangProvider } from "../viz/i18n";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { track } from "../viz/track";

const TOOL = "turkey-calculator";
const field = "mt-1 min-h-11 w-full min-w-0 rounded-md border border-border bg-background px-3 text-base text-foreground";
const hrs = (h: number) => {
  const whole = Math.floor(h);
  const m = Math.round((h - whole) * 60);
  return m ? `${whole} h ${m} min` : `${whole} h`;
};
const when = (d: Date) => d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const days = (h: number) => (h >= 24 ? `${h / 24} days` : hrs(h));

function Chips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-sm font-medium text-muted-foreground">{label}</legend>
      <div role="group" className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1 sm:grid-cols-3">
        {options.map(([k, l]) => (
          <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}
            className={"min-h-11 rounded-md px-2 text-sm " + (value === k ? "bg-background font-semibold text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function TurkeyPlanner() {
  const [mode, setMode] = useAdvisoryMode(TOOL);
  const easy = mode === "easy";
  const [guests, setGuests] = useState(10);
  const [leftovers, setLeftovers] = useState(true);
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [weight, setWeight] = useState(15);
  const [stuffed, setStuffed] = useState(false);
  const [thaw, setThaw] = useState<Thaw>("fridge");
  const [carve, setCarve] = useState("2026-11-26T17:00");
  const [touched, setTouched] = useState(false);
  const touch = () => {
    if (!touched) {
      setTouched(true);
      track("tool_input", { tool_id: TOOL, mode });
    }
  };

  const lb = easy ? suggestLb(guests, leftovers) : unit === "kg" ? weight * LB_PER_KG : weight;
  const p = plan(lb, stuffed, thaw, new Date(carve));
  const kg = (lb / LB_PER_KG).toFixed(1);
  const both = roastHours(lb, false) && roastHours(lb, true);

  return (
    <VizLangProvider value={{ lang: "en", currency: "USD" }}>
      <div className="space-y-5" data-tool={TOOL}>
        <ModeToggle mode={mode} onChange={setMode} />

        <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
          {easy ? (
            <>
              <NumberField label="Guests" value={guests} onChange={(v) => { touch(); setGuests(v); }} min={1} />
              <Chips label="Leftovers?" value={leftovers ? "y" : "n"} options={[["y", "Yes, plenty"], ["n", "Just dinner"]]} onChange={(v) => { touch(); setLeftovers(v === "y"); }} />
            </>
          ) : (
            <>
              <NumberField label="Turkey weight" value={weight} onChange={(v) => { touch(); setWeight(v); }} suffix={unit} step={0.5} min={0} />
              <Chips label="Unit" value={unit} options={[["lb", "Pounds (lb)"], ["kg", "Kilograms (kg)"]]} onChange={(v) => { touch(); setUnit(v); }} />
            </>
          )}
          <Chips label="Stuffed inside the bird?" value={stuffed ? "y" : "n"} options={[["n", "Unstuffed"], ["y", "Stuffed"]]} onChange={(v) => { touch(); setStuffed(v === "y"); }} />
          <Chips label="Turkey is now" value={thaw} options={[["fridge", "Frozen: fridge thaw"], ["water", "Frozen: cold water"], ["thawed", "Fresh / thawed"]]} onChange={(v) => { touch(); setThaw(v); }} />
          <label className="block text-sm font-medium text-muted-foreground sm:col-span-2">
            When do you want to carve?
            <input type="datetime-local" className={field} value={carve} onChange={(e) => { touch(); setCarve(e.target.value); }} />
          </label>
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-muted p-4" aria-live="polite">
          {p ? (
            <>
              <p className="text-base font-semibold text-foreground">
                {easy ? `Buy about a ${Math.round(lb)} lb (${kg} kg) turkey. ` : ""}
                Put it in a 325°F (163°C) oven by {when(p.ovenIn)} and plan on about {hrs(p.roast.min)} to {hrs(p.roast.max)} (estimate).
              </p>
              <ol className="space-y-2 text-sm text-foreground">
                {p.thawStart && (
                  <li><strong>{when(p.thawStart)}</strong> — start thawing {thaw === "fridge" ? `in the fridge (${days(p.thaw)})` : `in cold water (${hrs(p.thaw)}, change the water every 30 minutes, then cook right away)`}.</li>
                )}
                <li><strong>{when(p.ovenIn)}</strong> — oven in at 325°F. Giblets out.</li>
                <li><strong>{when(p.checkFrom)}</strong> — start checking: 165°F (74°C) in the thickest part of the inner thigh, not touching bone{stuffed ? ", and 165°F in the center of the stuffing" : ""}.</li>
                <li><strong>{when(p.restFrom)}</strong> — out of the oven, rest 20 minutes.</li>
                <li><strong>{when(new Date(carve))}</strong> — carve.</li>
              </ol>
              {p.thawStart && thaw === "fridge" && p.thawStart.getTime() < Date.now() && (
                <p className="text-sm font-semibold text-foreground">That thaw start has already passed. Cold water takes about {hrs(Math.ceil(lb) * 0.5)} instead, or roast it straight from frozen and allow at least 50% longer (USDA).</p>
              )}
              {!p.roast.inTable && <p className="text-sm text-foreground">{lb > MAX_LB ? "Over 24 lb is past the USDA table: the times shown are the 20–24 lb row, so start early and go by the thermometer." : "Under 4 lb is below the table: go by the thermometer."}</p>}
              {thaw === "fridge" && p.thaw > 0 && <p className="text-sm text-muted-foreground">Fridge thawing uses 24 hours per 4 lb, the slow end of USDA’s 4–5 lb. A thawed turkey keeps 1–2 more days in the fridge.</p>}
            </>
          ) : (
            <p>Enter a weight above 0 and a carving time.</p>
          )}
        </section>

        {both && !easy && (
          <CompareBars
            title="Longest roast time at this weight"
            caption="Upper end of the USDA 325°F timetable. Stuffing slows the bird down."
            items={[
              { label: "Unstuffed", value: roastHours(lb, false)!.max, current: !stuffed },
              { label: "Stuffed", value: roastHours(lb, true)!.max, current: stuffed },
            ]}
            format={hrs}
          />
        )}
      </div>
    </VizLangProvider>
  );
}
