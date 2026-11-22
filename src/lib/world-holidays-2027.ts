/**
 * 2027 public holidays for the world leave-bridge pages (2026-11-22, think tank round 2).
 * Engine: lib/leave-bridge.ts (opts.holidays). Neighbouring Dec 2026 / early Jan 2028 days are
 * included so year-end windows join up.
 *
 * Sources (checked 2026-11-22):
 * - JP: 内閣府「国民の祝日について」令和9年表 (17 days incl. 3/22 休日) https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html
 * - UK (England & Wales): Banking and Financial Dealings Act 1971 Sch.1 + Royal Proclamation 2026-07-08
 *   (1 Jan, 3 May, 28 Dec 2027). Easter 2027 = 28 March.
 * - US: 5 U.S.C. 6103 federal holidays; Saturday holidays observed Friday, Sunday holidays Monday
 *   (Juneteenth 6/19 Sat → 6/18, July 4 Sun → 7/5, Christmas Sat → 12/24, New Year 2028 Sat → 2027-12-31).
 * - FR: Code du travail L3133-1 jours fériés; Easter Monday 3/29, Ascension 5/6, Pentecost Monday 5/17.
 * - DE: Feiertagsgesetze der Länder; bundesweit 9 Tage, Landes-Feiertage per Bundesland.
 */
export type Country = "jp" | "us" | "uk" | "fr" | "de";

export const DE_STATES = ["BW", "BY", "BE", "BB", "HB", "HH", "HE", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"] as const;
export type DeState = (typeof DE_STATES)[number];

type Day = { date: string; name: string };

export const HOLIDAYS_2027: Record<Country, Day[]> = {
  jp: [
    { date: "2027-01-01", name: "元日" }, { date: "2027-01-11", name: "成人の日" }, { date: "2027-02-11", name: "建国記念の日" },
    { date: "2027-02-23", name: "天皇誕生日" }, { date: "2027-03-21", name: "春分の日" }, { date: "2027-03-22", name: "振替休日" },
    { date: "2027-04-29", name: "昭和の日" }, { date: "2027-05-03", name: "憲法記念日" }, { date: "2027-05-04", name: "みどりの日" },
    { date: "2027-05-05", name: "こどもの日" }, { date: "2027-07-19", name: "海の日" }, { date: "2027-08-11", name: "山の日" },
    { date: "2027-09-20", name: "敬老の日" }, { date: "2027-09-23", name: "秋分の日" }, { date: "2027-10-11", name: "スポーツの日" },
    { date: "2027-11-03", name: "文化の日" }, { date: "2027-11-23", name: "勤労感謝の日" },
  ],
  us: [
    { date: "2026-12-25", name: "Christmas Day" }, { date: "2027-01-01", name: "New Year's Day" },
    { date: "2027-01-18", name: "Martin Luther King Jr. Day" }, { date: "2027-02-15", name: "Washington's Birthday" },
    { date: "2027-05-31", name: "Memorial Day" }, { date: "2027-06-18", name: "Juneteenth (observed)" },
    { date: "2027-07-05", name: "Independence Day (observed)" }, { date: "2027-09-06", name: "Labor Day" },
    { date: "2027-10-11", name: "Columbus Day" }, { date: "2027-11-11", name: "Veterans Day" },
    { date: "2027-11-25", name: "Thanksgiving Day" }, { date: "2027-12-24", name: "Christmas Day (observed)" },
    { date: "2027-12-31", name: "New Year's Day 2028 (observed)" },
  ],
  uk: [
    { date: "2026-12-25", name: "Christmas Day" }, { date: "2026-12-28", name: "Boxing Day (substitute)" },
    { date: "2027-01-01", name: "New Year's Day" }, { date: "2027-03-26", name: "Good Friday" }, { date: "2027-03-29", name: "Easter Monday" },
    { date: "2027-05-03", name: "Early May bank holiday" }, { date: "2027-05-31", name: "Spring bank holiday" },
    { date: "2027-08-30", name: "Summer bank holiday" }, { date: "2027-12-27", name: "Christmas Day (substitute)" },
    { date: "2027-12-28", name: "Boxing Day (substitute)" }, { date: "2028-01-03", name: "New Year's Day (substitute)" },
  ],
  fr: [
    { date: "2026-12-25", name: "Noël" }, { date: "2027-01-01", name: "Jour de l’an" }, { date: "2027-03-29", name: "Lundi de Pâques" },
    { date: "2027-05-01", name: "Fête du Travail" }, { date: "2027-05-06", name: "Ascension" }, { date: "2027-05-08", name: "Victoire 1945" },
    { date: "2027-05-17", name: "Lundi de Pentecôte" }, { date: "2027-07-14", name: "Fête nationale" }, { date: "2027-08-15", name: "Assomption" },
    { date: "2027-11-01", name: "Toussaint" }, { date: "2027-11-11", name: "Armistice" }, { date: "2027-12-25", name: "Noël" },
  ],
  de: [
    { date: "2026-12-25", name: "1. Weihnachtstag" }, { date: "2026-12-26", name: "2. Weihnachtstag" },
    { date: "2027-01-01", name: "Neujahr" }, { date: "2027-03-26", name: "Karfreitag" }, { date: "2027-03-29", name: "Ostermontag" },
    { date: "2027-05-01", name: "Tag der Arbeit" }, { date: "2027-05-06", name: "Christi Himmelfahrt" }, { date: "2027-05-17", name: "Pfingstmontag" },
    { date: "2027-10-03", name: "Tag der Deutschen Einheit" }, { date: "2027-12-25", name: "1. Weihnachtstag" }, { date: "2027-12-26", name: "2. Weihnachtstag" },
  ],
};

/** Landes-Feiertage 2027, nur die auf Werktage fallen oder Brücken bilden (Sonntage wie 15.8. und 31.10. bewirken nichts). */
export const DE_STATE_2027: { date: string; name: string; states: DeState[] }[] = [
  { date: "2027-01-06", name: "Heilige Drei Könige", states: ["BW", "BY", "ST"] },
  { date: "2027-03-08", name: "Internationaler Frauentag", states: ["BE", "MV"] },
  { date: "2027-05-27", name: "Fronleichnam", states: ["BW", "BY", "HE", "NW", "RP", "SL"] },
  { date: "2027-09-20", name: "Weltkindertag", states: ["TH"] },
  { date: "2027-11-01", name: "Allerheiligen", states: ["BW", "BY", "NW", "RP", "SL"] },
  { date: "2027-11-17", name: "Buß- und Bettag", states: ["SN"] },
];

/** Optional company-closure blocks people commonly get, by country. Off by default except JP 年末年始. */
export const OPTIONAL_2027: Record<Country, { id: string; dates: string[]; defaultOn: boolean }[]> = {
  jp: [
    { id: "nenmatsu", dates: ["2026-12-29", "2026-12-30", "2026-12-31", "2027-01-02", "2027-01-03", "2027-12-29", "2027-12-30", "2027-12-31", "2028-01-01", "2028-01-02", "2028-01-03"], defaultOn: true },
    { id: "obon", dates: ["2027-08-13", "2027-08-16"], defaultOn: false },
  ],
  us: [{ id: "black-friday", dates: ["2027-11-26"], defaultOn: false }],
  uk: [],
  fr: [{ id: "solidarite", dates: [], defaultOn: false }, { id: "alsace", dates: ["2027-03-26", "2027-12-26"], defaultOn: false }],
  de: [{ id: "heiligabend", dates: ["2027-12-24", "2027-12-31"], defaultOn: false }],
};

export function holidays2027(country: Country, opts: { state?: DeState; options?: string[] } = {}): Set<string> {
  const set = new Set(HOLIDAYS_2027[country].map((d) => d.date));
  if (country === "de" && opts.state) for (const h of DE_STATE_2027) if (h.states.includes(opts.state)) set.add(h.date);
  for (const o of OPTIONAL_2027[country]) {
    if (!(opts.options ?? OPTIONAL_2027[country].filter((x) => x.defaultOn).map((x) => x.id)).includes(o.id)) continue;
    for (const d of o.dates) set.add(d);
  }
  // Journée de solidarité: many employers make Pentecost Monday a working day.
  if (country === "fr" && opts.options?.includes("solidarite")) set.delete("2027-05-17");
  return set;
}

export function holidayName(country: Country, date: string): string | null {
  return HOLIDAYS_2027[country].find((d) => d.date === date)?.name ?? (country === "de" ? DE_STATE_2027.find((d) => d.date === date)?.name ?? null : null);
}
