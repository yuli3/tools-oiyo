// 정책 주거대출 자격 찾기 (2026-11-16, Gemini 이전 C 1차). 계산: lib/kr-welfare-2026.ts housingLoanBest.
import { WELFARE_AS_OF, housingLoanBest, type HousingLoanInput } from "../../../lib/kr-welfare-2026";
import { LOAN_ASSUMPTIONS, loanBest } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "policy-housing-loan-eligibility-checker";
const EXAMPLE: HousingLoanInput = { purpose: "jeonse", age: 29, income: 42_000_000, netAssets: 60_000_000, newlywed: false, children: 0, newbornWithin2y: false, firstTimeBuyer: true, metro: true, amount: 200_000_000, monthlyRent: 0, areaM2: 40, dualIncome: false, dreamAccount: false, singleHousehold: true };
const PURPOSE = [
  { value: "buy", label: "집 사기" },
  { value: "jeonse", label: "전세" },
  { value: "monthly", label: "월세" },
] as const;
const pct = (r: [number, number]) => `연 ${(r[0] * 100).toFixed(1)}~${(r[1] * 100).toFixed(1)}%`;

export default function HousingLoanFinder() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<HousingLoanInput>("welfare-housing-loan", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<HousingLoanInput>) => setInput({ ...input, ...p });
  const r = housingLoanBest(input);
  const best = r.options.find((o) => o.id === r.best);
  const reasons = r.options.map((o) => (o.eligible ? `✓ ${o.name}: 최대 약 ${roughWon(o.maxLoan)}, ${pct(o.rate)}` : `✗ ${o.name}: ${o.reasons.join(", ")}`));
  reasons.push("공통 요건: 세대원 모두 무주택인 세대주, 전용 85㎡ 이하(수도권 밖 읍·면 100㎡). 한도는 상품 한도와 집값·보증금 비율 중 작은 쪽이에요.");

  const memo = () =>
    [
      `[정책 주거대출 자격] 기준일 ${WELFARE_AS_OF} (기금e든든 2026 기준)`,
      `목적 ${PURPOSE.find((p) => p.value === input.purpose)?.label}, 소득 ${exactWon(input.income)}, 순자산 ${exactWon(input.netAssets)}, ${input.purpose === "buy" ? "주택가격" : "보증금"} ${exactWon(input.amount)}`,
      ...r.options.map((o) => `- ${o.name}: ${o.eligible ? `가능, 최대 ${exactWon(o.maxLoan)}, ${pct(o.rate)}` : `불가(${o.reasons.join(", ")})`}`),
      "실제 한도·금리는 수탁은행 심사(LTV·DTI, 신용)로 정해져요.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceChips<HousingLoanInput["purpose"]> legend="무엇에 쓸 돈인가요?" value={input.purpose} options={PURPOSE} onChange={(v) => edit({ purpose: v })} />
          <NumberField label="만 나이" value={input.age} onChange={(v) => edit({ age: Math.max(0, Math.round(v)) })} suffix="세" />
          <MoneyField label={easy ? "1년 소득(부부 합산, 세전)" : "부부 합산 연소득"} value={input.income} onChange={(v) => edit({ income: v })} />
          <MoneyField label={easy ? "재산 − 빚(부부 합산)" : "부부 합산 순자산"} value={input.netAssets} onChange={(v) => edit({ netAssets: v })} />
          <MoneyField label={input.purpose === "buy" ? "집값" : "보증금"} value={input.amount} onChange={(v) => edit({ amount: v })} />
          {input.purpose === "monthly" && <MoneyField label="한 달 월세" value={input.monthlyRent ?? 0} onChange={(v) => edit({ monthlyRent: v })} />}
          <ChoiceChips<"yes" | "no"> legend="수도권인가요?" value={input.metro ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ metro: v === "yes" })} />
          <ChoiceChips<"yes" | "no"> legend="결혼 7년 안(또는 3개월 안 결혼 예정)인가요?" value={input.newlywed ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ newlywed: v === "yes" })} />
          <ChoiceChips<"yes" | "no"> legend="2년 안에 아이를 낳거나 입양했나요?" value={input.newbornWithin2y ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ newbornWithin2y: v === "yes" })} />
          {input.purpose === "buy" && <ChoiceChips<"yes" | "no"> legend="생애 처음 집을 사나요?" value={input.firstTimeBuyer ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ firstTimeBuyer: v === "yes" })} />}
        </div>
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="자녀 수" value={input.children} onChange={(v) => edit({ children: Math.max(0, Math.round(v)) })} suffix="명" />
            <NumberField label="전용면적" value={input.areaM2} onChange={(v) => edit({ areaM2: Math.max(0, v) })} suffix="㎡" />
            <ChoiceChips<"yes" | "no"> legend="맞벌이인가요?" value={input.dualIncome ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ dualIncome: v === "yes" })} />
            {input.dualIncome && <MoneyField label="둘 중 큰 소득" value={input.higherEarner ?? input.income} onChange={(v) => edit({ higherEarner: v })} hint="신생아 특례: 각자 1.3억 이하" />}
            {input.purpose === "buy" && <ChoiceChips<"yes" | "no"> legend="청년 주택드림 통장(1년·1천만 원)으로 분양 당첨됐나요?" value={input.dreamAccount ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ dreamAccount: v === "yes" })} />}
            {input.purpose === "jeonse" && <ChoiceChips<"yes" | "no"> legend="혼자 사는 세대주인가요?" value={input.singleHousehold ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ singleHousehold: v === "yes" })} />}
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={best ? `${best.name}이 한도가 가장 커요. 최대 약 ${roughWon(best.maxLoan)}, ${pct(best.rate)}(추정).` : "지금 조건으로 받을 수 있는 기금 대출이 없어요. 빨간 표시를 확인해요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "받을 수 있는 상품", value: `${r.eligibleCount}개` },
            { label: "가장 큰 한도", value: money(r.bestLoan) },
            { label: "금리 범위", value: best ? pct(best.rate) : "-" },
          ]}
        >
          <CompareBars title="상품별 최대 한도" items={r.options.map((o) => ({ label: o.name, value: o.maxLoan, current: o.id === r.best }))} format={money} />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={LOAN_ASSUMPTIONS(input)}
          evaluate={loanBest}
          sliders={["amount"]}
          sweeps={["income", "amount"]}
          yLabel="가장 큰 대출 한도"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "income" ? "소득 기준을 넘는 순간 그 상품이 빠져 한도가 계단처럼 떨어져요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 신청해요"
            items={[
              "기금e든든(nhuf.molit.go.kr)에서 자격을 확인하고 온라인 신청한 뒤 수탁은행(우리·국민·신한·하나·농협 등)에서 심사받아요.",
              "전세는 잔금 1개월 전까지, 집 사기는 소유권 이전 3개월 안에 신청해요.",
              "부동산 전자계약을 하면 버팀목 금리를 0.1%p 더 깎아 줘요.",
            ]}
            note="기금e든든 2026년 상품 안내를 바탕으로 한 추정이에요. 금리는 소득·보증금 구간과 우대 조건으로 정해지고, 최종 한도는 은행 심사로 정해져요."
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
