// 수입 관세·부가세 FTA 비교 계산기 (2026-11-17, 역량 지도 cu-hs). 계산: lib/pro-practice-2026.ts dutyResult.
import { DUTY_ASSUMPTIONS, DUTY_EXAMPLES, dutyCompare, dutyPlain, dutyResult, dutyTotal, type DutyLite } from "../../../lib/pro-practice-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["price", "freight", "insurance", "fx", "baseRate", "ftaRate", "hasOrigin", "personal", "fromUS"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<DutyLite>, k: Key[]) => void;
const EXAMPLE: DutyLite = { price: 1000, freight: 50, insurance: 0, fx: 1400, baseRate: 0.13, ftaRate: 0, hasOrigin: true, personal: false, fromUS: true };
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const YN = [{ value: "yes", label: "예" }, { value: "no", label: "아니요" }];
const pctIn = (v: number) => Math.round(v * 1000) / 10;

export default function ImportDuty() {
  const goods = (i: DutyLite, edit: Edit) => (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <NumberField label="물건값" value={i.price} onChange={(v) => edit({ price: v }, ["price"])} suffix="달러" step={1} />
        <NumberField label="운임(배송비)" value={i.freight} onChange={(v) => edit({ freight: v }, ["freight"])} suffix="달러" step={1} />
        <NumberField label="보험료" value={i.insurance} onChange={(v) => edit({ insurance: v }, ["insurance"])} suffix="달러" step={1} />
        <NumberField label="과세환율" value={i.fx} onChange={(v) => edit({ fx: v }, ["fx"])} suffix="원" step={1} />
      </div>
      <ChoiceChips<string> legend="개인이 쓰려고 직구한 물건인가요?" value={i.personal ? "yes" : "no"} options={YN} onChange={(v) => edit({ personal: v === "yes" }, ["personal"])} />
      {i.personal && <ChoiceChips<string> legend="미국에서 보내나요?" value={i.fromUS ? "yes" : "no"} options={YN} onChange={(v) => edit({ fromUS: v === "yes" }, ["fromUS"])} />}
    </div>
  );
  const rates = (i: DutyLite, edit: Edit) => (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" aria-label="흔한 품목 세율 예시">
        {DUTY_EXAMPLES.map((x) => (
          <button key={x.label} type="button" className="min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted" onClick={() => edit({ baseRate: x.rate }, ["baseRate"])}>
            {x.label} {pctIn(x.rate)}%
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="기본세율" value={pctIn(i.baseRate)} onChange={(v) => edit({ baseRate: v / 100 }, ["baseRate"])} suffix="%" step={0.1} />
        <NumberField label="FTA 협정세율" value={pctIn(i.ftaRate)} onChange={(v) => edit({ ftaRate: v / 100 }, ["ftaRate"])} suffix="%" step={0.1} />
      </div>
      <ChoiceChips<string> legend="원산지증명서(또는 원산지 증빙)가 있나요?" value={i.hasOrigin ? "yes" : "no"} options={YN} onChange={(v) => edit({ hasOrigin: v === "yes" }, ["hasOrigin"])} />
    </div>
  );
  return (
    <ScenarioTool<DutyLite, Key>
      toolId="import-duty-fta-calculator"
      example={EXAMPLE}
      assumptions={DUTY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={dutyTotal}
      resultName="세금"
      formatResult={won}
      questions={({ input, edit }) => [
        { title: "무엇을 얼마에 들여오나요?", keys: ["price", "freight", "insurance", "fx", "personal", "fromUS"], body: goods(input, edit) },
        { title: "세율을 골라 주세요", keys: ["baseRate", "ftaRate", "hasOrigin"], body: rates(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          {goods(input, edit)}
          {rates(input, edit)}
        </div>
      )}
      summary={dutyPlain}
      metrics={(i) => {
        const r = dutyResult(i);
        return [
          { label: "관세 + 부가세", value: won(r.chosen.total), tone: "primary" },
          { label: "과세가격", value: won(r.cif) },
          { label: "FTA로 줄어드는 금액", value: r.exempt ? "면세" : won(r.saving) },
        ];
      }}
      sliders={["price", "fx", "baseRate", "freight"]}
      sweepCaption={(a) => (a.key === "price" ? "개인 직구는 물건값 150달러(미국발 200달러)를 넘는 순간 전체 금액에 세금이 붙어요." : undefined)}
      charts={(i) => <CompareBars title="기본세율과 FTA 세율의 세금 차이" caption="관세와 부가가치세를 합친 금액이에요." items={dutyCompare(i)} format={won} />}
      askTitle="관세사나 세관에 확인할 것"
      ask={["품목분류(HS 코드)가 다르면 세율이 달라져요. 애매하면 품목분류 사전심사를 신청할 수 있어요.", "주류·담배·고가 시계 등은 개별소비세·주세·교육세가 따로 붙어요.", "판매용으로 들여오면 직구 면세를 받을 수 없어요."]}
      expertFooter={(i) => {
        const r = dutyResult(i);
        const c = r.ftaUsable ? r.fta : r.base;
        return (
          <ResultSteps
            steps={[
              `과세가격 = (${i.price} + ${i.freight} + ${i.insurance})달러 × ${i.fx}원 = ${won(r.cif)} (관세법 제30조)`,
              `관세 = ${won(r.cif)} × ${pctIn(r.ftaUsable ? Math.min(i.baseRate, i.ftaRate) : i.baseRate)}% = ${won(c.duty)}`,
              `부가가치세 = (${won(r.cif)} + ${won(c.duty)}) × 10% = ${won(c.vat)}`,
              r.exempt ? `개인 직구 ${r.limit}달러 이하 → 면세(관세법 시행규칙 제45조)` : `합계 ${won(c.total)}`,
            ]}
            next={[{ href: "/ko/customs-law-guide/", label: "관세·통관 법령 길잡이" }, { href: "/ko/law-guide/", label: "법령 길잡이 14분야" }]}
          />
        );
      }}
    />
  );
}
