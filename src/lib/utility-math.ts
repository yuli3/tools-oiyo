// Pure helpers for utilities migrated from Blog on 2026-10-27 (W1).
// Bodies are unchanged from the Blog components; moved here so they can be tested.

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function simplifyRatio(w: number, h: number): { w: number; h: number } {
  if (!w || !h) return { w: 0, h: 0 }
  const g = gcd(Math.round(w), Math.round(h))
  return { w: Math.round(w) / g, h: Math.round(h) / g }
}

// 유효성까지 검사하는 진법 변환. 잘못된 자릿수면 null.
export function convertBase(value: string, from: number, to: number): string | null {
  const v = value.trim();
  if (!v) return null;
  const n = parseInt(v, from);
  if (isNaN(n)) return null;
  // round-trip으로 from 진법에 맞지 않는 자릿수(예: bin에 '2') 걸러냄
  if (n.toString(from).toLowerCase() !== v.toLowerCase().replace(/^0+(?=.)/, "")) return null;
  return n.toString(to).toUpperCase();
}
