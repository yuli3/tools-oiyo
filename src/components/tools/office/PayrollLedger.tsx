// 급여대장 만들기 (여러 직원 한 번에, CSV 내려받기). 계산: lib/kr-office-tasks-2026.ts
import { useState } from "react";
import { LEDGER_MISSING, OFFICE_TASKS_AS_OF, ledgerCsv, payrollLedger, type PayrollRow } from "../../../lib/kr-office-tasks-2026";
import { track } from "../viz/track";

const TOOL_ID = "payroll-ledger-builder";
const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
const blank = (i: number): PayrollRow => ({ name: `직원${i}`, base: 2_800_000, allowances: 0, nonTaxable: 200_000, family: 1, children: 0, workDays: 21, workHours: 168, overtimeHours: 0 });
const NUM: [keyof PayrollRow, string, number][] = [["base", "기본급", 10_000], ["allowances", "수당", 10_000], ["nonTaxable", "비과세", 10_000], ["family", "공제가족", 1], ["children", "8~20세 자녀", 1], ["workDays", "근로일수", 1], ["workHours", "근로시간", 1], ["overtimeHours", "연장·야간·휴일", 1]];

export default function PayrollLedger() {
  const [month, setMonth] = useState("2026-11");
  const [rows, setRows] = useState<PayrollRow[]>([blank(1), { ...blank(2), base: 3_500_000, family: 3, children: 1 }]);
  const r = payrollLedger(rows);
  const edit = (i: number, k: keyof PayrollRow, v: string) => {
    setRows((p) => p.map((row, j) => (j === i ? { ...row, [k]: k === "name" ? v : Math.max(0, Number(v) || 0) } : row)));
    track("tool_calculate", { tool_id: TOOL_ID }, true);
  };
  const download = () => {
    const blob = new Blob([ledgerCsv(rows, month)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `급여대장_${month}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    track("tool_export", { tool_id: TOOL_ID }, true);
  };
  return (
    <div className="space-y-4">
      <label className="block max-w-xs text-sm font-medium text-muted-foreground">귀속월
        <input type="month" className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground" value={month} onChange={(e) => setMonth(e.target.value)} />
      </label>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <fieldset key={i} className="rounded-md border border-border p-3">
            <legend className="px-1 text-sm font-semibold">{i + 1}번째 직원</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <label className="text-xs text-muted-foreground">성명(또는 별칭)
                <input className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground" value={row.name} onChange={(e) => edit(i, "name", e.target.value)} />
              </label>
              {NUM.map(([k, label, step]) => (
                <label key={k} className="text-xs text-muted-foreground">{label}
                  <input type="number" inputMode="numeric" min={0} step={step} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground" value={Number(row[k] ?? 0)} onChange={(e) => edit(i, k, e.target.value)} />
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm">지급 {won(r.lines[i].gross)}원 − 공제 {won(r.lines[i].deductions)}원 = <span className="font-semibold text-primary">차인지급 {won(r.lines[i].net)}원</span></p>
            {rows.length > 1 && <button type="button" className="mt-1 min-h-11 text-sm text-muted-foreground underline underline-offset-4" onClick={() => setRows((p) => p.filter((_, j) => j !== i))}>이 직원 빼기</button>}
          </fieldset>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted" onClick={() => setRows((p) => [...p, blank(p.length + 1)])}>직원 추가</button>
        <button type="button" className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground" onClick={download}>CSV로 내려받기(엑셀)</button>
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-3xl text-right text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>{["성명", "지급 합계", "국민연금", "건강보험", "장기요양", "고용보험", "소득세", "지방소득세", "차인지급액"].map((h) => <th key={h} className="px-2 py-2 first:text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {r.lines.map((l, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-2 py-2 text-left">{l.name}</td>
                {[l.gross, l.pension, l.health, l.care, l.employment, l.incomeTax, l.localTax, l.net].map((v, k) => <td key={k} className="px-2 py-2">{won(v)}</td>)}
              </tr>
            ))}
            <tr className="border-t border-border font-semibold">
              <td className="px-2 py-2 text-left">합계 {r.lines.length}명</td>
              {(["gross", "pension", "health", "care", "employment", "incomeTax", "localTax", "net"] as const).map((k) => <td key={k} className="px-2 py-2">{won(r.totals[k])}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">소득세는 간이세액표(2026. 2. 27. 개정) 100% 기준, 4대보험은 2026 근로자 부담 요율이에요. 임금대장에 함께 적어야 하는 {LEDGER_MISSING.join(", ")}은 내려받은 파일에 직접 더하세요(근로기준법 시행령 제27조). 확인 {OFFICE_TASKS_AS_OF}. 입력은 브라우저 밖으로 나가지 않아요.</p>
    </div>
  );
}
