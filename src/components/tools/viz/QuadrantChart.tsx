import ChartFrame from "./ChartFrame";
import { useWidth } from "./useWidth";

export interface QuadrantPoint {
  label: string;
  x: number;
  y: number;
  /** 버블 크기 0~1(없으면 같은 크기) */
  size?: number;
  tone?: "primary" | "muted" | "warning" | "destructive" | "success";
}

interface Props {
  title: string;
  caption?: string;
  points: QuadrantPoint[];
  xDomain: [number, number];
  yDomain: [number, number];
  /** 사분면을 나누는 기준선 */
  xSplit: number;
  ySplit: number;
  /** x축을 로그 눈금으로(BCG 상대 점유율) */
  logX?: boolean;
  /** x축을 뒤집어 큰 값이 왼쪽(BCG 관례) */
  reverseX?: boolean;
  xLabel: string;
  yLabel: string;
  /** [왼쪽 위, 오른쪽 위, 왼쪽 아래, 오른쪽 아래] */
  quadrants: [string, string, string, string];
  /** 비어 있는 자리 같은 표시용 원(데이터 좌표, 반지름은 x축 단위) */
  ring?: { x: number; y: number; r: number; label: string };
  formatX: (v: number) => string;
  formatY: (v: number) => string;
}

const TONE = {
  primary: "fill-primary stroke-primary",
  muted: "fill-muted-foreground stroke-muted-foreground",
  warning: "fill-warning stroke-warning",
  destructive: "fill-destructive stroke-destructive",
  success: "fill-success stroke-success",
} as const;
const PAD = 28;

/** 2×2 사분면 산점도·버블(SWOT 위치, BCG, 포지셔닝 맵). */
export default function QuadrantChart(p: Props) {
  const [box, width] = useWidth<HTMLDivElement>();
  const W = Math.max(260, width);
  const H = Math.min(440, Math.max(300, Math.round(W * (W < 480 ? 0.95 : 0.75))));
  const tx = (v: number) => (p.logX ? Math.log10(Math.max(v, 1e-6)) : v);
  const [a, b] = [tx(p.xDomain[0]), tx(p.xDomain[1])];
  const fx = (v: number) => {
    const t = (Math.min(b, Math.max(a, tx(v))) - a) / (b - a || 1);
    return PAD + (p.reverseX ? 1 - t : t) * (W - 2 * PAD);
  };
  const fy = (v: number) => PAD + (1 - (Math.min(p.yDomain[1], Math.max(p.yDomain[0], v)) - p.yDomain[0]) / (p.yDomain[1] - p.yDomain[0] || 1)) * (H - 2 * PAD);
  const sx = fx(p.xSplit);
  const sy = fy(p.ySplit);
  const left = p.reverseX ? fx(p.xDomain[1]) : fx(p.xDomain[0]);
  const right = p.reverseX ? fx(p.xDomain[0]) : fx(p.xDomain[1]);
  const maxR = Math.max(10, Math.min(W, H) / 9);
  const pts = [...p.points].sort((m, n) => (n.size ?? 0) - (m.size ?? 0));
  // 글자 겹침 피하기: 위에서부터 놓고, 앞서 놓은 글자와 겹치면 아래로 14px씩 내려요.
  const boxes: { x0: number; x1: number; y: number }[] = [];
  const placed = pts.map((q) => {
    const r = q.size === undefined ? 7 : 6 + Math.sqrt(Math.max(0, Math.min(1, q.size))) * maxR;
    const cx = fx(q.x);
    const cy = fy(q.y);
    const anchor: "start" | "end" = cx > W - 90 ? "end" : "start";
    const lx = anchor === "end" ? cx - r - 4 : cx + r + 4;
    const wText = q.label.length * 12;
    const x0 = anchor === "end" ? lx - wText : lx;
    let ly = cy + 4;
    for (let k = 0; k < 12 && boxes.some((b) => Math.abs(b.y - ly) < 14 && b.x0 < x0 + wText && x0 < b.x1); k++) ly += 14;
    boxes.push({ x0, x1: x0 + wText, y: ly });
    return { q, r, cx, cy, lx, ly, anchor };
  });
  const table = [["항목", p.xLabel, p.yLabel], ...p.points.map((q) => [q.label, p.formatX(q.x), p.formatY(q.y)])];
  return (
    <ChartFrame title={p.title} caption={p.caption} table={table}>
      <div ref={box} className="w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" focusable="false">
          <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} className="fill-muted opacity-40" />
          <line x1={sx} x2={sx} y1={PAD} y2={H - PAD} strokeDasharray="4 4" className="stroke-muted-foreground" />
          <line x1={PAD} x2={W - PAD} y1={sy} y2={sy} strokeDasharray="4 4" className="stroke-muted-foreground" />
          <text x={PAD + 4} y={PAD + 14} className="fill-muted-foreground text-xs">{p.quadrants[0]}</text>
          <text x={W - PAD - 4} y={PAD + 14} textAnchor="end" className="fill-muted-foreground text-xs">{p.quadrants[1]}</text>
          <text x={PAD + 4} y={H - PAD - 6} className="fill-muted-foreground text-xs">{p.quadrants[2]}</text>
          <text x={W - PAD - 4} y={H - PAD - 6} textAnchor="end" className="fill-muted-foreground text-xs">{p.quadrants[3]}</text>
          {p.ring && (
            <g>
              <circle cx={fx(p.ring.x)} cy={fy(p.ring.y)} r={Math.abs(fx(p.ring.x + p.ring.r) - fx(p.ring.x))} strokeDasharray="5 4" strokeWidth="1.5" className="fill-success stroke-success opacity-30" />
              <text x={fx(p.ring.x)} y={fy(p.ring.y) + 4} textAnchor="middle" className="fill-foreground text-xs font-semibold">{p.ring.label}</text>
            </g>
          )}
          {placed.map(({ q, r, cx, cy, lx, ly, anchor }) => (
            <g key={q.label} className="transition-transform duration-150 motion-reduce:transition-none">
              <circle cx={cx} cy={cy} r={r} strokeWidth="2" className={TONE[q.tone ?? "primary"] + " opacity-60"} />
              {Math.abs(ly - (cy + 4)) > 6 && <line x1={anchor === "end" ? lx + 2 : lx - 2} y1={ly - 4} x2={anchor === "end" ? cx - r * 0.7 : cx + r * 0.7} y2={cy} strokeWidth="1" className="stroke-muted-foreground" />}
              <text x={lx} y={ly} textAnchor={anchor} className="fill-foreground text-xs font-semibold">{q.label}</text>
            </g>
          ))}
          <text x={left} y={H - 8} className="fill-muted-foreground text-xs">← {p.reverseX ? p.formatX(p.xDomain[1]) : p.formatX(p.xDomain[0])}</text>
          <text x={right} y={H - 8} textAnchor="end" className="fill-muted-foreground text-xs">{p.reverseX ? p.formatX(p.xDomain[0]) : p.formatX(p.xDomain[1])} →</text>
          <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-foreground text-xs font-semibold">{p.xLabel}</text>
          <text x={10} y={H / 2} textAnchor="middle" transform={`rotate(-90 10 ${H / 2})`} className="fill-foreground text-xs font-semibold">{p.yLabel}</text>
        </svg>
      </div>
    </ChartFrame>
  );
}
