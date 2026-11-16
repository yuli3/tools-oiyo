// 임대 수익률 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). rental-roi·rental-yield 두 페이지가 함께 써요. 계산: lib/world-money-scenarios.ts rentalResult.
import { RENTAL_ASSUMPTIONS, rentalBridge, rentalNet, rentalPlain, rentalResult, type RentalLite } from "../../lib/world-money-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["price", "deposit", "rent", "loan", "loanRate", "vacancy", "costs"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: RentalLite = { price: 500_000_000, deposit: 50_000_000, rent: 2_000_000, loan: 200_000_000, loanRate: 0.042, vacancy: 0.05, costs: 2_000_000 };
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function RentalScenario({ toolId = "rental-yield-calculator" }: { toolId?: string }) {
  const money = (input: RentalLite, edit: (p: Partial<RentalLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <MoneyField label="매입가" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
      <MoneyField label="보증금" value={input.deposit} onChange={(v) => edit({ deposit: v }, ["deposit"])} />
      <MoneyField label="월세" value={input.rent} onChange={(v) => edit({ rent: v }, ["rent"])} />
      <MoneyField label="대출" value={input.loan} onChange={(v) => edit({ loan: v }, ["loan"])} />
    </div>
  );
  return (
    <ScenarioTool<RentalLite, Key>
      toolId={toolId}
      example={EXAMPLE}
      assumptions={RENTAL_ASSUMPTIONS}
      keys={KEYS}
      evaluate={rentalNet}
      resultName="1년 순수익"
      questions={({ input, edit }) => [
        { title: "집값·보증금·월세·대출은요?", keys: ["price", "deposit", "rent", "loan"], body: money(input, edit) },
        { title: "대출 금리와 비용은요?", keys: ["loanRate", "vacancy", "costs"], body: (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberField label="대출 금리" value={pctField(input.loanRate)} onChange={(v) => edit({ loanRate: v / 100 }, ["loanRate"])} suffix="%" step={0.1} />
              <NumberField label="비어 있는 기간 비율" value={Math.round(input.vacancy * 100)} onChange={(v) => edit({ vacancy: v / 100 }, ["vacancy"])} suffix="%" step={1} min={0} />
              <MoneyField label="1년 비용(재산세·수리비 등)" value={input.costs} onChange={(v) => edit({ costs: v }, ["costs"])} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">공실 5%는 1년에 약 18일 비는 정도예요. 모르면 예시 그대로 두세요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {money(input, edit)}
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="대출 금리" value={pctField(input.loanRate)} onChange={(v) => edit({ loanRate: v / 100 }, ["loanRate"])} suffix="%" step={0.05} />
            <NumberField label="공실률" value={Math.round(input.vacancy * 100)} onChange={(v) => edit({ vacancy: v / 100 }, ["vacancy"])} suffix="%" step={1} min={0} />
            <MoneyField label="연 보유 비용" value={input.costs} onChange={(v) => edit({ costs: v }, ["costs"])} />
          </div>
        </div>
      )}
      summary={rentalPlain}
      metrics={(i, s) => {
        const r = rentalResult(i);
        return [
          { label: "내 돈", value: s.money(r.equity) },
          { label: "한 달 순수익", value: s.money(r.monthly), tone: "primary" },
          { label: "내 돈 대비 수익률", value: Number.isFinite(r.cashYield) ? `${(r.cashYield * 100).toFixed(1)}%` : "—" },
        ];
      }}
      sliders={["rent", "loanRate", "vacancy", "costs"]}
      sweepCaption={(a) => (a.key === "loanRate" ? "곡선이 0 아래로 내려가는 금리부터 적자예요." : undefined)}
      charts={(i, s) => <BridgeChart title="월세에서 1년 순수익까지" steps={rentalBridge(i)} format={s.money} />}
      askTitle="미리 알아 둘 점"
      ask={["임대소득세·건강보험료, 취득세·중개수수료는 넣지 않았어요.", "집값 변화(시세 차익·손실)는 빼고 1년 현금 흐름만 봤어요."]}
      expertFooter={(i) => {
        const r = rentalResult(i);
        return (
          <ResultSteps
            steps={[
              `내 돈 = ${exactWon(i.price)} − 보증금 ${exactWon(i.deposit)} − 대출 ${exactWon(i.loan)} = ${exactWon(r.equity)}`,
              `순수익 = 월세 × 12 × (1 − 공실 ${Math.round(i.vacancy * 100)}%) − 이자 ${exactWon(r.interest)} − 비용 ${exactWon(i.costs)} = ${exactWon(r.net)}`,
              `표면 수익률 ${(r.gross * 100).toFixed(2)}%, 내 돈 대비 ${Number.isFinite(r.cashYield) ? (r.cashYield * 100).toFixed(2) + "%" : "—"}`,
            ]}
            next={[{ href: "/ko/mortgage-calculator/", label: "주택담보대출" }, { href: "/ko/jeonse-monthly-converter/", label: "전월세 전환" }]}
          />
        );
      }}
    />
  );
}
