// 주택 임대차(전월세) 신고 대상·기한·과태료. 계산: lib/kr-office-tasks-2026.ts
import { useState } from "react";
import { OFFICE_TASKS_AS_OF, leaseReport } from "../../../lib/kr-office-tasks-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "housing-lease-report-checker";
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function LeaseReport() {
  const [deposit, setDeposit] = useState(100_000_000);
  const [rent, setRent] = useState(0);
  const [date, setDate] = useState(todayStr());
  const [renewal, setRenewal] = useState(false);
  const [rural, setRural] = useState(false);
  const [movedIn, setMovedIn] = useState(false);
  const upd = (f: () => void) => { f(); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = leaseReport({ deposit, monthlyRent: rent, contractDate: date || todayStr(), today: todayStr(), renewalSameTerms: renewal, coveredArea: !rural, tenantMovedIn: movedIn });
  const box = "flex min-h-11 items-center gap-2 text-sm";
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField label="보증금" value={deposit} onChange={(v) => upd(() => setDeposit(v))} suffix="원" step={1_000_000} />
        <NumberField label="월 차임(월세)" value={rent} onChange={(v) => upd(() => setRent(v))} suffix="원" step={10_000} />
        <label className="block text-sm font-medium text-muted-foreground">계약 체결일
          <input type="date" className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-foreground" value={date} onChange={(e) => upd(() => setDate(e.target.value))} />
        </label>
      </div>
      <label className={box}><input type="checkbox" className="size-5" checked={renewal} onChange={(e) => upd(() => setRenewal(e.target.checked))} />보증금·월세 그대로 기간만 연장한 갱신이에요</label>
      <label className={box}><input type="checkbox" className="size-5" checked={rural} onChange={(e) => upd(() => setRural(e.target.checked))} />광역시·경기도가 아닌 도의 '군' 지역이에요</label>
      <label className={box}><input type="checkbox" className="size-5" checked={movedIn} onChange={(e) => upd(() => setMovedIn(e.target.checked))} />임차인이 전입신고를 했어요</label>
      <LaborResult headline={r.required ? (r.fine > 0 ? `신고 대상 · 기한 지남 · 과태료 ${r.fine.toLocaleString("ko-KR")}원` : `신고 대상 · ${r.deadline}까지`) : "신고 대상이 아니에요"} items={r.items} dates={[]} datesTitle="날짜" note={`일반 정보예요. 과태료는 신고관청이 정해요. 부동산 거래신고법·시행령 별표 3 원문 기준, 확인 ${OFFICE_TASKS_AS_OF}. 입력은 브라우저 밖으로 나가지 않아요.`} />
    </div>
  );
}
