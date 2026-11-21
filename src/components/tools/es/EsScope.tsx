// Quién puede ayudarte con tus impuestos y qué hace este sitio. Datos: lib/es-tax-pack-2026.ts ES_SCOPE
import { ES_SCOPE } from "../../../lib/es-tax-pack-2026";

export default function EsScope() {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {ES_SCOPE.map((s) => (
          <li key={s.title} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{s.title}</p>
            <p className="mt-1">{s.body}</p>
            {s.cite !== "—" && <p className="mt-1 text-xs text-muted-foreground">{s.cite}</p>}
          </li>
        ))}
      </ul>
      <p className="text-sm">Los mismos cálculos en Claude: <a href="/downloads/oiyo-es-tax-guide-skill.zip" className="text-primary underline underline-offset-4">skill «guía fiscal y contable España» (zip)</a>, o las herramientas <code>*_es_*</code> del servidor MCP <span className="break-all font-mono">https://api.oiyo.net/mcp</span>.</p>
    </div>
  );
}
