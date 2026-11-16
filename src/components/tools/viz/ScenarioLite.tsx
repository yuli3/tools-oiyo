// 생활 계산기용 가벼운 틀 (2026-11-17, 롤아웃 5묶음). 질문 카드·모드 전환 없이
// 입력 → 쉬운 결과 문장 → 가정 슬라이더 → 훑기 곡선 → 도구별 그래프만 보여 줘요.
import type { ReactNode } from "react";
import { tornado, type Assumption, type TornadoBar } from "../../../lib/scenario";
import AssumptionPanel from "./AssumptionPanel";
import PlainSummary, { ReasonList } from "./PlainSummary";
import SweepPanel from "./SweepPanel";
import type { Metric } from "./ScenarioTool";
import { useScenario } from "./useScenario";

interface Props<I, K extends string> {
  toolId: string;
  example: I;
  assumptions: Assumption<I>[];
  keys: readonly K[];
  evaluate: (i: I) => number;
  resultName: string;
  formatResult: (n: number) => string;
  inputs: (input: I, edit: (patch: Partial<I>, keys: readonly K[]) => void) => ReactNode;
  summary: (i: I, top: TornadoBar | undefined) => { headline: string; driver: string | null; reasons: string[] };
  metrics: (i: I) => Metric[];
  sliders?: string[];
  sweepCaption?: (a: Assumption<I>) => string | undefined;
  charts?: (i: I) => ReactNode;
}

export default function ScenarioLite<I, K extends string>(p: Props<I, K>) {
  const s = useScenario<I, K>(p.toolId, p.example, p.assumptions, p.keys);
  const { input } = s;
  const top = tornado(input, p.assumptions, p.evaluate)[0];
  const plain = p.summary(input, top);
  const sliders = p.sliders ? p.assumptions.filter((a) => p.sliders!.includes(a.key)) : p.assumptions.slice(0, 4);
  const metrics = p.metrics(input);
  return (
    <div className="space-y-5">
      <section aria-label="입력" className="space-y-4">{p.inputs(input, (patch, keys) => s.edit(patch, keys))}</section>
      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <PlainSummary headline={plain.headline} driver={plain.driver} hasExample={false} hasGuess={false} />
        {metrics.length > 0 && (
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            {metrics.map((m, i) => (
              <div key={i}>
                <dt className="text-muted-foreground">{m.label}</dt>
                <dd className={"font-mono text-xl font-bold " + (m.tone === "primary" ? "text-primary" : "text-foreground")}>{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <ReasonList reasons={plain.reasons} />
        {sliders.length > 0 && <AssumptionPanel assumptions={sliders} input={input} anchors={s.anchors} tags={s.tags} mode="expert" onSlide={s.slide} />}
        {sliders.length > 0 && (
          <SweepPanel options={sliders} input={input} anchors={s.anchors} evaluate={p.evaluate} mode="expert" resultName={p.resultName} formatY={p.formatResult} onSlide={s.slide} caption={p.sweepCaption} />
        )}
        {p.charts?.(input)}
      </div>
    </div>
  );
}
