// 휴업수당 (2026-11-16, Gemini 이전 A). 계산: lib/kr-welfare-2026.ts shutdownAllowance.
import { WELFARE_AS_OF, shutdownAllowance, type ShutdownPayInput } from "../../../lib/kr-welfare-2026";
import { SHUTDOWN_ASSUMPTIONS, shutdownMin } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "shutdown-allowance-calculator";
const EXAMPLE: ShutdownPayInput = { threeMonthWages: 9_000_000, calendarDays: 92, monthlyOrdinaryWage: 2_800_000, shutdownDays: 30, paidDuringShutdown: 0, approvedReduction: false, fivePlus: true };
const SIZE = [
  { value: "5plus", label: "5명 이상" },
  { value: "under5", label: "5명 미만" },
] as const;

export default function ShutdownAllowance() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<ShutdownPayInput>("labor-shutdown", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<ShutdownPayInput>) => setInput({ ...input, ...p });
  const r = shutdownAllowance(input);
  const reasons: string[] = [];
  if (!r.applies) reasons.push("5명 미만 사업장에는 휴업수당(제46조)이 적용되지 않아요(시행령 별표 1). 근로계약서·취업규칙에 따로 정했는지 확인해요.");
  else if (input.approvedReduction) reasons.push("노동위원회가 감액을 승인했다면 70%보다 적게 줄 수 있어요. 승인서를 회사에 보여 달라고 하세요.");
  else reasons.push(r.useOrdinary ? "평균임금 70%가 통상임금보다 많아, 회사는 통상임금(쉰 날 × 1일 통상임금)으로 줄 수 있어요." : `1일 평균임금 ${r.avgDaily.toLocaleString("ko-KR")}원의 70%를 쉰 날만큼 받아요.`);
  if (input.paidDuringShutdown > 0) reasons.push("쉬는 기간에 일부 일하고 받은 임금은 먼저 빼고 70%를 계산해요(시행령 제26조).");
  reasons.push("회사 사정(주문 감소·자재 부족·경영난 등)으로 쉬는 경우예요. 천재지변처럼 회사 책임이 아닌 휴업은 휴업수당이 없을 수 있어요.");
  const headline = r.applies ? (r.minimum > 0 ? `${r.days}일 휴업에 최소 약 ${roughWon(r.minimum)}의 휴업수당을 받아야 해요(추정).` : "노동위원회 승인이 있으면 법정 기준보다 적게 줄 수 있어요.") : "5명 미만 사업장이라 법정 휴업수당은 없어요.";

  const memo = () =>
    [
      `[휴업수당 추정] 기준일 ${WELFARE_AS_OF}`,
      `3개월 임금 ${exactWon(input.threeMonthWages)}(${input.calendarDays}일) → 1일 평균임금 ${exactWon(r.avgDaily)}, 1일 통상임금 ${exactWon(r.ordinaryDaily)}`,
      `휴업 ${r.days}일, 그동안 받은 임금 ${exactWon(input.paidDuringShutdown)} → 법정 최소 ${exactWon(r.statutory)}(${r.useOrdinary ? "통상임금 기준" : "평균임금 70%"})`,
      "근거: 근로기준법 제46조, 시행령 제26조·별표 1(5명 미만 미적용).",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "쉬기 전 석 달 월급 합계(상여 포함, 세금 떼기 전)" : "직전 3개월 임금 총액"} value={input.threeMonthWages} onChange={(v) => edit({ threeMonthWages: v })} hint="예: 900만" />
          <MoneyField label={easy ? "한 달 고정 월급(기본급 + 고정 수당)" : "월 통상임금"} value={input.monthlyOrdinaryWage} onChange={(v) => edit({ monthlyOrdinaryWage: v })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label={easy ? "회사 사정으로 쉰 날(달력 기준)" : "휴업 일수"} value={input.shutdownDays} onChange={(v) => edit({ shutdownDays: v })} suffix="일" />
          <MoneyField label="쉬는 동안 일부 일하고 받은 임금" value={input.paidDuringShutdown} onChange={(v) => edit({ paidDuringShutdown: v })} />
          {!easy && <NumberField label="3개월 달력 날수" value={input.calendarDays} onChange={(v) => edit({ calendarDays: v })} suffix="일" />}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceChips<"5plus" | "under5"> legend="회사 직원 수" value={input.fivePlus ? "5plus" : "under5"} options={SIZE} onChange={(v) => edit({ fivePlus: v === "5plus" })} />
          <ChoiceChips<"yes" | "no"> legend="노동위원회 감액 승인이 있나요?" value={input.approvedReduction ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ approvedReduction: v === "yes" })} />
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={headline}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "법정 최소 휴업수당", value: money(r.minimum) },
            { label: "1일 평균임금", value: money(r.avgDaily) },
            { label: "평소보다 줄어드는 돈", value: money(r.lostVsNormal) },
          ]}
        />
        <CompareBars
          title="같은 기간 받는 돈 비교"
          caption="평균임금 70%가 통상임금보다 많을 때만 회사가 통상임금 기준으로 줄 수 있어요. 강조된 막대가 법정 최소예요."
          items={[
            { label: "평소대로 일했다면", value: r.avgDaily * r.days },
            { label: "평균임금 70%", value: r.seventy, current: !r.useOrdinary && r.applies },
            { label: "통상임금 기준", value: r.ordinaryAlt, current: r.useOrdinary && r.applies },
          ]}
          format={money}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={SHUTDOWN_ASSUMPTIONS}
          evaluate={shutdownMin}
          sliders={["shutdownDays", "threeMonthWages"]}
          sweeps={["shutdownDays", "threeMonthWages", "paidDuringShutdown"]}
          yLabel="법정 최소 휴업수당"
          formatY={roughWon}
          caption={(k) => (k === "paidDuringShutdown" ? "쉬는 동안 받은 임금이 늘수록 휴업수당은 그 70%만큼 줄어요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 받아요"
            items={[
              "휴업 공지·문자와 출근하지 말라는 지시를 남겨 두어요.",
              "휴업수당은 임금이라 정해진 월급날에 받아야 해요. 안 주면 노동포털(labor.moel.go.kr)에 임금체불 진정을 내요.",
              "3년 안에 청구해야 해요(제49조).",
            ]}
            note="회사는 고용유지지원금(고용24)으로 휴업수당 일부를 지원받을 수 있어요. 1350에서 무료 상담하세요."
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
