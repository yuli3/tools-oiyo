// 台灣七日解約權（消費者保護法第19條）。計算：lib/world-consumer-pack-2026.ts
import { useState } from "react";
import { CONSUMER_AS_OF, twCoolingOff } from "../../../lib/world-consumer-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell, { TW_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";
import { coolingCurve } from "./CoolingCurve";

const TOOL_ID = "taiwan-7-day-cancellation";
type Ch = "mail" | "visit" | "store";

export default function TwCoolingOff() {
  const [x, setX] = useState({ channel: "mail" as Ch, received: "2026-11-20", infoGiven: true, infoDate: "", noticeOrReturn: "", elapsed: 2 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twCoolingOff({ channel: x.channel, received: x.received || undefined, infoGiven: x.infoGiven, infoDate: x.infoDate || undefined, noticeOrReturn: x.noticeOrReturn || undefined });
  const start = x.infoGiven ? x.received : x.infoDate;
  return (
    <CurveShell toolId={TOOL_ID} lang="zh" currency="TWD" text={TW_VIZ_TEXT}
      curve={coolingCurve({ start, lastDay: r.lastDay, title: "收到商品後還剩幾天可以解約", caption: "收受之次日起算七日。", xLabel: "收到後天數", yLabel: "剩餘天數", unit: (n) => `${Math.round(n)}天`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 10 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<Ch> legend="怎麼買的？" value={x.channel} options={[{ value: "mail", label: "網購、電視或郵購" }, { value: "visit", label: "到府推銷" }, { value: "store", label: "店面" }]} onChange={(v) => upd({ channel: v })} />
          {x.channel !== "store" && <DateField label="收到商品（或接受服務）的日期" value={x.received} onChange={(v) => upd({ received: v })} />}
          {mode === "expert" && x.channel !== "store" && <ChoiceChips<"y" | "n"> legend="企業有告知解約期間與方式嗎？" value={x.infoGiven ? "y" : "n"} options={[{ value: "y", label: "有" }, { value: "n", label: "沒有" }]} onChange={(v) => upd({ infoGiven: v === "y" })} />}
          {mode === "expert" && !x.infoGiven && <DateField label="企業補行告知的日期" value={x.infoDate} onChange={(v) => upd({ infoDate: v })} />}
          {mode === "expert" && x.channel !== "store" && <DateField label="通知解約或退回商品的日期" value={x.noticeOrReturn} onChange={(v) => upd({ noticeOrReturn: v })} />}
          <LaborResult mode={mode} headline={r.lastDay ? `${r.lastDay} 前可以解除契約` : x.channel === "store" ? "店面購買不適用七日解約" : "收到後七日內可以解約"} items={r.items} dates={r.dates} datesTitle="日期" note={`一般資訊，依據《消費者保護法》第19條、第19條之2與民法第120條、第122條。非法律意見。消費爭議可向行政院消費者保護會或縣市消費者服務中心申訴。更新於 ${CONSUMER_AS_OF}。您輸入的資料不會離開瀏覽器。`} />
        </>
      )}
    </CurveShell>
  );
}
