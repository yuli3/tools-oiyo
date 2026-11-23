import { useState } from "react";
import { LETTER_TYPES, buildDemandLetter, type LetterType } from "../../../lib/demand-letter-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || undefined;

export default function DemandLetter() {
  const [type, setType] = useState<LetterType>("loan");
  const [f, setF] = useState({ sender: "", senderAddress: "", receiver: "", receiverAddress: "", amount: "", since: "", dueDate: "", account: "", facts: "" });
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF({ ...f, [k]: e.target.value }); setCopied(false); };
  const t = LETTER_TYPES.find((x) => x.id === type)!;
  const today = new Date().toISOString().slice(0, 10);
  const r = buildDemandLetter({ type, ...f, amount: num(f.amount), today });
  const inp = (label: string, k: keyof typeof f, type2 = "text", ph = "") => <label className="block text-sm">{label}<input type={type2} className={field} value={f[k]} placeholder={ph} onChange={set(k)} /></label>;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist">
        {LETTER_TYPES.map((x) => <button key={x.id} type="button" role="tab" aria-selected={x.id === type} onClick={() => setType(x.id)} className={`min-h-11 rounded-full border px-4 text-sm ${x.id === type ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{x.title}</button>)}
      </div>
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        {inp("보내는 사람", "sender")}
        {inp("보내는 사람 주소(선택)", "senderAddress")}
        {inp("받는 사람", "receiver")}
        {inp("받는 사람 주소(선택)", "receiverAddress")}
        {inp("금액(원)", "amount", "text", "예: 3000000")}
        {inp(t.sinceLabel, "since", "date")}
        {type !== "nonrenewal" && inp("갚을(돌려줄) 기한", "dueDate", "date")}
        {inp("받을 계좌(선택)", "account")}
        <label className="block text-sm sm:col-span-2">사실관계 한두 줄(선택)<textarea className={`${field} min-h-24 py-2`} value={f.facts} onChange={set("facts")} placeholder="예: 2026년 6월 30일까지 갚기로 약속하였으나 지키지 않았습니다." /></label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">문안 미리보기</h2>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(r.text).then(() => setCopied(true)).catch(() => setCopied(false)); }} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">{copied ? "복사했어요" : "문안 복사"}</button>
        </div>
        <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 text-sm leading-6">{r.text}</pre>
        <p className="mt-2 text-xs text-muted-foreground">관련 조문: {r.law}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{r.tips.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>
    </div>
  );
}
