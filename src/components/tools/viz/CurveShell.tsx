// Country pages (tax and labour, 2026-11-21): easy/expert mode and a live "what if" curve (11-14 viz direction).
// The curve re-runs the same lib function for each x, so the chart and the result always agree.
// Easy mode is shared through ShellModeCtx: nts/Items and labor/LaborResult shorten their lists and hide citations.
import { createContext, useContext, type ReactNode } from "react";
import type { SweepPoint } from "../../../lib/scenario";
import type { AdvisoryMode } from "./format";
import { VizLangProvider, type VizLang, type VizText } from "./i18n";
import ModeToggle from "./ModeToggle";
import SweepChart from "./SweepChart";
import { track } from "./track";
import { useAdvisoryMode } from "./useAdvisoryMode";

const ShellModeCtx = createContext<AdvisoryMode>("expert");
/** "expert" outside a CurveShell, so existing pages are unchanged. */
export const useShellMode = () => useContext(ShellModeCtx);

export interface Curve {
  title: string;
  caption: string;
  xLabel: string;
  yLabel: string;
  min: number;
  max: number;
  step: number;
  current: number;
  f: (x: number) => number;
  formatX: (x: number) => string;
  formatY: (y: number) => string;
  onPick: (x: number) => void;
  marks?: { at: number; label: string }[];
}

/** Traditional Chinese frame text for Taiwan pages (the shared zh frame is Simplified). */
export const TW_VIZ_TEXT: Partial<VizText> = {
  modeGroup: "顯示模式", easy: "簡單", easyHint: "只填主要資料", expert: "專業", expertHint: "輸入全部數值與依據",
  table: "以表格檢視", sweepMarks: "虛線是規則改變的位置。點選或拖曳圖表也能改變數值。", sweepPlain: "點選或拖曳圖表也能改變數值。",
};

/** Date minus n years (rounded to whole months), as YYYY-MM-DD. */
export const minusYears = (end: string, years: number) => startFor(end, years);
/** Date plus n months, as YYYY-MM-DD (day clamped to month end). */
export const plusMonths = (d: string, months: number) => startFor(d, -months / 12);
/** Date plus n days, as YYYY-MM-DD. */
export const plusDays = (d: string, days: number) => new Date(Date.parse(d) + days * 86_400_000).toISOString().slice(0, 10);

/** End date minus n years (rounded to whole months), as YYYY-MM-DD. */
export function startFor(end: string, years: number): string {
  const [y, m, d] = end.split("-").map(Number);
  const months = Math.round(years * 12);
  const t = new Date(Date.UTC(y, m - 1 - months, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), Math.min(d, last))).toISOString().slice(0, 10);
}

export function curvePoints(c: Pick<Curve, "min" | "max" | "step" | "f" | "marks">): SweepPoint[] {
  const xs = new Set<number>();
  for (let x = c.min; x <= c.max + 1e-9; x += c.step) xs.add(Math.round(x * 1000) / 1000);
  for (const m of c.marks ?? []) if (m.at >= c.min && m.at <= c.max) xs.add(m.at);
  return [...xs].sort((a, b) => a - b).map((x) => ({ x, y: c.f(x) }));
}

export default function CurveShell({ toolId, lang, currency, text, curve, children }: { toolId: string; lang: VizLang; currency: string; text?: Partial<VizText>; curve: Curve; children: (mode: AdvisoryMode) => ReactNode }) {
  const [mode, setMode] = useAdvisoryMode(toolId);
  const cur = Math.min(curve.max, Math.max(curve.min, curve.current));
  return (
    <VizLangProvider value={{ lang, currency, text }}>
      <ShellModeCtx.Provider value={mode}>
      <div className="space-y-5">
        <ModeToggle mode={mode} onChange={setMode} />
        {children(mode)}
        <SweepChart
          title={curve.title}
          caption={curve.caption}
          points={curvePoints(curve)}
          current={{ x: cur, y: curve.f(cur) }}
          marks={curve.marks}
          formatX={(v) => curve.formatX(Math.round(v * 10) / 10)}
          formatY={curve.formatY}
          xLabel={curve.xLabel}
          yLabel={curve.yLabel}
          onPick={(x) => { curve.onPick(Math.round(x / curve.step) * curve.step); track("advisory_slider", { tool_id: toolId }, true); }}
        />
      </div>
      </ShellModeCtx.Provider>
    </VizLangProvider>
  );
}
