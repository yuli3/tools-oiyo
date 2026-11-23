import { useEffect, useState } from "react";
import { EXPERTS, findExpertNeeds } from "../../../lib/expert-visit-2026";
import { KR_DESKS } from "../../../lib/kr-desks-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const deskHref = (id: string) => `${KR_DESKS.find((d) => d.id === id)?.kind === "job" ? "/ko/job-desk/" : "/ko/life-event-navigator/"}#${id}`;
const deskTitle = (id: string) => KR_DESKS.find((d) => d.id === id)?.title ?? id;

export default function ExpertVisit() {
  const [id, setId] = useState(EXPERTS[0].id);
  const [q, setQ] = useState("");
  const [have, setHave] = useState<Record<string, boolean>>({});
  useEffect(() => { const h = window.location.hash.slice(1); if (EXPERTS.some((e) => e.id === h)) setId(h); }, []);
  const e = EXPERTS.find((x) => x.id === id) ?? EXPERTS[0];
  const hits = q.trim() ? findExpertNeeds(q, 4) : [];
  const pick = (x: string) => { setId(x); history.replaceState(null, "", `#${x}`); };
  return (
    <div className="space-y-4">
      <label className="block text-sm">어떤 일 때문에 상담받으려 하세요?<input className={field} value={q} placeholder="예: 부당해고, 상속등기, 영업정지, 기장료, 복비, 보험 리모델링" onChange={(ev) => setQ(ev.target.value)} /></label>
      {q.trim() && (
        <ul className="space-y-2" aria-live="polite">
          {hits.length === 0 && <li className="text-sm text-muted-foreground">맞는 항목을 찾지 못했어요. 아래에서 전문가를 직접 골라 주세요.</li>}
          {hits.map((h) => {
            const ex = EXPERTS.find((x) => x.id === h.expert)!;
            return (
              <li key={`${h.expert}:${h.need.id}`}>
                <button type="button" onClick={() => pick(ex.id)} className="block min-h-11 w-full rounded-lg border border-border bg-card p-3 text-left text-sm">
                  <b>{ex.icon} {ex.name}</b> · {h.need.q}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-wrap gap-2" role="tablist">
        {EXPERTS.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={x.id === e.id} onClick={() => pick(x.id)} className={`min-h-11 rounded-full border px-4 text-sm ${x.id === e.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{x.icon} {x.id === "plan" ? "재무설계" : x.name}</button>
        ))}
      </div>
      <section className="rounded-xl border border-border bg-card p-4" aria-live="polite">
        <h2 className="text-xl font-bold">{e.icon} {e.name}</h2>
        <p className="text-sm text-muted-foreground">{e.scope} ({e.law}) · <a href={e.guide} className="text-primary underline underline-offset-4">업무 범위 자세히</a></p>
        <h3 className="mt-4 font-semibold">사람들이 자주 찾는 일 → 먼저 해 볼 도구</h3>
        <ul className="mt-2 space-y-3">
          {e.needs.map((n) => (
            <li key={n.id} className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold">{n.q}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {n.tools.map((t) => <a key={t.href} href={t.href} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">{t.title}</a>)}
                {n.desk && <a href={deskHref(n.desk)} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">할 일·기한: {deskTitle(n.desk)}</a>}
              </p>
            </li>
          ))}
        </ul>
        <h3 className="mt-4 font-semibold">챙겨 갈 서류</h3>
        <ul className="mt-2 space-y-1">
          {e.bring.map((b) => {
            const k = `${e.id}:${b}`;
            return <li key={k}><label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" className="size-5 shrink-0" checked={!!have[k]} onChange={(ev) => setHave({ ...have, [k]: ev.target.checked })} />{b}</label></li>;
          })}
        </ul>
        <p className="mt-2 text-sm"><a href="/ko/consult-memo-builder/" className="text-primary underline underline-offset-4">상담에 가져갈 한 장 메모 만들기</a></p>
        <h3 className="mt-4 font-semibold">무료 공식 창구</h3>
        <p className="text-sm">{e.free.join(" · ")}</p>
        <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs leading-5">{e.lawyerWhen}</p>
      </section>
    </div>
  );
}
