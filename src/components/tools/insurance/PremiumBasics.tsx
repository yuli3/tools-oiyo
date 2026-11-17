// 보험료 계산 원리 (2026-11-17, 일반인 쉬운 모드 + 계리 입문 전문가 모드). 계산: lib/insurance-law-tools.ts premiumResult.
import { PREMIUM_ASSUMPTIONS, grossOf, premiumBridge, premiumPlain, premiumResult, premiumSteps, rateCompare, type PremiumLite } from "../../../lib/insurance-law-tools";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import CompareBars from "../viz/CompareBars";
import MoneyField from "../viz/MoneyField";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["sex", "age", "term", "sum", "rate", "expense", "risk"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<PremiumLite>, k: Key[]) => void;
const EXAMPLE: PremiumLite = { sex: "m", age: 40, term: 20, sum: 100_000_000, rate: 0.025, expense: 0.2, risk: 1 };
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const SEX = [{ value: "m" as const, label: "남성" }, { value: "f" as const, label: "여성" }];
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function PremiumBasics() {
  const who = (i: PremiumLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<"m" | "f"> legend="성별" value={i.sex} options={SEX} onChange={(v) => edit({ sex: v }, ["sex"])} />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="가입 나이" value={i.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="세" step={1} min={15} />
        <NumberField label="보험기간" value={i.term} onChange={(v) => edit({ term: v }, ["term"])} suffix="년" step={1} min={1} />
        <MoneyField label="사망보험금" value={i.sum} onChange={(v) => edit({ sum: v }, ["sum"])} />
      </div>
    </div>
  );
  const basis = (i: PremiumLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <NumberField label="예정이율" value={pctField(i.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.25} min={0} />
      <NumberField label="사업비 비율(영업보험료 중)" value={pctField(i.expense)} onChange={(v) => edit({ expense: v / 100 }, ["expense"])} suffix="%" step={1} min={0} />
      <NumberField label="위험률 배수(표준체 1)" value={i.risk} onChange={(v) => edit({ risk: v }, ["risk"])} suffix="배" step={0.1} min={0.3} />
    </div>
  );
  return (
    <ScenarioTool<PremiumLite, Key>
      toolId="insurance-premium-basics"
      example={EXAMPLE}
      assumptions={PREMIUM_ASSUMPTIONS}
      keys={KEYS}
      evaluate={grossOf}
      resultName="연 보험료"
      formatResult={won}
      questions={({ input, edit }) => [
        { title: "누가, 얼마를, 몇 년 보장받나요?", keys: ["sex", "age", "term", "sum"], body: who(input, edit) },
        { title: "보험사가 쓰는 가정을 골라 보세요", keys: ["rate", "expense", "risk"], body: (
          <>
            {basis(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">모르면 그대로 두세요. 예정이율 2.5%, 사업비 20%는 설명용 예시예요. 실제 값은 상품 요약서·공시실에서 볼 수 있어요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          {who(input, edit)}
          {basis(input, edit)}
        </div>
      )}
      summary={premiumPlain}
      metrics={(i) => {
        const r = premiumResult(i);
        return [
          { label: "월 보험료", value: won(r.monthly), tone: "primary" },
          { label: "순보험료(연)", value: won(r.net) },
          { label: "기간 내 사망 확률", value: `${(Math.round(r.deathProb * 1000) / 10).toLocaleString("ko-KR")}%` },
        ];
      }}
      sliders={["age", "term", "rate", "expense"]}
      sweepCaption={(a) => (a.key === "age" ? "나이가 8살 많아질 때마다 사망률이 약 2배가 되는 모형이에요." : a.key === "rate" ? "예정이율이 내려가면 미리 받은 보험료로 벌 이자가 줄어 보험료가 올라요." : undefined)}
      charts={(i) => (
        <div className="space-y-4">
          <BridgeChart title="연 보험료가 만들어지는 과정" steps={premiumBridge(i)} format={won} />
          <CompareBars title="예정이율별 월 보험료" caption="같은 보장인데 금리 가정만 바꿨어요." items={rateCompare(i)} format={won} />
        </div>
      )}
      askTitle="가입 전에 확인할 것"
      ask={["실제 보험료는 회사 경험위험률·사업비 구조로 정해져요. 같은 보장을 여러 회사 공시실에서 비교하세요.", "갱신형은 갱신 때 나이와 위험률로 다시 계산돼 오를 수 있어요.", "해지환급금이 적거나 없는 상품은 보험료가 싸지만 중도 해지 때 돌려받는 돈이 적어요."]}
      expertFooter={(i) => <ResultSteps steps={premiumSteps(i)} next={[{ href: "/ko/insurance-law-guide/", label: "보험 법령 길잡이" }, { href: "/ko/insurance-premium-calculator/", label: "보험료 추정 계산기" }]} />}
    />
  );
}
