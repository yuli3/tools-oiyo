// Japan インボイス 経過措置: deductible share for purchases from 免税事業者. Logic: lib/world-einvoice-pack-2026.ts
import { useState } from "react";
import { EINVOICE_AS_OF, jpInvoiceTransition, jpTransitionRate } from "../../../lib/world-einvoice-pack-2026";
import LaborResult from "../labor/LaborResult";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "japan-invoice-keika-sochi-70";
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;
const START = Date.UTC(2023, 9, 1);
const monthToDate = (m: number) => { const d = new Date(START); d.setUTCMonth(d.getUTCMonth() + Math.round(m)); return d.toISOString().slice(0, 10); };
const dateToMonth = (s: string) => { const d = new Date(Date.parse(s)); return Number.isNaN(d.getTime()) ? 0 : (d.getUTCFullYear() - 2023) * 12 + d.getUTCMonth() - 9; };

export default function JpInvoiceTransition() {
  const [x, setX] = useState({ purchaseDate: "2026-11-22", taxAmount: 10_000 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpInvoiceTransition(x);
  return (
    <CurveShell toolId={TOOL_ID} lang="ja" currency="JPY"
      curve={{ title: "仕入れの時期と控除できる割合", caption: "80% → 70%（令和8年10月〜）→ 50% → 30% → 0%。", xLabel: "仕入れの時期", yLabel: "控除できる割合", min: 0, max: 108, step: 1, current: Math.max(0, Math.min(108, dateToMonth(x.purchaseDate))), f: (m) => jpTransitionRate(monthToDate(m)), formatX: (m) => monthToDate(m).slice(0, 7), formatY: (n) => `${n}%`, onPick: (m) => upd({ purchaseDate: monthToDate(m) }), marks: [{ at: 36, label: "70%" }, { at: 60, label: "50%" }, { at: 84, label: "30%" }, { at: 96, label: "0%" }] }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="仕入れの日（物品は引渡日、役務は完了日）" value={x.purchaseDate} onChange={(v) => upd({ purchaseDate: v })} />
            <NumberField label="仕入れに含まれる消費税相当額" value={x.taxAmount} onChange={(v) => upd({ taxAmount: v })} suffix="円" step={1_000} />
          </div>
          <LaborResult mode={mode} headline={`控除できるのは ${r.rate}%（${yen(r.deductible)}）`} sub={`控除できない額 ${yen(r.notDeductible)}`} items={r.items} dates={r.dates} datesTitle="経過措置の期間" note={`国税庁 Q&A 問113-3（令和8年4月追加）による一般的な目安です。税務の助言ではありません。更新 ${EINVOICE_AS_OF}。入力はブラウザの外に送りません。`} />
        </>
      )}
    </CurveShell>
  );
}
