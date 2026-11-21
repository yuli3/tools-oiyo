// 青色申告特別控除の比較 (2026-11-21)。計算: lib/jp-tax-pack-2026.ts
import { useState } from "react";
import { JP_TAX_AS_OF, JP_TAX_NOTE, jpBlueReturn } from "../../../lib/jp-tax-pack-2026";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "jp-blue-return-deduction";
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;

export default function JpBlueReturn() {
  const [x, setX] = useState({ income: 5_000_000, other: 600_000 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpBlueReturn({ income: Math.max(0, x.income), otherDeductions: Math.max(0, x.other) });
  const max = Math.max(1, r.rows[0].total);
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ja"
      currency="JPY"
      curve={{
        title: "事業所得による青色65万円控除の節税額", caption: "白色申告との差（所得税＋住民税所得割）。所得が高いほど税率が上がるので差も広がります。",
        xLabel: "事業所得", yLabel: "年間の節税額", min: 0, max: 20000000, step: 250000, current: x.income,
        f: (v) => jpBlueReturn({ income: v, otherDeductions: Math.max(0, x.other) }).rows[3].saving, formatX: (v) => `${Math.round(v / 10_000)}万円`, formatY: (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`,
        onPick: (v) => upd({ income: v }), marks: [],
      }}
    >
      {() => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="事業所得（売上 − 経費、控除前）" value={x.income} onChange={(v) => upd({ income: v })} suffix="円" step={10000} />
        <NumberField label="社会保険料など、基礎控除以外の所得控除" value={x.other} onChange={(v) => upd({ other: v })} suffix="円" step={10000} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">65万円控除なら白色より年 約{yen(r.rows[3].saving)} 少なくなります（推定）</p>
        <ul className="mt-3 space-y-3">
          {r.rows.map((row) => (
            <li key={row.id}>
              <div className="flex flex-wrap justify-between gap-2"><span className="font-semibold">{row.label}</span><span className="font-mono">{yen(row.total)}</span></div>
              <progress className="mt-1 h-2 w-full accent-(--primary)" max={max} value={row.total} aria-label={`${row.label} の税額`} />
              <p className="mt-1 text-xs text-muted-foreground">所得税 {yen(row.incomeTax)} ・ 住民税所得割 {yen(row.residentTax)} ・ {row.need}</p>
            </li>
          ))}
        </ul>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{JP_TAX_NOTE} 所得税は令和8年分の基礎控除と復興特別所得税2.1%を含み、住民税は均等割を含みません。基準日 {JP_TAX_AS_OF}。</p>
    </>
      )}
    </CurveShell>
  );
}
