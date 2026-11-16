// 한국 세금 계산기(1묶음)의 가정 목록·다리 단계·쉬운 결과 문장 (2026-11-16).
// 계산은 각 엔진 파일이 하고, 여기는 "무엇을 바꿔 볼 수 있고 어떻게 설명할지"만 정해요.
import { compareIncorporation } from "./kr-incorporation-2026.ts";
import { acquisitionTax, capitalGainsTax, HIGH_PRICE_LINE, propertyTax, BASIC_DEDUCTION, type AcquisitionInput, type GainsInput } from "./kr-real-estate-tax.ts";
import { retirementIncomeTax } from "./kr-retirement-tax.ts";
import { fixedRange, moneyRange, roughWon, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

export const driverLine = (top: TornadoBar | undefined, what: string) =>
  top && top.span > 0
    ? `결과를 가장 크게 움직이는 건 ${top.plain}이에요. 이 값이 20% 늘거나 줄면 ${what}이 약 ${roughWon(Math.min(top.low, top.high))}에서 ${roughWon(Math.max(top.low, top.high))} 사이로 바뀌어요.`
    : null;

export const moneyAssumption = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, opts: { kind?: "fact" | "assumption"; signed?: boolean } = {}): Assumption<I> => ({
  key, label, plain, unit: "won", kind: opts.kind ?? "assumption", get, set,
  range: (anchor) => moneyRange(anchor, { signed: opts.signed }),
});

// ───────────────────────── 퇴직소득세 ─────────────────────────

export interface RetirementInput {
  gross: number;
  years: number;
}

export const retirementNet = (i: RetirementInput) => retirementIncomeTax(i.gross, i.years).netPayout;

export const RETIREMENT_ASSUMPTIONS: Assumption<RetirementInput>[] = [
  moneyAssumption("gross", "세전 퇴직금", "받을 퇴직금(세금 떼기 전)", (i) => i.gross, (i, v) => ({ ...i, gross: Math.max(0, v) })),
  {
    key: "years", label: "근속연수", plain: "일한 기간", unit: "years", kind: "fact",
    get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 40),
    marks: [
      { at: 5, label: "5년" },
      { at: 10, label: "10년" },
      { at: 20, label: "20년" },
    ],
  },
];

export function retirementBridge(i: RetirementInput): BridgeStep[] {
  const r = retirementIncomeTax(i.gross, i.years);
  return [
    { label: "세전 퇴직금", value: r.gross, kind: "total" },
    { label: "퇴직소득세", value: -r.nationalTax, kind: "add" },
    { label: "지방소득세(10%)", value: -r.localTax, kind: "add" },
    { label: "실제 받는 돈", value: r.netPayout, kind: "total" },
  ];
}

export function retirementPlain(i: RetirementInput, top?: TornadoBar) {
  const r = retirementIncomeTax(i.gross, i.years);
  const headline = `퇴직금 ${roughWon(r.gross)} 중 세금 약 ${roughWon(r.totalTax)}를 떼고 약 ${roughWon(r.netPayout)}를 받아요(추정, 실제 세율 ${r.effectiveTaxRate.toFixed(1)}%).`;
  const reasons = [
    `오래 일할수록 빼 주는 금액(근속연수공제 ${roughWon(r.serviceDeduction)})이 커져서 세금이 줄어요.`,
    "퇴직금을 IRP 계좌로 옮겨 연금으로 나눠 받으면 이 세금의 30%(10년 넘게 나눠 받으면 그 뒤로 40%)가 줄어요.",
  ];
  return { headline, driver: driverLine(top, "실제 받는 돈"), reasons };
}

// ───────────────────────── 개인사업자 vs 법인 ─────────────────────────

export interface IncorporationInput {
  revenue: number;
  expenses: number;
  salary: number;
  realEstate: boolean;
}

const cmp = (i: IncorporationInput) => compareIncorporation(Math.max(0, i.revenue - i.expenses), i.salary, i.realEstate);
/** 법인(배당까지)이 개인보다 아끼는 연 세금. 음수면 개인이 유리해요. */
export const incorporationSaving = (i: IncorporationInput) => {
  const r = cmp(i);
  return r.sole.total - r.corpPayout;
};

export const INCORPORATION_ASSUMPTIONS: Assumption<IncorporationInput>[] = [
  moneyAssumption("revenue", "연 매출", "1년 매출", (i) => i.revenue, (i, v) => ({ ...i, revenue: Math.max(0, v) })),
  moneyAssumption("expenses", "연 필요경비", "1년 비용(대표 급여 빼고)", (i) => i.expenses, (i, v) => ({ ...i, expenses: Math.max(0, v) })),
  moneyAssumption("salary", "대표 연봉", "법인에서 받을 내 연봉", (i) => i.salary, (i, v) => ({ ...i, salary: Math.max(0, v) })),
];

export function incorporationPlain(i: IncorporationInput, top?: TornadoBar) {
  const r = cmp(i);
  const payoutDiff = r.sole.total - r.corpPayout;
  const keepDiff = r.sole.total - r.corpKeep;
  const headline =
    payoutDiff > 0
      ? `이익 ${roughWon(r.profit)}이면 배당까지 받아도 법인이 1년에 약 ${roughWon(payoutDiff)} 세금이 적어요(추정).`
      : keepDiff > 0
        ? `이익을 법인에 남겨 두면 1년에 약 ${roughWon(keepDiff)} 적지만, 배당으로 꺼내면 개인사업자가 약 ${roughWon(-payoutDiff)} 적어요(추정).`
        : `지금 이익(${roughWon(r.profit)})이면 개인사업자가 1년에 약 ${roughWon(-keepDiff)} 이상 세금이 적어요(추정).`;
  const reasons = [
    "법인은 이익에 법인세(2억까지 10%)를 내고, 대표 연봉과 배당에 소득세를 따로 내요.",
    "법인으로 바꾸면 4대보험·기장료가 늘고 회사 돈을 마음대로 꺼낼 수 없어요. 세금만 보고 정하지 마세요.",
  ];
  return { headline, driver: driverLine(top, "법인으로 아끼는 세금"), reasons };
}

export const incorporationResult = cmp;

// ───────────────────────── 양도소득세 ─────────────────────────

export const gainsTotal = (i: GainsInput) => capitalGainsTax(i).total;
const yearsAssumption = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, max: number, marks: { at: number; label: string }[]): Assumption<I> => ({
  key, label, plain, unit: "years", kind: "fact", get, set, range: fixedRange(0, max), marks,
});

export const GAINS_ASSUMPTIONS: Assumption<GainsInput>[] = [
  { ...moneyAssumption<GainsInput>("sale", "양도가액", "파는 값", (i) => i.sale, (i, v) => ({ ...i, sale: Math.max(0, v) })), marks: [{ at: HIGH_PRICE_LINE, label: "12억" }] },
  moneyAssumption<GainsInput>("purchase", "취득가액", "산 값", (i) => i.purchase, (i, v) => ({ ...i, purchase: Math.max(0, v) })),
  moneyAssumption<GainsInput>("expenses", "필요경비", "산 뒤 들인 비용", (i) => i.expenses, (i, v) => ({ ...i, expenses: Math.max(0, v) })),
  yearsAssumption<GainsInput>("holdYears", "보유 기간", "가진 기간", (i) => i.holdYears, (i, v) => ({ ...i, holdYears: Math.max(0, Math.round(v)) }), 20, [
    { at: 2, label: "2년" },
    { at: 3, label: "3년" },
    { at: 10, label: "10년" },
  ]),
  yearsAssumption<GainsInput>("liveYears", "거주 기간", "실제로 산 기간", (i) => i.liveYears, (i, v) => ({ ...i, liveYears: Math.max(0, Math.round(v)) }), 20, [
    { at: 2, label: "2년" },
    { at: 10, label: "10년" },
  ]),
];

export function gainsBridge(i: GainsInput): BridgeStep[] {
  const r = capitalGainsTax(i);
  const steps: BridgeStep[] = [
    { label: "파는 값", value: i.sale, kind: "add" },
    { label: "산 값", value: -i.purchase, kind: "add" },
  ];
  if (i.expenses > 0) steps.push({ label: "필요경비", value: -i.expenses, kind: "add" });
  steps.push({ label: "양도차익", value: r.gain, kind: "total" });
  if (r.exempt) {
    steps.push({ label: "1세대 1주택 비과세", value: -r.gain, kind: "add" });
    steps.push({ label: "과세표준", value: 0, kind: "total" });
    return steps;
  }
  if (r.taxableGain !== r.gain) steps.push({ label: "12억 이하 몫 비과세", value: r.taxableGain - r.gain, kind: "add" });
  if (r.longTerm > 0) steps.push({ label: `장기보유특별공제 ${Math.round(r.longTermRate * 100)}%`, value: -r.longTerm, kind: "add" });
  const basic = Math.min(BASIC_DEDUCTION, Math.max(0, r.taxableGain - r.longTerm));
  if (basic > 0) steps.push({ label: "기본공제 250만", value: -basic, kind: "add" });
  steps.push({ label: "과세표준", value: r.base, kind: "total" });
  return steps;
}

export function gainsPlain(i: GainsInput, top?: TornadoBar) {
  const r = capitalGainsTax(i);
  if (r.exempt) return { headline: "1세대 1주택 비과세라 양도세가 없어요(추정).", driver: null, reasons: ["파는 값이 12억 원을 넘으면 넘는 몫만큼 세금이 생겨요."] };
  const headline = `오른 값 ${roughWon(r.gain)}에 양도세 약 ${roughWon(r.total)}를 내요(추정, 지방소득세 포함).`;
  const reasons: string[] = [];
  if (r.taxableGain !== r.gain) reasons.push("1주택이라 12억 원 넘는 몫만 세금을 매겼어요.");
  if (r.longTermRate > 0) reasons.push(`오래 가진(살았던) 만큼 오른 값의 ${Math.round(r.longTermRate * 100)}%를 빼 줬어요.`);
  if (r.heavyAdd > 0) reasons.push(`다주택자가 조정대상지역 집을 팔아 세율이 ${Math.round(r.heavyAdd * 100)}%p 더해지고 오래 가진 공제도 없어요.`);
  if (r.rateLabel.startsWith("단기")) reasons.push(`2년 안에 팔아서 ${r.rateLabel.replace("단기 ", "")} 세율을 적용했어요.`);
  return { headline, driver: driverLine(top, "양도세"), reasons };
}

// ───────────────────────── 취득세 ─────────────────────────

export const acquisitionTotal = (i: AcquisitionInput) => acquisitionTax(i).total;

export const ACQUISITION_ASSUMPTIONS: Assumption<AcquisitionInput>[] = [
  {
    ...moneyAssumption<AcquisitionInput>("price", "취득가액", "집값", (i) => i.price, (i, v) => ({ ...i, price: Math.max(0, v) })),
    range: (anchor) => [0, Math.max(anchor * 2, 1_500_000_000)],
    marks: [
      { at: 600_000_000, label: "6억" },
      { at: 900_000_000, label: "9억" },
    ],
  },
];

export function acquisitionBridge(i: AcquisitionInput): BridgeStep[] {
  const r = acquisitionTax(i);
  const steps: BridgeStep[] = [
    { label: `취득세 ${(r.rate * 100).toFixed(2)}%`, value: r.tax, kind: "add" },
    { label: "지방교육세", value: r.education, kind: "add" },
  ];
  if (r.rural > 0) steps.push({ label: "농어촌특별세", value: r.rural, kind: "add" });
  steps.push({ label: "낼 돈 합계", value: r.total, kind: "total" });
  return steps;
}

export function acquisitionPlain(i: AcquisitionInput) {
  const r = acquisitionTax(i);
  const headline = `${roughWon(i.price)}짜리 집을 사면 취득세 등 약 ${roughWon(r.total)}를 내요(추정).`;
  const reasons: string[] = [];
  if (r.heavy) reasons.push(`집이 여러 채라 세율이 ${(r.rate * 100).toFixed(0)}%로 무거워졌어요(다주택 중과).`);
  else if (i.price > 600_000_000 && i.price <= 900_000_000) reasons.push("6억~9억 원 사이는 집값이 오를수록 세율이 1%에서 3%까지 조금씩 올라가요.");
  else reasons.push(`집값 구간에 따라 ${(r.rate * 100).toFixed(0)}% 세율을 적용했어요(6억 이하 1%, 9억 초과 3%).`);
  if (r.rural === 0 && !i.over85) reasons.push("전용 85㎡ 이하라 농어촌특별세가 없어요.");
  return { headline, driver: null, reasons };
}

// ───────────────────────── 재산세 ─────────────────────────

export interface PropertyInput {
  official: number;
  oneHouse: boolean;
  urban: boolean;
}

export const propertyTotal = (i: PropertyInput) => propertyTax(i.official, i.oneHouse, i.urban).total;

export const PROPERTY_ASSUMPTIONS: Assumption<PropertyInput>[] = [
  {
    ...moneyAssumption<PropertyInput>("official", "주택 공시가격", "공시가격", (i) => i.official, (i, v) => ({ ...i, official: Math.max(0, v) })),
    range: (anchor) => [0, Math.max(anchor * 2, 1_200_000_000)],
    marks: [
      { at: 300_000_000, label: "3억" },
      { at: 600_000_000, label: "6억" },
      { at: 900_000_000, label: "9억" },
    ],
  },
];

export function propertyBridge(i: PropertyInput): BridgeStep[] {
  const r = propertyTax(i.official, i.oneHouse, i.urban);
  const steps: BridgeStep[] = [{ label: "재산세", value: r.tax, kind: "add" }];
  if (r.urban > 0) steps.push({ label: "도시지역분", value: r.urban, kind: "add" });
  steps.push({ label: "지방교육세", value: r.education, kind: "add" });
  steps.push({ label: "올해 낼 돈", value: r.total, kind: "total" });
  return steps;
}

export function propertyPlain(i: PropertyInput) {
  const r = propertyTax(i.official, i.oneHouse, i.urban);
  const headline = `공시가격 ${roughWon(i.official)}인 집의 올해 재산세는 약 ${roughWon(r.total)}예요(추정).`;
  const reasons = [
    `공시가격의 ${Math.round(r.ratio * 100)}%에만 세금을 매겨요(공정시장가액비율).`,
    r.special ? "1세대 1주택이고 공시가격 9억 원 이하라 낮은 세율(특례)을 적용했어요." : "1주택 특례(공시가격 9억 원 이하)를 받지 않아요.",
    r.tax > 200_000 ? "재산세가 20만 원을 넘어서 7월과 9월에 반씩 나눠 내요." : "20만 원 이하라 7월에 한 번에 내요.",
  ];
  return { headline, driver: null, reasons };
}
