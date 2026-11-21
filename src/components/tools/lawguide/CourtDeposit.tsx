// 공탁금 이자·시효와 변제공탁 요건 (2026-11-21, 전수조사 남은 빈칸). 계산: lib/kr-court-deposit-2026.ts (법령 길잡이 스킬 guide.mjs calc deposit와 같은 코드)
import { useState } from "react";
import { DEPOSIT_AS_OF, DEPOSIT_NOTE, GROUNDS, depositCheck, type Ground } from "../../../lib/kr-court-deposit-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { krwShort, plusMonths } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "court-deposit-interest-calculator";
const TONE: Record<string, string> = { warn: "text-red-700 dark:text-red-300", info: "text-foreground", good: "text-emerald-700 dark:text-emerald-300" };
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export default function CourtDeposit() {
  const [x, setX] = useState({ amount: 3000, deposited: "2025-11-21", withdrawn: "2026-11-21", ground: "refused" as Ground, criminal: false });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const calc = (withdrawn?: string) => depositCheck({ amount: x.amount * 10_000, deposited: x.deposited || undefined, withdrawn, ground: x.ground, criminal: x.criminal });
  const r = calc(x.withdrawn || undefined);
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{
        title: "맡겨 둔 기간에 따라 공탁금 이자가 이렇게 늘어요", caption: "공탁한 날부터 찾는 날까지, 같은 금액과 이율로 다시 계산해요.",
        xLabel: "맡긴 기간", yLabel: "이자", min: 0, max: 120, step: 1, current: Math.round(r.days / 30.44),
        f: (m) => (x.deposited ? calc(plusMonths(x.deposited, m)).interest : 0),
        formatX: (n: number) => `${Math.round(n)}개월`, formatY: krwShort,
        onPick: (m) => x.deposited && upd({ withdrawn: plusMonths(x.deposited, m) }),
      }}
    >
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="공탁금" suffix="만 원" value={x.amount} onChange={(v) => upd({ amount: Math.max(0, v) })} />
        <DateField label="공탁한 날" value={x.deposited} onChange={(v) => upd({ deposited: v })} />
        <DateField label="찾을(출급·회수할) 날" value={x.withdrawn} onChange={(v) => upd({ withdrawn: v })} />
      </div>
      <ChoiceChips<"civil" | "criminal"> legend="어떤 공탁인가요?" value={x.criminal ? "criminal" : "civil"} options={[{ value: "civil", label: "빚을 갚는 변제공탁" }, { value: "criminal", label: "형사공탁(피해자 합의 대신)" }]} onChange={(v) => upd({ criminal: v === "criminal" })} />
      {!x.criminal && <ChoiceChips<Ground> legend="공탁 사유" value={x.ground} options={(Object.keys(GROUNDS) as Ground[]).map((g) => ({ value: g, label: GROUNDS[g] }))} onChange={(v) => upd({ ground: v })} />}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">공탁금 이자 약 {won(r.interest)} ({r.days}일, 연 {Math.round(r.rate * 10000) / 100}%)</p>
        {r.lapseOn && <p className="mt-1 text-foreground">찾지 않으면 <span className="font-mono">{r.lapseOn}</span>쯤 청구권이 없어져요. {r.lapseRule}</p>}
        <ul className="mt-2 space-y-2">{r.items.map((i, k) => <li key={k} className={TONE[i.tone]}>{i.text}{mode === "expert" && <span className="text-xs text-muted-foreground"> ({i.cite})</span>}</li>)}</ul>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{DEPOSIT_NOTE} 기준일 {DEPOSIT_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </>
      )}
    </CurveShell>
  );
}
