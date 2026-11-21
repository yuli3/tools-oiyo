// 부가세 공제 팩 (2026-11-20, 전수조사 11번). 계산: lib/kr-vat-credits-2026.ts (kr-tax-advisor 스킬 calc.mjs deemed-input·card-credit·bad-debt와 같은 코드)
import { useState } from "react";
import { DEEMED_LABEL, VAT_CREDIT_AS_OF, VAT_CREDIT_NOTE, badDebtCredit, cardSalesCredit, deemedInputCredit, type DeemedType } from "../../../lib/kr-vat-credits-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { krwShort } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "vat-credit-calculator";
const MAN = 10_000;
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
type Mode = "deemed" | "card" | "bad";

export default function VatCredits() {
  const [mode, setMode] = useState<Mode>("deemed");
  const [d, setD] = useState({ type: "restaurant-individual" as DeemedType, purchases: 6000, taxBase: 15000 });
  const [c, setC] = useState({ cardSales: 30000, prior: 50000, used: 0, payable: 0 });
  const [b, setB] = useState({ amount: 1100, supplied: "2025-03-10", confirmed: "2026-11-20" });
  const tick = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const dc = (purchases: number) => deemedInputCredit({ type: d.type, purchases: purchases * MAN, taxBase: d.taxBase * MAN, corp: d.type === "restaurant-corp" });
  const cc = (cardSales: number) => cardSalesCredit({ cardSales: cardSales * MAN, priorYearSupply: c.prior * MAN, usedThisYear: c.used * MAN, payable: c.payable ? c.payable * MAN : undefined });
  const bc = (amount: number) => badDebtCredit({ amount: amount * MAN, supplied: b.supplied, confirmed: b.confirmed });
  const dr = dc(d.purchases);
  const cr = cc(c.cardSales);
  const br = bc(b.amount);
  const curve = mode === "deemed"
    ? { title: "면세 농산물 매입액에 따라 의제매입세액이 이렇게 바뀌어요", caption: "한도(과세표준 × 한도율)를 넘으면 더 늘지 않아요.", xLabel: "매입가액", min: 0, max: Math.max(1000, d.taxBase, Math.ceil(d.purchases * 1.5)), current: d.purchases, f: (v: number) => dc(v).credit, onPick: (v: number) => setD({ ...d, purchases: v }) }
    : mode === "card"
      ? { title: "카드·현금영수증 매출에 따라 발행세액공제가 이렇게 바뀌어요", caption: "연간 한도와 낼 세액을 넘지 않아요.", xLabel: "카드 매출", min: 0, max: Math.max(10000, c.cardSales * 2), current: c.cardSales, f: (v: number) => cc(v).credit, onPick: (v: number) => setC({ ...c, cardSales: v }) }
      : { title: "못 받은 금액에 따라 대손세액이 이렇게 바뀌어요", caption: "부가세 포함 금액의 10/110이에요.", xLabel: "못 받은 금액", min: 0, max: Math.max(1000, b.amount * 2), current: b.amount, f: (v: number) => bc(v).credit, onPick: (v: number) => setB({ ...b, amount: v }) };
  const box = "rounded-md border border-border bg-card px-4 py-4 text-sm";
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{ ...curve, yLabel: "공제세액", step: Math.max(10, Math.round(curve.max / 100 / 10) * 10), formatX: (n: number) => `${Math.round(n).toLocaleString("ko-KR")}만`, formatY: krwShort }}
    >
      {() => (
    <>
      <ChoiceChips<Mode> legend="어떤 공제인가요?" value={mode} options={[{ value: "deemed", label: "의제매입세액" }, { value: "card", label: "카드매출 세액공제" }, { value: "bad", label: "대손세액" }]} onChange={(v) => { setMode(v); tick(); }} />
      {mode === "deemed" && (
        <>
          <ChoiceChips<DeemedType> legend="업종" value={d.type} options={(Object.keys(DEEMED_LABEL) as DeemedType[]).map((k) => ({ value: k, label: DEEMED_LABEL[k] }))} onChange={(v) => { setD({ ...d, type: v }); tick(); }} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="이번 과세기간(반기) 과세표준" suffix="만 원" value={d.taxBase} onChange={(v) => { setD({ ...d, taxBase: Math.max(0, v) }); tick(); }} />
            <NumberField label="면세 농·축·수산물 매입가액" suffix="만 원" value={d.purchases} onChange={(v) => { setD({ ...d, purchases: Math.max(0, v) }); tick(); }} />
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">의제매입세액 공제 약 {won(dr.credit)}</p>
            <p className="mt-1 text-foreground">공제율 {dr.rate}, 한도율 {Math.round(dr.ratio * 100)}% → 매입 {won(dr.limitPurchases)}분까지 인정{dr.capped ? ", 한도를 넘었어요" : ""}.</p>
            <p className="mt-1 text-muted-foreground">개인 음식점 9/109 우대는 2026-12-31까지예요. 계산서·신용카드 영수증으로 산 것만 공제돼요.</p>
          </div>
        </>
      )}
      {mode === "card" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="카드·현금영수증 매출(부가세 포함)" suffix="만 원" value={c.cardSales} onChange={(v) => { setC({ ...c, cardSales: Math.max(0, v) }); tick(); }} />
            <NumberField label="직전 연도 공급가액" suffix="만 원" value={c.prior} onChange={(v) => { setC({ ...c, prior: Math.max(0, v) }); tick(); }} />
            <NumberField label="올해 이미 받은 공제" suffix="만 원" value={c.used} onChange={(v) => { setC({ ...c, used: Math.max(0, v) }); tick(); }} />
            <NumberField label="이번에 낼 세액(모르면 0)" suffix="만 원" value={c.payable} onChange={(v) => { setC({ ...c, payable: Math.max(0, v) }); tick(); }} />
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">{cr.eligible ? `발행세액공제 약 ${won(cr.credit)}` : "대상이 아니에요"}</p>
            <p className="mt-1 text-muted-foreground">{cr.reason} 2027년부터는 정부안(1.2%·500만 원)이 국회를 통과하면 바뀌어요.</p>
          </div>
        </>
      )}
      {mode === "bad" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="못 받은 금액(부가세 포함)" suffix="만 원" value={b.amount} onChange={(v) => { setB({ ...b, amount: Math.max(0, v) }); tick(); }} />
            <DateField label="공급한 날" value={b.supplied} onChange={(v) => { setB({ ...b, supplied: v }); tick(); }} />
            <DateField label="대손이 확정된 날(파산·소멸시효 등)" value={b.confirmed} onChange={(v) => { setB({ ...b, confirmed: v }); tick(); }} />
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">대손세액공제 약 {won(br.credit)}</p>
            <p className="mt-1 text-foreground">{br.deadline}까지 대손이 확정돼야 해요{br.ok === false ? " — 지난 날짜예요" : ""}. 확정된 날이 속하는 과세기간 확정신고 때 빼요.</p>
            <p className="mt-1 text-muted-foreground">파산·강제집행·소멸시효 완성, 부도 6개월 경과 등 법에 정한 사유가 있어야 해요(시행령 제87조).</p>
          </div>
        </>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{VAT_CREDIT_NOTE} 기준일 {VAT_CREDIT_AS_OF}. 입력값은 서버로 보내지 않아요. <a className="underline" href="/ko/vat-calculator/">부가세 계산기</a> · <a className="underline" href="/ko/general-vs-simplified-vat-calculator/">일반·간이 비교</a></p>
    </>
      )}
    </CurveShell>
  );
}
