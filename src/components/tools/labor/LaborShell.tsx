// 7-country labour exit pack: easy/expert mode and a live "what if" curve (2026-11-21, 11-14 viz direction).
// The curve re-runs the same lib function for each x, so the chart and the result always agree.
import type { ReactNode } from "react";
import type { SweepPoint } from "../../../lib/scenario";
import type { AdvisoryMode } from "../viz/format";
import { VizLangProvider, type VizLang, type VizText } from "../viz/i18n";
import ModeToggle from "../viz/ModeToggle";
import SweepChart from "../viz/SweepChart";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";

export interface LaborCurve {
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

/** End date minus n years (rounded to whole months), as YYYY-MM-DD. */
export function startFor(end: string, years: number): string {
  const [y, m, d] = end.split("-").map(Number);
  const months = Math.round(years * 12);
  const t = new Date(Date.UTC(y, m - 1 - months, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), Math.min(d, last))).toISOString().slice(0, 10);
}

export function curvePoints(c: Pick<LaborCurve, "min" | "max" | "step" | "f" | "marks">): SweepPoint[] {
  const xs = new Set<number>();
  for (let x = c.min; x <= c.max + 1e-9; x += c.step) xs.add(Math.round(x * 1000) / 1000);
  for (const m of c.marks ?? []) if (m.at >= c.min && m.at <= c.max) xs.add(m.at);
  return [...xs].sort((a, b) => a - b).map((x) => ({ x, y: c.f(x) }));
}

export default function LaborShell({ toolId, lang, currency, text, curve, children }: { toolId: string; lang: VizLang; currency: string; text?: Partial<VizText>; curve: LaborCurve; children: (mode: AdvisoryMode) => ReactNode }) {
  const [mode, setMode] = useAdvisoryMode(toolId);
  const cur = Math.min(curve.max, Math.max(curve.min, curve.current));
  return (
    <VizLangProvider value={{ lang, currency, text }}>
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
    </VizLangProvider>
  );
}
