// 가정 변화 시각화용 시나리오 계층 (2026-11-14, 세무·회계 도구 2단계).
// 계산 엔진은 건드리지 않고, "가정 하나를 바꾸면 결과가 어떻게 되나"만 순수 함수로 계산해요.
// 도구는 가정 목록(Assumption)과 결과 함수(evaluate)만 넘기면 돼요. 화면 부품은 components/tools/viz/.

export type AssumptionUnit = "won" | "pct" | "shares" | "years" | "rate";

export interface Assumption<I> {
  key: string;
  /** 전문가용 이름(법령 용어) */
  label: string;
  /** 쉬운 이름(법을 모르는 사람용) */
  plain: string;
  unit: AssumptionUnit;
  /** fact = 사실(기간·업종 등, 토네이도에서 빼요), assumption = 바꿔 볼 수 있는 추정 */
  kind: "fact" | "assumption";
  get: (input: I) => number;
  set: (input: I, value: number) => I;
  /** 슬라이더·훑기 곡선 범위. anchor는 사용자가 마지막으로 직접 넣은 값이에요. */
  range: (anchor: number) => [number, number];
  /** 법이 바뀌는 경계(예: 부동산 비율 50%·80%) */
  marks?: { at: number; label: string }[];
}

export interface SweepPoint {
  x: number;
  y: number;
}

/** 가정 하나를 min~max로 바꾼 결과 곡선. 경계값(marks)은 정확히 포함해요. */
export function sweep<I>(base: I, a: Assumption<I>, evaluate: (input: I) => number, [min, max]: [number, number], steps = 60): SweepPoint[] {
  if (!(max > min)) return [{ x: min, y: evaluate(a.set(base, min)) }];
  const xs = new Set<number>();
  for (let i = 0; i <= steps; i++) xs.add(min + ((max - min) * i) / steps);
  for (const m of a.marks ?? []) if (m.at >= min && m.at <= max) xs.add(m.at);
  const current = a.get(base);
  if (current >= min && current <= max) xs.add(current);
  return [...xs].sort((p, q) => p - q).map((x) => ({ x, y: evaluate(a.set(base, x)) }));
}

export interface TornadoBar {
  key: string;
  label: string;
  plain: string;
  lowInput: number;
  highInput: number;
  /** 가정을 낮췄을 때·높였을 때 결과 */
  low: number;
  high: number;
  base: number;
  /** |high − low|, 정렬 기준 */
  span: number;
}

/**
 * 각 가정을 ±delta(기본 20%) 바꿀 때 결과가 움직이는 폭, 큰 순서.
 * 사실(kind: fact)과 지금 값이 0인 가정은 빼요(0의 ±20%는 0이라 의미가 없어요).
 */
export function tornado<I>(base: I, assumptions: Assumption<I>[], evaluate: (input: I) => number, delta = 0.2): TornadoBar[] {
  const baseValue = evaluate(base);
  const bars: TornadoBar[] = [];
  for (const a of assumptions) {
    if (a.kind !== "assumption") continue;
    const v = a.get(base);
    if (!Number.isFinite(v) || v === 0) continue;
    const lowInput = v * (1 - delta);
    const highInput = v * (1 + delta);
    const low = evaluate(a.set(base, lowInput));
    const high = evaluate(a.set(base, highInput));
    bars.push({ key: a.key, label: a.label, plain: a.plain, lowInput, highInput, low, high, base: baseValue, span: Math.abs(high - low) });
  }
  return bars.sort((p, q) => q.span - p.span);
}

export interface BridgeStep {
  label: string;
  value: number;
  /** add = 앞에 더하거나 빼는 단계, total = 지금까지의 합계 막대 */
  kind: "add" | "total";
  note?: string;
}

export interface BridgeBar extends BridgeStep {
  start: number;
  end: number;
}

/** 다리(워터폴) 그래프 배치: 각 막대의 시작·끝. total 막대는 value를 그대로 써요(반올림 차이 흡수). */
export function bridgeLayout(steps: BridgeStep[]): BridgeBar[] {
  let run = 0;
  return steps.map((s) => {
    if (s.kind === "total") {
      run = s.value;
      return { ...s, start: 0, end: s.value };
    }
    const start = run;
    run += s.value;
    return { ...s, start, end: run };
  });
}

/** 그래프 눈금용 반올림 단위 */
export function niceStep(span: number, target = 100): number {
  if (!(span > 0)) return 1;
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

/** 금액 범위: 0 ~ 2배(최소 폭 보장). 음수가 될 수 있는 값은 signed. */
export function moneyRange(anchor: number, { signed = false, minSpan = 100_000_000 } = {}): [number, number] {
  const a = Math.abs(anchor);
  const hi = Math.max(a * 2, minSpan);
  if (signed) return [anchor < 0 ? anchor * 2 : -Math.max(a, minSpan / 2), anchor < 0 ? Math.max(a, minSpan) : hi];
  return [0, hi];
}

/**
 * "6억 3,000만", "1.5억", "3천만", "250000000", "-2억" 같은 한국어 금액을 원 단위 숫자로.
 * 읽을 수 없으면 null.
 */
export function parseKoreanAmount(text: string): number | null {
  const s = text.replace(/[\s,원]/g, "");
  if (s === "" || s === "-") return null;
  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s;
  if (/^\d+(\.\d+)?$/.test(body)) return (neg ? -1 : 1) * Number(body);
  const UNIT: Record<string, number> = { 조: 1e12, 억: 1e8, 만: 1e4 };
  const SMALL: Record<string, number> = { 천: 1000, 백: 100, 십: 10 };
  let total = 0;
  let rest = body;
  const big = /^(\d+(?:\.\d+)?)?((?:\d|\.|천|백|십)*)(조|억|만)/;
  let m: RegExpExecArray | null;
  while ((m = big.exec(rest))) {
    const chunk = (m[1] ?? "") + m[2];
    const n = chunk === "" ? 1 : smallNumber(chunk, SMALL);
    if (n === null) return null;
    total += n * UNIT[m[3]];
    rest = rest.slice(m[0].length);
  }
  if (rest !== "") {
    const n = smallNumber(rest, SMALL);
    if (n === null) return null;
    total += n;
  }
  return (neg ? -1 : 1) * Math.round(total);
}

function smallNumber(chunk: string, SMALL: Record<string, number>): number | null {
  if (/^\d+(\.\d+)?$/.test(chunk)) return Number(chunk);
  let total = 0;
  let rest = chunk;
  const re = /^(\d+(?:\.\d+)?)?(천|백|십)/;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest))) {
    total += (m[1] ? Number(m[1]) : 1) * SMALL[m[2]];
    rest = rest.slice(m[0].length);
  }
  if (rest === "") return total;
  if (/^\d+$/.test(rest)) return total + Number(rest);
  return null;
}

/** 쉬운 금액 표기: 약 26.4억 원, 약 4.4만 원, 830원 */
export function roughWon(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 1e12) return `${sign}${trim(a / 1e12)}조 원`;
  if (a >= 1e8) return `${sign}${trim(a / 1e8)}억 원`;
  if (a >= 1e4) return `${sign}${trim(a / 1e4)}만 원`;
  return `${sign}${Math.round(a).toLocaleString("ko-KR")}원`;
}

function trim(v: number): string {
  const digits = v >= 100 ? 0 : 1;
  return Number(v.toFixed(digits)).toLocaleString("ko-KR", { maximumFractionDigits: digits });
}
