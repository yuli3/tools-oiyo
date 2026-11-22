// 日本の相続税・贈与税（基礎控除・速算表・期限）。計算: lib/world-inheritance-pack-2026.ts
import { useState } from "react";
import { INHERITANCE_AS_OF, jpGift, jpInheritance } from "../../../lib/world-inheritance-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "japan-inheritance-gift-tax-deadline";
const man = (n: number) => `${Math.round(n / 10_000).toLocaleString("ja-JP")}万円`;

export default function JpInheritance() {
  const [x, setX] = useState({ mode: "inherit" as "inherit" | "gift", estate: 100_000_000, heirs: 2, death: "2026-01-15", gift: 5_000_000, special: true, year: 2026 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const inh = x.mode === "inherit";
  const r = inh ? jpInheritance({ estate: x.estate, heirs: x.heirs, death: x.death || undefined }) : jpGift({ amount: x.gift, special: x.special, year: x.year });
  const tax = inh ? (r as ReturnType<typeof jpInheritance>).totalTax : (r as ReturnType<typeof jpGift>).tax;
  return (
    <CurveShell toolId={TOOL_ID} lang="ja" currency="JPY"
      curve={inh
        ? { title: "遺産の額が増えると相続税の総額はこう増えます", caption: `法定相続人${x.heirs}人が法定相続分どおりに分けた場合の相続税の総額（税額軽減・控除の前）。`, xLabel: "課税価格の合計", yLabel: "相続税の総額", min: 0, max: 500_000_000, step: 5_000_000, current: x.estate, f: (v) => jpInheritance({ estate: v, heirs: x.heirs }).totalTax, formatX: man, formatY: man, onPick: (v) => upd({ estate: v }) }
        : { title: "もらった額と贈与税", caption: `${x.special ? "特例税率" : "一般税率"}・基礎控除110万円。`, xLabel: "1年間にもらった額", yLabel: "贈与税", min: 0, max: 30_000_000, step: 500_000, current: x.gift, f: (v) => jpGift({ amount: v, special: x.special }).tax, formatX: man, formatY: man, onPick: (v) => upd({ gift: v }) }}
    >
      {(mode) => (
        <>
          <ChoiceChips<"inherit" | "gift"> legend="どちらを調べますか" value={x.mode} options={[{ value: "inherit", label: "相続税" }, { value: "gift", label: "贈与税（暦年課税）" }]} onChange={(v) => upd({ mode: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            {inh && <NumberField label="課税価格の合計（遺産の額）" value={x.estate} onChange={(v) => upd({ estate: v })} suffix="円" step={1_000_000} />}
            {inh && <NumberField label="法定相続人の数" value={x.heirs} onChange={(v) => upd({ heirs: v })} suffix="人" step={1} />}
            {inh && <DateField label="亡くなった日（死亡を知った日）" value={x.death} onChange={(v) => upd({ death: v })} />}
            {!inh && <NumberField label="1年間にもらった財産の額" value={x.gift} onChange={(v) => upd({ gift: v })} suffix="円" step={100_000} />}
            {!inh && mode === "expert" && <NumberField label="もらった年" value={x.year} onChange={(v) => upd({ year: v })} step={1} />}
          </div>
          {!inh && <ChoiceChips<"y" | "n"> legend="18歳以上で、父母や祖父母からもらいましたか" value={x.special ? "y" : "n"} options={[{ value: "y", label: "はい（特例税率）" }, { value: "n", label: "いいえ（一般税率）" }]} onChange={(v) => upd({ special: v === "y" })} />}
          <LaborResult mode={mode} headline={tax ? `${inh ? "相続税の総額" : "贈与税"} 約${man(tax)}` : `${inh ? "相続税" : "贈与税"}はかかりません`} sub={inh ? `基礎控除 ${man((r as ReturnType<typeof jpInheritance>).basicDeduction)}` : "基礎控除 110万円"} items={r.items} dates={r.dates} datesTitle="期限" note={`一般的な情報と概算です（国税庁タックスアンサーで確認）。税務相談・申告代理ではありません。困ったときは税務署の電話相談センターや税理士会の無料相談へ。更新日 ${INHERITANCE_AS_OF}。入力した値はブラウザの外に送りません。`} />
        </>
      )}
    </CurveShell>
  );
}
