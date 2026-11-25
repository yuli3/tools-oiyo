// 쉬운 말(Easy Read) 보기 단추 + 패널 (2026-11-25). 규칙·사전은 lib/easy-read-2026.ts.
// 결과 위에 단추 하나를 두고, 누르면 큰 글씨·한 줄 한 뜻·아이콘 목록으로 같은 내용을 다시 보여 줘요. 서버로 보내는 것 없음.
import { useState } from "react";
import { EASY_ICON, EASY_LABEL, toEasyRead, type EasyItem } from "../../lib/easy-read-2026";

type Props = { items: EasyItem[]; locale?: string; keepOrder?: boolean; max?: number };

export default function EasyRead({ items, locale = "ko", keepOrder, max }: Props) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);
  if (!items.length) return null;
  const L = EASY_LABEL[locale] ?? EASY_LABEL.en;
  const r = toEasyRead(items, { locale, keepOrder, max });
  const rows = all ? [...r.lines, ...r.more] : r.lines;
  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-primary bg-background px-4 text-base font-bold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
      >
        <span aria-hidden="true">📖</span>
        {open ? L.close : L.open}
      </button>
      {open && (
        <section aria-label={L.title} className="space-y-3 rounded-xl border-2 border-primary/40 bg-card p-4">
          <h3 className="text-xl font-bold text-foreground">{L.title}</h3>
          <ul className="space-y-2">
            {rows.map((l, i) => (
              <li key={i} className={"flex gap-3 text-lg leading-8 text-foreground " + (l.kind === "word" ? "ml-8 rounded-lg bg-muted px-3 py-1 text-base leading-7" : "")}>
                <span aria-hidden="true" className="shrink-0">{EASY_ICON[l.kind]}</span>
                <span className="min-w-0 break-words">{l.text}</span>
              </li>
            ))}
          </ul>
          {r.more.length > 0 && !all && (
            <button type="button" onClick={() => setAll(true)} className="min-h-12 rounded-xl border-2 border-border bg-background px-4 text-base font-bold text-foreground hover:border-primary">
              {L.more} ({r.more.filter((l) => l.kind !== "word").length})
            </button>
          )}
          {r.cites.length > 0 && (
            <p className="border-t border-border pt-2 text-sm leading-6 text-muted-foreground">
              {L.cites}: {r.cites.join(", ")}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
