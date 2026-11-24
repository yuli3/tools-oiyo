// Germany: Steuererklärung late surcharge (§ 152 AO) and commuter/home-office deductions 2026.
// Checked 2026-11-24: § 152 AO on gesetze-im-internet.de; 2026 Entfernungspauschale, Homeoffice-Pauschale and
// Arbeitnehmer-Pauschbetrag on ADAC (14.07.2026) and Handwerksblatt (07.08.2026); deadline 31 July on test.de / finanztip.
// Not computed (not verified): deadline with a Steuerberater, look-back years for a voluntary return.
import type { GItem } from "./world-de-sg-pack-2026.ts";

export const DE_RETURN_AS_OF = "2026-11-24";
const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/** § 152 Abs. 5, 10 AO: 0,25 % of (tax − prepayments − withheld tax) per started month, min 25 € per month, max 25.000 €. */
export function deLateSurcharge(x: { tax: number; prepaid: number; monthsLate: number; extended?: boolean }) {
  const months = Math.ceil(pos(x.monthsLate));
  const base = pos(x.tax) - pos(x.prepaid);
  const items: GItem[] = [];
  if (months === 0) return { surcharge: 0, months, base, mandatory: false, items: [{ tone: "good", text: "Pünktlich abgegeben: kein Verspätungszuschlag.", cite: "§ 152 AO" }] as GItem[] };
  if (x.extended) items.push({ tone: "good", text: "Mit verlängerter Frist (§ 109 AO) gilt die Pflicht zum Zuschlag nicht; das Finanzamt kann ihn nur nach Ermessen festsetzen.", cite: "§ 152 Abs. 3 Nr. 1 AO" });
  if (base <= 0) {
    items.push({ tone: "good", text: "Die festgesetzte Steuer übersteigt Vorauszahlungen und Steuerabzug nicht (z. B. Erstattung): ein Pflicht-Zuschlag entfällt.", cite: "§ 152 Abs. 3 Nr. 2, 3 AO" });
    items.push({ tone: "info", text: "Nach Ermessen könnte das Finanzamt trotzdem einen Zuschlag festsetzen; bei Erstattungen ist das selten. Hier wird 0 € gezeigt.", cite: "§ 152 Abs. 1 AO" });
    return { surcharge: 0, months, base: 0, mandatory: false, items };
  }
  const raw = Math.max(base * 0.0025 * months, 25 * months);
  const surcharge = Math.floor(Math.min(25_000, raw));
  items.push({ tone: "warn", text: `${months} angefangene Monate × 0,25 % von ${Math.round(base).toLocaleString("de-DE")} € (mindestens 25 € je Monat).`, cite: "§ 152 Abs. 5 AO" });
  if (raw > 25_000) items.push({ tone: "info", text: "Gedeckelt auf 25.000 €.", cite: "§ 152 Abs. 10 AO" });
  items.push({ tone: "info", text: "Pflicht ist der Zuschlag, wenn die Erklärung nicht binnen 14 Monaten nach Ablauf des Kalenderjahrs abgegeben wird; vorher kann er festgesetzt werden, nicht bei entschuldbarer Verspätung.", cite: "§ 152 Abs. 1, 2 AO" });
  return { surcharge, months, base, mandatory: !x.extended, items };
}

export const DE_COMMUTE_2026 = { perKm: 0.38, nonCarCap: 4_500, homeOfficePerDay: 6, homeOfficeMaxDays: 210, employeeLumpSum: 1_230 } as const;

/** Werbungskosten 2026 from commuting and home office, compared with the Arbeitnehmer-Pauschbetrag. */
export function deCommuteDeduction(x: { km: number; officeDays: number; homeDays: number; car: boolean; otherCosts?: number }) {
  const C = DE_COMMUTE_2026;
  const km = Math.floor(pos(x.km));
  const office = Math.floor(pos(x.officeDays));
  const home = Math.min(C.homeOfficeMaxDays, Math.floor(pos(x.homeDays)));
  const rawCommute = km * C.perKm * office;
  const commute = x.car ? rawCommute : Math.min(C.nonCarCap, rawCommute);
  const homeOffice = home * C.homeOfficePerDay;
  const other = pos(x.otherCosts ?? 0);
  const total = Math.round((commute + homeOffice + other) * 100) / 100;
  const extra = Math.max(0, Math.round((total - C.employeeLumpSum) * 100) / 100);
  const items: GItem[] = [
    { tone: "info", text: `Entfernungspauschale: ${km} km × 0,38 € × ${office} Tage = ${commute.toLocaleString("de-DE", { maximumFractionDigits: 2 })} € (nur einfache Strecke, volle Kilometer).`, cite: "Entfernungspauschale ab 2026" },
    { tone: "info", text: `Homeoffice-Pauschale: ${home} Tage × 6 € = ${homeOffice.toLocaleString("de-DE")} € (höchstens 210 Tage, 1.260 €; nicht am selben Tag wie die Pendlerpauschale).`, cite: "Tagespauschale" },
  ];
  if (!x.car && rawCommute > C.nonCarCap) items.push({ tone: "warn", text: "Ohne eigenes Auto ist die Entfernungspauschale auf 4.500 € im Jahr begrenzt.", cite: "Höchstbetrag" });
  if (office + home > 366) items.push({ tone: "warn", text: "Büro- und Homeoffice-Tage zusammen sind mehr Tage, als das Jahr hat.", cite: "—" });
  items.push(extra > 0
    ? { tone: "good", text: `Das sind ${extra.toLocaleString("de-DE", { maximumFractionDigits: 2 })} € mehr als der Arbeitnehmer-Pauschbetrag von 1.230 €: die Angabe in der Steuererklärung lohnt sich.`, cite: "Arbeitnehmer-Pauschbetrag" }
    : { tone: "info", text: "Unter 1.230 € zieht das Finanzamt ohnehin den Arbeitnehmer-Pauschbetrag ab; Einzelnachweise bringen dann nichts zusätzlich.", cite: "Arbeitnehmer-Pauschbetrag" });
  return { commute, homeOffice, other, total, extra, items };
}
