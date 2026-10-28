// WHY 2026-10-28: copied calculators must reject blank/partial/infinite input instead of silently treating it as zero.
export function numeric(value:string,min=0,max=1e9):number|null{
 if(!/^\d+(?:[.,]\d+)?$/.test(value.trim()))return null;
 const n=Number(value.trim().replace(',','.'));return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}
export function paceSeconds(minutes:string,seconds:string):number|null{
 const m=numeric(minutes,0,1e6),s=numeric(seconds,0,59);if(m===null||s===null||!Number.isInteger(m)||!Number.isInteger(s)||m*60+s<=0)return null;return m*60+s;
}
export function recipeFactor(original:string,target:string):number|null{
 const a=numeric(original),b=numeric(target);if(a===null||b===null||a<=0||b<=0)return null;const result=b/a;return Number.isFinite(result)?result:null;
}
export function recipeAmount(amount:string,factor:number|null):number|null{
 const a=numeric(amount);if(a===null||factor===null||!Number.isFinite(factor))return null;const result=a*factor;return Number.isFinite(result)?Math.round(result*1000)/1000:null;
}
export function requiredFinal(current:string,weight:string,desired:string):number|null{
 const c=numeric(current,0,100),w=numeric(weight,0,100),d=numeric(desired,0,100);if(c===null||w===null||d===null||w<=0)return null;return (d-c*(1-w/100))/(w/100);
}
export function weightedGpa(scale:string,rows:readonly {points:string;credits:string}[]):number|null{
 const max=numeric(scale,0,10);if(max===null||max<=0||!rows.length)return null;let total=0,credits=0;
 for(const row of rows){const p=numeric(row.points,0,max),c=numeric(row.credits,0,1000);if(p===null||c===null||c<=0)return null;total+=p*c;credits+=c;}
 return total/credits;
}
export function calendarDate(value:string):Date|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const date=new Date(value+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?date:null;
}
export function calendarDays(a:Date,b:Date):number{return Math.round((b.getTime()-a.getTime())/86400000);}
export function calendarAddDays(d:Date,days:number):Date{const result=new Date(d);result.setUTCDate(result.getUTCDate()+days);return result;}

// WHY 2026-10-28: today follows the visitor’s calendar; UTC is only for day arithmetic.
export function localCalendarDate(d:Date):string{return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
