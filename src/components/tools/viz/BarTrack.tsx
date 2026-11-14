// 가로 막대 한 줄. 0~100 좌표의 SVG를 너비에 맞춰 늘려요(글자는 HTML이라 찌그러지지 않아요).
interface Segment {
  from: number;
  to: number;
  tone: "primary" | "muted" | "warning" | "destructive" | "foreground";
}

const TONE = {
  primary: "fill-primary",
  muted: "fill-muted-foreground",
  warning: "fill-warning",
  destructive: "fill-destructive",
  foreground: "fill-foreground",
} as const;

export default function BarTrack({ segments, marker }: { segments: Segment[]; marker?: number }) {
  return (
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="block h-4 w-full" focusable="false">
      <rect x="0" y="0" width="100" height="10" rx="1" className="fill-muted" />
      {segments.map((s, i) => {
        const a = clamp(Math.min(s.from, s.to));
        const b = clamp(Math.max(s.from, s.to));
        return <rect key={i} x={a} y="1" width={Math.max(b - a, 0.4)} height="8" rx="0.8" className={TONE[s.tone] + " transition-all duration-150 motion-reduce:transition-none"} />;
      })}
      {marker !== undefined && <rect x={clamp(marker) - 0.25} y="0" width="0.5" height="10" className="fill-foreground" />}
    </svg>
  );
}

const clamp = (v: number) => Math.min(100, Math.max(0, Number.isFinite(v) ? v : 0));
