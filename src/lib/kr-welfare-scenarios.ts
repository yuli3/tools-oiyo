// 생활 지원금·노동권 도구의 가정 목록과 쉬운 결과 문장 (2026-11-16).
// 계산은 kr-welfare-2026.ts, 여기는 "무엇을 바꿔 볼 수 있고 어떻게 설명할지"만 정해요.
import {
  ASSET_CAP, ASSET_HALF, CTC_TABLE, EITC_TABLE, INJURY_2026, RENT_CREDIT,
  dbVsDc, fixedOvertimeCheck, dismissalNoticePay, shutdownAllowance, reducedHoursPay, probationMinWage, REDUCED_HOURS_2026, directPaymentCheck, type DirectPayInput,
  type DismissalNoticeInput, type ShutdownPayInput, type ReducedHoursInput, type ProbationInput, premiumPay, longTermCareCopay, LTC_2026, injuryLeavePay, maternityLeavePay, monthlyRentCredit, ordinaryWage, wageGuarantee, workChildCredit,
  type EitcInput, type FixedOtInput, type WorkHours, type LtcInput, type GuaranteeInput, type InjuryInput, type MaternityInput, type OrdinaryWageInput, type PensionInput, type RentInput,
} from "./kr-welfare-2026.ts";
import { RENTAL, comprehensiveRealEstateTax, creThreshold, rentalIncomeTax, type CreInput, type RentalInput } from "./kr-home-tax-2026.ts";
import { COMMERCIAL_LEASE, DEPENDENT_2026, FAMILY_2026, FREE_USE_FACTOR, MAJOR_2026, RELATION_LABEL, commercialRentCheck, smeYouthReduction, vatTypeCompare, yellowUmbrella, SIMPLIFIED_VAT, YELLOW_UMBRELLA, type SmeYouthInput, type VatTypeInput, type YellowUmbrellaInput, dependentsTax, familyLoanGift, freeUseGift, lowPriceSale, majorShareholderTax, type CommercialRentInput, type DependentsInput, type FamilyLoanInput, type FreeUseInput, type LowPriceSaleInput, type MajorShareholderInput } from "./kr-household-tax-2026.ts";
import { roughWon, type Assumption } from "./scenario.ts";

const money = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number], marks?: { at: number; label: string }[], kind: "fact" | "assumption" = "assumption"): Assumption<I> => ({ key, label, plain, unit: "won", kind, get, set, range, marks });

// ───────────────────────── 근로·자녀장려금 ─────────────────────────
export const eitcTotal = (i: EitcInput) => workChildCredit(i).total;
export function eitcMarks(i: EitcInput) {
  const h = i.household === "single" && i.children > 0 ? "oneEarner" : i.household;
  const t = EITC_TABLE[h];
  const m: { at: number; label: string }[] = [
    { at: t.rampEnd, label: "최대액 시작" },
    { at: t.flatEnd, label: "줄기 시작" },
    { at: t.cap, label: "근로장려금 끝" },
  ];
  if (i.children > 0) m.push({ at: CTC_TABLE.cap, label: "자녀장려금 끝" });
  return m;
}
export const EITC_ASSUMPTIONS = (i: EitcInput): Assumption<EitcInput>[] => [
  money("income", "부부 합산 총소득", "작년에 번 돈(부부 합쳐서)", (x) => x.income, (x, v) => ({ ...x, income: Math.max(0, v) }), () => [0, i.children > 0 ? 75_000_000 : 48_000_000], eitcMarks(i)),
  money("assets", "가구 재산 합계", "집·전세금·예금·차 등 재산", (x) => x.assets, (x, v) => ({ ...x, assets: Math.max(0, v) }), () => [0, 300_000_000], [
    { at: ASSET_HALF, label: "1.7억: 절반" },
    { at: ASSET_CAP, label: "2.4억: 못 받음" },
  ], "fact"),
];
export function eitcPlain(i: EitcInput) {
  const r = workChildCredit(i);
  if (!r.assetOk) return { headline: "재산이 2억 4천만 원 이상이라 근로·자녀장려금을 받을 수 없어요.", reasons: ["재산은 집·전세금·예금·차를 모두 더하고, 빚은 빼지 않아요."] };
  if (r.total === 0) return { headline: "이 소득이면 근로·자녀장려금 대상이 아니에요(추정).", reasons: [`${HOUSEHOLD_LABEL[r.household]} 근로장려금은 총소득 ${roughWon(EITC_TABLE[r.household].cap)} 미만, 자녀장려금은 ${roughWon(CTC_TABLE.cap)} 미만이어야 해요.`] };
  const parts = [r.eitc > 0 ? `근로장려금 약 ${roughWon(r.eitc)}` : null, r.ctc > 0 ? `자녀장려금 약 ${roughWon(r.ctc)}` : null].filter(Boolean);
  const reasons: string[] = [];
  if (r.upgraded) reasons.push("18세 미만 자녀가 있어서 혼자 사는 가구가 아니라 홑벌이 가구로 계산했어요.");
  if (r.phase === "ramp") reasons.push("소득이 적은 구간이라 더 벌수록 장려금도 늘어나요.");
  if (r.phase === "flat") reasons.push("지금 소득은 근로장려금 최대액을 받는 구간이에요.");
  if (r.phase === "fade") reasons.push("소득이 늘수록 근로장려금이 조금씩 줄어드는 구간이에요.");
  if (r.assetFactor === 0.5) reasons.push("재산이 1억 7천만 원 이상이라 절반만 받아요.");
  if (i.late) reasons.push("기한 뒤에 신청하면 95%만 받아요.");
  return { headline: `모두 약 ${roughWon(r.total)}을 받을 수 있어요(${parts.join(" + ")}, 추정).`, reasons };
}
export const HOUSEHOLD_LABEL = { single: "단독 가구", oneEarner: "홑벌이 가구", twoEarner: "맞벌이 가구" } as const;

// ───────────────────────── 출산휴가 ─────────────────────────
export const maternityTotal = (i: MaternityInput) => maternityLeavePay(i).employeeTotal;
export const MATERNITY_ASSUMPTIONS: Assumption<MaternityInput>[] = [
  money("monthlyWage", "월 통상임금", "한 달 기본급 + 매달 고정으로 받는 수당", (x) => x.monthlyWage, (x, v) => ({ ...x, monthlyWage: Math.max(0, v) }), () => [1_500_000, 8_000_000], [{ at: 2_200_000, label: "220만: 보험 상한" }]),
];

// ───────────────────────── 대지급금 ─────────────────────────
export const guaranteeTotal = (i: GuaranteeInput) => wageGuarantee(i).total;
export const GUARANTEE_ASSUMPTIONS: Assumption<GuaranteeInput>[] = [
  money("monthlyWage", "월 임금", "한 달 월급", (x) => x.monthlyWage, (x, v) => ({ ...x, monthlyWage: Math.max(0, v) }), () => [1_000_000, 8_000_000]),
  { key: "unpaidMonths", label: "체불 개월 수", plain: "못 받은 달 수", unit: "months", kind: "assumption", get: (x) => x.unpaidMonths, set: (x, v) => ({ ...x, unpaidMonths: Math.max(0, Math.round(v)) }), range: () => [0, 12], marks: [{ at: 3, label: "3개월" }, { at: 6, label: "6개월" }] },
  money("unpaidSeverance", "미지급 퇴직금", "못 받은 퇴직금", (x) => x.unpaidSeverance, (x, v) => ({ ...x, unpaidSeverance: Math.max(0, v) }), () => [0, 40_000_000]),
];

// ───────────────────────── 산재 휴업급여 ─────────────────────────
export const injuryDaily = (i: InjuryInput) => injuryLeavePay({ ...i, days: Math.max(4, i.days) }).daily;
export const injuryTotal = (i: InjuryInput) => injuryLeavePay(i).total;
export const INJURY_ASSUMPTIONS: Assumption<InjuryInput>[] = [
  money("avgDailyWage", "1일 평균임금", "하루 평균 임금", (x) => x.avgDailyWage, (x, v) => ({ ...x, avgDailyWage: Math.max(0, v) }), () => [50_000, 350_000], [
    { at: (INJURY_2026.minBase * 0.8) / 0.7, label: "역전 구간 시작" },
    { at: INJURY_2026.maxBase, label: "최고 기준" },
  ]),
  { key: "days", label: "휴업 일수", plain: "일하지 못한 날", unit: "days", kind: "assumption", get: (x) => x.days, set: (x, v) => ({ ...x, days: Math.max(0, Math.round(v)) }), range: () => [0, 365] },
];

// ───────────────────────── 월세 세액공제 ─────────────────────────
export const rentTotal = (i: RentInput) => monthlyRentCredit(i).total;
export const rentMarks = (i: RentInput) => {
  const k = i.incomeType === "wage" ? "wage" : "comp";
  return [
    { at: RENT_CREDIT.high[k], label: "17% → 15%" },
    { at: RENT_CREDIT.low[k], label: "15% → 0" },
  ];
};
export const RENT_ASSUMPTIONS = (i: RentInput): Assumption<RentInput>[] => [
  money("monthlyRent", "월세", "한 달 월세", (x) => x.monthlyRent, (x, v) => ({ ...x, monthlyRent: Math.max(0, v) }), () => [0, 1_500_000], [{ at: RENT_CREDIT.limit / 12, label: "연 1,000만 한도" }]),
  money("income", i.incomeType === "wage" ? "총급여" : "종합소득금액", "1년 소득", (x) => x.income, (x, v) => ({ ...x, income: Math.max(0, v) }), () => [0, 100_000_000], rentMarks(i), "fact"),
];

// ───────────────────────── 퇴직연금 DB vs DC ─────────────────────────
export const pensionDiff = (i: PensionInput) => dbVsDc(i).diff;
export const PENSION_ASSUMPTIONS: Assumption<PensionInput>[] = [
  { key: "wageGrowth", label: "연 임금 상승률", plain: "해마다 월급이 오르는 비율", unit: "rate", kind: "assumption", get: (x) => x.wageGrowth, set: (x, v) => ({ ...x, wageGrowth: v }), range: () => [-0.02, 0.1] },
  { key: "dcReturn", label: "DC 연 운용 수익률", plain: "퇴직연금을 굴려 버는 비율", unit: "rate", kind: "assumption", get: (x) => x.dcReturn, set: (x, v) => ({ ...x, dcReturn: v }), range: () => [-0.02, 0.1] },
  { key: "yearsLeft", label: "퇴직까지 남은 연수", plain: "앞으로 더 다닐 햇수", unit: "years", kind: "fact", get: (x) => x.yearsLeft, set: (x, v) => ({ ...x, yearsLeft: Math.max(0, Math.round(v)) }), range: () => [1, 40] },
];

// ───────────────────────── 통상임금 ─────────────────────────
const hoursA = <I extends { overtime: number }>(max = 52): Assumption<I> => ({ key: "overtime", label: "월 연장근로시간", plain: "한 달 동안 더 일한 시간", unit: "hours", kind: "fact", get: (x) => x.overtime, set: (x, v) => ({ ...x, overtime: Math.max(0, Math.round(v)) }), range: () => [0, max], marks: [{ at: 52, label: "주 12시간 한도(월 약 52시간)" }] });
export const ordinaryPremium = (i: OrdinaryWageInput) => ordinaryWage(i).premium.total;
export const ORDINARY_ASSUMPTIONS: Assumption<OrdinaryWageInput>[] = [
  hoursA<OrdinaryWageInput>(60),
  money("bonusAnnual", "연 정기상여금", "1년에 받는 정기 상여", (x) => x.bonusAnnual, (x, v) => ({ ...x, bonusAnnual: Math.max(0, v) }), () => [0, 20_000_000], undefined, "fact"),
  money("fixedAllowances", "월 고정수당", "매달 고정으로 받는 수당", (x) => x.fixedAllowances, (x, v) => ({ ...x, fixedAllowances: Math.max(0, v) }), () => [0, 1_500_000], undefined, "fact"),
];

// ───────────────────────── 포괄임금 고정 연장수당 ─────────────────────────
export const fixedOtShort = (i: FixedOtInput) => fixedOvertimeCheck(i).shortTotal;
export const FIXED_OT_ASSUMPTIONS = (i: FixedOtInput): Assumption<FixedOtInput>[] => {
  const covered = fixedOvertimeCheck(i).coveredHours;
  const h = hoursA<FixedOtInput>(80);
  return [
    { ...h, marks: [{ at: covered, label: "고정수당이 덮는 시간" }, { at: 52, label: "주 12시간 한도" }] },
    money("fixedOtPay", "고정 연장수당", "월급에 들어 있는 고정 수당", (x) => x.fixedOtPay, (x, v) => ({ ...x, fixedOtPay: Math.max(0, v) }), () => [0, 1_500_000], undefined, "fact"),
    { key: "months", label: "이렇게 일한 개월 수", plain: "이렇게 일한 달 수", unit: "months", kind: "fact", get: (x) => x.months ?? 36, set: (x, v) => ({ ...x, months: Math.max(0, Math.round(v)) }), range: () => [0, 36], marks: [{ at: 36, label: "3년 소멸시효" }] },
  ];
};

// ───────────────────────── 종부세 ─────────────────────────
// 집이 여러 채면 공시가격 합계를 바꿀 때 집마다 같은 비율로 늘이거나 줄여요.
export const creTotal = (i: CreInput) => comprehensiveRealEstateTax(i).totalTax;
const scalePrices = (i: CreInput, total: number) => {
  const sum = i.prices.reduce((a, b) => a + b, 0);
  if (sum <= 0) return { ...i, prices: [Math.max(0, total)] };
  return { ...i, prices: i.prices.map((p) => Math.round((p * Math.max(0, total)) / sum)) };
};
export const CRE_ASSUMPTIONS = (i: CreInput): Assumption<CreInput>[] => {
  const list: Assumption<CreInput>[] = [
    money("total", "공시가격 합계", "집값(공시가격) 합계", (x) => x.prices.reduce((a, b) => a + b, 0), scalePrices, () => [0, 6_000_000_000], [{ at: creThreshold(i.oneHouse && i.prices.length === 1), label: "공제선" }], "assumption"),
  ];
  if (i.oneHouse && i.prices.length === 1) {
    list.push(
      { key: "age", label: "나이", plain: "나이", unit: "years", kind: "fact", get: (x) => x.age ?? 0, set: (x, v) => ({ ...x, age: Math.round(v) }), range: () => [40, 80], marks: [{ at: 60, label: "20%" }, { at: 65, label: "30%" }, { at: 70, label: "40%" }] },
      { key: "holdYears", label: "보유 기간", plain: "집을 가진 햇수", unit: "years", kind: "fact", get: (x) => x.holdYears ?? 0, set: (x, v) => ({ ...x, holdYears: Math.round(v) }), range: () => [0, 20], marks: [{ at: 5, label: "20%" }, { at: 10, label: "40%" }, { at: 15, label: "50%" }] },
    );
  }
  return list;
};

// ───────────────────────── 주택임대소득세 ─────────────────────────
export const rentalTax = (i: RentalInput) => rentalIncomeTax(i).tax;
export const RENTAL_ASSUMPTIONS = (i: RentalInput): Assumption<RentalInput>[] => {
  const list: Assumption<RentalInput>[] = [
    money("annualRent", "연 월세 수입", "1년 동안 받는 월세", (x) => x.annualRent, (x, v) => ({ ...x, annualRent: Math.max(0, v) }), () => [0, 40_000_000], [{ at: RENTAL.separateLimit, label: "2천만: 분리과세 끝" }]),
    money("otherIncome", "다른 종합소득금액", "월급 등 다른 소득", (x) => x.otherIncome, (x, v) => ({ ...x, otherIncome: Math.max(0, v) }), () => [0, 150_000_000], [{ at: 20_000_000, label: "2천만: 기본공제 끝" }], "fact"),
  ];
  if (i.houses >= 3) list.push(money("deposits", "보증금 합계", "전세금·보증금 합계", (x) => x.deposits, (x, v) => ({ ...x, deposits: Math.max(0, v) }), () => [0, 2_000_000_000], [{ at: RENTAL.depositFree, label: "3억: 간주임대료 시작" }]));
  return list;
};

// ───────────────────────── 연장·야간·휴일수당(시급을 알 때) ─────────────────────────
export interface OvertimeInput extends WorkHours {
  /** 시간급 통상임금 */
  hourly: number;
  smallFirm?: boolean;
}
export const overtimeTotal = (i: OvertimeInput) => premiumPay(i.hourly, i, i.smallFirm).total;
export const OVERTIME_ASSUMPTIONS: Assumption<OvertimeInput>[] = [
  hoursA<OvertimeInput>(60),
  { key: "night", label: "월 야간근로시간", plain: "밤 10시~아침 6시에 일한 시간", unit: "hours", kind: "fact", get: (x) => x.night, set: (x, v) => ({ ...x, night: Math.max(0, Math.round(v)) }), range: () => [0, 80] },
  { key: "holiday", label: "월 휴일근로시간", plain: "쉬는 날 일한 시간", unit: "hours", kind: "fact", get: (x) => x.holiday, set: (x, v) => ({ ...x, holiday: Math.max(0, Math.round(v)) }), range: () => [0, 40] },
  money("hourly", "시간급 통상임금", "시급", (x) => x.hourly, (x, v) => ({ ...x, hourly: Math.max(0, v) }), () => [10_000, 40_000], [{ at: 10_320, label: "2026 최저임금" }], "fact"),
];

// ───────────────────────── 노인장기요양 본인부담 ─────────────────────────
export const ltcTotal = (i: LtcInput) => longTermCareCopay(i).total;
export const LTC_ASSUMPTIONS = (i: LtcInput): Assumption<LtcInput>[] => {
  if (i.kind === "home") {
    const limit = LTC_2026.homeLimit[i.grade];
    return [money("homeUse", "월 재가급여 이용액", "한 달 쓰는 요양 서비스 비용", (x) => x.homeUse ?? LTC_2026.homeLimit[x.grade], (x, v) => ({ ...x, homeUse: Math.max(0, v) }), () => [0, Math.round(limit * 1.6)], [{ at: limit, label: "등급 한도액" }])];
  }
  return [
    money("dailyExtra", "하루 비급여(식사·간식)", "하루 밥값·간식비", (x) => x.dailyExtra ?? 15_000, (x, v) => ({ ...x, dailyExtra: Math.max(0, v) }), () => [0, 40_000]),
    { key: "days", label: "월 입소 일수", plain: "한 달 머무는 날", unit: "days", kind: "fact", get: (x) => x.days ?? 30, set: (x, v) => ({ ...x, days: Math.max(0, Math.round(v)) }), range: () => [0, 31] },
  ];
};

// ───────────────────────── 부양가족 기본공제 판정 ─────────────────────────
// 본인 총급여와, 첫 번째 가족(보통 배우자)의 총급여를 바꿔 보며 500만 원 절벽을 보여 줘요.
export const dependentsSaving = (i: DependentsInput) => dependentsTax(i).saving;
export const DEPENDENTS_ASSUMPTIONS = (i: DependentsInput): Assumption<DependentsInput>[] => {
  const list: Assumption<DependentsInput>[] = [
    money("salary", "본인 총급여", "내 1년 월급 합계(세전)", (x) => x.salary, (x, v) => ({ ...x, salary: Math.max(0, v) }), () => [20_000_000, 150_000_000], [{ at: 87_000_000, label: "세율 24→35% 근처" }], "fact"),
  ];
  const idx = i.people.length ? Math.max(0, i.people.findIndex((p) => p.relation === "spouse")) : -1;
  if (idx >= 0) {
    const who = RELATION_LABEL[i.people[idx].relation].split("(")[0];
    list.push(money("depWage", `${who} 총급여`, `${who}가 1년에 버는 월급`, (x) => x.people[idx]?.wage ?? 0, (x, v) => ({ ...x, people: x.people.map((p, j) => (j === idx ? { ...p, wage: Math.max(0, v) } : p)) }), () => [0, 10_000_000], [{ at: DEPENDENT_2026.wageOnlyMax, label: "500만: 공제 끝" }]));
  }
  return list;
};

// ───────────────────────── 상장주식 대주주 양도세 ─────────────────────────
export const majorTotal = (i: MajorShareholderInput) => majorShareholderTax(i).total;
export const MAJOR_ASSUMPTIONS: Assumption<MajorShareholderInput>[] = [
  money("gain", "양도차익", "판 값에서 산 값과 수수료를 뺀 이익", (x) => x.gain, (x, v) => ({ ...x, gain: Math.max(0, v) }), () => [0, 1_500_000_000], [{ at: MAJOR_2026.pivot + MAJOR_2026.basicDeduction, label: "3억: 25% 시작" }]),
  money("heldValue", "작년 말 보유 시가", "작년 마지막 거래일에 가진 이 종목 값", (x) => x.heldValue, (x, v) => ({ ...x, heldValue: Math.max(0, v) }), () => [0, 8_000_000_000], [{ at: MAJOR_2026.valueLine, label: "50억: 대주주" }], "fact"),
];

// ───────────────────────── 노동권 묶음 A: 해고예고·휴업·육아기 단축·수습 ─────────────────────────
const num = <I>(key: string, label: string, plain: string, unit: "days" | "months" | "hours", get: (i: I) => number, set: (i: I, v: number) => I, range: [number, number], marks?: { at: number; label: string }[], kind: "fact" | "assumption" = "assumption"): Assumption<I> => ({ key, label, plain, unit, kind, get, set, range: () => range, marks });

export const noticePayAmount = (i: DismissalNoticeInput) => dismissalNoticePay(i).amount;
export const NOTICE_ASSUMPTIONS: Assumption<DismissalNoticeInput>[] = [
  num("noticeDays", "해고 예고 일수", "해고일 며칠 전에 알렸나", "days", (x) => x.noticeDays, (x, v) => ({ ...x, noticeDays: Math.max(0, Math.round(v)) }), [0, 45], [{ at: 30, label: "30일: 수당 없음" }]),
  money("monthlyOrdinaryWage", "월 통상임금", "기본급 + 매달 고정 수당", (x) => x.monthlyOrdinaryWage, (x, v) => ({ ...x, monthlyOrdinaryWage: Math.max(0, v) }), () => [2_000_000, 8_000_000]),
  num("tenureMonths", "계속 근로 개월", "입사하고 몇 달 일했나", "months", (x) => x.tenureMonths, (x, v) => ({ ...x, tenureMonths: Math.max(0, Math.round(v)) }), [0, 24], [{ at: 3, label: "3개월" }], "fact"),
];
export function noticePlain(i: DismissalNoticeInput) {
  const r = dismissalNoticePay(i);
  const head = {
    enoughNotice: "30일 전에 알렸으니 해고예고수당은 없어요.",
    shortTenure: "일한 지 3개월이 안 돼 해고예고수당은 없어요(제26조 단서).",
    disaster: "천재지변 등으로 사업을 계속할 수 없는 경우라 해고예고수당이 없어요. 이 사유는 회사가 증명해야 해요.",
    misconduct: "고의로 큰 손해를 끼친 경우(시행규칙 별표)라 해고예고수당이 없어요. 이 사유는 회사가 증명해야 해요.",
    due: `해고예고수당 약 ${roughWon(r.amount)}을 받을 수 있어요(30일분 통상임금).`,
  }[r.reason];
  const reasons = [`1일 통상임금 ${r.daily.toLocaleString("ko-KR")}원 × 30일로 계산했어요.`];
  if (r.reason === "due" && i.noticeDays > 0) reasons.push(`${i.noticeDays}일 전에 알렸어도 30일에 모자라면 고용노동부는 30일분 전액을 줘야 한다고 봐요.`);
  reasons.push("해고예고수당을 받아도 해고가 정당해지지는 않아요. 정당한 이유(제23조)는 따로 따져요.");
  return { headline: head, reasons };
}

export const shutdownMin = (i: ShutdownPayInput) => shutdownAllowance(i).statutory;
export const SHUTDOWN_ASSUMPTIONS: Assumption<ShutdownPayInput>[] = [
  num("shutdownDays", "휴업 일수", "회사 사정으로 쉰 날", "days", (x) => x.shutdownDays, (x, v) => ({ ...x, shutdownDays: Math.max(0, Math.round(v)) }), [0, 92], [{ at: 30, label: "한 달" }]),
  money("threeMonthWages", "3개월 임금 총액", "쉬기 전 석 달 월급 합계", (x) => x.threeMonthWages, (x, v) => ({ ...x, threeMonthWages: Math.max(0, v) }), () => [6_000_000, 24_000_000]),
  money("paidDuringShutdown", "쉬는 동안 받은 임금", "쉬는 기간 중 일부 일하고 받은 돈", (x) => x.paidDuringShutdown, (x, v) => ({ ...x, paidDuringShutdown: Math.max(0, v) }), () => [0, 3_000_000]),
];

export const reducedTotal = (i: ReducedHoursInput) => reducedHoursPay(i).total;
export const REDUCED_ASSUMPTIONS = (i: ReducedHoursInput): Assumption<ReducedHoursInput>[] => [
  num("afterHours", "단축 뒤 주 근로시간", "줄인 뒤 한 주에 일하는 시간", "hours", (x) => x.afterHours, (x, v) => ({ ...x, afterHours: Math.round(v) }), [REDUCED_HOURS_2026.minAfter, Math.min(REDUCED_HOURS_2026.maxAfter, Math.max(REDUCED_HOURS_2026.minAfter, i.beforeHours - 1))], [{ at: i.beforeHours - REDUCED_HOURS_2026.firstHours, label: "10시간 줄임" }]),
  money("monthlyOrdinaryWage", "월 통상임금", "줄이기 전 한 달 월급(고정분)", (x) => x.monthlyOrdinaryWage, (x, v) => ({ ...x, monthlyOrdinaryWage: Math.max(0, v) }), () => [1_500_000, 7_000_000], [{ at: REDUCED_HOURS_2026.capFirst, label: "250만: 상한" }]),
];
export function reducedPlain(i: ReducedHoursInput) {
  const r = reducedHoursPay(i);
  if (!r.valid) return { headline: "단축 뒤 근로시간은 주 15시간 이상 35시간 이하여야 해요.", reasons: ["이 범위를 벗어나면 육아기 근로시간 단축이 아니라 급여도 나오지 않아요."] };
  const reasons = [
    `처음 ${r.firstCut}시간 줄인 몫은 통상임금 100%(기준액 상한 250만 원)로 ${roughWon(r.first)}을 받아요.`,
  ];
  if (r.restCut > 0) reasons.push(`그 위로 ${r.restCut}시간 더 줄인 몫은 80%(상한 160만 원)로 ${roughWon(r.rest)}이에요.`);
  if (r.cappedFirst) reasons.push("월급이 250만 원보다 많아 상한에 걸려, 줄어든 월급을 다 채우지는 못해요.");
  return { headline: `한 달에 회사 월급 약 ${roughWon(r.companyPay)} + 고용보험 단축급여 약 ${roughWon(r.benefit)} = 약 ${roughWon(r.total)}을 받아요(추정).`, reasons };
}

export const probationShort = (i: ProbationInput) => probationMinWage(i).shortMonthly;
export const PROBATION_ASSUMPTIONS: Assumption<ProbationInput>[] = [
  money("hourlyWage", "시급", "받는 시급(월급 ÷ 209)", (x) => x.hourlyWage, (x, v) => ({ ...x, hourlyWage: Math.max(0, Math.round(v)) }), () => [8_000, 12_000], [{ at: 9_288, label: "90%: 9,288원" }, { at: 10_320, label: "최저 10,320원" }]),
  num("monthsIntoProbation", "수습 경과 개월", "수습 시작하고 지난 달 수", "months", (x) => x.monthsIntoProbation, (x, v) => ({ ...x, monthsIntoProbation: Math.max(0, Math.round(v)) }), [0, 6], [{ at: 3, label: "3개월: 감액 끝" }], "fact"),
];

// ───────────────────────── 하도급대금 직접 지급·지연이자 ─────────────────────────
export const subcontractLate = (i: DirectPayInput) => directPaymentCheck(i).lateInterest;
export const SUBCONTRACT_ASSUMPTIONS: Assumption<DirectPayInput>[] = [
  num("daysSinceDelivery", "수령일부터 지난 날", "물건·공사를 넘긴 날부터 오늘까지", "days", (x) => x.daysSinceDelivery, (x, v) => ({ ...x, daysSinceDelivery: Math.max(0, Math.round(v)) }), [0, 365], [{ at: 60, label: "60일: 지급 기한" }]),
  money("workValue", "이행한 부분 하도급대금", "내가 한 일의 대금", (x) => x.workValue, (x, v) => ({ ...x, workValue: Math.max(0, v) }), () => [0, 200_000_000]),
  money("receivedFromPrime", "원사업자에게 받은 돈", "이미 받은 금액", (x) => x.receivedFromPrime, (x, v) => ({ ...x, receivedFromPrime: Math.max(0, v) }), () => [0, 200_000_000]),
];

// ───────────────────────── 가족 사이 돈·집 거래, 상가 임대료 (Gemini 이전 B) ─────────────────────────
const rateA = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, range: [number, number], marks?: { at: number; label: string }[]): Assumption<I> => ({ key, label, plain, unit: "rate", kind: "assumption", get, set, range: () => range, marks });

export const familyLoanAmount = (i: FamilyLoanInput) => familyLoanGift(i).gift;
export const FAMILY_LOAN_ASSUMPTIONS: Assumption<FamilyLoanInput>[] = [
  money("principal", "차입 원금", "빌린 돈", (x) => x.principal, (x, v) => ({ ...x, principal: Math.max(0, v) }), (a) => [0, Math.max(600_000_000, a * 1.5)], [{ at: Math.ceil(FAMILY_2026.loanThreshold / FAMILY_2026.fairRate), label: "무이자 2.17억" }]),
  rateA("rate", "약정 이자율", "실제로 주는 이자율", (x) => x.rate, (x, v) => ({ ...x, rate: Math.max(0, v) }), [0, 0.06], [{ at: FAMILY_2026.fairRate, label: "적정 4.6%" }]),
];

export const freeUseAmount = (i: FreeUseInput) => freeUseGift(i).useGift + freeUseGift(i).collateralGift;
export const FREE_USE_ASSUMPTIONS: Assumption<FreeUseInput>[] = [
  money("propertyValue", "부동산 시가", "부모님 집값", (x) => x.propertyValue, (x, v) => ({ ...x, propertyValue: Math.max(0, v) }), (a) => [0, Math.max(3_000_000_000, a * 1.5)], [{ at: Math.ceil(FAMILY_2026.useThreshold / (FAMILY_2026.useRate * FREE_USE_FACTOR)), label: "약 13.2억" }]),
];

export const lowPriceGift = (i: LowPriceSaleInput) => lowPriceSale(i).gift;
export const lowPriceMarks = (i: LowPriceSaleInput) => {
  const r = lowPriceSale(i);
  return [
    { at: r.noGiftAbove, label: "증여 경계" },
    { at: r.noRecalcAbove, label: "양도세 경계" },
  ];
};
export const LOW_PRICE_ASSUMPTIONS = (i: LowPriceSaleInput): Assumption<LowPriceSaleInput>[] => [
  money("price", "실제 거래가", "가족끼리 정한 값", (x) => x.price, (x, v) => ({ ...x, price: Math.max(0, v) }), () => [0, Math.max(1, i.marketValue)], lowPriceMarks(i)),
  money("marketValue", "시가", "주변 시세·감정가", (x) => x.marketValue, (x, v) => ({ ...x, marketValue: Math.max(0, v) }), (a) => [Math.max(0, i.price), Math.max(a * 1.6, i.price * 2)], undefined, "fact"),
];

export const commercialExcess = (i: CommercialRentInput) => commercialRentCheck(i).rentExcess;
export const COMMERCIAL_ASSUMPTIONS = (i: CommercialRentInput): Assumption<CommercialRentInput>[] => [
  money("newMonthlyRent", "올리려는 월세", "새 월세", (x) => x.newMonthlyRent, (x, v) => ({ ...x, newMonthlyRent: Math.max(0, v) }), () => [i.monthlyRent * 0.9, i.monthlyRent * 1.2], [{ at: Math.floor(i.monthlyRent * 1.05), label: "5%" }]),
  rateA("baseRate", "한국은행 기준금리", "기준금리", (x) => x.baseRate ?? COMMERCIAL_LEASE.baseRate, (x, v) => ({ ...x, baseRate: Math.max(0, v) }), [0, 0.05], [{ at: COMMERCIAL_LEASE.conversionCap / COMMERCIAL_LEASE.baseRateMultiple, label: "12% 상한 시작" }]),
];

// ───────────────────────── 청년 감면·노란우산·간이과세 (Gemini 이전 B 2차) ─────────────────────────
export const youthYearly = (i: SmeYouthInput) => smeYouthReduction(i).yearly;
export const YOUTH_ASSUMPTIONS: Assumption<SmeYouthInput>[] = [
  money("salary", "총급여", "1년 연봉(비과세 빼고)", (x) => x.salary, (x, v) => ({ ...x, salary: Math.max(0, v) }), (a) => [15_000_000, Math.max(100_000_000, a * 1.5)]),
];

export const umbrellaSaved = (i: YellowUmbrellaInput) => yellowUmbrella(i).saved;
export const UMBRELLA_ASSUMPTIONS = (i: YellowUmbrellaInput): Assumption<YellowUmbrellaInput>[] => [
  money("paid", "1년 납입액", "1년에 넣는 돈", (x) => x.paid, (x, v) => ({ ...x, paid: Math.max(0, v) }), () => [0, YELLOW_UMBRELLA.annualPayCap], [{ at: yellowUmbrella(i).limit, label: "공제 한도" }]),
  money("income", i.kind === "ceo" ? "총급여" : "사업소득금액", i.kind === "ceo" ? "1년 급여" : "1년 매출 − 경비", (x) => x.income, (x, v) => ({ ...x, income: Math.max(0, v) }), (a) => [0, Math.max(150_000_000, a * 1.5)], i.kind === "ceo" ? [{ at: YELLOW_UMBRELLA.ceoSalaryMax, label: "8천만" }] : [{ at: 40_000_000, label: "4천만" }, { at: 60_000_000, label: "6천만" }, { at: 100_000_000, label: "1억" }], "fact"),
];

export const vatSaving = (i: VatTypeInput) => vatTypeCompare(i).saving;
export const VAT_TYPE_ASSUMPTIONS: Assumption<VatTypeInput>[] = [
  money("sales", "공급대가(매출, 부가세 포함)", "1년 매출", (x) => x.sales, (x, v) => ({ ...x, sales: Math.max(0, v) }), (a) => [0, Math.max(150_000_000, a * 1.5)], [{ at: SIMPLIFIED_VAT.exemptBelow, label: "4,800만" }, { at: SIMPLIFIED_VAT.threshold, label: "1억 400만" }], "fact"),
  money("purchases", "매입(부가세 포함)", "세금계산서·카드로 산 재료·비용", (x) => x.purchases, (x, v) => ({ ...x, purchases: Math.max(0, v) }), (a) => [0, Math.max(100_000_000, a * 2)]),
];
