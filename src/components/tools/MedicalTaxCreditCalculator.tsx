import { useState } from "react";
import { MEDICAL_CREDIT, medicalExpenseCredit } from "../../lib/kr-medical-cost-2026";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export default function MedicalTaxCreditCalculator() {
  const [salary, setSalary] = useState(50_000_000);
  const [general, setGeneral] = useState(1_000_000);
  const [specific, setSpecific] = useState(2_000_000);
  const [premature, setPremature] = useState(0);
  const [infertility, setInfertility] = useState(0);

  const values = [salary, general, specific, premature, infertility];
  const ok = values.every((v) => Number.isFinite(v) && v >= 0 && v <= 10_000_000_000);
  const r = ok ? medicalExpenseCredit(salary, { general, specific, premature, infertility }) : null;
  const total = general + specific + premature + infertility;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <NumberField label="총급여 (연봉에서 비과세 소득을 뺀 금액)" value={salary} onChange={setSalary} suffix="원" step={1_000_000} />
        <p className="text-sm text-muted-foreground">의료비는 실손보험에서 돌려받은 금액과 본인부담상한제 환급금을 빼고 넣어 주세요.</p>
        <NumberField label="본인·65세 이상·장애인·6세 이하·산정특례자 의료비 (한도 없음)" value={specific} onChange={setSpecific} suffix="원" step={100_000} />
        <NumberField label="그 밖의 부양가족 의료비 (700만 원 한도)" value={general} onChange={setGeneral} suffix="원" step={100_000} />
        <NumberField label="미숙아·선천성이상아 의료비 (20%)" value={premature} onChange={setPremature} suffix="원" step={100_000} />
        <NumberField label="난임시술비 (30%)" value={infertility} onChange={setInfertility} suffix="원" step={100_000} />
      </div>

      <div aria-live="polite">
        {r === null ? (
          <p className="text-sm text-muted-foreground">금액은 0원 이상으로 넣어 주세요.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card px-5 py-5">
            <p className="text-sm text-muted-foreground">줄어드는 세금 (지방소득세 포함, 추정)</p>
            <p className="mt-1 font-mono text-3xl font-bold text-foreground">{won(r.withLocal)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              소득세 세액공제 {won(r.credit)}
              {total <= r.floor ? ` · 의료비가 총급여 3%(${won(r.floor)})를 넘지 않아 공제가 없어요.` : ""}
            </p>
            <ResultSteps
              steps={[
                `문턱: 총급여 ${won(salary)} × 3% = ${won(r.floor)}. 이 금액은 일반 → 본인 등 → 미숙아 → 난임 순서로 먼저 빼요.`,
                `일반 부양가족: ${won(general)} → 공제 대상 ${won(r.generalBase)}${general - Math.min(general, r.floor) > MEDICAL_CREDIT.generalCap ? " (700만 원 한도)" : ""}`,
                `본인·65세 이상 등: ${won(specific)} → ${won(r.specificBase)}`,
                `미숙아·선천성이상아: ${won(premature)} → ${won(r.prematureBase)} · 난임시술비: ${won(infertility)} → ${won(r.infertilityBase)}`,
                `(${won(r.generalBase)} + ${won(r.specificBase)}) × 15% + ${won(r.prematureBase)} × 20% + ${won(r.infertilityBase)} × 30% = ${won(r.credit)}`,
                `지방소득세 10% 더하면 ${won(r.withLocal)}. 결정세액보다 많이 줄지는 않아요.`,
              ]}
              next={[
                { href: "/ko/copay-cap-refund-calculator/", label: "본인부담상한제 환급 계산" },
                { href: "/ko/year-end-settlement-calculator/", label: "연말정산 전체 계산" },
                { href: "/ko/tax-savings-roadmap/", label: "절세 로드맵" },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
