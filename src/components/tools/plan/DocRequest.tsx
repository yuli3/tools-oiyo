import { useState } from "react";
import { DOC_JOBS, buildDocRequest, type JobKind } from "../../../lib/doc-request-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";

export default function DocRequest() {
  const [job, setJob] = useState<JobKind>("income");
  const [client, setClient] = useState("");
  const [office, setOffice] = useState("");
  const [due, setDue] = useState("");
  const [extra, setExtra] = useState("");
  const [received, setReceived] = useState<string[]>([]);
  const [copied, setCopied] = useState("");
  const r = buildDocRequest({ job, client, office, due, received, extra: extra.split("\n") });
  const copy = (k: string, t: string) => navigator.clipboard?.writeText(t).then(() => setCopied(k)).catch(() => setCopied(""));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="업무 종류">
        {DOC_JOBS.map((d) => <button key={d.id} type="button" role="tab" aria-selected={d.id === job} onClick={() => { setJob(d.id); setReceived([]); setCopied(""); }} className={`min-h-11 rounded-full border px-4 text-sm ${d.id === job ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{d.title}</button>)}
      </div>
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <label className="block text-sm">고객 이름<input className={field} value={client} placeholder="예: 김OO 대표님" onChange={(e) => { setClient(e.target.value); setCopied(""); }} /></label>
        <label className="block text-sm">사무실 이름<input className={field} value={office} placeholder="예: OO사무소" onChange={(e) => { setOffice(e.target.value); setCopied(""); }} /></label>
        <label className="block text-sm">자료 받을 날짜<input type="date" className={field} value={due} onChange={(e) => { setDue(e.target.value); setCopied(""); }} /></label>
        <label className="block text-sm sm:col-span-3">더 받을 자료 (한 줄에 하나, 선택)<textarea className={`${field} min-h-16 py-2`} value={extra} onChange={(e) => { setExtra(e.target.value); setCopied(""); }} /></label>
      </section>
      <fieldset className="rounded-xl border border-border bg-card p-4">
        <legend className="px-1 text-sm font-semibold">받은 자료 체크</legend>
        <div className="grid gap-1 sm:grid-cols-2">
          {r.docs.map((d) => <label key={d} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5 shrink-0" checked={received.includes(d)} onChange={(e) => { setReceived(e.target.checked ? [...received, d] : received.filter((x) => x !== d)); setCopied(""); }} />{d}</label>)}
        </div>
      </fieldset>
      {[["first", "첫 요청 문자", r.first], ["reminder", r.done ? "완료 안내" : `빠진 자료 ${r.missing.length}가지 재요청`, r.reminder]].map(([k, title, text]) => (
        <section key={k} className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">{title}</h2>
            <button type="button" onClick={() => copy(k, text)} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">{copied === k ? "복사했어요" : "복사"}</button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 text-sm leading-6">{text}</pre>
        </section>
      ))}
      <p className="text-sm text-muted-foreground">입력은 이 브라우저 밖으로 나가지 않고 저장되지 않아요. 고객별 기한은 <a href="/ko/client-deadline-board/" className="text-primary underline underline-offset-4">고객별 신고 마감 보드</a>에서 확인해요.</p>
    </div>
  );
}
