import {useId,useMemo,useState} from 'react';
import data from '../../data/height-world-means.json';
import {heightWorldCopy} from '../../data/height-world-copy';
import {compareWorldMeans} from '../../lib/height-world';
import type {Locale} from '../../lib/i18n';

export default function HeightWorldMeans({locale,cm,sex,ready}:{locale:Locale;cm:number;ready:boolean;sex:'male'|'female'}) {
 const t=heightWorldCopy[locale],id=useId(),[query,setQuery]=useState('');
 const names=useMemo(()=>new Intl.DisplayNames([locale],{type:'region'}),[locale]);
 const f=(n:number)=>new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(n);
 const rows=compareWorldMeans(data.rows,cm,sex);
 const filtered=rows.filter(({row})=>`${names.of(row.country)} ${row.name} ${row.country}`.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale)));
 const near=rows.slice(0,5);
 return <section className="space-y-3 rounded-xl border border-border bg-card p-4" aria-labelledby={id+'title'}>
  <h2 id={id+'title'} className="text-xl font-bold">{t.title}</h2>
  <p className="text-sm font-medium">{t.scope}</p><p className="text-sm leading-relaxed text-muted-foreground">{t.limit}</p>
  {near.length>0&&<div className="rounded-lg border border-border p-3"><h3 className="mb-3 text-sm font-semibold">{t.near}</h3><ul className="space-y-3">{near.map(({row,mean,difference})=><li key={row.country}><div className="flex flex-wrap justify-between gap-1 text-sm"><span>{names.of(row.country)}</span><span className="tabular-nums">{f(mean)} cm · {difference>=0?'+':''}{f(difference)} cm</span></div><svg viewBox="0 0 200 12" className="mt-1 h-3 w-full" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="3" width="200" height="6" rx="3" className="fill-muted"/><rect x="0" y="3" width={mean-50} height="6" rx="3" className="fill-primary"/><line x1={cm-50} x2={cm-50} y1="0" y2="12" className="stroke-foreground" strokeWidth="1"/></svg></li>)}</ul><div className="flex justify-between text-xs text-muted-foreground"><span>50 cm</span><span>250 cm</span></div><p className="mt-2 text-xs text-muted-foreground">{t.marker} ({f(cm)} cm)</p></div>}
  <div><label htmlFor={id+'query'} className="mb-1 block text-sm font-medium">{t.search}</label><input id={id+'query'} value={query} onChange={e=>setQuery(e.target.value)} type="search" disabled={!ready} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2"/></div>
  <p role="status" className="text-sm text-muted-foreground">{filtered.length} / {data.rows.length}</p>
  <div className="max-h-96 overflow-auto rounded-lg border border-border" tabIndex={0} role="region" aria-label={t.title}><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-muted"><tr><th scope="col" className="p-2">{t.country}</th><th scope="col" className="p-2">{t.mean}</th><th scope="col" className="p-2">{t.difference}</th></tr></thead><tbody>{filtered.map(({row,mean,difference})=><tr key={row.country} className="border-t border-border"><th scope="row" className="p-2 font-medium">{names.of(row.country)}</th><td className="p-2 tabular-nums">{f(mean)} cm</td><td className="p-2 tabular-nums">{difference>=0?'+':''}{f(difference)} cm</td></tr>)}</tbody></table>{!filtered.length&&<p className="p-3 text-sm">{t.empty}</p>}</div>
  <p className="text-xs leading-relaxed text-muted-foreground">{t.source}: <a className="text-primary underline" href={data.url}>NCD-RisC · eLife 2016 · CC BY</a> · <a className="text-primary underline" href={data.dataUrls[0]}>Our World in Data ♂</a> · <a className="text-primary underline" href={data.dataUrls[1]}>Our World in Data ♀</a></p>
 </section>;
}
