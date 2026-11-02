export interface HeightReference {
  country: string; sex: string; ageMin: number; ageMax: number; n: number | null; mean: number; quantiles: number[][];
}
export type HeightPosition = { kind: 'within'; percentile: number; rank100: number } | { kind: 'below'; bound: number } | { kind: 'above'; bound: number };
/** Reported quantiles support interpolation only within their observed span; no invented tails (2026-11-02). */
export function heightPosition(cm: number, row: HeightReference): HeightPosition | null {
  if (!Number.isFinite(cm) || cm < 50 || cm > 250) return null;
  const q = row.quantiles;
  if (q.length < 2 || q.some(([p,h],i) => !Number.isFinite(p+h) || (i>0 && (p<=q[i-1][0] || h<=q[i-1][1])))) return null;
  if(cm < q[0][1]) return {kind:'below',bound:q[0][0]};
  if(cm > q[q.length-1][1]) return {kind:'above',bound:q[q.length-1][0]};
  for(let i=1;i<q.length;i++) if(cm<=q[i][1]) {
    const [p0,h0]=q[i-1], [p1,h1]=q[i];
    const percentile=p0+(cm-h0)/(h1-h0)*(p1-p0);
    return {kind:'within',percentile,rank100:1+99*(1-percentile/100)};
  }
  return null;
}
export function equivalentHeight(percentile: number,row: HeightReference): number | null {
  const q=row.quantiles;
  if(!Number.isFinite(percentile)||percentile<q[0][0]||percentile>q[q.length-1][0]) return null;
  for(let i=1;i<q.length;i++) if(percentile<=q[i][0]) return q[i-1][1]+(percentile-q[i-1][0])/(q[i][0]-q[i-1][0])*(q[i][1]-q[i-1][1]);
  return null;
}
/** The official row whose age band contains the whole selected decade (2026-11-02). Japan and Canada
 * publish wider bands (JP 18–29/30–49/50–69, CA 20–39/40–59/60–79), so e.g. a 40s user is compared
 * with JP 30–49 and CA 40–59. Returns null when no band covers the decade. */
export function referenceFor<T extends HeightReference>(rows: T[], country: string, sex: string, decade: number): T | null {
  return rows.find(r => r.country === country && r.sex === sex && r.ageMin <= decade && decade + 9 <= r.ageMax) ?? null;
}
