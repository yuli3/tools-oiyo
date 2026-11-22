'use client';
/**
 * 간단계산기 — 카드 할부 수수료 계산기 (2026-11-22).
 * 나라마다 카드 할부 수수료를 매기는 방식이 달라요(현지 특화):
 *  - 한국: 남은 할부 원금 × 연 수수료율 ÷ 12 (원금 균등, 수수료는 줄어듦)
 *  - 일본·미국·유럽: 원리금균등(매달 같은 금액, 実質年率/APR/TAE)
 *  - 중국: 원금 × 월 수수료율을 매달 고정(分期手续费率) → 실질 연율은 표시율 × 12보다 높음
 */
import { useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { cardInstallment, type InstallmentMethod } from '../../lib/bill-split';

const CUR: Record<Locale, { code: string; dp: number; amount: string }> = {
  ko: { code: 'KRW', dp: 0, amount: '1200000' },
  ja: { code: 'JPY', dp: 0, amount: '120000' },
  zh: { code: 'CNY', dp: 2, amount: '6000' },
  en: { code: 'USD', dp: 2, amount: '1200' },
  fr: { code: 'EUR', dp: 2, amount: '1200' },
  es: { code: 'EUR', dp: 2, amount: '1200' },
};
const DEF: Record<Locale, { method: InstallmentMethod; rate: string; months: number }> = {
  ko: { method: 'declining', rate: '16', months: 12 },
  ja: { method: 'annuity', rate: '15', months: 12 },
  zh: { method: 'flat', rate: '0.6', months: 12 },
  en: { method: 'annuity', rate: '22', months: 12 },
  fr: { method: 'annuity', rate: '15', months: 10 },
  es: { method: 'annuity', rate: '20', months: 12 },
};
const MONTHS = [2, 3, 6, 10, 12, 24];
const INTL: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', fr: 'fr-FR', es: 'es-ES' };

interface T {
  amount: string; months: string; monthsUnit: (n: number) => string; rate: string; rateMonthly: string; method: string;
  methods: Record<InstallmentMethod, string>; first: string; fee: string; total: string; apr: string; free: string;
  sentence: (m: number, fee: string, pay: string) => string; schedule: string; cols: [string, string, string, string, string]; note: Record<InstallmentMethod, string>;
}
const L: Record<Locale, T> = {
  ko: {
    amount: '결제 금액', months: '할부 개월', monthsUnit: (n) => `${n}개월`, rate: '연 수수료율(%)', rateMonthly: '월 수수료율(%)', method: '계산 방식',
    methods: { declining: '한국 카드사(잔액×연율÷12)', annuity: '원리금균등(매달 같은 금액)', flat: '월 고정 수수료' },
    first: '첫 달 청구액', fee: '할부 수수료 합계', total: '총 내는 돈', apr: '실질 연이율', free: '무이자(0%)',
    sentence: (m, fee, pay) => `${m}개월 할부면 수수료로 약 ${fee}을 더 내요. 첫 달 청구액은 ${pay}이에요(추정).`,
    schedule: '회차별 청구 내역', cols: ['회차', '원금', '수수료', '청구액', '남은 원금'],
    note: { declining: '국내 카드사는 남은 할부 원금에 연 수수료율을 적용해 매달 수수료가 줄어요. 실제 청구는 카드사의 일수 계산·원 단위 처리에 따라 조금 다를 수 있어요.', annuity: '매달 같은 금액을 내는 방식이에요.', flat: '원금 기준으로 매달 같은 수수료를 내서, 실질 연이율이 표시 수수료율×12보다 높아요.' },
  },
  ja: {
    amount: '利用金額', months: '支払回数', monthsUnit: (n) => `${n}回`, rate: '実質年率(%)', rateMonthly: '月の手数料率(%)', method: '計算方式',
    methods: { declining: '残高×年率÷12(元金均等)', annuity: '元利均等(毎月同額)', flat: '毎月定額の手数料' },
    first: '初回の支払額', fee: '分割手数料の合計', total: '支払総額', apr: '実質年率', free: '手数料なし(0%)',
    sentence: (m, fee, pay) => `${m}回払いだと手数料は約${fee}、初回の支払額は${pay}です(概算)。`,
    schedule: '回ごとの明細', cols: ['回', '元金', '手数料', '支払額', '残高'],
    note: { declining: '元金を均等に分け、残高に年率をかける方式です。', annuity: '日本のカード会社の分割払いは多くが元利均等方式で、毎月の支払額が同じです。実際の額はカード会社の計算方法で少し異なります。', flat: '元金に対して毎月同じ手数料がかかるため、実質年率は表示率×12より高くなります。' },
  },
  zh: {
    amount: '分期金额', months: '分期期数', monthsUnit: (n) => `${n}期`, rate: '年化利率(%)', rateMonthly: '每期手续费率(%)', method: '计算方式',
    methods: { declining: '剩余本金×年利率÷12', annuity: '等额本息(每月相同)', flat: '每期固定手续费(信用卡分期)' },
    first: '首期还款', fee: '手续费合计', total: '还款总额', apr: '实际年化利率', free: '免息(0%)',
    sentence: (m, fee, pay) => `分${m}期，手续费约${fee}，首期还款${pay}（估算）。`,
    schedule: '每期明细', cols: ['期', '本金', '手续费', '还款', '剩余本金'],
    note: { declining: '按剩余本金计息，手续费逐月减少。', annuity: '每月还款金额相同。', flat: '国内信用卡分期多按“本金×每期手续费率”每月收取固定手续费，本金逐月减少但手续费不变，所以实际年化利率约为每期费率×12的1.8倍左右。' },
  },
  en: {
    amount: 'Purchase amount', months: 'Installments', monthsUnit: (n) => `${n} mo`, rate: 'APR (%)', rateMonthly: 'Monthly fee (%)', method: 'Method',
    methods: { declining: 'Fee on remaining balance', annuity: 'Level payment (APR)', flat: 'Fixed monthly fee (plan fee)' },
    first: 'First payment', fee: 'Total interest/fees', total: 'Total paid', apr: 'Effective APR', free: '0% promo',
    sentence: (m, fee, pay) => `Over ${m} months you pay about ${fee} in interest or fees. Your first payment is ${pay} (estimate).`,
    schedule: 'Payment schedule', cols: ['#', 'Principal', 'Fee', 'Payment', 'Balance'],
    note: { declining: 'Equal principal each month; the fee is charged on the remaining balance.', annuity: 'Same payment every month, like a card balance paid off at a fixed APR.', flat: 'Card “pay over time” plans often charge a fixed monthly fee on the original amount. Its effective APR is much higher than the monthly fee × 12 suggests.' },
  },
  fr: {
    amount: 'Montant de l’achat', months: 'Nombre de mensualités', monthsUnit: (n) => `${n} fois`, rate: 'TAEG (%)', rateMonthly: 'Frais mensuels (%)', method: 'Méthode',
    methods: { declining: 'Frais sur le capital restant', annuity: 'Mensualités constantes (TAEG)', flat: 'Frais fixes par mois' },
    first: 'Première mensualité', fee: 'Total des frais', total: 'Total payé', apr: 'Taux effectif annuel', free: 'Sans frais (0 %)',
    sentence: (m, fee, pay) => `En ${m} fois, vous payez environ ${fee} de frais. Première mensualité : ${pay} (estimation).`,
    schedule: 'Échéancier', cols: ['N°', 'Capital', 'Frais', 'Mensualité', 'Restant dû'],
    note: { declining: 'Capital réparti à parts égales, frais calculés sur le restant dû.', annuity: 'Mensualités identiques, comme un crédit renouvelable au TAEG indiqué.', flat: 'Des frais fixes calculés sur le montant initial donnent un taux effectif plus élevé que frais × 12.' },
  },
  es: {
    amount: 'Importe de la compra', months: 'Número de cuotas', monthsUnit: (n) => `${n} meses`, rate: 'TAE (%)', rateMonthly: 'Comisión mensual (%)', method: 'Método',
    methods: { declining: 'Comisión sobre el saldo pendiente', annuity: 'Cuota constante (TAE)', flat: 'Comisión fija mensual' },
    first: 'Primera cuota', fee: 'Total de intereses/comisiones', total: 'Total pagado', apr: 'Tasa efectiva anual', free: 'Sin intereses (0 %)',
    sentence: (m, fee, pay) => `En ${m} cuotas pagas unos ${fee} de intereses o comisiones. La primera cuota es ${pay} (estimación).`,
    schedule: 'Calendario de cuotas', cols: ['N.º', 'Capital', 'Comisión', 'Cuota', 'Pendiente'],
    note: { declining: 'Capital en partes iguales; la comisión se calcula sobre lo pendiente.', annuity: 'Cuota igual cada mes, como el pago aplazado de una tarjeta a la TAE indicada.', flat: 'Una comisión fija sobre el importe inicial supone una tasa efectiva mayor que comisión × 12.' },
  },
};

const field = 'min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring';
const chip = 'min-h-11 rounded-lg border px-3 text-sm font-semibold transition-colors';
const chipOn = 'border-primary bg-primary text-primary-foreground';
const chipOff = 'border-border bg-card text-foreground hover:border-primary/50';

export default function CardInstallment({ locale = 'ko' }: { locale?: Locale }) {
  const t = L[locale] ?? L.en;
  const c = CUR[locale] ?? CUR.en;
  const d = DEF[locale] ?? DEF.en;
  const [amount, setAmount] = useState(c.amount);
  const [months, setMonths] = useState(d.months);
  const [rate, setRate] = useState(d.rate);
  const [method, setMethod] = useState<InstallmentMethod>(d.method);
  const scale = 10 ** c.dp;
  const fmt = useMemo(() => new Intl.NumberFormat(INTL[locale], { style: 'currency', currency: c.code, minimumFractionDigits: c.dp, maximumFractionDigits: c.dp }), [locale, c.code, c.dp]);
  const money = (minor: number) => fmt.format(minor / scale);
  const r = useMemo(() => cardInstallment({ principal: Math.round((Number(amount) || 0) * scale), months, ratePct: Number(rate) || 0, method }), [amount, months, rate, method, scale]);

  return (
    <div className="space-y-5" data-tool="card-installment">
      <label className="block space-y-1 text-sm font-semibold text-foreground">
        <span>{t.amount} ({c.code})</span>
        <input className={field} type="number" inputMode="decimal" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-foreground">{t.months}</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {MONTHS.map((m) => <button key={m} type="button" aria-pressed={months === m} onClick={() => setMonths(m)} className={`${chip} ${months === m ? chipOn : chipOff}`}>{t.monthsUnit(m)}</button>)}
        </div>
        <input className={field} type="number" inputMode="numeric" min="1" max="60" value={months} onChange={(e) => setMonths(Math.max(1, Math.min(60, Number(e.target.value) || 1)))} aria-label={t.months} />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-foreground">{t.method}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(['declining', 'annuity', 'flat'] as const).map((m) => <button key={m} type="button" aria-pressed={method === m} onClick={() => setMethod(m)} className={`${chip} ${method === m ? chipOn : chipOff} text-left`}>{t.methods[m]}</button>)}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{t.note[method]}</p>
      </fieldset>

      <div className="flex items-end gap-2">
        <label className="flex-1 space-y-1 text-sm font-semibold text-foreground">
          <span>{method === 'flat' ? t.rateMonthly : t.rate}</span>
          <input className={field} type="number" inputMode="decimal" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
        </label>
        <button type="button" onClick={() => setRate('0')} className={`${chip} ${Number(rate) === 0 ? chipOn : chipOff}`}>{t.free}</button>
      </div>

      <section aria-live="polite" className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-base font-semibold leading-7 text-foreground">{t.sentence(months, money(r.totalFee), money(r.firstPayment))}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted-foreground">{t.first}</dt><dd className="text-lg font-bold tabular-nums text-foreground">{money(r.firstPayment)}</dd></div>
          <div><dt className="text-muted-foreground">{t.fee}</dt><dd className="text-lg font-bold tabular-nums text-primary">{money(r.totalFee)}</dd></div>
          <div><dt className="text-muted-foreground">{t.total}</dt><dd className="font-bold tabular-nums text-foreground">{money(r.totalPaid)}</dd></div>
          <div><dt className="text-muted-foreground">{t.apr}</dt><dd className="font-bold tabular-nums text-foreground">{r.effectiveAprPct.toFixed(2)}%</dd></div>
        </dl>
      </section>

      <details className="rounded-xl border border-border">
        <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold text-foreground">{t.schedule}</summary>
        <div className="overflow-x-auto px-2 pb-3">
          <table className="w-full text-right text-xs tabular-nums sm:text-sm">
            <thead><tr className="text-muted-foreground">{t.cols.map((h) => <th key={h} scope="col" className="px-2 py-1 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {r.rows.map((row) => (
                <tr key={row.month} className="border-t border-border">
                  <td className="px-2 py-1">{row.month}</td><td className="px-2 py-1">{money(row.principal)}</td><td className="px-2 py-1">{money(row.fee)}</td><td className="px-2 py-1 font-semibold">{money(row.payment)}</td><td className="px-2 py-1">{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
