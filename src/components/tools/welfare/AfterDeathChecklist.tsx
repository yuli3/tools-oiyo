// 사망 후 할 일 타임라인 (2026-11-20, 다음 10종 #3). 계산: lib/after-death-timeline-2026.ts (스킬 calc.mjs after-death와 같은 코드).
// 쉬운 모드: 가장 가까운 할 일 하나 → 날짜순 체크리스트(어디서·놓치면). 전문가: 안 날 따로, 가져갈 서류·근거 조문, 메모 복사.
import { useState } from "react";
import { AFTER_DEATH_AS_OF, PHASE_LABEL, afterDeathTimeline, daysFrom, type AfterDeathInput, type Phase } from "../../../lib/after-death-timeline-2026";
import DeadlineChart from "../viz/DeadlineChart";
import ModeToggle from "../viz/ModeToggle";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, useSaved } from "./common";

const TOOL_ID = "after-death-checklist";
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
type Flag = Exclude<keyof AfterDeathInput, "deathDate" | "knownDate">;
const FLAGS: { key: Flag; easy: string; pro: string }[] = [
  { key: "debts", easy: "빚이 재산보다 많을 수 있어요", pro: "채무 초과 가능성" },
  { key: "realEstate", easy: "집·땅이 있어요", pro: "부동산" },
  { key: "car", easy: "자동차가 있어요", pro: "자동차" },
  { key: "employed", easy: "회사에 다니셨어요", pro: "근로자(임금·퇴직금)" },
  { key: "workAccident", easy: "일하다 다치거나 병을 얻어 돌아가셨어요", pro: "업무상 재해 가능성" },
  { key: "business", easy: "가게·사업을 하셨어요", pro: "사업자등록" },
  { key: "otherIncome", easy: "월세·연금 같은 다른 소득이 있었어요", pro: "종합소득(사업·임대·연금 등)" },
  { key: "pension", easy: "국민연금을 내거나 받으셨어요", pro: "국민연금 가입·수급" },
  { key: "insurance", easy: "사망보험이 있을 수 있어요", pro: "사망보험금" },
  { key: "renting", easy: "가족이 함께 세 들어 살던 집이에요", pro: "주택 임차(동거 가족)" },
  { key: "abroad", easy: "돌아가신 분과 가족 모두 해외에 살아요", pro: "국외 주소(9개월)" },
];
const EXAMPLE: AfterDeathInput = { deathDate: "2026-11-01", knownDate: "", realEstate: true, pension: true, insurance: true };
const dday = (n: number) => (n < 0 ? `${-n}일 지남` : n === 0 ? "오늘까지" : `D-${n}`);

export default function AfterDeathChecklist() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<AfterDeathInput>("after-death-input", EXAMPLE);
  const [done, setDone] = useSaved<string[]>("after-death-done", []);
  const [delay, setDelay] = useState(0);
  const easy = mode === "easy";
  const today = todayIso();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(input.deathDate);
  const r = afterDeathTimeline(input, today);
  const open = r.tasks.filter((t) => !done.includes(t.id));
  const first = open.find((t) => t.due >= today) ?? open[0];
  const missed = open.filter((t) => t.due < today);
  const edit = (p: Partial<AfterDeathInput>) => setInput({ ...input, ...p });
  const toggleDone = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    if (!done.includes(id)) track("after_death_done", { tool_id: TOOL_ID, task: id }, true);
  };
  const rows = open.map((t) => ({ id: t.id, label: t.label, due: t.due, daysLeft: daysFrom(today, t.due), cite: t.cite }));
  const phases = (Object.keys(PHASE_LABEL) as Phase[]).map((p) => ({ p, items: r.tasks.filter((t) => t.phase === p) })).filter((x) => x.items.length);

  const reasons = [
    "사망신고와 상속포기는 '알게 된 날'부터, 세금은 '돌아가신 달의 말일'부터 세요.",
    "마지막 날이 토·일·공휴일이면 다음 평일까지예요.",
    "안심상속 원스톱 서비스를 사망신고 때 같이 신청하면 예금·빚·부동산·자동차·연금·보험을 한 번에 알 수 있어요.",
  ];
  if (input.debts) reasons.push("빚이 더 많을 수 있으면 조회 결과를 보고 3개월 안에 가정법원에 상속포기나 한정승인을 신청해요.");

  const memo = () =>
    [
      `[사망 후 할 일] 기준일 ${AFTER_DEATH_AS_OF}, 돌아가신 날 ${r.deathDate}${r.knownDate !== r.deathDate ? `, 안 날 ${r.knownDate}` : ""}`,
      ...r.tasks.map((t) => `${done.includes(t.id) ? "[v]" : "[ ]"} ${t.due} ${t.label} · ${t.where} · ${t.cite}`),
      ...r.noDeadline.map((x) => `[ ] (기한 없음) ${x.label} · ${x.where}`),
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">{easy ? "돌아가신 날" : "상속개시일(사망일)"}</span>
            <input type="date" value={input.deathDate} onChange={(e) => edit({ deathDate: e.target.value })} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
          </label>
          {!easy && (
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">사망·상속을 안 날(다를 때만)</span>
              <input type="date" value={input.knownDate ?? ""} onChange={(e) => edit({ knownDate: e.target.value })} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
            </label>
          )}
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-muted-foreground">{easy ? "해당하는 것을 눌러 주세요(모르면 그냥 두세요)" : "해당 사항"}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FLAGS.map((f) => {
              const on = !!input[f.key];
              return (
                <button key={f.key} type="button" aria-pressed={on} onClick={() => edit({ [f.key]: !on })} className={`min-h-11 rounded-full border px-3 text-sm ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                  {easy ? f.easy : f.pro}
                </button>
              );
            })}
          </div>
        </fieldset>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={!valid ? "돌아가신 날을 넣어 주세요." : first ? `지금 먼저 할 일은 ${first.label}, ${first.due}까지예요(${dday(daysFrom(today, first.due))}).` : "기한이 있는 일은 모두 챙기셨어요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "챙길 일", value: `${r.tasks.length}가지` },
            { label: "남은 일", value: `${open.length}가지` },
            { label: "기한 지난 일", value: `${missed.length}가지` },
          ]}
        />
        {valid && rows.length > 0 && (
          <>
            <DeadlineChart title="남은 기한" caption="오늘부터 남은 날이에요. 아래 슬라이더로 며칠 뒤에 움직이면 무엇을 놓치는지 봐요." rows={rows} delay={delay} cap={400} />
            <label className="block">
              <span className="text-sm text-muted-foreground">며칠 뒤에 시작하면? {delay}일</span>
              <input type="range" min={0} max={200} value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="mt-1 w-full" aria-label="며칠 뒤에 시작하면" />
            </label>
          </>
        )}
      </div>

      <section aria-labelledby="ad-list" className="space-y-4">
        <h2 id="ad-list" className="text-base font-semibold text-foreground">날짜순 할 일</h2>
        {phases.map(({ p, items }) => (
          <div key={p} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">{PHASE_LABEL[p]}</h3>
            <ul className="space-y-2">
              {items.map((t) => {
                const isDone = done.includes(t.id);
                const left = daysFrom(today, t.due);
                return (
                  <li key={t.id} className={`rounded-md border border-border bg-background p-3 text-sm ${isDone ? "opacity-60" : ""}`}>
                    <div className="flex items-start gap-3">
                      <input id={`ad-${t.id}`} type="checkbox" checked={isDone} onChange={() => toggleDone(t.id)} className="mt-1 h-5 w-5 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <label htmlFor={`ad-${t.id}`} className="flex flex-wrap items-baseline justify-between gap-x-2 font-semibold text-foreground">
                          <span className={isDone ? "line-through" : ""}>{t.label}</span>
                          <span className={`font-mono text-xs ${!isDone && left < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                            {t.due} · {isDone ? "했어요" : dday(left)}
                          </span>
                        </label>
                        <p className="text-xs text-muted-foreground">{t.from}{t.duty ? " · 꼭 해야 하는 신고" : " · 받을 권리(청구)"}</p>
                        <p className="text-xs text-foreground">어디서: {t.where}</p>
                        {!easy && <p className="text-xs text-foreground">가져갈 것: {t.bring.join(", ")}</p>}
                        <p className="text-xs text-muted-foreground">놓치면: {t.miss}</p>
                        {!easy && <p className="text-xs text-muted-foreground">근거: {t.cite}</p>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">기한은 없지만 챙길 것</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-foreground">
            {r.noDeadline.map((x) => (
              <li key={x.label}>
                {x.label} <span className="text-muted-foreground">({x.where})</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {easy ? (
        <HowToApply
          title="이 순서로 하면 덜 헤매요"
          items={[
            "장례를 마치면 주민센터에 사망신고를 하면서 안심상속 원스톱 서비스도 같이 신청해요.",
            "조회 결과(보통 몇 주)로 재산과 빚을 보고, 빚이 더 많으면 3개월 안에 상속포기·한정승인을 정해요.",
            "부동산·자동차·상속세처럼 6개월 기한인 일은 가족이 모여 나눌 방법을 정한 뒤 처리해요.",
          ]}
          note="법령 정보 안내예요. 판단이 어렵거나 가족 사이에 다툼이 있으면 대한법률구조공단 132, 세금은 국세청 126에 물어보세요."
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          <CopyMemo text={memo} />
          <button type="button" onClick={() => { reset(); setDone([]); }} className="min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
            예시로 되돌리기
          </button>
        </div>
      )}
      <p className="text-xs leading-5 text-muted-foreground">입력과 체크 표시는 이 브라우저에만 저장돼요. 기준일 {AFTER_DEATH_AS_OF}.</p>
    </div>
  );
}
