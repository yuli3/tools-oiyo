// 台湾薪资（2026年/民国115年）劳保·健保·综合所得税估算。TaiwanSalaryCalculator（旧画面）与 TaiwanSalaryScenario 共用。
import { fixedRange, type Assumption, type TornadoBar } from "./scenario.ts";

/** 劳保：12.5%（普通事故11.5%＋就业保险1%）员工负担20% = 2.5%，投保薪资上限45,800 */
export const LI_CAP = 45_800;
export const LI_RATE = 0.025;
/** 健保：5.17% 员工负担30% = 1.551%，上限313,000 */
export const NHI_CAP = 313_000;
export const NHI_RATE = 0.01551;
export const STANDARD_DEDUCTION = 136_000;
export const SALARY_DEDUCTION = 227_000;
export const PERSONAL_EXEMPTION = 101_000;

export function twAnnualTax(annualGross: number, people: number): number {
  const deduction = STANDARD_DEDUCTION + Math.min(SALARY_DEDUCTION, annualGross) + PERSONAL_EXEMPTION * people;
  let remaining = Math.max(0, annualGross - deduction);
  let tax = 0;
  const brackets: [number, number][] = [
    [610_000, 0.05],
    [770_000, 0.12],
    [1_390_000, 0.2],
    [2_420_000, 0.3],
  ];
  for (const [width, rate] of brackets) {
    if (remaining <= 0) break;
    const part = Math.min(remaining, width);
    tax += part * rate;
    remaining -= part;
  }
  if (remaining > 0) tax += remaining * 0.4;
  return Math.round(Math.max(0, tax));
}

export interface TwSalaryLite {
  gross: number;
  /** 免税额人数（含本人） */
  people: number;
  /** 年终奖金（几个月） */
  bonus: number;
}

export function twSalary(i: TwSalaryLite) {
  const labor = Math.round(Math.min(i.gross, LI_CAP) * LI_RATE);
  const nhi = Math.round(Math.min(i.gross, NHI_CAP) * NHI_RATE);
  const ins = labor + nhi;
  const annualGross = i.gross * (12 + Math.max(0, i.bonus));
  const tax = twAnnualTax(annualGross, Math.max(1, Math.round(i.people)));
  const monthlyTax = Math.round(tax / 12);
  const net = Math.max(0, i.gross - ins - monthlyTax);
  const annualNet = Math.max(0, annualGross - ins * 12 - tax);
  return { labor, nhi, ins, annualGross, tax, monthlyTax, net, annualNet, rate: annualGross > 0 ? annualNet / annualGross : 0 };
}
export const twAnnualNet = (i: TwSalaryLite) => twSalary(i).annualNet;

const nt = (n: number) => `NT$${Math.round(n).toLocaleString("zh-TW")}`;

export const TW_SALARY_ASSUMPTIONS: Assumption<TwSalaryLite>[] = [
  { key: "gross", label: "税前月薪", plain: "月薪", unit: "won", kind: "assumption", get: (i) => i.gross, set: (i, v) => ({ ...i, gross: Math.max(0, Math.round(v / 100) * 100) }), range: (a) => [Math.max(28_000, a * 0.5), Math.max(a * 2, 60_000)], marks: [{ at: LI_CAP, label: "劳保上限" }] },
  { key: "bonus", label: "年终奖金（月数）", plain: "年终奖金", unit: "months", kind: "assumption", get: (i) => i.bonus, set: (i, v) => ({ ...i, bonus: Math.max(0, Math.round(v * 2) / 2) }), range: fixedRange(0, 6) },
  { key: "people", label: "免税额人数", plain: "扶养人数", unit: "people", kind: "fact", get: (i) => i.people, set: (i, v) => ({ ...i, people: Math.max(1, Math.round(v)) }), range: fixedRange(1, 5) },
];

export function twSalaryPlain(i: TwSalaryLite, top?: TornadoBar) {
  const r = twSalary(i);
  return {
    headline: `月薪${nt(i.gross)}，每月到手约${nt(r.net)}，${i.bonus > 0 ? `全年（含${i.bonus}个月年终）` : "全年"}到手约${nt(r.annualNet)}。`,
    driver: top && top.span > 0 ? `对结果影响最大的是${top.plain}。它上下变动20%时，全年到手在${nt(Math.min(top.low, top.high))}到${nt(Math.max(top.low, top.high))}之间。` : null,
    reasons: [
      `每月扣劳保${nt(r.labor)}、健保${nt(r.nhi)}。全年所得税约${nt(r.tax)}，平均每月${nt(r.monthlyTax)}。`,
      `先扣除标准扣除额13.6万、薪资特别扣除额22.7万、免税额10.1万×${i.people}人后才计税，所以年薪较低时几乎不用缴所得税。`,
      "实际每月预扣税额按扣缴办法计算，次年5月申报时多退少补。健保未计眷属保费，有眷属时每人另加。",
    ],
  };
}
