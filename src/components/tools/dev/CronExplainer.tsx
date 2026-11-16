// cron 표현식 해석기 (2026-11-16, Gemini 이전 D). 계산: lib/dev-tools.ts parseCron·nextRuns·describeCron.
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { describeCron, nextRuns, parseCron, runsPerMatchingDay } from "../../../lib/dev-tools";
import BarTrack from "../viz/BarTrack";
import { Chips, CopyButton, Field, inputCls, langOf, t } from "./common";

const EXAMPLES = ["*/5 * * * *", "0 9 * * 1-5", "30 2 * * 0", "0 0 1 * *", "0 */6 * * *", "15 14 1,15 * *"];
const FIELD_NAMES = { ko: ["분", "시", "일", "월", "요일"], en: ["minute", "hour", "day of month", "month", "day of week"] };
const ERR = {
  "six-fields": { ko: "칸이 6개예요. 초(seconds)나 연도가 붙은 Quartz·Spring 형식 같아요. 이 도구는 리눅스 cron의 5칸(분 시 일 월 요일)을 읽어요.", en: "Six fields look like Quartz/Spring (with seconds or year). This tool reads standard 5-field cron (minute hour day month weekday)." },
  "field-count": { ko: "칸은 5개여야 해요: 분 시 일 월 요일", en: "Use five fields: minute hour day-of-month month day-of-week" },
  "bad-field": { ko: "읽을 수 없는 칸이 있어요", en: "One field can't be read" },
};

export default function CronExplainer({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const [count, setCount] = useState("10");
  const r = useMemo(() => parseCron(expr), [expr]);
  // 빌드 시각이 아니라 보는 사람의 지금 시각으로 계산한다(정적 HTML 하이드레이션 뒤).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const runs = useMemo(() => (r.ok && now ? nextRuns(r.cron, now, Number(count)) : []), [r, count, now]);
  const fmt = new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false });
  const tz = now ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  // 24시간 안 실행 분포: 시간대별 횟수 막대.
  const byHour = r.ok ? Array.from({ length: 24 }, (_, h) => (r.cron.hour.values.includes(h) ? r.cron.minute.values.length : 0)) : [];
  const peak = Math.max(1, ...byHour);
  const parts = expr.trim().split(/\s+/);

  return (
    <div className="space-y-5">
      <Field label={t(lang, "cron 표현식 (분 시 일 월 요일)", "Cron expression (minute hour day month weekday)")}>
        <input value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} autoCapitalize="off" className={inputCls + " font-mono"} aria-invalid={!r.ok} />
      </Field>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button key={e} type="button" onClick={() => setExpr(e)} className="min-h-11 rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground hover:bg-muted">
            {e}
          </button>
        ))}
      </div>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        {r.ok ? (
          <>
            <p className="text-base font-semibold text-foreground">{describeCron(r.cron, lang)}</p>
            {parts.length === 5 && (
              <div className="grid grid-cols-5 gap-1 text-center">
                {parts.map((p, i) => (
                  <div key={i} className="rounded-md bg-muted px-1 py-2">
                    <span className="block break-all font-mono text-sm text-foreground">{p}</span>
                    <span className="block text-xs text-muted-foreground">{FIELD_NAMES[lang][i]}</span>
                  </div>
                ))}
              </div>
            )}
            <figure>
              <figcaption className="text-sm font-semibold text-foreground">{t(lang, `실행하는 날의 시간대별 횟수 (하루 ${runsPerMatchingDay(r.cron)}번)`, `Runs per hour on a matching day (${runsPerMatchingDay(r.cron)} a day)`)}</figcaption>
              <div className="mt-2 grid grid-cols-12 gap-x-1 gap-y-2 sm:grid-cols-24">
                {byHour.map((n, h) => (
                  <div key={h} title={`${h}:00 — ${n}`}>
                    <BarTrack segments={[{ from: 0, to: (n / peak) * 100, tone: n ? "primary" : "muted" }]} />
                    <span className="block text-center text-xs text-muted-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </figure>
            <div>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground">{t(lang, `다음 실행 시각 (${tz})`, `Next runs (${tz})`)}</h2>
                <Chips<string> legend={t(lang, "개수", "Count")} value={count} onChange={setCount} options={["5", "10", "20"].map((v) => ({ value: v, label: v }))} />
              </div>
              {!now ? null : runs.length ? (
                <ol className="mt-2 space-y-1 font-mono text-sm text-foreground">
                  {runs.map((d) => <li key={d.getTime()}>{fmt.format(d)}</li>)}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-destructive">{t(lang, "5년 안에 이 조건을 만족하는 날이 없어요(예: 2월 30일).", "No matching time within 5 years (e.g. February 30).")}</p>
              )}
            </div>
            <CopyButton text={() => `${r.cron.source}  # ${describeCron(r.cron, lang)}`} lang={lang} label={t(lang, "주석 붙여 복사", "Copy with comment")} />
          </>
        ) : (
          <p className="text-sm text-destructive">
            {ERR[r.error as keyof typeof ERR]?.[lang] ?? r.error}
            {r.field !== undefined && ` — ${FIELD_NAMES[lang][r.field]}: ${parts[r.field] ?? ""}`}
          </p>
        )}
        <p className="text-xs leading-5 text-muted-foreground">
          {t(lang, "일(3번째)과 요일(5번째)을 둘 다 정하면 둘 중 하나만 맞아도 실행돼요(리눅스 cron 규칙). 서버 시간대가 브라우저와 다르면 시각이 달라져요. GitHub Actions·Kubernetes CronJob은 기본이 UTC예요.", "If both day-of-month and day-of-week are set, either one triggers a run (Vixie cron). Times follow your browser's time zone; GitHub Actions and Kubernetes CronJobs default to UTC.")}
        </p>
      </div>
    </div>
  );
}
