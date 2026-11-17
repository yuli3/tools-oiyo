// 4묶음 건강 계산기 1차(BMI·체지방·TDEE·물·카페인) 다른 언어 판(en·ja·zh·fr·es) 문구 (2026-11-17).
// 계산은 health-scenarios.ts·health2-scenarios.ts 그대로. BMI 판정 구간만 나라 기준을 따라요:
// en·fr·es = WHO(25·30), ja = 日本肥満学会(25부터 비만), zh = 中国 WS/T 428(24·28).
import { ACTIVITY, bmiOf, bodyFatPct, bodyFatResult, tdeeOf, tdeeResult, weightAt, type Activity, type BmiLite, type BodyFatLite, type TdeeLite } from "./health-scenarios.ts";
import { caffeineLeft, hoursUntil, WATER_ACTIVITY, WATER_TEMP, waterResult, type CaffeineLite, type WaterActivity, type WaterLite, type WaterTemp } from "./health2-scenarios.ts";
import { fixedRange, type Assumption, type TornadoBar } from "./scenario.ts";
import { driverOf, type WL } from "./world-money-i18n.ts";

const INTL: Record<WL, string> = { en: "en-US", ja: "ja-JP", zh: "zh-CN", fr: "fr-FR", es: "es-ES" };
export const n1 = (n: number, lang: WL) => (Number.isFinite(n) ? new Intl.NumberFormat(INTL[lang], { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(n) : "—");
export const n0 = (n: number, lang: WL) => (Number.isFinite(n) ? new Intl.NumberFormat(INTL[lang], { maximumFractionDigits: 0 }).format(n) : "—");
const sp = (lang: WL) => (lang === "fr" || lang === "es" ? " " : lang === "en" ? " " : "");
export const kgL = (n: number, lang: WL) => `${n1(n, lang)}${sp(lang)}kg`;
export const kcalL = (n: number, lang: WL) => `${n0(n, lang)}${sp(lang)}kcal`;
export const mlL = (n: number, lang: WL) => `${n0(n, lang)}${sp(lang)}ml`;
export const mgL = (n: number, lang: WL) => `${n0(n, lang)}${sp(lang)}mg`;

type Pair = Record<WL, [string, string]>;
const A = <I>(lang: WL, key: string, n: Pair, unit: Assumption<I>["unit"], kind: Assumption<I>["kind"], get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number]): Assumption<I> => ({ key, label: n[lang][0], plain: n[lang][1], unit, kind, get, set, range });
const WEIGHT: Pair = { en: ["Weight", "your weight"], ja: ["体重", "体重"], zh: ["体重", "体重"], fr: ["Poids", "le poids"], es: ["Peso", "el peso"] };
const HEIGHT: Pair = { en: ["Height", "your height"], ja: ["身長", "身長"], zh: ["身高", "身高"], fr: ["Taille", "la taille"], es: ["Altura", "la altura"] };

// ───────────────────────── BMI ─────────────────────────

export interface Band { max: number; label: string }
export const BMI_BANDS_L: Record<WL, Band[]> = {
  en: [{ max: 18.5, label: "Underweight" }, { max: 25, label: "Healthy weight" }, { max: 30, label: "Overweight" }, { max: 35, label: "Obesity class 1" }, { max: 40, label: "Obesity class 2" }, { max: Infinity, label: "Obesity class 3" }],
  ja: [{ max: 18.5, label: "低体重" }, { max: 25, label: "普通体重" }, { max: 30, label: "肥満（1度）" }, { max: 35, label: "肥満（2度）" }, { max: 40, label: "肥満（3度）" }, { max: Infinity, label: "肥満（4度）" }],
  zh: [{ max: 18.5, label: "体重过低" }, { max: 24, label: "正常" }, { max: 28, label: "超重" }, { max: Infinity, label: "肥胖" }],
  fr: [{ max: 18.5, label: "Insuffisance pondérale" }, { max: 25, label: "Poids normal" }, { max: 30, label: "Surpoids" }, { max: 35, label: "Obésité modérée" }, { max: 40, label: "Obésité sévère" }, { max: Infinity, label: "Obésité morbide" }],
  es: [{ max: 18.5, label: "Bajo peso" }, { max: 25, label: "Peso normal" }, { max: 30, label: "Sobrepeso" }, { max: 35, label: "Obesidad grado I" }, { max: 40, label: "Obesidad grado II" }, { max: Infinity, label: "Obesidad grado III" }],
};
/** 정상 범위 위쪽 경계(이 값 미만이 정상) */
export const NORMAL_TOP: Record<WL, number> = { en: 25, ja: 25, zh: 24, fr: 25, es: 25 };
/** 그래프 점선 */
export const BMI_LINES: Record<WL, number[]> = { en: [18.5, 25, 30], ja: [18.5, 25, 30], zh: [18.5, 24, 28], fr: [18.5, 25, 30], es: [18.5, 25, 30] };

export function bmiResultL(i: BmiLite, lang: WL) {
  const bmi = bmiOf(i);
  const low = weightAt(i.height, 18.5);
  const high = weightAt(i.height, NORMAL_TOP[lang] - 0.1);
  return { bmi, band: BMI_BANDS_L[lang].find((b) => bmi < b.max)!.label, low, high, toNormal: i.weight > high ? i.weight - high : i.weight < low ? i.weight - low : 0 };
}

export const bmiAssumptionsL = (lang: WL): Assumption<BmiLite>[] => [
  A<BmiLite>(lang, "weight", WEIGHT, "kg", "assumption", (i) => i.weight, (i, v) => ({ ...i, weight: Math.max(20, v) }), (a) => [Math.max(30, a * 0.6), a * 1.4]),
  A<BmiLite>(lang, "height", HEIGHT, "cm", "fact", (i) => i.height, (i, v) => ({ ...i, height: Math.max(100, v) }), fixedRange(140, 200)),
];
export const bmiMarksL = (i: BmiLite, lang: WL) => BMI_LINES[lang].map((b) => ({ at: weightAt(i.height, b), label: String(b) }));

export const bmiPlainL = (lang: WL) => (i: BmiLite, top?: TornadoBar) => {
  const r = bmiResultL(i, lang);
  const b = n1(r.bmi, lang);
  const kg = (n: number) => kgL(n, lang);
  const T = {
    en: { head: `A BMI of ${b} is "${r.band}". For ${n1(i.height, lang)} cm, a healthy weight is ${kg(r.low)}–${kg(r.high)}.`, over: `You're ${kg(r.toNormal)} above the healthy range. Losing 0.5–1 kg a week is a sustainable pace.`, under: `You're ${kg(-r.toNormal)} below the healthy range. Add strength training and protein together.`, ok: "You're in the healthy range. Also check your waist: under 102 cm for men and 88 cm for women.", std: "These are WHO adult categories: 25 overweight, 30 obese. Some Asian guidelines use lower cut-offs because metabolic risk starts earlier.", lim: "BMI can't tell muscle from fat. If you train a lot, check body fat percentage too.", what: "your BMI" },
    ja: { head: `BMI ${b}で「${r.band}」です。身長${n1(i.height, lang)}cmの普通体重は${kg(r.low)}〜${kg(r.high)}です。`, over: `普通体重の上限まであと${kg(r.toNormal)}です。月に1〜2kgずつ減らすペースが無理がありません。`, under: `普通体重まで${kg(-r.toNormal)}増やす必要があります。筋トレとたんぱく質を一緒に増やしましょう。`, ok: "普通体重の範囲です。腹囲（男性85cm、女性90cm未満）も合わせて見てください。", std: "日本肥満学会の基準で、BMI 25以上を肥満としています。WHOの基準（25は過体重、30から肥満）より厳しめです。", lim: "BMIは筋肉と脂肪を区別できません。よく運動する人は体脂肪率も見てください。", what: "BMI" },
    zh: { head: `BMI ${b}，属于“${r.band}”。身高${n1(i.height, lang)}cm的正常体重为${kg(r.low)}~${kg(r.high)}。`, over: `距正常范围上限还差${kg(r.toNormal)}。每月减1~2kg比较稳妥。`, under: `需要增加${kg(-r.toNormal)}才到正常范围。力量训练和蛋白质要一起加。`, ok: "在正常范围内。也看看腰围：男性<90cm，女性<85cm。", std: "这是中国成人标准（WS/T 428）：24起超重，28起肥胖，比WHO的25、30更严格。", lim: "BMI分不清肌肉和脂肪。经常运动的人请同时看体脂率。", what: "BMI" },
    fr: { head: `Un IMC de ${b} correspond à « ${r.band} ». Pour ${n1(i.height, lang)} cm, le poids normal va de ${kg(r.low)} à ${kg(r.high)}.`, over: `Vous êtes ${kg(r.toNormal)} au-dessus de la plage normale. Perdre 0,5 à 1 kg par semaine est un rythme tenable.`, under: `Il manque ${kg(-r.toNormal)} pour atteindre la plage normale. Associez musculation et protéines.`, ok: "Vous êtes dans la plage normale. Regardez aussi le tour de taille : moins de 94 cm (hommes) et 80 cm (femmes).", std: "Catégories de l'OMS pour l'adulte : surpoids à 25, obésité à 30.", lim: "L'IMC ne distingue pas muscle et graisse. Si vous vous entraînez beaucoup, regardez aussi le taux de masse grasse.", what: "l'IMC" },
    es: { head: `Un IMC de ${b} es «${r.band}». Para ${n1(i.height, lang)} cm, el peso normal va de ${kg(r.low)} a ${kg(r.high)}.`, over: `Estás ${kg(r.toNormal)} por encima del rango normal. Bajar 0,5-1 kg por semana es un ritmo sostenible.`, under: `Te faltan ${kg(-r.toNormal)} para el rango normal. Combina fuerza y proteína.`, ok: "Estás en el rango normal. Mira también la cintura: menos de 102 cm en hombres y 88 cm en mujeres.", std: "Categorías de la OMS para adultos: sobrepeso desde 25, obesidad desde 30.", lim: "El IMC no distingue músculo de grasa. Si entrenas mucho, mira también el porcentaje de grasa.", what: "el IMC" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, (n) => n1(n, lang)), reasons: [r.toNormal > 0 ? T.over : r.toNormal < 0 ? T.under : T.ok, T.std, T.lim] };
};

// ───────────────────────── 체지방률 ─────────────────────────

const FAT_BAND_L: Record<WL, string[]> = {
  en: ["Essential fat", "Athletic", "Fit", "Average", "High"],
  ja: ["必須脂肪レベル", "アスリート", "引き締まっている", "標準", "高め"],
  zh: ["必需脂肪", "运动员水平", "健美", "一般", "偏高"],
  fr: ["Graisse essentielle", "Athlète", "En forme", "Moyen", "Élevé"],
  es: ["Grasa esencial", "Atleta", "En forma", "Promedio", "Alto"],
};
const FAT_KO = ["필수 지방 수준", "운동선수 수준", "탄탄함", "보통", "높음"];
export const bodyFatBandL = (i: BodyFatLite, lang: WL) => {
  const k = FAT_KO.indexOf(bodyFatResult(i).band);
  return k >= 0 ? FAT_BAND_L[lang][k] : "—";
};

export const bodyFatAssumptionsL = (lang: WL): Assumption<BodyFatLite>[] => [
  A<BodyFatLite>(lang, "waist", { en: ["Waist", "waist size"], ja: ["腹囲", "ウエスト"], zh: ["腰围", "腰围"], fr: ["Tour de taille", "le tour de taille"], es: ["Cintura", "la cintura"] }, "cm", "assumption", (i) => i.waist, (i, v) => ({ ...i, waist: Math.max(40, v) }), (a) => [Math.max(50, a * 0.75), a * 1.25]),
  A<BodyFatLite>(lang, "neck", { en: ["Neck", "neck size"], ja: ["首回り", "首回り"], zh: ["颈围", "颈围"], fr: ["Tour de cou", "le tour de cou"], es: ["Cuello", "el cuello"] }, "cm", "assumption", (i) => i.neck, (i, v) => ({ ...i, neck: Math.max(20, v) }), (a) => [Math.max(25, a * 0.8), a * 1.2]),
  A<BodyFatLite>(lang, "hip", { en: ["Hips (women)", "hip size"], ja: ["ヒップ（女性）", "ヒップ"], zh: ["臀围（女性）", "臀围"], fr: ["Tour de hanches (femmes)", "le tour de hanches"], es: ["Cadera (mujeres)", "la cadera"] }, "cm", "assumption", (i) => i.hip, (i, v) => ({ ...i, hip: Math.max(50, v) }), (a) => [Math.max(60, a * 0.8), a * 1.2]),
  A<BodyFatLite>(lang, "height", HEIGHT, "cm", "fact", (i) => i.height, (i, v) => ({ ...i, height: Math.max(100, v) }), fixedRange(140, 200)),
];

export const bodyFatPlainL = (lang: WL) => (i: BodyFatLite, top?: TornadoBar) => {
  const r = bodyFatResult(i);
  const kg = (n: number) => kgL(n, lang);
  if (!Number.isFinite(r.pct)) {
    return { headline: { en: "Please check the measurements: the waist must be larger than the neck.", ja: "測定値を確認してください。腹囲が首回りより大きい必要があります。", zh: "请检查围度：腰围必须大于颈围。", fr: "Vérifiez les mesures : le tour de taille doit dépasser le tour de cou.", es: "Revisa las medidas: la cintura debe ser mayor que el cuello." }[lang], driver: null, reasons: [] };
  }
  const p = n1(r.pct, lang);
  const band = bodyFatBandL(i, lang);
  const d = n1(r.pct - bodyFatPct({ ...i, waist: i.waist - 1 }), lang);
  const m = i.sex === "m";
  const T = {
    en: { head: `Body fat is about ${p}% ("${band}"). About ${kg(r.fat)} of your ${kg(i.weight)} is fat.`, r1: `Lean mass is about ${kg(r.lean)}. When dieting, keep this number from dropping with protein and strength training.`, r2: `Each 1 cm off the waist lowers body fat by about ${d} points. ${m ? "Measure the waist at the navel after breathing out." : "Measure the waist at its narrowest and the hips at their widest."}`, r3: "The US Navy tape method is accurate to about ±3 points. Use the same method to track change rather than comparing with scales or DEXA.", what: "body fat" },
    ja: { head: `体脂肪率は約${p}%で「${band}」です。体重${kg(i.weight)}のうち脂肪は約${kg(r.fat)}です。`, r1: `脂肪を除いた体重（除脂肪量）は約${kg(r.lean)}です。減量中はたんぱく質と筋トレでこの数字を落とさないようにしましょう。`, r2: `腹囲が1cm減ると体脂肪率は約${d}ポイント下がります。${m ? "腹囲はへその高さで息を吐いた状態で測ります。" : "ウエストは最も細い所、ヒップは最も出ている所を測ります。"}`, r3: "米海軍の周囲長法は±3ポイントほどの誤差があります。体組成計とは違うことがあるので、同じ方法で変化を見るのに使ってください。", what: "体脂肪率" },
    zh: { head: `体脂率约${p}%，属于“${band}”。体重${kg(i.weight)}中脂肪约${kg(r.fat)}。`, r1: `去脂体重约${kg(r.lean)}。减脂时要靠蛋白质和力量训练守住这个数。`, r2: `腰围每减1cm，体脂率约降${d}个百分点。${m ? "腰围在肚脐高度、呼气后测量。" : "腰围量最细处，臀围量最突出处。"}`, r3: "美国海军围度法误差约±3个百分点，可能与体脂秤不同。请用同一方法观察变化。", what: "体脂率" },
    fr: { head: `Votre masse grasse est d'environ ${p} % (« ${band} »). Environ ${kg(r.fat)} de vos ${kg(i.weight)} sont de la graisse.`, r1: `La masse maigre est d'environ ${kg(r.lean)}. Pendant un régime, protégez-la avec des protéines et de la musculation.`, r2: `Chaque centimètre de tour de taille en moins fait baisser la masse grasse d'environ ${d} point. ${m ? "Mesurez la taille au nombril, après avoir expiré." : "Mesurez la taille au plus fin et les hanches au plus large."}`, r3: "La méthode de l'US Navy a une marge d'environ ±3 points. Servez-vous-en pour suivre l'évolution avec la même méthode.", what: "la masse grasse" },
    es: { head: `Tu grasa corporal ronda el ${p} % («${band}»). Unos ${kg(r.fat)} de tus ${kg(i.weight)} son grasa.`, r1: `La masa magra es de unos ${kg(r.lean)}. Si haces dieta, protégela con proteína y entrenamiento de fuerza.`, r2: `Cada centímetro menos de cintura baja la grasa unos ${d} puntos. ${m ? "Mide la cintura a la altura del ombligo, tras soltar el aire." : "Mide la cintura en su parte más estrecha y la cadera en la más ancha."}`, r3: "El método de la Marina de EE. UU. tiene un margen de unos ±3 puntos. Úsalo para seguir cambios con el mismo método.", what: "la grasa corporal" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, (n) => `${n1(n, lang)}%`), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── TDEE ─────────────────────────

export const ACTIVITY_L: Record<WL, Record<Activity, string>> = {
  en: { sedentary: "Mostly sitting (desk job)", light: "Light exercise 1–3×/week", moderate: "Exercise 3–5×/week", heavy: "Exercise 6–7×/week", athlete: "Hard training twice a day" },
  ja: { sedentary: "ほぼ座りきり（デスクワーク）", light: "軽い運動 週1〜3回", moderate: "運動 週3〜5回", heavy: "運動 週6〜7回", athlete: "1日2回以上の高強度" },
  zh: { sedentary: "久坐（办公室）", light: "轻度运动 每周1~3次", moderate: "运动 每周3~5次", heavy: "运动 每周6~7次", athlete: "每天2次以上高强度" },
  fr: { sedentary: "Sédentaire (bureau)", light: "Sport léger 1 à 3 fois/sem.", moderate: "Sport 3 à 5 fois/sem.", heavy: "Sport 6 à 7 fois/sem.", athlete: "Entraînement intense 2 fois/jour" },
  es: { sedentary: "Sedentario (oficina)", light: "Ejercicio ligero 1-3 veces/sem.", moderate: "Ejercicio 3-5 veces/sem.", heavy: "Ejercicio 6-7 veces/sem.", athlete: "Entreno intenso 2 veces/día" },
};

export const tdeeAssumptionsL = (lang: WL): Assumption<TdeeLite>[] => [
  A<TdeeLite>(lang, "weight", WEIGHT, "kg", "assumption", (i) => i.weight, (i, v) => ({ ...i, weight: Math.max(30, v) }), (a) => [Math.max(35, a * 0.7), a * 1.3]),
  A<TdeeLite>(lang, "age", { en: ["Age", "your age"], ja: ["年齢", "年齢"], zh: ["年龄", "年龄"], fr: ["Âge", "l'âge"], es: ["Edad", "la edad"] }, "age", "assumption", (i) => i.age, (i, v) => ({ ...i, age: Math.max(15, Math.round(v)) }), fixedRange(18, 80)),
  A<TdeeLite>(lang, "height", HEIGHT, "cm", "fact", (i) => i.height, (i, v) => ({ ...i, height: Math.max(120, v) }), fixedRange(140, 200)),
];

export const tdeeCompareL = (i: TdeeLite, lang: WL) => (Object.keys(ACTIVITY) as Activity[]).map((a) => ({ label: ACTIVITY_L[lang][a], value: tdeeOf({ ...i, activity: a }), current: a === i.activity }));

export const tdeePlainL = (lang: WL) => (i: TdeeLite, top?: TornadoBar) => {
  const r = tdeeResult(i);
  const k = (n: number) => kcalL(n, lang);
  const act = ACTIVITY_L[lang][i.activity];
  const f = ACTIVITY[i.activity].k;
  const pr = n0(r.protein, lang);
  const T = {
    en: { head: `You burn about ${k(r.tdee)} a day. To lose weight eat about ${k(r.loss)}; to gain, about ${k(r.gain)}.`, r1: `Your resting metabolism is ${k(r.bmr)}; your activity (${act}) multiplies it by ${f}.`, r2: `Eating 500 kcal less a day loses about 0.5 kg a week. Aim for 1.6 g of protein per kg (about ${pr} g) to keep muscle.`, r3: "The Mifflin-St Jeor formula is an average and can be off by ±10%. Adjust after 2–3 weeks of weigh-ins. If pregnant or ill, ask a clinician.", what: "daily calories" },
    ja: { head: `1日に約${k(r.tdee)}消費します。減量なら約${k(r.loss)}、増量なら約${k(r.gain)}を目安に食べましょう。`, r1: `基礎代謝は${k(r.bmr)}で、活動量（${act}）の${f}倍で計算しています。`, r2: `1日500kcal減らすと週に約0.5kg減ります。たんぱく質は体重1kgあたり1.6g（約${pr}g）とると筋肉が落ちにくくなります。`, r3: "式（Mifflin-St Jeor）は平均値なので個人差が±10%あります。2〜3週間の体重変化を見て調整してください。妊娠中や持病がある場合は医師に相談しましょう。", what: "1日の消費カロリー" },
    zh: { head: `每天约消耗${k(r.tdee)}。减重约吃${k(r.loss)}，增重约吃${k(r.gain)}。`, r1: `基础代谢为${k(r.bmr)}，按活动量（${act}）乘以${f}。`, r2: `每天少吃500kcal，每周约减0.5kg。蛋白质按每公斤体重1.6g（约${pr}g）摄入，肌肉流失更少。`, r3: "公式（Mifflin-St Jeor）是平均值，个体差异约±10%。观察2~3周体重变化再调整。孕期或有疾病请咨询医生。", what: "每日消耗热量" },
    fr: { head: `Vous dépensez environ ${k(r.tdee)} par jour. Pour maigrir, visez environ ${k(r.loss)} ; pour prendre du poids, environ ${k(r.gain)}.`, r1: `Votre métabolisme de base est de ${k(r.bmr)}, multiplié par ${f} pour votre activité (${act}).`, r2: `Manger 500 kcal de moins par jour fait perdre environ 0,5 kg par semaine. Visez 1,6 g de protéines par kg (environ ${pr} g) pour garder vos muscles.`, r3: "La formule de Mifflin-St Jeor est une moyenne, à ±10 % près. Ajustez après 2 à 3 semaines de pesées. En cas de grossesse ou de maladie, demandez l'avis d'un professionnel.", what: "la dépense quotidienne" },
    es: { head: `Gastas unas ${k(r.tdee)} al día. Para adelgazar, come unas ${k(r.loss)}; para ganar peso, unas ${k(r.gain)}.`, r1: `Tu metabolismo basal es de ${k(r.bmr)}, multiplicado por ${f} según tu actividad (${act}).`, r2: `Comer 500 kcal menos al día hace perder unos 0,5 kg por semana. Toma 1,6 g de proteína por kg (unos ${pr} g) para conservar músculo.`, r3: "La fórmula de Mifflin-St Jeor es una media, con un margen de ±10 %. Ajusta tras 2-3 semanas de pesarte. Si estás embarazada o enferma, consulta a un profesional.", what: "el gasto diario" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, k), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── 물 ─────────────────────────

export const WATER_ACT_L: Record<WL, Record<WaterActivity, string>> = {
  en: { low: "Barely active", moderate: "About 30 min of exercise", high: "Over an hour of sweating" },
  ja: { low: "ほとんど動かない", moderate: "30分ほど運動", high: "1時間以上汗をかく" },
  zh: { low: "几乎不动", moderate: "运动30分钟左右", high: "出汗超过1小时" },
  fr: { low: "Peu actif", moderate: "Environ 30 min de sport", high: "Plus d'une heure à transpirer" },
  es: { low: "Poco activo", moderate: "Unos 30 min de ejercicio", high: "Más de una hora sudando" },
};
export const WATER_TEMP_L: Record<WL, Record<WaterTemp, string>> = {
  en: { cool: "Cool", normal: "Mild", hot: "Hot and humid" },
  ja: { cool: "涼しい", normal: "ふつう", hot: "蒸し暑い" },
  zh: { cool: "凉爽", normal: "一般", hot: "湿热" },
  fr: { cool: "Frais", normal: "Doux", hot: "Chaud et humide" },
  es: { cool: "Fresco", normal: "Templado", hot: "Caluroso y húmedo" },
};
export const WATER_KEYS = { act: Object.keys(WATER_ACTIVITY) as WaterActivity[], temp: Object.keys(WATER_TEMP) as WaterTemp[] };

export const waterAssumptionsL = (lang: WL): Assumption<WaterLite>[] => [
  A<WaterLite>(lang, "weight", WEIGHT, "kg", "assumption", (i) => i.weight, (i, v) => ({ ...i, weight: Math.max(20, v) }), (a) => [Math.max(30, a * 0.7), a * 1.3]),
  A<WaterLite>(lang, "alcohol", { en: ["Alcoholic drinks", "drinks"], ja: ["飲酒（杯）", "飲んだお酒"], zh: ["饮酒（杯）", "喝的酒"], fr: ["Verres d'alcool", "l'alcool"], es: ["Copas de alcohol", "el alcohol"] }, "reps", "assumption", (i) => i.alcohol, (i, v) => ({ ...i, alcohol: Math.max(0, Math.round(v)) }), fixedRange(0, 6)),
];

export const waterPlainL = (lang: WL) => (i: WaterLite, top?: TornadoBar) => {
  const r = waterResult(i);
  const m = (n: number) => mlL(n, lang);
  const T = {
    en: { head: `Drink about ${m(r.total)} of water a day: ${r.cups} glasses of 250 ml.`, r1: `30 ml per kg gives ${m(r.base)}, plus ${m(r.act)} for exercise and ${m(r.temp)} for weather${r.alcohol ? `, plus ${m(r.alcohol)} for alcohol` : ""}.`, r2: "Coffee and tea count as fluid; 3–4 cups a day don't dehydrate you much. After alcohol, drink extra water.", r3: "Sip a glass every 1–2 hours rather than all at once. If a doctor has limited your fluids for kidney or heart disease, follow their advice.", what: "the water to drink" },
    ja: { head: `1日に水を約${m(r.total)}、250mlのコップで${r.cups}杯飲みましょう。`, r1: `体重1kgあたり30mlで${m(r.base)}、運動${m(r.act)}、気温${m(r.temp)}${r.alcohol ? `、お酒${m(r.alcohol)}` : ""}を足しています。`, r2: "コーヒー・お茶も水分に数えます。1日3〜4杯なら利尿作用で失う水分は大きくありません。お酒を飲んだら、その分水を足しましょう。", r3: "一度にまとめて飲むより、1〜2時間ごとに1杯ずつ。腎臓・心臓の病気で水分制限がある人は医師の指示に従ってください。", what: "飲む水の量" },
    zh: { head: `每天喝水约${m(r.total)}，相当于250ml的杯子${r.cups}杯。`, r1: `按每公斤体重30ml计${m(r.base)}，加运动${m(r.act)}、天气${m(r.temp)}${r.alcohol ? `、饮酒${m(r.alcohol)}` : ""}。`, r2: "咖啡、茶也算水分，每天3~4杯的利尿作用不大。喝酒后要多补水。", r3: "每1~2小时喝一杯，不要一次喝太多。因肾脏或心脏疾病需要限水的人，请遵医嘱。", what: "饮水量" },
    fr: { head: `Buvez environ ${m(r.total)} d'eau par jour, soit ${r.cups} verres de 250 ml.`, r1: `30 ml par kg donnent ${m(r.base)}, plus ${m(r.act)} pour le sport et ${m(r.temp)} pour la météo${r.alcohol ? `, plus ${m(r.alcohol)} pour l'alcool` : ""}.`, r2: "Café et thé comptent comme boisson ; 3 à 4 tasses par jour déshydratent peu. Après de l'alcool, buvez davantage d'eau.", r3: "Buvez un verre toutes les 1 à 2 heures plutôt que tout d'un coup. Si un médecin limite vos apports pour une maladie rénale ou cardiaque, suivez ses consignes.", what: "la quantité d'eau" },
    es: { head: `Bebe unos ${m(r.total)} de agua al día: ${r.cups} vasos de 250 ml.`, r1: `30 ml por kg dan ${m(r.base)}, más ${m(r.act)} por ejercicio y ${m(r.temp)} por el clima${r.alcohol ? `, más ${m(r.alcohol)} por el alcohol` : ""}.`, r2: "El café y el té cuentan como líquido; 3-4 tazas al día deshidratan poco. Si bebes alcohol, toma más agua.", r3: "Bebe un vaso cada 1-2 horas en vez de todo de golpe. Si tu médico te limita los líquidos por enfermedad renal o cardiaca, sigue sus indicaciones.", what: "el agua a beber" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, m), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── 카페인 ─────────────────────────

export const CAFFEINE_DRINKS_L: Record<WL, { label: string; mg: number }[]> = {
  en: [{ label: "Brewed coffee (12 oz)", mg: 140 }, { label: "Espresso shot", mg: 65 }, { label: "Energy drink (8 oz)", mg: 80 }, { label: "Black tea", mg: 45 }],
  ja: [{ label: "ドリップコーヒー1杯", mg: 90 }, { label: "エスプレッソ1杯", mg: 65 }, { label: "エナジードリンク1本", mg: 80 }, { label: "緑茶1杯", mg: 30 }],
  zh: [{ label: "美式咖啡一杯", mg: 150 }, { label: "浓缩咖啡一份", mg: 65 }, { label: "能量饮料一罐", mg: 80 }, { label: "绿茶一杯", mg: 30 }],
  fr: [{ label: "Café filtre (tasse)", mg: 90 }, { label: "Expresso", mg: 65 }, { label: "Boisson énergisante (25 cl)", mg: 80 }, { label: "Thé noir", mg: 45 }],
  es: [{ label: "Café americano", mg: 120 }, { label: "Café solo (expreso)", mg: 65 }, { label: "Bebida energética (25 cl)", mg: 80 }, { label: "Té negro", mg: 45 }],
};

export const caffeineAssumptionsL = (lang: WL): Assumption<CaffeineLite>[] => [
  A<CaffeineLite>(lang, "amount", { en: ["Caffeine", "caffeine intake"], ja: ["カフェイン量", "とったカフェイン"], zh: ["咖啡因量", "摄入的咖啡因"], fr: ["Caféine", "la caféine"], es: ["Cafeína", "la cafeína"] }, "mg", "assumption", (i) => i.amount, (i, v) => ({ ...i, amount: Math.max(0, v) }), fixedRange(30, 400)),
  A<CaffeineLite>(lang, "gap", { en: ["Hours until sleep", "time until bed"], ja: ["寝るまでの時間", "飲んでから寝るまで"], zh: ["距入睡时间", "喝完到睡觉的时间"], fr: ["Heures avant le coucher", "le délai avant le coucher"], es: ["Horas hasta dormir", "el tiempo hasta dormir"] }, "hours", "assumption", (i) => i.gap, (i, v) => ({ ...i, gap: Math.max(0, Math.round(v)) }), fixedRange(1, 16)),
  A<CaffeineLite>(lang, "halfLife", { en: ["Half-life", "how fast your body clears it"], ja: ["半減期", "体内で半分になる時間"], zh: ["半衰期", "体内减半所需时间"], fr: ["Demi-vie", "la vitesse d'élimination"], es: ["Vida media", "lo rápido que la eliminas"] }, "hours", "assumption", (i) => i.halfLife, (i, v) => ({ ...i, halfLife: Math.min(12, Math.max(2, v)) }), fixedRange(3, 9)),
];

export const caffeineCurveL = (i: CaffeineLite, lang: WL) =>
  [0, 2, 4, 6, 8, 10, 12].map((h) => ({ label: { en: `${h} h later`, ja: `${h}時間後`, zh: `${h}小时后`, fr: `après ${h} h`, es: `a las ${h} h` }[lang], value: caffeineLeft({ ...i, gap: h }), current: h === Math.round(i.gap) }));

export const caffeinePlainL = (lang: WL) => (i: CaffeineLite, top?: TornadoBar) => {
  const left = caffeineLeft(i);
  const wait = Math.ceil(hoursUntil(i, 50));
  const g = (n: number) => mgL(n, lang);
  const hl = Math.round(i.halfLife);
  const hi = left > 50;
  const T = {
    en: { head: `About ${g(left)} of caffeine will be left at bedtime. ${hi ? "That can make sleep lighter." : "That shouldn't affect sleep much."}`, r1: `Caffeine halves about every ${hl} hours. ${g(i.amount)} takes about ${wait} hours to drop below 50 mg.`, r2: "50 mg is about half an espresso. Many studies find more than that at bedtime cuts deep sleep. People differ, so treat it as a guide.", r3: "The FDA suggests up to 400 mg a day for adults; during pregnancy, 200 mg. Pregnancy and the pill lengthen the half-life.", what: "caffeine left at bedtime" },
    ja: { head: `寝るときにカフェインが約${g(left)}残ります。${hi ? "眠りが浅くなるかもしれない量です。" : "睡眠への影響は大きくない量です。"}`, r1: `カフェインは約${hl}時間ごとに半分になります。${g(i.amount)}が50mgを下回るまで約${wait}時間かかります。`, r2: "50mgはドリップコーヒー半杯ほどです。寝るときにこれより多いと深い眠りが減るという研究が多くあります。個人差があるので目安として見てください。", r3: "健康な成人は1日400mgまでが目安とされ、妊婦は200〜300mgまでです。妊娠中やピルの服用中は半減期が長くなります。", what: "寝るときのカフェイン" },
    zh: { head: `睡觉时体内约剩${g(left)}咖啡因。${hi ? "可能让睡眠变浅。" : "对睡眠影响不大。"}`, r1: `咖啡因约每${hl}小时减半。${g(i.amount)}降到50mg以下约需${wait}小时。`, r2: "50mg约为三分之一杯美式。许多研究发现，睡前高于这个量会减少深睡眠。因人而异，仅供参考。", r3: "一般建议成人每天不超过400mg，孕妇不超过200mg。怀孕或服用避孕药会使半衰期变长。", what: "睡前剩余咖啡因" },
    fr: { head: `Il restera environ ${g(left)} de caféine au coucher. ${hi ? "Cela peut rendre le sommeil plus léger." : "Cela devrait peu gêner le sommeil."}`, r1: `La caféine diminue de moitié environ toutes les ${hl} heures. ${g(i.amount)} mettent environ ${wait} heures à passer sous 50 mg.`, r2: "50 mg, c'est un peu moins qu'un expresso. Beaucoup d'études montrent qu'au-delà, au coucher, le sommeil profond diminue. Chacun est différent : c'est un repère.", r3: "L'EFSA fixe 400 mg par jour pour l'adulte et 200 mg pendant la grossesse. La grossesse et la pilule allongent la demi-vie.", what: "la caféine au coucher" },
    es: { head: `Al acostarte te quedarán unos ${g(left)} de cafeína. ${hi ? "Puede hacer el sueño más ligero." : "No debería afectar mucho al sueño."}`, r1: `La cafeína se reduce a la mitad cada ${hl} horas aproximadamente. ${g(i.amount)} tardan unas ${wait} horas en bajar de 50 mg.`, r2: "50 mg es algo menos que un café solo. Muchos estudios ven que, por encima de eso al dormir, se reduce el sueño profundo. Cada persona es distinta: tómalo como guía.", r3: "La EFSA fija 400 mg al día para adultos y 200 mg en el embarazo. El embarazo y la píldora alargan la vida media.", what: "la cafeína al dormir" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, g), reasons: [T.r1, T.r2, T.r3] };
};
