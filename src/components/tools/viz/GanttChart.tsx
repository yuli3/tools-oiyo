import ChartFrame from "./ChartFrame";
import { useWidth } from "./useWidth";

export interface GanttRow {
  id: string;
  name: string;
  start: number;
  end: number;
  /** 늦게 시작해도 되는 여유(일). 여유 막대로 보여 줘요. */
  slack: number;
  critical: boolean;
  milestone: boolean;
  progress?: number;
}

interface Props {
  title: string;
  caption?: string;
  rows: GanttRow[];
  total: number;
  /** 0일차 → 화면 라벨(날짜) */
  formatDay: (d: number) => string;
  /** 마감선(일) */
  deadline?: number;
  highlight?: string;
}

const ROW = 30;
const TOP = 22;

/** 간트 차트: 핵심 경로는 진한 색, 여유는 옅은 꼬리, 마일스톤은 마름모. */
export default function GanttChart({ title, caption, rows, total, formatDay, deadline, highlight }: Props) {
  const [box, width] = useWidth<HTMLDivElement>();
  const W = Math.max(280, width);
  const nameW = Math.min(120, Math.round(W * 0.32));
  const span = Math.max(1, total, deadline ?? 0);
  const x = (d: number) => nameW + (d / span) * (W - nameW - 8);
  const H = TOP + rows.length * ROW + 18;
  const table = [["작업", "시작", "끝", "여유(일)", "핵심"], ...rows.map((r) => [r.name, formatDay(r.start), formatDay(r.end), String(Math.round(r.slack * 10) / 10), r.critical ? "예" : ""])];
  return (
    <ChartFrame title={title} caption={caption} table={table}>
      <div ref={box} className="w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" focusable="false">
          <text x={x(0)} y={14} className="fill-muted-foreground text-xs">{formatDay(0)}</text>
          <text x={x(span)} y={14} textAnchor="end" className="fill-muted-foreground text-xs">{formatDay(span)}</text>
          {rows.map((r, i) => {
            const y = TOP + i * ROW;
            const tone = r.critical ? "fill-primary" : "fill-muted-foreground";
            const strong = highlight === r.id;
            return (
              <g key={r.id}>
                {i % 2 === 0 && <rect x={0} y={y} width={W} height={ROW} className="fill-muted opacity-40" />}
                <text x={4} y={y + 19} className={"text-xs " + (strong || r.critical ? "fill-foreground font-semibold" : "fill-muted-foreground")}>
                  {r.name.length > 9 && nameW < 110 ? r.name.slice(0, 8) + "…" : r.name}
                </text>
                {r.milestone ? (
                  <path d={`M${x(r.start)},${y + 7} l8,8 l-8,8 l-8,-8 Z`} className={tone} />
                ) : (
                  <g>
                    {r.slack > 0 && <rect x={x(r.end)} y={y + 12} width={Math.max(0, x(r.end + r.slack) - x(r.end))} height={6} rx={2} className="fill-muted-foreground opacity-25" />}
                    <rect x={x(r.start)} y={y + 7} width={Math.max(3, x(r.end) - x(r.start))} height={16} rx={3} className={tone + (strong ? " opacity-100" : " opacity-85")} />
                    {r.progress ? <rect x={x(r.start)} y={y + 20} width={Math.max(0, (x(r.end) - x(r.start)) * Math.min(1, r.progress))} height={3} className="fill-success" /> : null}
                  </g>
                )}
              </g>
            );
          })}
          {deadline !== undefined && deadline > 0 && (
            <g>
              <line x1={x(deadline)} x2={x(deadline)} y1={TOP - 4} y2={H - 14} strokeDasharray="4 3" strokeWidth="1.5" className="stroke-destructive" />
              <text x={x(deadline)} y={H - 3} textAnchor="middle" className="fill-destructive text-xs font-semibold">마감</text>
            </g>
          )}
        </svg>
      </div>
      <p className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span><span className="mr-1 inline-block size-2 rounded-sm bg-primary" aria-hidden="true" />핵심 경로(늦어지면 전체가 밀려요)</span>
        <span><span className="mr-1 inline-block size-2 rounded-sm bg-muted-foreground" aria-hidden="true" />여유 있는 작업</span>
      </p>
    </ChartFrame>
  );
}
