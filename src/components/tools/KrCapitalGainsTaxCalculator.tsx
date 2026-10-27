import { useState } from "react";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import { capitalGainsTax, type AssetKind } from "../../lib/kr-real-estate-tax";

type Lang = "ko" | "en";
const T = {
  ko: {
    kind: "파는 것", house: "주택", other: "토지·상가 등", sale: "양도가액", purchase: "취득가액", expenses: "필요경비(취득세·중개수수료·수리비 등)", unit: "만원",
    hold: "보유 기간", live: "거주 기간", years: "년", houses: "이 집을 포함한 세대 주택 수", h: ["1주택", "2주택", "3주택 이상"],
    exempt: "2년 보유(조정지역에서 샀다면 2년 거주) 요건을 채웠나요?", regulated: "이 집이 조정대상지역에 있나요?", yes: "예", no: "아니요",
    total: "예상 양도소득세(지방소득세 포함)", exemptMsg: "1세대 1주택 비과세(양도가액 12억 원 이하)예요.", gain: "양도차익", taxable: "과세 대상 양도차익(12억 초과분)",
    longTerm: "장기보유특별공제", base: "과세표준(기본공제 250만 원 뺀 뒤)", rate: "적용 세율", tax: "양도소득세", local: "지방소득세(10%)",
  },
  en: {
    kind: "What you sell", house: "Home", other: "Land, shop, etc.", sale: "Sale price", purchase: "Purchase price", expenses: "Deductible costs (acquisition tax, agent fees, improvements)", unit: "×10,000 KRW",
    hold: "Years held", live: "Years lived in", years: "yrs", houses: "Homes in the household, including this one", h: ["1", "2", "3+"],
    exempt: "Held 2 years (and lived 2 years if bought in a regulated area)?", regulated: "Is the home in a regulated (adjustment) area?", yes: "Yes", no: "No",
    total: "Estimated capital gains tax (incl. local tax)", exemptMsg: "Exempt as a one-home household (sale price 1.2 billion won or less).", gain: "Capital gain", taxable: "Taxable gain (share above 1.2 billion won)",
    longTerm: "Long-term holding deduction", base: "Tax base (after the 2.5M won basic deduction)", rate: "Rate applied", tax: "Capital gains tax", local: "Local income tax (10%)",
  },
} as const;
const won = (n: number, lang: Lang) => (lang === "ko" ? `${Math.round(n).toLocaleString("ko-KR")}원` : `₩${Math.round(n).toLocaleString("en-US")}`);
const RATE_EN: Record<string, string> = { "단기 70%": "short-term 70%", "단기 60%": "short-term 60%", "단기 50%": "short-term 50%", "단기 40%": "short-term 40%", "기본세율 6~45%": "progressive 6–45%", "기본세율 + 20%p 중과": "progressive + 20%p surcharge", "기본세율 + 30%p 중과": "progressive + 30%p surcharge" };

export default function KrCapitalGainsTaxCalculator({ locale = "ko" }: { locale?: string }) {
  const lang: Lang = locale === "ko" ? "ko" : "en";
  const t = T[lang];
  const [kind, setKind] = useState<AssetKind>("house");
  const [sale, setSale] = useState(150000);
  const [purchase, setPurchase] = useState(80000);
  const [expenses, setExpenses] = useState(1500);
  const [hold, setHold] = useState(8);
  const [live, setLive] = useState(8);
  const [houses, setHouses] = useState<"1" | "2" | "3">("1");
  const [exempt, setExempt] = useState<"y" | "n">("y");
  const [regulated, setRegulated] = useState<"y" | "n">("y");
  const r = capitalGainsTax({
    kind, sale: sale * 10_000, purchase: purchase * 10_000, expenses: expenses * 10_000, holdYears: hold, liveYears: live,
    houses: Number(houses) as 1 | 2 | 3, exemptEligible: exempt === "y", regulated: regulated === "y",
  });
  const yn = [{ value: "y" as const, label: t.yes }, { value: "n" as const, label: t.no }];
  const isHouse = kind === "house";
  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <ChoiceChips legend={t.kind} value={kind} options={[{ value: "house", label: t.house }, { value: "other", label: t.other }]} onChange={setKind} />
        <NumberField label={t.sale} value={sale} onChange={setSale} suffix={t.unit} step={1000} />
        <NumberField label={t.purchase} value={purchase} onChange={setPurchase} suffix={t.unit} step={1000} />
        <NumberField label={t.expenses} value={expenses} onChange={setExpenses} suffix={t.unit} step={100} />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={t.hold} value={hold} onChange={setHold} suffix={t.years} step={0.5} />
          {isHouse && <NumberField label={t.live} value={live} onChange={setLive} suffix={t.years} step={0.5} />}
        </div>
        {isHouse && <ChoiceChips legend={t.houses} value={houses} options={(["1", "2", "3"] as const).map((v, i) => ({ value: v, label: t.h[i] }))} onChange={setHouses} />}
        {isHouse && houses === "1" && <ChoiceChips legend={t.exempt} value={exempt} options={yn} onChange={setExempt} />}
        {isHouse && houses !== "1" && <ChoiceChips legend={t.regulated} value={regulated} options={yn} onChange={setRegulated} />}
      </div>
      <div className="space-y-3 rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm">
        <div className="text-xs font-bold text-muted-foreground">{t.total}</div>
        <div className="text-3xl font-black text-primary">{won(r.total, lang)}</div>
        {r.exempt ? (
          <p className="text-sm text-muted-foreground">{t.exemptMsg}</p>
        ) : (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{t.gain}</dt><dd>{won(r.gain, lang)}</dd></div>
            {r.taxableGain !== r.gain && <div className="flex justify-between"><dt className="text-muted-foreground">{t.taxable}</dt><dd>{won(r.taxableGain, lang)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">{t.longTerm} ({Math.round(r.longTermRate * 100)}%)</dt><dd>−{won(r.longTerm, lang)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t.base}</dt><dd>{won(r.base, lang)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t.rate}</dt><dd>{lang === "ko" ? r.rateLabel : RATE_EN[r.rateLabel] ?? r.rateLabel}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t.tax}</dt><dd>{won(r.tax, lang)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t.local}</dt><dd>{won(r.local, lang)}</dd></div>
          </dl>
        )}
      </div>
    </div>
  );
}
