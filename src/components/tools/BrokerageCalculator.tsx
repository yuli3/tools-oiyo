import { useState } from "react";
import { brokerageFee, leaseBase } from "../../lib/kr-brokerage-fee";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";

type Lang = "ko" | "en";
type Kind = "sale" | "lease";

const T = {
  ko: {
    kind: "어떤 거래인가요?", sale: "매매·교환", lease: "전세·월세",
    price: "매매가", deposit: "보증금", rent: "월세(없으면 0)", won: "원",
    result: "중개보수 상한", vat: (v: string) => `부가세 10% 별도(일반과세 중개사무소면 ${v} 추가)`,
    base: "거래금액", rate: "상한 요율", cap: "한도",
    noCap: "없음",
    how: "어떻게 계산했나요?",
    steps: (kind: Kind, rent: number) => [
      kind === "lease" && rent > 0 ? "월세 거래금액 = 보증금 + 월세 × 100. 이 값이 5천만 원 미만이면 보증금 + 월세 × 70으로 다시 계산해요." : kind === "lease" ? "전세는 보증금이 거래금액이에요." : "매매는 매매가가 거래금액이에요.",
      "거래금액 × 상한 요율을 구하고, 한도가 있는 구간이면 한도와 비교해 작은 값을 써요(원 미만 버림).",
      "상한이에요. 실제 보수는 이 범위 안에서 중개사와 협의해 정해요.",
    ],
    notes: ["주택 기준(공인중개사법 시행규칙 별표1, 2021년 10월 개정)이에요. 오피스텔·상가·토지는 요율이 달라요.", "시·도 조례에 따라 조금 다를 수 있어요."],
  },
  en: {
    kind: "Transaction", sale: "Sale", lease: "Jeonse / monthly rent",
    price: "Sale price", deposit: "Deposit", rent: "Monthly rent (0 if none)", won: "KRW",
    result: "Maximum brokerage fee", vat: (v: string) => `Plus 10% VAT if the agency charges it (${v})`,
    base: "Transaction value", rate: "Cap rate", cap: "Fee ceiling",
    noCap: "None",
    how: "How it's calculated",
    steps: (kind: Kind, rent: number) => [
      kind === "lease" && rent > 0 ? "Monthly-rent value = deposit + rent × 100. If that is under KRW 50M, it becomes deposit + rent × 70." : kind === "lease" ? "For jeonse the deposit is the transaction value." : "For a sale the price is the transaction value.",
      "Value × cap rate, limited by the fee ceiling where the bracket has one (rounded down to the won).",
      "This is the legal maximum; the actual fee is negotiated within it.",
    ],
    notes: ["Housing rates under Korea's Licensed Real Estate Agents Act (Oct 2021 table). Officetels, shops and land use different rates.", "Provincial ordinances can differ slightly."],
  },
} as const;

export default function BrokerageCalculator({ locale = "ko" }: { locale?: Lang }) {
  const t = T[locale];
  const [kind, setKind] = useState<Kind>("sale");
  const [price, setPrice] = useState(900_000_000);
  const [deposit, setDeposit] = useState(50_000_000);
  const [rent, setRent] = useState(1_000_000);

  const base = kind === "sale" ? price : leaseBase(deposit, rent);
  const r = brokerageFee(kind, base);
  const money = (n: number) => `${Math.round(n).toLocaleString(locale === "ko" ? "ko-KR" : "en-US")}${locale === "ko" ? "원" : " KRW"}`;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <ChoiceChips legend={t.kind} value={kind} options={[{ value: "sale", label: t.sale }, { value: "lease", label: t.lease }]} onChange={setKind} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {kind === "sale" ? (
          <NumberField label={t.price} value={price} onChange={setPrice} suffix={t.won} step={10_000_000} />
        ) : (
          <>
            <NumberField label={t.deposit} value={deposit} onChange={setDeposit} suffix={t.won} step={10_000_000} />
            <NumberField label={t.rent} value={rent} onChange={setRent} suffix={t.won} step={50_000} />
          </>
        )}
      </div>
      <div aria-live="polite" className="mt-5 rounded-md border border-border bg-background px-4 py-4">
        <p className="text-sm text-muted-foreground">{t.result}</p>
        <p className="mt-1 font-mono text-3xl font-bold text-foreground">{money(r.fee)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t.vat(money(r.vat))}</p>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div><dt className="text-muted-foreground">{t.base}</dt><dd className="font-mono font-semibold text-foreground">{money(base)}</dd></div>
          <div><dt className="text-muted-foreground">{t.rate}</dt><dd className="font-mono font-semibold text-foreground">{Number((r.rate * 100).toFixed(2))}%</dd></div>
          <div><dt className="text-muted-foreground">{t.cap}</dt><dd className="font-mono font-semibold text-foreground">{r.cap === null ? t.noCap : money(r.cap)}</dd></div>
        </dl>
        <details open className="mt-4 rounded-md border border-border px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">{t.how}</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            {t.steps(kind, rent).map((s) => <li key={s}>{s}</li>)}
          </ol>
        </details>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
          {t.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </div>
    </div>
  );
}
