// 中国税后工资（简单/专业·假设变化图，中文页面）(2026-11-17)。计算: lib/china-salary.ts
import { CN_SALARY_ASSUMPTIONS, cnAnnualNet, cnSalary, cnSalaryPlain, type CnSalaryLite } from "../../lib/china-salary";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["gross", "hf", "special"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<CnSalaryLite>, k: Key[]) => void;
const EXAMPLE: CnSalaryLite = { gross: 15_000, hf: 0.07, special: 0 };
const yuan = (n: number) => `¥${Math.round(n).toLocaleString("zh-CN")}`;
const SPECIAL = [
  { value: "0", label: "没有" },
  { value: "1500", label: "住房租金 1,500" },
  { value: "2000", label: "子女教育 2,000" },
  { value: "3000", label: "赡养老人 3,000" },
  { value: "5000", label: "子女教育＋赡养老人 5,000" },
];

export default function ChinaSalaryScenario() {
  const gross = (i: CnSalaryLite, edit: Edit) => <NumberField label="税前月薪" value={i.gross} onChange={(v) => edit({ gross: v }, ["gross"])} suffix="元" step={500} min={0} />;
  const hf = (i: CnSalaryLite, edit: Edit) => <NumberField label="公积金个人比例（5%~12%）" value={Math.round(i.hf * 100)} onChange={(v) => edit({ hf: v / 100 }, ["hf"])} suffix="%" step={1} min={5} />;
  const special = (i: CnSalaryLite, edit: Edit) => (
    <div className="space-y-2">
      <ChoiceChips<string> legend="专项附加扣除（每月）" value={String(i.special)} options={SPECIAL} onChange={(v) => edit({ special: Number(v) }, ["special"])} />
      <NumberField label="直接输入（元/月）" value={i.special} onChange={(v) => edit({ special: v }, ["special"])} suffix="元" step={500} min={0} />
    </div>
  );
  return (
    <ScenarioTool<CnSalaryLite, Key>
      lang="zh"
      currency="CNY"
      toolId="china-salary-calculator"
      example={EXAMPLE}
      assumptions={CN_SALARY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={cnAnnualNet}
      resultName="年到手收入"
      formatResult={yuan}
      questions={({ input, edit }) => [
        { title: "税前月薪是多少？", keys: ["gross"], body: gross(input, edit) },
        { title: "公积金按多少比例交？", keys: ["hf"], body: (
          <>
            {hf(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">不清楚的话看工资条，上海常见7%。</p>
          </>
        ) },
        { title: "有专项附加扣除吗？", keys: ["special"], body: special(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {gross(input, edit)}
          {hf(input, edit)}
          {special(input, edit)}
        </div>
      )}
      summary={cnSalaryPlain}
      metrics={(i) => {
        const r = cnSalary(i);
        return [
          { label: "每月到手", value: yuan(r.net), tone: "primary" },
          { label: "五险一金", value: yuan(r.si) },
          { label: "个税（月）", value: yuan(r.iit) },
        ];
      }}
      sliders={["gross", "hf", "special"]}
      sweepCaption={(a) => (a.key === "gross" ? "虚线是上海社保基数的下限和上限。超过上限后，社保不再增加。" : undefined)}
      charts={(i) => {
        const r = cnSalary(i);
        return (
          <>
            <BridgeChart
              title="从税前月薪到到手"
              steps={[
                { label: "税前月薪", value: i.gross, kind: "total" },
                { label: "养老保险 8%", value: -r.pension, kind: "add" },
                { label: "医疗保险 2%", value: -r.medical, kind: "add" },
                { label: "失业保险 0.5%", value: -r.unemployment, kind: "add" },
                { label: `住房公积金 ${Math.round(i.hf * 100)}%`, value: -r.housing, kind: "add" },
                { label: "个人所得税", value: -r.iit, kind: "add" },
                { label: "到手", value: r.net, kind: "total" },
              ]}
              format={yuan}
            />
            <CompareBars
              title="不同月薪的到手收入"
              items={[8_000, 15_000, 25_000, 40_000].map((g) => ({ label: `月薪${yuan(g)}`, value: cnSalary({ ...i, gross: g }).net, current: g === i.gross }))}
              format={yuan}
            />
          </>
        );
      }}
      askTitle="需要确认的事项"
      ask={["社保基数以单位申报为准，可能与月薪不同。", "年终奖可选择单独计税或并入综合所得，结果不同。"]}
      expertFooter={(i) => {
        const r = cnSalary(i);
        return (
          <ResultSteps
            steps={[
              `社保基数 = min(max(${i.gross}, ${7546}), ${37731}) = ${yuan(r.base)}`,
              `五险一金 = ${yuan(r.pension)} + ${yuan(r.medical)} + ${yuan(r.unemployment)} + ${yuan(r.housing)} = ${yuan(r.si)}`,
              `应纳税所得额（月）= ${i.gross} − ${r.si} − 5,000 − ${i.special} = ${yuan(r.monthlyTaxable)}，年度税额 ÷ 12 = ${yuan(r.iit)}`,
              `到手 = ${yuan(r.net)}`,
            ]}
            next={[{ href: "/zh/taiwan-salary-calculator/", label: "台湾薪资" }, { href: "/zh/compound-interest-calculator/", label: "复利" }]}
          />
        );
      }}
    />
  );
}
