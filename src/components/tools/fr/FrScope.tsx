// Qui peut conseiller et tenir la comptabilité (ce que fait ce site). Données : lib/fr-tax-pack-2026.ts FR_SCOPE
import { FR_SCOPE } from "../../../lib/fr-tax-pack-2026";

export default function FrScope() {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {FR_SCOPE.map((s) => (
          <li key={s.title} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{s.title}</p>
            <p className="mt-1">{s.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.cite}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm">Les mêmes calculs dans Claude : <a href="/downloads/oiyo-fr-tax-guide-skill.zip" className="text-primary underline underline-offset-4">compétence « guide fiscal et comptable France » (zip)</a>, ou les outils <code>*_fr_*</code> du serveur MCP <span className="break-all font-mono">https://api.oiyo.net/mcp</span>.</p>
    </div>
  );
}
