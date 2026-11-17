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
} as const;

export type WorldToolId = keyof typeof N;
export const nextLinks = (lang: WL, ids: WorldToolId[]) => ids.map((id) => ({ href: `/${lang}/${id}/`, label: N[id][lang] }));
