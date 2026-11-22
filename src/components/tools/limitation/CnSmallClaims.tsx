// 小额诉讼适用判断（民事诉讼法第165条）。计算：lib/world-limitation-pack-2026.ts
import { useState } from "react";
import { LIMITATION_AS_OF, cnSmallClaims } from "../../../lib/world-limitation-pack-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "china-small-claims-threshold";
const cny = (n: number) => `${Math.round(n).toLocaleString("zh-CN")}元`;

export default function CnSmallClaims() {
  const [x, setX] = useState({ amount: 30_000, wage: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = cnSmallClaims({ amount: x.amount, provincialAverageWage: x.wage || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="zh" currency="CNY"
      curve={{ title: "当地年平均工资与小额诉讼上限", caption: "上限 = 本省上年度就业人员年平均工资 × 50%；约定适用最高 × 2。", xLabel: "年平均工资", yLabel: "小额诉讼上限", min: 50_000, max: 250_000, step: 5_000, current: x.wage || 100_000, f: (w) => w * 0.5, formatX: cny, formatY: cny, onPick: (v) => upd({ wage: v }) }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="请求金额（标的额）" value={x.amount} onChange={(v) => upd({ amount: v })} suffix="元" step={1_000} />
            <NumberField label="本省上年度就业人员年平均工资（当地公布数）" value={x.wage} onChange={(v) => upd({ wage: v })} suffix="元" step={1_000} />
          </div>
          <LaborResult mode={mode} headline={r.route === "small" ? "可以适用小额诉讼（一审终审）" : r.route === "byAgreement" ? "双方约定后可以适用小额诉讼" : r.route === "ordinary" ? "不适用小额诉讼" : "请输入当地年平均工资"} items={r.items} dates={r.dates} datesTitle="日期" note={`一般信息，依据《民事诉讼法》第165条（2021年修改，中国政府网）。年平均工资请以本省统计部门公布数为准。不是法律意见。更新于 ${LIMITATION_AS_OF}。您输入的内容不会离开浏览器。`} />
        </>
      )}
    </CurveShell>
  );
}
