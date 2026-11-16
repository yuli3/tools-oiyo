// 한국 세금 계산기(1묶음)의 가정 목록·다리 단계·쉬운 결과 문장 (2026-11-16).
// 계산은 각 엔진 파일이 하고, 여기는 "무엇을 바꿔 볼 수 있고 어떻게 설명할지"만 정해요.
import { compareIncorporation } from "./kr-incorporation-2026.ts";
import { acquisitionTax, capitalGainsTax, HIGH_PRICE_LINE, propertyTax, BASIC_DEDUCTION, type AcquisitionInput, type GainsInput } from "./kr-real-estate-tax.ts";
import { comprehensiveIncomeTax, freelancerSettlement, simpleExpense } from "./kr-income-tax-2026.ts";
import { INHERITANCE_GIFT_2026 as IG, filingCredit, financialAssetDeduction, funeralDeduction, inheritanceGiftProgressiveTax, spouseInheritanceDeduction } from "./kr-payroll-2026.ts";
import { retirementIncomeTax } from "./kr-retirement-tax.ts";
import { computeMonthlyInsurance, computeSalaryBreakdownWon } from "./finance/salary-calculator.ts";
import { settleYearEnd, type YearEndInput } from "./kr-year-end-2026.ts";
import { fixedRange, josa, moneyRange, roughWon, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

export const driverLine = (top: TornadoBar | undefined, what: string) =>
  top && top.span > 0
    ? `결과를 가장 크게 움직이는 건 ${josa(top.plain, "이에요", "예요")}. 이 값이 20% 늘거나 줄면 ${josa(what, "이", "가")} 약 ${roughWon(Math.min(top.low, top.high))}에서 ${roughWon(Math.max(top.low, top.high))} 사이로 바뀌어요.`
    : null;

export const moneyAssumption = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, opts: { kind?: "fact" | "assumption"; signed?: boolean } = {}): Assumption<I> => ({
  key, label, plain, unit: "won", kind: opts.kind ?? "assumption", get, set,
  range: (anchor) => moneyRange(anchor, { signed: opts.signed }),
});

// ───────────────────────── 퇴직소득세 ─────────────────────────

export interface RetirementInput {
  gross: number;
  years: number;
}

export const retirementNet = (i: RetirementInput) => retirementIncomeTax(i.gross, i.years).netPayout;

export const RETIREMENT_ASSUMPTIONS: Assumption<RetirementInput>[] = [
  moneyAssumption("gross", "세전 퇴직금", "받을 퇴직금(세금 떼기 전)", (i) => i.gross, (i, v) => ({ ...i, gross: Math.max(0, v) })),
  {
    key: "years", label: "근속연수", plain: "일한 기간", unit: "years", kind: "fact",
    get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 40),
    marks: [
      { at: 5, label: "5년" },
      { at: 10, label: "10년" },
      { at: 20, label: "20년" },
    ],
  },
];

export function retirementBridge(i: RetirementInput): BridgeStep[] {
  const r = retirementIncomeTax(i.gross, i.years);
  return [
    { label: "세전 퇴직금", value: r.gross, kind: "total" },
    { label: "퇴직소득세", value: -r.nationalTax, kind: "add" },
    { label: "지방소득세(10%)", value: -r.localTax, kind: "add" },
    { label: "실제 받는 돈", value: r.netPayout, kind: "total" },
  ];
}

export function retirementPlain(i: RetirementInput, top?: TornadoBar) {
  const r = retirementIncomeTax(i.gross, i.years);
  const headline = `퇴직금 ${roughWon(r.gross)} 중 세금 약 ${roughWon(r.totalTax)}을 떼고 약 ${roughWon(r.netPayout)}을 받아요(추정, 실제 세율 ${r.effectiveTaxRate.toFixed(1)}%).`;
  const reasons = [
    `오래 일할수록 빼 주는 금액(근속연수공제 ${roughWon(r.serviceDeduction)})이 커져서 세금이 줄어요.`,
    "퇴직금을 IRP 계좌로 옮겨 연금으로 나눠 받으면 이 세금의 30%(10년 넘게 나눠 받으면 그 뒤로 40%)가 줄어요.",
  ];
  return { headline, driver: driverLine(top, "실제 받는 돈"), reasons };
}

// ───────────────────────── 개인사업자 vs 법인 ─────────────────────────

export interface IncorporationInput {
  revenue: number;
  expenses: number;
  salary: number;
  realEstate: boolean;
}

const cmp = (i: IncorporationInput) => compareIncorporation(Math.max(0, i.revenue - i.expenses), i.salary, i.realEstate);
/** 법인(배당까지)이 개인보다 아끼는 연 세금. 음수면 개인이 유리해요. */
export const incorporationSaving = (i: IncorporationInput) => {
  const r = cmp(i);
  return r.sole.total - r.corpPayout;
};

export const INCORPORATION_ASSUMPTIONS: Assumption<IncorporationInput>[] = [
  moneyAssumption("revenue", "연 매출", "1년 매출", (i) => i.revenue, (i, v) => ({ ...i, revenue: Math.max(0, v) })),
  moneyAssumption("expenses", "연 필요경비", "1년 비용(대표 급여 빼고)", (i) => i.expenses, (i, v) => ({ ...i, expenses: Math.max(0, v) })),
  moneyAssumption("salary", "대표 연봉", "법인에서 받을 내 연봉", (i) => i.salary, (i, v) => ({ ...i, salary: Math.max(0, v) })),
];

export function incorporationPlain(i: IncorporationInput, top?: TornadoBar) {
  const r = cmp(i);
  const payoutDiff = r.sole.total - r.corpPayout;
  const keepDiff = r.sole.total - r.corpKeep;
  const headline =
    payoutDiff > 0
      ? `이익 ${roughWon(r.profit)}이면 배당까지 받아도 법인이 1년에 약 ${roughWon(payoutDiff)} 세금이 적어요(추정).`
      : keepDiff > 0
        ? `이익을 법인에 남겨 두면 1년에 약 ${roughWon(keepDiff)} 적지만, 배당으로 꺼내면 개인사업자가 약 ${roughWon(-payoutDiff)} 적어요(추정).`
        : `지금 이익(${roughWon(r.profit)})이면 개인사업자가 1년에 약 ${roughWon(-keepDiff)} 이상 세금이 적어요(추정).`;
  const reasons = [
    "법인은 이익에 법인세(2억까지 10%)를 내고, 대표 연봉과 배당에 소득세를 따로 내요.",
    "법인으로 바꾸면 4대보험·기장료가 늘고 회사 돈을 마음대로 꺼낼 수 없어요. 세금만 보고 정하지 마세요.",
  ];
  return { headline, driver: driverLine(top, "법인으로 아끼는 세금"), reasons };
}

export const incorporationResult = cmp;

// ───────────────────────── 양도소득세 ─────────────────────────

export const gainsTotal = (i: GainsInput) => capitalGainsTax(i).total;
const yearsAssumption = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, max: number, marks: { at: number; label: string }[]): Assumption<I> => ({
  key, label, plain, unit: "years", kind: "fact", get, set, range: fixedRange(0, max), marks,
});

export const GAINS_ASSUMPTIONS: Assumption<GainsInput>[] = [
  { ...moneyAssumption<GainsInput>("sale", "양도가액", "파는 값", (i) => i.sale, (i, v) => ({ ...i, sale: Math.max(0, v) })), marks: [{ at: HIGH_PRICE_LINE, label: "12억" }] },
  moneyAssumption<GainsInput>("purchase", "취득가액", "산 값", (i) => i.purchase, (i, v) => ({ ...i, purchase: Math.max(0, v) })),
  moneyAssumption<GainsInput>("expenses", "필요경비", "산 뒤 들인 비용", (i) => i.expenses, (i, v) => ({ ...i, expenses: Math.max(0, v) })),
  yearsAssumption<GainsInput>("holdYears", "보유 기간", "가진 기간", (i) => i.holdYears, (i, v) => ({ ...i, holdYears: Math.max(0, Math.round(v)) }), 20, [
    { at: 2, label: "2년" },
    { at: 3, label: "3년" },
    { at: 10, label: "10년" },
  ]),
  yearsAssumption<GainsInput>("liveYears", "거주 기간", "실제로 산 기간", (i) => i.liveYears, (i, v) => ({ ...i, liveYears: Math.max(0, Math.round(v)) }), 20, [
    { at: 2, label: "2년" },
    { at: 10, label: "10년" },
  ]),
];

export function gainsBridge(i: GainsInput): BridgeStep[] {
  const r = capitalGainsTax(i);
  const steps: BridgeStep[] = [
    { label: "파는 값", value: i.sale, kind: "add" },
    { label: "산 값", value: -i.purchase, kind: "add" },
  ];
  if (i.expenses > 0) steps.push({ label: "필요경비", value: -i.expenses, kind: "add" });
  steps.push({ label: "양도차익", value: r.gain, kind: "total" });
  if (r.exempt) {
    steps.push({ label: "1세대 1주택 비과세", value: -r.gain, kind: "add" });
    steps.push({ label: "과세표준", value: 0, kind: "total" });
    return steps;
  }
  if (r.taxableGain !== r.gain) steps.push({ label: "12억 이하 몫 비과세", value: r.taxableGain - r.gain, kind: "add" });
  if (r.longTerm > 0) steps.push({ label: `장기보유특별공제 ${Math.round(r.longTermRate * 100)}%`, value: -r.longTerm, kind: "add" });
  const basic = Math.min(BASIC_DEDUCTION, Math.max(0, r.taxableGain - r.longTerm));
  if (basic > 0) steps.push({ label: "기본공제 250만", value: -basic, kind: "add" });
  steps.push({ label: "과세표준", value: r.base, kind: "total" });
  return steps;
}

export function gainsPlain(i: GainsInput, top?: TornadoBar) {
  const r = capitalGainsTax(i);
  if (r.exempt) return { headline: "1세대 1주택 비과세라 양도세가 없어요(추정).", driver: null, reasons: ["파는 값이 12억 원을 넘으면 넘는 몫만큼 세금이 생겨요."] };
  const headline = `오른 값 ${roughWon(r.gain)}에 양도세 약 ${roughWon(r.total)}을 내요(추정, 지방소득세 포함).`;
  const reasons: string[] = [];
  if (r.taxableGain !== r.gain) reasons.push("1주택이라 12억 원 넘는 몫만 세금을 매겼어요.");
  if (r.longTermRate > 0) reasons.push(`오래 가진(살았던) 만큼 오른 값의 ${Math.round(r.longTermRate * 100)}%를 빼 줬어요.`);
  if (r.heavyAdd > 0) reasons.push(`다주택자가 조정대상지역 집을 팔아 세율이 ${Math.round(r.heavyAdd * 100)}%p 더해지고 오래 가진 공제도 없어요.`);
  if (r.rateLabel.startsWith("단기")) reasons.push(`2년 안에 팔아서 ${r.rateLabel.replace("단기 ", "")} 세율을 적용했어요.`);
  return { headline, driver: driverLine(top, "양도세"), reasons };
}

// ───────────────────────── 취득세 ─────────────────────────

export const acquisitionTotal = (i: AcquisitionInput) => acquisitionTax(i).total;

export const ACQUISITION_ASSUMPTIONS: Assumption<AcquisitionInput>[] = [
  {
    ...moneyAssumption<AcquisitionInput>("price", "취득가액", "집값", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) })),
    range: (anchor) => [0, Math.max(anchor * 2, 1_500_000_000)],
    marks: [
      { at: 600_000_000, label: "6억" },
      { at: 900_000_000, label: "9억" },
    ],
  },
];

export function acquisitionBridge(i: AcquisitionInput): BridgeStep[] {
  const r = acquisitionTax(i);
  const steps: BridgeStep[] = [
    { label: `취득세 ${(r.rate * 100).toFixed(2)}%`, value: r.tax, kind: "add" },
    { label: "지방교육세", value: r.education, kind: "add" },
  ];
  if (r.rural > 0) steps.push({ label: "농어촌특별세", value: r.rural, kind: "add" });
  steps.push({ label: "낼 돈 합계", value: r.total, kind: "total" });
  return steps;
}

export function acquisitionPlain(i: AcquisitionInput) {
  const r = acquisitionTax(i);
  const headline = `${roughWon(i.price)}짜리 집을 사면 취득세 등 약 ${roughWon(r.total)}을 내요(추정).`;
  const reasons: string[] = [];
  if (r.heavy) reasons.push(`집이 여러 채라 세율이 ${(r.rate * 100).toFixed(0)}%로 무거워졌어요(다주택 중과).`);
  else if (i.price > 600_000_000 && i.price <= 900_000_000) reasons.push("6억~9억 원 사이는 집값이 오를수록 세율이 1%에서 3%까지 조금씩 올라가요.");
  else reasons.push(`집값 구간에 따라 ${(r.rate * 100).toFixed(0)}% 세율을 적용했어요(6억 이하 1%, 9억 초과 3%).`);
  if (r.rural === 0 && !i.over85) reasons.push("전용 85㎡ 이하라 농어촌특별세가 없어요.");
  return { headline, driver: null, reasons };
}

// ───────────────────────── 재산세 ─────────────────────────

export interface PropertyInput {
  official: number;
  oneHouse: boolean;
  urban: boolean;
}

export const propertyTotal = (i: PropertyInput) => propertyTax(i.official, i.oneHouse, i.urban).total;

export const PROPERTY_ASSUMPTIONS: Assumption<PropertyInput>[] = [
  {
    ...moneyAssumption<PropertyInput>("official", "주택 공시가격", "공시가격", (i) => i.official, (i, v) => ({ ...i, official: Math.max(0, v) })),
    range: (anchor) => [0, Math.max(anchor * 2, 1_200_000_000)],
    marks: [
      { at: 300_000_000, label: "3억" },
      { at: 600_000_000, label: "6억" },
      { at: 900_000_000, label: "9억" },
    ],
  },
];

export function propertyBridge(i: PropertyInput): BridgeStep[] {
  const r = propertyTax(i.official, i.oneHouse, i.urban);
  const steps: BridgeStep[] = [{ label: "재산세", value: r.tax, kind: "add" }];
  if (r.urban > 0) steps.push({ label: "도시지역분", value: r.urban, kind: "add" });
  steps.push({ label: "지방교육세", value: r.education, kind: "add" });
  steps.push({ label: "올해 낼 돈", value: r.total, kind: "total" });
  return steps;
}

export function propertyPlain(i: PropertyInput) {
  const r = propertyTax(i.official, i.oneHouse, i.urban);
  const headline = `공시가격 ${roughWon(i.official)}인 집의 올해 재산세는 약 ${roughWon(r.total)}이에요(추정).`;
  const reasons = [
    `공시가격의 ${Math.round(r.ratio * 100)}%에만 세금을 매겨요(공정시장가액비율).`,
    r.special ? "1세대 1주택이고 공시가격 9억 원 이하라 낮은 세율(특례)을 적용했어요." : "1주택 특례(공시가격 9억 원 이하)를 받지 않아요.",
    r.tax > 200_000 ? "재산세가 20만 원을 넘어서 7월과 9월에 반씩 나눠 내요." : "20만 원 이하라 7월에 한 번에 내요.",
  ];
  return { headline, driver: null, reasons };
}

// ───────────────────────── 월급 실수령액 ─────────────────────────

export interface SalaryInput {
  /** 월 세전 급여(원) */
  monthly: number;
  /** 기본공제 인원(본인 포함) */
  dependents: number;
  /** 월 비과세 수당(식대 등) */
  nonTaxable: number;
}

export const salaryBreakdown = (i: SalaryInput) => computeSalaryBreakdownWon(i.monthly, i.dependents, i.nonTaxable);
export const salaryNet = (i: SalaryInput) => salaryBreakdown(i).net;

export const SALARY_ASSUMPTIONS: Assumption<SalaryInput>[] = [
  { ...moneyAssumption<SalaryInput>("monthly", "월 세전 급여", "월급(세전)", (i) => i.monthly, (i, v) => ({ ...i, monthly: Math.max(0, v) })), range: (a) => [0, Math.max(a * 2, 10_000_000)] },
  { key: "dependents", label: "기본공제 인원", plain: "부양가족 수", unit: "people", kind: "assumption", get: (i) => i.dependents, set: (i, v) => ({ ...i, dependents: Math.max(1, Math.round(v)) }), range: fixedRange(1, 6) },
  {
    ...moneyAssumption<SalaryInput>("nonTaxable", "비과세 급여", "세금 안 붙는 수당", (i) => i.nonTaxable, (i, v) => ({ ...i, nonTaxable: Math.max(0, v) })),
    range: fixedRange(0, 500_000),
    marks: [{ at: 200_000, label: "식대 20만" }],
  },
];

export function salaryBridge(i: SalaryInput): BridgeStep[] {
  const r = salaryBreakdown(i);
  return [
    { label: "월급(세전)", value: r.gross, kind: "total" },
    { label: "국민연금", value: -r.pension, kind: "add" },
    { label: "건강보험·장기요양", value: -(r.health + r.ltc), kind: "add" },
    { label: "고용보험", value: -r.employment, kind: "add" },
    { label: "소득세·지방소득세", value: -(r.incomeTax + r.localTax), kind: "add" },
    { label: "통장에 들어오는 돈", value: r.net, kind: "total" },
  ];
}

export function salaryPlain(i: SalaryInput, top?: TornadoBar) {
  const r = salaryBreakdown(i);
  const ins = r.pension + r.health + r.ltc + r.employment;
  const tax = r.incomeTax + r.localTax;
  const headline = `월급 ${roughWon(r.gross)} 중 약 ${roughWon(r.net)}이 통장에 들어와요(추정).`;
  const reasons = [
    `4대 보험으로 ${roughWon(ins)}, 세금으로 ${roughWon(tax)}을 떼요. 보험료가 세금보다 큰 경우가 많아요.`,
    i.nonTaxable > 0 ? `비과세 수당 ${roughWon(i.nonTaxable)}에는 보험료와 세금이 붙지 않아요.` : "식대 같은 비과세 수당이 있으면 그만큼 떼는 돈이 줄어요.",
    "회사가 떼는 세금은 간이세액표라 이 추정과 조금 달라요. 차이는 연말정산 때 맞춰져요.",
  ];
  return { headline, driver: driverLine(top, "실수령액"), reasons };
}

// ───────────────────────── 종합소득세·프리랜서 ─────────────────────────

export type ExpenseMode = "simple" | "actual";

export interface IncomeInput {
  /** 사업(프리랜서) 수입금액 */
  revenue: number;
  expenseMode: ExpenseMode;
  /** expenseMode = actual 일 때 필요경비 */
  expenses: number;
  salary: number;
  other: number;
  people: number;
  pension: number;
  /** 이미 낸 소득세(원천징수·중간예납). 프리랜서는 3% 원천징수로 자동 계산 */
  prepaid: number;
}

export const incomeExpense = (i: IncomeInput) => (i.expenseMode === "simple" ? simpleExpense(i.revenue) : Math.max(0, i.expenses));

export function incomeResult(i: IncomeInput, freelancer: boolean) {
  if (freelancer) return freelancerSettlement(i.revenue, i.revenue > 0 ? incomeExpense(i) / i.revenue : 0, i.people, i.pension);
  const r = comprehensiveIncomeTax({ businessIncome: i.revenue - incomeExpense(i), salary: i.salary, otherIncome: i.other, people: i.people, pensionPremium: i.pension, prepaid: i.prepaid });
  return { ...r, revenue: i.revenue, expense: incomeExpense(i), withheld: i.prepaid, withheldLocal: Math.floor(Math.round(i.prepaid * 0.1) / 10) * 10 };
}

/** 5월에 더 낼 돈(+) / 돌려받을 돈(−), 지방소득세 포함 */
export const incomeDue = (freelancer: boolean) => (i: IncomeInput) => incomeResult(i, freelancer).due;

export function incomeAssumptions(freelancer: boolean): Assumption<IncomeInput>[] {
  const list: Assumption<IncomeInput>[] = [
    { ...moneyAssumption<IncomeInput>("revenue", freelancer ? "사업소득 수입금액(3.3% 원천징수 전)" : "사업 수입금액", freelancer ? "1년 수입(세전)" : "1년 매출", (i) => i.revenue, (i, v) => ({ ...i, revenue: Math.max(0, v) })), range: (a) => [0, Math.max(a * 2, 100_000_000)] },
    {
      ...moneyAssumption<IncomeInput>("expenses", "필요경비", "일에 쓴 비용", incomeExpense, (i, v) => ({ ...i, expenseMode: "actual", expenses: Math.max(0, v) })),
      range: (a) => [0, Math.max(a * 2, 50_000_000)],
    },
  ];
  if (!freelancer) {
    list.push(moneyAssumption<IncomeInput>("salary", "근로 총급여", "회사 월급(1년치)", (i) => i.salary, (i, v) => ({ ...i, salary: Math.max(0, v) })));
    list.push(moneyAssumption<IncomeInput>("other", "기타소득금액", "강연료 등 기타소득", (i) => i.other, (i, v) => ({ ...i, other: Math.max(0, v) })));
  }
  list.push({ key: "people", label: "기본공제 인원", plain: "부양가족 수", unit: "people", kind: "assumption", get: (i) => i.people, set: (i, v) => ({ ...i, people: Math.max(1, Math.round(v)) }), range: fixedRange(1, 6) });
  list.push({ ...moneyAssumption<IncomeInput>("pension", "연금보험료 공제", "낸 국민연금", (i) => i.pension, (i, v) => ({ ...i, pension: Math.max(0, v) })), range: (a) => [0, Math.max(a * 2, 6_000_000)] });
  if (!freelancer) list.push({ ...moneyAssumption<IncomeInput>("prepaid", "기납부세액", "이미 낸 세금", (i) => i.prepaid, (i, v) => ({ ...i, prepaid: Math.max(0, v) })), kind: "fact" });
  return list;
}

export function incomeBridge(i: IncomeInput, freelancer: boolean): BridgeStep[] {
  const r = incomeResult(i, freelancer);
  const steps: BridgeStep[] = [
    { label: "산출세액", value: r.calculated, kind: "add" },
    { label: "세액공제", value: -r.credits, kind: "add" },
    { label: "결정세액", value: r.determined, kind: "total" },
    { label: "지방소득세", value: r.local, kind: "add" },
  ];
  const paid = r.withheld + r.withheldLocal;
  if (paid > 0) steps.push({ label: freelancer ? "이미 뗀 3.3%" : "이미 낸 세금", value: -paid, kind: "add" });
  steps.push({ label: r.due >= 0 ? "5월에 더 낼 돈" : "5월에 돌려받을 돈", value: r.due, kind: "total" });
  return steps;
}

export function incomePlain(i: IncomeInput, freelancer: boolean, top?: TornadoBar) {
  const r = incomeResult(i, freelancer);
  const headline =
    r.due >= 0
      ? `5월 종합소득세 신고 때 약 ${roughWon(r.due)}을 더 내요(추정, 지방소득세 포함).`
      : `5월 종합소득세 신고 때 약 ${roughWon(-r.due)}을 돌려받아요(추정, 지방소득세 포함).`;
  const reasons: string[] = [];
  reasons.push(
    i.expenseMode === "simple"
      ? `수입의 약 ${Math.round((r.expense / Math.max(1, r.revenue)) * 100)}%를 비용으로 쳐 줬어요(단순경비율). 실제 비용이 더 크면 장부를 써서 더 빼 볼 수 있어요.`
      : `일에 쓴 비용 ${roughWon(r.expense)}을 빼고 세금을 매겼어요.`,
  );
  if (freelancer) reasons.push(`일할 때 3.3%로 ${roughWon(r.withheld + r.withheldLocal)}을 이미 뗐어요. 실제 세금이 그보다 적으면 돌려받아요.`);
  reasons.push(`부양가족 한 명당 150만 원씩 소득에서 빼 줘요(지금 ${i.people}명).`);
  return { headline, driver: driverLine(top, r.due >= 0 ? "낼 세금" : "돌려받을 돈"), reasons };
}

// ───────────────────────── 상속세 ─────────────────────────

export interface InheritanceInput {
  /** 총 상속재산(사전증여 합산 전) */
  estate: number;
  /** 채무·공과금 */
  debts: number;
  /** 장례비용(증빙 금액) */
  funeral: number;
  spouse: boolean;
  /** 배우자가 실제로 받는 금액 */
  spouseAmount: number;
  /** 순금융재산 */
  financial: number;
}

/** 상속세 추정(상증법 제18~22·26·69조). 계산식은 기존 화면 그대로 옮겼어요. */
export function inheritanceTax(i: InheritanceInput) {
  const funeral = funeralDeduction(i.funeral);
  const netEstate = Math.max(0, Math.max(0, i.estate) - Math.max(0, i.debts) - funeral);
  const lumpSum = IG.inheritanceLumpSum;
  const spouseDeduction = i.spouse ? spouseInheritanceDeduction(i.spouseAmount) : 0;
  const financialDeduction = financialAssetDeduction(i.financial);
  const deductions = lumpSum + spouseDeduction + financialDeduction;
  const base = Math.max(0, netEstate - deductions);
  const raw = inheritanceGiftProgressiveTax(base);
  const credit = filingCredit(raw);
  const total = Math.max(0, raw - credit);
  return { funeral, netEstate, lumpSum, spouseDeduction, financialDeduction, deductions, base, raw, credit, total, rate: netEstate > 0 ? total / netEstate : 0 };
}

export const inheritanceTotal = (i: InheritanceInput) => inheritanceTax(i).total;

export const INHERITANCE_ASSUMPTIONS: Assumption<InheritanceInput>[] = [
  {
    ...moneyAssumption<InheritanceInput>("estate", "총 상속재산가액", "남긴 재산", (i) => i.estate, (i, v) => ({ ...i, estate: Math.max(0, v) })),
    range: (a) => [0, Math.max(a * 2, 3_000_000_000)],
    marks: [
      { at: 1_000_000_000, label: "10억" },
      { at: 1_500_000_000, label: "15억" },
    ],
  },
  moneyAssumption<InheritanceInput>("debts", "채무·공과금", "남은 빚", (i) => i.debts, (i, v) => ({ ...i, debts: Math.max(0, v) })),
  {
    ...moneyAssumption<InheritanceInput>("spouseAmount", "배우자 실제 상속액", "배우자가 받는 몫", (i) => i.spouseAmount, (i, v) => ({ ...i, spouseAmount: Math.max(0, v) })),
    range: (a) => [0, Math.max(a * 2, 3_500_000_000)],
    marks: [
      { at: IG.spouseInheritanceMin, label: "5억" },
      { at: IG.spouseInheritanceMax, label: "30억" },
    ],
  },
  {
    ...moneyAssumption<InheritanceInput>("financial", "순금융재산", "예금·주식", (i) => i.financial, (i, v) => ({ ...i, financial: Math.max(0, v) })),
    range: (a) => [0, Math.max(a * 2, 1_200_000_000)],
    marks: [{ at: 1_000_000_000, label: "공제 2억 한도" }],
  },
];

export function inheritanceBridge(i: InheritanceInput): BridgeStep[] {
  const r = inheritanceTax(i);
  const steps: BridgeStep[] = [{ label: "남긴 재산", value: Math.max(0, i.estate), kind: "add" }];
  if (i.debts > 0) steps.push({ label: "빚·공과금", value: -Math.max(0, i.debts), kind: "add" });
  steps.push({ label: "장례비", value: -r.funeral, kind: "add" });
  steps.push({ label: "순 상속재산", value: r.netEstate, kind: "total" });
  steps.push({ label: "일괄공제 5억", value: -r.lumpSum, kind: "add" });
  if (r.spouseDeduction > 0) steps.push({ label: "배우자공제", value: -r.spouseDeduction, kind: "add" });
  if (r.financialDeduction > 0) steps.push({ label: "금융재산공제", value: -r.financialDeduction, kind: "add" });
  steps.push({ label: "과세표준", value: r.base, kind: "total" });
  return steps;
}

export function inheritancePlain(i: InheritanceInput, top?: TornadoBar) {
  const r = inheritanceTax(i);
  if (r.total === 0)
    return {
      headline: `공제가 ${roughWon(r.deductions)}이라 순 상속재산 ${roughWon(r.netEstate)}에는 상속세가 없어요(추정).`,
      driver: driverLine(top, "상속세"),
      reasons: ["배우자가 있으면 보통 10억 원, 없으면 5억 원까지는 상속세가 나오지 않아요.", "10년 안에 미리 증여한 재산이 있으면 합쳐서 다시 계산해요."],
    };
  const reasons = [
    `공제 ${roughWon(r.deductions)}을 빼고 남은 ${roughWon(r.base)}에 10~50% 세율을 매겼어요.`,
    i.spouse ? `배우자가 실제로 받는 몫만큼(최소 5억, 최대 30억) 빼 줘요. 배우자 몫을 늘리면 세금이 줄지만, 나중에 배우자 상속 때 다시 세금이 생길 수 있어요.` : "배우자가 없으면 배우자공제(최소 5억)가 없어서 세금이 커져요.",
    "기한(사망한 달 말일부터 6개월) 안에 신고하면 3%를 깎아 줘요.",
  ];
  return { headline: `상속세는 약 ${roughWon(r.total)}이에요(추정, 신고공제 3% 반영).`, driver: driverLine(top, "상속세"), reasons };
}

// ───────────────────────── 증여세 ─────────────────────────

export type GiftRelation = "spouse" | "child_adult" | "child_minor" | "parent" | "marriage_child" | "relative";

export interface GiftInput {
  amount: number;
  relation: GiftRelation;
}

export const GIFT_RELATIONS: { value: GiftRelation; label: string; plain: string; deduction: number }[] = [
  { value: "child_adult", label: "성년 자녀(직계존속에게서)", plain: "부모님이 성인 자녀에게", deduction: IG.giftDeductions.child_adult },
  { value: "marriage_child", label: "혼인·출산 자녀(+1억)", plain: "결혼·출산하는 자녀에게", deduction: IG.giftDeductions.child_adult + IG.marriageBirthDeduction },
  { value: "child_minor", label: "미성년 자녀", plain: "미성년 자녀에게", deduction: IG.giftDeductions.child_minor },
  { value: "spouse", label: "배우자", plain: "남편·아내에게", deduction: IG.giftDeductions.spouse },
  { value: "parent", label: "부모(직계비속에게서)", plain: "자녀가 부모님께", deduction: IG.giftDeductions.parent },
  { value: "relative", label: "기타 친족", plain: "형제·친척에게", deduction: IG.giftDeductions.other_relative },
];

export function giftTax(i: GiftInput) {
  const gross = Math.max(0, i.amount);
  const deduction = GIFT_RELATIONS.find((r) => r.value === i.relation)!.deduction;
  const base = Math.max(0, gross - deduction);
  const raw = inheritanceGiftProgressiveTax(base);
  const credit = filingCredit(raw);
  const total = Math.max(0, raw - credit);
  return { gross, deduction, base, raw, credit, total, rate: gross > 0 ? total / gross : 0 };
}

export const giftTotal = (i: GiftInput) => giftTax(i).total;

export const GIFT_ASSUMPTIONS: Assumption<GiftInput>[] = [
  {
    ...moneyAssumption<GiftInput>("amount", "증여재산가액", "주는 돈", (i) => i.amount, (i, v) => ({ ...i, amount: Math.max(0, v) })),
    range: (a) => [0, Math.max(a * 2, 1_000_000_000)],
  },
];

/** 공제 경계와 세율 경계(과세표준 1억·5억)를 주는 돈 기준 점선으로 */
export function giftMarks(relation: GiftRelation) {
  const d = GIFT_RELATIONS.find((r) => r.value === relation)!.deduction;
  return [
    { at: d, label: "공제 끝" },
    { at: d + 100_000_000, label: "세율 20%" },
    { at: d + 500_000_000, label: "세율 30%" },
  ];
}

export function giftBridge(i: GiftInput): BridgeStep[] {
  const r = giftTax(i);
  return [
    { label: "주는 돈", value: r.gross, kind: "add" },
    { label: "증여재산공제", value: -Math.min(r.gross, r.deduction), kind: "add" },
    { label: "과세표준", value: r.base, kind: "total" },
    { label: "산출세액", value: r.raw, kind: "total" },
    { label: "신고세액공제 3%", value: -r.credit, kind: "add" },
    { label: "낼 증여세", value: r.total, kind: "total" },
  ];
}

export function giftPlain(i: GiftInput) {
  const r = giftTax(i);
  const rel = GIFT_RELATIONS.find((x) => x.value === i.relation)!;
  if (r.total === 0)
    return {
      headline: `${rel.plain} ${roughWon(r.gross)}을 주면 증여세가 없어요(공제 ${roughWon(r.deduction)} 안, 10년 합산).`,
      driver: null,
      reasons: [`같은 관계에서 10년 동안 ${roughWon(r.deduction)}까지 세금 없이 줄 수 있어요. 남은 한도는 ${roughWon(r.deduction - r.gross)}이에요.`],
    };
  return {
    headline: `${rel.plain} ${roughWon(r.gross)}을 주면 증여세는 약 ${roughWon(r.total)}이에요(추정, 신고공제 3% 반영).`,
    driver: null,
    reasons: [
      `${roughWon(r.deduction)}까지는 빼 주고, 넘는 ${roughWon(r.base)}에 세금을 매겼어요.`,
      "10년 안에 같은 사람(부모님이면 두 분 합쳐서)에게 받은 돈은 모두 더해서 계산해요.",
      "받은 달 말일부터 3개월 안에 신고하면 3%를 깎아 줘요.",
    ],
  };
}

// ───────────────────────── 연말정산(핵심 항목) ─────────────────────────

/** 쉬운 화면용 핵심 입력. 나머지 공제는 전문가 화면의 전체 계산기에서 넣어요. */
export interface YearEndLite {
  salary: number;
  persons: number;
  /** 자녀세액공제 대상 자녀 수 */
  children: number;
  /** 1년 동안 회사가 뗀 소득세(지방세 제외) */
  withheld: number;
  credit: number;
  debit: number;
  /** 연금저축 + IRP 납입액 */
  pension: number;
  medical: number;
  /** 월세(1년 합계). 무주택·총급여 8천만 이하 등 요건을 채웠다고 봐요 */
  rent: number;
}

/** 총급여에서 4대 보험료(연금·건강·장기요양·고용)를 어림해요. */
export function yearEndInsurance(salary: number) {
  const m = computeMonthlyInsurance(Math.max(0, salary) / 12);
  return { nationalPension: m.pension * 12, healthEmployment: (m.health + m.ltc + m.employment) * 12 };
}

/** 회사가 간이세액표로 뗐을 소득세를 어림(연봉 ÷ 12로 월급 계산기와 같은 방식). */
export const estimateWithheld = (salary: number, persons: number) => computeSalaryBreakdownWon(Math.max(0, salary) / 12, persons, 0).incomeTax * 12;

export function yearEndInput(i: YearEndLite): YearEndInput {
  return {
    salary: i.salary,
    persons: Math.max(1, i.persons),
    withheld: i.withheld,
    ...yearEndInsurance(i.salary),
    card: { credit: i.credit, debit: i.debit },
    cardChildren: i.children,
    creditChildren: i.children,
    pensionSavings: Math.min(i.pension, 6_000_000),
    irp: Math.max(0, i.pension - 6_000_000),
    medical: i.medical,
    rent: i.rent,
    rentEligible: i.rent > 0,
  };
}

export const yearEndResult = (i: YearEndLite) => settleYearEnd(yearEndInput(i));
/** 돌려받는 돈(+) / 더 내는 돈(−), 지방소득세 포함 */
export const yearEndRefund = (i: YearEndLite) => yearEndResult(i).refund?.total ?? 0;

const people = (key: string, label: string, plain: string, get: (i: YearEndLite) => number, set: (i: YearEndLite, v: number) => YearEndLite, min: number): Assumption<YearEndLite> => ({
  key, label, plain, unit: "people", kind: "assumption", get, set, range: fixedRange(min, 6),
});

export const YEAR_END_ASSUMPTIONS: Assumption<YearEndLite>[] = [
  { ...moneyAssumption<YearEndLite>("salary", "총급여", "1년 연봉(비과세 빼고)", (i) => i.salary, (i, v) => ({ ...i, salary: Math.max(0, v) })), kind: "fact" },
  { ...moneyAssumption<YearEndLite>("withheld", "기납부세액", "회사가 이미 뗀 세금", (i) => i.withheld, (i, v) => ({ ...i, withheld: Math.max(0, v) })), kind: "fact" },
  {
    ...moneyAssumption<YearEndLite>("credit", "신용카드 사용액", "신용카드로 쓴 돈", (i) => i.credit, (i, v) => ({ ...i, credit: Math.max(0, v) })),
    range: (a) => [0, Math.max(a * 2, 40_000_000)],
  },
  {
    ...moneyAssumption<YearEndLite>("debit", "체크카드·현금영수증", "체크카드·현금으로 쓴 돈", (i) => i.debit, (i, v) => ({ ...i, debit: Math.max(0, v) })),
    range: (a) => [0, Math.max(a * 2, 30_000_000)],
  },
  {
    ...moneyAssumption<YearEndLite>("pension", "연금저축·IRP 납입액", "연금저축·IRP에 넣은 돈", (i) => i.pension, (i, v) => ({ ...i, pension: Math.max(0, v) })),
    range: fixedRange(0, 12_000_000),
    marks: [
      { at: 6_000_000, label: "연금저축 600만" },
      { at: 9_000_000, label: "합계 900만" },
    ],
  },
  { ...moneyAssumption<YearEndLite>("medical", "의료비", "병원·약값", (i) => i.medical, (i, v) => ({ ...i, medical: Math.max(0, v) })), range: (a) => [0, Math.max(a * 2, 10_000_000)] },
  { ...moneyAssumption<YearEndLite>("rent", "월세액", "1년 월세", (i) => i.rent, (i, v) => ({ ...i, rent: Math.max(0, v) })), range: fixedRange(0, 12_000_000), marks: [{ at: 10_000_000, label: "한도 1,000만" }] },
  people("persons", "기본공제 인원", "부양가족 수", (i) => i.persons, (i, v) => ({ ...i, persons: Math.max(1, Math.round(v)) }), 1),
  people("children", "자녀세액공제 자녀", "8~20세 자녀", (i) => i.children, (i, v) => ({ ...i, children: Math.max(0, Math.round(v)) }), 0),
];

export function yearEndBridge(i: YearEndLite): BridgeStep[] {
  const r = yearEndResult(i);
  const local = Math.floor(i.withheld * 0.1 / 10) * 10;
  const steps: BridgeStep[] = [
    { label: "회사가 뗀 세금(지방세 포함)", value: i.withheld + local, kind: "add" },
    { label: "올해 확정된 세금", value: -r.totalTax, kind: "add" },
    { label: r.refund && r.refund.total < 0 ? "더 낼 돈" : "돌려받을 돈", value: r.refund?.total ?? 0, kind: "total" },
  ];
  return steps;
}

/** 결정세액이 만들어지는 다리: 산출세액 − 세액공제 = 결정세액 */
export function yearEndTaxBridge(i: YearEndLite): BridgeStep[] {
  const r = yearEndResult(i);
  const steps: BridgeStep[] = [{ label: "산출세액", value: r.calculatedTax, kind: "total" }];
  const credits: [string, number][] = [
    ["근로소득세액공제", r.earnedTaxCredit],
    ["자녀", r.childCredit],
    ["연금계좌", r.pensionCredit],
    ["의료비", r.medicalCredit],
    ["월세", r.rentCredit],
    ["보험료·교육비·기부금", r.insuranceCredit + r.educationCredit + r.donationCredit],
    ["표준세액공제", r.usedStandard ? r.standardCredit : 0],
  ];
  for (const [label, v] of credits) if (v > 0) steps.push({ label, value: -v, kind: "add" });
  steps.push({ label: "결정세액", value: r.finalTax, kind: "total" });
  return steps;
}

export function yearEndPlain(i: YearEndLite, top?: TornadoBar) {
  const r = yearEndResult(i);
  const t = r.refund?.total ?? 0;
  const headline = t >= 0 ? `연말정산으로 약 ${roughWon(t)}을 돌려받아요(추정, 지방소득세 포함).` : `연말정산으로 약 ${roughWon(-t)}을 더 내야 해요(추정, 지방소득세 포함).`;
  const reasons: string[] = [];
  if (r.cardDeduction > 0) reasons.push(`카드를 연봉의 25%(${roughWon(i.salary * 0.25)}) 넘게 써서 ${roughWon(r.cardDeduction)}을 소득에서 빼 줬어요. 넘는 몫은 체크카드가 신용카드보다 2배 유리해요.`);
  else reasons.push(`카드는 연봉의 25%(${roughWon(i.salary * 0.25)})를 넘게 써야 공제가 시작돼요.`);
  if (r.pensionCredit > 0) reasons.push(`연금저축·IRP에 넣은 돈의 ${i.salary <= 55_000_000 ? "15%" : "12%"}를 세금에서 바로 빼 줬어요(${roughWon(r.pensionCredit)}).`);
  else reasons.push("연금저축·IRP에 넣으면 넣은 돈의 12~15%를 세금에서 바로 빼 줘요(합계 900만 원까지).");
  if (r.usedStandard) reasons.push("의료비·보험료 같은 특별공제보다 표준세액공제 13만 원이 더 유리해서 그걸 골랐어요.");
  return { headline, driver: driverLine(top, t >= 0 ? "돌려받을 돈" : "더 낼 돈"), reasons };
}

// ───────────────────────── 퇴직금(어림) ─────────────────────────

export interface SeveranceLite {
  /** 퇴직 전 3개월 월평균 임금(세전) */
  monthly: number;
  /** 근속 기간(년, 소수 가능) */
  years: number;
  /** 1년 상여금 */
  bonus: number;
  /** 1년 연차수당 */
  leavePay: number;
}

/** 근로자퇴직급여 보장법 제8조: 1일 평균임금 × 30 × 재직일수 ÷ 365. 3개월은 91일로 어림해요. */
export function severanceEstimate(i: SeveranceLite) {
  const threeMonths = Math.max(0, i.monthly) * 3 + (Math.max(0, i.bonus) * 3) / 12 + (Math.max(0, i.leavePay) * 3) / 12;
  const daily = threeMonths / 91;
  const years = Math.max(0, i.years);
  const gross = years < 1 ? 0 : Math.floor(daily * 30 * years);
  const serviceYears = Math.max(1, Math.ceil(years));
  const tax = gross > 0 ? retirementIncomeTax(gross, serviceYears) : null;
  return { daily, gross, tax: tax?.totalTax ?? 0, net: tax?.netPayout ?? 0, serviceYears };
}

export const severanceGross = (i: SeveranceLite) => severanceEstimate(i).gross;

export const SEVERANCE_ASSUMPTIONS: Assumption<SeveranceLite>[] = [
  { ...moneyAssumption<SeveranceLite>("monthly", "평균임금(월)", "최근 3개월 월급", (i) => i.monthly, (i, v) => ({ ...i, monthly: Math.max(0, v) })), range: (a) => [0, Math.max(a * 2, 8_000_000)] },
  { key: "years", label: "계속근로기간", plain: "일한 기간", unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(0, Math.round(v * 2) / 2) }), range: fixedRange(0, 30), marks: [{ at: 1, label: "1년" }] },
  { ...moneyAssumption<SeveranceLite>("bonus", "연간 상여금", "1년 상여금", (i) => i.bonus, (i, v) => ({ ...i, bonus: Math.max(0, v) })), range: (a) => [0, Math.max(a * 2, 20_000_000)] },
  { ...moneyAssumption<SeveranceLite>("leavePay", "연차수당", "1년 연차수당", (i) => i.leavePay, (i, v) => ({ ...i, leavePay: Math.max(0, v) })), range: (a) => [0, Math.max(a * 2, 5_000_000)] },
];

export function severanceBridge(i: SeveranceLite): BridgeStep[] {
  const r = severanceEstimate(i);
  return [
    { label: "퇴직금(세전)", value: r.gross, kind: "total" },
    { label: "퇴직소득세·지방세", value: -r.tax, kind: "add" },
    { label: "실제 받는 돈", value: r.net, kind: "total" },
  ];
}

export function severancePlain(i: SeveranceLite, top?: TornadoBar) {
  const r = severanceEstimate(i);
  if (r.gross === 0) return { headline: "1년 넘게 일해야 퇴직금이 생겨요.", driver: null, reasons: ["4주 평균으로 주 15시간 이상 일했어야 해요."] };
  return {
    headline: `퇴직금은 세전 약 ${roughWon(r.gross)}, 세금을 떼면 약 ${roughWon(r.net)}이에요(어림).`,
    driver: driverLine(top, "퇴직금"),
    reasons: [
      "대략 '최근 월급 × 일한 햇수'예요. 상여금·연차수당은 1년치의 3/12을 더해요.",
      "1일 평균임금이 통상임금보다 적으면 통상임금으로 계산해요.",
      "IRP 계좌로 받으면 세금을 미뤄 두고 나중에 연금으로 받을 때 30~40% 덜 내요.",
    ],
  };
}
