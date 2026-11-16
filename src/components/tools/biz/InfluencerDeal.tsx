// 인플루언서 계약·집행 (2026-11-16). 계산: lib/biz-ops.ts influencerDeal. 전환율 훑기·비용 대비 매출.
import { INFLUENCER_CHECKS, PAYEE_LABEL, influencerDeal, type InfluencerInput, type PayeeType } from "../../../lib/biz-ops";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import AssumptionSlider from "../viz/AssumptionSlider";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import SweepChart from "../viz/SweepChart";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, SmallButton, Verdict, pct1, useSaved } from "./common";

const TOOL_ID = "influencer-deal-calculator";
const EXAMPLE: InfluencerInput = { fee: 5_000_000, views: 300_000, clickRate: 0.015, conversionRate: 0.04, aov: 35_000, grossMargin: 0.65, performanceRate: 0, payee: "freelancer" };

export default function InfluencerDeal() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [s, setS, reset] = useSaved<InfluencerInput>("influencer", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const input = { ...s, performanceRate: easy ? 0 : s.performanceRate };
  const r = influencerDeal(input);
  const set = (p: Partial<InfluencerInput>) => setS({ ...s, ...p });
  const convHi = Math.max(0.1, s.conversionRate * 2.5);
  const pts = Array.from({ length: 41 }, (_, k) => {
    const c = (convHi * k) / 40;
    return { x: c, y: influencerDeal({ ...input, conversionRate: c }).contribution };
  });
  const marks = r.breakEvenConversion !== null && r.breakEvenConversion < convHi ? [{ at: r.breakEvenConversion, label: "본전" }] : [];

  const memo = () =>
    [
      "[인플루언서 계약 검토]",
      `수수료 ${exactWon(s.fee)}${input.performanceRate ? ` + 성과 ${pct1(input.performanceRate)}` : ""}, 조회 ${s.views.toLocaleString("ko-KR")}, 클릭률 ${pct1(s.clickRate)}, 구매 전환 ${pct1(s.conversionRate)}, 객단가 ${exactWon(s.aov)}`,
      `예상 주문 ${Math.round(r.orders)}건, 매출 ${exactWon(r.revenue)}, ROAS ${r.roas ?? "-"}배, 공헌이익 ${exactWon(r.contribution)}`,
      `CPM ${r.cpm === null ? "-" : exactWon(r.cpm)}, CPA ${r.cpa === null ? "-" : exactWon(r.cpa)}, 본전 주문 ${r.breakEvenOrders}건(전환율 ${r.breakEvenConversion === null ? "-" : pct1(r.breakEvenConversion)})`,
      `지급: ${r.payee.name}, 원천징수 ${exactWon(r.withholding)}, 실지급 ${exactWon(r.netPaid)}${r.vat ? `, 부가세 별도 ${exactWon(r.vat)}` : ""} (${r.payee.basis})`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">계약 조건</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="고정 수수료(세전)" value={s.fee} onChange={(v) => set({ fee: v })} />
          <NumberField label="예상 조회수(지난 게시물 평균)" value={s.views} onChange={(v) => set({ views: v })} suffix="회" step={10000} />
          <MoneyField label="평균 주문 금액(객단가)" value={s.aov} onChange={(v) => set({ aov: v })} />
          {!easy && <NumberField label="매출 연동 성과 수수료" value={Math.round((s.performanceRate ?? 0) * 1000) / 10} onChange={(v) => set({ performanceRate: v / 100 })} suffix="%" step={1} />}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <AssumptionSlider label="조회 → 클릭 비율" unit="rate" value={s.clickRate} range={[0, 0.1]} mode={mode} onChange={(v) => set({ clickRate: v })} />
          <AssumptionSlider label="클릭 → 구매 비율" unit="rate" value={s.conversionRate} range={[0, Math.max(0.1, s.conversionRate * 2)]} mode={mode} onChange={(v) => set({ conversionRate: v })} />
          <AssumptionSlider label="매출총이익률" unit="pct" value={s.grossMargin} range={[0.05, 0.95]} mode={mode} onChange={(v) => set({ grossMargin: v })} />
        </div>
        <ChoiceChips legend="받는 사람" value={s.payee} options={(Object.keys(PAYEE_LABEL) as PayeeType[]).map((k) => ({ value: k, label: PAYEE_LABEL[k].name }))} onChange={(v) => set({ payee: v })} />
        <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
      </section>

      <Verdict title="결론">
        예상 주문 <b>{Math.round(r.orders).toLocaleString("ko-KR")}건</b>, 매출 <b>{money(r.revenue)}</b>으로 광고비의 <b>{r.roas ?? 0}배</b>예요.{" "}
        {r.contribution >= 0 ? <>원가와 수수료를 빼고 <b>{money(r.contribution)}</b> 남아요.</> : <>원가와 수수료를 빼면 <b>{money(-r.contribution)}</b> 손해예요.</>}{" "}
        본전이 되려면 주문이 {r.breakEvenOrders.toLocaleString("ko-KR")}건, 클릭한 사람의 {r.breakEvenConversion === null ? "-" : pct1(r.breakEvenConversion)}가 사야 해요.
        <span className="mt-1 block text-sm text-muted-foreground">
          지급할 때 {r.withholding > 0 ? <>원천징수 {money(r.withholding)}을 떼고 {money(r.netPaid)}을 보내요({r.payee.basis}).</> : <>세금계산서를 받고 부가세 {money(r.vat)}을 더해 보내요.</>}
        </span>
      </Verdict>

      <SweepChart title="구매 전환율이 달라지면 남는 돈은?" caption="가로선 0 위가 이익, 아래가 손해예요. 점을 눌러 전환율을 바꿔요." points={pts} current={{ x: s.conversionRate, y: r.contribution }} marks={marks} formatX={pct1} formatY={money} xLabel="구매 전환율" yLabel="공헌이익" onPick={(v) => set({ conversionRate: Math.round(v * 10000) / 10000 })} />
      <CompareBars title="비용과 결과" items={[{ label: "총 광고비", value: r.totalCost }, { label: "예상 매출", value: r.revenue, current: true }, { label: "남는 돈(공헌이익)", value: r.contribution }]} format={money} />

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">계약 전 체크</h2>
        <ul className="space-y-2">
          {INFLUENCER_CHECKS.map((c) => (
            <li key={c.text} className="rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground">
              {c.text}
              <span className="block text-xs text-muted-foreground">{c.basis}</span>
            </li>
          ))}
        </ul>
      </section>
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
