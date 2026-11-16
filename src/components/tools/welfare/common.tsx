// 생활 지원금·노동권 도구 공용 조각 (2026-11-16). 그래프·모드는 ../viz/ 부품을 그대로 써요.
// 각 도구는 입력 칸과 결과 숫자만 정하고, "가정 바꿔 보기"(슬라이더·훑기 곡선·토네이도)는 ScenarioBlock이 그려요.
import { useMemo, useState, type ReactNode } from "react";
import { sweep, tornado, type Assumption } from "../../../lib/scenario";
import ChoiceChips from "../payroll/ChoiceChips";
import AssumptionSlider from "../viz/AssumptionSlider";
import SweepChart from "../viz/SweepChart";
import TornadoChart from "../viz/TornadoChart";
import { formatUnit, type AdvisoryMode } from "../viz/format";
import { track } from "../viz/track";

export { CopyMemo, useSaved } from "../biz/common";

interface ScenarioProps<I> {
  toolId: string;
  mode: AdvisoryMode;
  input: I;
  onSlide: (next: I) => void;
  assumptions: Assumption<I>[];
  evaluate: (i: I) => number;
  /** 슬라이더로 보여 줄 가정 key */
  sliders: string[];
  /** 끝까지 훑어 볼 가정 key(첫 값이 기본) */
  sweeps: string[];
  yLabel: string;
  formatY: (v: number) => string;
  caption?: (key: string) => string | undefined;
  /** 토네이도를 빼고 싶을 때(가정이 하나뿐인 도구) */
  noTornado?: boolean;
  /** 같은 화면에 두 번째로 둘 때 제목을 숨겨요 */
  hideHeading?: boolean;
}

/** 가정을 바꿔 보는 칸: 슬라이더 → 훑기 곡선(누르면 그 값으로) → 무엇이 가장 크게 흔드나 */
export function ScenarioBlock<I>({ toolId, mode, input, onSlide, assumptions, evaluate, sliders, sweeps, yLabel, formatY, caption, noTornado, hideHeading }: ScenarioProps<I>) {
  const easy = mode === "easy";
  const byKey = (k: string) => {
    const a = assumptions.find((x) => x.key === k);
    if (!a) throw new Error(`unknown assumption ${k}`);
    return a;
  };
  const [sweepKey, setSweepKey] = useState(sweeps[0]);
  const a = byKey(sweeps.includes(sweepKey) ? sweepKey : sweeps[0]);
  const range = a.range(a.get(input));
  const points = useMemo(() => sweep(input, a, evaluate, range, 80), [input, a, evaluate, range[0], range[1]]);
  const bars = useMemo(() => (noTornado ? [] : tornado(input, assumptions, evaluate)), [input, assumptions, evaluate, noTornado]);
  const slide = (k: string, v: number) => {
    onSlide(byKey(k).set(input, v));
    track("advisory_slider", { tool_id: toolId }, true);
  };
  return (
    <section aria-label="가정 바꿔 보기" className="space-y-3">
      <div className={hideHeading ? "sr-only" : undefined}>
        <h2 className="text-base font-semibold text-foreground">가정을 바꿔 보세요</h2>
        <p className="text-xs text-muted-foreground">슬라이더를 움직이면 위 결과와 아래 그래프가 같이 바뀌어요.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {sliders.map((k) => {
          const s = byKey(k);
          return <AssumptionSlider key={k} label={easy ? s.plain : s.label} unit={s.unit} value={s.get(input)} range={s.range(s.get(input))} onChange={(v) => slide(k, v)} mode={mode} marks={s.marks} />;
        })}
      </div>
      {sweeps.length > 1 && <ChoiceChips legend="한 가지 가정을 끝까지 바꿔 보기" value={a.key} options={sweeps.map((k) => ({ value: k, label: easy ? byKey(k).plain : byKey(k).label }))} onChange={setSweepKey} />}
      <SweepChart
        title={`${easy ? a.plain : a.label}에 따라 이렇게 바뀌어요`}
        caption={caption?.(a.key) ?? "그래프를 누르거나 끌면 그 값으로 바꿔 볼 수 있어요. 점선은 법이 바뀌는 지점이에요."}
        points={points}
        current={{ x: a.get(input), y: evaluate(input) }}
        marks={a.marks?.filter((m) => m.at >= range[0] && m.at <= range[1])}
        formatX={(v) => formatUnit(a.unit, v, "easy")}
        formatY={formatY}
        onPick={(x) => slide(a.key, a.unit === "pct" || a.unit === "rate" ? Math.round(x * 1000) / 1000 : x)}
        xLabel={easy ? a.plain : a.label}
        yLabel={yLabel}
      />
      {bars.length > 1 && <TornadoChart bars={bars} mode={mode} format={formatY} />}
    </section>
  );
}

/** 결과 카드: 쉬운 문장 → 숫자 → (쉬운 모드) 이유 */
export function ResultCard({ headline, reasons, easy, stats, children }: { headline: string; reasons: string[]; easy: boolean; stats: { label: string; value: string }[]; children?: ReactNode }) {
  return (
    <div className="space-y-3">
      <p aria-live="polite" className="text-lg font-semibold leading-7 text-foreground">
        {headline}
      </p>
      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-muted-foreground">{s.label}</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{s.value}</dd>
          </div>
        ))}
      </dl>
      {easy && reasons.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
          {reasons.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}

/** 어디서·언제 신청하나: 쉬운 모드에서 결과 아래에 */
export function HowToApply({ title = "이렇게 신청해요", items, note }: { title?: string; items: string[]; note?: string }) {
  return (
    <section aria-label={title} className="rounded-md bg-muted px-3 py-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-foreground">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ol>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </section>
  );
}

export const YES_NO = [
  { value: "yes", label: "예" },
  { value: "no", label: "아니요" },
] as const;
