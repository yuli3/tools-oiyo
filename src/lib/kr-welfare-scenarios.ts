// 생활 지원금·노동권 도구의 가정 목록과 쉬운 결과 문장 (2026-11-16).
// 계산은 kr-welfare-2026.ts, 여기는 "무엇을 바꿔 볼 수 있고 어떻게 설명할지"만 정해요.
import {
  ASSET_CAP, ASSET_HALF, CTC_TABLE, EITC_TABLE, INJURY_2026, RENT_CREDIT,
  dbVsDc, fixedOvertimeCheck, premiumPay, injuryLeavePay, maternityLeavePay, monthlyRentCredit, ordinaryWage, wageGuarantee, workChildCredit,
  type EitcInput, type FixedOtInput, type WorkHours, type GuaranteeInput, type InjuryInput, type MaternityInput, type OrdinaryWageInput, type PensionInput, type RentInput,
} from "./kr-welfare-2026.ts";
import { RENTAL, comprehensiveRealEstateTax, creThreshold, rentalIncomeTax, type CreInput, type RentalInput } from "./kr-home-tax-2026.ts";
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
