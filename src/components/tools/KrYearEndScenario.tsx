// 연말정산 한국어판 (2026-11-16 쉬운 설명·가정 변화 적용). 핵심 9개 항목만 묻고, 나머지 공제는 아래 전체 계산기에서 넣어요.
// 영어판은 YearEndSettlementCalculator 그대로. 계산: lib/kr-year-end-2026.ts, 가정·문장: lib/kr-tax-scenarios.ts.
import { estimateWithheld, YEAR_END_ASSUMPTIONS, yearEndBridge, yearEndPlain, yearEndRefund, yearEndResult, yearEndTaxBridge, type YearEndLite } from "../../lib/kr-tax-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";
import YearEndSettlementCalculator from "./YearEndSettlementCalculator";

const KEYS = ["salary", "persons", "children", "withheld", "credit", "debit", "pension", "medical", "rent"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: YearEndLite = { salary: 50_000_000, persons: 1, children: 0, withheld: estimateWithheld(50_000_000, 1), credit: 10_000_000, debit: 5_000_000, pension: 0, medical: 0, rent: 0 };

export default function KrYearEndScenario() {
  return (
    <ScenarioTool<YearEndLite, Key>
      toolId="year-end-settlement-calculator"
      example={EXAMPLE}
      assumptions={YEAR_END_ASSUMPTIONS}
      keys={KEYS}
      evaluate={yearEndRefund}
      resultName="돌려받을 돈(−면 더 냄)"
      questions={({ input, edit }) => [
        {
          title: "올해 연봉(세전)은 얼마인가요?",
          keys: ["salary", "withheld"],
          body: (
            <div className="space-y-3">
              <MoneyField label="1년 연봉(식대 같은 비과세는 빼고)" value={input.salary} onChange={(v) => edit({ salary: v, withheld: estimateWithheld(v, input.persons) }, ["salary"])} />
              <MoneyField label="회사가 1년 동안 뗀 소득세(모르면 그대로 두세요)" value={input.withheld} onChange={(v) => edit({ withheld: v }, ["withheld"])} />
              <p className="text-xs text-muted-foreground">급여명세서의 소득세를 12달 더한 값이에요. 비워 두면 연봉으로 어림한 값을 써요.</p>
            </div>
          ),
        },
        {
          title: "나를 포함해 부양가족은 몇 명인가요?",
          keys: ["persons", "children"],
          body: (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="나 + 소득 없는 가족" value={input.persons} onChange={(v) => edit({ persons: v }, ["persons"])} suffix="명" step={1} min={1} />
              <NumberField label="그중 8~20세 자녀" value={input.children} onChange={(v) => edit({ children: v }, ["children"])} suffix="명" step={1} min={0} />
            </div>
          ),
        },
        {
          title: "카드는 1년에 얼마나 썼나요?",
          keys: ["credit", "debit"],
          body: (
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyField label="신용카드" value={input.credit} onChange={(v) => edit({ credit: v }, ["credit"])} />
              <MoneyField label="체크카드·현금영수증" value={input.debit} onChange={(v) => edit({ debit: v }, ["debit"])} />
            </div>
          ),
        },
        {
          title: "연금저축·IRP, 병원비, 월세가 있었나요?",
          keys: ["pension", "medical", "rent"],
          body: (
            <div className="space-y-3">
              <MoneyField label="연금저축·IRP에 넣은 돈" value={input.pension} onChange={(v) => edit({ pension: v }, ["pension"])} />
              <MoneyField label="병원·약값(실손보험으로 받은 돈은 빼고)" value={input.medical} onChange={(v) => edit({ medical: v }, ["medical"])} />
              <MoneyField label="1년 월세(무주택·연봉 8천만 이하)" value={input.rent} onChange={(v) => edit({ rent: v }, ["rent"])} />
            </div>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField label="총급여" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} />
            <MoneyField label="기납부세액(소득세)" value={input.withheld} onChange={(v) => edit({ withheld: v }, ["withheld"])} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="기본공제" value={input.persons} onChange={(v) => edit({ persons: v }, ["persons"])} suffix="명" step={1} min={1} />
              <NumberField label="자녀공제" value={input.children} onChange={(v) => edit({ children: v }, ["children"])} suffix="명" step={1} min={0} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField label="신용카드" value={input.credit} onChange={(v) => edit({ credit: v }, ["credit"])} />
            <MoneyField label="직불·현금영수증" value={input.debit} onChange={(v) => edit({ debit: v }, ["debit"])} />
            <MoneyField label="연금저축+IRP" value={input.pension} onChange={(v) => edit({ pension: v }, ["pension"])} />
            <MoneyField label="일반 의료비" value={input.medical} onChange={(v) => edit({ medical: v }, ["medical"])} />
            <MoneyField label="월세액" value={input.rent} onChange={(v) => edit({ rent: v }, ["rent"])} />
          </div>
          <p className="text-xs text-muted-foreground">4대 보험료는 총급여로 어림했어요. 주택자금·교육비·기부금·추가공제는 아래 전체 계산기에서 넣어 주세요.</p>
        </div>
      )}
      summary={yearEndPlain}
      metrics={(i, s) => {
        const r = yearEndResult(i);
        const t = r.refund?.total ?? 0;
        return [
          { label: t >= 0 ? "돌려받을 돈" : "더 낼 돈", value: s.money(Math.abs(t)), tone: "primary" },
          { label: "올해 확정된 세금", value: s.money(r.totalTax) },
          { label: "세액공제 합계", value: s.money(r.totalCredits) },
        ];
      }}
      sliders={["credit", "debit", "pension", "medical"]}
      sweeps={["pension", "credit", "debit", "rent", "medical", "children"]}
      sweepCaption={(a) =>
        a.key === "pension"
          ? "연금저축은 600만 원, IRP를 더해 900만 원까지만 공제돼요. 그 뒤로는 곡선이 평평해져요."
          : a.key === "credit" || a.key === "debit"
            ? "연봉의 25%를 넘게 쓴 몫부터 공제가 시작되고, 한도(300만 원 안팎)에서 멈춰요."
            : a.key === "medical"
              ? "의료비는 연봉의 3%를 넘게 쓴 몫부터 15%를 빼 줘요."
              : undefined
      }
      charts={(i, s) => (
        <>
          <BridgeChart title="세금이 정해지는 순서" steps={yearEndTaxBridge(i)} format={s.money} />
          <BridgeChart title="이미 뗀 세금과 비교하면" steps={yearEndBridge(i)} format={s.money} />
        </>
      )}
      ask={[
        "부양가족은 연 소득 100만 원(근로소득만 있으면 총급여 500만 원) 이하여야 해요. 맞벌이는 한 사람만 공제받을 수 있어요.",
        "월세 공제는 무주택 세대주, 국민주택규모(85㎡) 이하 또는 기준시가 4억 원 이하, 전입신고가 필요해요.",
        "주택청약, 전세대출 이자, 교육비, 기부금이 있으면 아래 '전체 항목으로 계산하기'에서 더 넣어 보세요.",
      ]}
      expertFooter={(i) => {
        const r = yearEndResult(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `총급여 ${exactWon(i.salary)} − 근로소득공제 ${exactWon(r.earnedDeduction)} = 근로소득금액 ${exactWon(r.earnedIncome)}`,
                `소득공제(인적·보험료·카드 ${exactWon(r.cardDeduction)} 등) ${exactWon(r.incomeDeductions)} → 과세표준 ${exactWon(r.taxBase)}`,
                `산출세액 ${exactWon(r.calculatedTax)} − 세액공제 ${exactWon(r.totalCredits)} = 결정세액 ${exactWon(r.finalTax)}, 지방소득세 ${exactWon(r.localTax)}`,
                `기납부 ${exactWon(i.withheld)}(+지방세) 차감 → ${(r.refund?.total ?? 0) >= 0 ? "환급" : "추가 납부"} ${exactWon(Math.abs(r.refund?.total ?? 0))}`,
                r.usedStandard ? "특별공제보다 표준세액공제(13만 원)가 유리해 표준세액공제를 적용했어요." : "특별공제·월세 합계가 표준세액공제보다 커서 항목별 공제를 적용했어요.",
              ]}
              next={[
                { href: "/ko/salary-calculator/", label: "월급 실수령액 계산기" },
                { href: "/ko/comprehensive-income-tax-calculator/", label: "종합소득세 계산기" },
              ]}
            />
            <details className="rounded-md border border-border bg-background px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">전체 항목으로 계산하기(주택자금·교육비·기부금·추가공제 등)</summary>
              <div className="mt-3">
                <YearEndSettlementCalculator locale="ko" />
              </div>
            </details>
          </div>
        );
      }}
    />
  );
}
