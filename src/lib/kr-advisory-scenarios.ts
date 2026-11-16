// 세무·회계 도구의 가정 목록·다리 단계·쉬운 결과 문장 (2026-11-14).
// 계산은 kr-advisory-2026.ts가 하고, 여기는 "무엇을 바꿔 볼 수 있고 어떻게 설명할지"만 정해요.
import {
  ACQUISITION_RELIEF_UNTIL, dcfValuation, familyBusinessInheritance, incorporationConversion, valueUnlistedShares,
  type ConversionInput, type DcfInput, type FamilyBusinessInput, type UnlistedShareInput,
} from "./kr-advisory-2026.ts";
import { fixedRange, josa, moneyRange, roughWon, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

// ───────────────────────── 비상장주식 평가 ─────────────────────────

export const unlistedPerShare = (i: UnlistedShareInput) => valueUnlistedShares(i).perShare;

const income = (idx: 0 | 1 | 2, label: string, plain: string): Assumption<UnlistedShareInput> => ({
  key: `y${idx + 1}`,
  label,
  plain,
  unit: "won",
  kind: "assumption",
  get: (i) => i.netIncome[idx],
  set: (i, v) => {
    const netIncome = [...i.netIncome] as [number, number, number];
    netIncome[idx] = v;
    return { ...i, netIncome };
  },
  range: (anchor) => moneyRange(anchor, { signed: true }),
});

export const UNLISTED_ASSUMPTIONS: Assumption<UnlistedShareInput>[] = [
  income(0, "최근 1년 순손익액", "작년 순이익"),
  income(1, "2년 전 순손익액", "2년 전 순이익"),
  income(2, "3년 전 순손익액", "3년 전 순이익"),
  {
    key: "netAssets",
    label: "순자산가액",
    plain: "회사 재산에서 빚을 뺀 금액",
    unit: "won",
    kind: "assumption",
    get: (i) => i.netAssets,
    set: (i, v) => ({ ...i, netAssets: v }),
    range: (anchor) => moneyRange(anchor),
  },
  {
    key: "goodwill",
    label: "영업권 평가액",
    plain: "회사 이름값·단골 같은 보이지 않는 가치",
    unit: "won",
    kind: "assumption",
    get: (i) => i.goodwill ?? 0,
    set: (i, v) => ({ ...i, goodwill: Math.max(0, v) }),
    range: (anchor) => moneyRange(anchor),
  },
  {
    key: "realEstateRatio",
    label: "부동산 등 비율",
    plain: "회사 재산 중 땅·건물 비율",
    unit: "pct",
    kind: "fact",
    get: (i) => i.realEstateRatio,
    set: (i, v) => ({ ...i, realEstateRatio: Math.min(1, Math.max(0, v)) }),
    range: () => [0, 1],
    marks: [
      { at: 0.5, label: "50%: 2 : 3" },
      { at: 0.8, label: "80%: 순자산만" },
    ],
  },
];

export const unlistedAssumption = (key: string) => {
  const a = UNLISTED_ASSUMPTIONS.find((x) => x.key === key);
  if (!a) throw new Error(`unknown assumption ${key}`);
  return a;
};

type ShareResult = ReturnType<typeof valueUnlistedShares>;

const WEIGHTS = { general: [3, 2], realEstateHeavy: [2, 3] } as const;

/** 다리 그래프 단계: 순손익가치·순자산가치 몫 → 가중평균 → 하한 → 할증 → 1주당 평가액 */
export function unlistedBridge(r: ShareResult): BridgeStep[] {
  const steps: BridgeStep[] = [];
  let run: number;
  if (r.shareClass === "netAssetOnly") {
    steps.push({ label: "순자산가치", value: r.assetValue, kind: "add", note: "순자산가치만 써요" });
    run = r.assetValue;
  } else {
    const [wi, wa] = WEIGHTS[r.shareClass];
    steps.push({ label: `순손익가치 × ${wi}/5`, value: (r.incomeValue * wi) / 5, kind: "add" });
    steps.push({ label: `순자산가치 × ${wa}/5`, value: (r.assetValue * wa) / 5, kind: "add" });
    steps.push({ label: "가중평균", value: r.blended, kind: "total" });
    run = r.blended;
    if (r.floorApplied) {
      steps.push({ label: "80% 하한까지 올림", value: r.floorValue - r.blended, kind: "add" });
      run = r.floorValue;
    }
  }
  if (r.basePerShare !== run) steps.push({ label: "0원 미만은 0", value: r.basePerShare - run, kind: "add" });
  if (r.premiumApplied) steps.push({ label: "최대주주 할증 20%", value: r.perShare - r.basePerShare, kind: "add" });
  steps.push({ label: "1주당 평가액", value: r.perShare, kind: "total" });
  return steps;
}

/** 법을 모르는 사람용 핵심 문장 + 왜 그렇게 됐는지 짧은 이유들 */
export function unlistedPlain(r: ShareResult, top?: TornadoBar) {
  const headline =
    r.held > 0
      ? `이 회사 주식 1주는 약 ${roughWon(r.perShare)}, 평가할 ${r.held.toLocaleString("ko-KR")}주는 모두 약 ${roughWon(r.total)}으로 평가돼요(추정).`
      : `이 회사 주식 1주는 약 ${roughWon(r.perShare)}으로 평가돼요(추정).`;
  const driver = top && top.span > 0
    ? `결과를 가장 크게 움직이는 건 ${josa(top.plain, "이에요", "예요")}. 이 값이 20% 늘거나 줄면 1주당 값이 약 ${roughWon(Math.min(top.low, top.high))}에서 ${roughWon(Math.max(top.low, top.high))} 사이로 바뀌어요.`
    : null;
  const reasons: string[] = [];
  if (r.shareClass === "netAssetOnly") reasons.push("이익은 보지 않고 회사 재산(빚을 뺀 금액)만으로 값을 매겼어요.");
  else if (r.shareClass === "realEstateHeavy") reasons.push("땅·건물이 재산의 절반 이상이라 이익보다 재산 쪽을 더 크게(2 : 3) 봤어요.");
  else reasons.push("이익 쪽을 3, 재산 쪽을 2의 비중으로 섞었어요.");
  if (r.weightedRaw < 0) reasons.push("3년 평균 이익이 손실이라 이익 쪽 값은 0원으로 봤어요.");
  if (r.floorApplied) reasons.push("이익으로 본 값이 너무 낮아서, 법에 정한 최저선(재산 가치의 80%)까지 올렸어요.");
  if (r.premiumApplied) reasons.push("가장 많은 주식을 가진 쪽(최대주주)이라 20%를 더했어요.");
  return { headline, driver, reasons };
}

const driverLine = (top: TornadoBar | undefined, what: string) =>
  top && top.span > 0
    ? `결과를 가장 크게 움직이는 건 ${josa(top.plain, "이에요", "예요")}. 이 값이 20% 늘거나 줄면 ${josa(what, "이", "가")} 약 ${roughWon(Math.min(top.low, top.high))}에서 ${roughWon(Math.max(top.low, top.high))} 사이로 바뀌어요.`
    : null;

const money = <I>(key: string, label: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, opts: { kind?: "fact" | "assumption"; signed?: boolean } = {}): Assumption<I> => ({
  key, label, plain, unit: "won", kind: opts.kind ?? "assumption", get, set,
  range: (anchor) => moneyRange(anchor, { signed: opts.signed }),
});

// ───────────────────────── 가업상속공제 ─────────────────────────

export const familyTax = (i: FamilyBusinessInput) => familyBusinessInheritance(i).with.tax;

export const FAMILY_ASSUMPTIONS: Assumption<FamilyBusinessInput>[] = [
  money("businessValue", "가업 주식 평가액", "회사 주식 값", (i) => i.businessValue, (i, v) => ({ ...i, businessValue: Math.max(0, v) })),
  money("otherEstate", "가업 외 상속재산", "회사 말고 다른 재산", (i) => i.otherEstate, (i, v) => ({ ...i, otherEstate: Math.max(0, v) })),
  money("spouseInherited", "배우자 실제 상속액", "배우자가 받는 금액", (i) => i.spouseInherited, (i, v) => ({ ...i, spouseInherited: Math.max(0, v) })),
  money("debts", "채무", "고인이 남긴 빚", (i) => i.debts, (i, v) => ({ ...i, debts: Math.max(0, v) })),
  {
    key: "unrelatedAssetRatio", label: "사업무관자산 비율", plain: "회사 재산 중 사업과 관계없는 재산 비율", unit: "pct", kind: "assumption",
    get: (i) => i.unrelatedAssetRatio, set: (i, v) => ({ ...i, unrelatedAssetRatio: Math.min(1, Math.max(0, v)) }), range: fixedRange(0, 1),
  },
  {
    key: "years", label: "피상속인 가업 경영 기간", plain: "고인이 회사를 경영한 기간", unit: "years", kind: "fact",
    get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(0, Math.round(v)) }), range: fixedRange(0, 40),
    marks: [
      { at: 10, label: "10년: 300억" },
      { at: 20, label: "20년: 400억" },
      { at: 30, label: "30년: 600억" },
    ],
  },
];

type FamilyResult = ReturnType<typeof familyBusinessInheritance>;

/** 상속재산 → 빚·장례비 → 과세가액 → 공제(한도 안에서 차례로) → 과세표준 */
export function familyBridge(r: FamilyResult): BridgeStep[] {
  const w = r.with;
  const steps: BridgeStep[] = [{ label: "상속재산 합계", value: r.gross, kind: "total" }];
  const debtsAndFuneral = r.gross - w.taxableEstate;
  if (debtsAndFuneral > 0) steps.push({ label: "빚·장례비용", value: -debtsAndFuneral, kind: "add" });
  steps.push({ label: "과세가액", value: w.taxableEstate, kind: "total" });
  let remain = w.taxableEstate;
  for (const [label, amount] of [["일괄공제 5억", w.lump], ["배우자공제", w.spouse], ["금융재산공제", w.financial], ["가업상속공제", r.deduction]] as const) {
    const d = Math.min(amount, remain);
    if (d > 0) steps.push({ label, value: -d, kind: "add" });
    remain -= d;
  }
  steps.push({ label: "과세표준", value: w.base, kind: "total" });
  return steps;
}

export function familyPlain(i: FamilyBusinessInput, r: FamilyResult, top?: TornadoBar) {
  const headline = r.deduction > 0
    ? `가업상속공제로 약 ${roughWon(r.deduction)}을 빼면 상속세는 약 ${roughWon(r.with.tax)}이에요(추정). 공제가 없을 때(약 ${roughWon(r.without.tax)})보다 약 ${roughWon(r.saving)} 줄어요.`
    : `가업상속공제를 받지 못하면 상속세는 약 ${roughWon(r.without.tax)}이에요(추정).`;
  const reasons: string[] = [...r.reasons];
  if (r.limit > 0) reasons.push(`고인이 회사를 경영한 기간으로 정해지는 공제 한도는 ${roughWon(r.limit)}이에요.`);
  if (i.unrelatedAssetRatio > 0 && r.deduction > 0) reasons.push(`회사 재산 중 사업과 관계없는 몫(${Math.round(i.unrelatedAssetRatio * 100)}%)은 공제에서 빠져요.`);
  if (r.with.base === 0 && r.deduction > 0) reasons.push("공제가 과세가액보다 커서 내야 할 상속세가 없어요.");
  return { headline, driver: driverLine(top, "상속세"), reasons };
}

// ───────────────────────── 법인전환 ─────────────────────────

export const conversionCgt = (i: ConversionInput) => incorporationConversion(i).cgtTotal;

export const CONVERSION_ASSUMPTIONS: Assumption<ConversionInput>[] = [
  money("realEstateMarket", "사업용 부동산 시가", "사업용 땅·건물 지금 시세", (i) => i.realEstateMarket, (i, v) => ({ ...i, realEstateMarket: Math.max(0, v) })),
  money("realEstateCost", "취득가액 + 필요경비", "땅·건물 산 가격과 들인 비용", (i) => i.realEstateCost, (i, v) => ({ ...i, realEstateCost: Math.max(0, v) })),
  money("otherAssets", "부동산 외 사업용 자산", "땅·건물 말고 사업 재산", (i) => i.otherAssets, (i, v) => ({ ...i, otherAssets: Math.max(0, v) })),
  money("liabilities", "사업 관련 부채", "사업 빚", (i) => i.liabilities, (i, v) => ({ ...i, liabilities: Math.max(0, v) })),
  {
    key: "holdYears", label: "부동산 보유 기간", plain: "땅·건물을 가진 기간", unit: "years", kind: "fact",
    get: (i) => i.holdYears, set: (i, v) => ({ ...i, holdYears: Math.max(0, Math.round(v)) }), range: fixedRange(0, 25),
    marks: [
      { at: 3, label: "3년: 공제 시작" },
      { at: 15, label: "15년: 공제 30%" },
    ],
  },
];

type ConversionResult = ReturnType<typeof incorporationConversion>;

export function conversionBridge(i: ConversionInput, r: ConversionResult): BridgeStep[] {
  const steps: BridgeStep[] = [
    { label: "사업용 땅·건물 시가", value: Math.max(0, i.realEstateMarket), kind: "add" },
    { label: "그 밖의 사업 재산", value: Math.max(0, i.otherAssets), kind: "add" },
  ];
  if (i.liabilities > 0) steps.push({ label: "사업 빚", value: -i.liabilities, kind: "add" });
  steps.push({ label: "순자산가액 = 최소 자본금", value: r.minCapital, kind: "total" });
  return steps;
}

export function conversionPlain(i: ConversionInput, r: ConversionResult, top?: TornadoBar) {
  const headline = r.rolloverEligible
    ? `법인으로 바꾸려면 자본금이 최소 약 ${roughWon(r.minCapital)} 필요해요. 땅·건물을 법인에 넘길 때 생기는 양도세 약 ${roughWon(r.cgtTotal)}은 지금 내지 않고 미뤄요(이월과세, 추정).`
    : `이 업종은 양도세를 미룰 수 없어서, 땅·건물을 법인에 넘기면 양도세 약 ${roughWon(r.cgtTotal)}을 바로 내야 해요(추정).`;
  const reasons: string[] = [];
  reasons.push(r.reliefEligible
    ? `법인이 땅·건물을 받을 때 취득세 약 ${roughWon(r.acquisitionTax)} 중 절반을 감면받아, 농특세를 더해 약 ${roughWon(r.acquisitionNet)}을 내요. 감면은 ${ACQUISITION_RELIEF_UNTIL}까지 취득분이에요.`
    : `이 업종은 취득세 감면이 없어 약 ${roughWon(r.acquisitionTax)}을 내요.`);
  if (r.longTermRate > 0) reasons.push(`오래 가진 만큼 양도차익의 ${Math.round(r.longTermRate * 100)}%를 빼 줬어요(장기보유특별공제).`);
  if (i.realEstateMarket > 0 && r.gain === 0) reasons.push("산 가격보다 오르지 않아 양도세가 없어요.");
  return { headline, driver: driverLine(top, "미루는 양도세"), reasons };
}

// ───────────────────────── DCF ─────────────────────────

export const dcfPerShare = (i: DcfInput) => {
  const r = dcfValuation(i);
  return r.valid ? r.perShare : NaN;
};

const rate = (key: keyof DcfInput & string, label: string, plain: string, min: number, max: number, kind: "fact" | "assumption" = "assumption"): Assumption<DcfInput> => ({
  key, label, plain, unit: "rate", kind,
  get: (i) => i[key] as number,
  set: (i, v) => ({ ...i, [key]: v }),
  range: fixedRange(min, max),
});

export const DCF_ASSUMPTIONS: Assumption<DcfInput>[] = [
  rate("growth", "1년차 매출성장률", "내년 매출이 느는 비율", -0.2, 0.5),
  rate("ebitMargin", "영업이익률", "매출 중 영업이익 비율", -0.1, 0.5),
  rate("wacc", "WACC(할인율)", "투자자가 바라는 연 수익률", 0.04, 0.25),
  rate("terminalGrowth", "영구성장률", "먼 미래의 연 성장률", -0.02, 0.05),
  rate("capexRatio", "자본적 지출 / 매출", "매출 중 설비 투자 비율", 0, 0.3),
  rate("taxRate", "유효 법인세율", "법인세율", 0.09, 0.27, "fact"),
  money("revenue0", "직전 연도 매출", "작년 매출", (i) => i.revenue0, (i, v) => ({ ...i, revenue0: Math.max(0, v) })),
];

type DcfResult = ReturnType<typeof dcfValuation>;

export function dcfBridge(i: DcfInput, r: DcfResult): BridgeStep[] {
  const steps: BridgeStep[] = r.rows.map((row) => ({ label: `${row.year}년차 현금흐름(현재가치)`, value: row.pv, kind: "add" as const }));
  steps.push({ label: "그 뒤 전부(잔존가치, 현재가치)", value: r.terminalPv, kind: "add" });
  steps.push({ label: "기업가치", value: r.enterprise, kind: "total" });
  if (i.netDebt !== 0) steps.push({ label: i.netDebt > 0 ? "빚 − 현금(순차입금)" : "현금 − 빚", value: -i.netDebt, kind: "add" });
  steps.push({ label: "주주가치", value: r.equity, kind: "total" });
  return steps;
}

export function dcfPlain(r: DcfResult, top?: TornadoBar) {
  if (!r.valid) return { headline: "투자자가 바라는 수익률이 먼 미래 성장률보다 커야 계산할 수 있어요.", driver: null, reasons: [] as string[] };
  const headline = `이 회사의 가치는 약 ${roughWon(r.equity)}, 1주당 약 ${roughWon(r.perShare)}으로 추정돼요.`;
  const reasons: string[] = [];
  if (r.terminalShare > 0.6) reasons.push(`가치의 ${Math.round(r.terminalShare * 100)}%가 5년 뒤 먼 미래 몫(잔존가치)이라, 먼 미래 가정이 조금만 바뀌어도 값이 크게 바뀌어요.`);
  if (r.rows.some((x) => x.fcff < 0)) reasons.push("앞으로 몇 해는 투자 때문에 현금이 빠져나가는 해가 있어요.");
  return { headline, driver: driverLine(top, "1주당 가치"), reasons };
}
