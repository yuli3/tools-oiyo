// 기한 막대 (2026-11-16). 오늘부터 각 기한까지 남은 날을 가로 막대로 보여 주고,
// "며칠 뒤에 움직이면?" 표시(delay)를 넘는 기한은 놓치는 것으로 칠해요. 길이는 1년에서 잘라요.
// 2026-11-21: 문구 6개 언어(VizLangProvider의 lang). 기본은 한국어라 기존 도구는 그대로예요.
import BarTrack from "./BarTrack";
import ChartFrame from "./ChartFrame";
import { useVizCtx, type VizLang } from "./i18n";

export interface DeadlineRow {
  id: string;
  label: string;
  due: string;
  daysLeft: number;
  cite: string;
  note?: string;
}

interface Props {
  title: string;
  caption?: string;
  rows: DeadlineRow[];
  /** 지금부터 움직이기까지 걸릴 날(가정) */
  delay?: number;
  cap?: number;
}

type DT = { head: [string, string, string, string]; over: (n: number) => string; today: string; dueIn: (n: number) => string; yearPlus: string; miss: string; later: (n: number) => string; start: string; ymax: string };
const DL: Record<VizLang, DT> = {
  ko: { head: ["기한", "마감일", "남은 날", "근거"], over: (n) => `${n}일 지남`, today: "오늘까지", dueIn: (n) => `D-${n}`, yearPlus: " (1년 넘음)", miss: " · 그때 움직이면 놓쳐요", later: (n) => `${n}일 뒤`, start: "오늘", ymax: "1년+" },
  en: { head: ["Deadline", "Due", "Days left", "Source"], over: (n) => `${n} days overdue`, today: "due today", dueIn: (n) => `${n} days left`, yearPlus: " (over a year)", miss: " · missed if you wait that long", later: (n) => `in ${n} days`, start: "Today", ymax: "1 year+" },
  ja: { head: ["期限", "締切日", "残り日数", "根拠"], over: (n) => `${n}日経過`, today: "今日まで", dueIn: (n) => `あと${n}日`, yearPlus: "（1年超）", miss: "・その時に動くと間に合いません", later: (n) => `${n}日後`, start: "今日", ymax: "1年+" },
  zh: { head: ["期限", "截止日", "剩余天数", "依据"], over: (n) => `已过${n}天`, today: "今天截止", dueIn: (n) => `还剩${n}天`, yearPlus: "（超过1年）", miss: " · 到那时再办就来不及", later: (n) => `${n}天后`, start: "今天", ymax: "1年+" },
  fr: { head: ["Échéance", "Date", "Jours restants", "Source"], over: (n) => `dépassée de ${n} j`, today: "aujourd'hui", dueIn: (n) => `J-${n}`, yearPlus: " (plus d'un an)", miss: " · manquée si vous attendez jusque-là", later: (n) => `dans ${n} j`, start: "Aujourd'hui", ymax: "1 an+" },
  es: { head: ["Plazo", "Vence", "Días restantes", "Fuente"], over: (n) => `vencido hace ${n} días`, today: "vence hoy", dueIn: (n) => `quedan ${n} días`, yearPlus: " (más de un año)", miss: " · se pierde si espera tanto", later: (n) => `en ${n} días`, start: "Hoy", ymax: "1 año+" },
};

export default function DeadlineChart({ title, caption, rows, delay = 0, cap = 365 }: Props) {
  const t = DL[useVizCtx().lang] ?? DL.ko;
  const dday = (n: number) => (n < 0 ? t.over(-n) : n === 0 ? t.today : t.dueIn(n));
  const scale = Math.max(30, Math.min(cap, Math.max(delay, ...rows.map((r) => r.daysLeft))));
  const pos = (n: number) => (Math.min(Math.max(n, 0), scale) / scale) * 100;
  const table = [[...t.head], ...rows.map((r) => [r.label, r.due, dday(r.daysLeft), r.cite])];
  return (
    <ChartFrame title={title} caption={caption} table={table}>
      <ul className="space-y-3">
        {rows.map((r) => {
          const missed = r.daysLeft < 0 || r.daysLeft < delay;
          const tone = r.daysLeft < 0 ? "destructive" : missed ? "destructive" : r.daysLeft <= 14 ? "warning" : "primary";
          return (
            <li key={r.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs">
                <span className="font-semibold text-foreground">{r.label}</span>
                <span className={missed ? "font-semibold text-destructive" : "text-muted-foreground"}>
                  {r.due} · {dday(r.daysLeft)}
                  {r.daysLeft > scale ? t.yearPlus : ""}
                  {missed && r.daysLeft >= 0 ? t.miss : ""}
                </span>
              </div>
              <BarTrack segments={[{ from: 0, to: r.daysLeft < 0 ? 100 : pos(r.daysLeft), tone }]} marker={delay > 0 ? pos(delay) : undefined} />
            </li>
          );
        })}
      </ul>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{t.start}</span>
        <span>{scale >= cap ? t.ymax : t.later(scale)}</span>
      </div>
    </ChartFrame>
  );
}
