// 노인장기요양 본인부담금 (2026-11-16). 계산: lib/kr-welfare-2026.ts.
import { useMemo } from "react";
import { LTC_2026, WELFARE_AS_OF, longTermCareCopay, type LtcGrade, type LtcInput, type LtcReduction } from "../../../lib/kr-welfare-2026";
import { LTC_ASSUMPTIONS, ltcTotal } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "long-term-care-copay-calculator";
const EXAMPLE: LtcInput = { grade: "3", kind: "home", reduction: "none" };
const GRADES: { value: LtcGrade; label: string }[] = [
  { value: "1", label: "1등급" }, { value: "2", label: "2등급" }, { value: "3", label: "3등급" },
  { value: "4", label: "4등급" }, { value: "5", label: "5등급" }, { value: "cognitive", label: "인지지원" },
];
const REDUCTIONS: { value: LtcReduction; label: string }[] = [
  { value: "none", label: "해당 없음" }, { value: "40", label: "40% 감경" }, { value: "60", label: "60% 감경" }, { value: "basic", label: "기초생활수급자" },
];
const pct = (r: number) => `${Math.round(r * 1000) / 10}%`;

export default function LongTermCare() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<LtcInput>("welfare-ltc", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<LtcInput>) => setInput({ ...input, ...p });
  const r = longTermCareCopay(input);
  const assumptions = useMemo(() => LTC_ASSUMPTIONS(input), [input.kind, input.grade]);
  const sliders = assumptions.map((a) => a.key);
  const home = input.kind === "home";
  const other = longTermCareCopay({ ...input, kind: home ? "facility" : "home", homeUse: undefined });

  const reasons: string[] = [];
  if (home) {
    reasons.push(`${input.grade === "cognitive" ? "인지지원등급" : `${input.grade}등급`}은 한 달 ${roughWon(r.limit)}까지 공단이 대부분을 내고, 본인은 ${pct(r.rate)}만 내요.`);
    if (r.over > 0) reasons.push(`한도를 넘는 ${roughWon(r.over)}은 전부 본인이 내요.`);
    if (input.grade === "cognitive") reasons.push("인지지원등급은 주야간보호의 인지활동 프로그램 위주로 쓸 수 있고 방문요양은 쓸 수 없어요.");
  } else {
    if (!r.facilityAllowed) reasons.push("인지지원등급은 요양원(시설급여)에 들어갈 수 없어요.");
    else reasons.push(`요양원 하루 비용 ${roughWon(LTC_2026.facilityDaily[input.grade])} 중 본인은 ${pct(r.rate)}를 내고, 식사·간식 같은 비급여는 전액 내요.`);
    if (["3", "4", "5"].includes(input.grade)) reasons.push("3~5등급은 등급판정위원회가 시설급여가 필요하다고 인정해야 요양원에 들어갈 수 있어요.");
  }
  if (input.reduction === "basic") reasons.push("기초생활수급자는 급여 본인부담이 없어요(비급여는 내요).");
  else if (input.reduction !== "none") reasons.push(`소득·재산이 적어 본인부담의 ${input.reduction}%를 깎아 줘요.`);

  const memo = () =>
    [
      `[노인장기요양 본인부담 추정] 기준일 ${WELFARE_AS_OF}`,
      home
        ? `재가 ${input.grade}등급 한도 ${exactWon(r.limit)}, 이용 ${exactWon(r.use)} → 급여 본인부담 ${exactWon(r.copay)}(${pct(r.rate)}) + 한도 초과 ${exactWon(r.over)}`
        : `시설 ${input.grade}등급 ${exactWon(LTC_2026.facilityDaily[input.grade])} × ${input.days ?? 30}일 → 본인부담 ${exactWon(r.copay)}(${pct(r.rate)}) + 비급여 ${exactWon(r.extra)}`,
      `한 달 합계 ${exactWon(r.total)}, 공단 부담 ${exactWon(r.publicShare)}`,
      "근거: 노인장기요양보험법 제40조, 보건복지부고시 제2025-247호(2026년 장기요양급여비용).",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<LtcGrade> legend={easy ? "부모님 장기요양등급은?" : "장기요양등급"} value={input.grade} options={GRADES} onChange={(v) => edit({ grade: v })} />
        <ChoiceChips<LtcInput["kind"]> legend={easy ? "어떻게 돌봄을 받나요?" : "급여 종류"} value={input.kind} options={[{ value: "home", label: "집에서(방문요양·주야간보호)" }, { value: "facility", label: "요양원에 입소" }]} onChange={(v) => edit({ kind: v })} />
        <ChoiceChips<LtcReduction> legend={easy ? "본인부담 감경을 받나요?" : "본인부담 감경"} value={input.reduction} options={REDUCTIONS} onChange={(v) => edit({ reduction: v })} />
        {home ? (
          <MoneyField label={easy ? "한 달에 쓰는 서비스 비용(모르면 한도액)" : "월 재가급여 이용액(공단 수가 기준)"} value={input.homeUse ?? r.limit} onChange={(v) => edit({ homeUse: v })} hint={`이 등급 한도 ${exactWon(r.limit)}`} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="한 달 입소 일수" value={input.days ?? 30} onChange={(v) => edit({ days: Math.max(0, Math.min(31, Math.round(v))) })} suffix="일" />
            <MoneyField label="하루 식사·간식 등 비급여" value={input.dailyExtra ?? 15_000} onChange={(v) => edit({ dailyExtra: v })} hint="기관마다 달라요" />
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={!r.facilityAllowed ? "인지지원등급은 요양원에 들어갈 수 없어요. 재가급여로 계산해 보세요." : `한 달에 약 ${roughWon(r.total)}을 내요(추정).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "급여 본인부담", value: money(r.copay) },
            { label: home ? "한도 초과(전액 본인)" : "비급여(식사 등)", value: money(home ? r.over : r.extra) },
            { label: "공단이 내는 돈", value: money(r.publicShare) },
          ]}
        >
          {r.facilityAllowed && other.facilityAllowed && (
            <CompareBars
              title="집에서 vs 요양원, 한 달 본인 부담"
              caption="재가는 한도액을 다 쓴다고 봤고, 요양원은 30일·하루 비급여 1.5만 원 기준이에요."
              items={[
                { label: "집에서", value: home ? r.total : other.total, current: home },
                { label: "요양원", value: home ? other.total : r.total, current: !home },
              ]}
              format={money}
            />
          )}
        </ResultCard>
        {r.facilityAllowed && (
          <ScenarioBlock
            toolId={TOOL_ID}
            mode={mode}
            input={input}
            onSlide={setInput}
            assumptions={assumptions}
            evaluate={ltcTotal}
            sliders={sliders}
            sweeps={sliders}
            yLabel="한 달 본인 부담"
            formatY={roughWon}
            noTornado={sliders.length < 2}
            caption={(key) => (key === "homeUse" ? "한도액까지는 15%만 늘다가, 넘는 순간부터 쓴 만큼 그대로 늘어요." : undefined)}
          />
        )}
        {easy ? (
          <HowToApply
            title="이렇게 신청해요"
            items={["국민건강보험공단(1577-1000)이나 지사에 장기요양인정을 신청해요. 65세 이상, 또는 65세 미만 노인성 질병이 있으면 돼요.", "공단 직원이 집에 와서 조사하고, 의사소견서를 내면 약 30일 안에 등급이 나와요.", "등급이 나오면 장기요양기관과 계약해요. 감경은 소득·재산 기준으로 공단이 자동 판정하거나 신청해요."]}
            note="실제 비용은 기관 수가와 이용 시간에 따라 달라요. 이 결과는 추정이에요."
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
