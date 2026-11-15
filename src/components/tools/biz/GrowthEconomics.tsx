// 단위경제(LTV/CAC)·런웨이 (2026-11-14). 가정: lib/biz-scenarios.ts, 계산: lib/biz-strategy.ts, 그래프: ../viz/.
import { useMemo, useState } from "react";
import { breakEven, runway, unitEconomics } from "../../../lib/biz-strategy";
import { GROWTH_EXAMPLE, RUNWAY_ASSUMPTIONS, RUNWAY_HORIZON, UNIT_ASSUMPTIONS, cashMonths, ltvCac, type GrowthInput } from "../../../lib/biz-scenarios";
import { sweep, tornado } from "../../../lib/scenario";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import AssumptionSlider from "../viz/AssumptionSlider";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import SweepChart from "../viz/SweepChart";
import Term from "../viz/Term";
import TornadoChart from "../viz/TornadoChart";
import { exactWon, roughWon } from "../viz/format";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, SmallButton, Verdict, pct1, useSaved } from "./common";

const TOOL_ID = "unit-economics-runway-calculator";
const x1 = (n: number) => `${n.toFixed(1)}배`;
const mo = (n: number) => (n >= RUNWAY_HORIZON ? `${RUNWAY_HORIZON}개월+` : `${Math.round(n * 10) / 10}개월`);

export default function GrowthEconomics() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<GrowthInput>("growth-input", GROWTH_EXAMPLE);
  const [anchors, setAnchors] = useState<GrowthInput>(GROWTH_EXAMPLE);
  const [discount, setDiscount] = useState(0);
  const [focus, setFocus] = useState<"unit" | "runway">("unit");
  const [be, setBe] = useState({ fixed: 30_000_000, price: 39_000, variable: 11_700 });
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;

  const edit = (p: Partial<GrowthInput>) => {
    const next = { ...input, ...p };
    setInput(next);
    setAnchors(next);
  };
  const slide = (key: keyof GrowthInput, v: number) => {
    setInput({ ...input, [key]: v });
    track("advisory_slider", { tool_id: TOOL_ID }, true);
  };

  const u = unitEconomics({ ...input, discountRate: easy ? 0 : discount });
  const rw = useMemo(() => runway({ ...input, months: RUNWAY_HORIZON }), [input]);
  const unitBars = useMemo(() => tornado(input, UNIT_ASSUMPTIONS, ltvCac), [input]);
  const runBars = useMemo(() => tornado(input, RUNWAY_ASSUMPTIONS, cashMonths), [input]);
  const churnA = UNIT_ASSUMPTIONS[2];
  const churnPts = useMemo(() => sweep(input, churnA, ltvCac, churnA.range(anchors.monthlyChurn), 60).map((p) => ({ x: p.x, y: Math.min(p.y, 20) })), [input, anchors.monthlyChurn]);
  // LTV/CAC = m/(c·CAC) → 3배·1배가 되는 이탈률
  const m = input.arpu * input.grossMargin;
  const churnAt = (k: number) => (input.cac > 0 ? m / (k * input.cac) : 0);
  const marks = [3, 1].map((k) => ({ at: churnAt(k), label: `${k}배` })).filter((x) => x.at > 0 && x.at < churnA.range(anchors.monthlyChurn)[1]);
  const cashPts = rw.series.map((s) => ({ x: s.month, y: s.cash }));
  const months = cashMonths(input);
  const beR = breakEven(be.fixed, be.price, be.variable);

  const memo = () =>
    [
      "[단위경제·런웨이]",
      `ARPU ${exactWon(input.arpu)}, 매출총이익률 ${pct1(input.grossMargin)}, 월 이탈 ${pct1(input.monthlyChurn)}, CAC ${exactWon(input.cac)}`,
      `LTV ${exactWon(u.ltv)}, LTV/CAC ${x1(u.ltvToCac)}, CAC 회수 ${mo(u.paybackMonths)}, 평균 고객 수명 ${mo(u.lifetimeMonths)}`,
      `현금 ${exactWon(input.cash)}, 월 매출 ${exactWon(input.revenue)}(+${pct1(input.revenueGrowth)}/월), 월 비용 ${exactWon(input.expenses)}(+${pct1(input.expenseGrowth)}/월)`,
      `현금 소진: ${rw.zeroMonth ? `${rw.zeroMonth}개월째` : `${RUNWAY_HORIZON}개월 안에는 없음`}, 흑자 전환: ${rw.breakEvenMonth === null ? "36개월 안에는 없음" : `${rw.breakEvenMonth}개월째`}, ${rw.defaultAlive ? "기본 생존" : "추가 자금 필요"}`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">고객 한 명의 숫자</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="고객 한 명이 한 달에 내는 돈(ARPU)" value={input.arpu} onChange={(v) => edit({ arpu: v })} />
          <MoneyField label="고객 한 명 데려오는 비용(CAC)" value={input.cac} onChange={(v) => edit({ cac: v })} hint="광고·영업비 ÷ 새 고객 수" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AssumptionSlider label="매출총이익률(원가 빼고 남는 비율)" unit="pct" value={input.grossMargin} range={[0.05, 0.95]} mode={mode} onChange={(v) => slide("grossMargin", v)} />
          <AssumptionSlider label="한 달에 떠나는 고객 비율(이탈률)" unit="rate" value={input.monthlyChurn} range={churnA.range(anchors.monthlyChurn)} mode={mode} onChange={(v) => slide("monthlyChurn", v)} />
        </div>
        {!easy && <NumberField label="연 할인율(LTV 현재가치, 0이면 할인 안 함)" value={discount} onChange={setDiscount} suffix="%" step={1} />}
      </section>

      <Verdict title="단위경제">
        고객 한 명이 떠날 때까지 남기는 이익(<Term k="LTV">LTV</Term>)은 <b>{money(u.ltv)}</b>, 데려오는 비용(<Term k="CAC">CAC</Term>)의 <b>{x1(u.ltvToCac)}</b>예요. {u.gradeText}
        <span className="mt-1 block text-sm text-muted-foreground">
          <Term k="회수기간">CAC 회수</Term> {mo(u.paybackMonths)} · 평균 {mo(u.lifetimeMonths)} 머물러요 · 고객 한 명 월 이익 {money(u.contributionPerMonth)}
        </span>
      </Verdict>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">회사 현금</h2>
        <MoneyField label="지금 통장에 있는 돈" value={input.cash} onChange={(v) => edit({ cash: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="이번 달 매출" value={input.revenue} onChange={(v) => edit({ revenue: v })} />
          <MoneyField label="한 달에 나가는 돈 전체" value={input.expenses} onChange={(v) => edit({ expenses: v })} hint="인건비·임대료·광고비·원가 포함" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AssumptionSlider label="매출이 매달 느는 비율" unit="rate" value={input.revenueGrowth} range={[0, Math.max(0.3, anchors.revenueGrowth * 2)]} mode={mode} onChange={(v) => slide("revenueGrowth", v)} />
          <AssumptionSlider label="비용이 매달 느는 비율" unit="rate" value={input.expenseGrowth} range={[0, Math.max(0.2, anchors.expenseGrowth * 2)]} mode={mode} onChange={(v) => slide("expenseGrowth", v)} />
        </div>
        <SmallButton onClick={() => { reset(); setAnchors(GROWTH_EXAMPLE); }}>예시로 되돌리기</SmallButton>
      </section>

      <Verdict title="런웨이">
        {rw.zeroMonth ? (
          <>지금 추세면 <b>{rw.zeroMonth}개월째</b>에 현금이 바닥나요. </>
        ) : (
          <>{RUNWAY_HORIZON}개월 안에는 현금이 바닥나지 않아요. </>
        )}
        {rw.breakEvenMonth === null ? "그 안에 흑자로 돌아서지 못해요." : rw.breakEvenMonth === 0 ? "이미 흑자예요." : <>흑자 전환은 <b>{rw.breakEvenMonth}개월째</b>예요.</>}{" "}
        {rw.defaultAlive ? <b className="text-success">추가 투자 없이 버틸 수 있어요(<Term k="기본생존">기본 생존</Term>).</b> : <b className="text-destructive">추가 자금이 필요해요. 투자 유치에 3~6개월 걸리니 그 전에 시작해요.</b>}
        <span className="mt-1 block text-sm text-muted-foreground">이번 달 <Term k="번레이트">번레이트</Term> {money(rw.netBurn)} · 단순 <Term k="런웨이">런웨이</Term>(성장 없음) {Number.isFinite(rw.simpleRunwayMonths) ? mo(rw.simpleRunwayMonths) : "무한"}</span>
      </Verdict>

      <SweepChart
        title="월별 현금 잔고"
        caption="매출·비용 성장률을 바꾸면 곡선이 바로 바뀌어요. 0 아래로 내려가는 달이 현금이 떨어지는 달이에요."
        points={cashPts}
        current={{ x: Math.min(RUNWAY_HORIZON, Math.max(1, months)), y: cashPts[Math.min(RUNWAY_HORIZON, Math.max(1, months)) - 1]?.y ?? 0 }}
        marks={rw.breakEvenMonth ? [{ at: rw.breakEvenMonth, label: "흑자 전환" }] : []}
        formatX={(v) => `${Math.round(v)}개월`}
        formatY={money}
        xLabel="개월"
        yLabel="현금"
      />

      <ChoiceChips legend="무엇에 민감한지 볼까요?" value={focus} options={[{ value: "unit", label: "LTV/CAC" }, { value: "runway", label: "런웨이" }] as const} onChange={setFocus} />
      {focus === "unit" ? (
        <>
          <TornadoChart bars={unitBars} mode={mode} format={x1} />
          <SweepChart
            title="이탈률이 바뀌면 LTV/CAC는?"
            caption="이탈률은 LTV/CAC를 가장 크게 흔드는 경우가 많아요. 3배·1배가 되는 이탈률을 점선으로 표시했어요. 그래프를 눌러 바꿔 보세요."
            points={churnPts}
            current={{ x: input.monthlyChurn, y: Math.min(20, ltvCac(input)) }}
            marks={marks}
            formatX={pct1}
            formatY={x1}
            xLabel="월 이탈률"
            yLabel="LTV/CAC"
            onPick={(v) => slide("monthlyChurn", Math.round(v * 1000) / 1000)}
          />
        </>
      ) : (
        <TornadoChart bars={runBars} mode={mode} format={mo} />
      )}

      {!easy && (
        <section className="space-y-3 rounded-md border border-border bg-background p-3">
          <h2 className="text-base font-bold text-foreground">손익분기 판매량</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField label="월 고정비" value={be.fixed} onChange={(v) => setBe({ ...be, fixed: v })} />
            <MoneyField label="판매 단가" value={be.price} onChange={(v) => setBe({ ...be, price: v })} />
            <MoneyField label="단위 변동비" value={be.variable} onChange={(v) => setBe({ ...be, variable: v })} />
          </div>
          <p className="text-sm text-foreground">
            {Number.isFinite(beR.units) ? <>한 달에 <b>{beR.units.toLocaleString("ko-KR")}개</b>(매출 {exactWon(beR.revenue)})를 팔아야 고정비를 덮어요. <Term k="공헌이익">공헌이익</Term>률 {pct1(beR.cmRatio)}.</> : <>단가가 변동비보다 낮아 팔수록 손해예요.</>}
          </p>
        </section>
      )}

      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
