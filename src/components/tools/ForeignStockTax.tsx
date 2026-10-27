import { useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { foreignStockTax, STOCK_GAIN_DEDUCTION } from '../../lib/kr-investment-tax';

/* Foreign-listed stock gains tax for a Korean resident (소득세법 §103·§104).
 * Moved from oiyo.net/{locale}/tax/overseas-stock on 2026-10-27 (W4). The old page used one
 * 22% rounding; this one floors the 20% national tax and the 10% local tax separately and
 * nets several sales within the year. */

type Row = { id: number; sell: string; buy: string; fee: string };

const L = {
  ko: {
    korea: '대한민국 거주자 기준', sale: '매도', sell: '양도가액(원)', buy: '취득가액(원)', fee: '수수료 등(원)', gain: '손익', add: '+ 매도 추가', remove: '삭제',
    sme: '중소기업 주식(10%)', net: '올해 손익 합계', ded: '기본공제', base: '과세표준', tax: '양도소득세', local: '지방소득세', total: '세금 합계', none: '낼 세금이 없어요.',
    hint: '원화 금액은 매도일·매수일 기준환율로 바꿔 넣어요. RSU는 베스팅 때 근로소득으로 과세된 금액이 취득가액이에요.',
  },
  en: {
    korea: 'Korean resident rules', sale: 'Sale', sell: 'Proceeds (KRW)', buy: 'Cost (KRW)', fee: 'Fees (KRW)', gain: 'Gain/loss', add: '+ Add sale', remove: 'Remove',
    sme: 'Small/medium company stock (10%)', net: 'Net gain this year', ded: 'Basic deduction', base: 'Tax base', tax: 'Capital gains tax', local: 'Local income tax', total: 'Total tax', none: 'No tax to pay.',
    hint: 'Convert each amount to won at the reference rate on the sale and purchase dates. For RSUs, the cost is the vesting value already taxed as salary.',
  },
};

export default function ForeignStockTax({ locale }: { locale: Locale }) {
  const lang = locale === 'ko' ? 'ko' : 'en';
  const t = L[lang];
  const fmt = (n: number) => `${new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US').format(n)}${lang === 'ko' ? '원' : ' won'}`;
  const [rows, setRows] = useState<Row[]>([{ id: 1, sell: '50000000', buy: '30000000', fee: '0' }]);
  const [sme, setSme] = useState(false);
  const digits = (s: string) => Number(s.replace(/[^0-9]/g, '')) || 0;
  const gainOf = (r: Row) => digits(r.sell) - digits(r.buy) - digits(r.fee);
  const res = useMemo(() => foreignStockTax(rows.map(gainOf), sme), [rows, sme]);
  const set = (id: number, k: keyof Row, v: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
  const won = (v: string) => (v ? new Intl.NumberFormat('ko-KR').format(digits(v)) : '');

  return (
    <div className="space-y-4">
      <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold">🇰🇷 {t.korea}</span>
      {rows.map((r, i) => (
        <section key={r.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{t.sale} {i + 1}</span>
            {rows.length > 1 && <button type="button" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} className="min-h-11 px-2 text-sm text-muted-foreground underline">{t.remove}</button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium">{t.sell}<input inputMode="numeric" className={field} value={won(r.sell)} onChange={(e) => set(r.id, 'sell', e.target.value)} /></label>
            <label className="block text-sm font-medium">{t.buy}<input inputMode="numeric" className={field} value={won(r.buy)} onChange={(e) => set(r.id, 'buy', e.target.value)} /></label>
            <label className="block text-sm font-medium">{t.fee}<input inputMode="numeric" className={field} value={won(r.fee)} onChange={(e) => set(r.id, 'fee', e.target.value)} /></label>
          </div>
          <p className="mt-2 flex flex-wrap justify-between gap-x-3 text-sm"><span className="text-muted-foreground">{t.gain}</span><span className={`font-mono font-semibold ${gainOf(r) < 0 ? 'text-destructive' : ''}`}>{fmt(gainOf(r))}</span></p>
        </section>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setRows((rs) => [...rs, { id: Math.max(...rs.map((x) => x.id)) + 1, sell: '', buy: '', fee: '' }])} className="min-h-11 rounded-lg border border-border bg-background px-4 text-sm font-bold">{t.add}</button>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={sme} onChange={(e) => setSme(e.target.checked)} />{t.sme}</label>
      </div>
      <section className="rounded-2xl border border-border bg-muted p-4">
        <dl className="space-y-2 text-sm">
          <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.net}</dt><dd className="font-mono">{fmt(res.netGain)}</dd></div>
          <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.ded}</dt><dd className="font-mono">−{fmt(res.deduction)} / {fmt(STOCK_GAIN_DEDUCTION)}</dd></div>
          <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.base}</dt><dd className="font-mono">{fmt(res.taxBase)}</dd></div>
          <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.tax}</dt><dd className="font-mono">{fmt(res.incomeTax)}</dd></div>
          <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.local}</dt><dd className="font-mono">{fmt(res.localTax)}</dd></div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 border-t border-border pt-2"><dt className="font-semibold">{t.total}</dt><dd className="font-mono text-xl font-extrabold text-primary">{fmt(res.totalTax)}</dd></div>
        </dl>
        {res.totalTax === 0 && <p className="mt-2 text-sm text-muted-foreground">{t.none}</p>}
      </section>
      <p className="text-xs text-muted-foreground">{t.hint}</p>
    </div>
  );
}
