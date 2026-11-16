// 연금저축·IRP 세액공제 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-pension-scenarios.ts pensionCredit.
import { PENSION_CREDIT_ASSUMPTIONS, pensionCreditBridge, pensionCreditMarks, pensionCreditOf, pensionCreditPlain, pensionRefund, type PensionCreditLite } from "../../lib/kr-pension-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["type", "income", "savings", "irp"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: PensionCreditLite = { type: "earned", income: 50_000_000, savings: 6_000_000, irp: 1_000_000 };
const TYPE = [
  { value: "earned", label: "직장인(총급여)" },
  { value: "comprehensive", label: "사업·프리랜서(종합소득금액)" },
] as const satisfies readonly { value: PensionCreditLite["type"]; label: string }[];

export default function KrPensionCreditScenario() {
  return (
    <ScenarioTool<PensionCreditLite, Key>
      toolId="pension-tax-calculator"
      example={EXAMPLE}
      assumptions={PENSION_CREDIT_ASSUMPTIONS}
      keys={KEYS}
      evaluate={pensionRefund}
      resultName="돌려받는 돈"
      marksFor={(key, i) => (key === "income" ? pensionCreditMarks(i) : undefined)}
      questions={({ input, edit }) => [
        { title: "어떻게 버세요?", keys: ["type", "income"], body: (
          <div className="space-y-3">
            <ChoiceChips<PensionCreditLite["type"]> legend="소득 유형" value={input.type} options={TYPE} onChange={(v) => edit({ type: v }, ["type"])} />
            <MoneyField label={input.type === "earned" ? "총급여(비과세 빼고, 1년)" : "종합소득금액(경비 뺀 소득)"} value={input.income} onChange={(v) => edit({ income: v }, ["income"])} />
          </div>
        ) },
        { title: "올해 연금 계좌에 얼마 넣었거나 넣을 건가요?", keys: ["savings", "irp"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="연금저축(1년 합계)" value={input.savings} onChange={(v) => edit({ savings: v }, ["savings"])} hint="월 50만 원이면 600만 원" />
            <MoneyField label="IRP(1년 합계, 회사 적립 제외)" value={input.irp} onChange={(v) => edit({ irp: v }, ["irp"])} />
          </div>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <ChoiceChips<PensionCreditLite["type"]> legend="소득 유형" value={input.type} options={TYPE} onChange={(v) => edit({ type: v }, ["type"])} />
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField label={input.type === "earned" ? "총급여" : "종합소득금액"} value={input.income} onChange={(v) => edit({ income: v }, ["income"])} />
            <MoneyField label="연금저축 납입액" value={input.savings} onChange={(v) => edit({ savings: v }, ["savings"])} />
            <MoneyField label="IRP 납입액(본인)" value={input.irp} onChange={(v) => edit({ irp: v }, ["irp"])} />
          </div>
        </div>
      )}
      summary={pensionCreditPlain}
      metrics={(i, s) => {
        const r = pensionCreditOf(i);
        return [
          { label: "돌려받는 돈", value: s.money(r.refund), tone: "primary" },
          { label: "공제율", value: `${(r.rate * 100).toFixed(1)}%` },
          { label: "한도까지 남은 돈", value: s.money(r.room) },
        ];
      }}
      sliders={["irp", "savings", "income"]}
      sweepCaption={(a) => (a.key === "income" ? "점선을 1원만 넘어도 공제율이 16.5%에서 13.2%로 내려가요." : "점선(한도)을 넘으면 더 넣어도 돌려받는 돈이 늘지 않아요.")}
      charts={(i, s) => <BridgeChart title="공제 대상이 정해지는 과정" caption="연금저축은 600만 원, IRP를 더해 900만 원까지만 세어요." steps={pensionCreditBridge(i)} format={s.money} />}
      ask={["낸 세금(결정세액)이 공제액보다 적으면 그만큼만 돌려받아요.", "회사가 넣어 주는 퇴직연금(DB·DC 회사 부담분)은 공제 대상이 아니에요."]}
      expertFooter={(i) => {
        const r = pensionCreditOf(i);
        return (
          <ResultSteps
            steps={[
              `연금저축 인정 = min(${exactWon(i.savings)}, 600만) = ${exactWon(r.savingsCounted)}`,
              `합산 인정 = min(${exactWon(r.savingsCounted)} + IRP ${exactWon(i.irp)}, 900만) = ${exactWon(r.base)}`,
              `세액공제 = ${exactWon(r.base)} × ${(r.rate * 100).toFixed(1)}%(지방세 포함) = ${exactWon(r.refund)}`,
            ]}
            next={[{ href: "/ko/pension-optimizer-calculator/", label: "연금 최적화" }, { href: "/ko/isa-vs-pension-calculator/", label: "ISA vs 연금저축" }]}
          />
        );
      }}
    />
  );
}
