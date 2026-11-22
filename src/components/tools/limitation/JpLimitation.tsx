// 日本の消滅時効と少額訴訟。計算: lib/world-limitation-pack-2026.ts
import { useState } from "react";
import { LIMITATION_AS_OF, jpLimitation, type JpClaim } from "../../../lib/world-limitation-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { limitCurve } from "./LimitCurve";

const TOOL_ID = "japan-shometsu-jiko-shogaku-sosho";

export default function JpLimitation() {
  const [x, setX] = useState({ claim: "general" as JpClaim, knew: "2024-04-01", couldExercise: "2024-04-01", amount: 300_000, today: "2026-11-22", elapsed: 2 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpLimitation({ claim: x.claim, knew: x.knew || undefined, couldExercise: x.couldExercise || undefined, amount: x.amount, today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="ja" currency="JPY"
      curve={limitCurve({ start: x.knew, deadline: r.deadline, title: "知った時からの年数と、時効までの残り", caption: "早いほうの期限までの残り年数です。", xLabel: "経過年数", yLabel: "残り", unit: (n) => `${n}年`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 10 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<JpClaim> legend="どんな請求ですか" value={x.claim} options={[{ value: "general", label: "貸したお金・代金など" }, { value: "tort", label: "不法行為（物の損害など）" }, { value: "injury", label: "けが・命の損害" }]} onChange={(v) => upd({ claim: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="権利と相手を知った日" value={x.knew} onChange={(v) => upd({ knew: v })} />
            <DateField label={x.claim === "tort" ? "不法行為の日" : "権利を行使できるようになった日（返済期日など）"} value={x.couldExercise} onChange={(v) => upd({ couldExercise: v })} />
            <NumberField label="請求する金額" value={x.amount} onChange={(v) => upd({ amount: v })} suffix="円" step={10_000} />
            {mode === "expert" && <DateField label="今日の日付" value={x.today} onChange={(v) => upd({ today: v })} />}
          </div>
          <LaborResult mode={mode} headline={r.deadline ? `時効の目安 ${r.deadline}${r.status === "expired" ? "（すでに過ぎています）" : ""}` : "日付を入れると時効の目安を計算します"} items={r.items} dates={r.dates} datesTitle="期限" note={`一般的な情報です（法務省の改正民法資料、裁判所の少額訴訟の案内で確認）。法律相談・代理ではありません。更新日 ${LIMITATION_AS_OF}。入力した値はブラウザの外に送りません。`} />
        </>
      )}
    </CurveShell>
  );
}
