// 대출 상환 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/world-money-scenarios.ts repay.
import { LOAN_ASSUMPTIONS, REPAY_LABEL, loanCompare, loanInterest, loanPlain, loanResult, type LoanLite, type RepayMethod } from "../../lib/world-money-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["amount", "rate", "months", "method"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: LoanLite = { amount: 300_000_000, rate: 0.042, months: 360, method: "annuity" };
const METHODS = (Object.keys(REPAY_LABEL) as RepayMethod[]).map((m) => ({ value: m, label: REPAY_LABEL[m] }));
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function LoanScenario() {
  const fields = (input: LoanLite, edit: (p: Partial<LoanLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <MoneyField label="대출 원금" value={input.amount} onChange={(v) => edit({ amount: v }, ["amount"])} />
      <NumberField label="연 이자율" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
      <NumberField label="상환 기간" value={input.months} onChange={(v) => edit({ months: v }, ["months"])} suffix="개월" step={12} min={1} />
    </div>
  );
  const method = (input: LoanLite, edit: (p: Partial<LoanLite>, k: Key[]) => void) => (
    <ChoiceChips<RepayMethod> legend="상환 방식" value={input.method} options={METHODS} onChange={(v) => edit({ method: v }, ["method"])} />
  );
  return (
    <ScenarioTool<LoanLite, Key>
      toolId="loan-calculator"
      example={EXAMPLE}
      assumptions={LOAN_ASSUMPTIONS}
      keys={KEYS}
      evaluate={loanInterest}
      resultName="이자 합계"
      questions={({ input, edit }) => [
        { title: "얼마를, 몇 %에, 몇 년 빌리나요?", keys: ["amount", "rate", "months"], body: (
          <>
            {fields(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">30년은 360개월, 10년은 120개월이에요. 이자율은 은행 앱의 연 금리를 넣어요.</p>
          </>
        ) },
        { title: "어떻게 갚나요?", keys: ["method"], body: (
          <>
            {method(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">주택담보대출은 대부분 원리금균등(매달 같은 금액)이에요. 신용대출·마이너스 통장은 만기일시가 많아요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {fields(input, edit)}
          {method(input, edit)}
        </div>
      )}
      summary={loanPlain}
      metrics={(i, s) => {
        const r = loanResult(i);
        return [
          { label: i.method === "annuity" ? "매달 갚는 돈" : "첫 달 갚는 돈", value: s.money(r.first) },
          { label: "이자 합계", value: s.money(r.interest), tone: "primary" },
          { label: "갚는 돈 합계", value: s.money(r.total) },
        ];
      }}
      sliders={["rate", "months", "amount"]}
      sweepCaption={(a) => (a.key === "months" ? "기간을 늘리면 매달 부담은 줄지만 이자 합계는 거의 직선으로 늘어요." : undefined)}
      charts={(i, s) => <CompareBars title="상환 방식별 이자 합계" caption="같은 원금·이자율·기간이에요." items={loanCompare(i)} format={s.money} />}
      askTitle="미리 알아 둘 점"
      ask={["중도상환수수료(보통 3년 안 1% 안팎)와 보증료·인지세는 넣지 않았어요.", "고정금리 기준이에요. 변동금리는 금리가 바뀔 때마다 다시 계산돼요."]}
      expertFooter={(i) => {
        const r = loanResult(i);
        return (
          <ResultSteps
            steps={[
              `월 이자율 = ${(i.rate * 100).toFixed(2)}% ÷ 12 = ${((i.rate / 12) * 100).toFixed(4)}%`,
              i.method === "annuity"
                ? `월 상환액 = P × r(1+r)^n ÷ ((1+r)^n − 1) = ${exactWon(r.first)}`
                : i.method === "principal"
                  ? `월 원금 ${exactWon(i.amount / i.months)} + 남은 원금 이자 → 첫 달 ${exactWon(r.first)}, 마지막 달 ${exactWon(r.last)}`
                  : `매달 이자 ${exactWon(r.first)}, 만기에 원금 ${exactWon(i.amount)}`,
              `이자 합계 ${exactWon(r.interest)}, 총 상환액 ${exactWon(r.total)}`,
            ]}
            next={[{ href: "/ko/dsr-calculator/", label: "DSR 한도" }, { href: "/ko/mortgage-calculator/", label: "주택담보대출" }]}
          />
        );
      }}
    />
  );
}
