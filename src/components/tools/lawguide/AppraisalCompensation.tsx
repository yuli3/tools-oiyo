// 감정평가 3방식·토지보상 어림 (2026-11-20, 전수조사 9번). 계산: lib/kr-appraisal-2026.ts (법령 길잡이 스킬 guide.mjs calc appraisal·compensation과 같은 코드)
import { useState } from "react";
import { APPRAISAL_AS_OF, APPRAISAL_NOTE, businessLoss, costApproach, incomeApproach, landCompensation, reconcile, relocationAllowance, salesComparison } from "../../../lib/kr-appraisal-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "appraisal-compensation-calculator";
const MAN = 10_000;
const man = (n: number) => {
  const m = Math.round(n / MAN);
  const eok = Math.floor(m / 10_000), rest = m % 10_000;
  return eok ? `${eok.toLocaleString("ko-KR")}억${rest ? ` ${rest.toLocaleString("ko-KR")}만` : ""} 원` : `${m.toLocaleString("ko-KR")}만 원`;
};
type Mode = "three" | "comp";

export default function AppraisalCompensation() {
  const [mode, setMode] = useState<Mode>("comp");
  const [cost, setCost] = useState({ rc: 50000, life: 40, age: 10, land: 30000 });
  const [cmp, setCmp] = useState({ area: 100, price: 100000, cArea: 100, time: 2, factor: 0 });
  const [inc, setInc] = useState({ gross: 6000, vacancy: 5, expenses: 700, cap: 5 });
  const [w, setW] = useState({ cost: 1, cmp: 2, inc: 1 });
  const [land, setLand] = useState({ official: 300, area: 200, change: 3.2, individual: 0, other: 0 });
  const [biz, setBiz] = useState({ profit: 3600, kind: "pause" as "pause" | "close", months: 4, fixed: 200, moving: 300, saleLoss: 0 });
  const [home, setHome] = useState({ spending: 400, tenant: true });
  const tick = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const c = costApproach({ replacementCost: cost.rc * MAN, usefulLife: cost.life, age: cost.age, land: cost.land * MAN });
  const s = salesComparison(cmp.area, [{ price: cmp.price * MAN, area: cmp.cArea, time: 1 + cmp.time / 100, individual: 1 + cmp.factor / 100 }]);
  const i = incomeApproach({ grossIncome: inc.gross * MAN, vacancy: inc.vacancy / 100, expenses: inc.expenses * MAN, capRate: inc.cap / 100 });
  const r = reconcile([{ label: "원가", value: c.value, weight: w.cost }, { label: "비교", value: s.value, weight: w.cmp }, { label: "수익", value: i.value, weight: w.inc }]);
  const l = landCompensation({ officialPrice: land.official * MAN, area: land.area, landChange: land.change / 100, individual: 1 + land.individual / 100, other: 1 + land.other / 100 });
  const b = businessLoss({ annualProfit: biz.profit * MAN, kind: biz.kind, months: biz.months, fixedCosts: biz.fixed * MAN, moving: biz.moving * MAN, saleLoss: biz.saleLoss * MAN });
  const h = relocationAllowance(home.spending * MAN, home.tenant);
  const box = "rounded-md border border-border bg-card px-4 py-4 text-sm";
  const nf = (label: string, suffix: string, value: number, on: (v: number) => void, step = 1) => <NumberField label={label} suffix={suffix} step={step} value={value} onChange={(v) => { on(v); tick(); }} />;
  return (
    <div className="space-y-5">
      <ChoiceChips<Mode> legend="무엇을 볼까요?" value={mode} options={[{ value: "comp", label: "수용 보상 어림" }, { value: "three", label: "감정평가 3방식 원리" }]} onChange={(v) => { setMode(v); tick(); }} />
      {mode === "comp" ? (
        <>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-foreground">토지</legend>
            {nf("비교표준지 공시지가(㎡당)", "만 원", land.official, (v) => setLand({ ...land, official: Math.max(0, v) }))}
            {nf("편입 면적", "㎡", land.area, (v) => setLand({ ...land, area: Math.max(0, v) }))}
            {nf("공시기준일 이후 지가변동률", "%", land.change, (v) => setLand({ ...land, change: v }), 0.1)}
            {nf("개별요인 보정(모양·도로 등, ±)", "%", land.individual, (v) => setLand({ ...land, individual: v }), 1)}
            {nf("그 밖의 요인 보정(±)", "%", land.other, (v) => setLand({ ...land, other: v }), 1)}
          </fieldset>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-foreground">영업손실</legend>
            <ChoiceChips<"pause" | "close"> legend="휴업·폐업" value={biz.kind} options={[{ value: "pause", label: "옮겨서 계속(휴업)" }, { value: "close", label: "폐업" }]} onChange={(v) => { setBiz({ ...biz, kind: v }); tick(); }} />
            {nf("최근 3년 평균 연 영업이익", "만 원", biz.profit, (v) => setBiz({ ...biz, profit: Math.max(0, v) }))}
            {biz.kind === "pause" ? (
              <>
                {nf("휴업 기간(원칙 4개월)", "개월", biz.months, (v) => setBiz({ ...biz, months: Math.max(0, v) }))}
                {nf("휴업 중 고정비(임차료·인건비 등)", "만 원", biz.fixed, (v) => setBiz({ ...biz, fixed: Math.max(0, v) }))}
                {nf("시설 이전비", "만 원", biz.moving, (v) => setBiz({ ...biz, moving: Math.max(0, v) }))}
              </>
            ) : nf("시설 매각손실", "만 원", biz.saleLoss, (v) => setBiz({ ...biz, saleLoss: Math.max(0, v) }))}
          </fieldset>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-foreground">주거이전비</legend>
            <ChoiceChips<"t" | "o"> legend="거주 형태" value={home.tenant ? "t" : "o"} options={[{ value: "t", label: "세입자(4개월)" }, { value: "o", label: "소유자(2개월)" }]} onChange={(v) => { setHome({ ...home, tenant: v === "t" }); tick(); }} />
            {nf("가구원수별 월평균 가계지출비(통계청)", "만 원", home.spending, (v) => setHome({ ...home, spending: Math.max(0, v) }))}
          </fieldset>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">보상 합계 어림 {man(l.value + b.total + h.amount)}</p>
            <ul className="mt-2 space-y-1 text-foreground">
              <li>토지 {man(l.value)} (㎡당 {man(l.unit)}, 보정 계수 {l.factor})</li>
              <li>영업손실 {man(b.total)} ({biz.kind === "pause" ? `영업이익 ${b.kind === "pause" ? b.months : 0}개월분 ${man(b.profitPart)} + 고정비 + 이전비` : `영업이익 2년분 ${man(b.profitPart)} + 매각손실`})</li>
              <li>주거이전비 {man(h.amount)} ({h.months}개월분)</li>
            </ul>
            <p className="mt-2 text-muted-foreground">개발이익은 빼고, 감정평가사 2~3인 평가 평균으로 정해요. 재결에 불복하면 재결서를 받은 날부터 30일 안에 이의신청해요.</p>
          </div>
        </>
      ) : (
        <>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-foreground">원가방식(건물)</legend>
            {nf("재조달원가", "만 원", cost.rc, (v) => setCost({ ...cost, rc: Math.max(0, v) }))}
            {nf("내용연수", "년", cost.life, (v) => setCost({ ...cost, life: Math.max(1, v) }))}
            {nf("경과연수", "년", cost.age, (v) => setCost({ ...cost, age: Math.max(0, v) }))}
            {nf("토지가액", "만 원", cost.land, (v) => setCost({ ...cost, land: Math.max(0, v) }))}
          </fieldset>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-foreground">비교방식(거래사례)</legend>
            {nf("대상 면적", "㎡", cmp.area, (v) => setCmp({ ...cmp, area: Math.max(0, v) }))}
            {nf("사례 거래가격", "만 원", cmp.price, (v) => setCmp({ ...cmp, price: Math.max(0, v) }))}
            {nf("사례 면적", "㎡", cmp.cArea, (v) => setCmp({ ...cmp, cArea: Math.max(0, v) }))}
            {nf("시점수정(거래 뒤 가격 변동)", "%", cmp.time, (v) => setCmp({ ...cmp, time: v }), 0.1)}
            {nf("지역·개별요인 차이(±)", "%", cmp.factor, (v) => setCmp({ ...cmp, factor: v }))}
          </fieldset>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold text-foreground">수익방식(직접환원)</legend>
            {nf("연 가능총수익(임대료)", "만 원", inc.gross, (v) => setInc({ ...inc, gross: Math.max(0, v) }))}
            {nf("공실률", "%", inc.vacancy, (v) => setInc({ ...inc, vacancy: Math.max(0, v) }))}
            {nf("연 운영경비", "만 원", inc.expenses, (v) => setInc({ ...inc, expenses: Math.max(0, v) }))}
            {nf("환원율", "%", inc.cap, (v) => setInc({ ...inc, cap: Math.max(0, v) }), 0.1)}
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-3">
            {nf("원가 가중치", "", w.cost, (v) => setW({ ...w, cost: Math.max(0, v) }))}
            {nf("비교 가중치", "", w.cmp, (v) => setW({ ...w, cmp: Math.max(0, v) }))}
            {nf("수익 가중치", "", w.inc, (v) => setW({ ...w, inc: Math.max(0, v) }))}
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">시산가액 조정 {man(r.value)} (방식 간 차이 {r.spread}%)</p>
            <ul className="mt-2 space-y-1 text-foreground">
              <li>원가방식 {man(c.value)} (감가 {man(c.depreciation)}, 남은 연수 {c.remainingLife}년)</li>
              <li>비교방식 {man(s.value)} (보정 단가 ㎡당 {man(s.unit)})</li>
              <li>수익방식 {man(i.value)} (순영업소득 {man(i.noi)} ÷ {inc.cap}%)</li>
            </ul>
            <p className="mt-2 text-muted-foreground">방식 간 차이가 크면 어느 가정(환원율, 사례 보정, 감가)이 결과를 끄는지 먼저 봐요.</p>
          </div>
        </>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{APPRAISAL_NOTE} 감정평가서가 아니에요. 기준일 {APPRAISAL_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
