// 세무·회계 도구의 가정 목록·다리 단계·쉬운 결과 문장 (2026-11-14).
// 계산은 kr-advisory-2026.ts가 하고, 여기는 "무엇을 바꿔 볼 수 있고 어떻게 설명할지"만 정해요.
import { valueUnlistedShares, type UnlistedShareInput } from "./kr-advisory-2026.ts";
import { moneyRange, roughWon, type Assumption, type BridgeStep, type TornadoBar } from "./scenario.ts";

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
    ? `결과를 가장 크게 움직이는 건 ${top.plain}이에요. 이 값이 20% 늘거나 줄면 1주당 값이 약 ${roughWon(Math.min(top.low, top.high))}에서 ${roughWon(Math.max(top.low, top.high))} 사이로 바뀌어요.`
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
