// 취업 후 학자금 의무상환액 계산 (2026-11-21, 국세청 주제 5종). 계산: lib/kr-nts-pack-2026.ts (kr-tax-advisor 스킬 calc student-loan와 같은 코드)
import { useState } from "react";
import { NTS_PACK_AS_OF, NTS_PACK_NOTE, STUDENT_LOAN_BASIS, studentLoanCurve, studentLoanRepayment } from "../../../lib/kr-nts-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import SweepChart from "../viz/SweepChart";
import { track } from "../viz/track";
import { Items, won } from "./Items";

const TOOL_ID = "student-loan-repayment-calculator";
const man = (n: number) => `${Math.round(n / 10_000).toLocaleString("ko-KR")}만`;

export default function StudentLoan() {
  const [x, setX] = useState({ incomeType: "salary" as "salary" | "income", amount: 4000, loan: "undergrad" as "undergrad" | "graduate", balance: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = studentLoanRepayment({ incomeType: x.incomeType, amount: x.amount * 10_000, loan: x.loan, balance: x.balance * 10_000 || undefined });
  const curve = studentLoanCurve(x.loan).map((p) => ({ x: p.income, y: p.yearly }));
  return (
    <div className="space-y-5">
      <ChoiceChips<"salary" | "income"> legend="어떤 소득으로 넣을까요?" value={x.incomeType} options={[{ value: "salary", label: "월급만 받아요(연 총급여)" }, { value: "income", label: "사업·연금 등 포함(연 소득금액)" }]} onChange={(v) => upd({ incomeType: v })} />
      <ChoiceChips<"undergrad" | "graduate"> legend="어떤 대출인가요?" value={x.loan} options={[{ value: "undergrad", label: "학부 대출만" }, { value: "graduate", label: "대학원 대출이 있어요" }]} onChange={(v) => upd({ loan: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label={x.incomeType === "salary" ? "연 총급여(비과세 제외)" : "연 소득금액 합계"} suffix="만 원" value={x.amount} step={100} onChange={(v) => upd({ amount: Math.max(0, v) })} />
        <NumberField label="남은 대출 잔액(모르면 0)" suffix="만 원" value={x.balance} step={100} onChange={(v) => upd({ balance: Math.max(0, v) })} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">연 의무상환액 약 {won(r.yearly)}{r.yearly > 0 && <span className="ml-2 text-base font-normal text-muted-foreground">월 약 {won(r.monthly)}</span>}</p>
        <p className="mt-1 text-foreground">소득금액 {won(r.income)} − 상환기준소득 {won(r.threshold)} = {won(r.over)} × {r.rate * 100}%</p>
        <Items items={r.items} />
      </div>
      <SweepChart
        title="소득이 늘면 의무상환액은?"
        caption={`상환기준소득 ${man(STUDENT_LOAN_BASIS.threshold)} 원(${STUDENT_LOAN_BASIS.notice})을 넘는 부분만 ${r.rate * 100}%씩 늘어요.`}
        points={curve}
        current={{ x: r.income, y: r.yearly }}
        marks={[{ at: STUDENT_LOAN_BASIS.threshold, label: "기준선" }]}
        formatX={(v) => `${man(v)}원`}
        formatY={(v) => `${man(v)}원`}
        xLabel="연 소득금액"
        yLabel="연 의무상환액"
      />
      <p className="text-xs leading-5 text-muted-foreground">상환기준소득은 학기마다 교육부 고시로 바뀌어요. {NTS_PACK_NOTE} 기준일 {NTS_PACK_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
