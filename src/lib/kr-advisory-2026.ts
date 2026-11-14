// 세무·회계 실무자용 계산 엔진 (2026). Checked 2026-11-14.
// 네 가지를 한 파일에 둬요. api 저장소가 이 파일을 그대로 복사해 MCP 도구로 내보내요.
//
// 1) 비상장주식 보충적 평가: 상속세 및 증여세법 제63조 제1항 제1호 나목·제3항,
//    시행령 제54조(순손익가치 3 : 순자산가치 2, 부동산 등 비율 50% 이상이면 2 : 3,
//    순자산가치 80% 하한, 제4항 순자산가치만 평가), 제56조(최근 3년 가중 3·2·1, 음수면 0),
//    시행규칙 제17조(순손익가치환원율 10%), 시행령 제53조 제6항~제8항(최대주주 할증 20% 제외:
//    중소기업, 직전 3년 평균 매출 5천억 원 미만 중견기업, 3년 연속 결손 등).
//    2024·2026 세법개정안의 할증 폐지는 국회를 통과하지 않아 반영하지 않아요.
// 2) 가업상속공제: 상증법 제18조의2 제1항(10년 이상 300억, 20년 이상 400억, 30년 이상 600억 원),
//    제21조(일괄공제 5억 원과 별도로 더해요), 제19조·제22조·제24조(공제 적용 한도), 제26조, 제69조.
//    2026-08-03 세제개편안(2027-07-01 상속분부터 한도·사후관리 개편)은 정부안이라 반영하지 않아요.
// 3) 개인사업자 법인전환: 조세특례제한법 제32조(양도소득세 이월과세, 일몰 없음, 자본금 ≥ 순자산가액,
//    소비성서비스업·주택 제외, 5년 사후관리), 시행령 제29조 제5항(순자산가액),
//    지방세특례제한법 제57조의2 제4항(취득세 50% 감면, 2027-12-31 취득분까지, 부동산임대·공급업 제외),
//    농어촌특별세법 제5조 제1항 제1호(감면세액의 20%).
// 4) DCF(현금흐름할인) 기업가치: 법령이 아니라 일반적인 FCFF·고든 성장 모형이에요.
import { basicIncomeTax, financialAssetDeduction, funeralDeduction, inheritanceGiftProgressiveTax, spouseInheritanceDeduction, filingCredit } from "./kr-payroll-2026.ts";

export const ADVISORY_AS_OF = "2026-11-14";
const EOK = 100_000_000;
const floor10 = (n: number) => Math.floor(Math.round(n) / 10) * 10;
const nz = (n: number) => (Number.isFinite(n) ? n : 0);

// ───────────────────────── 1. 비상장주식 보충적 평가 ─────────────────────────

export const CAPITALIZATION_RATE = 0.1;
export const NET_ASSET_FLOOR = 0.8;
export const CONTROL_PREMIUM = 0.2;

export type ShareClass = "general" | "realEstateHeavy" | "netAssetOnly";

export interface UnlistedShareInput {
  /** 발행주식총수(자기주식 제외) */
  sharesOutstanding: number;
  /** 사업연도별 순손익액 [평가기준일 이전 1년, 2년, 3년] (법인 전체 금액) */
  netIncome: [number, number, number];
  /** 평가기준일 순자산가액(상증법 시가 기준 자산 − 부채) */
  netAssets: number;
  /** 순자산가액에 더할 영업권 평가액(시행령 제59조 제2항). 없으면 0. */
  goodwill?: number;
  /** 자산총액 중 부동산 등(토지·건물·부동산 권리) 비율, 0~1 */
  realEstateRatio: number;
  /** 시행령 제54조 제4항 사유(사업개시 3년 미만, 휴·폐업·청산 중, 주식 등 비율 80% 이상 등) */
  netAssetOnlyReason?: boolean;
  /** 평가 대상 보유 주식 수 */
  heldShares: number;
  /** 최대주주 등에 해당 */
  isMajorityHolder: boolean;
  /** 할증 제외(중소기업, 직전 3년 평균 매출 5천억 원 미만 중견기업, 3년 연속 결손 등: 시행령 제53조 제8항) */
  premiumExempt: boolean;
}

export function shareClassFor(realEstateRatio: number, netAssetOnlyReason = false): ShareClass {
  if (netAssetOnlyReason || realEstateRatio >= 0.8) return "netAssetOnly";
  if (realEstateRatio >= 0.5) return "realEstateHeavy";
  return "general";
}

export function valueUnlistedShares(input: UnlistedShareInput) {
  const shares = Math.max(1, Math.floor(nz(input.sharesOutstanding)));
  const perShareIncome = input.netIncome.map((v) => nz(v) / shares) as [number, number, number];
  const weightedRaw = (perShareIncome[0] * 3 + perShareIncome[1] * 2 + perShareIncome[2]) / 6;
  const weighted = Math.max(0, weightedRaw); // 시행령 제56조 제1항: 음수면 0
  const incomeValue = Math.floor(weighted / CAPITALIZATION_RATE);
  const assetValue = Math.floor((nz(input.netAssets) + Math.max(0, nz(input.goodwill ?? 0))) / shares);
  const shareClass = shareClassFor(nz(input.realEstateRatio), input.netAssetOnlyReason);
  let blended: number;
  if (shareClass === "netAssetOnly") blended = assetValue;
  else if (shareClass === "realEstateHeavy") blended = Math.floor((incomeValue * 2 + assetValue * 3) / 5);
  else blended = Math.floor((incomeValue * 3 + assetValue * 2) / 5);
  const floorValue = Math.floor(Math.max(0, assetValue) * NET_ASSET_FLOOR);
  const floorApplied = shareClass !== "netAssetOnly" && blended < floorValue;
  const basePerShare = Math.max(0, floorApplied ? floorValue : blended);
  const premiumApplied = input.isMajorityHolder && !input.premiumExempt;
  const perShare = Math.floor(basePerShare * (premiumApplied ? 1 + CONTROL_PREMIUM : 1));
  const held = Math.max(0, Math.floor(nz(input.heldShares)));
  return {
    shares, perShareIncome, weightedRaw, weighted, incomeValue, assetValue, shareClass,
    blended, floorValue, floorApplied, basePerShare, premiumApplied, perShare, held, total: perShare * held,
  };
}

// ───────────────────────── 2. 가업상속공제 ─────────────────────────

export type BusinessSize = "sme" | "midsize" | "ineligible";

/** 제18조의2 제1항 한도. 10년 미만이면 0. */
export function familyBusinessLimit(years: number): number {
  const y = Math.floor(nz(years));
  if (y >= 30) return 600 * EOK;
  if (y >= 20) return 400 * EOK;
  if (y >= 10) return 300 * EOK;
  return 0;
}

export interface FamilyBusinessInput {
  /** 가업 주식(또는 개인가업 사업용 자산) 평가액 */
  businessValue: number;
  /** 법인 총자산 중 사업무관자산 비율 0~1 (가업상속재산 = 주식가액 × (1 − 비율)). 개인가업이면 0. */
  unrelatedAssetRatio: number;
  /** 피상속인 가업 영위 기간(년) */
  years: number;
  size: BusinessSize;
  /** 가업 외 상속재산(부동산·금융 등) */
  otherEstate: number;
  /** 그중 순금융재산(금융재산상속공제 대상) */
  netFinancial: number;
  debts: number;
  funeralSpent: number;
  hasSpouse: boolean;
  /** 배우자가 실제 상속받는 금액 */
  spouseInherited: number;
}

function inheritanceTaxFor(gross: number, debts: number, funeral: number, extraDeduction: number, i: FamilyBusinessInput) {
  const taxableEstate = Math.max(0, gross - debts - funeral); // 과세가액
  const lump = 5 * EOK; // 제21조 일괄공제(기초 2억 + 인적공제와 5억 중 큰 금액, 여기서는 5억)
  const spouse = i.hasSpouse ? spouseInheritanceDeduction(i.spouseInherited) : 0;
  const financial = financialAssetDeduction(i.netFinancial);
  const wanted = lump + spouse + financial + extraDeduction;
  const deductions = Math.min(wanted, taxableEstate); // 제24조 공제 적용 한도(사전증여·유증 차감은 미반영)
  const base = Math.max(0, taxableEstate - deductions);
  const calculated = inheritanceGiftProgressiveTax(base);
  const credit = filingCredit(calculated);
  return { taxableEstate, lump, spouse, financial, deductions, base, calculated, credit, tax: calculated - credit };
}

export function familyBusinessInheritance(i: FamilyBusinessInput) {
  const businessValue = Math.max(0, nz(i.businessValue));
  const ratio = Math.min(1, Math.max(0, nz(i.unrelatedAssetRatio)));
  const qualifying = Math.floor(businessValue * (1 - ratio)); // 가업상속재산가액
  const limit = i.size === "ineligible" ? 0 : familyBusinessLimit(i.years);
  const deduction = Math.min(qualifying, limit);
  const gross = businessValue + Math.max(0, nz(i.otherEstate));
  const debts = Math.max(0, nz(i.debts));
  const funeral = funeralDeduction(i.funeralSpent);
  const without = inheritanceTaxFor(gross, debts, funeral, 0, i);
  const withDeduction = inheritanceTaxFor(gross, debts, funeral, deduction, i);
  return {
    qualifying, limit, deduction, gross, funeral, without, with: withDeduction, saving: without.tax - withDeduction.tax,
    reasons: [
      i.size === "ineligible" ? "중소기업이나 직전 3년 평균 매출 5천억 원 미만 중견기업이 아니면 공제할 수 없어요." : null,
      Math.floor(nz(i.years)) < 10 ? "피상속인이 10년 이상 계속 경영해야 해요." : null,
      i.size === "midsize" ? "중견기업은 상속인의 가업 외 상속재산이 그 상속인이 낼 상속세의 2배를 넘으면 공제를 못 받아요(제18조의2 제2항)." : null,
    ].filter((x): x is string => x !== null),
  };
}

// ───────────────────────── 3. 개인사업자 법인전환 ─────────────────────────

export type ConversionBusiness = "general" | "realEstateRental" | "consumptionService";

export const ACQUISITION_RATE_NONHOUSE = 0.04;
export const ACQUISITION_RELIEF_RATE = 0.5; // 지특법 제57조의2 제4항, 2025-01-01 ~ 2027-12-31 취득분
export const ACQUISITION_RELIEF_UNTIL = "2027-12-31";
export const RURAL_TAX_ON_RELIEF = 0.2;

export interface ConversionInput {
  business: ConversionBusiness;
  /** 사업용 부동산(토지·건물) 시가. 주택은 넣지 않아요(이월과세 제외). */
  realEstateMarket: number;
  /** 그 부동산의 취득가액 + 필요경비 */
  realEstateCost: number;
  holdYears: number;
  /** 부동산 외 사업용 자산 시가(재고·기계·채권·현금 등) */
  otherAssets: number;
  /** 사업 관련 부채(충당금 포함) */
  liabilities: number;
  /** 취득세 과세표준(보통 시가인정액). 0이면 부동산 시가를 써요. */
  acquisitionBase?: number;
}

export function incorporationConversion(i: ConversionInput) {
  const market = Math.max(0, nz(i.realEstateMarket));
  const netAssets = market + Math.max(0, nz(i.otherAssets)) - Math.max(0, nz(i.liabilities));
  const minCapital = Math.max(0, netAssets); // 조특법 제32조 제2항, 시행령 제29조 제5항
  const gain = Math.max(0, market - Math.max(0, nz(i.realEstateCost)));
  const y = Math.floor(Math.max(0, nz(i.holdYears)));
  const longTermRate = y < 3 ? 0 : Math.min(0.3, 0.06 + (y - 3) * 0.02); // 소득세법 제95조 표1
  const longTerm = Math.floor(gain * longTermRate);
  const base = Math.max(0, gain - longTerm - 2_500_000);
  const progressive = basicIncomeTax(base);
  const shortRate = nz(i.holdYears) < 1 ? 0.5 : nz(i.holdYears) < 2 ? 0.4 : 0;
  const cgt = floor10(Math.max(progressive, base * shortRate));
  const cgtLocal = floor10(cgt * 0.1);
  const rolloverEligible = i.business !== "consumptionService";
  const acqBase = nz(i.acquisitionBase ?? 0) > 0 ? nz(i.acquisitionBase!) : market;
  const acquisitionTax = floor10(acqBase * ACQUISITION_RATE_NONHOUSE);
  const reliefEligible = i.business === "general";
  const relief = reliefEligible ? floor10(acquisitionTax * ACQUISITION_RELIEF_RATE) : 0;
  const ruralOnRelief = floor10(relief * RURAL_TAX_ON_RELIEF);
  return {
    netAssets, minCapital, gain, longTermRate, longTerm, base, cgt, cgtLocal, cgtTotal: cgt + cgtLocal,
    rolloverEligible, deferred: rolloverEligible ? cgt + cgtLocal : 0,
    acqBase, acquisitionTax, reliefEligible, relief, ruralOnRelief, acquisitionNet: acquisitionTax - relief + ruralOnRelief,
  };
}

// ───────────────────────── 4. DCF 기업가치 ─────────────────────────

export interface WaccInput {
  riskFree: number; beta: number; marketPremium: number; sizePremium: number;
  preTaxCostOfDebt: number; taxRate: number; debtWeight: number;
}

export function wacc(i: WaccInput) {
  const costOfEquity = nz(i.riskFree) + nz(i.beta) * nz(i.marketPremium) + nz(i.sizePremium);
  const afterTaxDebt = nz(i.preTaxCostOfDebt) * (1 - nz(i.taxRate));
  const d = Math.min(1, Math.max(0, nz(i.debtWeight)));
  return { costOfEquity, afterTaxDebt, wacc: costOfEquity * (1 - d) + afterTaxDebt * d };
}

export interface DcfInput {
  revenue0: number;
  /** 1년차 매출성장률. 마지막 해까지 terminalGrowth로 선형 수렴해요. */
  growth: number;
  ebitMargin: number;
  taxRate: number;
  /** 매출 대비 감가상각비 */
  daRatio: number;
  /** 매출 대비 자본적 지출 */
  capexRatio: number;
  /** 매출 증가분 대비 순운전자본 증가 */
  nwcRatio: number;
  wacc: number;
  terminalGrowth: number;
  netDebt: number;
  shares: number;
  years?: number;
  /** 기중 할인(mid-year convention) */
  midYear?: boolean;
}

export function dcfValuation(i: DcfInput) {
  const n = Math.min(10, Math.max(3, Math.floor(i.years ?? 5)));
  const rows: { year: number; growth: number; revenue: number; ebit: number; nopat: number; da: number; capex: number; dNwc: number; fcff: number; discount: number; pv: number }[] = [];
  let prev = Math.max(0, nz(i.revenue0));
  for (let t = 1; t <= n; t++) {
    const g = n === 1 ? i.growth : i.growth + ((i.terminalGrowth - i.growth) * (t - 1)) / (n - 1);
    const revenue = prev * (1 + g);
    const ebit = revenue * i.ebitMargin;
    const nopat = ebit * (1 - i.taxRate);
    const da = revenue * i.daRatio;
    const capex = revenue * i.capexRatio;
    const dNwc = (revenue - prev) * i.nwcRatio;
    const fcff = nopat + da - capex - dNwc;
    const period = i.midYear ? t - 0.5 : t;
    const discount = 1 / Math.pow(1 + i.wacc, period);
    rows.push({ year: t, growth: g, revenue, ebit, nopat, da, capex, dNwc, fcff, discount, pv: fcff * discount });
    prev = revenue;
  }
  const valid = i.wacc > i.terminalGrowth;
  const last = rows[rows.length - 1];
  const terminalFcff = last.fcff * (1 + i.terminalGrowth);
  const terminalValue = valid ? terminalFcff / (i.wacc - i.terminalGrowth) : NaN;
  const terminalPv = terminalValue / Math.pow(1 + i.wacc, i.midYear ? n - 0.5 : n);
  const pvSum = rows.reduce((s, r) => s + r.pv, 0);
  const enterprise = pvSum + terminalPv;
  const equity = enterprise - nz(i.netDebt);
  const shares = Math.max(1, nz(i.shares));
  return { rows, valid, terminalValue, terminalPv, pvSum, enterprise, equity, perShare: equity / shares, terminalShare: terminalPv / enterprise };
}

/** WACC × 영구성장률 민감도 표(주당가치). */
export function dcfSensitivity(i: DcfInput, waccSteps = [-0.01, -0.005, 0, 0.005, 0.01], growthSteps = [-0.005, 0, 0.005]) {
  return waccSteps.map((dw) => ({
    wacc: i.wacc + dw,
    values: growthSteps.map((dg) => {
      const r = dcfValuation({ ...i, wacc: i.wacc + dw, terminalGrowth: i.terminalGrowth + dg });
      return { growth: i.terminalGrowth + dg, perShare: r.valid ? r.perShare : NaN };
    }),
  }));
}
