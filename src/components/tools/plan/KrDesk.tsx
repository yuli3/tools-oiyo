import { useState } from "react";
import { KR_DESKS, findDesks } from "../../../lib/kr-desks-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";

export default function KrDesk({ kind }: { kind: "job" | "event" }) {
  const list = KR_DESKS.filter((d) => d.kind === kind);
  const [id, setId] = useState(list[0].id);
  const [q, setQ] = useState("");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const hits = q.trim() ? findDesks(q, kind) : [];
  const d = list.find((x) => x.id === id) ?? list[0];
  return (
    <div className="space-y-4">
      <label className="block text-sm">{kind === "job" ? "하는 일을 적어 보세요" : "무슨 일이 있었는지 적어 보세요"}<input className={field} value={q} placeholder={kind === "job" ? "예: 유튜브 애드센스 수익이 생겼어요" : "예: 다음 달에 퇴사해요"} onChange={(e) => setQ(e.target.value)} /></label>
      {q.trim() && <p className="text-sm text-muted-foreground">{hits.length ? "맞는 창구를 골라 보세요." : "맞는 창구를 찾지 못했어요. 아래에서 직접 골라 주세요."}</p>}
      <div className="flex flex-wrap gap-2" role="tablist">
        {(hits.length ? hits : list).map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={x.id === d.id} onClick={() => setId(x.id)} className={`min-h-11 rounded-full border px-4 text-sm ${x.id === d.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{x.icon} {x.title}</button>
        ))}
      </div>
      <section className="rounded-xl border border-border bg-card p-4" aria-live="polite">
        <h2 className="text-xl font-bold">{d.icon} {d.title}</h2>
        <p className="text-sm text-muted-foreground">{d.who}</p>
        <h3 className="mt-4 font-semibold">할 일과 기한</h3>
        <ul className="mt-2 space-y-2">
          {d.steps.map((s) => {
            const k = `${d.id}:${s.what}`;
            return (
              <li key={k}>
                <label className="flex min-h-11 items-start gap-3 text-sm">
                  <input type="checkbox" className="mt-1 size-5 shrink-0" checked={!!done[k]} onChange={(e) => setDone({ ...done, [k]: e.target.checked })} />
                  <span><b>{s.when}</b> · {s.what}{s.law && <span className="text-muted-foreground"> ({s.law})</span>}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <h3 className="mt-4 font-semibold">이어지는 도구</h3>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {d.tools.map((t) => <li key={t.href}><a href={t.href} className="block min-h-11 rounded-lg border border-border p-3 text-sm text-primary underline underline-offset-4">{t.title}</a></li>)}
        </ul>
        <h3 className="mt-4 font-semibold">무료 공식 창구</h3>
        <p className="text-sm">{d.help.join(" · ")}</p>
      </section>
    </div>
  );
}
