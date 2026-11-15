// 마케팅 포지셔닝 맵 (2026-11-14). 두 축 위에 우리·경쟁 브랜드를 놓고, 가장 가까운 경쟁자와 비어 있는 자리를 찾아요.
import { positioningMap, type MapBrand } from "../../../lib/biz-strategy";
import ChoiceChips from "../payroll/ChoiceChips";
import ModeToggle from "../viz/ModeToggle";
import QuadrantChart from "../viz/QuadrantChart";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, RangeField, SmallButton, TextField, Verdict, useSaved } from "./common";

const TOOL_ID = "positioning-map";
const PRESETS = [
  { value: "price-quality", x: ["저가", "고가"], y: ["대중적", "전문·프리미엄"] },
  { value: "convenience-emotion", x: ["기능·편의", "감성·경험"], y: ["오프라인", "온라인"] },
  { value: "tradition-innovation", x: ["전통", "혁신"], y: ["좁은 타깃", "넓은 타깃"] },
] as const;
const EXAMPLE: MapBrand[] = [
  { name: "우리", x: -2, y: 4, ours: true },
  { name: "A사", x: 7, y: 7 },
  { name: "B사", x: -6, y: -5 },
  { name: "C사", x: -4, y: -2 },
  { name: "D사", x: 5, y: -4 },
];

interface State {
  axes: { x: [string, string]; y: [string, string] };
  brands: MapBrand[];
  ideal: { x: number; y: number } | null;
  statement: { target: string; category: string; benefit: string; reason: string };
}
const INIT: State = {
  axes: { x: ["저가", "고가"], y: ["대중적", "전문·프리미엄"] },
  brands: EXAMPLE,
  ideal: null,
  statement: { target: "30대 맞벌이 부부", category: "반찬 구독", benefit: "주말 30분 준비로 평일 저녁이 해결되는", reason: "영양사가 짠 식단과 당일 조리 배송" },
};

export default function PositioningMap() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [s, setS, reset] = useSaved<State>("pos-state", INIT);
  const easy = mode === "easy";
  const ideal = !easy && s.ideal ? s.ideal : undefined;
  const r = positioningMap(s.brands, ideal);
  const ours = r.brands.find((b) => b.ours) ?? r.brands[0];
  const setBrand = (i: number, p: Partial<MapBrand>) => setS({ ...s, brands: s.brands.map((b, j) => (j === i ? { ...b, ...p } : b)) });
  const axisWord = (v: number, ends: [string, string]) => (Math.abs(v) < 2 ? "중간" : v < 0 ? ends[0] : ends[1]);
  const gapText = `${axisWord(r.gap.x, s.axes.x)} · ${axisWord(r.gap.y, s.axes.y)}`;
  const brandName = ours?.name ?? "우리";
  const st = s.statement;

  const memo = () =>
    [
      `[포지셔닝 맵] 가로 ${s.axes.x.join("↔")}, 세로 ${s.axes.y.join("↔")}`,
      ...r.brands.map((b) => `- ${b.name}${b.ours ? "(우리)" : ""}: (${b.x}, ${b.y}), 가장 가까운 ${b.nearest} ${b.nearestDistance ?? "-"}`),
      `비어 있는 자리: (${r.gap.x}, ${r.gap.y}) ${gapText}`,
      `포지셔닝 문장: ${st.target}에게 ${brandName}은(는) ${st.benefit} ${st.category}예요. ${st.reason} 덕분이에요.`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <ChoiceChips
        legend="두 축 고르기"
        value={PRESETS.find((p) => p.x[0] === s.axes.x[0] && p.y[0] === s.axes.y[0])?.value ?? "custom"}
        options={[...PRESETS.map((p) => ({ value: p.value, label: `${p.x.join("↔")} × ${p.y.join("↔")}` })), { value: "custom", label: "직접 정하기" }]}
        onChange={(v) => {
          const p = PRESETS.find((x) => x.value === v);
          if (p) setS({ ...s, axes: { x: [...p.x], y: [...p.y] } });
        }}
      />
      {!easy && (
        <div className="grid gap-2 sm:grid-cols-4">
          <TextField label="가로 왼쪽" value={s.axes.x[0]} onChange={(v) => setS({ ...s, axes: { ...s.axes, x: [v, s.axes.x[1]] } })} />
          <TextField label="가로 오른쪽" value={s.axes.x[1]} onChange={(v) => setS({ ...s, axes: { ...s.axes, x: [s.axes.x[0], v] } })} />
          <TextField label="세로 아래" value={s.axes.y[0]} onChange={(v) => setS({ ...s, axes: { ...s.axes, y: [v, s.axes.y[1]] } })} />
          <TextField label="세로 위" value={s.axes.y[1]} onChange={(v) => setS({ ...s, axes: { ...s.axes, y: [s.axes.y[0], v] } })} />
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">브랜드 위치</h2>
        {s.brands.map((b, i) => (
          <div key={i} className={"space-y-2 rounded-md border bg-background p-3 " + (b.ours ? "border-primary" : "border-border")}>
            <div className="flex items-end gap-2">
              <div className="flex-1"><TextField label={b.ours ? "우리 브랜드" : "경쟁 브랜드"} value={b.name} onChange={(v) => setBrand(i, { name: v })} /></div>
              {!b.ours && <SmallButton tone="danger" label={`${b.name} 지우기`} onClick={() => setS({ ...s, brands: s.brands.filter((_, j) => j !== i) })}>삭제</SmallButton>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <RangeField label={`${s.axes.x[0]} ↔ ${s.axes.x[1]}`} value={b.x} min={-10} max={10} onChange={(v) => setBrand(i, { x: v })} format={(v) => (v === 0 ? "중간" : `${v < 0 ? s.axes.x[0] : s.axes.x[1]} ${Math.abs(v)}`)} />
              <RangeField label={`${s.axes.y[0]} ↔ ${s.axes.y[1]}`} value={b.y} min={-10} max={10} onChange={(v) => setBrand(i, { y: v })} format={(v) => (v === 0 ? "중간" : `${v < 0 ? s.axes.y[0] : s.axes.y[1]} ${Math.abs(v)}`)} />
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {s.brands.length < 12 && <SmallButton onClick={() => setS({ ...s, brands: [...s.brands, { name: `경쟁 ${s.brands.length}`, x: 0, y: 0 }] })}>경쟁 브랜드 추가</SmallButton>}
          <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
        </div>
        {!easy && (
          <div className="space-y-2 rounded-md border border-border bg-background p-3">
            <ChoiceChips legend="고객이 바라는 이상점" value={s.ideal ? "on" : "off"} options={[{ value: "off", label: "쓰지 않기" }, { value: "on", label: "표시하기" }] as const} onChange={(v) => setS({ ...s, ideal: v === "on" ? s.ideal ?? { x: 3, y: 6 } : null })} />
            {s.ideal && (
              <div className="grid gap-2 sm:grid-cols-2">
                <RangeField label="이상점 가로" value={s.ideal.x} min={-10} max={10} onChange={(v) => setS({ ...s, ideal: { ...s.ideal!, x: v } })} format={String} />
                <RangeField label="이상점 세로" value={s.ideal.y} min={-10} max={10} onChange={(v) => setS({ ...s, ideal: { ...s.ideal!, y: v } })} format={String} />
              </div>
            )}
          </div>
        )}
      </section>

      <QuadrantChart
        title="포지셔닝 맵"
        caption={`초록 점선 원은 경쟁자가 없는 가장 넓은 자리예요${ideal ? "(이상점 쪽을 우선)" : ""}. 슬라이더로 브랜드를 옮겨 보세요.`}
        points={[
          ...r.brands.map((b) => ({ label: b.name, x: b.x, y: b.y, tone: b.ours ? ("primary" as const) : r.crowded.includes(b.name) ? ("warning" as const) : ("muted" as const) })),
          ...(ideal ? [{ label: "이상점", x: ideal.x, y: ideal.y, tone: "success" as const }] : []),
        ]}
        xDomain={[-10, 10]}
        yDomain={[-10, 10]}
        xSplit={0}
        ySplit={0}
        xLabel={`${s.axes.x[0]} ↔ ${s.axes.x[1]}`}
        yLabel={`${s.axes.y[0]} ↔ ${s.axes.y[1]}`}
        quadrants={[`${s.axes.x[0]}·${s.axes.y[1]}`, `${s.axes.x[1]}·${s.axes.y[1]}`, `${s.axes.x[0]}·${s.axes.y[0]}`, `${s.axes.x[1]}·${s.axes.y[0]}`]}
        ring={{ x: r.gap.x, y: r.gap.y, r: Math.min(2, r.gap.radius / 2), label: "빈자리" }}
        formatX={String}
        formatY={String}
      />

      <Verdict title="해석">
        {ours && ours.nearest ? (
          <>'{ours.name}'과 가장 가까운 경쟁자는 <b>{ours.nearest}</b>(거리 {Math.round((ours.nearestDistance ?? 0) * 10) / 10})예요. {r.crowded.includes(ours.name) ? "너무 붙어 있어 고객 눈에는 비슷해 보여요. 한 축에서 확실히 떨어지는 방향을 정해요." : "어느 정도 떨어져 있어 차별점이 보여요."}</>
        ) : (
          <>브랜드를 두 개 이상 넣어 주세요.</>
        )}
        <span className="mt-1 block text-sm text-muted-foreground">경쟁자가 없는 자리: <b>{gapText}</b> 쪽이에요. 빈자리가 곧 기회는 아니니, 고객이 실제로 원하는 자리인지 인터뷰로 확인해요.</span>
        {ideal && ours?.idealDistance !== null && <span className="mt-1 block text-sm text-muted-foreground">우리와 이상점 거리 {ours?.idealDistance}, 경쟁사 중 가장 가까운 곳: {[...r.brands].filter((b) => !b.ours).sort((a, b) => (a.idealDistance ?? 0) - (b.idealDistance ?? 0))[0]?.name}</span>}
      </Verdict>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">포지셔닝 문장 만들기</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <TextField label="누구에게(타깃)" value={st.target} onChange={(v) => setS({ ...s, statement: { ...st, target: v } })} />
          <TextField label="어떤 종류(카테고리)" value={st.category} onChange={(v) => setS({ ...s, statement: { ...st, category: v } })} />
          <TextField label="무엇이 다른가(핵심 혜택)" value={st.benefit} onChange={(v) => setS({ ...s, statement: { ...st, benefit: v } })} />
          <TextField label="왜 믿을 수 있나(근거)" value={st.reason} onChange={(v) => setS({ ...s, statement: { ...st, reason: v } })} />
        </div>
        <p className="rounded-md bg-muted px-3 py-3 text-base leading-7 text-foreground">"{st.target}에게 {brandName}은(는) {st.benefit} {st.category}예요. {st.reason} 덕분이에요."</p>
      </section>
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
