// 타임라인·마일스톤 관리 (2026-11-14). CPM 핵심 경로 + 간트, 전문가 모드는 PERT 3점 추정과 마감 확률.
// 계산: lib/biz-strategy.ts(scheduleCpm·slipImpact·deadlineProbability·addDays).
import { useMemo, useState } from "react";
import { addDays, deadlineProbability, scheduleCpm, slipImpact, type ScheduleTask } from "../../../lib/biz-strategy";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import GanttChart from "../viz/GanttChart";
import ModeToggle from "../viz/ModeToggle";
import SweepChart from "../viz/SweepChart";
import Term from "../viz/Term";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, RangeField, SmallButton, TextField, Verdict, pct0, uid, useSaved } from "./common";

const TOOL_ID = "project-timeline-planner";

type T = ScheduleTask;
const t = (id: string, name: string, duration: number, deps: string[] = [], optimistic?: number, pessimistic?: number): T => ({ id, name, duration, deps, optimistic, pessimistic });
const TEMPLATES = {
  corp: { label: "법인 설립", tasks: [t("a", "상호·사업목적 정하기", 2), t("b", "정관 작성", 3, ["a"]), t("c", "자본금 납입·잔고증명", 2, ["a"]), t("d", "법인 설립등기", 5, ["b", "c"], 3, 10), t("e", "사업자등록", 3, ["d"], 2, 7), t("f", "법인 통장·카드 개설", 2, ["e"]), t("g", "4대보험 사업장 신고", 3, ["e"]), t("h", "영업 시작", 0, ["f", "g"])] },
  launch: { label: "서비스 출시", tasks: [t("a", "고객 인터뷰", 10, [], 7, 15), t("b", "요구사항 정리", 5, ["a"]), t("c", "디자인", 10, ["b"], 7, 18), t("d", "개발", 30, ["b"], 20, 50), t("e", "결제·약관 준비", 7, ["b"]), t("f", "테스트(QA)", 7, ["c", "d"], 5, 14), t("g", "스토어 심사", 5, ["e", "f"], 2, 14), t("h", "마케팅 준비", 14, ["c"]), t("i", "출시", 0, ["g", "h"])] },
  seed: { label: "시드 투자 유치", tasks: [t("a", "핵심 지표 정리", 5), t("b", "IR 자료 작성", 7, ["a"]), t("c", "투자자 목록 만들기", 3), t("d", "첫 미팅 돌기", 20, ["b", "c"], 10, 40), t("e", "실사 대응", 15, ["d"], 10, 30), t("f", "투자 조건 협상", 10, ["d"], 5, 20), t("g", "계약·납입", 10, ["e", "f"], 5, 20), t("h", "투자 완료", 0, ["g"])] },
  closing: { label: "연말 결산·법인세", tasks: [t("a", "재고 실사", 2), t("b", "채권·채무 잔액 확인", 5), t("c", "결산 분개·감가상각", 5, ["a", "b"]), t("d", "세무조정", 10, ["c"], 7, 15), t("e", "재무제표 확정·주총", 5, ["c"]), t("f", "법인세 신고", 3, ["d", "e"]), t("g", "신고 완료", 0, ["f"])] },
} as const;
type TemplateKey = keyof typeof TEMPLATES;

const d1 = (n: number) => String(Math.round(n * 10) / 10);
const today = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

export default function ProjectTimeline() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [tasks, setTasks] = useSaved<T[]>("tl-tasks", TEMPLATES.launch.tasks.map((x) => ({ ...x, deps: [...(x.deps ?? [])] })));
  const [start, setStart] = useSaved("tl-start", today());
  const [workdays, setWorkdays] = useSaved("tl-workdays", true);
  const [deadline, setDeadline] = useSaved("tl-deadline", 0);
  const [slipId, setSlipId] = useState<string>("");
  const [slip, setSlip] = useState(5);
  const easy = mode === "easy";

  // 쉬운 모드는 낙관·비관을 쓰지 않아요(보통 기간만).
  const used = useMemo(() => (easy ? tasks.map((x) => ({ ...x, optimistic: undefined, pessimistic: undefined })) : tasks), [tasks, easy]);
  const r = useMemo(() => scheduleCpm(used), [used]);
  const day = (n: number) => addDays(start, n, workdays);
  const md = (n: number) => day(n).slice(5).replace("-", "/");
  const finish = (ef: number, es: number) => (ef > es ? day(Math.ceil(ef) - 1) : day(es));
  const endDate = finish(r.duration, 0);
  const crit = r.criticalPath.map((id) => r.tasks.find((x) => x.id === id)!.name);
  const slipTask = r.tasks.find((x) => x.id === slipId) ?? r.tasks.find((x) => !x.critical && !x.milestone) ?? r.tasks[0];
  const impact = slipTask ? slipImpact(used, slipTask.id, slip) : null;
  const unit = workdays ? "작업일" : "일";
  const prob = deadline > 0 ? deadlineProbability(r.duration, r.stdDev, deadline) : null;
  const probPts = useMemo(() => {
    if (r.stdDev <= 0) return [];
    const lo = Math.max(0, r.duration - 3 * r.stdDev);
    const hi = r.duration + 3 * r.stdDev;
    return Array.from({ length: 41 }, (_, k) => {
      const x = lo + ((hi - lo) * k) / 40;
      return { x, y: deadlineProbability(r.duration, r.stdDev, x) };
    });
  }, [r.duration, r.stdDev]);

  const patch = (id: string, p: Partial<T>) => setTasks(tasks.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const remove = (id: string) => setTasks(tasks.filter((x) => x.id !== id).map((x) => ({ ...x, deps: (x.deps ?? []).filter((d) => d !== id) })));
  const toggleDep = (id: string, dep: string) => {
    const cur = tasks.find((x) => x.id === id)!;
    const deps = cur.deps ?? [];
    patch(id, { deps: deps.includes(dep) ? deps.filter((d) => d !== dep) : [...deps, dep] });
  };

  const memo = () =>
    [
      `[타임라인] 시작 ${start}(${unit} 기준), 예상 완료 ${endDate}, 전체 ${d1(r.duration)}${unit}`,
      `핵심 경로: ${crit.join(" → ")}`,
      ...r.tasks.map((x) => `- ${x.name}: ${day(x.es)} ~ ${finish(x.ef, x.es)}${x.critical ? " [핵심]" : ` (여유 ${d1(x.slack)}${unit})`}${x.owner ? ` · 담당 ${x.owner}` : ""}`),
      prob !== null ? `마감 ${deadline}${unit} 안에 끝낼 확률(PERT) ${pct0(prob)}` : "",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].filter(Boolean).join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <ChoiceChips<TemplateKey | "">
        legend="예시로 시작하기(지금 목록을 바꿔요)"
        value=""
        options={(Object.keys(TEMPLATES) as TemplateKey[]).map((k) => ({ value: k, label: TEMPLATES[k].label }))}
        onChange={(k) => k && setTasks(TEMPLATES[k].tasks.map((x) => ({ ...x, deps: [...(x.deps ?? [])] })))}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-muted-foreground">시작일</span>
          <input type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground" />
        </label>
        <ChoiceChips legend="날짜 세는 방법" value={workdays ? "work" : "cal"} options={[{ value: "work", label: "주말 빼고" }, { value: "cal", label: "달력 그대로" }] as const} onChange={(v) => setWorkdays(v === "work")} />
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">할 일</h2>
        <ol className="space-y-3">
          {tasks.map((x, i) => (
            <li key={x.id} className="space-y-2 rounded-md border border-border bg-background p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1"><TextField label={`${i + 1}. 할 일`} value={x.name} onChange={(v) => patch(x.id, { name: v })} /></div>
                <SmallButton tone="danger" label={`${x.name} 지우기`} onClick={() => remove(x.id)}>삭제</SmallButton>
              </div>
              <div className={"grid gap-2 " + (easy ? "sm:grid-cols-2" : "sm:grid-cols-4")}>
                <NumberField label={easy ? `걸리는 기간(${unit}, 0이면 마일스톤)` : `보통(${unit})`} value={x.duration} onChange={(v) => patch(x.id, { duration: v })} step={1} />
                {!easy && <NumberField label="가장 빠르면" value={x.optimistic ?? x.duration} onChange={(v) => patch(x.id, { optimistic: v })} step={1} />}
                {!easy && <NumberField label="가장 늦으면" value={x.pessimistic ?? x.duration} onChange={(v) => patch(x.id, { pessimistic: v })} step={1} />}
                <TextField label="담당" value={x.owner ?? ""} onChange={(v) => patch(x.id, { owner: v })} />
              </div>
              {i > 0 && (
                <fieldset>
                  <legend className="text-sm font-medium text-muted-foreground">먼저 끝나야 하는 일</legend>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {tasks.slice(0, i).map((d) => (
                      <button key={d.id} type="button" aria-pressed={(x.deps ?? []).includes(d.id)} onClick={() => toggleDep(x.id, d.id)}
                        className={"min-h-11 rounded-full border px-3 text-sm " + ((x.deps ?? []).includes(d.id) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted")}>
                        {d.name}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
            </li>
          ))}
        </ol>
        <SmallButton onClick={() => setTasks([...tasks, { id: uid(), name: "새 할 일", duration: 5, deps: tasks.length ? [tasks[tasks.length - 1].id] : [] }])}>할 일 추가</SmallButton>
        {r.errors.map((e) => <p key={e} className="text-sm text-destructive">{e}</p>)}
      </section>

      <Verdict title="결론">
        <b>{endDate}</b>에 끝날 것으로 보여요({d1(r.duration)}{unit}). <Term k="핵심경로">핵심 경로</Term>는 <b>{crit.join(" → ")}</b>예요. 이 일들이 하루 늦으면 전체도 하루 늦어요.
        {r.tasks.some((x) => x.slack > 0) && <span className="mt-1 block text-sm text-muted-foreground">여유가 가장 많은 일: {[...r.tasks].sort((a, b) => b.slack - a.slack)[0].name} ({d1([...r.tasks].sort((a, b) => b.slack - a.slack)[0].slack)}{unit})</span>}
      </Verdict>

      <GanttChart
        title="간트 차트"
        caption={`가로는 날짜(${start} 시작), 옅은 꼬리는 늦어져도 되는 여유예요.`}
        rows={r.tasks.map((x) => ({ id: x.id, name: x.name, start: x.es, end: x.ef, slack: x.slack, critical: x.critical, milestone: x.milestone, progress: x.progress }))}
        total={r.duration}
        formatDay={md}
        deadline={!easy && deadline > 0 ? deadline : undefined}
        highlight={slipTask?.id}
      />

      {slipTask && (
        <section className="space-y-3 rounded-md border border-border bg-background p-3">
          <h2 className="text-base font-bold text-foreground">이 일이 늦어지면?</h2>
          <ChoiceChips legend="늦어질 것 같은 일" value={slipTask.id} options={r.tasks.filter((x) => !x.milestone).map((x) => ({ value: x.id, label: x.name }))} onChange={setSlipId} />
          <RangeField label="늦어지는 기간" value={slip} min={0} max={30} format={(v) => `${v}${unit}`} onChange={(v) => { setSlip(v); track("advisory_slider", { tool_id: TOOL_ID }, true); }} />
          {impact && (
            <p className="text-sm leading-6 text-foreground">
              '{slipTask.name}'이 {slip}{unit} 늦어지면 전체 완료는{" "}
              {impact.projectDelay > 0 ? <b className="text-destructive">{d1(impact.projectDelay)}{unit} 밀려 {finish(impact.after, 0)}</b> : <b>그대로예요(여유 {d1(slipTask.slack)}{unit} 안)</b>}.
            </p>
          )}
        </section>
      )}

      {!easy && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground"><Term k="PERT">PERT</Term> 마감 확률</h2>
          <NumberField label={`마감(시작부터 ${unit}, 0이면 끔)`} value={deadline} onChange={setDeadline} step={1} />
          {r.stdDev > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">기대 기간 {d1(r.duration)}{unit}, 표준편차 {r.stdDev.toFixed(1)}{unit}(핵심 경로 기준).{prob !== null && <> 마감 안에 끝낼 확률 <b className="text-foreground">{pct0(prob)}</b>.</>}</p>
              <SweepChart
                title="마감을 언제로 잡으면 지킬 수 있나요?"
                caption="마감일(가로)별로 그 안에 끝낼 확률이에요. 85% 이상이 되는 날을 외부 약속일로 잡는 경우가 많아요. 그래프를 눌러 마감을 정해요."
                points={probPts}
                current={{ x: deadline > 0 ? deadline : r.duration, y: deadlineProbability(r.duration, r.stdDev, deadline > 0 ? deadline : r.duration) }}
                marks={[{ at: r.duration, label: "기대 기간" }]}
                formatX={(v) => `${Math.round(v)}일`}
                formatY={pct0}
                xLabel={`마감(${unit})`}
                yLabel="지킬 확률"
                onPick={(x) => setDeadline(Math.round(x))}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">할 일마다 '가장 빠르면·가장 늦으면'을 다르게 넣으면 마감 확률을 계산해요.</p>
          )}
        </section>
      )}

      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
