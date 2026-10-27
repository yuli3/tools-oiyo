import { useMemo, useState } from 'react';
import { KR_YEARS, krRehabEstimate, type KrRehabStatus } from '../../lib/debt-relief';

/* 🇰🇷 개인회생 월 변제금 개략 계산 (W5, 2026-10-27). 생계비는 기준 중위소득 60%(법원 실무),
 * 변제기간 36개월(§611⑤), 청산가치·§614②3 최저 총액을 채우려면 최장 60개월까지 늘려요.
 * 입력값은 저장하거나 보내지 않아요. */

const STATUS: Record<KrRehabStatus, [string, string]> = {
  'over-limit': ['개인회생 채무 한도를 넘어요', '무담보 10억 원, 담보 15억 원 이하여야 개인회생을 신청할 수 있어요(채무자회생법 제579조). 일반회생이나 파산을 상담해 보세요.'],
  'no-surplus': ['생계비를 빼면 남는 소득이 없어요', '갚을 수 있는 돈(가용소득)이 없으면 변제계획을 세우기 어려워요. 파산·면책이나 신용회복위원회 채무조정을 함께 알아보세요.'],
  full: ['36개월 안에 원금을 모두 갚을 수 있어요', '가용소득만으로 무담보 채무를 다 갚을 수 있으면 회생으로 줄어드는 금액이 없어요. 신용회복위원회 채무조정(이자 감면)이 더 맞을 수 있어요.'],
  ok: ['36개월 변제계획이 가능해 보여요', '3년 동안 가용소득 전부를 내면 나머지 채무는 면책 대상이 돼요. 실제 생계비와 기간은 법원이 정해요.'],
  extended: ['36개월보다 길어질 수 있어요', '청산가치(지금 파산하면 채권자가 받을 금액)나 법정 최저 총액을 채우려면 기간을 늘려야 해요. 최장 60개월이에요.'],
  short: ['60개월로도 청산가치를 채우기 어려워요', '재산이 많으면 회생 변제액이 커져요. 재산 처분이나 파산과 비교해 상담받아 보세요.'],
};

export default function KrRehabEstimate() {
  const defaultYear = KR_YEARS.includes(new Date().getFullYear()) ? new Date().getFullYear() : KR_YEARS[0];
  const [year, setYear] = useState(defaultYear);
  const [household, setHousehold] = useState(1);
  const [income, setIncome] = useState('');
  const [unsecured, setUnsecured] = useState('');
  const [secured, setSecured] = useState('');
  const [liquidation, setLiquidation] = useState('');
  const digits = (s: string) => Number(s.replace(/[^0-9]/g, '')) || 0;
  const won = (n: number) => `${new Intl.NumberFormat('ko-KR').format(Math.round(n))}원`;
  const show = (s: string) => (s ? new Intl.NumberFormat('ko-KR').format(digits(s)) : '');
  const r = useMemo(
    () => krRehabEstimate({ monthlyIncome: digits(income), household, year, unsecured: digits(unsecured), secured: digits(secured), liquidation: digits(liquidation) }),
    [income, household, year, unsecured, secured, liquidation],
  );
  const ready = digits(income) > 0 && digits(unsecured) > 0;
  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
  const [title, desc] = STATUS[r.status];
  const good = r.status === 'ok' || r.status === 'extended';

  return (
    <div className="space-y-4">
      <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold">🇰🇷 대한민국 법원 개인회생 기준</span>
      <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">기준 연도
          <select className={field} value={year} onChange={(e) => setYear(Number(e.target.value))}>{KR_YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}</select>
        </label>
        <label className="block text-sm font-medium">가구원 수(본인 포함)
          <select className={field} value={household} onChange={(e) => setHousehold(Number(e.target.value))}>{[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}인{n === 7 ? ' 이상' : ''}</option>)}</select>
        </label>
        <label className="block text-sm font-medium">월 실수령 소득(세금·4대보험 뺀 금액)
          <input inputMode="numeric" className={field} value={show(income)} onChange={(e) => setIncome(e.target.value)} placeholder="예: 2,500,000" />
        </label>
        <label className="block text-sm font-medium">무담보 채무 합계(카드·신용대출 등)
          <input inputMode="numeric" className={field} value={show(unsecured)} onChange={(e) => setUnsecured(e.target.value)} placeholder="예: 50,000,000" />
        </label>
        <label className="block text-sm font-medium">담보 채무(주담대 등, 선택)
          <input inputMode="numeric" className={field} value={show(secured)} onChange={(e) => setSecured(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">청산가치(재산 − 담보 − 압류금지, 선택)
          <input inputMode="numeric" className={field} value={show(liquidation)} onChange={(e) => setLiquidation(e.target.value)} />
        </label>
      </section>
      {ready && (
        <section className={`rounded-2xl border p-4 ${good ? 'border-primary bg-background' : 'border-border bg-muted'}`} aria-live="polite">
          <p className="text-lg font-extrabold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-muted-foreground">인정 생계비({household}인)</dt><dd className="text-right font-mono">{won(r.livingCost)}</dd>
            <dt className="text-muted-foreground">월 변제금(가용소득)</dt><dd className="text-right font-mono text-base font-bold">{won(r.available)}</dd>
            {r.months > 0 && <><dt className="text-muted-foreground">변제기간</dt><dd className="text-right font-mono">{r.months}개월</dd></>}
            {r.months > 0 && <><dt className="text-muted-foreground">총 변제액</dt><dd className="text-right font-mono">{won(r.total)}</dd></>}
            {r.months > 0 && <><dt className="text-muted-foreground">변제율</dt><dd className="text-right font-mono">{(r.repayRate * 100).toFixed(1)}%</dd></>}
            <dt className="text-muted-foreground">채무자회생법 §614②3 최저 총액</dt><dd className="text-right font-mono">{won(r.minimumTotal)}</dd>
          </dl>
        </section>
      )}
    </div>
  );
}
