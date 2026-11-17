// 지급여력비율(K-ICS) 원리 계산기 (2026-11-17, 역량 지도 act-solvency). 계산: lib/pro-practice-2026.ts kicsResult.
import { KICS_ASSUMPTIONS, KICS_LEVEL, kicsBridge, kicsPlain, kicsRatio, kicsResult, type KicsLite } from "../../../lib/pro-practice-2026";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["available", "life", "nonlife", "market", "credit", "operational", "taxAdj"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<KicsLite>, k: Key[]) => void;
const E = 1e8;
const EXAMPLE: KicsLite = { available: 3000 * E, life: 1200 * E, nonlife: 300 * E, market: 900 * E, credit: 400 * E, operational: 100 * E, taxAdj: 200 * E };
const eok = (n: number) => `${Math.round(n / E).toLocaleString("ko-KR")}억 원`;
const ratio = (n: number) => `${(Math.round(n * 1000) / 10).toLocaleString("ko-KR")}%`;
const FIELDS: { key: Key; label: string }[] = [
  { key: "life", label: "생명·장기손해보험위험" },
  { key: "nonlife", label: "일반손해보험위험" },
  { key: "market", label: "시장위험" },
  { key: "credit", label: "신용위험" },
  { key: "operational", label: "운영위험" },
  { key: "taxAdj", label: "법인세 조정" },
];

export default function KicsRatio() {
  const capital = (i: KicsLite, edit: Edit) => <NumberField label="가용자본" value={Math.round(i.available / E)} onChange={(v) => edit({ available: v * E }, ["available"])} suffix="억 원" />;
  const risks = (i: KicsLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-3">
      {FIELDS.map((f) => (
        <NumberField key={f.key} label={f.label} value={Math.round(i[f.key] / E)} onChange={(v) => edit({ [f.key]: v * E } as Partial<KicsLite>, [f.key])} suffix="억 원" />
      ))}
    </div>
  );
  return (
    <ScenarioTool<KicsLite, Key>
      toolId="kics-solvency-ratio-calculator"
      example={EXAMPLE}
      assumptions={KICS_ASSUMPTIONS}
      keys={KEYS}
      evaluate={kicsRatio}
      resultName="지급여력비율"
      formatResult={ratio}
      questions={({ input, edit }) => [
        { title: "버틸 수 있는 자본은 얼마인가요?", keys: ["available"], body: capital(input, edit) },
        { title: "위험별로 잃을 수 있는 금액을 넣어 주세요", keys: ["life", "nonlife", "market", "credit", "operational", "taxAdj"], body: risks(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          {capital(input, edit)}
          {risks(input, edit)}
        </div>
      )}
      summary={kicsPlain}
      metrics={(i) => {
        const r = kicsResult(i);
        return [
          { label: "지급여력비율", value: Number.isFinite(r.ratio) ? ratio(r.ratio) : "—", tone: "primary" },
          { label: "요구자본", value: eok(r.required) },
          { label: "판정", value: KICS_LEVEL[r.level] },
        ];
      }}
      sliders={["available", "market", "life", "credit"]}
      marksFor={(key, i) => (key === "available" ? [{ at: kicsResult(i).required, label: "100%" }] : undefined)}
      charts={(i) => <BridgeChart title="위험액에서 요구자본까지" caption="상관계수로 합치면 단순 합계보다 작아져요(분산효과)." steps={kicsBridge(i)} format={eok} />}
      askTitle="계리·리스크 담당에게 확인할 것"
      ask={["상관계수는 설명용 예시예요. 실제 계수와 충격 시나리오는 감독규정 시행세칙을 따라요.", "경과조치를 적용하면 비율이 달라질 수 있어요.", "가용자본에는 조정·차감 항목과 자본 인정 한도가 있어요."]}
      expertFooter={(i) => {
        const r = kicsResult(i);
        return (
          <ResultSteps
            steps={[
              `기본요구자본 = √(Σ ρᵢⱼ·Rᵢ·Rⱼ) = ${eok(r.basic)} (단순 합계 ${eok(r.sum)})`,
              `요구자본 = ${eok(r.basic)} + 운영위험 ${eok(i.operational)} − 법인세 조정 ${eok(i.taxAdj)} = ${eok(r.required)}`,
              `지급여력비율 = ${eok(i.available)} ÷ ${eok(r.required)} = ${Number.isFinite(r.ratio) ? ratio(r.ratio) : "—"}`,
              "적기시정조치: 100% 미만 경영개선권고, 50% 미만 요구, 0% 미만 명령",
            ]}
            next={[{ href: "/ko/ifrs17-csm-simulator/", label: "IFRS 17 CSM 원리" }, { href: "/ko/insurance-law-guide/", label: "보험 법령 길잡이" }]}
          />
        );
      }}
    />
  );
}
