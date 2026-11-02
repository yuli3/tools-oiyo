// 건강 금융 묶음 3 (2026-11-02, CHOSEUN "진행"): 실손의료보험 세대별 보험금 비교. ko 전용.
// 질환·증상·약 정보는 다루지 않는다. 같은 영수증에 세대별 자기부담 규칙만 적용한다.
//
// 근거(보험업감독업무시행세칙 [별표15] 실손의료보험 표준약관, 국가법령정보센터 연혁에서 원문 확인 2026-11-02):
// - 3세대: 2021-06-09 시행판(2017-04 최초판과는 미대조). 표준형만. 선택형은 조문(합산 90% 보상)과
//   금융위 표(급여 10%·비급여 20%)가 맞지 않아 넣지 않는다.
// - 4세대: 2021-07-01 시행판. 급여 자기부담 20%는 금융위 2021-06-29 자료, 비급여 30%는 조문.
// - 5세대: 2026-05-06 시행(금융위 2026-05-06 보도자료). 자기부담률은 금융위 자료 기준.
// - 1·2세대는 공식 조문을 확인하지 못해 숫자를 넣지 않는다(화면에서 "본인 약관 확인" 안내).
// 보장 한도, 연간 자기부담 상한, 통원 회수 한도, 약국 처방 공제는 반영하지 않는다.

export const SILSON_AS_OF = "2026-11-02";

export type Generation = "g3" | "g4" | "g5";
export const GENERATIONS: readonly Generation[] = ["g3", "g4", "g5"];

export const GENERATION_LABEL: Record<Generation, string> = {
  g3: "3세대 (2017.4~2021.6)",
  g4: "4세대 (2021.7~2026.5)",
  g5: "5세대 (2026.5~)",
};

/** 의원 / 병원 / 종합병원·상급종합병원 */
export type Tier = "clinic" | "hospital" | "general";
export type Care = "outpatient" | "inpatient";

export interface Bill {
  care: Care;
  tier: Tier;
  /** 건강보험 급여 본인부담금 */
  covered: number;
  /** 비급여(도수치료·체외충격파·증식치료, 비급여 주사, 비급여 MRI 제외) */
  nonCovered: number;
  /** 도수치료·체외충격파·증식치료, 비급여 주사, 비급여 MRI. 3세대에서는 특약으로 따로 계산한다. */
  riderItems: number;
  /** 5세대 비급여가 중증(산정특례 대상 질환과 그 합병증) 치료인지. 아니면 비중증 특약2. */
  severe: boolean;
}

export interface GenerationResult {
  generation: Generation;
  /** 보험금 계산 대상 금액(급여+비급여) */
  claimed: number;
  deductible: number;
  payout: number;
  lines: { label: string; base: number; deductible: number; rule: string }[];
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** max(정액, 비율×금액). 금액이 0이면 공제도 0. 공제는 금액을 넘지 않는다. */
function deduct(base: number, fixed: number, rate: number): number {
  if (base <= 0) return 0;
  return Math.min(base, Math.max(fixed, Math.round(base * rate)));
}

const G3_OUTPATIENT_FIXED: Record<Tier, number> = { clinic: 10_000, hospital: 15_000, general: 20_000 };
const G45_COVERED_FIXED: Record<Tier, number> = { clinic: 10_000, hospital: 10_000, general: 20_000 };

function check(bill: Bill): void {
  for (const k of ["covered", "nonCovered", "riderItems"] as const) {
    const v = bill[k];
    if (!Number.isFinite(v) || v < 0) throw new RangeError(k);
  }
}

export function silsonPayout(generation: Generation, bill: Bill): GenerationResult {
  check(bill);
  const out = bill.care === "outpatient";
  const lines: GenerationResult["lines"] = [];
  const add = (label: string, base: number, fixed: number, rate: number, rule: string) => {
    if (base <= 0) return;
    lines.push({ label, base, deductible: deduct(base, fixed, rate), rule });
  };
  const allNonCovered = bill.nonCovered + bill.riderItems;

  if (generation === "g3") {
    const base = bill.covered + bill.nonCovered;
    if (out) {
      const fixed = G3_OUTPATIENT_FIXED[bill.tier];
      add("급여+비급여 (표준형)", base, fixed, 0.2, `${won(fixed)}과 20% 중 큰 금액`);
      add("도수·주사·MRI (특약)", bill.riderItems, 20_000, 0.3, "1회 2만 원과 30% 중 큰 금액");
    } else {
      add("급여+비급여 (표준형)", base, 0, 0.2, "20%");
      add("도수·주사·MRI (특약)", bill.riderItems, 0, 0.3, "30%");
    }
  } else if (generation === "g4") {
    const fixed = out ? G45_COVERED_FIXED[bill.tier] : 0;
    add("급여", bill.covered, fixed, 0.2, out ? `${won(fixed)}과 20% 중 큰 금액` : "20%");
    add("비급여", allNonCovered, out ? 30_000 : 0, 0.3, out ? "3만 원과 30% 중 큰 금액" : "30%");
  } else {
    const fixed = out ? G45_COVERED_FIXED[bill.tier] : 0;
    add("급여 (기본형)", bill.covered, fixed, 0.2, out ? `${won(fixed)}과 20% 중 큰 금액` : "20%");
    if (bill.severe) {
      add("비급여 중증 (특약1)", allNonCovered, out ? 30_000 : 0, 0.3, out ? "3만 원과 30% 중 큰 금액" : "30%");
    } else {
      add("비급여 비중증 (특약2)", allNonCovered, out ? 50_000 : 0, 0.5, out ? "5만 원과 50% 중 큰 금액" : "50%");
    }
  }

  const claimed = lines.reduce((s, l) => s + l.base, 0);
  const deductible = lines.reduce((s, l) => s + l.deductible, 0);
  return { generation, claimed, deductible, payout: claimed - deductible, lines };
}

export function compareGenerations(bill: Bill): GenerationResult[] {
  return GENERATIONS.map((g) => silsonPayout(g, bill));
}
