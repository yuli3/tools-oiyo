// Per-country first-consultation intake sheet (practitioner tool). Logic: lib/world-intake-memo-2026.ts
import { useState } from "react";
import { INTAKE, buildIntakeMemo, type IntakeCountry } from "../../../lib/world-intake-memo-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
type UI = { client: string; date: string; parties: string; memo: string; open: (n: number) => string; copy: string; copied: string; clear: string; privacy: string };
const UI_EN: UI = { client: "Client", date: "Date", parties: "Other parties (comma or one per line)", memo: "Memo", open: (n) => `${n} still to confirm`, copy: "Copy", copied: "Copied", clear: "Clear", privacy: "Nothing you type leaves this browser or is stored." };
const UI_TEXT: Record<string, UI> = {
  en: UI_EN,
  ja: { client: "相談者名", date: "相談日", parties: "相手方（読点か改行で区切る）", memo: "相談メモ", open: (n) => `未確認 ${n}項目`, copy: "コピー", copied: "コピーしました", clear: "消去", privacy: "入力内容はこのブラウザの外に送られず、保存もされません。" },
  de: { client: "Mandant", date: "Datum", parties: "Gegenseite (Komma oder je Zeile)", memo: "Notiz", open: (n) => `${n} noch offen`, copy: "Kopieren", copied: "Kopiert", clear: "Leeren", privacy: "Ihre Eingaben bleiben im Browser und werden nicht gespeichert." },
  fr: { client: "Client", date: "Date", parties: "Autres parties (virgule ou une par ligne)", memo: "Note", open: (n) => `${n} à vérifier`, copy: "Copier", copied: "Copié", clear: "Effacer", privacy: "Vos saisies restent dans ce navigateur et ne sont pas enregistrées." },
  es: { client: "Cliente", date: "Fecha", parties: "Otra parte (coma o una por línea)", memo: "Nota", open: (n) => `${n} pendientes`, copy: "Copiar", copied: "Copiado", clear: "Borrar", privacy: "Lo que escribe no sale de este navegador ni se guarda." },
};

export default function WorldIntakeMemo({ country }: { country: IntakeCountry }) {
  const pack = INTAKE[country];
  const ui = UI_TEXT[pack.lang] ?? UI_EN;
  const [area, setArea] = useState(pack.areas[0].id);
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");
  const [parties, setParties] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const r = buildIntakeMemo({ country, area, client, date, answers, parties });
  const touch = () => setCopied(false);
  const copy = () => navigator.clipboard?.writeText(r.memo).then(() => setCopied(true)).catch(() => setCopied(false));
  return (
    <div className="space-y-4" lang={pack.lang}>
      <div className="flex flex-wrap gap-2" role="tablist">
        {pack.areas.map((a) => <button key={a.id} type="button" role="tab" aria-selected={a.id === area} onClick={() => { setArea(a.id); touch(); }} className={`min-h-11 rounded-full border px-4 text-sm ${a.id === area ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{a.label}</button>)}
      </div>
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="block text-sm">{ui.client}<input className={field} value={client} onChange={(e) => { setClient(e.target.value); touch(); }} /></label>
        <label className="block text-sm">{ui.date}<input type="date" className={field} value={date} onChange={(e) => { setDate(e.target.value); touch(); }} /></label>
        <label className="block text-sm sm:col-span-2">{ui.parties}<textarea className={`${field} min-h-16 py-2`} value={parties} onChange={(e) => { setParties(e.target.value); touch(); }} /></label>
      </section>
      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        {r.questions.map((q) => <label key={q} className="block text-sm">{q}<textarea className={`${field} min-h-11 py-2`} value={answers[q] ?? ""} onChange={(e) => { setAnswers({ ...answers, [q]: e.target.value }); touch(); }} /></label>)}
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{ui.memo} · {ui.open(r.open.length)}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setAnswers({}); setParties(""); setClient(""); setDate(""); touch(); }} className="min-h-11 rounded-md border border-border bg-background px-4 text-sm">{ui.clear}</button>
            <button type="button" onClick={copy} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">{copied ? ui.copied : ui.copy}</button>
          </div>
        </div>
        <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 text-sm leading-6">{r.memo}</pre>
      </section>
      <p className="text-sm text-muted-foreground">{ui.privacy}</p>
    </div>
  );
}
