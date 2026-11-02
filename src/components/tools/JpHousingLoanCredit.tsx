import { useState } from "react";
import { jpHousingLoanCredit } from "../../lib/country-finance-5";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

export default function JpHousingLoanCredit() {
  const [loan, setLoan] = useState("40000000");
  const [rate, setRate] = useState("0.8");
  const [term, setTerm] = useState("35");
  const [limit, setLimit] = useState("30000000");
  const [years, setYears] = useState<"13" | "10">("13");
  const [incomeTax, setIncomeTax] = useState("150000");
  const [residentCap, setResidentCap] = useState("97500");
  let r: ReturnType<typeof jpHousingLoanCredit> | null = null;
  try {
    r = jpHousingLoanCredit({ loan: num(loan), annualRatePct: num(rate), termYears: num(term), borrowingLimit: num(limit), creditYears: years === "13" ? 13 : 10, incomeTax: num(incomeTax), residentTaxCap: num(residentCap) });
  } catch {
    r = null;
  }
  const rows: [string, string, (v: string) => void][] = [
    ["借入額（円）", loan, setLoan],
    ["金利（年%、固定として計算）", rate, setRate],
    ["返済期間（年）", term, setTerm],
    ["借入限度額（円、国税庁No.1211-1の表から）", limit, setLimit],
    ["1年間の所得税額の見込み（円）", incomeTax, setIncomeTax],
    ["住民税から引ける上限（円、課税総所得金額等×5%、最大97,500円）", residentCap, setResidentCap],
  ];
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        {rows.map(([label, value, set]) => (
          <label key={label} className="block text-sm">{label}<input inputMode="decimal" className={field} value={value} onChange={(e) => set(e.target.value)} /></label>
        ))}
        <label className="block text-sm">控除期間
          <select className={field} value={years} onChange={(e) => setYears(e.target.value as "13" | "10")}>
            <option value="13">13年</option>
            <option value="10">10年</option>
          </select>
        </label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? (
          <p>0以上の金額、0〜20%の金利、1〜50年の返済期間を入力してください。</p>
        ) : (
          <>
            <p className="text-xl font-bold">控除額の合計 {yen(r.totalCredit)}（実際に税金から引ける額 {yen(r.totalUsed)}）</p>
            <p className="mt-1 text-sm">毎月の返済額 {yen(r.payment)}{r.totalUnused > 0 ? `・税額が足りず使えない分 ${yen(r.totalUnused)}` : ""}</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-96 text-sm">
                <thead><tr className="text-left"><th className="py-1">年</th><th>年末残高</th><th>控除額</th><th>所得税から</th><th>住民税から</th></tr></thead>
                <tbody>
                  {r.rows.map((x) => (
                    <tr key={x.year} className="border-t border-border"><td className="py-1">{x.year}</td><td>{yen(x.yearEndBalance)}</td><td>{yen(x.credit)}</td><td>{yen(x.fromIncomeTax)}</td><td>{yen(x.fromResidentTax)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="mt-3 text-sm">1月から返済を始めた元利均等返済として年末残高を計算しています。実際の年末残高は金融機関の残高証明書の額です。</p>
      </section>
    </div>
  );
}
