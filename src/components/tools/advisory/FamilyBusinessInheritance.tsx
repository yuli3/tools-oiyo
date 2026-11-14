import { useState } from "react";
import { familyBusinessInheritance, type BusinessSize } from "../../../lib/kr-advisory-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import { eok, won } from "./fmt";

const SIZE = [
  { value: "sme", label: "중소기업" },
  { value: "midsize", label: "중견기업(매출 5천억 미만)" },
  { value: "ineligible", label: "그 밖의 기업" },
] as const satisfies readonly { value: BusinessSize; label: string }[];
type YesNo = "no" | "yes";
const YES_NO = [
  { value: "yes", label: "있음" },
  { value: "no", label: "없음" },
] as const satisfies readonly { value: YesNo; label: string }[];

export default function FamilyBusinessInheritance() {
  const [businessValue, setBusinessValue] = useState(10_000_000_000);
  const [unrelatedPct, setUnrelatedPct] = useState(10);
  const [years, setYears] = useState(15);
  const [size, setSize] = useState<BusinessSize>("sme");
  const [otherEstate, setOtherEstate] = useState(2_000_000_000);
  const [netFinancial, setNetFinancial] = useState(300_000_000);
  const [debts, setDebts] = useState(0);
  const [funeral, setFuneral] = useState(10_000_000);
  const [spouse, setSpouse] = useState<YesNo>("yes");
  const [spouseInherited, setSpouseInherited] = useState(500_000_000);

  const r = familyBusinessInheritance({
    businessValue, unrelatedAssetRatio: unrelatedPct / 100, years, size, otherEstate, netFinancial, debts,
    funeralSpent: funeral, hasSpouse: spouse === "yes", spouseInherited,
  });

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="가업 주식(개인가업은 사업용 자산) 평가액" value={businessValue} onChange={setBusinessValue} suffix="원" step={100_000_000} />
        <NumberField label="법인 총자산 중 사업무관자산 비율" value={unrelatedPct} onChange={setUnrelatedPct} suffix="%" step={1} />
        <NumberField label="피상속인 가업 경영 기간" value={years} onChange={setYears} suffix="년" step={1} />
        <NumberField label="가업 외 상속재산" value={otherEstate} onChange={setOtherEstate} suffix="원" step={100_000_000} />
        <NumberField label="그중 순금융재산" value={netFinancial} onChange={setNetFinancial} suffix="원" step={10_000_000} />
        <NumberField label="채무" value={debts} onChange={setDebts} suffix="원" step={10_000_000} />
        <NumberField label="장례비용" value={funeral} onChange={setFuneral} suffix="원" step={1_000_000} />
        {spouse === "yes" && <NumberField label="배우자가 실제 상속받는 금액" value={spouseInherited} onChange={setSpouseInherited} suffix="원" step={100_000_000} />}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ChoiceChips legend="기업 규모" value={size} options={SIZE} onChange={setSize} />
        <ChoiceChips legend="배우자" value={spouse} options={YES_NO} onChange={setSpouse} />
      </div>

      <div aria-live="polite" className="mt-5 rounded-md border border-border bg-background px-4 py-4">
        <p className="text-sm text-muted-foreground">가업상속공제 {eok(r.deduction)} (한도 {eok(r.limit)})</p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-muted-foreground">공제 없을 때 상속세</dt><dd className="font-mono text-xl font-bold text-foreground">{won(r.without.tax)}</dd></div>
          <div><dt className="text-muted-foreground">가업상속공제 후 상속세</dt><dd className="font-mono text-xl font-bold text-foreground">{won(r.with.tax)}</dd></div>
          <div><dt className="text-muted-foreground">줄어드는 세금</dt><dd className="font-mono text-xl font-bold text-primary">{won(r.saving)}</dd></div>
        </dl>
        {r.reasons.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
        )}
        <ResultSteps
          steps={[
            `가업상속재산 = ${won(businessValue)} × (1 − 사업무관자산 ${unrelatedPct}%) = ${won(r.qualifying)}`,
            `한도: 경영 ${Math.floor(years)}년 → ${r.limit ? eok(r.limit) : "대상 아님(10년 미만)"} → 공제 ${won(r.deduction)}`,
            `과세가액 ${won(r.with.taxableEstate)} = 총 상속재산 ${won(r.gross)} − 채무 − 장례비용 ${won(r.funeral)}`,
            `공제 합계 ${won(r.with.deductions)} = 일괄 5억 + 배우자 ${won(r.with.spouse)} + 금융재산 ${won(r.with.financial)} + 가업상속 ${won(r.deduction)} (과세가액 한도)`,
            `과세표준 ${won(r.with.base)} → 산출세액 ${won(r.with.calculated)} − 신고세액공제 3% ${won(r.with.credit)}`,
            "사전증여 합산, 감정평가수수료, 동거주택·영농상속공제, 연부연납·납부유예, 사후관리 위반 추징은 넣지 않았어요.",
          ]}
          next={[
            { href: "/ko/unlisted-share-valuation-calculator/", label: "비상장주식 평가" },
            { href: "/ko/inheritance-tax-calculator/", label: "일반 상속세 계산" },
          ]}
        />
      </div>
    </div>
  );
}
