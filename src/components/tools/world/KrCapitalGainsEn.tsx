// 한국 양도소득세 영어판 (2026-11-20). 한국어는 KrCapitalGainsScenario, ja·zh·fr·es는 그 나라 계산기.
import { BASIC_DEDUCTION, capitalGainsTax, HIGH_PRICE_LINE, type AssetKind, type GainsInput } from "../../../lib/kr-real-estate-tax";
import { gainsTotal } from "../../../lib/kr-tax-scenarios";
import { fixedRange, type Assumption, type BridgeStep, type TornadoBar } from "../../../lib/scenario";
import { cash, cashExact, driverOf } from "../../../lib/world-money-i18n";
import KrCapitalGainsTaxCalculator from "../KrCapitalGainsTaxCalculator";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["kind", "sale", "purchase", "expenses", "holdYears", "liveYears", "houses", "exemptEligible", "regulated"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: GainsInput = { kind: "house", sale: 1_500_000_000, purchase: 800_000_000, expenses: 15_000_000, holdYears: 8, liveYears: 8, houses: 1, exemptEligible: true, regulated: true };
const CUR = "KRW";
const m = (n: number) => cash(n, "en", CUR);
const x = (n: number) => cashExact(n, "en", CUR);
const KIND = [
  { value: "house", label: "Home" },
  { value: "other", label: "Land, shop, etc." },
] as const satisfies readonly { value: AssetKind; label: string }[];
const HOUSES = [
  { value: "1", label: "1 home" },
  { value: "2", label: "2 homes" },
  { value: "3", label: "3 or more" },
] as const;
const YN = [
  { value: "y", label: "Yes" },
  { value: "n", label: "No" },
] as const;
type Edit = (patch: Partial<GainsInput>, keys: readonly Key[]) => void;

const money = (key: "sale" | "purchase" | "expenses", label: string, plain: string): Assumption<GainsInput> => ({
  key, label, plain, unit: "won", kind: "assumption",
  get: (i) => i[key], set: (i, v) => ({ ...i, [key]: Math.max(0, v) }),
  range: (a) => [0, Math.max(a * 2, 100_000_000)],
});
const years = (key: "holdYears" | "liveYears", label: string, plain: string, marks: { at: number; label: string }[]): Assumption<GainsInput> => ({
  key, label, plain, unit: "years", kind: "fact",
  get: (i) => i[key], set: (i, v) => ({ ...i, [key]: Math.max(0, Math.round(v)) }),
  range: fixedRange(0, 20), marks,
});
const ASSUMPTIONS: Assumption<GainsInput>[] = [
  { ...money("sale", "Sale price", "the sale price"), marks: [{ at: HIGH_PRICE_LINE, label: "1.2B" }] },
  money("purchase", "Purchase price", "the purchase price"),
  money("expenses", "Necessary expenses", "costs after buying"),
  years("holdYears", "Holding period", "how long you owned it", [{ at: 2, label: "2 yrs" }, { at: 3, label: "3 yrs" }, { at: 10, label: "10 yrs" }]),
  years("liveYears", "Residence period", "how long you lived there", [{ at: 2, label: "2 yrs" }, { at: 10, label: "10 yrs" }]),
];

function rateLabel(r: ReturnType<typeof capitalGainsTax>) {
  if (r.exempt) return "exempt";
  const short = /^단기 (\d+)%/.exec(r.rateLabel);
  if (short) return `short-term ${short[1]}%`;
  if (r.heavyAdd > 0) return `basic rates + ${Math.round(r.heavyAdd * 100)}pp surcharge`;
  return "basic rates 6–45%";
}

function bridge(i: GainsInput): BridgeStep[] {
  const r = capitalGainsTax(i);
  const steps: BridgeStep[] = [
    { label: "Sale price", value: i.sale, kind: "add" },
    { label: "Purchase price", value: -i.purchase, kind: "add" },
  ];
  if (i.expenses > 0) steps.push({ label: "Expenses", value: -i.expenses, kind: "add" });
  steps.push({ label: "Capital gain", value: r.gain, kind: "total" });
  if (r.exempt) {
    steps.push({ label: "One-home exemption", value: -r.gain, kind: "add" });
    steps.push({ label: "Taxable base", value: 0, kind: "total" });
    return steps;
  }
  if (r.taxableGain !== r.gain) steps.push({ label: "Share up to ₩1.2B exempt", value: r.taxableGain - r.gain, kind: "add" });
  if (r.longTerm > 0) steps.push({ label: `Long-term holding deduction ${Math.round(r.longTermRate * 100)}%`, value: -r.longTerm, kind: "add" });
  const basic = Math.min(BASIC_DEDUCTION, Math.max(0, r.taxableGain - r.longTerm));
  if (basic > 0) steps.push({ label: "Basic deduction ₩2.5M", value: -basic, kind: "add" });
  steps.push({ label: "Taxable base", value: r.base, kind: "total" });
  return steps;
}

function summary(i: GainsInput, top?: TornadoBar) {
  const r = capitalGainsTax(i);
  if (r.exempt) return { headline: "No capital gains tax: the one-home-per-household exemption applies (estimate).", driver: null, reasons: ["If the sale price is over ₩1.2B, the share above it becomes taxable."] };
  const reasons: string[] = [];
  if (r.taxableGain !== r.gain) reasons.push("As a single home, only the share of the price above ₩1.2B is taxed.");
  if (r.longTermRate > 0) reasons.push(`For the years you owned (and lived in) it, ${Math.round(r.longTermRate * 100)}% of the gain was deducted.`);
  if (r.heavyAdd > 0) reasons.push(`Selling a home in a regulated area while owning several adds ${Math.round(r.heavyAdd * 100)} percentage points and removes the long-term deduction.`);
  const short = /^단기 (\d+)%/.exec(r.rateLabel);
  if (short) reasons.push(`Sold within two years, so the short-term rate of ${short[1]}% applies.`);
  return { headline: `On a gain of ${m(r.gain)} you pay about ${m(r.total)} in capital gains tax (estimate, incl. local income tax).`, driver: driverOf("en", top, "the tax", m), reasons };
}

function HouseFields({ input, edit, plain }: { input: GainsInput; edit: Edit; plain: boolean }) {
  if (input.kind !== "house") return <p className="text-sm text-muted-foreground">For land and shops, the number of homes and the exemption do not apply.</p>;
  return (
    <div className="space-y-4">
      <ChoiceChips legend={plain ? "Including this one, how many homes does your household own?" : "Homes owned by the household, incl. this one"} value={String(input.houses) as "1" | "2" | "3"} options={HOUSES} onChange={(v) => edit({ houses: Number(v) as 1 | 2 | 3 }, ["houses"])} />
      {input.houses === 1 ? (
        <ChoiceChips
          legend={plain ? "Did you own it for over 2 years (and live there 2 years if bought in a regulated area)?" : "One-home exemption requirements (2 years owned; 2 years lived if acquired in a regulated area)"}
          value={input.exemptEligible ? "y" : "n"}
          options={YN}
          onChange={(v) => edit({ exemptEligible: v === "y" }, ["exemptEligible"])}
        />
      ) : (
        <ChoiceChips legend={plain ? "Is this home in a regulated (adjustment) area?" : "Located in an adjustment target area"} value={input.regulated ? "y" : "n"} options={YN} onChange={(v) => edit({ regulated: v === "y" }, ["regulated"])} />
      )}
    </div>
  );
}

export default function KrCapitalGainsEn() {
  return (
    <ScenarioTool<GainsInput, Key>
      lang="en"
      currency={CUR}
      toolId="capital-gains-tax-calculator"
      example={EXAMPLE}
      assumptions={ASSUMPTIONS}
      keys={KEYS}
      evaluate={gainsTotal}
      resultName="capital gains tax"
      questions={({ input, edit }) => [
        {
          title: "What are you selling, and for how much?",
          keys: ["kind", "sale"],
          body: (
            <div className="space-y-4">
              <ChoiceChips<AssetKind> legend="What you sell" value={input.kind} options={KIND} onChange={(v) => edit({ kind: v }, ["kind"])} />
              <NumberField label="Sale price" value={input.sale} onChange={(v) => edit({ sale: v }, ["sale"])} suffix={CUR} step={10_000_000} />
            </div>
          ),
        },
        {
          title: "What did you pay, and what did you spend on it since?",
          keys: ["purchase", "expenses"],
          body: (
            <div className="space-y-3">
              <NumberField label="Purchase price" value={input.purchase} onChange={(v) => edit({ purchase: v }, ["purchase"])} suffix={CUR} step={10_000_000} />
              <NumberField label="Costs after buying (acquisition tax, agent fee, extensions)" value={input.expenses} onChange={(v) => edit({ expenses: v }, ["expenses"])} suffix={CUR} step={1_000_000} />
              <p className="text-xs text-muted-foreground">Simple repairs such as wallpaper or flooring do not count. Include only major work with receipts.</p>
            </div>
          ),
        },
        {
          title: "How long did you own it, and did you live there?",
          keys: ["holdYears", "liveYears"],
          body: (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Years owned" value={input.holdYears} onChange={(v) => edit({ holdYears: v }, ["holdYears"])} suffix="years" step={1} />
              <NumberField label="Years lived there" value={input.liveYears} onChange={(v) => edit({ liveYears: v }, ["liveYears"])} suffix="years" step={1} />
            </div>
          ),
        },
        { title: "How many homes do you own?", keys: ["houses", "exemptEligible", "regulated"], body: <HouseFields input={input} edit={edit} plain /> },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <ChoiceChips<AssetKind> legend="Asset sold" value={input.kind} options={KIND} onChange={(v) => edit({ kind: v }, ["kind"])} />
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="Sale price" value={input.sale} onChange={(v) => edit({ sale: v }, ["sale"])} suffix={CUR} step={10_000_000} />
            <NumberField label="Purchase price" value={input.purchase} onChange={(v) => edit({ purchase: v }, ["purchase"])} suffix={CUR} step={10_000_000} />
            <NumberField label="Necessary expenses" value={input.expenses} onChange={(v) => edit({ expenses: v }, ["expenses"])} suffix={CUR} step={1_000_000} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Holding period" value={input.holdYears} onChange={(v) => edit({ holdYears: v }, ["holdYears"])} suffix="years" step={0.5} />
            <NumberField label="Residence period" value={input.liveYears} onChange={(v) => edit({ liveYears: v }, ["liveYears"])} suffix="years" step={0.5} />
          </div>
          <HouseFields input={input} edit={edit} plain={false} />
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = capitalGainsTax(i);
        return [
          { label: "Tax to pay (incl. local)", value: s.money(r.total), tone: "primary" },
          { label: "Capital gain", value: s.money(r.gain) },
          { label: "What you keep", value: s.money(i.sale - r.total) },
        ];
      }}
      sliders={["sale", "purchase", "holdYears", "liveYears"]}
      sweeps={["sale", "holdYears", "liveYears", "purchase"]}
      sweepCaption={(a) =>
        a.key === "sale"
          ? "The dashed ₩1.2B line is the one-home exemption limit. Only the share above it is taxed."
          : a.key === "holdYears"
            ? "Sell within 2 years and short-term rates apply. The long-term deduction starts at 3 years and peaks at 10 (one home) or 15 years."
            : a.key === "liveYears"
              ? "A single home needs over 2 years of residence for the residence deduction (4% a year)."
              : undefined
      }
      charts={(i, s) => <BridgeChart title="From gain to taxable base" steps={bridge(i)} format={s.money} />}
      askTitle="Good to know"
      ask={[
        "Temporary second homes, inherited homes and long-term rental homes may be excluded from your home count.",
        "If the purchase price is unknown, a converted acquisition price is used and expenses are calculated differently.",
        "The sale date is the earlier of the final payment or registration date, which can change the holding period.",
      ]}
      expertFooter={(i) => {
        const r = capitalGainsTax(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={
                r.exempt
                  ? [`Capital gain ${x(r.gain)}`, "One-home-per-household exemption (Income Tax Act Art. 89(1)3, sale price ₩1.2B or less)"]
                  : [
                      `Gain = ${x(i.sale)} − ${x(i.purchase)} − ${x(i.expenses)} = ${x(r.gain)}`,
                      ...(r.taxableGain !== r.gain ? [`Taxable gain for a high-priced home (Enforcement Decree Art. 160) ${x(r.taxableGain)}`] : []),
                      `Long-term holding deduction (Art. 95(2)) ${Math.round(r.longTermRate * 100)}% = ${x(r.longTerm)}`,
                      `Taxable base (after ₩2.5M basic deduction) ${x(r.base)}`,
                      `Rate: ${rateLabel(r)} → capital gains tax ${x(r.tax)}, local income tax ${x(r.local)}`,
                      "Reductions (e.g. 8-year self-farmed land), non-business land surcharges and carry-over taxation are not included.",
                    ]
              }
              next={[
                { href: "/en/acquisition-tax-calculator/", label: "Korean acquisition tax" },
                { href: "/en/property-tax-calculator/", label: "Korean property tax" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Detailed calculator (all options)</summary>
              <div className="mt-3">
                <KrCapitalGainsTaxCalculator locale="en" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
