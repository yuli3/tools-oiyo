// 체불임금 대지급금 (2026-11-16). 계산: lib/kr-welfare-2026.ts.
import { WELFARE_AS_OF, guaranteeMonthlyCap, wageGuarantee, type GuaranteeInput, type GuaranteeKind } from "../../../lib/kr-welfare-2026";
import { GUARANTEE_ASSUMPTIONS, guaranteeTotal } from "../../../lib/kr-welfare-scenarios";
import BridgeChart from "../viz/BridgeChart";
import ChoiceChips from "../payroll/ChoiceChips";
import CompareBars from "../viz/CompareBars";
import NumberField from "../payroll/NumberField";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "unpaid-wage-guarantee-calculator";
const EXAMPLE: GuaranteeInput = { kind: "simpleRetired", age: 35, monthlyWage: 3_000_000, unpaidMonths: 3, unpaidSeverance: 9_000_000, serviceYears: 3, afterReform: true };
const KINDS: { value: GuaranteeKind; label: string }[] = [
  { value: "simpleRetired", label: "그만뒀고 회사는 그대로(간이)" },
  { value: "insolvency", label: "회사가 망했거나 문을 닫음(도산)" },
  { value: "simpleEmployed", label: "아직 다니는 중(재직자 간이)" },
];

export default function WageGuarantee() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<GuaranteeInput>("welfare-guarantee", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<GuaranteeInput>) => setInput({ ...input, ...p });
  const r = wageGuarantee(input);
  const other = wageGuarantee({ ...input, kind: input.kind === "insolvency" ? "simpleRetired" : "insolvency" });
  const reasons: string[] = [];
  if (input.kind === "insolvency") {
    reasons.push(`퇴직할 때 ${input.age}세라 한 달(퇴직금은 1년)에 ${roughWon(r.cap)}까지 받아요.`);
    reasons.push(input.afterReform === false ? "도산 결정이 2026년 8월 20일 전이라 마지막 3개월 임금까지만 받아요." : "2026년 8월 20일 이후 도산이면 마지막 6개월 임금까지 받아요.");
  } else if (input.kind === "simpleRetired") reasons.push("간이대지급금은 임금 700만 원, 퇴직금 700만 원, 합쳐서 1,000만 원까지예요.");
  else reasons.push("재직자 간이대지급금은 마지막 3개월 임금 중 700만 원까지예요. 월급이 최저임금의 110% 미만 등 저소득이어야 해요.");
  if (r.rest > 0) reasons.push(`못 받은 ${roughWon(r.unpaid)} 중 약 ${roughWon(r.rest)}은 나라가 대신 주지 않아요. 이 몫은 민사소송·강제집행으로 회사에서 받아요.`);

  const memo = () =>
    [
      `[대지급금 추정] 기준일 ${WELFARE_AS_OF}`,
      `${KINDS.find((k) => k.value === input.kind)?.label}, 퇴직 당시 ${input.age}세, 월 임금 ${exactWon(input.monthlyWage)} × 체불 ${input.unpaidMonths}개월, 미지급 퇴직금 ${exactWon(input.unpaidSeverance)}(근속 ${input.serviceYears}년)`,
      `임금 ${exactWon(r.wagePay)}(${r.coveredMonths}개월분) + 퇴직급여 ${exactWon(r.severancePay)}(${r.coveredYears}년분) = ${exactWon(r.total)}, 남는 체불 ${exactWon(r.rest)}`,
      "근거: 임금채권보장법 제7조·제7조의2, 시행령 제7조, 대지급금 상한액 고시(2026-08-20 개정).",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<GuaranteeKind> legend={easy ? "지금 상황은요?" : "대지급금 종류"} value={input.kind} options={KINDS} onChange={(v) => edit({ kind: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "한 달 월급(세금 떼기 전)" : "월 임금(체불 월 평균)"} value={input.monthlyWage} onChange={(v) => edit({ monthlyWage: v })} />
          <NumberField label={easy ? "월급을 못 받은 달" : "체불 개월 수(최종분부터)"} value={input.unpaidMonths} onChange={(v) => edit({ unpaidMonths: Math.max(0, Math.round(v)) })} suffix="개월" />
          <NumberField label={easy ? "그만둘 때 나이" : "퇴직 당시 연령(만)"} value={input.age} onChange={(v) => edit({ age: Math.max(15, Math.round(v)) })} suffix="세" />
          {input.kind !== "simpleEmployed" && (
            <>
              <MoneyField label={easy ? "못 받은 퇴직금" : "미지급 퇴직금 전액"} value={input.unpaidSeverance} onChange={(v) => edit({ unpaidSeverance: v })} hint="모르면 월급 × 근속연수" />
              <NumberField label={easy ? "다닌 햇수" : "퇴직금 산정 근속연수"} value={input.serviceYears} onChange={(v) => edit({ serviceYears: Math.max(0, v) })} suffix="년" step={0.5} />
            </>
          )}
        </div>
        {input.kind === "insolvency" && (
          <ChoiceChips<"after" | "before">
            legend={easy ? "법원 회생·파산 결정이나 노동청 도산 인정이 언제였나요?" : "회생개시·파산선고·도산등사실인정 시점"}
            value={input.afterReform === false ? "before" : "after"}
            options={[
              { value: "after", label: "2026년 8월 20일 이후" },
              { value: "before", label: "그 전" },
            ]}
            onChange={(v) => edit({ afterReform: v === "after" })}
          />
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.total > 0 ? `나라에서 약 ${roughWon(r.total)}을 먼저 받을 수 있어요(추정).` : "입력한 체불이 없어요. 못 받은 달과 퇴직금을 넣어 주세요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: `임금 (${r.coveredMonths}개월분)`, value: money(r.wagePay) },
            { label: `퇴직금 (${r.coveredYears}년분)`, value: money(r.severancePay) },
            { label: "남는 체불", value: money(r.rest) },
          ]}
        />
        <BridgeChart
          title="못 받은 돈 중 나라가 먼저 주는 몫"
          steps={[
            { label: "못 받은 돈", value: r.unpaid, kind: "total" },
            { label: "상한·기간 밖", value: -r.rest, kind: "add" },
            { label: "대지급금", value: r.total, kind: "total" },
          ]}
          format={money}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={input.kind === "simpleEmployed" ? GUARANTEE_ASSUMPTIONS.slice(0, 2) : GUARANTEE_ASSUMPTIONS}
          evaluate={guaranteeTotal}
          sliders={["unpaidMonths", "monthlyWage"]}
          sweeps={input.kind === "simpleEmployed" ? ["unpaidMonths", "monthlyWage"] : ["unpaidMonths", "monthlyWage", "unpaidSeverance"]}
          yLabel="대지급금"
          formatY={roughWon}
          caption={(k) => (k === "unpaidMonths" ? "도산은 6개월(이전 3개월), 간이는 3개월까지만 늘어요." : k === "monthlyWage" && input.kind === "insolvency" ? `월급이 나이별 상한 ${roughWon(guaranteeMonthlyCap(input.age))}을 넘으면 더 늘지 않아요.` : undefined)}
        />
        {input.kind !== "simpleEmployed" && (
          <CompareBars
            title="도산 대지급금과 간이 대지급금 비교"
            caption="회사가 실제로 망했다면 도산 대지급금이 더 클 수 있어요. 간이는 법원 판결·노동청 체불 확인서만 있으면 돼요."
            items={[
              { label: input.kind === "insolvency" ? "도산(지금)" : "간이(지금)", value: r.total, current: true },
              { label: input.kind === "insolvency" ? "간이였다면" : "도산이었다면", value: other.total },
            ]}
            format={money}
          />
        )}
        {easy ? (
          <HowToApply
            items={[
              "고용노동부(지방노동관서)에 임금체불 진정을 내요. 노동포털이나 1350 상담센터에서 할 수 있어요.",
              "간이: 노동청이 '체불임금등·사업주 확인서'를 내주면, 그걸로 법원에 지급명령·소송을 하고 판결이 나면 근로복지공단에 신청해요.",
              "도산: 회사가 회생·파산하거나 노동청에서 도산 인정을 받으면 근로복지공단에 바로 신청해요.",
              "간이는 퇴직 다음 날부터 2년 안에 소송 등을 시작해야 하고, 판결 확정 뒤 1년 안에 신청해요.",
              "돈이 없어서 소송이 어렵다면 대한법률구조공단(132)의 무료 소송 지원을 받아요.",
            ]}
            note="이 결과는 추정이에요. 실제 금액은 근로복지공단이 체불 확인 자료로 정해요."
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
