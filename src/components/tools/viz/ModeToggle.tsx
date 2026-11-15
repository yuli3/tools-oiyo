import type { AdvisoryMode } from "./format";

const OPTIONS: { value: AdvisoryMode; label: string; hint: string }[] = [
  { value: "easy", label: "쉬운 설명", hint: "질문에 답하면 돼요" },
  { value: "expert", label: "전문가", hint: "숫자·근거 직접 입력" },
];

export default function ModeToggle({ mode, onChange }: { mode: AdvisoryMode; onChange: (m: AdvisoryMode) => void }) {
  return (
    <div role="group" aria-label="화면 모드" className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
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
