import type { EvaluatedNode } from "../../../lib/biz-strategy";
import ChartFrame from "./ChartFrame";
import { useWidth } from "./useWidth";

interface Props {
  title: string;
  caption?: string;
  root: EvaluatedNode;
  format: (n: number) => string;
}

interface Placed {
  node: EvaluatedNode;
  x: number;
  y: number;
  depth: number;
  /** 최적 선택을 따라가는 경로인지 */
  onPath: boolean;
  parent?: Placed;
  edge?: { label: string; prob?: number; cost: number; chosen: boolean };
}

const ROW = 54;

function layout(root: EvaluatedNode) {
  const out: Placed[] = [];
  let leaf = 0;
  const walk = (n: EvaluatedNode, depth: number, onPath: boolean, parent?: Placed, edge?: Placed["edge"]): Placed => {
    const me: Placed = { node: n, x: depth, y: 0, depth, onPath, parent, edge };
    out.push(me);
    if (!n.branches.length) {
      me.y = leaf++;
      return me;
    }
    const kids = n.branches.map((b, i) => {
      const chosen = n.kind === "decision" ? i === n.best : true;
      return walk(b.node, depth + 1, onPath && chosen, me, { label: b.label, prob: b.prob, cost: b.cost, chosen });
    });
    me.y = (kids[0].y + kids[kids.length - 1].y) / 2;
    return me;
  };
  walk(root, 0, true);
  return { nodes: out, leaves: Math.max(1, leaf), depth: Math.max(...out.map((p) => p.depth)) };
}

/** 의사결정 트리: □ 결정, ○ 확률, ◁ 결과. 고른 가지는 진하게, 버린 가지는 점선. 노드 옆 숫자는 기대값. */
export default function TreeDiagram({ title, caption, root, format }: Props) {
  const [box, width] = useWidth<HTMLDivElement>();
  const { nodes, leaves, depth } = layout(root);
  const W = Math.max(300, width);
  const colW = Math.max(96, (W - 110) / Math.max(1, depth));
  const H = leaves * ROW + 20;
  const px = (d: number) => 14 + d * colW;
  // 좁은 화면에서는 가지 이름을 줄이고 비용은 표로만 보여 줘요(글자가 겹치지 않게).
  const maxChars = Math.max(4, Math.floor((colW - 34) / 11));
  const cut = (t: string) => (t.length > maxChars ? t.slice(0, maxChars - 1) + "…" : t);
  const showCost = colW >= 170;
  const py = (y: number) => 24 + y * ROW;
  const table = [["단계", "가지", "확률", "비용", "기대값"], ...nodes.filter((n) => n.edge).map((n) => [n.parent?.node.label ?? "", n.edge!.label, n.edge!.prob === undefined ? "" : `${Math.round(n.edge!.prob * 1000) / 10}%`, n.edge!.cost ? format(n.edge!.cost) : "", format(n.node.ev)])];
  return (
    <ChartFrame title={title} caption={caption} table={table}>
      <div ref={box} className="w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" focusable="false">
          {nodes.filter((n) => n.parent).map((n) => {
            const p = n.parent!;
            const x1 = px(p.x) + 8;
            const y1 = py(p.y);
            const x2 = px(n.x) - 8;
            const y2 = py(n.y);
            const mid = x1 + 14;
            const cls = n.onPath ? "stroke-primary" : n.edge!.chosen ? "stroke-muted-foreground" : "stroke-muted-foreground opacity-50";
            return (
              <g key={n.node.id + "-e"}>
                <path d={`M${x1},${y1} L${mid},${y2} L${x2},${y2}`} fill="none" strokeWidth={n.onPath ? 2.5 : 1.25} strokeDasharray={n.edge!.chosen ? undefined : "4 3"} className={cls} />
                <text x={mid + 4} y={y2 - 6} className={"text-xs " + (n.onPath ? "fill-foreground font-semibold" : "fill-muted-foreground")}>
                  {cut(n.edge!.label)}
                  {n.edge!.prob !== undefined ? ` ${Math.round(n.edge!.prob * 100)}%` : ""}
                  {showCost && n.edge!.cost ? ` (−${format(n.edge!.cost)})` : ""}
                </text>
              </g>
            );
          })}
          {nodes.map((n) => {
            const cx = px(n.x);
            const cy = py(n.y);
            const tone = n.onPath ? "fill-primary stroke-primary" : "fill-background stroke-muted-foreground";
            const shape =
              n.node.kind === "decision" ? <rect x={cx - 8} y={cy - 8} width={16} height={16} rx={2} strokeWidth="2" className={tone} />
              : n.node.kind === "chance" ? <circle cx={cx} cy={cy} r={8} strokeWidth="2" className={tone} />
              : <path d={`M${cx + 8},${cy - 8} L${cx - 6},${cy} L${cx + 8},${cy + 8} Z`} strokeWidth="1.5" className={tone} />;
            const leaf = !n.node.branches.length;
            return (
              <g key={n.node.id}>
                {shape}
                <text x={leaf ? cx + 12 : n.depth === 0 ? cx - 8 : cx - 12} y={leaf ? cy + 4 : cy + 24} textAnchor={leaf || n.depth === 0 ? "start" : "end"} className={"text-xs font-semibold " + (n.onPath ? "fill-foreground" : "fill-muted-foreground")}>
                  {format(n.node.ev)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">□ 고르는 지점 · ○ 운에 달린 지점 · ◁ 결과. 진한 선이 기대값이 가장 큰 길이고, 점선은 버린 선택지예요.</p>
    </ChartFrame>
  );
}
