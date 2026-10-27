import { useState } from "react";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import { propertyTax } from "../../lib/kr-real-estate-tax";

type Lang = "ko" | "en";
const T = {
  ko: {
    official: "주택 공시가격", unit: "만원", owner: "보유 형태", one: "1세대 1주택", multi: "다주택·법인", urban: "도시지역(도시계획구역)인가요?", yes: "예", no: "아니요",
    total: "올해 주택분 재산세 합계", ratio: "공정시장가액비율", base: "과세표준", tax: "재산세", special: "1주택 특례세율", urbanTax: "도시지역분(0.14%)", edu: "지방교육세(20%)",
    split: (half: string) => `20만 원을 넘으면 7월과 9월에 반씩(${half}) 나눠 내요.`, once: "20만 원 이하라 7월에 한 번에 내요.",
  },
  en: {
    official: "Official assessed price", unit: "×10,000 KRW", owner: "Ownership", one: "One home per household", multi: "Multiple homes / company", urban: "Inside an urban planning area?", yes: "Yes", no: "No",
    total: "This year's housing property tax", ratio: "Fair market value ratio", base: "Tax base", tax: "Property tax", special: "one-home special rate", urbanTax: "Urban area tax (0.14%)", edu: "Local education tax (20%)",
    split: (half: string) => `Over ₩200,000, so it is billed in two halves (${half}) in July and September.`, once: "₩200,000 or less, so it is billed once in July.",
  },
} as const;
const won = (n: number, lang: Lang) => (lang === "ko" ? `${n.toLocaleString("ko-KR")}원` : `₩${n.toLocaleString("en-US")}`);

export default function KrPropertyTaxCalculator({ locale = "ko" }: { locale?: string }) {
  const lang: Lang = locale === "ko" ? "ko" : "en";
  const t = T[lang];
  const [manwon, setManwon] = useState(50000);
  const [owner, setOwner] = useState<"one" | "multi">("one");
  const [urban, setUrban] = useState<"y" | "n">("y");
  const r = propertyTax(manwon * 10_000, owner === "one", urban === "y");
  // 재산세 본세가 20만 원을 넘으면 7월·9월에 절반씩 고지해요(지방세법 제115조 제1항 제3호).
  const half = Math.floor(r.total / 2 / 10) * 10;
  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <NumberField label={t.official} value={manwon} onChange={setManwon} suffix={t.unit} step={1000} />
        <ChoiceChips legend={t.owner} value={owner} options={[{ value: "one", label: t.one }, { value: "multi", label: t.multi }]} onChange={setOwner} />
        <ChoiceChips legend={t.urban} value={urban} options={[{ value: "y", label: t.yes }, { value: "n", label: t.no }]} onChange={setUrban} />
      </div>
      <div className="space-y-3 rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm">
        <div className="text-xs font-bold text-muted-foreground">{t.total}</div>
        <div className="text-3xl font-black text-primary">{won(r.total, lang)}</div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.ratio}</dt><dd>{Math.round(r.ratio * 100)}%</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.base}</dt><dd>{won(r.base, lang)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.tax}{r.special ? ` (${t.special})` : ""}</dt><dd>{won(r.tax, lang)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.urbanTax}</dt><dd>{won(r.urban, lang)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.edu}</dt><dd>{won(r.education, lang)}</dd></div>
        </dl>
        <p className="text-sm text-muted-foreground">{r.tax > 200_000 ? t.split(won(half, lang)) : t.once}</p>
      </div>
    </div>
  );
}
