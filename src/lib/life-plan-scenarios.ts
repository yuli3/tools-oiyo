// 생애 설계(결혼 출발 자금·교육 자금·전세 안전도) (2026-11-17, 롤아웃 3묶음 남은 것). 한국어 페이지용.
import { fixedRange, type Assumption, type TornadoBar } from "./scenario.ts";
import { driverLine } from "./kr-money-scenarios.ts";
import { unitDriver } from "./health-scenarios.ts";

const man = (n: number) => {
  const v = Math.round(Math.abs(n) / 10000);
  const eok = Math.floor(v / 10000);
  const rest = v % 10000;
  const body = eok > 0 ? `${eok.toLocaleString("ko-KR")}억${rest ? ` ${rest.toLocaleString("ko-KR")}만` : ""} 원` : `${rest.toLocaleString("ko-KR")}만 원`;
  return `${n < 0 ? "−" : ""}${body}`;
};
const pctText = (n: number) => `${(Math.round(n * 1000) / 10).toLocaleString("ko-KR")}%`;
const money = <I>(key: string, plain: string, get: (i: I) => number, set: (i: I, v: number) => I, lo = 0.3, hi = 2): Assumption<I> => ({ key, label: plain, plain, unit: "won", kind: "assumption", get, set, range: (a) => [Math.max(0, a * lo), Math.max(a * hi, 1000000)] });

// ── 결혼 출발 자금
export interface StartLite { mine: number; partner: number; wedding: number; housing: number }
export const startNet = (i: StartLite) => i.mine + i.partner - i.wedding - i.housing;
export const START_ASSUMPTIONS: Assumption<StartLite>[] = [
  money<StartLite>("housing", "신혼집 비용", (i) => i.housing, (i, v) => ({ ...i, housing: Math.max(0, v) })),
  money<StartLite>("wedding", "결혼식 비용", (i) => i.wedding, (i, v) => ({ ...i, wedding: Math.max(0, v) })),
  money<StartLite>("mine", "내 자산", (i) => i.mine, (i, v) => ({ ...i, mine: Math.max(0, v) })),
  money<StartLite>("partner", "배우자 자산", (i) => i.partner, (i, v) => ({ ...i, partner: Math.max(0, v) })),
];
export function startPlain(i: StartLite, top?: TornadoBar) {
  const net = startNet(i);
  return {
    headline: net >= 0 ? `결혼식과 신혼집을 마련하고 ${man(net)}이 남아요.` : `두 사람 자산보다 ${man(-net)}이 모자라요. 대출이나 지원으로 채워야 해요.`,
    driver: driverLine(top, "남는 돈"),
    reasons: [
      `두 사람 자산 ${man(i.mine + i.partner)}에서 결혼식 ${man(i.wedding)}, 신혼집 ${man(i.housing)}를 뺐어요.`,
      "결혼 전후 2년 안에 부모에게 받는 돈은 혼인 증여공제(1억 원)가 따로 있어요. 금액이 크면 증여세 계산기로 확인하세요.",
      "남는 돈은 비상금(생활비 3~6개월)부터 떼어 두세요.",
    ],
  };
}

// ── 교육 자금
export interface EduLite { cost: number; years: number; duration: number; inflation: number; ret: number }
export function eduResult(i: EduLite) {
  let future = 0;
  for (let k = 0; k < Math.max(1, Math.round(i.duration)); k++) future += i.cost * Math.pow(1 + i.inflation, i.years + k);
  const n = Math.max(0, Math.round(i.years * 12));
  const m = i.ret / 12;
  const monthly = n === 0 ? future : m > 0 ? (future * m) / (Math.pow(1 + m, n) - 1) : future / n;
  return { future, monthly, today: i.cost * Math.max(1, Math.round(i.duration)) };
}
export const eduMonthly = (i: EduLite) => eduResult(i).monthly;
export const EDU_ASSUMPTIONS: Assumption<EduLite>[] = [
  { key: "inflation", label: "교육비 상승률", plain: "교육비가 오르는 속도", unit: "rate", kind: "assumption", get: (i) => i.inflation, set: (i, v) => ({ ...i, inflation: Math.max(0, v) }), range: fixedRange(0, 0.07) },
  { key: "ret", label: "운용 수익률", plain: "모으는 돈의 수익률", unit: "rate", kind: "assumption", get: (i) => i.ret, set: (i, v) => ({ ...i, ret: Math.max(0, v) }), range: fixedRange(0, 0.08) },
  { key: "years", label: "남은 기간", plain: "입학까지 남은 해", unit: "years", kind: "fact", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 20) },
  money<EduLite>("cost", "1년 교육비(지금 값)", (i) => i.cost, (i, v) => ({ ...i, cost: Math.max(0, v) }), 0.5, 2),
];
export function eduPlain(i: EduLite, top?: TornadoBar) {
  const r = eduResult(i);
  return {
    headline: `${i.years}년 뒤 ${i.duration}년 동안 들 교육비는 약 ${man(r.future)}이에요. 지금부터 한 달에 약 ${man(r.monthly)}씩 모으면 돼요.`,
    driver: driverLine(top, "한 달 저축액"),
    reasons: [
      `지금 값으로는 ${man(r.today)}이지만, 해마다 ${pctText(i.inflation)}씩 오른다고 보면 ${man(r.future - r.today)}이 늘어요.`,
      `모으는 돈은 연 ${pctText(i.ret)}로 굴린다고 봤어요. 기간이 길수록 수익률 차이가 커져요.`,
      "대학 등록금은 동결되어 온 해가 많지만 사교육비·생활비는 물가보다 빨리 오르기도 해요. 두세 가지 상승률로 비교해 보세요.",
    ],
  };
}

// ── 전세 안전도
export interface JeonseLite { price: number; deposit: number; debt: number }
export const jeonseRatio = (i: JeonseLite) => (i.price > 0 ? (i.deposit + i.debt) / i.price : 0);
export const JEONSE_ASSUMPTIONS: Assumption<JeonseLite>[] = [
  money<JeonseLite>("price", "집값(시세)", (i) => i.price, (i, v) => ({ ...i, price: Math.max(1, v) }), 0.7, 1.3),
  money<JeonseLite>("deposit", "내 전세 보증금", (i) => i.deposit, (i, v) => ({ ...i, deposit: Math.max(0, v) }), 0.6, 1.4),
  money<JeonseLite>("debt", "선순위 대출(근저당)", (i) => i.debt, (i, v) => ({ ...i, debt: Math.max(0, v) }), 0, 2),
];
export const jeonseBand = (r: number) => (r <= 0.7 ? "안전한 편" : r <= 0.8 ? "주의" : r <= 0.9 ? "위험" : "매우 위험");
export function jeonsePlain(i: JeonseLite, top?: TornadoBar) {
  const r = jeonseRatio(i);
  const cushion = i.price * 0.7 - i.debt - i.deposit;
  return {
    headline: `보증금과 선순위 대출을 합치면 집값의 ${pctText(r)}예요. '${jeonseBand(r)}' 구간이에요.`,
    driver: unitDriver(top, "집값 대비 비율", pctText),
    reasons: [
      cushion >= 0 ? `집값이 30% 떨어져도 보증금을 돌려받을 여유가 ${man(cushion)} 있어요.` : `집값이 30% 떨어지면 보증금 중 약 ${man(-cushion)}을 못 돌려받을 수 있어요.`,
      "경매로 넘어가면 시세의 70~80%에 팔리는 경우가 많아요. 그래서 70%를 넘으면 조심해야 해요.",
      "계약 전 등기부등본으로 근저당·압류를 확인하고, 전세보증금 반환보증(HUG·HF·SGI) 가입이 되는지 먼저 알아보세요.",
    ],
  };
}
