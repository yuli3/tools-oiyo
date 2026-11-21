// Who may advise and represent before the IRS (what this site does). Data: lib/us-tax-pack-2026.ts US_SCOPE
import { US_SCOPE } from "../../../lib/us-tax-pack-2026";

export default function UsScope() {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {US_SCOPE.map((s) => (
          <li key={s.title} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{s.title}</p>
            <p className="mt-1">{s.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.cite}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm">Use the same math in Claude: <a href="/downloads/oiyo-us-tax-guide-skill.zip" className="text-primary underline underline-offset-4">US tax and accounting guide skill (zip)</a>, or the <code>*_us_*</code> tools on the MCP server <span className="break-all font-mono">https://api.oiyo.net/mcp</span>.</p>
    </div>
  );
}
