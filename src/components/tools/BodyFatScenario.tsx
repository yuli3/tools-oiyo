// 체지방률 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health-scenarios.ts navyBodyFat(cm 공식).
import { BODY_FAT_ASSUMPTIONS, bodyFatPct, bodyFatPlain, bodyFatResult, type BodyFatLite, type Sex } from "../../lib/health-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["sex", "height", "weight", "waist", "neck", "hip"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: BodyFatLite = { sex: "m", height: 175, weight: 72, waist: 84, neck: 38, hip: 96 };
const SEX: { value: Sex; label: string }[] = [{ value: "m", label: "남성" }, { value: "f", label: "여성" }];
const pct = (n: number) => (Number.isFinite(n) ? `${(Math.round(n * 10) / 10).toLocaleString("ko-KR")}%` : "—");

export default function BodyFatScenario() {
  const body = (input: BodyFatLite, edit: (p: Partial<BodyFatLite>, k: Key[]) => void) => (
    <div className="space-y-3">
      <ChoiceChips<Sex> legend="성별" value={input.sex} options={SEX} onChange={(v) => edit({ sex: v }, ["sex"])} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="키" value={input.height} onChange={(v) => edit({ height: v }, ["height"])} suffix="cm" step={1} min={100} />
        <NumberField label="몸무게" value={input.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={20} />
      </div>
    </div>
  );
  const tape = (input: BodyFatLite, edit: (p: Partial<BodyFatLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <NumberField label="허리둘레" value={input.waist} onChange={(v) => edit({ waist: v }, ["waist"])} suffix="cm" step={0.5} min={40} />
      <NumberField label="목둘레" value={input.neck} onChange={(v) => edit({ neck: v }, ["neck"])} suffix="cm" step={0.5} min={20} />
      {input.sex === "f" && <NumberField label="엉덩이둘레" value={input.hip} onChange={(v) => edit({ hip: v }, ["hip"])} suffix="cm" step={0.5} min={50} />}
    </div>
  );
  return (
    <ScenarioTool<BodyFatLite, Key>
      toolId="body-fat-calculator"
      example={EXAMPLE}
      assumptions={BODY_FAT_ASSUMPTIONS}
      keys={KEYS}
      evaluate={bodyFatPct}
      resultName="체지방률"
      formatResult={pct}
      questions={({ input, edit }) => [
        { title: "성별·키·몸무게를 알려 주세요", keys: ["sex", "height", "weight"], body: body(input, edit) },
        { title: "줄자로 둘레를 재 주세요", keys: ["waist", "neck", "hip"], body: (
          <>
            {tape(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">목은 울대뼈 바로 아래, 허리는 {input.sex === "m" ? "배꼽 높이" : "가장 가는 곳"}에서 재요. 줄자가 없으면 예시 값 그대로 두고 그래프로 감을 잡아 보세요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {body(input, edit)}
          {tape(input, edit)}
        </div>
      )}
      summary={bodyFatPlain}
      metrics={(i) => {
        const r = bodyFatResult(i);
        return [
          { label: "체지방률", value: pct(r.pct), tone: "primary" },
          { label: "체지방량", value: Number.isFinite(r.fat) ? `${r.fat.toFixed(1)}kg` : "—" },
          { label: "판정", value: r.band },
        ];
      }}
      sliders={i_sliders}
      sweepCaption={(a) => (a.key === "waist" ? "허리둘레가 결과를 가장 크게 바꿔요. 같은 사람이 같은 자리에서 재야 비교가 돼요." : undefined)}
      charts={(i) => (
        <CompareBars
          title="허리둘레를 줄이면"
          items={[0, 3, 6].map((d) => ({ label: d === 0 ? `지금 ${i.waist}cm` : `${d}cm 줄면`, value: bodyFatPct({ ...i, waist: i.waist - d }), current: d === 0 }))}
          format={pct}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={["둘레법은 오차가 ±3%p 정도라 인바디·DEXA와 다를 수 있어요.", "성인 기준이에요. 판정 구간은 미국운동협회(ACE) 분류를 따랐어요."]}
      expertFooter={(i) => {
        const r = bodyFatResult(i);
        return (
          <ResultSteps
            steps={[
              i.sex === "m"
                ? `495 ÷ (1.0324 − 0.19077·log₁₀(허리 ${i.waist} − 목 ${i.neck}) + 0.15456·log₁₀(키 ${i.height})) − 450 = ${pct(r.pct)}`
                : `495 ÷ (1.29579 − 0.35004·log₁₀(허리 ${i.waist} + 엉덩이 ${i.hip} − 목 ${i.neck}) + 0.221·log₁₀(키 ${i.height})) − 450 = ${pct(r.pct)}`,
              `체지방량 = ${i.weight}kg × ${pct(r.pct)} = ${Number.isFinite(r.fat) ? r.fat.toFixed(1) : "—"}kg`,
            ]}
            next={[{ href: "/ko/bmi-calculator/", label: "BMI" }, { href: "/ko/tdee-calculator/", label: "하루 소비 열량" }]}
          />
        );
      }}
    />
  );
}

const i_sliders = ["waist", "neck", "hip"];
