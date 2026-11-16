// 하루 소비 열량 TDEE (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health-scenarios.ts tdeeResult.
import { ACTIVITY, TDEE_ASSUMPTIONS, kcal, tdeeCompare, tdeeOf, tdeePlain, tdeeResult, type Activity, type Sex, type TdeeLite } from "../../lib/health-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["sex", "age", "height", "weight", "activity"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: TdeeLite = { sex: "m", age: 30, height: 175, weight: 70, activity: "light" };
const SEX: { value: Sex; label: string }[] = [{ value: "m", label: "남성" }, { value: "f", label: "여성" }];
const ACTS = (Object.keys(ACTIVITY) as Activity[]).map((a) => ({ value: a, label: ACTIVITY[a].label }));

export default function TdeeScenario() {
  const body = (input: TdeeLite, edit: (p: Partial<TdeeLite>, k: Key[]) => void) => (
    <div className="space-y-3">
      <ChoiceChips<Sex> legend="성별" value={input.sex} options={SEX} onChange={(v) => edit({ sex: v }, ["sex"])} />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="나이" value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="세" step={1} min={15} />
        <NumberField label="키" value={input.height} onChange={(v) => edit({ height: v }, ["height"])} suffix="cm" step={1} min={120} />
        <NumberField label="몸무게" value={input.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={30} />
      </div>
    </div>
  );
  const act = (input: TdeeLite, edit: (p: Partial<TdeeLite>, k: Key[]) => void) => (
    <ChoiceChips<Activity> legend="평소 활동량" value={input.activity} options={ACTS} onChange={(v) => edit({ activity: v }, ["activity"])} />
  );
  return (
    <ScenarioTool<TdeeLite, Key>
      toolId="tdee-calculator"
      example={EXAMPLE}
      assumptions={TDEE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={tdeeOf}
      resultName="하루 소비 열량"
      formatResult={kcal}
      questions={({ input, edit }) => [
        { title: "몸에 대해 알려 주세요", keys: ["sex", "age", "height", "weight"], body: body(input, edit) },
        { title: "평소에 얼마나 움직이나요?", keys: ["activity"], body: (
          <>
            {act(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">헷갈리면 한 단계 낮게 고르세요. 대부분 활동량을 실제보다 높게 잡아요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {body(input, edit)}
          {act(input, edit)}
        </div>
      )}
      summary={tdeePlain}
      metrics={(i) => {
        const r = tdeeResult(i);
        return [
          { label: "기초대사량", value: kcal(r.bmr) },
          { label: "하루 소비 열량", value: kcal(r.tdee), tone: "primary" },
          { label: "감량 목표", value: kcal(r.loss) },
        ];
      }}
      sliders={["weight", "age"]}
      charts={(i) => <CompareBars title="활동량별 하루 소비 열량" caption="같은 몸에서 활동량만 바꿨어요." items={tdeeCompare(i)} format={kcal} />}
      askTitle="미리 알아 둘 점"
      ask={["임신·수유 중이거나 질환이 있으면 의료진과 상의하세요.", "하루 섭취를 남성 1,500kcal, 여성 1,200kcal 밑으로 내리지 않게 감량 목표를 잡았어요."]}
      expertFooter={(i) => {
        const r = tdeeResult(i);
        return (
          <ResultSteps
            steps={[
              `BMR = 10 × ${i.weight} + 6.25 × ${i.height} − 5 × ${i.age} ${i.sex === "m" ? "+ 5" : "− 161"} = ${kcal(r.bmr)}`,
              `TDEE = BMR × ${ACTIVITY[i.activity].k} = ${kcal(r.tdee)}`,
              `감량 −500 = ${kcal(r.loss)}, 증량 +300 = ${kcal(r.gain)}, 단백질 ${Math.round(r.protein)}g(1.6g/kg)`,
            ]}
            next={[{ href: "/ko/macro-calculator/", label: "탄단지 비율" }, { href: "/ko/bmi-calculator/", label: "BMI" }]}
          />
        );
      }}
    />
  );
}
