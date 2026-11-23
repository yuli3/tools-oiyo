import { useState } from "react";
import { MEMO_EXPERTS, buildConsultMemo } from "../../../lib/consult-memo-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || undefined;

export default function ConsultMemo() {
  const [expert, setExpert] = useState("");
  const [situation, setSituation] = useState("");
  const [events, setEvents] = useState([{ date: "", what: "" }, { date: "", what: "" }, { date: "", what: "" }]);
  const [amount, setAmount] = useState("");
  const [wants, setWants] = useState("");
  const [questions, setQuestions] = useState("");
  const [have, setHave] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const touch = () => setCopied(false);
  const e = MEMO_EXPERTS.find((x) => x.id === expert);
  const r = situation.trim() ? buildConsultMemo({ expert, situation, events, amount: num(amount), wants, questions: questions.split("\n"), have }) : null;
  const shown = e ?? MEMO_EXPERTS.find((x) => x.id === r?.expert);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="상담 분야">
        <button type="button" role="tab" aria-selected={!expert} onClick={() => { setExpert(""); setHave([]); touch(); }} className={`min-h-11 rounded-full border px-4 text-sm ${!expert ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>잘 모르겠어요</button>
        {MEMO_EXPERTS.map((x) => <button key={x.id} type="button" role="tab" aria-selected={x.id === expert} onClick={() => { setExpert(x.id); setHave([]); touch(); }} className={`min-h-11 rounded-full border px-4 text-sm ${x.id === expert ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{x.icon} {x.name}</button>)}
      </div>
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4">
        <label className="block text-sm">무슨 일인지 한두 줄로<textarea className={`${field} min-h-20 py-2`} value={situation} onChange={(v) => { setSituation(v.target.value); touch(); }} placeholder="예: 퇴사했는데 두 달 치 월급과 퇴직금을 못 받았어요." /></label>
        <fieldset className="space-y-2">
          <legend className="text-sm">지금까지 경과 (날짜를 알면 넣어요)</legend>
          {events.map((v, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-3">
              <input type="date" aria-label={`경과 ${i + 1} 날짜`} className={field} value={v.date} onChange={(x) => { const n = [...events]; n[i] = { ...v, date: x.target.value }; setEvents(n); touch(); }} />
              <input aria-label={`경과 ${i + 1} 내용`} className={`${field} sm:col-span-2`} value={v.what} placeholder="예: 회사에 문자로 지급 요청" onChange={(x) => { const n = [...events]; n[i] = { ...v, what: x.target.value }; setEvents(n); touch(); }} />
            </div>
          ))}
          <button type="button" onClick={() => setEvents([...events, { date: "", what: "" }])} className="min-h-11 rounded-md border border-border px-4 text-sm">경과 한 줄 더</button>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">관련 금액(원, 선택)<input inputMode="numeric" className={field} value={amount} onChange={(v) => { setAmount(v.target.value); touch(); }} placeholder="예: 6000000" /></label>
          <label className="block text-sm">원하는 결과(선택)<input className={field} value={wants} onChange={(v) => { setWants(v.target.value); touch(); }} placeholder="예: 밀린 돈을 받고 싶어요" /></label>
        </div>
        <label className="block text-sm">묻고 싶은 것 (한 줄에 하나)<textarea className={`${field} min-h-20 py-2`} value={questions} onChange={(v) => { setQuestions(v.target.value); touch(); }} placeholder={"예: 대지급금을 받을 수 있나요?\n진정은 어디에 내나요?"} /></label>
        {shown && (
          <fieldset>
            <legend className="text-sm">이미 챙긴 서류</legend>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              {shown.bring.map((b) => <label key={b} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5 shrink-0" checked={have.includes(b)} onChange={(x) => { setHave(x.target.checked ? [...have, b] : have.filter((h) => h !== b)); touch(); }} />{b}</label>)}
            </div>
          </fieldset>
        )}
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">상담 메모</h2>
          {r && <button type="button" onClick={() => { navigator.clipboard?.writeText(r.text).then(() => setCopied(true)).catch(() => setCopied(false)); }} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">{copied ? "복사했어요" : "메모 복사"}</button>}
        </div>
        {r ? (
          <>
            <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 text-sm leading-6">{r.text}</pre>
            <p className="mt-2 text-sm">무료 창구: {r.free.join(" · ")}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{r.tips.map((x) => <li key={x}>{x}</li>)}</ul>
          </>
        ) : <p className="mt-2 text-sm text-muted-foreground">무슨 일인지 적으면 메모가 여기에 만들어져요.</p>}
      </section>
    </div>
  );
}
