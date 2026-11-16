// 퇴직소득세 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-retirement-tax.ts, 가정·문장: lib/kr-tax-scenarios.ts.
import { retirementIncomeTax } from "../../lib/kr-retirement-tax";
import { RETIREMENT_ASSUMPTIONS, retirementBridge, retirementNet, retirementPlain, type RetirementInput } from "../../lib/kr-tax-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["gross", "years"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: RetirementInput = { gross: 80_000_000, years: 10 };

export default function RetirementTaxCalculator() {
  return (
    <ScenarioTool<RetirementInput, Key>
      toolId="retirement-tax-calculator"
      example={EXAMPLE}
      assumptions={RETIREMENT_ASSUMPTIONS}
      keys={KEYS}
      evaluate={retirementNet}
      resultName="실제 받는 돈"
      questions={({ input, edit }) => [
        {
          title: "퇴직금은 세금 떼기 전 얼마인가요?",
          keys: ["gross"],
          body: (
            <>
              <p className="mb-3 text-sm leading-6 text-muted-foreground">
                모르면 <a className="underline" href="/ko/severance-calculator/">퇴직금 계산기</a>로 먼저 구해 보세요. 퇴직연금(DC·DB)으로 받는 금액도 같아요.
              </p>
              <MoneyField label="세전 퇴직금" value={input.gross} onChange={(v) => edit({ gross: v }, ["gross"])} />
            </>
          ),
        },
        {
          title: "이 회사에서 몇 년 일했나요?",
          keys: ["years"],
          body: (
            <>
              <NumberField label="일한 기간(1년 안 되는 달은 1년으로 쳐요)" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} />
              <p className="mt-2 text-xs text-muted-foreground">오래 일할수록 빼 주는 금액이 커져서 세금이 줄어요.</p>
            </>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="세전 퇴직급여 총액" value={input.gross} onChange={(v) => edit({ gross: v }, ["gross"])} />
          <NumberField label="근속연수(1년 미만 끝수는 1년)" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} />
        </div>
      )}
      summary={retirementPlain}
      metrics={(i, s) => {
        const r = retirementIncomeTax(i.gross, i.years);
        return [
          { label: "실제 받는 돈", value: s.money(r.netPayout), tone: "primary" },
          { label: "세금 합계", value: s.money(r.totalTax) },
          { label: "실제 세율", value: `${r.effectiveTaxRate.toFixed(2)}%` },
        ];
      }}
      sliders={["gross", "years"]}
      sweepCaption={(a) => (a.key === "years" ? "점선은 근속연수공제가 늘어나는 폭이 바뀌는 지점이에요(5년 이하 1년에 100만, 10년까지 200만, 20년까지 250만, 그 뒤 300만)." : undefined)}
      charts={(i, s) => <BridgeChart title="퇴직금에서 세금을 떼면" steps={retirementBridge(i)} format={s.money} />}
      ask={[
        "퇴직금을 IRP 계좌로 받으면 세금을 떼지 않고 옮겨지고, 나중에 연금으로 받을 때 세금이 30~40% 줄어요. 회사와 은행에 확인해 주세요.",
        "같은 해에 중간정산이나 다른 회사 퇴직금을 받았다면 합쳐서 계산할 수 있어요.",
      ]}
      expertFooter={(i) => {
        const r = retirementIncomeTax(i.gross, i.years);
        return (
          <ResultSteps
            steps={[
              `근속연수공제(제48조①1, ${r.years}년) ${exactWon(r.serviceDeduction)}`,
              `환산급여 = (${exactWon(r.gross)} − 근속연수공제) × 12 ÷ ${r.years} = ${exactWon(r.convertedSalary)}`,
              `환산급여공제(제48조①2) ${exactWon(r.salaryDeduction)} → 환산 과세표준 ${exactWon(r.convertedTaxBase)}`,
              `환산 산출세액 ${exactWon(r.convertedCalculatedTax)} ÷ 12 × ${r.years} = 퇴직소득세 ${exactWon(r.nationalTax)}, 지방소득세 ${exactWon(r.localTax)}`,
              "IRP 이연, 임원 퇴직소득 한도, 2012년 이전 근속분 특례는 넣지 않았어요.",
            ]}
            next={[
              { href: "/ko/severance-calculator/", label: "퇴직금 계산" },
              { href: "/ko/isa-vs-pension-calculator/", label: "ISA vs 연금저축" },
            ]}
          />
        );
      }}
    />
  );
}
