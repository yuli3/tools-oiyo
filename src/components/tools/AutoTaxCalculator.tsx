import { useState } from "react";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import { annualPaymentCredit, autoTax, type FuelKind, type Half } from "../../lib/kr-auto-tax";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const MONTHS = [1, 3, 6, 9] as const;

export default function AutoTaxCalculator() {
  const thisYear = new Date().getFullYear();
  const [fuel, setFuel] = useState<FuelKind>("engine");
  const [cc, setCc] = useState(1998);
  const [regYear, setRegYear] = useState(thisYear - 3);
  const [regHalf, setRegHalf] = useState<Half>("first");
  const [month, setMonth] = useState<(typeof MONTHS)[number]>(1);

  const r = autoTax({ fuel, cc, taxYear: thisYear, regYear, regHalf });
  const credit = annualPaymentCredit(r.carTax, thisYear, month);
  const creditWithEdu = credit + Math.floor((credit * 0.3) / 10) * 10;

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <ChoiceChips
          legend="차종 (비영업용 승용)"
          value={fuel}
          options={[
            { value: "engine", label: "휘발유·경유·LPG·하이브리드" },
            { value: "electric", label: "전기·수소차" },
          ]}
          onChange={setFuel}
        />
        {fuel === "engine" && <NumberField label="배기량" value={cc} onChange={setCc} suffix="cc" step={1} min={0} />}
        <label className="block">
          <span className="text-sm font-medium text-muted-foreground">최초 등록 연도</span>
          <select
            value={regYear}
            onChange={(event) => setRegYear(Number(event.target.value))}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground"
          >
            {Array.from({ length: 25 }, (_, i) => thisYear - i).map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </label>
        <ChoiceChips
          legend="등록한 때"
          value={regHalf}
          options={[
            { value: "first", label: "1~6월" },
            { value: "second", label: "7~12월" },
          ]}
          onChange={setRegHalf}
        />
      </div>

      <div className="space-y-4 rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm">
        <div>
          <div className="text-xs font-bold text-muted-foreground">{thisYear}년 자동차세 합계 (지방교육세 포함)</div>
          <div className="mt-1 text-3xl font-black text-primary">{won(r.total)}</div>
        </div>
        <div className="space-y-2 text-sm">
          {r.periods.map((p) => (
            <div key={p.period} className="flex justify-between text-muted-foreground">
              <span>{p.period}기분 ({p.period === 1 ? "6월" : "12월"}) 차령 {p.age}년{p.relief > 0 ? `, ${Math.round(p.relief * 100)}% 경감` : ""}</span>
              <span className="font-medium text-foreground">{won(p.tax)}</span>
            </div>
          ))}
          <div className="flex justify-between text-muted-foreground">
            <span>지방교육세 (자동차세의 30%)</span>
            <span className="font-medium text-foreground">{won(r.educationTax)}</span>
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <ChoiceChips
            legend="연납 신청 달"
            value={String(month) as `${(typeof MONTHS)[number]}`}
            options={MONTHS.map((m) => ({ value: String(m) as `${(typeof MONTHS)[number]}`, label: `${m}월` }))}
            onChange={(v) => setMonth(Number(v) as (typeof MONTHS)[number])}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            {month}월에 한 번에 내면 남은 기간 세액의 5%, 약 <span className="font-bold text-success">{won(creditWithEdu)}</span>을 덜 내요
            (자동차세 {won(credit)} + 지방교육세 연동분).
          </p>
        </div>
      </div>
    </div>
  );
}
