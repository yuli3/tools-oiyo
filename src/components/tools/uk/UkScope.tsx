// Who can deal with HMRC for you, free help, and what this site does. Data: lib/uk-tax-pack-2026.ts UK_SCOPE
import { UK_SCOPE } from "../../../lib/uk-tax-pack-2026";

export default function UkScope() {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {UK_SCOPE.map((s) => (
          <li key={s.title} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{s.title}</p>
            <p className="mt-1">{s.body}</p>
            {s.cite !== "—" && <p className="mt-1 text-xs text-muted-foreground">{s.cite}</p>}
          </li>
        ))}
      </ul>
      <p className="text-sm">Use the same calculations in Claude: the <a href="/downloads/oiyo-uk-tax-guide-skill.zip" className="text-primary underline underline-offset-4">UK tax and accounting guide skill (zip)</a>, or the <code>*_uk_*</code> tools on the MCP server <span className="break-all font-mono">https://api.oiyo.net/mcp</span>.</p>
    </div>
  );
}
