// 캠페인 수요·공급 일정 (2026-11-16). 계산: lib/biz-ops.ts campaignSupply. 주별 재고 곡선과 생산능력 훑기 곡선.
import { campaignSupply, type CampaignSupplyInput } from "../../../lib/biz-ops";
import NumberField from "../payroll/NumberField";
import ModeToggle from "../viz/ModeToggle";
import SweepChart from "../viz/SweepChart";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, RangeField, SmallButton, Verdict, pct1, useSaved } from "./common";

const TOOL_ID = "campaign-supply-planner";
const EXAMPLE: CampaignSupplyInput = { demand: [800, 900, 2600, 3200, 1800, 1000, 900, 800], openingStock: 3000, capacityPerWeek: 1200, leadTimeWeeks: 2, safetyStock: 500 };
const n0 = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}개`;

export default function CampaignSupply() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [s, setS, reset] = useSaved<CampaignSupplyInput>("campaign-supply", EXAMPLE);
  const easy = mode === "easy";
  const input = { ...s, safetyStock: easy ? 0 : s.safetyStock };
  const r = campaignSupply(input);
  const setDemand = (k: number, v: number) => setS({ ...s, demand: s.demand.map((d, j) => (j === k ? v : d)) });
  const stockPts = r.weeks.map((w) => ({ x: w.week, y: w.stock - w.shortage }));
  const capHi = Math.max(s.capacityPerWeek * 2, Math.max(...s.demand, 1));
  const capPts = Array.from({ length: 41 }, (_, k) => {
    const c = (capHi * k) / 40;
    return { x: c, y: campaignSupply({ ...input, capacityPerWeek: c }).fillRate };
  });

  const memo = () =>
    [
      "[캠페인 수요·공급]",
      `주별 수요 ${s.demand.join(", ")} / 시작 재고 ${s.openingStock}, 주당 생산 ${s.capacityPerWeek}, 추가 생산 리드타임 ${s.leadTimeWeeks}주${easy ? "" : `, 안전재고 ${s.safetyStock}`}`,
      `첫 품절: ${r.firstStockoutWeek ? `${r.firstStockoutWeek}주차` : "없음"}, 부족 합계 ${n0(r.totalShortage)}, 충족률 ${pct1(r.fillRate)}`,
      r.extraPerWeek > 0 ? `${r.extraStartWeek}주차부터 주당 ${n0(r.extraPerWeek)} 추가 생산 필요` : "추가 생산 불필요",
      r.unfixableShortage > 0 ? `리드타임 안 부족 ${n0(r.unfixableShortage)}: 재고 이동·출시 조정 필요` : "",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].filter(Boolean).join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">재고와 생산</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="지금 창고에 있는 재고" value={s.openingStock} onChange={(v) => setS({ ...s, openingStock: v })} suffix="개" step={100} />
          <NumberField label="한 주에 만들 수 있는 양" value={s.capacityPerWeek} onChange={(v) => setS({ ...s, capacityPerWeek: v })} suffix="개" step={100} />
          <RangeField label="추가 생산을 넣으면 몇 주 뒤 들어오나" value={s.leadTimeWeeks} min={0} max={8} onChange={(v) => setS({ ...s, leadTimeWeeks: v })} format={(v) => (v === 0 ? "바로" : `${v}주 뒤`)} />
          {!easy && <NumberField label="늘 남겨 둘 안전재고" value={s.safetyStock ?? 0} onChange={(v) => setS({ ...s, safetyStock: v })} suffix="개" step={100} />}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">주별 예상 수요</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {s.demand.map((d, k) => (
            <NumberField key={k} label={`${k + 1}주차`} value={d} onChange={(v) => setDemand(k, v)} suffix="개" step={100} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {s.demand.length < 26 && <SmallButton onClick={() => setS({ ...s, demand: [...s.demand, s.demand[s.demand.length - 1] ?? 0] })}>주 추가</SmallButton>}
          {s.demand.length > 1 && <SmallButton onClick={() => setS({ ...s, demand: s.demand.slice(0, -1) })}>마지막 주 빼기</SmallButton>}
          <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
        </div>
      </section>

      <Verdict title="결론">
        {r.firstStockoutWeek ? (
          <>
            <b>{r.firstStockoutWeek}주차</b>에 품절이 나요. 부족한 양은 모두 <b>{n0(r.totalShortage)}</b>, 주문의 {pct1(r.fillRate)}만 채워요.{" "}
            {r.extraPerWeek > 0 && <>지금 추가 생산을 넣으면 <b>{r.extraStartWeek}주차부터 매주 {n0(r.extraPerWeek)}</b>씩 더 만들어야 막을 수 있어요.</>}
          </>
        ) : (
          <>품절 없이 캠페인을 버틸 수 있어요.{r.firstBelowSafetyWeek && !easy ? ` 다만 ${r.firstBelowSafetyWeek}주차에 안전재고 아래로 내려가요.` : ""}</>
        )}
        {r.unfixableShortage > 0 && <span className="mt-1 block text-sm text-warning-foreground">추가 생산이 들어오기 전에 {n0(r.unfixableShortage)}가 모자라요. 다른 창고·채널 재고를 옮기거나 캠페인 시작을 늦추거나 1인 구매 수량을 제한해요.</span>}
        <span className="mt-1 block text-sm text-muted-foreground">영향 부서: 생산(추가 생산·특근), 물류(입고 일정), 마케팅(캠페인 일정·구매 제한), 재무(원재료 선구매 자금).</span>
      </Verdict>

      <SweepChart title="주별 재고(아래로 내려가면 품절)" caption="0 아래는 못 판 수요예요." points={stockPts} current={stockPts[(r.firstStockoutWeek ?? 1) - 1] ?? stockPts[0]} formatX={(v) => `${Math.round(v)}주`} formatY={n0} xLabel="주차" yLabel="재고" />
      <SweepChart title="주당 생산능력을 바꾸면 주문 충족률은?" caption="지금 생산능력에 점이 있어요. 눌러서 바꿔 보세요." points={capPts} current={{ x: s.capacityPerWeek, y: r.fillRate }} formatX={n0} formatY={pct1} xLabel="주당 생산" yLabel="충족률" onPick={(v) => setS({ ...s, capacityPerWeek: Math.round(v / 10) * 10 })} />
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
