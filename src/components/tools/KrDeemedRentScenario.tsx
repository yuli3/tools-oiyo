// 간주임대료 부가세 (2026-11-16 쉬운 설명·가정 변화 적용). 날짜로 정확히 계산하는 기존 계산기는 전문가 모드 아래에 남겨요.
import { VAT_RATES } from "../../lib/kr-vat-2026";
import { DEEMED_ASSUMPTIONS, deemedPlain, deemedResult, deemedVat, type DeemedLite } from "../../lib/kr-money-scenarios";
import DeemedRentVatCalculator from "./DeemedRentVatCalculator";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import LegacyDetails from "./viz/LegacyDetails";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["deposit", "days", "rate"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: DeemedLite = { deposit: 100_000_000, days: 184, rate: VAT_RATES.deemedRentInterest };

export default function KrDeemedRentScenario() {
  return (
    <ScenarioTool<DeemedLite, Key>
      toolId="deemed-rent-vat-calculator"
      example={EXAMPLE}
      assumptions={DEEMED_ASSUMPTIONS}
      keys={KEYS}
      evaluate={deemedVat}
      resultName="간주임대료 부가세"
      questions={({ input, edit }) => [
        { title: "상가·사무실 보증금은 얼마인가요?", keys: ["deposit"], body: <MoneyField label="임대보증금" value={input.deposit} onChange={(v) => edit({ deposit: v }, ["deposit"])} /> },
        { title: "이번 신고 기간에 며칠 빌려줬나요?", keys: ["days"], body: (
          <>
            <NumberField label="빌려준 날수(반기 전체면 181~184일)" value={input.days} onChange={(v) => edit({ days: v }, ["days"])} suffix="일" step={1} min={0} />
            <p className="mt-2 text-xs text-muted-foreground">1기는 1~6월(181일, 윤년 182일), 2기는 7~12월(184일)이에요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyField label="임대보증금" value={input.deposit} onChange={(v) => edit({ deposit: v }, ["deposit"])} />
          <NumberField label="과세기간 임대 일수" value={input.days} onChange={(v) => edit({ days: v }, ["days"])} suffix="일" step={1} min={0} />
          <NumberField label="정기예금이자율" value={Number((input.rate * 100).toFixed(2))} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
        </div>
      )}
      summary={deemedPlain}
      metrics={(i, s) => {
        const r = deemedResult(i);
        return [
          { label: "낼 부가세", value: s.money(r.vat), tone: "primary" },
          { label: "간주임대료", value: s.money(r.rent) },
          { label: "1년이면", value: s.money(Math.floor((i.deposit * i.rate * VAT_RATES.vat))) },
        ];
      }}
      sliders={["deposit", "rate"]}
      ask={["보증금으로 산 건물·땅의 건설비 상당액을 빼는 계산(부동산임대업자)은 넣지 않았어요.", "겸용주택이면 주택 부분은 빼고 계산해요."]}
      expertFooter={(i) => {
        const r = deemedResult(i);
        return (
          <div className="space-y-4">
            <ResultSteps
              steps={[
                `간주임대료 = ${exactWon(i.deposit)} × ${r.days}일 × ${(i.rate * 100).toFixed(1)}% ÷ 365 = ${exactWon(r.rent)}(부가가치세법 시행령 제65조)`,
                `부가세 = ${exactWon(r.rent)} × 10% = ${exactWon(r.vat)}`,
              ]}
              next={[{ href: "/ko/vat-calculator/", label: "부가세 계산기" }, { href: "/ko/housing-rental-income-tax-calculator/", label: "주택임대소득세" }]}
            />
            <LegacyDetails title="계약 날짜로 정확히 계산하기(한 줄 입력 지원)">
              <DeemedRentVatCalculator />
            </LegacyDetails>
          </div>
        );
      }}
    />
  );
}
