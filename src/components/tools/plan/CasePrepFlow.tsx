// 상황별 상담 준비서 (보증금·빌려준 돈). Logic: lib/case-prep-2026.ts. 사건 파일은 이 브라우저(localStorage)에만 저장해요.
import { useEffect, useState } from "react";
import EasyRead from "../EasyRead";
import { CASE_FLOWS, buildCasePrep, caseFileKey, isValidInput, parseCasePrepFile, toCasePrepFile, type CaseFlowId, type CaseInput } from "../../../lib/case-prep-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const chip = (on: boolean) => `min-h-11 rounded-full border px-4 text-sm ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`;
const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || undefined;

export default function CasePrepFlow({ flow: id }: { flow: CaseFlowId }) {
  const flow = CASE_FLOWS[id];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [dates, setDates] = useState<Record<string, string>>({});
  const [amount, setAmount] = useState("");
  const [wants, setWants] = useState("");
  const [questions, setQuestions] = useState("");
  const [saved, setSaved] = useState("");
  const [stored, setStored] = useState<ReturnType<typeof parseCasePrepFile>>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { try { setStored(parseCasePrepFile(id, window.localStorage.getItem(caseFileKey(id)))); } catch { setStored(null); } }, [id]);
  const input: CaseInput = { answers, dates, amount: num(amount), wants, questions: questions.split("\n") };
  const ready = isValidInput(flow, input);
  const r = ready ? buildCasePrep(id, input) : null;
  const touch = () => { setCopied(false); setSaved(""); };
  const load = () => {
    const i = stored?.input; if (!i) return;
    setAnswers(i.answers); setDates(i.dates ?? {}); setAmount(i.amount ? String(i.amount) : ""); setWants(i.wants ?? ""); setQuestions((i.questions ?? []).join("\n")); touch();
  };
  const save = () => { if (!ready) return; try { const f = toCasePrepFile(id, input); window.localStorage.setItem(caseFileKey(id), JSON.stringify(f)); setStored(f); setSaved("이 브라우저에 저장했어요."); } catch { setSaved("이 브라우저에서는 저장할 수 없어요. 준비서를 복사해 두세요."); } };
  const forget = () => { try { window.localStorage.removeItem(caseFileKey(id)); } catch { /* storage blocked */ } setStored(null); setSaved("저장한 사건 파일을 지웠어요."); };
  const answered = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      {stored && answered === 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm">
          <span>{stored.savedAt}에 저장한 사건 파일이 있어요.</span>
          <button type="button" onClick={load} className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground">불러오기</button>
          <button type="button" onClick={forget} className="min-h-11 rounded-md border border-border px-4">지우기</button>
        </div>
      )}
      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <h2 className="text-lg font-bold">1. 어떤 상황인가요? ({answered}/{flow.questions.length})</h2>
        {flow.questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <p className="text-sm font-semibold">{q.label}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={q.label}>
              {q.choices.map((c) => <button key={c.id} type="button" aria-pressed={answers[q.id] === c.id} onClick={() => { setAnswers({ ...answers, [q.id]: c.id }); touch(); }} className={chip(answers[q.id] === c.id)}>{c.label}</button>)}
            </div>
          </div>
        ))}
      </section>
      {r && (
        <>
          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="text-lg font-bold">2. 날짜와 금액 (아는 것만)</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {flow.dates.map((f) => <label key={f.id} className="block text-sm">{f.label}<input type="date" className={field} value={dates[f.id] ?? ""} onChange={(e) => { setDates({ ...dates, [f.id]: e.target.value }); touch(); }} /></label>)}
              <label className="block text-sm">{flow.amountLabel}<input inputMode="numeric" className={field} value={amount} onChange={(e) => { setAmount(e.target.value); touch(); }} placeholder="예: 5000000" /></label>
              <label className="block text-sm">원하는 결과<input className={field} value={wants} onChange={(e) => { setWants(e.target.value); touch(); }} placeholder="예: 돈을 돌려받고 싶어요" /></label>
            </div>
            <label className="block text-sm">묻고 싶은 것 (한 줄에 하나)<textarea className={`${field} min-h-20 py-2`} value={questions} onChange={(e) => { setQuestions(e.target.value); touch(); }} /></label>
          </section>
          <EasyRead
            items={[
              ...r.checks.map((c) => ({ kind: "warn" as const, text: c })),
              ...r.steps.map((st) => ({ kind: "todo" as const, text: `${st.when}: ${st.what}${st.law ? ` (${st.law})` : ""}` })),
              ...r.help.map((h) => ({ kind: "call" as const, text: h })),
            ]}
          />
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-lg font-bold">먼저 확인할 것</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{r.checks.map((c) => <li key={c}>{c}</li>)}</ul>
          </section>
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-lg font-bold">{r.title}: 할 일</h2>
            <ol className="mt-2 space-y-2 text-sm">{r.steps.map((s) => <li key={s.what}><strong>{s.when}</strong> · {s.what}{s.law ? <span className="text-muted-foreground"> ({s.law})</span> : null}</li>)}</ol>
          </section>
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-lg font-bold">3. 금액과 기한 계산</h2>
            <p className="mt-1 text-sm text-muted-foreground">기한 날짜는 여기서 계산하지 않아요. 아래 도구에서 날짜를 넣어 확인하세요.</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">{r.tools.map((t) => <li key={t.href}><a href={t.href} className="flex min-h-11 items-center rounded-lg border border-border px-3 text-sm text-primary underline-offset-4 hover:underline">{t.title}</a></li>)}</ul>
          </section>
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
