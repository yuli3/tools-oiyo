import { useEffect, useId, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { converterCopy } from '../../lib/fx-copy';
import { FX_CURRENCIES, convertViaKrw, validateFeed } from '../../lib/fx-feed.mjs';
import snapshot from '../../data/fx-snapshot.json';

// 2026-10-25: blog-oiyo 정적 환율(2026-06)을 ECB 일일 피드로 바꿨어요.
// 화면은 빌드 시 스냅샷으로 먼저 그리고, /data/fx/latest.json이 유효하면 그 값으로 바꿔요.
const CURRENCIES = ['KRW', ...FX_CURRENCIES] as const;
type Currency = typeof CURRENCIES[number];
type Feed = { asOf: string; rates: Record<string, number> };
const PRESETS: [Currency, Currency][] = [['USD','KRW'],['JPY','KRW'],['EUR','KRW'],['CNY','KRW']];
const inputClass = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-primary';

export default function CurrencyConverter({ locale }: { locale: Locale }) {
  const c = converterCopy[locale];
  const id = useId();
  const [feed, setFeed] = useState<Feed>(snapshot as Feed);
  const [fallback, setFallback] = useState(false);
  const [from, setFrom] = useState<Currency>('USD');
  const [to, setTo] = useState<Currency>('KRW');
  const [amount, setAmount] = useState('1');
  useEffect(() => {
    let alive = true;
    fetch('/data/fx/latest.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : null))
      .then(json => { if (!alive) return; const valid = validateFeed(json); if (valid) setFeed(valid as Feed); else setFallback(true); })
      .catch(() => { if (alive) setFallback(true); });
    return () => { alive = false; };
  }, []);
  const value = amount.trim() === '' ? NaN : Number(amount);
  const ok = Number.isFinite(value) && value >= 0;
  const fmt = (n: number, cur: Currency) => new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: n !== 0 && Math.abs(n) < 1 ? 6 : undefined }).format(n);
  const result = ok ? convertViaKrw(value, from, to, feed.rates) : NaN;
  const unitRate = convertViaKrw(1, from, to, feed.rates);
  const select = (label: string, cur: Currency, set: (c: Currency) => void) => (
    <label className="grid text-sm font-medium">{label}
      <select value={cur} onChange={e => set(e.target.value as Currency)} className={inputClass}>
        {CURRENCIES.map(code => <option key={code} value={code}>{code}</option>)}
      </select>
    </label>
  );
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4" data-currency-converter={locale}>
      <div>
        <p className="text-sm font-semibold text-muted-foreground">{c.presets}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map(([f, t]) => (
            <button key={f + t} type="button" aria-pressed={from === f && to === t} onClick={() => { setFrom(f); setTo(t); setAmount('1'); }}
              className="min-h-11 rounded-full border border-border px-3 text-sm aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">
              {f} → {t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
        {select(c.from, from, setFrom)}
        <button type="button" onClick={() => { setFrom(to); setTo(from); }} className="min-h-11 rounded-lg border border-border px-3 text-sm">⇄ {c.swap}</button>
        {select(c.to, to, setTo)}
      </div>
      <label className="grid text-sm font-medium" htmlFor={`${id}-amount`}>{c.amount} ({from})
        <input id={`${id}-amount`} type="number" inputMode="decimal" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)} className={inputClass} />
      </label>
      <div aria-live="polite" className="rounded-lg border border-primary bg-muted p-3">
        <p className="text-sm text-muted-foreground">{c.result}</p>
        <p className="text-2xl font-bold">{ok ? fmt(result, to) : '—'}</p>
        <p className="mt-1 text-sm">{c.rate}: 1 {from} = {fmt(unitRate, to)}</p>
      </div>
      <p className="text-sm text-muted-foreground" data-fx-as-of={feed.asOf}>{c.asOf} {feed.asOf} · {c.source} · {c.note}</p>
      {fallback && <p className="text-sm text-muted-foreground">{c.fallback}</p>}
    </section>
  );
}
