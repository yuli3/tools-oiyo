// 결산 상각표·외부감사 대상 판정 (2026-11-20, 전수조사 8번). 계산: lib/kr-accounting-schedules-2026.ts (kr-tax-advisor 스킬 calc.mjs depreciation·lease·bond·audit와 같은 코드)
import { useState } from "react";
import { ACCT_AS_OF, ACCT_NOTE, bondSchedule, depreciation, externalAuditCheck, leaseSchedule, type DepMethod } from "../../../lib/kr-accounting-schedules-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "accounting-schedule-calculator";
const MAN = 10_000;
const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
type Mode = "dep" | "lease" | "bond" | "audit";

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-right text-xs sm:text-sm">
        <thead><tr className="text-muted-foreground">{head.map((h) => <th key={h} className="py-1 pl-2 font-medium first:pl-0 first:text-left">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-border text-foreground">{r.map((c, j) => <td key={j} className="py-1 pl-2 font-mono first:pl-0 first:text-left">{typeof c === "number" ? won(c) : c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function AccountingSchedules() {
  const [mode, setMode] = useState<Mode>("dep");
  const [dep, setDep] = useState({ cost: 1000, residual: 0, years: 5, method: "straight" as DepMethod, firstMonths: 12 });
  const [ls, setLs] = useState({ payment: 1200, periods: 5, rate: 5, advance: false, directCost: 0 });
  const [bd, setBd] = useState({ face: 10000, coupon: 5, market: 6, periods: 3 });
  const [au, setAu] = useState({ listed: false, llc: false, assets: 130, liabilities: 80, revenue: 50, employees: 20, members: 0 });
  const tick = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const d = depreciation(dep.cost * MAN, dep.residual * MAN, dep.years, dep.method, dep.firstMonths);
  const l = leaseSchedule(ls.payment * MAN, ls.periods, ls.rate / 100, ls.advance, ls.directCost * MAN);
  const b = bondSchedule(bd.face * MAN, bd.coupon / 100, bd.market / 100, bd.periods);
  const a = externalAuditCheck({ ...au, assets: au.assets * 100_000_000, liabilities: au.liabilities * 100_000_000, revenue: au.revenue * 100_000_000 });
  const box = "rounded-md border border-border bg-card px-4 py-4 text-sm";
  return (
    <div className="space-y-5">
      <ChoiceChips<Mode> legend="무엇을 만들까요?" value={mode} options={[{ value: "dep", label: "감가상각표" }, { value: "lease", label: "리스(IFRS 16)" }, { value: "bond", label: "사채 상각표" }, { value: "audit", label: "외감 대상 판정" }]} onChange={(v) => { setMode(v); tick(); }} />
      {mode === "dep" && (
        <>
          <ChoiceChips<DepMethod> legend="상각 방법" value={dep.method} options={[{ value: "straight", label: "정액법" }, { value: "declining", label: "정률법" }, { value: "syd", label: "연수합계법" }]} onChange={(v) => { setDep({ ...dep, method: v }); tick(); }} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="취득원가" suffix="만 원" value={dep.cost} onChange={(v) => { setDep({ ...dep, cost: Math.max(0, v) }); tick(); }} />
            <NumberField label="잔존가치" suffix="만 원" value={dep.residual} onChange={(v) => { setDep({ ...dep, residual: Math.max(0, v) }); tick(); }} />
            <NumberField label="내용연수" suffix="년" value={dep.years} onChange={(v) => { setDep({ ...dep, years: Math.max(1, Math.round(v)) }); tick(); }} />
            <NumberField label="첫해 사용 개월 수" suffix="개월" value={dep.firstMonths} onChange={(v) => { setDep({ ...dep, firstMonths: Math.min(12, Math.max(1, Math.round(v))) }); tick(); }} />
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">첫해 감가상각비 {won(d.rows[0]?.expense ?? 0)}원{dep.method === "declining" ? ` · 상각률 ${d.rate}` : ""}</p>
            <Table head={["연차", "기초", "상각비", "기말"]} rows={d.rows.map((r) => [`${r.year}년`, r.opening, r.expense, r.closing])} />
          </div>
        </>
      )}
      {mode === "lease" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="연 리스료" suffix="만 원" value={ls.payment} onChange={(v) => { setLs({ ...ls, payment: Math.max(0, v) }); tick(); }} />
            <NumberField label="리스기간" suffix="년" value={ls.periods} onChange={(v) => { setLs({ ...ls, periods: Math.max(1, Math.round(v)) }); tick(); }} />
            <NumberField label="증분차입이자율" suffix="%" step={0.1} value={ls.rate} onChange={(v) => { setLs({ ...ls, rate: Math.max(0, v) }); tick(); }} />
            <NumberField label="리스개설직접원가" suffix="만 원" value={ls.directCost} onChange={(v) => { setLs({ ...ls, directCost: Math.max(0, v) }); tick(); }} />
          </div>
          <ChoiceChips<"end" | "start"> legend="리스료 지급 시점" value={ls.advance ? "start" : "end"} options={[{ value: "end", label: "매년 말" }, { value: "start", label: "매년 초" }]} onChange={(v) => { setLs({ ...ls, advance: v === "start" }); tick(); }} />
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">리스부채 {won(l.liability)}원 · 사용권자산 {won(l.rou)}원</p>
            <p className="mt-1 text-muted-foreground">총 이자비용 {won(l.totalInterest)}원, 사용권자산 상각 해마다 {won(l.rows[0]?.rouDep ?? 0)}원</p>
            <Table head={["연차", "기초 부채", "이자비용", "원금 감소", "기말 부채"]} rows={l.rows.map((r) => [`${r.period}년`, r.opening, r.interest, r.principal, r.closing])} />
          </div>
        </>
      )}
      {mode === "bond" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="액면금액" suffix="만 원" value={bd.face} onChange={(v) => { setBd({ ...bd, face: Math.max(0, v) }); tick(); }} />
            <NumberField label="표면이자율" suffix="%" step={0.1} value={bd.coupon} onChange={(v) => { setBd({ ...bd, coupon: Math.max(0, v) }); tick(); }} />
            <NumberField label="발행 시 시장이자율(유효이자율)" suffix="%" step={0.1} value={bd.market} onChange={(v) => { setBd({ ...bd, market: Math.max(0, v) }); tick(); }} />
            <NumberField label="만기" suffix="년" value={bd.periods} onChange={(v) => { setBd({ ...bd, periods: Math.max(1, Math.round(v)) }); tick(); }} />
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">발행가액 {won(b.price)}원 · {b.type}</p>
            <Table head={["연차", "기초 장부", "현금이자", "이자비용", "차금 상각", "기말 장부"]} rows={b.rows.map((r) => [`${r.period}년`, r.opening, r.cash, r.interest, r.amortization, r.closing])} />
          </div>
        </>
      )}
      {mode === "audit" && (
        <>
          <div className="flex flex-wrap gap-3">
            <ChoiceChips<"no" | "yes"> legend="상장(예정) 법인인가요?" value={au.listed ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => { setAu({ ...au, listed: v === "yes" }); tick(); }} />
            <ChoiceChips<"no" | "yes"> legend="회사 형태" value={au.llc ? "yes" : "no"} options={[{ value: "no", label: "주식회사" }, { value: "yes", label: "유한회사" }]} onChange={(v) => { setAu({ ...au, llc: v === "yes" }); tick(); }} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="직전 사업연도 말 자산총액" suffix="억 원" value={au.assets} onChange={(v) => { setAu({ ...au, assets: Math.max(0, v) }); tick(); }} />
            <NumberField label="부채총액" suffix="억 원" value={au.liabilities} onChange={(v) => { setAu({ ...au, liabilities: Math.max(0, v) }); tick(); }} />
            <NumberField label="매출액" suffix="억 원" value={au.revenue} onChange={(v) => { setAu({ ...au, revenue: Math.max(0, v) }); tick(); }} />
            <NumberField label="종업원 수" suffix="명" value={au.employees} onChange={(v) => { setAu({ ...au, employees: Math.max(0, Math.round(v)) }); tick(); }} />
            {au.llc && <NumberField label="사원 수" suffix="명" value={au.members} onChange={(v) => { setAu({ ...au, members: Math.max(0, Math.round(v)) }); tick(); }} />}
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">다음 사업연도 외부감사 {a.required ? "대상이에요" : "대상이 아니에요"}</p>
            <p className="mt-1 text-foreground">{a.reason}</p>
            {a.met.length > 0 && <p className="mt-1 text-muted-foreground">해당: {a.met.join(", ")}</p>}
          </div>
        </>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{ACCT_NOTE} 기준일 {ACCT_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
