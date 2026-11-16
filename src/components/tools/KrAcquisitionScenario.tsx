// 취득세 한국어판 (2026-11-16 쉬운 설명·가정 변화 적용). 영어판은 KrAcquisitionTaxCalculator 그대로.
import { acquisitionTax, type AcquisitionInput, type HouseCount } from "../../lib/kr-real-estate-tax";
import { ACQUISITION_ASSUMPTIONS, acquisitionBridge, acquisitionPlain, acquisitionTotal } from "../../lib/kr-tax-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["price", "houses", "regulated", "temporaryTwo", "over85"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: AcquisitionInput = { price: 700_000_000, houses: 1, regulated: false, temporaryTwo: false, over85: false };
const HOUSES = [
  { value: "1", label: "1주택" },
  { value: "2", label: "2주택" },
  { value: "3", label: "3주택" },
  { value: "4", label: "4주택 이상" },
] as const;
const YN = [
  { value: "y", label: "예" },
  { value: "n", label: "아니요" },
] as const;
type Edit = (patch: Partial<AcquisitionInput>, keys: readonly Key[]) => void;

function HouseFields({ input, edit, plain }: { input: AcquisitionInput; edit: Edit; plain: boolean }) {
  return (
    <div className="space-y-4">
      <ChoiceChips legend={plain ? "이번 집을 사면 우리 집(세대)은 몇 채를 갖게 되나요?" : "취득 후 세대 주택 수"} value={String(input.houses) as "1" | "2" | "3" | "4"} options={HOUSES} onChange={(v) => edit({ houses: Number(v) as HouseCount }, ["houses"])} />
      {input.houses > 1 && (
        <ChoiceChips legend={plain ? "이번 집이 조정대상지역에 있나요?" : "조정대상지역 소재"} value={input.regulated ? "y" : "n"} options={YN} onChange={(v) => edit({ regulated: v === "y" }, ["regulated"])} />
      )}
      {input.houses === 2 && input.regulated && (
        <ChoiceChips legend={plain ? "예전 집을 정해진 기간 안에 팔 건가요? (일시적 2주택)" : "일시적 2주택"} value={input.temporaryTwo ? "y" : "n"} options={YN} onChange={(v) => edit({ temporaryTwo: v === "y" }, ["temporaryTwo"])} />
      )}
    </div>
  );
}

export default function KrAcquisitionScenario() {
  return (
    <ScenarioTool<AcquisitionInput, Key>
      toolId="acquisition-tax-calculator"
      example={EXAMPLE}
      assumptions={ACQUISITION_ASSUMPTIONS}
      keys={KEYS}
      evaluate={acquisitionTotal}
      resultName="취득세 등 합계"
      questions={({ input, edit }) => [
        { title: "얼마짜리 집을 사나요?", keys: ["price"], body: <MoneyField label="집값(계약서 금액)" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} /> },
        { title: "집이 몇 채가 되나요?", keys: ["houses", "regulated", "temporaryTwo"], body: <HouseFields input={input} edit={edit} plain /> },
        {
          title: "전용면적이 85㎡(약 25.7평)를 넘나요?",
          keys: ["over85"],
          body: <ChoiceChips legend="흔히 말하는 34평형은 85㎡ 이하예요" value={input.over85 ? "y" : "n"} options={YN} onChange={(v) => edit({ over85: v === "y" }, ["over85"])} />,
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <MoneyField label="취득가액" value={input.price} onChange={(v) => edit({ price: v }, ["price"])} />
          <HouseFields input={input} edit={edit} plain={false} />
          <ChoiceChips legend="전용면적 85㎡ 초과" value={input.over85 ? "y" : "n"} options={YN} onChange={(v) => edit({ over85: v === "y" }, ["over85"])} />
        </div>
      )}
      summary={(i) => acquisitionPlain(i)}
      metrics={(i, s) => {
        const r = acquisitionTax(i);
        return [
          { label: "낼 돈 합계", value: s.money(r.total), tone: "primary" },
          { label: "취득세율", value: `${(r.rate * 100).toFixed(2)}%` },
          { label: "집값 대비", value: i.price > 0 ? `${((r.total / i.price) * 100).toFixed(2)}%` : "—" },
        ];
      }}
      sliders={["price"]}
      sweepCaption={() => "6억 원까지 1%, 9억 원 넘으면 3%예요. 그 사이는 집값에 따라 조금씩 올라가요(다주택 중과면 8%·12%로 평평해요)."}
      charts={(i, s) => <BridgeChart title="취득세는 세 가지를 더해요" steps={acquisitionBridge(i)} format={s.money} />}
      ask={[
        "생애 최초 주택이면 최대 200만 원까지 감면될 수 있어요.",
        "분양권·입주권, 오피스텔도 주택 수에 들어갈 수 있어요.",
        "잔금을 치른 날부터 60일 안에 신고하고 내야 해요.",
      ]}
      expertFooter={(i) => {
        const r = acquisitionTax(i);
        return (
          <ResultSteps
            steps={[
              `세율 ${(r.rate * 100).toFixed(2)}%${r.heavy ? "(지방세법 제13조의2 중과)" : "(제11조①8, 6억~9억 원 구간은 산식)"} → 취득세 ${exactWon(r.tax)}`,
              `지방교육세 ${exactWon(r.education)}${r.heavy ? "(0.4%)" : "(취득세의 10%)"}`,
              `농어촌특별세 ${exactWon(r.rural)}${i.over85 ? "" : "(85㎡ 이하 비과세)"}`,
              "생애최초 감면, 법인 취득 중과, 증여 취득(12%)은 넣지 않았어요.",
            ]}
            next={[{ href: "/ko/property-tax-calculator/", label: "재산세 계산기" }, { href: "/ko/capital-gains-tax-calculator/", label: "양도소득세 계산기" }]}
          />
        );
      }}
    />
  );
}
