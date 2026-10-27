// 예금·적금 이자. 단리는 은행 표시 방식(적금은 회차별 남은 개월수만큼 이자), 복리는 월복리.
// 이자소득세 15.4%(소득세 14% + 지방소득세 1.4%). 세금우대종합저축(9.5%)은 2019년 말 폐지돼 기본 선택지에서 뺐다.
export type DepositKind = "deposit" | "savings";

export interface DepositInput {
  kind: DepositKind;
  amount: number; // 예금은 목돈, 적금은 월 납입액
  annualRate: number; // 0.035 = 3.5%
  months: number;
  compound: boolean;
  taxRate: number; // 0.154, 0, 또는 직접 입력
}

export interface DepositResult {
  principal: number;
  interest: number;
  tax: number;
  afterTaxInterest: number;
  total: number;
}

export function depositInterest({ kind, amount, annualRate, months, compound, taxRate }: DepositInput): DepositResult | null {
  if (!(amount > 0) || !(annualRate >= 0) || !(months >= 1) || !Number.isInteger(months) || !(taxRate >= 0 && taxRate < 1)) return null;
  const m = annualRate / 12;
  let principal: number;
  let interest: number;
  if (kind === "deposit") {
    principal = amount;
    interest = compound ? amount * ((1 + m) ** months - 1) : amount * m * months;
  } else {
    principal = amount * months;
    interest = compound
      ? m === 0 ? 0 : (amount * (1 + m) * ((1 + m) ** months - 1)) / m - principal
      : amount * ((months * (months + 1)) / 2) * m;
  }
  interest = Math.floor(interest);
  // 소득세·지방소득세 모두 10원 미만 절사
  const cut10 = (n: number) => Math.floor(n / 10 + 1e-9) * 10;
  let tax: number;
  if (taxRate === 0.154) {
    const incomeTax = cut10(interest * 0.14);
    tax = incomeTax + cut10(incomeTax * 0.1);
  } else {
    tax = cut10(interest * taxRate);
  }
  return { principal, interest, tax, afterTaxInterest: interest - tax, total: principal + interest - tax };
}
