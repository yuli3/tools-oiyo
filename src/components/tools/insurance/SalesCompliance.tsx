// 보험 사은품 한도·승환 점검기 (2026-11-17, 설계사·대리점용). 계산: lib/insurance-law-tools.ts salesResult.
import { SALES_ASSUMPTIONS, giftCurve, salesHeadroom, salesPlain, salesResult, type SalesLite } from "../../../lib/insurance-law-tools";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import MoneyField from "../viz/MoneyField";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["monthly", "months", "gift", "replace", "oldEnd", "newApply", "compared"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<SalesLite>, k: Key[]) => void;
const EXAMPLE: SalesLite = { monthly: 100_000, months: 12, gift: 150_000, replace: true, oldEnd: "2026-10-01", newApply: "2026-10-15", compared: false };
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const YN = [{ value: "yes", label: "예" }, { value: "no", label: "아니요" }];
const TWIST = { deemed: "승환으로 봐요", check: "비교 안내 기록 필요", clear: "간주 기간 밖" } as const;

export default function SalesCompliance() {
  const money = (i: SalesLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <MoneyField label="월 보험료" value={i.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} hint="연납이면 연 보험료 ÷ 12" />
      <NumberField label="첫해 내는 달 수" value={i.months} onChange={(v) => edit({ months: v }, ["months"])} suffix="개월" step={1} min={1} />
      <MoneyField label="주려는 사은품·금품 가액" value={i.gift} onChange={(v) => edit({ gift: v }, ["gift"])} />
    </div>
  );
  const twist = (i: SalesLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<string> legend="기존 보험을 해지하고 새로 가입하나요?" value={i.replace ? "yes" : "no"} options={YN} onChange={(v) => edit({ replace: v === "yes" }, ["replace"])} />
      {i.replace && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="기존 계약 소멸일(예정일)" value={i.oldEnd} onChange={(v) => edit({ oldEnd: v }, ["oldEnd"])} />
            <DateField label="새 계약 청약일" value={i.newApply} onChange={(v) => edit({ newApply: v }, ["newApply"])} />
          </div>
          <ChoiceChips<string> legend="보험기간·예정이율·보장 차이를 비교해 알렸나요?" value={i.compared ? "yes" : "no"} options={YN} onChange={(v) => edit({ compared: v === "yes" }, ["compared"])} />
        </>
      )}
    </div>
  );
  return (
    <ScenarioTool<SalesLite, Key>
      toolId="insurance-sales-compliance-checker"
      example={EXAMPLE}
      assumptions={SALES_ASSUMPTIONS}
      keys={KEYS}
      evaluate={salesHeadroom}
      resultName="사은품 한도 여유"
      formatResult={won}
      questions={({ input, edit }) => [
        { title: "보험료와 사은품을 알려 주세요", keys: ["monthly", "months", "gift"], body: money(input, edit) },
        { title: "기존 보험을 갈아타는 계약인가요?", keys: ["replace", "oldEnd", "newApply", "compared"], body: twist(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          {money(input, edit)}
          {twist(input, edit)}
        </div>
      )}
      summary={salesPlain}
      metrics={(i) => {
        const r = salesResult(i);
        return [
          { label: "사은품 한도", value: won(r.limit), tone: "primary" },
          { label: "한도 여유", value: r.headroom >= 0 ? won(r.headroom) : `−${won(-r.headroom)}` },
          { label: "승환 판정", value: r.twist ? TWIST[r.twist.level] : i.replace ? "날짜를 넣어 주세요" : "해당 없음" },
        ];
      }}
      sliders={["monthly", "gift"]}
      sweepCaption={(a) => (a.key === "monthly" ? "월 보험료가 약 16.7만 원(첫해 200만 원)을 넘으면 한도는 20만 원에서 더 오르지 않아요." : undefined)}
      charts={(i) => <CompareBars title="월 보험료별 사은품 한도" caption="최초 1년 보험료의 10%와 20만 원 중 적은 금액이에요." items={giftCurve(i)} format={won} />}
      askTitle="소속 회사에 확인할 것"
      ask={["회사 내규 한도가 법정 한도보다 낮을 수 있어요.", "보험료 할인·대납·대출이자 대납은 금액과 상관없이 특별이익이에요.", "승환 예외(본인 의사 자필 확인)는 회사 양식과 녹취 기준을 따르세요."]}
      expertFooter={(i) => {
        const r = salesResult(i);
        return (
          <ResultSteps
            steps={[
              `최초 1년 보험료 = ${won(i.monthly)} × ${i.months} = ${won(r.firstYear)}`,
              `한도 = min(${won(r.firstYear)} × 10%, 200,000원) = ${won(r.limit)} (보험업법 시행령 제46조)`,
              r.twist ? `승환: 간격 ${r.twist.gapDays}일 → ${TWIST[r.twist.level]} (보험업법 제97조 제3항)` : "승환: 해당 없음",
            ]}
            next={[{ href: "/ko/insurance-law-guide/", label: "보험 법령 길잡이" }, { href: "/ko/insurance-premium-basics/", label: "보험료 계산 원리" }]}
          />
        );
      }}
    />
  );
}
