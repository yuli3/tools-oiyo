// 한국 연말정산 영어판 (2026-11-20). 한국어는 KrYearEndScenario, ja·zh·fr·es는 그 나라 계산기.
// 핵심 9개 항목만 묻고, 나머지 공제는 전문가 모드 아래 전체 계산기(영어)에서 넣어요.
import { estimateWithheld, yearEndRefund, yearEndResult, type YearEndLite } from "../../../lib/kr-tax-scenarios";
import { fixedRange, type Assumption, type BridgeStep, type TornadoBar } from "../../../lib/scenario";
import { cash, cashExact, driverOf } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";
import YearEndSettlementCalculator from "../YearEndSettlementCalculator";

const KEYS = ["salary", "persons", "children", "withheld", "credit", "debit", "pension", "medical", "rent"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: YearEndLite = { salary: 50_000_000, persons: 1, children: 0, withheld: estimateWithheld(50_000_000, 1), credit: 10_000_000, debit: 5_000_000, pension: 0, medical: 0, rent: 0 };
const CUR = "KRW";
const m = (n: number) => cash(n, "en", CUR);
const x = (n: number) => cashExact(n, "en", CUR);

type MoneyKey = "salary" | "withheld" | "credit" | "debit" | "pension" | "medical" | "rent";
const money = (key: MoneyKey, label: string, plain: string, range: Assumption<YearEndLite>["range"], extra: Partial<Assumption<YearEndLite>> = {}): Assumption<YearEndLite> => ({
  key, label, plain, unit: "won", kind: "assumption",
  get: (i) => i[key], set: (i, v) => ({ ...i, [key]: Math.max(0, v) }), range, ...extra,
});
const upTo = (min: number) => (a: number): [number, number] => [0, Math.max(a * 2, min)];
const ASSUMPTIONS: Assumption<YearEndLite>[] = [
  money("salary", "Gross salary", "your yearly salary", upTo(100_000_000), { kind: "fact" }),
  money("withheld", "Tax already withheld", "tax your employer withheld", upTo(5_000_000), { kind: "fact" }),
  money("credit", "Credit card spending", "credit card spending", upTo(40_000_000)),
  money("debit", "Debit card and cash receipts", "debit card and cash spending", upTo(30_000_000)),
  money("pension", "Pension savings + IRP", "pension savings and IRP", fixedRange(0, 12_000_000), { marks: [{ at: 6_000_000, label: "6M savings" }, { at: 9_000_000, label: "9M total" }] }),
  money("medical", "Medical expenses", "medical costs", upTo(10_000_000)),
  money("rent", "Monthly rent (yearly total)", "rent paid", fixedRange(0, 12_000_000), { marks: [{ at: 10_000_000, label: "10M cap" }] }),
  { key: "persons", label: "Basic deduction persons", plain: "the number of dependants", unit: "people", kind: "assumption", get: (i) => i.persons, set: (i, v) => ({ ...i, persons: Math.max(1, Math.round(v)) }), range: fixedRange(1, 6) },
  { key: "children", label: "Children for child tax credit", plain: "children aged 8–20", unit: "people", kind: "assumption", get: (i) => i.children, set: (i, v) => ({ ...i, children: Math.max(0, Math.round(v)) }), range: fixedRange(0, 6) },
];

function refundBridge(i: YearEndLite): BridgeStep[] {
  const r = yearEndResult(i);
  const local = Math.floor((i.withheld * 0.1) / 10) * 10;
  return [
    { label: "Withheld by employer (incl. local)", value: i.withheld + local, kind: "add" },
    { label: "Tax finally owed", value: -r.totalTax, kind: "add" },
    { label: r.refund && r.refund.total < 0 ? "Extra to pay" : "Refund", value: r.refund?.total ?? 0, kind: "total" },
  ];
}

function taxBridge(i: YearEndLite): BridgeStep[] {
  const r = yearEndResult(i);
  const steps: BridgeStep[] = [{ label: "Calculated tax", value: r.calculatedTax, kind: "total" }];
  const credits: [string, number][] = [
    ["Earned income credit", r.earnedTaxCredit],
    ["Children", r.childCredit],
    ["Pension accounts", r.pensionCredit],
    ["Medical", r.medicalCredit],
    ["Rent", r.rentCredit],
    ["Insurance, education, donations", r.insuranceCredit + r.educationCredit + r.donationCredit],
    ["Standard credit", r.usedStandard ? r.standardCredit : 0],
  ];
  for (const [label, v] of credits) if (v > 0) steps.push({ label, value: -v, kind: "add" });
  steps.push({ label: "Final tax", value: r.finalTax, kind: "total" });
  return steps;
}

function summary(i: YearEndLite, top?: TornadoBar) {
  const r = yearEndResult(i);
  const t = r.refund?.total ?? 0;
  const reasons: string[] = [];
  if (r.cardDeduction > 0) reasons.push(`Card spending above 25% of salary (${m(i.salary * 0.25)}) took ${m(r.cardDeduction)} off taxable income. Above that line, debit cards count twice as much as credit cards.`);
  else reasons.push(`The card deduction starts only after spending 25% of salary (${m(i.salary * 0.25)}).`);
  if (r.pensionCredit > 0) reasons.push(`${i.salary <= 55_000_000 ? "15%" : "12%"} of what you put into pension savings and IRP comes straight off the tax (${m(r.pensionCredit)}).`);
  else reasons.push("Money put into pension savings or an IRP comes off the tax at 12–15% (up to ₩9M in total).");
  if (r.usedStandard) reasons.push("The ₩130,000 standard credit beat itemised credits such as medical and insurance, so it was used.");
  return {
    headline: t >= 0 ? `Year-end settlement gives back about ${m(t)} (estimate, incl. local income tax).` : `Year-end settlement means paying about ${m(-t)} more (estimate, incl. local income tax).`,
    driver: driverOf("en", top, t >= 0 ? "the refund" : "the extra tax", m),
    reasons,
  };
}

export default function KrYearEndEn() {
  return (
    <ScenarioTool<YearEndLite, Key>
      lang="en"
      currency={CUR}
      toolId="year-end-settlement-calculator"
      example={EXAMPLE}
      assumptions={ASSUMPTIONS}
      keys={KEYS}
      evaluate={yearEndRefund}
      resultName="refund (− means you pay)"
      questions={({ input, edit }) => [
        {
          title: "What is your yearly salary before tax?",
          keys: ["salary", "withheld"],
          body: (
            <div className="space-y-3">
              <NumberField label="Yearly salary (excluding tax-free items such as meal allowance)" value={input.salary} onChange={(v) => edit({ salary: v, withheld: estimateWithheld(v, input.persons) }, ["salary"])} suffix={CUR} step={1_000_000} />
              <NumberField label="Income tax withheld over the year (leave as is if unsure)" value={input.withheld} onChange={(v) => edit({ withheld: v }, ["withheld"])} suffix={CUR} step={100_000} />
              <p className="text-xs text-muted-foreground">Add up the income tax line on 12 payslips. If left as is, an estimate from your salary is used.</p>
            </div>
          ),
        },
        {
          title: "How many dependants, including you?",
          keys: ["persons", "children"],
          body: (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="You + family without income" value={input.persons} onChange={(v) => edit({ persons: v }, ["persons"])} suffix="people" step={1} min={1} />
              <NumberField label="Of whom children aged 8–20" value={input.children} onChange={(v) => edit({ children: v }, ["children"])} suffix="people" step={1} min={0} />
            </div>
          ),
        },
        {
          title: "How much did you spend by card in the year?",
          keys: ["credit", "debit"],
          body: (
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Credit card" value={input.credit} onChange={(v) => edit({ credit: v }, ["credit"])} suffix={CUR} step={1_000_000} />
              <NumberField label="Debit card and cash receipts" value={input.debit} onChange={(v) => edit({ debit: v }, ["debit"])} suffix={CUR} step={1_000_000} />
            </div>
          ),
        },
        {
          title: "Any pension savings, medical bills or monthly rent?",
          keys: ["pension", "medical", "rent"],
          body: (
            <div className="space-y-3">
              <NumberField label="Paid into pension savings or IRP" value={input.pension} onChange={(v) => edit({ pension: v }, ["pension"])} suffix={CUR} step={100_000} />
              <NumberField label="Hospital and pharmacy costs (minus insurance payouts)" value={input.medical} onChange={(v) => edit({ medical: v }, ["medical"])} suffix={CUR} step={100_000} />
              <NumberField label="Rent paid in the year (no home owned, salary ₩80M or less)" value={input.rent} onChange={(v) => edit({ rent: v }, ["rent"])} suffix={CUR} step={100_000} />
            </div>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="Gross salary" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} suffix={CUR} step={1_000_000} />
            <NumberField label="Prepaid income tax" value={input.withheld} onChange={(v) => edit({ withheld: v }, ["withheld"])} suffix={CUR} step={100_000} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Basic" value={input.persons} onChange={(v) => edit({ persons: v }, ["persons"])} suffix="people" step={1} min={1} />
              <NumberField label="Children" value={input.children} onChange={(v) => edit({ children: v }, ["children"])} suffix="people" step={1} min={0} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["credit", "debit", "pension", "medical", "rent"] as const).map((k) => {
              const a = ASSUMPTIONS.find((v) => v.key === k)!;
              return <NumberField key={k} label={a.label} value={input[k]} onChange={(v) => edit({ [k]: v }, [k])} suffix={CUR} step={100_000} />;
            })}
          </div>
          <p className="text-xs text-muted-foreground">Social insurance premiums are estimated from salary. Add housing, education, donations and other deductions in the full calculator below.</p>
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = yearEndResult(i);
        const t = r.refund?.total ?? 0;
        return [
          { label: t >= 0 ? "Refund" : "Extra to pay", value: s.money(Math.abs(t)), tone: "primary" },
          { label: "Tax finally owed", value: s.money(r.totalTax) },
          { label: "Total tax credits", value: s.money(r.totalCredits) },
        ];
      }}
      sliders={["credit", "debit", "pension", "medical"]}
      sweeps={["pension", "credit", "debit", "rent", "medical", "children"]}
      sweepCaption={(a) =>
        a.key === "pension"
          ? "Pension savings count up to ₩6M, and ₩9M with an IRP. Beyond that the curve goes flat."
          : a.key === "credit" || a.key === "debit"
            ? "The deduction starts on spending above 25% of salary and stops at the cap (around ₩3M)."
            : a.key === "medical"
              ? "15% of medical costs above 3% of salary comes off the tax."
              : undefined
      }
      charts={(i, s) => (
        <>
          <BridgeChart title="How the tax is worked out" steps={taxBridge(i)} format={s.money} />
          <BridgeChart title="Compared with tax already withheld" steps={refundBridge(i)} format={s.money} />
        </>
      )}
      askTitle="Good to know"
      ask={[
        "Dependants must earn ₩1M a year or less (₩5M gross if only wages). Couples who both work can claim each dependant only once.",
        "The rent credit needs a homeless head of household, a home of 85㎡ or less (or standard price ₩400M or less), and a registered address.",
        "If you have housing subscription savings, lease loan interest, education or donations, add them in the full calculator below.",
      ]}
      expertFooter={(i) => {
        const r = yearEndResult(i);
        const t = r.refund?.total ?? 0;
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `Gross salary ${x(i.salary)} − earned income deduction ${x(r.earnedDeduction)} = earned income ${x(r.earnedIncome)}`,
                `Income deductions (personal, insurance, cards ${x(r.cardDeduction)}, etc.) ${x(r.incomeDeductions)} → taxable base ${x(r.taxBase)}`,
                `Calculated tax ${x(r.calculatedTax)} − credits ${x(r.totalCredits)} = final tax ${x(r.finalTax)}, local income tax ${x(r.localTax)}`,
                `Minus prepaid ${x(i.withheld)} (+ local) → ${t >= 0 ? "refund" : "extra payment"} ${x(Math.abs(t))}`,
                r.usedStandard ? "The ₩130,000 standard credit was better than itemised special credits, so it was applied." : "Itemised special credits and rent beat the standard credit, so they were applied.",
              ]}
              next={[
                { href: "/en/salary-calculator/", label: "Korean take-home pay" },
                { href: "/en/comprehensive-income-tax-calculator/", label: "Korean income tax" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Calculate with every item (housing, education, donations, extra deductions)</summary>
              <div className="mt-3">
                <YearEndSettlementCalculator locale="en" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
