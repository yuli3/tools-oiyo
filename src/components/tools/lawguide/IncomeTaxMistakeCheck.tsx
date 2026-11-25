// 종합소득세 신고 전 실수 점검. 엔진: lib/kr-income-tax-mistakes-2026.ts (api MCP check_kr_income_tax_filing_mistakes와 같은 코드).
// 쉬운 모드: 걸린 패턴과 할 일만, "쉬운 말로 보기"로 한 줄씩. 전문가: 근거 조문, 미확인 목록, 메모 복사.
import { checkMistakes, MISTAKE_QUESTIONS, MISTAKES_AS_OF, type MistakeAnswers, type Yn } from "../../../lib/kr-income-tax-mistakes-2026";
import EasyRead from "../EasyRead";
import BarTrack from "../viz/BarTrack";
import ModeToggle from "../viz/ModeToggle";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, useSaved } from "../biz/common";

const TOOL_ID = "income-tax-filing-mistake-check";
const YN: { v: Yn; label: string }[] = [{ v: "yes", label: "예" }, { v: "no", label: "아니요" }, { v: "unknown", label: "모름" }];

export default function IncomeTaxMistakeCheck() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const easy = mode === "easy";
  const [a, setA] = useSaved<MistakeAnswers>("income-tax-mistakes-v1", {});
  const r = checkMistakes(a);
  const pick = (id: keyof MistakeAnswers, v: Yn) => { setA({ ...a, [id]: v }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const qs = MISTAKE_QUESTIONS.filter((q) => !(q.id === "rateChecked" && a.noBooks === "no"));

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="질문" className="space-y-4">
        {qs.map((q) => (
          <fieldset key={q.id} className="rounded-lg border border-border bg-card p-3">
            <legend className="px-1 text-sm font-semibold text-foreground">{q.label}</legend>
            {!easy && <p className="mt-1 text-xs text-muted-foreground">{q.why}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {YN.map((o) => (
                <button key={o.v} type="button" aria-pressed={a[q.id] === o.v} onClick={() => pick(q.id, o.v)}
                  className={`min-h-11 rounded-full border px-4 text-sm ${a[q.id] === o.v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </section>

      <section aria-live="polite" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-foreground">걸린 패턴 {r.hits.length}개</h2>
          <span className="text-xs text-muted-foreground">답한 질문 {r.answered}/{r.total}</span>
        </div>
        <BarTrack segments={[{ from: 0, to: Math.round((r.answered / r.total) * 100), tone: r.answered === r.total ? "primary" : "warning" }]} />
        <EasyRead items={[
          ...r.hits.map((h) => ({ kind: h.tone === "warn" ? ("warn" as const) : ("todo" as const), text: `${h.title}. ${h.fix} (${h.cite})` })),
          ...r.always.map((h) => ({ kind: h.id === "deadline" ? ("date" as const) : ("todo" as const), text: `${h.fix} (${h.cite})` })),
        ]} />
        {r.hits.length === 0 && <p className="text-sm text-foreground">아직 걸린 패턴이 없어요. "모름"으로 남은 질문을 먼저 확인해 보세요.</p>}
        <ul className="space-y-2">
          {r.hits.map((h) => (
            <li key={h.id} className={`rounded-md border bg-background px-3 py-2 text-sm leading-6 ${h.tone === "warn" ? "border-destructive/40" : "border-border"}`}>
              <strong className="text-foreground">{h.title}</strong>
              <span className="block text-foreground">{h.fix}</span>
              {!easy && <span className="block text-xs text-muted-foreground">{h.cite}</span>}
              {h.tools?.map((t) => <a key={t.href} href={t.href} className="mr-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">{t.title}</a>)}
            </li>
          ))}
        </ul>
        {r.unknown.length > 0 && (
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
            <p className="font-semibold text-foreground">미확인 {r.unknown.length}개</p>
            {!easy && <ul className="mt-1 list-disc pl-5 text-muted-foreground">{r.unknown.map((u) => <li key={u.id}>{u.label}</li>)}</ul>}
          </div>
        )}
        <ul className="space-y-1 text-sm text-foreground">
          {r.always.map((h) => <li key={h.id}><strong>{h.title}</strong>: {h.fix}{!easy && <span className="text-xs text-muted-foreground"> ({h.cite})</span>}</li>)}
        </ul>
        {!easy && <CopyMemo text={() => r.memo} />}
        <p className="text-xs text-muted-foreground">기준일 {MISTAKES_AS_OF}. 세액은 계산하지 않아요. 답은 이 브라우저에만 저장돼요.</p>
      </section>
    </div>
  );
}
