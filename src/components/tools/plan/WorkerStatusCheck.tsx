import { useState } from "react";
import { FACTORS, workerStatusCheck } from "../../../lib/worker-status-check-2026";

export default function WorkerStatusCheck() {
  const [yes, setYes] = useState<string[]>([]);
  const r = workerStatusCheck(yes);
  const groups = [...new Set(FACTORS.map((f) => f.group))];
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <fieldset key={g} className="rounded-xl border border-border bg-card p-4">
          <legend className="px-1 text-sm font-semibold">{g}</legend>
          <ul className="space-y-1">
            {FACTORS.filter((f) => f.group === g).map((f) => (
              <li key={f.id}>
                <label className="flex min-h-11 items-start gap-3 text-base">
                  <input type="checkbox" className="mt-1 size-5 shrink-0" checked={yes.includes(f.id)} onChange={(e) => setYes(e.target.checked ? [...yes, f.id] : yes.filter((x) => x !== f.id))} />
                  <span>{f.q}{f.weight === "main" && <span className="ml-1 text-xs text-muted-foreground">(핵심)</span>}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ))}
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        <h2 className="text-lg font-bold">{r.lean}</h2>
        <p className="mt-1 text-sm">근로자 쪽 요소 {r.count}/{r.total}개 · 핵심 요소 {r.main}/{r.mainTotal}개 · 기준: {r.case}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
        <h3 className="mt-4 font-semibold">근로자로 인정되면 따져 볼 것</h3>
        <p className="text-sm">{r.ifWorker.join(" · ")}</p>
        <h3 className="mt-4 font-semibold">지금 모아 둘 자료</h3>
        <p className="text-sm">{r.keep.join(" · ")}</p>
        <p className="mt-3 text-sm"><a href="/ko/consult-memo-builder/" className="text-primary underline underline-offset-4">상담 메모 만들기</a> · <a href="/ko/freelance-contract-check/" className="text-primary underline underline-offset-4">프리랜서 계약서 점검</a> · <a href="/ko/severance-calculator/" className="text-primary underline underline-offset-4">퇴직금 계산</a></p>
      </section>
    </div>
  );
}
