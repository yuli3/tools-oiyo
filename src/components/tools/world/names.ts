// 다른 언어 판 도구 이름(다음에 볼 도구 링크용) (2026-11-17)
import type { WL } from "../../../lib/world-money-i18n";

const N = {
  "compound-interest-calculator": { en: "Compound interest", ja: "複利計算", zh: "复利计算", fr: "Intérêts composés", es: "Interés compuesto" },
  "fire-retirement-calculator": { en: "FIRE retirement", ja: "FIRE（早期リタイア）", zh: "FIRE 提前退休", fr: "Retraite anticipée FIRE", es: "Jubilación anticipada FIRE" },
  "loan-calculator": { en: "Loan repayment", ja: "ローン返済", zh: "贷款还款", fr: "Remboursement de prêt", es: "Préstamo" },
  "mortgage-calculator": { en: "Mortgage", ja: "住宅ローン", zh: "房贷", fr: "Prêt immobilier", es: "Hipoteca" },
} as const;

export type WorldToolId = keyof typeof N;
export const nextLinks = (lang: WL, ids: WorldToolId[]) => ids.map((id) => ({ href: `/${lang}/${id}/`, label: N[id][lang] }));
