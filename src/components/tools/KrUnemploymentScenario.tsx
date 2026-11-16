// 실업급여(구직급여) (2026-11-16 쉬운 설명·가정 변화 적용). 상·하한·일수는 lib/kr-rates-2026.mjs(SSOT)에서만 읽어요.
import { JOBLESS_ASSUMPTIONS, joblessMarks, joblessPlain, joblessResult, joblessTotal, type JoblessLite, type PeriodCode } from "../../lib/kr-life-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";
import { KR_RATES_2026, unemploymentDays2026 } from "../../lib/kr-rates-2026.mjs";

const KEYS = ["wage", "hours", "age", "period"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: JoblessLite = { wage: 3_000_000, hours: 8, age: "under", period: "p3" };
const AGE = [
  { value: "under", label: "만 50세 미만" },
  { value: "over", label: "만 50세 이상·장애인" },
] as const satisfies readonly { value: JoblessLite["age"]; label: string }[];
const PERIOD = [
  { value: "p1", label: "1년 미만" },
  { value: "p2", label: "1~3년" },
  { value: "p3", label: "3~5년" },
  { value: "p4", label: "5~10년" },
  { value: "p5", label: "10년 이상" },
] as const satisfies readonly { value: PeriodCode; label: string }[];

export default function KrUnemploymentScenario() {
  return (
    <ScenarioTool<JoblessLite, Key>
      toolId="unemployment-benefits-calculator"
      example={EXAMPLE}
      assumptions={JOBLESS_ASSUMPTIONS}
      keys={KEYS}
      evaluate={joblessTotal}
      resultName="받는 실업급여 총액"
      marksFor={(key, i) => (key === "wage" ? joblessMarks(i) : undefined)}
      questions={({ input, edit }) => [
        { title: "퇴사 전 3개월 월급은 평균 얼마였나요?", keys: ["wage"], body: (
          <>
            <MoneyField label="세전 월평균(기본급·수당·상여 포함)" value={input.wage} onChange={(v) => edit({ wage: v }, ["wage"])} />
            <p className="mt-2 text-xs text-muted-foreground">대부분은 하한이나 상한에 걸려서 월급이 조금 달라도 결과가 같아요.</p>
          </>
        ) },
        { title: "퇴사할 때 나이는요?", keys: ["age"], body: <ChoiceChips<JoblessLite["age"]> legend="이직 당시 만 나이" value={input.age} options={AGE} onChange={(v) => edit({ age: v }, ["age"])} /> },
        { title: "고용보험에 가입한 기간은 모두 얼마인가요?", keys: ["period"], body: (
          <>
            <ChoiceChips<PeriodCode> legend="여러 회사를 합친 기간이에요(고용24에서 확인)" value={input.period} options={PERIOD} onChange={(v) => edit({ period: v }, ["period"])} />
          </>
        ) },
        { title: "하루 몇 시간 일했나요?", keys: ["hours"], body: <NumberField label="1일 소정근로시간(전일제는 8)" value={input.hours} onChange={(v) => edit({ hours: Math.min(8, Math.max(1, Math.round(v))) }, ["hours"])} suffix="시간" step={1} min={1} /> },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="퇴직 전 3개월 월평균 임금" value={input.wage} onChange={(v) => edit({ wage: v }, ["wage"])} />
            <NumberField label="1일 소정근로시간" value={input.hours} onChange={(v) => edit({ hours: Math.min(8, Math.max(1, Math.round(v))) }, ["hours"])} suffix="시간" step={1} min={1} />
          </div>
          <ChoiceChips<JoblessLite["age"]> legend="나이" value={input.age} options={AGE} onChange={(v) => edit({ age: v }, ["age"])} />
          <ChoiceChips<PeriodCode> legend="피보험기간" value={input.period} options={PERIOD} onChange={(v) => edit({ period: v }, ["period"])} />
        </div>
      )}
      summary={joblessPlain}
      metrics={(i, s) => {
        const r = joblessResult(i);
        return [
          { label: "총 받는 돈", value: s.money(r.total), tone: "primary" },
          { label: "하루 지급액", value: exactWon(r.dailyBenefit) },
          { label: "받는 날수", value: `${r.days}일` },
        ];
      }}
      sliders={["wage"]}
      sweepCaption={() => "왼쪽 점선(하한)까지는 평평하고, 오른쪽 점선(상한)부터 다시 평평해요. 그 사이에서만 월급에 따라 늘어요."}
      charts={(i, s) => (
        <CompareBars
          title="가입 기간별로 받는 총액"
          caption="표시된 막대가 지금 고른 기간이에요."
          items={PERIOD.map((p) => ({ label: p.label, value: joblessResult(i).dailyBenefit * (unemploymentDays2026(i.age, p.value) as number), current: p.value === i.period }))}
          format={s.money}
        />
      )}
      ask={["2026년 1월 1일 이후 퇴사자 기준이에요.", "자진 퇴사라도 임금 체불·통근 곤란 등 정당한 사유가 있으면 받을 수 있어요. 최종 판단은 고용센터가 해요."]}
      expertFooter={(i) => {
        const r = joblessResult(i);
        return (
          <ResultSteps
            steps={[
              `기초일액 = ${exactWon(i.wage)} ÷ 30 = ${exactWon(Math.round(r.baseDailyWage))}, 60% = ${exactWon(Math.floor(r.baseDailyWage * KR_RATES_2026.unemployment.replacementRate))}`,
              `하한 ${exactWon(r.minDailyFloor)} ~ 상한 ${exactWon(r.maxDailyCap)} 적용 → 하루 ${exactWon(r.dailyBenefit)}`,
              `${exactWon(r.dailyBenefit)} × 소정급여일수 ${r.days}일 = ${exactWon(r.total)}(비과세)`,
            ]}
            next={[{ href: "/ko/health-insurance-leaver-settlement/", label: "퇴사 건보 정산" }, { href: "/ko/severance-calculator/", label: "퇴직금" }]}
          />
        );
      }}
    />
  );
}
