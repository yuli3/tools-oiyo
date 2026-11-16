// ISA 절세 (2026-11-16 쉬운 설명·가정 변화 적용). 계산은 lib/finance/isa-tax-comparison.ts 그대로예요.
import { ISA_ASSUMPTIONS, isaBridge, isaPlain, isaResult, isaSaved, type IsaLite } from "../../lib/kr-home-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["type", "profit", "loss"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: IsaLite = { type: "normal", profit: 5_000_000, loss: 1_000_000 };
const TYPE = [
  { value: "normal", label: "일반형(비과세 200만 원)" },
  { value: "eligible", label: "서민형·농어민형(400만 원)" },
] as const satisfies readonly { value: IsaLite["type"]; label: string }[];

export default function KrIsaScenario() {
  return (
    <ScenarioTool<IsaLite, Key>
      toolId="isa-calculator"
      example={EXAMPLE}
      assumptions={ISA_ASSUMPTIONS}
      keys={KEYS}
      evaluate={isaSaved}
      resultName="아끼는 세금"
      questions={({ input, edit }) => [
        { title: "어떤 ISA인가요?", keys: ["type"], body: <ChoiceChips<IsaLite["type"]> legend="총급여 5천만 원(종합소득 3,800만 원) 이하면 서민형이에요" value={input.type} options={TYPE} onChange={(v) => edit({ type: v }, ["type"])} /> },
        { title: "만기까지 계좌에서 얼마나 벌 것 같나요?", keys: ["profit"], body: (
          <>
            <MoneyField label="이자·배당·펀드 등 수익 합계" value={input.profit} onChange={(v) => edit({ profit: v }, ["profit"])} />
            <p className="mt-2 text-xs text-muted-foreground">국내 주식 매매차익은 원래 세금이 없어서 빼고 넣어요. 예: 2,000만 원을 3년간 연 4%로 굴리면 약 250만 원이에요.</p>
          </>
        ) },
        { title: "손실 난 상품도 있나요?", keys: ["loss"], body: <MoneyField label="같은 계좌 안의 손실(없으면 0)" value={input.loss} onChange={(v) => edit({ loss: v }, ["loss"])} /> },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <ChoiceChips<IsaLite["type"]> legend="유형" value={input.type} options={TYPE} onChange={(v) => edit({ type: v }, ["type"])} />
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="과세 대상 이익(금융회사 확인 금액)" value={input.profit} onChange={(v) => edit({ profit: v }, ["profit"])} />
            <MoneyField label="통산 대상 손실" value={input.loss} onChange={(v) => edit({ loss: v }, ["loss"])} />
          </div>
        </div>
      )}
      summary={isaPlain}
      metrics={(i, s) => {
        const r = isaResult(i);
        return [
          { label: "아끼는 세금", value: s.money(r.taxSaved), tone: "primary" },
          { label: "일반 계좌 세금", value: s.money(r.normalAccountTax) },
          { label: "ISA 세금", value: s.money(r.isaTax) },
        ];
      }}
      sliders={["profit", "loss"]}
      sweepCaption={() => "비과세 한도(점선)까지는 아끼는 세금이 15.4%씩 늘고, 그 뒤로는 5.5%(15.4−9.9)씩만 늘어요."}
      charts={(i, s) => <BridgeChart title="일반 계좌 세금에서 ISA 세금까지" steps={isaBridge(i)} format={s.money} />}
      ask={["의무 가입 3년과 가입 요건을 채웠다고 가정했어요.", "연금계좌 전환 세액공제와 건강보험료 영향은 넣지 않았어요."]}
      expertFooter={(i) => {
        const r = isaResult(i);
        return (
          <ResultSteps
            steps={[
              `순이익 = 이익 ${exactWon(r.profit)} − 손실 ${exactWon(r.loss)} = ${exactWon(r.netProfit)}`,
              `비과세 ${exactWon(r.taxFreePortion)}(한도 ${exactWon(r.taxFreeLimit)}), 초과분 ${exactWon(r.taxableExcess)} × 9.9% = ${exactWon(r.isaTax)}`,
              `일반 계좌 = 이익 ${exactWon(r.profit)} × 15.4% = ${exactWon(r.normalAccountTax)} → 절세 ${exactWon(r.taxSaved)}`,
            ]}
            next={[{ href: "/ko/isa-vs-pension-calculator/", label: "ISA vs 연금저축" }, { href: "/ko/deposit-calculator/", label: "예금·적금 이자" }]}
          />
        );
      }}
    />
  );
}
