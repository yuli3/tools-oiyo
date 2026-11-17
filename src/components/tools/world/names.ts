// 다른 언어 판 도구 이름(다음에 볼 도구 링크용) (2026-11-17)
import type { WL } from "../../../lib/world-money-i18n";

const N = {
  "compound-interest-calculator": { en: "Compound interest", ja: "複利計算", zh: "复利计算", fr: "Intérêts composés", es: "Interés compuesto" },
  "fire-retirement-calculator": { en: "FIRE retirement", ja: "FIRE（早期リタイア）", zh: "FIRE 提前退休", fr: "Retraite anticipée FIRE", es: "Jubilación anticipada FIRE" },
  "loan-calculator": { en: "Loan repayment", ja: "ローン返済", zh: "贷款还款", fr: "Remboursement de prêt", es: "Préstamo" },
  "mortgage-calculator": { en: "Mortgage", ja: "住宅ローン", zh: "房贷", fr: "Prêt immobilier", es: "Hipoteca" },
  "inflation-calculator": { en: "Inflation", ja: "インフレ計算", zh: "通胀计算", fr: "Inflation", es: "Inflación" },
  "roi-calculator": { en: "ROI", ja: "投資利回り（ROI）", zh: "投资回报率", fr: "Rendement (ROI)", es: "Rentabilidad (ROI)" },
  "rental-yield-calculator": { en: "Rental yield", ja: "賃貸利回り", zh: "租金回报率", fr: "Rendement locatif", es: "Rentabilidad del alquiler" },
  "stock-average-calculator": { en: "Average cost", ja: "平均取得単価", zh: "持仓均价", fr: "Prix de revient moyen", es: "Precio medio" },
  "latte-factor-calculator": { en: "Latte factor", ja: "ラテマネー", zh: "拿铁因子", fr: "Effet latte", es: "Efecto latte" },
  "bmi-calculator": { en: "BMI", ja: "BMI計算", zh: "BMI计算", fr: "IMC", es: "IMC" },
  "body-fat-calculator": { en: "Body fat", ja: "体脂肪率", zh: "体脂率", fr: "Masse grasse", es: "Grasa corporal" },
  "tdee-calculator": { en: "Daily calories (TDEE)", ja: "消費カロリー（TDEE）", zh: "每日消耗（TDEE）", fr: "Dépense calorique (TDEE)", es: "Gasto calórico (TDEE)" },
  "water-intake-calculator": { en: "Water intake", ja: "水分摂取量", zh: "饮水量", fr: "Besoins en eau", es: "Agua diaria" },
  "caffeine-calculator": { en: "Caffeine", ja: "カフェイン", zh: "咖啡因", fr: "Caféine", es: "Cafeína" },
  "macro-calculator": { en: "Macros", ja: "PFCバランス", zh: "宏量营养素", fr: "Macronutriments", es: "Macronutrientes" },
  "ideal-weight-calculator": { en: "Ideal weight", ja: "標準体重", zh: "标准体重", fr: "Poids idéal", es: "Peso ideal" },
  "heart-rate-calculator": { en: "Heart rate zones", ja: "心拍ゾーン", zh: "心率区间", fr: "Zones cardiaques", es: "Zonas de frecuencia cardiaca" },
  "one-rep-max-calculator": { en: "One-rep max", ja: "1RM計算", zh: "1RM计算", fr: "1RM (charge max)", es: "1RM (repetición máxima)" },
  "child-height-calculator": { en: "Child's adult height", ja: "子どもの予想身長", zh: "孩子预测身高", fr: "Taille adulte de l'enfant", es: "Altura adulta del niño" },
} as const;

export type WorldToolId = keyof typeof N;
export const nextLinks = (lang: WL, ids: WorldToolId[]) => ids.map((id) => ({ href: `/${lang}/${id}/`, label: N[id][lang] }));
