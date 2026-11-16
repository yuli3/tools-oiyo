// 하도급대금 직접 지급·지연이자 점검 (2026-11-16, Gemini 이전 A). 계산: lib/kr-welfare-2026.ts directPaymentCheck.
import { WELFARE_AS_OF, SUBCONTRACT_LATE_RATE, directPaymentCheck, type DirectPayCause, type DirectPayInput } from "../../../lib/kr-welfare-2026";
import { SUBCONTRACT_ASSUMPTIONS, subcontractLate } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "subcontract-direct-payment-checker";
const EXAMPLE: DirectPayInput = { cause: "twoMissed", missedInstallments: 2, requested: true, primeStopRequest: false, workValue: 50_000_000, receivedFromPrime: 10_000_000, ownerUnpaidToPrime: 30_000_000, daysSinceDelivery: 120 };
const CAUSES: { value: DirectPayCause; label: string }[] = [
  { value: "twoMissed", label: "원사업자가 2회분 이상 안 줬어요" },
  { value: "insolvency", label: "원사업자 지급정지·파산·면허취소" },
  { value: "noGuarantee", label: "원사업자가 지급보증을 안 했어요" },
  { value: "agreement", label: "셋이 직접 지급에 합의했어요" },
  { value: "none", label: "해당 없음" },
];
const CITE = { twoMissed: "제14조①3호", insolvency: "제14조①1호", noGuarantee: "제14조①4호", agreement: "제14조①2호", none: "" } as const;

export default function SubcontractDirectPay() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<DirectPayInput>("biz-subcontract-direct", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<DirectPayInput>) => setInput({ ...input, ...p });
  const r = directPaymentCheck(input);
  const reasons: string[] = [];
  if (input.cause === "none") reasons.push("직접 지급 사유(제14조① 4가지)가 없으면 발주자에게 직접 받을 수 없어요. 원사업자에게 청구하고 공정위 신고를 검토해요.");
  else if (!r.causeOk) reasons.push(input.cause === "twoMissed" && input.missedInstallments < 2 ? "못 받은 회차가 2회분 이상이어야 해요." : "1·3·4호는 수급사업자가 발주자에게 직접 지급을 '요청'해야 해요. 내용증명으로 요청하세요.");
  else reasons.push(`${CITE[input.cause]} 사유라 발주자가 내가 한 부분의 대금을 직접 줘야 해요. 그만큼 발주자의 원사업자 대금과 원사업자의 내 대금은 함께 없어져요(제14조②).`);
  if (r.blocked) reasons.push("원사업자가 내 임금·자재대금 체불을 서류로 입증해 중지를 요청하면 발주자는 직접 지급하지 않아요(제14조③, 원사업자 탓인 체불은 예외).");
  reasons.push(`발주자가 그 부분에 대해 원사업자에게 이미 준 돈은 빼고, 아직 주지 않은 범위 안에서 받아요(제14조④). 남는 ${roughWon(r.remainder)}은 원사업자에게 청구해요.`);
  if (r.lateDays > 0) reasons.push(`수령일부터 60일이 지나 ${r.lateDays}일치 지연이자(연 ${(SUBCONTRACT_LATE_RATE * 100).toFixed(1)}%, 공정위 고시)를 원사업자에게 청구할 수 있어요(제13조⑧).`);
  const headline = r.eligible ? `발주자에게 최대 약 ${roughWon(r.direct)}을 직접 청구할 수 있어요(추정).` : r.blocked ? "원사업자의 중지 요청 때문에 지금은 직접 지급이 막혀 있어요." : "아직 직접 지급 요건이 갖춰지지 않았어요.";

  const memo = () =>
    [
      `[하도급대금 직접 지급 점검] 기준일 ${WELFARE_AS_OF}`,
      `사유 ${CAUSES.find((c) => c.value === input.cause)?.label}${CITE[input.cause] ? ` (${CITE[input.cause]})` : ""}, 요청 ${input.requested ? "함" : "안 함"}`,
      `이행 대금 ${exactWon(input.workValue)} − 받은 돈 ${exactWon(input.receivedFromPrime)} = 미지급 ${exactWon(r.outstanding)}`,
      `발주자 직접 지급 상한 ${exactWon(r.direct)}, 원사업자에게 남는 청구 ${exactWon(r.remainder)}, 지연이자 ${exactWon(r.lateInterest)}(${r.lateDays}일)`,
      "근거: 하도급법 제13조①③⑧, 제14조, 공정거래위원회 지연이율 고시 연 15.5%. 건설공사는 건설산업기본법 제35조도 확인.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<DirectPayCause> legend={easy ? "어떤 상황인가요?" : "직접 지급 사유(제14조①)"} value={input.cause} options={CAUSES} onChange={(v) => edit({ cause: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "내가 한 일의 하도급대금" : "이행 부분 하도급대금"} value={input.workValue} onChange={(v) => edit({ workValue: v })} hint="예: 5,000만" />
          <MoneyField label="원사업자에게 이미 받은 돈" value={input.receivedFromPrime} onChange={(v) => edit({ receivedFromPrime: v })} />
          <MoneyField label={easy ? "발주자가 원사업자에게 아직 안 준 돈(모르면 대금과 같게)" : "발주자의 원사업자 미지급 대금"} value={input.ownerUnpaidToPrime} onChange={(v) => edit({ ownerUnpaidToPrime: v })} />
          <NumberField label="물건·공사를 넘긴 날부터 지난 날" value={input.daysSinceDelivery} onChange={(v) => edit({ daysSinceDelivery: v })} suffix="일" />
          {input.cause === "twoMissed" && <NumberField label="못 받은 지급 회차" value={input.missedInstallments} onChange={(v) => edit({ missedInstallments: v })} suffix="회" />}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceChips<"yes" | "no"> legend="발주자에게 직접 지급을 요청했나요?" value={input.requested ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ requested: v === "yes" })} />
          {!easy && <ChoiceChips<"yes" | "no"> legend="원사업자가 체불 입증해 중지 요청(제14조③)" value={input.primeStopRequest ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ primeStopRequest: v === "yes" })} />}
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={headline}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "못 받은 대금", value: money(r.outstanding) },
            { label: "발주자에게 직접", value: money(r.direct) },
            { label: "지연이자(원사업자)", value: money(r.lateInterest) },
          ]}
        />
        <CompareBars
          title="못 받은 돈은 누구에게 받나"
          items={[
            { label: "발주자 직접 지급", value: r.direct, current: true },
            { label: "원사업자에게 남는 청구", value: r.remainder },
            { label: "지연이자(원사업자)", value: r.lateInterest },
          ]}
          format={money}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={SUBCONTRACT_ASSUMPTIONS}
          evaluate={subcontractLate}
          sliders={["daysSinceDelivery"]}
          sweeps={["daysSinceDelivery", "workValue"]}
          yLabel="지연이자"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "daysSinceDelivery" ? "수령일부터 60일까지는 0원, 그 뒤로 하루마다 미지급액 × 15.5% ÷ 365씩 늘어요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 해요"
            items={[
              "하도급 계약서, 납품·준공 확인서, 세금계산서, 받은 돈 내역을 모아요.",
              "발주자에게 직접 지급을 요청하는 내용증명을 보내요(1·3·4호는 요청이 요건이에요).",
              "원사업자에게는 남은 대금과 지연이자를 청구하고, 안 되면 공정거래위원회 신고나 한국공정거래조정원 하도급 분쟁조정(무료)을 신청해요.",
              "건설공사라면 건설산업기본법 제35조의 직접 지급과 공공공사 하도급지킴이도 확인해요.",
            ]}
            note="법령 정보이며 대리·자문이 아니에요. 금액이 크면 변호사 상담을 받으세요. 대한법률구조공단 132."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <CopyMemo text={memo} />
            <button type="button" onClick={reset} className="min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
              예시로 되돌리기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
