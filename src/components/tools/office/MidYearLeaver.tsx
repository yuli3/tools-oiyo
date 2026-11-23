// 중도퇴사자 연말정산 미리보기 (2026-11-23). 계산: lib/kr-midyear-leaver-2026.ts (연말정산 엔진 재사용, 새 값 없음).
import { Fragment, useState } from "react";
import { midYearLeaver } from "../../../lib/kr-midyear-leaver-2026";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "midyear-leaver-year-end-settlement";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const signed = (n: number) => (n >= 0 ? `${won(n)} 돌려받음` : `${won(-n)} 더 냄`);

export default function MidYearLeaver() {
  const [salary, setSalary] = useState(24_000_000);
  const [withheld, setWithheld] = useState(600_000);
  const [pension, setPension] = useState(1_140_000);
  const [health, setHealth] = useState(1_080_000);
  const [persons, setPersons] = useState(1);
  const [credit, setCredit] = useState(0);
  const [debit, setDebit] = useState(0);
  const [medical, setMedical] = useState(0);
  const [education, setEducation] = useState(0);
  const [donation, setDonation] = useState(0);
  const [rent, setRent] = useState(0);
  const [pensionSavings, setPensionSavings] = useState(0);

  const r = midYearLeaver({
    year: 2026,
    salaryToDate: salary,
    withheld,
    nationalPension: pension,
    healthEmployment: health,
    extra: { persons, card: { credit, debit }, medical, education, donation, rent, rentEligible: rent > 0, pensionSavings },
  });
  const set = (f: (v: number) => void) => (v: number) => { f(v); track("tool_calculate", { tool_id: TOOL_ID }, true); };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2" aria-labelledby="ml-paid">
        <h2 id="ml-paid" className="text-lg font-semibold sm:col-span-2">퇴사할 때까지 (근로소득원천징수영수증 숫자)</h2>
        <NumberField label="1월~퇴사월 총급여(비과세 제외)" value={salary} onChange={set(setSalary)} suffix="원" step={100000} />
        <NumberField label="떼인 근로소득세(지방소득세 제외)" value={withheld} onChange={set(setWithheld)} suffix="원" step={10000} />
        <NumberField label="낸 국민연금(근로자분)" value={pension} onChange={set(setPension)} suffix="원" step={10000} />
        <NumberField label="낸 건강·장기요양·고용보험(근로자분)" value={health} onChange={set(setHealth)} suffix="원" step={10000} />
      </section>

      <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2" aria-labelledby="ml-extra">
        <h2 id="ml-extra" className="text-lg font-semibold sm:col-span-2">5월 신고 때 더할 수 있는 것 (1월~12월 전체)</h2>
        <NumberField label="기본공제 인원(본인 포함)" value={persons} onChange={set((v) => setPersons(Math.max(1, Math.round(v))))} suffix="명" min={1} />
        <NumberField label="신용카드 사용액" value={credit} onChange={set(setCredit)} suffix="원" step={100000} />
        <NumberField label="체크카드·현금영수증" value={debit} onChange={set(setDebit)} suffix="원" step={100000} />
        <NumberField label="의료비(부양가족 일반)" value={medical} onChange={set(setMedical)} suffix="원" step={10000} />
        <NumberField label="교육비(공제대상)" value={education} onChange={set(setEducation)} suffix="원" step={10000} />
        <NumberField label="기부금" value={donation} onChange={set(setDonation)} suffix="원" step={10000} />
        <NumberField label="월세(무주택 세대주 요건 충족)" value={rent} onChange={set(setRent)} suffix="원" step={100000} />
        <NumberField label="연금저축 납입액" value={pensionSavings} onChange={set(setPensionSavings)} suffix="원" step={100000} />
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="결과">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">퇴사할 때 회사 정산</p>
          <p className={`mt-1 text-xl font-bold ${r.companyRefund < 0 ? "text-destructive" : ""}`}>{signed(r.companyRefund)}</p>
          <p className="mt-1 text-xs text-muted-foreground">본인 기본공제·4대보험료·{r.company.usedStandard ? "표준세액공제 13만 원" : "특별공제"} 기준</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">5월 종합소득세 신고로 다시 하면</p>
          <p className={`mt-1 text-xl font-bold ${r.mayRefund < 0 ? "text-destructive" : ""}`}>{signed(r.mayRefund)}</p>
          <p className="mt-1 text-xs text-muted-foreground">기한 {r.mayDeadline} · 홈택스</p>
        </div>
        <div className="rounded-xl border border-primary bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">신고하면 더 받는 돈</p>
          <p className="mt-1 text-xl font-bold text-primary">{won(r.extraByFiling)}</p>
          <p className="mt-1 text-xs text-muted-foreground">지방소득세 포함</p>
        </div>
      </section>

      {r.drivers.length > 0 && (
        <section className="rounded-xl border p-4" aria-labelledby="ml-drivers">
          <h2 id="ml-drivers" className="text-base font-semibold">차이를 만든 항목</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {r.drivers.map((d) => (<li key={d.label} className="flex justify-between gap-3"><span>{d.label}</span><span className="font-mono">+{won(d.amount)}</span></li>))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">소득공제는 과세표준을, 세액공제는 세금을 줄인 금액이에요.</p>
        </section>
      )}

      <details className="rounded-xl border p-4 text-sm">
        <summary className="cursor-pointer font-semibold">계산 내역</summary>
        <dl className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1">
          <dt className="text-muted-foreground"></dt><dd className="font-medium">회사 정산</dd><dd className="font-medium">5월 신고</dd>
          {([["근로소득금액", "earnedIncome"], ["과세표준", "taxBase"], ["산출세액", "calculatedTax"], ["세액공제 합계", "totalCredits"], ["결정세액", "finalTax"], ["지방소득세", "localTax"]] as const).map(([l, k]) => (
            <Fragment key={k}><dt className="text-muted-foreground">{l}</dt><dd className="text-right font-mono">{won(r.company[k])}</dd><dd className="text-right font-mono">{won(r.may[k])}</dd></Fragment>
          ))}
        </dl>
      </details>
    </div>
  );
}
