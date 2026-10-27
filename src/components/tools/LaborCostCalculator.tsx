import { useState } from "react";
import { EMPLOYER_EMPLOYMENT_STABILITY, PAYROLL_TAX_AS_OF, RATES, ratePct } from "../../lib/kr-payroll-2026";
import { computeEmployerInsurance } from "../../lib/finance/salary-calculator";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

type Size = keyof typeof EMPLOYER_EMPLOYMENT_STABILITY;
const SIZE_OPTIONS = [
  { value: "under150", label: "150인 미만" },
  { value: "priority150Plus", label: "150인 이상 우선지원" },
  { value: "from150to999", label: "150~999인" },
  { value: "from1000", label: "1,000인 이상" },
] as const satisfies readonly { value: Size; label: string }[];
type YesNo = "yes" | "no";
const SEVERANCE_OPTIONS = [
  { value: "yes", label: "퇴직금 적립 포함" },
  { value: "no", label: "빼고 보기" },
] as const satisfies readonly { value: YesNo; label: string }[];

export default function LaborCostCalculator() {
  const [salary, setSalary] = useState(3_000_000);
  const [meal, setMeal] = useState(200_000);
  const [workCompPct, setWorkCompPct] = useState(1.5);
  const [size, setSize] = useState<Size>("under150");
  const [severance, setSeverance] = useState<YesNo>("yes");

  const stability = EMPLOYER_EMPLOYMENT_STABILITY[size];
  const taxable = Math.max(0, salary - Math.min(meal, 200_000));
  const ins = computeEmployerInsurance(taxable, { stabilityRate: stability, workCompRate: workCompPct / 100 });
  const sev = severance === "yes" ? Math.floor(salary / 12) : 0;
  const total = salary + ins.total + sev;

  const rows: [string, number][] = [
    [`국민연금 ${ratePct(RATES.pensionEmployee)}`, ins.pension],
    [`건강보험 ${ratePct(RATES.healthEmployee)}`, ins.health],
    [`장기요양 (건보의 ${ratePct(RATES.longTermCareOfHealth)})`, ins.ltc],
    [`고용보험 ${ratePct(RATES.employmentEmployee + stability)}`, ins.employment],
    [`산재보험 ${workCompPct}% (가정)`, ins.workComp],
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="월 급여(세전)" value={salary} onChange={setSalary} suffix="원" step={100_000} />
        <NumberField label="비과세 식대(월 20만 원까지)" value={meal} onChange={setMeal} suffix="원" step={10_000} />
        <NumberField label="산재보험료율(업종별)" value={workCompPct} onChange={setWorkCompPct} suffix="%" step={0.1} />
      </div>
      <div className="mt-4 space-y-3">
        <ChoiceChips legend="상시근로자 수" value={size} options={SIZE_OPTIONS} onChange={setSize} />
        <ChoiceChips legend="퇴직금" value={severance} options={SEVERANCE_OPTIONS} onChange={setSeverance} />
      </div>

      <div aria-live="polite" className="mt-5 rounded-md border border-border bg-background px-4 py-4">
        <p className="text-sm text-muted-foreground">회사가 매달 쓰는 인건비</p>
        <p className="mt-1 font-mono text-3xl font-bold text-foreground">{won(total)}</p>
        <p className="mt-1 text-sm text-muted-foreground">급여보다 {salary > 0 ? (((total - salary) / salary) * 100).toFixed(1) : "0.0"}% 더 들어요.</p>
        <ul className="mt-4 text-sm">
          {rows.map(([label, amount]) => (
            <li key={label} className="flex justify-between gap-3 py-1">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono text-foreground">{won(amount)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-3 border-t border-border py-1 font-semibold">
            <span className="text-foreground">사업주 4대보험 합계</span>
            <span className="font-mono text-foreground">{won(ins.total)}</span>
          </li>
          {sev > 0 && (
            <li className="flex justify-between gap-3 py-1">
              <span className="text-muted-foreground">퇴직금 적립(월 급여 ÷ 12)</span>
              <span className="font-mono text-foreground">{won(sev)}</span>
            </li>
          )}
        </ul>
        <ResultSteps
          steps={[
            `보험료 기준 = 월 급여 ${won(salary)} − 비과세 식대 ${won(Math.min(meal, 200_000))} = ${won(taxable)}`,
            "국민연금은 기준소득월액 상·하한을 적용하고, 보험료마다 10원 미만은 버렸어요.",
            `고용보험 사업주 몫 = 실업급여 ${ratePct(RATES.employmentEmployee)} + 고용안정·직업능력개발 ${ratePct(stability)}`,
            `${PAYROLL_TAX_AS_OF} 기준 2026년 요율이에요. 산재보험료율은 업종마다 달라 고지서 요율을 넣어 주세요.`,
          ]}
          next={[
            { href: "/ko/weekly-holiday-pay-calculator/", label: "알바 주휴수당" },
            { href: "/ko/incorporation-calculator/", label: "개인 vs 법인 세금" },
          ]}
        />
      </div>
    </div>
  );
}
