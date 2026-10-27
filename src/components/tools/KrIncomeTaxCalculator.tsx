import { useState } from "react";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import { comprehensiveIncomeTax, freelancerSettlement, simpleExpense } from "../../lib/kr-income-tax-2026";

type Lang = "ko" | "en";
const T = {
  ko: {
    unit: "만원", people: "기본공제 인원(본인 포함)", pension: "국민연금 등 연금보험료 본인 납부액",
    revenue: "사업 수입금액(매출)", expMode: "필요경비", simple: "단순경비율(64.1%)", rate: "경비율 직접", actual: "실제 경비", expRate: "경비율", expenses: "실제 필요경비",
    salary: "근로 총급여(있으면)", other: "종합과세 기타소득금액", prepaid: "이미 낸 소득세(원천징수·중간예납)",
    revenue33: "3.3% 떼고 받은 수입(세전)", total: "5월에 더 낼 세금(지방소득세 포함)", refund: "5월에 돌려받을 세금(지방소득세 포함)",
    income: "종합소득금액", base: "과세표준", calculated: "산출세액", credits: "세액공제", determined: "결정세액", local: "지방소득세", withheld: "원천징수된 3.3%", expenseLine: "필요경비",
  },
  en: {
    unit: "×10,000 KRW", people: "Basic deduction people (incl. you)", pension: "National pension premiums you paid",
    revenue: "Business revenue", expMode: "Expenses", simple: "Simple expense rate (64.1%)", rate: "Own rate", actual: "Actual expenses", expRate: "Expense rate", expenses: "Actual expenses",
    salary: "Salary (if any)", other: "Other income taxed comprehensively", prepaid: "Income tax already paid (withheld, interim)",
    revenue33: "Gross pay with 3.3% withheld", total: "Extra tax due in May (incl. local tax)", refund: "Refund in May (incl. local tax)",
    income: "Comprehensive income", base: "Tax base", calculated: "Calculated tax", credits: "Tax credits", determined: "Determined tax", local: "Local income tax", withheld: "3.3% withheld", expenseLine: "Expenses",
  },
} as const;
const won = (n: number, lang: Lang) => (lang === "ko" ? `${Math.round(n).toLocaleString("ko-KR")}원` : `₩${Math.round(n).toLocaleString("en-US")}`);
type Mode = "simple" | "rate" | "actual";

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="text-right">{value}</dd></div>;
}

/** variant="freelancer" shows only 3.3% revenue; "comprehensive" adds salary and other income. */
export default function KrIncomeTaxCalculator({ locale = "ko", variant = "comprehensive" }: { locale?: string; variant?: "comprehensive" | "freelancer" }) {
  const lang: Lang = locale === "ko" ? "ko" : "en";
  const t = T[lang];
  const free = variant === "freelancer";
  const [revenue, setRevenue] = useState(3000);
  const [mode, setMode] = useState<Mode>("simple");
  const [expRate, setExpRate] = useState(30);
  const [expenses, setExpenses] = useState(500);
  const [salary, setSalary] = useState(0);
  const [other, setOther] = useState(0);
  const [people, setPeople] = useState(1);
  const [pension, setPension] = useState(0);
  const [prepaid, setPrepaid] = useState(0);
  const rev = revenue * 10_000;
  const expense = mode === "simple" ? simpleExpense(rev) : mode === "rate" ? Math.round((rev * expRate) / 100) : expenses * 10_000;
  const r = free
    ? freelancerSettlement(rev, mode === "simple" ? "simple" : rev > 0 ? expense / rev : 0, people, pension * 10_000)
    : comprehensiveIncomeTax({ businessIncome: rev - expense, salary: salary * 10_000, otherIncome: other * 10_000, people, pensionPremium: pension * 10_000, prepaid: prepaid * 10_000 });
  const due = r.due;
  // 3% 소득세 + 0.3% 지방소득세, 각각 10원 미만 절사
  const withheld33 = Math.floor((rev * 0.03) / 10) * 10 + Math.floor((Math.floor((rev * 0.03) / 10) * 10 * 0.1) / 10) * 10;
  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <NumberField label={free ? t.revenue33 : t.revenue} value={revenue} onChange={setRevenue} suffix={t.unit} step={100} />
        <ChoiceChips legend={t.expMode} value={mode} options={[{ value: "simple", label: t.simple }, { value: "rate", label: t.rate }, { value: "actual", label: t.actual }]} onChange={setMode} />
        {mode === "rate" && <NumberField label={t.expRate} value={expRate} onChange={setExpRate} suffix="%" step={1} />}
        {mode === "actual" && <NumberField label={t.expenses} value={expenses} onChange={setExpenses} suffix={t.unit} step={100} />}
        {!free && <NumberField label={t.salary} value={salary} onChange={setSalary} suffix={t.unit} step={100} />}
        {!free && <NumberField label={t.other} value={other} onChange={setOther} suffix={t.unit} step={100} />}
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={t.people} value={people} onChange={setPeople} suffix={lang === "ko" ? "명" : ""} step={1} min={1} />
          <NumberField label={t.pension} value={pension} onChange={setPension} suffix={t.unit} step={10} />
        </div>
        {!free && <NumberField label={t.prepaid} value={prepaid} onChange={setPrepaid} suffix={t.unit} step={10} />}
      </div>
      <div className="space-y-3 rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm">
        <div className="text-xs font-bold text-muted-foreground">{due >= 0 ? t.total : t.refund}</div>
        <div className={"text-3xl font-black " + (due >= 0 ? "text-primary" : "text-success")}>{won(Math.abs(due), lang)}</div>
        <dl className="space-y-2 text-sm">
          <Row label={t.expenseLine} value={won(expense, lang)} />
          <Row label={t.income} value={won(r.total, lang)} />
          <Row label={t.base} value={won(r.base, lang)} />
          <Row label={t.calculated} value={won(r.calculated, lang)} />
          <Row label={t.credits} value={`−${won(r.credits, lang)}`} />
          <Row label={t.determined} value={won(r.determined, lang)} />
          <Row label={t.local} value={won(r.local, lang)} />
          {free && <Row label={t.withheld} value={won(withheld33, lang)} />}
        </dl>
      </div>
    </div>
  );
}
