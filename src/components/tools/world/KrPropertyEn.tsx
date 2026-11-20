// 한국 재산세 영어판 (2026-11-20). 한국어는 KrPropertyScenario, ja·zh·fr·es는 그 나라 계산기.
import { propertyTax } from "../../../lib/kr-real-estate-tax";
import { propertyTotal, type PropertyInput } from "../../../lib/kr-tax-scenarios";
import type { Assumption, BridgeStep } from "../../../lib/scenario";
import { cash, cashExact } from "../../../lib/world-money-i18n";
import KrPropertyTaxCalculator from "../KrPropertyTaxCalculator";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["official", "oneHouse", "urban"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: PropertyInput = { official: 500_000_000, oneHouse: true, urban: true };
const CUR = "KRW";
const m = (n: number) => cash(n, "en", CUR);
const x = (n: number) => cashExact(n, "en", CUR);
const OWNER = [
  { value: "one", label: "Only home of the household" },
  { value: "multi", label: "Several homes or a company" },
] as const;
const YN = [
  { value: "y", label: "Yes" },
  { value: "n", label: "No" },
] as const;

const ASSUMPTIONS: Assumption<PropertyInput>[] = [
  {
    key: "official", label: "Official assessed value", plain: "the official assessed value", unit: "won", kind: "assumption",
    get: (i) => i.official, set: (i, v) => ({ ...i, official: Math.max(0, v) }),
    range: (a) => [0, Math.max(a * 2, 1_200_000_000)],
    marks: [{ at: 300_000_000, label: "300M" }, { at: 600_000_000, label: "600M" }, { at: 900_000_000, label: "900M" }],
  },
];

function bridge(i: PropertyInput): BridgeStep[] {
  const r = propertyTax(i.official, i.oneHouse, i.urban);
  const steps: BridgeStep[] = [{ label: "Property tax", value: r.tax, kind: "add" }];
  if (r.urban > 0) steps.push({ label: "Urban area levy", value: r.urban, kind: "add" });
  steps.push({ label: "Local education tax", value: r.education, kind: "add" });
  steps.push({ label: "Due this year", value: r.total, kind: "total" });
  return steps;
}

function summary(i: PropertyInput) {
  const r = propertyTax(i.official, i.oneHouse, i.urban);
  return {
    headline: `This year's property tax on a home assessed at ${m(i.official)} is about ${m(r.total)} (estimate).`,
    driver: null,
    reasons: [
      `Tax applies to only ${Math.round(r.ratio * 100)}% of the assessed value (fair market value ratio).`,
      r.special ? "As the household's only home assessed at ₩900M or less, the lower special rates apply." : "The one-home special rates (assessed value ₩900M or less) do not apply.",
      r.tax > 200_000 ? "Because it exceeds ₩200,000, it is split into two bills in July and September." : "At ₩200,000 or less it is billed once in July.",
    ],
  };
}

export default function KrPropertyEn() {
  return (
    <ScenarioTool<PropertyInput, Key>
      lang="en"
      currency={CUR}
      toolId="property-tax-calculator"
      example={EXAMPLE}
      assumptions={ASSUMPTIONS}
      keys={KEYS}
      evaluate={propertyTotal}
      resultName="this year's property tax"
      questions={({ input, edit }) => [
        {
          title: "What is the home's official assessed value?",
          keys: ["official"],
          body: (
            <>
              <p className="mb-3 text-sm leading-6 text-muted-foreground">
                It is the value set by the government, not the market price. You can look it up on{" "}
                <a className="underline" href="https://www.realtyprice.kr" rel="noopener" target="_blank">realtyprice.kr</a>. It is usually 60–70% of the market price.
              </p>
              <NumberField label="Official assessed value" value={input.official} onChange={(v) => edit({ official: v }, ["official"])} suffix={CUR} step={10_000_000} />
            </>
          ),
        },
        {
          title: "Is this the only home you own?",
          keys: ["oneHouse", "urban"],
          body: (
            <div className="space-y-4">
              <ChoiceChips legend="Counted per household" value={input.oneHouse ? "one" : "multi"} options={OWNER} onChange={(v) => edit({ oneHouse: v === "one" }, ["oneHouse"])} />
              <ChoiceChips legend="Is it in an urban area (most apartments are)?" value={input.urban ? "y" : "n"} options={YN} onChange={(v) => edit({ urban: v === "y" }, ["urban"])} />
            </div>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <NumberField label="Official assessed value" value={input.official} onChange={(v) => edit({ official: v }, ["official"])} suffix={CUR} step={10_000_000} />
          <ChoiceChips legend="Ownership" value={input.oneHouse ? "one" : "multi"} options={OWNER} onChange={(v) => edit({ oneHouse: v === "one" }, ["oneHouse"])} />
          <ChoiceChips legend="Urban planning area" value={input.urban ? "y" : "n"} options={YN} onChange={(v) => edit({ urban: v === "y" }, ["urban"])} />
        </div>
      )}
      summary={(i) => summary(i)}
      metrics={(i, s) => {
        const r = propertyTax(i.official, i.oneHouse, i.urban);
        return [
          { label: "Due this year", value: s.money(r.total), tone: "primary" },
          { label: "Taxable base", value: s.money(r.base) },
          { label: r.tax > 200_000 ? "Each in July and September" : "Once in July", value: s.money(r.tax > 200_000 ? Math.round(r.total / 2) : r.total) },
        ];
      }}
      sliders={["official"]}
      sweepCaption={() => "The dashed line at ₩900M is the cap for the one-home special rates. Higher values move into higher brackets, so tax rises faster."}
      charts={(i, s) => <BridgeChart title="What appears on the tax bill" steps={bridge(i)} format={s.money} />}
      askTitle="Good to know"
      ask={[
        "If total assessed values exceed ₩1.2B for one home (₩900M for several), a separate comprehensive real estate tax is billed in December.",
        "A cap limits how much the bill can rise from last year, so the actual bill may be lower.",
      ]}
      expertFooter={(i) => {
        const r = propertyTax(i.official, i.oneHouse, i.urban);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `Taxable base = assessed value ${x(i.official)} × fair market value ratio ${Math.round(r.ratio * 100)}% = ${x(r.base)}`,
                `Property tax (Local Tax Act Art. 111${r.special ? ", Art. 111-2 one-home special rates" : ""}) ${x(r.tax)}`,
                `Urban area levy ${x(r.urban)}, local education tax (20%) ${x(r.education)}`,
                "The year-on-year cap (Art. 122), reductions and the comprehensive real estate tax are not included.",
              ]}
              next={[
                { href: "/en/acquisition-tax-calculator/", label: "Korean acquisition tax" },
                { href: "/en/capital-gains-tax-calculator/", label: "Korean capital gains tax" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Detailed calculator (all options)</summary>
              <div className="mt-3">
                <KrPropertyTaxCalculator locale="en" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
