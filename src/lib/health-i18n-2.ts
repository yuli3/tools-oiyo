// 4묶음 건강 계산기 2차(매크로·적정 체중·심박수·1RM·자녀 키) 다른 언어 판 문구 (2026-11-17).
// 계산은 health2-scenarios.ts 그대로. 적정 체중의 기준값만 일본은 남녀 모두 BMI 22(日本肥満学会 標準体重)로 잡아요.
import { childResult, HR_ZONES, heartResult, idealFormulas, macroResult, oneRmOf, oneRmResult, weightForReps, type ChildLite, type HeartLite, type IdealLite, type MacroLite, type OneRmLite } from "./health2-scenarios.ts";
import { kgL, n0, n1, NORMAL_TOP } from "./health-i18n.ts";
import { fixedRange, type Assumption, type TornadoBar } from "./scenario.ts";
import { driverOf, type WL } from "./world-money-i18n.ts";

type Pair = Record<WL, [string, string]>;
const A = <I>(lang: WL, key: string, n: Pair, unit: Assumption<I>["unit"], kind: Assumption<I>["kind"], get: (i: I) => number, set: (i: I, v: number) => I, range: (a: number) => [number, number]): Assumption<I> => ({ key, label: n[lang][0], plain: n[lang][1], unit, kind, get, set, range });
const sp = (lang: WL) => (lang === "fr" || lang === "es" ? " " : lang === "en" ? " " : "");
export const gL = (n: number, lang: WL) => `${n0(n, lang)}${sp(lang)}g`;
export const cmL = (n: number, lang: WL) => `${n1(n, lang)}${sp(lang)}cm`;
export const bpmL = (n: number, lang: WL) => `${n0(n, lang)}${sp(lang)}${{ en: "bpm", ja: "拍/分", zh: "次/分", fr: "bpm", es: "lpm" }[lang]}`;

// ───────────────────────── 매크로 ─────────────────────────

export const MACRO_PRESETS_L: Record<WL, string[]> = {
  en: ["Balanced", "High protein", "Low carb", "Keto"],
  ja: ["バランス", "高たんぱく", "低糖質", "ケトジェニック"],
  zh: ["均衡", "高蛋白", "低碳水", "生酮"],
  fr: ["Équilibré", "Riche en protéines", "Pauvre en glucides", "Cétogène"],
  es: ["Equilibrado", "Alto en proteína", "Bajo en carbohidratos", "Keto"],
};
const PROT: Record<WL, string> = { en: "Protein", ja: "たんぱく質", zh: "蛋白质", fr: "Protéines", es: "Proteína" };
const CARB: Record<WL, string> = { en: "Carbs", ja: "炭水化物", zh: "碳水化合物", fr: "Glucides", es: "Carbohidratos" };
const FAT: Record<WL, string> = { en: "Fat", ja: "脂質", zh: "脂肪", fr: "Lipides", es: "Grasa" };
export const MACRO_NAMES = { PROT, CARB, FAT };

export const macroAssumptionsL = (lang: WL): Assumption<MacroLite>[] => [
  A<MacroLite>(lang, "calories", { en: ["Daily calories", "daily calories"], ja: ["1日の摂取カロリー", "1日に食べるカロリー"], zh: ["每日摄入热量", "每天吃的热量"], fr: ["Apport calorique", "l'apport calorique"], es: ["Calorías diarias", "las calorías diarias"] }, "kcal", "assumption", (i) => i.calories, (i, v) => ({ ...i, calories: Math.max(800, v) }), (a) => [Math.max(1000, a * 0.7), a * 1.3]),
  A<MacroLite>(lang, "protein", { en: ["Protein share", "the protein share"], ja: ["たんぱく質の割合", "たんぱく質の割合"], zh: ["蛋白质比例", "蛋白质比例"], fr: ["Part de protéines", "la part de protéines"], es: ["Proporción de proteína", "la proporción de proteína"] }, "pct", "assumption", (i) => i.protein, (i, v) => ({ ...i, protein: Math.min(0.6, Math.max(0.1, v)) }), fixedRange(0.1, 0.5)),
  A<MacroLite>(lang, "fat", { en: ["Fat share", "the fat share"], ja: ["脂質の割合", "脂質の割合"], zh: ["脂肪比例", "脂肪比例"], fr: ["Part de lipides", "la part de lipides"], es: ["Proporción de grasa", "la proporción de grasa"] }, "pct", "assumption", (i) => i.fat, (i, v) => ({ ...i, fat: Math.min(0.75, Math.max(0.1, v)) }), fixedRange(0.15, 0.7)),
  A<MacroLite>(lang, "weight", { en: ["Weight", "your weight"], ja: ["体重", "体重"], zh: ["体重", "体重"], fr: ["Poids", "le poids"], es: ["Peso", "el peso"] }, "kg", "fact", (i) => i.weight, (i, v) => ({ ...i, weight: Math.max(30, v) }), fixedRange(40, 120)),
];

export const macroBarsL = (i: MacroLite, lang: WL) => {
  const r = macroResult(i);
  return [
    { label: `${PROT[lang]} ${Math.round(r.p * 100)}%`, value: r.proteinG },
    { label: `${CARB[lang]} ${Math.round(r.c * 100)}%`, value: r.carbsG },
    { label: `${FAT[lang]} ${Math.round(r.f * 100)}%`, value: r.fatG },
  ];
};

export const macroPlainL = (lang: WL) => (i: MacroLite, top?: TornadoBar) => {
  const r = macroResult(i);
  const g = (n: number) => gL(n, lang);
  const pk = n1(r.perKg, lang);
  const lowP = r.perKg < 1.2;
  const highP = r.perKg > 2.2;
  const keto = r.c < 0.1;
  const T = {
    en: { head: `Eat about ${g(r.proteinG)} of protein, ${g(r.carbsG)} of carbs and ${g(r.fatG)} of fat a day.`, r1: `That's ${pk} g of protein per kg. ${lowP ? "If you train or are cutting, 1.2–2 g/kg is recommended; try a higher protein share." : highP ? "Above 2.2 g/kg, extra protein adds little muscle." : "That's within the 1.2–2.2 g/kg recommended for training or cutting."}`, r2: "Protein and carbs have 4 kcal per gram, fat 9 kcal. That's why fat looks smaller in grams at the same share.", r3: keto ? "Under 10% carbs is a keto diet. The first 1–2 weeks can be tiring; if you take diabetes medication, talk to your clinician first." : "Use the calories from the TDEE calculator for the most accurate split.", what: "protein" },
    ja: { head: `1日にたんぱく質${g(r.proteinG)}、炭水化物${g(r.carbsG)}、脂質${g(r.fatG)}をとりましょう。`, r1: `たんぱく質は体重1kgあたり${pk}gです。${lowP ? "運動中や減量中は1.2〜2gがすすめられます。たんぱく質の割合を上げてみましょう。" : highP ? "2.2gを超えても、筋肉に使われる分はあまり増えません。" : "運動・減量中にすすめられる1.2〜2.2gの範囲内です。"}`, r2: "たんぱく質・炭水化物は1gあたり4kcal、脂質は9kcalで計算しています。同じ割合でも脂質はグラム数が少なく見えます。", r3: keto ? "炭水化物が10%未満はケトジェニック食です。最初の1〜2週間はだるくなることがあり、糖尿病の薬を飲んでいるなら先に医師に相談してください。" : "1日のカロリーはTDEE計算の値を入れるといちばん正確です。", what: "たんぱく質の量" },
    zh: { head: `每天吃蛋白质${g(r.proteinG)}、碳水化合物${g(r.carbsG)}、脂肪${g(r.fatG)}。`, r1: `蛋白质为每公斤体重${pk}g。${lowP ? "运动或减脂期建议1.2~2g，可以提高蛋白质比例。" : highP ? "超过2.2g后，多吃的蛋白质用于肌肉的部分增加不多。" : "在运动、减脂期建议的1.2~2.2g范围内。"}`, r2: "蛋白质和碳水每克4kcal，脂肪每克9kcal。所以同样比例下脂肪的克数看起来更少。", r3: keto ? "碳水低于10%属于生酮饮食。前1~2周可能疲倦；如在服用降糖药，请先咨询医生。" : "每日热量填入TDEE计算器的结果最准确。", what: "蛋白质" },
    fr: { head: `Mangez environ ${g(r.proteinG)} de protéines, ${g(r.carbsG)} de glucides et ${g(r.fatG)} de lipides par jour.`, r1: `Cela fait ${pk} g de protéines par kg. ${lowP ? "En entraînement ou en sèche, on conseille 1,2 à 2 g/kg : augmentez la part de protéines." : highP ? "Au-delà de 2,2 g/kg, le surplus sert peu aux muscles." : "C'est dans la fourchette conseillée de 1,2 à 2,2 g/kg."}`, r2: "Protéines et glucides apportent 4 kcal par gramme, les lipides 9 kcal : à part égale, les lipides pèsent donc moins en grammes.", r3: keto ? "Moins de 10 % de glucides, c'est un régime cétogène. Les 1 à 2 premières semaines peuvent fatiguer ; sous traitement antidiabétique, parlez-en d'abord à votre médecin." : "Utilisez les calories du calculateur TDEE pour une répartition plus juste.", what: "les protéines" },
    es: { head: `Come unos ${g(r.proteinG)} de proteína, ${g(r.carbsG)} de carbohidratos y ${g(r.fatG)} de grasa al día.`, r1: `Son ${pk} g de proteína por kg. ${lowP ? "Si entrenas o estás en déficit, se recomiendan 1,2-2 g/kg: sube la proporción de proteína." : highP ? "Por encima de 2,2 g/kg, la proteína extra apenas suma músculo." : "Está dentro de los 1,2-2,2 g/kg recomendados al entrenar o perder grasa."}`, r2: "Proteína y carbohidratos aportan 4 kcal por gramo y la grasa 9 kcal; por eso, a igual proporción, la grasa pesa menos en gramos.", r3: keto ? "Menos del 10 % de carbohidratos es una dieta keto. Las primeras 1-2 semanas pueden cansar; si tomas medicación para la diabetes, consulta antes a tu médico." : "Usa las calorías de la calculadora TDEE para un reparto más preciso.", what: "la proteína" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, g), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── 적정 체중 ─────────────────────────

export const stdBmi = (i: IdealLite, lang: WL) => (lang === "ja" ? 22 : i.sex === "m" ? 22 : 21);
export function idealResultL(i: IdealLite, lang: WL) {
  const hm = i.height / 100;
  const std = stdBmi(i, lang) * hm * hm;
  const list = [std, ...idealFormulas(i).slice(1).map((f) => f.value)];
  return { std, low: 18.5 * hm * hm, high: (NORMAL_TOP[lang] - 0.1) * hm * hm, min: Math.min(...list), max: Math.max(...list), gap: i.weight - std };
}
export const standardOfL = (lang: WL) => (i: IdealLite) => idealResultL(i, lang).std;
/** 공식 목록(첫 줄 이름만 언어별) */
export const idealFormulasL = (i: IdealLite, lang: WL) => {
  const list = idealFormulas(i);
  const ref = { en: "BMI reference", ja: "標準体重（BMI 22）", zh: "BMI参考", fr: "Référence IMC", es: "Referencia IMC" }[lang];
  const broca = { en: "Broca (height−100)×0.9", ja: "ブローカ変法 (身長−100)×0.9", zh: "布罗卡改良 (身高−100)×0.9", fr: "Broca (taille−100)×0,9", es: "Broca (altura−100)×0,9" }[lang];
  return [{ label: lang === "ja" ? ref : `${ref} ${stdBmi(i, lang)}`, value: idealResultL(i, lang).std }, { label: broca, value: list[1].value }, ...list.slice(2)];
};

export const idealAssumptionsL = (lang: WL): Assumption<IdealLite>[] => [
  A<IdealLite>(lang, "height", { en: ["Height", "your height"], ja: ["身長", "身長"], zh: ["身高", "身高"], fr: ["Taille", "la taille"], es: ["Altura", "la altura"] }, "cm", "assumption", (i) => i.height, (i, v) => ({ ...i, height: Math.max(120, v) }), fixedRange(145, 195)),
];

export const idealPlainL = (lang: WL) => (i: IdealLite, top?: TornadoBar) => {
  const r = idealResultL(i, lang);
  const kg = (n: number) => kgL(n, lang);
  const h = n1(i.height, lang);
  const near = Math.abs(r.gap) < 1;
  const over = r.gap > 0;
  const inRange = i.weight >= r.low && i.weight <= r.high;
  const T = {
    en: { head: `For ${h} cm, a reference weight is about ${kg(r.std)}. The healthy range is ${kg(r.low)}–${kg(r.high)}.`, near: "Your weight is about the same as the reference.", over: `You're ${kg(r.gap)} above the reference. ${inRange ? "That's still within the healthy range." : "Aim first for the top of the healthy range."}`, under: `You're ${kg(-r.gap)} below the reference. ${inRange ? "That's still within the healthy range." : "You're underweight, so focus on muscle and nutrition."}`, r2: `Formulas range from ${kg(r.min)} to ${kg(r.max)}. A range means more than any single number.`, r3: "The healthy range is BMI 18.5–24.9 (WHO). With a lot of muscle you can be healthy above it.", what: "the reference weight" },
    ja: { head: `身長${h}cmの標準体重は約${kg(r.std)}です。普通体重の範囲は${kg(r.low)}〜${kg(r.high)}です。`, near: "今の体重は標準体重とほぼ同じです。", over: `今の体重は標準より${kg(r.gap)}多めです。${inRange ? "それでも普通体重の範囲内です。" : "まず普通体重の上限まで減らすことを目標にしましょう。"}`, under: `今の体重は標準より${kg(-r.gap)}少なめです。${inRange ? "それでも普通体重の範囲内です。" : "低体重なので、筋肉と栄養を一緒に意識しましょう。"}`, r2: `式によって${kg(r.min)}〜${kg(r.max)}と幅があります。数字ひとつより範囲で見るのがおすすめです。`, r3: "日本肥満学会は男女ともBMI 22を標準体重、18.5〜25未満を普通体重としています。筋肉が多い人は範囲を超えても健康なことがあります。", what: "標準体重" },
    zh: { head: `身高${h}cm的参考体重约为${kg(r.std)}，健康范围是${kg(r.low)}~${kg(r.high)}。`, near: "现在的体重与参考体重差不多。", over: `现在比参考体重多${kg(r.gap)}。${inRange ? "仍在健康范围内。" : "先以健康范围上限为目标。"}`, under: `现在比参考体重少${kg(-r.gap)}。${inRange ? "仍在健康范围内。" : "体重偏低，要同时注意肌肉和营养。"}`, r2: `不同公式在${kg(r.min)}~${kg(r.max)}之间。看范围比看单个数字更合适。`, r3: "健康范围按中国标准BMI 18.5~23.9。肌肉多的人超出范围也可能是健康的。", what: "参考体重" },
    fr: { head: `Pour ${h} cm, le poids de référence est d'environ ${kg(r.std)}. La plage saine va de ${kg(r.low)} à ${kg(r.high)}.`, near: "Votre poids est à peu près égal à la référence.", over: `Vous êtes ${kg(r.gap)} au-dessus de la référence. ${inRange ? "Vous restez dans la plage saine." : "Visez d'abord le haut de la plage saine."}`, under: `Vous êtes ${kg(-r.gap)} en dessous de la référence. ${inRange ? "Vous restez dans la plage saine." : "Vous êtes en insuffisance pondérale : misez sur le muscle et la nutrition."}`, r2: `Selon les formules, cela va de ${kg(r.min)} à ${kg(r.max)}. Mieux vaut raisonner en fourchette.`, r3: "La plage saine correspond à un IMC de 18,5 à 24,9 (OMS). Avec beaucoup de muscle, on peut être en bonne santé au-delà.", what: "le poids de référence" },
    es: { head: `Para ${h} cm, el peso de referencia ronda los ${kg(r.std)}. El rango saludable va de ${kg(r.low)} a ${kg(r.high)}.`, near: "Tu peso es prácticamente el de referencia.", over: `Estás ${kg(r.gap)} por encima de la referencia. ${inRange ? "Aun así estás en el rango saludable." : "Apunta primero al límite superior del rango saludable."}`, under: `Estás ${kg(-r.gap)} por debajo de la referencia. ${inRange ? "Aun así estás en el rango saludable." : "Tienes bajo peso: cuida el músculo y la nutrición."}`, r2: `Según la fórmula, va de ${kg(r.min)} a ${kg(r.max)}. Mejor pensar en un rango que en un número.`, r3: "El rango saludable es un IMC de 18,5 a 24,9 (OMS). Con mucho músculo se puede estar sano por encima.", what: "el peso de referencia" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, kg), reasons: [near ? T.near : over ? T.over : T.under, T.r2, T.r3] };
};

// ───────────────────────── 심박수 ─────────────────────────

export const HR_ZONE_L: Record<WL, string[]> = {
  en: ["Zone 1 recovery", "Zone 2 fat burn", "Zone 3 aerobic", "Zone 4 threshold", "Zone 5 maximum"],
  ja: ["ゾーン1 回復", "ゾーン2 脂肪燃焼", "ゾーン3 有酸素", "ゾーン4 高強度", "ゾーン5 最大"],
  zh: ["1区 恢复", "2区 燃脂", "3区 有氧", "4区 高强度", "5区 极限"],
  fr: ["Zone 1 récupération", "Zone 2 endurance", "Zone 3 aérobie", "Zone 4 seuil", "Zone 5 maximale"],
  es: ["Zona 1 recuperación", "Zona 2 quema de grasa", "Zona 3 aeróbica", "Zona 4 umbral", "Zona 5 máxima"],
};
export const HR_COUNT = HR_ZONES.length;

export const heartAssumptionsL = (lang: WL): Assumption<HeartLite>[] => [
  A<HeartLite>(lang, "age", { en: ["Age", "your age"], ja: ["年齢", "年齢"], zh: ["年龄", "年龄"], fr: ["Âge", "l'âge"], es: ["Edad", "la edad"] }, "age", "assumption", (i) => i.age, (i, v) => ({ ...i, age: Math.min(90, Math.max(10, Math.round(v))) }), fixedRange(15, 80)),
  A<HeartLite>(lang, "resting", { en: ["Resting heart rate", "your resting heart rate"], ja: ["安静時心拍数", "安静時の心拍数"], zh: ["静息心率", "静息心率"], fr: ["Fréquence cardiaque au repos", "la fréquence au repos"], es: ["Frecuencia en reposo", "la frecuencia en reposo"] }, "bpm", "assumption", (i) => i.resting, (i, v) => ({ ...i, resting: Math.max(0, Math.round(v)) }), fixedRange(45, 95)),
];

export const heartPlainL = (lang: WL) => (i: HeartLite, top?: TornadoBar) => {
  const r = heartResult(i);
  const b = (n: number) => bpmL(n, lang);
  const z = HR_ZONE_L[lang][Math.max(0, Math.min(4, i.zone))];
  const from = n0(r.z.from, lang);
  const to = n0(r.z.to, lang);
  const T = {
    en: { head: `${z} is about ${from}–${to} beats per minute. Your maximum heart rate is about ${b(r.max)}.`, k: `Calculated with the Karvonen formula using your resting rate (${b(i.resting)}), which adjusts to your fitness.`, nk: "Add your resting heart rate to switch to the Karvonen formula, which adjusts to your fitness. Count your pulse for one minute right after waking.", r2: `Maximum heart rate here is 220 − age. The Tanaka formula (208 − 0.7 × age) gives ${b(r.tanaka)}; the gap grows with age.`, r3: "Zones 2–3 feel like you can talk but not sing. With heart disease or blood-pressure medication, set targets with your clinician.", what: "the target heart rate" },
    ja: { head: `${z}は1分間に${from}〜${to}回ほどです。最大心拍数は約${b(r.max)}です。`, k: `安静時心拍数（${b(i.resting)}）を入れたカルボーネン法で計算しています。体力に合わせた値なのでより正確です。`, nk: "安静時心拍数を入れると、体力に合わせたカルボーネン法に切り替わります。朝起きてすぐ1分間脈を数えましょう。", r2: `最大心拍数は220−年齢で計算しています。別の式（208−0.7×年齢）では${b(r.tanaka)}で、年齢が上がるほど差が開きます。`, r3: "会話はできるけれど歌うのはきつい程度がゾーン2〜3です。心臓病がある人や降圧薬を飲んでいる人は、医師と目標を決めてください。", what: "目標心拍数" },
    zh: { head: `${z}大约是每分钟${from}~${to}次。最大心率约${b(r.max)}。`, k: `用静息心率（${b(i.resting)}）按卡氏公式计算，更贴合体能，也更准确。`, nk: "填入静息心率，就会改用贴合体能的卡氏公式。早上醒来后数1分钟脉搏即可。", r2: `最大心率按220−年龄计算。另一公式（208−0.7×年龄）为${b(r.tanaka)}，年龄越大差距越大。`, r3: "能说话但唱不了歌的强度就是2~3区。有心脏病或在服降压药的人，请与医生一起定目标。", what: "目标心率" },
    fr: { head: `La ${z.toLowerCase()} correspond à environ ${from}–${to} battements par minute. Votre fréquence maximale est d'environ ${b(r.max)}.`, k: `Calcul selon la formule de Karvonen avec votre fréquence au repos (${b(i.resting)}), qui tient compte de votre forme.`, nk: "Ajoutez votre fréquence au repos pour passer à la formule de Karvonen, adaptée à votre forme. Comptez votre pouls pendant une minute au réveil.", r2: `La fréquence maximale est ici 220 − âge. La formule de Tanaka (208 − 0,7 × âge) donne ${b(r.tanaka)} ; l'écart grandit avec l'âge.`, r3: "En zones 2–3, on peut parler mais pas chanter. En cas de maladie cardiaque ou de traitement contre l'hypertension, fixez vos objectifs avec votre médecin.", what: "la fréquence cible" },
    es: { head: `La ${z.toLowerCase()} son unas ${from}-${to} pulsaciones por minuto. Tu frecuencia máxima ronda las ${b(r.max)}.`, k: `Calculado con la fórmula de Karvonen usando tu frecuencia en reposo (${b(i.resting)}), que se ajusta a tu forma física.`, nk: "Añade tu frecuencia en reposo para pasar a la fórmula de Karvonen, ajustada a tu forma. Cuenta el pulso un minuto nada más despertar.", r2: `La frecuencia máxima es aquí 220 − edad. La fórmula de Tanaka (208 − 0,7 × edad) da ${b(r.tanaka)}; la diferencia crece con la edad.`, r3: "En las zonas 2-3 puedes hablar pero no cantar. Si tienes una cardiopatía o tomas medicación para la tensión, fija los objetivos con tu médico.", what: "la frecuencia objetivo" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, b), reasons: [r.karvonen ? T.k : T.nk, T.r2, T.r3] };
};

// ───────────────────────── 1RM ─────────────────────────

export const oneRmAssumptionsL = (lang: WL): Assumption<OneRmLite>[] => [
  A<OneRmLite>(lang, "weight", { en: ["Weight lifted", "the weight lifted"], ja: ["挙げた重量", "挙げた重さ"], zh: ["举起的重量", "举起的重量"], fr: ["Charge soulevée", "la charge"], es: ["Peso levantado", "el peso"] }, "kg", "assumption", (i) => i.weight, (i, v) => ({ ...i, weight: Math.max(1, v) }), (a) => [Math.max(5, a * 0.6), a * 1.4]),
  A<OneRmLite>(lang, "reps", { en: ["Reps", "the reps"], ja: ["回数", "挙げた回数"], zh: ["次数", "完成次数"], fr: ["Répétitions", "les répétitions"], es: ["Repeticiones", "las repeticiones"] }, "reps", "assumption", (i) => i.reps, (i, v) => ({ ...i, reps: Math.min(20, Math.max(1, Math.round(v))) }), fixedRange(1, 15)),
];

export const repTableL = (i: OneRmLite, lang: WL) => {
  const one = oneRmOf(i);
  const lab = { en: (r: number) => `${r} reps`, ja: (r: number) => `${r}回`, zh: (r: number) => `${r}次`, fr: (r: number) => `${r} rép.`, es: (r: number) => `${r} rep.` }[lang];
  return [1, 3, 5, 8, 10, 12].map((r) => ({ label: lab(r), value: weightForReps(one, r), current: r === i.reps }));
};

export const oneRmPlainL = (lang: WL) => (i: OneRmLite, top?: TornadoBar) => {
  const r = oneRmResult(i);
  const kg = (n: number) => kgL(n, lang);
  const many = i.reps > 10;
  const lo = kg(r.oneRm * 0.8);
  const hi = kg(r.oneRm * 0.85);
  const T = {
    en: { head: `Your one-rep max (1RM) is about ${kg(r.oneRm)}.`, r1: `Average of two formulas: Epley ${kg(r.epley)}, Brzycki ${kg(r.brzycki)}.`, r2: many ? "Sets over 10 reps are less accurate. Re-test with a weight you can lift 3–8 times." : "Sets of 3–8 reps give the most accurate estimate.", r3: `For strength, work at 80–85% of 1RM (about ${lo}–${hi}) for around 5 reps. Test a true 1RM only with a spotter.`, what: "1RM" },
    ja: { head: `1回で挙げられる最大重量（1RM）は約${kg(r.oneRm)}です。`, r1: `2つの式の平均です。Epley ${kg(r.epley)}、Brzycki ${kg(r.brzycki)}と計算されました。`, r2: many ? "10回を超える記録は誤差が大きくなります。3〜8回挙がる重さで測り直してみてください。" : "3〜8回で挙げた記録ほど正確です。", r3: `筋力を伸ばすなら1RMの80〜85%（約${lo}〜${hi}）で5回前後を。実際の1RM測定は補助者と一緒に行いましょう。`, what: "1RM" },
    zh: { head: `一次能举起的最大重量（1RM）约为${kg(r.oneRm)}。`, r1: `取两个公式的平均：Epley ${kg(r.epley)}，Brzycki ${kg(r.brzycki)}。`, r2: many ? "超过10次的记录误差较大。请用能举3~8次的重量重新测。" : "3~8次的记录最准确。", r3: `练力量用1RM的80%~85%（约${lo}~${hi}）做5次左右。实测1RM务必有保护者。`, what: "1RM" },
    fr: { head: `Votre charge maximale sur une répétition (1RM) est d'environ ${kg(r.oneRm)}.`, r1: `Moyenne de deux formules : Epley ${kg(r.epley)}, Brzycki ${kg(r.brzycki)}.`, r2: many ? "Au-delà de 10 répétitions, l'estimation est moins fiable. Refaites un test avec une charge levée 3 à 8 fois." : "Les séries de 3 à 8 répétitions donnent l'estimation la plus fiable.", r3: `Pour la force, travaillez à 80–85 % du 1RM (environ ${lo}–${hi}) sur environ 5 répétitions. Ne testez un vrai 1RM qu'avec un pareur.`, what: "le 1RM" },
    es: { head: `Tu máximo a una repetición (1RM) ronda los ${kg(r.oneRm)}.`, r1: `Media de dos fórmulas: Epley ${kg(r.epley)}, Brzycki ${kg(r.brzycki)}.`, r2: many ? "Las series de más de 10 repeticiones son menos precisas. Vuelve a medir con un peso que levantes 3-8 veces." : "Las series de 3-8 repeticiones dan la estimación más precisa.", r3: `Para ganar fuerza, trabaja al 80-85 % del 1RM (unos ${lo}-${hi}) a unas 5 repeticiones. Mide un 1RM real solo con alguien que te asista.`, what: "el 1RM" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, kg), reasons: [T.r1, T.r2, T.r3] };
};

// ───────────────────────── 자녀 예상 키 ─────────────────────────

export const childAssumptionsL = (lang: WL): Assumption<ChildLite>[] => [
  A<ChildLite>(lang, "father", { en: ["Father's height", "the father's height"], ja: ["父の身長", "父の身長"], zh: ["父亲身高", "父亲身高"], fr: ["Taille du père", "la taille du père"], es: ["Altura del padre", "la altura del padre"] }, "cm", "assumption", (i) => i.father, (i, v) => ({ ...i, father: Math.max(130, v) }), fixedRange(155, 195)),
  A<ChildLite>(lang, "mother", { en: ["Mother's height", "the mother's height"], ja: ["母の身長", "母の身長"], zh: ["母亲身高", "母亲身高"], fr: ["Taille de la mère", "la taille de la mère"], es: ["Altura de la madre", "la altura de la madre"] }, "cm", "assumption", (i) => i.mother, (i, v) => ({ ...i, mother: Math.max(130, v) }), fixedRange(145, 180)),
];

export const childPlainL = (lang: WL) => (i: ChildLite, top?: TornadoBar) => {
  const r = childResult(i);
  const cm = (n: number) => cmL(n, lang);
  const boy = i.sex === "m";
  const T = {
    en: { head: `Your ${boy ? "son" : "daughter"}'s predicted adult height is about ${cm(r.mid)}. Most children land between ${cm(r.low)} and ${cm(r.high)}.`, r1: `Parents' heights are added, ${boy ? "plus 13 cm for a boy" : "minus 13 cm for a girl"}, then halved. A ${boy ? "daughter" : "son"} of the same parents would be about ${cm(r.other)}.`, r2: "Genes explain about 70–80%. Sleep, nutrition and exercise decide where in the range a child ends up.", r3: "If a child is below the 3rd percentile or grows less than 4 cm a year, ask a paediatrician about a growth check.", what: "the predicted height" },
    ja: { head: `${boy ? "息子" : "娘"}さんの予想身長は約${cm(r.mid)}です。多くは${cm(r.low)}〜${cm(r.high)}の間に入ります。`, r1: `両親の身長を足し、${boy ? "男の子は13cmを足して" : "女の子は13cmを引いて"}2で割っています。同じ両親の${boy ? "娘" : "息子"}さんなら約${cm(r.other)}です。`, r2: "遺伝で決まる部分は70〜80%ほどです。睡眠・栄養・運動が範囲内のどこに行くかを左右します。", r3: "同年代の3パーセンタイルを下回る、または1年に4cm未満しか伸びない場合は、小児科で成長の相談をしてみてください。", what: "予想身長" },
    zh: { head: `${boy ? "儿子" : "女儿"}的预测成年身高约为${cm(r.mid)}，大多数在${cm(r.low)}~${cm(r.high)}之间。`, r1: `父母身高相加，${boy ? "男孩加13cm" : "女孩减13cm"}，再除以2。同一父母的${boy ? "女儿" : "儿子"}约为${cm(r.other)}。`, r2: "遗传约占70%~80%。睡眠、营养和运动决定孩子落在范围内的哪个位置。", r3: "如果低于同龄第3百分位，或一年长不到4cm，建议去儿科做生长评估。", what: "预测身高" },
    fr: { head: `La taille adulte prévue de votre ${boy ? "fils" : "fille"} est d'environ ${cm(r.mid)}. La plupart des enfants finissent entre ${cm(r.low)} et ${cm(r.high)}.`, r1: `On additionne la taille des parents, ${boy ? "plus 13 cm pour un garçon" : "moins 13 cm pour une fille"}, puis on divise par deux. Pour un${boy ? "e fille" : " garçon"} des mêmes parents : environ ${cm(r.other)}.`, r2: "La génétique explique 70 à 80 %. Sommeil, alimentation et activité physique décident de la place dans la fourchette.", r3: "Sous le 3e percentile ou avec moins de 4 cm par an, demandez un bilan de croissance au pédiatre.", what: "la taille prévue" },
    es: { head: `La altura adulta prevista de tu ${boy ? "hijo" : "hija"} ronda los ${cm(r.mid)}. La mayoría acaba entre ${cm(r.low)} y ${cm(r.high)}.`, r1: `Se suman las alturas de los padres, ${boy ? "más 13 cm para un niño" : "menos 13 cm para una niña"}, y se divide entre dos. ${boy ? "Una hija" : "Un hijo"} de los mismos padres mediría unos ${cm(r.other)}.`, r2: "La genética explica un 70-80 %. El sueño, la alimentación y el ejercicio deciden dónde cae dentro del rango.", r3: "Si está por debajo del percentil 3 o crece menos de 4 cm al año, consulta al pediatra para una revisión del crecimiento.", what: "la altura prevista" },
  }[lang];
  return { headline: T.head, driver: driverOf(lang, top, T.what, cm), reasons: [T.r1, T.r2, T.r3] };
};
