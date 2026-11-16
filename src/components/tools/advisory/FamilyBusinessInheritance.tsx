// 가업상속공제 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-advisory-2026.ts, 가정·문장: lib/kr-advisory-scenarios.ts.
import { useMemo, useRef } from "react";
import { familyBusinessInheritance, type BusinessSize, type FamilyBusinessInput } from "../../../lib/kr-advisory-2026";
import { FAMILY_ASSUMPTIONS, familyBridge, familyPlain, familyTax } from "../../../lib/kr-advisory-scenarios";
import { tornado } from "../../../lib/scenario";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import AssumptionPanel from "../viz/AssumptionPanel";
import BridgeChart from "../viz/BridgeChart";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import PlainSummary, { AskAdviser, ReasonList } from "../viz/PlainSummary";
import QuestionStepper, { type Question } from "../viz/QuestionStepper";
import SweepPanel from "../viz/SweepPanel";
import Term from "../viz/Term";
import TornadoChart from "../viz/TornadoChart";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { useScenario } from "../viz/useScenario";

const TOOL_ID = "family-business-inheritance-calculator";
const EXAMPLE: FamilyBusinessInput = {
  businessValue: 10_000_000_000, unrelatedAssetRatio: 0.1, years: 15, size: "sme", otherEstate: 2_000_000_000,
  netFinancial: 300_000_000, debts: 0, funeralSpent: 10_000_000, hasSpouse: true, spouseInherited: 500_000_000,
};
const KEYS = ["businessValue", "unrelatedAssetRatio", "years", "size", "otherEstate", "netFinancial", "debts", "funeralSpent", "spouse", "spouseInherited"] as const;
type Key = (typeof KEYS)[number];
const pick = (...keys: string[]) => FAMILY_ASSUMPTIONS.filter((a) => keys.includes(a.key));

const SIZE = [
  { value: "sme", label: "중소기업" },
  { value: "midsize", label: "중견기업(매출 5천억 미만)" },
  { value: "ineligible", label: "그 밖의 기업" },
] as const satisfies readonly { value: BusinessSize; label: string }[];
type YesNo = "no" | "yes";
const YES_NO = [
  { value: "yes", label: "있음" },
  { value: "no", label: "없음" },
] as const satisfies readonly { value: YesNo; label: string }[];
const UNRELATED = [
  { value: "0", label: "거의 없음" },
  { value: "0.1", label: "10% 정도" },
  { value: "0.3", label: "30% 정도" },
  { value: "0.5", label: "절반 이상" },
] as const;
const ASK_ADVISER = [
  "고인이 회사 최대주주(가족 합산 지분 40% 이상, 상장사 20%)로 10년 이상 있었고, 대표이사였던 기간 요건을 채우는지 확인해 주세요.",
  "회사를 잇는 자녀가 18세 이상이고 2년 이상 회사 일을 했는지, 신고기한까지 임원이 되고 2년 안에 대표이사가 될 수 있는지 확인해 주세요.",
  "공제를 받으면 5년 동안 가업·지분·고용을 유지해야 해요. 지키지 못하면 줄어든 세금을 다시 내요.",
];

export default function FamilyBusinessInheritance() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const s = useScenario<FamilyBusinessInput, Key>(TOOL_ID, EXAMPLE, FAMILY_ASSUMPTIONS, KEYS);
  const { input, edit } = s;
  const resultRef = useRef<HTMLDivElement>(null);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;

  const r = familyBusinessInheritance(input);
  const bars = useMemo(() => tornado(input, FAMILY_ASSUMPTIONS, familyTax), [input]);
  const plain = familyPlain(input, r, bars[0]);
  const unrelatedPct = Math.round(input.unrelatedAssetRatio * 1000) / 10;

  const questions: Question<Key>[] = [
    {
      title: "회사 주식 값은 얼마인가요?",
      keys: ["businessValue", "unrelatedAssetRatio"],
      body: (
        <>
          <p className="text-sm leading-6 text-muted-foreground">
            상속받을 회사 주식의 세법상 값이에요. 모르면 <a className="underline" href="/ko/unlisted-share-valuation-calculator/">비상장주식 평가</a>로 먼저 구해 보세요. 개인사업이면 사업용 재산 값을 넣어요.
          </p>
          <div className="mt-3">
            <MoneyField label="회사 주식 값" value={input.businessValue} onChange={(v) => edit({ businessValue: v }, ["businessValue"])} />
          </div>
          <div className="mt-4">
            <ChoiceChips
              legend="회사 재산 중 사업과 관계없는 재산은 어느 정도인가요?"
              value={String(input.unrelatedAssetRatio)}
              options={UNRELATED}
              onChange={(v) => edit({ unrelatedAssetRatio: Number(v) }, ["unrelatedAssetRatio"])}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              놀리는 땅, 임대 부동산, 쌓아 둔 예금 같은 <Term k="사업무관자산">사업무관자산</Term>이에요.
            </p>
          </div>
        </>
      ),
    },
    {
      title: "고인은 이 회사를 몇 년 경영했나요?",
      keys: ["years", "size"],
      body: (
        <div className="grid gap-4">
          <NumberField label="경영한 기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} />
          <p className="text-xs text-muted-foreground">10년 이상이면 300억, 20년 이상 400억, 30년 이상 600억 원까지 빼 줘요.</p>
          <ChoiceChips<BusinessSize> legend="회사 규모는요?" value={input.size} options={SIZE} onChange={(v) => edit({ size: v }, ["size"])} />
        </div>
      ),
    },
    {
      title: "회사 말고 다른 재산과 빚은 얼마인가요?",
      keys: ["otherEstate", "netFinancial", "debts"],
      body: (
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyField label="회사 말고 다른 재산(집·땅·예금 등)" value={input.otherEstate} onChange={(v) => edit({ otherEstate: v }, ["otherEstate"])} />
          <MoneyField label="그중 예금·주식 같은 금융재산(빚 뺀 금액)" value={input.netFinancial} onChange={(v) => edit({ netFinancial: v }, ["netFinancial"])} />
          <MoneyField label="고인이 남긴 빚" value={input.debts} onChange={(v) => edit({ debts: v }, ["debts"])} />
        </div>
      ),
    },
    {
      title: "배우자가 있나요?",
      keys: ["spouse", "spouseInherited"],
      body: (
        <div className="grid gap-4">
          <ChoiceChips<YesNo> legend="고인의 배우자" value={input.hasSpouse ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ hasSpouse: v === "yes" }, ["spouse"])} />
          {input.hasSpouse && (
            <MoneyField label="배우자가 실제로 받는 재산" value={input.spouseInherited} onChange={(v) => edit({ spouseInherited: v }, ["spouseInherited"])} hint="많이 받을수록 배우자공제가 커져요(최대 30억)" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      {easy ? (
        <QuestionStepper questions={questions} onUnknown={s.keepAsGuess} resultRef={resultRef} />
      ) : (
        <section aria-label="입력" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="가업 주식(개인가업은 사업용 자산) 평가액" value={input.businessValue} onChange={(v) => edit({ businessValue: v }, ["businessValue"])} />
            <NumberField label="법인 총자산 중 사업무관자산 비율" value={unrelatedPct} onChange={(v) => edit({ unrelatedAssetRatio: v / 100 }, ["unrelatedAssetRatio"])} suffix="%" step={1} />
            <NumberField label="피상속인 가업 경영 기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} />
            <MoneyField label="가업 외 상속재산" value={input.otherEstate} onChange={(v) => edit({ otherEstate: v }, ["otherEstate"])} />
            <MoneyField label="그중 순금융재산" value={input.netFinancial} onChange={(v) => edit({ netFinancial: v }, ["netFinancial"])} />
            <MoneyField label="채무" value={input.debts} onChange={(v) => edit({ debts: v }, ["debts"])} />
            <MoneyField label="장례비용" value={input.funeralSpent} onChange={(v) => edit({ funeralSpent: v }, ["funeralSpent"])} />
            {input.hasSpouse && <MoneyField label="배우자가 실제 상속받는 금액" value={input.spouseInherited} onChange={(v) => edit({ spouseInherited: v }, ["spouseInherited"])} />}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceChips<BusinessSize> legend="기업 규모" value={input.size} options={SIZE} onChange={(v) => edit({ size: v }, ["size"])} />
            <ChoiceChips<YesNo> legend="배우자" value={input.hasSpouse ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ hasSpouse: v === "yes" }, ["spouse"])} />
          </div>
        </section>
      )}

      <div ref={resultRef} className="scroll-mt-4 space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <PlainSummary headline={plain.headline} driver={plain.driver} hasExample={s.hasExample} hasGuess={s.hasGuess} />
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">공제 없을 때 상속세</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{money(r.without.tax)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{easy ? <Term k="가업상속공제">가업상속공제</Term> : "가업상속공제"} 후 상속세</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{money(r.with.tax)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">줄어드는 세금</dt>
            <dd className="font-mono text-xl font-bold text-primary">{money(r.saving)}</dd>
          </div>
        </dl>
        {easy && <ReasonList reasons={plain.reasons} />}
        {!easy && r.reasons.length > 0 && <ReasonList reasons={r.reasons} />}

        <AssumptionPanel assumptions={pick("businessValue", "otherEstate", "spouseInherited", "years")} input={input} anchors={s.anchors} tags={s.tags} mode={mode} onSlide={s.slide} />
        <SweepPanel
          options={pick("years", "businessValue", "unrelatedAssetRatio", "spouseInherited")}
          input={input}
          anchors={s.anchors}
          evaluate={familyTax}
          mode={mode}
          resultName="상속세"
          formatY={roughWon}
          onSlide={s.slide}
          caption={(a) => (a.key === "years" ? "경영 기간이 10·20·30년을 넘을 때마다 공제 한도가 계단처럼 올라가요. 경영 기간은 바꿀 수 없는 사실이라 미리 확인하는 용도예요." : undefined)}
        />
        <CompareBars
          title="가업상속공제 전후 상속세"
          caption="공제 요건은 상속 전에 갖춰야 해서, 미리 확인할수록 좋아요."
          items={[
            { label: "공제 없이", value: r.without.tax },
            { label: "가업상속공제 받으면", value: r.with.tax, current: true },
          ]}
          format={money}
        />
        <BridgeChart title="상속세를 매기는 금액은 이렇게 줄어요" caption={easy ? "재산에서 빚과 공제를 차례로 빼고 남은 금액에 세율을 곱해요." : "제24조 공제 적용 한도 안에서 차례로 빼요."} steps={familyBridge(r)} format={money} />
        <TornadoChart bars={bars} mode={mode} format={roughWon} />

        {easy ? (
          <AskAdviser items={ASK_ADVISER} />
        ) : (
          <ResultSteps
            steps={[
              `가업상속재산 = ${exactWon(input.businessValue)} × (1 − 사업무관자산 ${unrelatedPct}%) = ${exactWon(r.qualifying)}`,
              `한도: 경영 ${Math.floor(input.years)}년 → ${r.limit ? roughWon(r.limit) : "대상 아님(10년 미만)"} → 공제 ${exactWon(r.deduction)}`,
              `과세가액 ${exactWon(r.with.taxableEstate)} = 총 상속재산 ${exactWon(r.gross)} − 채무 − 장례비용 ${exactWon(r.funeral)}`,
              `공제 합계 ${exactWon(r.with.deductions)} = 일괄 5억 + 배우자 ${exactWon(r.with.spouse)} + 금융재산 ${exactWon(r.with.financial)} + 가업상속 ${exactWon(r.deduction)} (과세가액 한도)`,
              `과세표준 ${exactWon(r.with.base)} → 산출세액 ${exactWon(r.with.calculated)} − 신고세액공제 3% ${exactWon(r.with.credit)}`,
              "사전증여 합산, 감정평가수수료, 동거주택·영농상속공제, 연부연납·납부유예, 사후관리 위반 추징은 넣지 않았어요.",
            ]}
            next={[
              { href: "/ko/unlisted-share-valuation-calculator/", label: "비상장주식 평가" },
              { href: "/ko/inheritance-tax-calculator/", label: "일반 상속세 계산" },
            ]}
          />
        )}
      </div>
    </div>
  );
}
