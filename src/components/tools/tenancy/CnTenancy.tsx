// 中国大陆住房租赁：租期、书面形式、押金条款与解除通知。计算：lib/world-tenancy-pack-2026.ts
import { useState } from "react";
import { TENANCY_AS_OF, cnTenancy } from "../../../lib/world-tenancy-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "china-rental-contract-deposit-check";

export default function CnTenancy() {
  const [x, setX] = useState({ termMonths: 12, written: true, deposit: 3000, rent: 3000, returnDays: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = cnTenancy(x);
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="zh"
      currency="CNY"
      curve={{
        title: "约定租期与有效租期", caption: "租期最长20年，超过部分无效。",
        xLabel: "约定租期", yLabel: "有效租期", min: 0, max: 30, step: 1, current: x.termMonths / 12,
        f: (y) => Math.min(y, 20), formatX: (y) => `${Math.round(y)}年`, formatY: (y) => `${Math.round(y)}年`,
        onPick: (y) => upd({ termMonths: y * 12 }), marks: [{ at: 20, label: "20年" }],
      }}
    >
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="租期" value={x.termMonths} onChange={(v) => upd({ termMonths: Math.round(v) })} suffix="个月" />
        <NumberField label="月租金" value={x.rent} onChange={(v) => upd({ rent: v })} suffix="元" step={100} />
        <NumberField label="押金" value={x.deposit} onChange={(v) => upd({ deposit: v })} suffix="元" step={100} />
        {mode === "expert" && <NumberField label="合同写明的押金返还天数（没写填0）" value={x.returnDays} onChange={(v) => upd({ returnDays: Math.round(v) })} suffix="天" />}
      </div>
      <ChoiceChips<"y" | "n"> legend="有书面合同吗？" value={x.written ? "y" : "n"} options={[{ value: "y", label: "有" }, { value: "n", label: "没有" }]} onChange={(v) => upd({ written: v === "y" })} />
      <LaborResult mode={mode} headline={`押金为月租金的${r.depositMonths}倍（全国没有上限，看合同）`} sub={`有效租期 ${Math.round(r.validMonths)} 个月`} items={r.items} dates={[]} datesTitle="日期" note={`一般信息，依据《住房租赁条例》（2025年9月15日施行）和《民法典》。不构成法律意见。各城市可能另有规定，可拨打当地12345热线咨询。更新于 ${TENANCY_AS_OF}。您输入的数据不会离开浏览器。`} />
    </>
      )}
    </CurveShell>
  );
}
