// 스트레스 DSR 주담대 한도 (2026-11-16 쉬운 설명·가정 변화 적용). 계산은 lib/finance/stress-dsr.ts 그대로예요.
import type { RateType } from "../../lib/finance/stress-dsr";
import { STRESS_DSR_AS_OF } from "../../lib/finance/stress-dsr";
import { DSR_ASSUMPTIONS, dsrLimits, dsrMaxLoan, dsrPlain, dsrResult, type DsrArea, type DsrLite } from "../../lib/kr-home-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["income", "housePrice", "existing", "rate", "years", "area", "rateType", "fixedYears"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: DsrLite = { income: 60_000_000, housePrice: 800_000_000, existing: 5_000_000, rate: 0.04, years: 30, area: "metro", rateType: "variable", fixedYears: 0 };
const AREA = [
  { value: "metro", label: "수도권(비규제)" },
  { value: "regulated", label: "규제지역" },
  { value: "other", label: "지방" },
] as const satisfies readonly { value: DsrArea; label: string }[];
const RATE_TYPE = [
  { value: "variable", label: "변동금리" },
  { value: "mixed", label: "혼합형(고정 후 변동)" },
  { value: "periodic", label: "주기형" },
] as const satisfies readonly { value: RateType; label: string }[];

export default function KrDsrScenario() {
  return (
    <ScenarioTool<DsrLite, Key>
      toolId="dsr-calculator"
      example={EXAMPLE}
      assumptions={DSR_ASSUMPTIONS}
      keys={KEYS}
      evaluate={dsrMaxLoan}
      resultName="대출 한도"
      questions={({ input, edit }) => [
        { title: "1년 소득은 얼마인가요?", keys: ["income"], body: <MoneyField label="연 소득(세전, 부부 합산 가능)" value={input.income} onChange={(v) => edit({ income: v }, ["income"])} /> },
        { title: "어떤 집을 사려고 하나요?", keys: ["housePrice", "area"], body: (
          <div className="space-y-3">
            <MoneyField label="집값(시가)" value={input.housePrice} onChange={(v) => edit({ housePrice: v }, ["housePrice"])} />
            <ChoiceChips<DsrArea> legend="서울 전체와 경기 12곳은 규제지역이에요(10.15 대책)" value={input.area} options={AREA} onChange={(v) => edit({ area: v }, ["area"])} />
          </div>
        ) },
        { title: "이미 갚고 있는 대출이 있나요?", keys: ["existing"], body: (
          <>
            <MoneyField label="다른 대출의 1년 원리금(신용·차·학자금 등)" value={input.existing} onChange={(v) => edit({ existing: v }, ["existing"])} />
            <p className="mt-2 text-xs text-muted-foreground">없으면 0으로 두세요. 매달 갚는 돈 × 12로 넣으면 돼요.</p>
          </>
        ) },
        { title: "금리와 만기는요?", keys: ["rate", "years"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="대출 금리" value={Number((input.rate * 100).toFixed(2))} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
            <NumberField label="만기" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={5} min={5} />
          </div>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="연 소득" value={input.income} onChange={(v) => edit({ income: v }, ["income"])} />
            <MoneyField label="집값(시가)" value={input.housePrice} onChange={(v) => edit({ housePrice: v }, ["housePrice"])} />
            <MoneyField label="다른 대출 1년 원리금" value={input.existing} onChange={(v) => edit({ existing: v }, ["existing"])} />
            <NumberField label="대출 금리" value={Number((input.rate * 100).toFixed(2))} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
            <NumberField label="만기" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={5} min={5} />
            {input.rateType !== "variable" && <NumberField label="고정 기간(또는 변동 주기)" value={input.fixedYears} onChange={(v) => edit({ fixedYears: v }, ["fixedYears"])} suffix="년" step={1} />}
          </div>
          <ChoiceChips<DsrArea> legend="지역" value={input.area} options={AREA} onChange={(v) => edit({ area: v }, ["area"])} />
          <ChoiceChips<RateType> legend="금리 유형" value={input.rateType} options={RATE_TYPE} onChange={(v) => edit({ rateType: v, fixedYears: v === "variable" ? 0 : Math.max(5, input.fixedYears) }, ["rateType", "fixedYears"])} />
        </div>
      )}
      summary={dsrPlain}
      metrics={(i, s) => {
        const r = dsrResult(i);
        return [
          { label: "최대 대출", value: s.money(r.finalMaxLoan), tone: "primary" },
          { label: "매달 갚는 돈", value: s.money(r.finalMonthlyPayment) },
          { label: "한도 계산 금리", value: `${r.stressedRate.toFixed(2)}%` },
        ];
      }}
      sliders={["income", "housePrice", "rate"]}
      sweepCaption={() => "곡선이 평평해지는 곳은 소득이 아니라 집값(LTV)이나 대출 상한에 걸린 구간이에요."}
      charts={(i, s) => <CompareBars title="세 가지 한도 중 가장 작은 값이 내 한도" caption="표시된 막대가 실제로 걸린 한도예요." items={dsrLimits(i)} format={s.money} />}
      ask={["은행권 DSR 40% 기준이에요. 2금융권은 50%예요.", "다주택자·생활안정자금 대출은 다른 규칙이 붙어요.", `기준일 ${STRESS_DSR_AS_OF}, 행정지도 유효기간은 2026-12-31까지예요.`]}
      expertFooter={(i) => {
        const r = dsrResult(i);
        return (
          <ResultSteps
            steps={[
              `스트레스 금리 = 기본 ${r.stress.baseRate}% × 적용비율 ${Math.round(r.stress.ratio * 100)}% = ${r.stress.addon.toFixed(2)}%p(${r.stress.stage}) → 한도 계산 금리 ${r.stressedRate.toFixed(2)}%`,
              `DSR 한도 = (연 소득 × 40% − 기존 원리금 ${exactWon(i.existing)})을 ${i.years}년 원리금균등으로 역산 = ${exactWon(r.stressedDsrPrincipal)}`,
              `LTV ${r.ltvPercent}% = ${exactWon(r.ltvAmount)}${r.cap !== null ? `, 대출 상한 ${exactWon(r.cap)}` : ""} → 최종 ${exactWon(r.finalMaxLoan)}`,
            ]}
            next={[{ href: "/ko/jeonse-vs-buy-calculator/", label: "전세 vs 매매" }, { href: "/ko/acquisition-tax-calculator/", label: "취득세" }]}
          />
        );
      }}
    />
  );
}
