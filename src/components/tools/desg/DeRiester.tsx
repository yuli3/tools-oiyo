import { useState } from "react";
import { DE_BASIS, DE_RIESTER, deBasisrente, deRiester } from "../../../lib/plan-gap-4-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const eur = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/\./g, "").replace(",", ".")));

export default function DeRiester() {
  const [ein, setEin] = useState("40000");
  const [eig, setEig] = useState("1125");
  const [k1, setK1] = useState("0");
  const [k2, setK2] = useState("1");
  const [bonus, setBonus] = useState(false);
  const [gs, setGs] = useState("30");
  const [jahr, setJahr] = useState<"2025" | "2026">("2025");
  const [rb, setRb] = useState("5000");
  const [grv, setGrv] = useState("7440");
  const [zus, setZus] = useState(false);
  let r: ReturnType<typeof deRiester> | null = null;
  let b: ReturnType<typeof deBasisrente> | null = null;
  try { r = deRiester({ vorjahresEinnahmen: num(ein), eigenbeitrag: num(eig), kinderVor2008: num(k1), kinderAb2008: num(k2), berufseinsteiger: bonus, grenzsteuersatzPct: num(gs) }); } catch { r = null; }
  try { b = deBasisrente({ jahr: jahr === "2025" ? 2025 : 2026, beitrag: num(rb), grvBeitraegeGesamt: num(grv), zusammen: zus, grenzsteuersatzPct: num(gs) }); } catch { b = null; }
  const inp = (label: string, v: string, set: (s: string) => void) => <label className="block text-sm">{label}<input inputMode="decimal" className={field} value={v} onChange={(e) => set(e.target.value)} /></label>;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Riester: Zulage und Steuervorteil</h2>
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        {inp("Rentenversicherungspflichtige Einnahmen im Vorjahr (€)", ein, setEin)}
        {inp("Ihr Eigenbeitrag im Jahr (€)", eig, setEig)}
        {inp("Kinder mit Kindergeld, geboren vor 2008", k1, setK1)}
        {inp("Kinder mit Kindergeld, geboren ab 2008", k2, setK2)}
        {inp("Ihr Grenzsteuersatz (%)", gs, setGs)}
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={bonus} onChange={(e) => setBonus(e.target.checked)} />Unter 25 und erstes Beitragsjahr (Bonus 200 €)</label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? <p>Bitte Beträge ab 0 eingeben.</p> : (
          <>
            <p className="text-xl font-bold">Förderung insgesamt: {eur(r.foerderungGesamt)}</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Mindesteigenbeitrag für die volle Zulage: {eur(r.mindesteigenbeitrag)} (4 % der Vorjahreseinnahmen, höchstens {eur(DE_RIESTER.hoechst)}, minus Zulagen, mindestens {eur(DE_RIESTER.sockel)})</li>
              <li>Zulage: {eur(r.zulage)} von {eur(r.zulageVoll)}{r.gekuerzt ? " — anteilig gekürzt, weil der Eigenbeitrag unter dem Mindesteigenbeitrag liegt" : ""}</li>
              <li>Sonderausgaben (Beitrag + Zulage, höchstens {eur(DE_RIESTER.hoechst)}): {eur(r.sonderausgaben)}</li>
              <li>Zusätzliche Steuererstattung nach Günstigerprüfung: {eur(r.zusaetzlicheErstattung)}</li>
              <li>Ihr Aufwand nach Erstattung: {eur(r.nettoAufwand)}</li>
            </ul>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </>
        )}
      </section>
      <h2 className="text-lg font-bold">Rürup (Basisrente): Höchstbetrag</h2>
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="block text-sm">Jahr<select className={field} value={jahr} onChange={(e) => setJahr(e.target.value as "2025" | "2026")}><option value="2025">2025</option><option value="2026">2026</option></select></label>
        {inp("Beitrag zur Basisrente (€)", rb, setRb)}
        {inp("Gesetzliche Rentenbeiträge Arbeitnehmer + Arbeitgeber (€)", grv, setGrv)}
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={zus} onChange={(e) => setZus(e.target.checked)} />Zusammenveranlagung</label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!b ? <p>Bitte Beträge ab 0 eingeben.</p> : !b.verified ? <p>{b.note} Bekannt für 2025: {eur(DE_BASIS[2025].single)} / {eur(DE_BASIS[2025].joint)}.</p> : (
          <ul className="space-y-1 text-sm">
            <li className="text-xl font-bold">Abziehbar: {eur(b.abziehbar)}</li>
            <li>Höchstbetrag {jahr}: {eur(b.hoechstbetrag)}; nach gesetzlichen Rentenbeiträgen bleiben {eur(b.spielraum)}</li>
            <li>Steuerwirkung grob: {eur(b.steuerwirkung)}</li>
            {b.ueberHoechstbetrag > 0 && <li>{eur(b.ueberHoechstbetrag)} liegen über dem Höchstbetrag und wirken sich nicht aus.</li>}
          </ul>
        )}
        <p className="mt-3 text-sm">Kostenlose Auskunft: Deutsche Rentenversicherung 0800 1000 4800. Zulagen beantragt Ihr Anbieter bei der ZfA.</p>
      </section>
    </div>
  );
}
