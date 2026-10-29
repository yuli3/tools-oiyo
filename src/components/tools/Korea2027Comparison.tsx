import { useState } from 'react';
import { minimumPayComparison, proposedWithholdingComparison } from '../../lib/kr-2027-comparison';
import { KR_RATES_2027 } from '../../lib/kr-rates-2027.mjs';
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
export default function Korea2027Comparison({ mode }: { mode: 'wage' | 'withholding' }) {
  const wage = mode === 'wage';
  const [value, setValue] = useState(wage ? '209' : '3000000');
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<{ before: number; after: number; difference: number } | null>(null);
  const [error, setError] = useState('');
  const clear = () => { setResult(null); setError(''); };
  return <section className="mt-6 rounded-xl border border-border bg-card p-4" aria-labelledby={`kr2027-${mode}`}>
    <h2 id={`kr2027-${mode}`} className="text-lg font-semibold">{wage ? '2026·2027 최저임금 비교' : '정부안 3.3%·2.2% 원천징수 비교'}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{wage ? '한국 최저임금 시급에 같은 월 유급시간을 곱해요. 209시간은 주 40시간 근무의 월 환산 예시이며 모든 근로자의 월급이 아니에요. 기존 시급이 자동으로 인상된다는 뜻도 아니에요.' : '한국 인적용역 사업소득의 정부 개정안 시나리오예요. 국회 통과·공포를 확인한 시행 계산이 아니며, 보험·방문·음료품 배달 판매원 등 연말정산 사업소득과 외국인 프로선수 계약 소득 등은 적용 범위에서 제외돼요.'}</p>
    <form className="mt-3 space-y-3" onSubmit={e => {
      e.preventDefault(); clear();
      try {
        if (!value.trim()) throw new Error('빈칸을 0으로 계산하지 않아요. 값을 입력해 주세요.');
        if (!wage && !confirmed) throw new Error('정부안 적용 범위 안내를 먼저 확인해 주세요.');
        setResult(wage ? minimumPayComparison(Number(value)) : proposedWithholdingComparison(Number(value)));
      } catch (err) { setError(err instanceof Error ? err.message : '입력을 확인해 주세요.'); }
    }}>
      <label className="block text-sm">{wage ? '월 유급시간 (시간)' : '월 세전 지급액 (원)'}<input className="mt-1 min-h-11 w-full rounded-lg border border-input bg-background px-3" type="number" min="0" max={wage ? 744 : 1000000000} step={wage ? '0.01' : '1'} value={value} onChange={e => { setValue(e.target.value); clear(); }} required /></label>
      {!wage && <label className="flex min-h-11 items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={confirmed} onChange={e => { setConfirmed(e.target.checked); clear(); }} />정부안 가정이며 제외 대상이 있음을 확인했어요. 실제 적용 자격을 판정하는 기능이 아니에요.</label>}
      <button className="min-h-11 rounded-lg bg-primary px-4 py-2 text-primary-foreground" type="submit">{wage ? '최저임금 가정 비교' : '정부안 현금흐름 비교'}</button>
    </form>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    {result && <div className="mt-4 space-y-2" role="status" aria-live="polite">
      <p className="font-semibold">{wage ? '같은 유급시간에서 월 환산 차이' : '동일 지급액에서 먼저 받는 금액 차이'}: {won(result.difference)}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg bg-muted p-3"><dt>{wage ? '2026 최저임금 기준' : '3.3% 원천징수'}</dt><dd className="font-semibold">{won(result.before)}</dd></div><div className="rounded-lg bg-muted p-3"><dt>{wage ? '2027 최저임금 기준' : '정부안 2.2% 원천징수'}</dt><dd className="font-semibold">{won(result.after)}</dd></div></dl>
      {!wage && <p className="text-sm">원천징수 감소 → 수령 시 현금 증가 → 최종 세액이 같다면 정산 때 환급 감소 또는 추가 납부 증가. 이 비교는 종합소득세 최종 세액을 계산하지 않아요.</p>}
      <p className="text-xs text-muted-foreground">원 단위 반올림 산술 예시예요. 실제 공제·지급 단위와 적용조건은 별도 확인해 주세요.</p>
    </div>}
    {wage && <details className="mt-3 text-sm"><summary className="min-h-11 cursor-pointer py-2">2027 보험료는 어디까지 확인됐나요?</summary><p>국민연금 총 10%·근로자 5%·사용자 5%는 공단 안내로 확인했어요. 건강보험 총 7.19% 동결 결정 발표도 확인했어요. 시행 규정·장기요양·고용보험·일부 상하한 검토가 남아 2027 실수령액 계산을 제공하지 않아요.</p><p className="mt-2"><a className="text-primary underline" href={KR_RATES_2027.insuranceEvidence.nationalPension.sourceUrl}>국민연금공단 연도별 표</a> · <a className="text-primary underline" href={KR_RATES_2027.insuranceEvidence.healthInsurance.sourceUrl}>보건복지부 건정심 발표</a></p></details>}
    <p className="mt-3 text-xs text-muted-foreground">확인일 2026-10-29 · <a className="text-primary underline" href={wage ? KR_RATES_2027.minimumWage.sourceUrl : KR_RATES_2027.freelancerProposal.sourceUrl}>{wage ? '최저임금 공식 자료' : '법제처 소득세법 개정안 입법예고'}</a></p>
  </section>;
}
