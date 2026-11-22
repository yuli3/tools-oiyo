// 网购七日无理由退货期限。计算：lib/world-consumer-pack-2026.ts
import { useState } from "react";
import { CONSUMER_AS_OF, cnCoolingOff, type CnExcluded } from "../../../lib/world-consumer-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { coolingCurve } from "./CoolingCurve";

const TOOL_ID = "china-7-day-return-deadline";

export default function CnCoolingOff() {
  const [x, setX] = useState({ online: true, signedFor: "2026-11-20", excluded: "none" as CnExcluded, returnReceived: "", elapsed: 2 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = cnCoolingOff({ online: x.online, signedFor: x.signedFor || undefined, excluded: x.excluded, returnReceived: x.returnReceived || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="zh" currency="CNY"
      curve={coolingCurve({ start: x.signedFor, lastDay: r.lastDay, title: "签收后还剩几天可以无理由退货", caption: "自签收次日起算七日。", xLabel: "签收后天数", yLabel: "剩余天数", unit: (n) => `${Math.round(n)}天`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 10 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<"y" | "n"> legend="是网上、电视、电话或邮购买的吗？" value={x.online ? "y" : "n"} options={[{ value: "y", label: "是" }, { value: "n", label: "实体店" }]} onChange={(v) => upd({ online: v === "y" })} />
          {x.online && <DateField label="签收日期" value={x.signedFor} onChange={(v) => upd({ signedFor: v })} />}
          {x.online && <ChoiceChips<CnExcluded> legend="商品属于下列哪类？" value={x.excluded} options={[{ value: "none", label: "都不是" }, { value: "custom", label: "定作" }, { value: "perishable", label: "鲜活易腐" }, { value: "digitalOpened", label: "已下载或拆封的数字商品" }, { value: "newspaper", label: "报纸期刊" }, { value: "safetyOpened", label: "拆封影响安全健康" }, { value: "activated", label: "已激活或试用" }, { value: "nearExpiry", label: "临近保质期或有瑕疵" }]} onChange={(v) => upd({ excluded: v })} />}
          {mode === "expert" && x.online && <DateField label="商家收到退回商品的日期" value={x.returnReceived} onChange={(v) => upd({ returnReceived: v })} />}
          <LaborResult mode={mode} headline={r.lastDay ? `${r.lastDay} 前可以七日无理由退货` : x.online ? "这类商品不适用七日无理由退货" : "实体店购物看商家承诺"} items={r.items} dates={r.dates} datesTitle="日期" note={`一般信息，依据《消费者权益保护法》第25条和《网络购买商品七日无理由退货暂行办法》。不是法律意见。投诉可通过12315平台。更新于 ${CONSUMER_AS_OF}。您输入的内容不会离开浏览器。`} />
        </>
      )}
    </CurveShell>
  );
}
