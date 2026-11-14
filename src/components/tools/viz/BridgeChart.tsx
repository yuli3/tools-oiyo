import { bridgeLayout, type BridgeStep } from "../../../lib/scenario";
import BarTrack from "./BarTrack";
import ChartFrame from "./ChartFrame";

interface Props {
  title: string;
  caption?: string;
  steps: BridgeStep[];
  format: (n: number) => string;
}

/** 다리(워터폴): 결과가 어떤 단계로 만들어졌는지. 더하는 단계는 초록, 빼는 단계는 빨강, 합계는 진하게. */
export default function BridgeChart({ title, caption, steps, format }: Props) {
  const bars = bridgeLayout(steps);
  const lo = Math.min(0, ...bars.map((b) => Math.min(b.start, b.end)));
  const hi = Math.max(1, ...bars.map((b) => Math.max(b.start, b.end)));
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <ChartFrame
      title={title}
      caption={caption}
      table={[["단계", "금액", "누계"], ...bars.map((b) => [b.label, b.kind === "total" ? format(b.value) : `${b.value >= 0 ? "+" : "−"}${format(Math.abs(b.value))}`, format(b.end)])]}
    >
      <ol className="space-y-2">
        {bars.map((b, i) => (
          <li key={i}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className={b.kind === "total" ? "font-semibold text-foreground" : "text-muted-foreground"}>{b.label}</span>
              <span className={"font-mono " + (b.kind === "total" ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {b.kind === "total" ? format(b.value) : `${b.value >= 0 ? "+" : "−"}${format(Math.abs(b.value))}`}
              </span>
            </div>
            <BarTrack segments={[{ from: x(b.start), to: x(b.end), tone: b.kind === "total" ? "foreground" : b.value >= 0 ? "primary" : "destructive" }]} />
          </li>
        ))}
      </ol>
    </ChartFrame>
  );
}
