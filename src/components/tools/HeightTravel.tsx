import HeightWorldMeans from './HeightWorldMeans';
import {useEffect,useId,useState} from 'react';
import data from '../../data/height-reference.json';
import {heightTravelCopy} from '../../data/height-travel-copy';
import {heightPosition,equivalentHeight,referenceFor,type HeightReference} from '../../lib/height-travel';
import type {Locale} from '../../lib/i18n';

export default function HeightTravel({locale}:{locale:Locale}) {
  const t=heightTravelCopy[locale],id=useId();
  const [height,setHeight]=useState('175'),[sex,setSex]=useState('male'),[age,setAge]=useState(20),[country,setCountry]=useState('KR');
  const [ready,setReady]=useState(false),[message,setMessage]=useState('');
  useEffect(()=>{setReady(true);},[]);
  const COUNTRIES=['KR','US','JP','CA'] as const;
  const FLAGS:Record<string,string>={KR:'🇰🇷',US:'🇺🇸',JP:'🇯🇵',CA:'🇨🇦'};
  const rows=COUNTRIES.map(c=>referenceFor(data.rows as HeightReference[],c,sex,age)).filter((r):r is HeightReference=>r!==null);
  const row=rows.find(r=>r.country===country)??rows[0];
  const cm=height.trim()===''?NaN:Number(height),result=heightPosition(cm,row);
  const f=(n:number,digits=1)=>new Intl.NumberFormat(locale,{maximumFractionDigits:digits}).format(n);
  const label=(code:string)=>({KR:t.kr,US:t.us,JP:t.jp,CA:t.ca} as Record<string,string>)[code]??code;
  const band=(r:HeightReference)=>`${r.ageMin}–${r.ageMax}`;
  const position=(r:typeof row)=>{
    const p=heightPosition(cm,r);
    return !p?t.invalid:p.kind==='below'?t.below.replace('{p}',String(p.bound)):p.kind==='above'?t.above.replace('{p}',String(p.bound)):`${t.top} ${f(100-p.percentile)}%`;
  };
  async function copy(){
    if(!result)return;
    const text=`${t.title} · ${f(cm)} cm · ${sex==='male'?t.male:t.female} · ${age}–${age+9}\n${rows.map(r=>`${label(r.country)}: ${position(r)}`).join('\n')}\n${t.method}\nhttps://tools.oiyo.net/${locale}/height-world-travel/`;
    try{await navigator.clipboard.writeText(text);setMessage(t.copied);}catch{setMessage(t.failed);}
  }
  return <section className="space-y-4" aria-label={t.title}>
    <fieldset disabled={!ready} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
      <legend className="sr-only">{t.comparison}</legend>
      <div><label htmlFor={id+'h'} className="mb-1 block text-sm font-medium">{t.height}</label><input id={id+'h'} type="number" inputMode="decimal" min="50" max="250" step="0.1" value={height} onChange={e=>{setHeight(e.target.value);setMessage('');}} aria-invalid={!result} aria-describedby={!result?id+'error':undefined} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2" /></div>
      <div><label htmlFor={id+'s'} className="mb-1 block text-sm font-medium">{t.sex}</label><select id={id+'s'} value={sex} onChange={e=>{setSex(e.target.value);setMessage('');}} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2"><option value="male">{t.male}</option><option value="female">{t.female}</option></select></div>
      <div><label htmlFor={id+'a'} className="mb-1 block text-sm font-medium">{t.age}</label><select id={id+'a'} value={age} onChange={e=>{setAge(Number(e.target.value));setMessage('');}} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2">{[20,30,40,50,60].map(a=><option key={a} value={a}>{a}–{a+9}</option>)}</select></div>
      {!ready&&<p className="text-sm text-muted-foreground">{t.loading}</p>}
    </fieldset>
    <div className="grid grid-cols-2 gap-2">{rows.map(r=><button key={r.country} type="button" disabled={!ready} aria-pressed={country===r.country} onClick={()=>setCountry(r.country)} className={'min-h-11 rounded-xl border p-3 text-left '+(country===r.country?'border-primary bg-primary text-primary-foreground':'border-border bg-card text-foreground')}><span className="block font-semibold">{FLAGS[r.country]} {label(r.country)}</span>{(r.ageMin!==age||r.ageMax!==age+9)&&<span className="block text-xs opacity-80">{t.band} {band(r)}</span>}<span className="mt-1 block text-sm">{position(r)}</span></button>)}</div>
    {!result?<p role="alert" id={id+'error'} className="text-destructive">{t.invalid}</p>:<div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label(row.country)} · {sex==='male'?t.male:t.female} · {band(row)}</p>
      <h2 className="mt-2 text-2xl font-bold tabular-nums">{position(row)}</h2>
      {result.kind==='within'&&<>
        <p className="mt-1 text-sm">{t.percentile}: <strong>{f(result.percentile)}%</strong> · {t.rank}: <strong>{f(result.rank100)}</strong></p>
        <svg viewBox="0 0 400 210" className="my-3 w-full text-primary" role="img" aria-labelledby={id+'lineup'}><title id={id+'lineup'}>{t.lineup}: {f(result.rank100)}</title>{Array.from({length:100},(_,i)=>{
          const selected=i===Math.round(result.rank100)-1;const x=10+(i%20)*20,y=12+Math.floor(i/20)*40;
          return <g key={i} transform={`translate(${x} ${y})`} fill="currentColor" opacity={selected?1:.25}><circle cy="0" r={selected?5:3}/><path d="M-4 7 Q0 4 4 7 L5 18 L2 18 L2 29 L-2 29 L-2 18 L-5 18Z"/>{selected&&<circle cy="13" r="17" fill="none" stroke="currentColor" strokeWidth="1.5"/>}</g>;
        })}</svg>
      </>}
      <p className="text-sm">{t.cmDiff}: <strong>{cm-row.mean>=0?'+':''}{f(cm-row.mean)} cm</strong></p>
      <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">{rows.map(r=>{
        const value=result.kind==='within'?equivalentHeight(result.percentile,r):null;
        return <div key={r.country}><dt>{t.equivalent} · {label(r.country)}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{value===null?'—':f(value)+' cm'}</dd></div>;
      })}</dl>
      <button type="button" onClick={()=>void copy()} disabled={!ready} className="mt-4 min-h-11 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground">{t.copy}</button>
      <p role="status" aria-live="polite" className="mt-1 text-sm">{message}</p>
    </div>}
    <p className="text-sm leading-relaxed text-muted-foreground">{t.tails}</p>
    <HeightWorldMeans ready={ready} locale={locale} cm={cm} sex={sex==='male'?'male':'female'}/>
    <details className="rounded-xl border border-border bg-card p-4"><summary className="cursor-pointer font-semibold">{t.sources}</summary><ul className="mt-3 space-y-3 text-sm">{rows.map(r=>{
      const source=data.sources[r.country as keyof typeof data.sources];return <li key={r.country}><a href={source.url} className="text-primary underline">{label(r.country)} · {source.name}</a><p>{t.period}: {source.period} · {t.band}: {band(r)} · {t.sample}: {r.n===null?'—':f(r.n,0)}</p><p className="text-xs text-muted-foreground">{source.credit}{'terms' in source&&source.terms?<> · <a href={source.terms} className="underline">{source.license}</a></>:null}</p></li>;
    })}</ul></details>
  </section>;
}
