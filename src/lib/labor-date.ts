export const DAY_MS=86_400_000;
export function laborDate(value:string):number|null {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date=Date.parse(value+'T00:00:00Z');
  if(!Number.isFinite(date)||new Date(date).toISOString().slice(0,10)!==value||value<'1900-01-01'||value>'2100-12-31') return null;
  return date;
}
export const laborIso=(value:number)=>new Date(value).toISOString().slice(0,10);
