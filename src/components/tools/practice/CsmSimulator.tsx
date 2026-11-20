// IFRS 17 보험계약마진(CSM) 원리 시뮬레이터 (2026-11-17, 역량 지도 act-reserve). 계산: lib/pro-practice-2026.ts csmResult.
import { CSM_ASSUMPTIONS, csmBridge, csmPlain, csmResult, csmValue, type CsmLite } from "../../../lib/pro-practice-2026";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import CompareBars from "../viz/CompareBars";
import MoneyField from "../viz/MoneyField";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["premium", "years", "claims", "expense", "acquisition", "rate", "ra"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<CsmLite>, k: Key[]) => void;
const EXAMPLE: CsmLite = { premium: 1_000_000, years: 10, claims: 600_000, expense: 100_000, acquisition: 300_000, rate: 0.03, ra: 0.05 };
const won = (n: number) => `${n < 0 ? "−" : ""}${Math.round(Math.abs(n)).toLocaleString("ko-KR")}원`;
const pctIn = (v: number) => Math.round(v * 1000) / 10;

export default function CsmSimulator() {
  const cash = (i: CsmLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <MoneyField label="연 보험료(연초)" value={i.premium} onChange={(v) => edit({ premium: v }, ["premium"])} />
      <NumberField label="보장 기간" value={i.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" min={1} />
      <MoneyField label="해마다 예상 보험금" value={i.claims} onChange={(v) => edit({ claims: v }, ["claims"])} />
      <MoneyField label="해마다 유지비" value={i.expense} onChange={(v) => edit({ expense: v }, ["expense"])} />
      <MoneyField label="신계약비(처음 한 번)" value={i.acquisition} onChange={(v) => edit({ acquisition: v }, ["acquisition"])} />
    </div>
  );
  const measure = (i: CsmLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label="할인율" value={pctIn(i.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.1} />
      <NumberField label="위험조정(유출 현재가치 대비)" value={pctIn(i.ra)} onChange={(v) => edit({ ra: v / 100 }, ["ra"])} suffix="%" step={0.5} />
    </div>
  );
  return (
    <ScenarioTool<CsmLite, Key>
      toolId="ifrs17-csm-simulator"
      example={EXAMPLE}
      assumptions={CSM_ASSUMPTIONS}
      keys={KEYS}
      evaluate={csmValue}
      resultName="CSM(음수는 손실)"
      formatResult={won}
      questions={({ input, edit }) => [
        { title: "계약의 돈 흐름을 넣어 주세요", keys: ["premium", "years", "claims", "expense", "acquisition"], body: cash(input, edit) },
        { title: "측정 가정을 정해 주세요", keys: ["rate", "ra"], body: measure(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          {cash(input, edit)}
          {measure(input, edit)}
        </div>
      )}
      summary={csmPlain}
      metrics={(i) => {
        const r = csmResult(i);
        return [
          { label: r.csm > 0 ? "최초 CSM" : "손실요소", value: won(r.csm > 0 ? r.csm : r.loss), tone: "primary" },
          { label: "위험조정", value: won(r.ra) },
          { label: "첫해 풀리는 CSM", value: won(r.release[0]?.released ?? 0) },
        ];
      }}
      sliders={["claims", "rate", "ra", "expense"]}
      charts={(i) => {
        const r = csmResult(i);
        return (
          <div className="space-y-4">
            <BridgeChart title="보험료에서 CSM까지" steps={csmBridge(i)} format={won} />
            {r.csm > 0 && <CompareBars title="해마다 이익으로 풀리는 CSM" caption="보장 단위가 해마다 같다고 보고, 이자(할증)를 더한 뒤 남은 기간으로 나눠요." items={r.release.slice(0, 10).map((x) => ({ label: `${x.year}년차`, value: x.released }))} format={won} />}
          </div>
        );
      }}
      askTitle="계리·회계 담당에게 확인할 것"
      ask={["실제 측정은 계약 묶음(포트폴리오·연도·수익성 그룹)마다 해요.", "할인율은 무위험 수익률 곡선에 유동성 프리미엄을 더한 곡선을 써요.", "보장 단위는 상품마다 정한 방법(보험가입금액 등)을 따라요."]}
      expertFooter={(i) => {
        const r = csmResult(i);
        return (
          <ResultSteps
            steps={[
              `보험료 현재가치 = Σ ${won(i.premium)} × v^t (t=0..${r.n - 1}) = ${won(r.pvIn)}`,
              `보험금·유지비 현재가치 = ${won(r.pvClaims)} + ${won(r.pvExp)} (연말 지급), 신계약비 ${won(r.acq)}`,
              `위험조정 = (${won(r.pvClaims)} + ${won(r.pvExp)}) × ${pctIn(i.ra)}% = ${won(r.ra)}`,
              `이행현금흐름 = ${won(r.fcf)} → ${r.csm > 0 ? `CSM ${won(r.csm)}` : `손실요소 ${won(r.loss)}`}`,
            ]}
            next={[{ href: "/ko/insurance-premium-basics/", label: "보험료 계산 원리" }, { href: "/ko/kics-solvency-ratio-calculator/", label: "지급여력비율(K-ICS) 원리" }]}
          />
        );
      }}
    />
  );
}
