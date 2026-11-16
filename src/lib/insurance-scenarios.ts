// 보험료 대략 추정 (2026-11-17, 롤아웃 3묶음 남은 것). 기존 InsurancePremiumCalculator의 배수 모형을 그대로 옮겨
// "무엇이 보험료를 얼마나 올리나"를 보여 줘요. 실제 보험사 견적이 아니에요.
import { fixedRange, type Assumption, type TornadoBar } from "./scenario.ts";
import { driverLine } from "./kr-money-scenarios.ts";

export const INS_TYPES = {
  term: { label: "정기보험", rate: 0.0012 },
  life: { label: "종신보험", rate: 0.0045 },
  health: { label: "건강보험", rate: 0.0028 },
  auto: { label: "자동차보험", rate: 0.002 },
} as const;
export type InsType = keyof typeof INS_TYPES;
export const SMOKE = { never: { label: "안 피움", k: 1 }, former: { label: "끊음", k: 1.15 }, current: { label: "피움", k: 1.35 } } as const;
export type Smoke = keyof typeof SMOKE;
export const HEALTH = { excellent: { label: "아주 좋음", k: 0.88 }, good: { label: "좋음", k: 1 }, average: { label: "보통", k: 1.18 }, poor: { label: "나쁨", k: 1.45 } } as const;
export type Health = keyof typeof HEALTH;
const GENDER: Record<InsType, { m: number; f: number }> = { life: { m: 1.1, f: 0.92 }, health: { m: 1.05, f: 0.97 }, auto: { m: 1.08, f: 0.94 }, term: { m: 1.12, f: 0.9 } };

export function ageK(age: number) {
  const steps: [number, number][] = [[25, 0.7], [30, 0.85], [35, 1], [40, 1.15], [45, 1.35], [50, 1.6], [55, 1.9], [60, 2.3], [65, 2.8]];
  return steps.find(([max]) => age < max)?.[1] ?? 3.4;
}

export interface InsLite {
  type: InsType;
  age: number;
  sex: "m" | "f";
  smoke: Smoke;
  health: Health;
  /** 보장 금액(원) */
  coverage: number;
  /** 납입 기간(년) */
  term: number;
}

/** 기존 모형: 기본료에 각 배수의 (배수−1)만큼을 더해요(곱하지 않아요). 단위 원. */
export function insResult(i: InsLite) {
  const base = INS_TYPES[i.type].rate * (i.coverage / 10000) * 10000;
  const age = base * (ageK(i.age) - 1);
  const sex = base * (GENDER[i.type][i.sex] - 1);
  const smoke = base * (SMOKE[i.smoke].k - 1);
  const health = base * (HEALTH[i.health].k - 1);
  const monthly = base + age + sex + smoke + health;
  return { base, age, sex, smoke, health, monthly, total: monthly * 12 * i.term };
}
export const insMonthly = (i: InsLite) => insResult(i).monthly;

export const INS_ASSUMPTIONS: Assumption<InsLite>[] = [
  { key: "age", label: "가입 나이", plain: "나이", unit: "age", kind: "assumption", get: (i) => i.age, set: (i, v) => ({ ...i, age: Math.min(80, Math.max(18, Math.round(v))) }), range: fixedRange(20, 70), marks: [{ at: 35, label: "35" }, { at: 50, label: "50" }] },
  { key: "coverage", label: "보장 금액", plain: "보장 금액", unit: "won", kind: "assumption", get: (i) => i.coverage, set: (i, v) => ({ ...i, coverage: Math.max(1000000, v) }), range: (a) => [Math.max(10000000, a * 0.3), a * 2] },
  { key: "term", label: "납입 기간", plain: "내는 기간", unit: "years", kind: "assumption", get: (i) => i.term, set: (i, v) => ({ ...i, term: Math.max(1, Math.round(v)) }), range: fixedRange(5, 40) },
];

export function insPlain(i: InsLite, top?: TornadoBar) {
  const r = insResult(i);
  const adds = [["나이", r.age], ["흡연", r.smoke], ["건강 상태", r.health], ["성별", r.sex]] as const;
  const big = [...adds].sort((a, b) => b[1] - a[1])[0];
  const rel = r.base > 0 ? Math.round((r.monthly / r.base - 1) * 100) : 0;
  return {
    headline: `이 조건이면 같은 보장의 기본 조건보다 보험료가 ${rel >= 0 ? `약 ${rel}% 비싸요` : `약 ${-rel}% 싸요`}. 모형으로 셈한 한 달 보험료는 약 ${Math.round(r.monthly).toLocaleString("ko-KR")}원이에요.`,
    driver: driverLine(top, "모형 보험료"),
    reasons: [
      big[1] > 0 ? `기본료에 가장 많이 더해진 건 ${big[0]}(+${Math.round(big[1]).toLocaleString("ko-KR")}원)이에요.` : "나이·흡연·건강 상태가 모두 기본 이하라 보험료가 기본료보다 낮거나 같아요.",
      `흡연은 기본료의 15~35%, 나이는 35세부터 5년마다 단계적으로 올라가요. 같은 보장이면 일찍, 담배를 끊은 뒤 가입할수록 싸요.`,
      "금액은 보험료가 어떻게 움직이는지 보여 주는 교육용 모형이라 실제 견적과 몇 배까지 차이 날 수 있어요(특히 정기보험은 실제가 더 싸요). 비율 변화만 참고하고, 금액은 보험다모아에서 실제 상품으로 확인하세요.",
    ],
  };
}
