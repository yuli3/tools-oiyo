import { useState, type CSSProperties } from 'react';
import { usageCostCopy } from '../../data/usage-cost-copy';
import type { Locale } from '../../lib/i18n';
import { compareUsageCosts, rankUsageCosts, type UsageInput } from '../../lib/usage-cost';

const field = 'min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-foreground';
const button = 'inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary';
const currencies = ['KRW','USD','JPY','CNY','EUR','GBP','SGD','TWD'] as const;

export default function UsageCostCalculator({ locale }: { locale: Locale }) {
  const c = usageCostCopy[locale];
  const example = (): UsageInput[] => c.exampleNames.map((name, i) => ({ name, cost: ['20','12','9'][i], hours: ['10','2','0'][i] }));
  const [form, setForm] = useState(() => ({ currency: 'USD', period: 0, items: example() }));
  const update = (index: number, key: keyof UsageInput, value: string) => setForm(previous => ({ ...previous, items: previous.items.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const rows = compareUsageCosts(form.items), ranked = rankUsageCosts(rows);
  const maximum = ranked[0]?.hourly ?? 0;
  const money = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: form.currency, maximumFractionDigits: 2 }).format(value);
  const label = (index: number) => form.items[index].name.trim() || `${c.entry} ${index + 1}`;
  return <div className="space-y-4" data-usage-cost>
    <p className="rounded-lg border border-border bg-muted p-3 text-sm leading-relaxed">{c.example}</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm font-medium">{c.period}<select className={field} value={form.period} onChange={event => setForm({ ...form, period: Number(event.target.value) })}>{c.periods.map((period,i) => <option key={period} value={i}>{period}</option>)}</select></label>
      <label className="grid gap-1 text-sm font-medium">{c.currency}<select className={field} value={form.currency} onChange={event => setForm({ ...form, currency: event.target.value })}>{currencies.map(currency => <option key={currency}>{currency}</option>)}</select></label>
    </div>
    <p className="text-sm leading-relaxed text-muted-foreground">{c.scope}</p>
    <div className="space-y-3">{rows.map((row,index) => <fieldset key={index} className="min-w-0 space-y-2 rounded-lg border border-border p-3">
      <legend className="px-1 text-sm font-semibold">{c.entry} {index + 1}</legend>
      <label className="grid gap-1 text-sm">{c.name}<input className={field} maxLength={80} value={row.name} onChange={event => update(index,'name',event.target.value)}/></label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">{c.cost} ({form.currency})<input className={field} type="number" min="0" step="any" inputMode="decimal" value={row.cost} aria-invalid={row.state === 'invalid'} aria-describedby={row.state === 'invalid' ? `usage-error-${index}` : undefined} onChange={event => update(index,'cost',event.target.value)}/></label>
        <label className="grid gap-1 text-sm">{c.hours}<input className={field} type="number" min="0" step="any" inputMode="decimal" value={row.hours} aria-invalid={row.state === 'invalid'} aria-describedby={row.state === 'invalid' ? `usage-error-${index}` : undefined} onChange={event => update(index,'hours',event.target.value)}/></label>
      </div>
      {row.state === 'invalid' && <p id={`usage-error-${index}`} className="text-sm text-destructive" role="alert">{c.invalid}</p>}
      <button type="button" className={button} aria-label={`${c.remove}: ${label(index)}`} onClick={() => setForm({ ...form, items: form.items.filter((_,i) => i !== index) })}>{c.remove}</button>
    </fieldset>)}</div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className={button} onClick={() => setForm({ ...form, items: [...form.items, {name:'',cost:'',hours:''}] })}>{c.add}</button>
      <button type="button" className={button} onClick={() => setForm({ ...form, items: example() })}>{c.reset}</button>
    </div>
    <section className="space-y-3 border-t border-border pt-4" aria-labelledby="usage-results">
      <h2 id="usage-results" className="text-lg font-semibold">{c.result} · {c.periods[form.period]} · {form.currency}</h2>
      <h3 className="font-medium">{c.chart}</h3>
      {ranked.length === 0 && <p className="text-sm">{c.empty}</p>}
      <ul className="space-y-3">{ranked.map(row => <li key={row.index} className="space-y-1">
        <div className="flex flex-wrap justify-between gap-1 text-sm"><span className="min-w-0 break-words">{label(row.index)}</span><span className="min-w-0 break-all font-semibold">{money(row.hourly!)} · {c.hourly}</span></div>
        <div className="h-3 overflow-hidden rounded bg-muted" aria-hidden="true"><div className="h-full w-(--usage-bar-width) bg-primary" style={{'--usage-bar-width':`${maximum > 0 ? row.hourly! / maximum * 100 : 0}%`} as CSSProperties}/></div>
      </li>)}</ul>
      {rows.some(row => row.state === 'unused') && <section className="space-y-2 rounded-lg border border-border bg-muted p-3">
        <h3 className="font-medium">{c.unused}</h3>
        <p className="text-sm leading-relaxed">{c.unusedNote}</p>
        <ul className="space-y-1 text-sm">{rows.filter(row => row.state === 'unused').map(row => <li key={row.index} className="break-all">{label(row.index)}: {money(row.amount!)}</li>)}</ul>
      </section>}
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={c.result}>
        <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
          <caption className="py-2 text-left text-muted-foreground">{c.unusedNote}</caption>
          <thead><tr>{[c.name,c.cost,c.hours,c.hourly].map(heading => <th key={heading} scope="col" className="break-words border-b border-border p-1 font-semibold">{heading}</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.index}>
            <th scope="row" className="break-words border-b border-border p-1 font-medium">{label(row.index)}</th>
            <td className="break-words border-b border-border p-1">{row.amount === null ? '—' : money(row.amount)}</td>
            <td className="break-words border-b border-border p-1">{row.hours.trim() === '' || row.state === 'invalid' ? '—' : new Intl.NumberFormat(locale).format(Number(row.hours))}</td>
            <td className="break-words border-b border-border p-1">{row.state === 'ready' ? money(row.hourly!) : row.state === 'unused' ? c.unused : row.state === 'pending' ? c.pending : c.invalid}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  </div>;
}
