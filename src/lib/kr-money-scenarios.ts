// 2묶음(집·대출·저축·노무) 계산기의 가정 목록·다리 단계·쉬운 결과 문장 (2026-11-16).
// 계산은 각 엔진 파일이 하고, 여기는 "무엇을 바꿔 볼 수 있고 어떻게 설명할지"만 정해요.
import { computeEmployerInsurance } from "./finance/salary-calculator.ts";
import { depositInterest, type DepositKind } from "./kr-deposit.ts";
import { MEDICAL_CREDIT, medicalExpenseCredit } from "./kr-medical-cost-2026.ts";
import { EMPLOYER_EMPLOYMENT_STABILITY, RATES, weeklyHolidayPay } from "./kr-payroll-2026.ts";
import { fixedRange, josa, roughWon, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

export const driverLine = (top: TornadoBar | undefined, what: string) =>
  top && top.span > 0
    ? `결과를 가장 크게 움직이는 건 ${josa(top.plain, "이에요", "예요")}. 이 값이 20% 늘거나 줄면 ${josa(what, "이", "가")} 약 ${roughWon(Math.min(top.low, top.high))}에서 ${roughWon(Math.max(top.low, top.high))} 사이로 바뀌어요.`
    : null;

const money = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number], marks?: { at: number; label: string }[]): Assumption<I> => ({
  key, label, plain, unit: "won", kind: "assumption", get, set, range, ...(marks ? { marks } : {}),
});

// ───────────────────────── 예금·적금 ─────────────────────────

export interface DepositLite {
  kind: DepositKind;
  amount: number;
  /** 연이율(0.035 = 3.5%) */
  rate: number;
  months: number;
  compound: boolean;
  /** 0.154 일반과세, 0 비과세, 0.014 조합 예탁금 */
  taxRate: number;
}

export const depositResult = (i: DepositLite) =>
  depositInterest({ kind: i.kind, amount: i.amount, annualRate: i.rate, months: Math.max(1, Math.round(i.months)), compound: i.compound, taxRate: i.taxRate }) ?? { principal: 0, interest: 0, tax: 0, afterTaxInterest: 0, total: 0 };
export const depositNet = (i: DepositLite) => depositResult(i).afterTaxInterest;

export const DEPOSIT_ASSUMPTIONS: Assumption<DepositLite>[] = [
  money<DepositLite>("amount", "원금(월 납입액)", "넣는 돈", (i) => i.amount, (i, v) => ({ ...i, amount: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 1_000_000)]),
  { key: "rate", label: "연이율", plain: "이자율", unit: "rate", kind: "assumption", get: (i) => i.rate, set: (i, v) => ({ ...i, rate: Math.max(0, v) }), range: fixedRange(0, 0.08) },
  { key: "months", label: "기간", plain: "기간", unit: "months", kind: "assumption", get: (i) => i.months, set: (i, v) => ({ ...i, months: Math.max(1, Math.round(v)) }), range: fixedRange(1, 60), marks: [{ at: 12, label: "1년" }, { at: 36, label: "3년" }] },
];

export function depositBridge(i: DepositLite): BridgeStep[] {
  const r = depositResult(i);
  return [
    { label: i.kind === "deposit" ? "넣은 돈" : "넣은 돈 합계", value: r.principal, kind: "total" },
    { label: "이자(세전)", value: r.interest, kind: "add" },
    { label: i.taxRate === 0 ? "세금 없음" : `이자 세금 ${(i.taxRate * 100).toFixed(1)}%`, value: -r.tax, kind: "add" },
    { label: "만기에 받는 돈", value: r.total, kind: "total" },
  ];
}

export function depositPlain(i: DepositLite, top?: TornadoBar) {
  const r = depositResult(i);
  const what = i.kind === "deposit" ? `${roughWon(i.amount)}을 ${i.months}개월 맡기면` : `매달 ${roughWon(i.amount)}씩 ${i.months}개월 넣으면`;
  const effective = r.principal > 0 && i.kind === "savings" ? (r.afterTaxInterest / (i.amount * (i.months + 1) / 2)) * (12 / i.months) : null;
  const reasons = [
    i.kind === "savings" ? `적금은 첫 달 돈만 전체 기간 이자가 붙고 마지막 달 돈은 1개월치만 붙어요. 그래서 실제로 받는 이자는 같은 이율 예금의 절반쯤이에요${effective !== null ? `(세후 실제 수익률 약 ${(effective * 100).toFixed(1)}%)` : ""}.` : "예금은 처음 넣은 돈 전체에 기간 내내 이자가 붙어요.",
    i.taxRate === 0.154 ? `이자의 15.4%(소득세 14% + 지방세 1.4%)를 떼요. 비과세 계좌(ISA 등)면 ${roughWon(r.tax)}을 아낄 수 있어요.` : i.taxRate === 0 ? "비과세라 이자를 다 받아요." : `세율 ${(i.taxRate * 100).toFixed(1)}%로 계산했어요.`,
  ];
  return { headline: `${what} 세금 떼고 이자 약 ${roughWon(r.afterTaxInterest)}, 만기에 약 ${roughWon(r.total)}을 받아요.`, driver: driverLine(top, "세후 이자"), reasons };
}

// ───────────────────────── 인건비(사업주) ─────────────────────────

export type CompanySize = keyof typeof EMPLOYER_EMPLOYMENT_STABILITY;

export interface LaborLite {
  salary: number;
  meal: number;
  /** 산재보험료율(0.015 = 1.5%) */
  workComp: number;
  size: CompanySize;
  severance: boolean;
}

export function laborCost(i: LaborLite) {
  const taxable = Math.max(0, i.salary - Math.min(i.meal, 200_000));
  const ins = computeEmployerInsurance(taxable, { stabilityRate: EMPLOYER_EMPLOYMENT_STABILITY[i.size], workCompRate: i.workComp });
  const sev = i.severance ? Math.floor(i.salary / 12) : 0;
  return { taxable, ins, sev, total: i.salary + ins.total + sev };
}
export const laborTotal = (i: LaborLite) => laborCost(i).total;

export const LABOR_ASSUMPTIONS: Assumption<LaborLite>[] = [
  money<LaborLite>("salary", "월 급여", "직원 월급(세전)", (i) => i.salary, (i, v) => ({ ...i, salary: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 6_000_000)]),
  money<LaborLite>("meal", "비과세 식대", "식대", (i) => i.meal, (i, v) => ({ ...i, meal: Math.max(0, v) }), fixedRange(0, 300_000), [{ at: 200_000, label: "비과세 한도" }]),
  { key: "workComp", label: "산재보험료율", plain: "산재보험 요율", unit: "rate", kind: "assumption", get: (i) => i.workComp, set: (i, v) => ({ ...i, workComp: Math.max(0, v) }), range: fixedRange(0, 0.05) },
];

export function laborBridge(i: LaborLite): BridgeStep[] {
  const r = laborCost(i);
  const steps: BridgeStep[] = [
    { label: "월급", value: i.salary, kind: "total" },
    { label: "국민연금(회사 몫)", value: r.ins.pension, kind: "add" },
    { label: "건강·장기요양", value: r.ins.health + r.ins.ltc, kind: "add" },
    { label: "고용보험", value: r.ins.employment, kind: "add" },
  ];
  if (r.ins.workComp > 0) steps.push({ label: "산재보험", value: r.ins.workComp, kind: "add" });
  if (r.sev > 0) steps.push({ label: "퇴직금 적립", value: r.sev, kind: "add" });
  steps.push({ label: "회사가 쓰는 돈", value: r.total, kind: "total" });
  return steps;
}

export function laborPlain(i: LaborLite, top?: TornadoBar) {
  const r = laborCost(i);
  const pct = i.salary > 0 ? ((r.total - i.salary) / i.salary) * 100 : 0;
  return {
    headline: `월급 ${roughWon(i.salary)}인 직원 한 명에 회사는 매달 약 ${roughWon(r.total)}을 써요(월급보다 ${pct.toFixed(0)}% 더).`,
    driver: driverLine(top, "인건비"),
    reasons: [
      `4대 보험 회사 몫이 ${roughWon(r.ins.total)}이에요. 국민연금·건강보험은 직원이 내는 만큼 회사도 내요.`,
      i.meal > 0 ? `식대는 월 20만 원까지 보험료를 매기지 않아서 그만큼 보험료가 줄어요.` : "식대를 비과세(월 20만 원까지)로 주면 회사와 직원 보험료가 둘 다 줄어요.",
      i.severance ? `1년 넘게 일하면 퇴직금이 생겨서 매달 월급의 1/12(${roughWon(r.sev)})을 따로 모아 두는 게 좋아요.` : "1년 넘게 일하면 퇴직금(월급의 약 1/12 × 근속 개월)이 생겨요.",
    ],
  };
}

// ───────────────────────── 주휴수당 ─────────────────────────

export interface WeeklyLite {
  hourly: number;
  days: number;
  hours: number;
}

export const weeklyResult = (i: WeeklyLite) =>
  weeklyHolidayPay({ hourlyWage: Math.max(1, i.hourly), daysPerWeek: Math.min(7, Math.max(1, i.days)), hoursPerDay: Math.min(24, Math.max(0.5, i.hours)) });
export const weeklyMonthly = (i: WeeklyLite) => weeklyResult(i).monthlyPay;

export const WEEKLY_ASSUMPTIONS: Assumption<WeeklyLite>[] = [
  money<WeeklyLite>("hourly", "시급", "시급", (i) => i.hourly, (i, v) => ({ ...i, hourly: Math.max(1, Math.round(v / 10) * 10) }), () => [RATES.minimumWage, Math.round(RATES.minimumWage * 2)], [{ at: RATES.minimumWage, label: "최저임금" }]),
  { key: "days", label: "주 소정근로일", plain: "일주일에 일하는 날", unit: "days", kind: "assumption", get: (i) => i.days, set: (i, v) => ({ ...i, days: Math.min(7, Math.max(1, Math.round(v))) }), range: fixedRange(1, 6) },
  { key: "hours", label: "1일 소정근로시간", plain: "하루 일하는 시간", unit: "hours", kind: "assumption", get: (i) => i.hours, set: (i, v) => ({ ...i, hours: Math.min(12, Math.max(0.5, Math.round(v * 2) / 2)) }), range: fixedRange(1, 10) },
];

export function weeklyBridge(i: WeeklyLite): BridgeStep[] {
  const r = weeklyResult(i);
  return [
    { label: `일한 시간 ${r.weeklyHours}시간`, value: r.weeklyPay - r.holidayPay, kind: "add" },
    { label: "주휴수당", value: r.holidayPay, kind: "add" },
    { label: "한 주 받는 돈", value: r.weeklyPay, kind: "total" },
  ];
}

export function weeklyPlain(i: WeeklyLite, top?: TornadoBar) {
  const r = weeklyResult(i);
  const reasons: string[] = [];
  if (r.weeklyHours < 15) reasons.push(`일주일에 ${r.weeklyHours}시간이라 15시간이 안 돼서 주휴수당이 없어요. 하루 ${Math.ceil(((15 - r.weeklyHours) / i.days) * 2) / 2}시간만 늘려도 생겨요.`);
  else reasons.push(`일주일에 15시간 넘게 일해서, 그 주를 다 나오면 하루치(${(r.holidayHours).toFixed(1)}시간)를 더 받아요.`);
  if (r.belowMinimumWage) reasons.push(`시급이 2026년 최저임금 ${RATES.minimumWage.toLocaleString("ko-KR")}원보다 낮아요. 최저임금 위반일 수 있어요.`);
  reasons.push("월급은 한 주 받는 돈 × 4.345주로 어림했어요.");
  return {
    headline: r.holidayPay > 0 ? `주휴수당은 한 주 약 ${roughWon(r.holidayPay)}, 한 달이면 약 ${roughWon(r.monthlyPay)}을 받아요.` : `주휴수당 없이 한 달 약 ${roughWon(r.monthlyPay)}을 받아요.`,
    driver: driverLine(top, "한 달 받는 돈"),
    reasons,
  };
}

// ───────────────────────── 의료비 세액공제 ─────────────────────────

export interface MedicalLite {
  salary: number;
  /** 본인·65세 이상·장애인·6세 이하 */
  specific: number;
  /** 그 밖의 부양가족 */
  general: number;
  premature: number;
  infertility: number;
}

export const medicalResult = (i: MedicalLite) => medicalExpenseCredit(Math.max(0, i.salary), { general: Math.max(0, i.general), specific: Math.max(0, i.specific), premature: Math.max(0, i.premature), infertility: Math.max(0, i.infertility) });
export const medicalSaved = (i: MedicalLite) => medicalResult(i).withLocal;

export const MEDICAL_ASSUMPTIONS: Assumption<MedicalLite>[] = [
  { ...money<MedicalLite>("salary", "총급여", "연봉", (i) => i.salary, (i, v) => ({ ...i, salary: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 100_000_000)]), kind: "fact" },
  money<MedicalLite>("specific", "본인 등 의료비", "나·65세 이상·6세 이하 병원비", (i) => i.specific, (i, v) => ({ ...i, specific: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 10_000_000)]),
  money<MedicalLite>("general", "일반 부양가족 의료비", "다른 가족 병원비", (i) => i.general, (i, v) => ({ ...i, general: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 10_000_000)], [{ at: MEDICAL_CREDIT.generalCap, label: "700만 한도" }]),
  money<MedicalLite>("infertility", "난임시술비", "난임 시술비", (i) => i.infertility, (i, v) => ({ ...i, infertility: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 10_000_000)]),
];

export function medicalBridge(i: MedicalLite): BridgeStep[] {
  const r = medicalResult(i);
  const spent = i.general + i.specific + i.premature + i.infertility;
  return [
    { label: "쓴 병원비", value: spent, kind: "add" },
    { label: "연봉 3% 문턱", value: -Math.min(spent, r.floor), kind: "add" },
    ...(spent - Math.min(spent, r.floor) > r.generalBase + r.specificBase + r.prematureBase + r.infertilityBase ? [{ label: "700만 원 넘는 몫", value: -(spent - Math.min(spent, r.floor) - (r.generalBase + r.specificBase + r.prematureBase + r.infertilityBase)), kind: "add" as const }] : []),
    { label: "공제 대상", value: r.generalBase + r.specificBase + r.prematureBase + r.infertilityBase, kind: "total" },
  ];
}

export function medicalPlain(i: MedicalLite, top?: TornadoBar) {
  const r = medicalResult(i);
  const spent = i.general + i.specific + i.premature + i.infertility;
  if (r.withLocal === 0)
    return {
      headline: `병원비가 연봉의 3%(${roughWon(r.floor)})를 넘지 않아서 의료비 공제가 없어요.`,
      driver: null,
      reasons: [`${roughWon(Math.max(0, r.floor - spent))}을 더 써야 공제가 시작돼요. 가족 중 연봉이 낮은 사람에게 몰아주면 문턱이 낮아져요.`],
    };
  return {
    headline: `의료비 공제로 세금이 약 ${roughWon(r.withLocal)} 줄어요(지방소득세 포함, 추정).`,
    driver: driverLine(top, "줄어드는 세금"),
    reasons: [
      `연봉의 3%(${roughWon(r.floor)})를 넘게 쓴 몫의 15%를 빼 줘요. 난임시술비는 30%, 미숙아 의료비는 20%예요.`,
      "다른 가족 병원비는 700만 원까지만, 나·65세 이상·6세 이하 병원비는 한도 없이 빼 줘요.",
      "실손보험으로 돌려받은 돈은 빼고 넣어야 해요.",
    ],
  };
}
