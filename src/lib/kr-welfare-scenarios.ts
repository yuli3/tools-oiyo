// 생활 지원금·노동권 도구의 가정 목록과 쉬운 결과 문장 (2026-11-16).
// 계산은 kr-welfare-2026.ts, 여기는 "무엇을 바꿔 볼 수 있고 어떻게 설명할지"만 정해요.
import {
  ASSET_CAP, ASSET_HALF, CTC_TABLE, EITC_TABLE, INJURY_2026, RENT_CREDIT,
  dbVsDc, injuryLeavePay, maternityLeavePay, monthlyRentCredit, wageGuarantee, workChildCredit,
  type EitcInput, type GuaranteeInput, type InjuryInput, type MaternityInput, type PensionInput, type RentInput,
} from "./kr-welfare-2026.ts";
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
