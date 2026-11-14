import test from 'node:test';
import assert from 'node:assert/strict';
import { valueUnlistedShares, shareClassFor, familyBusinessLimit, familyBusinessInheritance, incorporationConversion, wacc, dcfValuation, dcfSensitivity } from './kr-advisory-2026.ts';

const shareBase = {
  sharesOutstanding: 100_000, netIncome: [600_000_000, 500_000_000, 400_000_000] as [number, number, number],
  netAssets: 3_000_000_000, realEstateRatio: 0.2, heldShares: 60_000, isMajorityHolder: false, premiumExempt: true,
};

test('비상장주식 일반법인 3:2', () => {
  const r = valueUnlistedShares(shareBase);
  // 주당 순손익 6,000·5,000·4,000 → (18,000+10,000+4,000)/6 = 5,333.33 → ÷10% = 53,333
  assert.equal(r.incomeValue, 53_333);
  assert.equal(r.assetValue, 30_000);
  assert.equal(r.blended, Math.floor((53_333 * 3 + 30_000 * 2) / 5)); // 43,999
  assert.equal(r.perShare, 43_999);
  assert.equal(r.total, 43_999 * 60_000);
});

test('부동산과다법인 2:3, 80% 이상 순자산만', () => {
  assert.equal(shareClassFor(0.5), 'realEstateHeavy');
  assert.equal(shareClassFor(0.79), 'realEstateHeavy');
  assert.equal(shareClassFor(0.8), 'netAssetOnly');
  assert.equal(shareClassFor(0.1, true), 'netAssetOnly');
  const heavy = valueUnlistedShares({ ...shareBase, realEstateRatio: 0.6 });
  assert.equal(heavy.blended, Math.floor((53_333 * 2 + 30_000 * 3) / 5));
  assert.equal(valueUnlistedShares({ ...shareBase, realEstateRatio: 0.85 }).perShare, 30_000);
});

test('순손익 음수는 0, 순자산 80% 하한', () => {
  const loss = valueUnlistedShares({ ...shareBase, netIncome: [-900_000_000, 100_000_000, 100_000_000] });
  assert.equal(loss.weighted, 0);
  assert.equal(loss.incomeValue, 0);
  assert.equal(loss.blended, 12_000);
  assert.ok(loss.floorApplied);
  assert.equal(loss.perShare, 24_000);
});

test('최대주주 할증 20%, 중소·중견 제외', () => {
  assert.equal(valueUnlistedShares({ ...shareBase, isMajorityHolder: true, premiumExempt: true }).perShare, 43_999);
  const prem = valueUnlistedShares({ ...shareBase, isMajorityHolder: true, premiumExempt: false });
  assert.ok(prem.premiumApplied);
  assert.equal(prem.perShare, Math.floor(43_999 * 1.2));
});

test('가업상속공제 한도', () => {
  assert.equal(familyBusinessLimit(9), 0);
  assert.equal(familyBusinessLimit(10), 30_000_000_000);
  assert.equal(familyBusinessLimit(20), 40_000_000_000);
  assert.equal(familyBusinessLimit(30), 60_000_000_000);
});

test('가업상속공제 세액 비교', () => {
  const r = familyBusinessInheritance({
    businessValue: 10_000_000_000, unrelatedAssetRatio: 0.1, years: 15, size: 'sme',
    otherEstate: 2_000_000_000, netFinancial: 0, debts: 0, funeralSpent: 0, hasSpouse: false, spouseInherited: 0,
  });
  assert.equal(r.qualifying, 9_000_000_000);
  assert.equal(r.deduction, 9_000_000_000);
  // 공제 없으면: 120억 − 장례 500만 − 일괄 5억 = 114.95억 → ×50% − 4.6억 = 52.875억, 신고공제 3%
  assert.equal(r.without.base, 11_495_000_000);
  assert.equal(r.without.calculated, 5_287_500_000);
  assert.equal(r.without.tax, 5_287_500_000 - 158_625_000);
  // 공제 후: 24.95억 → ×40% − 1.6억 = 8.38억
  assert.equal(r.with.base, 2_495_000_000);
  assert.equal(r.with.calculated, 838_000_000);
  assert.ok(r.saving > 4_000_000_000);
});

test('가업상속공제 대상 아님', () => {
  const r = familyBusinessInheritance({
    businessValue: 5_000_000_000, unrelatedAssetRatio: 0, years: 8, size: 'sme',
    otherEstate: 0, netFinancial: 0, debts: 0, funeralSpent: 0, hasSpouse: true, spouseInherited: 0,
  });
  assert.equal(r.deduction, 0);
  assert.equal(r.saving, 0);
  assert.equal(r.reasons.length, 1);
});

test('법인전환 이월과세·취득세 감면', () => {
  const r = incorporationConversion({
    business: 'general', realEstateMarket: 1_000_000_000, realEstateCost: 400_000_000, holdYears: 10,
    otherAssets: 300_000_000, liabilities: 500_000_000,
  });
  assert.equal(r.minCapital, 800_000_000);
  assert.equal(r.gain, 600_000_000);
  assert.equal(r.longTermRate, 0.2);
  assert.equal(r.base, 600_000_000 - 120_000_000 - 2_500_000);
  assert.equal(r.acquisitionTax, 40_000_000);
  assert.equal(r.relief, 20_000_000);
  assert.equal(r.ruralOnRelief, 4_000_000);
  assert.equal(r.acquisitionNet, 24_000_000);
  assert.ok(r.rolloverEligible);
  const rental = incorporationConversion({ business: 'realEstateRental', realEstateMarket: 1_000_000_000, realEstateCost: 400_000_000, holdYears: 10, otherAssets: 0, liabilities: 0 });
  assert.equal(rental.relief, 0);
  assert.ok(rental.rolloverEligible);
  assert.equal(incorporationConversion({ business: 'consumptionService', realEstateMarket: 1, realEstateCost: 0, holdYears: 5, otherAssets: 0, liabilities: 0 }).deferred, 0);
});

test('WACC', () => {
  const w = wacc({ riskFree: 0.03, beta: 1.2, marketPremium: 0.06, sizePremium: 0.02, preTaxCostOfDebt: 0.05, taxRate: 0.22, debtWeight: 0.3 });
  assert.ok(Math.abs(w.costOfEquity - 0.122) < 1e-12);
  assert.ok(Math.abs(w.wacc - (0.122 * 0.7 + 0.039 * 0.3)) < 1e-12);
});

test('DCF 고든 성장', () => {
  const base = { revenue0: 100, growth: 0.02, ebitMargin: 0.1, taxRate: 0.2, daRatio: 0, capexRatio: 0, nwcRatio: 0, wacc: 0.1, terminalGrowth: 0.02, netDebt: 0, shares: 1, years: 5 };
  const r = dcfValuation(base);
  // 성장 2% 고정이면 FCFF_t = 8 × 1.02^t, 가치 = 8 × 1.02 / (0.1 − 0.02) = 102
  assert.ok(Math.abs(r.enterprise - 102) < 1e-9);
  assert.equal(dcfValuation({ ...base, terminalGrowth: 0.12 }).valid, false);
  const s = dcfSensitivity(base);
  assert.equal(s.length, 5);
  assert.ok(s[0].values[1].perShare > s[4].values[1].perShare);
});
