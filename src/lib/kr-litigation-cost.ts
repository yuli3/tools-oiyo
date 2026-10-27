// 민사소송 1심 비용 추정. Checked 2026-10-27.
// - 인지액: 민사소송 등 인지법 제2조 제1항. 1천만 미만 0.5%, 1억 미만 0.45%+5천, 10억 미만 0.4%+5만5천,
//   그 이상 0.35%+55만5천. 1천원 미만이면 1천원, 100원 미만 버림(제2조 제2항·제3항). 전자소송은 9/10(전자소송 인지 규칙).
// - 송달료: 송달료규칙의 시행에 따른 업무처리요령. 1회분 5,640원(2026-07-01부터, 이전 5,500원).
//   민사 1심 소액(3천만 원 이하) 당사자 1인당 10회분, 단독·합의 15회분.
// - 변호사보수 산입: 변호사보수의 소송비용 산입에 관한 규칙 별표(2020-12-28 개정).
export const LITIGATION_AS_OF = "2026-10-27";
export const SERVICE_FEE_PER_ROUND = 5_640;

export function stampDuty(claim: number, electronic: boolean): number {
  const v = Math.max(0, claim);
  let s = v < 10_000_000 ? v * 0.005 : v < 100_000_000 ? v * 0.0045 + 5_000 : v < 1_000_000_000 ? v * 0.004 + 55_000 : v * 0.0035 + 555_000;
  if (electronic) s *= 0.9;
  return Math.max(1_000, Math.floor(s / 100) * 100);
}

export function serviceFee(claim: number, parties: number): { rounds: number; fee: number } {
  const rounds = claim <= 30_000_000 ? 10 : 15;
  return { rounds, fee: SERVICE_FEE_PER_ROUND * rounds * Math.max(2, Math.floor(parties)) };
}

const FEE_TABLE = [
  { upTo: 3_000_000, base: 300_000, from: 0, rate: 0 },
  { upTo: 20_000_000, base: 300_000, from: 3_000_000, rate: 0.1 },
  { upTo: 50_000_000, base: 2_000_000, from: 20_000_000, rate: 0.08 },
  { upTo: 100_000_000, base: 4_400_000, from: 50_000_000, rate: 0.06 },
  { upTo: 150_000_000, base: 7_400_000, from: 100_000_000, rate: 0.04 },
  { upTo: 200_000_000, base: 9_400_000, from: 150_000_000, rate: 0.02 },
  { upTo: 500_000_000, base: 10_400_000, from: 200_000_000, rate: 0.01 },
  { upTo: Infinity, base: 13_400_000, from: 500_000_000, rate: 0.005 },
] as const;

/** 진 쪽에 청구할 수 있는 변호사보수 상한(심급마다). */
export function recoverableLawyerFee(claim: number): number {
  const v = Math.max(0, claim);
  const r = FEE_TABLE.find((x) => v <= x.upTo)!;
  return Math.floor(r.base + (v - r.from) * r.rate);
}
