import ChartFrame from "./ChartFrame";

interface Props {
  title: string;
  caption?: string;
  rows: number[];
  cols: number[];
  cell: (row: number, col: number) => number;
  rowLabel: string;
  colLabel: string;
  formatRow: (v: number) => string;
  formatCol: (v: number) => string;
  formatCell: (v: number) => string;
  /** 지금 값의 [행, 열] 위치 */
  current?: [number, number];
}

// 색 단계는 정적 클래스로(인라인 스타일 금지). 진할수록 결과가 커요.
const LEVEL = ["bg-primary/5", "bg-primary/15", "bg-primary/30", "bg-primary/50", "bg-primary/70"] as const;
const TEXT = ["text-foreground", "text-foreground", "text-foreground", "text-primary-foreground", "text-primary-foreground"] as const;

/** 두 가정 열지도: 행·열 두 가정을 함께 바꿀 때의 결과. 지금 값 칸은 테두리로 표시해요. */
export default function HeatmapChart({ title, caption, rows, cols, cell, rowLabel, colLabel, formatRow, formatCol, formatCell, current }: Props) {
  const values = rows.map((r) => cols.map((c) => cell(r, c)));
  const finite = values.flat().filter(Number.isFinite);
  const lo = Math.min(...finite);
  const hi = Math.max(...finite);
  const level = (v: number) => (!Number.isFinite(v) ? -1 : hi === lo ? 2 : Math.min(4, Math.floor(((v - lo) / (hi - lo)) * 5)));
  const table = [[`${rowLabel} \\ ${colLabel}`, ...cols.map(formatCol)], ...rows.map((r, i) => [formatRow(r), ...values[i].map((v) => (Number.isFinite(v) ? formatCell(v) : "계산 불가"))])];
  return (
    <ChartFrame title={title} caption={caption} table={table}>
      <div className="grid gap-1 text-xs" role="presentation">
        <div className="grid grid-cols-6 gap-1">
          <span className="truncate text-muted-foreground">{rowLabel}↓</span>
          {cols.map((c) => (
            <span key={c} className="truncate text-center font-mono text-muted-foreground">
              {formatCol(c)}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={r} className="grid grid-cols-6 gap-1">
            <span className="self-center truncate font-mono text-muted-foreground">{formatRow(r)}</span>
            {values[i].map((v, j) => {
              const l = level(v);
              const isCur = current && current[0] === i && current[1] === j;
              return (
                <span
                  key={j}
                  className={"flex min-h-9 items-center justify-center rounded-sm font-mono " + (l < 0 ? "bg-muted text-muted-foreground" : LEVEL[l] + " " + TEXT[l]) + (isCur ? " ring-2 ring-foreground" : "")}
                >
                  {Number.isFinite(v) ? formatCell(v) : "—"}
                </span>
              );
            })}
          </div>
        ))}
        <p className="mt-1 text-muted-foreground">{colLabel}→ · 진할수록 값이 커요</p>
      </div>
    </ChartFrame>
  );
}
