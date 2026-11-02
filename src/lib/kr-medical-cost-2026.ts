// 건강 금융 묶음 1 (2026-11-02): 본인부담상한제와 의료비 세액공제. 한국 제도만 다루므로 ko 전용.
// 질환·증상·약 정보는 다루지 않는다(YMYL 방침). 돈과 제도 계산만 한다.

export const MEDICAL_COST_AS_OF = "2026-11-02";

export type CapGroup = "d1" | "d2_3" | "d4_5" | "d6_7" | "d8" | "d9" | "d10";

export const CAP_GROUPS: readonly CapGroup[] = ["d1", "d2_3", "d4_5", "d6_7", "d8", "d9", "d10"];

export const CAP_GROUP_LABEL: Record<CapGroup, string> = {
  d1: "1분위",
  d2_3: "2~3분위",
  d4_5: "4~5분위",
  d6_7: "6~7분위",
  d8: "8분위",
  d9: "9분위",
  d10: "10분위",
};

/**
 * 2026년 진료분 본인부담상한액(국민건강보험법 시행령 제19조, 별표 3). 일반은 요양병원 120일 이하 포함,
 * longStay는 요양병원에 같은 해 120일을 넘게 입원한 경우. 매년 전년도 소비자물가 변동률로 조정한다.
 * 2025년 89·110·170·320·437·525·826만 원에서 약 2% 오른 값과 맞는다.
 * 확인: 보아스매거진·모아망 정리표(2026-07~10) 두 곳 일치. 공단 원문은 클라우드에서 막혀 있어 Mac에서 재확인한다.
 */
export const COPAY_CAP_2026: Record<CapGroup, { general: number; longStay: number }> = {
  d1: { general: 900_000, longStay: 1_430_000 },
  d2_3: { general: 1_120_000, longStay: 1_810_000 },
  d4_5: { general: 1_730_000, longStay: 2_450_000 },
  d6_7: { general: 3_260_000, longStay: 4_040_000 },
  d8: { general: 4_460_000, longStay: 5_800_000 },
  d9: { general: 5_360_000, longStay: 6_980_000 },
  d10: { general: 8_430_000, longStay: 10_960_000 },
};

/**
 * 분위 추정용 월 건강보험료 구간(본인부담상한액 기준보험료, 보건복지부 고시 제2026-126호, 2025년 진료분).
 * 2026년 진료분 기준보험료는 2027년에 고시되므로 이 표로는 "추정"만 한다. 값은 해당 분위의 상한(이하).
 */
export const PREMIUM_BANDS_2025: { employee: number[]; regional: number[] } = {
  // d1, d2_3, d4_5, d6_7, d8, d9 상한. 그 위는 d10.
  employee: [57_790, 86_290, 114_100, 163_860, 206_620, 282_570],
  regional: [13_850, 19_780, 34_520, 93_970, 135_360, 217_540],
};

export type MemberType = "employee" | "regional";

export function groupFromPremium(monthlyPremium: number, member: MemberType): CapGroup {
  if (!Number.isFinite(monthlyPremium) || monthlyPremium < 0) throw new RangeError("monthlyPremium");
  const bands = PREMIUM_BANDS_2025[member];
  const i = bands.findIndex((limit) => monthlyPremium <= limit);
  return i === -1 ? "d10" : CAP_GROUPS[i];
}

export interface CopayCapResult {
  cap: number;
  paid: number;
  refund: number;
  /** 상한액까지 남은 금액(넘었으면 0) */
  remaining: number;
}

/**
 * paid는 한 해(1/1~12/31) 동안 병원·약국에 낸 건강보험 적용 본인부담금 합계.
 * 비급여·선별급여·전액본인부담·상급병실·임플란트 등은 넣지 않는다.
 */
export function copayCapRefund(group: CapGroup, paid: number, longStay = false): CopayCapResult {
  if (!Number.isFinite(paid) || paid < 0) throw new RangeError("paid");
  const cap = COPAY_CAP_2026[group][longStay ? "longStay" : "general"];
  return { cap, paid, refund: Math.max(0, paid - cap), remaining: Math.max(0, cap - paid) };
}

/**
 * 의료비 세액공제(소득세법 제59조의4 ②). 총급여 3% 문턱은 일반 의료비에서 먼저 빼고, 모자라면
 * 특정 의료비 → 미숙아·선천성이상아 → 난임시술비 순서로 뺀다. 일반 의료비만 700만 원 한도.
 */
export const MEDICAL_CREDIT = {
  floorRate: 0.03,
  generalCap: 7_000_000,
  rate: 0.15,
  prematureRate: 0.2,
  infertilityRate: 0.3,
} as const;

export interface MedicalExpenses {
  /** 일반 부양가족 의료비(700만 원 한도) */
  general: number;
  /** 본인·65세 이상·장애인·6세 이하·건강보험 산정특례자 의료비(한도 없음) */
  specific?: number;
  /** 미숙아·선천성이상아 의료비(20%) */
  premature?: number;
  /** 난임시술비(30%) */
  infertility?: number;
}

export interface MedicalCreditResult {
  floor: number;
  generalBase: number;
  specificBase: number;
  prematureBase: number;
  infertilityBase: number;
  /** 소득세 기준 세액공제액(지방소득세 제외) */
  credit: number;
  /** 지방소득세 10%까지 더한 줄어드는 세금 */
  withLocal: number;
}

export function medicalExpenseCredit(salary: number, e: MedicalExpenses): MedicalCreditResult {
  const values = { salary, general: e.general, specific: e.specific ?? 0, premature: e.premature ?? 0, infertility: e.infertility ?? 0 };
  for (const [k, v] of Object.entries(values)) if (!Number.isFinite(v) || v < 0) throw new RangeError(k);
  const floor = Math.floor(values.salary * MEDICAL_CREDIT.floorRate);
  let left = floor;
  const take = (amount: number) => {
    const used = Math.min(left, amount);
    left -= used;
    return amount - used;
  };
  const generalBase = Math.min(take(values.general), MEDICAL_CREDIT.generalCap);
  const specificBase = take(values.specific);
  const prematureBase = take(values.premature);
  const infertilityBase = take(values.infertility);
  const credit = Math.floor(
    (generalBase + specificBase) * MEDICAL_CREDIT.rate +
      prematureBase * MEDICAL_CREDIT.prematureRate +
      infertilityBase * MEDICAL_CREDIT.infertilityRate,
  );
  return { floor, generalBase, specificBase, prematureBase, infertilityBase, credit, withLocal: credit + Math.floor(credit * 0.1) };
}

/** 공제를 받기 시작하는 최소 의료비(총급여 3%) */
export function medicalFloor(salary: number): number {
  if (!Number.isFinite(salary) || salary < 0) throw new RangeError("salary");
  return Math.floor(salary * MEDICAL_CREDIT.floorRate);
}
