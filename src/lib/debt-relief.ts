// W5 (2026-10-27): country-specific debt relief tools. Each country's own rules, on its own
// language path only. Checked against official texts on 2026-10-27:
// - KR 채무자회생법 §579 (debt limits, 가용소득), §611⑤ (3 years, up to 5), §614 (청산가치,
//   minimum total when a creditor objects). 기준 중위소득: 보건복지부 table (mohw.go.kr).
// - JP 民事再生法 §221① (5,000万円), §229② (3 years, up to 5), §231②3–4 (最低弁済額).
// - GB gov.uk Debt Relief Orders, IVAs and bankruptcy pages (England and Wales).

export const DEBT_RELIEF_VERIFIED_ON = '2026-10-27';

/* ---------- 🇰🇷 개인회생 ---------- */

// 보건복지부 기준 중위소득 (월, 원), 1~7인 가구.
export const KR_MEDIAN_INCOME: Record<number, readonly number[]> = {
  2026: [2_564_238, 4_199_292, 5_359_036, 6_494_738, 7_556_719, 8_555_952, 9_515_150],
  2027: [2_736_042, 4_480_645, 5_718_091, 6_929_885, 8_063_019, 9_129_201, 10_152_665],
};
export const KR_YEARS = Object.keys(KR_MEDIAN_INCOME).map(Number);
export const KR_UNSECURED_LIMIT = 1_000_000_000; // §579 1호 나목
export const KR_SECURED_LIMIT = 1_500_000_000; // §579 1호 가목
const KR_LIVING_RATIO = 0.6; // 법원 실무: 기준 중위소득 60%

export function krLivingCost(year: number, household: number): number {
  const table = KR_MEDIAN_INCOME[year] ?? KR_MEDIAN_INCOME[KR_YEARS[KR_YEARS.length - 1]];
  const size = Math.min(Math.max(Math.round(household), 1), table.length);
  return Math.round(table[size - 1] * KR_LIVING_RATIO);
}

// §614②3: the total may not be below this when a creditor objects (capped at 30M won).
export function krMinimumTotal(unsecured: number): number {
  const raw = unsecured < 50_000_000 ? unsecured * 0.05 : unsecured * 0.03 + 1_000_000;
  return Math.min(30_000_000, Math.ceil(raw));
}

export type KrRehabStatus = 'over-limit' | 'no-surplus' | 'full' | 'ok' | 'extended' | 'short';

export interface KrRehabInput {
  monthlyIncome: number; // after tax and social insurance
  household: number;
  year: number;
  unsecured: number;
  secured?: number;
  liquidation?: number;
}

export interface KrRehabResult {
  status: KrRehabStatus;
  livingCost: number;
  available: number;
  months: number;
  total: number;
  minimumTotal: number;
  floor: number;
  repayRate: number;
}

export function krRehabEstimate(i: KrRehabInput): KrRehabResult {
  const livingCost = krLivingCost(i.year, i.household);
  const available = Math.max(0, Math.floor(i.monthlyIncome - livingCost));
  const unsecured = Math.max(0, i.unsecured);
  const minimumTotal = krMinimumTotal(unsecured);
  const floor = Math.min(unsecured, Math.max(i.liquidation ?? 0, minimumTotal));
  const base = { livingCost, available, minimumTotal, floor };
  const done = (status: KrRehabStatus, months: number): KrRehabResult => {
    const total = Math.min(unsecured, available * months);
    return { ...base, status, months, total, repayRate: unsecured ? total / unsecured : 0 };
  };
  if (unsecured > KR_UNSECURED_LIMIT || (i.secured ?? 0) > KR_SECURED_LIMIT) return done('over-limit', 0);
  if (available <= 0) return done('no-surplus', 0);
  if (available * 36 >= unsecured) return done('full', Math.ceil(unsecured / available));
  if (available * 36 >= floor) return done('ok', 36);
  const months = Math.ceil(floor / available);
  return months <= 60 ? done('extended', months) : done('short', 60);
}

/* ---------- 🇯🇵 個人再生 ---------- */

export const JP_SMALL_LIMIT = 50_000_000; // §221①

// §231②3–4: 最低弁済額 for 小規模個人再生. null when the debt is over 5,000万円.
export function jpMinimumRepayment(base: number): number | null {
  if (base > JP_SMALL_LIMIT) return null;
  if (base > 30_000_000) return Math.ceil(base / 10);
  if (base < 1_000_000) return Math.max(0, Math.ceil(base));
  return Math.min(3_000_000, Math.max(1_000_000, Math.ceil(base / 5)));
}

export interface JpSaiseiInput {
  base: number; // 基準債権 (住宅ローン・担保で回収できる分を除く)
  liquidation?: number; // 清算価値
  annualDisposable?: number; // 給与所得者等再生: 可処分所得 (1年分)
}

export interface JpSaiseiResult {
  eligible: boolean;
  legalMinimum: number;
  salaryMinimum: number;
  plan: number;
  monthly36: number;
  monthly60: number;
}

export function jpSaiseiEstimate(i: JpSaiseiInput): JpSaiseiResult {
  const legal = jpMinimumRepayment(i.base);
  const salaryMinimum = Math.max(0, Math.ceil((i.annualDisposable ?? 0) * 2));
  if (legal === null) return { eligible: false, legalMinimum: 0, salaryMinimum, plan: 0, monthly36: 0, monthly60: 0 };
  const plan = Math.min(Math.max(i.base, 0), Math.max(legal, i.liquidation ?? 0, salaryMinimum));
  return { eligible: true, legalMinimum: legal, salaryMinimum, plan, monthly36: Math.ceil(plan / 36), monthly60: Math.ceil(plan / 60) };
}

/* ---------- 🇬🇧 England & Wales ---------- */

export const GB_DRO = { debt: 50_000, surplus: 75, assets: 2_000, vehicle: 4_000 } as const;
export const GB_BANKRUPTCY_FEE = 680;

export interface GbDroInput { debt: number; surplus: number; assets: number; vehicle: number; livedOrWorkedEW: boolean }
export interface GbDroResult { checks: Record<'debt' | 'surplus' | 'assets' | 'vehicle' | 'residence', boolean>; eligible: boolean }

// gov.uk: "less than" £50,000 debt, £75 a month spare income, £2,000 assets; vehicle "not worth £4,000 or more".
export function gbDroCheck(i: GbDroInput): GbDroResult {
  const checks = {
    debt: i.debt < GB_DRO.debt,
    surplus: i.surplus < GB_DRO.surplus,
    assets: i.assets < GB_DRO.assets,
    vehicle: i.vehicle < GB_DRO.vehicle,
    residence: i.livedOrWorkedEW,
  };
  return { checks, eligible: Object.values(checks).every(Boolean) };
}
