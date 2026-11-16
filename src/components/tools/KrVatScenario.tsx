// 부가세 (2026-11-16 쉬운 설명·가정 변화 적용). 금액 나누기 + 일반과세자 납부 예상. 계산: lib/kr-pension-scenarios.ts vatResult·splitVat.
import { useState } from "react";
import { VAT_ASSUMPTIONS, splitVat, vatBridge, vatPayable, vatPlain, vatResult, type VatLite } from "../../lib/kr-pension-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["sales", "purchases", "cardShare", "individual"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: VatLite = { sales: 30_000_000, purchases: 10_000_000, cardShare: 0.6, individual: true };
const WHO = [
  { value: "individual", label: "개인사업자" },
  { value: "corp", label: "법인" },
] as const;

function Split() {
  const [amount, setAmount] = useState(110_000);
  const [inclusive, setInclusive] = useState<"in" | "ex">("in");
  const r = splitVat(amount, inclusive === "in");
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base font-semibold text-foreground">금액 하나 나누기</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <MoneyField label="금액" value={amount} onChange={setAmount} />
        <ChoiceChips<"in" | "ex"> legend="이 금액은" value={inclusive} options={[{ value: "in", label: "부가세 포함" }, { value: "ex", label: "부가세 별도" }]} onChange={setInclusive} />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-sm" aria-live="polite">
        <div><dt className="text-xs text-muted-foreground">공급가액</dt><dd className="font-semibold text-foreground">{exactWon(r.supply)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">부가세 10%</dt><dd className="font-semibold text-primary">{exactWon(r.vat)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">합계</dt><dd className="font-semibold text-foreground">{exactWon(r.total)}</dd></div>
      </dl>
    </section>
  );
}

export default function KrVatScenario() {
  const who = (input: VatLite, edit: (p: Partial<VatLite>, k: Key[]) => void) => (
    <ChoiceChips<"individual" | "corp"> legend="사업자 종류" value={input.individual ? "individual" : "corp"} options={WHO} onChange={(v) => edit({ individual: v === "individual" }, ["individual"])} />
  );
  return (
    <div className="space-y-6">
      <Split />
      <ScenarioTool<VatLite, Key>
        toolId="vat-calculator"
        example={EXAMPLE}
        assumptions={VAT_ASSUMPTIONS}
        keys={KEYS}
        evaluate={vatPayable}
        resultName="낼 부가세"
        questions={({ input, edit }) => [
          { title: "이번 신고 기간 매출은 얼마인가요?", keys: ["sales", "individual"], body: (
            <div className="space-y-3">
              <MoneyField label="매출(부가세 빼고)" value={input.sales} onChange={(v) => edit({ sales: v }, ["sales"])} hint="부가세 포함 금액만 안다면 위 '금액 하나 나누기'로 공급가액을 먼저 구해요" />
              {who(input, edit)}
            </div>
          ) },
          { title: "증빙 있는 매입은 얼마인가요?", keys: ["purchases"], body: (
            <>
              <MoneyField label="세금계산서·사업용 카드로 산 것(부가세 빼고)" value={input.purchases} onChange={(v) => edit({ purchases: v }, ["purchases"])} />
              <p className="mt-2 text-xs text-muted-foreground">재료·임대료·장비·광고비처럼 사업에 쓴 것만요. 간이영수증이나 개인 카드 생활비는 빼요.</p>
            </>
          ) },
          { title: "매출 중 카드·현금영수증 비율은요?", keys: ["cardShare"], body: <NumberField label="카드·현금영수증 매출 비율" value={Math.round(input.cardShare * 100)} onChange={(v) => edit({ cardShare: v / 100 }, ["cardShare"])} suffix="%" step={5} min={0} /> },
        ]}
        expert={({ input, edit }) => (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <MoneyField label="매출 공급가액" value={input.sales} onChange={(v) => edit({ sales: v }, ["sales"])} />
              <MoneyField label="공제 매입 공급가액" value={input.purchases} onChange={(v) => edit({ purchases: v }, ["purchases"])} />
              <NumberField label="신용카드 등 매출 비율" value={Math.round(input.cardShare * 100)} onChange={(v) => edit({ cardShare: v / 100 }, ["cardShare"])} suffix="%" step={1} min={0} />
            </div>
            {who(input, edit)}
          </div>
        )}
        summary={vatPlain}
        metrics={(i, s) => {
          const r = vatResult(i);
          return [
            { label: "매출세액", value: s.money(r.output) },
            { label: "매입세액", value: s.money(r.input) },
            { label: r.payable >= 0 ? "낼 부가세" : "돌려받을 부가세", value: s.money(Math.abs(r.payable)), tone: "primary" },
          ];
        }}
        sliders={["sales", "purchases", "cardShare"]}
        sweepCaption={(a) => (a.key === "purchases" ? "증빙 있는 매입이 1만 원 늘 때마다 부가세가 1천 원 줄어요." : undefined)}
        charts={(i, s) => <BridgeChart title="매출세액에서 낼 부가세까지" steps={vatBridge(i)} format={s.money} />}
        ask={["일반과세자 기준이에요. 간이과세자는 업종별 부가가치율로 따로 계산해요.", "예정고지(직전 납부세액의 절반)를 이미 냈다면 확정신고 때 그만큼 빼요."]}
        expertFooter={(i) => {
          const r = vatResult(i);
          return (
            <ResultSteps
              steps={[
                `매출세액 = ${exactWon(i.sales)} × 10% = ${exactWon(r.output)}`,
                `매입세액 = ${exactWon(i.purchases)} × 10% = ${exactWon(r.input)}`,
                `신용카드 매출전표 등 발행세액공제 = ${exactWon(r.card)}(1.3%, 연 1,000만 원 한도, 개인사업자만)`,
                `납부세액 = ${exactWon(r.output)} − ${exactWon(r.input)} − ${exactWon(r.card)} = ${exactWon(r.payable)}`,
              ]}
              next={[{ href: "/ko/general-vs-simplified-vat-calculator/", label: "일반 vs 간이과세" }, { href: "/ko/deemed-rent-vat-calculator/", label: "간주임대료 부가세" }]}
            />
          );
        }}
      />
    </div>
  );
}
