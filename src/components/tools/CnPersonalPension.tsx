import { useState } from 'react';
import { CN_PENSION, cnPension } from '../../lib/country-finance-3';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const cny = (n: number) => '¥' + n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
export default function CnPersonalPension() {
  const [taxable, setTaxable] = useState('200000');
  const [amount, setAmount] = useState('12000');
  const r = cnPension(taxable, amount);
  return <div className="space-y-4" data-debt-worksheet="cn-pension">
    <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
      <label className="block text-sm">缴费前的全年综合所得应纳税所得额（元）<input inputMode="decimal" className={field} value={taxable} onChange={e => setTaxable(e.target.value)} /></label>
      <label className="block text-sm">本年个人养老金缴费（元，最多 {CN_PENSION.yearlyDeduction.toLocaleString('zh-CN')}）<input inputMode="decimal" className={field} value={amount} onChange={e => setAmount(e.target.value)} /></label>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {!r ? <p>请输入不小于 0 的数字。</p> : r.error ? <p>每年可扣除的上限是 12,000 元，超出部分不能税前扣除。</p> : <>
        <p className="text-xl font-bold">今年少缴个税 {cny(r.saving)}</p>
        <p className="mt-1 text-sm">适用税率 {Math.round(r.rate * 100)}% · 缴费前个税 {cny(r.before)} → 缴费后 {cny(r.after)}</p>
        <p className="mt-1 text-sm">将来领取这笔缴费时按 3% 缴税 {cny(r.withdrawalTax)}，净节税约 <strong>{cny(r.net)}</strong>。</p>
        {r.rate <= 0.03 && <p className="mt-2 text-sm">适用 3% 税率或无需缴税时，现在省下的税和将来领取时的 3% 基本相抵，资金还要锁定到退休。</p>}
      </>}
      <p className="mt-3 text-sm">这是按年度汇算口径的估算，不是你的个税APP结果。领取时的 3% 也适用于投资收益部分；这里只比较本金。</p>
    </section>
  </div>;
}
