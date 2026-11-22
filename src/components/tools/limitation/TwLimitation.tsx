// 台灣消滅時效與小額訴訟。計算：lib/world-limitation-pack-2026.ts
import { useState } from "react";
import { LIMITATION_AS_OF, TW_YEARS, twLimitation, type TwClaim } from "../../../lib/world-limitation-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { TW_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";
import { limitCurve } from "./LimitCurve";

const TOOL_ID = "taiwan-statute-limitation-small-claims";

export default function TwLimitation() {
  const [x, setX] = useState({ claim: "shortTwoYear" as TwClaim, start: "2025-03-01", amount: 80_000, today: "2026-11-22", elapsed: 1 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twLimitation({ claim: x.claim, start: x.start || undefined, amount: x.amount, today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="zh" currency="TWD" text={TW_VIZ_TEXT}
      curve={limitCurve({ start: x.start, deadline: r.deadline, title: "經過年數與時效剩餘年數", caption: `時效 ${TW_YEARS[x.claim].years} 年。`, xLabel: "經過年數", yLabel: "剩餘年數", unit: (n) => `${n}年`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 15 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<TwClaim> legend="哪一種請求？" value={x.claim} options={[{ value: "shortTwoYear", label: "商品貨款、住宿餐飲、醫師律師費等（2年）" }, { value: "periodic", label: "利息、租金、贍養費等定期給付（5年）" }, { value: "general", label: "其他一般請求（15年）" }]} onChange={(v) => upd({ claim: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="請求權可以行使的日期（例如應付款日）" value={x.start} onChange={(v) => upd({ start: v })} />
            <NumberField label="請求金額" value={x.amount} onChange={(v) => upd({ amount: v })} suffix="元" step={1_000} />
            {mode === "expert" && <DateField label="今天日期" value={x.today} onChange={(v) => upd({ today: v })} />}
          </div>
          <LaborResult mode={mode} headline={r.deadline ? `時效完成日 ${r.deadline}${r.status === "expired" ? "（已經過了）" : ""}` : "填入日期即可試算"} items={r.items} dates={r.dates} datesTitle="日期" note={`一般資訊，依據民法第125至128條與司法院小額訴訟問答。非法律意見。更新於 ${LIMITATION_AS_OF}。您輸入的資料不會離開瀏覽器。`} />
        </>
      )}
    </CurveShell>
  );
}
