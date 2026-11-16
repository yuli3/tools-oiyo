// 업무용 승용차 비용 한도 (2026-11-16, Gemini 이전 B 3차). 계산: lib/kr-household-tax-2026.ts businessCarExpense.
import { BUSINESS_CAR, HOUSEHOLD_TAX_AS_OF, businessCarExpense, type BusinessCarInput } from "../../../lib/kr-household-tax-2026";
import { CAR_ASSUMPTIONS, carDisallowed } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "business-car-expense-calculator";
const EXAMPLE: BusinessCarInput = { ownership: "own", amount: 60_000_000, otherCosts: 8_000_000, logbook: false, businessShare: 0.9, marginalRate: 0.264 };
const OWN = [
  { value: "own" as const, label: "샀어요" },
  { value: "lease" as const, label: "리스" },
  { value: "rent" as const, label: "장기렌트" },
];
const pct = (r: number) => `${Math.round(r * 1000) / 10}%`;

export default function BusinessCar() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<BusinessCarInput>("household-business-car", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<BusinessCarInput>) => setInput({ ...input, ...p });
  const r = businessCarExpense(input);
  const assumptions = CAR_ASSUMPTIONS(input);

  const reasons: string[] = [
    `1년 차량 비용은 ${input.ownership === "own" ? "감가상각(차값 ÷ 5)" : input.ownership === "rent" ? "렌트료(70%를 감가상각으로 봐요)" : "리스료"}와 유지비를 더해 ${roughWon(r.total)}이에요.`,
    input.logbook
      ? `운행기록부의 업무 비율 ${pct(r.ratio)}만큼(${roughWon(r.businessCost)}) 비용으로 봐요.`
      : `운행기록부가 없으면 1,500만 원까지만 업무용으로 봐요. 그래서 ${pct(r.ratio)}(${roughWon(r.businessCost)})만 인정돼요.`,
  ];
  if (r.carriedOver > 0) reasons.push(`업무용 감가상각비가 연 800만 원을 넘어 ${roughWon(r.carriedOver)}은 올해 비용에서 빠지고 다음 해로 넘어가요.`);
  reasons.push(`결국 ${roughWon(r.deductible)}이 비용으로 인정돼 세금이 약 ${roughWon(r.taxSaved)} 줄고, ${roughWon(r.disallowed)}은 올해 인정되지 않아요.`);
  if (!input.logbook && r.deductibleWithFullLog > r.deductible) reasons.push(`운행기록부를 쓰고 업무 비율이 높으면 최대 ${roughWon(r.deductibleWithFullLog)}까지 인정받을 수 있어요.`);
  reasons.push("법인과 복식부기의무 개인사업자는 업무전용자동차보험에 가입해야 이 비용을 인정받아요. 법인 차량은 8천만 원 이상이면 연두색 번호판이에요.");

  const memo = () =>
    [
      `[업무용 승용차 비용 한도] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `${OWN.find((o) => o.value === input.ownership)?.label} ${exactWon(input.amount)}, 유지비 ${exactWon(input.otherCosts)}, 운행기록부 ${input.logbook ? `있음(업무 ${pct(r.ratio)})` : "없음"}`,
      `총비용 ${exactWon(r.total)} → 업무사용 ${exactWon(r.businessCost)}, 감가상각 이월 ${exactWon(r.carriedOver)}, 인정 ${exactWon(r.deductible)}, 불인정 ${exactWon(r.disallowed)}`,
      "근거: 법인세법 제27조의2, 소득세법 제33조의2, 각 시행령(1,500만 원, 800만 원). 부동산임대업 주업 법인 등은 500만·400만 원.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<BusinessCarInput["ownership"]> legend="차를 어떻게 마련했나요?" value={input.ownership} options={OWN} onChange={(v) => edit({ ownership: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={input.ownership === "own" ? "차값(부가세 포함)" : input.ownership === "lease" ? "1년 리스료(포함된 보험료·세금·수리비 빼고)" : "1년 렌트료"} value={input.amount} onChange={(v) => edit({ amount: v })} />
          <MoneyField label="1년 유지비(기름값·보험료·자동차세·수리비·통행료)" value={input.otherCosts} onChange={(v) => edit({ otherCosts: v })} />
          <ChoiceChips<"yes" | "no"> legend="운행기록부를 쓰나요?" value={input.logbook ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ logbook: v === "yes" })} />
          {input.logbook && <NumberField label="업무로 달린 거리 비율" value={Math.round((input.businessShare ?? 0) * 100)} onChange={(v) => edit({ businessShare: Math.min(100, Math.max(0, v)) / 100 })} suffix="%" />}
          {!easy && <NumberField label="한계세율(지방세 포함)" value={Math.round((input.marginalRate ?? 0.264) * 1000) / 10} onChange={(v) => edit({ marginalRate: Math.min(100, Math.max(0, v)) / 100 })} suffix="%" step={0.1} />}
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={`1년 ${roughWon(r.total)} 중 ${roughWon(r.deductible)}만 비용으로 인정돼요(추정).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "인정 비용", value: money(r.deductible) },
            { label: "불인정·이월", value: money(r.disallowed) },
            { label: "줄어드는 세금", value: money(r.taxSaved) },
          ]}
        >
          <CompareBars
            title="차량 비용 중 인정되는 몫"
            items={[
              { label: "1년 총비용", value: r.total },
              { label: "인정 비용", value: r.deductible, current: true },
              { label: "운행기록부 100%일 때", value: r.deductibleWithFullLog },
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
          evaluate={carDisallowed}
          sliders={["otherCosts", "amount"]}
          sweeps={["otherCosts", "amount"]}
          yLabel="인정되지 않는 비용"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "amount" && input.ownership === "own" ? `차값이 ${roughWon(BUSINESS_CAR.depreciationCap * BUSINESS_CAR.years)}을 넘으면 1년 감가상각비가 800만 원을 넘어 이월이 생겨요.` : k === "otherCosts" && !input.logbook ? "운행기록부가 없으면 총비용 1,500만 원을 넘는 만큼 그대로 불인정이에요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 관리해요"
            items={[
              "업무전용자동차보험(임직원 운전자 한정)에 가입해요.",
              "국세청 서식의 업무용승용차 운행기록부에 날짜·목적지·주행거리를 적어요. 출퇴근도 업무로 봐요.",
              "법인세·종합소득세 신고 때 '업무용승용차 관련비용 명세서'를 함께 내요.",
            ]}
            note="법령 정보이며 세무 대리·자문이 아니에요. 경차·9인승 이상·화물차는 이 규정 대상이 아니에요."
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
