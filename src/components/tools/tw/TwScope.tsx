// 誰可以代理稅務、免費管道，以及本網站做什麼。資料：lib/tw-tax-pack-2026.ts TW_SCOPE
import { TW_SCOPE } from "../../../lib/tw-tax-pack-2026";

export default function TwScope() {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {TW_SCOPE.map((s) => (
          <li key={s.title} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{s.title}</p>
            <p className="mt-1">{s.body}</p>
            {s.cite !== "—" && <p className="mt-1 text-xs text-muted-foreground">{s.cite}</p>}
          </li>
        ))}
      </ul>
      <p className="text-sm">在 Claude 中使用同樣的計算：<a href="/downloads/oiyo-tw-tax-guide-skill.zip" className="text-primary underline underline-offset-4">「臺灣稅務與會計指南」技能（zip）</a>，或 MCP 伺服器 <span className="break-all font-mono">https://api.oiyo.net/mcp</span> 的 <code>*_tw_*</code> 工具。</p>
    </div>
  );
}
