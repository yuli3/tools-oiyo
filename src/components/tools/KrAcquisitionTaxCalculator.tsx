import { useState } from "react";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import { acquisitionTax, type HouseCount } from "../../lib/kr-real-estate-tax";

type Lang = "ko" | "en";
const T = {
  ko: {
    price: "취득가액(실거래가)", unit: "만원", houses: "이 집을 포함한 세대 주택 수", h: ["1주택", "2주택", "3주택", "4주택 이상"],
    regulated: "이 집이 조정대상지역에 있나요?", temp: "종전 집을 기한 안에 팔 일시적 2주택인가요?", area: "전용면적",
    yes: "예", no: "아니요", under: "85㎡ 이하", over: "85㎡ 초과",
    total: "예상 납부액", rate: "취득세율", tax: "취득세", edu: "지방교육세", rural: "농어촌특별세", heavy: "다주택 중과",
  },
  en: {
    price: "Purchase price", unit: "×10,000 KRW", houses: "Homes in the household, including this one", h: ["1", "2", "3", "4+"],
    regulated: "Is the home in an adjustment (regulated) area?", temp: "Temporary two homes (selling the old one in time)?", area: "Floor area",
    yes: "Yes", no: "No", under: "85㎡ or less", over: "Over 85㎡",
    total: "Estimated total", rate: "Acquisition tax rate", tax: "Acquisition tax", edu: "Local education tax", rural: "Rural special tax", heavy: "multi-home surcharge",
  },
} as const;
const won = (n: number, lang: Lang) => (lang === "ko" ? `${n.toLocaleString("ko-KR")}원` : `₩${n.toLocaleString("en-US")}`);

export default function KrAcquisitionTaxCalculator({ locale = "ko" }: { locale?: string }) {
  const lang: Lang = locale === "ko" ? "ko" : "en";
  const t = T[lang];
  const [manwon, setManwon] = useState(60000);
  const [houses, setHouses] = useState<`${HouseCount}`>("1");
  const [regulated, setRegulated] = useState<"y" | "n">("n");
  const [temp, setTemp] = useState<"y" | "n">("n");
  const [area, setArea] = useState<"under" | "over">("under");
  const n = Number(houses) as HouseCount;
  const r = acquisitionTax({ price: manwon * 10_000, houses: n, regulated: regulated === "y", temporaryTwo: temp === "y", over85: area === "over" });
  const yn = [{ value: "y" as const, label: t.yes }, { value: "n" as const, label: t.no }];

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <NumberField label={t.price} value={manwon} onChange={setManwon} suffix={t.unit} step={1000} />
        <ChoiceChips legend={t.houses} value={houses} options={(["1", "2", "3", "4"] as const).map((v, i) => ({ value: v, label: t.h[i] }))} onChange={setHouses} />
        {n >= 2 && n <= 3 && <ChoiceChips legend={t.regulated} value={regulated} options={yn} onChange={setRegulated} />}
        {n === 2 && regulated === "y" && <ChoiceChips legend={t.temp} value={temp} options={yn} onChange={setTemp} />}
        <ChoiceChips legend={t.area} value={area} options={[{ value: "under", label: t.under }, { value: "over", label: t.over }]} onChange={setArea} />
      </div>
      <div className="space-y-3 rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm">
        <div className="text-xs font-bold text-muted-foreground">{t.total}</div>
        <div className="text-3xl font-black text-primary">{won(r.total, lang)}</div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.rate}</dt><dd className="font-semibold">{(r.rate * 100).toFixed(2)}%{r.heavy ? ` (${t.heavy})` : ""}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.tax}</dt><dd>{won(r.tax, lang)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.edu}</dt><dd>{won(r.education, lang)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.rural}</dt><dd>{won(r.rural, lang)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
