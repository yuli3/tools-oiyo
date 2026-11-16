// 품질 이슈·공급 복구 (2026-11-16). 계산: lib/biz-ops.ts qualityRecovery·allocateSupply. 회수 범위 비용과 부족 물량 배분 비교.
import { qualityRecovery, type AllocationRule, type QualityRecoveryInput } from "../../../lib/biz-ops";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, RangeField, SmallButton, TextField, Verdict, pct1, useSaved } from "./common";

const TOOL_ID = "quality-recovery-planner";
const EXAMPLE: QualityRecoveryInput = {
  lots: [
    { id: "L-0912", units: 12_000, defectRate: 0.08, shippedRatio: 0.6 },
    { id: "L-0913", units: 10_000, defectRate: 0.02, shippedRatio: 0.3 },
  ],
  recallCostPerUnit: 1_500,
  remakeCostPerUnit: 4_200,
  goodStock: 9_000,
  customers: [
    { name: "대형마트", demand: 6_000, priority: 1, penaltyPerUnit: 2_000 },
    { name: "온라인몰", demand: 4_000, priority: 2, penaltyPerUnit: 3_500 },
    { name: "면세점", demand: 2_000, priority: 3, penaltyPerUnit: 1_000 },
  ],
};
const RULE: Record<AllocationRule, string> = { priority: "중요 고객 먼저", penalty: "위약금 큰 곳 먼저", proRata: "모두 같은 비율" };
const n0 = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}개`;

export default function QualityRecovery() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [s, setS, reset] = useSaved<QualityRecoveryInput>("quality-recovery", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const r = qualityRecovery(s);
  const cheapest = r.allocations.find((a) => a.rule === r.cheapestRule)!;
  const cheapScope = r.scopes.reduce((a, b) => (b.cost < a.cost ? b : a));
  const setLot = (k: number, p: Partial<QualityRecoveryInput["lots"][number]>) => setS({ ...s, lots: s.lots.map((l, j) => (j === k ? { ...l, ...p } : l)) });
  const setCus = (k: number, p: Partial<QualityRecoveryInput["customers"][number]>) => setS({ ...s, customers: s.customers.map((c, j) => (j === k ? { ...c, ...p } : c)) });

  const memo = () =>
    [
      "[품질 이슈·공급 복구]",
      ...r.lots.map((l) => `- ${l.id}: ${n0(l.units)}, 불량 추정 ${n0(l.defects)}, 시장 ${n0(l.inMarket)}`),
      `불량률 ${pct1(r.totals.defectRate)}. 회수 범위별 비용: ${r.scopes.map((x) => `${x.label} ${exactWon(x.cost)}`).join(" / ")}`,
      `양품 ${n0(s.goodStock)} 배분 위약금: ${r.allocations.map((a) => `${RULE[a.rule]} ${exactWon(a.totalPenalty)}`).join(" / ")}`,
      `손실이 가장 적은 배분: ${RULE[r.cheapestRule]} → ${cheapest.rows.map((x) => `${x.name} ${n0(x.allocated)}`).join(", ")}`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">문제가 생긴 로트</h2>
        {s.lots.map((l, k) => (
          <div key={k} className="space-y-2 rounded-md border border-border bg-background p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <TextField label="로트 번호" value={l.id} onChange={(v) => setLot(k, { id: v })} />
              <NumberField label="생산 수량" value={l.units} onChange={(v) => setLot(k, { units: v })} suffix="개" step={1000} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <RangeField label="검사로 확인한 불량률" value={Math.round(l.defectRate * 1000) / 10} min={0} max={50} step={0.5} onChange={(v) => setLot(k, { defectRate: v / 100 })} format={(v) => `${v}%`} />
              <RangeField label="이미 출고된 비율" value={Math.round(l.shippedRatio * 100)} min={0} max={100} onChange={(v) => setLot(k, { shippedRatio: v / 100 })} format={(v) => `${v}%`} />
            </div>
            {s.lots.length > 1 && <SmallButton tone="danger" label={`${l.id} 지우기`} onClick={() => setS({ ...s, lots: s.lots.filter((_, j) => j !== k) })}>삭제</SmallButton>}
          </div>
        ))}
        {s.lots.length < 10 && <SmallButton onClick={() => setS({ ...s, lots: [...s.lots, { id: `L-${s.lots.length + 1}`, units: 5000, defectRate: 0.05, shippedRatio: 0.5 }] })}>로트 추가</SmallButton>}
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="1개 회수·폐기 비용(물류·보상 포함)" value={s.recallCostPerUnit} onChange={(v) => setS({ ...s, recallCostPerUnit: v })} />
          <MoneyField label="1개 다시 만드는 원가" value={s.remakeCostPerUnit} onChange={(v) => setS({ ...s, remakeCostPerUnit: v })} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">남은 양품과 고객 약속</h2>
        <NumberField label="지금 바로 보낼 수 있는 양품 재고" value={s.goodStock} onChange={(v) => setS({ ...s, goodStock: v })} suffix="개" step={500} />
        {s.customers.map((c, k) => (
          <div key={k} className="grid gap-2 rounded-md border border-border bg-background p-3 sm:grid-cols-2">
            <TextField label="고객" value={c.name} onChange={(v) => setCus(k, { name: v })} />
            <NumberField label="약속한 수량" value={c.demand} onChange={(v) => setCus(k, { demand: v })} suffix="개" step={500} />
            {!easy && <RangeField label="중요도(1이 가장 먼저)" value={c.priority} min={1} max={5} onChange={(v) => setCus(k, { priority: v })} format={(v) => `${v}순위`} />}
            <MoneyField label="못 준 1개당 위약금·손실" value={c.penaltyPerUnit} onChange={(v) => setCus(k, { penaltyPerUnit: v })} />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {s.customers.length < 10 && <SmallButton onClick={() => setS({ ...s, customers: [...s.customers, { name: `고객 ${s.customers.length + 1}`, demand: 1000, priority: s.customers.length + 1, penaltyPerUnit: 1000 }] })}>고객 추가</SmallButton>}
          <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
        </div>
      </section>

      <Verdict title="결론">
        불량은 약 <b>{n0(r.totals.defects)}</b>({pct1(r.totals.defectRate)})이고, 그중 시장에 나간 물량이 섞여 있어요. 비용만 보면 <b>{cheapScope.label}</b>({money(cheapScope.cost)})이 가장 싸지만, 안전 문제라면 범위를 넓혀요.{" "}
        양품 {n0(s.goodStock)}는 <b>{RULE[r.cheapestRule]}</b> 배분이 위약금을 가장 적게({money(cheapest.totalPenalty)}) 만들어요.
        <span className="mt-1 block text-sm text-muted-foreground">영향 부서: 품질(원인 조사·재검사), 생산(재생산 일정), 영업(고객 통보·배분), 법무(회수 의무: 화장품법 제5조의2 위해 화장품 회수), 재무(충당금).</span>
      </Verdict>

      <CompareBars title="회수 범위별 비용" items={r.scopes.map((x) => ({ label: `${x.label} (${n0(x.units)})`, value: x.cost, current: x.scope === cheapScope.scope }))} format={money} />
      <CompareBars title="배분 방법별 위약금·손실" caption="같은 재고라도 누구에게 먼저 주느냐로 손실이 달라져요." items={r.allocations.map((a) => ({ label: RULE[a.rule], value: a.totalPenalty, current: a.rule === r.cheapestRule }))} format={money} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground"><th className="py-1">고객</th>{r.allocations.map((a) => <th key={a.rule} className="py-1">{RULE[a.rule]}</th>)}</tr></thead>
          <tbody>
            {s.customers.map((c) => (
              <tr key={c.name} className="border-t border-border">
                <td className="py-1">{c.name}</td>
                {r.allocations.map((a) => { const row = a.rows.find((x) => x.name === c.name)!; return <td key={a.rule} className="py-1 font-mono">{row.allocated.toLocaleString("ko-KR")} ({pct1(row.fillRate)})</td>; })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
