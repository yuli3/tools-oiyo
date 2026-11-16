// FIRE 조기 은퇴 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/world-money-scenarios.ts fireResult.
import { FIRE_ASSUMPTIONS, firePlain, fireResult, fireYears, type FireLite } from "../../lib/world-money-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["age", "assets", "monthlySave", "ret", "spending", "withdraw"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: FireLite = { age: 30, assets: 100_000_000, monthlySave: 2_000_000, ret: 0.05, spending: 36_000_000, withdraw: 0.04 };
const pctField = (v: number) => Number((v * 100).toFixed(2));
const yearsText = (n: number) => (n >= 70 ? "70년 넘게" : `${Math.round(n)}년`);

export default function FireScenario() {
  return (
    <ScenarioTool<FireLite, Key>
      toolId="fire-retirement-calculator"
      example={EXAMPLE}
      assumptions={FIRE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={fireYears}
      resultName="은퇴까지 걸리는 해"
      formatResult={yearsText}
      questions={({ input, edit }) => [
        { title: "지금 나이와 모은 돈은요?", keys: ["age", "assets"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="지금 나이" value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="세" step={1} min={15} />
            <MoneyField label="지금까지 모은 돈(투자 자산)" value={input.assets} onChange={(v) => edit({ assets: v }, ["assets"])} />
          </div>
        ) },
        { title: "매달 얼마 모으고, 은퇴 뒤 1년에 얼마 쓸 건가요?", keys: ["monthlySave", "spending"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="매달 모으는 돈" value={input.monthlySave} onChange={(v) => edit({ monthlySave: v }, ["monthlySave"])} />
            <MoneyField label="은퇴 뒤 1년 생활비" value={input.spending} onChange={(v) => edit({ spending: v }, ["spending"])} hint="월 300만 원이면 3,600만 원" />
          </div>
        ) },
        { title: "수익률은 얼마로 볼까요?", keys: ["ret"], body: (
          <>
            <NumberField label="물가를 뺀 연 수익률" value={pctField(input.ret)} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.5} />
            <p className="mt-2 text-xs text-muted-foreground">주식 위주 장기 투자라면 물가를 빼고 4~5%, 예금 위주면 1% 안팎이에요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="현재 나이" value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="세" step={1} min={15} />
          <MoneyField label="현재 자산" value={input.assets} onChange={(v) => edit({ assets: v }, ["assets"])} />
          <MoneyField label="월 저축액" value={input.monthlySave} onChange={(v) => edit({ monthlySave: v }, ["monthlySave"])} />
          <MoneyField label="연 생활비" value={input.spending} onChange={(v) => edit({ spending: v }, ["spending"])} />
          <NumberField label="실질 수익률" value={pctField(input.ret)} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.1} />
          <NumberField label="안전 인출률" value={pctField(input.withdraw)} onChange={(v) => edit({ withdraw: v / 100 }, ["withdraw"])} suffix="%" step={0.25} />
        </div>
      )}
      summary={firePlain}
      metrics={(i, s) => {
        const r = fireResult(i);
        return [
          { label: "목표 자산", value: s.money(r.target) },
          { label: "걸리는 해", value: yearsText(r.years), tone: "primary" },
          { label: "은퇴 나이", value: r.reached ? `${r.fireAge}세` : "—" },
        ];
      }}
      sliders={["monthlySave", "spending", "ret", "withdraw"]}
      sweepCaption={(a) => (a.key === "withdraw" ? "인출률을 낮추면 더 안전하지만 목표 자산이 커져 오래 걸려요." : undefined)}
      charts={(i) => (
        <CompareBars
          title="생활비에 따라 걸리는 해"
          caption="다른 조건은 그대로 두고 1년 생활비만 바꿨어요."
          items={[0.8, 1, 1.2].map((k) => ({ label: `연 ${Math.round((i.spending * k) / 10_000).toLocaleString("ko-KR")}만 원`, value: fireYears({ ...i, spending: i.spending * k }), current: k === 1 }))}
          format={yearsText}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={["세금·건강보험료·국민연금은 넣지 않았어요.", "수익률이 해마다 같다고 봤어요. 은퇴 직후 큰 하락이 오면 더 오래 걸릴 수 있어요."]}
      expertFooter={(i) => {
        const r = fireResult(i);
        return (
          <ResultSteps
            steps={[
              `목표 = ${exactWon(i.spending)} ÷ ${(i.withdraw * 100).toFixed(2)}% = ${exactWon(r.target)}`,
              `해마다: 자산 × (1 + ${(i.ret * 100).toFixed(1)}%) + 연 저축 ${exactWon(i.monthlySave * 12)}`,
              r.reached ? `${r.years}년 뒤(${r.fireAge}세) 목표 도달` : "70년 안에 도달하지 못함",
            ]}
            next={[{ href: "/ko/compound-interest-calculator/", label: "복리" }, { href: "/ko/pension-optimizer-calculator/", label: "연금 최적화" }]}
          />
        );
      }}
    />
  );
}
