import type { ReactNode } from 'react';

// WHY 2026-10-27: Blog utilities used a game-styled container; Tools keeps the
// same title/reset contract with Tools theme tokens only.
// WHY 2026-11-03 (impeccable pilot): the page H1 already names the tool, so the
// panel title steps down a level and the subtitle drops the all-caps eyebrow look.
export function ToolPanel({ title, subtitle, onReset, children }: { title: string; subtitle?: string; onReset?: () => void; children: ReactNode }) {
  // WHY 2026-11-03 (ToolShell): the shell already shows the H1 and description,
  // so the panel no longer draws its own card frame or a second visible title.
  // The h2 stays for screen-reader outline; the inner cards are the only cards.
  return (
    <section className="my-6" aria-label={title}>
      <h2 className="sr-only">{title}</h2>
      {subtitle && <p className="sr-only">{subtitle}</p>}
      {onReset && (
        <div className="mb-3 flex justify-end">
          <button type="button" onClick={onReset} className="min-h-11 rounded-lg border border-border bg-muted px-4 text-sm font-semibold text-foreground">
            RESET
          </button>
        </div>
      )}
      {children}
    </section>
  );
}
