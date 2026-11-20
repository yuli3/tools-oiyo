// 가맹계약 기한 점검 (2026-11-20, 전수조사 12번 새 직업). 계산: lib/kr-franchise-housing-2026.ts (법령 길잡이 스킬 guide.mjs calc franchise와 같은 코드)
import { useState } from "react";
import { FH_AS_OF, FH_NOTE, franchiseCheck, type FranchiseInput } from "../../../lib/kr-franchise-housing-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import { track } from "../viz/track";

const TOOL_ID = "franchise-contract-check";
const TONE: Record<string, string> = { warn: "text-red-700 dark:text-red-300", info: "text-foreground", good: "text-emerald-700 dark:text-emerald-300" };

export default function FranchiseCheck() {
  const [x, setX] = useState<FranchiseInput>({ infoGiven: "2026-11-01", signed: "2026-11-10", advised: false, bigHq: true });
  const upd = (p: Partial<FranchiseInput>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const list = franchiseCheck(x);
  const date = (label: string, key: keyof FranchiseInput) => <DateField label={label} value={(x[key] as string) ?? ""} onChange={(v) => upd({ [key]: v || undefined } as Partial<FranchiseInput>)} />;
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">아는 날짜만 넣으세요.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {date("정보공개서를 받은 날", "infoGiven")}
        {date("가맹계약서(안)를 받은 날", "contractGiven")}
        {date("계약한 날(또는 할 날)", "signed")}
        {date("처음 가맹계약을 시작한 날", "firstStart")}
        {date("지금 계약이 끝나는 날", "currentEnd")}
      </div>
      <div className="flex flex-wrap gap-3">
        <ChoiceChips<"no" | "yes"> legend="변호사·가맹거래사 자문을 받았나요?" value={x.advised ? "yes" : "no"} options={[{ value: "no", label: "아니요(14일)" }, { value: "yes", label: "예(7일)" }]} onChange={(v) => upd({ advised: v === "yes" })} />
        <ChoiceChips<"no" | "yes"> legend="가맹점 100개 이상이거나 중견·대기업 본부인가요?" value={x.bigHq ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => upd({ bigHq: v === "yes" })} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{list.some((i) => i.tone === "warn") ? "확인할 점이 있어요" : "기한을 날짜순으로 정리했어요"}</p>
        <ul className="mt-2 space-y-2">
          {list.map((i) => <li key={i.id} className={TONE[i.tone]}>{i.date && <span className="font-mono">{i.date} </span>}{i.label} <span className="text-xs text-muted-foreground">({i.cite})</span></li>)}
        </ul>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{FH_NOTE} 기준일 {FH_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
