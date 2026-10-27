// 비영업용 승용자동차 자동차세 (2026). Checked 2026-10-27 against 지방세법 제127조(세율·차령 경감),
// 제128조·시행령 제125조(연납 공제 5%, 잔여기간 일할), 시행령 제122조 제2항(차령), 제151조(지방교육세 30%).
// Seoul 2025 연납 example: 3,342cc 신차 668,400원 → 공제 30,580원.

export type FuelKind = "engine" | "electric";
export type Half = "first" | "second";

export const AUTO_TAX_AS_OF = "2026-10-27";
export const ANNUAL_PAYMENT_RATE = 0.05;
export const EDUCATION_TAX_RATE = 0.3;
export const ELECTRIC_ANNUAL = 100_000;

/** cc당 세액 (비영업용 승용) */
export function perCc(cc: number): number {
  if (cc <= 1000) return 80;
  if (cc <= 1600) return 140;
  return 200;
}

/** 차령: 기산일이 상반기면 두 기분 모두 연도차+1, 하반기면 1기분만 연도차 */
export function carAge(taxYear: number, regYear: number, regHalf: Half, period: 1 | 2): number {
  const diff = taxYear - regYear;
  return regHalf === "second" && period === 1 ? diff : diff + 1;
}

/** 차령 3년 이상이면 (차령-2)×5%, 최대 50% (제127조 제3항) */
export function ageReliefRate(age: number): number {
  return age < 3 ? 0 : Math.min(0.5, (age - 2) * 0.05);
}

const floor10 = (n: number) => Math.floor(n / 10) * 10;

export interface AutoTaxInput { fuel: FuelKind; cc: number; taxYear: number; regYear: number; regHalf: Half }

export function autoTax({ fuel, cc, taxYear, regYear, regHalf }: AutoTaxInput) {
  const full = fuel === "electric" ? ELECTRIC_ANNUAL : Math.max(0, cc) * perCc(cc);
  const periods = ([1, 2] as const).map((period) => {
    const age = carAge(taxYear, regYear, regHalf, period);
    const relief = fuel === "electric" ? 0 : ageReliefRate(age);
    // 하반기에 처음 등록한 해의 1기분은 과세 대상이 아니에요(등록 전 기간).
    return { period, age, relief, tax: age <= 0 ? 0 : floor10((full / 2) * (1 - relief)) };
  });
  const carTax = periods[0].tax + periods[1].tax;
  const educationTax = floor10(carTax * EDUCATION_TAX_RATE);
  return { full, periods, carTax, educationTax, total: carTax + educationTax };
}

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** 연납 공제 대상 일수: 신고납부 달의 다음 달 1일 ~ 12월 31일 */
export function annualPaymentDays(year: number, month: 1 | 3 | 6 | 9): number {
  const start = Date.UTC(year, month, 1);
  const end = Date.UTC(year, 11, 31);
  return Math.round((end - start) / 86_400_000) + 1;
}

/** 연납 공제액 (자동차세 본세 기준, 10원 미만 절사). 지방교육세는 줄어든 본세의 30%로 다시 계산돼요. */
export function annualPaymentCredit(carTax: number, year: number, month: 1 | 3 | 6 | 9): number {
  const daysInYear = isLeap(year) ? 366 : 365;
  return floor10(carTax * (annualPaymentDays(year, month) / daysInYear) * ANNUAL_PAYMENT_RATE);
}
