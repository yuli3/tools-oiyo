// Limitation pages (world pro-gap #4): years left before the claim is time-barred, as time passes from the start date.
import type { Curve } from "../viz/CurveShell";

const yrs = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / (365.25 * 86_400_000);
const plusYears = (d: string, n: number) => new Date(Date.parse(d) + n * 365.25 * 86_400_000).toISOString().slice(0, 10);

export function limitCurve(o: { start?: string; deadline: string | null; title: string; caption: string; xLabel: string; yLabel: string; unit: (n: number) => string; current: number; onPick: (n: number) => void; max: number }): Curve {
  const ok = !!o.start && !!o.deadline;
  return {
    title: o.title, caption: o.caption, xLabel: o.xLabel, yLabel: o.yLabel, min: 0, max: o.max, step: 0.5, current: o.current,
    f: (x) => (ok ? Math.max(0, Math.round(yrs(plusYears(o.start!, x), o.deadline!) * 10) / 10) : 0),
    formatX: o.unit, formatY: o.unit, onPick: o.onPick,
  };
}
