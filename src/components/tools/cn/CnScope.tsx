// 谁可以提供涉税专业服务，以及本网站做什么。数据：lib/cn-tax-pack-2026.ts CN_SCOPE
import { CN_SCOPE } from "../../../lib/cn-tax-pack-2026";

export default function CnScope() {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {CN_SCOPE.map((s) => (
          <li key={s.title} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{s.title}</p>
            <p className="mt-1">{s.body}</p>
            {s.cite !== "—" && <p className="mt-1 text-xs text-muted-foreground">{s.cite}</p>}
          </li>
        ))}
      </ul>
      <p className="text-sm">在 Claude 中使用同样的计算：<a href="/downloads/oiyo-cn-tax-guide-skill.zip" className="text-primary underline underline-offset-4">“中国税务与会计指南”技能（zip）</a>，或 MCP 服务器 <span className="break-all font-mono">https://api.oiyo.net/mcp</span> 的 <code>*_cn_*</code> 工具。</p>
    </div>
  );
}
