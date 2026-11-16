// 전세 vs 월세 (2026-11-16 쉬운 설명·가정 변화 적용). 계산은 lib/jeonse-cost.ts 그대로예요.
import { jeonseBreakEvenRent, JEONSE_ASSUMPTIONS, jeonseCompare, jeonseGap, jeonsePlain, jeonseResult, type JeonseLite } from "../../lib/kr-home-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["jeonse", "loanRatio", "loanRate", "savingsRate", "rentDeposit", "monthlyRent", "creditRate"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: JeonseLite = { jeonse: 300_000_000, loanRatio: 0.7, loanRate: 0.038, savingsRate: 0.032, rentDeposit: 30_000_000, monthlyRent: 1_000_000, creditRate: 0 };
type Credit = "0" | "0.15" | "0.17";
const CREDIT = [
  { value: "0", label: "공제 안 받음·모름" },
  { value: "0.15", label: "15%(총급여 8천만 원 이하)" },
  { value: "0.17", label: "17%(총급여 5,500만 원 이하)" },
] as const satisfies readonly { value: Credit; label: string }[];
const ratioOptions = [
  { value: "0", label: "대출 없음" },
  { value: "0.5", label: "50%" },
  { value: "0.7", label: "70%" },
  { value: "0.8", label: "80%" },
] as const;
type Ratio = (typeof ratioOptions)[number]["value"];
const nearestRatio = (r: number): Ratio => (["0", "0.5", "0.7", "0.8"] as const).reduce((a, b) => (Math.abs(Number(b) - r) < Math.abs(Number(a) - r) ? b : a));

export default function KrJeonseRentScenario() {
  return (
    <ScenarioTool<JeonseLite, Key>
      toolId="jeonse-vs-rent-calculator"
      example={EXAMPLE}
      assumptions={JEONSE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={jeonseGap}
      resultName="월세가 전세보다 한 달에 더 드는 돈"
      questions={({ input, edit }) => [
        { title: "전세는 얼마인가요?", keys: ["jeonse", "loanRatio"], body: (
          <div className="space-y-3">
            <MoneyField label="전세 보증금" value={input.jeonse} onChange={(v) => edit({ jeonse: v }, ["jeonse"])} />
            <ChoiceChips<Ratio> legend="보증금 중 대출로 내는 비율" value={nearestRatio(input.loanRatio)} options={ratioOptions} onChange={(v) => edit({ loanRatio: Number(v) }, ["loanRatio"])} />
          </div>
        ) },
        { title: "월세 조건은요?", keys: ["rentDeposit", "monthlyRent"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="월세 보증금" value={input.rentDeposit} onChange={(v) => edit({ rentDeposit: v }, ["rentDeposit"])} />
            <MoneyField label="월세" value={input.monthlyRent} onChange={(v) => edit({ monthlyRent: v }, ["monthlyRent"])} />
          </div>
        ) },
        { title: "금리는 어떻게 볼까요?", keys: ["loanRate", "savingsRate"], body: (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="전세대출 금리" value={Number((input.loanRate * 100).toFixed(2))} onChange={(v) => edit({ loanRate: v / 100 }, ["loanRate"])} suffix="%" step={0.1} />
              <NumberField label="예금 이자율" value={Number((input.savingsRate * 100).toFixed(2))} onChange={(v) => edit({ savingsRate: v / 100 }, ["savingsRate"])} suffix="%" step={0.1} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">보증금으로 묶인 내 돈은 예금에 넣었다면 이자를 받았을 돈이에요. 이 '못 받은 이자'도 비용으로 쳐요.</p>
          </>
        ) },
        { title: "월세 세액공제를 받을 수 있나요?", keys: ["creditRate"], body: (
          <>
            <ChoiceChips<Credit> legend="무주택 세대주, 국민주택규모(85㎡) 이하 또는 기준시가 4억 원 이하 집이어야 해요" value={String(input.creditRate) as Credit} options={CREDIT} onChange={(v) => edit({ creditRate: Number(v) as JeonseLite["creditRate"] }, ["creditRate"])} />
            <p className="mt-2 text-xs text-muted-foreground">요건이 확실하지 않으면 '공제 안 받음'으로 두세요. <a className="underline" href="/ko/monthly-rent-tax-credit-calculator/">월세 세액공제 계산기</a>에서 확인할 수 있어요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="전세 보증금" value={input.jeonse} onChange={(v) => edit({ jeonse: v }, ["jeonse"])} />
            <NumberField label="전세대출 비율" value={Math.round(input.loanRatio * 100)} onChange={(v) => edit({ loanRatio: Math.min(100, v) / 100 }, ["loanRatio"])} suffix="%" step={5} />
            <NumberField label="전세대출 금리" value={Number((input.loanRate * 100).toFixed(2))} onChange={(v) => edit({ loanRate: v / 100 }, ["loanRate"])} suffix="%" step={0.1} />
            <NumberField label="예금 이자율(기회비용)" value={Number((input.savingsRate * 100).toFixed(2))} onChange={(v) => edit({ savingsRate: v / 100 }, ["savingsRate"])} suffix="%" step={0.1} />
            <MoneyField label="월세 보증금" value={input.rentDeposit} onChange={(v) => edit({ rentDeposit: v }, ["rentDeposit"])} />
            <MoneyField label="월세" value={input.monthlyRent} onChange={(v) => edit({ monthlyRent: v }, ["monthlyRent"])} />
          </div>
          <ChoiceChips<Credit> legend="월세 세액공제(요건 확인한 경우만)" value={String(input.creditRate) as Credit} options={CREDIT} onChange={(v) => edit({ creditRate: Number(v) as JeonseLite["creditRate"] }, ["creditRate"])} />
        </div>
      )}
      summary={jeonsePlain}
      metrics={(i, s) => {
        const r = jeonseResult(i);
        return [
          { label: "전세 한 달 비용", value: s.money(Math.round(r.jeonseCost)), tone: r.jeonseCost <= r.rentCost ? "primary" : undefined },
          { label: "월세 한 달 비용", value: s.money(Math.round(r.rentCost)), tone: r.rentCost < r.jeonseCost ? "primary" : undefined },
          { label: "두 집이 같아지는 월세", value: s.money(jeonseBreakEvenRent(i)) },
        ];
      }}
      sliders={["monthlyRent", "loanRate", "savingsRate"]}
      sweepCaption={() => "선이 0을 지나는 점이 손익분기예요. 0보다 위면 전세가, 아래면 월세가 싸요."}
      charts={(i, s) => <CompareBars title="한 달에 실제로 드는 돈" caption="표시된 쪽이 더 싸요." items={jeonseCompare(i)} format={s.money} />}
      ask={["관리비·이사비·중개보수와 대출 원금 상환은 넣지 않았어요.", "전세는 보증금을 돌려받지 못할 위험이 있어요. 전세가율과 보증보험 가입 가능 여부를 꼭 확인하세요."]}
      expertFooter={(i) => {
        const r = jeonseResult(i);
        return (
          <ResultSteps
            steps={[
              `전세 = 대출 이자 ${exactWon(Math.round(r.loanInterest))} + 내 돈 기회비용 ${exactWon(Math.round(r.equityCost))} = ${exactWon(Math.round(r.jeonseCost))}/월`,
              `월세 = ${exactWon(i.monthlyRent)} + 보증금 기회비용 ${exactWon(Math.round(r.rentEquityCost))} − 세액공제 ${exactWon(Math.round(r.credit))} = ${exactWon(Math.round(r.rentCost))}/월`,
              `손익분기 월세 ≈ ${exactWon(jeonseBreakEvenRent(i))}(세액공제는 연 월세 1천만 원 한도)`,
            ]}
            next={[{ href: "/ko/jeonse-monthly-converter/", label: "전월세 전환" }, { href: "/ko/jeonse-vs-buy-calculator/", label: "전세 vs 매매" }]}
          />
        );
      }}
    />
  );
}
