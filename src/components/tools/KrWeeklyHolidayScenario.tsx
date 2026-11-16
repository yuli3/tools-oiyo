// 주휴수당 (2026-11-16 쉬운 설명·가정 변화 적용). 자격 확인이 필요한 기존 계산기는 전문가 모드 아래 펼치기로 남겨요.
import { RATES } from "../../lib/kr-payroll-2026";
import { WEEKLY_ASSUMPTIONS, weeklyBridge, weeklyMonthly, weeklyPlain, weeklyResult, type WeeklyLite } from "../../lib/kr-money-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";
import WeeklyHolidayPayCalculator from "./WeeklyHolidayPayCalculator";

const KEYS = ["hourly", "days", "hours"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: WeeklyLite = { hourly: RATES.minimumWage, days: 5, hours: 4 };

export default function KrWeeklyHolidayScenario() {
  return (
    <ScenarioTool<WeeklyLite, Key>
      toolId="weekly-holiday-pay-calculator"
      example={EXAMPLE}
      assumptions={WEEKLY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={weeklyMonthly}
      resultName="한 달 받는 돈"
      questions={({ input, edit }) => [
        { title: "시급은 얼마인가요?", keys: ["hourly"], body: (
          <>
            <MoneyField label="시급" value={input.hourly} onChange={(v) => edit({ hourly: v }, ["hourly"])} />
            <p className="mt-2 text-xs text-muted-foreground">2026년 최저시급은 {RATES.minimumWage.toLocaleString("ko-KR")}원이에요.</p>
          </>
        ) },
        { title: "일주일에 며칠, 하루 몇 시간 일하나요?", keys: ["days", "hours"], body: (
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="일주일에" value={input.days} onChange={(v) => edit({ days: v }, ["days"])} suffix="일" step={1} min={1} />
            <NumberField label="하루" value={input.hours} onChange={(v) => edit({ hours: v }, ["hours"])} suffix="시간" step={0.5} min={0.5} />
          </div>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyField label="시급" value={input.hourly} onChange={(v) => edit({ hourly: v }, ["hourly"])} />
          <NumberField label="주 소정근로일" value={input.days} onChange={(v) => edit({ days: v }, ["days"])} suffix="일" step={1} min={1} />
          <NumberField label="1일 소정근로시간" value={input.hours} onChange={(v) => edit({ hours: v }, ["hours"])} suffix="시간" step={0.5} min={0.5} />
        </div>
      )}
      summary={weeklyPlain}
      metrics={(i, s) => {
        const r = weeklyResult(i);
        return [
          { label: "주휴수당(주)", value: s.money(r.holidayPay), tone: "primary" },
          { label: "한 주 받는 돈", value: s.money(r.weeklyPay) },
          { label: "한 달(4.345주)", value: s.money(r.monthlyPay) },
        ];
      }}
      sliders={["hourly", "days", "hours"]}
      sweeps={["hours", "days", "hourly"]}
      sweepCaption={(a) => (a.key === "hours" || a.key === "days" ? "주 15시간을 넘는 순간 주휴수당이 생겨서 곡선이 뛰어올라요. 주 40시간부터는 주휴가 8시간으로 고정돼요." : undefined)}
      charts={(i, s) => <BridgeChart title="한 주 받는 돈" steps={weeklyBridge(i)} format={s.money} />}
      ask={[
        "그 주에 정해진 날을 모두 나와야(개근) 주휴수당이 생겨요.",
        "다음 주에 계속 일하지 않으면(마지막 주) 주휴수당이 없을 수 있어요.",
        "주 15시간 이상이면 1년 넘게 일했을 때 퇴직금도 생겨요.",
      ]}
      expertFooter={(i) => {
        const r = weeklyResult(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `주 소정근로시간 = ${i.days}일 × ${i.hours}시간 = ${r.weeklyHours}시간`,
                r.holidayHours > 0 ? `주휴시간 = min(${r.weeklyHours}, 40) ÷ 40 × 8 = ${r.holidayHours.toFixed(2)}시간` : "주 15시간 미만이라 주휴시간 0",
                `주휴수당 = ${r.holidayHours.toFixed(2)}시간 × ${exactWon(i.hourly)} = ${exactWon(r.holidayPay)}(근로기준법 제55조, 시행령 제30조)`,
                `월 환산 = 주급 ${exactWon(r.weeklyPay)} × 4.345주 = ${exactWon(r.monthlyPay)}`,
              ]}
              next={[
                { href: "/ko/daily-worker-insurance-checker/", label: "알바 4대보험 확인" },
                { href: "/ko/salary-calculator/", label: "월급 실수령액" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">자격 요건까지 확인하며 계산하기(한 줄 입력 지원)</summary>
              <div className="mt-3">
                <WeeklyHolidayPayCalculator />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
