// Company calendar pages (world pro-gap #6): how many filings are still ahead as days pass after the year end.
import type { Curve } from "../viz/CurveShell";

const plus = (d: string, n: number) => new Date(Date.parse(d) + n * 86_400_000).toISOString().slice(0, 10);

export function calCurve(o: { yearEnd: string; dates: { date: string; label: string }[]; title: string; caption: string; xLabel: string; yLabel: string; day: (n: number) => string; current: number; onPick: (n: number) => void; max?: number }): Curve {
  const ok = !Number.isNaN(Date.parse(o.yearEnd));
  const offs = ok ? o.dates.map((d) => Math.round((Date.parse(d.date) - Date.parse(o.yearEnd)) / 86_400_000)) : [];
  return {
    title: o.title, caption: o.caption, xLabel: o.xLabel, yLabel: o.yLabel, min: 0, max: o.max ?? 400, step: 5, current: o.current,
    f: (x) => (ok ? o.dates.filter((d) => d.date >= plus(o.yearEnd, x)).length : 0),
    formatX: o.day, formatY: (n) => String(Math.round(n)), onPick: o.onPick,
    marks: offs.filter((n) => n >= 0 && n <= (o.max ?? 400)).map((n, i) => ({ at: n, label: String(i + 1) })),
  };
}
