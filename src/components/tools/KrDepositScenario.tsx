// 예금·적금 이자 한국어판 (2026-11-16 쉬운 설명·가정 변화 적용). 영어판은 DepositCalculator 그대로.
import { DEPOSIT_ASSUMPTIONS, depositBridge, depositNet, depositPlain, depositResult, type DepositLite } from "../../lib/kr-money-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["kind", "amount", "rate", "months", "compound", "taxRate"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: DepositLite = { kind: "savings", amount: 500_000, rate: 0.035, months: 12, compound: false, taxRate: 0.154 };
const KIND = [
  { value: "deposit", label: "예금(한 번에 넣기)" },
  { value: "savings", label: "적금(매달 넣기)" },
] as const;
const METHOD = [
  { value: "simple", label: "단리" },
  { value: "compound", label: "월복리" },
] as const;
const TAX = [
  { value: "0.154", label: "일반과세 15.4%" },
  { value: "0", label: "비과세" },
  { value: "0.014", label: "조합 예탁금 1.4%" },
] as const;
type Edit = (p: Partial<DepositLite>, k: readonly Key[]) => void;

function Fields({ input, edit, plain }: { input: DepositLite; edit: Edit; plain: boolean }) {
  return (
    <div className="space-y-4">
      <ChoiceChips legend={plain ? "어떤 상품인가요?" : "상품"} value={input.kind} options={KIND} onChange={(v) => edit({ kind: v }, ["kind"])} />
      <div className="grid gap-3 sm:grid-cols-3">
        <MoneyField label={input.kind === "deposit" ? "맡기는 돈" : "매달 넣는 돈"} value={input.amount} onChange={(v) => edit({ amount: v }, ["amount"])} />
        <NumberField label="연이율" value={Number((input.rate * 100).toFixed(2))} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
        <NumberField label="기간" value={input.months} onChange={(v) => edit({ months: v }, ["months"])} suffix="개월" step={1} min={1} />
      </div>
      <ChoiceChips legend={plain ? "이자 계산 방식(상품 설명서에 적혀 있어요)" : "이자 계산"} value={input.compound ? "compound" : "simple"} options={METHOD} onChange={(v) => edit({ compound: v === "compound" }, ["compound"])} />
      <ChoiceChips legend={plain ? "이자에 세금이 붙나요?" : "과세 구분"} value={String(input.taxRate) as "0.154" | "0" | "0.014"} options={TAX} onChange={(v) => edit({ taxRate: Number(v) }, ["taxRate"])} />
    </div>
  );
}

export default function KrDepositScenario() {
  return (
    <ScenarioTool<DepositLite, Key>
      toolId="deposit-calculator"
      example={EXAMPLE}
      assumptions={DEPOSIT_ASSUMPTIONS}
      keys={KEYS}
      evaluate={depositNet}
      resultName="세후 이자"
      questions={({ input, edit }) => [
        { title: "예금인가요, 적금인가요?", keys: ["kind", "amount"], body: (
          <div className="space-y-3">
            <ChoiceChips legend="한 번에 넣으면 예금, 매달 넣으면 적금이에요" value={input.kind} options={KIND} onChange={(v) => edit({ kind: v }, ["kind"])} />
            <MoneyField label={input.kind === "deposit" ? "맡기는 돈" : "매달 넣는 돈"} value={input.amount} onChange={(v) => edit({ amount: v }, ["amount"])} />
          </div>
        ) },
        { title: "이자율과 기간은요?", keys: ["rate", "months"], body: (
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="연이율" value={Number((input.rate * 100).toFixed(2))} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
            <NumberField label="기간" value={input.months} onChange={(v) => edit({ months: v }, ["months"])} suffix="개월" step={1} min={1} />
          </div>
        ) },
        { title: "이자에 세금이 붙나요?", keys: ["taxRate", "compound"], body: (
          <ChoiceChips legend="보통은 15.4%를 떼요. ISA 같은 비과세 계좌면 비과세를 고르세요" value={String(input.taxRate) as "0.154" | "0" | "0.014"} options={TAX} onChange={(v) => edit({ taxRate: Number(v) }, ["taxRate"])} />
        ) },
      ]}
      expert={({ input, edit }) => <Fields input={input} edit={edit} plain={false} />}
      summary={depositPlain}
      metrics={(i, s) => {
        const r = depositResult(i);
        return [
          { label: "만기에 받는 돈", value: s.money(r.total), tone: "primary" },
          { label: "세후 이자", value: s.money(r.afterTaxInterest) },
          { label: "떼는 세금", value: s.money(r.tax) },
        ];
      }}
      sliders={["amount", "rate", "months"]}
      charts={(i, s) => <BridgeChart title="넣은 돈에서 만기 금액까지" steps={depositBridge(i)} format={s.money} />}
      ask={[
        "농협·신협·새마을금고 조합원 예탁금은 1인당 3,000만 원까지 1.4%만 떼요.",
        "중도에 해지하면 약속한 이율보다 훨씬 낮은 중도해지 이율이 붙어요.",
        "예금자보호는 한 금융회사당 원금과 이자를 합쳐 1억 원까지예요.",
      ]}
      expertFooter={(i) => {
        const r = depositResult(i);
        return (
          <ResultSteps
            steps={[
              i.kind === "deposit"
                ? i.compound ? "월복리: 원금 × ((1 + 연이율 ÷ 12)^개월 − 1)" : "단리: 원금 × 연이율 × 개월 ÷ 12"
                : i.compound ? "적금 월복리: 매달 넣은 돈이 남은 개월 동안 월복리로 불어난 합계 − 원금" : "적금 단리: 월 납입액 × n(n+1)/2 × 연이율 ÷ 12",
              `이자 ${exactWon(r.interest)} − 세금 ${exactWon(r.tax)} = ${exactWon(r.afterTaxInterest)}`,
              "세금: 이자소득세 14%와 지방소득세 1.4%를 각각 10원 미만 버림으로 계산했어요.",
            ]}
            next={[
              { href: "/ko/savings-comparison-calculator/", label: "예금·적금 비교" },
              { href: "/ko/isa-calculator/", label: "ISA 절세 계산" },
            ]}
          />
        );
      }}
    />
  );
}
