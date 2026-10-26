export type PayOffer = { monthly: string; extra1: string; extra2: string };
export type OfferResult = { ok: true; regularCents: number; extraCents: number; annualCents: number; monthlyEquivalent: number } | { ok: false; reason: 'missing' | 'invalid' };
// 2026-10-26: compare confirmed gross cash inputs, never infer extra-pay amounts
// or legality from payment count. Integer cents avoid currency drift (BOE art31).
function cents(raw: string): number | null {
 const s=raw.trim();
 if(!/^\d+(?:[.,]\d{1,2})?$/.test(s))return null;
 const [whole,fraction='']=s.replace(',','.').split('.');
 const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(n)&&n<=100_000_000_00?n:null;
}
export function annualizeOffer(input: PayOffer): OfferResult {
 if([input.monthly,input.extra1,input.extra2].some(s=>s.trim()===''))return {ok:false,reason:'missing'};
 const m=cents(input.monthly),a=cents(input.extra1),b=cents(input.extra2);
 if(m===null||a===null||b===null)return {ok:false,reason:'invalid'};
 const regularCents=m*12,extraCents=a+b,annualCents=regularCents+extraCents;
 return {ok:true,regularCents,extraCents,annualCents,monthlyEquivalent:annualCents/1200};
}
