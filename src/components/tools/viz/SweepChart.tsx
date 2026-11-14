import { useRef, type PointerEvent } from "react";
import type { SweepPoint } from "../../../lib/scenario";
import ChartFrame from "./ChartFrame";
import { useWidth } from "./useWidth";

interface Props {
  title: string;
  caption?: string;
  points: SweepPoint[];
  current: SweepPoint;
  marks?: { at: number; label: string }[];
  formatX: (v: number) => string;
  formatY: (v: number) => string;
  /** 그래프를 누르거나 끌면 그 값으로 가정을 바꿔요 */
  onPick?: (x: number) => void;
  xLabel: string;
  yLabel: string;
}

const H = 200;
const PAD = { l: 8, r: 8, t: 22, b: 26 };

/** 한 가정 훑기: 가정을 최소~최대로 바꾼 결과 곡선, 지금 위치, 법이 바뀌는 경계선. */
export default function SweepChart({ title, caption, points, current, marks = [], formatX, formatY, onPick, xLabel, yLabel }: Props) {
  const [box, width] = useWidth<HTMLDivElement>();
  const dragging = useRef(false);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y).concat(current.y);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(0, ...ys);
  const y1 = Math.max(...ys) * 1.08 || 1;
  const W = Math.max(240, width);
  const sx = (v: number) => PAD.l + ((v - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r);
  const sy = (v: number) => PAD.t + (1 - (v - y0) / (y1 - y0 || 1)) * (H - PAD.t - PAD.b);
  const d = points.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join("");
  const area = `${d}L${sx(x1).toFixed(1)},${sy(y0).toFixed(1)}L${sx(x0).toFixed(1)},${sy(y0).toFixed(1)}Z`;
  const cx = sx(Math.min(x1, Math.max(x0, current.x)));
  const cy = sy(current.y);
  const labelLeft = cx > W / 2;

  const pick = (e: PointerEvent<SVGSVGElement>) => {
    if (!onPick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left - PAD.l) / (rect.width - PAD.l - PAD.r);
    onPick(x0 + Math.min(1, Math.max(0, ratio)) * (x1 - x0));
  };

  const table = [[xLabel, yLabel], ...thin(points, 12).map((p) => [formatX(p.x), formatY(p.y)])];
  return (
    <ChartFrame title={title} caption={caption} table={table}>
      <div ref={box} className="w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={"block h-auto w-full touch-none select-none " + (onPick ? "cursor-pointer" : "")}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            pick(e);
          }}
          onPointerMove={(e) => dragging.current && pick(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <line x1={PAD.l} x2={W - PAD.r} y1={sy(y0)} y2={sy(y0)} className="stroke-border" />
          <path d={area} className="fill-primary opacity-10" />
          <path d={d} fill="none" strokeWidth="2" strokeLinejoin="round" className="stroke-primary" />
          {marks.map((m) => (
            <g key={m.at}>
              <line x1={sx(m.at)} x2={sx(m.at)} y1={PAD.t - 6} y2={sy(y0)} strokeDasharray="3 3" className="stroke-muted-foreground" />
              <text x={sx(m.at) + 3} y={PAD.t - 8} className="fill-muted-foreground text-xs">
                {m.label}
              </text>
            </g>
          ))}
          <line x1={cx} x2={cx} y1={cy} y2={sy(y0)} className="stroke-foreground" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="6" className="fill-background stroke-foreground transition-all duration-100 motion-reduce:transition-none" strokeWidth="2.5" />
          <text x={labelLeft ? cx - 10 : cx + 10} y={Math.max(PAD.t + 12, cy - 10)} textAnchor={labelLeft ? "end" : "start"} className="fill-foreground text-sm font-semibold">
            {formatY(current.y)}
          </text>
          <text x={PAD.l} y={H - 8} className="fill-muted-foreground text-xs">
            {formatX(x0)}
          </text>
          <text x={W - PAD.r} y={H - 8} textAnchor="end" className="fill-muted-foreground text-xs">
            {formatX(x1)}
          </text>
          <text x={cx} y={H - 8} textAnchor="middle" className="fill-foreground text-xs font-semibold">
            {Math.abs(cx - PAD.l) > 56 && Math.abs(W - PAD.r - cx) > 56 ? formatX(current.x) : ""}
          </text>
        </svg>
      </div>
    </ChartFrame>
  );
}

function thin<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.round((i * (arr.length - 1)) / (n - 1))]);
  return out;
}
