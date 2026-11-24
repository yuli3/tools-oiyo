// Per-country client document request for the personal tax return (practitioner tool). Logic: lib/world-client-docs-2026.ts
import { useState } from "react";
import { CLIENT_DOCS, buildClientDocRequest, type DocCountry } from "../../../lib/world-client-docs-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
type UI = { client: string; office: string; due: string; extra: string; got: string; first: string; again: (n: number) => string; done: string; copy: string; copied: string; privacy: string };
const UI_EN: UI = { client: "Client name", office: "Your firm", due: "Send by", extra: "Other items (one per line, optional)", got: "Tick what you have received", first: "First request", again: (n) => `Reminder for ${n} missing item(s)`, done: "All received", copy: "Copy", copied: "Copied", privacy: "Nothing you type leaves this browser or is stored." };
const UI_TEXT: Record<string, UI> = {
  en: UI_EN,
  ja: { client: "お客様名", office: "事務所名", due: "提出期限（任意）", extra: "追加で依頼する書類（1行に1つ）", got: "受け取った書類にチェック", first: "最初の依頼文", again: (n) => `未着${n}点の再依頼`, done: "すべて受領", copy: "コピー", copied: "コピーしました", privacy: "入力内容はこのブラウザの外に送られず、保存もされません。" },
  de: { client: "Name des Mandanten", office: "Kanzlei", due: "Bitte bis", extra: "Weitere Unterlagen (eine pro Zeile, optional)", got: "Erhaltene Unterlagen abhaken", first: "Erste Anfrage", again: (n) => `Erinnerung: ${n} fehlen`, done: "Alles erhalten", copy: "Kopieren", copied: "Kopiert", privacy: "Ihre Eingaben bleiben im Browser und werden nicht gespeichert." },
  fr: { client: "Nom du client", office: "Cabinet", due: "À envoyer avant le", extra: "Autres pièces (une par ligne, facultatif)", got: "Cocher les pièces reçues", first: "Première demande", again: (n) => `Relance : ${n} pièce(s) manquante(s)`, done: "Tout est reçu", copy: "Copier", copied: "Copié", privacy: "Vos saisies restent dans ce navigateur et ne sont pas enregistrées." },
  es: { client: "Nombre del cliente", office: "Asesoría", due: "Enviar antes del", extra: "Otros documentos (uno por línea, opcional)", got: "Marque lo recibido", first: "Primera solicitud", again: (n) => `Recordatorio: faltan ${n}`, done: "Todo recibido", copy: "Copiar", copied: "Copiado", privacy: "Lo que escribe no sale de este navegador ni se guarda." },
};

export default function WorldClientDocs({ country }: { country: DocCountry }) {
  const pack = CLIENT_DOCS[country];
  const ui = UI_TEXT[pack.lang] ?? UI_EN;
  const [job, setJob] = useState(pack.jobs[0].id);
  const [client, setClient] = useState("");
  const [office, setOffice] = useState("");
  const [due, setDue] = useState("");
  const [extra, setExtra] = useState("");
  const [received, setReceived] = useState<string[]>([]);
  const [copied, setCopied] = useState("");
  const r = buildClientDocRequest({ country, job, client, office, due, received, extra: extra.split("\n") });
  const copy = (k: string, t: string) => navigator.clipboard?.writeText(t).then(() => setCopied(k)).catch(() => setCopied(""));
  const blocks: [string, string, string][] = [["first", ui.first, r.first], ["reminder", r.done ? ui.done : ui.again(r.missing.length), r.reminder]];
  return (
    <div className="space-y-4" lang={pack.lang}>
      <div className="flex flex-wrap gap-2" role="tablist">
        {pack.jobs.map((d) => <button key={d.id} type="button" role="tab" aria-selected={d.id === job} onClick={() => { setJob(d.id); setReceived([]); setCopied(""); }} className={`min-h-11 rounded-full border px-4 text-sm ${d.id === job ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{d.label}</button>)}
      </div>
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <label className="block text-sm">{ui.client}<input className={field} value={client} onChange={(e) => { setClient(e.target.value); setCopied(""); }} /></label>
        <label className="block text-sm">{ui.office}<input className={field} value={office} onChange={(e) => { setOffice(e.target.value); setCopied(""); }} /></label>
        <label className="block text-sm">{ui.due}<input type="date" className={field} value={due} onChange={(e) => { setDue(e.target.value); setCopied(""); }} /></label>
        <label className="block text-sm sm:col-span-3">{ui.extra}<textarea className={`${field} min-h-16 py-2`} value={extra} onChange={(e) => { setExtra(e.target.value); setCopied(""); }} /></label>
      </section>
      <fieldset className="rounded-xl border border-border bg-card p-4">
        <legend className="px-1 text-sm font-semibold">{ui.got}</legend>
        <div className="grid gap-1 sm:grid-cols-2">
          {r.docs.map((d) => <label key={d} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5 shrink-0" checked={received.includes(d)} onChange={(e) => { setReceived(e.target.checked ? [...received, d] : received.filter((x) => x !== d)); setCopied(""); }} />{d}</label>)}
        </div>
      </fieldset>
      {blocks.map(([k, title, text]) => (
        <section key={k} className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">{title}</h2>
            <button type="button" onClick={() => copy(k, text)} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">{copied === k ? ui.copied : ui.copy}</button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-3 text-sm leading-6">{text}</pre>
        </section>
      ))}
      <p className="text-sm text-muted-foreground">{ui.privacy}</p>
    </div>
  );
}
