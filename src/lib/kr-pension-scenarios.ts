// 2묶음 마지막(연금·투자 세금·부가세) 계산기의 가정 목록·쉬운 결과 문장 (2026-11-16).
// ISA vs 연금, 연금저축 세액공제, 연금 최적화, 해외주식 절세, 분리 vs 종합과세, 부가세.
// 세율 근거: 소득세법 제59조의3(연금계좌 세액공제)·제129조(연금소득 원천징수)·제62조(금융소득)·제103·104조(해외주식),
// 조세특례제한법 제91조의18(ISA), 부가가치세법 제30·37·46조. 2026-11-16 기준.
import { FINANCIAL_THRESHOLD, FOREIGN_STOCK_RATE, STOCK_GAIN_DEDUCTION, financialIncomeTax } from "./kr-investment-tax.ts";
import { driverLine } from "./kr-money-scenarios.ts";
import { KR_RATES_2026, earnedIncomeDeduction } from "./kr-rates-2026.mjs";
import { VAT_RATES } from "./kr-vat-2026.ts";
import { fixedRange, roughWon, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

const exact = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pct = (r: number) => `${(r * 100).toFixed(1).replace(/\.0$/, "")}%`;
const LOCAL = KR_RATES_2026.incomeTax.localIncomeTaxRate;
const won = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number], marks?: { at: number; label: string }[]): Assumption<I> => ({
  key, label, plain, unit: "won", kind: "assumption", get, set, range, ...(marks ? { marks } : {}),
});

// ───────────────────────── 연금계좌 세액공제 공통 ─────────────────────────

export const PENSION = {
  savingsCap: 6_000_000, // 연금저축 세액공제 한도
  totalCap: 9_000_000, // IRP 합산 한도
  contributionCap: 18_000_000, // 연금계좌 연 납입 한도
  lowRate: 0.165, // 총급여 5,500만(종합소득 4,500만) 이하, 지방세 포함
  highRate: 0.132,
  earnedLine: 55_000_000,
  compLine: 45_000_000,
  /** 연금 수령 때 원천징수(지방세 포함): 70세 미만 5.5%, 70~79세 4.4%, 80세 이상 3.3% */
  receiptTax: 0.055,
} as const;

export const pensionCreditRate = (income: number, type: "earned" | "comprehensive" = "earned") =>
  income <= (type === "earned" ? PENSION.earnedLine : PENSION.compLine) ? PENSION.lowRate : PENSION.highRate;

/** 연금저축·IRP 세액공제(지방소득세 포함). 결정세액 한도는 보지 않아요. */
export function pensionCredit(type: "earned" | "comprehensive", income: number, savings: number, irp: number) {
  const rate = pensionCreditRate(income, type);
  const savingsCounted = Math.min(Math.max(0, savings), PENSION.savingsCap);
  const base = Math.min(savingsCounted + Math.max(0, irp), PENSION.totalCap);
  return { rate, savingsCounted, irpCounted: base - savingsCounted, base, refund: Math.floor(base * rate), room: PENSION.totalCap - base };
}

/** 매년 초에 같은 돈을 넣고 연 r로 굴렸을 때 n년 뒤 평가액 */
const futureValue = (annual: number, r: number, n: number) => {
  let fv = 0;
  for (let k = 0; k < n; k++) fv += annual * Math.pow(1 + r, n - k);
  return fv;
};

// ───────────────────────── ISA vs 연금저축 ─────────────────────────

export const ISA = { annualCap: 20_000_000, normalFree: 2_000_000, eligibleFree: 4_000_000, overRate: 0.099, generalRate: 0.154 } as const;

export interface IsaPensionLite {
  /** 1년에 넣을 돈 */
  annual: number;
  years: number;
  /** 연 기대수익률 */
  ret: number;
  /** 총급여 */
  income: number;
  type: "normal" | "eligible";
}

export function isaPensionResult(i: IsaPensionLite) {
  const n = Math.max(1, Math.round(i.years));
  const r = Math.max(-0.5, i.ret);
  const isaIn = Math.min(Math.max(0, i.annual), ISA.annualCap);
  const isaPaid = isaIn * n;
  const isaGain = Math.max(0, Math.floor(futureValue(isaIn, r, n) - isaPaid));
  const free = i.type === "eligible" ? ISA.eligibleFree : ISA.normalFree;
  const isaTax = Math.floor(Math.max(0, isaGain - free) * ISA.overRate);
  const isaBenefit = Math.floor(isaGain * ISA.generalRate) - isaTax;

  const penIn = Math.min(Math.max(0, i.annual), PENSION.contributionCap);
  const penPaid = penIn * n;
  const penGain = Math.max(0, Math.floor(futureValue(penIn, r, n) - penPaid));
  const credited = Math.min(penIn, PENSION.totalCap);
  const rate = pensionCreditRate(i.income);
  const credits = Math.floor(credited * rate) * n;
  // 세액공제 받은 원금과 운용수익은 연금으로 받을 때 5.5%, 공제 안 받은 원금은 세금 없음
  const pensionTax = Math.floor((credited * n + penGain) * PENSION.receiptTax);
  const penBenefit = credits + Math.floor(penGain * ISA.generalRate) - pensionTax;
  return {
    isa: { paid: isaPaid, gain: isaGain, tax: isaTax, benefit: isaBenefit, free },
    pension: { paid: penPaid, gain: penGain, credits, tax: pensionTax, benefit: penBenefit, rate, credited },
  };
}
/** 일반 계좌(15.4%)보다 아끼는 세금의 차이: + 면 연금저축, − 면 ISA가 유리 */
export const isaPensionGap = (i: IsaPensionLite) => {
  const r = isaPensionResult(i);
  return r.pension.benefit - r.isa.benefit;
};

export const ISA_PENSION_ASSUMPTIONS: Assumption<IsaPensionLite>[] = [
  won<IsaPensionLite>("annual", "연 납입액", "1년에 넣는 돈", (i) => i.annual, (i, v) => ({ ...i, annual: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 20_000_000)], [{ at: PENSION.totalCap, label: "연금 공제 한도" }]),
  { key: "years", label: "운용 기간", plain: "기간", unit: "years", kind: "assumption", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 30) },
  { key: "ret", label: "연 기대수익률", plain: "수익률", unit: "rate", kind: "assumption", get: (i) => i.ret, set: (i, v) => ({ ...i, ret: v }), range: fixedRange(0, 0.1) },
  won<IsaPensionLite>("income", "총급여", "연봉", (i) => i.income, (i, v) => ({ ...i, income: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 100_000_000)], [{ at: PENSION.earnedLine, label: "16.5%↔13.2%" }]),
];

export function isaPensionCompare(i: IsaPensionLite) {
  const r = isaPensionResult(i);
  const best = Math.max(r.isa.benefit, r.pension.benefit);
  return [
    { label: "ISA", value: r.isa.benefit, current: r.isa.benefit === best },
    { label: "연금저축·IRP", value: r.pension.benefit, current: r.pension.benefit === best },
  ];
}

export function isaPensionPlain(i: IsaPensionLite, top?: TornadoBar) {
  const r = isaPensionResult(i);
  const gap = r.pension.benefit - r.isa.benefit;
  const winner = gap >= 0 ? "연금저축·IRP" : "ISA";
  return {
    headline: `해마다 ${roughWon(i.annual)}씩 ${i.years}년 넣으면 ${winner} 쪽이 일반 계좌보다 세금을 약 ${roughWon(Math.abs(gap))} 더 아껴요.`,
    driver: driverLine(top, "두 계좌의 차이"),
    reasons: [
      `연금저축·IRP는 넣을 때 해마다 ${pct(r.pension.rate)}(최대 900만 원분)를 돌려받아 모두 ${roughWon(r.pension.credits)}이에요. 대신 55세 이후 연금으로 받을 때 ${pct(PENSION.receiptTax)}(약 ${roughWon(r.pension.tax)})를 내요.`,
      `ISA는 수익 ${roughWon(r.isa.free)}까지 세금이 없고 넘는 돈은 9.9%만 내요. 3년 뒤면 꺼내 쓸 수 있어 돈이 묶이는 기간이 짧아요.`,
      "연금저축을 55세 전에 깨면 공제받은 돈과 수익에 16.5%를 내요. 급하게 쓸 돈은 ISA, 노후 돈은 연금 계좌가 맞아요.",
      "ISA 만기 돈을 60일 안에 연금 계좌로 옮기면 옮긴 돈의 10%(최대 300만 원)를 추가로 세액공제받아요.",
    ],
  };
}

// ───────────────────────── 연금저축·IRP 세액공제 ─────────────────────────

export interface PensionCreditLite {
  type: "earned" | "comprehensive";
  income: number;
  savings: number;
  irp: number;
}

export const pensionCreditOf = (i: PensionCreditLite) => pensionCredit(i.type, i.income, i.savings, i.irp);
export const pensionRefund = (i: PensionCreditLite) => pensionCreditOf(i).refund;

export const PENSION_CREDIT_ASSUMPTIONS: Assumption<PensionCreditLite>[] = [
  won<PensionCreditLite>("savings", "연금저축 납입액", "연금저축에 넣는 돈(1년)", (i) => i.savings, (i, v) => ({ ...i, savings: Math.max(0, v) }), () => [0, 12_000_000], [{ at: PENSION.savingsCap, label: "600만" }]),
  won<PensionCreditLite>("irp", "IRP 납입액", "IRP에 넣는 돈(1년)", (i) => i.irp, (i, v) => ({ ...i, irp: Math.max(0, v) }), () => [0, 12_000_000], [{ at: PENSION.totalCap, label: "900만" }]),
  won<PensionCreditLite>("income", "총급여(종합소득금액)", "연봉", (i) => i.income, (i, v) => ({ ...i, income: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 100_000_000)]),
];

export const pensionCreditMarks = (i: PensionCreditLite) => [{ at: i.type === "earned" ? PENSION.earnedLine : PENSION.compLine, label: "16.5%↔13.2%" }];

export function pensionCreditBridge(i: PensionCreditLite): BridgeStep[] {
  const r = pensionCreditOf(i);
  return [
    { label: "연금저축 인정", value: r.savingsCounted, kind: "add" },
    { label: "IRP 인정", value: r.irpCounted, kind: "add" },
    { label: "공제 대상", value: r.base, kind: "total" },
  ];
}

export function pensionCreditPlain(i: PensionCreditLite, top?: TornadoBar) {
  const r = pensionCreditOf(i);
  const over = Math.max(0, i.savings - PENSION.savingsCap) + Math.max(0, r.savingsCounted + i.irp - PENSION.totalCap);
  return {
    headline: `연말정산·5월 신고 때 약 ${roughWon(r.refund)}을 돌려받을 것 같아요(공제율 ${pct(r.rate)}).`,
    driver: driverLine(top, "돌려받는 돈"),
    reasons: [
      `${i.type === "earned" ? "총급여 5,500만" : "종합소득금액 4,500만"} 원 이하면 16.5%, 넘으면 13.2%예요. 지금은 ${pct(r.rate)}가 적용돼요.`,
      r.room > 0
        ? `한도 900만 원까지 ${roughWon(r.room)}이 남았어요. IRP에 더 넣으면 약 ${roughWon(Math.floor(r.room * r.rate))}을 더 돌려받아요.`
        : `한도 900만 원을 다 채웠어요.${over > 0 ? ` 한도를 넘긴 ${roughWon(over)}은 올해 공제가 없어요. 금융회사에 신청하면 다음 해 납입분으로 돌려 공제받을 수 있어요.` : ""}`,
      "연금저축만으로는 600만 원까지예요. 나머지 300만 원은 IRP에 넣어야 채워져요.",
      "낸 세금(결정세액)보다 많이 돌려받을 수는 없어요. 세금을 적게 냈다면 실제 환급은 줄어요.",
    ],
  };
}

// ───────────────────────── 연금 최적화(노후 월 소득) ─────────────────────────

export interface PensionPlanLite {
  age: number;
  retireAge: number;
  lifeAge: number;
  /** 지금 연금 계좌에 쌓인 돈 */
  balance: number;
  savingsMonthly: number;
  irpMonthly: number;
  income: number;
  /** 국민연금 예상 월액 */
  national: number;
  ret: number;
}

export function pensionPlanResult(i: PensionPlanLite) {
  const n = Math.max(0, Math.round(i.retireAge - i.age));
  const r = i.ret;
  const annual = Math.max(0, i.savingsMonthly + i.irpMonthly) * 12;
  const grow = Math.pow(1 + r, n);
  const fromBalance = Math.max(0, i.balance) * grow;
  const fromSaving = r === 0 ? annual * n : (annual * (grow - 1)) / r;
  const asset = Math.floor(fromBalance + fromSaving);
  const months = Math.max(12, Math.round(i.lifeAge - i.retireAge) * 12);
  const fromAccount = Math.floor(asset / months);
  const credit = pensionCredit("earned", i.income, i.savingsMonthly * 12, i.irpMonthly * 12);
  return { years: n, asset, paid: Math.floor(Math.max(0, i.balance) + annual * n), fromAccount, monthly: fromAccount + Math.max(0, i.national), credit, months };
}
export const pensionPlanMonthly = (i: PensionPlanLite) => pensionPlanResult(i).monthly;

export const PENSION_PLAN_ASSUMPTIONS: Assumption<PensionPlanLite>[] = [
  won<PensionPlanLite>("irpMonthly", "IRP 월 납입", "IRP에 매달 넣는 돈", (i) => i.irpMonthly, (i, v) => ({ ...i, irpMonthly: Math.max(0, v) }), () => [0, 1_500_000], [{ at: 250_000, label: "공제 한도" }]),
  won<PensionPlanLite>("savingsMonthly", "연금저축 월 납입", "연금저축에 매달 넣는 돈", (i) => i.savingsMonthly, (i, v) => ({ ...i, savingsMonthly: Math.max(0, v) }), () => [0, 1_500_000], [{ at: 500_000, label: "600만/년" }]),
  { key: "ret", label: "연 기대수익률", plain: "수익률", unit: "rate", kind: "assumption", get: (i) => i.ret, set: (i, v) => ({ ...i, ret: v }), range: fixedRange(0, 0.1) },
  { key: "retireAge", label: "연금 받기 시작하는 나이", plain: "은퇴 나이", unit: "age", kind: "assumption", get: (i) => i.retireAge, set: (i, v) => ({ ...i, retireAge: Math.max(i.age, Math.max(55, Math.round(v))) }), range: fixedRange(55, 75) },
  { key: "lifeAge", label: "기대수명", plain: "몇 살까지 받을지", unit: "age", kind: "assumption", get: (i) => i.lifeAge, set: (i, v) => ({ ...i, lifeAge: Math.max(i.retireAge + 1, Math.round(v)) }), range: fixedRange(70, 100) },
  { key: "age", label: "현재 나이", plain: "지금 나이", unit: "age", kind: "fact", get: (i) => i.age, set: (i, v) => ({ ...i, age: Math.min(i.retireAge, Math.max(19, Math.round(v))) }), range: fixedRange(20, 64) },
];

export function pensionPlanBridge(i: PensionPlanLite): BridgeStep[] {
  const r = pensionPlanResult(i);
  return [
    { label: "국민연금", value: Math.max(0, i.national), kind: "add" },
    { label: "연금 계좌에서", value: r.fromAccount, kind: "add" },
    { label: "노후 월 소득", value: r.monthly, kind: "total" },
  ];
}

export function pensionPlanPlain(i: PensionPlanLite, top?: TornadoBar) {
  const r = pensionPlanResult(i);
  return {
    headline: `${i.retireAge}세부터 ${i.lifeAge}세까지 한 달에 약 ${roughWon(r.monthly)}(국민연금 포함)을 받을 것 같아요.`,
    driver: driverLine(top, "노후 월 소득"),
    reasons: [
      `${r.years}년 동안 연 ${pct(i.ret)}로 굴리면 연금 계좌가 약 ${roughWon(r.asset)}이 돼요. 넣은 돈은 약 ${roughWon(r.paid)}이에요.`,
      `올해 세액공제는 약 ${roughWon(r.credit.refund)}이에요.${r.credit.room > 0 ? ` 한도까지 ${roughWon(r.credit.room)} 남아서, 채우면 약 ${roughWon(Math.floor(r.credit.room * r.credit.rate))}을 더 돌려받아요.` : " 한도 900만 원을 다 채웠어요."}`,
      "받는 동안 붙는 수익과 연금소득세(3.3~5.5%)는 빼고 단순히 나눴어요. 사적연금이 연 1,500만 원을 넘으면 16.5% 분리과세나 종합과세를 골라야 해요.",
    ],
  };
}

// ───────────────────────── 해외주식 양도세 절세 ─────────────────────────

export const FOREIGN_TOTAL_RATE = FOREIGN_STOCK_RATE * (1 + LOCAL); // 22%

export interface OverseasLite {
  /** 올해 이미 판 주식의 이익 − 손실 */
  realized: number;
  /** 아직 안 판 주식 중 오른 것의 평가이익 */
  openGain: number;
  /** 아직 안 판 주식 중 내린 것의 평가손실(양수) */
  openLoss: number;
}

export const overseasTaxOf = (gain: number) => {
  const national = Math.floor(Math.max(0, gain - STOCK_GAIN_DEDUCTION) * FOREIGN_STOCK_RATE);
  return national + Math.floor(national * LOCAL);
};

export function overseasResult(i: OverseasLite) {
  const realized = i.realized;
  const taxNow = overseasTaxOf(realized);
  const over = Math.max(0, realized - STOCK_GAIN_DEDUCTION);
  const harvest = Math.min(Math.max(0, i.openLoss), over);
  const taxAfter = overseasTaxOf(realized - harvest);
  const room = Math.max(0, STOCK_GAIN_DEDUCTION - Math.max(0, realized - harvest));
  const stepUp = Math.min(Math.max(0, i.openGain), room);
  return {
    taxNow,
    harvest,
    taxAfter,
    saveNow: taxNow - taxAfter,
    stepUp,
    /** 공제 안에서 이익을 실현해 두면 나중에 아끼는 세금 */
    saveLater: Math.floor(stepUp * FOREIGN_TOTAL_RATE),
    unusedDeduction: Math.max(0, room - stepUp),
  };
}
export const overseasTax = (i: OverseasLite) => overseasTaxOf(i.realized);
export const overseasSaved = (i: OverseasLite) => {
  const r = overseasResult(i);
  return r.saveNow + r.saveLater;
};

export const OVERSEAS_ASSUMPTIONS: Assumption<OverseasLite>[] = [
  won<OverseasLite>("realized", "올해 실현 손익", "올해 판 주식에서 번 돈", (i) => i.realized, (i, v) => ({ ...i, realized: v }), (a) => [Math.min(0, a), Math.max(a * 2, 10_000_000)], [{ at: STOCK_GAIN_DEDUCTION, label: "250만 공제" }]),
  won<OverseasLite>("openLoss", "미실현 평가손실", "팔면 손해인 주식의 손실", (i) => i.openLoss, (i, v) => ({ ...i, openLoss: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 5_000_000)]),
  won<OverseasLite>("openGain", "미실현 평가이익", "팔면 이익인 주식의 이익", (i) => i.openGain, (i, v) => ({ ...i, openGain: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 5_000_000)]),
];

export function overseasBridge(i: OverseasLite): BridgeStep[] {
  const r = overseasResult(i);
  return [
    { label: "올해 실현 손익", value: i.realized, kind: "total" },
    ...(r.harvest > 0 ? [{ label: "손실 주식 팔기", value: -r.harvest, kind: "add" as const }] : []),
    { label: "기본공제 250만", value: -Math.min(Math.max(0, i.realized - r.harvest), STOCK_GAIN_DEDUCTION), kind: "add" },
    { label: "과세 대상", value: Math.max(0, i.realized - r.harvest - STOCK_GAIN_DEDUCTION), kind: "total" },
  ];
}

export function overseasPlain(i: OverseasLite, top?: TornadoBar) {
  const r = overseasResult(i);
  const reasons: string[] = [];
  if (r.harvest > 0) reasons.push(`연말 전에 손실 난 주식을 ${roughWon(r.harvest)}만큼 팔았다가 다시 사면, 손익이 상계돼 세금이 ${roughWon(r.taxNow)}에서 ${roughWon(r.taxAfter)}으로 줄어요.`);
  else if (i.realized > STOCK_GAIN_DEDUCTION) reasons.push(`250만 원을 넘는 이익 ${roughWon(i.realized - STOCK_GAIN_DEDUCTION)}에 22%(지방세 포함)를 내요. 손실 난 주식이 있으면 팔아서 줄일 수 있어요.`);
  if (r.stepUp > 0) reasons.push(`공제 250만 원이 ${roughWon(r.stepUp + r.unusedDeduction)} 남았어요. 오른 주식을 ${roughWon(r.stepUp)}어치 이익만큼 팔고 다시 사 두면 올해 세금 없이 취득가가 올라가 나중에 약 ${roughWon(r.saveLater)}을 아껴요.`);
  else if (r.unusedDeduction > 0) reasons.push(`공제 250만 원 중 ${roughWon(r.unusedDeduction)}을 못 쓰고 있어요. 매년 사라지는 공제라 오른 주식이 있다면 써 두는 게 좋아요.`);
  reasons.push("체결일이 아니라 결제일(미국 주식은 체결 다음 영업일) 기준이라 12월 마지막 거래일 하루 이틀 전까지 팔아야 올해 손익에 들어가요.", "세금은 다음 해 5월에 직접 신고·납부해요. 세금이 없는 국내 소액주주 주식 손익은 합산하지 않아요.");
  return {
    headline: r.taxNow > 0 ? `지금 그대로면 내년 5월에 약 ${roughWon(r.taxNow)}을 내요. 정리하면 ${roughWon(r.saveNow + r.saveLater)}을 아낄 수 있어요.` : `지금은 세금이 없어요.${r.saveLater > 0 ? ` 남은 공제를 쓰면 나중 세금 약 ${roughWon(r.saveLater)}을 아껴요.` : ""}`,
    driver: driverLine(top, "아끼는 세금"),
    reasons,
  };
}

// ───────────────────────── 금융소득 분리 vs 종합과세 ─────────────────────────

export interface FinIncomeLite {
  /** 이자·배당 합계(세전, 1년) */
  fin: number;
  mode: "salary" | "base";
  gross: number;
  persons: number;
  /** 다른 종합소득 과세표준(직접 입력) */
  base: number;
}

export const finOtherBase = (i: FinIncomeLite) =>
  i.mode === "salary"
    ? Math.max(0, i.gross - earnedIncomeDeduction(i.gross) - KR_RATES_2026.incomeTax.personalDeductionPerPerson * Math.max(1, i.persons))
    : Math.max(0, i.base);
export const finResult = (i: FinIncomeLite) => financialIncomeTax(Math.max(0, i.fin), finOtherBase(i));
export const finExtra = (i: FinIncomeLite) => finResult(i).extraTotal;

export const FIN_ASSUMPTIONS: Assumption<FinIncomeLite>[] = [
  won<FinIncomeLite>("fin", "이자·배당 합계", "이자·배당", (i) => i.fin, (i, v) => ({ ...i, fin: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 50_000_000)], [{ at: FINANCIAL_THRESHOLD, label: "2천만" }]),
  won<FinIncomeLite>("other", "다른 소득(총급여·과세표준)", "다른 소득", (i) => (i.mode === "salary" ? i.gross : i.base), (i, v) => (i.mode === "salary" ? { ...i, gross: Math.max(0, v) } : { ...i, base: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 150_000_000)]),
];

export function finBridge(i: FinIncomeLite): BridgeStep[] {
  const r = finResult(i);
  const withheld = r.withheld + Math.floor(r.withheld * LOCAL);
  return [
    { label: "이미 뗀 세금 15.4%", value: withheld, kind: "total" },
    { label: "5월에 더 낼 세금", value: r.extraTotal, kind: "add" },
    { label: "금융소득 세금 합계", value: withheld + r.extraTotal, kind: "total" },
  ];
}

export function finPlain(i: FinIncomeLite, top?: TornadoBar) {
  const r = finResult(i);
  const other = finOtherBase(i);
  const withheld = r.withheld + Math.floor(r.withheld * LOCAL);
  return {
    headline: !r.comprehensive
      ? `이자·배당 ${roughWon(i.fin)}은 2천만 원 이하라 은행·증권사가 뗀 15.4%(약 ${roughWon(withheld)})로 끝나요.`
      : r.extraTotal > 0
        ? `2천만 원을 넘어 종합과세돼요. 내년 5월에 약 ${roughWon(r.extraTotal)}을 더 내야 해요.`
        : "2천만 원을 넘어 종합과세 신고는 해야 하지만, 이미 뗀 세금으로 충분해 더 낼 돈은 없어요.",
    driver: driverLine(top, "5월에 더 낼 세금"),
    reasons: [
      `다른 소득의 과세표준을 약 ${roughWon(other)}으로 봤어요.${i.mode === "salary" ? " 4대보험·카드 공제를 빼면 더 낮아져 추가 세금도 줄어요." : ""}`,
      r.comprehensive
        ? `세금은 두 방식 중 큰 쪽이에요(소득세법 제62조). ① 2천만 원 넘는 몫을 다른 소득에 더해 계산 ${exact(r.method1)}, ② 금융소득 전체 14% + 다른 소득 세금 ${exact(r.method2)}.`
        : "2천만 원은 부부 각자, 한 해(1~12월) 받은 이자·배당 합계 기준이에요. 넘기 전에 지급 시기를 나누면 종합과세를 피할 수 있어요.",
      "ISA·연금 계좌 안의 이자·배당과 비과세 상품은 2천만 원 계산에 들어가지 않아요. 종합과세되면 건강보험료(피부양자 자격)도 다시 보세요.",
    ],
  };
}

// ───────────────────────── 부가세(일반과세자) ─────────────────────────

export interface VatLite {
  /** 매출(공급가액, 부가세 별도) */
  sales: number;
  /** 세금계산서·카드로 받은 매입(공급가액) */
  purchases: number;
  /** 매출 중 카드·현금영수증 비율(개인사업자 발행세액공제) */
  cardShare: number;
  individual: boolean;
}

/** 부가세 포함 금액을 공급가액과 세액으로 나누기 */
export function splitVat(amount: number, inclusive: boolean) {
  const a = Math.max(0, Math.round(amount));
  if (inclusive) {
    const supply = Math.round(a / (1 + VAT_RATES.vat));
    return { supply, vat: a - supply, total: a };
  }
  const vat = Math.floor(a * VAT_RATES.vat);
  return { supply: a, vat, total: a + vat };
}

export const VAT_CARD = { rate: 0.013, yearlyCap: 10_000_000 } as const; // 부가가치세법 제46조(개인사업자, 직전 연도 공급가액 10억 원 이하)

export function vatResult(i: VatLite) {
  const output = Math.floor(Math.max(0, i.sales) * VAT_RATES.vat);
  const input = Math.floor(Math.max(0, i.purchases) * VAT_RATES.vat);
  const before = output - input;
  const cardBase = Math.max(0, i.sales) * (1 + VAT_RATES.vat) * Math.min(1, Math.max(0, i.cardShare));
  const card = i.individual && before > 0 ? Math.min(Math.floor(cardBase * VAT_CARD.rate), VAT_CARD.yearlyCap, before) : 0;
  return { output, input, card, payable: before - card };
}
export const vatPayable = (i: VatLite) => vatResult(i).payable;

export const VAT_ASSUMPTIONS: Assumption<VatLite>[] = [
  won<VatLite>("sales", "매출 공급가액", "매출(부가세 빼고)", (i) => i.sales, (i, v) => ({ ...i, sales: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 50_000_000)]),
  won<VatLite>("purchases", "매입 공급가액(세금계산서·카드)", "증빙 있는 매입", (i) => i.purchases, (i, v) => ({ ...i, purchases: Math.max(0, v) }), (a) => [0, Math.max(a * 2, 30_000_000)]),
  { key: "cardShare", label: "카드·현금영수증 매출 비율", plain: "카드 매출 비율", unit: "pct", kind: "assumption", get: (i) => i.cardShare, set: (i, v) => ({ ...i, cardShare: Math.min(1, Math.max(0, v)) }), range: fixedRange(0, 1) },
];

export function vatBridge(i: VatLite): BridgeStep[] {
  const r = vatResult(i);
  return [
    { label: "매출세액 10%", value: r.output, kind: "total" },
    { label: "매입세액 공제", value: -r.input, kind: "add" },
    ...(r.card > 0 ? [{ label: "카드 발행 공제 1.3%", value: -r.card, kind: "add" as const }] : []),
    { label: r.payable >= 0 ? "낼 부가세" : "돌려받을 부가세", value: r.payable, kind: "total" },
  ];
}

export function vatPlain(i: VatLite, top?: TornadoBar) {
  const r = vatResult(i);
  return {
    headline: r.payable >= 0 ? `이번 신고 때 부가세 약 ${roughWon(r.payable)}을 낼 것 같아요.` : `매입이 더 많아 부가세 약 ${roughWon(-r.payable)}을 돌려받을 것 같아요.`,
    driver: driverLine(top, "낼 부가세"),
    reasons: [
      `매출의 10%(${roughWon(r.output)})에서 증빙 있는 매입의 10%(${roughWon(r.input)})를 빼요. 세금계산서·카드 영수증이 없는 매입은 빼 주지 않아요.`,
      i.individual
        ? r.card > 0
          ? `개인사업자는 카드·현금영수증 매출의 1.3%(연 1,000만 원 한도)를 또 빼 줘요. 이번에 약 ${roughWon(r.card)}이에요(직전 연도 매출 10억 원 이하).`
          : "개인사업자는 카드·현금영수증 매출의 1.3%를 빼 줘요. 카드 매출 비율을 넣어 보세요."
        : "법인은 카드 매출 발행세액공제를 받지 못해요.",
      "일반과세자 기준이에요. 직전 연도 매출 1억 400만 원 미만 간이과세자는 업종별 부가율로 훨씬 적게 내요. 접대비·승용차·면세 관련 매입은 공제가 안 돼요.",
    ],
  };
}
