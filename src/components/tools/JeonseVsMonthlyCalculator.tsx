import { useState, type CSSProperties } from "react";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";

import { housingCost } from "../../lib/jeonse-cost";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export default function JeonseVsMonthlyCalculator() {
  // Jeonse state
  const [jeonseDepMan, setJeonseDepMan] = useState(30000); // 3억
  const [jeonseLoanRatio, setJeonseLoanRatio] = useState<"0" | "50" | "70" | "80">("70");
  const [loanRate, setLoanRate] = useState(3.8); // 3.8%
  const [savingsRate, setSavingsRate] = useState(3.2); // 3.2%

  // Monthly Rent state
  const [rentDepMan, setRentDepMan] = useState(3000); // 3천만
  const [monthlyRentMan, setMonthlyRentMan] = useState(100); // 100만
  const [applyTaxCredit, setApplyTaxCredit] = useState<"17" | "15" | "no">("no");
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);

  const jeonseDeposit = jeonseDepMan * 10000;
  const rentDeposit = rentDepMan * 10000;
  const monthlyRent = monthlyRentMan * 10000;

  const creditRate = applyTaxCredit === "17" ? 0.17 : applyTaxCredit === "15" ? 0.15 : 0;
  let calculated: ReturnType<typeof housingCost> | null = null;
  try { calculated = housingCost({ jeonse: jeonseDeposit, rentDeposit, monthlyRent, loanRatio: Number(jeonseLoanRatio) / 100, loanRate, savingsRate, creditRate, confirmed: eligibilityConfirmed }); } catch { /* WHY 2026-11-01: invalid input must hide results, never display a fabricated zero. */ }
  const monthlyLoanInterest = calculated?.loanInterest ?? 0;
  const monthlyEquityOppCost = calculated?.equityCost ?? 0;
  const totalJeonseMonthlyCost = calculated?.jeonseCost ?? 0;
  const monthlyRentEquityOppCost = calculated?.rentEquityCost ?? 0;
  const monthlyTaxCredit = calculated?.credit ?? 0;
  const totalRentMonthlyCost = calculated?.rentCost ?? 0;
  // Comparison
  const diffMonthly = Math.abs(totalJeonseMonthlyCost - totalRentMonthlyCost);
  const diffYearly = diffMonthly * 12;
  const isJeonseCheaper = totalJeonseMonthlyCost < totalRentMonthlyCost;

  // Implied jeonse conversion rate
  const depositDiff = jeonseDeposit - rentDeposit;
  const impliedConversionRate = depositDiff > 0 ? (monthlyRent * 12 / depositDiff) * 100 : 0;


  const displayWon = (n: number) => calculated ? won(n) : "—";
  return (
    <div className="space-y-6">
      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jeonse Section */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>🏠 전세 조건</span>
            </h3>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
              보증금 {displayWon(jeonseDeposit)}
            </span>
          </div>

          <NumberField
            label="전세 보증금"
            value={jeonseDepMan}
            onChange={setJeonseDepMan}
            suffix="만원"
            step={1000}
            min={1000}
          />

          <ChoiceChips
            legend="전세대출 비율"
            value={jeonseLoanRatio}
            options={[
              { value: "0", label: "0% (전액 자기자본)" },
              { value: "50", label: "50% 대출" },
              { value: "70", label: "70% 대출" },
              { value: "80", label: "80% 대출" },
            ]}
            onChange={setJeonseLoanRatio}
          />

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="전세대출 금리"
              value={loanRate}
              onChange={setLoanRate}
              suffix="%"
              step={0.1}
              min={0.1}
            />
            <NumberField
              label="예금 기회비용 금리"
              value={savingsRate}
              onChange={setSavingsRate}
              suffix="%"
              step={0.1}
              min={0.1}
            />
          </div>

          <div className="rounded-xl bg-muted/30 p-3 text-xs space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>대출 이자 부담</span>
              <span className="font-semibold text-foreground">{displayWon(monthlyLoanInterest)} /월</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>자기자본 기회비용</span>
              <span className="font-semibold text-foreground">{displayWon(monthlyEquityOppCost)} /월</span>
            </div>
            <div className="flex justify-between text-primary font-bold border-t border-border pt-1 mt-1">
              <span>전세 월 실질 주거비</span>
              <span>{displayWon(totalJeonseMonthlyCost)} /월</span>
            </div>
          </div>
        </div>

        {/* Monthly Rent Section */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>🏢 월세 조건</span>
            </h3>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
              보증금 {displayWon(rentDeposit)} / 월 {displayWon(monthlyRent)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="월세 보증금"
              value={rentDepMan}
              onChange={setRentDepMan}
              suffix="만원"
              step={500}
              min={0}
            />
            <NumberField
              label="월세액 (관리비 제외)"
              value={monthlyRentMan}
              onChange={setMonthlyRentMan}
              suffix="만원"
              step={5}
              min={5}
            />
          </div>

          <ChoiceChips
            legend="월세 세액공제 시나리오 (한국 세법)"
            value={applyTaxCredit}
            options={[
              { value: "17", label: "총급여 5,500만 이하 (17%)" },
              { value: "15", label: "5,500만 초과~8,000만 (15%)" },
              { value: "no", label: "미확인·반영하지 않기" },
            ]}
            onChange={setApplyTaxCredit}
          />

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={eligibilityConfirmed} onChange={(e) => setEligibilityConfirmed(e.target.checked)} className="mt-1" />
            무주택·소득(종합소득 포함)·주택 요건·계약 및 전입·증빙·배우자 합산 한도를 확인했어요. 선택한 공제율은 예상 시나리오이며 실제 환급액이 아니에요.
          </label>
          <p className="text-xs text-muted-foreground">자격 확인 전 공제는 0원이에요. 연 대상 월세 한도 1,000만 원, 17% 가정 시 예상 공제 상한 170만 원이에요. 결정세액 등에 따라 실제 혜택은 줄어들 수 있어요.</p>
          <div className="rounded-xl bg-muted/30 p-3 text-xs space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>월세 납부액</span>
              <span className="font-semibold text-foreground">{displayWon(monthlyRent)} /월</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>보증금 기회비용</span>
              <span className="font-semibold text-foreground">{displayWon(monthlyRentEquityOppCost)} /월</span>
            </div>
            {eligibilityConfirmed && applyTaxCredit !== "no" && (
              <div className="flex justify-between text-success font-semibold">
                <span>예상 공제의 월 환산액</span>
                <span>-{displayWon(monthlyTaxCredit)} /월</span>
              </div>
            )}
            <div className="flex justify-between text-primary font-bold border-t border-border pt-1 mt-1">
              <span>월세 실질 주거비</span>
              <span>{displayWon(totalRentMonthlyCost)} /월</span>
            </div>
          </div>
        </div>
      </div>

      {!calculated && <p role="alert" className="text-destructive">금액·대출비율·금리를 확인해 주세요. 유효한 입력 전에는 비교 결과를 표시하지 않아요.</p>}
      {calculated && <section aria-label="월 주거비 구성 비교" className="rounded-lg border border-border p-4 space-y-2">
        <h3 className="font-semibold">월 주거비 구성</h3>
        <p className="text-xs text-muted-foreground">막대는 공제 전 비용이에요. 공제는 아래에서 별도로 차감해요.</p>
        {[{name:"전세", parts:[{name:"대출 이자",value:monthlyLoanInterest},{name:"자기자본 기회비용",value:monthlyEquityOppCost}]},{name:"월세",parts:[{name:"월세",value:monthlyRent},{name:"보증금 기회비용",value:monthlyRentEquityOppCost}]}].map(row=><div key={row.name}>
          <p className="text-sm">{row.name}: {row.parts.map(p=>`${p.name} ${displayWon(p.value)}`).join(" + ")}</p>
          <div aria-hidden="true" className="flex h-3 overflow-hidden rounded bg-muted">{row.parts.map((p,i)=><span key={p.name} className={`w-(--cost-width) ${i===0?"bg-primary":"bg-primary/40"}`} style={{"--cost-width":`${p.value/Math.max(totalJeonseMonthlyCost,monthlyRent+monthlyRentEquityOppCost,1)*100}%`} as CSSProperties} />)}</div>
        </div>)}
        <p className="text-sm">월세 예상 공제 차감: {displayWon(monthlyTaxCredit)} /월</p>
      </section>}
      {/* Comparison Result Banner */}
      {calculated && (
      <div className="rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm space-y-4">
        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase">
              입력한 가정의 비용 비교
            </span>
            <div className="text-2xl sm:text-3xl font-black text-primary mt-1">
              {diffMonthly < 0.5 ? "두 비용이 같아요" : isJeonseCheaper ? "전세 비용이 더 낮아요" : "월세 비용이 더 낮아요"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              매월 약 <strong className="text-foreground">{displayWon(diffMonthly)}</strong> (연간 약{" "}
              <strong className="text-foreground">{displayWon(diffYearly)}</strong>) 절약됩니다.
            </p>
          </div>

          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground block">
              이 매물의 실질 전월세전환율
            </span>
            <span className="text-xl font-black text-primary">
              {depositDiff > 0 ? `${impliedConversionRate.toFixed(2)}%` : "산출 불가"}
            </span>
            <span className="text-xs text-muted-foreground block mt-0.5">
              (보증금 차이가 양수인 경우의 단순 환산)
            </span>
          </div>
        </div>

        {/* Financial Insight */}
        <div className="border-t border-border pt-4 text-xs text-muted-foreground space-y-1">
          <p>전환율과 대출금리만으로 유불리를 확정할 수 없어요. 자기자본 기회비용과 공제 조건을 함께 비교해요. 법정 전환상한은 기존 보증금을 월차임으로 전환하는 경우의 별도 규칙이에요.</p>
          <p>
            보증금 반환 위험·보증료·관리비·이사비도 따로 확인해요. 계산 결과가 계약 안전성을 판단하지는 않아요.
          </p>
        </div>
      </div>
      )}
    </div>
  );
}
