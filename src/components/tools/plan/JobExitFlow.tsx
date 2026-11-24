// 퇴사·해고·임금체불 상담 흐름. Logic: lib/job-exit-flow-2026.ts. 사건 파일은 이 브라우저(localStorage)에만 저장해요.
import { useEffect, useState } from "react";
import { CASE_FILE_KEY, EXIT_HOW, EXIT_UNPAID, buildJobExitFlow, parseCaseFile, toCaseFile, type ExitHow, type ExitInput, type ExitUnpaid } from "../../../lib/job-exit-flow-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const chip = (on: boolean) => `min-h-11 rounded-full border px-4 text-sm ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`;
const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || undefined;

export default function JobExitFlow() {
  const [how, setHow] = useState<ExitHow | "">("");
  const [unpaid, setUnpaid] = useState<ExitUnpaid | "">("");
  const [written, setWritten] = useState<"yes" | "no" | "unknown">("unknown");
  const [size, setSize] = useState<"5plus" | "under5" | "unknown">("unknown");
  const [start, setStart] = useState("");
  const [notice, setNotice] = useState("");
  const [last, setLast] = useState("");
  const [amount, setAmount] = useState("");
  const [wants, setWants] = useState("");
  const [questions, setQuestions] = useState("");
  const [saved, setSaved] = useState<string>("");
  const [stored, setStored] = useState<ReturnType<typeof parseCaseFile>>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { try { setStored(parseCaseFile(window.localStorage.getItem(CASE_FILE_KEY))); } catch { setStored(null); } }, []);
  const input: ExitInput | null = how && unpaid ? { how, unpaid, written, size, start, notice, last, amount: num(amount), wants, questions: questions.split("\n") } : null;
  const r = input ? buildJobExitFlow(input) : null;
  const touch = () => { setCopied(false); setSaved(""); };
  const load = () => {
    const i = stored?.input; if (!i) return;
    setHow(i.how); setUnpaid(i.unpaid); setWritten(i.written ?? "unknown"); setSize(i.size ?? "unknown");
    setStart(i.start ?? ""); setNotice(i.notice ?? ""); setLast(i.last ?? ""); setAmount(i.amount ? String(i.amount) : "");
    setWants(i.wants ?? ""); setQuestions((i.questions ?? []).join("\n")); touch();
  };
  const save = () => { if (!input) return; try { const f = toCaseFile(input); window.localStorage.setItem(CASE_FILE_KEY, JSON.stringify(f)); setStored(f); setSaved("이 브라우저에 저장했어요."); } catch { setSaved("이 브라우저에서는 저장할 수 없어요. 준비서를 복사해 두세요."); } };
  const forget = () => { try { window.localStorage.removeItem(CASE_FILE_KEY); } catch { /* storage blocked */ } setStored(null); setSaved("저장한 사건 파일을 지웠어요."); };

  return (
    <div className="space-y-4">
      {stored && !input && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm">
          <span>{stored.savedAt}에 저장한 사건 파일이 있어요.</span>
          <button type="button" onClick={load} className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground">불러오기</button>
          <button type="button" onClick={forget} className="min-h-11 rounded-md border border-border px-4">지우기</button>
        </div>
      )}
      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-lg font-bold">1. 어떤 상황인가요?</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="회사를 나온 방식">{EXIT_HOW.map((h) => <button key={h.id} type="button" aria-pressed={how === h.id} onClick={() => { setHow(h.id); touch(); }} className={chip(how === h.id)}>{h.label}</button>)}</div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="못 받은 돈">{EXIT_UNPAID.map((u) => <button key={u.id} type="button" aria-pressed={unpaid === u.id} onClick={() => { setUnpaid(u.id); touch(); }} className={chip(unpaid === u.id)}>{u.label}</button>)}</div>
        {how === "dismissed" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">해고 사유·날짜가 적힌 서면을 받았나요?<select className={field} value={written} onChange={(e) => { setWritten(e.target.value as typeof written); touch(); }}><option value="unknown">모르겠어요</option><option value="yes">받았어요</option><option value="no">말이나 문자로만 들었어요</option></select></label>
            <label className="block text-sm">직원은 모두 몇 명인가요?<select className={field} value={size} onChange={(e) => { setSize(e.target.value as typeof size); touch(); }}><option value="unknown">모르겠어요</option><option value="5plus">5명 이상</option><option value="under5">5명 미만</option></select></label>
          </div>
        )}
      </section>
      {r && (
        <>
          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="text-lg font-bold">2. 날짜와 금액 (아는 것만)</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">입사일<input type="date" className={field} value={start} onChange={(e) => { setStart(e.target.value); touch(); }} /></label>
              <label className="block text-sm">통보일<input type="date" className={field} value={notice} onChange={(e) => { setNotice(e.target.value); touch(); }} /></label>
              <label className="block text-sm">마지막 근무일<input type="date" className={field} value={last} onChange={(e) => { setLast(e.target.value); touch(); }} /></label>
              <label className="block text-sm">못 받은 돈(원)<input inputMode="numeric" className={field} value={amount} onChange={(e) => { setAmount(e.target.value); touch(); }} placeholder="예: 6000000" /></label>
              <label className="block text-sm sm:col-span-2">원하는 결과<input className={field} value={wants} onChange={(e) => { setWants(e.target.value); touch(); }} placeholder="예: 밀린 돈을 받고 실업급여도 받고 싶어요" /></label>
            </div>
            <label className="block text-sm">묻고 싶은 것 (한 줄에 하나)<textarea className={`${field} min-h-20 py-2`} value={questions} onChange={(e) => { setQuestions(e.target.value); touch(); }} /></label>
          </section>
          {r.checks.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-lg font-bold">먼저 확인할 것</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{r.checks.map((c) => <li key={c}>{c}</li>)}</ul>
            </section>
          )}
          {r.steps.map((d) => (
            <section key={d.id} className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-lg font-bold">{d.title}: 할 일</h2>
              <ol className="mt-2 space-y-2 text-sm">{d.steps.map((s) => <li key={s.what}><strong>{s.when}</strong> · {s.what}{s.law ? <span className="text-muted-foreground"> ({s.law})</span> : null}</li>)}</ol>
            </section>
          ))}
          {r.tools.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-lg font-bold">3. 금액과 기한 계산</h2>
              <p className="mt-1 text-sm text-muted-foreground">기한 날짜는 여기서 계산하지 않아요. 아래 도구에서 날짜를 넣어 확인하세요.</p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">{[...r.tools, { href: "/ko/appeal-deadline-calculator/", title: "기한 계산" }].filter((t, i, a) => a.findIndex((y) => y.href === t.href) === i).map((t) => <li key={t.href}><a href={t.href} className="flex min-h-11 items-center rounded-lg border border-border px-3 text-sm text-primary underline-offset-4 hover:underline">{t.title}</a></li>)}</ul>
            </section>
          )}
          <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">4. 상담 준비서</h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={save} className="min-h-11 rounded-md border border-border bg-background px-4 text-sm">이 브라우저에 저장</button>
                <button type="button" onClick={() => window.print()} className="min-h-11 rounded-md border border-border bg-background px-4 text-sm">인쇄·PDF</button>
                <button type="button" onClick={() => navigator.clipboard?.writeText(r.memo).then(() => setCopied(true)).catch(() => setCopied(false))} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">{copied ? "복사했어요" : "준비서 복사"}</button>
              </div>
            </div>
            {saved && <p className="mt-2 text-sm">{saved}</p>}
            <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 text-sm leading-6">{r.memo}</pre>
          </section>
        </>
      )}
      <p className="text-sm text-muted-foreground">입력한 내용은 서버로 보내지 않아요. 저장을 누를 때만 이 브라우저에 남고, 언제든 지울 수 있어요.</p>
    </div>
  );
}
