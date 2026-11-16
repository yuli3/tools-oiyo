import { useMemo, useState } from "react";
import { sweep, type Assumption } from "../../../lib/scenario";
import ChoiceChips from "../payroll/ChoiceChips";
import SweepChart from "./SweepChart";
import { formatUnit, type AdvisoryMode } from "./format";

interface Props<I> {
  /** 훑어 볼 수 있는 가정들(칩으로 골라요) */
  options: Assumption<I>[];
  input: I;
  anchors: Record<string, number>;
  evaluate: (i: I) => number;
  mode: AdvisoryMode;
  /** 결과 이름(예: "1주당 값", "상속세") */
  resultName: string;
  formatY: (v: number) => string;
  onSlide: (key: string, v: number) => void;
  caption?: (a: Assumption<I>) => string | undefined;
}

/** 칩으로 가정 하나를 골라 끝까지 바꿔 보는 곡선. 그래프를 누르거나 끌면 그 값으로 바뀌어요. */
export default function SweepPanel<I>({ options, input, anchors, evaluate, mode, resultName, formatY, onSlide, caption }: Props<I>) {
  const [key, setKey] = useState(options[0].key);
  const a = options.find((o) => o.key === key) ?? options[0];
  const range = a.range(anchors[a.key] ?? a.get(input));
  const discrete = a.unit === "years" || a.unit === "pct";
  const points = useMemo(() => sweep(input, a, evaluate, range, a.unit === "years" ? Math.round(range[1] - range[0]) : a.unit === "pct" ? 100 : 60), [input, a, evaluate, range[0], range[1]]);
  const name = mode === "easy" ? a.plain : a.label;
  const current = evaluate(input);
  return (
    <div className="space-y-3">
      <ChoiceChips legend="한 가지 가정을 끝까지 바꿔 보기" value={a.key} options={options.map((o) => ({ value: o.key, label: mode === "easy" ? o.plain : o.label }))} onChange={setKey} />
      {Number.isFinite(current) && points.length > 1 && (
        <SweepChart
          title={`${name}에 따라 ${resultName}이 이렇게 바뀌어요`}
          caption={caption?.(a) ?? (a.marks ? "점선은 법이나 기준이 바뀌는 지점이에요. 그래프를 누르거나 끌어도 값이 바뀌어요." : "그래프를 누르거나 끌어도 값이 바뀌어요.")}
          points={points}
          current={{ x: a.get(input), y: current }}
          marks={a.marks}
          formatX={(v) => formatUnit(a.unit, v, "easy")}
          formatY={formatY}
          onPick={(x) => onSlide(a.key, a.unit === "years" ? Math.round(x) : discrete ? Math.round(x * 100) / 100 : a.unit === "rate" ? Math.round(x * 1000) / 1000 : x)}
          xLabel={name}
          yLabel={resultName}
        />
      )}
    </div>
  );
}
