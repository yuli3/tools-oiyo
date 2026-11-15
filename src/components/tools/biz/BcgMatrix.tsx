// BCG 매트릭스 (2026-11-14). 쉬운 모드: 시장 속도·1등과 비교를 골라요. 전문가 모드: 성장률·점유율·기준선 직접 입력.
import { BCG_LABEL, bcgMatrix, type BcgQuadrant, type BcgUnit } from "../../../lib/biz-strategy";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import QuadrantChart from "../viz/QuadrantChart";
import Term from "../viz/Term";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, SmallButton, TextField, Verdict, pct0, pct1, useSaved } from "./common";

const TOOL_ID = "bcg-matrix";
const EXAMPLE: BcgUnit[] = [
  { name: "오프라인 매장", revenue: 3_000_000_000, marketGrowth: 0.02, share: 0.18, rivalShare: 0.12 },
  { name: "온라인몰", revenue: 1_200_000_000, marketGrowth: 0.18, share: 0.09, rivalShare: 0.06 },
  { name: "구독 박스", revenue: 400_000_000, marketGrowth: 0.25, share: 0.02, rivalShare: 0.1 },
  { name: "B2B 납품", revenue: 300_000_000, marketGrowth: 0.01, share: 0.03, rivalShare: 0.2 },
];
const SPEED = [
  { value: "-0.03", label: "줄어듦" },
  { value: "0.03", label: "느림" },
  { value: "0.08", label: "보통" },
  { value: "0.15", label: "빠름" },
  { value: "0.3", label: "아주 빠름" },
];
const VS = [
  { value: "0.2", label: "훨씬 작음" },
  { value: "0.5", label: "작음" },
  { value: "1", label: "비슷" },
  { value: "1.5", label: "큼" },
  { value: "3", label: "훨씬 큼" },
];
const nearest = (opts: { value: string }[], v: number) => opts.reduce((a, b) => (Math.abs(Number(b.value) - v) < Math.abs(Number(a.value) - v) ? b : a)).value;
const TONE: Record<BcgQuadrant, "primary" | "success" | "warning" | "muted"> = { star: "primary", cashCow: "success", question: "warning", dog: "muted" };

export default function BcgMatrix() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [units, setUnits, reset] = useSaved<BcgUnit[]>("bcg-units", EXAMPLE);
  const [growthLine, setGrowthLine] = useSaved("bcg-growth-line", 0.1);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const r = bcgMatrix(units, easy ? 0.1 : growthLine, 1);
  const set = (i: number, p: Partial<BcgUnit>) => setUnits(units.map((u, j) => (j === i ? { ...u, ...p } : u)));
  const maxRev = Math.max(1, ...units.map((u) => u.revenue));
  const gs = units.map((u) => u.marketGrowth);
  const yDom: [number, number] = [Math.min(-0.05, ...gs) - 0.02, Math.max(0.3, ...gs) + 0.03];
  const rms = r.rows.map((x) => x.relativeShare);

  const memo = () =>
    [
      `[BCG 매트릭스] 성장률 기준 ${pct0(r.growthThreshold)}, 상대점유율 기준 1.0`,
      ...r.rows.map((x) => `- ${x.name}: 시장성장 ${pct1(x.marketGrowth)}, 상대점유율 ${x.relativeShare.toFixed(2)}, 매출 ${exactWon(x.revenue)} (${pct0(x.revenueShare)}) → ${BCG_LABEL[x.quadrant].name}`),
      `매출 구성: 스타 ${pct0(r.byQuadrant.star)}, 캐시카우 ${pct0(r.byQuadrant.cashCow)}, 물음표 ${pct0(r.byQuadrant.question)}, 개 ${pct0(r.byQuadrant.dog)}`,
      ...r.notes,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">사업·제품</h2>
        {units.map((u, i) => (
          <div key={i} className="space-y-3 rounded-md border border-border bg-background p-3">
            <div className="flex items-end gap-2">
              <div className="flex-1"><TextField label="이름" value={u.name} onChange={(v) => set(i, { name: v })} /></div>
              {units.length > 1 && <SmallButton tone="danger" label={`${u.name} 지우기`} onClick={() => setUnits(units.filter((_, j) => j !== i))}>삭제</SmallButton>}
            </div>
            <MoneyField label="연 매출(버블 크기)" value={u.revenue} onChange={(v) => set(i, { revenue: v })} />
            {easy ? (
              <>
                <ChoiceChips legend="이 시장은 얼마나 빨리 크나요?" value={nearest(SPEED, u.marketGrowth)} options={SPEED} onChange={(v) => set(i, { marketGrowth: Number(v) })} />
                <ChoiceChips legend="시장 1등(우리가 1등이면 2등)과 비교하면 우리 규모는?" value={nearest(VS, u.share / Math.max(1e-9, u.rivalShare))} options={VS} onChange={(v) => set(i, { share: Number(v), rivalShare: 1 })} />
              </>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3">
                <NumberField label="시장 성장률" value={Math.round(u.marketGrowth * 1000) / 10} onChange={(v) => set(i, { marketGrowth: v / 100 })} suffix="%" step={1} min={-100} />
                <NumberField label="우리 점유율" value={Math.round(u.share * 1000) / 10} onChange={(v) => set(i, { share: v / 100 })} suffix="%" step={0.5} />
                <NumberField label="최대 경쟁사 점유율" value={Math.round(u.rivalShare * 1000) / 10} onChange={(v) => set(i, { rivalShare: v / 100 })} suffix="%" step={0.5} />
              </div>
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {units.length < 10 && <SmallButton onClick={() => setUnits([...units, { name: `사업 ${units.length + 1}`, revenue: 500_000_000, marketGrowth: 0.08, share: 1, rivalShare: 1 }])}>사업 추가</SmallButton>}
          <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
        </div>
        {!easy && <NumberField label="고성장 기준(이 성장률 이상이면 위쪽)" value={Math.round(growthLine * 1000) / 10} onChange={(v) => setGrowthLine(v / 100)} suffix="%" step={1} min={-50} />}
      </section>

      <QuadrantChart
        title="BCG 매트릭스"
        caption="왼쪽일수록 시장 1등에 가깝고(상대 점유율, 로그 눈금), 위로 갈수록 시장이 빨리 커요. 버블 크기는 매출이에요."
        points={r.rows.map((x) => ({ label: x.name, x: x.relativeShare, y: x.marketGrowth, size: x.revenue / maxRev, tone: TONE[x.quadrant] }))}
        xDomain={[Math.min(0.1, ...rms) * 0.8, Math.max(4, ...rms) * 1.2]}
        yDomain={yDom}
        xSplit={1}
        ySplit={r.growthThreshold}
        logX
        reverseX
        xLabel="상대 점유율"
        yLabel="시장 성장률"
        quadrants={["스타", "물음표", "캐시카우", "개"]}
        formatX={(v) => `${v.toFixed(1)}배`}
        formatY={pct0}
      />

      <Verdict title="포트폴리오 진단">
        <ul className="space-y-1">
          {r.rows.map((x) => (
            <li key={x.name}><b>{x.name}</b> · {BCG_LABEL[x.quadrant].name}: {BCG_LABEL[x.quadrant].move}</li>
          ))}
        </ul>
        {r.notes.map((n) => <span key={n} className="mt-2 block text-sm text-warning-foreground">{n}</span>)}
      </Verdict>

      <CompareBars title="매출 구성" caption="캐시카우가 번 돈으로 스타·물음표를 키우는 균형이 이상적이에요." items={(Object.keys(BCG_LABEL) as BcgQuadrant[]).map((q) => ({ label: BCG_LABEL[q].name, value: r.byQuadrant[q] * 100 }))} format={(n) => `${Math.round(n)}%`} />
      <p className="text-xs text-muted-foreground"><Term k="상대점유율">상대 점유율</Term>이 1 이상이면 그 시장 1등이에요. 매출 합계 {money(units.reduce((s, u) => s + u.revenue, 0))}.</p>
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
