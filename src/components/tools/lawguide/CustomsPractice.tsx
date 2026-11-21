// 관세 실무 계산 4종 (2026-11-20, 전수조사 5번). 계산: lib/kr-customs-pack-2026.ts (법령 길잡이 스킬 guide.mjs calc customs와 같은 코드)
import { useState } from "react";
import { CUSTOMS_AS_OF, CUSTOMS_NOTE, TRAVELER, TRAVELER_EXTRA, directBundles, rvc, simpleRefund, travelerTax } from "../../../lib/kr-customs-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { krwShort } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "customs-practice-calculator";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
type Mode = "travel" | "direct" | "rvc" | "refund";

export default function CustomsPractice() {
  const [kind, setKind] = useState<Mode>("travel");
  const [fx, setFx] = useState(1400);
  const [tr, setTr] = useState({ totalUsd: 1800, rate: 20, selfReport: true, caught: "no" as "no" | "once" | "repeat" });
  const [orders, setOrders] = useState([
    { label: "주문 1", priceUsd: 100, shippingUsd: 10, arrival: "2026-11-25", fromUs: false },
    { label: "주문 2", priceUsd: 80, shippingUsd: 0, arrival: "2026-11-25", fromUs: false },
  ]);
  const [dutyRate, setDutyRate] = useState(13);
  const [rv, setRv] = useState({ value: 10000, nonOriginating: 4000, originating: 6000, threshold: 55, method: "build-down" as "build-down" | "build-up" });
  const [rf, setRf] = useState({ fob: 10000, per: 30, accepted: "2026-11-20" });
  const tick = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const t = travelerTax({ totalUsd: tr.totalUsd, fx, rate: tr.rate / 100, selfReport: tr.selfReport, caught: tr.caught });
  const bundles = directBundles(orders, fx, dutyRate / 100);
  const rr = rvc({ ...rv, value: rv.value, nonOriginating: rv.nonOriginating, originating: rv.originating });
  const ref = simpleRefund({ fobKrw: rf.fob * 10_000, perTenThousand: rf.per, accepted: rf.accepted });
  const usd = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}달러`;
  const curve = kind === "travel"
    ? { title: "산 물건 합계에 따라 낼 세금이 이렇게 바뀌어요", caption: "면세 한도를 넘는 부분에만 세금이 붙어요. 신고 방법과 세율은 그대로예요.", xLabel: "산 물건 합계", yLabel: "낼 세금", min: 0, max: Math.max(3000, tr.totalUsd * 2), step: 10, current: tr.totalUsd, f: (v: number) => travelerTax({ totalUsd: v, fx, rate: tr.rate / 100, selfReport: tr.selfReport, caught: tr.caught }).total, formatX: usd, formatY: krwShort, onPick: (v: number) => setTr({ ...tr, totalUsd: v }), marks: [{ at: TRAVELER.allowanceUsd, label: "면세 한도" }] }
    : kind === "direct"
      ? { title: "첫 주문 가격에 따라 세금 합계가 이렇게 바뀌어요", caption: "같은 날 도착하는 주문과 합쳐 면세 기준을 넘으면 모두 과세돼요.", xLabel: "주문 1 물품가격", yLabel: "세금 합계", min: 0, max: 500, step: 5, current: orders[0]?.priceUsd ?? 0, f: (v: number) => directBundles(orders.map((o, j) => (j === 0 ? { ...o, priceUsd: v } : o)), fx, dutyRate / 100).reduce((a, b) => a + b.total, 0), formatX: usd, formatY: krwShort, onPick: (v: number) => setOrders(orders.map((o, j) => (j === 0 ? { ...o, priceUsd: v } : o))) }
      : kind === "rvc"
        ? { title: rv.method === "build-down" ? "비원산지 재료에 따라 부가가치 비율이 이렇게 바뀌어요" : "원산지 재료에 따라 부가가치 비율이 이렇게 바뀌어요", caption: "점선이 협정 기준 비율에 닿는 지점이에요.", xLabel: rv.method === "build-down" ? "비원산지 재료" : "원산지 재료", yLabel: "부가가치 비율", min: 0, max: Math.max(1, rv.value), step: Math.max(1, Math.round(rv.value / 100)), current: rv.method === "build-down" ? rv.nonOriginating : rv.originating, f: (v: number) => rvc({ ...rv, ...(rv.method === "build-down" ? { nonOriginating: v } : { originating: v }) }).rate, formatX: (n: number) => `${Math.round(n).toLocaleString("ko-KR")}만`, formatY: (n: number) => `${Math.round(n * 10) / 10}%`, onPick: (v: number) => setRv({ ...rv, ...(rv.method === "build-down" ? { nonOriginating: v } : { originating: v }) }) }
        : { title: "수출금액에 따라 간이정액환급액이 이렇게 바뀌어요", caption: "1만 원당 환급액을 곱해요.", xLabel: "수출금액", yLabel: "환급액", min: 0, max: Math.max(1000, rf.fob * 2), step: 100, current: rf.fob, f: (v: number) => simpleRefund({ fobKrw: v * 10_000, perTenThousand: rf.per, accepted: rf.accepted }).amount, formatX: (n: number) => krwShort(n * 10_000), formatY: krwShort, onPick: (v: number) => setRf({ ...rf, fob: v }) };
  const setOrder = (i: number, p: Partial<(typeof orders)[number]>) => { setOrders(orders.map((o, j) => (j === i ? { ...o, ...p } : o))); tick(); };
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{ ...curve, onPick: (v: number) => { curve.onPick(v); tick(); } }}
    >
      {(mode) => (
    <>
      <ChoiceChips<Mode> legend="무엇을 계산할까요?" value={kind} options={[{ value: "travel", label: "여행 휴대품" }, { value: "direct", label: "직구 합산과세" }, { value: "rvc", label: "FTA 부가가치기준" }, { value: "refund", label: "간이정액환급" }]} onChange={(v) => { setKind(v); tick(); }} />
      {(kind === "travel" || kind === "direct") && <NumberField label="과세환율(원/달러)" suffix="원" value={fx} onChange={(v) => { setFx(Math.max(0, v)); tick(); }} />}
      {kind === "travel" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="해외에서 산 물건 합계" suffix="달러" value={tr.totalUsd} onChange={(v) => { setTr({ ...tr, totalUsd: Math.max(0, v) }); tick(); }} />
            <NumberField label="세율(일반 물품 간이세율 20%)" suffix="%" value={tr.rate} onChange={(v) => { setTr({ ...tr, rate: Math.max(0, v) }); tick(); }} />
          </div>
          <ChoiceChips<"self" | "no" | "once" | "repeat"> legend="신고는요?" value={tr.caught !== "no" ? tr.caught : tr.selfReport ? "self" : "no"} options={[{ value: "self", label: "자진신고해요" }, { value: "no", label: "신고 없이 세관 검사" }, { value: "once", label: "신고 안 하고 적발" }, { value: "repeat", label: "2년 안 2번째 적발" }]} onChange={(v) => { setTr({ ...tr, selfReport: v === "self", caught: v === "once" || v === "repeat" ? v : "no" }); tick(); }} />
          <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
            <p className="text-lg font-semibold text-foreground">낼 세금 약 {won(t.total)}</p>
            <ul className="mt-2 space-y-1 text-foreground">
              <li>면세 {TRAVELER.allowanceUsd}달러를 넘는 {t.overUsd.toLocaleString("ko-KR")}달러 × {fx.toLocaleString("ko-KR")}원 × {tr.rate}% = {won(t.tax)}</li>
              {t.reduction > 0 && <li>자진신고 30% 감면 −{won(t.reduction)} (한도 {won(TRAVELER.selfReportCap)})</li>}
              {t.penalty > 0 && <li>미신고 가산세 +{won(t.penalty)}</li>}
            </ul>
            {mode === "expert" && <p className="mt-2 text-muted-foreground">따로 면세: {TRAVELER_EXTRA.join(" · ")}. 술과 고가 시계·보석은 세율이 달라요.</p>}
          </div>
        </>
      )}
      {kind === "direct" && (
        <>
          {orders.map((o, i) => (
            <div key={i} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
              <NumberField label={`${o.label} 물품가격(배송비 제외)`} suffix="달러" value={o.priceUsd} onChange={(v) => setOrder(i, { priceUsd: Math.max(0, v) })} />
              <NumberField label="해외 배송비" suffix="달러" value={o.shippingUsd} onChange={(v) => setOrder(i, { shippingUsd: Math.max(0, v) })} />
              <DateField label="입항(도착) 예정일" value={o.arrival} onChange={(v) => setOrder(i, { arrival: v })} />
              <ChoiceChips<"us" | "other"> legend="보낸 나라" value={o.fromUs ? "us" : "other"} options={[{ value: "other", label: "미국 외" }, { value: "us", label: "미국" }]} onChange={(v) => setOrder(i, { fromUs: v === "us" })} />
            </div>
          ))}
          <div className="flex flex-wrap items-end gap-3">
            <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm" onClick={() => { setOrders([...orders, { label: `주문 ${orders.length + 1}`, priceUsd: 50, shippingUsd: 0, arrival: orders[orders.length - 1]?.arrival ?? "2026-11-25", fromUs: false }]); tick(); }}>주문 추가</button>
            {orders.length > 1 && <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm" onClick={() => { setOrders(orders.slice(0, -1)); tick(); }}>마지막 주문 빼기</button>}
            <div className="w-40"><NumberField label="관세율" suffix="%" value={dutyRate} onChange={(v) => { setDutyRate(Math.max(0, v)); tick(); }} /></div>
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
            <p className="text-lg font-semibold text-foreground">세금 합계 약 {won(bundles.reduce((s, b) => s + b.total, 0))}</p>
            <ul className="mt-2 space-y-1 text-foreground">
              {bundles.map((b) => <li key={b.arrival}>{b.arrival} 도착 {b.orders.join("·")}: 물품가격 {b.priceUsd}달러 {b.taxed ? `> ${b.limit}달러라 모두 과세(관세 ${won(b.duty)} + 부가세 ${won(b.vat)})` : `≤ ${b.limit}달러라 면세`}</li>)}
            </ul>
            <p className="mt-2 text-muted-foreground">같은 날 들어오는 물건은 합쳐서 면세 기준을 봐요. 도착일이 갈리면 따로 봐요. 판매용이면 면세가 안 돼요.</p>
          </div>
        </>
      )}
      {kind === "rvc" && (
        <>
          <ChoiceChips<"build-down" | "build-up"> legend="계산 방식" value={rv.method} options={[{ value: "build-down", label: "공제법(비원산지 재료 빼기)" }, { value: "build-up", label: "집적법(원산지 재료 더하기)" }]} onChange={(v) => { setRv({ ...rv, method: v }); tick(); }} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="조정가치(보통 FOB)" suffix="만 원" value={rv.value} onChange={(v) => { setRv({ ...rv, value: Math.max(0, v) }); tick(); }} />
            {rv.method === "build-down" ? <NumberField label="비원산지 재료 가치" suffix="만 원" value={rv.nonOriginating} onChange={(v) => { setRv({ ...rv, nonOriginating: Math.max(0, v) }); tick(); }} /> : <NumberField label="원산지 재료 가치" suffix="만 원" value={rv.originating} onChange={(v) => { setRv({ ...rv, originating: Math.max(0, v) }); tick(); }} />}
            <NumberField label="협정·품목의 기준 비율" suffix="%" value={rv.threshold} onChange={(v) => { setRv({ ...rv, threshold: Math.max(0, v) }); tick(); }} />
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
            <p className="text-lg font-semibold text-foreground">부가가치 비율 {rr.rate}% · {rr.pass ? "기준 충족" : "기준 미달"}</p>
            <p className="mt-2 text-muted-foreground">{rv.method === "build-down" ? (rr.pass ? `비원산지 재료를 ${rr.headroom.toLocaleString("ko-KR")}만 원 더 써도 기준 안이에요.` : "비원산지 재료를 줄이거나 원산지 재료로 바꿔야 해요.") : rr.pass ? `원산지 재료가 기준보다 ${rr.headroom.toLocaleString("ko-KR")}만 원 많아요.` : "원산지 재료 비중을 늘려야 해요."} 기준 비율과 방식은 협정 원산지 규정의 품목별 기준에서 확인해요.</p>
          </div>
        </>
      )}
      {kind === "refund" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="수출금액(FOB, 원화)" suffix="만 원" value={rf.fob} onChange={(v) => { setRf({ ...rf, fob: Math.max(0, v) }); tick(); }} />
            <NumberField label="정액환급률표 1만 원당 금액" suffix="원" value={rf.per} onChange={(v) => { setRf({ ...rf, per: Math.max(0, v) }); tick(); }} />
            <DateField label="수출신고 수리일" value={rf.accepted} onChange={(v) => { setRf({ ...rf, accepted: v }); tick(); }} />
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
            <p className="text-lg font-semibold text-foreground">간이정액환급 약 {won(ref.amount)}</p>
            <p className="mt-2 text-muted-foreground">{ref.units.toLocaleString("ko-KR")} × {rf.per}원. {ref.due ? `${ref.due}까지 청구해야 해요(수리일부터 2년).` : ""} 중소기업 수출물품이 대상이고, 환급률은 HS 코드별 정액환급률표에서 찾아요.</p>
          </div>
        </>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{CUSTOMS_NOTE} 기준일 {CUSTOMS_AS_OF}. 입력값은 서버로 보내지 않아요. <a className="underline" href="/ko/import-duty-fta-calculator/">수입 관세·FTA 세율 비교</a></p>
    </>
      )}
    </CurveShell>
  );
}
