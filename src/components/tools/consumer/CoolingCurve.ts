// Cooling-off pages (world pro-gap #2): the "what if" curve shows how many days are left to cancel
// as days pass since the start date. Same lib result as the headline, so chart and text agree.
import type { Curve } from "../viz/CurveShell";

const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const plus = (d: string, n: number) => new Date(Date.parse(d) + n * 86_400_000).toISOString().slice(0, 10);

export function coolingCurve(o: { start?: string; lastDay: string | null; title: string; caption: string; xLabel: string; yLabel: string; unit: (n: number) => string; current: number; onPick: (n: number) => void; max?: number }): Curve {
  const ok = !!o.start && !!o.lastDay;
  return {
    title: o.title, caption: o.caption, xLabel: o.xLabel, yLabel: o.yLabel,
    min: 0, max: o.max ?? 30, step: 1, current: o.current,
    f: (x) => (ok ? Math.max(0, days(plus(o.start!, x), o.lastDay!)) : 0),
    formatX: o.unit, formatY: o.unit, onPick: o.onPick,
  };
}
