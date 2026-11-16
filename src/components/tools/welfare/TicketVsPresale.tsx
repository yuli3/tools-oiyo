// 재건축·재개발 입주권 vs 분양권 양도세 (2026-11-16, Gemini 이전 B 4차). 계산: lib/kr-household-tax-2026.ts ticketPresaleTax.
import { HOUSEHOLD_TAX_AS_OF, ticketPresaleTax, type TicketPresaleInput } from "../../../lib/kr-household-tax-2026";
import { TICKET_ASSUMPTIONS, ticketTotal } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "redevelopment-ticket-vs-presale-tax-calculator";
const EXAMPLE: TicketPresaleInput = { kind: "ticket", gain: 300_000_000, holdYears: 8, original: true, preApprovalGain: 150_000_000, yearsToApproval: 6, oneHouseExempt: false, salePrice: 1_100_000_000, liveYears: 0 };
const KIND = { ticket: "조합원입주권", presale: "분양권" } as const;

export default function TicketVsPresale() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<TicketPresaleInput>("household-ticket-presale", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<TicketPresaleInput>) => setInput({ ...input, ...p });
  const r = ticketPresaleTax(input);
  const isTicket = input.kind === "ticket";

  const reasons: string[] = [];
  if (r.exempt) reasons.push("원조합원이고 관리처분계획인가일에 기존 집이 1세대1주택 비과세 요건을 채워 12억 원까지 비과세예요(소득세법 제89조①4호).");
  else if (isTicket) {
    reasons.push(input.holdYears < 2 ? `입주권은 주택처럼 1년 미만 70%, 2년 미만 60%예요. 지금은 ${r.rateLabel}를 적용해요.` : "입주권은 2년 이상 가지고 있으면 일반 기본세율(6~45%)이에요.");
    reasons.push(input.original ? `원조합원은 기존 집 취득부터 관리처분계획인가일까지 오른 몫에만 장기보유특별공제를 받아요: ${roughWon(r.longTerm)}.` : "입주권을 사서 승계한 조합원은 장기보유특별공제가 없어요.");
  } else {
    reasons.push(`분양권은 얼마나 가지고 있든 1년 미만 70%, 그 뒤 60%예요. 장기보유특별공제도 비과세도 없어요: ${r.rateLabel}.`);
  }
  reasons.push(`같은 차익과 보유기간이면 입주권 ${roughWon(r.ticket)}, 분양권 ${roughWon(r.presale)}이에요.`);
  reasons.push("입주권·분양권(2021년 이후 취득)은 다른 집을 팔 때 주택 수에 들어가요.");

  const memo = () =>
    [
      `[입주권 vs 분양권 양도세] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `${KIND[input.kind]}, 양도차익 ${exactWon(input.gain)}, 보유 ${input.holdYears}년${isTicket ? `, ${input.original ? "원조합원" : "승계조합원"}` : ""}`,
      `장기보유특별공제 ${exactWon(r.longTerm)}, 과세표준 ${exactWon(r.base)}, 세율 ${r.rateLabel}, 세금 ${exactWon(r.total)}(지방세 포함)`,
      `비교: 입주권 ${exactWon(r.ticket)} / 분양권 ${exactWon(r.presale)}`,
      "근거: 소득세법 제89조①4호·제95조②·제103조·제104조①, 시행령 제166조.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceChips<"ticket" | "presale"> legend="무엇을 파나요?" value={input.kind} options={[{ value: "ticket", label: "재건축·재개발 입주권" }, { value: "presale", label: "분양권" }]} onChange={(v) => edit({ kind: v })} />
          <MoneyField label={easy ? "판 값 − 산 값(번 돈)" : "양도차익"} value={input.gain} onChange={(v) => edit({ gain: v })} />
          <NumberField label={easy ? "가지고 있던 기간" : "보유기간"} value={input.holdYears} onChange={(v) => edit({ holdYears: Math.max(0, v) })} suffix="년" step={0.5} />
          {isTicket && <ChoiceChips<"yes" | "no"> legend="원래 집을 갖고 있다가 입주권이 됐나요?" value={input.original ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ original: v === "yes" })} />}
        </div>
        {isTicket && input.original && !easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="관리처분계획인가일까지 오른 몫" value={input.preApprovalGain ?? 0} onChange={(v) => edit({ preApprovalGain: v })} hint="권리가액 − 기존 집 취득가" />
            <NumberField label="기존 집 취득 ~ 관리처분인가" value={input.yearsToApproval ?? 0} onChange={(v) => edit({ yearsToApproval: Math.max(0, v) })} suffix="년" />
            <ChoiceChips<"yes" | "no"> legend="인가일에 1세대1주택 비과세 요건을 채웠고 다른 집이 없나요?" value={input.oneHouseExempt ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ oneHouseExempt: v === "yes" })} />
            <MoneyField label="양도가액(12억 판단)" value={input.salePrice ?? 0} onChange={(v) => edit({ salePrice: v })} />
            {input.oneHouseExempt && <NumberField label="기존 집 거주기간" value={input.liveYears ?? 0} onChange={(v) => edit({ liveYears: Math.max(0, v) })} suffix="년" />}
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.exempt ? "이 입주권은 비과세예요(추정)." : `${KIND[input.kind]} 양도세는 지방세 포함 약 ${roughWon(r.total)}이에요(추정).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "세율", value: r.rateLabel },
            { label: "장기보유특별공제", value: money(r.longTerm) },
            { label: "세금(지방세 포함)", value: money(r.total) },
          ]}
        >
          <CompareBars
            title="같은 차익의 세금"
            items={[
              { label: "입주권", value: r.ticket, current: isTicket },
              { label: "분양권", value: r.presale, current: !isTicket },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={TICKET_ASSUMPTIONS}
          evaluate={ticketTotal}
          sliders={["gain", "holdYears"]}
          sweeps={["holdYears", "gain"]}
          yLabel="양도세(지방세 포함)"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "holdYears" ? "1년과 2년에서 세율이 계단처럼 떨어져요. 분양권은 1년 뒤로는 60%에서 멈춰요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 활용해요"
            items={[
              "입주권은 2년을 넘기면 세율이 크게 떨어져요. 팔 날짜를 보유기간 2년 뒤로 잡을 수 있는지 봐요.",
              "분양권은 1년만 넘겨도 70%에서 60%로 내려가지만 그 뒤로는 더 안 내려가요.",
              "양도일이 속한 달의 말일부터 2개월 안에 예정신고해요.",
            ]}
            note="법령 정보이며 세무 자문이 아니에요. 청산금·조정대상지역 중과·일시적 2주택 특례는 넣지 않았어요."
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
