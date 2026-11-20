// 한국 연금 최적화(노후 월 소득) 영어판 (2026-11-20). 한국어는 KrPensionPlanScenario, ja·zh·fr·es는 그 나라 계산기.
import { pensionPlanMonthly, pensionPlanResult, type PensionPlanLite } from "../../../lib/kr-pension-scenarios";
import { fixedRange, type Assumption, type BridgeStep, type TornadoBar } from "../../../lib/scenario";
import { cash, cashExact, driverOf } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import PensionOptimizerCalculator from "../PensionOptimizerCalculator";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["age", "retireAge", "lifeAge", "balance", "savingsMonthly", "irpMonthly", "income", "national", "ret"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: PensionPlanLite = { age: 35, retireAge: 65, lifeAge: 85, balance: 10_000_000, savingsMonthly: 400_000, irpMonthly: 200_000, income: 50_000_000, national: 1_000_000, ret: 0.05 };
const CUR = "KRW";
const m = (n: number) => cash(n, "en", CUR);
const x = (n: number) => cashExact(n, "en", CUR);
const pct = (r: number) => `${(r * 100).toFixed(1).replace(/\.0$/, "")}%`;
const pctField = (v: number) => Number((v * 100).toFixed(2));

const ASSUMPTIONS: Assumption<PensionPlanLite>[] = [
  { key: "irpMonthly", label: "IRP per month", plain: "your monthly IRP", unit: "won", kind: "assumption", get: (i) => i.irpMonthly, set: (i, v) => ({ ...i, irpMonthly: Math.max(0, v) }), range: () => [0, 1_500_000], marks: [{ at: 250_000, label: "credit cap" }] },
  { key: "savingsMonthly", label: "Pension savings per month", plain: "your monthly pension savings", unit: "won", kind: "assumption", get: (i) => i.savingsMonthly, set: (i, v) => ({ ...i, savingsMonthly: Math.max(0, v) }), range: () => [0, 1_500_000], marks: [{ at: 500_000, label: "6M/yr" }] },
  { key: "ret", label: "Expected yearly return", plain: "the return", unit: "rate", kind: "assumption", get: (i) => i.ret, set: (i, v) => ({ ...i, ret: v }), range: fixedRange(0, 0.1) },
  { key: "retireAge", label: "Age payouts start", plain: "the starting age", unit: "age", kind: "assumption", get: (i) => i.retireAge, set: (i, v) => ({ ...i, retireAge: Math.max(i.age, Math.max(55, Math.round(v))) }), range: fixedRange(55, 75) },
  { key: "lifeAge", label: "Life expectancy", plain: "how long you draw it", unit: "age", kind: "assumption", get: (i) => i.lifeAge, set: (i, v) => ({ ...i, lifeAge: Math.max(i.retireAge + 1, Math.round(v)) }), range: fixedRange(70, 100) },
  { key: "age", label: "Current age", plain: "your age", unit: "age", kind: "fact", get: (i) => i.age, set: (i, v) => ({ ...i, age: Math.min(i.retireAge, Math.max(19, Math.round(v))) }), range: fixedRange(20, 64) },
];

function bridge(i: PensionPlanLite): BridgeStep[] {
  const r = pensionPlanResult(i);
  return [
    { label: "National pension", value: Math.max(0, i.national), kind: "add" },
    { label: "From pension accounts", value: r.fromAccount, kind: "add" },
    { label: "Monthly retirement income", value: r.monthly, kind: "total" },
  ];
}

function summary(i: PensionPlanLite, top?: TornadoBar) {
  const r = pensionPlanResult(i);
  return {
    headline: `From age ${i.retireAge} to ${i.lifeAge} you would receive about ${m(r.monthly)} a month (incl. national pension).`,
    driver: driverOf("en", top, "monthly retirement income", m),
    reasons: [
      `Growing ${r.years} years at ${pct(i.ret)} a year, your pension accounts reach about ${m(r.asset)}. You put in about ${m(r.paid)}.`,
      `This year's tax credit is about ${m(r.credit.refund)}.${r.credit.room > 0 ? ` ${m(r.credit.room)} of room is left; filling it returns about ${m(Math.floor(r.credit.room * r.credit.rate))} more.` : " You have used the full ₩9M cap."}`,
      "Returns during payout and pension income tax (3.3–5.5%) are left out; the balance is simply divided. Private pensions over ₩15M a year must choose 16.5% separate or aggregate taxation.",
    ],
  };
}

export default function KrPensionPlanEn() {
  return (
    <ScenarioTool<PensionPlanLite, Key>
      lang="en"
      currency={CUR}
      toolId="pension-optimizer-calculator"
      example={EXAMPLE}
      assumptions={ASSUMPTIONS}
      keys={KEYS}
      evaluate={pensionPlanMonthly}
      resultName="monthly retirement income"
      questions={({ input, edit }) => [
        {
          title: "How old are you, and when will you start drawing the pension?",
          keys: ["age", "retireAge", "lifeAge"],
          body: (
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberField label="Current age" value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="yrs" step={1} min={19} />
              <NumberField label="Start age (55 or older)" value={input.retireAge} onChange={(v) => edit({ retireAge: v }, ["retireAge"])} suffix="yrs" step={1} min={55} />
              <NumberField label="Draw until age" value={input.lifeAge} onChange={(v) => edit({ lifeAge: v }, ["lifeAge"])} suffix="yrs" step={1} min={60} />
            </div>
          ),
        },
        {
          title: "How much do you put into pension accounts each month?",
          keys: ["savingsMonthly", "irpMonthly", "balance"],
          body: (
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Pension savings (monthly)" value={input.savingsMonthly} onChange={(v) => edit({ savingsMonthly: v }, ["savingsMonthly"])} suffix={CUR} step={50_000} />
              <NumberField label="IRP (monthly)" value={input.irpMonthly} onChange={(v) => edit({ irpMonthly: v }, ["irpMonthly"])} suffix={CUR} step={50_000} />
              <NumberField label="Balance so far (both accounts)" value={input.balance} onChange={(v) => edit({ balance: v }, ["balance"])} suffix={CUR} step={1_000_000} />
            </div>
          ),
        },
        {
          title: "Your salary and expected national pension?",
          keys: ["income", "national"],
          body: (
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Gross salary (yearly)" value={input.income} onChange={(v) => edit({ income: v }, ["income"])} suffix={CUR} step={1_000_000} />
              <NumberField label="Expected national pension per month (see the NPS website)" value={input.national} onChange={(v) => edit({ national: v }, ["national"])} suffix={CUR} step={50_000} />
            </div>
          ),
        },
        {
          title: "What yearly return do you expect?",
          keys: ["ret"],
          body: (
            <>
              <NumberField label="Expected yearly return" value={pctField(input.ret)} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.5} />
              <p className="mt-2 text-xs text-muted-foreground">If unsure, keep the 5% example. Try 3% for mostly deposits, 6–7% for mostly equity ETFs.</p>
            </>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="Current age" value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="yrs" step={1} min={19} />
          <NumberField label="Start age" value={input.retireAge} onChange={(v) => edit({ retireAge: v }, ["retireAge"])} suffix="yrs" step={1} min={55} />
          <NumberField label="Life expectancy" value={input.lifeAge} onChange={(v) => edit({ lifeAge: v }, ["lifeAge"])} suffix="yrs" step={1} min={60} />
          <NumberField label="Pension savings / month" value={input.savingsMonthly} onChange={(v) => edit({ savingsMonthly: v }, ["savingsMonthly"])} suffix={CUR} step={50_000} />
          <NumberField label="IRP / month" value={input.irpMonthly} onChange={(v) => edit({ irpMonthly: v }, ["irpMonthly"])} suffix={CUR} step={50_000} />
          <NumberField label="Current balance" value={input.balance} onChange={(v) => edit({ balance: v }, ["balance"])} suffix={CUR} step={1_000_000} />
          <NumberField label="Gross salary" value={input.income} onChange={(v) => edit({ income: v }, ["income"])} suffix={CUR} step={1_000_000} />
          <NumberField label="National pension / month" value={input.national} onChange={(v) => edit({ national: v }, ["national"])} suffix={CUR} step={50_000} />
          <NumberField label="Yearly return" value={pctField(input.ret)} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.1} />
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = pensionPlanResult(i);
        return [
          { label: "Monthly retirement income", value: s.money(r.monthly), tone: "primary" },
          { label: `Pension accounts at ${i.retireAge}`, value: s.money(r.asset) },
          { label: "This year's tax credit", value: s.money(r.credit.refund) },
        ];
      }}
      sliders={["irpMonthly", "ret", "retireAge", "lifeAge"]}
      sweepCaption={(a) => (a.key === "retireAge" ? "Starting later means more years of growth and fewer years of payouts, so monthly income rises quickly." : a.key === "ret" ? "A 1-point difference in return changes the account a lot after 30 years." : undefined)}
      charts={(i, s) => <BridgeChart title="Monthly retirement income" steps={bridge(i)} format={s.money} />}
      askTitle="Good to know"
      ask={[
        "The national pension is added at today's estimate, without inflation.",
        "Account money is divided evenly with no returns during payout, before pension income tax.",
      ]}
      expertFooter={(i) => {
        const r = pensionPlanResult(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `Saving ${r.years} years: ${x(i.balance)} × (1 + ${pct(i.ret)})^${r.years} + ${x((i.savingsMonthly + i.irpMonthly) * 12)} a year = ${x(r.asset)}`,
                `Payout ${r.months} months: ${x(r.asset)} ÷ ${r.months} = ${x(r.fromAccount)} a month`,
                `Monthly income = national pension ${x(i.national)} + ${x(r.fromAccount)} = ${x(r.monthly)}`,
                `Tax credit: counted ${x(r.credit.base)} × ${pct(r.credit.rate)} = ${x(r.credit.refund)}`,
              ]}
              next={[
                { href: "/en/pension-tax-calculator/", label: "Korean pension tax credit" },
                { href: "/en/year-end-settlement-calculator/", label: "Korean year-end settlement" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Detailed planner (all options)</summary>
              <div className="mt-3">
                <PensionOptimizerCalculator locale="en" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
