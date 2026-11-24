// 연차 관리대장 (여러 직원, 입사일 기준, CSV). 계산: lib/leave-ledger-2026.ts
import { useState } from "react";
import { LEAVE_LEDGER_AS_OF, leaveCsv, leaveLedger, type LeaveRow } from "../../../lib/leave-ledger-2026";
import { track } from "../viz/track";

const TOOL_ID = "annual-leave-ledger";
const today = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

export default function LeaveLedger() {
  const [asOf, setAsOf] = useState(today());
  const [rows, setRows] = useState<LeaveRow[]>([{ name: "직원1", start: "2026-03-02", used: 2 }, { name: "직원2", start: "2023-05-10", used: 5 }]);
  const r = leaveLedger(rows, asOf);
  const edit = (i: number, k: keyof LeaveRow, v: string) => {
    setRows((p) => p.map((row, j) => (j === i ? { ...row, [k]: k === "used" ? Math.max(0, Number(v) || 0) : v } : row)));
    track("tool_calculate", { tool_id: TOOL_ID }, true);
  };
  const download = () => {
    const blob = new Blob([leaveCsv(rows, asOf)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `연차관리대장_${asOf}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    track("tool_export", { tool_id: TOOL_ID }, true);
  };
  return (
    <div className="space-y-4">
      <label className="block max-w-xs text-sm font-medium text-muted-foreground">기준일
        <input type="date" className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
      </label>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <fieldset key={i} className="rounded-md border border-border p-3">
            <legend className="px-1 text-sm font-semibold">{i + 1}번째 직원</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="text-xs text-muted-foreground">성명(또는 별칭)
                <input className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-2 text-base text-foreground" value={row.name} onChange={(e) => edit(i, "name", e.target.value)} />
              </label>
              <label className="text-xs text-muted-foreground">입사일
                <input type="date" className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-2 text-base text-foreground" value={row.start} onChange={(e) => edit(i, "start", e.target.value)} />
              </label>
              <label className="text-xs text-muted-foreground">지금 연차에서 쓴 일수
                <input type="number" inputMode="decimal" min={0} step={0.5} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-2 text-base text-foreground" value={row.used} onChange={(e) => edit(i, "used", e.target.value)} />
              </label>
            </div>
            {r.lines[i].ok ? (
              <p className="mt-2 text-sm">발생 {r.lines[i].granted}일 − 사용 {r.lines[i].used}일 = <span className="font-semibold text-primary">남음 {r.lines[i].left}일</span> · {r.lines[i].useBy}까지 사용 · 다음 {r.lines[i].nextDate}에 {r.lines[i].nextDays}일</p>
            ) : (
              <p className="mt-2 text-sm text-destructive">입사일이 기준일보다 늦거나 날짜가 비어 있어요.</p>
            )}
            {rows.length > 1 && <button type="button" className="mt-1 min-h-11 text-sm text-muted-foreground underline underline-offset-4" onClick={() => setRows((p) => p.filter((_, j) => j !== i))}>이 직원 빼기</button>}
          </fieldset>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted" onClick={() => setRows((p) => [...p, { name: `직원${p.length + 1}`, start: "", used: 0 }])}>직원 추가</button>
        <button type="button" className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={download}>CSV로 내려받기(엑셀)</button>
      </div>
      {r.over.length > 0 && <p className="text-sm text-warning">{r.over.join(", ")}: 쓴 일수가 발생 일수보다 많아요. 미리 당겨 쓴 연차인지 확인하세요.</p>}
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-2xl text-right text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>{["성명", "근속", "발생", "사용", "남음", "사용 기한", "다음 발생"].map((h) => <th key={h} className="px-2 py-2 first:text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {r.lines.map((l, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-2 py-2 text-left">{l.name}</td>
                <td className="px-2 py-2">{l.ok ? (l.kind === "monthly" ? "1년 미만" : `${l.years}년`) : "-"}</td>
                <td className="px-2 py-2">{l.granted}</td>
                <td className="px-2 py-2">{l.used}</td>
                <td className="px-2 py-2">{l.left}</td>
                <td className="px-2 py-2">{l.useBy || "-"}</td>
                <td className="px-2 py-2">{l.ok ? `${l.nextDate} (${l.nextDays}일)` : "-"}</td>
              </tr>
            ))}
            <tr className="border-t border-border font-semibold">
              <td className="px-2 py-2 text-left">합계 {r.lines.length}명</td>
              <td className="px-2 py-2" />
              <td className="px-2 py-2">{r.totals.granted}</td>
              <td className="px-2 py-2">{r.totals.used}</td>
              <td className="px-2 py-2">{r.totals.left}</td>
              <td className="px-2 py-2" /><td className="px-2 py-2" />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">상시 5명 이상 사업장, 매달 개근·출근율 80% 이상을 가정한 입사일 기준이에요(근로기준법 제60조). 회계연도 기준으로 관리하면 퇴사 때 입사일 기준과 비교해 정산해야 해요. 확인 {LEAVE_LEDGER_AS_OF}. 입력은 브라우저 밖으로 나가지 않아요.</p>
    </div>
  );
}
