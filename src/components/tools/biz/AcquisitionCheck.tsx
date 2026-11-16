// 인수 검토·통합 (2026-11-16). 계산: lib/biz-ops.ts acquisitionCheck, 통합 일정: biz-strategy scheduleCpm + PMI_TEMPLATE.
import { useMemo } from "react";
import { PMI_TEMPLATE, acquisitionCheck, type AcquisitionInput } from "../../../lib/biz-ops";
import { scheduleCpm } from "../../../lib/biz-strategy";
import NumberField from "../payroll/NumberField";
import AssumptionSlider from "../viz/AssumptionSlider";
import GanttChart from "../viz/GanttChart";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import SweepChart from "../viz/SweepChart";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, RangeField, SmallButton, Verdict, pct1, useSaved } from "./common";

const TOOL_ID = "acquisition-integration-check";
const EXAMPLE: AcquisitionInput = {
  price: 30_000_000_000, targetNetIncome: 2_000_000_000, acquirerNetIncome: 12_000_000_000, acquirerShares: 10_000_000, sharePrice: 18_000,
  stockPortion: 0.4, debtRate: 0.055, taxRate: 0.22, synergy: 1_500_000_000, rampYears: 3, integrationCost: 2_000_000_000, years: 10,
};

export default function AcquisitionCheck() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [s, setS, reset] = useSaved<AcquisitionInput>("acquisition", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const r = acquisitionCheck(s);
  const set = (p: Partial<AcquisitionInput>) => setS({ ...s, ...p });
  const pmi = useMemo(() => scheduleCpm(PMI_TEMPLATE), []);
  const synHi = Math.max(s.synergy * 2, s.targetNetIncome, 1);
  const pts = Array.from({ length: 41 }, (_, k) => {
    const v = (synHi * k) / 40;
    return { x: v, y: acquisitionCheck({ ...s, synergy: v }).steadyAccretion };
  });
  const marks = r.synergyForBreakeven > 0 && r.synergyForBreakeven < synHi ? [{ at: r.synergyForBreakeven / s.rampYears, label: "주당이익 유지" }] : [];
  const cashPts = r.series.map((x) => ({ x: x.year, y: x.cumulativeCash }));

  const memo = () =>
    [
      "[인수 검토]",
      `인수가 ${exactWon(s.price)}(주식 ${pct1(s.stockPortion)}, 차입 ${pct1(1 - s.stockPortion)} @${pct1(s.debtRate)}), 대상 순이익 ${exactWon(s.targetNetIncome)} → 인수 PER ${r.impliedPe ?? "-"}배 (우리 PER ${r.acquirerPe ?? "-"}배)`,
      `시너지 연 ${exactWon(s.synergy)}(${s.rampYears}년에 걸쳐), 통합비 ${exactWon(s.integrationCost)}`,
      `신주 ${r.newShares.toLocaleString("ko-KR")}주, 세후 이자 ${exactWon(r.interestAfterTax)}/년, 주당이익 ${r.epsBefore}원 → 1년차 ${pct1(r.year1Accretion)}, 시너지 완성 후 ${pct1(r.steadyAccretion)}`,
      `회수: ${r.paybackYear ? `${r.paybackYear}년차` : `${s.years ?? 7}년 안에 안 됨`}`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">거래 조건</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="인수 가격(지분 100%)" value={s.price} onChange={(v) => set({ price: v })} />
          <MoneyField label="대상 회사 연 순이익" value={s.targetNetIncome} onChange={(v) => set({ targetNetIncome: v })} allowNegative />
          <MoneyField label="우리 회사 연 순이익" value={s.acquirerNetIncome} onChange={(v) => set({ acquirerNetIncome: v })} allowNegative />
          <MoneyField label="연 시너지(다 나왔을 때, 세전)" value={s.synergy} onChange={(v) => set({ synergy: v })} hint="원료 단가 인하·물류 통합·중복 비용 제거" />
          <MoneyField label="통합 일회성 비용" value={s.integrationCost} onChange={(v) => set({ integrationCost: v })} />
          <RangeField label="시너지가 다 나오기까지" value={s.rampYears} min={1} max={5} onChange={(v) => set({ rampYears: v })} format={(v) => `${v}년`} />
        </div>
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="우리 회사 발행주식 수" value={s.acquirerShares} onChange={(v) => set({ acquirerShares: v })} suffix="주" step={100000} />
            <MoneyField label="우리 회사 주가" value={s.sharePrice} onChange={(v) => set({ sharePrice: v })} />
            <AssumptionSlider label="주식으로 내는 비율(나머지 차입)" unit="pct" value={s.stockPortion} range={[0, 1]} mode={mode} onChange={(v) => set({ stockPortion: v })} />
            <AssumptionSlider label="차입 이자율" unit="rate" value={s.debtRate} range={[0, 0.12]} mode={mode} onChange={(v) => set({ debtRate: v })} />
            <AssumptionSlider label="법인세율(지방세 포함)" unit="rate" value={s.taxRate} range={[0.09, 0.27]} mode={mode} onChange={(v) => set({ taxRate: v })} />
          </div>
        )}
        <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
      </section>

      <Verdict title="결론">
        이익 대비 인수 가격은 <b>{r.impliedPe ?? "-"}배</b>{r.acquirerPe ? <>(우리 회사 {r.acquirerPe}배)</> : null}예요. 주당이익은 1년차 <b>{pct1(r.year1Accretion)}</b>, 시너지가 다 나오면 <b>{pct1(r.steadyAccretion)}</b> {r.steadyAccretion >= 0 ? "늘어요" : "줄어요"}.{" "}
        인수 대금과 통합 비용은 {r.paybackYear ? <><b>{r.paybackYear}년차</b>에 회수돼요.</> : <><b>{s.years ?? 7}년 안에 회수되지 않아요</b>.</>}
        {r.synergyForBreakeven > 0 && <span className="mt-1 block text-sm text-warning-foreground">1년차 주당이익을 지키려면 연 시너지(완성 기준)가 {money(r.synergyForBreakeven)} 이상 필요해요.</span>}
        <span className="mt-1 block text-sm text-muted-foreground">영향 부서: 재무(자금 조달·연결 결산), 구매·생산(원료 통합), 품질(기준 통일), 인사(핵심 인력 유지), 법무(공정위 기업결합 신고: 공정거래법 제11조).</span>
      </Verdict>

      <SweepChart title="시너지 크기에 따라 주당이익은?" caption="0 위면 인수가 주주에게 이득이에요. 점을 눌러 시너지를 바꿔요." points={pts} current={{ x: s.synergy, y: r.steadyAccretion }} marks={marks} formatX={roughWon} formatY={pct1} xLabel="연 시너지" yLabel="주당이익 변화" onPick={(v) => set({ synergy: Math.round(v / 1_000_000) * 1_000_000 })} />
      <SweepChart title="누적 회수(0 위로 올라가면 회수 끝)" points={cashPts} current={cashPts[(r.paybackYear ?? cashPts.length) - 1] ?? cashPts[0]} formatX={(v) => `${Math.round(v)}년`} formatY={roughWon} xLabel="연차" yLabel="누적 현금" />
      <GanttChart
        title="인수 후 통합(PMI) 첫 100일 기본 일정"
        caption={`핵심 경로 ${pmi.criticalPath.length}개 작업, 약 ${Math.round(pmi.duration)}일. 자세한 조정은 타임라인 도구에서 해요.`}
        rows={pmi.tasks.map((t) => ({ id: t.id, name: t.name, start: t.es, end: t.ef, slack: t.slack, critical: t.critical, milestone: t.milestone }))}
        total={pmi.duration}
        formatDay={(d) => `${Math.round(d)}일`}
      />
      <p className="text-xs text-muted-foreground"><a className="underline" href="/ko/project-timeline-planner/">타임라인·마일스톤 관리</a>에서 통합 일정을 직접 바꿀 수 있어요.</p>
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
