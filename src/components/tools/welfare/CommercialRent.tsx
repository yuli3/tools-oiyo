// 상가 임대료 인상 5% 상한 점검 (2026-11-16, Gemini 이전 B). 계산: lib/kr-household-tax-2026.ts commercialRentCheck.
import { COMMERCIAL_LEASE, HOUSEHOLD_TAX_AS_OF, LEASE_REGION_LABEL, commercialRentCheck, type CommercialRentInput, type LeaseRegion } from "../../../lib/kr-household-tax-2026";
import { COMMERCIAL_ASSUMPTIONS, commercialExcess } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "commercial-rent-increase-checker";
const EXAMPLE: CommercialRentInput = { region: "seoul", deposit: 100_000_000, monthlyRent: 5_000_000, newDeposit: 100_000_000, newMonthlyRent: 5_500_000, monthsSinceLast: 24, baseRate: COMMERCIAL_LEASE.baseRate };
const REGIONS = (Object.keys(LEASE_REGION_LABEL) as LeaseRegion[]).map((value) => ({ value, label: LEASE_REGION_LABEL[value] }));
const pct = (r: number) => `${Math.round(r * 1000) / 10}%`;

export default function CommercialRent() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<CommercialRentInput>("household-commercial-rent", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<CommercialRentInput>) => setInput({ ...input, ...p });
  const r = commercialRentCheck(input);
  const assumptions = COMMERCIAL_ASSUMPTIONS(input);

  const reasons: string[] = [
    `환산보증금은 보증금 + 월세 × 100 = ${roughWon(r.converted)}이에요. ${LEASE_REGION_LABEL[input.region]} 기준은 ${roughWon(r.limit)}이라 ${r.covered ? "5% 상한이 적용돼요" : "5% 상한은 적용되지 않아요"}.`,
  ];
  if (r.covered) {
    reasons.push(`올릴 수 있는 한도는 보증금 ${roughWon(r.maxDeposit)}, 월세 ${roughWon(r.maxRent)}이에요(각각 5%${r.convertedRent > 0 ? `, 보증금을 줄인 몫을 연 ${pct(r.conversionRate)}로 월세로 돌린 ${roughWon(r.convertedRent)} 포함` : ""}).`);
    if (r.verdict === "over") reasons.push(`요구액이 상한을 ${[r.rentExcess > 0 ? `월세 ${roughWon(r.rentExcess)}` : null, r.depositExcess > 0 ? `보증금 ${roughWon(r.depositExcess)}` : null].filter(Boolean).join(", ")} 넘어요. 넘는 부분은 거절할 수 있고, 이미 냈다면 돌려 달라고 할 수 있어요.`);
    if (r.verdict === "tooSoon") reasons.push("마지막으로 올리고 1년이 안 됐으면 다시 올릴 수 없어요(제11조②).");
  } else {
    reasons.push("기준을 넘어도 계약갱신요구권(최초 계약부터 10년), 대항력, 권리금 회수 보호는 그대로 적용돼요(제10조의2). 인상률은 주변 시세·경제 사정을 근거로 다툴 수 있어요.");
  }
  if (!easy) reasons.push(`보증금과 월세를 전환율 ${pct(r.conversionRate)}로 합쳐 보면 실질 인상률은 ${pct(r.combinedRate)}이에요(참고).`);

  const headline =
    r.verdict === "notCovered" ? "환산보증금이 기준을 넘어 5% 상한은 적용되지 않아요." : r.verdict === "tooSoon" ? "올린 지 1년이 안 돼 이번 인상은 거절할 수 있어요." : r.verdict === "over" ? "5% 상한을 넘는 인상이에요. 넘는 부분은 거절할 수 있어요." : r.increased ? "5% 상한 안의 인상이에요." : "올리지 않거나 내리는 조건이에요.";

  const memo = () =>
    [
      `[상가 임대료 인상 5% 점검] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `${LEASE_REGION_LABEL[input.region]}, 보증금 ${exactWon(input.deposit)} / 월세 ${exactWon(input.monthlyRent)} → 환산보증금 ${exactWon(r.converted)} (기준 ${exactWon(r.limit)}, ${r.covered ? "적용" : "미적용"})`,
      `요구: 보증금 ${exactWon(input.newDeposit)} / 월세 ${exactWon(input.newMonthlyRent)}, 상한 보증금 ${exactWon(r.maxDeposit)} / 월세 ${exactWon(r.maxRent)}`,
      `지난 인상 후 ${input.monthsSinceLast}개월, 전환율 ${pct(r.conversionRate)}, 판정 ${headline}`,
      "근거: 상가건물 임대차보호법 제2조·제10조의2·제11조·제12조, 시행령 제2조·제4조(5%)·제5조(12%, 기준금리 4.5배).",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<LeaseRegion> legend="상가가 어디에 있나요?" value={input.region} options={REGIONS} onChange={(v) => edit({ region: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="지금 보증금" value={input.deposit} onChange={(v) => edit({ deposit: v })} />
          <MoneyField label="지금 월세" value={input.monthlyRent} onChange={(v) => edit({ monthlyRent: v })} />
          <MoneyField label={easy ? "올려 달라는 보증금" : "증액 요구 보증금"} value={input.newDeposit} onChange={(v) => edit({ newDeposit: v })} />
          <MoneyField label={easy ? "올려 달라는 월세" : "증액 요구 월세"} value={input.newMonthlyRent} onChange={(v) => edit({ newMonthlyRent: v })} />
          <NumberField label="계약 또는 마지막 인상 후 지난 개월" value={input.monthsSinceLast} onChange={(v) => edit({ monthsSinceLast: Math.max(0, Math.round(v)) })} suffix="개월" />
          {!easy && <NumberField label="한국은행 기준금리" value={Math.round((input.baseRate ?? COMMERCIAL_LEASE.baseRate) * 10000) / 100} onChange={(v) => edit({ baseRate: Math.max(0, v) / 100 })} suffix="%" step={0.25} />}
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={headline}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "환산보증금", value: money(r.converted) },
            { label: "월세 상한", value: r.covered ? money(r.maxRent) : "적용 안 됨" },
            { label: "넘는 월세", value: money(r.rentExcess) },
          ]}
        >
          <CompareBars
            title="월세: 지금, 상한, 요구액"
            items={[
              { label: "지금 월세", value: input.monthlyRent },
              { label: "5% 상한", value: r.maxRent },
              { label: "요구 월세", value: input.newMonthlyRent, current: true },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={assumptions}
          evaluate={commercialExcess}
          sliders={["newMonthlyRent"]}
          sweeps={["newMonthlyRent", "baseRate"]}
          yLabel="상한을 넘는 월세"
          formatY={roughWon}
          noTornado
          caption={(k) =>
            k === "newMonthlyRent" ? "5% 선을 넘는 만큼이 그대로 거절할 수 있는 금액이에요." : k === "baseRate" ? "보증금을 월세로 돌릴 때만 영향이 있어요. 기준금리 × 4.5가 12%보다 낮으면 그 비율이 상한이에요." : undefined
          }
        />
        {easy ? (
          <HowToApply
            title="이렇게 대응해요"
            items={[
              "임대인에게 5% 상한(상가임대차법 시행령 제4조)을 넘는 부분은 동의하지 않는다고 문자나 내용증명으로 답해요.",
              "갱신을 원하면 계약 만료 6개월~1개월 전에 갱신을 요구해요. 최초 계약부터 10년까지 요구할 수 있어요.",
              "합의가 안 되면 상가건물임대차분쟁조정위원회(대한법률구조공단 등)에 무료로 조정을 신청해요.",
            ]}
            note="법령 정보이며 법률 대리·자문이 아니에요. 대한법률구조공단 132."
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
