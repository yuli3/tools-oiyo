// 令和8年分 確定申告（2027年2/16〜3/15）の還付・納付の目安。計算: lib/world-tax-season-2027.ts
import { useState } from "react";
import { jpKakutei2026, SEASON_AS_OF } from "../../../lib/world-tax-season-2027";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { useToday } from "../nts/Items";

const TOOL_ID = "kakutei-shinkoku-2027-calculator";
const yen = (n: number) => `${n < 0 ? "−" : ""}${Math.abs(Math.round(n)).toLocaleString("ja-JP")}円`;

export default function JpKakutei2026() {
  const today = useToday() ?? SEASON_AS_OF;
  const [x, setX] = useState({ salary: 5_000_000, withheld: 120_000, social: 750_000, medical: 0, donation: 0, otherIncome: 0, otherDeductions: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpKakutei2026({ ...x, today });
  const when = r.daysToOpen > 0 ? `受付開始まであと${r.daysToOpen}日（還付申告はそれ以前も可）` : r.daysLeft >= 0 ? `期限まであと${r.daysLeft}日` : `期限から${-r.daysLeft}日経過`;
  return (
    <CurveShell toolId={TOOL_ID} lang="ja" currency="JPY"
      curve={{ title: "医療費と還付額", caption: "源泉徴収票の金額のまま、1年間の医療費を変えたときの還付（＋）・納付（−）。", xLabel: "1年間の医療費（補填後）", yLabel: "還付（＋）／納付（−）", min: 0, max: 1_000_000, step: 10_000, current: Math.min(1_000_000, x.medical), f: (m) => jpKakutei2026({ ...x, medical: m, today }).refund, formatX: yen, formatY: yen, onPick: (m) => upd({ medical: Math.round(m / 1000) * 1000 }), marks: [{ at: 100_000, label: "10万円" }] }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="支払金額（源泉徴収票）" value={x.salary} onChange={(v) => upd({ salary: v })} step={10_000} suffix="円" />
            <NumberField label="源泉徴収税額（源泉徴収票）" value={x.withheld} onChange={(v) => upd({ withheld: v })} step={1_000} suffix="円" />
            <NumberField label="社会保険料等の金額（源泉徴収票）" value={x.social} onChange={(v) => upd({ social: v })} step={10_000} suffix="円" />
            <NumberField label="1年間の医療費（保険金などの補填を引く）" value={x.medical} onChange={(v) => upd({ medical: v })} step={10_000} suffix="円" />
            <NumberField label="ふるさと納税・寄附の合計" value={x.donation} onChange={(v) => upd({ donation: v })} step={10_000} suffix="円" />
            {mode === "expert" && <NumberField label="給与以外の所得（副業の雑所得など）" value={x.otherIncome} onChange={(v) => upd({ otherIncome: v })} step={10_000} suffix="円" />}
            {mode === "expert" && <NumberField label="その他の所得控除（配偶者・扶養・生命保険料など）" value={x.otherDeductions} onChange={(v) => upd({ otherDeductions: v })} step={10_000} suffix="円" />}
          </div>
          <LaborResult mode={mode} headline={r.owe ? `納付の目安 ${yen(-r.refund)}` : r.refund > 0 ? `還付の目安 ${yen(r.refund)}` : "還付・納付はほぼありません"} sub={`所得税（復興特別所得税込み）${yen(r.tax)} · 源泉徴収 ${yen(r.withheld)} · 期限 ${r.due}（${when}）`} items={r.items} dates={[]} datesTitle="" note={`国税庁の公表資料と所得税法の条文に基づく概算です。税務相談や申告書の作成・提出の代行ではありません。基準日 ${SEASON_AS_OF}。入力値はサーバーに送りません。`} />
        </>
      )}
    </CurveShell>
  );
}
