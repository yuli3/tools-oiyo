// 개인사업자 법인전환 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-advisory-2026.ts, 가정·문장: lib/kr-advisory-scenarios.ts.
import { useMemo, useRef } from "react";
import { ACQUISITION_RELIEF_UNTIL, incorporationConversion, type ConversionBusiness, type ConversionInput } from "../../../lib/kr-advisory-2026";
import { CONVERSION_ASSUMPTIONS, conversionBridge, conversionCgt, conversionPlain } from "../../../lib/kr-advisory-scenarios";
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
import { pct } from "./fmt";

const TOOL_ID = "incorporation-conversion-calculator";
const EXAMPLE: ConversionInput = {
  business: "general", realEstateMarket: 1_000_000_000, realEstateCost: 400_000_000, holdYears: 10, otherAssets: 300_000_000, liabilities: 500_000_000, acquisitionBase: 0,
};
const KEYS = ["business", "realEstateMarket", "realEstateCost", "holdYears", "otherAssets", "liabilities", "acquisitionBase"] as const;
type Key = (typeof KEYS)[number];
const pick = (...keys: string[]) => CONVERSION_ASSUMPTIONS.filter((a) => keys.includes(a.key));

const BUSINESS = [
  { value: "general", label: "일반 업종(제조·도소매·서비스 등)" },
  { value: "realEstateRental", label: "부동산임대·공급업" },
  { value: "consumptionService", label: "소비성서비스업(숙박·주점 등)" },
] as const satisfies readonly { value: ConversionBusiness; label: string }[];
const ASK_ADVISER = [
  "새 법인의 자본금을 순자산가액 이상으로 맞춰야 양도세를 미룰 수 있어요. 땅·건물은 감정가액으로 평가하는 경우가 많아요.",
  "법인으로 바꾼 뒤 5년 안에 사업을 그만두거나 받은 주식의 절반 이상을 팔면, 미룬 양도세를 개인이 내고 감면받은 취득세도 다시 낼 수 있어요.",
  `취득세 감면은 ${ACQUISITION_RELIEF_UNTIL}까지 취득분이에요. 주택은 양도세를 미룰 수 없으니 따로 확인해 주세요.`,
];

export default function IncorporationConversion() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const s = useScenario<ConversionInput, Key>(TOOL_ID, EXAMPLE, CONVERSION_ASSUMPTIONS, KEYS);
  const { input, edit } = s;
  const resultRef = useRef<HTMLDivElement>(null);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;

  const r = incorporationConversion(input);
  const bars = useMemo(() => tornado(input, CONVERSION_ASSUMPTIONS, conversionCgt), [input]);
  const plain = conversionPlain(input, r, bars[0]);
  const businessChips = <ChoiceChips<ConversionBusiness> legend="어떤 업종인가요?" value={input.business} options={BUSINESS} onChange={(v) => edit({ business: v }, ["business"])} />;

  const questions: Question<Key>[] = [
    { title: "어떤 사업을 하고 있나요?", keys: ["business"], body: businessChips },
    {
      title: "사업에 쓰는 땅·건물은 얼마인가요?",
      keys: ["realEstateMarket", "realEstateCost"],
      body: (
        <>
          <p className="text-sm leading-6 text-muted-foreground">법인에 넘길 사업용 땅·건물이에요. 집(주택)은 빼고 넣어요. 없으면 0이에요.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MoneyField label="지금 시세" value={input.realEstateMarket} onChange={(v) => edit({ realEstateMarket: v }, ["realEstateMarket"])} />
            <MoneyField label="산 가격 + 들인 비용(취득세·수리비 등)" value={input.realEstateCost} onChange={(v) => edit({ realEstateCost: v }, ["realEstateCost"])} />
          </div>
        </>
      ),
    },
    {
      title: "그 땅·건물을 몇 년 가지고 있었나요?",
      keys: ["holdYears"],
      body: (
        <>
          <NumberField label="가진 기간" value={input.holdYears} onChange={(v) => edit({ holdYears: v }, ["holdYears"])} suffix="년" step={1} />
          <p className="mt-2 text-xs text-muted-foreground">
            3년이 넘으면 오른 값의 일부를 빼 줘요(<Term k="장기보유특별공제">장기보유특별공제</Term>).
          </p>
        </>
      ),
    },
    {
      title: "땅·건물 말고 사업 재산과 사업 빚은요?",
      keys: ["otherAssets", "liabilities"],
      body: (
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="재고·기계·받을 돈·현금 등" value={input.otherAssets} onChange={(v) => edit({ otherAssets: v }, ["otherAssets"])} />
          <MoneyField label="사업 빚(대출·줄 돈 등)" value={input.liabilities} onChange={(v) => edit({ liabilities: v }, ["liabilities"])} />
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
          {businessChips}
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="사업용 부동산 시가(주택 제외)" value={input.realEstateMarket} onChange={(v) => edit({ realEstateMarket: v }, ["realEstateMarket"])} />
            <MoneyField label="그 부동산 취득가액 + 필요경비" value={input.realEstateCost} onChange={(v) => edit({ realEstateCost: v }, ["realEstateCost"])} />
            <NumberField label="부동산 보유 기간" value={input.holdYears} onChange={(v) => edit({ holdYears: v }, ["holdYears"])} suffix="년" step={1} />
            <MoneyField label="부동산 외 사업용 자산 시가" value={input.otherAssets} onChange={(v) => edit({ otherAssets: v }, ["otherAssets"])} />
            <MoneyField label="사업 관련 부채" value={input.liabilities} onChange={(v) => edit({ liabilities: v }, ["liabilities"])} />
            <MoneyField label="취득세 과세표준(0이면 시가)" value={input.acquisitionBase ?? 0} onChange={(v) => edit({ acquisitionBase: v }, ["acquisitionBase"])} />
          </div>
        </section>
      )}

      <div ref={resultRef} className="scroll-mt-4 space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <PlainSummary headline={plain.headline} driver={plain.driver} hasExample={s.hasExample} hasGuess={s.hasGuess} />
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">새 법인 최소 자본금</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{money(r.minCapital)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{easy ? <Term k="이월과세">미루는 양도세(이월과세)</Term> : "이월과세로 미루는 양도세"}</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{money(r.deferred)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{easy ? <Term k="취득세감면">취득세 감면</Term> : "취득세 감면"}(농특세 차감 후)</dt>
            <dd className="font-mono text-xl font-bold text-primary">{money(r.relief - r.ruralOnRelief)}</dd>
          </div>
        </dl>
        <ReasonList reasons={plain.reasons} />
        {!r.rolloverEligible && <p className="text-sm font-semibold text-foreground">소비성서비스업은 양도세 이월과세와 취득세 감면을 받을 수 없어요.</p>}

        <AssumptionPanel assumptions={pick("realEstateMarket", "realEstateCost", "holdYears", "liabilities")} input={input} anchors={s.anchors} tags={s.tags} mode={mode} onSlide={s.slide} />
        <SweepPanel
          options={pick("holdYears", "realEstateMarket", "realEstateCost")}
          input={input}
          anchors={s.anchors}
          evaluate={conversionCgt}
          mode={mode}
          resultName="양도세(지방세 포함)"
          formatY={roughWon}
          onSlide={s.slide}
        />
        <CompareBars
          title="지금 내야 할 양도세"
          caption={r.rolloverEligible ? "이월과세를 받으면 개인은 지금 내지 않고, 나중에 법인이 그 땅·건물을 팔 때 법인세로 내요." : "이 업종은 이월과세가 없어요."}
          items={[
            { label: "이월과세 없이", value: r.cgtTotal, current: !r.rolloverEligible },
            { label: "이월과세 받으면", value: r.cgtTotal - r.deferred, current: r.rolloverEligible },
          ]}
          format={money}
        />
        <CompareBars
          title="법인이 내는 취득세"
          caption={r.reliefEligible ? `일반 업종은 ${ACQUISITION_RELIEF_UNTIL} 취득분까지 절반을 감면받고, 감면액의 20%를 농특세로 내요.` : "부동산임대·공급업과 소비성서비스업은 감면이 없어요."}
          items={[
            { label: "감면 없이", value: r.acquisitionTax, current: !r.reliefEligible },
            { label: "감면 받으면", value: r.acquisitionNet, current: r.reliefEligible },
          ]}
          format={money}
        />
        <BridgeChart title="새 법인 자본금은 이만큼 있어야 해요" caption="넘기는 사업 재산에서 사업 빚을 뺀 금액(순자산가액) 이상이어야 양도세를 미룰 수 있어요." steps={conversionBridge(input, r)} format={money} />
        <TornadoChart bars={bars} mode={mode} format={roughWon} />

        {easy ? (
          <AskAdviser items={ASK_ADVISER} />
        ) : (
          <ResultSteps
            steps={[
              `순자산가액 = 부동산 ${exactWon(input.realEstateMarket)} + 기타 자산 ${exactWon(input.otherAssets)} − 부채 ${exactWon(input.liabilities)} = ${exactWon(r.netAssets)} → 자본금이 이 금액 이상이어야 해요(영업권 제외).`,
              `양도차익 ${exactWon(r.gain)} − 장기보유특별공제 ${pct(r.longTermRate, 0)} ${exactWon(r.longTerm)} − 기본공제 250만 = 과세표준 ${exactWon(r.base)}`,
              `양도소득세 ${exactWon(r.cgt)} + 지방소득세 ${exactWon(r.cgtLocal)} = ${exactWon(r.cgtTotal)}${r.rolloverEligible ? " → 개인이 내지 않고 법인이 나중에 그 부동산을 팔 때 법인세로 내요." : ""}`,
              `취득세 본세 ${exactWon(r.acqBase)} × 4% = ${exactWon(r.acquisitionTax)}${r.reliefEligible ? ` → 50% 감면 ${exactWon(r.relief)}, 감면분 농특세 20% ${exactWon(r.ruralOnRelief)}` : ""}`,
              `감면은 ${ACQUISITION_RELIEF_UNTIL} 취득분까지예요. 지방교육세·농특세(10%)·과밀억제권역 중과·국민주택채권·등기비용은 넣지 않았어요.`,
              "5년 안에 사업을 폐지하거나 받은 주식의 50% 이상을 처분하면 미룬 양도세를 개인이 내야 하고, 취득세도 추징될 수 있어요.",
            ]}
            next={[
              { href: "/ko/incorporation-calculator/", label: "개인 vs 법인 연간 세금" },
              { href: "/ko/capital-gains-tax-calculator/", label: "양도소득세 계산" },
            ]}
          />
        )}
      </div>
    </div>
  );
}
