// 2027 연차 꿀조합 계산기 (2026-11-21). 계산: lib/leave-bridge.ts, 공휴일: lib/kr-business-day.ts
import { useMemo, useState } from "react";
import { bestByLeave, holidaySet, isOff, topEfficient, type BridgeWindow } from "../../lib/leave-bridge";
import CompareBars from "./viz/CompareBars";
import ModeToggle from "./viz/ModeToggle";
import { useAdvisoryMode } from "./viz/useAdvisoryMode";
import { track } from "./viz/track";

const YEAR = 2027;
const WD = ["일", "월", "화", "수", "목", "금", "토"];
const md = (d: string) => {
  const t = new Date(`${d}T00:00:00Z`);
  return `${t.getUTCMonth() + 1}/${t.getUTCDate()}(${WD[t.getUTCDay()]})`;
};
const range = (w: BridgeWindow) => `${md(w.start)} ~ ${md(w.end)}`;

function YearStrip({ pick, extra, skip, saturdayWork }: { pick: BridgeWindow | null; extra: string[]; skip: string[]; saturdayWork: boolean }) {
  const hol = useMemo(() => holidaySet(YEAR, extra, skip), [extra.join(), skip.join()]);
  const leave = new Set(pick?.leave ?? []);
  const months = Array.from({ length: 12 }, (_, m) => {
    const n = new Date(Date.UTC(YEAR, m + 1, 0)).getUTCDate();
    return Array.from({ length: n }, (_, i) => `${YEAR}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`);
  });
  const inPick = (d: string) => !!pick && d >= pick.start && d <= pick.end;
  return (
    <figure className="rounded-xl border border-border bg-card p-3">
      <figcaption className="mb-2 text-sm font-semibold text-foreground">2027년 한눈에 보기</figcaption>
      <div className="space-y-1">
        {months.map((days, m) => (
          <div key={m} className="flex items-center gap-1">
            <span className="w-7 shrink-0 text-right text-xs text-muted-foreground">{m + 1}월</span>
            <div className="grid flex-1 grid-cols-31 gap-px">
              {days.map((d) => {
                const tone = leave.has(d) ? "bg-primary" : inPick(d) ? "bg-primary/50" : hol.has(d) ? "bg-destructive/60" : isOff(d, hol, saturdayWork) ? "bg-muted-foreground/30" : "bg-muted";
                return <span key={d} title={md(d)} className={`h-3 rounded-sm ${tone}`} />;
              })}
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <li className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-destructive/60" />공휴일</li>
        <li className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-muted-foreground/30" />주말</li>
        <li className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-primary" />연차</li>
        <li className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-primary/50" />고른 연휴</li>
      </ul>
    </figure>
  );
}

export default function LeaveBridge2027() {
  const [mode, setMode] = useAdvisoryMode("annual-leave-combo-2027");
  const [budget, setBudget] = useState(3);
  const [extra, setExtra] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [saturdayWork, setSaturdayWork] = useState(false);
  const [may3, setMay3] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const easy = mode === "easy";
  const opts = useMemo(
    () => ({ extra: easy ? [] : [...extra, ...(may3 ? ["2027-05-03"] : [])], saturdayWork: !easy && saturdayWork }),
    [easy, extra.join(), saturdayWork, may3],
  );
  const best = useMemo(() => bestByLeave(YEAR, 10, opts), [opts]);
  const combos = useMemo(() => topEfficient(YEAR, budget, 12, opts), [budget, opts]);
  const top = best[budget - 1]?.best ?? null;
  const pick = combos.find((w) => w.start === picked) ?? top;
  const onBudget = (v: number) => {
    setBudget(v);
    setPicked(null);
    track("tool_input", { tool_id: "annual-leave-combo-2027", mode }, true);
  };

  return (
    <div className="space-y-5" data-tool="annual-leave-combo-2027">
      <ModeToggle mode={mode} onChange={setMode} />

      <label className="block">
        <span className="text-sm font-medium text-muted-foreground">한 번에 쓸 수 있는 연차</span>
        <div className="mt-1 flex items-center gap-3">
          <input type="range" min={1} max={10} value={budget} onChange={(e) => onBudget(Number(e.target.value))} className="min-h-11 flex-1 accent-primary" aria-label="연차 일수" />
          <span className="w-12 text-right font-mono text-lg font-bold text-foreground">{budget}일</span>
        </div>
      </label>

      {!easy && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={saturdayWork} onChange={(e) => setSaturdayWork(e.target.checked)} className="h-5 w-5 accent-primary" />
            토요일에도 일해요
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={may3} onChange={(e) => setMay3(e.target.checked)} className="h-5 w-5 accent-primary" />
            5/3(월)도 쉬어요 (노동절 5/1이 토요일이라 대체휴일 여부 미확정 · 회사 휴무면 체크)
          </label>
          <div>
            <span className="text-sm font-medium text-muted-foreground">회사 휴무일 더하기 (창립기념일·전사 휴무 등)</span>
            <div className="mt-1 flex gap-2">
              <input type="date" min="2027-01-01" max="2027-12-31" value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-11 flex-1 rounded-md border border-border bg-background px-3 text-base text-foreground" />
              <button type="button" className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => { if (draft && !extra.includes(draft)) setExtra([...extra, draft].sort()); setDraft(""); }}>
                더하기
              </button>
            </div>
            {extra.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {extra.map((d) => (
                  <li key={d}>
                    <button type="button" className="min-h-11 rounded-full border border-border px-3 text-sm text-foreground hover:bg-muted" onClick={() => setExtra(extra.filter((x) => x !== d))} aria-label={`${md(d)} 빼기`}>
                      {md(d)} ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <section aria-live="polite" className="rounded-xl border border-primary bg-primary/10 p-4">
        {top ? (
          <p className="text-sm leading-relaxed text-foreground">
            연차 <b>{top.leave.length}일</b>({top.leave.map(md).join(", ")})을 쓰면 <b>{range(top)}</b> <b className="text-primary">{top.days}일</b> 연속으로 쉴 수 있어요.
          </p>
        ) : (
          <p className="text-sm text-foreground">조건에 맞는 연휴가 없어요.</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">연차 {budget}일 이하 꿀조합 (효율 좋은 순서로 고른 뒤 날짜순)</h2>
        <ul className="space-y-2">
          {combos.map((w) => (
            <li key={w.start}>
              <button type="button" aria-pressed={pick?.start === w.start} onClick={() => setPicked(w.start)}
                className={"flex min-h-11 w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-left " + (pick?.start === w.start ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted")}>
                <span className="text-sm font-semibold text-foreground">{range(w)}</span>
                <span className="text-sm text-muted-foreground">연차 {w.leave.length}일 → <b className="text-foreground">{w.days}일</b> 휴무</span>
                <span className="w-full text-xs text-muted-foreground">연차: {w.leave.map(md).join(", ")}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <YearStrip pick={pick} extra={opts.extra} skip={[]} saturdayWork={opts.saturdayWork} />

      <CompareBars
        title="연차를 며칠 쓰면 최장 며칠 쉬나요"
        caption="2027년 안에서 연차 일수별로 만들 수 있는 가장 긴 연속 휴무예요."
        format={(n) => `${n}일`}
        items={best.map((b) => ({ label: `연차 ${b.leave}일${b.best ? ` · ${md(b.best.start)}~` : ""}`, value: b.best?.days ?? 0, current: b.leave === budget }))}
      />
    </div>
  );
}
