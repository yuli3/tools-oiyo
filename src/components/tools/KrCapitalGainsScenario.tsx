// 양도소득세 한국어판 (2026-11-16 쉬운 설명·가정 변화 적용). 영어판은 KrCapitalGainsTaxCalculator 그대로.
// 계산: lib/kr-real-estate-tax.ts, 가정·문장: lib/kr-tax-scenarios.ts.
import { capitalGainsTax, type AssetKind, type GainsInput } from "../../lib/kr-real-estate-tax";
import { GAINS_ASSUMPTIONS, gainsBridge, gainsPlain, gainsTotal } from "../../lib/kr-tax-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["kind", "sale", "purchase", "expenses", "holdYears", "liveYears", "houses", "exemptEligible", "regulated"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: GainsInput = { kind: "house", sale: 1_500_000_000, purchase: 800_000_000, expenses: 15_000_000, holdYears: 8, liveYears: 8, houses: 1, exemptEligible: true, regulated: true };
const KIND = [
  { value: "house", label: "주택" },
  { value: "other", label: "토지·상가 등" },
] as const satisfies readonly { value: AssetKind; label: string }[];
const HOUSES = [
  { value: "1", label: "1주택" },
  { value: "2", label: "2주택" },
  { value: "3", label: "3주택 이상" },
] as const;
const YN = [
  { value: "y", label: "예" },
  { value: "n", label: "아니요" },
] as const;

type Edit = (patch: Partial<GainsInput>, keys: readonly Key[]) => void;

function HouseFields({ input, edit, plain }: { input: GainsInput; edit: Edit; plain: boolean }) {
  if (input.kind !== "house") return <p className="text-sm text-muted-foreground">토지·상가는 주택 수와 비과세를 따지지 않아요.</p>;
  return (
    <div className="space-y-4">
      <ChoiceChips legend={plain ? "이 집을 포함해 우리 집(세대)이 가진 집은 몇 채인가요?" : "양도 주택 포함 세대 주택 수"} value={String(input.houses) as "1" | "2" | "3"} options={HOUSES} onChange={(v) => edit({ houses: Number(v) as 1 | 2 | 3 }, ["houses"])} />
      {input.houses === 1 ? (
        <ChoiceChips
          legend={plain ? "2년 넘게 가지고 있었나요? (조정지역에서 샀다면 2년 넘게 살았나요?)" : "1세대1주택 비과세 요건(2년 보유, 조정지역 취득 시 2년 거주)"}
          value={input.exemptEligible ? "y" : "n"}
          options={YN}
          onChange={(v) => edit({ exemptEligible: v === "y" }, ["exemptEligible"])}
        />
      ) : (
        <ChoiceChips legend={plain ? "이 집이 조정대상지역에 있나요?" : "양도 주택 조정대상지역 소재"} value={input.regulated ? "y" : "n"} options={YN} onChange={(v) => edit({ regulated: v === "y" }, ["regulated"])} />
      )}
    </div>
  );
}

export default function KrCapitalGainsScenario() {
  return (
    <ScenarioTool<GainsInput, Key>
      toolId="capital-gains-tax-calculator"
      example={EXAMPLE}
      assumptions={GAINS_ASSUMPTIONS}
      keys={KEYS}
      evaluate={gainsTotal}
      resultName="양도세"
      questions={({ input, edit }) => [
        {
          title: "무엇을 얼마에 파나요?",
          keys: ["kind", "sale"],
          body: (
            <div className="space-y-4">
              <ChoiceChips<AssetKind> legend="파는 것" value={input.kind} options={KIND} onChange={(v) => edit({ kind: v }, ["kind"])} />
              <MoneyField label="파는 값" value={input.sale} onChange={(v) => edit({ sale: v }, ["sale"])} />
            </div>
          ),
        },
        {
          title: "얼마에 샀고, 산 뒤에 들인 돈은 얼마인가요?",
          keys: ["purchase", "expenses"],
          body: (
            <div className="space-y-3">
              <MoneyField label="산 값" value={input.purchase} onChange={(v) => edit({ purchase: v }, ["purchase"])} />
              <MoneyField label="산 뒤 들인 돈(취득세·중개수수료·확장 공사 등)" value={input.expenses} onChange={(v) => edit({ expenses: v }, ["expenses"])} />
              <p className="text-xs text-muted-foreground">도배·장판 같은 단순 수리비는 빼 주지 않아요. 영수증이 있는 큰 공사만 넣어 주세요.</p>
            </div>
          ),
        },
        {
          title: "얼마나 가지고 있었고, 직접 살았나요?",
          keys: ["holdYears", "liveYears"],
          body: (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="가진 기간" value={input.holdYears} onChange={(v) => edit({ holdYears: v }, ["holdYears"])} suffix="년" step={1} />
              <NumberField label="실제로 산 기간" value={input.liveYears} onChange={(v) => edit({ liveYears: v }, ["liveYears"])} suffix="년" step={1} />
            </div>
          ),
        },
        {
          title: "집은 몇 채인가요?",
          keys: ["houses", "exemptEligible", "regulated"],
          body: <HouseFields input={input} edit={edit} plain />,
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <ChoiceChips<AssetKind> legend="양도 자산" value={input.kind} options={KIND} onChange={(v) => edit({ kind: v }, ["kind"])} />
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField label="양도가액" value={input.sale} onChange={(v) => edit({ sale: v }, ["sale"])} />
            <MoneyField label="취득가액" value={input.purchase} onChange={(v) => edit({ purchase: v }, ["purchase"])} />
            <MoneyField label="필요경비" value={input.expenses} onChange={(v) => edit({ expenses: v }, ["expenses"])} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="보유 기간" value={input.holdYears} onChange={(v) => edit({ holdYears: v }, ["holdYears"])} suffix="년" step={0.5} />
            <NumberField label="거주 기간" value={input.liveYears} onChange={(v) => edit({ liveYears: v }, ["liveYears"])} suffix="년" step={0.5} />
          </div>
          <HouseFields input={input} edit={edit} plain={false} />
        </div>
      )}
      summary={gainsPlain}
      metrics={(i, s) => {
        const r = capitalGainsTax(i);
        return [
          { label: "낼 양도세(지방세 포함)", value: s.money(r.total), tone: "primary" },
          { label: "오른 값(양도차익)", value: s.money(r.gain) },
          { label: "손에 남는 돈", value: s.money(i.sale - r.total) },
        ];
      }}
      sliders={["sale", "purchase", "holdYears", "liveYears"]}
      sweeps={["sale", "holdYears", "liveYears", "purchase"]}
      sweepCaption={(a) =>
        a.key === "sale"
          ? "점선 12억은 1주택 비과세 기준이에요. 넘는 몫의 비율만큼만 세금을 매겨요."
          : a.key === "holdYears"
            ? "2년 안에 팔면 단기 세율, 3년부터 오래 가진 공제가 붙고 10년(1주택)·15년에서 가장 커져요."
            : a.key === "liveYears"
              ? "1주택은 2년 넘게 살아야 거주 기간 공제(1년에 4%)를 받아요."
              : undefined
      }
      charts={(i, s) => <BridgeChart title="오른 값에서 세금 매기는 금액까지" steps={gainsBridge(i)} format={s.money} />}
      ask={[
        "일시적 2주택, 상속주택, 장기임대주택은 주택 수에서 빠질 수 있어요. 해당되면 꼭 확인해 주세요.",
        "산 값을 모르면 환산취득가액을 쓰는데, 이때는 필요경비 계산이 달라져요.",
        "잔금일·등기일 중 빠른 날이 파는 날이에요. 날짜에 따라 보유 기간이 바뀔 수 있어요.",
      ]}
      expertFooter={(i) => {
        const r = capitalGainsTax(i);
        return (
          <ResultSteps
            steps={
              r.exempt
                ? [`양도차익 ${exactWon(r.gain)}`, "1세대1주택 비과세(소득세법 제89조①3, 양도가액 12억 원 이하)"]
                : [
                    `양도차익 = ${exactWon(i.sale)} − ${exactWon(i.purchase)} − ${exactWon(i.expenses)} = ${exactWon(r.gain)}`,
                    ...(r.taxableGain !== r.gain ? [`고가주택 과세 양도차익(시행령 제160조) ${exactWon(r.taxableGain)}`] : []),
                    `장기보유특별공제(제95조②) ${Math.round(r.longTermRate * 100)}% = ${exactWon(r.longTerm)}`,
                    `과세표준(기본공제 250만 원 차감) ${exactWon(r.base)}`,
                    `세율 ${r.rateLabel} → 양도소득세 ${exactWon(r.tax)}, 지방소득세 ${exactWon(r.local)}`,
                    "감면(8년 자경농지 등), 비사업용 토지 중과, 이월과세는 넣지 않았어요.",
                  ]
            }
            next={[{ href: "/ko/acquisition-tax-calculator/", label: "취득세 계산기" }, { href: "/ko/property-tax-calculator/", label: "재산세 계산기" }]}
          />
        );
      }}
    />
  );
}
