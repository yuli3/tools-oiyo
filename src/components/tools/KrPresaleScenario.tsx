// 분양 대금 일정 (2026-11-16 쉬운 설명·가정 변화 적용). 회차별 표가 있는 기존 계산기는 전문가 모드 아래에 남겨요.
import type { InterestMode } from "../../lib/kr-presale-2026";
import { PRESALE_ASSUMPTIONS, presaleBridge, presaleCash, presalePlain, presaleResult, type PresaleLite } from "../../lib/kr-home-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import LegacyDetails from "./viz/LegacyDetails";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";
import PresalePaymentCalculator from "./PresalePaymentCalculator";

const KEYS = ["price", "split", "midCount", "months", "loanShare", "loanRate", "interestMode", "options", "over85"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: PresaleLite = { price: 600_000_000, depositRate: 0.1, midRate: 0.6, midCount: 6, months: 35, loanShare: 1, loanRate: 4.5 / 100, interestMode: "deferred", options: 15_000_000, over85: false };
type Split = "10-60-30" | "20-60-20" | "10-50-40";
const SPLITS: Record<Split, [number, number]> = { "10-60-30": [0.1, 0.6], "20-60-20": [0.2, 0.6], "10-50-40": [0.1, 0.5] };
const SPLIT_OPTIONS = [
  { value: "10-60-30", label: "10·60·30" },
  { value: "20-60-20", label: "20·60·20" },
  { value: "10-50-40", label: "10·50·40" },
] as const satisfies readonly { value: Split; label: string }[];
const splitOf = (i: PresaleLite): Split => (Object.keys(SPLITS) as Split[]).find((k) => SPLITS[k][0] === i.depositRate && SPLITS[k][1] === i.midRate) ?? "10-60-30";
const MODE = [
  { value: "deferred", label: "이자 후불제" },
  { value: "free", label: "무이자" },
  { value: "self", label: "유이자(매달 내요)" },
] as const satisfies readonly { value: InterestMode; label: string }[];
type Size = "le85" | "gt85";
const SIZE = [
  { value: "le85", label: "전용 85㎡ 이하" },
  { value: "gt85", label: "85㎡ 초과" },
] as const satisfies readonly { value: Size; label: string }[];

export default function KrPresaleScenario() {
  return (
    <ScenarioTool<PresaleLite, Key>
      toolId="presale-payment-calculator"
      example={EXAMPLE}
      assumptions={PRESALE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={presaleCash}
      resultName="내 돈으로 내는 돈"
      questions={({ input, edit }) => [
        { title: "분양가는 얼마인가요?", keys: ["price", "options"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="분양가(옵션 제외)" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
            <MoneyField label="발코니 확장·유상 옵션" value={input.options} onChange={(v) => edit({ options: v }, ["options"])} />
          </div>
        ) },
        { title: "계약금·중도금·잔금 비율은요?", keys: ["split"], body: (
          <>
            <ChoiceChips<Split> legend="입주자모집공고에 나와 있어요(계약금·중도금·잔금 %)" value={splitOf(input)} options={SPLIT_OPTIONS} onChange={(v) => edit({ depositRate: SPLITS[v][0], midRate: SPLITS[v][1] }, ["split"])} />
          </>
        ) },
        { title: "중도금 이자는 누가 내나요?", keys: ["interestMode", "loanRate"], body: (
          <div className="space-y-3">
            <ChoiceChips<InterestMode> legend="공고문의 '중도금 대출 이자' 항목을 보세요" value={input.interestMode} options={MODE} onChange={(v) => edit({ interestMode: v }, ["interestMode"])} />
            {input.interestMode !== "free" && <NumberField label="중도금 대출 금리" value={Number((input.loanRate * 100).toFixed(2))} onChange={(v) => edit({ loanRate: v / 100 }, ["loanRate"])} suffix="%" step={0.1} />}
          </div>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="분양가" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
            <MoneyField label="옵션" value={input.options} onChange={(v) => edit({ options: v }, ["options"])} />
            <NumberField label="중도금 회차" value={input.midCount} onChange={(v) => edit({ midCount: Math.min(12, Math.round(v)) }, ["midCount"])} suffix="회" step={1} />
            <NumberField label="계약~입주" value={input.months} onChange={(v) => edit({ months: Math.round(v) }, ["months"])} suffix="개월" step={1} min={1} />
            <NumberField label="중도금 대출 비율" value={Math.round(input.loanShare * 100)} onChange={(v) => edit({ loanShare: Math.min(100, v) / 100 }, ["loanShare"])} suffix="%" step={10} />
            <NumberField label="중도금 대출 금리" value={Number((input.loanRate * 100).toFixed(2))} onChange={(v) => edit({ loanRate: v / 100 }, ["loanRate"])} suffix="%" step={0.1} />
          </div>
          <ChoiceChips<Split> legend="계약금·중도금·잔금" value={splitOf(input)} options={SPLIT_OPTIONS} onChange={(v) => edit({ depositRate: SPLITS[v][0], midRate: SPLITS[v][1] }, ["split"])} />
          <ChoiceChips<InterestMode> legend="중도금 이자" value={input.interestMode} options={MODE} onChange={(v) => edit({ interestMode: v }, ["interestMode"])} />
          <ChoiceChips<Size> legend="면적(취득세 농특세)" value={input.over85 ? "gt85" : "le85"} options={SIZE} onChange={(v) => edit({ over85: v === "gt85" }, ["over85"])} />
        </div>
      )}
      summary={presalePlain}
      metrics={(i, s) => {
        const r = presaleResult(i);
        return [
          { label: "입주 전 내 돈", value: s.money(r.cashBeforeMoveIn), tone: "primary" },
          { label: "입주 때 내 돈", value: s.money(r.moveIn) },
          { label: "입주 때 갚을 중도금 대출", value: s.money(r.loanToRefinance) },
        ];
      }}
      sliders={["price", "loanShare", "loanRate"]}
      charts={(i, s) => <BridgeChart title="분양가에서 내 돈까지" steps={presaleBridge(i)} format={s.money} />}
      ask={["취득세는 1주택·비조정 기준이에요. 다주택이면 더 높아요.", "중도금은 계약과 입주 사이에 고르게 나눠 낸다고 가정했어요. 실제 회차 날짜는 공고문을 보세요."]}
      expertFooter={(i) => {
        const r = presaleResult(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `계약금 ${exactWon(r.deposit)} + 중도금 ${exactWon(r.midTotal)}(대출 ${exactWon(r.loanTotal)}) + 잔금 ${exactWon(r.balance)}`,
                `중도금 이자 ${exactWon(r.interestTotal)}(회차별 대출액 × 금리 × 입주까지 남은 개월 ÷ 12)`,
                `취득세 ${exactWon(r.acquisition)} → 총비용 ${exactWon(r.totalCost)}`,
              ]}
              next={[{ href: "/ko/acquisition-tax-calculator/", label: "취득세" }, { href: "/ko/dsr-calculator/", label: "잔금대출 한도(DSR)" }]}
            />
            <LegacyDetails title="회차별 납부 일정 표 보기">
              <PresalePaymentCalculator />
            </LegacyDetails>
          </div>
        );
      }}
    />
  );
}
