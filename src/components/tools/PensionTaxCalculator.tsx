// Moved from Blog 2026-10-27 (W9c). 연금저축·IRP 세액공제(소득세법 제59조의3): 총급여 5,500만(종합소득 4,500만)
// 이하 16.5%, 초과 13.2%(지방소득세 포함), 연금저축 600만·합산 900만 원 한도.
import { useState } from 'react';
import ChoiceChips from './payroll/ChoiceChips';
import NumberField from './payroll/NumberField';

type IncomeType = 'earned' | 'comprehensive';

interface PensionTaxResult {
  ratePercentage: string;
  pensionRecognized: number;
  irpRecognized: number;
  combinedBase: number;
  refundAmount: number;
}

function calcPensionTax(
  incomeType: IncomeType,
  annualIncome: number,
  pensionSavings: number,
  irpDeposit: number
): PensionTaxResult {
  const isLowIncome =
    incomeType === 'earned' ? annualIncome <= 55_000_000 : annualIncome <= 45_000_000;
  const rate = isLowIncome ? 0.165 : 0.132;
  const ratePercentage = isLowIncome ? '16.5%' : '13.2%';

  const pensionRecognized = Math.min(pensionSavings, 6_000_000);
  const combinedBase = Math.min(pensionRecognized + irpDeposit, 9_000_000);
  const irpRecognized = combinedBase - pensionRecognized;
  const refundAmount = Math.floor(combinedBase * rate);

  return { ratePercentage, pensionRecognized, irpRecognized, combinedBase, refundAmount };
}

export default function PensionTaxCalculator({ locale = 'ko' }: { locale?: 'ko' | 'en' }) {
  const ko = locale === 'ko';
  const [incomeType, setIncomeType] = useState<IncomeType>('earned');
  const [income, setIncome] = useState(5000);
  const [pension, setPension] = useState(600);
  const [irp, setIrp] = useState(300);
  const r = calcPensionTax(incomeType, income * 10_000, pension * 10_000, irp * 10_000);
  const unit = ko ? '만원' : '×10,000 KRW';
  const fmt = (n: number) => (ko ? `${Math.round(n).toLocaleString('ko-KR')}원` : `₩${Math.round(n).toLocaleString('en-US')}`);
  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <ChoiceChips
          legend={ko ? '소득 유형' : 'Income type'}
          value={incomeType}
          options={[{ value: 'earned', label: ko ? '근로소득만 (총급여)' : 'Salary only (gross pay)' }, { value: 'comprehensive', label: ko ? '종합소득 (소득금액)' : 'Comprehensive income' }]}
          onChange={setIncomeType}
        />
        <NumberField label={incomeType === 'earned' ? (ko ? '연 총급여' : 'Annual gross pay') : (ko ? '종합소득금액' : 'Comprehensive income')} value={income} onChange={setIncome} suffix={unit} step={100} />
        <NumberField label={ko ? '연금저축 납입액 (연)' : 'Pension savings paid (year)'} value={pension} onChange={setPension} suffix={unit} step={50} />
        <NumberField label={ko ? 'IRP 납입액 (연)' : 'IRP paid (year)'} value={irp} onChange={setIrp} suffix={unit} step={50} />
      </div>
      <div className="space-y-3 rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm">
        <div className="text-xs font-bold text-muted-foreground">{ko ? '예상 세액공제 (지방소득세 포함)' : 'Estimated tax credit (incl. local tax)'}</div>
        <div className="text-3xl font-black text-primary">{fmt(r.refundAmount)}</div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">{ko ? '적용 공제율' : 'Credit rate'}</dt><dd>{r.ratePercentage}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{ko ? '연금저축 인정액 (한도 600만 원)' : 'Pension savings counted (cap 6M)'}</dt><dd>{fmt(r.pensionRecognized)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{ko ? 'IRP 인정액' : 'IRP counted'}</dt><dd>{fmt(r.irpRecognized)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{ko ? '공제 대상 합계 (한도 900만 원)' : 'Total counted (cap 9M)'}</dt><dd>{fmt(r.combinedBase)}</dd></div>
        </dl>
        <p className="text-xs text-muted-foreground">{ko ? '결정세액보다 많이 공제받을 수는 없어요. 낸 세금이 적으면 실제 환급액은 이보다 적어요.' : 'The credit cannot exceed your determined tax, so a low tax bill means a smaller refund.'}</p>
      </div>
    </div>
  );
}
