// 한국 금융소득 분리 vs 종합과세 영어판 (2026-11-20). 한국어는 KrFinIncomeScenario. 이 페이지는 ko 밖에서는 영어 본문이라 모든 외국어가 이걸 써요.
import { FINANCIAL_THRESHOLD } from "../../../lib/kr-investment-tax";
import { finExtra, finOtherBase, finResult, type FinIncomeLite } from "../../../lib/kr-pension-scenarios";
import type { Assumption, BridgeStep, TornadoBar } from "../../../lib/scenario";
import { cash, cashExact, driverOf } from "../../../lib/world-money-i18n";
import FinancialIncomeTax from "../FinancialIncomeTax";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool, { type ScenarioState } from "../viz/ScenarioTool";

const KEYS = ["fin", "mode", "gross", "persons", "base"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: FinIncomeLite = { fin: 30_000_000, mode: "salary", gross: 70_000_000, persons: 1, base: 50_000_000 };
const CUR = "KRW";
const m = (n: number) => cash(n, "en", CUR);
const x = (n: number) => cashExact(n, "en", CUR);
const withheldAll = (w: number) => w + Math.floor(w * 0.1);
const MODE = [
  { value: "salary", label: "Estimate from salary" },
  { value: "base", label: "Enter the tax base" },
] as const satisfies readonly { value: FinIncomeLite["mode"]; label: string }[];

const ASSUMPTIONS: Assumption<FinIncomeLite>[] = [
  { key: "fin", label: "Interest and dividends", plain: "interest and dividends", unit: "won", kind: "assumption", get: (i) => i.fin, set: (i, v) => ({ ...i, fin: Math.max(0, v) }), range: (a) => [0, Math.max(a * 2, 50_000_000)], marks: [{ at: FINANCIAL_THRESHOLD, label: "20M" }] },
  {
    key: "other", label: "Other income (salary or tax base)", plain: "other income", unit: "won", kind: "assumption",
    get: (i) => (i.mode === "salary" ? i.gross : i.base), set: (i, v) => (i.mode === "salary" ? { ...i, gross: Math.max(0, v) } : { ...i, base: Math.max(0, v) }),
    range: (a) => [0, Math.max(a * 2, 150_000_000)],
  },
];

function bridge(i: FinIncomeLite): BridgeStep[] {
  const r = finResult(i);
  const w = withheldAll(r.withheld);
  return [
    { label: "Already withheld 15.4%", value: w, kind: "total" },
    { label: "Extra in May", value: r.extraTotal, kind: "add" },
    { label: "Total tax on financial income", value: w + r.extraTotal, kind: "total" },
  ];
}

function summary(i: FinIncomeLite, top?: TornadoBar) {
  const r = finResult(i);
  return {
    headline: !r.comprehensive
      ? `Interest and dividends of ${m(i.fin)} are at or under ₩20M, so the 15.4% withheld by banks and brokers (about ${m(withheldAll(r.withheld))}) is final.`
      : r.extraTotal > 0
        ? `Above ₩20M it is taxed comprehensively. You would pay about ${m(r.extraTotal)} more next May.`
        : "Above ₩20M you must file for comprehensive taxation, but the tax already withheld covers it, so nothing more is due.",
    driver: driverOf("en", top, "the extra tax in May", m),
    reasons: [
      `The tax base of your other income is taken as about ${m(finOtherBase(i))}.${i.mode === "salary" ? " Insurance and card deductions would lower it, and the extra tax with it." : ""}`,
      r.comprehensive
        ? `The tax is the larger of two methods (Income Tax Act Art. 62): ① the part above ₩20M added to other income, ${x(r.method1)}; ② 14% of all financial income plus tax on other income, ${x(r.method2)}.`
        : "The ₩20M line is per person, per calendar year. Spreading payment dates before crossing it can avoid comprehensive taxation.",
      "Income inside ISA and pension accounts, and tax-free products, do not count toward ₩20M. If you become comprehensively taxed, check your health insurance dependant status too.",
    ],
  };
}

function Other({ input, edit }: Pick<ScenarioState<FinIncomeLite, Key>, "input" | "edit">) {
  return (
    <div className="space-y-3">
      <ChoiceChips<FinIncomeLite["mode"]> legend="How to enter other income" value={input.mode} options={MODE} onChange={(v) => edit({ mode: v }, ["mode"])} />
      {input.mode === "salary" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Gross salary (yearly)" value={input.gross} onChange={(v) => edit({ gross: v }, ["gross"])} suffix={CUR} step={1_000_000} />
          <NumberField label="Basic deduction persons (incl. you)" value={input.persons} onChange={(v) => edit({ persons: v }, ["persons"])} suffix="people" step={1} min={1} />
        </div>
      ) : (
        <NumberField label="Tax base of other aggregate income (from last year's return)" value={input.base} onChange={(v) => edit({ base: v }, ["base"])} suffix={CUR} step={1_000_000} />
      )}
    </div>
  );
}

export default function KrFinIncomeEn() {
  return (
    <ScenarioTool<FinIncomeLite, Key>
      lang="en"
      currency={CUR}
      toolId="separate-vs-comprehensive-tax-calculator"
      example={EXAMPLE}
      assumptions={ASSUMPTIONS}
      keys={KEYS}
      evaluate={finExtra}
      resultName="extra tax in May"
      questions={({ input, edit }) => [
        {
          title: "How much interest and dividends did you receive this year?",
          keys: ["fin"],
          body: (
            <>
              <NumberField label="Interest and dividends before tax (January to December)" value={input.fin} onChange={(v) => edit({ fin: v }, ["fin"])} suffix={CUR} step={1_000_000} />
              <p className="mt-2 text-xs text-muted-foreground">Leave out income inside ISA or pension accounts and tax-free products. Hometax shows the total under payment statements.</p>
            </>
          ),
        },
        { title: "What is your other income?", keys: ["mode", "gross", "persons", "base"], body: <Other input={input} edit={edit} /> },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <NumberField label="Financial income (interest and dividends, gross)" value={input.fin} onChange={(v) => edit({ fin: v }, ["fin"])} suffix={CUR} step={1_000_000} />
          <Other input={input} edit={edit} />
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = finResult(i);
        return [
          { label: "Extra tax in May", value: s.money(r.extraTotal), tone: "primary" },
          { label: "Already withheld", value: s.money(withheldAll(r.withheld)) },
          { label: "Tax base of other income", value: s.money(finOtherBase(i)) },
        ];
      }}
      sliders={["fin", "other"]}
      sweepCaption={(a) => (a.key === "fin" ? "Up to ₩20M (dashed line) nothing more is due. Above it, the excess is added to other income and taxed at higher rates." : "The more other income you have, the higher the bracket your financial income lands in.")}
      charts={(i, s) => <BridgeChart title="Total tax on financial income" steps={bridge(i)} format={s.money} />}
      askTitle="Good to know"
      ask={[
        "Dividend gross-up and the dividend tax credit are not included, so tax on large domestic dividends differs slightly.",
        "Tax on other income is treated as paid separately; only the increase caused by financial income is shown.",
      ]}
      expertFooter={(i) => {
        const r = finResult(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={
                r.comprehensive
                  ? [
                      `① Progressive tax on (financial ${x(i.fin)} − ₩20M + other base ${x(finOtherBase(i))}) + ₩20M × 14% = ${x(r.method1)}`,
                      `② Financial × 14% ${x(r.withheld)} + tax on other base = ${x(r.method2)}`,
                      `Calculated tax = larger ${x(r.calculated)}; extra = ${x(r.extraNational)} + local ${x(r.extraLocal)} = ${x(r.extraTotal)}`,
                    ]
                  : [`₩20M or less → 14% withholding ${x(r.withheld)} plus local tax is final (separate taxation)`]
              }
              next={[
                { href: "/en/comprehensive-income-tax-calculator/", label: "Korean income tax" },
                { href: "/en/salary-calculator/", label: "Korean take-home pay" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Both methods side by side</summary>
              <div className="mt-3">
                <FinancialIncomeTax locale="en" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
