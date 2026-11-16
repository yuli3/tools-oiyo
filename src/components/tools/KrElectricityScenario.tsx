// 전기요금 (2026-11-16 쉬운 설명·가정 변화 적용). 가전 추가 사용량·한 줄 입력이 있는 기존 계산기는 전문가 모드 아래에 남겨요.
import type { Season } from "../../lib/kr-electricity-2026";
import { electricityBill } from "../../lib/kr-electricity-2026";
import { ELECTRICITY_ASSUMPTIONS, electricityBridge, electricityMarks, electricityPlain, electricityTotal, type ElectricityLite } from "../../lib/kr-money-scenarios";
import ElectricityBillCalculator from "./ElectricityBillCalculator";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import LegacyDetails from "./viz/LegacyDetails";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["kwh", "season"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: ElectricityLite = { kwh: 350, season: "other" };
const SEASON = [
  { value: "other", label: "봄·가을" },
  { value: "summer", label: "7~8월" },
  { value: "winter", label: "12~2월" },
] as const satisfies readonly { value: Season; label: string }[];

export default function KrElectricityScenario() {
  return (
    <ScenarioTool<ElectricityLite, Key>
      toolId="electricity-bill-calculator"
      example={EXAMPLE}
      assumptions={ELECTRICITY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={electricityTotal}
      resultName="전기요금"
      marksFor={(key, i) => (key === "kwh" ? electricityMarks(i.season) : undefined)}
      questions={({ input, edit }) => [
        { title: "한 달에 전기를 얼마나 쓰나요?", keys: ["kwh"], body: (
          <>
            <NumberField label="사용량(고지서의 kWh)" value={input.kwh} onChange={(v) => edit({ kwh: v }, ["kwh"])} suffix="kWh" step={10} min={0} />
            <p className="mt-2 text-xs text-muted-foreground">1~2인 가구는 보통 200~300kWh, 에어컨을 많이 쓰는 여름엔 400kWh를 넘기도 해요.</p>
          </>
        ) },
        { title: "몇 월 요금인가요?", keys: ["season"], body: <ChoiceChips<Season> legend="여름(7~8월)은 구간이 넓어져요" value={input.season} options={SEASON} onChange={(v) => edit({ season: v }, ["season"])} /> },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="월 사용량" value={input.kwh} onChange={(v) => edit({ kwh: v }, ["kwh"])} suffix="kWh" step={10} min={0} />
          <ChoiceChips<Season> legend="계절" value={input.season} options={SEASON} onChange={(v) => edit({ season: v }, ["season"])} />
        </div>
      )}
      summary={electricityPlain}
      metrics={(i, s) => {
        const b = electricityBill(Math.max(0, i.kwh), i.season);
        return [
          { label: "이번 달 요금", value: s.money(b.total), tone: "primary" },
          { label: "구간", value: `${b.tier}단계` },
          { label: "1kWh당 평균", value: i.kwh > 0 ? `${Math.round(b.total / i.kwh)}원` : "—" },
        ];
      }}
      sliders={["kwh"]}
      sweepCaption={() => "점선을 넘는 순간 기본요금과 단가가 같이 올라요(누진제). 그래서 곡선이 계단처럼 가팔라져요."}
      charts={(i, s) => <BridgeChart title="고지서에 찍히는 것" steps={electricityBridge(i)} format={s.money} />}
      ask={["아파트 단지 고압 계약이면 단가가 조금 달라요.", "복지할인(장애인·기초수급·다자녀 등)과 에너지캐시백은 넣지 않았어요."]}
      expertFooter={(i) => {
        const b = electricityBill(Math.max(0, i.kwh), i.season);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `기본요금 ${exactWon(b.basic)} + 전력량요금 ${exactWon(b.energy)}(${b.bands.map((x) => `${x.kwh}kWh×${x.rate}원`).join(" + ")})`,
                `기후환경 ${exactWon(b.climate)} + 연료비조정 ${exactWon(b.fuel)} = 전기요금계 ${exactWon(b.subtotal)}`,
                `부가세 ${exactWon(b.vat)} + 전력기금 ${exactWon(b.fund)} = ${exactWon(b.total)}(10원 미만 절사)`,
              ]}
              next={[{ href: "/ko/salary-calculator/", label: "월급 실수령액" }]}
            />
            <LegacyDetails title="가전 하나 더 쓰면 얼마나 늘까(한 줄 입력 지원)">
              <ElectricityBillCalculator />
            </LegacyDetails>
          </div>
        );
      }}
    />
  );
}
