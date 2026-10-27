import { useState } from "react";
import { compareIncorporation } from "../../lib/kr-incorporation-2026";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

type Kind = "general" | "realEstate";
const KIND_OPTIONS = [
  { value: "general", label: "일반 법인" },
  { value: "realEstate", label: "소규모 부동산임대 법인" },
] as const satisfies readonly { value: Kind; label: string }[];

export default function IncorporationCalculator() {
  const [revenue, setRevenue] = useState(300_000_000);
  const [expenses, setExpenses] = useState(100_000_000);
  const [salary, setSalary] = useState(60_000_000);
  const [kind, setKind] = useState<Kind>("general");

  const profit = Math.max(0, revenue - expenses);
  const r = compareIncorporation(profit, salary, kind === "realEstate");
  const diffKeep = r.sole.total - r.corpKeep;
  const diffPayout = r.sole.total - r.corpPayout;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="연 매출" value={revenue} onChange={setRevenue} suffix="원" step={10_000_000} />
        <NumberField label="연 필요경비(대표 급여 제외)" value={expenses} onChange={setExpenses} suffix="원" step={10_000_000} />
        <NumberField label="법인일 때 대표 연봉" value={salary} onChange={setSalary} suffix="원" step={5_000_000} />
      </div>
      <div className="mt-4">
        <ChoiceChips legend="법인 종류" value={kind} options={KIND_OPTIONS} onChange={setKind} />
      </div>

      <div aria-live="polite" className="mt-5 rounded-md border border-border bg-background px-4 py-4">
        <p className="text-sm text-muted-foreground">연 이익 {won(profit)}일 때 세금(지방소득세 포함)</p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">개인사업자</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{won(r.sole.total)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">법인 · 이익을 법인에 둘 때</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{won(r.corpKeep)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">법인 · 남은 이익을 배당할 때</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{won(r.corpPayout)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm font-semibold text-foreground">
          {diffPayout > 0
            ? `배당까지 받아도 법인이 연 ${won(diffPayout)} 적어요.`
            : diffKeep > 0
              ? `이익을 법인에 남겨 두면 연 ${won(diffKeep)} 적지만, 배당으로 꺼내면 개인사업자가 ${won(-diffPayout)} 적어요.`
              : `개인사업자가 연 ${won(-diffKeep)} 이상 적어요.`}
        </p>
        <ResultSteps
          steps={[
            `개인: 과세표준 ${won(r.sole.base)} (이익 − 본인 기본공제 150만) → 소득세 ${won(r.sole.tax)} (표준세액공제 7만 차감) + 지방소득세 ${won(r.sole.local)}`,
            `법인세: 과세표준 ${won(r.corpBase)} (이익 − 대표 연봉) → 법인세 ${won(r.corpTax)} + 지방소득세 ${won(r.corpLocal)}${kind === "realEstate" ? " (2억 이하 구간 없이 20%)" : " (2026년 10·20·22·25%)"}`,
            `대표 연봉 ${won(r.salary)} → 소득세·지방소득세 ${won(r.pay.total)} (근로소득공제·세액공제 반영)`,
            `배당할 때: 세후 남은 이익 ${won(r.retained)} × 15.4% = ${won(r.dividendTax)} (연 2천만 원 이하 분리과세 가정)`,
            "4대보험(대표 급여는 근로자·사업주 몫 모두), 세무 기장료, 성실신고확인 비용, 감면·공제는 넣지 않았어요.",
          ]}
          next={[
            { href: "/ko/labor-cost-calculator/", label: "직원 1명 인건비" },
            { href: "/ko/comprehensive-income-tax-calculator/", label: "종합소득세 계산" },
          ]}
        />
      </div>
    </div>
  );
}
