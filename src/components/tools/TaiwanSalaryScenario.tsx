// 台湾税后薪资（简单/专业·假设变化图，中文页面）(2026-11-17)。计算: lib/taiwan-salary.ts
import { TW_SALARY_ASSUMPTIONS, twAnnualNet, twSalary, twSalaryPlain, type TwSalaryLite } from "../../lib/taiwan-salary";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["gross", "people", "bonus"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<TwSalaryLite>, k: Key[]) => void;
const EXAMPLE: TwSalaryLite = { gross: 50_000, people: 1, bonus: 0 };
const nt = (n: number) => `NT$${Math.round(n).toLocaleString("zh-TW")}`;

export default function TaiwanSalaryScenario() {
  const gross = (i: TwSalaryLite, edit: Edit) => <NumberField label="税前月薪" value={i.gross} onChange={(v) => edit({ gross: v }, ["gross"])} suffix="元" step={1_000} min={0} />;
  const people = (i: TwSalaryLite, edit: Edit) => <NumberField label="免税额人数（含本人）" value={i.people} onChange={(v) => edit({ people: v }, ["people"])} suffix="人" step={1} min={1} />;
  const bonus = (i: TwSalaryLite, edit: Edit) => <NumberField label="年终奖金（几个月）" value={i.bonus} onChange={(v) => edit({ bonus: v }, ["bonus"])} suffix="个月" step={0.5} min={0} />;
  return (
    <ScenarioTool<TwSalaryLite, Key>
      lang="zh"
      currency="TWD"
      toolId="taiwan-salary-calculator"
      example={EXAMPLE}
      assumptions={TW_SALARY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={twAnnualNet}
      resultName="全年到手"
      formatResult={nt}
      questions={({ input, edit }) => [
        { title: "税前月薪是多少？", keys: ["gross"], body: gross(input, edit) },
        { title: "年终奖金大概几个月？", keys: ["bonus"], body: bonus(input, edit) },
        { title: "申报时有几个人的免税额？", keys: ["people"], body: (
          <>
            {people(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">只有自己就填1，扶养父母或子女的话加上人数。</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          {gross(input, edit)}
          {bonus(input, edit)}
          {people(input, edit)}
        </div>
      )}
      summary={twSalaryPlain}
      metrics={(i) => {
        const r = twSalary(i);
        return [
          { label: "每月到手", value: nt(r.net), tone: "primary" },
          { label: "劳健保（月）", value: nt(r.ins) },
          { label: "全年所得税", value: nt(r.tax) },
        ];
      }}
      sliders={["gross", "bonus", "people"]}
      sweepCaption={(a) => (a.key === "gross" ? "虚线是劳保投保薪资上限，超过后劳保费不再增加。" : undefined)}
      charts={(i) => {
        const r = twSalary(i);
        return (
          <>
            <BridgeChart
              title="从全年薪资到全年到手"
              steps={[
                { label: `全年薪资（${12 + i.bonus}个月）`, value: r.annualGross, kind: "total" },
                { label: "劳保", value: -r.labor * 12, kind: "add" },
                { label: "健保", value: -r.nhi * 12, kind: "add" },
                { label: "所得税", value: -r.tax, kind: "add" },
                { label: "全年到手", value: r.annualNet, kind: "total" },
              ]}
              format={nt}
            />
            <CompareBars
              title="不同月薪的每月到手"
              items={[30_000, 50_000, 80_000, 120_000].map((g) => ({ label: `月薪${nt(g)}`, value: twSalary({ ...i, gross: g }).net, current: g === i.gross }))}
              format={nt}
            />
          </>
        );
      }}
      askTitle="需要确认的事项"
      ask={["劳保、健保按投保薪资分级表计算，实际金额可能略有不同。", "有眷属加保健保、列举扣除或其他所得时，结果会不同。"]}
      expertFooter={(i) => {
        const r = twSalary(i);
        return (
          <ResultSteps
            steps={[
              `劳保 = min(${i.gross}, 45,800) × 2.5% = ${nt(r.labor)}，健保 = min(${i.gross}, 313,000) × 1.551% = ${nt(r.nhi)}`,
              `所得净额 = ${nt(r.annualGross)} − 13.6万 − 薪资特扣 − 10.1万×${i.people}，按5/12/20/30/40%累进 = ${nt(r.tax)}`,
              `全年到手 = ${nt(r.annualNet)}`,
            ]}
            next={[{ href: "/zh/china-salary-calculator/", label: "中国大陆工资" }, { href: "/zh/compound-interest-calculator/", label: "复利" }]}
          />
        );
      }}
    />
  );
}
