import { useId } from "react";
import { niceStep, type AssumptionUnit } from "../../../lib/scenario";
import { formatUnit, type AdvisoryMode } from "./format";

export type ValueTag = "example" | "guess" | null;
const TAG_LABEL = { example: "예시", guess: "가정" } as const;

interface Props {
  label: string;
  unit: AssumptionUnit;
  value: number;
  range: [number, number];
  onChange: (v: number) => void;
  mode: AdvisoryMode;
  tag?: ValueTag;
  /** 법이 바뀌는 경계. 슬라이더에는 그리지 않고 훑기 곡선에서 보여 줘요(자리 맞춤용으로 받아 둬요). */
  marks?: { at: number; label: string }[];
}

/** 가정 카드: 이름, 지금 값, 슬라이더. 슬라이더 범위는 마지막으로 직접 넣은 값 기준이라 끄는 동안 흔들리지 않아요. */
export default function AssumptionSlider({ label, unit, value, range, onChange, mode, tag }: Props) {
  const id = useId();
  const [min, max] = range;
  const step = unit === "pct" ? 0.01 : niceStep(max - min, 200);
  const clamped = Math.min(max, Math.max(min, value));
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm text-muted-foreground">
          {label}
          {tag && <span className="ml-2 rounded-sm bg-warning px-1 text-xs font-semibold text-warning-foreground">{TAG_LABEL[tag]}</span>}
        </label>
        <output htmlFor={id} className="shrink-0 font-mono text-sm font-semibold text-foreground">
          {formatUnit(unit, value, mode)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-11 w-full cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatUnit(unit, min, "easy")}</span>
        <span>{formatUnit(unit, max, "easy")}</span>
      </div>
    </div>
  );
}
