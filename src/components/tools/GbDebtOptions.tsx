import { useMemo, useState } from 'react';
import { GB_BANKRUPTCY_FEE, GB_DRO, gbDroCheck } from '../../lib/debt-relief';

/* 🇬🇧 England & Wales: DRO, IVA or bankruptcy (W5, 2026-10-27). Limits from gov.uk as checked
 * on 2026-10-27. A guide, not a decision. Nothing entered is stored or sent. */

const ROWS = [
  ['debt', 'Total debts', `under £${GB_DRO.debt.toLocaleString('en-GB')}`],
  ['surplus', 'Spare income after essential costs (per month)', `under £${GB_DRO.surplus}`],
  ['assets', 'Assets (savings, valuables), not counting a vehicle', `under £${GB_DRO.assets.toLocaleString('en-GB')}`],
  ['vehicle', 'Vehicle value (0 if none)', `under £${GB_DRO.vehicle.toLocaleString('en-GB')}`],
] as const;

export default function GbDebtOptions() {
  const [v, setV] = useState<Record<string, string>>({ debt: '', surplus: '', assets: '', vehicle: '' });
  const [ew, setEw] = useState(true);
  const n = (s: string) => Number.parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
  const r = useMemo(() => gbDroCheck({ debt: n(v.debt), surplus: n(v.surplus), assets: n(v.assets), vehicle: n(v.vehicle), livedOrWorkedEW: ew }), [v, ew]);
  const ready = v.debt !== '';
  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';

  return (
    <div className="space-y-4">
      <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold">🇬🇧 England &amp; Wales</span>
      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-base font-bold">Debt Relief Order check</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROWS.map(([k, label]) => (
            <label key={k} className="block text-sm font-medium">{label} (£)
              <input inputMode="decimal" className={field} value={v[k]} onChange={(e) => setV((p) => ({ ...p, [k]: e.target.value }))} />
            </label>
          ))}
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="size-5" checked={ew} onChange={(e) => setEw(e.target.checked)} />
          I have lived or worked in England or Wales in the last 3 years
        </label>
      </section>
      {ready && (
        <section className={`rounded-2xl border p-4 ${r.eligible ? 'border-primary bg-background' : 'border-border bg-muted'}`} aria-live="polite">
          <p className="text-lg font-extrabold">{r.eligible ? 'A DRO looks possible' : 'A DRO does not fit these numbers'}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {ROWS.map(([k, label, limit]) => <li key={k}>{r.checks[k] ? '✅' : '❌'} {label}: {limit}</li>)}
            <li>{r.checks.residence ? '✅' : '❌'} Lived or worked in England or Wales within 3 years</li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            {r.eligible
              ? 'A DRO is free, lasts 12 months and stops payments and interest on the debts it covers. You apply through an approved debt adviser.'
              : `Compare the two other routes below: bankruptcy (£${GB_BANKRUPTCY_FEE} to apply online) or an IVA through an insolvency practitioner.`}
          </p>
        </section>
      )}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm"><p className="font-bold">DRO</p><p className="mt-1 text-muted-foreground">Small debts, little spare income and few assets. Free, through an approved adviser. 12 months.</p></div>
        <div className="rounded-2xl border border-border bg-card p-4 text-sm"><p className="font-bold">IVA</p><p className="mt-1 text-muted-foreground">A formal deal set up by an insolvency practitioner. Starts if creditors owed 75% of the debt agree. Set-up and handling fees.</p></div>
        <div className="rounded-2xl border border-border bg-card p-4 text-sm"><p className="font-bold">Bankruptcy</p><p className="mt-1 text-muted-foreground">£{GB_BANKRUPTCY_FEE} to apply. Usually ends after 12 months; income payments can last up to 3 years. Assets may be sold.</p></div>
      </section>
    </div>
  );
}
