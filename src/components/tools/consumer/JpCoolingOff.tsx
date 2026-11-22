// 日本のクーリング・オフ期限。計算: lib/world-consumer-pack-2026.ts
import { useState } from "react";
import { CONSUMER_AS_OF, jpCoolingOff, type JpKind } from "../../../lib/world-consumer-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { coolingCurve } from "./CoolingCurve";

const TOOL_ID = "japan-cooling-off-deadline";
const KINDS: { value: JpKind; label: string }[] = [
  { value: "visit", label: "訪問販売" }, { value: "phone", label: "電話勧誘販売" }, { value: "continuous", label: "エステ・語学教室など" },
  { value: "visitPurchase", label: "訪問購入" }, { value: "mlm", label: "マルチ商法" }, { value: "businessOpportunity", label: "内職・モニター商法" }, { value: "mailOrder", label: "ネット通販" },
];

export default function JpCoolingOff() {
  const [x, setX] = useState({ kind: "visit" as JpKind, documentReceived: "2026-11-20", elapsed: 3 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpCoolingOff({ kind: x.kind, documentReceived: x.documentReceived || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="ja" currency="JPY"
      curve={coolingCurve({ start: x.documentReceived, lastDay: r.lastDay, title: "書面を受け取ってからの日数と、残りの日数", caption: "受け取った日を1日目として数えます。残りが0日になる前に発信しましょう。", xLabel: "受け取ってからの日数", yLabel: "残り", unit: (n) => `${Math.round(n)}日`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 25 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<JpKind> legend="どんな契約ですか" value={x.kind} options={KINDS} onChange={(v) => upd({ kind: v })} />
          {x.kind !== "mailOrder" && <DateField label="申込書面または契約書面を受け取った日（早いほう）" value={x.documentReceived} onChange={(v) => upd({ documentReceived: v })} />}
          <LaborResult mode={mode} headline={r.lastDay ? `${r.lastDay} までに発信すればクーリング・オフできます` : x.kind === "mailOrder" ? "ネット通販にクーリング・オフはありません" : `期間は${r.days}日間です`} sub={r.days ? `${r.days}日間（書面を受け取った日を含む）` : undefined} items={r.items} dates={r.dates} datesTitle="期限" note={`一般的な情報です（特定商取引法、都道府県の消費生活センターの案内で確認）。法律相談・代理ではありません。困ったときは消費者ホットライン188へ。更新日 ${CONSUMER_AS_OF}。入力した値はブラウザの外に送りません。`} />
        </>
      )}
    </CurveShell>
  );
}
