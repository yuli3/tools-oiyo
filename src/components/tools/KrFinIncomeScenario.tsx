// 금융소득 분리 vs 종합과세 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-investment-tax.ts financialIncomeTax.
import { FIN_ASSUMPTIONS, finBridge, finExtra, finOtherBase, finPlain, finResult, type FinIncomeLite } from "../../lib/kr-pension-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool, { type ScenarioState } from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["fin", "mode", "gross", "persons", "base"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: FinIncomeLite = { fin: 30_000_000, mode: "salary", gross: 70_000_000, persons: 1, base: 50_000_000 };
const MODE = [
  { value: "salary", label: "총급여로 추정" },
  { value: "base", label: "과세표준 직접 입력" },
] as const satisfies readonly { value: FinIncomeLite["mode"]; label: string }[];

function Other({ input, edit }: Pick<ScenarioState<FinIncomeLite, Key>, "input" | "edit">) {
  return (
    <div className="space-y-3">
      <ChoiceChips<FinIncomeLite["mode"]> legend="다른 소득 입력 방식" value={input.mode} options={MODE} onChange={(v) => edit({ mode: v }, ["mode"])} />
      {input.mode === "salary" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="총급여(1년)" value={input.gross} onChange={(v) => edit({ gross: v }, ["gross"])} />
          <NumberField label="기본공제 인원(본인 포함)" value={input.persons} onChange={(v) => edit({ persons: v }, ["persons"])} suffix="명" step={1} min={1} />
        </div>
      ) : (
        <MoneyField label="다른 종합소득 과세표준" value={input.base} onChange={(v) => edit({ base: v }, ["base"])} hint="작년 종합소득세 신고서의 과세표준이에요" />
      )}
    </div>
  );
}

export default function KrFinIncomeScenario() {
  return (
    <ScenarioTool<FinIncomeLite, Key>
      toolId="separate-vs-comprehensive-tax-calculator"
      example={EXAMPLE}
      assumptions={FIN_ASSUMPTIONS}
      keys={KEYS}
      evaluate={finExtra}
      resultName="5월에 더 낼 세금"
      questions={({ input, edit }) => [
        { title: "올해 이자·배당을 모두 얼마 받았나요?", keys: ["fin"], body: (
          <>
            <MoneyField label="이자·배당 합계(세금 떼기 전, 1~12월)" value={input.fin} onChange={(v) => edit({ fin: v }, ["fin"])} />
            <p className="mt-2 text-xs text-muted-foreground">ISA·연금 계좌 안의 수익과 비과세 상품은 빼고 넣어요. 홈택스 '지급명세서 조회'에서 합계를 볼 수 있어요.</p>
          </>
        ) },
        { title: "다른 소득은 얼마인가요?", keys: ["mode", "gross", "persons", "base"], body: <Other input={input} edit={edit} /> },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          <MoneyField label="금융소득(이자·배당, 세전)" value={input.fin} onChange={(v) => edit({ fin: v }, ["fin"])} />
          <Other input={input} edit={edit} />
        </div>
      )}
      summary={finPlain}
      metrics={(i, s) => {
        const r = finResult(i);
        return [
          { label: "5월에 더 낼 세금", value: s.money(r.extraTotal), tone: "primary" },
          { label: "이미 뗀 세금", value: s.money(r.withheld + Math.floor(r.withheld * 0.1)) },
          { label: "다른 소득 과세표준", value: s.money(finOtherBase(i)) },
        ];
      }}
      sliders={["fin", "other"]}
      sweepCaption={(a) => (a.key === "fin" ? "2천만 원(점선)까지는 더 낼 세금이 없어요. 넘는 몫은 다른 소득에 더해져 높은 세율을 받아요." : "다른 소득이 많을수록 금융소득이 얹히는 세율 구간이 높아져요.")}
      charts={(i, s) => <BridgeChart title="금융소득 세금 합계" steps={finBridge(i)} format={s.money} />}
      ask={["배당 가산(Gross-up)과 배당세액공제는 넣지 않았어요. 국내 배당이 많으면 실제 세금이 조금 달라요.", "다른 소득의 세금은 따로 내는 것으로 보고 금융소득 때문에 늘어나는 몫만 보여요."]}
      expertFooter={(i) => {
        const r = finResult(i);
        return (
          <ResultSteps
            steps={r.comprehensive
              ? [
                  `① (금융 ${exactWon(i.fin)} − 2천만 + 다른 과세표준 ${exactWon(finOtherBase(i))})에 누진세율 + 2천만 × 14% = ${exactWon(r.method1)}`,
                  `② 금융 × 14% ${exactWon(r.withheld)} + 다른 과세표준 세액 = ${exactWon(r.method2)}`,
                  `산출세액 = 큰 쪽 ${exactWon(r.calculated)}, 추가 = ${exactWon(r.extraNational)} + 지방세 ${exactWon(r.extraLocal)} = ${exactWon(r.extraTotal)}`,
                ]
              : [`2천만 원 이하 → 원천징수 14% ${exactWon(r.withheld)} + 지방세로 끝(분리과세)`]}
            next={[{ href: "/ko/comprehensive-income-tax-calculator/", label: "종합소득세" }, { href: "/ko/isa-calculator/", label: "ISA 절세" }]}
          />
        );
      }}
    />
  );
}
