// 가중 의사결정표 + RICE 우선순위 (2026-11-14). 계산: lib/biz-strategy.ts(weightedDecision·riceScores).
import { riceScores, weightedDecision, type RiceItem } from "../../../lib/biz-strategy";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, SmallButton, TextField, Verdict, pct0, useSaved } from "./common";

const TOOL_ID = "priority-decision-matrix";

interface Table {
  criteria: { name: string; weight: number }[];
  options: { name: string; scores: number[] }[];
}
const EXAMPLE: Table = {
  criteria: [{ name: "비용", weight: 3 }, { name: "속도", weight: 2 }, { name: "고객 가치", weight: 3 }, { name: "위험", weight: 1 }],
  options: [
    { name: "외주 개발", scores: [2, 5, 3, 3] },
    { name: "직원 채용", scores: [3, 2, 4, 3] },
    { name: "노코드 도구", scores: [5, 4, 2, 4] },
  ],
};
const RICE_EXAMPLE: RiceItem[] = [
  { name: "가입 절차 줄이기", reach: 3000, impact: 1, confidence: 0.8, effort: 1 },
  { name: "추천인 보상", reach: 1200, impact: 2, confidence: 0.5, effort: 2 },
  { name: "앱 다크 모드", reach: 5000, impact: 0.25, confidence: 0.9, effort: 1 },
  { name: "B2B 대시보드", reach: 80, impact: 3, confidence: 0.6, effort: 4 },
];
const WEIGHT_CHIPS = [{ value: "1", label: "덜 중요" }, { value: "2", label: "보통" }, { value: "3", label: "매우 중요" }];
const IMPACT_CHIPS = [{ value: "0.25", label: "아주 작음" }, { value: "0.5", label: "작음" }, { value: "1", label: "보통" }, { value: "2", label: "큼" }, { value: "3", label: "아주 큼" }];

export default function PriorityMatrix() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [tab, setTab] = useSaved<"matrix" | "rice">("pm-tab", "matrix");
  const [t, setT, resetT] = useSaved<Table>("pm-table", EXAMPLE);
  const [rice, setRice, resetRice] = useSaved<RiceItem[]>("pm-rice", RICE_EXAMPLE);
  const easy = mode === "easy";
  const r = weightedDecision(t.criteria, t.options);
  const rs = riceScores(rice);
  const setScore = (oi: number, ci: number, v: number) => setT({ ...t, options: t.options.map((o, i) => (i === oi ? { ...o, scores: t.criteria.map((_, k) => (k === ci ? v : o.scores[k] ?? 3)) } : o)) });
  const setRiceItem = (i: number, p: Partial<RiceItem>) => setRice(rice.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const gap = r.ranked.length > 1 ? r.ranked[0].total - r.ranked[1].total : 0;
  const flips = r.flips.filter((f) => f.weightNeeded !== null);

  const memo = () =>
    tab === "matrix"
      ? [
          "[가중 의사결정표]",
          `기준(가중치): ${t.criteria.map((c, i) => `${c.name} ${pct0(r.weights[i])}`).join(", ")}`,
          ...r.ranked.map((x, i) => `${i + 1}. ${x.name} ${x.total.toFixed(2)}점`),
          ...flips.map((f) => `- '${f.criterion}' 가중치가 ${pct0(f.weightNeeded!)}가 되면 1·2위가 바뀜`),
          `https://tools.oiyo.net/ko/${TOOL_ID}/`,
        ].join("\n")
      : ["[RICE 우선순위]", ...rs.map((x, i) => `${i + 1}. ${x.name}: ${x.score} (도달 ${x.reach}, 영향 ${x.impact}, 확신 ${pct0(x.confidence)}, 노력 ${x.effort}인·월)`), `https://tools.oiyo.net/ko/${TOOL_ID}/`].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <ChoiceChips legend="무엇을 할까요?" value={tab} options={[{ value: "matrix", label: "선택지 비교(가중 의사결정표)" }, { value: "rice", label: "할 일 우선순위(RICE)" }] as const} onChange={setTab} />

      {tab === "matrix" ? (
        <>
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">기준과 중요도</h2>
            {t.criteria.map((c, ci) => (
              <div key={ci} className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-background p-3">
                <div className="min-w-40 flex-1"><TextField label={`기준 ${ci + 1}`} value={c.name} onChange={(v) => setT({ ...t, criteria: t.criteria.map((x, i) => (i === ci ? { ...x, name: v } : x)) })} /></div>
                {easy ? (
                  <ChoiceChips legend="중요도" value={String(Math.min(3, Math.max(1, Math.round(c.weight))))} options={WEIGHT_CHIPS} onChange={(v) => setT({ ...t, criteria: t.criteria.map((x, i) => (i === ci ? { ...x, weight: Number(v) } : x)) })} />
                ) : (
                  <div className="w-32"><NumberField label="가중치" value={c.weight} onChange={(v) => setT({ ...t, criteria: t.criteria.map((x, i) => (i === ci ? { ...x, weight: v } : x)) })} step={0.5} /></div>
                )}
                {t.criteria.length > 1 && <SmallButton tone="danger" label={`${c.name} 기준 지우기`} onClick={() => setT({ criteria: t.criteria.filter((_, i) => i !== ci), options: t.options.map((o) => ({ ...o, scores: o.scores.filter((_, k) => k !== ci) })) })}>삭제</SmallButton>}
              </div>
            ))}
            <SmallButton onClick={() => setT({ criteria: [...t.criteria, { name: "새 기준", weight: 2 }], options: t.options.map((o) => ({ ...o, scores: [...o.scores, 3] })) })}>기준 추가</SmallButton>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground">선택지 점수(1 나쁨 ~ 5 좋음)</h2>
            {t.options.map((o, oi) => (
              <div key={oi} className="space-y-2 rounded-md border border-border bg-background p-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1"><TextField label={`선택지 ${oi + 1}`} value={o.name} onChange={(v) => setT({ ...t, options: t.options.map((x, i) => (i === oi ? { ...x, name: v } : x)) })} /></div>
                  {t.options.length > 2 && <SmallButton tone="danger" label={`${o.name} 지우기`} onClick={() => setT({ ...t, options: t.options.filter((_, i) => i !== oi) })}>삭제</SmallButton>}
                </div>
                {t.criteria.map((c, ci) => (
                  <div key={ci} className="flex flex-wrap items-center gap-2">
                    <span className="w-24 text-sm text-muted-foreground">{c.name}</span>
                    <div className="flex gap-1" role="group" aria-label={`${o.name} ${c.name} 점수`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" aria-pressed={(o.scores[ci] ?? 3) === n} onClick={() => setScore(oi, ci, n)}
                          className={"size-11 rounded-md border text-sm font-semibold " + ((o.scores[ci] ?? 3) === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground")}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {t.options.length < 6 && <SmallButton onClick={() => setT({ ...t, options: [...t.options, { name: `선택지 ${t.options.length + 1}`, scores: t.criteria.map(() => 3) }] })}>선택지 추가</SmallButton>}
              <SmallButton onClick={resetT}>예시로 되돌리기</SmallButton>
            </div>
          </section>

          <Verdict title="결론">
            <b>{r.ranked[0]?.name}</b>이 {r.ranked[0]?.total.toFixed(2)}점으로 1위예요{r.ranked[1] && <>, 2위 {r.ranked[1].name}과 {gap.toFixed(2)}점 차이</>}.{" "}
            {gap < 0.3 && r.ranked.length > 1 ? "차이가 작아 기준 중요도를 조금만 바꿔도 순위가 바뀌어요. 팀이 가장 중요하게 보는 기준을 다시 확인해요." : "차이가 꽤 있어 결론이 안정적이에요."}
          </Verdict>
          <CompareBars title="가중 점수" caption="중요도를 비율로 바꿔(합 100%) 점수에 곱해 더했어요." items={r.rows.map((x) => ({ label: x.name, value: x.total, current: x.name === r.ranked[0]?.name }))} format={(n) => `${n.toFixed(2)}점`} />
          {!easy && (
            <section>
              <h2 className="text-base font-bold text-foreground">순위가 뒤집히는 가중치</h2>
              <p className="text-sm text-muted-foreground">다른 기준의 비율은 그대로 두고 이 기준 하나의 비중만 바꿀 때, 1위와 2위가 같아지는 비중이에요.</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {r.flips.map((f, i) => (
                  <li key={f.criterion}>{f.criterion}: 지금 {pct0(r.weights[i])} → {f.weightNeeded === null ? "어떻게 바꿔도 안 뒤집혀요" : <b>{pct0(f.weightNeeded)}</b>}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <>
          <p className="text-sm leading-6 text-muted-foreground">RICE 점수 = 도달(Reach) × 영향(Impact) × 확신(Confidence) ÷ 노력(Effort). 같은 기간(예: 한 분기) 기준으로 넣어요.</p>
          {rice.map((x, i) => (
            <div key={i} className="space-y-2 rounded-md border border-border bg-background p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1"><TextField label={`할 일 ${i + 1}`} value={x.name} onChange={(v) => setRiceItem(i, { name: v })} /></div>
                <SmallButton tone="danger" label={`${x.name} 지우기`} onClick={() => setRice(rice.filter((_, j) => j !== i))}>삭제</SmallButton>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <NumberField label="도달(분기에 영향받는 사람 수)" value={x.reach} onChange={(v) => setRiceItem(i, { reach: v })} step={100} />
                <NumberField label="확신(%)" value={Math.round(x.confidence * 100)} onChange={(v) => setRiceItem(i, { confidence: v / 100 })} step={10} />
                <NumberField label="노력(사람·달)" value={x.effort} onChange={(v) => setRiceItem(i, { effort: v })} step={0.5} />
              </div>
              <ChoiceChips legend="한 사람에게 주는 영향" value={String(x.impact)} options={IMPACT_CHIPS} onChange={(v) => setRiceItem(i, { impact: Number(v) })} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <SmallButton onClick={() => setRice([...rice, { name: "새 할 일", reach: 500, impact: 1, confidence: 0.5, effort: 1 }])}>할 일 추가</SmallButton>
            <SmallButton onClick={resetRice}>예시로 되돌리기</SmallButton>
          </div>
          {rs.length > 0 && (
            <Verdict title="먼저 할 일">
              <b>{rs[0].name}</b>(점수 {rs[0].score})부터 해요.{rs.length > 1 && <> 다음은 {rs.slice(1, 3).map((x) => x.name).join(", ")}.</>}
              <span className="mt-1 block text-sm text-muted-foreground">확신이 50% 아래인 일은 작은 실험으로 확신부터 올리면 점수가 빠르게 올라가요.</span>
            </Verdict>
          )}
          <CompareBars title="RICE 점수" items={rs.map((x, i) => ({ label: x.name, value: x.score, current: i === 0 }))} format={(n) => n.toLocaleString("ko-KR")} />
        </>
      )}
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
