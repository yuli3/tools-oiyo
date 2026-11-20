// 한국 퇴직금 영어판 (2026-11-20). 한국어는 KrSeveranceScenario, ja·zh·fr·es는 그 나라 퇴직금 계산기.
// 같은 엔진(severanceEstimate), 원화 그대로. 날짜로 정확히 따지는 옛 계산기는 전문가 모드 아래에 둬요.
import { fixedRange, type Assumption, type BridgeStep, type TornadoBar } from "../../../lib/scenario";
import { severanceEstimate, severanceGross, type SeveranceLite } from "../../../lib/kr-tax-scenarios";
import { cash, cashExact, driverOf } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";
import SeveranceCalculator from "../SeveranceCalculator";

const KEYS = ["monthly", "years", "bonus", "leavePay"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: SeveranceLite = { monthly: 3_000_000, years: 5, bonus: 0, leavePay: 0 };
const CUR = "KRW";
const m = (n: number) => cash(n, "en", CUR);
const x = (n: number) => cashExact(n, "en", CUR);

const ASSUMPTIONS: Assumption<SeveranceLite>[] = [
  { key: "monthly", label: "Average monthly wage (last 3 months)", plain: "your recent monthly pay", unit: "won", kind: "assumption", get: (i) => i.monthly, set: (i, v) => ({ ...i, monthly: Math.max(0, v) }), range: (a) => [0, Math.max(a * 2, 8_000_000)] },
  { key: "years", label: "Continuous service", plain: "how long you worked", unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(0, Math.round(v * 2) / 2) }), range: fixedRange(0, 30), marks: [{ at: 1, label: "1 yr" }] },
  { key: "bonus", label: "Annual bonus", plain: "your yearly bonus", unit: "won", kind: "assumption", get: (i) => i.bonus, set: (i, v) => ({ ...i, bonus: Math.max(0, v) }), range: (a) => [0, Math.max(a * 2, 20_000_000)] },
  { key: "leavePay", label: "Unused annual leave pay", plain: "your annual leave pay", unit: "won", kind: "assumption", get: (i) => i.leavePay, set: (i, v) => ({ ...i, leavePay: Math.max(0, v) }), range: (a) => [0, Math.max(a * 2, 5_000_000)] },
];

function summary(i: SeveranceLite, top?: TornadoBar) {
  const r = severanceEstimate(i);
  if (r.gross === 0) return { headline: "Severance starts after one full year of service.", driver: null, reasons: ["You must also have averaged 15 or more hours a week over four-week periods."] };
  return {
    headline: `Severance is about ${m(r.gross)} before tax, about ${m(r.net)} after tax (estimate).`,
    driver: driverOf("en", top, "severance pay", m),
    reasons: [
      "Roughly “recent monthly pay × years worked”. Bonus and leave pay add 3/12 of one year's amount.",
      "If the average daily wage is lower than the ordinary daily wage, the ordinary wage is used.",
      "Receiving it into an IRP account defers the tax; taking it later as a pension cuts the tax by 30–40%.",
    ],
  };
}
const bridge = (i: SeveranceLite): BridgeStep[] => {
  const r = severanceEstimate(i);
  return [
    { label: "Severance (before tax)", value: r.gross, kind: "total" },
    { label: "Retirement income tax + local tax", value: -r.tax, kind: "add" },
    { label: "What you receive", value: r.net, kind: "total" },
  ];
};

export default function KrSeveranceEn() {
  return (
    <ScenarioTool<SeveranceLite, Key>
      lang="en"
      currency={CUR}
      toolId="severance-calculator"
      example={EXAMPLE}
      assumptions={ASSUMPTIONS}
      keys={KEYS}
      evaluate={severanceGross}
      resultName="severance pay"
      questions={({ input, edit }) => [
        {
          title: "What was your monthly pay over the last 3 months?",
          keys: ["monthly"],
          body: (
            <>
              <NumberField label="Monthly pay before tax (incl. overtime and weekly holiday pay)" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} suffix={CUR} step={100_000} />
              <p className="mt-2 text-xs text-muted-foreground">If it varied, add the three months and divide by 3.</p>
            </>
          ),
        },
        { title: "How long did you work at this company?", keys: ["years"], body: <NumberField label="Years worked (6 months = 0.5)" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="years" step={0.5} min={0} /> },
        {
          title: "Did you receive a bonus or annual leave pay?",
          keys: ["bonus", "leavePay"],
          body: (
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Regular bonus over one year" value={input.bonus} onChange={(v) => edit({ bonus: v }, ["bonus"])} suffix={CUR} step={100_000} />
              <NumberField label="Annual leave pay over one year" value={input.leavePay} onChange={(v) => edit({ leavePay: v }, ["leavePay"])} suffix={CUR} step={100_000} />
            </div>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-4">
          {ASSUMPTIONS.map((a) => (
            <NumberField key={a.key} label={a.label} value={a.get(input)} onChange={(v) => edit(a.set(input, v), [a.key as Key])} suffix={a.key === "years" ? "years" : CUR} step={a.key === "years" ? 0.5 : 100_000} />
          ))}
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = severanceEstimate(i);
        return [
          { label: "Severance (before tax)", value: s.money(r.gross), tone: "primary" },
          { label: "After tax", value: s.money(r.net) },
          { label: "Average daily wage", value: s.money(r.daily) },
        ];
      }}
      sliders={["monthly", "years", "bonus"]}
      sweepCaption={(a) => (a.key === "years" ? "Under one year there is no severance. After that it grows almost in proportion to years worked." : undefined)}
      charts={(i, s) => <BridgeChart title="Severance after tax" steps={bridge(i)} format={s.money} />}
      askTitle="Good to know"
      ask={[
        "Periods averaging under 15 hours a week are excluded.",
        "With a DC-type retirement pension you receive the employer's contributions plus returns, which can differ from this estimate.",
        "It must be paid within 14 days of leaving. If not, you can file a petition with the Ministry of Employment and Labor (1350).",
      ]}
      expertFooter={(i) => {
        const r = severanceEstimate(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `3-month wages ≈ ${x(i.monthly)} × 3 + (bonus ${x(i.bonus)} + leave pay ${x(i.leavePay)}) × 3/12`,
                `Average daily wage ≈ 3-month wages ÷ 91 days = ${x(r.daily)} (89–92 days depending on the calendar)`,
                `Severance = ${x(r.daily)} × 30 × ${i.years} years = ${x(r.gross)} (Employee Retirement Benefit Security Act, Art. 8)`,
                `Retirement income tax (${r.serviceYears} years of service) ${x(r.tax)} → you receive ${x(r.net)}`,
                "If the ordinary wage is higher than the average wage, the ordinary wage applies. Use the exact calculator below for dates.",
              ]}
              next={[
                { href: "/en/salary-calculator/", label: "Korean take-home pay" },
                { href: "/en/annual-leave-calculator/", label: "Annual leave" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Calculate exactly by date (start date, leaving date, eligibility)</summary>
              <div className="mt-3">
                <SeveranceCalculator locale="en" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
