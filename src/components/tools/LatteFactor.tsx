import { useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { LATTE_FREQ, latteFutureValue, type LatteFreq } from '../../lib/savings-math';

/* Latte factor, moved from blog.oiyo.net/{locale}/latte-factor-calculator/ and
 * caffelatte-calculator/ on 2026-10-27 (W4). One calculator for both; each locale uses its own
 * currency and a typical coffee price as the starting value. */

const CUR: Record<Locale, { code: string; price: number }> = {
  ko: { code: 'KRW', price: 5000 }, en: { code: 'USD', price: 5 }, ja: { code: 'JPY', price: 500 },
  zh: { code: 'CNY', price: 30 }, fr: { code: 'EUR', price: 4 }, es: { code: 'EUR', price: 4 },
};

const T: Record<Locale, Record<string, string>> = {
  ko: { cost: '한 번에 쓰는 돈', freq: '얼마나 자주', daily: '매일 (월 30회)', weekdays: '평일만 (월 약 21.6회)', weekly: '주 1회 (월 약 4.3회)', rate: '연 수익률 %', monthly: '한 달에 모이는 돈', after: '{n}년 뒤', paid: '넣은 돈', growth: '불어난 돈', note: '매달 말에 넣고 연 수익률을 12로 나눠 매달 굴린다고 가정했어요. 세금·수수료·물가는 빼고 계산했고 수익을 보장하지 않아요.' },
  en: { cost: 'Spend per purchase', freq: 'How often', daily: 'Daily (30 a month)', weekdays: 'Weekdays (~21.6 a month)', weekly: 'Weekly (~4.3 a month)', rate: 'Annual return %', monthly: 'Set aside each month', after: 'After {n} years', paid: 'Paid in', growth: 'Growth', note: 'Assumes month-end deposits with the annual rate split across 12 months. Taxes, fees and inflation are left out, and returns are not guaranteed.' },
  ja: { cost: '1回の支出', freq: '頻度', daily: '毎日（月30回）', weekdays: '平日（月約21.6回）', weekly: '週1回（月約4.3回）', rate: '年利回り %', monthly: '毎月の積立額', after: '{n}年後', paid: '積立元本', growth: '増えた分', note: '月末に積み立て、年利を12で割って毎月複利運用すると仮定しています。税金・手数料・物価上昇は含まず、収益は保証されません。' },
  zh: { cost: '每次花费', freq: '频率', daily: '每天（每月30次）', weekdays: '工作日（每月约21.6次）', weekly: '每周一次（每月约4.3次）', rate: '年回报率 %', monthly: '每月存下', after: '{n}年后', paid: '投入本金', growth: '增长部分', note: '假设每月月底投入，年回报率按12个月平分并按月复利。不含税费、手续费和通胀，不保证收益。' },
  fr: { cost: 'Dépense par achat', freq: 'Fréquence', daily: 'Chaque jour (30 par mois)', weekdays: 'Jours ouvrés (~21,6 par mois)', weekly: 'Une fois par semaine (~4,3 par mois)', rate: 'Rendement annuel %', monthly: 'Épargné chaque mois', after: 'Après {n} ans', paid: 'Versé', growth: 'Gain', note: 'Versements en fin de mois, taux annuel réparti sur 12 mois. Impôts, frais et inflation non inclus ; rendement non garanti.' },
  es: { cost: 'Gasto por compra', freq: 'Frecuencia', daily: 'Cada día (30 al mes)', weekdays: 'Días laborables (~21,6 al mes)', weekly: 'Una vez por semana (~4,3 al mes)', rate: 'Rentabilidad anual %', monthly: 'Ahorro mensual', after: 'Tras {n} años', paid: 'Aportado', growth: 'Crecimiento', note: 'Aportaciones a fin de mes con la tasa anual repartida en 12 meses. Sin impuestos, comisiones ni inflación; la rentabilidad no está garantizada.' },
};

const FREQS = Object.keys(LATTE_FREQ) as LatteFreq[];

export default function LatteFactor({ locale }: { locale: Locale }) {
  const t = T[locale] ?? T.en;
  const cur = CUR[locale] ?? CUR.en;
  const [cost, setCost] = useState(String(cur.price));
  const [freq, setFreq] = useState<LatteFreq>('daily');
  const [rate, setRate] = useState('5');
  const money = (n: number) => new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : locale, { style: 'currency', currency: cur.code, maximumFractionDigits: 0 }).format(n);

  const c = Number.parseFloat(cost) || 0;
  const r = Math.min(30, Math.max(0, Number.parseFloat(rate) || 0));
  const rows = useMemo(() => [10, 20, 30].map((y) => ({ y, ...latteFutureValue(c, freq, r, y) })), [c, freq, r]);
  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
        <label className="block text-sm font-medium">{t.cost} ({cur.code})<input className={field} inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} /></label>
        <label className="block text-sm font-medium">{t.freq}
          <select className={field} value={freq} onChange={(e) => setFreq(e.target.value as LatteFreq)}>
            {FREQS.map((f) => <option key={f} value={f}>{t[f]}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">{t.rate}<input className={field} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
      </section>
      <section className="rounded-2xl border border-border bg-muted p-4">
        <p className="flex flex-wrap justify-between gap-x-3 text-sm"><span className="text-muted-foreground">{t.monthly}</span><span className="font-mono font-bold">{money(rows[0].monthly)}</span></p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.y} className="min-w-0 rounded-xl border border-border bg-background p-3">
              <p className="text-sm font-semibold">{t.after.replace('{n}', String(row.y))}</p>
              <p className="truncate font-mono text-xl font-extrabold text-primary">{money(row.total)}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{t.paid} {money(row.principal)} · {t.growth} {money(row.growth)}</p>
            </div>
          ))}
        </div>
      </section>
      <p className="text-xs text-muted-foreground">{t.note}</p>
    </div>
  );
}
