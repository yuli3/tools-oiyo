// 중소기업 취업 청년 소득세 감면 계산 (2026-11-16, Gemini 이전 B 2차). 계산: lib/kr-household-tax-2026.ts smeYouthReduction.
import { HOUSEHOLD_TAX_AS_OF, YOUTH_REDUCTION, smeYouthReduction, type SmeYouthInput } from "../../../lib/kr-household-tax-2026";
import { YOUTH_ASSUMPTIONS, youthYearly } from "../../../lib/kr-welfare-scenarios";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "sme-youth-income-tax-reduction-calculator";
const EXAMPLE: SmeYouthInput = { salary: 36_000_000, persons: 1, ageAtContract: 29, militaryMonths: 0, start: "2026-03" };

export default function SmeYouthTax() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<SmeYouthInput>("household-sme-youth", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<SmeYouthInput>) => setInput({ ...input, ...p });
  const r = smeYouthReduction(input);

  const reasons: string[] = [];
  if (!r.ageOk) reasons.push(`근로계약일 나이에서 병역 기간(최대 6년)을 빼면 ${r.countedAge}세라 청년(15~34세) 감면 대상이 아니에요. 60세 이상·장애인·경력단절자는 3년 70%로 따로 받을 수 있어요.`);
  else {
    reasons.push(`근로소득세의 90%를 깎아 주고, 한 해 200만 원까지예요.${r.capped ? " 이 연봉은 한도에 걸려 200만 원(지방세 포함 220만 원)을 받아요." : ""}`);
    reasons.push(`감면 전 세금 ${roughWon(r.taxWithout)} → 감면 후 ${roughWon(r.taxWith)}(지방소득세 포함, 4대보험 공제 추정).`);
    if (r.endMonth) reasons.push(`취업일부터 5년이 되는 날이 속한 달(${r.endMonth})까지 받아요. 이직해도 남은 기간은 다른 중소기업에서 이어서 받을 수 있어요.`);
  }
  reasons.push("2026년 세법개정안은 2027년 이후 비수도권 취업자의 감면 기간을 6~10년으로 늘리는 안이에요(국회 통과 전이라 계산에는 넣지 않았어요).");

  const memo = () =>
    [
      `[중소기업 취업 청년 소득세 감면] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `총급여 ${exactWon(input.salary)}, 계약일 나이 ${input.ageAtContract}세 − 병역 ${input.militaryMonths ?? 0}개월 → ${r.countedAge}세 (${r.ageOk ? "대상" : "대상 아님"})`,
      `1년 감면 ${exactWon(r.yearly)}(국세 ${exactWon(r.national)} + 지방세 ${exactWon(r.local)}), 5년 합계 추정 ${exactWon(r.fiveYear)}, 끝나는 달 ${r.endMonth}`,
      "근거: 조세특례제한법 제30조, 시행령 제27조. 회사에 감면 신청서를 내야 원천징수에 반영돼요.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "1년 연봉(식대 등 비과세 빼고)" : "총급여"} value={input.salary} onChange={(v) => edit({ salary: v })} />
          <NumberField label="근로계약할 때 만 나이" value={input.ageAtContract} onChange={(v) => edit({ ageAtContract: Math.max(0, Math.round(v)) })} suffix="세" />
          <NumberField label="군 복무 개월(없으면 0)" value={input.militaryMonths ?? 0} onChange={(v) => edit({ militaryMonths: Math.max(0, Math.round(v)) })} suffix="개월" />
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">취업한 달</span>
            <input type="month" value={input.start} onChange={(e) => edit({ start: e.target.value })} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
          </label>
          {!easy && <NumberField label="기본공제 인원(본인 포함)" value={input.persons ?? 1} onChange={(v) => edit({ persons: Math.max(1, Math.round(v)) })} suffix="명" />}
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.ageOk ? `1년에 약 ${roughWon(r.yearly)}, 5년이면 약 ${roughWon(r.fiveYear)}을 덜 내요(추정).` : "나이 요건에 맞지 않아 청년 감면은 어려워요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "감면 전 세금", value: money(r.taxWithout) },
            { label: "감면 후 세금", value: money(r.taxWith) },
            { label: "끝나는 달", value: r.endMonth || "-" },
          ]}
        >
          <CompareBars
            title="1년 소득세(지방세 포함)"
            items={[
              { label: "감면 전", value: r.taxWithout },
              { label: "감면 후", value: r.taxWith, current: true },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={YOUTH_ASSUMPTIONS}
          evaluate={youthYearly}
          sliders={["salary"]}
          sweeps={["salary"]}
          yLabel="1년 감면액"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "salary" ? "연봉이 오를수록 감면도 늘다가, 국세 200만 원(지방세 포함 220만 원)에서 멈춰요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 신청해요"
            items={[
              "회사에 '중소기업 취업자 소득세 감면 신청서'를 내요(병역 기간이 있으면 병적증명서도). 다음 달 월급부터 원천징수가 줄어요.",
              "회사가 감면 대상 명세서를 다음 달 10일까지 세무서에 내요.",
              "지난해 놓쳤다면 5년 안에 홈택스에서 경정청구로 돌려받을 수 있어요.",
              "대기업·공공기관, 전문서비스업(법무·회계·세무 등), 금융·보험업 등은 대상이 아니에요.",
            ]}
            note={`법령 정보이며 세무 대리·자문이 아니에요. 청년 나이 범위 ${YOUTH_REDUCTION.minAge}~${YOUTH_REDUCTION.maxAge}세.`}
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
