// 주택 중개보수 상한 (공인중개사법 시행규칙 제20조 별표1 기준, 2021-10-19 개정, 시·도 조례 표준). Checked 2026-10-27.
// - 매매·교환: 5천만 미만 0.6%(한도 25만), 2억 미만 0.5%(한도 80만), 9억 미만 0.4%, 12억 미만 0.5%,
//   15억 미만 0.6%, 15억 이상 0.7%.
// - 임대차: 5천만 미만 0.5%(한도 20만), 1억 미만 0.4%(한도 30만), 6억 미만 0.3%, 12억 미만 0.4%,
//   15억 미만 0.5%, 15억 이상 0.6%.
// - 월세 거래금액: 보증금 + 월세 × 100. 그 값이 5천만 원 미만이면 보증금 + 월세 × 70.
export const BROKERAGE_AS_OF = "2026-10-27";
const MAN = 10_000;
const EOK = 100_000_000;

type Row = { below: number; rate: number; cap?: number };
const SALE: Row[] = [
  { below: 5_000 * MAN, rate: 0.006, cap: 250_000 },
  { below: 2 * EOK, rate: 0.005, cap: 800_000 },
  { below: 9 * EOK, rate: 0.004 },
  { below: 12 * EOK, rate: 0.005 },
  { below: 15 * EOK, rate: 0.006 },
  { below: Infinity, rate: 0.007 },
];
const LEASE: Row[] = [
  { below: 5_000 * MAN, rate: 0.005, cap: 200_000 },
  { below: 1 * EOK, rate: 0.004, cap: 300_000 },
  { below: 6 * EOK, rate: 0.003 },
  { below: 12 * EOK, rate: 0.004 },
  { below: 15 * EOK, rate: 0.005 },
  { below: Infinity, rate: 0.006 },
];

/** 월세 계약의 거래금액. 월세가 없으면 보증금 그대로. */
export function leaseBase(deposit: number, monthlyRent: number): number {
  const d = Math.max(0, deposit);
  const m = Math.max(0, monthlyRent);
  if (m === 0) return d;
  const base = d + m * 100;
  return base < 5_000 * MAN ? d + m * 70 : base;
}

export function brokerageFee(kind: "sale" | "lease", amount: number) {
  const a = Math.max(0, amount);
  const row = (kind === "sale" ? SALE : LEASE).find((r) => a < r.below)!;
  const raw = Math.floor(a * row.rate);
  const fee = row.cap !== undefined ? Math.min(raw, row.cap) : raw;
  return { rate: row.rate, cap: row.cap ?? null, fee, vat: Math.floor(fee * 0.1) };
}
