export const won = (n: number) => (Number.isFinite(n) ? `${Math.round(n).toLocaleString("ko-KR")}원` : "—");
export const pct = (r: number, digits = 1) => `${(r * 100).toFixed(digits)}%`;
/** 억 단위 요약: 12.3억 원 */
export const eok = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  const v = n / 100_000_000;
  return Math.abs(v) >= 1 ? `${v.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}억 원` : won(n);
};
