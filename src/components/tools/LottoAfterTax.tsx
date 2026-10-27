import { useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { LOTTO_BRACKET, LOTTO_TAX_FREE_LIMIT, lottoTax } from '../../lib/lotto-tax';

/* Korean lotto prize after tax, then "spend it" with the net amount.
 * The spend part moved from oiyo.net/{locale}/lotto/simulator on 2026-10-27 (W3);
 * it now starts from the after-tax amount instead of a fixed guess. Prices are illustrative. */

interface Item { id: string; emoji: string; price: number; name: Record<'ko' | 'en', string> }

const CATALOG: Item[] = [
  { id: 'seoul-apt', emoji: '🏢', price: 1_500_000_000, name: { ko: '서울 아파트', en: 'Seoul apartment' } },
  { id: 'local-apt', emoji: '🏠', price: 400_000_000, name: { ko: '지방 아파트', en: 'Apartment outside Seoul' } },
  { id: 'jeonse', emoji: '🔑', price: 300_000_000, name: { ko: '전세 보증금', en: 'Jeonse deposit' } },
  { id: 'sports-car', emoji: '🏎️', price: 200_000_000, name: { ko: '수입 스포츠카', en: 'Imported sports car' } },
  { id: 'suv', emoji: '🚙', price: 50_000_000, name: { ko: '국산 SUV', en: 'Korean SUV' } },
  { id: 'world-trip', emoji: '🌍', price: 100_000_000, name: { ko: '세계일주', en: 'Trip around the world' } },
  { id: 'trip', emoji: '✈️', price: 5_000_000, name: { ko: '해외여행 1주', en: 'One-week trip abroad' } },
  { id: 'laptop', emoji: '💻', price: 3_000_000, name: { ko: '최신 노트북', en: 'New laptop' } },
  { id: 'watch', emoji: '⌚', price: 20_000_000, name: { ko: '명품 시계', en: 'Luxury watch' } },
  { id: 'parents', emoji: '🎁', price: 100_000_000, name: { ko: '부모님 효도', en: 'Gift for parents' } },
  { id: 'donation', emoji: '💛', price: 100_000_000, name: { ko: '기부', en: 'Donation' } },
  { id: 'savings', emoji: '🏦', price: 500_000_000, name: { ko: '예금·저축', en: 'Savings' } },
  { id: 'etf', emoji: '📈', price: 300_000_000, name: { ko: '주식·ETF 투자', en: 'Stocks and ETFs' } },
];

const PRESETS = [2_000_000_000, 1_000_000_000, 50_000_000, 1_500_000, 50_000];

const L = {
  ko: {
    korea: '대한민국 복권 기준', prize: '당첨금(세전)', ticket: '복권 구입비', unit: '원',
    income: '과세 대상 소득', incomeTax: '소득세', localTax: '지방소득세', total: '세금 합계', net: '실수령액', rate: '실효세율',
    free: '200만 원 이하라 세금이 없어요.', bands: '3억 원까지 22%, 넘는 부분 33%(지방세 포함)',
    spendTitle: '실수령액 써 보기', balance: '남은 금액', spent: '쓴 금액', reset: '처음부터', result: '사용 내역',
    noOdds: '이 도구는 세금 계산과 상상용이에요. 당첨 확률을 높이지 않아요.', numbers: '번호가 필요하면 로또 번호 생성기',
  },
  en: {
    korea: 'Korean lottery rules', prize: 'Prize before tax', ticket: 'Ticket price', unit: 'KRW',
    income: 'Taxable income', incomeTax: 'Income tax', localTax: 'Local income tax', total: 'Total tax', net: 'You receive', rate: 'Effective rate',
    free: 'Prizes of 2,000,000 won or less are not taxed.', bands: '22% up to 300M won, 33% above (local tax included)',
    spendTitle: 'Spend the net amount', balance: 'Balance', spent: 'Spent', reset: 'Start over', result: 'What you bought',
    noOdds: 'This tool calculates tax and lets you daydream. It does not raise your odds of winning.', numbers: 'Need numbers? Lotto number generator',
  },
};

export default function LottoAfterTax({ locale }: { locale: Locale }) {
  const lang = locale === 'ko' ? 'ko' : 'en';
  const t = L[lang];
  const fmt = (n: number) => new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(n);
  const [prizeText, setPrizeText] = useState('2000000000');
  const [ticketText, setTicketText] = useState('1000');
  const [cart, setCart] = useState<Record<string, number>>({});

  const prize = Number(prizeText.replace(/[^0-9]/g, '')) || 0;
  const ticket = Number(ticketText.replace(/[^0-9]/g, '')) || 0;
  const r = useMemo(() => lottoTax(prize, ticket), [prize, ticket]);

  const spent = CATALOG.reduce((s, it) => s + (cart[it.id] ?? 0) * it.price, 0);
  const balance = r.net - spent;
  const change = (it: Item, d: number) => setCart((c) => {
    const n = (c[it.id] ?? 0) + d;
    const next = { ...c };
    if (n <= 0) delete next[it.id]; else next[it.id] = n;
    return next;
  });
  const owned = CATALOG.filter((it) => (cart[it.id] ?? 0) > 0);
  const won = (n: number) => `${fmt(n)}${lang === 'ko' ? '원' : ' won'}`;

  const rows: [string, number][] = [
    [t.income, r.income], [t.incomeTax, r.incomeTax], [t.localTax, r.localTax], [t.total, r.totalTax],
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold">🇰🇷 {t.korea}</span>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            {t.prize}
            <input inputMode="numeric" value={prizeText ? fmt(prize) : ''} onChange={(e) => { setPrizeText(e.target.value); setCart({}); }}
              className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base" />
          </label>
          <label className="block text-sm font-semibold">
            {t.ticket}
            <input inputMode="numeric" value={ticketText ? fmt(ticket) : ''} onChange={(e) => setTicketText(e.target.value)}
              className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base" />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p} type="button" aria-pressed={prize === p} onClick={() => { setPrizeText(String(p)); setCart({}); }}
              className={`min-h-11 rounded-full border px-3 text-sm font-medium ${prize === p ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
              {won(p)}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-border bg-muted p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="shrink-0 text-sm font-semibold">{t.net}</span>
            <span className="font-mono text-xl font-extrabold text-primary sm:text-2xl">{won(r.net)}</span>
          </div>
          {r.totalTax === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{prize > 0 && prize <= LOTTO_TAX_FREE_LIMIT ? t.free : ''}</p>
          ) : (
            <dl className="mt-3 space-y-1 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-mono">{won(v)}</dd></div>
              ))}
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{t.rate}</dt><dd className="font-mono">{(r.effectiveRate * 100).toFixed(2)}%</dd></div>
            </dl>
          )}
          <p className="mt-3 text-xs text-muted-foreground">{t.bands} · {won(LOTTO_BRACKET)}</p>
        </div>
      </section>

      {r.net > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-bold">{t.spendTitle}</h2>
          <div className="sticky top-2 z-10 mt-3 rounded-xl border border-border bg-muted p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="shrink-0 text-sm font-semibold">{t.balance}</span>
              <span className={`font-mono text-lg sm:text-xl font-extrabold ${balance < 0 ? 'text-destructive' : 'text-foreground'}`}>{won(balance)}</span>
            </div>
            <progress className="mt-2 h-2 w-full accent-(--primary)" max={r.net} value={Math.max(0, balance)} />
            <div className="mt-1 text-right text-xs text-muted-foreground">{t.spent}: {won(spent)}</div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {CATALOG.map((it) => {
              const cnt = cart[it.id] ?? 0;
              return (
                <div key={it.id} className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border bg-background p-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{it.emoji} {it.name[lang]}</div>
                    <div className="truncate text-xs text-muted-foreground">{won(it.price)}{cnt > 0 ? ` · ×${cnt}` : ''}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {cnt > 0 && (
                      <button type="button" aria-label={`− ${it.name[lang]}`} onClick={() => change(it, -1)} className="size-11 rounded-full border border-border">−</button>
                    )}
                    <button type="button" aria-label={`+ ${it.name[lang]}`} onClick={() => change(it, 1)} disabled={balance < it.price}
                      className="size-11 rounded-full bg-primary text-primary-foreground disabled:opacity-30">+</button>
                  </div>
                </div>
              );
            })}
          </div>
          {owned.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-muted p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{t.result}</h3>
                <button type="button" onClick={() => setCart({})} className="min-h-11 px-2 text-sm underline">{t.reset}</button>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {owned.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3"><span>{it.emoji} {it.name[lang]} ×{cart[it.id]}</span><span className="font-mono">{won(it.price * (cart[it.id] ?? 0))}</span></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <p className="rounded-xl border border-warning bg-background px-4 py-3 text-sm font-semibold">{t.noOdds}</p>
      <p className="text-sm">
        <a className="inline-flex min-h-11 items-center font-bold text-primary underline" href={`https://game.oiyo.net/${locale}/lotto-generator/`}>{t.numbers} →</a>
      </p>
    </div>
  );
}
