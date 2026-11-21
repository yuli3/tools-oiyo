// 국세 가산세 통합 어림 (2026-11-20, 전수조사 3번). 계산: lib/kr-tax-penalty-2026.ts (kr-tax-advisor 스킬 calc.mjs penalty와 같은 코드)
import { useState } from "react";
import { PENALTY_AS_OF, PENALTY_NOTE, nextReductionStep, taxPenalty, type PenaltyInput } from "../../../lib/kr-tax-penalty-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { krwShort, plusDays } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "tax-penalty-calculator";
const MAN = 10_000;
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const pct = (r: number) => `${Math.round(r * 1000) / 10}%`;

export default function TaxPenalty() {
  const today = todayIso();
  const [x, setX] = useState<PenaltyInput>({ kind: "none", tax: 1000 * MAN, due: "2026-06-01", filed: today, fraud: false });
  const r = taxPenalty(x, today);
  const next = x.kind !== "withholding" && x.filed ? nextReductionStep(x.kind, x.due, x.filed) : null;
  const upd = (p: Partial<PenaltyInput>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{
        title: "늦어진 날수에 따라 가산세가 이렇게 늘어요", caption: "기한 다음 날부터 신고·납부한 날까지. 같은 본세와 상황으로 다시 계산해요.",
        xLabel: "늦어진 날", yLabel: "가산세", min: 1, max: 730, step: 1, current: r.days,
        f: (d) => taxPenalty({ ...x, filed: x.kind === "withholding" ? x.filed : plusDays(x.due, d), paid: plusDays(x.due, d) }, today).total,
        formatX: (n: number) => `${Math.round(n)}일`, formatY: krwShort,
        onPick: (d) => upd(x.kind === "withholding" ? { paid: plusDays(x.due, d) } : { filed: plusDays(x.due, d), paid: undefined }),
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<PenaltyInput["kind"]> legend="어떤 상황인가요?" value={x.kind} options={[{ value: "none", label: "신고를 안 했어요" }, { value: "under", label: "덜 신고했어요" }, { value: "withholding", label: "원천세를 늦게 냈어요" }]} onChange={(v) => upd({ kind: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label={x.kind === "withholding" ? "늦게 낸 원천세" : "더 내야 할 세금(본세)"} suffix="만 원" value={Math.round(x.tax / MAN)} onChange={(v) => upd({ tax: Math.max(0, v) * MAN })} />
        <DateField label="원래 신고·납부 기한" value={x.due} onChange={(v) => upd({ due: v })} />
        {x.kind !== "withholding" && <DateField label="기한후·수정신고하는 날" value={x.filed ?? ""} onChange={(v) => upd({ filed: v })} />}
        {mode === "expert" && <DateField label="실제로 내는 날(비우면 신고일)" value={x.paid ?? ""} onChange={(v) => upd({ paid: v })} />}
      </div>
      {mode === "expert" && x.kind !== "withholding" && (
        <div className="flex flex-wrap gap-3">
          <ChoiceChips<"no" | "yes"> legend="세무조사 통지를 받은 뒤인가요?" value={x.noticed ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => upd({ noticed: v === "yes" })} />
          <ChoiceChips<"no" | "yes"> legend="숨기거나 거짓으로 꾸몄나요?" value={x.fraud ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예(부정)" }]} onChange={(v) => upd({ fraud: v === "yes" })} />
        </div>
      )}
      {mode === "expert" && x.kind === "none" && <NumberField label="복식부기의무자·법인이면 그해 수입금액(아니면 0)" suffix="만 원" value={Math.round((x.revenue ?? 0) / MAN)} onChange={(v) => upd({ revenue: Math.max(0, v) * MAN })} />}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">가산세 약 {won(r.total)}</p>
        <ul className="mt-2 space-y-1 text-foreground">
          {x.kind !== "withholding" && <li>신고 가산세 {won(r.filing)} ({pct(r.filingRate)}{r.reduction ? `, ${pct(r.reduction)} 감면` : ", 감면 없음"})</li>}
          <li>납부지연 가산세 {won(r.delay)} ({r.days}일{x.kind === "withholding" ? ", 3% + 하루 0.022%, 10% 한도" : " × 하루 0.022%"})</li>
        </ul>
        {next && <p className="mt-2 text-muted-foreground">{next.until}까지 신고하면 신고 가산세 {pct(next.rate)} 감면 구간이에요. 하루라도 빨리 낼수록 납부지연 가산세도 줄어요.</p>}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{PENALTY_NOTE} 기준일 {PENALTY_AS_OF}. 입력값은 서버로 보내지 않아요. <a className="underline" href="/ko/vat-penalty-calculator/">부가세 가산세(세금계산서 포함)</a></p>
    </>
      )}
    </CurveShell>
  );
}
