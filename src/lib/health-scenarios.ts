// 4묶음(건강) 계산기의 가정 목록·쉬운 결과 문장 (2026-11-17). 한국어 페이지용.
// 1차: BMI(대한비만학회 2022 기준), 체지방률(미 해군 둘레법, cm 공식), TDEE(Mifflin-St Jeor).
import { fixedRange, josa, type Assumption, type TornadoBar } from "./scenario.ts";

const one = (n: number) => (Math.round(n * 10) / 10).toLocaleString("ko-KR");
export const kcal = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}kcal`;

/** 돈이 아닌 결과용 "가장 크게 움직이는 가정" 문장 */
export const unitDriver = (top: TornadoBar | undefined, what: string, fmt: (n: number) => string) =>
  top && top.span > 0
    ? `결과를 가장 크게 움직이는 건 ${josa(top.plain, "이에요", "예요")}. 이 값이 20% 늘거나 줄면 ${josa(what, "이", "가")} ${fmt(Math.min(top.low, top.high))}에서 ${fmt(Math.max(top.low, top.high))} 사이로 바뀌어요.`
    : null;

export type Sex = "m" | "f";

// ───────────────────────── BMI ─────────────────────────

/** 대한비만학회 진료지침 2022 */
export const BMI_BANDS = [
  { max: 18.5, label: "저체중" },
  { max: 23, label: "정상" },
  { max: 25, label: "비만 전단계" },
  { max: 30, label: "1단계 비만" },
  { max: 35, label: "2단계 비만" },
  { max: Infinity, label: "3단계 비만" },
] as const;

export interface BmiLite {
  height: number;
  weight: number;
}

export const bmiOf = (i: BmiLite) => (i.height > 0 ? i.weight / Math.pow(i.height / 100, 2) : 0);
export const bmiBand = (bmi: number) => BMI_BANDS.find((b) => bmi < b.max)!.label;
/** 키에서 BMI 값에 해당하는 몸무게 */
export const weightAt = (height: number, bmi: number) => bmi * Math.pow(height / 100, 2);

export function bmiResult(i: BmiLite) {
  const bmi = bmiOf(i);
  const low = weightAt(i.height, 18.5);
  const high = weightAt(i.height, 22.9);
  return { bmi, band: bmiBand(bmi), low, high, toNormal: i.weight > high ? i.weight - high : i.weight < low ? i.weight - low : 0 };
}

export const BMI_ASSUMPTIONS: Assumption<BmiLite>[] = [
  { key: "weight", label: "몸무게", plain: "몸무게", unit: "kg", kind: "assumption", get: (i) => i.weight, set: (i, v) => ({ ...i, weight: Math.max(20, v) }), range: (a) => [Math.max(30, a * 0.6), a * 1.4] },
  { key: "height", label: "키", plain: "키", unit: "cm", kind: "fact", get: (i) => i.height, set: (i, v) => ({ ...i, height: Math.max(100, v) }), range: fixedRange(140, 200) },
];

export const bmiMarks = (i: BmiLite) => [
  { at: weightAt(i.height, 18.5), label: "18.5" },
  { at: weightAt(i.height, 23), label: "23" },
  { at: weightAt(i.height, 25), label: "25" },
];

export function bmiPlain(i: BmiLite, top?: TornadoBar) {
  const r = bmiResult(i);
  return {
    headline: `BMI ${one(r.bmi)}로 '${r.band}'이에요. 키 ${one(i.height)}cm의 정상 체중은 ${one(r.low)}~${one(r.high)}kg이에요.`,
    driver: unitDriver(top, "BMI 값", one),
    reasons: [
      r.toNormal > 0 ? `정상 범위 위쪽까지 ${one(r.toNormal)}kg 남았어요. 한 달에 1~2kg씩 줄이는 속도가 무리가 없어요.` : r.toNormal < 0 ? `정상 범위까지 ${one(-r.toNormal)}kg 늘려야 해요. 근력 운동과 단백질을 함께 늘리세요.` : "정상 범위 안이에요. 허리둘레(남 90cm, 여 85cm 미만)도 함께 보세요.",
      "한국 기준은 BMI 23부터 비만 전단계, 25부터 비만이에요. 세계보건기구 기준(25·30)보다 낮아요. 같은 BMI에서도 아시아인이 대사질환 위험이 높아서예요.",
      "BMI는 근육과 지방을 구분하지 못해요. 운동을 많이 하는 사람은 체지방률을 함께 보세요.",
    ],
  };
}

// ───────────────────────── 체지방률 ─────────────────────────

export interface BodyFatLite {
  sex: Sex;
  height: number;
  weight: number;
  waist: number;
  neck: number;
  hip: number;
}

/** 미 해군 둘레법(cm). 남: 허리−목, 여: 허리+엉덩이−목 */
export function navyBodyFat(i: BodyFatLite) {
  const h = Math.log10(Math.max(1, i.height));
  if (i.sex === "m") {
    const d = i.waist - i.neck;
    if (d <= 0) return NaN;
    return 495 / (1.0324 - 0.19077 * Math.log10(d) + 0.15456 * h) - 450;
  }
  const d = i.waist + i.hip - i.neck;
  if (d <= 0) return NaN;
  return 495 / (1.29579 - 0.35004 * Math.log10(d) + 0.221 * h) - 450;
}

const FAT_BANDS: Record<Sex, { max: number; label: string }[]> = {
  m: [{ max: 6, label: "필수 지방 수준" }, { max: 14, label: "운동선수 수준" }, { max: 18, label: "탄탄함" }, { max: 25, label: "보통" }, { max: Infinity, label: "높음" }],
  f: [{ max: 14, label: "필수 지방 수준" }, { max: 21, label: "운동선수 수준" }, { max: 25, label: "탄탄함" }, { max: 32, label: "보통" }, { max: Infinity, label: "높음" }],
};

export function bodyFatResult(i: BodyFatLite) {
  const raw = navyBodyFat(i);
  const pct = Number.isFinite(raw) ? Math.min(60, Math.max(2, raw)) : NaN;
  const fat = (i.weight * pct) / 100;
  return { pct, band: Number.isFinite(pct) ? FAT_BANDS[i.sex].find((b) => pct < b.max)!.label : "—", fat, lean: i.weight - fat };
}
export const bodyFatPct = (i: BodyFatLite) => bodyFatResult(i).pct;

export const BODY_FAT_ASSUMPTIONS: Assumption<BodyFatLite>[] = [
  { key: "waist", label: "허리둘레", plain: "허리둘레", unit: "cm", kind: "assumption", get: (i) => i.waist, set: (i, v) => ({ ...i, waist: Math.max(40, v) }), range: (a) => [Math.max(50, a * 0.75), a * 1.25] },
  { key: "neck", label: "목둘레", plain: "목둘레", unit: "cm", kind: "assumption", get: (i) => i.neck, set: (i, v) => ({ ...i, neck: Math.max(20, v) }), range: (a) => [Math.max(25, a * 0.8), a * 1.2] },
  { key: "hip", label: "엉덩이둘레(여성)", plain: "엉덩이둘레", unit: "cm", kind: "assumption", get: (i) => i.hip, set: (i, v) => ({ ...i, hip: Math.max(50, v) }), range: (a) => [Math.max(60, a * 0.8), a * 1.2] },
  { key: "height", label: "키", plain: "키", unit: "cm", kind: "fact", get: (i) => i.height, set: (i, v) => ({ ...i, height: Math.max(100, v) }), range: fixedRange(140, 200) },
];

export function bodyFatPlain(i: BodyFatLite, top?: TornadoBar) {
  const r = bodyFatResult(i);
  if (!Number.isFinite(r.pct)) return { headline: "둘레 값을 다시 확인해 주세요. 허리가 목보다 굵어야 계산할 수 있어요.", driver: null, reasons: [] };
  return {
    headline: `체지방률 약 ${one(r.pct)}%로 '${r.band}'이에요. 몸무게 ${one(i.weight)}kg 중 지방이 약 ${one(r.fat)}kg이에요.`,
    driver: unitDriver(top, "체지방률", (n) => `${one(n)}%`),
    reasons: [
      `지방을 뺀 몸무게(제지방량)는 약 ${one(r.lean)}kg이에요. 다이어트할 때 이 숫자가 줄지 않게 단백질과 근력 운동을 챙기세요.`,
      `허리둘레가 1cm 줄면 체지방률이 약 ${one(r.pct - bodyFatPct({ ...i, waist: i.waist - 1 }))}%p 내려가요. ${i.sex === "m" ? "허리는 배꼽 높이에서 숨을 내쉰 상태로 재요." : "허리는 가장 가는 곳, 엉덩이는 가장 튀어나온 곳을 재요."}`,
      "미 해군 둘레법은 오차가 ±3%p 정도예요. 인바디·DEXA와 다를 수 있으니 같은 방법으로 변화를 보는 데 쓰세요.",
    ],
  };
}

// ───────────────────────── TDEE ─────────────────────────

export const ACTIVITY = {
  sedentary: { k: 1.2, label: "거의 안 움직임(사무직)" },
  light: { k: 1.375, label: "가벼운 운동 주 1~3회" },
  moderate: { k: 1.55, label: "운동 주 3~5회" },
  heavy: { k: 1.725, label: "운동 주 6~7회" },
  athlete: { k: 1.9, label: "하루 2번 이상 고강도" },
} as const;
export type Activity = keyof typeof ACTIVITY;

export interface TdeeLite {
  sex: Sex;
  age: number;
  height: number;
  weight: number;
  activity: Activity;
}

export const bmrOf = (i: TdeeLite) => 10 * i.weight + 6.25 * i.height - 5 * i.age + (i.sex === "m" ? 5 : -161);
export function tdeeResult(i: TdeeLite) {
  const bmr = bmrOf(i);
  const tdee = bmr * ACTIVITY[i.activity].k;
  return { bmr, tdee, loss: Math.max(i.sex === "m" ? 1500 : 1200, tdee - 500), gain: tdee + 300, protein: i.weight * 1.6 };
}
export const tdeeOf = (i: TdeeLite) => tdeeResult(i).tdee;

export const TDEE_ASSUMPTIONS: Assumption<TdeeLite>[] = [
  { key: "weight", label: "몸무게", plain: "몸무게", unit: "kg", kind: "assumption", get: (i) => i.weight, set: (i, v) => ({ ...i, weight: Math.max(30, v) }), range: (a) => [Math.max(35, a * 0.7), a * 1.3] },
  { key: "age", label: "나이", plain: "나이", unit: "age", kind: "assumption", get: (i) => i.age, set: (i, v) => ({ ...i, age: Math.max(15, Math.round(v)) }), range: fixedRange(18, 80) },
  { key: "height", label: "키", plain: "키", unit: "cm", kind: "fact", get: (i) => i.height, set: (i, v) => ({ ...i, height: Math.max(120, v) }), range: fixedRange(140, 200) },
];

export function tdeeCompare(i: TdeeLite) {
  return (Object.keys(ACTIVITY) as Activity[]).map((a) => ({ label: ACTIVITY[a].label, value: tdeeOf({ ...i, activity: a }), current: a === i.activity }));
}

export function tdeePlain(i: TdeeLite, top?: TornadoBar) {
  const r = tdeeResult(i);
  return {
    headline: `하루에 약 ${kcal(r.tdee)}를 써요. 살을 빼려면 약 ${kcal(r.loss)}, 늘리려면 약 ${kcal(r.gain)}를 먹으면 돼요.`,
    driver: unitDriver(top, "하루 소비 열량", kcal),
    reasons: [
      `가만히 있어도 쓰는 기초대사량이 ${kcal(r.bmr)}이고, 활동량(${ACTIVITY[i.activity].label})을 곱해 ${ACTIVITY[i.activity].k}배로 봤어요.`,
      `하루 500kcal를 덜 먹으면 1주에 약 0.5kg이 빠져요. 단백질은 몸무게 1kg당 1.6g(약 ${Math.round(r.protein)}g)을 챙기면 근육이 덜 빠져요.`,
      "공식(Mifflin-St Jeor)은 평균이라 사람마다 ±10% 달라요. 2~3주 몸무게 변화를 보고 조절하세요. 임신·질환이 있으면 의료진과 상의하세요.",
    ],
  };
}
