// 건강 계산기 다른 언어 판 공통 문구(성별·키·몸무게·나이) (2026-11-17)
import type { Sex } from "../../../lib/health-scenarios";
import type { WL } from "../../../lib/world-money-i18n";

export const BODY = {
  en: { sex: "Sex", m: "Male", f: "Female", height: "Height", weight: "Weight", age: "Age", ageUnit: "yrs", askTitle: "Good to know", body: "Tell us about yourself" },
  ja: { sex: "性別", m: "男性", f: "女性", height: "身長", weight: "体重", age: "年齢", ageUnit: "歳", askTitle: "知っておきたいこと", body: "体のことを教えてください" },
  zh: { sex: "性别", m: "男", f: "女", height: "身高", weight: "体重", age: "年龄", ageUnit: "岁", askTitle: "需要了解", body: "请填写身体信息" },
  fr: { sex: "Sexe", m: "Homme", f: "Femme", height: "Taille", weight: "Poids", age: "Âge", ageUnit: "ans", askTitle: "Bon à savoir", body: "Parlez-nous de vous" },
  es: { sex: "Sexo", m: "Hombre", f: "Mujer", height: "Altura", weight: "Peso", age: "Edad", ageUnit: "años", askTitle: "Conviene saber", body: "Cuéntanos sobre ti" },
} as const;

export const sexOptions = (lang: WL): { value: Sex; label: string }[] => [{ value: "m", label: BODY[lang].m }, { value: "f", label: BODY[lang].f }];
