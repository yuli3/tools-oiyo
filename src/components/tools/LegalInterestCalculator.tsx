import { useState } from "react";
import { LEGAL_RATES, legalInterest } from "../../lib/kr-legal-2026";
import ChoiceChips from "./payroll/ChoiceChips";
import DateField from "./payroll/DateField";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pct = (r: number) => `${Number((r * 100).toFixed(3))}%`;
const isIso = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

type RateKind = "civil" | "commercial" | "custom";
const RATE_OPTIONS = [
  { value: "civil", label: "민사 연 5%" },
  { value: "commercial", label: "상사 연 6%" },
  { value: "custom", label: "약정 이율" },
] as const satisfies readonly { value: RateKind; label: string }[];

type Served = "no" | "yes";
const SERVED_OPTIONS = [
  { value: "no", label: "소송 전" },
  { value: "yes", label: "소장·지급명령 송달됨" },
] as const satisfies readonly { value: Served; label: string }[];

export default function LegalInterestCalculator() {
  const [principal, setPrincipal] = useState(10_000_000);
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-12-31");
  const [kind, setKind] = useState<RateKind>("civil");
  const [customPct, setCustomPct] = useState(12);
  const [served, setServed] = useState<Served>("no");
  const [servedOn, setServedOn] = useState("2026-06-30");

  const rate = kind === "civil" ? LEGAL_RATES.civil : kind === "commercial" ? LEGAL_RATES.commercial : customPct / 100;
  const valid = principal > 0 && rate >= 0 && isIso(start) && isIso(end) && end >= start && (served === "no" || isIso(servedOn));
  const r = valid ? legalInterest({ principal, start, end, rate, servedOn: served === "yes" ? servedOn : undefined }) : null;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="원금" value={principal} onChange={setPrincipal} suffix="원" step={1_000_000} />
        {kind === "custom" && <NumberField label="약정 이율(연)" value={customPct} onChange={setCustomPct} suffix="%" step={0.5} />}
        <DateField label="이자가 붙기 시작한 날" value={start} onChange={setStart} />
        <DateField label="다 갚는 날(포함)" value={end} onChange={setEnd} />
      </div>
      <div className="mt-4 space-y-3">
        <ChoiceChips legend="어떤 이율을 쓰나요?" value={kind} options={RATE_OPTIONS} onChange={setKind} />
        <ChoiceChips legend="소송을 냈나요?" value={served} options={SERVED_OPTIONS} onChange={setServed} />
        {served === "yes" && (
          <div className="max-w-xs">
            <DateField label="소장·지급명령 송달일" value={servedOn} onChange={setServedOn} />
          </div>
        )}
      </div>

      <div aria-live="polite" className="mt-5">
        {r === null ? (
          <p className="text-sm text-muted-foreground">원금과 날짜를 넣고, 다 갚는 날은 시작일과 같거나 뒤로 맞춰 주세요.</p>
        ) : (
          <div className="rounded-md border border-border bg-background px-4 py-4">
            <p className="text-sm text-muted-foreground">붙는 이자(지연손해금)</p>
            <p className="mt-1 font-mono text-3xl font-bold text-foreground">{won(r.interest)}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">원금 + 이자</dt>
                <dd className="font-mono font-semibold text-foreground">{won(r.total)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">이자 날수</dt>
                <dd className="font-mono font-semibold text-foreground">{r.days}일</dd>
              </div>
            </dl>
            <ResultSteps
              steps={[
                ...r.periods.map((p) => `${p.from} ~ ${p.to}: ${won(principal)} × ${pct(p.rate)} × ${p.days}일 ÷ 365 = ${won(p.interest)} (원 미만 버림)`),
                ...(r.periods.length > 1 ? [`합계 = ${r.periods.map((p) => won(p.interest)).join(" + ")} = ${won(r.interest)}`] : []),
                served === "yes" ? "소장·지급명령이 송달된 다음 날부터는 소송촉진법에 따라 연 12%를 적용했어요." : "단리, 1년 365일로 나눴어요. 시작일과 끝나는 날을 모두 셌어요.",
              ]}
              next={[
                { href: "/ko/statute-limitations-calculator/", label: "소멸시효는 언제 끝나나요?" },
                { href: "/ko/litigation-cost-calculator/", label: "소송비용 계산" },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
