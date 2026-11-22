// World law intake: pick a country, type a question in any language, see the matching local tool and free help.
// Data and matching: lib/world-law-intake-2026.ts (same code as the oiyo-world-law-intake skill and start_world_law_intake MCP tool).
import { useMemo, useState } from "react";
import { intake, WORLD_TOOLS, HELP, type Country } from "../../../lib/world-law-intake-2026";

const COUNTRIES: [Country, string][] = [["JP", "🇯🇵 Japan"], ["US", "🇺🇸 United States (CA, NY)"], ["FR", "🇫🇷 France"], ["ES", "🇪🇸 Spain"], ["CN", "🇨🇳 China mainland"], ["UK", "🇬🇧 United Kingdom (England)"], ["TW", "🇹🇼 Taiwan"]];
const AREA: Record<string, string> = { tax: "Tax", labor: "Job ending", tenancy: "Renting" };

export default function WorldIntake() {
  const [country, setCountry] = useState<Country>("JP");
  const [q, setQ] = useState("");
  const r = useMemo(() => intake({ country, question: q }), [country, q]);
  const tools = WORLD_TOOLS.filter((w) => w.country === country);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-[14rem_1fr]">
        <label className="text-sm font-medium">Country
          <select value={country} onChange={(e) => setCountry(e.target.value as Country)} className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-base">
            {COUNTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Your question, in any language
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="敷金が返ってこない / my landlord kept my deposit / me han despedido" className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
        </label>
      </div>
      {q && (
        <div className="rounded-md border border-border bg-card px-4 py-3 text-sm" aria-live="polite">
          {r.matches.length ? (
            <ol className="space-y-2">
              {r.matches.map((m, i) => (
                <li key={m.mcp}><span className="font-semibold">{i === 0 ? "Best match: " : "Also: "}</span><a href={m.page} className="text-primary underline underline-offset-4">{m.title}</a> <span className="text-xs text-muted-foreground">({AREA[m.area]} · MCP <code>{m.mcp}</code>)</span></li>
              ))}
            </ol>
          ) : <p>No tool matched those words yet. Pick one from the list below.</p>}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {(["tax", "labor", "tenancy"] as const).map((a) => (
          <section key={a} className="rounded-md border border-border px-4 py-3 text-sm">
            <h3 className="font-semibold">{AREA[a]}</h3>
            <ul className="mt-2 space-y-1">
              {tools.filter((w) => w.area === a).map((w) => <li key={w.mcp}><a href={w.page} className="text-primary underline underline-offset-4">{w.title}</a></li>)}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Free help: {HELP[country][a]}</p>
          </section>
        ))}
      </div>
      <p className="text-sm">Use it in Claude: <a href="/downloads/oiyo-world-law-intake-skill.zip" className="text-primary underline underline-offset-4">world law intake skill (zip)</a>, or <code>start_world_law_intake</code> on the MCP server <span className="break-all font-mono">https://api.oiyo.net/mcp</span>.</p>
    </div>
  );
}
