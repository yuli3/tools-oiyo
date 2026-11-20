// 한국 종합소득세·프리랜서(3.3%) 영어판 (2026-11-20). 한국어는 KrIncomeScenario, ja·zh·fr·es는 그 나라 계산기.
import { useMemo } from "react";
import { incomeDue, incomeExpense, incomeResult, type ExpenseMode, type IncomeInput } from "../../../lib/kr-tax-scenarios";
import { fixedRange, type Assumption, type BridgeStep, type TornadoBar } from "../../../lib/scenario";
import { cash, cashExact, driverOf } from "../../../lib/world-money-i18n";
import KrIncomeTaxCalculator from "../KrIncomeTaxCalculator";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["revenue", "expenses", "salary", "other", "people", "pension", "prepaid"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: IncomeInput = { revenue: 30_000_000, expenseMode: "simple", expenses: 5_000_000, salary: 0, other: 0, people: 1, pension: 0, prepaid: 0 };
const CUR = "KRW";
const m = (n: number) => cash(n, "en", CUR);
const x = (n: number) => cashExact(n, "en", CUR);
const MODES = [
  { value: "simple", label: "Simple expense rate (no books)" },
  { value: "actual", label: "Actual costs (bookkeeping)" },
] as const satisfies readonly { value: ExpenseMode; label: string }[];
type Edit = (patch: Partial<IncomeInput>, keys: readonly Key[]) => void;

const money = (key: "revenue" | "salary" | "other" | "pension" | "prepaid", label: string, plain: string, max: number, kind: "fact" | "assumption" = "assumption"): Assumption<IncomeInput> => ({
  key, label, plain, unit: "won", kind,
  get: (i) => i[key], set: (i, v) => ({ ...i, [key]: Math.max(0, v) }),
  range: (a) => [0, Math.max(a * 2, max)],
});

function assumptions(free: boolean): Assumption<IncomeInput>[] {
  const list: Assumption<IncomeInput>[] = [
    money("revenue", free ? "Business income before 3.3% withholding" : "Business revenue", free ? "your yearly income" : "your yearly revenue", 100_000_000),
    {
      key: "expenses", label: "Necessary expenses", plain: "your work costs", unit: "won", kind: "assumption",
      get: incomeExpense, set: (i, v) => ({ ...i, expenseMode: "actual", expenses: Math.max(0, v) }),
      range: (a) => [0, Math.max(a * 2, 50_000_000)],
    },
  ];
  if (!free) {
    list.push(money("salary", "Employment income (gross)", "your salary", 50_000_000));
    list.push(money("other", "Other income", "other income such as lecture fees", 10_000_000));
  }
  list.push({ key: "people", label: "Basic deduction persons", plain: "the number of dependants", unit: "people", kind: "assumption", get: (i) => i.people, set: (i, v) => ({ ...i, people: Math.max(1, Math.round(v)) }), range: fixedRange(1, 6) });
  list.push(money("pension", "National pension contributions", "pension paid", 6_000_000));
  if (!free) list.push(money("prepaid", "Tax already paid", "tax already paid", 5_000_000, "fact"));
  return list;
}

function bridge(i: IncomeInput, free: boolean): BridgeStep[] {
  const r = incomeResult(i, free);
  const steps: BridgeStep[] = [
    { label: "Calculated tax", value: r.calculated, kind: "add" },
    { label: "Tax credits", value: -r.credits, kind: "add" },
    { label: "Final tax", value: r.determined, kind: "total" },
    { label: "Local income tax", value: r.local, kind: "add" },
  ];
  const paid = r.withheld + r.withheldLocal;
  if (paid > 0) steps.push({ label: free ? "3.3% already withheld" : "Tax already paid", value: -paid, kind: "add" });
  steps.push({ label: r.due >= 0 ? "Extra to pay in May" : "Refund in May", value: r.due, kind: "total" });
  return steps;
}

function summary(i: IncomeInput, free: boolean, top?: TornadoBar) {
  const r = incomeResult(i, free);
  const reasons: string[] = [
    i.expenseMode === "simple"
      ? `About ${Math.round((r.expense / Math.max(1, r.revenue)) * 100)}% of income was treated as costs (simple expense rate). If your real costs are higher, keeping books can lower the tax.`
      : `Your work costs of ${m(r.expense)} were subtracted before tax.`,
  ];
  if (free) reasons.push(`${m(r.withheld + r.withheldLocal)} was already withheld at 3.3%. If the real tax is lower, you get the difference back.`);
  reasons.push(`Each dependant (including you) takes ₩1.5M off taxable income (now ${i.people}).`);
  return {
    headline: r.due >= 0 ? `At the May income tax filing you pay about ${m(r.due)} more (estimate, incl. local income tax).` : `At the May income tax filing you get about ${m(-r.due)} back (estimate, incl. local income tax).`,
    driver: driverOf("en", top, r.due >= 0 ? "the tax due" : "the refund", m),
    reasons,
  };
}

function ExpenseFields({ input, edit, plain }: { input: IncomeInput; edit: Edit; plain: boolean }) {
  return (
    <div className="space-y-3">
      <ChoiceChips<ExpenseMode> legend={plain ? "How should costs be counted?" : "Necessary expenses method"} value={input.expenseMode} options={MODES} onChange={(v) => edit({ expenseMode: v }, ["expenses"])} />
      {input.expenseMode === "actual" ? (
        <NumberField label={plain ? "What you spent on work in the year" : "Necessary expenses"} value={input.expenses} onChange={(v) => edit({ expenses: v }, ["expenses"])} suffix={CUR} step={1_000_000} />
      ) : (
        <p className="text-xs text-muted-foreground">Without books, a set share counts as costs (64.1% up to ₩40M of income, 49.7% above). The rate differs by business type.</p>
      )}
    </div>
  );
}

export default function KrIncomeEn({ variant = "comprehensive" }: { variant?: "comprehensive" | "freelancer" }) {
  const free = variant === "freelancer";
  const list = useMemo(() => assumptions(free), [free]);
  const evaluate = useMemo(() => incomeDue(free), [free]);
  return (
    <ScenarioTool<IncomeInput, Key>
      lang="en"
      currency={CUR}
      toolId={free ? "freelancer-tax-calculator" : "comprehensive-income-tax-calculator"}
      example={EXAMPLE}
      assumptions={list}
      keys={KEYS}
      evaluate={evaluate}
      resultName={free ? "May settlement (+ pay / − refund)" : "extra tax in May"}
      questions={({ input, edit }) => {
        const qs = [
          {
            title: free ? "Last year, how much did you earn from 3.3%-withheld work, before tax?" : "What was last year's business (self-employed or freelance) revenue?",
            keys: ["revenue"] as Key[],
            body: (
              <>
                <NumberField label={free ? "Yearly income (before 3.3%)" : "Yearly revenue"} value={input.revenue} onChange={(v) => edit({ revenue: v }, ["revenue"])} suffix={CUR} step={1_000_000} />
                {free && <p className="mt-2 text-xs text-muted-foreground">Use the payment statements on Hometax, or bank deposits ÷ 0.967.</p>}
              </>
            ),
          },
          { title: "What did you spend on your work?", keys: ["expenses"] as Key[], body: <ExpenseFields input={input} edit={edit} plain /> },
        ];
        if (!free)
          qs.push({
            title: "Did you also have a salary or other income?",
            keys: ["salary", "other", "prepaid"],
            body: (
              <div className="space-y-3">
                <NumberField label="Yearly salary from an employer (gross)" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} suffix={CUR} step={1_000_000} />
                <NumberField label="Other income such as lecture or writing fees (after costs)" value={input.other} onChange={(v) => edit({ other: v }, ["other"])} suffix={CUR} step={100_000} />
                <NumberField label="Income tax already paid (withholding, interim)" value={input.prepaid} onChange={(v) => edit({ prepaid: v }, ["prepaid"])} suffix={CUR} step={100_000} />
              </div>
            ),
          });
        qs.push({
          title: "Dependants and national pension paid?",
          keys: ["people", "pension"],
          body: (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Dependants incl. you" value={input.people} onChange={(v) => edit({ people: v }, ["people"])} suffix="people" step={1} min={1} />
              <NumberField label="National pension paid in the year" value={input.pension} onChange={(v) => edit({ pension: v }, ["pension"])} suffix={CUR} step={100_000} />
            </div>
          ),
        });
        return qs;
      }}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <NumberField label={free ? "Business income (before withholding)" : "Business revenue"} value={input.revenue} onChange={(v) => edit({ revenue: v }, ["revenue"])} suffix={CUR} step={1_000_000} />
          <ExpenseFields input={input} edit={edit} plain={false} />
          {!free && (
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberField label="Gross employment income" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} suffix={CUR} step={1_000_000} />
              <NumberField label="Other income (aggregated)" value={input.other} onChange={(v) => edit({ other: v }, ["other"])} suffix={CUR} step={100_000} />
              <NumberField label="Prepaid tax" value={input.prepaid} onChange={(v) => edit({ prepaid: v }, ["prepaid"])} suffix={CUR} step={100_000} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Basic deduction persons" value={input.people} onChange={(v) => edit({ people: v }, ["people"])} suffix="people" step={1} min={1} />
            <NumberField label="Pension contributions" value={input.pension} onChange={(v) => edit({ pension: v }, ["pension"])} suffix={CUR} step={100_000} />
          </div>
        </div>
      )}
      summary={(i, top) => summary(i, free, top)}
      metrics={(i, s) => {
        const r = incomeResult(i, free);
        return [
          { label: r.due >= 0 ? "Extra to pay in May" : "Refund in May", value: s.money(Math.abs(r.due)), tone: "primary" },
          { label: "Total tax for the year", value: s.money(r.determined + r.local) },
          { label: "Counted as costs", value: s.money(r.expense) },
        ];
      }}
      sliders={free ? ["revenue", "expenses", "people", "pension"] : ["revenue", "expenses", "salary", "people"]}
      sweepCaption={(a) => (a.key === "expenses" ? "Changing costs directly switches to the actual-costs method. Higher costs mean less tax." : undefined)}
      charts={(i, s) => <BridgeChart title="How the tax is worked out" steps={bridge(i, free)} format={s.money} />}
      askTitle="Good to know"
      ask={[
        "Above a certain income you must use the standard expense rate (much lower) instead of the simple rate, which can raise the tax a lot.",
        "Yellow Umbrella mutual aid, pension savings and donations lower the tax further. They are not included here.",
        "File on Hometax by May 31 to get any refund.",
      ]}
      expertFooter={(i) => {
        const r = incomeResult(i, free);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `Business income = ${x(r.revenue)} − expenses ${x(r.expense)} = ${x(r.business)}${!free && i.salary > 0 ? `, employment income ${x(r.earned)}` : ""}`,
                `Aggregate income ${x(r.total)} − deductions ${x(r.deductions)} = taxable base ${x(r.base)}`,
                `Calculated tax (Income Tax Act Art. 55) ${x(r.calculated)} − credits ${x(r.credits)} = final tax ${x(r.determined)}, local income tax ${x(r.local)}`,
                `Minus ${free ? "3.3% withheld" : "tax already paid"} ${x(r.withheld + r.withheldLocal)} → ${r.due >= 0 ? "pay" : "refund"} ${x(Math.abs(r.due))}`,
                "Simple expense rate for code 940909 (other self-employed), tax year 2025. Standard expense rates, extra deductions and reductions are not included.",
              ]}
              next={[
                { href: free ? "/en/comprehensive-income-tax-calculator/" : "/en/freelancer-tax-calculator/", label: free ? "Korean income tax" : "Korean freelancer 3.3% tax" },
                { href: "/en/salary-calculator/", label: "Korean take-home pay" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Detailed calculator (all options)</summary>
              <div className="mt-3">
                <KrIncomeTaxCalculator locale="en" variant={variant} />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
