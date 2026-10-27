import { useState } from "react";
import { CLAIMS, daysUntil, limitationExpiry, type ClaimType } from "../../lib/kr-legal-2026";
import ChoiceChips from "./payroll/ChoiceChips";
import DateField from "./payroll/DateField";
import ResultSteps from "./payroll/ResultSteps";

const isIso = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const CLAIM_OPTIONS = (Object.keys(CLAIMS) as ClaimType[]).map((value) => ({ value, label: CLAIMS[value].label }));

export default function StatuteLimitationsCalculator() {
  const [claim, setClaim] = useState<ClaimType>("civil");
  const [base, setBase] = useState("2023-03-10");
  const today = todayIso();

  const c = CLAIMS[claim];
  const r = isIso(base) ? limitationExpiry(base, c.years) : null;
  const left = r ? daysUntil(today, r.expiry) : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <ChoiceChips legend="어떤 채권인가요?" value={claim} options={CLAIM_OPTIONS} onChange={setClaim} />
      <div className="mt-4 max-w-xs">
        <DateField label="기산일(권리를 행사할 수 있게 된 날)" value={base} onChange={setBase} />
      </div>

      <div aria-live="polite" className="mt-5">
        {r === null ? (
          <p className="text-sm text-muted-foreground">기산일을 넣어 주세요.</p>
        ) : (
          <div className="rounded-md border border-border bg-background px-4 py-4">
            <p className="text-sm text-muted-foreground">소멸시효가 끝나는 날</p>
            <p className="mt-1 font-mono text-3xl font-bold text-foreground">{r.expiry}</p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {left > 0 ? `오늘(${today})부터 ${left}일 남았어요.` : left === 0 ? "오늘이 마지막 날이에요." : `${-left}일 전에 끝났어요.`}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{c.law} · {c.note}</p>
            <ResultSteps
              steps={[
                `초일 불산입: ${base} 다음 날부터 ${c.years}년을 셉니다(민법 제157조).`,
                `그래서 ${c.years}년 뒤 기산일과 같은 월·일인 ${r.nominal}이 마지막 날이에요(제160조, 그 날짜가 없는 달이면 말일).`,
                r.extended
                  ? `${r.nominal}이 토요일·일요일·공휴일이라 다음 평일 ${r.expiry}까지 늘어나요(제161조).`
                  : "마지막 날이 평일이라 그대로예요.",
                ...(r.holidaysKnown ? [] : ["그 해 공휴일 목록이 아직 없어 토·일만 반영했어요."]),
                "소 제기·지급명령·압류·채무 승인이 있으면 시효가 중단되고 그때부터 다시 셉니다(제168조). 최고(내용증명)는 6개월 안에 소송 등을 해야 효력이 있어요(제174조).",
              ]}
              next={[
                { href: "/ko/legal-interest-calculator/", label: "지연이자 계산" },
                { href: "https://blog.oiyo.net/ko/litigation-cost-calculator/", label: "소송비용 계산" },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
