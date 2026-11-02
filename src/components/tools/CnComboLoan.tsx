import { useState } from "react";
import { cnComboLoan, CN_EXAMPLE_RATES, type CnMethod } from "../../lib/country-finance-5";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const cny = (n: number) => `${Math.round(n).toLocaleString("zh-CN")} 元`;
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

export default function CnComboLoan() {
  const [fund, setFund] = useState("1000000");
  const [fundRate, setFundRate] = useState(String(CN_EXAMPLE_RATES.providentFundPct));
  const [commercial, setCommercial] = useState("1000000");
  const [commercialRate, setCommercialRate] = useState(String(CN_EXAMPLE_RATES.lpr5yPct));
  const [years, setYears] = useState("30");
  const [method, setMethod] = useState<CnMethod>("annuity");
  let r: ReturnType<typeof cnComboLoan> | null = null;
  try {
    r = cnComboLoan({ fundAmount: num(fund), fundRatePct: num(fundRate), commercialAmount: num(commercial), commercialRatePct: num(commercialRate), years: num(years), method });
  } catch {
    r = null;
  }
  const rows: [string, string, (v: string) => void][] = [
    ["公积金贷款金额（元）", fund, setFund],
    ["公积金贷款年利率（%）", fundRate, setFundRate],
    ["商业贷款金额（元）", commercial, setCommercial],
    ["商业贷款年利率（%，LPR+加点）", commercialRate, setCommercialRate],
    ["贷款年限（年）", years, setYears],
  ];
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        {rows.map(([label, value, set]) => (
          <label key={label} className="block text-sm">{label}<input inputMode="decimal" className={field} value={value} onChange={(e) => set(e.target.value)} /></label>
        ))}
        <label className="block text-sm">还款方式
          <select className={field} value={method} onChange={(e) => setMethod(e.target.value as CnMethod)}>
            <option value="annuity">等额本息（每月相同）</option>
            <option value="equalPrincipal">等额本金（逐月递减）</option>
          </select>
        </label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? (
          <p>请输入0以上的金额、0–30%的利率和1–30年的年限。</p>
        ) : (
          <>
            <p className="text-xl font-bold">{method === "annuity" ? `每月还款 ${cny(r.firstMonth)}` : `首月还款 ${cny(r.firstMonth)}，末月 ${cny(r.lastMonth)}`}</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>公积金部分首月 {cny(r.fund.firstMonth)}，总利息 {cny(r.fund.totalInterest)}</li>
              <li>商业贷款部分首月 {cny(r.commercial.firstMonth)}，总利息 {cny(r.commercial.totalInterest)}</li>
              <li>组合贷总利息 {cny(r.totalInterest)}，比全部用商业贷款少付 {cny(r.savedVsAllCommercial)}</li>
            </ul>
          </>
        )}
        <p className="mt-3 text-sm">默认利率是{CN_EXAMPLE_RATES.asOf}起的示例（公积金5年以上首套、5年期LPR），请按借款合同和当地公积金中心的额度规定填写。</p>
      </section>
    </div>
  );
}
