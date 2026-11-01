export interface WorldMean {country:string; male:number; female:number}
/** Means cannot identify individual ranks: this interface intentionally returns centimetres only (2026-11-02). */
export function compareWorldMeans<T extends WorldMean>(rows:readonly T[],cm:number,sex:'male'|'female') {
 if(!Number.isFinite(cm)||cm<50||cm>250)return [];
 return rows.map(row=>({row,mean:row[sex],difference:cm-row[sex]})).sort((a,b)=>Math.abs(a.difference)-Math.abs(b.difference)||a.row.country.localeCompare(b.row.country));
}
