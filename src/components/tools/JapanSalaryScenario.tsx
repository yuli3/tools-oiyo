// 日本の給与手取り（かんたん/専門家・仮定の変化グラフ、日本語ページ）(2026-11-17)。計算: lib/japan-salary.ts
import { JP_SALARY_ASSUMPTIONS, jpAnnualNet, jpSalary, jpSalaryPlain, type JpSalaryLite } from "../../lib/japan-salary";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["salary", "age40", "health"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<JpSalaryLite>, k: Key[]) => void;
const EXAMPLE: JpSalaryLite = { salary: 5_000_000, age40: false, health: 0.0985 };
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;
const man = (n: number) => `${(Math.round(n / 1000) / 10).toLocaleString("ja-JP")}万円`;

export default function JapanSalaryScenario() {
  const salary = (i: JpSalaryLite, edit: Edit) => (
    <NumberField label="年収（額面・賞与込み）" value={i.salary} onChange={(v) => edit({ salary: v }, ["salary"])} suffix="円" step={100_000} min={0} />
  );
  const age = (i: JpSalaryLite, edit: Edit) => (
    <ChoiceChips<"y" | "n"> legend="年齢" value={i.age40 ? "y" : "n"} options={[{ value: "n", label: "40歳未満" }, { value: "y", label: "40歳以上（介護保険あり）" }]} onChange={(v) => edit({ age40: v === "y" }, ["age40"])} />
  );
  const health = (i: JpSalaryLite, edit: Edit) => (
    <NumberField label="健康保険料率（労使合計、%）" value={Math.round(i.health * 10000) / 100} onChange={(v) => edit({ health: v / 100 }, ["health"])} suffix="%" step={0.01} min={0} />
  );
  return (
    <ScenarioTool<JpSalaryLite, Key>
      lang="ja"
      currency="JPY"
      toolId="japan-salary-calculator"
      example={EXAMPLE}
      assumptions={JP_SALARY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={jpAnnualNet}
      resultName="年間手取り"
      formatResult={man}
      questions={({ input, edit }) => [
        { title: "年収はいくらですか？", keys: ["salary"], body: salary(input, edit) },
        { title: "年齢を教えてください", keys: ["age40"], body: age(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {salary(input, edit)}
          {age(input, edit)}
          {health(input, edit)}
          <p className="text-xs text-muted-foreground">協会けんぽの健康保険料率は都道府県で違います（東京9.85%）。</p>
        </div>
      )}
      summary={jpSalaryPlain}
      metrics={(i) => {
        const r = jpSalary(i);
        return [
          { label: "月の手取り", value: yen(r.net), tone: "primary" },
          { label: "月額総支給", value: yen(r.gross) },
          { label: "年間手取り", value: man(r.annualNet) },
        ];
      }}
      sliders={["salary", "health"]}
      sweepCaption={(a) => (a.key === "salary" ? "年収が上がるほど所得税の税率が段階的に上がり、手取りの割合は下がります。" : undefined)}
      charts={(i) => {
        const r = jpSalary(i);
        return (
          <>
            <BridgeChart
              title="月額総支給から手取りまで"
              steps={[
                { label: "月額総支給", value: r.gross, kind: "total" },
                { label: "厚生年金", value: -r.pension, kind: "add" },
                { label: "健康保険＋子ども支援金", value: -(r.healthIns + r.child), kind: "add" },
                ...(i.age40 ? [{ label: "介護保険", value: -r.care, kind: "add" as const }] : []),
                { label: "雇用保険", value: -r.employment, kind: "add" },
                { label: "所得税", value: -r.itaxM, kind: "add" },
                { label: "住民税", value: -r.rtaxM, kind: "add" },
                { label: "手取り", value: r.net, kind: "total" },
              ]}
              format={yen}
            />
            <CompareBars
              title="年収別の月の手取り"
              items={[3_000_000, 5_000_000, 7_000_000, 10_000_000].map((s) => ({ label: `年収${man(s)}`, value: jpSalary({ ...i, salary: s }).net, current: s === i.salary }))}
              format={yen}
            />
          </>
        );
      }}
      askTitle="確認しておくこと"
      ask={["扶養家族・生命保険料控除・iDeCo・ふるさと納税などは入れていません。入れると所得税・住民税が下がります。", "実際の標準報酬月額は4〜6月の給与で決まるため、残業が多い月は保険料が変わります。"]}
      expertFooter={(i) => {
        const r = jpSalary(i);
        return (
          <ResultSteps
            steps={[
              `社会保険料（月）= 健康保険${yen(r.healthIns)} + 子ども支援金${yen(r.child)} + 介護${yen(r.care)} + 厚生年金${yen(r.pension)} + 雇用保険${yen(r.employment)} = ${yen(r.socialMonthly)}`,
              `課税所得 = 給与所得 − 社会保険料 − 基礎控除 = ${yen(r.taxable)}、所得税（月）${yen(r.itaxM)}`,
              `住民税（月）${yen(r.rtaxM)}（所得割10% + 均等割5,000円/年）`,
              `手取り = ${yen(r.gross)} − 控除合計 = ${yen(r.net)}`,
            ]}
            next={[{ href: "/ja/salary-negotiation-calculator/", label: "年収交渉" }, { href: "/ja/compound-interest-calculator/", label: "複利" }]}
          />
        );
      }}
    />
  );
}
