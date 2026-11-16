// 자진퇴사 실업급여 정당 사유 점검 (2026-11-16, Gemini 이전 A). 판정: lib/kr-welfare-2026.ts voluntaryQuitCheck.
import { WELFARE_AS_OF, QUIT_REASONS, voluntaryQuitCheck, type QuitReasonId, type VoluntaryQuitInput } from "../../../lib/kr-welfare-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import BarTrack from "../viz/BarTrack";
import ChartFrame from "../viz/ChartFrame";
import ModeToggle from "../viz/ModeToggle";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, YES_NO, useSaved } from "./common";

const TOOL_ID = "voluntary-quit-unemployment-checker";
const EXAMPLE: VoluntaryQuitInput = { reasons: ["unpaidWages"], months: 2, commuteHours: 0, careDays: 0, leaveRefused: false, insuredDays: 300 };
const itemName = (item: string) => {
  const m = item.match(/^(\d+)([가-힣])$/);
  return m ? `제${m[1]}호 ${m[2]}목` : item.includes("의") ? `제${item.replace("의", "호의")}` : `제${item}호`;
};
const HEAD = {
  likely: "고른 사유가 별표 2의 정당한 이직 사유에 해당하고 가입 기간도 채워, 자진퇴사여도 실업급여를 받을 가능성이 높아요.",
  check: "아직 요건이 모자라거나 증빙이 필요한 부분이 있어요. 아래 빨간 줄을 확인하세요.",
  unlikely: "해당하는 사유를 골라 주세요. 단순한 개인 사정의 자진퇴사는 실업급여를 받기 어려워요.",
} as const;

export default function VoluntaryQuit() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<VoluntaryQuitInput>("labor-voluntary-quit", EXAMPLE);
  const easy = mode === "easy";
  const edit = (p: Partial<VoluntaryQuitInput>) => setInput({ ...input, ...p });
  const toggle = (id: QuitReasonId) => edit({ reasons: input.reasons.includes(id) ? input.reasons.filter((x) => x !== id) : [...input.reasons, id] });
  const r = voluntaryQuitCheck(input);
  const needs = new Set(QUIT_REASONS.filter((q) => input.reasons.includes(q.id)).map((q) => q.needs));
  const reasons = r.results.map((x) => `${x.ok ? "✓" : "✗"} 별표 2 ${itemName(x.item)}: ${x.label}. ${x.why}`.trim());
  reasons.push(r.insuredOk ? "이직 전 18개월 동안 피보험 단위기간이 180일 이상이에요." : "이직 전 18개월 동안 피보험 단위기간(보수 받은 날)이 180일 이상이어야 해요.");

  const bars = [
    ...(needs.has("months") ? [{ label: "체불·근로조건 문제가 있었던 개월", value: input.months ?? 0, need: 2, max: 12, unit: "개월" }] : []),
    ...(needs.has("commute") ? [{ label: "통근 왕복 시간", value: input.commuteHours ?? 0, need: 3, max: 6, unit: "시간" }] : []),
    ...(needs.has("care") ? [{ label: "간호가 필요한 날", value: input.careDays ?? 0, need: 30, max: 90, unit: "일" }] : []),
    { label: "피보험 단위기간(18개월 중)", value: input.insuredDays, need: 180, max: 540, unit: "일" },
  ];

  const memo = () =>
    [
      `[자진퇴사 정당 사유 점검] 기준일 ${WELFARE_AS_OF}`,
      ...r.results.map((x) => `- 별표 2 ${itemName(x.item)} ${x.label}: ${x.ok ? "충족" : "부족"} (증빙: ${x.evidence})`),
      `피보험 단위기간 ${input.insuredDays}일(180일 ${r.insuredOk ? "충족" : "미달"})`,
      "근거: 고용보험법 제40조·제58조, 시행규칙 제101조②·별표 2. 최종 판단은 고용센터.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <fieldset>
          <legend className="text-sm font-medium text-muted-foreground">{easy ? "그만둔 이유를 모두 골라요" : "이직 사유(시행규칙 별표 2)"}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {QUIT_REASONS.map((q) => (
              <label key={q.id} className="flex min-h-11 cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="checkbox" className="mt-1" checked={input.reasons.includes(q.id)} onChange={() => toggle(q.id)} />
                <span>
                  {q.label}
                  {!easy && <span className="ml-1 text-xs text-muted-foreground">{itemName(q.item)}</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          {needs.has("months") && <NumberField label="그 일이 퇴사 전 1년 안에 몇 달 있었나요" value={input.months ?? 0} onChange={(v) => edit({ months: v })} suffix="개월" />}
          {needs.has("commute") && <NumberField label="바뀐 뒤 통근 왕복 시간(대중교통 기준)" value={input.commuteHours ?? 0} onChange={(v) => edit({ commuteHours: v })} suffix="시간" step={0.5} />}
          {needs.has("care") && <NumberField label="가족 간호가 필요한 날" value={input.careDays ?? 0} onChange={(v) => edit({ careDays: v })} suffix="일" />}
          <NumberField label={easy ? "퇴사 전 18개월 동안 월급 받은 날(유급 주휴 포함, 1년 일하면 보통 300일 안팎)" : "피보험 단위기간(이직 전 18개월)"} value={input.insuredDays} onChange={(v) => edit({ insuredDays: v })} suffix="일" />
        </div>
        {(needs.has("care") || needs.has("leaveRefused")) && (
          <ChoiceChips<"yes" | "no"> legend="회사가 휴가·휴직(업무 전환)을 허용하지 않았나요?" value={input.leaveRefused ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ leaveRefused: v === "yes" })} />
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard headline={HEAD[r.verdict]} reasons={reasons} easy={easy} stats={[{ label: "충족한 사유", value: `${r.results.filter((x) => x.ok).length}개` }, { label: "가입 기간 180일", value: r.insuredOk ? "충족" : "부족" }]} />
        <ChartFrame title="기준선까지 얼마나 왔나" caption="세로선이 법이 정한 기준이에요. 막대가 선을 넘으면 그 요건을 채운 거예요." table={[["항목", "지금", "기준"], ...bars.map((b) => [b.label, `${b.value}${b.unit}`, `${b.need}${b.unit} 이상`])]}>
          <div className="space-y-3">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{b.label}</span>
                  <span className="font-mono text-foreground">{b.value}{b.unit} / {b.need}{b.unit}</span>
                </div>
                <BarTrack segments={[{ from: 0, to: (Math.min(b.value, b.max) / b.max) * 100, tone: b.value >= b.need ? "primary" : "destructive" }]} marker={(b.need / b.max) * 100} />
              </div>
            ))}
          </div>
        </ChartFrame>
        {easy ? (
          <HowToApply
            items={[
              "퇴사하면 회사가 고용센터에 이직확인서를 내요. 사유 코드가 '개인 사정'으로 되어 있어도 고용센터에서 정당 사유를 주장할 수 있어요.",
              "고용24(work24.go.kr)에서 구직 신청 → 수급자격 인정 신청을 하고, 아래 증빙을 함께 내요.",
              ...r.results.map((x) => `${x.label}: ${x.evidence}`),
              "퇴사 다음 날부터 12개월이 지나면 남은 실업급여를 못 받아요. 빨리 신청하세요.",
            ]}
            note="금액은 실업급여 계산기로 확인해요. 최종 판단은 고용센터가 하고, 거절되면 90일 안에 심사청구할 수 있어요. 상담 1350."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <CopyMemo text={memo} />
            <button type="button" onClick={reset} className="min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
              예시로 되돌리기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
