// 보험료 대략 추정 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/insurance-scenarios.ts insResult(기존 배수 모형).
import { HEALTH, INS_ASSUMPTIONS, INS_TYPES, SMOKE, ageK, insMonthly, insPlain, insResult, type Health, type InsLite, type InsType, type Smoke } from "../../lib/insurance-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["type", "age", "sex", "smoke", "health", "coverage", "term"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<InsLite>, k: Key[]) => void;
const EXAMPLE: InsLite = { type: "term", age: 35, sex: "m", smoke: "never", health: "good", coverage: 100000000, term: 20 };
const opts = <T extends string>(o: Record<T, { label: string }>) => (Object.keys(o) as T[]).map((v) => ({ value: v, label: o[v].label }));
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export default function InsurancePremiumScenario() {
  const kind = (input: InsLite, edit: Edit) => <ChoiceChips<InsType> legend="보험 종류" value={input.type} options={opts(INS_TYPES)} onChange={(v) => edit({ type: v }, ["type"])} />;
  const me = (input: InsLite, edit: Edit) => (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="나이" value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="세" step={1} min={18} />
        <ChoiceChips<"m" | "f"> legend="성별" value={input.sex} options={[{ value: "m", label: "남성" }, { value: "f", label: "여성" }]} onChange={(v) => edit({ sex: v }, ["sex"])} />
      </div>
      <ChoiceChips<Smoke> legend="담배" value={input.smoke} options={opts(SMOKE)} onChange={(v) => edit({ smoke: v }, ["smoke"])} />
      <ChoiceChips<Health> legend="건강 상태" value={input.health} options={opts(HEALTH)} onChange={(v) => edit({ health: v }, ["health"])} />
    </div>
  );
  const plan = (input: InsLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <MoneyField label="보장 금액" value={input.coverage} onChange={(v) => edit({ coverage: v }, ["coverage"])} />
      <NumberField label="내는 기간" value={input.term} onChange={(v) => edit({ term: v }, ["term"])} suffix="년" step={1} min={1} />
    </div>
  );
  return (
    <ScenarioTool<InsLite, Key>
      toolId="insurance-premium-calculator"
      example={EXAMPLE}
      assumptions={INS_ASSUMPTIONS}
      keys={KEYS}
      evaluate={insMonthly}
      resultName="한 달 보험료"
      questions={({ input, edit }) => [
        { title: "어떤 보험을 알아보나요?", keys: ["type"], body: kind(input, edit) },
        { title: "가입할 사람에 대해 알려 주세요", keys: ["age", "sex", "smoke", "health"], body: me(input, edit) },
        { title: "얼마를, 얼마 동안 보장받을까요?", keys: ["coverage", "term"], body: plan(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {kind(input, edit)}
          {me(input, edit)}
          {plan(input, edit)}
        </div>
      )}
      summary={insPlain}
      metrics={(i) => {
        const r = insResult(i);
        return [
          { label: "한 달 보험료", value: won(r.monthly), tone: "primary" },
          { label: "1년", value: won(r.monthly * 12) },
          { label: `${i.term}년 합계`, value: `${Math.round(r.total / 10000).toLocaleString("ko-KR")}만 원` },
        ];
      }}
      sliders={["age", "coverage", "term"]}
      sweepCaption={(a) => (a.key === "age" ? "나이는 5년 단위 계단으로 올라가요. 계단 바로 앞에 가입하면 아낄 수 있어요." : undefined)}
      charts={(i) => {
        const r = insResult(i);
        return (
          <BridgeChart
            title="기본료에서 한 달 보험료까지"
            steps={[
              { label: "기본료", value: r.base, kind: "total" },
              { label: "나이", value: r.age, kind: "add" },
              { label: "성별", value: r.sex, kind: "add" },
              { label: "흡연", value: r.smoke, kind: "add" },
              { label: "건강 상태", value: r.health, kind: "add" },
              { label: "한 달 보험료", value: r.monthly, kind: "total" },
            ]}
            format={won}
          />
        );
      }}
      askTitle="가입 전에 확인할 것"
      ask={["보험다모아(금융위원회·보험협회)에서 같은 보장으로 실제 보험료를 비교하세요.", "갱신형은 갱신 때마다 보험료가 오를 수 있어요. 비갱신형과 총액을 비교하세요.", "고지 의무를 지키지 않으면 보험금을 못 받을 수 있어요."]}
      expertFooter={(i) => {
        const r = insResult(i);
        return (
          <ResultSteps
            steps={[
              `기본료 = 보장 ${Math.round(i.coverage / 10000).toLocaleString("ko-KR")}만 원 × ${INS_TYPES[i.type].rate} = ${won(r.base)}`,
              `+ 기본료 × (나이 ${ageK(i.age)} − 1) + 성별 + 흡연(${SMOKE[i.smoke].k}) + 건강(${HEALTH[i.health].k}) 가산`,
              `= ${won(r.monthly)} × 12 × ${i.term}년 = ${won(r.total)}`,
            ]}
            next={[{ href: "/ko/life-planning-calculator/", label: "인생 계획" }, { href: "/ko/compound-interest-calculator/", label: "복리" }]}
          />
        );
      }}
    />
  );
}
