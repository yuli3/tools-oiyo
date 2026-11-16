// 中国个人所得税·五险一金（上海2026年度基数）。ChinaSalaryCalculator（旧画面）与 ChinaSalaryScenario（简单/专业画面）共用。
import { fixedRange, type Assumption, type TornadoBar } from "./scenario.ts";

/** 上海社保缴费基数（2026年7月起）：2025年全市平均工资12,577元 × 300% / 60% */
export const SI_BASE_CAP = 37_731;
export const SI_BASE_MIN = 7_546;
export const BASIC_DEDUCTION = 5_000;

/** 综合所得年度税额（速算扣除数） */
export function annualIIT(annualTaxable: number): number {
  if (annualTaxable <= 0) return 0;
  const brackets: [number, number, number][] = [
    [36_000, 0.03, 0],
    [144_000, 0.1, 2_520],
    [300_000, 0.2, 16_920],
    [420_000, 0.25, 31_920],
    [660_000, 0.3, 52_920],
    [960_000, 0.35, 85_920],
    [Infinity, 0.45, 181_920],
  ];
  const [, r, d] = brackets.find(([max]) => annualTaxable <= max)!;
  return Math.max(0, Math.round(annualTaxable * r - d));
}

export interface CnSalaryLite {
  gross: number;
  /** 住房公积金个人比例 5%~12% */
  hf: number;
  /** 专项附加扣除（每月） */
  special: number;
}

export function cnSalary(i: CnSalaryLite) {
  const base = Math.max(SI_BASE_MIN, Math.min(i.gross, SI_BASE_CAP));
  const pension = Math.round(base * 0.08);
  const medical = Math.round(base * 0.02);
  const unemployment = Math.round(base * 0.005);
  const housing = Math.round(base * i.hf);
  const si = pension + medical + unemployment + housing;
  const monthlyTaxable = Math.max(0, i.gross - si - BASIC_DEDUCTION - Math.max(0, i.special));
  const iitY = annualIIT(monthlyTaxable * 12);
  const iit = Math.round(iitY / 12);
  const net = Math.max(0, i.gross - si - iit);
  return { base, pension, medical, unemployment, housing, si, monthlyTaxable, iit, net, annualNet: net * 12, rate: i.gross > 0 ? net / i.gross : 0 };
}
export const cnAnnualNet = (i: CnSalaryLite) => cnSalary(i).annualNet;
export const cnMonthlyNet = (i: CnSalaryLite) => cnSalary(i).net;

const yuan = (n: number) => `¥${Math.round(n).toLocaleString("zh-CN")}`;

export const CN_SALARY_ASSUMPTIONS: Assumption<CnSalaryLite>[] = [
  { key: "gross", label: "税前月薪", plain: "月薪", unit: "won", kind: "assumption", get: (i) => i.gross, set: (i, v) => ({ ...i, gross: Math.max(0, Math.round(v / 100) * 100) }), range: (a) => [Math.max(3_000, a * 0.5), Math.max(a * 2, 10_000)], marks: [{ at: SI_BASE_MIN, label: "社保下限" }, { at: SI_BASE_CAP, label: "社保上限" }] },
  { key: "hf", label: "公积金个人比例", plain: "公积金比例", unit: "rate", kind: "assumption", get: (i) => i.hf, set: (i, v) => ({ ...i, hf: Math.min(0.12, Math.max(0.05, Math.round(v * 100) / 100)) }), range: fixedRange(0.05, 0.12) },
  { key: "special", label: "专项附加扣除（每月）", plain: "专项附加扣除", unit: "won", kind: "assumption", get: (i) => i.special, set: (i, v) => ({ ...i, special: Math.max(0, Math.round(v / 100) * 100) }), range: fixedRange(0, 8_000) },
];

export function cnSalaryPlain(i: CnSalaryLite, top?: TornadoBar) {
  const r = cnSalary(i);
  return {
    headline: `税前月薪${yuan(i.gross)}，每月到手约${yuan(r.net)}，一年约${yuan(r.annualNet)}。到手比例${Math.round(r.rate * 100)}%。`,
    driver: top && top.span > 0 ? `对结果影响最大的是${top.plain}。它上下变动20%时，年到手收入在${yuan(Math.min(top.low, top.high))}到${yuan(Math.max(top.low, top.high))}之间。` : null,
    reasons: [
      `每月扣五险一金${yuan(r.si)}（其中公积金${yuan(r.housing)}）和个税${yuan(r.iit)}。公积金虽然被扣，但存在自己的公积金账户里，买房、租房可以提取。`,
      i.special > 0 ? `已计入每月${yuan(i.special)}的专项附加扣除，个税因此减少。` : "子女教育、赡养老人、住房租金等专项附加扣除还没填。符合条件的话填上，个税会减少。",
      `社保按基数${yuan(r.base)}计算（上海2026年度上下限${yuan(SI_BASE_MIN)}~${yuan(SI_BASE_CAP)}）。实际按累计预扣法，年初月份个税较少、年末较多。`,
    ],
  };
}
