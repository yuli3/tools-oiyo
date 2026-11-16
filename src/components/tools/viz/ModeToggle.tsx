import type { AdvisoryMode } from "./format";
import { useVizText } from "./i18n";

export default function ModeToggle({ mode, onChange }: { mode: AdvisoryMode; onChange: (m: AdvisoryMode) => void }) {
  const t = useVizText();
  const OPTIONS: { value: AdvisoryMode; label: string; hint: string }[] = [
    { value: "easy", label: t.easy, hint: t.easyHint },
    { value: "expert", label: t.expert, hint: t.expertHint },
  ];
  return (
    <div role="group" aria-label={t.modeGroup} className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={mode === o.value}
          onClick={() => onChange(o.value)}
          className={
            "min-h-11 rounded-md px-3 py-1 text-left transition-colors " +
            (mode === o.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")
          }
        >
          <span className="block text-sm font-semibold">{o.label}</span>
          <span className="block text-xs">{o.hint}</span>
        </button>
      ))}
    </div>
  );
}
