import type { TornadoBar } from "../../../lib/scenario";
import BarTrack from "./BarTrack";
import ChartFrame from "./ChartFrame";
import type { AdvisoryMode } from "./format";

interface Props {
  bars: TornadoBar[];
  mode: AdvisoryMode;
  format: (n: number) => string;
  delta?: number;
  limit?: number;
}

/** 토네이도: 가정마다 ±20% 바꿀 때 결과가 움직이는 폭, 큰 순서. 세로선은 지금 결과. */
export default function TornadoChart({ bars, mode, format, delta = 0.2, limit = 6 }: Props) {
  const shown = bars.slice(0, limit);
  if (shown.length === 0) return null;
  const base = shown[0].base;
  const lo = Math.min(...shown.map((b) => Math.min(b.low, b.high)), base);
  const hi = Math.max(...shown.map((b) => Math.max(b.low, b.high)), base);
  const span = hi - lo || 1;
  const x = (v: number) => ((v - lo) / span) * 90 + 5;
  const pct = Math.round(delta * 100);
  return (
    <ChartFrame
      title="무엇이 결과를 가장 크게 흔드나요?"
      caption={`각 가정을 ${pct}% 낮추거나 높였을 때 결과가 움직이는 범위예요. 위에 있을수록 중요해요. 세로선은 지금 결과예요.`}
      table={[["가정", `−${pct}%일 때`, `+${pct}%일 때`, "폭"], ...shown.map((b) => [mode === "easy" ? b.plain : b.label, format(b.low), format(b.high), format(b.span)])]}
    >
      <ol className="space-y-2">
        {shown.map((b) => (
          <li key={b.key}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-foreground">{mode === "easy" ? b.plain : b.label}</span>
              <span className="shrink-0 font-mono text-muted-foreground">±{format(b.span / 2)}</span>
            </div>
            <BarTrack
              marker={x(base)}
              segments={[
                { from: x(base), to: x(b.low), tone: "warning" },
                { from: x(base), to: x(b.high), tone: "primary" },
              ]}
            />
          </li>
        ))}
      </ol>
      <p className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>
          <span className="mr-1 inline-block size-2 rounded-sm bg-warning" aria-hidden="true" />
          가정을 낮췄을 때
        </span>
        <span>
          <span className="mr-1 inline-block size-2 rounded-sm bg-primary" aria-hidden="true" />
          가정을 높였을 때
        </span>
      </p>
    </ChartFrame>
  );
}
