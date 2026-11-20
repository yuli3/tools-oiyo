// 한국 취득세 영어판 (2026-11-20). 한국어는 KrAcquisitionScenario, ja·zh·fr·es는 그 나라 계산기.
// 같은 엔진(acquisitionTax), 원화 그대로. 옛 계산기는 전문가 모드 아래에 둬요.
import { acquisitionTax, type AcquisitionInput, type HouseCount } from "../../../lib/kr-real-estate-tax";
import { acquisitionTotal } from "../../../lib/kr-tax-scenarios";
import type { Assumption, BridgeStep } from "../../../lib/scenario";
import { cash, cashExact } from "../../../lib/world-money-i18n";
import KrAcquisitionTaxCalculator from "../KrAcquisitionTaxCalculator";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["price", "houses", "regulated", "temporaryTwo", "over85"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: AcquisitionInput = { price: 700_000_000, houses: 1, regulated: false, temporaryTwo: false, over85: false };
const CUR = "KRW";
const m = (n: number) => cash(n, "en", CUR);
const x = (n: number) => cashExact(n, "en", CUR);
const HOUSES = [
  { value: "1", label: "1 home" },
  { value: "2", label: "2 homes" },
  { value: "3", label: "3 homes" },
  { value: "4", label: "4 or more" },
] as const;
const YN = [
  { value: "y", label: "Yes" },
  { value: "n", label: "No" },
] as const;
type Edit = (patch: Partial<AcquisitionInput>, keys: readonly Key[]) => void;

const ASSUMPTIONS: Assumption<AcquisitionInput>[] = [
  {
    key: "price", label: "Purchase price", plain: "the home price", unit: "won", kind: "assumption",
    get: (i) => i.price, set: (i, v) => ({ ...i, price: Math.max(0, v) }),
    range: (a) => [0, Math.max(a * 2, 1_500_000_000)],
    marks: [{ at: 600_000_000, label: "600M" }, { at: 900_000_000, label: "900M" }],
  },
];

function bridge(i: AcquisitionInput): BridgeStep[] {
  const r = acquisitionTax(i);
  const steps: BridgeStep[] = [
    { label: `Acquisition tax ${(r.rate * 100).toFixed(2)}%`, value: r.tax, kind: "add" },
    { label: "Local education tax", value: r.education, kind: "add" },
  ];
  if (r.rural > 0) steps.push({ label: "Special rural tax", value: r.rural, kind: "add" });
  steps.push({ label: "Total to pay", value: r.total, kind: "total" });
  return steps;
}

function summary(i: AcquisitionInput) {
  const r = acquisitionTax(i);
  const reasons: string[] = [];
  if (r.heavy) reasons.push(`Because the household will own several homes, the rate rises to ${(r.rate * 100).toFixed(0)}% (multi-home surcharge).`);
  else if (i.price > 600_000_000 && i.price <= 900_000_000) reasons.push("Between ₩600M and ₩900M the rate climbs gradually from 1% to 3% as the price rises.");
  else reasons.push(`A ${(r.rate * 100).toFixed(0)}% rate applies for this price band (1% up to ₩600M, 3% above ₩900M).`);
  if (r.rural === 0 && !i.over85) reasons.push("Homes of 85㎡ or less of exclusive area pay no special rural tax.");
  return { headline: `Buying a ${m(i.price)} home costs about ${m(r.total)} in acquisition tax and surtaxes (estimate).`, driver: null, reasons };
}

function HouseFields({ input, edit, plain }: { input: AcquisitionInput; edit: Edit; plain: boolean }) {
  return (
    <div className="space-y-4">
      <ChoiceChips legend={plain ? "After this purchase, how many homes will your household own?" : "Homes owned by the household after purchase"} value={String(input.houses) as "1" | "2" | "3" | "4"} options={HOUSES} onChange={(v) => edit({ houses: Number(v) as HouseCount }, ["houses"])} />
      {input.houses > 1 && (
        <ChoiceChips legend={plain ? "Is this home in a regulated (adjustment) area?" : "Located in an adjustment target area"} value={input.regulated ? "y" : "n"} options={YN} onChange={(v) => edit({ regulated: v === "y" }, ["regulated"])} />
      )}
      {input.houses === 2 && input.regulated && (
        <ChoiceChips legend={plain ? "Will you sell the old home within the allowed period? (temporary two homes)" : "Temporary two-home owner"} value={input.temporaryTwo ? "y" : "n"} options={YN} onChange={(v) => edit({ temporaryTwo: v === "y" }, ["temporaryTwo"])} />
      )}
    </div>
  );
}

export default function KrAcquisitionEn() {
  return (
    <ScenarioTool<AcquisitionInput, Key>
      lang="en"
      currency={CUR}
      toolId="acquisition-tax-calculator"
      example={EXAMPLE}
      assumptions={ASSUMPTIONS}
      keys={KEYS}
      evaluate={acquisitionTotal}
      resultName="acquisition tax"
      questions={({ input, edit }) => [
        { title: "How much is the home you are buying?", keys: ["price"], body: <NumberField label="Price on the contract" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} suffix={CUR} step={10_000_000} /> },
        { title: "How many homes will you own?", keys: ["houses", "regulated", "temporaryTwo"], body: <HouseFields input={input} edit={edit} plain /> },
        {
          title: "Is the exclusive floor area over 85㎡ (about 915 sq ft)?",
          keys: ["over85"],
          body: <ChoiceChips legend="A typical “34-pyeong” apartment is 85㎡ or less" value={input.over85 ? "y" : "n"} options={YN} onChange={(v) => edit({ over85: v === "y" }, ["over85"])} />,
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <NumberField label="Acquisition price" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} suffix={CUR} step={10_000_000} />
          <HouseFields input={input} edit={edit} plain={false} />
          <ChoiceChips legend="Exclusive area over 85㎡" value={input.over85 ? "y" : "n"} options={YN} onChange={(v) => edit({ over85: v === "y" }, ["over85"])} />
        </div>
      )}
      summary={(i) => summary(i)}
      metrics={(i, s) => {
        const r = acquisitionTax(i);
        return [
          { label: "Total to pay", value: s.money(r.total), tone: "primary" },
          { label: "Acquisition tax rate", value: `${(r.rate * 100).toFixed(2)}%` },
          { label: "Share of price", value: i.price > 0 ? `${((r.total / i.price) * 100).toFixed(2)}%` : "—" },
        ];
      }}
      sliders={["price"]}
      sweepCaption={() => "1% up to ₩600M and 3% above ₩900M, rising gradually in between. With a multi-home surcharge it stays flat at 8% or 12%."}
      charts={(i, s) => <BridgeChart title="Acquisition tax adds up three parts" steps={bridge(i)} format={s.money} />}
      askTitle="Good to know"
      ask={[
        "First-time home buyers can get up to ₩2M off.",
        "Pre-sale rights, move-in rights and officetels can count toward your number of homes.",
        "You must file and pay within 60 days of the final payment.",
      ]}
      expertFooter={(i) => {
        const r = acquisitionTax(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `Rate ${(r.rate * 100).toFixed(2)}%${r.heavy ? " (Local Tax Act Art. 13-2 surcharge)" : " (Art. 11(1)8; formula between ₩600M and ₩900M)"} → acquisition tax ${x(r.tax)}`,
                `Local education tax ${x(r.education)}${r.heavy ? " (0.4%)" : " (10% of acquisition tax)"}`,
                `Special rural tax ${x(r.rural)}${i.over85 ? "" : " (none at 85㎡ or less)"}`,
                "First-home relief, corporate surcharges and acquisition by gift (12%) are not included.",
              ]}
              next={[
                { href: "/en/property-tax-calculator/", label: "Korean property tax" },
                { href: "/en/capital-gains-tax-calculator/", label: "Korean capital gains tax" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Detailed calculator (all options)</summary>
              <div className="mt-3">
                <KrAcquisitionTaxCalculator locale="en" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
