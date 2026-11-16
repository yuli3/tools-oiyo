// 대형 수주 vs 기존 고객 약속 (2026-11-16). 계산: lib/biz-ops.ts orderAllocation. 수락 방법별 이익 비교와 수락량 훑기.
import { orderAllocation, type OrderAllocationInput } from "../../../lib/biz-ops";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, SmallButton, TextField, Verdict, useSaved } from "./common";

const TOOL_ID = "big-order-capacity-check";
const EXAMPLE: OrderAllocationInput = {
  capacity: 50_000,
  existing: [
    { name: "기존 A(연간 계약)", qty: 20_000, price: 9_000, unitCost: 5_500, penaltyPerUnit: 4_000, locked: true },
    { name: "기존 B", qty: 15_000, price: 8_000, unitCost: 5_500, penaltyPerUnit: 1_500 },
    { name: "자사몰 재고", qty: 10_000, price: 12_000, unitCost: 5_500, penaltyPerUnit: 0 },
  ],
  newOrder: { name: "신규 대형 수주", qty: 25_000, price: 7_800, unitCost: 5_300, minQty: 15_000 },
  extraCapacity: 10_000,
  extraCostPerUnit: 1_200,
};
const n0 = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}개`;

export default function OrderAllocation() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [s, setS, reset] = useSaved<OrderAllocationInput>("order-allocation", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const input = easy ? { ...s, extraCapacity: 0 } : s;
  const r = orderAllocation(input);
  const rec = r.options.find((o) => o.key === r.recommended)!;
  const decline = r.options.find((o) => o.key === "decline")!;
  const setE = (k: number, p: Partial<OrderAllocationInput["existing"][number]>) => setS({ ...s, existing: s.existing.map((o, j) => (j === k ? { ...o, ...p } : o)) });
  const shorted = rec.rows.filter((x) => x.short > 0);

  const memo = () =>
    [
      "[대형 수주 검토]",
      `생산능력 ${n0(s.capacity)}${input.extraCapacity ? ` + 특근·외주 ${n0(input.extraCapacity)}(개당 +${exactWon(s.extraCostPerUnit ?? 0)})` : ""}`,
      `새 주문 ${s.newOrder.qty.toLocaleString("ko-KR")}개 × ${exactWon(s.newOrder.price)}(원가 ${exactWon(s.newOrder.unitCost)}), 최소 ${n0(s.newOrder.minQty ?? s.newOrder.qty)}`,
      ...r.options.map((o) => `- ${o.label}: 이익 ${exactWon(o.profit)}${o.lockedBroken ? " (반드시 지킬 약속을 깸)" : ""}`),
      `추천: ${rec.label}${shorted.length ? `, 줄어드는 곳 ${shorted.map((x) => `${x.name} ${n0(x.short)}`).join(", ")}` : ""}`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">새 주문</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="주문 수량" value={s.newOrder.qty} onChange={(v) => setS({ ...s, newOrder: { ...s.newOrder, qty: v } })} suffix="개" step={1000} />
          <NumberField label="최소 수락 수량(이보다 적으면 거래 안 됨)" value={s.newOrder.minQty ?? s.newOrder.qty} onChange={(v) => setS({ ...s, newOrder: { ...s.newOrder, minQty: v } })} suffix="개" step={1000} />
          <MoneyField label="단가" value={s.newOrder.price} onChange={(v) => setS({ ...s, newOrder: { ...s.newOrder, price: v } })} />
          <MoneyField label="1개 원가" value={s.newOrder.unitCost} onChange={(v) => setS({ ...s, newOrder: { ...s.newOrder, unitCost: v } })} />
        </div>
        <NumberField label="기간 안에 만들 수 있는 총량" value={s.capacity} onChange={(v) => setS({ ...s, capacity: v })} suffix="개" step={1000} />
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="특근·외주로 더 만들 수 있는 양" value={s.extraCapacity ?? 0} onChange={(v) => setS({ ...s, extraCapacity: v })} suffix="개" step={1000} />
            <MoneyField label="특근·외주 1개당 추가 비용" value={s.extraCostPerUnit ?? 0} onChange={(v) => setS({ ...s, extraCostPerUnit: v })} />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">기존 약속</h2>
        {s.existing.map((o, k) => (
          <div key={k} className="space-y-2 rounded-md border border-border bg-background p-3">
            <div className="flex items-end gap-2">
              <div className="flex-1"><TextField label="고객·채널" value={o.name} onChange={(v) => setE(k, { name: v })} /></div>
              {s.existing.length > 1 && <SmallButton tone="danger" label={`${o.name} 지우기`} onClick={() => setS({ ...s, existing: s.existing.filter((_, j) => j !== k) })}>삭제</SmallButton>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <NumberField label="약속 수량" value={o.qty} onChange={(v) => setE(k, { qty: v })} suffix="개" step={1000} />
              <MoneyField label="단가" value={o.price} onChange={(v) => setE(k, { price: v })} />
              {!easy && <MoneyField label="1개 원가" value={o.unitCost} onChange={(v) => setE(k, { unitCost: v })} />}
              <MoneyField label="못 주면 1개당 위약금·관계 손실" value={o.penaltyPerUnit} onChange={(v) => setE(k, { penaltyPerUnit: v })} />
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
              <input type="checkbox" className="size-5 accent-primary" checked={!!o.locked} onChange={(e) => setE(k, { locked: e.target.checked })} />
              반드시 지킬 약속(전략 고객·법적 의무)
            </label>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {s.existing.length < 10 && <SmallButton onClick={() => setS({ ...s, existing: [...s.existing, { name: `기존 ${s.existing.length + 1}`, qty: 5000, price: 8000, unitCost: 5500, penaltyPerUnit: 1000 }] })}>약속 추가</SmallButton>}
          <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
        </div>
      </section>

      <Verdict title="결론">
        <b>{rec.label}</b>이 가장 이익이 커요({money(rec.profit)}, 거절할 때보다 {money(rec.profit - decline.profit)} {rec.profit >= decline.profit ? "많음" : "적음"}).{" "}
        {shorted.length ? <>대신 {shorted.map((x) => `${x.name} ${n0(x.short)}`).join(", ")}를 줄여야 해요. 미리 알리고 일정 조정·대체품을 제안해요.</> : <>기존 약속은 모두 지켜요.</>}
        {r.options.some((o) => o.lockedBroken) && <span className="mt-1 block text-sm text-warning-foreground">전량 수락하면 반드시 지킬 약속까지 깨지는 방법이 있어 추천에서 뺐어요.</span>}
        <span className="mt-1 block text-sm text-muted-foreground">영향 부서: 영업(기존 고객 조정), 생산(특근·외주), 구매(원료 추가 확보), 재무(운전자금·매출채권), 법무(공급계약 위약 조항).</span>
      </Verdict>

      <CompareBars title="수락 방법별 이익" caption="위약금과 특근 비용까지 뺀 기간 이익이에요." items={r.options.map((o) => ({ label: `${o.label}${o.lockedBroken ? " ⚠" : ""}`, value: o.profit, current: o.key === r.recommended }))} format={money} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground"><th className="py-1">받는 곳</th>{r.options.map((o) => <th key={o.key} className="py-1">{o.label}</th>)}</tr></thead>
          <tbody>
            <tr className="border-t border-border"><td className="py-1">{s.newOrder.name}</td>{r.options.map((o) => <td key={o.key} className="py-1 font-mono">{o.newQty.toLocaleString("ko-KR")}</td>)}</tr>
            {s.existing.map((e) => (
              <tr key={e.name} className="border-t border-border"><td className="py-1">{e.name}</td>{r.options.map((o) => <td key={o.key} className="py-1 font-mono">{(o.rows.find((x) => x.name === e.name)?.delivered ?? 0).toLocaleString("ko-KR")}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
