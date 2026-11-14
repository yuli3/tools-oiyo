import { useState } from "react";
import { dcfSensitivity, dcfValuation, wacc as computeWacc } from "../../../lib/kr-advisory-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import { eok, pct, won } from "./fmt";

type Mode = "direct" | "build";
const MODES = [
  { value: "build", label: "CAPM으로 WACC 계산" },
  { value: "direct", label: "WACC 직접 입력" },
] as const satisfies readonly { value: Mode; label: string }[];
type Timing = "end" | "mid";
const TIMING = [
  { value: "end", label: "기말 할인" },
  { value: "mid", label: "기중 할인" },
] as const satisfies readonly { value: Timing; label: string }[];

export default function DcfValuation() {
  const [revenue0, setRevenue0] = useState(10_000_000_000);
  const [growth, setGrowth] = useState(10);
  const [margin, setMargin] = useState(12);
  const [tax, setTax] = useState(22);
  const [da, setDa] = useState(3);
  const [capex, setCapex] = useState(4);
  const [nwc, setNwc] = useState(15);
  const [tg, setTg] = useState(2);
  const [netDebt, setNetDebt] = useState(2_000_000_000);
  const [shares, setShares] = useState(1_000_000);
  const [mode, setMode] = useState<Mode>("build");
  const [direct, setDirect] = useState(10);
  const [rf, setRf] = useState(3);
  const [beta, setBeta] = useState(1.1);
  const [mrp, setMrp] = useState(6);
  const [size, setSize] = useState(3);
  const [kd, setKd] = useState(5.5);
  const [dw, setDw] = useState(30);
  const [timing, setTiming] = useState<Timing>("end");

  const w = computeWacc({ riskFree: rf / 100, beta, marketPremium: mrp / 100, sizePremium: size / 100, preTaxCostOfDebt: kd / 100, taxRate: tax / 100, debtWeight: dw / 100 });
  const rate = mode === "build" ? w.wacc : direct / 100;
  const input = {
    revenue0, growth: growth / 100, ebitMargin: margin / 100, taxRate: tax / 100, daRatio: da / 100, capexRatio: capex / 100,
    nwcRatio: nwc / 100, wacc: rate, terminalGrowth: tg / 100, netDebt, shares, years: 5, midYear: timing === "mid",
  };
  const r = dcfValuation(input);
  const sens = dcfSensitivity(input);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="직전 연도 매출" value={revenue0} onChange={setRevenue0} suffix="원" step={100_000_000} />
        <NumberField label="1년차 매출성장률(5년차에 영구성장률로 수렴)" value={growth} onChange={setGrowth} suffix="%" step={0.5} min={-100} />
        <NumberField label="영업이익률(EBIT)" value={margin} onChange={setMargin} suffix="%" step={0.5} min={-100} />
        <NumberField label="유효 법인세율(지방세 포함)" value={tax} onChange={setTax} suffix="%" step={0.1} />
        <NumberField label="감가상각비 / 매출" value={da} onChange={setDa} suffix="%" step={0.5} />
        <NumberField label="자본적 지출 / 매출" value={capex} onChange={setCapex} suffix="%" step={0.5} />
        <NumberField label="순운전자본 / 매출 증가분" value={nwc} onChange={setNwc} suffix="%" step={1} min={-100} />
        <NumberField label="영구성장률" value={tg} onChange={setTg} suffix="%" step={0.1} min={-5} />
        <NumberField label="순차입금(차입금 − 현금)" value={netDebt} onChange={setNetDebt} suffix="원" step={100_000_000} min={-1e14} />
        <NumberField label="발행주식수" value={shares} onChange={setShares} suffix="주" step={10_000} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ChoiceChips legend="할인율" value={mode} options={MODES} onChange={setMode} />
        <ChoiceChips legend="현금흐름 시점" value={timing} options={TIMING} onChange={setTiming} />
      </div>
      {mode === "direct" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2"><NumberField label="WACC" value={direct} onChange={setDirect} suffix="%" step={0.1} /></div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <NumberField label="무위험이자율(국고채)" value={rf} onChange={setRf} suffix="%" step={0.1} />
          <NumberField label="베타" value={beta} onChange={setBeta} step={0.05} />
          <NumberField label="시장위험프리미엄" value={mrp} onChange={setMrp} suffix="%" step={0.1} />
          <NumberField label="규모·비상장 프리미엄" value={size} onChange={setSize} suffix="%" step={0.5} />
          <NumberField label="세전 타인자본비용" value={kd} onChange={setKd} suffix="%" step={0.1} />
          <NumberField label="부채 비중 D/(D+E)" value={dw} onChange={setDw} suffix="%" step={5} />
        </div>
      )}

      <div aria-live="polite" className="mt-5 rounded-md border border-border bg-background px-4 py-4">
        {!r.valid ? (
          <p className="text-sm font-semibold text-foreground">WACC({pct(rate)})가 영구성장률보다 커야 계산할 수 있어요.</p>
        ) : (
          <>
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-muted-foreground">기업가치(EV)</dt><dd className="font-mono text-xl font-bold text-foreground">{eok(r.enterprise)}</dd></div>
              <div><dt className="text-muted-foreground">주주가치</dt><dd className="font-mono text-xl font-bold text-foreground">{eok(r.equity)}</dd></div>
              <div><dt className="text-muted-foreground">1주당 가치</dt><dd className="font-mono text-xl font-bold text-primary">{won(r.perShare)}</dd></div>
            </dl>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-130 text-right font-mono text-xs">
                <thead className="text-muted-foreground"><tr><th className="text-left">연도</th><th>성장률</th><th>매출</th><th>NOPAT</th><th>FCFF</th><th>현재가치</th></tr></thead>
                <tbody>
                  {r.rows.map((row) => (
                    <tr key={row.year} className="border-t border-border"><td className="text-left">{row.year}년차</td><td>{pct(row.growth)}</td><td>{eok(row.revenue)}</td><td>{eok(row.nopat)}</td><td>{eok(row.fcff)}</td><td>{eok(row.pv)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">1주당 가치 민감도 (행 WACC, 열 영구성장률)</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-90 text-right font-mono text-xs">
                <thead className="text-muted-foreground"><tr><th className="text-left">WACC</th>{sens[0].values.map((v) => <th key={v.growth}>{pct(v.growth)}</th>)}</tr></thead>
                <tbody>
                  {sens.map((row) => (
                    <tr key={row.wacc} className="border-t border-border"><td className="text-left">{pct(row.wacc)}</td>{row.values.map((v) => <td key={v.growth}>{won(v.perShare)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <ResultSteps
          steps={[
            mode === "build" ? `자기자본비용 = ${pct(rf / 100)} + ${beta} × ${pct(mrp / 100)} + ${pct(size / 100)} = ${pct(w.costOfEquity)}, 세후 타인자본비용 ${pct(w.afterTaxDebt)} → WACC ${pct(w.wacc, 2)}` : `WACC ${pct(rate, 2)} 직접 입력`,
            "FCFF = EBIT × (1 − 세율) + 감가상각비 − 자본적 지출 − 순운전자본 증가",
            `5년 현금흐름 현재가치 합 ${eok(r.pvSum)} + 잔존가치 현재가치 ${eok(r.terminalPv)} (EV의 ${pct(r.terminalShare || 0)})`,
            `주주가치 = EV − 순차입금 ${eok(netDebt)}. 비영업자산·소수지분·스톡옵션은 따로 조정해야 해요.`,
            "세법상 비상장주식 평가는 DCF가 아니라 보충적 평가(순손익·순자산 가중)가 원칙이에요. 평가심의위원회 심의 때 DCF를 쓸 수 있어요(시행령 제54조 제6항).",
          ]}
          next={[
            { href: "/ko/unlisted-share-valuation-calculator/", label: "상증법 비상장주식 평가" },
            { href: "/ko/present-value-calculator/", label: "현재가치 계산" },
          ]}
        />
      </div>
    </div>
  );
}
