import { useEffect, useState } from 'react';
import type { Locale } from '../../lib/i18n';

// Moved from Blog's world-clock page script (W7, 2026-10-27): same cities, same Intl formatting.
const ZONES: [string, string][] = [
  ['Asia/Seoul', '🇰🇷'], ['America/New_York', '🗽'], ['America/Los_Angeles', '🎬'], ['Europe/London', '🇬🇧'],
  ['Europe/Paris', '🇫🇷'], ['Europe/Berlin', '🇩🇪'], ['Europe/Madrid', '🇪🇸'], ['Asia/Dubai', '🇦🇪'],
  ['Asia/Tokyo', '🇯🇵'], ['Asia/Shanghai', '🇨🇳'], ['Asia/Hong_Kong', '🇭🇰'], ['Asia/Singapore', '🇸🇬'],
  ['Australia/Sydney', '🦘'], ['America/Sao_Paulo', '🇧🇷'], ['America/Mexico_City', '🇲🇽'],
];
const CITIES: Record<Locale, string[]> = {
  ko: ['서울', '뉴욕', '로스앤젤레스', '런던', '파리', '베를린', '마드리드', '두바이', '도쿄', '베이징', '홍콩', '싱가포르', '시드니', '상파울루', '멕시코시티'],
  en: ['Seoul', 'New York', 'Los Angeles', 'London', 'Paris', 'Berlin', 'Madrid', 'Dubai', 'Tokyo', 'Beijing', 'Hong Kong', 'Singapore', 'Sydney', 'São Paulo', 'Mexico City'],
  ja: ['ソウル', 'ニューヨーク', 'ロサンゼルス', 'ロンドン', 'パリ', 'ベルリン', 'マドリード', 'ドバイ', '東京', '北京', '香港', 'シンガポール', 'シドニー', 'サンパウロ', 'メキシコシティ'],
  zh: ['首尔', '纽约', '洛杉矶', '伦敦', '巴黎', '柏林', '马德里', '迪拜', '东京', '北京', '香港', '新加坡', '悉尼', '圣保罗', '墨西哥城'],
  fr: ['Séoul', 'New York', 'Los Angeles', 'Londres', 'Paris', 'Berlin', 'Madrid', 'Dubaï', 'Tokyo', 'Pékin', 'Hong Kong', 'Singapour', 'Sydney', 'São Paulo', 'Mexico'],
  es: ['Seúl', 'Nueva York', 'Los Ángeles', 'Londres', 'París', 'Berlín', 'Madrid', 'Dubái', 'Tokio', 'Pekín', 'Hong Kong', 'Singapur', 'Sídney', 'São Paulo', 'Ciudad de México'],
};
const LOCAL: Record<Locale, string> = { ko: '내 시간', en: 'Local', ja: '現在地', zh: '本地', fr: 'Heure locale', es: 'Hora local' };
const INTL: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', fr: 'fr-FR', es: 'es-ES' };

function offset(tz: string, now: Date) {
  try {
    return new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(now).find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch { return ''; }
}

export default function WorldClock({ locale }: { locale: Locale }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const lang = INTL[locale];
  const time = (tz?: string) => now ? new Intl.DateTimeFormat(lang, { timeZone: tz, hour: '2-digit', minute: '2-digit', second: tz ? undefined : '2-digit', hour12: false }).format(now) : '--:--';
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground">{LOCAL[locale]}</p>
        <p className="text-2xl font-black tabular-nums">{time()}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ZONES.map(([tz, emoji], i) => (
          <div key={tz} className="rounded-xl border border-border bg-muted/40 p-3">
            <div className="mb-1 flex items-center gap-2">
              <span aria-hidden="true">{emoji}</span>
              <span className="truncate text-xs font-bold text-muted-foreground">{CITIES[locale][i]}</span>
            </div>
            <p className="text-2xl font-black tabular-nums">{time(tz)}</p>
            <p className="text-xs text-muted-foreground">{now ? new Intl.DateTimeFormat(lang, { timeZone: tz, month: 'short', day: 'numeric', weekday: 'short' }).format(now) : '—'}</p>
            <p className="font-mono text-xs text-muted-foreground">{now ? offset(tz, now) : ''}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
