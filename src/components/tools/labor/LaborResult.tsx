// 7-country labour exit pack: shared result block (headline, dates, cautions). Logic: lib/world-labor-pack-2026.ts
import type { LDate, LItem } from "../../../lib/world-labor-pack-2026";

const TONE: Record<string, string> = { warn: "text-warning", info: "text-foreground", good: "text-success" };

export default function LaborResult({ headline, sub, items, dates, datesTitle, note }: { headline: string; sub?: string; items: LItem[]; dates: LDate[]; datesTitle: string; note: string }) {
  return (
    <>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{headline}</p>
        {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
        <ul className="mt-2 space-y-2">
          {items.map((i, k) => <li key={k} className={TONE[i.tone]}>{i.text}{i.cite !== "—" && <span className="text-xs text-muted-foreground"> ({i.cite})</span>}</li>)}
        </ul>
      </div>
      {dates.length > 0 && (
        <section className="space-y-2 rounded-md border border-border bg-card px-4 py-4 text-sm">
          <h3 className="font-semibold">{datesTitle}</h3>
          <ul className="space-y-2">
            {dates.map((d) => <li key={d.id}><span className="font-mono font-semibold">{d.date}</span> {d.label} <span className="text-xs text-muted-foreground">({d.cite})</span></li>)}
          </ul>
        </section>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{note}</p>
    </>
  );
}
