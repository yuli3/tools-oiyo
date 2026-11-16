// 청약 특별공급 자격 점검 (2026-11-16, Gemini 이전 C 2차). 계산: lib/kr-welfare-2026.ts specialSupplyCheck.
import { TIER_LABEL, WELFARE_AS_OF, specialSupplyCheck, type SpecialSupplyInput } from "../../../lib/kr-welfare-2026";
import { SUPPLY_ASSUMPTIONS, supplyScore } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "special-supply-eligibility-checker";
const EXAMPLE: SpecialSupplyInput = { sector: "private", householdSize: 3, monthlyIncome: 9_000_000, dualIncome: true, realEstate: 0, car: 20_000_000, noHome: true, neverOwned: true, marriedYears: 2, childUnder2: true, minorChildren: 1, taxPaid5y: true, elderParent3y: false };
const TONE = { priority: "text-primary", general: "text-foreground", lottery: "text-muted-foreground", none: "text-destructive" } as const;

export default function SpecialSupply() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<SpecialSupplyInput>("welfare-special-supply", EXAMPLE);
  const easy = mode === "easy";
  const edit = (p: Partial<SpecialSupplyInput>) => setInput({ ...input, ...p });
  const r = specialSupplyCheck(input);
  const best = r.results.find((o) => o.type === r.best);
  const married = input.marriedYears !== undefined && input.marriedYears >= 0;
  const reasons = [
    `${input.householdSize}인 가구 도시근로자 월평균소득(100%)은 ${roughWon(r.base)}이고, 우리 집 소득은 그 ${Math.round(r.ratio * 100)}%예요.`,
    input.sector === "private" ? "민영주택은 신혼·신생아·생애최초 소득을 넘어도 부동산이 3억 3,100만 원 이하면 추첨 물량에 넣을 수 있어요. 다자녀·노부모는 소득을 보지 않아요." : "공공분양(일반형)은 부동산 2억 1,550만 원·자동차 4,542만 원 이하여야 해요.",
    "특별공급은 평생 한 번만 당첨될 수 있고, 청약통장 가입 6개월(지역별 1순위 요건)과 예치금이 필요해요.",
  ];

  const memo = () =>
    [
      `[청약 특별공급 자격] 기준일 ${WELFARE_AS_OF}, ${input.sector === "private" ? "민영" : "공공(일반형)"}, ${input.householdSize}인, 월 ${exactWon(input.monthlyIncome)}(${Math.round(r.ratio * 100)}%)${input.dualIncome ? ", 맞벌이" : ""}`,
      ...r.results.map((o) => `- ${o.label}: ${o.tier === "none" ? "불가" : o.line || o.tier === "lottery" ? TIER_LABEL[o.tier] : "자격 있음"} (${o.reason})`),
      "근거: 주택공급에 관한 규칙 제40~47조의3, LH 전년도 도시근로자 월평균소득표. 실제 기준은 입주자모집공고문이 우선이에요.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceChips<SpecialSupplyInput["sector"]> legend="어떤 아파트에 넣나요?" value={input.sector} options={[{ value: "private", label: "민간 분양(민영)" }, { value: "public", label: "공공분양(LH 등)" }]} onChange={(v) => edit({ sector: v })} />
          <NumberField label="세대원 수" value={input.householdSize} onChange={(v) => edit({ householdSize: Math.max(1, Math.round(v)) })} suffix="명" />
          <MoneyField label={easy ? "우리 집 한 달 소득(세전, 부부 합산)" : "세대 월평균 소득"} value={input.monthlyIncome} onChange={(v) => edit({ monthlyIncome: v })} />
          <ChoiceChips<"yes" | "no"> legend="맞벌이인가요?" value={input.dualIncome ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ dualIncome: v === "yes" })} />
          <ChoiceChips<"yes" | "no"> legend="세대원 모두 집이 없나요?" value={input.noHome ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ noHome: v === "yes" })} />
          <ChoiceChips<"yes" | "no"> legend="결혼한 지 7년 안인가요?" value={married && (input.marriedYears ?? 99) <= 7 ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ marriedYears: v === "yes" ? 2 : undefined })} />
          <ChoiceChips<"yes" | "no"> legend="2세 미만 아이(임신 포함)가 있나요?" value={input.childUnder2 ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ childUnder2: v === "yes" })} />
          <NumberField label="미성년 자녀 수(태아 포함)" value={input.minorChildren} onChange={(v) => edit({ minorChildren: Math.max(0, Math.round(v)) })} suffix="명" />
        </div>
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceChips<"yes" | "no"> legend="세대원 모두 집을 가진 적이 없나요?" value={input.neverOwned ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ neverOwned: v === "yes" })} />
            <ChoiceChips<"yes" | "no"> legend="소득세를 5년 이상 냈나요?" value={input.taxPaid5y ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ taxPaid5y: v === "yes" })} />
            <ChoiceChips<"yes" | "no"> legend="65세 이상 부모를 3년 이상 부양한 세대주인가요?" value={input.elderParent3y ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ elderParent3y: v === "yes" })} />
            <MoneyField label="세대 부동산 가액(토지·건물)" value={input.realEstate} onChange={(v) => edit({ realEstate: v })} />
            {input.sector === "public" && <MoneyField label="자동차 가액" value={input.car ?? 0} onChange={(v) => edit({ car: v })} hint="4,542만 원 이하" />}
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={best ? `${best.label} 특별공급 ${best.line || best.tier === "lottery" ? TIER_LABEL[best.tier] : ""}에 넣을 수 있어요. 자격 있는 유형 ${r.eligibleCount}개(추정).`.replace("  ", " ") : "지금 조건으로 넣을 수 있는 특별공급이 없어요. 일반공급을 확인해요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "소득 비율", value: `${Math.round(r.ratio * 100)}%` },
            { label: "100% 기준(월)", value: easy ? roughWon(r.base) : exactWon(r.base) },
            { label: "자격 있는 유형", value: `${r.eligibleCount}개` },
          ]}
        >
          <ul className="space-y-2 text-sm">
            {r.results.map((o) => (
              <li key={o.type} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-border pb-2 last:border-0">
                <span className="font-semibold text-foreground">{o.label}</span>
                <span className={TONE[o.tier]}>
                  {o.tier === "none" ? "✗ " : "✓ "}
                  {o.reason}
                </span>
              </li>
            ))}
          </ul>
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={SUPPLY_ASSUMPTIONS(input)}
          evaluate={supplyScore}
          sliders={["monthlyIncome"]}
          sweeps={["monthlyIncome", "realEstate"]}
          yLabel="가장 유리한 단계(3 우선 · 2 일반 · 1 추첨 · 0 불가)"
          formatY={(v) => ["불가", "추첨", "일반", "우선"][Math.max(0, Math.min(3, Math.round(v)))]}
          noTornado
          caption={(k) => (k === "monthlyIncome" ? "소득이 100%·140%(맞벌이 120%·160%)를 넘을 때마다 한 단계씩 내려가요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 준비해요"
            items={[
              "청약홈(applyhome.co.kr)에서 입주자모집공고문의 소득·자산표를 꼭 다시 확인해요. 공고마다 조금씩 달라요.",
              "소득은 세대원 모두의 전년도 건강보험·근로소득 자료로 봐요. 맞벌이면 기준이 올라가요.",
              "민영 생애최초 1인 가구는 추첨 물량과 전용 60㎡ 이하만 넣을 수 있어요.",
            ]}
            note="공고 기준 안내이며 당첨을 보장하지 않아요. 지역 거주·통장 순위·당첨 이력 제한은 따로 확인해요."
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
