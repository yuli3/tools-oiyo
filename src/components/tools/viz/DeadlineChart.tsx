// 기한 막대 (2026-11-16). 오늘부터 각 기한까지 남은 날을 가로 막대로 보여 주고,
// "며칠 뒤에 움직이면?" 표시(delay)를 넘는 기한은 놓치는 것으로 칠해요. 길이는 1년에서 잘라요.
import BarTrack from "./BarTrack";
import ChartFrame from "./ChartFrame";

export interface DeadlineRow {
  id: string;
  label: string;
  due: string;
  daysLeft: number;
  cite: string;
  note?: string;
}

interface Props {
  title: string;
  caption?: string;
  rows: DeadlineRow[];
  /** 지금부터 움직이기까지 걸릴 날(가정) */
  delay?: number;
  cap?: number;
}

const dday = (n: number) => (n < 0 ? `${-n}일 지남` : n === 0 ? "오늘까지" : `D-${n}`);

export default function DeadlineChart({ title, caption, rows, delay = 0, cap = 365 }: Props) {
  const scale = Math.max(30, Math.min(cap, Math.max(delay, ...rows.map((r) => r.daysLeft))));
  const pos = (n: number) => (Math.min(Math.max(n, 0), scale) / scale) * 100;
  const table = [["기한", "마감일", "남은 날", "근거"], ...rows.map((r) => [r.label, r.due, dday(r.daysLeft), r.cite])];
  return (
    <ChartFrame title={title} caption={caption} table={table}>
      <ul className="space-y-3">
        {rows.map((r) => {
          const missed = r.daysLeft < 0 || r.daysLeft < delay;
          const tone = r.daysLeft < 0 ? "destructive" : missed ? "destructive" : r.daysLeft <= 14 ? "warning" : "primary";
          return (
            <li key={r.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs">
                <span className="font-semibold text-foreground">{r.label}</span>
                <span className={missed ? "font-semibold text-destructive" : "text-muted-foreground"}>
                  {r.due} · {dday(r.daysLeft)}
                  {r.daysLeft > scale ? " (1년 넘음)" : ""}
                  {missed && r.daysLeft >= 0 ? " · 그때 움직이면 놓쳐요" : ""}
                </span>
              </div>
              <BarTrack segments={[{ from: 0, to: r.daysLeft < 0 ? 100 : pos(r.daysLeft), tone }]} marker={delay > 0 ? pos(delay) : undefined} />
            </li>
          );
        })}
      </ul>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>오늘</span>
        <span>{scale >= cap ? "1년+" : `${scale}일 뒤`}</span>
      </div>
    </ChartFrame>
  );
}
