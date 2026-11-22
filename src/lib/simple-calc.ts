/**
 * 간단계산기 (2026-11-22): 어르신·저시력·시각장애인용 큰 글씨 계산기의 순수 로직.
 * 세운: "간단 계산기는 시니어, 노인, 시각장애인 등을 위한 것. 복잡한 로직은 숨기고 겉은 단순하게."
 * 화면은 입력 2~3개와 한 문장 결과만 보여 주고, 계산 규칙은 모두 여기서 처리해요.
 */

// ── 탁상 계산기(누른 순서대로 계산) ─────────────────────────────
// 어르신에게 익숙한 일반 계산기처럼 2 + 3 × 4 = 20 (곱셈 우선 아님)으로 동작해요.
export type Op = '+' | '-' | '×' | '÷';
export interface CalcState { display: string; acc: number | null; op: Op | null; fresh: boolean; error: boolean; expr: string }
export const initialCalc: CalcState = { display: '0', acc: null, op: null, fresh: true, error: false, expr: '' };

const tidy = (n: number) => {
  if (!Number.isFinite(n)) return NaN;
  const r = Math.round(n * 1e10) / 1e10;
  return Object.is(r, -0) ? 0 : r;
};
function apply(a: number, op: Op, b: number) {
  if (op === '+') return tidy(a + b);
  if (op === '-') return tidy(a - b);
  if (op === '×') return tidy(a * b);
  return b === 0 ? NaN : tidy(a / b);
}
const show = (n: number) => (Number.isNaN(n) ? 'Error' : String(n));

export function pressKey(s: CalcState, key: string): CalcState {
  if (key === 'C') return initialCalc;
  if (s.error) return pressKey(initialCalc, key);
  if (/^\d$/.test(key) || key === '00') {
    if (s.fresh) return { ...s, display: key === '00' ? '0' : key, fresh: false };
    if (s.display.replace(/[-.]/g, '').length >= 15) return s;
    return { ...s, display: s.display === '0' ? (key === '00' ? '0' : key) : s.display + key };
  }
  if (key === '.') {
    if (s.fresh) return { ...s, display: '0.', fresh: false };
    return s.display.includes('.') ? s : { ...s, display: s.display + '.' };
  }
  if (key === '⌫') {
    if (s.fresh) return s;
    const d = s.display.length <= 1 || (s.display.length === 2 && s.display.startsWith('-')) ? '0' : s.display.slice(0, -1);
    return { ...s, display: d };
  }
  if (key === '%') {
    // 100 + 10 % → 100의 10% = 10 (일반 계산기 방식)
    const cur = Number(s.display);
    const v = s.acc != null && (s.op === '+' || s.op === '-') ? tidy((s.acc * cur) / 100) : tidy(cur / 100);
    return { ...s, display: show(v), fresh: true };
  }
  if (key === '+' || key === '-' || key === '×' || key === '÷') {
    const cur = Number(s.display);
    if (s.op && !s.fresh && s.acc != null) {
      const v = apply(s.acc, s.op, cur);
      if (Number.isNaN(v)) return { ...initialCalc, display: 'Error', error: true };
      return { display: show(v), acc: v, op: key, fresh: true, error: false, expr: `${show(v)} ${key}` };
    }
    return { ...s, acc: cur, op: key, fresh: true, expr: `${s.display} ${key}` };
  }
  if (key === '=') {
    if (!s.op || s.acc == null) return { ...s, fresh: true };
    const cur = Number(s.display);
    const v = apply(s.acc, s.op, cur);
    if (Number.isNaN(v)) return { ...initialCalc, display: 'Error', error: true };
    return { display: show(v), acc: null, op: null, fresh: true, error: false, expr: `${show(s.acc)} ${s.op} ${s.display} =` };
  }
  return s;
}

// ── 숫자 읽기 ──────────────────────────────────────────────
/** 1234567 → "123만 4,567". 큰 금액을 한국어로 읽기 쉽게 보여 줘요(소수는 버림). */
export function koreanUnits(n: number): string {
  if (!Number.isFinite(n)) return '';
  const neg = n < 0;
  let v = Math.floor(Math.abs(n));
  if (v < 10000) return (neg ? '-' : '') + v.toLocaleString('ko-KR');
  const parts: string[] = [];
  const units: [number, string][] = [[1e12, '조'], [1e8, '억'], [1e4, '만']];
  for (const [u, name] of units) {
    const q = Math.floor(v / u);
    if (q > 0) { parts.push(`${q.toLocaleString('ko-KR')}${name}`); v -= q * u; }
  }
  if (v > 0) parts.push(v.toLocaleString('ko-KR'));
  return (neg ? '-' : '') + parts.join(' ');
}

/** 입력칸의 "12,000" 같은 글자에서 숫자만 읽어요. */
export function parseAmount(text: string): number {
  const cleaned = text.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// ── 할인 ──────────────────────────────────────────────────
export function discount(price: number, pct: number) {
  const p = Math.max(0, price);
  const r = Math.min(100, Math.max(0, pct));
  const saved = (p * r) / 100;
  return { final: p - saved, saved };
}

// ── 며칠 남았나 ───────────────────────────────────────────
/** YYYY-MM-DD 두 날짜의 차이(일). target이 미래면 양수. 시간대와 무관하게 달력 날짜로 셉니다. */
export function daysBetween(fromIso: string, toIso: string): number | null {
  const parse = (s: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : NaN;
  };
  const a = parse(fromIso);
  const b = parse(toIso);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

/** 브라우저 현지 날짜를 YYYY-MM-DD로. */
export function todayIso(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
