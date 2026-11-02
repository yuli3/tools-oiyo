import { useState } from "react";
import { presaleSchedule, type InterestMode } from "../../lib/kr-presale-2026";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const eok = (n: number) => {
  const e = Math.floor(n / 100_000_000);
  const m = Math.round((n % 100_000_000) / 10_000);
  return e > 0 ? `${e}억${m ? ` ${m.toLocaleString("ko-KR")}만` : ""} 원` : `${m.toLocaleString("ko-KR")}만 원`;
};

type Split = "10-60-30" | "20-60-20" | "10-50-40";
const SPLITS: Record<Split, [number, number]> = { "10-60-30": [0.1, 0.6], "20-60-20": [0.2, 0.6], "10-50-40": [0.1, 0.5] };

export default function PresalePaymentCalculator() {
  const [priceMan, setPriceMan] = useState(60_000);
  const [split, setSplit] = useState<Split>("10-60-30");
  const [midCount, setMidCount] = useState(6);
  const [months, setMonths] = useState(35);
  const [mode, setMode] = useState<InterestMode>("deferred");
  const [ratePct, setRatePct] = useState(4.5);
  const [loanPct, setLoanPct] = useState(100);
  const [optionsMan, setOptionsMan] = useState(1_500);
  const [size, setSize] = useState<"le85" | "gt85">("le85");

  let r: ReturnType<typeof presaleSchedule> | null = null;
  try {
    r = presaleSchedule({
      price: priceMan * 10_000,
      depositRate: SPLITS[split][0],
      midRate: SPLITS[split][1],
      midCount,
      months,
      loanShare: loanPct / 100,
      loanRate: ratePct / 100,
      interestMode: mode,
      options: optionsMan * 10_000,
      over85: size === "gt85",
    });
  } catch {
    r = null;
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <NumberField label="분양가 (옵션 제외)" value={priceMan} onChange={setPriceMan} suffix="만 원" step={1_000} />
        <ChoiceChips
          legend="계약금·중도금·잔금 비율 (입주자모집공고 확인)"
          value={split}
          onChange={setSplit}
          options={[
            { value: "10-60-30", label: "10 / 60 / 30" },
            { value: "20-60-20", label: "20 / 60 / 20" },
            { value: "10-50-40", label: "10 / 50 / 40" },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="중도금 회차" value={midCount} onChange={setMidCount} suffix="회" step={1} />
          <NumberField label="계약부터 입주까지" value={months} onChange={setMonths} suffix="개월" step={1} />
        </div>
        <ChoiceChips
          legend="중도금 대출 이자"
          value={mode}
          onChange={setMode}
          options={[
            { value: "free", label: "무이자" },
            { value: "deferred", label: "이자후불제" },
            { value: "self", label: "유이자(매달 납부)" },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="중도금 대출 금리" value={ratePct} onChange={setRatePct} suffix="%" step={0.1} />
          <NumberField label="중도금 중 대출 비율" value={loanPct} onChange={setLoanPct} suffix="%" step={10} />
        </div>
        <NumberField label="발코니 확장·유상 옵션" value={optionsMan} onChange={setOptionsMan} suffix="만 원" step={100} />
        <ChoiceChips
          legend="전용면적"
          value={size}
          onChange={setSize}
          options={[
            { value: "le85", label: "85㎡ 이하" },
            { value: "gt85", label: "85㎡ 초과" },
          ]}
        />
      </div>

      <div aria-live="polite">
        {r === null ? (
          <p className="text-sm text-muted-foreground">회차는 0~12회, 입주까지 기간은 회차보다 길게, 대출 비율은 0~100%로 넣어 주세요.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card px-5 py-5">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">입주 전까지 내 돈</dt>
                <dd className="mt-1 font-mono text-2xl font-bold text-foreground">{eok(r.cashBeforeMoveIn)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">입주 때 필요한 돈</dt>
                <dd className="mt-1 font-mono text-2xl font-bold text-foreground">{eok(r.moveIn)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              입주 때는 이와 별도로 중도금 대출 {eok(r.loanToRefinance)}을 갚거나 잔금대출로 바꿔야 해요. 총비용(분양가·옵션·본인 부담 이자·취득세)은 {eok(r.totalCost)}이에요.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">회차</th>
                    <th className="py-2 pr-2 font-medium">시점</th>
                    <th className="py-2 pr-2 font-medium">금액</th>
                    <th className="py-2 font-medium">대출</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((row) => (
                    <tr key={row.label} className="border-t border-border text-foreground">
                      <td className="py-2 pr-2">{row.label}</td>
                      <td className="py-2 pr-2">{row.month === 0 ? "계약 시" : `${row.month}개월`}</td>
                      <td className="py-2 pr-2 font-mono">{eok(row.amount)}</td>
                      <td className="py-2 font-mono">{row.loan ? eok(row.loan) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ResultSteps
              steps={[
                `계약금 ${won(r.deposit)} · 중도금 ${won(r.midTotal)}(${midCount}회) · 잔금 ${won(r.balance)}`,
                `중도금 대출 ${won(r.loanTotal)}에 연 ${ratePct}%를 회차별로 입주까지 단리로 붙이면 ${won(r.rows.reduce((s, x) => s + x.interest, 0))}`,
                mode === "free"
                  ? "무이자라 시행사가 이자를 내요. 이자는 분양가에 이미 반영됐을 수 있어요."
                  : mode === "deferred"
                    ? `이자후불제라 이자 ${won(r.interestTotal)}을 입주(잔금) 때 한 번에 내요.`
                    : `유이자라 이자 ${won(r.interestTotal)}을 입주 전까지 매달 나눠 내요.`,
                `취득세·지방교육세·농특세(1주택, 분양가+옵션 기준) ${won(r.acquisition)}`,
                `입주 때 필요한 돈 = 잔금 ${won(r.balance)} + 옵션 ${won(optionsMan * 10_000)}${mode === "deferred" ? ` + 후불 이자 ${won(r.interestTotal)}` : ""} + 취득세 ${won(r.acquisition)} = ${won(r.moveIn)}`,
              ]}
              next={[
                { href: "/ko/dsr-calculator/", label: "잔금대출 한도(DSR)" },
                { href: "/ko/subscription-points-calculator/", label: "청약 가점 계산" },
                { href: "/ko/acquisition-tax-calculator/", label: "취득세 자세히" },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
