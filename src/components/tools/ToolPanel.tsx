import type { ReactNode } from 'react';

// WHY 2026-10-27: Blog utilities used a game-styled container; Tools keeps the
// same title/reset contract with Tools theme tokens only.
export function ToolPanel({ title, subtitle, onReset, children }: { title: string; subtitle?: string; onReset?: () => void; children: ReactNode }) {
  return (
    <div className="mx-auto my-6 max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{subtitle}</p>}
        </div>
        {onReset && (
          <button type="button" onClick={onReset} className="min-h-11 rounded-lg border border-border bg-muted px-4 text-xs font-bold text-foreground">
            RESET
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
