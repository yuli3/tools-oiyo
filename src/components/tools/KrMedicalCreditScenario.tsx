// 의료비 세액공제 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-medical-cost-2026.ts, 가정·문장: lib/kr-money-scenarios.ts.
import { MEDICAL_ASSUMPTIONS, medicalBridge, medicalPlain, medicalResult, medicalSaved, type MedicalLite } from "../../lib/kr-money-scenarios";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["salary", "specific", "general", "premature", "infertility"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: MedicalLite = { salary: 50_000_000, specific: 2_000_000, general: 1_000_000, premature: 0, infertility: 0 };

export default function KrMedicalCreditScenario() {
  return (
    <ScenarioTool<MedicalLite, Key>
      toolId="medical-expense-tax-credit-calculator"
      example={EXAMPLE}
      assumptions={MEDICAL_ASSUMPTIONS}
      keys={KEYS}
      evaluate={medicalSaved}
      resultName="줄어드는 세금"
      questions={({ input, edit }) => [
        { title: "공제받을 사람의 연봉은요?", keys: ["salary"], body: (
          <>
            <MoneyField label="연봉(비과세 빼고)" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} />
            <p className="mt-2 text-xs text-muted-foreground">연봉의 3%를 넘게 써야 공제가 시작돼요. 맞벌이면 연봉이 낮은 쪽이 유리할 때가 많아요.</p>
          </>
        ) },
        { title: "1년 병원·약값은 얼마였나요?", keys: ["specific", "general"], body: (
          <div className="space-y-3">
            <MoneyField label="나·65세 이상·6세 이하·장애인 병원비" value={input.specific} onChange={(v) => edit({ specific: v }, ["specific"])} />
            <MoneyField label="그 밖의 가족 병원비" value={input.general} onChange={(v) => edit({ general: v }, ["general"])} />
            <p className="text-xs text-muted-foreground">실손보험으로 돌려받은 돈은 빼 주세요. 홈택스 간소화 자료에 나와요.</p>
          </div>
        ) },
        { title: "난임 시술이나 미숙아 치료비가 있나요?", keys: ["infertility", "premature"], body: (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="난임 시술비(30%)" value={input.infertility} onChange={(v) => edit({ infertility: v }, ["infertility"])} />
            <MoneyField label="미숙아·선천성이상아(20%)" value={input.premature} onChange={(v) => edit({ premature: v }, ["premature"])} />
          </div>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="총급여" value={input.salary} onChange={(v) => edit({ salary: v }, ["salary"])} />
          <MoneyField label="본인 등 의료비(한도 없음)" value={input.specific} onChange={(v) => edit({ specific: v }, ["specific"])} />
          <MoneyField label="일반 부양가족 의료비(700만 한도)" value={input.general} onChange={(v) => edit({ general: v }, ["general"])} />
          <MoneyField label="미숙아·선천성이상아(20%)" value={input.premature} onChange={(v) => edit({ premature: v }, ["premature"])} />
          <MoneyField label="난임시술비(30%)" value={input.infertility} onChange={(v) => edit({ infertility: v }, ["infertility"])} />
        </div>
      )}
      summary={medicalPlain}
      metrics={(i, s) => {
        const r = medicalResult(i);
        return [
          { label: "줄어드는 세금", value: s.money(r.withLocal), tone: "primary" },
          { label: "공제 문턱(연봉 3%)", value: s.money(r.floor) },
          { label: "공제 대상 금액", value: s.money(r.generalBase + r.specificBase + r.prematureBase + r.infertilityBase) },
        ];
      }}
      sliders={["specific", "general", "infertility"]}
      sweeps={["specific", "general", "infertility"]}
      sweepCaption={(a) => (a.key === "general" ? "다른 가족 병원비는 700만 원에서 공제가 멈춰요. 연봉 3% 문턱까지는 0이에요." : "연봉의 3%를 넘는 지점부터 곡선이 올라가요.")}
      charts={(i, s) => <BridgeChart title="쓴 병원비에서 공제 대상까지" steps={medicalBridge(i)} format={s.money} />}
      ask={[
        "미용·성형 수술, 건강기능식품은 빠져요. 안경·콘택트렌즈는 1인당 50만 원까지 들어가요.",
        "산후조리원 비용은 출산 1회당 200만 원까지 들어가요.",
        "결정세액보다 많이 줄지는 않아요. 낼 세금이 적으면 공제가 다 쓰이지 않을 수 있어요.",
      ]}
      expertFooter={(i) => {
        const r = medicalResult(i);
        return (
          <ResultSteps
            steps={[
              `문턱 = 총급여 ${exactWon(i.salary)} × 3% = ${exactWon(r.floor)}(일반 → 본인 등 → 미숙아 → 난임 순으로 차감)`,
              `일반 ${exactWon(r.generalBase)}, 본인 등 ${exactWon(r.specificBase)}, 미숙아 ${exactWon(r.prematureBase)}, 난임 ${exactWon(r.infertilityBase)}`,
              `세액공제(소득세법 제59조의4②) ${exactWon(r.credit)} + 지방소득세 = ${exactWon(r.withLocal)}`,
            ]}
            next={[
              { href: "/ko/copay-cap-refund-calculator/", label: "본인부담상한제 환급" },
              { href: "/ko/year-end-settlement-calculator/", label: "연말정산 전체 계산" },
            ]}
          />
        );
      }}
    />
  );
}
