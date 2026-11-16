// 복리 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/world-money-scenarios.ts compoundResult.
import { COMPOUND_ASSUMPTIONS, compoundBridge, compoundFv, compoundPlain, compoundResult, type CompoundLite } from "../../lib/world-money-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["principal", "monthly", "rate", "years"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: CompoundLite = { principal: 10_000_000, monthly: 1_000_000, rate: 0.07, years: 20 };
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function CompoundScenario() {
  const all = (input: CompoundLite, edit: (p: Partial<CompoundLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <MoneyField label="처음 넣는 돈" value={input.principal} onChange={(v) => edit({ principal: v }, ["principal"])} />
      <MoneyField label="매달 넣는 돈" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
      <NumberField label="연 수익률" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.5} />
      <NumberField label="기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
    </div>
  );
  return (
    <ScenarioTool<CompoundLite, Key>
      toolId="compound-interest-calculator"
      example={EXAMPLE}
      assumptions={COMPOUND_ASSUMPTIONS}
      keys={KEYS}
      evaluate={compoundFv}
      resultName="최종 금액"
      questions={({ input, edit }) => [
        { title: "처음에 얼마, 매달 얼마씩 넣나요?", keys: ["principal", "monthly"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="처음 넣는 돈(없으면 0)" value={input.principal} onChange={(v) => edit({ principal: v }, ["principal"])} />
            <MoneyField label="매달 넣는 돈" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
          </div>
        ) },
        { title: "몇 년, 몇 %로 굴릴 건가요?", keys: ["years", "rate"], body: (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
              <NumberField label="연 수익률" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.5} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">예금은 3% 안팎, 주식 지수 장기 평균은 7% 안팎이에요. 모르면 예시 그대로 두세요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => all(input, edit)}
      summary={compoundPlain}
      metrics={(i, s) => {
        const r = compoundResult(i);
        return [
          { label: `${i.years}년 뒤`, value: s.money(r.fv), tone: "primary" },
          { label: "넣은 돈", value: s.money(r.paid) },
          { label: "불어난 돈", value: s.money(r.gain) },
        ];
      }}
      sliders={["rate", "years", "monthly"]}
      sweepCaption={(a) => (a.key === "years" ? "기간이 길어질수록 곡선이 점점 가팔라져요. 이게 복리예요." : undefined)}
      charts={(i, s) => <BridgeChart title="최종 금액이 쌓이는 과정" steps={compoundBridge(i)} format={s.money} />}
      askTitle="미리 알아 둘 점"
      ask={["세금·수수료·물가는 빼고 매달 복리로 계산했어요.", "실제 수익률은 해마다 오르내려요. 평균 수익률이 같아도 결과가 달라질 수 있어요."]}
      expertFooter={(i) => {
        const r = compoundResult(i);
        return (
          <ResultSteps
            steps={[
              `FV = P(1+r)^n + PMT × ((1+r)^n − 1) ÷ r, r = ${((i.rate / 12) * 100).toFixed(4)}%, n = ${Math.round(i.years * 12)}`,
              `= ${exactWon(r.fv)} (넣은 돈 ${exactWon(r.paid)}, 수익 ${exactWon(r.gain)})`,
            ]}
            next={[{ href: "/ko/fire-retirement-calculator/", label: "FIRE 조기 은퇴" }, { href: "/ko/isa-calculator/", label: "ISA 절세" }]}
          />
        );
      }}
    />
  );
}
