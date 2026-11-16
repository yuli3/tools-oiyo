// 저축 상품 비교 (2026-11-16 쉬운 설명·가정 변화 적용). 이자는 lib/kr-deposit.ts, ISA 세금은 isa-tax-comparison.ts예요.
import { SAVE_ASSUMPTIONS, saveBest, saveCompare, savePlain, saveResult, type SaveLite } from "../../lib/kr-life-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["monthly", "years", "depositRate", "savingsRate", "isaRate", "parkingRate"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: SaveLite = { monthly: 500_000, years: 3, depositRate: 3.5 / 100, savingsRate: 4 / 100, isaRate: 4 / 100, parkingRate: 2.5 / 100 };
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function KrSavingsCompareScenario() {
  const rates = (input: SaveLite, edit: (p: Partial<SaveLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label="적금 금리" value={pctField(input.savingsRate)} onChange={(v) => edit({ savingsRate: v / 100 }, ["savingsRate"])} suffix="%" step={0.1} />
      <NumberField label="ISA 안 예금·적금 금리" value={pctField(input.isaRate)} onChange={(v) => edit({ isaRate: v / 100 }, ["isaRate"])} suffix="%" step={0.1} />
      <NumberField label="파킹통장 금리" value={pctField(input.parkingRate)} onChange={(v) => edit({ parkingRate: v / 100 }, ["parkingRate"])} suffix="%" step={0.1} />
      <NumberField label="정기예금 금리(목돈 있을 때)" value={pctField(input.depositRate)} onChange={(v) => edit({ depositRate: v / 100 }, ["depositRate"])} suffix="%" step={0.1} />
    </div>
  );
  return (
    <ScenarioTool<SaveLite, Key>
      toolId="savings-comparison-calculator"
      example={EXAMPLE}
      assumptions={SAVE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={saveBest}
      resultName="가장 많은 세후 이자"
      questions={({ input, edit }) => [
        { title: "매달 얼마씩, 몇 년 모을 건가요?", keys: ["monthly", "years"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="월 저축액" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
            <NumberField label="기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
          </div>
        ) },
        { title: "상품별 금리는요?", keys: ["savingsRate", "isaRate", "parkingRate", "depositRate"], body: (
          <>
            {rates(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">모르면 예시 금리 그대로 두세요. 은행 앱에서 보이는 연 금리(세전)를 넣으면 돼요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="월 저축액" value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} />
            <NumberField label="기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
          </div>
          {rates(input, edit)}
        </div>
      )}
      summary={savePlain}
      metrics={(i, s) => {
        const rows = saveResult(i);
        const get = (id: string) => rows.find((r) => r.id === id)!.net;
        return [
          { label: "적금 세후 이자", value: s.money(get("savings")) },
          { label: "ISA 세후 이자", value: s.money(get("isa")), tone: "primary" },
          { label: "파킹통장 세후 이자", value: s.money(get("parking")) },
        ];
      }}
      sliders={["monthly", "years", "isaRate"]}
      charts={(i, s) => <CompareBars title="상품별 세후 이자" caption="표시된 막대가 가장 많이 받아요. 원금은 모두 같아요." items={saveCompare(i)} format={s.money} />}
      ask={["단리 기준이에요. 파킹통장은 매달 넣은 돈이 쌓이는 동안 이자가 붙는다고 봤어요.", "ISA는 일반형(비과세 200만 원), 3년 유지를 가정했어요. 연 납입 한도는 2천만 원이에요."]}
      expertFooter={(i) => {
        const rows = saveResult(i);
        return (
          <ResultSteps
            steps={rows.map((r) => `${r.label}: 세후 이자 ${exactWon(r.net)}`)}
            next={[{ href: "/ko/deposit-calculator/", label: "예금·적금 이자" }, { href: "/ko/isa-calculator/", label: "ISA 절세" }]}
          />
        );
      }}
    />
  );
}
