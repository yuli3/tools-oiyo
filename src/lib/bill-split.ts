/**
 * 간단계산기 (2026-11-22): N분의 1 나누기와 카드 할부 수수료 엔진.
 * WHY: 옛 더치페이 계산기는 사람마다 Math.round를 해서 합계가 총액과 1~2원 어긋났어요.
 * 여기서는 송금 단위(1·10·100·1000)로 내림한 뒤 남는 돈을 결제한 사람(총무)이 떠안아
 * 합계가 언제나 결제 금액과 같아요.
 */

export type SplitMode = 'equal' | 'ratio' | 'custom';

export interface SplitPerson {
  name: string;
  /** ratio 모드의 몫(예: 2:1:1). 0 이하는 0으로 봐요. */
  weight?: number;
  /** custom 모드에서 정해진 금액. 없으면 나머지를 균등하게 나눠요. */
  fixed?: number | null;
}

export interface SplitInput {
  total: number;
  people: SplitPerson[];
  mode: SplitMode;
  /** 송금 단위. 1, 10, 100, 1000 등. 각자 낼 돈을 이 단위로 내림해요. */
  unit: number;
  /** 카드로 결제한 사람(총무). 남는 돈을 이 사람이 떠안아요. */
  payer: number;
}

export interface SplitRow { name: string; share: number; isPayer: boolean }

export interface SplitResult {
  rows: SplitRow[];
  /** 결제한 사람이 나머지 사람에게서 받을 돈. */
  toCollect: number;
  /** 단위 내림 때문에 결제한 사람이 더 낸 돈. */
  payerExtra: number;
  /** 고정 금액 합이 총액보다 클 때 true. */
  overFixed: boolean;
}

const clean = (n: number | null | undefined) => (Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0);

export function splitBill(input: SplitInput): SplitResult {
  const total = Math.round(clean(input.total));
  const unit = Math.max(1, Math.round(clean(input.unit)) || 1);
  const n = input.people.length;
  if (n === 0) return { rows: [], toCollect: 0, payerExtra: 0, overFixed: false };
  const payer = Math.min(Math.max(0, Math.floor(input.payer)), n - 1);

  // 1) 사람마다 정확한(소수) 몫을 구해요.
  let exact: number[];
  let overFixed = false;
  if (input.mode === 'ratio') {
    const w = input.people.map((p) => clean(p.weight ?? 1));
    const sum = w.reduce((a, b) => a + b, 0);
    exact = sum > 0 ? w.map((x) => (total * x) / sum) : input.people.map(() => total / n);
  } else if (input.mode === 'custom') {
    const fixedSum = input.people.reduce((a, p) => a + (p.fixed != null ? clean(p.fixed) : 0), 0);
    const free = input.people.filter((p) => p.fixed == null).length;
    const rest = total - fixedSum;
    overFixed = rest < 0 || (free === 0 && rest !== 0);
    exact = input.people.map((p) => (p.fixed != null ? clean(p.fixed) : free > 0 ? Math.max(0, rest) / free : 0));
  } else {
    exact = input.people.map(() => total / n);
  }

  // 2) 결제한 사람 말고는 송금 단위로 내림해요. 고정 금액은 그대로 둬요.
  const shares = exact.map((x, i) => {
    if (i === payer) return 0;
    const p = input.people[i];
    if (input.mode === 'custom' && p.fixed != null) return Math.round(x);
    return Math.floor(x / unit) * unit;
  });
  const others = shares.reduce((a, b) => a + b, 0);
  shares[payer] = total - others;
  const payerExtra = Math.round(shares[payer] - exact[payer]);

  return {
    rows: input.people.map((p, i) => ({ name: p.name, share: shares[i], isPayer: i === payer })),
    toCollect: others,
    payerExtra,
    overFixed,
  };
}

/**
 * 카드 할부 수수료.
 * - declining (한국 카드사 표준): 원금은 매달 같게 나누고, 수수료는 남은 할부 원금 × 연 수수료율 ÷ 12.
 * - annuity (일본 分割払い, 미국·스페인 할부 등 원리금균등): 매달 같은 금액.
 * - flat (중국 信用卡分期): 매달 원금 × 월 수수료율을 고정으로 내요. 표시 연율보다 실제 부담이 커요.
 */
export type InstallmentMethod = 'declining' | 'annuity' | 'flat';

export interface InstallmentInput {
  principal: number;
  months: number;
  /** declining·annuity: 연 수수료율(%). flat: 월 수수료율(%). */
  ratePct: number;
  method: InstallmentMethod;
}

export interface InstallmentRow { month: number; principal: number; fee: number; payment: number; balance: number }

export interface InstallmentResult {
  rows: InstallmentRow[];
  totalFee: number;
  totalPaid: number;
  firstPayment: number;
  /** 실제 납부 흐름으로 구한 실질 연이율(%, 월 IRR × 12). flat 방식 비교용. */
  effectiveAprPct: number;
}

/** 원리금균등 월 상환액. */
function annuityPayment(principal: number, monthlyRate: number, months: number) {
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
}

/** 실제 납부 흐름의 현재가치가 원금과 같아지는 월 이율(IRR)을 이분법으로 찾아요. */
function impliedMonthlyRate(principal: number, payments: number[]) {
  const pv = (r: number) => payments.reduce((a, p, i) => a + p / (1 + r) ** (i + 1), 0);
  if (pv(0) <= principal + 1e-9) return 0;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > principal) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function cardInstallment(input: InstallmentInput): InstallmentResult {
  const principal = Math.round(clean(input.principal));
  const months = Math.max(1, Math.min(60, Math.round(clean(input.months)) || 1));
  const rate = clean(input.ratePct) / 100;
  const rows: InstallmentRow[] = [];
  let balance = principal;

  if (input.method === 'annuity') {
    const r = rate / 12;
    const pay = annuityPayment(principal, r, months);
    for (let m = 1; m <= months; m += 1) {
      const fee = Math.round(balance * r);
      const p = m === months ? balance : Math.round(pay) - fee;
      balance -= p;
      rows.push({ month: m, principal: p, fee, payment: p + fee, balance });
    }
  } else {
    const base = Math.floor(principal / months);
    for (let m = 1; m <= months; m += 1) {
      // 원 단위 나머지는 첫 달에 붙여요(카드사 청구 관행).
      const p = m === 1 ? principal - base * (months - 1) : base;
      const fee = input.method === 'flat' ? Math.round(principal * rate) : Math.round((balance * rate) / 12);
      balance -= p;
      rows.push({ month: m, principal: p, fee, payment: p + fee, balance });
    }
  }

  const totalFee = rows.reduce((a, r) => a + r.fee, 0);
  const totalPaid = principal + totalFee;
  const effectiveAprPct = principal > 0 ? Math.round(impliedMonthlyRate(principal, rows.map((r) => r.payment)) * 12 * 10000) / 100 : 0;
  return { rows, totalFee, totalPaid, firstPayment: rows[0]?.payment ?? 0, effectiveAprPct };
}
