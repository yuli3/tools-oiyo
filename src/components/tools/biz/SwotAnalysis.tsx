// SWOT + TOWS (2026-11-14). 쉬운 모드: 항목과 영향 크기 → 전략 위치·TOWS 조합. 전문가 모드: IFE·EFE 가중 평가와 IE 매트릭스.
import { factorScore, ieMatrix, SWOT_STANCE, swotPosition, type SwotItem, type SwotKind } from "../../../lib/biz-strategy";
import NumberField from "../payroll/NumberField";
import ModeToggle from "../viz/ModeToggle";
import QuadrantChart from "../viz/QuadrantChart";
import Term from "../viz/Term";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, SmallButton, Verdict, useSaved } from "./common";

const TOOL_ID = "swot-analysis";
const BOX: Record<SwotKind, { title: string; hint: string; tone: string }> = {
  S: { title: "강점 Strengths", hint: "경쟁사보다 잘하는 것, 고객이 우리를 고르는 이유", tone: "border-success" },
  W: { title: "약점 Weaknesses", hint: "부족한 인력·자금·역량, 고객 불만", tone: "border-warning" },
  O: { title: "기회 Opportunities", hint: "시장·기술·규제 변화 중 우리에게 유리한 것", tone: "border-primary" },
  T: { title: "위협 Threats", hint: "경쟁자 진입, 원가 상승, 규제 강화", tone: "border-destructive" },
};
const EXAMPLE: SwotItem[] = [
  { kind: "S", text: "재구매율 높은 단골 고객층", impact: 5, weight: 0.2, rating: 4 },
  { kind: "S", text: "자체 레시피·제조 노하우", impact: 4, weight: 0.15, rating: 3 },
  { kind: "W", text: "온라인 마케팅 경험 부족", impact: 3, weight: 0.15, rating: 2 },
  { kind: "W", text: "운영 자금 여유 3개월", impact: 4, weight: 0.2, rating: 1 },
  { kind: "O", text: "건강식 배달 수요 증가", impact: 5, weight: 0.25, rating: 3 },
  { kind: "O", text: "지자체 소상공인 온라인 판로 지원", impact: 3, weight: 0.15, rating: 2 },
  { kind: "T", text: "대형 프랜차이즈의 비슷한 메뉴 출시", impact: 4, weight: 0.25, rating: 2 },
  { kind: "T", text: "원재료 가격 상승", impact: 3, weight: 0.2, rating: 2 },
];
const IMPACT = [
  { v: 1, label: "작음" },
  { v: 3, label: "보통" },
  { v: 5, label: "큼" },
];

export default function SwotAnalysis() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [items, setItems, reset] = useSaved<SwotItem[]>("swot-items", EXAMPLE);
  const easy = mode === "easy";
  const pos = swotPosition(items);
  const ife = factorScore(items.filter((i) => i.kind === "S" || i.kind === "W"));
  const efe = factorScore(items.filter((i) => i.kind === "O" || i.kind === "T"));
  const ie = ieMatrix(ife.total, efe.total);
  const lim = Math.max(5, Math.abs(pos.internal), Math.abs(pos.external));
  const set = (idx: number, p: Partial<SwotItem>) => setItems(items.map((x, i) => (i === idx ? { ...x, ...p } : x)));

  const memo = () =>
    [
      "[SWOT·TOWS]",
      ...(["S", "W", "O", "T"] as SwotKind[]).map((k) => `${BOX[k].title}: ${items.filter((i) => i.kind === k && i.text.trim()).map((i) => `${i.text}(${i.impact ?? 3})`).join(", ")}`),
      `전략 위치: ${SWOT_STANCE[pos.stance].name} (내부 ${pos.internal}, 외부 ${pos.external})`,
      ...(["SO", "ST", "WO", "WT"] as const).map((k) => `${k}: ${pos.tows[k].join(" / ")}`),
      !easy ? `IFE ${ife.total}, EFE ${efe.total} → IE ${ie.cell}번 칸, ${ie.label}` : "",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].filter(Boolean).join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <div className="grid gap-3 sm:grid-cols-2">
        {(["S", "W", "O", "T"] as SwotKind[]).map((k) => (
          <section key={k} className={"rounded-md border-2 bg-background p-3 " + BOX[k].tone}>
            <h2 className="text-base font-bold text-foreground">{BOX[k].title}</h2>
            <p className="text-xs text-muted-foreground">{BOX[k].hint}</p>
            <ul className="mt-2 space-y-3">
              {items.map((it, idx) => it.kind !== k ? null : (
                <li key={idx} className="space-y-2">
                  <div className="flex gap-2">
                    <input aria-label={`${BOX[k].title} 항목`} value={it.text} onChange={(e) => set(idx, { text: e.target.value })} className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground" />
                    <SmallButton tone="danger" label="항목 지우기" onClick={() => setItems(items.filter((_, i) => i !== idx))}>✕</SmallButton>
                  </div>
                  {easy ? (
                    <div className="flex gap-1" role="group" aria-label="영향 크기">
                      {IMPACT.map((o) => (
                        <button key={o.v} type="button" aria-pressed={(it.impact ?? 3) === o.v} onClick={() => set(idx, { impact: o.v })}
                          className={"min-h-11 flex-1 rounded-md border text-sm " + ((it.impact ?? 3) === o.v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground")}>
                          영향 {o.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <NumberField label="영향 1~5" value={it.impact ?? 3} onChange={(v) => set(idx, { impact: v })} step={1} />
                      <NumberField label="가중치" value={it.weight ?? 0} onChange={(v) => set(idx, { weight: v })} step={0.05} />
                      <NumberField label={k === "S" || k === "O" ? "평점 1~4" : "평점 1~4"} value={it.rating ?? 2.5} onChange={(v) => set(idx, { rating: v })} step={0.5} min={1} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-2"><SmallButton onClick={() => setItems([...items, { kind: k, text: "", impact: 3, weight: 0.1, rating: 2.5 }])}>항목 추가</SmallButton></div>
          </section>
        ))}
      </div>
      <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>

      <Verdict title="전략 방향">
        <b>{SWOT_STANCE[pos.stance].name}</b>: {SWOT_STANCE[pos.stance].plain}
        <span className="mt-1 block text-sm text-muted-foreground">강점 {pos.totals.S} − 약점 {pos.totals.W} = 내부 {pos.internal >= 0 ? "+" : ""}{pos.internal} · 기회 {pos.totals.O} − 위협 {pos.totals.T} = 외부 {pos.external >= 0 ? "+" : ""}{pos.external}</span>
      </Verdict>

      <QuadrantChart
        title="우리 회사의 전략 위치"
        caption="가로는 내부(강점 − 약점), 세로는 외부(기회 − 위협). 항목의 영향 크기를 바꾸면 점이 움직여요."
        points={[{ label: "우리 회사", x: pos.internal, y: pos.external, tone: "primary" }]}
        xDomain={[-lim, lim]}
        yDomain={[-lim, lim]}
        xSplit={0}
        ySplit={0}
        xLabel="내부 역량"
        yLabel="외부 환경"
        quadrants={["WO 방향 전환", "SO 공격", "WT 방어", "ST 다각화"]}
        formatX={(v) => (v > 0 ? `+${v}` : String(v))}
        formatY={(v) => (v > 0 ? `+${v}` : String(v))}
      />

      <section>
        <h2 className="text-base font-bold text-foreground"><Term k="TOWS">TOWS</Term> 전략 조합</h2>
        <p className="text-sm text-muted-foreground">영향이 큰 항목끼리 짝지은 출발점이에요. 문장을 다듬어 실행 과제로 바꿔요.</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {(["SO", "ST", "WO", "WT"] as const).map((k) => (
            <div key={k} className={"rounded-md border bg-background p-3 " + (k === pos.stance ? "border-primary" : "border-border")}>
              <p className="text-sm font-semibold text-foreground">{SWOT_STANCE[k].name}{k === pos.stance && " · 지금 위치"}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {pos.tows[k].length ? pos.tows[k].map((s) => <li key={s}>{s}</li>) : <li>항목을 더 넣어 주세요</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {!easy && (
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground"><Term k="IFE">IFE·EFE</Term>와 IE 매트릭스</h2>
          <p className="text-sm text-muted-foreground">내부(강점·약점)와 외부(기회·위협) 각각 가중치 합을 1로 맞춰요(다르면 비율로 조정해요). 평점은 강점·기회는 3~4가 좋고, 약점·위협은 우리가 얼마나 잘 대응하는지로 1~4를 매겨요.</p>
          <p className="text-sm text-foreground">IFE <b>{ife.total.toFixed(2)}</b> · EFE <b>{efe.total.toFixed(2)}</b>{(ife.weightsAdjusted || efe.weightsAdjusted) && <span className="text-xs text-muted-foreground"> (가중치 합을 1로 맞춤)</span>}</p>
          <div className="grid max-w-xs grid-cols-3 gap-1" role="img" aria-label={`IE 매트릭스 ${ie.cell}번 칸: ${ie.label}`}>
            {Array.from({ length: 9 }, (_, i) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              const kind = row + col <= 1 ? "bg-success" : row + col === 2 ? "bg-warning" : "bg-muted";
              return <div key={i} className={"flex aspect-square items-center justify-center rounded-sm text-sm font-semibold " + kind + (i + 1 === ie.cell ? " ring-2 ring-foreground" : " opacity-60")}>{["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][i]}</div>;
            })}
          </div>
          <p className="text-xs text-muted-foreground">가로: IFE 강(3~4)·중(2~3)·약(1~2), 세로: EFE 높음·중간·낮음</p>
          <p className="text-sm text-foreground">{ie.cell}번 칸 → <b>{ie.label}</b></p>
        </section>
      )}

      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
