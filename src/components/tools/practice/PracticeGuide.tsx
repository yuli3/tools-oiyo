// 실무 길잡이 화면 (2026-11-17). 상황 고르기 → 준비물·확인할 점 체크 → 날짜를 넣으면 기한 계산 → 공식 창구.
// 데이터: lib/pro-practice-guides-2026.ts
import { useState } from "react";
import { guideBySlug, guideDeadlines } from "../../../lib/pro-practice-guides-2026";
import DateField from "../payroll/DateField";

const chip = (on: boolean) =>
  "min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition-colors " +
  (on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted");

export default function PracticeGuide({ slug }: { slug: string }) {
  const g = guideBySlug(slug)!;
  const [caseId, setCaseId] = useState(g.cases[0].id);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [from, setFrom] = useState<Record<string, string>>({});
  const c = g.cases.find((x) => x.id === caseId)!;
  const items = [...c.prepare.map((x, i) => ({ ...x, key: `${c.id}-p${i}` })), ...c.check.map((x, i) => ({ ...x, key: `${c.id}-c${i}` }))];
  const checked = items.filter((x) => done[x.key]).length;
  const dl = guideDeadlines(c, from);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">상황을 골라 주세요</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {g.cases.map((x) => (
            <button key={x.id} type="button" className={chip(x.id === caseId)} aria-pressed={x.id === caseId} onClick={() => setCaseId(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm leading-6 text-foreground">
        <p className="font-semibold">{c.summary}</p>
        <p className="mt-1 text-muted-foreground">{c.who}</p>
      </div>

      {[
        { title: "준비할 것", list: c.prepare, prefix: "p" },
        { title: "확인할 점", list: c.check, prefix: "c" },
      ].map((sec) =>
        sec.list.length ? (
          <section key={sec.prefix} aria-labelledby={`${sec.prefix}-title`} className="space-y-2">
            <h3 id={`${sec.prefix}-title`} className="text-base font-semibold text-foreground">{sec.title}</h3>
            <ul className="space-y-2">
              {sec.list.map((x, i) => {
                const key = `${c.id}-${sec.prefix}${i}`;
                return (
                  <li key={key}>
                    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm leading-6">
                      <input type="checkbox" className="mt-1 size-5 shrink-0" checked={!!done[key]} onChange={(e) => setDone({ ...done, [key]: e.target.checked })} />
                      <span className="text-foreground">
                        {x.text}
                        {x.cite && <span className="text-xs text-muted-foreground"> ({x.cite})</span>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null,
      )}
      <p className="text-sm font-semibold text-foreground" aria-live="polite">체크 {checked}/{items.length}</p>

      {c.deadlines.length > 0 && (
        <section aria-labelledby="dl-title" className="space-y-3">
          <h3 id="dl-title" className="text-base font-semibold text-foreground">기한 계산</h3>
          {dl.map((d) => (
            <div key={d.id} className="grid gap-2 rounded-md border border-border bg-background p-3 sm:grid-cols-2 sm:items-end">
              <DateField label={`${d.label}: ${d.from}`} value={from[d.id] ?? ""} onChange={(v) => setFrom({ ...from, [d.id]: v })} />
              <p className="text-sm leading-6 text-foreground">
                {d.due ? (
                  <>
                    <strong>{d.due}</strong>까지{d.shifted ? " (휴일이라 다음 날로 미뤄졌어요)" : ""}
                  </>
                ) : (
                  <span className="text-muted-foreground">날짜를 넣으면 기한을 계산해요</span>
                )}
                <span className="block text-xs text-muted-foreground">{d.cite}</span>
              </p>
            </div>
          ))}
        </section>
      )}

      <section aria-labelledby="link-title" className="space-y-2">
        <h3 id="link-title" className="text-base font-semibold text-foreground">공식 창구</h3>
        <ul className="flex flex-wrap gap-2">
          {c.links.map((l) => (
            <li key={l.href}>
              <a className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm text-foreground underline-offset-4 hover:underline" href={l.href} rel="noopener" target={l.href.startsWith("http") ? "_blank" : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
