import { useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { earnedIncomeDeduction, KR_RATES_2026 } from '../../lib/kr-rates-2026.mjs';
import { FINANCIAL_THRESHOLD, financialIncomeTax } from '../../lib/kr-investment-tax';

/* Interest and dividends: separate (15.4%) or comprehensive taxation, under 소득세법 §62.
 * Replaces blog.oiyo.net/{locale}/separate-vs-comprehensive-tax-calculator/ (2026-10-27, W4).
 * The Blog version let readers "choose" a method; above 20M won the law decides, so this one
 * shows both §62 amounts and the larger one. */

const L = {
  ko: {
    korea: '대한민국 소득세 기준', fin: '이자·배당 합계(세전, 1년)', mode: '다른 소득 입력 방식', salary: '총급여로 추정', base: '과세표준 직접 입력',
    gross: '총급여(연)', persons: '기본공제 인원(본인 포함)', baseLabel: '다른 종합소득 과세표준', estBase: '추정 과세표준',
    sep: '2천만 원 이하라 분리과세로 끝나요. 원천징수 15.4%만 내고 5월 신고에 넣지 않아요.',
    comp: '2천만 원을 넘어 종합과세 대상이에요. 아래 두 방식 중 큰 금액이 산출세액이에요(소득세법 제62조).',
    m1: '① 초과분을 다른 소득과 합산 + 2천만 원 × 14%', m2: '② 금융소득 전체 × 14% + 다른 소득 세액', calc: '산출세액(큰 쪽)',
    withheld: '이미 원천징수된 세금(지방세 포함)', extra: '5월에 더 낼 세금(지방세 포함)', none: '더 낼 세금이 없어요. 원천징수로 충분해요.',
    estNote: '총급여 추정은 근로소득공제와 1인당 150만 원 기본공제만 뺐어요. 4대보험·카드 공제를 빼면 과세표준이 더 낮아져요.',
  },
  en: {
    korea: 'Korean income tax rules', fin: 'Interest and dividends (gross, one year)', mode: 'Other income', salary: 'Estimate from salary', base: 'Enter tax base',
    gross: 'Annual salary', persons: 'Basic deduction persons (incl. you)', baseLabel: 'Tax base of other income', estBase: 'Estimated tax base',
    sep: 'At or under 20M won it stays separately taxed: the 15.4% withheld is final.',
    comp: 'Above 20M won it joins comprehensive taxation. The calculated tax is the larger of the two methods below (Income Tax Act art. 62).',
    m1: '① Excess added to other income + 20M × 14%', m2: '② All financial income × 14% + tax on other income', calc: 'Calculated tax (larger)',
    withheld: 'Already withheld (incl. local tax)', extra: 'Extra due in May (incl. local tax)', none: 'Nothing more to pay; withholding covers it.',
    estNote: 'The salary estimate only subtracts the earned income deduction and 1.5M won per person. Insurance and card deductions lower the base further.',
  },
};

export default function FinancialIncomeTax({ locale }: { locale: Locale }) {
  const lang = locale === 'ko' ? 'ko' : 'en';
  const t = L[lang];
  const fmt = (n: number) => `${new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US').format(n)}${lang === 'ko' ? '원' : ' won'}`;
  const [finText, setFinText] = useState('30000000');
  const [mode, setMode] = useState<'salary' | 'base'>('salary');
  const [grossText, setGrossText] = useState('70000000');
  const [persons, setPersons] = useState('1');
  const [baseText, setBaseText] = useState('50000000');
  const digits = (s: string) => Number(s.replace(/[^0-9]/g, '')) || 0;

  const fin = digits(finText);
  const gross = digits(grossText);
  const people = Math.max(1, Math.min(20, Number.parseInt(persons, 10) || 1));
  const otherBase = mode === 'salary'
    ? Math.max(0, gross - earnedIncomeDeduction(gross) - KR_RATES_2026.incomeTax.personalDeductionPerPerson * people)
    : digits(baseText);
  const r = useMemo(() => financialIncomeTax(fin, otherBase), [fin, otherBase]);
  const withheldTotal = r.withheld + Math.floor(r.withheld * KR_RATES_2026.incomeTax.localIncomeTaxRate);

  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
  const money = (v: string, set: (s: string) => void) => <input inputMode="numeric" className={field} value={v ? new Intl.NumberFormat('ko-KR').format(digits(v)) : ''} onChange={(e) => set(e.target.value)} />;

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold">🇰🇷 {t.korea}</span>
        <label className="block text-sm font-semibold">{t.fin}{money(finText, setFinText)}</label>
        <fieldset>
          <legend className="text-sm font-semibold">{t.mode}</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {(['salary', 'base'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium ${mode === m ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>{t[m]}</button>
            ))}
          </div>
        </fieldset>
        {mode === 'salary' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">{t.gross}{money(grossText, setGrossText)}</label>
            <label className="block text-sm font-medium">{t.persons}<input inputMode="numeric" className={field} value={persons} onChange={(e) => setPersons(e.target.value)} /></label>
            <p className="text-sm sm:col-span-2"><span className="text-muted-foreground">{t.estBase}: </span><span className="font-mono font-semibold">{fmt(otherBase)}</span></p>
          </div>
        ) : (
          <label className="block text-sm font-medium">{t.baseLabel}{money(baseText, setBaseText)}</label>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-muted p-4">
        <p className="text-sm font-semibold">{r.comprehensive ? t.comp : t.sep}</p>
        {r.comprehensive && (
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.m1}</dt><dd className="font-mono">{fmt(r.method1)}</dd></div>
            <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.m2}</dt><dd className="font-mono">{fmt(r.method2)}</dd></div>
            <div className="flex flex-wrap justify-between gap-x-3 font-semibold"><dt>{t.calc}</dt><dd className="font-mono">{fmt(r.calculated)}</dd></div>
          </dl>
        )}
        <dl className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.withheld}</dt><dd className="font-mono">{fmt(withheldTotal)}</dd></div>
          {r.comprehensive && (
            <div className="flex flex-wrap items-baseline justify-between gap-x-3"><dt className="font-semibold">{t.extra}</dt><dd className="font-mono text-xl font-extrabold text-primary">{fmt(r.extraTotal)}</dd></div>
          )}
        </dl>
        {r.comprehensive && r.extraTotal === 0 && <p className="mt-2 text-sm text-muted-foreground">{t.none}</p>}
        <p className="mt-3 text-xs text-muted-foreground">{fmt(FINANCIAL_THRESHOLD)} · 14% + 1.4%</p>
      </section>
      {mode === 'salary' && <p className="text-xs text-muted-foreground">{t.estNote}</p>}
    </div>
  );
}
