// 연금 현재가치(라이프니츠·호프만) (2026-11-17 쉬운 설명·가정 변화 적용). 계산: lib/world-money-scenarios.ts pvResult.
import { PV_ASSUMPTIONS, pvPlain, pvResult, pvValue, type PvLite } from "../../lib/world-money-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["monthly", "months", "rate", "method"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: PvLite = { monthly: 1_000_000, months: 120, rate: 0.05, method: "hoffman" };
const METHOD: { value: PvLite["method"]; label: string }[] = [
  { value: "hoffman", label: "호프만(단리, 법원)" },
  { value: "leibniz", label: "라이프니츠(복리, 보험사)" },
];
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function PresentValueScenario() {
  const all = (input: PvLite, edit: (p: Partial<PvLite>, k: Key[]) => void) => (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <MoneyField label="매달 받는 돈" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
        <NumberField label="받는 기간" value={input.months} onChange={(v) => edit({ months: v }, ["months"])} suffix="개월" step={12} min={1} />
        <NumberField label="할인율(연)" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.5} />
      </div>
      <ChoiceChips<PvLite["method"]> legend="계산 방식" value={input.method} options={METHOD} onChange={(v) => edit({ method: v }, ["method"])} />
    </div>
  );
  return (
    <ScenarioTool<PvLite, Key>
      toolId="present-value-calculator"
      example={EXAMPLE}
      assumptions={PV_ASSUMPTIONS}
      keys={KEYS}
      evaluate={pvValue}
      resultName="현재가치"
      questions={({ input, edit }) => [
        { title: "매달 얼마씩, 몇 개월 받는 돈인가요?", keys: ["monthly", "months"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="매달 받는 돈" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
            <NumberField label="받는 기간" value={input.months} onChange={(v) => edit({ months: v }, ["months"])} suffix="개월" step={12} min={1} />
          </div>
        ) },
        { title: "어떤 방식으로 계산할까요?", keys: ["method", "rate"], body: (
          <>
            <ChoiceChips<PvLite["method"]> legend="계산 방식" value={input.method} options={METHOD} onChange={(v) => edit({ method: v }, ["method"])} />
            <p className="mt-2 text-xs text-muted-foreground">사고·손해배상 소송은 호프만, 보험금 일시 지급은 라이프니츠가 많아요. 할인율은 보통 민사 법정이율 연 5%예요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => all(input, edit)}
      summary={pvPlain}
      metrics={(i, s) => {
        const r = pvResult(i);
        return [
          { label: "현재가치", value: s.money(r.pv), tone: "primary" },
          { label: "나눠 받는 합계", value: s.money(r.nominal) },
          { label: "계수", value: r.coef.toFixed(4) },
        ];
      }}
      sliders={["rate", "months"]}
      charts={(i, s) => (
        <CompareBars
          title="방식별 현재가치"
          items={[
            { label: "나눠 받는 합계", value: pvResult(i).nominal },
            { label: "호프만", value: pvValue({ ...i, method: "hoffman" }), current: i.method === "hoffman" },
            { label: "라이프니츠", value: pvValue({ ...i, method: "leibniz" }), current: i.method === "leibniz" },
          ]}
          format={s.money}
        />
      )}
      askTitle="소송·보험 협상 전에 확인할 것"
      ask={["법원 계산은 중간이자 공제 기간, 월 미만 날짜 처리, 호프만 계수 240 상한을 사건마다 따로 적용해요.", "실제 금액은 판결문이나 보험사 산출서로 확인하세요. 이 값은 비교용이에요."]}
      expertFooter={(i) => {
        const r = pvResult(i);
        return (
          <ResultSteps
            steps={[
              i.method === "leibniz" ? `라이프니츠 계수 = (1 − (1+r/12)^−n) ÷ (r/12) = ${r.coef.toFixed(4)}` : `호프만 계수 = Σ 1 ÷ (1 + r × k/12), k = 1…${i.months} = ${r.coef.toFixed(4)}`,
              `현재가치 = ${exactWon(i.monthly)} × ${r.coef.toFixed(4)} = ${exactWon(r.pv)}`,
            ]}
            next={[{ href: "/ko/inflation-calculator/", label: "물가" }, { href: "/ko/pension-optimizer-calculator/", label: "연금 최적화" }]}
          />
        );
      }}
    />
  );
}
