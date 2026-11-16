// 청년미래적금 (2026-11-16 쉬운 설명·가정 변화 적용). 가입 유형 판정·한 줄 입력이 있는 기존 계산기는 전문가 모드 아래에 남겨요.
import { YOUTH_SAVINGS, type SavingsKind } from "../../lib/kr-youth-savings-2026";
import { YOUTH_ASSUMPTIONS, youthBridge, youthGain, youthPlain, youthResult, type YouthLite } from "../../lib/kr-money-scenarios";
import NumberField from "./payroll/NumberField";
import ChoiceChips from "./payroll/ChoiceChips";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import LegacyDetails from "./viz/LegacyDetails";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";
import YouthFutureSavingsCalculator from "./YouthFutureSavingsCalculator";

const KEYS = ["monthly", "rate", "kind"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: YouthLite = { monthly: 500_000, rate: YOUTH_SAVINGS.baseRate, kind: "general" };
const KIND = [
  { value: "general", label: "일반형(기여금 6%)" },
  { value: "preferred", label: "우대형(기여금 12%)" },
  { value: "taxFreeOnly", label: "비과세만" },
] as const satisfies readonly { value: SavingsKind; label: string }[];

export default function KrYouthSavingsScenario() {
  return (
    <ScenarioTool<YouthLite, Key>
      toolId="youth-future-savings-calculator"
      example={EXAMPLE}
      assumptions={YOUTH_ASSUMPTIONS}
      keys={KEYS}
      evaluate={youthGain}
      resultName="넣은 돈보다 더 받는 돈"
      questions={({ input, edit }) => [
        { title: "매달 얼마씩 넣을 건가요?", keys: ["monthly"], body: <MoneyField label="월 납입액(최대 50만 원)" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} /> },
        { title: "어떤 유형인가요?", keys: ["kind"], body: (
          <>
            <ChoiceChips<SavingsKind> legend="연봉 3,600만 원 이하 중소기업 재직 등은 우대형이에요" value={input.kind} options={KIND} onChange={(v) => edit({ kind: v }, ["kind"])} />
            <p className="mt-2 text-xs text-muted-foreground">잘 모르면 아래 전문가 모드의 '가입 유형 확인'에서 확인할 수 있어요.</p>
          </>
        ) },
        { title: "금리는 몇 %인가요?", keys: ["rate"], body: <NumberField label="적용 금리(기본 5%, 우대 포함)" value={Number((input.rate * 100).toFixed(2))} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} /> },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="월 납입액" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
            <NumberField label="적용 금리" value={Number((input.rate * 100).toFixed(2))} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
          </div>
          <ChoiceChips<SavingsKind> legend="유형" value={input.kind} options={KIND} onChange={(v) => edit({ kind: v }, ["kind"])} />
        </div>
      )}
      summary={youthPlain}
      metrics={(i, s) => {
        const r = youthResult(i);
        return [
          { label: "만기에 받는 돈", value: s.money(r.total), tone: "primary" },
          { label: "정부 기여금", value: s.money(r.contribution) },
          { label: "비과세로 아낀 세금", value: s.money(r.taxSaved) },
        ];
      }}
      sliders={["monthly", "rate"]}
      charts={(i, s) => <BridgeChart title="넣은 돈에서 만기 금액까지" steps={youthBridge(i)} format={s.money} />}
      ask={["기여금에 붙는 이자는 은행마다 달라 넣지 않았어요. 은행 예시보다 조금 적게 나와요.", "실제 유형은 국세청 확정 소득과 가구소득 심사로 정해져요."]}
      expertFooter={(i) => {
        const r = youthResult(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `원금 = ${exactWon(i.monthly)} × 36개월 = ${exactWon(r.principal)}`,
                `이자(단리) = 월 납입액 × 연 ${(i.rate * 100).toFixed(1)}% × 36×37/2 ÷ 12 = ${exactWon(r.interest)}(비과세)`,
                `기여금 = 월 ${exactWon(r.monthlyContribution)} × 36 = ${exactWon(r.contribution)}`,
              ]}
              next={[{ href: "/ko/deposit-calculator/", label: "예금·적금 이자" }, { href: "/ko/isa-calculator/", label: "ISA 절세" }]}
            />
            <LegacyDetails title="가입 유형 확인하기(소득·가구 기준, 한 줄 입력 지원)">
              <YouthFutureSavingsCalculator />
            </LegacyDetails>
          </div>
        );
      }}
    />
  );
}
