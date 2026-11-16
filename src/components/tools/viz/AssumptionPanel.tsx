import type { Assumption } from "../../../lib/scenario";
import AssumptionSlider, { type ValueTag } from "./AssumptionSlider";
import type { AdvisoryMode } from "./format";
import { useVizText } from "./i18n";

interface Props<I> {
  assumptions: Assumption<I>[];
  input: I;
  anchors: Record<string, number>;
  tags: Partial<Record<string, ValueTag>>;
  mode: AdvisoryMode;
  onSlide: (key: string, v: number) => void;
}

/** "가정을 바꿔 보세요" 카드 묶음 */
export default function AssumptionPanel<I>({ assumptions, input, anchors, tags, mode, onSlide }: Props<I>) {
  const t = useVizText();
  return (
    <section aria-label={t.tryTitle}>
      <h2 className="text-base font-semibold text-foreground">{t.tryTitle}</h2>
      <p className="text-xs text-muted-foreground">{t.tryNote}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {assumptions.map((a) => (
          <AssumptionSlider
            key={a.key}
            label={mode === "easy" ? a.plain : a.label}
            unit={a.unit}
            value={a.get(input)}
            range={a.range(anchors[a.key] ?? a.get(input))}
            onChange={(v) => onSlide(a.key, v)}
            mode={mode}
            tag={tags[a.key] ?? null}
          />
        ))}
      </div>
    </section>
  );
}
