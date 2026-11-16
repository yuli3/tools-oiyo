// ISA vs 연금저축 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-pension-scenarios.ts isaPensionResult.
import { ISA_PENSION_ASSUMPTIONS, isaPensionCompare, isaPensionGap, isaPensionPlain, isaPensionResult, type IsaPensionLite } from "../../lib/kr-pension-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["annual", "years", "ret", "income", "type"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: IsaPensionLite = { annual: 9_000_000, years: 10, ret: 0.06, income: 50_000_000, type: "normal" };
const TYPE = [
  { value: "normal", label: "일반형(비과세 200만 원)" },
  { value: "eligible", label: "서민형(400만 원)" },
] as const satisfies readonly { value: IsaPensionLite["type"]; label: string }[];
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function KrIsaPensionScenario() {
  return (
    <ScenarioTool<IsaPensionLite, Key>
      toolId="isa-vs-pension-calculator"
      example={EXAMPLE}
      assumptions={ISA_PENSION_ASSUMPTIONS}
      keys={KEYS}
      evaluate={isaPensionGap}
      resultName="연금 계좌가 더 아끼는 세금"
      questions={({ input, edit }) => [
        { title: "1년에 얼마씩, 몇 년 넣을 건가요?", keys: ["annual", "years"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="1년에 넣을 돈" value={input.annual} onChange={(v) => edit({ annual: v }, ["annual"])} hint="월 75만 원이면 900만 원이에요" />
            <NumberField label="기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
          </div>
        ) },
        { title: "연봉(총급여)은 얼마인가요?", keys: ["income", "type"], body: (
          <div className="space-y-3">
            <MoneyField label="총급여(비과세 빼고)" value={input.income} onChange={(v) => edit({ income: v }, ["income"])} hint="5,500만 원 이하면 연금 공제율이 16.5%예요" />
            <ChoiceChips<IsaPensionLite["type"]> legend="ISA 유형(총급여 5천만 원 이하면 서민형)" value={input.type} options={TYPE} onChange={(v) => edit({ type: v }, ["type"])} />
          </div>
        ) },
        { title: "1년에 몇 % 벌 것 같나요?", keys: ["ret"], body: (
          <>
            <NumberField label="연 기대수익률" value={pctField(input.ret)} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.5} />
            <p className="mt-2 text-xs text-muted-foreground">모르면 예시 6%(주식형 펀드·ETF 장기 평균에 가까운 값)로 두세요. 예금 위주면 3% 정도예요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="연 납입액" value={input.annual} onChange={(v) => edit({ annual: v }, ["annual"])} />
            <NumberField label="운용 기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
            <MoneyField label="총급여" value={input.income} onChange={(v) => edit({ income: v }, ["income"])} />
            <NumberField label="연 기대수익률" value={pctField(input.ret)} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.1} />
          </div>
          <ChoiceChips<IsaPensionLite["type"]> legend="ISA 유형" value={input.type} options={TYPE} onChange={(v) => edit({ type: v }, ["type"])} />
        </div>
      )}
      summary={isaPensionPlain}
      metrics={(i, s) => {
        const r = isaPensionResult(i);
        return [
          { label: "ISA로 아끼는 세금", value: s.money(r.isa.benefit) },
          { label: "연금 계좌로 아끼는 세금", value: s.money(r.pension.benefit) },
          { label: "차이(+면 연금 유리)", value: s.money(r.pension.benefit - r.isa.benefit), tone: "primary" },
        ];
      }}
      sliders={["annual", "years", "ret", "income"]}
      sweepCaption={(a) => (a.key === "income" ? "총급여 5,500만 원(점선)을 넘으면 연금 공제율이 16.5%에서 13.2%로 내려가 연금 쪽 이점이 한 번에 줄어요." : a.key === "annual" ? "900만 원(점선)을 넘는 돈은 연금 세액공제가 없어 그 뒤로는 차이가 천천히 변해요." : undefined)}
      charts={(i, s) => <CompareBars title="일반 계좌(15.4%)보다 아끼는 세금" caption="표시된 막대가 더 유리해요. 연금은 55세까지 묶이는 돈이에요." items={isaPensionCompare(i)} format={s.money} />}
      ask={["연금 세액공제는 낸 세금(결정세액)만큼만 돌려받아요. 세금을 적게 내면 연금 쪽 이점이 줄어요.", "연금 수령 세율은 70세 전 5.5%로 봤어요. 일반 계좌의 매년 과세로 줄어드는 복리 효과는 넣지 않았어요."]}
      expertFooter={(i) => {
        const r = isaPensionResult(i);
        return (
          <ResultSteps
            steps={[
              `ISA: 납입 ${exactWon(r.isa.paid)}, 수익 ${exactWon(r.isa.gain)}, 비과세 ${exactWon(r.isa.free)} 넘는 몫 9.9% = ${exactWon(r.isa.tax)} → 절세 ${exactWon(r.isa.benefit)}`,
              `연금: 공제 대상 연 ${exactWon(r.pension.credited)} × ${(r.pension.rate * 100).toFixed(1)}% × ${i.years}년 = ${exactWon(r.pension.credits)}`,
              `연금: 수익 ${exactWon(r.pension.gain)}의 15.4% 면제 − 수령 때 5.5% ${exactWon(r.pension.tax)} → 절세 ${exactWon(r.pension.benefit)}`,
            ]}
            next={[{ href: "/ko/isa-calculator/", label: "ISA 절세" }, { href: "/ko/pension-tax-calculator/", label: "연금저축 세액공제" }]}
          />
        );
      }}
    />
  );
}
