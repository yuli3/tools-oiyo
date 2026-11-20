// 과태료 자진납부 감경·가산금 계산기 (2026-11-17, 역량 지도 admin-fine). 계산: lib/pro-practice-2026.ts fineResult.
import { FINE_ASSUMPTIONS, fineBridge, fineCurve, finePay, finePlain, fineResult, type FineLite } from "../../../lib/pro-practice-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import CompareBars from "../viz/CompareBars";
import MoneyField from "../viz/MoneyField";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["fine", "noticeDate", "opinionDays", "when", "monthsLate", "vulnerable"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<FineLite>, k: Key[]) => void;
const EXAMPLE: FineLite = { fine: 500_000, noticeDate: "2026-11-16", opinionDays: 10, when: "early", monthsLate: 0, vulnerable: false };
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const WHEN = [
  { value: "early", label: "의견제출 기한 안에 낼게요" },
  { value: "due", label: "부과 뒤 납부기한 안에" },
  { value: "late", label: "납부기한이 지났어요" },
] as const;
const YN = [{ value: "yes", label: "예" }, { value: "no", label: "아니요" }];

export default function FineReduction() {
  const notice = (i: FineLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <MoneyField label="통지서의 과태료" value={i.fine} onChange={(v) => edit({ fine: v }, ["fine"])} />
      <DateField label="사전통지를 받은 날" value={i.noticeDate} onChange={(v) => edit({ noticeDate: v }, ["noticeDate"])} />
      <NumberField label="의견제출 기간" value={i.opinionDays} onChange={(v) => edit({ opinionDays: v }, ["opinionDays"])} suffix="일" min={10} />
    </div>
  );
  const pay = (i: FineLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<FineLite["when"]> legend="언제 내나요?" value={i.when} options={WHEN} onChange={(v) => edit({ when: v }, ["when"])} />
      {i.when === "late" && <NumberField label="납부기한이 지난 개월 수" value={i.monthsLate} onChange={(v) => edit({ monthsLate: v }, ["monthsLate"])} suffix="개월" />}
      <ChoiceChips<string> legend="기초생활수급자·차상위·중증장애인·미성년자 등에 해당하나요?" value={i.vulnerable ? "yes" : "no"} options={YN} onChange={(v) => edit({ vulnerable: v === "yes" }, ["vulnerable"])} />
    </div>
  );
  return (
    <ScenarioTool<FineLite, Key>
      toolId="fine-reduction-calculator"
      example={EXAMPLE}
      assumptions={FINE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={finePay}
      resultName="낼 금액"
      formatResult={won}
      questions={({ input, edit }) => [
        { title: "사전통지서를 보고 알려 주세요", keys: ["fine", "noticeDate", "opinionDays"], body: notice(input, edit) },
        { title: "언제 낼 건가요?", keys: ["when", "monthsLate", "vulnerable"], body: pay(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          {notice(input, edit)}
          {pay(input, edit)}
        </div>
      )}
      summary={finePlain}
      metrics={(i) => {
        const r = fineResult(i);
        return [
          { label: "낼 금액", value: won(r.pay), tone: "primary" },
          { label: "감경", value: won(r.cut) },
          { label: "자진납부 감경 기한", value: r.opinionDue || "날짜를 넣어 주세요" },
        ];
      }}
      sliders={["fine", "monthsLate"]}
      sweepCaption={(a) => (a.key === "monthsLate" ? "60개월이 지나면 중가산금은 더 붙지 않아요." : undefined)}
      charts={(i) => (
        <div className="space-y-4">
          <BridgeChart title="낼 금액이 만들어지는 과정" steps={fineBridge(i)} format={won} />
          <CompareBars title="늦게 낼수록 늘어나는 금액" items={fineCurve(i)} format={won} />
        </div>
      )}
      askTitle="행정청에 확인할 것"
      ask={["다른 법률에 특별한 감경 규정이 있으면 그 기준이 먼저예요.", "사회적 약자 감경은 증빙을 내야 받을 수 있어요.", "이의제기를 하면 자진납부 감경은 받을 수 없어요."]}
      expertFooter={(i) => {
        const r = fineResult(i);
        return (
          <ResultSteps
            steps={[
              `감경: 자진납부 ${won(r.earlyCut)}(20%, 시행령 제5조), 약자 ${won(r.vulnerableCut)}(50%, 시행령 제2조의2) 중 큰 것 ${won(r.cut)}`,
              `감경 뒤 과태료 = ${won(r.base)}`,
              `가산금 = ${won(r.base)} × 3% = ${won(r.addOn)}, 중가산금 = ${won(r.base)} × 1.2% × ${r.months}개월 = ${won(r.heavy)} (제24조)`,
              `낼 금액 = ${won(r.pay)}`,
            ]}
            next={[{ href: "/ko/administrative-law-guide/", label: "행정 절차 길잡이" }, { href: "/ko/law-guide/", label: "법령 길잡이 16분야" }]}
          />
        );
      }}
    />
  );
}
