import { useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { FOREIGN_ACCOUNT_THRESHOLD, foreignAccountCheck } from '../../lib/kr-investment-tax';

/* Overseas financial account reporting check (국제조세조정법 §53, 시행령 §92).
 * Moved from oiyo.net/{locale}/tax/foreign-account-report on 2026-10-27 (W4). The month-end
 * peak, which decides the obligation, is now the main input; the account sheet helps fill it.
 * Nothing is stored or sent. */

type Account = { id: number; currency: string; fx: string; amount: string };
const CURRENCIES = ['USD', 'JPY(100)', 'EUR', 'CNH', 'GBP', 'HKD', 'AUD', 'CAD', 'CHF', 'SGD', 'VND(100)', 'THB'];

const L = {
  ko: {
    korea: '대한민국 거주자·내국법인 기준', sheetTitle: '특정 월말 합계 계산', currency: '통화', fx: '그날 기준환율(원)', amount: '잔액(외화)', add: '+ 계좌 추가', remove: '삭제', account: '계좌',
    sum: '이 월말 합계', put: '아래 달에 넣기', monthsTitle: '월말별 해외계좌 합계(원)', m: '{n}월 말',
    yes: '신고 대상이에요', no: '신고 대상이 아니에요', peak: '가장 큰 월말', yesDesc: '합계가 5억 원을 넘는 월말이 있어요. 다음 해 6월 1일~30일에 홈택스로 신고해요.', noDesc: '어느 월말도 5억 원을 넘지 않으면 신고 의무가 없어요.',
  },
  en: {
    korea: 'Korean residents and domestic companies', sheetTitle: 'Total for one month-end', currency: 'Currency', fx: 'Reference rate that day (KRW)', amount: 'Balance (foreign)', add: '+ Add account', remove: 'Remove', account: 'Account',
    sum: 'Total on this month-end', put: 'Put into month', monthsTitle: 'Month-end totals of all overseas accounts (KRW)', m: 'End of month {n}',
    yes: 'You must report', no: 'No report needed', peak: 'Largest month-end', yesDesc: 'At least one month-end total is above 500M won. File on Hometax between June 1 and 30 of the next year.', noDesc: 'If no month-end total is above 500M won, there is nothing to report.',
  },
};

export default function ForeignAccountCheck({ locale }: { locale: Locale }) {
  const lang = locale === 'ko' ? 'ko' : 'en';
  const t = L[lang];
  const fmt = (n: number) => `${new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US').format(Math.round(n))}${lang === 'ko' ? '원' : ' won'}`;
  const [accounts, setAccounts] = useState<Account[]>([{ id: 1, currency: 'USD', fx: '', amount: '' }]);
  const [months, setMonths] = useState<string[]>(Array(12).fill(''));
  const [target, setTarget] = useState(12);
  const digits = (s: string) => Number(s.replace(/[^0-9]/g, '')) || 0;
  const dec = (s: string) => Number.parseFloat(s.replace(/,/g, '')) || 0;
  const unit = (c: string) => (c.includes('(100)') ? 100 : 1);
  const krw = (a: Account) => (dec(a.amount) / unit(a.currency)) * dec(a.fx);
  const sheet = accounts.reduce((s, a) => s + krw(a), 0);
  const res = useMemo(() => foreignAccountCheck(months.map(digits)), [months]);
  const any = months.some((m) => digits(m) > 0);
  const set = (id: number, k: keyof Account, v: string) => setAccounts((as) => as.map((a) => (a.id === id ? { ...a, [k]: v } : a)));
  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
  const label = (n: number) => t.m.replace('{n}', String(n));

  return (
    <div className="space-y-4">
      <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold">🇰🇷 {t.korea}</span>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-base font-bold">{t.monthsTitle}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {months.map((m, i) => (
            <label key={i} className="block text-sm font-medium">{label(i + 1)}
              <input inputMode="numeric" className={field} value={m ? new Intl.NumberFormat('ko-KR').format(digits(m)) : ''} onChange={(e) => setMonths((p) => p.map((x, j) => (j === i ? e.target.value : x)))} />
            </label>
          ))}
        </div>
      </section>
      {any && (
        <section className={`rounded-2xl border p-4 ${res.mustReport ? 'border-warning bg-background' : 'border-border bg-muted'}`}>
          <p className="text-lg font-extrabold">{res.mustReport ? `✅ ${t.yes}` : t.no}</p>
          <p className="mt-1 text-sm"><span className="text-muted-foreground">{t.peak}: </span><span className="font-mono font-semibold">{label(res.peakMonth)} · {fmt(res.peak)}</span></p>
          <p className="mt-2 text-sm text-muted-foreground">{res.mustReport ? t.yesDesc : t.noDesc}</p>
          <p className="mt-2 text-xs text-muted-foreground">{fmt(FOREIGN_ACCOUNT_THRESHOLD)}</p>
        </section>
      )}
      <details className="rounded-2xl border border-border bg-card p-4">
        <summary className="min-h-11 cursor-pointer content-center font-semibold">{t.sheetTitle}</summary>
        <div className="mt-3 space-y-3">
          {accounts.map((a, i) => (
            <div key={a.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{t.account} {i + 1}</span>
                {accounts.length > 1 && <button type="button" onClick={() => setAccounts((as) => as.filter((x) => x.id !== a.id))} className="min-h-11 px-2 text-sm text-muted-foreground underline">{t.remove}</button>}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-sm font-medium">{t.currency}
                  <select className={field} value={a.currency} onChange={(e) => set(a.id, 'currency', e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                </label>
                <label className="block text-sm font-medium">{t.fx}<input inputMode="decimal" className={field} value={a.fx} onChange={(e) => set(a.id, 'fx', e.target.value)} /></label>
                <label className="block text-sm font-medium">{t.amount}<input inputMode="decimal" className={field} value={a.amount} onChange={(e) => set(a.id, 'amount', e.target.value)} /></label>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setAccounts((as) => [...as, { id: Math.max(...as.map((x) => x.id)) + 1, currency: 'USD', fx: '', amount: '' }])} className="min-h-11 rounded-lg border border-border bg-background px-4 text-sm font-bold">{t.add}</button>
          <p className="flex flex-wrap justify-between gap-x-3 text-sm"><span className="text-muted-foreground">{t.sum}</span><span className="font-mono font-bold">{fmt(sheet)}</span></p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="block text-sm font-medium">{t.put}
              <select className={field} value={target} onChange={(e) => setTarget(Number(e.target.value))}>{months.map((_, i) => <option key={i} value={i + 1}>{label(i + 1)}</option>)}</select>
            </label>
            <button type="button" onClick={() => setMonths((p) => p.map((x, j) => (j === target - 1 ? String(Math.round(sheet)) : x)))} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground">OK</button>
          </div>
        </div>
      </details>
    </div>
  );
}
