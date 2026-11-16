// 대체 원료 검토 (2026-11-16). 계산: lib/biz-ops.ts materialSwitch. 원가·품질·공급·속도 가중 점수와 절감·회수 기간.
import { materialSwitch, type MaterialInput } from "../../../lib/biz-ops";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import QuadrantChart from "../viz/QuadrantChart";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, RangeField, SmallButton, TextField, Verdict, useSaved } from "./common";

const TOOL_ID = "alternative-material-review";
const EXAMPLE: MaterialInput = {
  currentPrice: 18_000,
  annualVolume: 4_000,
  candidates: [
    { name: "공급사 B(국내)", unitPrice: 16_500, quality: 4, supply: 4, testWeeks: 6, testCost: 12_000_000 },
    { name: "공급사 C(수입)", unitPrice: 13_000, quality: 3, supply: 2, testWeeks: 10, testCost: 20_000_000, needsFiling: true },
    { name: "공급사 D(신규 원료)", unitPrice: 15_000, quality: 5, supply: 3, testWeeks: 14, testCost: 35_000_000, needsFiling: true },
  ],
  weights: { cost: 3, quality: 4, supply: 3, speed: 2 },
  filingWeeks: 8,
};
const W_LABEL = { cost: "원가", quality: "품질", supply: "공급 안정", speed: "빨리 쓸 수 있나" } as const;

export default function MaterialSwitch() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [s, setS, reset] = useSaved<MaterialInput>("material-switch", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const input = easy ? { ...s, weights: { cost: 1, quality: 1, supply: 1, speed: 1 } } : s;
  const r = materialSwitch(input);
  const best = r.ranked[0];
  const setC = (k: number, p: Partial<MaterialInput["candidates"][number]>) => setS({ ...s, candidates: s.candidates.map((c, j) => (j === k ? { ...c, ...p } : c)) });

  const memo = () =>
    [
      "[대체 원료 검토]",
      `현재 단가 ${exactWon(s.currentPrice)}, 연 사용량 ${s.annualVolume.toLocaleString("ko-KR")}${easy ? "" : `, 가중치 ${Object.entries(s.weights).map(([k, v]) => `${W_LABEL[k as keyof typeof W_LABEL]} ${v}`).join("·")}`}`,
      ...r.ranked.map((x, k) => `${k + 1}. ${x.name}: 점수 ${x.total}, 연 절감 ${exactWon(x.annualSaving)}, 승인까지 ${x.weeksToApproval}주, 시험비 회수 ${Number.isFinite(x.paybackMonths) ? `${x.paybackMonths}개월` : "불가"}`),
      ...r.warnings,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">지금 쓰는 원료</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="현재 단가(kg·개당)" value={s.currentPrice} onChange={(v) => setS({ ...s, currentPrice: v })} />
          <NumberField label="연 사용량" value={s.annualVolume} onChange={(v) => setS({ ...s, annualVolume: v })} step={100} />
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">후보 원료</h2>
        {s.candidates.map((c, k) => (
          <div key={k} className="space-y-2 rounded-md border border-border bg-background p-3">
            <div className="flex items-end gap-2">
              <div className="flex-1"><TextField label="후보" value={c.name} onChange={(v) => setC(k, { name: v })} /></div>
              {s.candidates.length > 1 && <SmallButton tone="danger" label={`${c.name} 지우기`} onClick={() => setS({ ...s, candidates: s.candidates.filter((_, j) => j !== k) })}>삭제</SmallButton>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <MoneyField label="단가" value={c.unitPrice} onChange={(v) => setC(k, { unitPrice: v })} />
              <MoneyField label="시험·인증 비용" value={c.testCost} onChange={(v) => setC(k, { testCost: v })} />
              <RangeField label="품질·성능(시험 결과)" value={c.quality} min={1} max={5} onChange={(v) => setC(k, { quality: v })} format={(v) => ["", "나쁨", "부족", "보통", "좋음", "아주 좋음"][v]} />
              <RangeField label="공급 안정성" value={c.supply} min={1} max={5} onChange={(v) => setC(k, { supply: v })} format={(v) => ["", "불안", "약함", "보통", "안정", "아주 안정"][v]} />
              <RangeField label="시험·인증 기간" value={c.testWeeks} min={0} max={52} onChange={(v) => setC(k, { testWeeks: v })} format={(v) => `${v}주`} />
              <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground">
                <input type="checkbox" className="size-5 accent-primary" checked={!!c.needsFiling} onChange={(e) => setC(k, { needsFiling: e.target.checked })} />
                전성분 표시·기능성 재심사 등 신고 필요
              </label>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {s.candidates.length < 8 && <SmallButton onClick={() => setS({ ...s, candidates: [...s.candidates, { name: `후보 ${s.candidates.length + 1}`, unitPrice: s.currentPrice, quality: 3, supply: 3, testWeeks: 8, testCost: 10_000_000 }] })}>후보 추가</SmallButton>}
          <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
        </div>
        {!easy && (
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(W_LABEL) as (keyof typeof W_LABEL)[]).map((k) => (
              <RangeField key={k} label={`가중치: ${W_LABEL[k]}`} value={s.weights[k]} min={0} max={5} onChange={(v) => setS({ ...s, weights: { ...s.weights, [k]: v } })} format={String} />
            ))}
            <RangeField label="신고가 필요하면 더할 기간" value={s.filingWeeks ?? 8} min={0} max={26} onChange={(v) => setS({ ...s, filingWeeks: v })} format={(v) => `${v}주`} />
          </div>
        )}
      </section>

      <Verdict title="결론">
        {best ? (
          <>
            <b>{best.name}</b>이(가) 가장 나아요(점수 {best.total}/5). 바꾸면 연 <b>{money(best.annualSaving)}</b>을 아끼고, 시험·인증까지 <b>{best.weeksToApproval}주</b>가 걸려요.{" "}
            {Number.isFinite(best.paybackMonths) ? <>시험 비용은 {best.paybackMonths}개월이면 회수돼요.</> : <>원가가 오히려 올라 시험 비용을 회수하지 못해요.</>}
          </>
        ) : <>후보를 넣어 주세요.</>}
        {r.warnings.map((w) => <span key={w} className="mt-1 block text-sm text-warning-foreground">{w}</span>)}
        <span className="mt-1 block text-sm text-muted-foreground">영향 부서: 품질(안정성·사용성 시험), 인허가(전성분·기능성 심사), 구매(계약·이중 조달), 생산(배합 변경), 마케팅(제품 표시 문구).</span>
      </Verdict>

      <QuadrantChart
        title="절감액 × 품질"
        caption="오른쪽 위가 싸고 좋은 원료예요. 점 크기는 승인까지 걸리는 기간이 짧을수록 커요."
        points={r.rows.map((x) => ({ label: x.name, x: x.annualSaving, y: x.quality, size: 1 / (1 + x.weeksToApproval / 10), tone: x.name === best?.name ? ("primary" as const) : x.quality < 3 ? ("warning" as const) : ("muted" as const) }))}
        xDomain={[Math.min(0, ...r.rows.map((x) => x.annualSaving)) * 1.2, Math.max(1, ...r.rows.map((x) => x.annualSaving)) * 1.2]}
        yDomain={[0.5, 5.5]}
        xSplit={0}
        ySplit={3}
        xLabel="연 절감액"
        yLabel="품질"
        quadrants={["비싸지만 좋음", "싸고 좋음", "비싸고 나쁨", "싸지만 나쁨"]}
        formatX={roughWon}
        formatY={(v) => v.toFixed(1)}
      />
      <CompareBars title="종합 점수" items={r.ranked.map((x, k) => ({ label: x.name, value: x.total, current: k === 0 }))} format={(v) => v.toFixed(2)} />
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
