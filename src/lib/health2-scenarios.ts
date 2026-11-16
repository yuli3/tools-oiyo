// 4묶음(건강) 2차 (2026-11-17). 탄단지·표준 체중·물·심박수·1RM·자녀 키·카페인. 한국어 페이지용.
import { fixedRange, josa, type Assumption, type TornadoBar } from "./scenario.ts";
import { type Sex, unitDriver } from "./health-scenarios.ts";

const one = (n: number) => (Math.round(n * 10) / 10).toLocaleString("ko-KR");
const int = (n: number) => Math.round(n).toLocaleString("ko-KR");
export const grams = (n: number) => `${int(n)}g`;
export const ml = (n: number) => `${int(n)}ml`;
export const bpm = (n: number) => `${Math.round(n)}회/분`;
export const kgOne = (n: number) => `${one(n)}kg`;
export const cmOne = (n: number) => `${one(n)}cm`;
export const mg = (n: number) => `${int(n)}mg`;

// ───────────────────────── 탄단지(매크로) ─────────────────────────

export const MACRO_PRESETS = [
  { label: "균형", p: 0.3, f: 0.3 },
  { label: "고단백", p: 0.4, f: 0.2 },
  { label: "저탄수", p: 0.4, f: 0.4 },
  { label: "키토", p: 0.25, f: 0.7 },
] as const;

export interface MacroLite {
  calories: number;
  weight: number;
  /** 단백질 비율(0~1) */
  protein: number;
  /** 지방 비율(0~1) */
  fat: number;
}

/** 단백질·탄수 4kcal/g, 지방 9kcal/g. 탄수 비율은 나머지예요. */
export function macroResult(i: MacroLite) {
  const p = Math.max(0, Math.min(1, i.protein));
  const f = Math.max(0, Math.min(1 - p, i.fat));
  const c = Math.max(0, 1 - p - f);
  const proteinG = (i.calories * p) / 4;
  return { p, f, c, proteinG, carbsG: (i.calories * c) / 4, fatG: (i.calories * f) / 9, perKg: i.weight > 0 ? proteinG / i.weight : 0 };
}
export const proteinOf = (i: MacroLite) => macroResult(i).proteinG;

export const MACRO_ASSUMPTIONS: Assumption<MacroLite>[] = [
  { key: "calories", label: "하루 섭취 열량", plain: "하루 먹는 열량", unit: "kcal", kind: "assumption", get: (i) => i.calories, set: (i, v) => ({ ...i, calories: Math.max(800, v) }), range: (a) => [Math.max(1000, a * 0.7), a * 1.3] },
  { key: "protein", label: "단백질 비율", plain: "단백질 비율", unit: "pct", kind: "assumption", get: (i) => i.protein, set: (i, v) => ({ ...i, protein: Math.min(0.6, Math.max(0.1, v)) }), range: fixedRange(0.1, 0.5) },
  { key: "fat", label: "지방 비율", plain: "지방 비율", unit: "pct", kind: "assumption", get: (i) => i.fat, set: (i, v) => ({ ...i, fat: Math.min(0.75, Math.max(0.1, v)) }), range: fixedRange(0.15, 0.7) },
  { key: "weight", label: "몸무게", plain: "몸무게", unit: "kg", kind: "fact", get: (i) => i.weight, set: (i, v) => ({ ...i, weight: Math.max(30, v) }), range: fixedRange(40, 120) },
];

export const macroBars = (i: MacroLite) => {
  const r = macroResult(i);
  return [
    { label: `단백질 ${Math.round(r.p * 100)}%`, value: r.proteinG },
    { label: `탄수화물 ${Math.round(r.c * 100)}%`, value: r.carbsG },
    { label: `지방 ${Math.round(r.f * 100)}%`, value: r.fatG },
  ];
};

export function macroPlain(i: MacroLite, top?: TornadoBar) {
  const r = macroResult(i);
  return {
    headline: `하루 단백질 ${grams(r.proteinG)}, 탄수화물 ${grams(r.carbsG)}, 지방 ${grams(r.fatG)}을 먹으면 돼요.`,
    driver: unitDriver(top, "단백질 양", grams),
    reasons: [
      `단백질은 몸무게 1kg당 ${one(r.perKg)}g이에요. ${r.perKg < 1.2 ? "운동하거나 감량 중이면 1.2~2g이 권장돼요. 단백질 비율을 올려 보세요." : r.perKg > 2.2 ? "2.2g을 넘으면 더 먹어도 근육에 쓰이는 몫은 크게 늘지 않아요." : "운동·감량 중에 권장되는 1.2~2.2g 안이에요."}`,
      "단백질·탄수화물은 1g에 4kcal, 지방은 9kcal로 바꿔 계산했어요. 그래서 같은 비율이라도 지방은 g 수가 적어 보여요.",
      r.c < 0.1 ? "탄수화물이 10% 밑이면 키토 식단이에요. 처음 1~2주는 피곤할 수 있고, 당뇨약을 먹는다면 의료진과 먼저 상의하세요." : "하루 열량은 TDEE 계산기에서 구한 값을 넣으면 가장 정확해요.",
    ],
  };
}

// ───────────────────────── 표준 체중 ─────────────────────────

export interface IdealLite {
  sex: Sex;
  height: number;
  weight: number;
}

const over5ft = (h: number) => Math.max(0, h / 2.54 - 60);
/** 국내 병원에서 흔히 쓰는 표준 체중: 키(m)² × 22(남)·21(여) */
export const standardWeight = (i: IdealLite) => Math.pow(i.height / 100, 2) * (i.sex === "m" ? 22 : 21);

export function idealFormulas(i: IdealLite) {
  const m = i.sex === "m";
  const x = over5ft(i.height);
  return [
    { label: `BMI ${m ? 22 : 21} 기준(국내 표준)`, value: standardWeight(i) },
    { label: "브로카 변법 (키−100)×0.9", value: (i.height - 100) * 0.9 },
    { label: "Devine", value: (m ? 50 : 45.5) + 2.3 * x },
    { label: "Robinson", value: (m ? 52 : 49) + (m ? 1.9 : 1.7) * x },
    { label: "Miller", value: (m ? 56.2 : 53.1) + (m ? 1.41 : 1.36) * x },
    { label: "Hamwi", value: (m ? 48 : 45.5) + (m ? 2.7 : 2.2) * x },
  ];
}

export function idealResult(i: IdealLite) {
  const std = standardWeight(i);
  const hm = i.height / 100;
  const list = idealFormulas(i).map((f) => f.value);
  return { std, low: 18.5 * hm * hm, high: 22.9 * hm * hm, min: Math.min(...list), max: Math.max(...list), gap: i.weight - std };
}
export const standardOf = (i: IdealLite) => idealResult(i).std;

export const IDEAL_ASSUMPTIONS: Assumption<IdealLite>[] = [
  { key: "height", label: "키", plain: "키", unit: "cm", kind: "assumption", get: (i) => i.height, set: (i, v) => ({ ...i, height: Math.max(120, v) }), range: fixedRange(145, 195) },
];

export function idealPlain(i: IdealLite, top?: TornadoBar) {
  const r = idealResult(i);
  return {
    headline: `키 ${one(i.height)}cm의 표준 체중은 약 ${kgOne(r.std)}이에요. 건강한 범위는 ${kgOne(r.low)}~${kgOne(r.high)}이에요.`,
    driver: unitDriver(top, "표준 체중", kgOne),
    reasons: [
      Math.abs(r.gap) < 1 ? "지금 몸무게가 표준 체중과 거의 같아요." : r.gap > 0 ? `지금 몸무게는 표준보다 ${kgOne(r.gap)} 많아요. ${i.weight <= r.high ? "그래도 건강한 범위 안이에요." : "건강한 범위 위쪽 끝까지 줄이는 걸 먼저 목표로 잡으세요."}` : `지금 몸무게는 표준보다 ${kgOne(-r.gap)} 적어요. ${i.weight >= r.low ? "그래도 건강한 범위 안이에요." : "저체중이라 근육과 영양을 함께 챙기세요."}`,
      `공식마다 ${kgOne(r.min)}~${kgOne(r.max)}로 달라요. 표준 체중은 숫자 하나보다 범위로 보는 게 맞아요.`,
      "건강한 범위는 대한비만학회 기준 BMI 18.5~22.9예요. 근육이 많으면 범위를 넘어도 건강할 수 있어요.",
    ],
  };
}

// ───────────────────────── 물 섭취량 ─────────────────────────

export const WATER_ACTIVITY = { low: { add: 0, label: "거의 안 움직임" }, moderate: { add: 350, label: "30분 정도 운동" }, high: { add: 700, label: "1시간 넘게 땀 흘림" } } as const;
export const WATER_TEMP = { cool: { add: 0, label: "선선함" }, normal: { add: 150, label: "보통" }, hot: { add: 350, label: "덥고 습함" } } as const;
export type WaterActivity = keyof typeof WATER_ACTIVITY;
export type WaterTemp = keyof typeof WATER_TEMP;

export interface WaterLite {
  weight: number;
  activity: WaterActivity;
  temp: WaterTemp;
  /** 술(잔) */
  alcohol: number;
}

export function waterResult(i: WaterLite) {
  const base = i.weight * 30;
  const act = WATER_ACTIVITY[i.activity].add;
  const temp = WATER_TEMP[i.temp].add;
  const alcohol = Math.max(0, i.alcohol) * 200;
  const total = base + act + temp + alcohol;
  return { base, act, temp, alcohol, total, cups: Math.ceil(total / 250) };
}
export const waterOf = (i: WaterLite) => waterResult(i).total;

export const WATER_ASSUMPTIONS: Assumption<WaterLite>[] = [
  { key: "weight", label: "몸무게", plain: "몸무게", unit: "kg", kind: "assumption", get: (i) => i.weight, set: (i, v) => ({ ...i, weight: Math.max(20, v) }), range: (a) => [Math.max(30, a * 0.7), a * 1.3] },
  { key: "alcohol", label: "음주(잔)", plain: "마신 술", unit: "reps", kind: "assumption", get: (i) => i.alcohol, set: (i, v) => ({ ...i, alcohol: Math.max(0, Math.round(v)) }), range: fixedRange(0, 6) },
];

export function waterPlain(i: WaterLite, top?: TornadoBar) {
  const r = waterResult(i);
  return {
    headline: `하루에 물을 약 ${ml(r.total)}, 250ml 컵으로 ${r.cups}잔 마시면 돼요.`,
    driver: unitDriver(top, "마실 물 양", ml),
    reasons: [
      `몸무게 1kg당 30ml로 ${ml(r.base)}를 잡고, 운동 ${ml(r.act)}, 날씨 ${ml(r.temp)}${r.alcohol ? `, 술 ${ml(r.alcohol)}` : ""}를 더했어요.`,
      "커피·차도 수분으로 쳐요. 하루 3~4잔 정도는 이뇨 작용으로 빠지는 물이 크지 않아요. 술은 마신 만큼 물을 더 챙기세요.",
      "한 번에 몰아 마시기보다 1~2시간마다 한 컵씩 나눠 드세요. 신장·심장 질환으로 수분 제한을 받고 있다면 의료진 지시를 따르세요.",
    ],
  };
}

// ───────────────────────── 심박수 구간 ─────────────────────────

export const HR_ZONES = [
  { lo: 0.5, hi: 0.6, label: "1구간 회복" },
  { lo: 0.6, hi: 0.7, label: "2구간 지방 연소" },
  { lo: 0.7, hi: 0.8, label: "3구간 유산소" },
  { lo: 0.8, hi: 0.9, label: "4구간 고강도" },
  { lo: 0.9, hi: 1.0, label: "5구간 최대" },
] as const;

export interface HeartLite {
  age: number;
  /** 안정 시 심박수, 0이면 모름 */
  resting: number;
  zone: number;
}

export function heartResult(i: HeartLite) {
  const max = 220 - i.age;
  const tanaka = 208 - 0.7 * i.age;
  const karvonen = i.resting > 30 && i.resting < max;
  const at = (pct: number) => (karvonen ? i.resting + pct * (max - i.resting) : pct * max);
  const zones = HR_ZONES.map((z) => ({ ...z, from: at(z.lo), to: at(z.hi) }));
  const z = zones[Math.max(0, Math.min(4, i.zone))];
  return { max, tanaka, karvonen, zones, z, mid: (z.from + z.to) / 2 };
}
export const heartMid = (i: HeartLite) => heartResult(i).mid;

export const HEART_ASSUMPTIONS: Assumption<HeartLite>[] = [
  { key: "age", label: "나이", plain: "나이", unit: "age", kind: "assumption", get: (i) => i.age, set: (i, v) => ({ ...i, age: Math.min(90, Math.max(10, Math.round(v))) }), range: fixedRange(15, 80) },
  { key: "resting", label: "안정 시 심박수", plain: "가만히 있을 때 심박수", unit: "bpm", kind: "assumption", get: (i) => i.resting, set: (i, v) => ({ ...i, resting: Math.max(0, Math.round(v)) }), range: fixedRange(45, 95) },
];

export function heartPlain(i: HeartLite, top?: TornadoBar) {
  const r = heartResult(i);
  return {
    headline: `${josa(r.z.label, "은", "는")} 1분에 ${Math.round(r.z.from)}~${Math.round(r.z.to)}번 뛰는 정도예요. 최대 심박수는 약 ${bpm(r.max)}이에요.`,
    driver: unitDriver(top, "목표 심박수", bpm),
    reasons: [
      r.karvonen ? `안정 시 심박수(${bpm(i.resting)})를 넣어 카보넨 공식으로 계산했어요. 체력에 맞춘 값이라 더 정확해요.` : "안정 시 심박수를 넣으면 체력에 맞춘 카보넨 공식으로 바꿔 계산해요. 아침에 일어나 1분 동안 맥박을 세면 돼요.",
      `최대 심박수는 220−나이로 잡았어요. 다른 공식(208−0.7×나이)으로는 ${bpm(r.tanaka)}라서, 나이가 많을수록 두 값이 벌어져요.`,
      "말은 할 수 있지만 노래는 힘든 정도가 2~3구간이에요. 심장 질환이 있거나 혈압약을 먹는다면 의료진과 목표를 정하세요.",
    ],
  };
}

// ───────────────────────── 1RM ─────────────────────────

export interface OneRmLite {
  weight: number;
  reps: number;
}

export const epley = (w: number, r: number) => (r <= 1 ? w : w * (1 + r / 30));
export const brzycki = (w: number, r: number) => (r <= 1 ? w : (w * 36) / (37 - Math.min(36, r)));
export function oneRmResult(i: OneRmLite) {
  const e = epley(i.weight, i.reps);
  const b = brzycki(i.weight, i.reps);
  return { epley: e, brzycki: b, oneRm: (e + b) / 2 };
}
export const oneRmOf = (i: OneRmLite) => oneRmResult(i).oneRm;
/** 1RM에서 N회 할 수 있는 무게(Epley 역산) */
export const weightForReps = (oneRm: number, reps: number) => (reps <= 1 ? oneRm : oneRm / (1 + reps / 30));

export const ONE_RM_ASSUMPTIONS: Assumption<OneRmLite>[] = [
  { key: "weight", label: "든 무게", plain: "든 무게", unit: "kg", kind: "assumption", get: (i) => i.weight, set: (i, v) => ({ ...i, weight: Math.max(1, v) }), range: (a) => [Math.max(5, a * 0.6), a * 1.4] },
  { key: "reps", label: "반복 횟수", plain: "들어 올린 횟수", unit: "reps", kind: "assumption", get: (i) => i.reps, set: (i, v) => ({ ...i, reps: Math.min(20, Math.max(1, Math.round(v))) }), range: fixedRange(1, 15) },
];

export const repTable = (i: OneRmLite) => {
  const one = oneRmOf(i);
  return [1, 3, 5, 8, 10, 12].map((r) => ({ label: `${r}회`, value: weightForReps(one, r), current: r === i.reps }));
};

export function oneRmPlain(i: OneRmLite, top?: TornadoBar) {
  const r = oneRmResult(i);
  return {
    headline: `한 번에 들 수 있는 최대 무게(1RM)는 약 ${kgOne(r.oneRm)}이에요.`,
    driver: unitDriver(top, "1RM", kgOne),
    reasons: [
      `두 공식의 평균이에요. Epley ${kgOne(r.epley)}, Brzycki ${kgOne(r.brzycki)}로 계산됐어요.`,
      i.reps > 10 ? "10회를 넘는 기록은 오차가 커져요. 3~8회로 든 무게로 다시 재 보세요." : "3~8회로 든 기록일수록 정확해요.",
      `근력을 키우려면 1RM의 80~85%(약 ${kgOne(r.oneRm * 0.8)}~${kgOne(r.oneRm * 0.85)})로 5회 안팎을 하세요. 실제 1RM 측정은 보조자와 함께 하세요.`,
    ],
  };
}

// ───────────────────────── 자녀 예상 키 ─────────────────────────

export interface ChildLite {
  father: number;
  mother: number;
  sex: Sex;
}

/** 중간 부모 키 공식(Tanner): (아버지+어머니 ±13)/2, 범위 ±8.5cm */
export function childResult(i: ChildLite) {
  const mid = (i.father + i.mother + (i.sex === "m" ? 13 : -13)) / 2;
  return { mid, low: mid - 8.5, high: mid + 8.5, other: (i.father + i.mother + (i.sex === "m" ? -13 : 13)) / 2 };
}
export const childOf = (i: ChildLite) => childResult(i).mid;

export const CHILD_ASSUMPTIONS: Assumption<ChildLite>[] = [
  { key: "father", label: "아버지 키", plain: "아버지 키", unit: "cm", kind: "assumption", get: (i) => i.father, set: (i, v) => ({ ...i, father: Math.max(130, v) }), range: fixedRange(155, 195) },
  { key: "mother", label: "어머니 키", plain: "어머니 키", unit: "cm", kind: "assumption", get: (i) => i.mother, set: (i, v) => ({ ...i, mother: Math.max(130, v) }), range: fixedRange(145, 180) },
];

export function childPlain(i: ChildLite, top?: TornadoBar) {
  const r = childResult(i);
  return {
    headline: `${i.sex === "m" ? "아들" : "딸"}의 예상 키는 약 ${cmOne(r.mid)}예요. 대부분 ${cmOne(r.low)}~${cmOne(r.high)} 사이에 들어요.`,
    driver: unitDriver(top, "예상 키", cmOne),
    reasons: [
      `부모 키를 더하고 ${i.sex === "m" ? "남자는 13cm를 더해" : "여자는 13cm를 빼"} 반으로 나눴어요. 같은 부모에게서 ${i.sex === "m" ? "딸" : "아들"}이라면 약 ${cmOne(r.other)}예요.`,
      "유전으로 정해지는 몫은 70~80% 정도예요. 잠, 영양, 운동이 나머지 범위 안에서 위아래를 정해요.",
      "또래보다 3백분위수 아래거나 1년에 4cm 미만으로 자라면 소아청소년과에서 성장 진료를 받아 보세요.",
    ],
  };
}

// ───────────────────────── 카페인 ─────────────────────────

export const CAFFEINE_DRINKS = [
  { label: "아메리카노 1잔", mg: 150 },
  { label: "에너지 음료 1캔", mg: 80 },
  { label: "녹차 1잔", mg: 30 },
  { label: "아메리카노 2잔", mg: 300 },
] as const;

export interface CaffeineLite {
  amount: number;
  /** 마신 뒤 잠들기까지 시간 */
  gap: number;
  /** 반감기(시간) */
  halfLife: number;
}

export const caffeineLeft = (i: CaffeineLite) => i.amount * Math.pow(0.5, Math.max(0, i.gap) / Math.max(1, i.halfLife));
/** 남은 양이 limit mg 아래로 내려가는 데 걸리는 시간 */
export const hoursUntil = (i: CaffeineLite, limit: number) => (i.amount <= limit ? 0 : i.halfLife * Math.log2(i.amount / limit));

export const CAFFEINE_ASSUMPTIONS: Assumption<CaffeineLite>[] = [
  { key: "amount", label: "카페인 양", plain: "마신 카페인", unit: "mg", kind: "assumption", get: (i) => i.amount, set: (i, v) => ({ ...i, amount: Math.max(0, v) }), range: fixedRange(30, 400) },
  { key: "gap", label: "잠들기까지 시간", plain: "마시고 잠들 때까지", unit: "hours", kind: "assumption", get: (i) => i.gap, set: (i, v) => ({ ...i, gap: Math.max(0, Math.round(v)) }), range: fixedRange(1, 16) },
  { key: "halfLife", label: "반감기", plain: "몸에서 반으로 줄어드는 시간", unit: "hours", kind: "assumption", get: (i) => i.halfLife, set: (i, v) => ({ ...i, halfLife: Math.min(12, Math.max(2, v)) }), range: fixedRange(3, 9) },
];

export const caffeineCurve = (i: CaffeineLite) => [0, 2, 4, 6, 8, 10, 12].map((h) => ({ label: `${h}시간 뒤`, value: caffeineLeft({ ...i, gap: h }), current: h === Math.round(i.gap) }));

export function caffeinePlain(i: CaffeineLite, top?: TornadoBar) {
  const left = caffeineLeft(i);
  const wait = hoursUntil(i, 50);
  return {
    headline: `잠들 때 카페인이 약 ${mg(left)} 남아요. ${left > 50 ? "잠이 얕아질 수 있는 양이에요." : "잠에 큰 영향은 없을 양이에요."}`,
    driver: unitDriver(top, "잠들 때 남은 카페인", mg),
    reasons: [
      `카페인은 약 ${Math.round(i.halfLife)}시간마다 반으로 줄어요. ${i.amount}mg이 50mg 밑으로 내려가려면 약 ${Math.ceil(wait)}시간이 걸려요.`,
      "50mg은 아메리카노 3분의 1잔 정도예요. 잠들 때 이보다 많으면 깊은 잠이 줄어든다는 연구가 많아요. 사람마다 다르니 기준으로만 보세요.",
      "식약처 권고는 성인 하루 400mg, 임산부 300mg 이하예요. 임신 중이거나 피임약을 먹으면 반감기가 길어져요.",
    ],
  };
}
