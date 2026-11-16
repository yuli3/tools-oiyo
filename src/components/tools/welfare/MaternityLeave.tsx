// 출산전후휴가·배우자 출산휴가 급여 (2026-11-16). 계산: lib/kr-welfare-2026.ts.
import { WELFARE_AS_OF, MATERNITY, maternityLeavePay, spouseLeavePay, type BirthKind, type MaternityInput } from "../../../lib/kr-welfare-2026";
import { MATERNITY_ASSUMPTIONS, maternityTotal } from "../../../lib/kr-welfare-scenarios";
import BridgeChart from "../viz/BridgeChart";
import ChoiceChips from "../payroll/ChoiceChips";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "maternity-leave-pay-calculator";
const EXAMPLE: MaternityInput = { monthlyWage: 3_200_000, priorityFirm: true, kind: "single" };
const KINDS: { value: BirthKind; label: string }[] = [
  { value: "single", label: "한 아이(90일)" },
  { value: "multiple", label: "쌍둥이 이상(120일)" },
  { value: "premature", label: "미숙아(100일)" },
];
const FIRM = [
  { value: "sme", label: "중소기업(우선지원대상)" },
  { value: "large", label: "대기업" },
] as const;

export default function MaternityLeave() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<MaternityInput>("welfare-maternity", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<MaternityInput>) => setInput({ ...input, ...p });
  const r = maternityLeavePay(input);
  const s = spouseLeavePay(input.monthlyWage, input.priorityFirm);
  const reasons = [
    input.priorityFirm ? `중소기업이라 ${r.days}일 모두 고용보험에서 나와요. 처음 ${r.employerDays}일은 월급과 보험금의 차이를 회사가 채워야 해요.` : `대기업이라 처음 ${r.employerDays}일은 회사가 월급을 그대로 주고, 마지막 ${r.insuranceDays}일만 고용보험에서 나와요.`,
    r.capped ? `월급이 고용보험 상한(30일 220만 원)보다 많아서, 보험이 주는 기간에는 한 달 약 220만 원으로 줄어요.` : "월급이 상한보다 적어서 보험이 주는 기간에도 월급만큼 받아요.",
  ];
  if (r.floored) reasons.push("월급이 최저임금보다 낮게 입력돼 최저임금(월 2,156,880원)으로 계산했어요.");

  const memo = () =>
    [
      `[출산전후휴가 급여 추정] 기준일 ${WELFARE_AS_OF}`,
      `월 통상임금 ${exactWon(input.monthlyWage)}, ${input.priorityFirm ? "우선지원대상기업" : "대규모기업"}, ${KINDS.find((k) => k.value === input.kind)?.label}`,
      `총 ${r.days}일: 받는 돈 ${exactWon(r.employeeTotal)}(고용보험 ${exactWon(r.insurance)} · ${r.insuranceDays}일, 회사 ${exactWon(r.employerPay)}), 월급 대비 부족 ${exactWon(r.shortfall)}`,
      `배우자 출산휴가 20일: ${exactWon(s.employeeTotal)}(고용보험 ${exactWon(s.insurance)}, 회사 ${exactWon(s.employerPay)})`,
      "근거: 근로기준법 제74조, 남녀고용평등법 제18조·제18조의2, 고용보험법 제75조·제76조, 고용노동부고시 제2026-67호.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <MoneyField label={easy ? "한 달 월급(기본급 + 매달 고정 수당, 세금 떼기 전)" : "월 통상임금(휴가 시작일 기준)"} value={input.monthlyWage} onChange={(v) => edit({ monthlyWage: v })} hint="예: 320만" />
        <div className="grid gap-4 sm:grid-cols-2">
          <ChoiceChips<"sme" | "large"> legend={easy ? "회사 규모는요?" : "우선지원대상기업 여부"} value={input.priorityFirm ? "sme" : "large"} options={FIRM} onChange={(v) => edit({ priorityFirm: v === "sme" })} />
          <ChoiceChips<BirthKind> legend="출산" value={input.kind} options={KINDS} onChange={(v) => edit({ kind: v })} />
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={`출산휴가 ${r.days}일 동안 모두 약 ${roughWon(r.employeeTotal)}을 받아요(추정).${r.shortfall > 0 ? ` 평소 월급보다 약 ${roughWon(r.shortfall)} 적어요.` : ""}`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: `받는 돈 (${r.days}일)`, value: money(r.employeeTotal) },
            { label: `고용보험 (${r.insuranceDays}일)`, value: money(r.insurance) },
            { label: "회사가 주는 몫", value: money(r.employerPay) },
          ]}
        />
        <BridgeChart
          title="받는 돈은 이렇게 나뉘어요"
          steps={[
            { label: input.priorityFirm ? `고용보험 ${r.days}일` : `회사 ${r.employerDays}일`, value: input.priorityFirm ? r.insurance : r.employerPay, kind: "add" },
            { label: input.priorityFirm ? `회사 차액 ${r.employerDays}일` : `고용보험 ${r.insuranceDays}일`, value: input.priorityFirm ? r.employerPay : r.insurance, kind: "add" },
            { label: "받는 돈", value: r.employeeTotal, kind: "total" },
          ]}
          format={money}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={MATERNITY_ASSUMPTIONS}
          evaluate={maternityTotal}
          sliders={["monthlyWage"]}
          sweeps={["monthlyWage"]}
          yLabel="휴가 기간에 받는 돈"
          formatY={roughWon}
          noTornado
          caption={() => "월급이 220만 원을 넘으면 보험이 주는 기간의 금액이 더 늘지 않아 곡선이 완만해져요."}
        />
        <CompareBars
          title="배우자 출산휴가 20일"
          caption={input.priorityFirm ? "모두 유급이에요. 중소기업은 고용보험이 20일 최대 1,684,210원을 주고, 나머지는 회사가 채워요." : "모두 유급이고 대기업은 회사가 전부 줘요."}
          items={[
            { label: "고용보험", value: s.insurance },
            { label: "회사", value: s.employerPay },
            { label: "받는 돈", value: s.employeeTotal, current: true },
          ]}
          format={money}
        />
        {easy ? (
          <HowToApply
            items={[
              `출산 전후로 ${MATERNITY[input.kind].days}일, 출산 뒤에 ${input.kind === "multiple" ? 60 : 45}일 이상이 남게 써요.`,
              "회사가 고용센터에 '출산전후휴가 확인서'를 내요.",
              "휴가를 시작하고 1개월이 지나면 고용24(work24.go.kr)에서 급여를 신청해요(대기업은 60일 뒤부터).",
              "휴가가 끝난 날부터 12개월 안에 신청해야 받아요.",
            ]}
            note="고용보험에 180일 이상 가입했어야 해요. 프리랜서 등 미가입자는 출산급여 150만 원을 따로 신청해요."
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
