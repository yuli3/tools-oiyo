// Filing calendars per country (2026-11-22, country UI/UX pass): easy/expert mode and a deadline bar chart over the calendar's own events.
// Easy shows the next deadline in one sentence and the next 5 bars; expert shows every upcoming bar and the full list with sources.
import type { ReactNode } from "react";
import DeadlineChart from "./DeadlineChart";
import type { AdvisoryMode } from "./format";
import { VizLangProvider, type VizLang, type VizText } from "./i18n";
import ModeToggle from "./ModeToggle";
import { useAdvisoryMode } from "./useAdvisoryMode";

export type CalEvent = { id: string; label: string; date?: string | null; daysLeft?: number | null; cite?: string };
type CT = { title: string; caption: string; next: (label: string, date: string, n: number) => string; none: string };
const CAL: Record<VizLang | "zhTW", CT> = {
  ko: { title: "남은 기한", caption: "오늘부터 각 기한까지 남은 날이에요.", next: (l, d, n) => `다음 기한은 ${d} ${l}이에요. ${n}일 남았어요.`, none: "올해 남은 기한이 없어요." },
  en: { title: "Deadlines ahead", caption: "Days from today to each deadline.", next: (l, d, n) => `Next: ${l} on ${d}, in ${n} days.`, none: "No deadlines left in this year." },
  ja: { title: "これからの期限", caption: "今日から各期限までの残り日数です。", next: (l, d, n) => `次の期限は${d}の「${l}」、あと${n}日です。`, none: "この年に残っている期限はありません。" },
  zh: { title: "接下来的期限", caption: "从今天到每个期限还剩几天。", next: (l, d, n) => `下一个期限：${d}「${l}」，还剩${n}天。`, none: "这一年已没有剩余期限。" },
  zhTW: { title: "接下來的期限", caption: "從今天到每個期限還剩幾天。", next: (l, d, n) => `下一個期限：${d}「${l}」，還剩${n}天。`, none: "這一年已沒有剩下的期限。" },
  fr: { title: "Prochaines échéances", caption: "Jours restants jusqu'à chaque échéance.", next: (l, d, n) => `Prochaine échéance : ${l}, le ${d}, dans ${n} jours.`, none: "Plus d'échéance cette année." },
  es: { title: "Próximos plazos", caption: "Días que quedan hasta cada plazo.", next: (l, d, n) => `Próximo plazo: ${l}, el ${d}, dentro de ${n} días.`, none: "No quedan plazos este año." },
};

export const upcoming = <E extends CalEvent>(events: E[]) => events.filter((e) => e.date && e.daysLeft != null && e.daysLeft >= 0).sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
/** Easy mode lists only what is still ahead; expert lists everything in the calendar's own order. */
export const forMode = <E extends CalEvent>(events: E[], mode: AdvisoryMode) => (mode === "easy" ? upcoming(events).slice(0, 5) : events);

export default function CalendarShell<E extends CalEvent>({ toolId, lang, tw, text, events, children }: { toolId: string; lang: VizLang; tw?: boolean; text?: Partial<VizText>; events: E[]; children: (mode: AdvisoryMode) => ReactNode }) {
  const [mode, setMode] = useAdvisoryMode(toolId);
  const c = CAL[tw ? "zhTW" : lang] ?? CAL.en;
  const up = upcoming(events);
  const rows = (mode === "easy" ? up.slice(0, 5) : up).map((e) => ({ id: e.id, label: e.label, due: e.date as string, daysLeft: e.daysLeft as number, cite: e.cite ?? "" }));
  const first = up[0];
  const dlText = tw ? { head: ["期限", "截止日", "剩餘天數", "依據"] as [string, string, string, string], over: (n: number) => `已過${n}天`, dueIn: (n: number) => `還剩${n}天`, yearPlus: "（超過1年）", later: (n: number) => `${n}天後` } : undefined;
  return (
    <VizLangProvider value={{ lang, currency: "", text }}>
      <div className="space-y-5">
        <ModeToggle mode={mode} onChange={setMode} />
        <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm font-medium" aria-live="polite">{first ? c.next(first.label, first.date as string, first.daysLeft as number) : c.none}</p>
        {rows.length > 0 && <DeadlineChart title={c.title} caption={c.caption} rows={rows} text={dlText} />}
        {children(mode)}
      </div>
    </VizLangProvider>
  );
}
