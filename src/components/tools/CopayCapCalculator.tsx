import { useState } from "react";
import {
  CAP_GROUP_LABEL,
  CAP_GROUPS,
  copayCapRefund,
  COPAY_CAP_2026,
  groupFromPremium,
  type CapGroup,
  type MemberType,
} from "../../lib/kr-medical-cost-2026";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const man = (n: number) => `${(n / 10_000).toLocaleString("ko-KR")}만 원`;

type Mode = "premium" | "group";

export default function CopayCapCalculator() {
  const [mode, setMode] = useState<Mode>("premium");
  const [member, setMember] = useState<MemberType>("employee");
  const [premium, setPremium] = useState(100_000);
  const [picked, setPicked] = useState<CapGroup>("d4_5");
  const [paid, setPaid] = useState(2_500_000);
  const [stay, setStay] = useState<"no" | "yes">("no");

  const premiumOk = Number.isFinite(premium) && premium >= 0;
  const paidOk = Number.isFinite(paid) && paid >= 0 && paid <= 200_000_000;
  const group: CapGroup = mode === "premium" && premiumOk ? groupFromPremium(premium, member) : picked;
  const result = paidOk ? copayCapRefund(group, paid, stay === "yes") : null;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <ChoiceChips
          legend="내 분위를 어떻게 정할까요?"
          value={mode}
          onChange={setMode}
          options={[
            { value: "premium", label: "월 건강보험료로 추정" },
            { value: "group", label: "분위를 직접 고르기" },
          ]}
        />
        {mode === "premium" ? (
          <>
            <ChoiceChips
              legend="가입 유형"
              value={member}
              onChange={setMember}
              options={[
                { value: "employee", label: "직장가입자" },
                { value: "regional", label: "지역가입자" },
              ]}
            />
            <NumberField
              label={member === "employee" ? "월 건강보험료 본인부담분 (장기요양보험료 제외)" : "세대 월 건강보험료 (장기요양보험료 제외)"}
              value={premium}
              onChange={setPremium}
              suffix="원"
              step={1_000}
            />
            {premiumOk && (
              <p className="text-sm text-muted-foreground">
                추정 분위: <strong className="text-foreground">{CAP_GROUP_LABEL[group]}</strong> (2025년 진료분 기준보험료 구간으로 추정)
              </p>
            )}
          </>
        ) : (
          <ChoiceChips
            legend="소득분위 (공단 안내문이나 The건강보험 앱에서 확인)"
            value={picked}
            onChange={setPicked}
            options={CAP_GROUPS.map((g) => ({ value: g, label: CAP_GROUP_LABEL[g] }))}
          />
        )}
        <NumberField label="올해 병원·약국에 낸 건강보험 본인부담금 합계 (비급여 제외)" value={paid} onChange={setPaid} suffix="원" step={10_000} />
        <ChoiceChips
          legend="요양병원에 올해 120일 넘게 입원했나요?"
          value={stay}
          onChange={setStay}
          options={[
            { value: "no", label: "아니요" },
            { value: "yes", label: "예, 120일 초과" },
          ]}
        />
      </div>

      <div aria-live="polite">
        {result === null ? (
          <p className="text-sm text-muted-foreground">본인부담금은 0원 이상, 2억 원 이하로 넣어 주세요.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card px-5 py-5">
            <p className="text-sm text-muted-foreground">
              {CAP_GROUP_LABEL[group]} 2026년 상한액 {man(result.cap)}
            </p>
            {result.refund > 0 ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">돌려받을 수 있는 금액(추정)</p>
                <p className="mt-1 font-mono text-3xl font-bold text-foreground">{won(result.refund)}</p>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-muted-foreground">아직 상한액에 닿지 않았어요. 남은 금액</p>
                <p className="mt-1 font-mono text-3xl font-bold text-foreground">{won(result.remaining)}</p>
              </>
            )}
            <ResultSteps
              steps={[
                `분위: ${CAP_GROUP_LABEL[group]}${mode === "premium" ? ` (월 보험료 ${won(premium)}, ${member === "employee" ? "직장" : "지역"})` : ""}`,
                `상한액: ${stay === "yes" ? "요양병원 120일 초과" : "일반"} ${man(result.cap)}`,
                `낸 본인부담금 ${won(result.paid)} − 상한액 ${won(result.cap)} = ${result.refund > 0 ? won(result.refund) : "0원 (초과 없음)"}`,
                "실제 분위는 내년 건강보험료 정산이 끝난 뒤 공단이 확정해요. 보통 다음 해 8월쯤 안내문이 와요.",
              ]}
              next={[
                { href: "/ko/medical-expense-tax-credit-calculator/", label: "의료비 세액공제 계산" },
                { href: "/ko/health-insurance-calculator/", label: "건강보험료 계산" },
                { href: "/ko/health-insurance-leaver-settlement/", label: "퇴사자 건보료 정산" },
              ]}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground">2026년 소득분위별 상한액</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">분위</th>
                <th className="py-2 pr-3 font-medium">일반</th>
                <th className="py-2 font-medium">요양병원 120일 초과</th>
              </tr>
            </thead>
            <tbody>
              {CAP_GROUPS.map((g) => (
                <tr key={g} className={g === group ? "bg-muted font-semibold text-foreground" : "text-foreground"}>
                  <td className="py-2 pr-3">{CAP_GROUP_LABEL[g]}</td>
                  <td className="py-2 pr-3 font-mono">{man(COPAY_CAP_2026[g].general)}</td>
                  <td className="py-2 font-mono">{man(COPAY_CAP_2026[g].longStay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
