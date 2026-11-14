import BarTrack from "./BarTrack";
import ChartFrame from "./ChartFrame";

interface Item {
  label: string;
  value: number;
  current?: boolean;
}

/** 전후 비교: 두세 경우를 나란히 놓고 차이를 강조해요. */
export default function CompareBars({ title, caption, items, format }: { title: string; caption?: string; items: Item[]; format: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => Math.abs(i.value)));
  const diff = items.length === 2 ? items[1].value - items[0].value : null;
  return (
    <ChartFrame title={title} caption={caption} table={[["경우", "금액"], ...items.map((i) => [i.label, format(i.value)])]}>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.label}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className={i.current ? "font-semibold text-foreground" : "text-muted-foreground"}>
                {i.label}
                {i.current && " (지금)"}
              </span>
              <span className="font-mono text-foreground">{format(i.value)}</span>
            </div>
            <BarTrack segments={[{ from: 0, to: (Math.abs(i.value) / max) * 100, tone: i.current ? "primary" : "muted" }]} />
          </li>
        ))}
      </ul>
      {diff !== null && diff !== 0 && (
        <p className="mt-2 text-xs font-semibold text-foreground">
          차이 {diff > 0 ? "+" : "−"}
          {format(Math.abs(diff))}
        </p>
      )}
    </ChartFrame>
  );
}
