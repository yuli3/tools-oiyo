// 2027 leave-bridge planner for JP · US · UK · FR · DE (2026-11-22, think tank round 2) + CN · ES (round 3).
// Engine: lib/leave-bridge.ts with opts.holidays; holiday tables: lib/world-holidays-2027.ts
import { useMemo, useState } from "react";
import { bestByLeave, isOff, topEfficient, type BridgeWindow } from "../../lib/leave-bridge";
import { DE_STATES, ES_REGIONS, OPTIONAL_2027, holidayName, holidays2027, workdays2027, type Country, type DeState, type EsRegion } from "../../lib/world-holidays-2027";
import { track } from "./viz/track";
import CompareBars from "./viz/CompareBars";

const YEAR = 2027;
const DE_NAMES: Record<DeState, string> = {
  BW: "Baden-Württemberg", BY: "Bayern", BE: "Berlin", BB: "Brandenburg", HB: "Bremen", HH: "Hamburg", HE: "Hessen", MV: "Mecklenburg-Vorpommern",
  NI: "Niedersachsen", NW: "Nordrhein-Westfalen", RP: "Rheinland-Pfalz", SL: "Saarland", SN: "Sachsen", ST: "Sachsen-Anhalt", SH: "Schleswig-Holstein", TH: "Thüringen",
};

const ES_NAMES: Record<EsRegion, string> = {
  AN: "Andalucía", AR: "Aragón", AS: "Asturias", IB: "Illes Balears", CN: "Canarias", CB: "Cantabria", CM: "Castilla-La Mancha", CL: "Castilla y León",
  CT: "Cataluña", EX: "Extremadura", GA: "Galicia", MD: "Comunidad de Madrid", MC: "Región de Murcia", NC: "Navarra", PV: "País Vasco", RI: "La Rioja",
  VC: "Comunitat Valenciana", CE: "Ceuta", ML: "Melilla",
};

interface Copy {
  wd: string[]; month: (m: number) => string; leaveLabel: string; unit: (n: number) => string;
  summary: (leave: number, dates: string, range: string, days: number) => string; none: string;
  listTitle: (n: number) => string; row: (leave: number, days: number) => string; leaveDates: string;
  stripTitle: string; legend: [string, string, string, string]; workday?: string; bestTitle: string; bestRow: (n: number) => string;
  state?: string; stateAll?: string; options: Record<string, string>; satWork: string; extra: string; add: string;
}

const C: Record<Country, Copy> = {
  jp: {
    wd: ["日", "月", "火", "水", "木", "金", "土"], month: (m) => `${m}月`, leaveLabel: "使える有給休暇", unit: (n) => `${n}日`,
    summary: (l, d, r, n) => `有給を${l}日（${d}）使うと、${r}の${n}連休になります。`, none: "条件に合う連休がありません。",
    listTitle: (n) => `有給${n}日以内のおすすめ（効率順に選んで日付順）`, row: (l, n) => `有給${l}日 → ${n}連休`, leaveDates: "有給",
    stripTitle: "2027年カレンダー", legend: ["祝日・会社休み", "土日", "有給", "選んだ連休"], bestTitle: "有給を何日使うと最長何連休？", bestRow: (n) => `有給${n}日`,
    options: { nenmatsu: "年末年始休み（12/29〜1/3）がある", obon: "お盆休み（8/13〜8/16）がある" }, satWork: "土曜日も出勤", extra: "会社の休み（創立記念日など）を追加", add: "追加",
  },
  us: {
    wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], month: (m) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1], leaveLabel: "PTO days you can use", unit: (n) => `${n} day${n > 1 ? "s" : ""}`,
    summary: (l, d, r, n) => `Take ${l} PTO day${l > 1 ? "s" : ""} (${d}) and you are off ${r}: ${n} days in a row.`, none: "No break fits these settings.",
    listTitle: (n) => `Best breaks with up to ${n} PTO day${n > 1 ? "s" : ""} (most efficient, in date order)`, row: (l, n) => `${l} PTO → ${n} days off`, leaveDates: "PTO",
    stripTitle: "2027 at a glance", legend: ["Holiday", "Weekend", "PTO", "Chosen break"], bestTitle: "Longest break for each number of PTO days", bestRow: (n) => `${n} PTO`,
    options: { "black-friday": "I get the day after Thanksgiving off" }, satWork: "I work Saturdays", extra: "Add a company day off", add: "Add",
  },
  uk: {
    wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], month: (m) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1], leaveLabel: "Annual leave days you can use", unit: (n) => `${n} day${n > 1 ? "s" : ""}`,
    summary: (l, d, r, n) => `Book ${l} day${l > 1 ? "s" : ""} of leave (${d}) and you are off ${r}: ${n} days in a row.`, none: "No break fits these settings.",
    listTitle: (n) => `Best breaks with up to ${n} day${n > 1 ? "s" : ""} of leave (most efficient, in date order)`, row: (l, n) => `${l} leave → ${n} days off`, leaveDates: "Leave",
    stripTitle: "2027 at a glance", legend: ["Bank holiday", "Weekend", "Leave", "Chosen break"], bestTitle: "Longest break for each number of leave days", bestRow: (n) => `${n} leave`,
    options: {}, satWork: "I work Saturdays", extra: "Add a company closure day", add: "Add",
  },
  fr: {
    wd: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"], month: (m) => ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"][m - 1], leaveLabel: "Jours de congé (CP ou RTT) disponibles", unit: (n) => `${n} j`,
    summary: (l, d, r, n) => `En posant ${l} jour${l > 1 ? "s" : ""} (${d}), vous êtes en congé ${r} : ${n} jours d’affilée.`, none: "Aucun pont avec ces réglages.",
    listTitle: (n) => `Meilleurs ponts avec ${n} jour${n > 1 ? "s" : ""} maximum (les plus rentables, par date)`, row: (l, n) => `${l} j posé${l > 1 ? "s" : ""} → ${n} jours off`, leaveDates: "À poser",
    stripTitle: "2027 en un coup d’œil", legend: ["Férié", "Week-end", "Congé posé", "Pont choisi"], bestTitle: "Le plus long congé selon le nombre de jours posés", bestRow: (n) => `${n} j posé${n > 1 ? "s" : ""}`,
    options: { solidarite: "Je travaille le lundi de Pentecôte (journée de solidarité)", alsace: "Alsace-Moselle (Vendredi saint et 26 décembre fériés)" }, satWork: "Je travaille le samedi", extra: "Ajouter un jour de fermeture de l’entreprise", add: "Ajouter",
  },
  de: {
    wd: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], month: (m) => ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"][m - 1], leaveLabel: "Urlaubstage, die Sie einsetzen können", unit: (n) => `${n} Tag${n > 1 ? "e" : ""}`,
    summary: (l, d, r, n) => `Mit ${l} Urlaubstag${l > 1 ? "en" : ""} (${d}) haben Sie ${r} frei: ${n} Tage am Stück.`, none: "Keine Brücke mit diesen Einstellungen.",
    listTitle: (n) => `Beste Brückentage mit höchstens ${n} Urlaubstag${n > 1 ? "en" : ""} (effizienteste, nach Datum)`, row: (l, n) => `${l} Urlaub → ${n} Tage frei`, leaveDates: "Urlaub",
    stripTitle: "2027 auf einen Blick", legend: ["Feiertag", "Wochenende", "Urlaub", "Gewählte Brücke"], bestTitle: "Längste freie Zeit je Anzahl Urlaubstage", bestRow: (n) => `${n} Urlaub`,
    state: "Bundesland", stateAll: "Nur bundesweite Feiertage",
    options: { heiligabend: "Heiligabend und Silvester sind bei uns frei" }, satWork: "Ich arbeite samstags", extra: "Betriebsfreien Tag hinzufügen", add: "Hinzufügen",
  },
  cn: {
    wd: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"], month: (m) => `${m}月`, leaveLabel: "可用年假天数", unit: (n) => `${n}天`,
    summary: (l, d, r, n) => `请${l}天年假（${d}），${r}连休${n}天。`, none: "没有符合条件的拼假方案。",
    listTitle: (n) => `年假${n}天以内的拼假方案（按性价比挑选，按日期排列）`, row: (l, n) => `请${l}天 → 连休${n}天`, leaveDates: "请假",
    stripTitle: "2027年全年一览", legend: ["法定假日", "周末", "年假", "选中的连休"], workday: "调休上班", bestTitle: "请几天年假最长能休几天？", bestRow: (n) => `请${n}天`,
    options: {}, satWork: "周六也上班（大小周）", extra: "添加公司额外放假日", add: "添加",
  },
  tw: {
    wd: ["週日", "週一", "週二", "週三", "週四", "週五", "週六"], month: (m) => `${m}月`, leaveLabel: "可用特休天數", unit: (n) => `${n}天`,
    summary: (l, d, r, n) => `請${l}天特休（${d}），${r}連休${n}天。`, none: "沒有符合條件的請假方案。",
    listTitle: (n) => `特休${n}天以內的請假攻略（依效率挑選、依日期排列）`, row: (l, n) => `請${l}天 → 連休${n}天`, leaveDates: "請假",
    stripTitle: "2027年全年一覽", legend: ["國定假日・補假", "週末", "特休", "選中的連假"], bestTitle: "請幾天特休最長能放幾天？", bestRow: (n) => `請${n}天`,
    options: {}, satWork: "週六也要上班", extra: "加入公司額外放假日", add: "加入",
  },
  es: {
    wd: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"], month: (m) => ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][m - 1], leaveLabel: "Días de vacaciones que puedes usar", unit: (n) => `${n} día${n > 1 ? "s" : ""}`,
    summary: (l, d, r, n) => `Pidiendo ${l} día${l > 1 ? "s" : ""} (${d}) libras ${r}: ${n} días seguidos.`, none: "No hay puentes con estos ajustes.",
    listTitle: (n) => `Mejores puentes con ${n} día${n > 1 ? "s" : ""} como máximo (los más rentables, por fecha)`, row: (l, n) => `${l} día${l > 1 ? "s" : ""} → ${n} libres`, leaveDates: "Pedir",
    stripTitle: "2027 de un vistazo", legend: ["Festivo", "Fin de semana", "Vacaciones", "Puente elegido"], bestTitle: "El descanso más largo según los días que pidas", bestRow: (n) => `${n} día${n > 1 ? "s" : ""}`,
    state: "Comunidad autónoma", stateAll: "Solo festivos comunes a toda España",
    options: { nochebuena: "Libro el 24 y el 31 de diciembre (por convenio)" }, satWork: "Trabajo los sábados", extra: "Añadir un festivo local o de empresa", add: "Añadir",
  },
};

export default function WorldLeaveBridge2027({ country }: { country: Country }) {
  const t = C[country];
  const [budget, setBudget] = useState(3);
  const [state, setState] = useState<string>(country === "de" ? "BY" : country === "es" ? "MD" : "");
  const work = useMemo(() => workdays2027(country), [country]);
  const regions: [string, string][] = country === "de" ? DE_STATES.map((s) => [s, DE_NAMES[s]]) : country === "es" ? ES_REGIONS.map((r) => [r, ES_NAMES[r]]) : [];
  const [options, setOptions] = useState<string[]>(OPTIONAL_2027[country].filter((o) => o.defaultOn).map((o) => o.id));
  const [saturdayWork, setSaturdayWork] = useState(false);
  const [extra, setExtra] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [picked, setPicked] = useState<string | null>(null);

  const md = (d: string) => {
    const x = new Date(`${d}T00:00:00Z`);
    return country === "jp" ? `${x.getUTCMonth() + 1}/${x.getUTCDate()}(${t.wd[x.getUTCDay()]})`
      : country === "cn" || country === "tw" ? `${x.getUTCMonth() + 1}月${x.getUTCDate()}日(${t.wd[x.getUTCDay()]})`
      : country === "us" ? `${t.wd[x.getUTCDay()]} ${t.month(x.getUTCMonth() + 1)} ${x.getUTCDate()}`
      : `${t.wd[x.getUTCDay()]} ${x.getUTCDate()} ${t.month(x.getUTCMonth() + 1)}`;
  };
  const range = (w: BridgeWindow) => `${md(w.start)} – ${md(w.end)}`;

  const hol = useMemo(() => {
    const s = holidays2027(country, { state: country === "de" ? (state || undefined) as DeState | undefined : undefined, region: country === "es" ? (state || undefined) as EsRegion | undefined : undefined, options });
    for (const d of extra) s.add(d);
    return s;
  }, [country, state, options.join(), extra.join()]);
  const opts = useMemo(() => ({ holidays: hol, saturdayWork, workdays: work, fromDate: "2027-01-01", requireHoliday: true }), [hol, saturdayWork, work]);
  const best = useMemo(() => bestByLeave(YEAR, 10, opts), [opts]);
  const combos = useMemo(() => topEfficient(YEAR, budget, 12, opts), [budget, opts]);
  const top = best[budget - 1]?.best ?? null;
  const pick = combos.find((w) => w.start === picked) ?? top;
  const touch = () => track("tool_input", { tool_id: `leave-bridge-2027-${country}`, mode: "expert" }, true);

  const months = Array.from({ length: 12 }, (_, m) => {
    const n = new Date(Date.UTC(YEAR, m + 1, 0)).getUTCDate();
    return Array.from({ length: n }, (_, i) => `${YEAR}-${String(m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`);
  });
  const leaveSet = new Set(pick?.leave ?? []);

  return (
    <div className="space-y-5" data-tool={`leave-bridge-2027-${country}`}>
      <label className="block">
        <span className="text-sm font-medium text-muted-foreground">{t.leaveLabel}</span>
        <div className="mt-1 flex items-center gap-3">
          <input type="range" min={1} max={10} value={budget} onChange={(e) => { setBudget(Number(e.target.value)); setPicked(null); touch(); }} className="min-h-11 flex-1 accent-primary" aria-label={t.leaveLabel} />
          <span className="w-20 text-right font-mono text-lg font-bold text-foreground">{t.unit(budget)}</span>
        </div>
      </label>

      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        {regions.length > 0 && (
          <label className="block text-sm font-medium text-muted-foreground">{t.state}
            <select className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground" value={state} onChange={(e) => { setState(e.target.value); touch(); }}>
              <option value="">{t.stateAll}</option>
              {regions.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </label>
        )}
        {OPTIONAL_2027[country].map((o) => (
          <label key={o.id} className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <input type="checkbox" className="h-5 w-5 accent-primary" checked={options.includes(o.id)}
              onChange={(e) => { setOptions((xs) => e.target.checked ? [...xs, o.id] : xs.filter((x) => x !== o.id)); touch(); }} />
            {t.options[o.id]}
          </label>
        ))}
        <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={saturdayWork} onChange={(e) => { setSaturdayWork(e.target.checked); touch(); }} />
          {t.satWork}
        </label>
        <div>
          <span className="text-sm font-medium text-muted-foreground">{t.extra}</span>
          <div className="mt-1 flex gap-2">
            <input type="date" min="2027-01-01" max="2027-12-31" value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-11 flex-1 rounded-md border border-border bg-background px-3 text-base text-foreground" />
            <button type="button" className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => { if (draft && !extra.includes(draft)) setExtra([...extra, draft].sort()); setDraft(""); touch(); }}>{t.add}</button>
          </div>
          {extra.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {extra.map((d) => <li key={d}><button type="button" className="min-h-11 rounded-full border border-border px-3 text-sm text-foreground hover:bg-muted" onClick={() => setExtra(extra.filter((x) => x !== d))}>{md(d)} ✕</button></li>)}
            </ul>
          )}
        </div>
      </div>

      <section aria-live="polite" className="rounded-xl border border-primary bg-primary/10 p-4">
        <p className="text-sm leading-relaxed text-foreground">{top ? t.summary(top.leave.length, top.leave.map(md).join(", "), range(top), top.days) : t.none}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">{t.listTitle(budget)}</h2>
        <ul className="space-y-2">
          {combos.map((w) => {
            const named = (() => {
              const out: string[] = [];
              for (let x = Date.parse(`${w.start}T00:00:00Z`); x <= Date.parse(`${w.end}T00:00:00Z`); x += 86_400_000) {
                const n = holidayName(country, new Date(x).toISOString().slice(0, 10), country === "es" ? (state || undefined) as EsRegion | undefined : undefined);
                if (n && !out.includes(n)) out.push(n);
              }
              return out.join(" · ");
            })();
            return (
              <li key={w.start}>
                <button type="button" aria-pressed={pick?.start === w.start} onClick={() => setPicked(w.start)}
                  className={"flex min-h-11 w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-left " + (pick?.start === w.start ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted")}>
                  <span className="text-sm font-semibold text-foreground">{range(w)}</span>
                  <span className="text-sm text-muted-foreground">{t.row(w.leave.length, w.days)}</span>
                  <span className="w-full text-xs text-muted-foreground">{t.leaveDates}: {w.leave.map(md).join(", ")}{named && ` · ${named}`}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <figure className="rounded-xl border border-border bg-card p-3">
        <figcaption className="mb-2 text-sm font-semibold text-foreground">{t.stripTitle}</figcaption>
        <div className="space-y-1">
          {months.map((days, m) => (
            <div key={m} className="flex items-center gap-1">
              <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">{t.month(m + 1)}</span>
              <div className="grid flex-1 grid-cols-31 gap-px">
                {days.map((d) => {
                  const inPick = !!pick && d >= pick.start && d <= pick.end;
                  const tone = leaveSet.has(d) ? "bg-primary" : inPick ? "bg-primary/50" : hol.has(d) ? "bg-destructive/60" : work.has(d) ? "bg-muted ring-1 ring-destructive" : isOff(d, hol, saturdayWork) ? "bg-muted-foreground/30" : "bg-muted";
                  return <span key={d} title={md(d)} className={`h-3 rounded-sm ${tone}`} />;
                })}
              </div>
            </div>
          ))}
        </div>
        <ul className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {(["bg-destructive/60", "bg-muted-foreground/30", "bg-primary", "bg-primary/50"] as const).map((c, i) => (
            <li key={c} className="flex items-center gap-1"><span className={`h-3 w-3 rounded-sm ${c}`} />{t.legend[i]}</li>
          ))}
          {t.workday && <li className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-muted ring-1 ring-destructive" />{t.workday}</li>}
        </ul>
      </figure>

      <CompareBars
        title={t.bestTitle}
        caption={t.stripTitle}
        format={(n) => t.unit(n)}
        items={best.map((b) => ({ label: `${t.bestRow(b.leave)}${b.best ? ` · ${md(b.best.start)}` : ""}`, value: b.best?.days ?? 0, current: b.leave === budget }))}
      />
    </div>
  );
}
