// 전월세 전환 (2026-11-16 쉬운 설명·가정 변화 적용). 월세→전세 환산은 기존 계산기를 전문가 모드 아래에 남겨요.
import { CONVERT_ASSUMPTIONS, convertPlain, convertRent, legalConversionCap, type ConvertLite } from "../../lib/kr-home-scenarios";
import JeonseMonthlyConverter from "./JeonseMonthlyConverter";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import LegacyDetails from "./viz/LegacyDetails";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["jeonse", "deposit", "rate", "baseRate"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: ConvertLite = { jeonse: 300_000_000, deposit: 50_000_000, rate: 4.5 / 100, baseRate: 2.5 / 100 };
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function KrRentConvertScenario() {
  return (
    <ScenarioTool<ConvertLite, Key>
      toolId="jeonse-monthly-converter"
      example={EXAMPLE}
      assumptions={CONVERT_ASSUMPTIONS}
      keys={KEYS}
      evaluate={convertRent}
      resultName="월세"
      marksFor={(key, i) => (key === "rate" ? [{ at: legalConversionCap(i.baseRate), label: "법정 상한" }] : undefined)}
      questions={({ input, edit }) => [
        { title: "지금 전세금은 얼마인가요?", keys: ["jeonse"], body: <MoneyField label="전세 보증금" value={input.jeonse} onChange={(v) => edit({ jeonse: v }, ["jeonse"])} /> },
        { title: "보증금을 얼마로 낮추나요?", keys: ["deposit"], body: <MoneyField label="바꾼 뒤 남길 보증금" value={input.deposit} onChange={(v) => edit({ deposit: v }, ["deposit"])} /> },
        { title: "전환율은 몇 %인가요?", keys: ["rate", "baseRate"], body: (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="집주인이 제시한 전환율" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
              <NumberField label="한국은행 기준금리" value={pctField(input.baseRate)} onChange={(v) => edit({ baseRate: v / 100 }, ["baseRate"])} suffix="%" step={0.25} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">기준금리는 바뀌어요. 계약 전에 한국은행 홈페이지에서 지금 값을 확인하세요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="전세 보증금" value={input.jeonse} onChange={(v) => edit({ jeonse: v }, ["jeonse"])} />
          <MoneyField label="바꾼 뒤 보증금" value={input.deposit} onChange={(v) => edit({ deposit: v }, ["deposit"])} />
          <NumberField label="전환율" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
          <NumberField label="기준금리" value={pctField(input.baseRate)} onChange={(v) => edit({ baseRate: v / 100 }, ["baseRate"])} suffix="%" step={0.25} />
        </div>
      )}
      summary={convertPlain}
      metrics={(i, s) => {
        const cap = legalConversionCap(i.baseRate);
        return [
          { label: "바뀐 월세", value: s.money(convertRent(i)), tone: "primary" },
          { label: `법정 상한(${(cap * 100).toFixed(2)}%) 월세`, value: s.money(convertRent({ ...i, rate: cap })) },
          { label: "1년 월세 합계", value: s.money(convertRent(i) * 12) },
        ];
      }}
      sliders={["deposit", "rate"]}
      charts={(i, s) => (
        <CompareBars
          title="제시받은 월세와 법정 상한 월세"
          caption="계약 기간 중에 바꾸는 경우 법정 상한을 넘으면 넘는 부분은 주지 않아도 돼요."
          items={[
            { label: "제시받은 전환율", value: convertRent(i), current: true },
            { label: "법정 상한", value: convertRent({ ...i, rate: legalConversionCap(i.baseRate) }) },
          ]}
          format={s.money}
        />
      )}
      ask={["주택임대차보호법 시행령 제9조 기준이에요(연 10%와 기준금리 + 2%p 중 낮은 값).", "상가 건물은 다른 상한(기준금리 × 4.5배 등)을 써요."]}
      expertFooter={(i) => (
        <div className="space-y-4">
          <ResultSteps
            steps={[
              `월세 = (${exactWon(i.jeonse)} − ${exactWon(i.deposit)}) × ${(i.rate * 100).toFixed(2)}% ÷ 12 = ${exactWon(convertRent(i))}`,
              `법정 상한 = min(10%, 기준금리 ${(i.baseRate * 100).toFixed(2)}% + 2%p) = ${(legalConversionCap(i.baseRate) * 100).toFixed(2)}%`,
            ]}
            next={[{ href: "/ko/jeonse-vs-rent-calculator/", label: "전세 vs 월세" }, { href: "/ko/monthly-rent-tax-credit-calculator/", label: "월세 세액공제" }]}
          />
          <LegacyDetails title="월세를 전세로 바꾸면 얼마일까(반대 방향 계산)">
            <JeonseMonthlyConverter locale="ko" />
          </LegacyDetails>
        </div>
      )}
    />
  );
}
