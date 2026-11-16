// 개인사업자 vs 법인 세금 비교 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-incorporation-2026.ts, 가정·문장: lib/kr-tax-scenarios.ts.
import { INCORPORATION_ASSUMPTIONS, incorporationPlain, incorporationResult, incorporationSaving, type IncorporationInput } from "../../lib/kr-tax-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

type Kind = "general" | "realEstate";
const KIND_OPTIONS = [
  { value: "general", label: "일반 법인" },
  { value: "realEstate", label: "소규모 부동산임대 법인" },
] as const satisfies readonly { value: Kind; label: string }[];
const KEYS = ["revenue", "expenses", "salary", "kind"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: IncorporationInput = { revenue: 300_000_000, expenses: 100_000_000, salary: 60_000_000, realEstate: false };

export default function IncorporationCalculator() {
  return (
    <ScenarioTool<IncorporationInput, Key>
      toolId="incorporation-calculator"
      example={EXAMPLE}
      assumptions={INCORPORATION_ASSUMPTIONS}
      keys={KEYS}
      evaluate={incorporationSaving}
      resultName="법인으로 아끼는 세금"
      questions={({ input, edit }) => [
        {
          title: "1년 매출과 비용은 얼마인가요?",
          keys: ["revenue", "expenses"],
          body: (
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyField label="1년 매출" value={input.revenue} onChange={(v) => edit({ revenue: v }, ["revenue"])} />
              <MoneyField label="1년 비용(내 급여는 빼고)" value={input.expenses} onChange={(v) => edit({ expenses: v }, ["expenses"])} />
            </div>
          ),
        },
        {
          title: "법인이 되면 내 연봉은 얼마로 할까요?",
          keys: ["salary"],
          body: (
            <>
              <p className="mb-3 text-sm leading-6 text-muted-foreground">법인 돈은 내 돈이 아니라서, 대표도 연봉이나 배당으로 받아야 해요.</p>
              <MoneyField label="대표 연봉" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} />
            </>
          ),
        },
        {
          title: "어떤 법인인가요?",
          keys: ["kind"],
          body: (
            <ChoiceChips<Kind> legend="부동산 임대가 주업이고 직원이 5명 미만이면 소규모 부동산임대 법인이에요" value={input.realEstate ? "realEstate" : "general"} options={KIND_OPTIONS} onChange={(v) => edit({ realEstate: v === "realEstate" }, ["kind"])} />
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="연 매출" value={input.revenue} onChange={(v) => edit({ revenue: v }, ["revenue"])} />
            <MoneyField label="연 필요경비(대표 급여 제외)" value={input.expenses} onChange={(v) => edit({ expenses: v }, ["expenses"])} />
            <MoneyField label="법인일 때 대표 연봉" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} />
          </div>
          <ChoiceChips<Kind> legend="법인 종류" value={input.realEstate ? "realEstate" : "general"} options={KIND_OPTIONS} onChange={(v) => edit({ realEstate: v === "realEstate" }, ["kind"])} />
        </>
      )}
      summary={incorporationPlain}
      metrics={(i, s) => {
        const r = incorporationResult(i);
        return [
          { label: "개인사업자", value: s.money(r.sole.total) },
          { label: "법인 · 이익을 법인에 둘 때", value: s.money(r.corpKeep) },
          { label: "법인 · 남은 이익을 배당할 때", value: s.money(r.corpPayout) },
        ];
      }}
      sliders={["revenue", "expenses", "salary"]}
      sweepCaption={() => "선이 0 위로 올라가는 지점부터 법인이 유리해요(배당까지 받는 경우). 그래프를 누르거나 끌어도 값이 바뀌어요."}
      charts={(i, s) => {
        const r = incorporationResult(i);
        return (
          <CompareBars
            title="1년 세금 비교(지방소득세 포함)"
            items={[
              { label: "개인사업자", value: r.sole.total, current: true },
              { label: "법인 · 이익을 법인에 둘 때", value: r.corpKeep },
              { label: "법인 · 배당까지", value: r.corpPayout },
            ]}
            format={s.money}
          />
        );
      }}
      ask={[
        "대표 연봉에는 4대보험(회사·본인 몫 모두)이 붙어요. 세금 차이보다 클 수 있으니 같이 따져 주세요.",
        "개인사업자 땅·건물이 있으면 법인으로 넘길 때 양도세·취득세가 생겨요. 법인전환 계산기로 따로 확인해 보세요.",
        "성실신고확인 대상인지, 업종별 감면을 받고 있는지에 따라 결과가 달라져요.",
      ]}
      expertFooter={(i) => {
        const r = incorporationResult(i);
        return (
          <ResultSteps
            steps={[
              `개인: 과세표준 ${exactWon(r.sole.base)} (이익 − 본인 기본공제 150만) → 소득세 ${exactWon(r.sole.tax)} (표준세액공제 7만 차감) + 지방소득세 ${exactWon(r.sole.local)}`,
              `법인세: 과세표준 ${exactWon(r.corpBase)} (이익 − 대표 연봉) → 법인세 ${exactWon(r.corpTax)} + 지방소득세 ${exactWon(r.corpLocal)}${i.realEstate ? " (2억 이하 구간 없이 20%)" : " (2026년 10·20·22·25%)"}`,
              `대표 연봉 ${exactWon(r.salary)} → 소득세·지방소득세 ${exactWon(r.pay.total)} (근로소득공제·세액공제 반영)`,
              `배당할 때: 세후 남은 이익 ${exactWon(r.retained)} × 15.4% = ${exactWon(r.dividendTax)} (연 2천만 원 이하 분리과세 가정)`,
              "4대보험(대표 급여는 근로자·사업주 몫 모두), 세무 기장료, 성실신고확인 비용, 감면·공제는 넣지 않았어요.",
            ]}
            next={[
              { href: "/ko/incorporation-conversion-calculator/", label: "법인전환 세금" },
              { href: "/ko/labor-cost-calculator/", label: "직원 1명 인건비" },
            ]}
          />
        );
      }}
    />
  );
}
