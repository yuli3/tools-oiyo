// 2026-10-29: preserve the old page's median-excluded halves convention;
// it is not R type 7 or a universal definition of Tukey hinges.
export function quartiles(raw: string) {
  const tokens = raw.trim().split(/[\s,;]+/).filter(Boolean);
  if (tokens.length < 2 || tokens.length > 1000) throw new Error('count');
  if (tokens.some(t => !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(t))) throw new Error('number');
  const s = tokens.map(Number).sort((a,b) => a-b);
  if (s.some(n => !Number.isFinite(n) || Math.abs(n) > 1e100)) throw new Error('range');
  const median = (a: number[]) => a.length % 2 ? a[(a.length-1)/2] : a[a.length/2-1]/2 + a[a.length/2]/2;
  const n=s.length, med=median(s), q1=median(s.slice(0,Math.floor(n/2))), q3=median(s.slice(Math.ceil(n/2)));
  const iqr=q3-q1, lo=q1-1.5*iqr, hi=q3+1.5*iqr;
  const inside=s.filter(x=>x>=lo&&x<=hi),outliers=s.filter(x=>x<lo||x>hi);
  return {s,n,min:s[0],max:s[n-1],med,q1,q3,iqr,lo,hi,outliers,whiskerMin:inside[0],whiskerMax:inside[inside.length-1]};
}
