// 종합소득세·프리랜서(3.3%) 한국어판 (2026-11-16 쉬운 설명·가정 변화 적용). 영어판은 KrIncomeTaxCalculator 그대로.
import { useMemo } from "react";
import { incomeAssumptions, incomeBridge, incomeDue, incomePlain, incomeResult, type ExpenseMode, type IncomeInput } from "../../lib/kr-tax-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["revenue", "expenses", "salary", "other", "people", "pension", "prepaid"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: IncomeInput = { revenue: 30_000_000, expenseMode: "simple", expenses: 5_000_000, salary: 0, other: 0, people: 1, pension: 0, prepaid: 0 };
const MODES = [
  { value: "simple", label: "단순경비율(장부 없음)" },
  { value: "actual", label: "실제 비용(장부)" },
] as const satisfies readonly { value: ExpenseMode; label: string }[];
type Edit = (patch: Partial<IncomeInput>, keys: readonly Key[]) => void;

function ExpenseFields({ input, edit, plain }: { input: IncomeInput; edit: Edit; plain: boolean }) {
  return (
    <div className="space-y-3">
      <ChoiceChips<ExpenseMode> legend={plain ? "비용을 어떻게 셀까요?" : "필요경비 계산"} value={input.expenseMode} options={MODES} onChange={(v) => edit({ expenseMode: v }, ["expenses"])} />
      {input.expenseMode === "actual" ? (
        <MoneyField label={plain ? "1년 동안 일에 쓴 비용" : "필요경비"} value={input.expenses} onChange={(v) => edit({ expenses: v }, ["expenses"])} />
      ) : (
        <p className="text-xs text-muted-foreground">장부가 없으면 나라가 정한 비율(수입 4천만 원까지 64.1%, 넘는 몫은 49.7%)만큼 비용으로 쳐 줘요. 업종마다 비율이 달라요.</p>
      )}
    </div>
  );
}

export default function KrIncomeScenario({ variant = "comprehensive" }: { variant?: "comprehensive" | "freelancer" }) {
  const free = variant === "freelancer";
  const assumptions = useMemo(() => incomeAssumptions(free), [free]);
  const evaluate = useMemo(() => incomeDue(free), [free]);
  return (
    <ScenarioTool<IncomeInput, Key>
      toolId={free ? "freelancer-tax-calculator" : "comprehensive-income-tax-calculator"}
      example={EXAMPLE}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={evaluate}
      resultName={free ? "5월 정산(+더 냄 / −돌려받음)" : "5월에 더 낼 돈"}
      questions={({ input, edit }) => {
        const qs = [
          {
            title: free ? "작년에 3.3% 떼고 받은 일, 세전으로 모두 얼마였나요?" : "작년 사업(장사·프리랜서) 수입은 얼마였나요?",
            keys: ["revenue"] as Key[],
            body: (
              <>
                <MoneyField label={free ? "1년 수입(3.3% 떼기 전)" : "1년 매출"} value={input.revenue} onChange={(v) => edit({ revenue: v }, ["revenue"])} />
                {free && <p className="mt-2 text-xs text-muted-foreground">홈택스 지급명세서나 통장 입금액 ÷ 0.967로 구할 수 있어요.</p>}
              </>
            ),
          },
          { title: "일하는 데 쓴 비용은요?", keys: ["expenses"] as Key[], body: <ExpenseFields input={input} edit={edit} plain /> },
        ];
        if (!free)
          qs.push({
            title: "회사 월급이나 다른 소득도 있었나요?",
            keys: ["salary", "other", "prepaid"],
            body: (
              <div className="space-y-3">
                <MoneyField label="회사에서 받은 1년 급여(세전)" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} />
                <MoneyField label="강연료·원고료 같은 기타소득(경비 뺀 금액)" value={input.other} onChange={(v) => edit({ other: v }, ["other"])} />
                <MoneyField label="이미 낸 소득세(원천징수·중간예납)" value={input.prepaid} onChange={(v) => edit({ prepaid: v }, ["prepaid"])} />
              </div>
            ),
          });
        qs.push({
          title: "부양가족과 낸 국민연금은요?",
          keys: ["people", "pension"],
          body: (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="나 포함 부양가족" value={input.people} onChange={(v) => edit({ people: v }, ["people"])} suffix="명" step={1} min={1} />
              <MoneyField label="1년 동안 낸 국민연금" value={input.pension} onChange={(v) => edit({ pension: v }, ["pension"])} />
            </div>
          ),
        });
        return qs;
      }}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <MoneyField label={free ? "사업소득 수입금액(원천징수 전)" : "사업 수입금액"} value={input.revenue} onChange={(v) => edit({ revenue: v }, ["revenue"])} />
          <ExpenseFields input={input} edit={edit} plain={false} />
          {!free && (
            <div className="grid gap-3 sm:grid-cols-3">
              <MoneyField label="근로 총급여" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} />
              <MoneyField label="종합과세 기타소득금액" value={input.other} onChange={(v) => edit({ other: v }, ["other"])} />
              <MoneyField label="기납부세액" value={input.prepaid} onChange={(v) => edit({ prepaid: v }, ["prepaid"])} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="기본공제 인원" value={input.people} onChange={(v) => edit({ people: v }, ["people"])} suffix="명" step={1} min={1} />
            <MoneyField label="연금보험료" value={input.pension} onChange={(v) => edit({ pension: v }, ["pension"])} />
          </div>
        </div>
      )}
      summary={(i, top) => incomePlain(i, free, top)}
      metrics={(i, s) => {
        const r = incomeResult(i, free);
        return [
          { label: r.due >= 0 ? "5월에 더 낼 돈" : "5월에 돌려받을 돈", value: s.money(Math.abs(r.due)), tone: "primary" },
          { label: "올해 세금 합계", value: s.money(r.determined + r.local) },
          { label: "비용으로 친 금액", value: s.money(r.expense) },
        ];
      }}
      sliders={free ? ["revenue", "expenses", "people", "pension"] : ["revenue", "expenses", "salary", "people"]}
      sweepCaption={(a) => (a.key === "expenses" ? "비용을 직접 바꾸면 '실제 비용' 방식으로 계산해요. 비용이 늘면 세금이 줄어요." : undefined)}
      charts={(i, s) => <BridgeChart title="세금이 정해지는 순서" steps={incomeBridge(i, free)} format={s.money} />}
      ask={[
        "수입이 일정 금액을 넘으면 단순경비율 대신 기준경비율(훨씬 낮아요)을 써야 해서 세금이 크게 늘 수 있어요.",
        "노란우산공제, 연금저축, 기부금은 세금을 더 줄여 줘요. 여기엔 넣지 않았어요.",
        "5월 31일까지 홈택스로 신고해야 돌려받을 수 있어요.",
      ]}
      expertFooter={(i) => {
        const r = incomeResult(i, free);
        return (
          <ResultSteps
            steps={[
              `사업소득금액 = ${exactWon(r.revenue)} − 필요경비 ${exactWon(r.expense)} = ${exactWon(r.business)}${!free && i.salary > 0 ? `, 근로소득금액 ${exactWon(r.earned)}` : ""}`,
              `종합소득금액 ${exactWon(r.total)} − 소득공제 ${exactWon(r.deductions)} = 과세표준 ${exactWon(r.base)}`,
              `산출세액(제55조) ${exactWon(r.calculated)} − 세액공제 ${exactWon(r.credits)} = 결정세액 ${exactWon(r.determined)}, 지방소득세 ${exactWon(r.local)}`,
              `${free ? "원천징수 3.3%" : "기납부세액"} ${exactWon(r.withheld + r.withheldLocal)} 차감 → ${r.due >= 0 ? "납부" : "환급"} ${exactWon(Math.abs(r.due))}`,
              "단순경비율은 940909(기타 자영업) 2025년 귀속 기준이에요. 기준경비율·추가 소득공제·세액감면은 넣지 않았어요.",
            ]}
            next={[
              { href: free ? "/ko/comprehensive-income-tax-calculator/" : "/ko/freelancer-tax-calculator/", label: free ? "종합소득세 계산기" : "프리랜서 3.3% 계산기" },
              { href: "/ko/incorporation-calculator/", label: "개인 vs 법인 비교" },
            ]}
          />
        );
      }}
    />
  );
}
