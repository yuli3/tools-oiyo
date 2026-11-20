// 장해 지급률·과실 비율 보험금 계산기 (2026-11-17, 역량 지도 adj-fault). 계산: lib/pro-practice-2026.ts claimResult.
import { CLAIM_ASSUMPTIONS, DISABILITY_EXAMPLES, claimPay, claimPlain, claimResult, faultCurve, type ClaimLite } from "../../../lib/pro-practice-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import MoneyField from "../viz/MoneyField";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["kind", "sum", "rates", "prior", "damage", "fault", "deductible", "limit"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<ClaimLite>, k: Key[]) => void;
const EXAMPLE: ClaimLite = { kind: "disability", sum: 100_000_000, rates: [0.1, 0.05, 0], prior: 0, damage: 10_000_000, fault: 0.3, deductible: 200_000, limit: 0 };
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pctIn = (v: number) => Math.round(v * 1000) / 10;
const KIND = [
  { value: "disability", label: "후유장해 보험금" },
  { value: "fault", label: "과실이 있는 사고 보상" },
] as const;

export default function ClaimPayout() {
  const kind = (i: ClaimLite, edit: Edit) => <ChoiceChips<ClaimLite["kind"]> legend="어떤 보험금인가요?" value={i.kind} options={KIND} onChange={(v) => edit({ kind: v }, ["kind"])} />;
  const detail = (i: ClaimLite, edit: Edit) =>
    i.kind === "disability" ? (
      <div className="space-y-3">
        <MoneyField label="장해 보험가입금액" value={i.sum} onChange={(v) => edit({ sum: v }, ["sum"])} />
        <div className="flex flex-wrap gap-2" aria-label="장해분류표 예시">
          {DISABILITY_EXAMPLES.map((x) => (
            <button key={x.label} type="button" className="min-h-11 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted" onClick={() => edit({ rates: [x.rate, ...i.rates.slice(1)] }, ["rates"])}>
              {x.label} {pctIn(x.rate)}%
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[0, 1, 2].map((n) => (
            <NumberField key={n} label={`부위 ${n + 1} 지급률`} value={pctIn(i.rates[n] ?? 0)} onChange={(v) => edit({ rates: i.rates.map((r, k) => (k === n ? v / 100 : r)) }, ["rates"])} suffix="%" step={1} />
          ))}
          <NumberField label="같은 부위 기존 장해" value={pctIn(i.prior)} onChange={(v) => edit({ prior: v / 100 }, ["prior"])} suffix="%" step={1} />
        </div>
      </div>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2">
        <MoneyField label="손해액" value={i.damage} onChange={(v) => edit({ damage: v }, ["damage"])} />
        <NumberField label="내 과실 비율" value={pctIn(i.fault)} onChange={(v) => edit({ fault: v / 100 }, ["fault"])} suffix="%" step={5} />
        <MoneyField label="자기부담금" value={i.deductible} onChange={(v) => edit({ deductible: v }, ["deductible"])} />
        <MoneyField label="보상 한도(없으면 0)" value={i.limit} onChange={(v) => edit({ limit: v }, ["limit"])} />
      </div>
    );
  return (
    <ScenarioTool<ClaimLite, Key>
      toolId="disability-fault-claim-calculator"
      example={EXAMPLE}
      assumptions={CLAIM_ASSUMPTIONS}
      keys={KEYS}
      evaluate={claimPay}
      resultName="보험금"
      formatResult={won}
      questions={({ input, edit }) => [
        { title: "어떤 보험금을 계산할까요?", keys: ["kind"], body: kind(input, edit) },
        { title: input.kind === "disability" ? "장해 정도를 넣어 주세요" : "손해와 과실을 넣어 주세요", keys: input.kind === "disability" ? ["sum", "rates", "prior"] : ["damage", "fault", "deductible", "limit"], body: detail(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          {kind(input, edit)}
          {detail(input, edit)}
        </div>
      )}
      summary={claimPlain}
      metrics={(i) => {
        const r = claimResult(i);
        return i.kind === "disability"
          ? [
              { label: "장해 보험금", value: won(r.pay), tone: "primary" },
              { label: "적용 지급률", value: `${pctIn(r.total)}%` },
              { label: "100% 한도", value: r.capped ? "적용" : "해당 없음" },
            ]
          : [
              { label: "받을 보험금", value: won(r.pay), tone: "primary" },
              { label: "과실로 빠진 금액", value: won(r.offset) },
              { label: "한도", value: r.capped ? "한도까지만" : "한도 안" },
            ];
      }}
      sliders={["rate0", "sum", "fault", "damage"]}
      charts={(i) => (i.kind === "fault" ? <CompareBars title="내 과실 비율별 보험금" items={faultCurve(i)} format={won} /> : null)}
      askTitle="손해사정사나 보험사에 확인할 것"
      ask={["장해 판정은 의사 진단서와 약관 장해분류표로 해요. 판정이 다르면 제3 의료기관 판정을 요청할 수 있어요.", "과실 비율에 다툼이 있으면 손해보험협회 과실비율분쟁심의위원회를 이용할 수 있어요.", "보험금 청구 시효는 3년이에요(상법 제662조)."]}
      expertFooter={(i) => {
        const r = claimResult(i);
        return (
          <ResultSteps
            steps={
              i.kind === "disability"
                ? [`지급률 합 = ${i.rates.map(pctIn).join(" + ")} = ${pctIn(r.raw)}%`, `기존 장해 ${pctIn(i.prior)}% 차감, 100% 한도 → ${pctIn(r.total)}%`, `보험금 = ${won(i.sum)} × ${pctIn(r.total)}% = ${won(r.pay)}`]
                : [`과실상계 = ${won(i.damage)} × ${pctIn(i.fault)}% = ${won(r.offset)}`, `자기부담금 ${won(i.deductible)} 차감`, `보험금 = ${won(r.pay)}${r.capped ? " (한도 적용)" : ""}`]
            }
            next={[{ href: "/ko/insurance-law-guide/", label: "보험 법령 길잡이" }, { href: "/ko/law-guide/", label: "법령 길잡이 15분야" }]}
          />
        );
      }}
    />
  );
}
