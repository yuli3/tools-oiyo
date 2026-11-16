// 노란우산공제 소득공제 절세액 (2026-11-16, Gemini 이전 B 2차). 계산: lib/kr-household-tax-2026.ts yellowUmbrella.
import { HOUSEHOLD_TAX_AS_OF, YELLOW_UMBRELLA, yellowUmbrella, type YellowUmbrellaInput } from "../../../lib/kr-household-tax-2026";
import { UMBRELLA_ASSUMPTIONS, umbrellaSaved } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "yellow-umbrella-deduction-calculator";
const EXAMPLE: YellowUmbrellaInput = { kind: "business", income: 35_000_000, paid: 6_000_000, otherDeductions: 1_500_000 };
const pct = (r: number) => `${Math.round(r * 1000) / 10}%`;

export default function YellowUmbrella() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<YellowUmbrellaInput>("household-yellow-umbrella", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<YellowUmbrellaInput>) => setInput({ ...input, ...p });
  const r = yellowUmbrella(input);
  const assumptions = UMBRELLA_ASSUMPTIONS(input);
  const ceo = input.kind === "ceo";

  const reasons: string[] = [];
  if (!r.eligible) reasons.push("법인 대표는 총급여 8천만 원 이하일 때만 소득공제를 받아요. 가입·적립과 압류 금지 보호는 그대로예요.");
  else {
    reasons.push(`${ceo ? "근로소득금액" : "사업소득금액"} ${roughWon(r.basisIncome)} 구간의 공제 한도는 ${roughWon(r.limit)}이에요.`);
    reasons.push(`낸 돈 중 ${roughWon(r.deduction)}을 소득에서 빼서 세금(지방세 포함)이 약 ${roughWon(r.saved)} 줄어요. 낸 돈 대비 ${pct(r.marginalRate)}예요.`);
    if (r.overLimit > 0) reasons.push(`한도를 넘는 ${roughWon(r.overLimit)}은 공제는 안 되지만 적립·이자는 쌓여요.`);
    else if (r.deduction < r.limit) reasons.push(`한도까지 넣으면 약 ${roughWon(r.savedAtLimit)}까지 줄일 수 있어요.`);
  }
  reasons.push("폐업·노령(60세 이상 10년 납입) 등으로 받으면 퇴직소득으로 낮게 과세되지만, 임의 해지하면 공제받은 돈과 이자가 기타소득(16.5%)이에요.");

  const memo = () =>
    [
      `[노란우산공제 소득공제] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `${ceo ? "법인 대표 총급여" : "사업소득금액"} ${exactWon(input.income)}, 납입 ${exactWon(input.paid)} → 한도 ${exactWon(r.limit)}, 공제 ${exactWon(r.deduction)}`,
      `줄어드는 세금(지방세 포함) ${exactWon(r.saved)}, 한도까지 납입 시 ${exactWon(r.savedAtLimit)}`,
      "근거: 조세특례제한법 제86조의3, 중소기업협동조합법 제115조. 2026-07-01 납입분부터 연 납입 한도 1,800만 원.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<"business" | "ceo"> legend="어떤 사업자인가요?" value={input.kind} options={[{ value: "business", label: "개인사업자" }, { value: "ceo", label: "소기업 법인 대표" }]} onChange={(v) => edit({ kind: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={ceo ? "1년 총급여" : easy ? "1년 번 돈(매출 − 경비)" : "사업소득금액(부동산임대 제외)"} value={input.income} onChange={(v) => edit({ income: v })} />
          <MoneyField label="1년에 넣는 돈" value={input.paid} onChange={(v) => edit({ paid: v })} hint={`월 5만~, 연 ${roughWon(YELLOW_UMBRELLA.annualPayCap)}까지`} />
          {!easy && <MoneyField label="다른 소득공제 합계(인적공제·연금보험료 등)" value={input.otherDeductions ?? 1_500_000} onChange={(v) => edit({ otherDeductions: v })} />}
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.eligible ? `세금이 약 ${roughWon(r.saved)} 줄어요(추정).` : "총급여 8천만 원을 넘는 법인 대표는 소득공제가 안 돼요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "공제 한도", value: money(r.limit) },
            { label: "소득공제", value: money(r.deduction) },
            { label: "줄어드는 세금", value: money(r.saved) },
          ]}
        >
          <CompareBars
            title="낸 돈과 공제·절세"
            items={[
              { label: "1년 납입", value: input.paid },
              { label: "소득공제", value: r.deduction, current: true },
              { label: "줄어드는 세금", value: r.saved },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={assumptions}
          evaluate={umbrellaSaved}
          sliders={["paid"]}
          sweeps={["paid", "income"]}
          yLabel="줄어드는 세금"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "paid" ? "공제 한도까지는 넣을수록 세금이 줄고, 그 뒤로는 평평해요." : k === "income" ? "소득이 높을수록 세율이 높아 같은 공제의 효과가 커지지만, 4천만·1억을 넘으면 한도가 줄어요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 가입·공제받아요"
            items={[
              "중소기업중앙회 노란우산 누리집이나 시중은행에서 가입해요(사업자등록증 필요).",
              "5월 종합소득세 신고 때 납입증명서 금액을 '소기업·소상공인 공제부금' 칸에 넣어요. 홈택스 간소화 자료에도 나와요.",
              "법인 대표는 연말정산 때 회사에 납입증명서를 내요.",
            ]}
            note="법령 정보이며 세무 대리·자문이 아니에요. 공제 구간과 납입 한도는 2026년 기준이에요."
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
