// 日本の住まいの賃貸借：敷金・解約予告・家賃増額の利息。計算: lib/world-tenancy-pack-2026.ts
import { useState } from "react";
import { TENANCY_AS_OF, jpTenancy, type JpLease } from "../../../lib/world-tenancy-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "japan-rental-deposit-notice-checker";
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;

export default function JpTenancy() {
  const [x, setX] = useState({ rent: 100_000, deposit: 200_000, lease: "ordinary" as JpLease, noticeDate: "2026-11-30", handover: "", shortfallPerMonth: 0, shortfallMonths: 12 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpTenancy({ ...x, noticeDate: x.noticeDate || undefined, handover: x.handover || undefined });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ja"
      currency="JPY"
      curve={{
        title: "増額をめぐる争いが長引くと、不足分の利息がこう増えます", caption: x.shortfallPerMonth ? "裁判で増額が確定したとき、各月の不足分に年1割の利息が付きます（概算）。" : "不足額が未入力のため、月1万円の不足を例にしています（専門家モードで入力）。年1割の利息の概算です。",
        xLabel: "確定までの月数", yLabel: "利息", min: 0, max: 36, step: 1, current: x.shortfallMonths,
        f: (m) => jpTenancy({ ...x, shortfallPerMonth: x.shortfallPerMonth || 10_000, shortfallMonths: m }).interest, formatX: (m) => `${Math.round(m)}か月`, formatY: yen,
        onPick: (m) => upd({ shortfallMonths: m }),
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<JpLease> legend="契約の種類" value={x.lease} options={[{ value: "ordinary", label: "普通借家" }, { value: "fixed", label: "定期借家" }]} onChange={(v) => upd({ lease: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="月額家賃" value={x.rent} onChange={(v) => upd({ rent: v })} suffix="円" step={1000} />
        <NumberField label="敷金" value={x.deposit} onChange={(v) => upd({ deposit: v })} suffix="円" step={1000} />
        <DateField label="解約を申し入れる日" value={x.noticeDate} onChange={(v) => upd({ noticeDate: v })} />
        {mode === "expert" && <DateField label="明け渡し日（わかれば）" value={x.handover} onChange={(v) => upd({ handover: v })} />}
        {mode === "expert" && <NumberField label="増額で争っているときの月の不足額" value={x.shortfallPerMonth} onChange={(v) => upd({ shortfallPerMonth: v })} suffix="円" step={1000} />}
      </div>
      <LaborResult mode={mode} headline={`敷金は家賃の${r.depositMonths}か月分（法律上の上限なし）`} sub="解約の予告期間と敷金の返還時期をまとめました" items={r.items} dates={r.dates} datesTitle="日付" note={`一般的な情報と概算です（民法・借地借家法、e-Gov法令検索で確認）。法律相談・代理ではありません。困ったときは消費者ホットライン188へ。更新日 ${TENANCY_AS_OF}。入力した値はブラウザの外に送りません。`} />
    </>
      )}
    </CurveShell>
  );
}
