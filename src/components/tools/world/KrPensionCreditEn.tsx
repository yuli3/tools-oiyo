// 한국 연금저축·IRP 세액공제 영어판 (2026-11-20). 한국어는 KrPensionCreditScenario, ja·zh·fr·es는 그 나라 계산기.
import { PENSION, pensionCreditOf, pensionRefund, type PensionCreditLite } from "../../../lib/kr-pension-scenarios";
import type { Assumption, BridgeStep, TornadoBar } from "../../../lib/scenario";
import { cash, cashExact, driverOf } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import PensionTaxCalculator from "../PensionTaxCalculator";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["type", "income", "savings", "irp"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: PensionCreditLite = { type: "earned", income: 50_000_000, savings: 6_000_000, irp: 1_000_000 };
const CUR = "KRW";
const m = (n: number) => cash(n, "en", CUR);
const x = (n: number) => cashExact(n, "en", CUR);
const pct = (r: number) => `${(r * 100).toFixed(1).replace(/\.0$/, "")}%`;
const TYPE = [
  { value: "earned", label: "Employee (gross salary)" },
  { value: "comprehensive", label: "Business or freelance (aggregate income)" },
] as const satisfies readonly { value: PensionCreditLite["type"]; label: string }[];

const won = (key: "savings" | "irp" | "income", label: string, plain: string, range: (a: number) => [number, number], marks?: { at: number; label: string }[]): Assumption<PensionCreditLite> => ({
  key, label, plain, unit: "won", kind: "assumption",
  get: (i) => i[key], set: (i, v) => ({ ...i, [key]: Math.max(0, v) }), range, ...(marks ? { marks } : {}),
});
const ASSUMPTIONS: Assumption<PensionCreditLite>[] = [
  won("savings", "Pension savings contributions", "pension savings for the year", () => [0, 12_000_000], [{ at: PENSION.savingsCap, label: "6M" }]),
  won("irp", "IRP contributions", "IRP for the year", () => [0, 12_000_000], [{ at: PENSION.totalCap, label: "9M" }]),
  won("income", "Gross salary (aggregate income)", "your income", (a) => [0, Math.max(a * 2, 100_000_000)]),
];
const marks = (i: PensionCreditLite) => [{ at: i.type === "earned" ? PENSION.earnedLine : PENSION.compLine, label: "16.5%↔13.2%" }];

function bridge(i: PensionCreditLite): BridgeStep[] {
  const r = pensionCreditOf(i);
  return [
    { label: "Pension savings counted", value: r.savingsCounted, kind: "add" },
    { label: "IRP counted", value: r.irpCounted, kind: "add" },
    { label: "Eligible amount", value: r.base, kind: "total" },
  ];
}

function summary(i: PensionCreditLite, top?: TornadoBar) {
  const r = pensionCreditOf(i);
  const over = Math.max(0, i.savings - PENSION.savingsCap) + Math.max(0, r.savingsCounted + i.irp - PENSION.totalCap);
  return {
    headline: `You should get about ${m(r.refund)} back at year-end settlement or the May filing (credit rate ${pct(r.rate)}).`,
    driver: driverOf("en", top, "the refund", m),
    reasons: [
      `${i.type === "earned" ? "Gross salary up to ₩55M" : "Aggregate income up to ₩45M"} gets 16.5%, above that 13.2%. Right now ${pct(r.rate)} applies.`,
      r.room > 0
        ? `${m(r.room)} of room is left under the ₩9M cap. Putting that into an IRP returns about ${m(Math.floor(r.room * r.rate))} more.`
        : `You have used the full ₩9M cap.${over > 0 ? ` The ${m(over)} above it earns no credit this year, but your provider can roll it into next year's contributions.` : ""}`,
      "Pension savings alone count up to ₩6M. The remaining ₩3M must go into an IRP.",
      "You cannot get back more than the tax you owe, so a low tax bill means a smaller refund.",
    ],
  };
}

export default function KrPensionCreditEn() {
  return (
    <ScenarioTool<PensionCreditLite, Key>
      lang="en"
      currency={CUR}
      toolId="pension-tax-calculator"
      example={EXAMPLE}
      assumptions={ASSUMPTIONS}
      keys={KEYS}
      evaluate={pensionRefund}
      resultName="the refund"
      marksFor={(key, i) => (key === "income" ? marks(i) : undefined)}
      questions={({ input, edit }) => [
        {
          title: "How do you earn your income?",
          keys: ["type", "income"],
          body: (
            <div className="space-y-3">
              <ChoiceChips<PensionCreditLite["type"]> legend="Income type" value={input.type} options={TYPE} onChange={(v) => edit({ type: v }, ["type"])} />
              <NumberField label={input.type === "earned" ? "Gross salary for the year (excluding tax-free pay)" : "Aggregate income (after expenses)"} value={input.income} onChange={(v) => edit({ income: v }, ["income"])} suffix={CUR} step={1_000_000} />
            </div>
          ),
        },
        {
          title: "How much did (or will) you put into pension accounts this year?",
          keys: ["savings", "irp"],
          body: (
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Pension savings (yearly total; ₩500k a month = ₩6M)" value={input.savings} onChange={(v) => edit({ savings: v }, ["savings"])} suffix={CUR} step={100_000} />
              <NumberField label="IRP (yearly total, excluding employer contributions)" value={input.irp} onChange={(v) => edit({ irp: v }, ["irp"])} suffix={CUR} step={100_000} />
            </div>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <ChoiceChips<PensionCreditLite["type"]> legend="Income type" value={input.type} options={TYPE} onChange={(v) => edit({ type: v }, ["type"])} />
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label={input.type === "earned" ? "Gross salary" : "Aggregate income"} value={input.income} onChange={(v) => edit({ income: v }, ["income"])} suffix={CUR} step={1_000_000} />
            <NumberField label="Pension savings" value={input.savings} onChange={(v) => edit({ savings: v }, ["savings"])} suffix={CUR} step={100_000} />
            <NumberField label="IRP (own contributions)" value={input.irp} onChange={(v) => edit({ irp: v }, ["irp"])} suffix={CUR} step={100_000} />
          </div>
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = pensionCreditOf(i);
        return [
          { label: "Refund", value: s.money(r.refund), tone: "primary" },
          { label: "Credit rate", value: pct(r.rate) },
          { label: "Room left under the cap", value: s.money(r.room) },
        ];
      }}
      sliders={["irp", "savings", "income"]}
      sweepCaption={(a) => (a.key === "income" ? "Crossing the dashed line by even ₩1 drops the rate from 16.5% to 13.2%." : "Past the dashed cap, putting in more does not raise the refund.")}
      charts={(i, s) => <BridgeChart title="How the eligible amount is set" caption="Pension savings count up to ₩6M, and up to ₩9M together with an IRP." steps={bridge(i)} format={s.money} />}
      askTitle="Good to know"
      ask={[
        "If the tax you owe is less than the credit, you only get that much back.",
        "Employer-paid retirement pension contributions (DB or DC employer share) do not qualify.",
      ]}
      expertFooter={(i) => {
        const r = pensionCreditOf(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `Pension savings counted = min(${x(i.savings)}, ₩6M) = ${x(r.savingsCounted)}`,
                `Total counted = min(${x(r.savingsCounted)} + IRP ${x(i.irp)}, ₩9M) = ${x(r.base)}`,
                `Tax credit = ${x(r.base)} × ${pct(r.rate)} (incl. local tax) = ${x(r.refund)} (Income Tax Act Art. 59-3)`,
              ]}
              next={[
                { href: "/en/pension-optimizer-calculator/", label: "Korean pension planner" },
                { href: "/en/year-end-settlement-calculator/", label: "Korean year-end settlement" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Detailed calculator (withdrawal tax and more)</summary>
              <div className="mt-3">
                <PensionTaxCalculator locale="en" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
