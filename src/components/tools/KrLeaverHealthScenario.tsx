// 퇴사월 건강보험 정산 (2026-11-16 쉬운 설명·가정 변화 적용). 한 줄 입력이 있는 기존 계산기는 전문가 모드 아래에 남겨요.
import { LEAVER_ASSUMPTIONS, leaverBridge, leaverPlain, leaverResult, leaverTotal, type LeaverLite } from "../../lib/kr-money-scenarios";
import HealthInsuranceLeaverSettlement from "./HealthInsuranceLeaverSettlement";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import LegacyDetails from "./viz/LegacyDetails";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["totalPay", "monthsWorked", "monthsCharged", "noticeMonthly"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: LeaverLite = { totalPay: 30_000_000, monthsWorked: 6, monthsCharged: 6, noticeMonthly: 4_500_000 };

export default function KrLeaverHealthScenario() {
  return (
    <ScenarioTool<LeaverLite, Key>
      toolId="health-insurance-leaver-settlement"
      example={EXAMPLE}
      assumptions={LEAVER_ASSUMPTIONS}
      keys={KEYS}
      evaluate={leaverTotal}
      resultName="정산액(+더 냄 / −돌려받음)"
      questions={({ input, edit }) => [
        { title: "올해 이 회사에서 받은 월급은 모두 얼마인가요?", keys: ["totalPay", "monthsWorked"], body: (
          <div className="space-y-3">
            <MoneyField label="올해 받은 월급 합계(상여·성과급 포함, 비과세 빼고)" value={input.totalPay} onChange={(v) => edit({ totalPay: v }, ["totalPay"])} />
            <NumberField label="올해 일한 달" value={input.monthsWorked} onChange={(v) => edit({ monthsWorked: v, monthsCharged: v }, ["monthsWorked", "monthsCharged"])} suffix="개월" step={1} min={1} />
          </div>
        ) },
        { title: "급여명세서의 건강보험료는 어떤 월급 기준이었나요?", keys: ["noticeMonthly"], body: (
          <>
            <MoneyField label="보험료를 매긴 월급(보통 작년 평균 월급)" value={input.noticeMonthly} onChange={(v) => edit({ noticeMonthly: v }, ["noticeMonthly"])} />
            <p className="mt-2 text-xs text-muted-foreground">모르면 급여명세서의 건강보험료 ÷ 3.595%로 구할 수 있어요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="당해 보수총액" value={input.totalPay} onChange={(v) => edit({ totalPay: v }, ["totalPay"])} />
          <MoneyField label="고지 보수월액" value={input.noticeMonthly} onChange={(v) => edit({ noticeMonthly: v }, ["noticeMonthly"])} />
          <NumberField label="근무 월수" value={input.monthsWorked} onChange={(v) => edit({ monthsWorked: v }, ["monthsWorked"])} suffix="개월" step={1} min={1} />
          <NumberField label="보험료 부과 월수" value={input.monthsCharged} onChange={(v) => edit({ monthsCharged: v }, ["monthsCharged"])} suffix="개월" step={1} min={0} />
        </div>
      )}
      summary={leaverPlain}
      metrics={(i, s) => {
        const r = leaverResult(i);
        return [
          { label: r.total >= 0 ? "더 낼 돈" : "돌려받을 돈", value: s.money(Math.abs(r.total)), tone: "primary" },
          { label: "올해 실제 월급(평균)", value: s.money(r.actualMonthly) },
          { label: "장기요양 포함", value: "예" },
        ];
      }}
      sliders={["totalPay", "noticeMonthly"]}
      charts={(i, s) => <BridgeChart title="냈어야 할 보험료와 낸 보험료" steps={leaverBridge(i)} format={s.money} />}
      ask={["퇴사 후 지역가입자로 바뀌면 보험료가 다시 정해져요. 임의계속가입(최대 36개월)을 신청하면 직장 보험료 수준으로 낼 수 있어요."]}
      expertFooter={(i) => {
        const r = leaverResult(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `보수월액 = ${exactWon(i.totalPay)} ÷ ${i.monthsWorked}개월 = ${exactWon(r.actualMonthly)}`,
                `냈어야 할 보험료 = 건강 ${exactWon(r.owedHealth)} + 장기요양 ${exactWon(r.owedCare)}`,
                `낸 보험료 = 건강 ${exactWon(r.paidHealth)} + 장기요양 ${exactWon(r.paidCare)} → 정산 ${exactWon(r.total)}`,
              ]}
              next={[{ href: "/ko/health-insurance-calculator/", label: "건강보험료 계산기" }, { href: "/ko/severance-calculator/", label: "퇴직금 계산기" }]}
            />
            <LegacyDetails title="한 줄 입력으로 계산하기">
              <HealthInsuranceLeaverSettlement />
            </LegacyDetails>
          </div>
        );
      }}
    />
  );
}
