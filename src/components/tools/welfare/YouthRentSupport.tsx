// 청년월세 지원 자격·금액 (2026-11-16, Gemini 이전 C 1차). 계산: lib/kr-welfare-2026.ts youthRentSupport.
import { WELFARE_AS_OF, YOUTH_RENT_2026, youthRentSupport, type YouthRentInput } from "../../../lib/kr-welfare-2026";
import { YOUTH_RENT_ASSUMPTIONS, youthRentTotal } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "youth-monthly-rent-support-checker";
const EXAMPLE: YouthRentInput = { age: 27, livesApart: true, ownsHome: false, youthIncome: 1_400_000, youthHousehold: 1, youthAssets: 30_000_000, parentIncome: 5_000_000, parentHousehold: 3, parentAssets: 300_000_000, parentExempt: false, deposit: 10_000_000, rent: 550_000, housingBenefit: 0, excluded: false };

export default function YouthRentSupport() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<YouthRentInput>("welfare-youth-rent", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<YouthRentInput>) => setInput({ ...input, ...p });
  const r = youthRentSupport(input);
  const reasons = r.checks.map((c) => `${c.ok ? "✓" : "✗"} ${c.label}`);
  reasons.push("2026년부터 계속 사업이 됐지만 예산 범위에서 뽑아요. 신규 신청은 공고 기간(2026년은 3월 30일~5월 29일)에만 받아요.");

  const memo = () =>
    [
      `[청년월세 지원 점검] 기준일 ${WELFARE_AS_OF}`,
      ...r.checks.map((c) => `- ${c.ok ? "충족" : "부족"}: ${c.label}`),
      `결과: ${r.eligible ? `월 ${exactWon(r.monthly)} × ${YOUTH_RENT_2026.months}개월 = ${exactWon(r.total)}` : "대상 아님"}`,
      "근거: 국토교통부 청년월세 지원(2026 계속사업), 복지로·정부24 청년월세 특별지원.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="만 나이" value={input.age} onChange={(v) => edit({ age: Math.max(0, Math.round(v)) })} suffix="세" />
          <ChoiceChips<"yes" | "no"> legend="부모님과 따로 살고 집이 없나요?" value={input.livesApart && !input.ownsHome ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ livesApart: v === "yes", ownsHome: v !== "yes" })} />
          <MoneyField label={easy ? "보증금" : "임차보증금"} value={input.deposit} onChange={(v) => edit({ deposit: v })} />
          <MoneyField label={easy ? "한 달 월세" : "월 임대료(관리비 제외)"} value={input.rent} onChange={(v) => edit({ rent: v })} />
          <MoneyField label={easy ? "내 한 달 소득(세전)" : "청년가구 월 소득인정액"} value={input.youthIncome} onChange={(v) => edit({ youthIncome: v })} hint="1인 가구 약 153만 원 이하" />
          <MoneyField label={easy ? "내 재산(예금·차·보증금 등)" : "청년가구 재산"} value={input.youthAssets} onChange={(v) => edit({ youthAssets: v })} hint="1억 2,200만 원 이하" />
          <MoneyField label={easy ? "부모님 한 달 소득 합계" : "원가구 월 소득"} value={input.parentIncome} onChange={(v) => edit({ parentIncome: v })} />
          <MoneyField label={easy ? "부모님 재산" : "원가구 재산"} value={input.parentAssets} onChange={(v) => edit({ parentAssets: v })} hint="4억 7천만 원 이하" />
        </div>
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="청년가구 인원" value={input.youthHousehold ?? 1} onChange={(v) => edit({ youthHousehold: Math.max(1, Math.round(v)) })} suffix="명" />
            <NumberField label="원가구 인원(부모·형제 포함)" value={input.parentHousehold ?? 3} onChange={(v) => edit({ parentHousehold: Math.max(1, Math.round(v)) })} suffix="명" />
            <ChoiceChips<"yes" | "no"> legend="원가구 심사 면제(혼인·미혼부모 등)인가요?" value={input.parentExempt ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ parentExempt: v === "yes" })} />
            <MoneyField label="주거급여 임차급여(월)" value={input.housingBenefit ?? 0} onChange={(v) => edit({ housingBenefit: v })} />
            <ChoiceChips<"yes" | "no"> legend="공공임대·2촌 이내 임대·지자체 월세 지원 중인가요?" value={input.excluded ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ excluded: v === "yes" })} />
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.eligible ? `월 ${roughWon(r.monthly)}씩 최대 24개월, 모두 ${roughWon(r.total)}을 받을 수 있어요(추정).` : `지금 조건으로는 대상이 아니에요. 막힌 기준: ${r.checks.filter((c) => !c.ok).map((c) => c.label).join(", ")}.`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "월 지원액", value: money(r.monthly) },
            { label: "24개월 합계", value: money(r.total) },
            { label: "월세+보증금 환산", value: money(r.converted) },
          ]}
        >
          <CompareBars
            title="내 월세와 지원액"
            items={[
              { label: "내 월세", value: input.rent },
              { label: "지원액(월)", value: r.monthly, current: true },
              { label: "내가 낼 몫", value: Math.max(0, input.rent - r.monthly) },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={YOUTH_RENT_ASSUMPTIONS}
          evaluate={youthRentTotal}
          sliders={["rent"]}
          sweeps={["rent", "youthIncome"]}
          yLabel="24개월 지원 합계"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "rent" ? "월세 20만 원까지는 낸 만큼, 그 위로는 20만 원이에요. 60만 원을 넘으면 보증금 환산까지 70만 원 안이어야 해요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 신청해요"
            items={[
              "복지로(온라인) 또는 주민등록 주소지 행정복지센터에서 신청해요.",
              "임대차계약서, 월세 이체 내역, 가족관계증명서를 준비해요.",
              "서울·인천 등 지자체 월세 지원과는 동시에 받을 수 없으니 금액을 비교해 골라요.",
            ]}
            note="공고 기준 안내이며 최종 선정은 지자체가 해요. 소득·재산은 사회보장정보시스템 조사 결과로 판단해요."
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
