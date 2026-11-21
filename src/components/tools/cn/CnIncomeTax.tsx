// 个体工商户经营所得、综合所得与小型微利企业所得税估算。计算：lib/cn-tax-pack-2026.ts
import { useState } from "react";
import { CN_TAX_AS_OF, CN_TAX_NOTE, cnBusinessIncome, cnComprehensive, cnSmallProfitCit } from "../../../lib/cn-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "china-business-income-tax-calculator";
const yuan = (n: number) => `${Math.round(n).toLocaleString("zh-CN")}元`;
type Mode = "biz" | "comp" | "cit";

export default function CnIncomeTax() {
  const [x, setX] = useState({ mode: "biz" as Mode, taxable: 300_000, income: 200_000, special: 20_000, additional: 24_000, emp: 10, assets: 2_000_000 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const b = cnBusinessIncome({ taxable: x.taxable });
  const c = cnComprehensive({ income: x.income, special: x.special, additional: x.additional });
  const s = cnSmallProfitCit({ taxable: x.taxable, employees: x.emp, assets: x.assets });
  return (
    <div className="space-y-5">
      <ChoiceChips<Mode> legend="计算什么" value={x.mode} options={[{ value: "biz", label: "个体工商户经营所得" }, { value: "comp", label: "工资等综合所得" }, { value: "cit", label: "小型微利企业所得税" }]} onChange={(v) => upd({ mode: v })} />
      {x.mode === "comp" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="全年收入额" value={x.income} onChange={(v) => upd({ income: v })} suffix="元" step={1000} />
          <NumberField label="专项扣除（社保、公积金个人部分）" value={x.special} onChange={(v) => upd({ special: v })} suffix="元" step={1000} />
          <NumberField label="专项附加扣除" value={x.additional} onChange={(v) => upd({ additional: v })} suffix="元" step={1000} />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="全年应纳税所得额" value={x.taxable} onChange={(v) => upd({ taxable: v })} suffix="元" step={10000} />
          {x.mode === "cit" && <NumberField label="从业人数" value={x.emp} onChange={(v) => upd({ emp: v })} suffix="人" />}
          {x.mode === "cit" && <NumberField label="资产总额（季度平均）" value={x.assets} onChange={(v) => upd({ assets: v })} suffix="元" step={100000} />}
        </div>
      )}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        {x.mode === "biz" && <><p className="text-lg font-semibold text-foreground">减半后约{yuan(b.payable)}（减半前{yuan(b.tax)}）</p><progress className="mt-2 h-2 w-full accent-(--primary)" max={Math.max(1, b.tax)} value={b.payable} aria-label="减免后税额占比" /><Items items={b.items} /></>}
        {x.mode === "comp" && <><p className="text-lg font-semibold text-foreground">年度应纳税额约{yuan(c.tax)}</p><Items items={c.items} /></>}
        {x.mode === "cit" && <><p className="text-lg font-semibold text-foreground">企业所得税约{yuan(s.tax)}</p><progress className="mt-2 h-2 w-full accent-(--primary)" max={Math.max(1, s.general)} value={s.tax} aria-label="与25%税率相比" /><Items items={s.items} /></>}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{CN_TAX_NOTE} 更新日期：{CN_TAX_AS_OF}。</p>
    </div>
  );
}
