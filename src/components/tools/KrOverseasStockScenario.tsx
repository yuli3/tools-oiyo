// 해외주식 양도세 절세 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-pension-scenarios.ts overseasResult.
import { OVERSEAS_ASSUMPTIONS, overseasBridge, overseasPlain, overseasResult, overseasSaved, type OverseasLite } from "../../lib/kr-pension-scenarios";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["realized", "openLoss", "openGain"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: OverseasLite = { realized: 5_000_000, openGain: 0, openLoss: 1_500_000 };

export default function KrOverseasStockScenario() {
  return (
    <ScenarioTool<OverseasLite, Key>
      toolId="overseas-stock-saver-calculator"
      example={EXAMPLE}
      assumptions={OVERSEAS_ASSUMPTIONS}
      keys={KEYS}
      evaluate={overseasSaved}
      resultName="아낄 수 있는 세금"
      questions={({ input, edit }) => [
        { title: "올해 해외주식을 팔아서 얼마 벌었나요?", keys: ["realized"], body: (
          <>
            <MoneyField label="올해 판 주식의 이익 − 손실(원화)" value={input.realized} onChange={(v) => edit({ realized: v }, ["realized"])} allowNegative />
            <p className="mt-2 text-xs text-muted-foreground">증권사 앱의 '해외주식 양도소득 조회'에 나온 금액이에요. 손해가 더 크면 마이너스로 넣어요.</p>
          </>
        ) },
        { title: "아직 안 판 주식 중 손해 보고 있는 게 있나요?", keys: ["openLoss"], body: <MoneyField label="지금 팔면 생기는 손실(없으면 0)" value={input.openLoss} onChange={(v) => edit({ openLoss: v }, ["openLoss"])} /> },
        { title: "오른 주식은요?", keys: ["openGain"], body: <MoneyField label="지금 팔면 생기는 이익(없으면 0)" value={input.openGain} onChange={(v) => edit({ openGain: v }, ["openGain"])} /> },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyField label="올해 실현 손익" value={input.realized} onChange={(v) => edit({ realized: v }, ["realized"])} allowNegative />
          <MoneyField label="미실현 평가손실" value={input.openLoss} onChange={(v) => edit({ openLoss: v }, ["openLoss"])} />
          <MoneyField label="미실현 평가이익" value={input.openGain} onChange={(v) => edit({ openGain: v }, ["openGain"])} />
        </div>
      )}
      summary={overseasPlain}
      metrics={(i, s) => {
        const r = overseasResult(i);
        return [
          { label: "지금 그대로 낼 세금", value: s.money(r.taxNow) },
          { label: "손실 정리 후 세금", value: s.money(r.taxAfter) },
          { label: "아낄 수 있는 세금", value: s.money(r.saveNow + r.saveLater), tone: "primary" },
        ];
      }}
      sliders={["realized", "openLoss", "openGain"]}
      sweepCaption={(a) => (a.key === "realized" ? "250만 원(점선)까지는 세금이 없어요. 넘으면 남은 공제를 쓸 일은 없고 손실 정리로만 줄여요." : undefined)}
      charts={(i, s) => <BridgeChart title="과세 대상이 정해지는 과정" caption="과세 대상의 22%(양도세 20% + 지방세 2%)를 내요." steps={overseasBridge(i)} format={s.money} />}
      ask={["환율은 사고판 날의 기준환율로 원화 환산해요. 증권사 조회 금액을 쓰는 게 가장 정확해요.", "국내 증시에 상장된 해외 ETF는 여기 들어가지 않아요. 매매차익이 배당소득(15.4%)으로 과세돼요."]}
      expertFooter={(i) => {
        const r = overseasResult(i);
        return (
          <ResultSteps
            steps={[
              `현재: (${exactWon(i.realized)} − 250만) × 22% = ${exactWon(r.taxNow)}`,
              `손실 실현 ${exactWon(r.harvest)} 뒤: ${exactWon(r.taxAfter)} → 올해 절세 ${exactWon(r.saveNow)}`,
              `공제 안에서 이익 실현 ${exactWon(r.stepUp)} → 나중 절세 ${exactWon(r.saveLater)}, 못 쓴 공제 ${exactWon(r.unusedDeduction)}`,
            ]}
            next={[{ href: "/ko/overseas-stock-tax/", label: "해외주식 양도세" }, { href: "/ko/overseas-stock-vs-etf-tax-calculator/", label: "해외주식 vs 국내 상장 ETF" }]}
          />
        );
      }}
    />
  );
}
