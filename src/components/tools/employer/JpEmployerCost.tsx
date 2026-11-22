// Japan employer social insurance cost. Logic: lib/world-employer-cost-pack-2026.ts
import { useState } from "react";
import { EMPLOYER_AS_OF, JP_HEALTH_RANGE, JP_HEALTH_TOKYO, jpEmployerCost, type JpIndustry } from "../../../lib/world-employer-cost-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "japan-employer-social-insurance-cost";
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;

export default function JpEmployerCost() {
  const [x, setX] = useState({ monthly: 300_000, age: 35, industry: "general" as JpIndustry, healthRate: JP_HEALTH_TOKYO });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpEmployerCost(x);
  return (
    <CurveShell toolId={TOOL_ID} lang="ja" currency="JPY"
      curve={{ title: "月給ごとの会社負担（社会保険・雇用保険）", caption: "厚生年金は65万円で頭打ち。健康保険・雇用保険は給与に比例します。", xLabel: "月給", yLabel: "会社負担", min: 100_000, max: 1_000_000, step: 10_000, current: x.monthly, f: (v) => jpEmployerCost({ ...x, monthly: v }).employer, formatX: yen, formatY: yen, onPick: (v) => upd({ monthly: v }), marks: [{ at: 650_000, label: "厚年上限" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<JpIndustry> legend="事業の種類（雇用保険）" value={x.industry} options={[{ value: "general", label: "一般" }, { value: "agri", label: "農林水産・清酒" }, { value: "construction", label: "建設" }]} onChange={(v) => upd({ industry: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="月給（総支給）" value={x.monthly} onChange={(v) => upd({ monthly: v })} suffix="円" step={10_000} />
            <NumberField label="従業員の年齢" value={x.age} onChange={(v) => upd({ age: v })} suffix="歳" step={1} />
            {mode === "expert" && <NumberField label={`健康保険料率（都道府県, ${JP_HEALTH_RANGE.min}〜${JP_HEALTH_RANGE.max}%）`} value={x.healthRate} onChange={(v) => upd({ healthRate: v })} suffix="%" step={0.01} />}
          </div>
          <LaborResult mode={mode} headline={`会社負担 月${yen(r.employer)}（給与の${r.ratio}%）`} sub={`人件費の合計 月${yen(r.total)}`} items={r.items} dates={r.lines.map((l) => ({ id: l.id, label: `${l.label} ${l.rate}`, date: yen(l.amount), cite: l.cite }))} datesTitle="内訳（月額）" note={`協会けんぽ・日本年金機構・厚生労働省の公表料率（令和8年度）による概算です。健康保険は東京${JP_HEALTH_TOKYO}%が初期値です。給与計算の助言ではありません。更新 ${EMPLOYER_AS_OF}。入力はブラウザの外に送りません。`} />
        </>
      )}
    </CurveShell>
  );
}
