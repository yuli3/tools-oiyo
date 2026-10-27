import { useState } from "react";
import { depositInterest, type DepositKind } from "../../lib/kr-deposit";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";

type Lang = "ko" | "en";
type TaxKind = "normal" | "none" | "custom";

const T = {
  ko: {
    kind: "어떤 상품인가요?", deposit: "정기예금(목돈)", savings: "적금(매달 납입)",
    amountDeposit: "예금액", amountSavings: "월 납입액", rate: "연 이율", months: "기간", won: "원", monthsUnit: "개월",
    method: "이자 방식", simple: "단리", compound: "월복리",
    tax: "이자에 붙는 세금", normal: "일반과세 15.4%", none: "비과세 0%", custom: "직접 입력", customRate: "세율",
    total: "세후 받는 돈", principal: "원금", gross: "세전 이자", taxAmt: "세금", net: "세후 이자",
    invalid: "금액·이율·기간(1개월 이상, 정수)을 확인해 주세요.",
    how: "어떻게 계산했나요?",
    steps: (k: DepositKind, compound: boolean) => [
      k === "deposit"
        ? compound ? "월복리: 원금 × ((1 + 연이율 ÷ 12)^개월 − 1)" : "단리: 원금 × 연이율 × 개월 ÷ 12"
        : compound ? "적금 월복리: 매달 넣은 돈이 남은 개월 동안 월복리로 불어난 합계에서 원금을 뺐어요." : "적금 단리: 첫 달 납입금은 전 기간, 마지막 달 납입금은 1개월치 이자만 붙어요. 월 납입액 × n(n+1)/2 × 연이율 ÷ 12",
      "세금: 이자소득세 14%와 지방소득세 1.4%를 각각 10원 미만 버림으로 계산했어요.",
    ],
    notes: [
      "세금우대종합저축(9.5%)은 2019년 말 폐지돼 새로 가입할 수 없어요.",
      "농협·신협·새마을금고 조합 예탁금은 일정 한도까지 농어촌특별세 1.4%만 내요. 해당되면 '직접 입력'에 1.4를 넣으세요.",
      "ISA·청년도약계좌처럼 비과세 계좌 안의 예금은 비과세로 보세요.",
    ],
  },
  en: {
    kind: "Product", deposit: "Fixed deposit (lump sum)", savings: "Installment savings (monthly)",
    amountDeposit: "Deposit amount", amountSavings: "Monthly payment", rate: "Annual rate", months: "Term", won: "KRW", monthsUnit: "months",
    method: "Interest", simple: "Simple", compound: "Monthly compound",
    tax: "Tax on interest", normal: "Standard 15.4%", none: "Tax-free 0%", custom: "Custom", customRate: "Tax rate",
    total: "You receive (after tax)", principal: "Principal", gross: "Interest (gross)", taxAmt: "Tax", net: "Interest (net)",
    invalid: "Check the amount, rate and term (whole months, at least 1).",
    how: "How it's calculated",
    steps: (k: DepositKind, compound: boolean) => [
      k === "deposit"
        ? compound ? "Monthly compound: principal × ((1 + rate ÷ 12)^months − 1)" : "Simple: principal × rate × months ÷ 12"
        : compound ? "Savings, monthly compound: each payment grows for its remaining months; principal is subtracted from the total." : "Savings, simple: the first payment earns the full term, the last earns one month. Monthly × n(n+1)/2 × rate ÷ 12",
      "Tax: 14% income tax plus 1.4% local income tax, each rounded down to 10 KRW.",
    ],
    notes: [
      "The 9.5% preferential tax savings account was abolished at the end of 2019.",
      "Member deposits at Korean co-op banks (Nonghyup, Shinhyup, MG) pay only a 1.4% special rural tax up to a limit. Enter 1.4 under Custom if that applies.",
      "Deposits inside tax-free wrappers such as an ISA count as tax-free.",
    ],
  },
} as const;

export default function DepositCalculator({ locale = "ko" }: { locale?: Lang }) {
  const t = T[locale];
  const [kind, setKind] = useState<DepositKind>("deposit");
  const [amount, setAmount] = useState(10_000_000);
  const [ratePct, setRatePct] = useState(3.5);
  const [months, setMonths] = useState(12);
  const [method, setMethod] = useState<"simple" | "compound">("simple");
  const [taxKind, setTaxKind] = useState<TaxKind>("normal");
  const [customPct, setCustomPct] = useState(1.4);

  const taxRate = taxKind === "normal" ? 0.154 : taxKind === "none" ? 0 : customPct / 100;
  const r = depositInterest({ kind, amount, annualRate: ratePct / 100, months, compound: method === "compound", taxRate });
  const money = (n: number) => `${Math.round(n).toLocaleString(locale === "ko" ? "ko-KR" : "en-US")}${locale === "ko" ? "원" : " KRW"}`;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <ChoiceChips legend={t.kind} value={kind} options={[{ value: "deposit", label: t.deposit }, { value: "savings", label: t.savings }]} onChange={setKind} />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <NumberField label={kind === "deposit" ? t.amountDeposit : t.amountSavings} value={amount} onChange={setAmount} suffix={t.won} step={kind === "deposit" ? 1_000_000 : 100_000} />
        <NumberField label={t.rate} value={ratePct} onChange={setRatePct} suffix="%" step={0.1} />
        <NumberField label={t.months} value={months} onChange={setMonths} suffix={t.monthsUnit} step={1} min={1} />
      </div>
      <div className="mt-4 space-y-3">
        <ChoiceChips legend={t.method} value={method} options={[{ value: "simple", label: t.simple }, { value: "compound", label: t.compound }]} onChange={setMethod} />
        <ChoiceChips legend={t.tax} value={taxKind} options={[{ value: "normal", label: t.normal }, { value: "none", label: t.none }, { value: "custom", label: t.custom }]} onChange={setTaxKind} />
        {taxKind === "custom" && (
          <div className="max-w-xs">
            <NumberField label={t.customRate} value={customPct} onChange={setCustomPct} suffix="%" step={0.1} />
          </div>
        )}
      </div>

      <div aria-live="polite" className="mt-5">
        {r === null ? (
          <p className="text-sm text-muted-foreground">{t.invalid}</p>
        ) : (
          <div className="rounded-md border border-border bg-background px-4 py-4">
            <p className="text-sm text-muted-foreground">{t.total}</p>
            <p className="mt-1 font-mono text-3xl font-bold text-foreground">{money(r.total)}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                [t.principal, money(r.principal)],
                [t.gross, money(r.interest)],
                [t.taxAmt, `−${money(r.tax)}`],
                [t.net, money(r.afterTaxInterest)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-mono font-semibold text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <details open className="mt-4 rounded-md border border-border px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">{t.how}</summary>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                {t.steps(kind, method === "compound").map((s) => <li key={s}>{s}</li>)}
              </ol>
            </details>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
              {t.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
