// 해외 시장 실험 (2026-11-16). 계산: lib/biz-ops.ts sampleSizePerGroup·proportionTest·marketEntry. 표본 수, 결과 판정, 진출 손익.
import { marketEntry, proportionTest, sampleSizePerGroup, type MarketTestInput } from "../../../lib/biz-ops";
import NumberField from "../payroll/NumberField";
import AssumptionSlider from "../viz/AssumptionSlider";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import SweepChart from "../viz/SweepChart";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, RangeField, SmallButton, Verdict, pct1, useSaved } from "./common";

const TOOL_ID = "market-test-calculator";
interface State {
  plan: { baseline: number; lift: number; power: number };
  result: { convA: number; nA: number; convB: number; nB: number };
  entry: MarketTestInput;
}
const EXAMPLE: State = {
  plan: { baseline: 0.02, lift: 0.25, power: 0.8 },
  result: { convA: 180, nA: 9_000, convB: 232, nB: 9_100 },
  entry: { visitors: 20_000, conversionRate: 0.025, aov: 42_000, costRatio: 0.62, monthlyFixed: 18_000_000, entryCost: 120_000_000, scaleFactor: 4 },
};

export default function MarketTest() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [s, setS, reset] = useSaved<State>("market-test", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const n = sampleSizePerGroup(s.plan.baseline, s.plan.lift, 0.05, easy ? 0.8 : s.plan.power);
  const t = proportionTest(s.result.convA, s.result.nA, s.result.convB, s.result.nB);
  const e = marketEntry(s.entry);
  const significant = t.pValue < 0.05;
  const setE = (p: Partial<MarketTestInput>) => setS({ ...s, entry: { ...s.entry, ...p } });
  const convHi = Math.max(0.06, s.entry.conversionRate * 2.5);
  const pts = Array.from({ length: 41 }, (_, k) => {
    const c = (convHi * k) / 40;
    return { x: c, y: marketEntry({ ...s.entry, conversionRate: c }).monthlyProfit };
  });
  const marks = Number.isFinite(e.breakEvenConversion) && e.breakEvenConversion < convHi ? [{ at: e.breakEvenConversion, label: "흑자 시작" }] : [];

  const memo = () =>
    [
      "[해외 시장 실험]",
      `계획: 기준 전환율 ${pct1(s.plan.baseline)}, 보고 싶은 개선 ${pct1(s.plan.lift)} → 그룹당 ${n.toLocaleString("ko-KR")}명`,
      `결과: A ${s.result.convA}/${s.result.nA} (${pct1(t.rateA)}), B ${s.result.convB}/${s.result.nB} (${pct1(t.rateB)}), 차이 ${t.lift === null ? "-" : pct1(t.lift)}, p=${t.pValue.toFixed(4)} → ${significant ? "의미 있음" : "아직 우연일 수 있음"}`,
      `진출: 월 이익 ${exactWon(e.monthlyProfit)}, 진입비 회수 ${Number.isFinite(e.paybackMonths) ? `${e.paybackMonths}개월` : "불가"}, 흑자 전환율 ${Number.isFinite(e.breakEvenConversion) ? pct1(e.breakEvenConversion) : "-"} → ${e.verdictText}`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">1. 실험 전: 몇 명에게 보여 줘야 하나</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <AssumptionSlider label="지금(국내·기존안) 구매 전환율" unit="rate" value={s.plan.baseline} range={[0.001, 0.2]} mode={mode} onChange={(v) => setS({ ...s, plan: { ...s.plan, baseline: v } })} />
          <AssumptionSlider label="찾고 싶은 개선 폭(상대)" unit="pct" value={s.plan.lift} range={[0.05, 1]} mode={mode} onChange={(v) => setS({ ...s, plan: { ...s.plan, lift: v } })} />
          {!easy && <RangeField label="검정력(차이가 있을 때 찾아낼 확률)" value={Math.round(s.plan.power * 100)} min={50} max={99} onChange={(v) => setS({ ...s, plan: { ...s.plan, power: v / 100 } })} format={(v) => `${v}%`} />}
        </div>
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">한 안(그룹)마다 <b>{n.toLocaleString("ko-KR")}명</b>이 필요해요(유의수준 5%). 적게 보고 멈추면 우연을 성과로 착각해요.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">2. 실험 후: 차이가 진짜인가</h2>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="A안 방문" value={s.result.nA} onChange={(v) => setS({ ...s, result: { ...s.result, nA: v } })} step={100} />
          <NumberField label="A안 구매" value={s.result.convA} onChange={(v) => setS({ ...s, result: { ...s.result, convA: v } })} step={1} />
          <NumberField label="B안 방문" value={s.result.nB} onChange={(v) => setS({ ...s, result: { ...s.result, nB: v } })} step={100} />
          <NumberField label="B안 구매" value={s.result.convB} onChange={(v) => setS({ ...s, result: { ...s.result, convB: v } })} step={1} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">3. 본 진출하면 남나</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="실험 기간 월 방문" value={s.entry.visitors} onChange={(v) => setE({ visitors: v })} step={1000} />
          <MoneyField label="객단가" value={s.entry.aov} onChange={(v) => setE({ aov: v })} />
          <AssumptionSlider label="구매 전환율" unit="rate" value={s.entry.conversionRate} range={[0, convHi]} mode={mode} onChange={(v) => setE({ conversionRate: v })} />
          <AssumptionSlider label="원가율(물류·관세·수수료 포함)" unit="pct" value={s.entry.costRatio} range={[0.2, 0.95]} mode={mode} onChange={(v) => setE({ costRatio: v })} />
          <MoneyField label="현지 월 고정비(인력·광고·플랫폼)" value={s.entry.monthlyFixed} onChange={(v) => setE({ monthlyFixed: v })} />
          <MoneyField label="진출 초기 비용(인증·등록·초도 물량)" value={s.entry.entryCost} onChange={(v) => setE({ entryCost: v })} />
          {!easy && <RangeField label="본 진출 시 방문이 실험의 몇 배" value={s.entry.scaleFactor} min={1} max={20} onChange={(v) => setE({ scaleFactor: v })} format={(v) => `${v}배`} />}
        </div>
        <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
      </section>

      <Verdict title="결론">
        B안 전환율 {pct1(t.rateB)}는 A안 {pct1(t.rateA)}보다 {t.lift === null ? "-" : pct1(t.lift)} {t.rateB >= t.rateA ? "높아요" : "낮아요"}.{" "}
        {significant ? <><b>우연일 가능성이 5% 미만</b>이라 차이를 믿을 만해요(p={t.pValue.toFixed(3)}).</> : <><b>아직 우연일 수 있어요</b>(p={t.pValue.toFixed(3)}). 그룹당 {n.toLocaleString("ko-KR")}명까지 더 모아요.</>}{" "}
        본 진출 기준으로는 월 <b>{money(e.monthlyProfit)}</b>, {e.verdictText}
        <span className="mt-1 block text-sm text-muted-foreground">영향 부서: 해외영업(채널·파트너), 인허가(현지 화장품 등록), 물류(통관·재고), 재무(환율·초기 투자), 마케팅(현지 광고).</span>
      </Verdict>

      <SweepChart title="현지 구매 전환율이 달라지면 월 이익은?" caption="'흑자 시작' 선 오른쪽이어야 남아요. 점을 눌러 바꿔요." points={pts} current={{ x: s.entry.conversionRate, y: e.monthlyProfit }} marks={marks} formatX={pct1} formatY={money} xLabel="구매 전환율" yLabel="월 이익" onPick={(v) => setE({ conversionRate: Math.round(v * 10000) / 10000 })} />
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
