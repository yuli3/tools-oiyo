// 台灣住宅租賃：押金上限、提前終止通知。計算：lib/world-tenancy-pack-2026.ts
import { useState } from "react";
import { TENANCY_AS_OF, twTenancy } from "../../../lib/world-tenancy-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { TW_VIZ_TEXT } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "taiwan-rental-deposit-termination";
const twd = (n: number) => `${Math.round(n).toLocaleString("zh-TW")} 元`;

export default function TwTenancy() {
  const [x, setX] = useState({ rent: 20_000, deposit: 40_000, noticeDate: "2026-11-30", rebuild: false });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = twTenancy({ ...x, noticeDate: x.noticeDate || undefined });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="zh"
      currency="TWD"
      text={TW_VIZ_TEXT}
      curve={{
        title: "月租金與押金上限", caption: "押金最多2個月租金。",
        xLabel: "月租金", yLabel: "押金上限", min: 5_000, max: 80_000, step: 500, current: x.rent,
        f: (v) => v * 2, formatX: twd, formatY: twd, onPick: (v) => upd({ rent: v }),
      }}
    >
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="月租金" value={x.rent} onChange={(v) => upd({ rent: v })} suffix="元" step={500} />
        <NumberField label="押金" value={x.deposit} onChange={(v) => upd({ deposit: v })} suffix="元" step={500} />
        {mode === "expert" && <DateField label="書面通知日" value={x.noticeDate} onChange={(v) => upd({ noticeDate: v })} />}
      </div>
      {mode === "expert" && <ChoiceChips<"y" | "n"> legend="出租人是因重建而終止嗎？" value={x.rebuild ? "y" : "n"} options={[{ value: "n", label: "否" }, { value: "y", label: "是（3個月）" }]} onChange={(v) => upd({ rebuild: v === "y" })} />}
      <LaborResult mode={mode} headline={`押金上限 ${twd(r.cap)}`} items={r.items} dates={r.dates} datesTitle="日期" note={`一般資訊，依據《租賃住宅市場發展及管理條例》（全國法規資料庫）。非法律意見。糾紛可向縣市政府不動產糾紛調處委員會申請免費調處。更新於 ${TENANCY_AS_OF}。您輸入的資料不會離開瀏覽器。`} />
    </>
      )}
    </CurveShell>
  );
}
