// 税理士法の業務範囲（このサイトが扱う範囲の説明）。データ: lib/jp-tax-pack-2026.ts JP_SCOPE
import { JP_SCOPE } from "../../../lib/jp-tax-pack-2026";

export default function JpScope() {
  return (
    <div className="space-y-4">
    <ul className="space-y-3">
      {JP_SCOPE.map((s) => (
        <li key={s.title} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">{s.title}</p>
          <p className="mt-1">{s.body}</p>
          <p className="mt-1 text-xs text-muted-foreground">{s.cite}</p>
        </li>
      ))}
    </ul>
    <p className="text-sm">Claude で同じ計算を使う: <a href="/downloads/oiyo-jp-tax-guide-skill.zip" className="text-primary underline underline-offset-4">日本の税務・会計ガイド スキル（zip）</a>、MCP は <span className="break-all font-mono">https://api.oiyo.net/mcp</span> の <code>*_jp_*</code> ツール。</p>
    </div>
  );
}
