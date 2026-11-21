// 결산 상각표·외부감사 대상 판정 (2026-11-20, 전수조사 8번). 계산: lib/kr-accounting-schedules-2026.ts (kr-tax-advisor 스킬 calc.mjs depreciation·lease·bond·audit와 같은 코드)
import { useState } from "react";
import { ACCT_AS_OF, ACCT_NOTE, bondSchedule, depreciation, externalAuditCheck, leaseSchedule, type DepMethod } from "../../../lib/kr-accounting-schedules-2026";
import { AUDIT_DEFERRED_NOTE, BENCHMARKS, attributeSample, averageCorpRate, deferredTax, materiality, musSample, type Benchmark, type Confidence, type Risk } from "../../../lib/kr-audit-deferred-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell, { krwShort } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "accounting-schedule-calculator";
const MAN = 10_000;
const won = (n: number) => Math.round(n).toLocaleString("ko-KR");
type Mode = "dep" | "lease" | "bond" | "audit" | "deferred" | "mat";
type ConfKey = "80" | "90" | "95" | "99";
const CONF_KEYS: ConfKey[] = ["80", "90", "95", "99"];
const pctTxt = (r: number) => `${Math.round(r * 10000) / 100}%`;

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-right text-xs sm:text-sm">
        <thead><tr className="text-muted-foreground">{head.map((h) => <th key={h} className="py-1 pl-2 font-medium first:pl-0 first:text-left">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-border text-foreground">{r.map((c, j) => <td key={j} className="py-1 pl-2 font-mono first:pl-0 first:text-left">{typeof c === "number" ? won(c) : c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function AccountingSchedules() {
  const [kind, setKind] = useState<Mode>("dep");
  const [dep, setDep] = useState({ cost: 1000, residual: 0, years: 5, method: "straight" as DepMethod, firstMonths: 12 });
  const [ls, setLs] = useState({ payment: 1200, periods: 5, rate: 5, advance: false, directCost: 0 });
  const [bd, setBd] = useState({ face: 10000, coupon: 5, market: 6, periods: 3 });
  const [au, setAu] = useState({ listed: false, llc: false, assets: 130, liabilities: 80, revenue: 50, employees: 20, members: 0 });
  const [df, setDf] = useState({ deductible: 10000, taxable: 4000, losses: 0, rate: 20.9, future: 0, opening: 500, current: 3000, pretax: 20000 });
  const [mt, setMt] = useState({ benchmark: "pretax" as Benchmark, base: 10, pct: 5, risk: "medium" as Risk, population: 50, expected: 0, confidence: 95 as Confidence, deviation: 5 });
  const tick = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const d = depreciation(dep.cost * MAN, dep.residual * MAN, dep.years, dep.method, dep.firstMonths);
  const l = leaseSchedule(ls.payment * MAN, ls.periods, ls.rate / 100, ls.advance, ls.directCost * MAN);
  const b = bondSchedule(bd.face * MAN, bd.coupon / 100, bd.market / 100, bd.periods);
  const a = externalAuditCheck({ ...au, assets: au.assets * 100_000_000, liabilities: au.liabilities * 100_000_000, revenue: au.revenue * 100_000_000 });
  const f = deferredTax({ items: [{ label: "차감할 일시적차이", amount: df.deductible * MAN }, { label: "이월결손금", amount: df.losses * MAN }, { label: "가산할 일시적차이", amount: -df.taxable * MAN }], rate: df.rate / 100, futureIncome: df.future > 0 ? df.future * MAN : undefined, openingNet: df.opening * MAN, currentTax: df.current * MAN, pretaxIncome: df.pretax * MAN });
  const m = materiality({ benchmark: mt.benchmark, base: mt.base * 100_000_000, pct: mt.pct / 100, risk: mt.risk });
  const mus = musSample({ population: mt.population * 100_000_000, tolerable: m.performance, expected: mt.expected * MAN, confidence: mt.confidence });
  const att = attributeSample({ tolerableRate: mt.deviation / 100, confidence: mt.confidence });
  const pctX = (n: number) => `${Math.round(n * 10) / 10}%`;
  const auditAt = (assets: number) => externalAuditCheck({ ...au, assets: assets * 100_000_000, liabilities: au.liabilities * 100_000_000, revenue: au.revenue * 100_000_000 }).met.length;
  const curve = kind === "dep"
    ? { title: "내용연수에 따라 첫해 감가상각비가 이렇게 바뀌어요", caption: "같은 취득원가·방법으로 내용연수만 바꿔요.", xLabel: "내용연수", yLabel: "첫해 상각비", min: 1, max: 40, step: 1, current: dep.years, f: (v: number) => depreciation(dep.cost * MAN, dep.residual * MAN, v, dep.method, dep.firstMonths).rows[0]?.expense ?? 0, formatX: (n: number) => `${Math.round(n)}년`, formatY: krwShort, onPick: (v: number) => setDep({ ...dep, years: Math.max(1, Math.round(v)) }) }
    : kind === "lease"
      ? { title: "할인율에 따라 처음 잡는 리스부채가 이렇게 바뀌어요", caption: "할인율이 높을수록 현재가치가 작아져요.", xLabel: "할인율", yLabel: "리스부채", min: 0, max: 15, step: 0.1, current: ls.rate, f: (v: number) => leaseSchedule(ls.payment * MAN, ls.periods, v / 100, ls.advance, ls.directCost * MAN).liability, formatX: pctX, formatY: krwShort, onPick: (v: number) => setLs({ ...ls, rate: Math.round(v * 10) / 10 }) }
      : kind === "bond"
        ? { title: "시장이자율에 따라 사채 발행가액이 이렇게 바뀌어요", caption: "표시이자율보다 높으면 할인발행, 낮으면 할증발행이에요.", xLabel: "시장이자율", yLabel: "발행가액", min: 0, max: 15, step: 0.1, current: bd.market, f: (v: number) => bondSchedule(bd.face * MAN, bd.coupon / 100, v / 100, bd.periods).price, formatX: pctX, formatY: krwShort, onPick: (v: number) => setBd({ ...bd, market: Math.round(v * 10) / 10 }), marks: [{ at: bd.coupon, label: "표시이자율" }] }
        : kind === "audit"
          ? { title: "자산총액에 따라 해당하는 기준 수가 이렇게 바뀌어요", caption: "다른 기준은 그대로 두고 자산총액만 바꿔요. 기준 수가 정해진 개수 이상이면 외부감사 대상이에요.", xLabel: "자산총액", yLabel: "해당 기준 수", min: 0, max: Math.max(1000, au.assets * 2), step: 5, current: au.assets, f: auditAt, formatX: (n: number) => `${Math.round(n).toLocaleString("ko-KR")}억`, formatY: (n: number) => `${Math.round(n)}개`, onPick: (v: number) => setAu({ ...au, assets: v }) }
          : kind === "deferred"
            ? { title: "적용 세율에 따라 이연법인세자산(순액)이 이렇게 바뀌어요", caption: "일시적차이는 그대로 두고 세율만 바꿔요.", xLabel: "적용 세율", yLabel: "순 이연법인세", min: 9, max: 27, step: 0.1, current: df.rate, f: (v: number) => deferredTax({ items: [{ label: "차감할 일시적차이", amount: df.deductible * MAN }, { label: "이월결손금", amount: df.losses * MAN }, { label: "가산할 일시적차이", amount: -df.taxable * MAN }], rate: v / 100, futureIncome: df.future > 0 ? df.future * MAN : undefined, openingNet: df.opening * MAN, currentTax: df.current * MAN, pretaxIncome: df.pretax * MAN }).closingNet, formatX: pctX, formatY: krwShort, onPick: (v: number) => setDf({ ...df, rate: Math.round(v * 10) / 10 }) }
            : { title: "적용 비율에 따라 수행중요성이 이렇게 바뀌어요", caption: "기준치 금액과 위험 수준은 그대로예요.", xLabel: "적용 비율", yLabel: "수행중요성", min: 0.5, max: 10, step: 0.1, current: mt.pct, f: (v: number) => materiality({ benchmark: mt.benchmark, base: mt.base * 100_000_000, pct: v / 100, risk: mt.risk }).performance, formatX: pctX, formatY: krwShort, onPick: (v: number) => setMt({ ...mt, pct: Math.round(v * 10) / 10 }) };
  const box = "rounded-md border border-border bg-card px-4 py-4 text-sm";
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{ ...curve, onPick: (v: number) => { curve.onPick(v); tick(); } }}
    >
      {() => (
    <>
      <ChoiceChips<Mode> legend="무엇을 만들까요?" value={kind} options={[{ value: "dep", label: "감가상각표" }, { value: "lease", label: "리스(IFRS 16)" }, { value: "bond", label: "사채 상각표" }, { value: "audit", label: "외감 대상 판정" }, { value: "deferred", label: "이연법인세" }, { value: "mat", label: "감사 중요성·표본" }]} onChange={(v) => { setKind(v); tick(); }} />
      {kind === "dep" && (
        <>
          <ChoiceChips<DepMethod> legend="상각 방법" value={dep.method} options={[{ value: "straight", label: "정액법" }, { value: "declining", label: "정률법" }, { value: "syd", label: "연수합계법" }]} onChange={(v) => { setDep({ ...dep, method: v }); tick(); }} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="취득원가" suffix="만 원" value={dep.cost} onChange={(v) => { setDep({ ...dep, cost: Math.max(0, v) }); tick(); }} />
            <NumberField label="잔존가치" suffix="만 원" value={dep.residual} onChange={(v) => { setDep({ ...dep, residual: Math.max(0, v) }); tick(); }} />
            <NumberField label="내용연수" suffix="년" value={dep.years} onChange={(v) => { setDep({ ...dep, years: Math.max(1, Math.round(v)) }); tick(); }} />
            <NumberField label="첫해 사용 개월 수" suffix="개월" value={dep.firstMonths} onChange={(v) => { setDep({ ...dep, firstMonths: Math.min(12, Math.max(1, Math.round(v))) }); tick(); }} />
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">첫해 감가상각비 {won(d.rows[0]?.expense ?? 0)}원{dep.method === "declining" ? ` · 상각률 ${d.rate}` : ""}</p>
            <Table head={["연차", "기초", "상각비", "기말"]} rows={d.rows.map((r) => [`${r.year}년`, r.opening, r.expense, r.closing])} />
          </div>
        </>
      )}
      {kind === "lease" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="연 리스료" suffix="만 원" value={ls.payment} onChange={(v) => { setLs({ ...ls, payment: Math.max(0, v) }); tick(); }} />
            <NumberField label="리스기간" suffix="년" value={ls.periods} onChange={(v) => { setLs({ ...ls, periods: Math.max(1, Math.round(v)) }); tick(); }} />
            <NumberField label="증분차입이자율" suffix="%" step={0.1} value={ls.rate} onChange={(v) => { setLs({ ...ls, rate: Math.max(0, v) }); tick(); }} />
            <NumberField label="리스개설직접원가" suffix="만 원" value={ls.directCost} onChange={(v) => { setLs({ ...ls, directCost: Math.max(0, v) }); tick(); }} />
          </div>
          <ChoiceChips<"end" | "start"> legend="리스료 지급 시점" value={ls.advance ? "start" : "end"} options={[{ value: "end", label: "매년 말" }, { value: "start", label: "매년 초" }]} onChange={(v) => { setLs({ ...ls, advance: v === "start" }); tick(); }} />
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">리스부채 {won(l.liability)}원 · 사용권자산 {won(l.rou)}원</p>
            <p className="mt-1 text-muted-foreground">총 이자비용 {won(l.totalInterest)}원, 사용권자산 상각 해마다 {won(l.rows[0]?.rouDep ?? 0)}원</p>
            <Table head={["연차", "기초 부채", "이자비용", "원금 감소", "기말 부채"]} rows={l.rows.map((r) => [`${r.period}년`, r.opening, r.interest, r.principal, r.closing])} />
          </div>
        </>
      )}
      {kind === "bond" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="액면금액" suffix="만 원" value={bd.face} onChange={(v) => { setBd({ ...bd, face: Math.max(0, v) }); tick(); }} />
            <NumberField label="표면이자율" suffix="%" step={0.1} value={bd.coupon} onChange={(v) => { setBd({ ...bd, coupon: Math.max(0, v) }); tick(); }} />
            <NumberField label="발행 시 시장이자율(유효이자율)" suffix="%" step={0.1} value={bd.market} onChange={(v) => { setBd({ ...bd, market: Math.max(0, v) }); tick(); }} />
            <NumberField label="만기" suffix="년" value={bd.periods} onChange={(v) => { setBd({ ...bd, periods: Math.max(1, Math.round(v)) }); tick(); }} />
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">발행가액 {won(b.price)}원 · {b.type}</p>
            <Table head={["연차", "기초 장부", "현금이자", "이자비용", "차금 상각", "기말 장부"]} rows={b.rows.map((r) => [`${r.period}년`, r.opening, r.cash, r.interest, r.amortization, r.closing])} />
          </div>
        </>
      )}
      {kind === "audit" && (
        <>
          <div className="flex flex-wrap gap-3">
            <ChoiceChips<"no" | "yes"> legend="상장(예정) 법인인가요?" value={au.listed ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => { setAu({ ...au, listed: v === "yes" }); tick(); }} />
            <ChoiceChips<"no" | "yes"> legend="회사 형태" value={au.llc ? "yes" : "no"} options={[{ value: "no", label: "주식회사" }, { value: "yes", label: "유한회사" }]} onChange={(v) => { setAu({ ...au, llc: v === "yes" }); tick(); }} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="직전 사업연도 말 자산총액" suffix="억 원" value={au.assets} onChange={(v) => { setAu({ ...au, assets: Math.max(0, v) }); tick(); }} />
            <NumberField label="부채총액" suffix="억 원" value={au.liabilities} onChange={(v) => { setAu({ ...au, liabilities: Math.max(0, v) }); tick(); }} />
            <NumberField label="매출액" suffix="억 원" value={au.revenue} onChange={(v) => { setAu({ ...au, revenue: Math.max(0, v) }); tick(); }} />
            <NumberField label="종업원 수" suffix="명" value={au.employees} onChange={(v) => { setAu({ ...au, employees: Math.max(0, Math.round(v)) }); tick(); }} />
            {au.llc && <NumberField label="사원 수" suffix="명" value={au.members} onChange={(v) => { setAu({ ...au, members: Math.max(0, Math.round(v)) }); tick(); }} />}
          </div>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">다음 사업연도 외부감사 {a.required ? "대상이에요" : "대상이 아니에요"}</p>
            <p className="mt-1 text-foreground">{a.reason}</p>
            {a.met.length > 0 && <p className="mt-1 text-muted-foreground">해당: {a.met.join(", ")}</p>}
          </div>
        </>
      )}
      {kind === "deferred" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="차감할 일시적차이 합계(충당부채·손상 등)" suffix="만 원" value={df.deductible} onChange={(v) => { setDf({ ...df, deductible: Math.max(0, v) }); tick(); }} />
            <NumberField label="가산할 일시적차이 합계(일시상각·미수이자 등)" suffix="만 원" value={df.taxable} onChange={(v) => { setDf({ ...df, taxable: Math.max(0, v) }); tick(); }} />
            <NumberField label="세무상 이월결손금" suffix="만 원" value={df.losses} onChange={(v) => { setDf({ ...df, losses: Math.max(0, v) }); tick(); }} />
            <NumberField label="소멸될 때 적용할 세율(지방세 포함)" suffix="%" step={0.1} value={df.rate} onChange={(v) => { setDf({ ...df, rate: Math.min(100, Math.max(0, v)) }); tick(); }} />
            <NumberField label="쓸 수 있는 미래 과세소득(모르면 0)" suffix="만 원" value={df.future} onChange={(v) => { setDf({ ...df, future: Math.max(0, v) }); tick(); }} />
            <NumberField label="기초 순이연법인세자산(부채면 −)" suffix="만 원" value={df.opening} onChange={(v) => { setDf({ ...df, opening: v }); tick(); }} />
            <NumberField label="당기 법인세 부담액" suffix="만 원" value={df.current} onChange={(v) => { setDf({ ...df, current: Math.max(0, v) }); tick(); }} />
            <NumberField label="법인세비용차감전순이익" suffix="만 원" value={df.pretax} onChange={(v) => { setDf({ ...df, pretax: v }); tick(); }} />
          </div>
          <p className="text-xs text-muted-foreground">참고: 과세표준 3억 원이면 2026 평균세율(지방세 포함)은 {pctTxt(averageCorpRate(300_000_000))}, 10억 원이면 {pctTxt(averageCorpRate(1_000_000_000))}예요.</p>
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">기말 순이연법인세{f.closingNet >= 0 ? "자산" : "부채"} {won(Math.abs(f.closingNet))}원</p>
            <p className="mt-1 text-foreground">이연법인세자산 {won(f.dta)}원{f.unrecognized > 0 ? ` (미래 과세소득이 부족해 ${won(f.unrecognized)}원은 인식하지 않아요)` : ""} · 이연법인세부채 {won(f.dtl)}원</p>
            <p className="mt-1 text-foreground">법인세비용 {won(f.totalExpense)}원 = 당기 {won(f.currentTax)}원 {f.deferredExpense >= 0 ? "+" : "−"} 이연 {won(Math.abs(f.deferredExpense))}원{f.effectiveRate !== null ? ` · 유효세율 ${pctTxt(f.effectiveRate)}` : ""}</p>
          </div>
        </>
      )}
      {kind === "mat" && (
        <>
          <ChoiceChips<Benchmark> legend="중요성 기준치" value={mt.benchmark} options={(Object.keys(BENCHMARKS) as Benchmark[]).map((k) => ({ value: k, label: BENCHMARKS[k].label }))} onChange={(v) => { setMt({ ...mt, benchmark: v, pct: BENCHMARKS[v].typical * 100 }); tick(); }} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="기준치 금액" suffix="억 원" step={0.1} value={mt.base} onChange={(v) => { setMt({ ...mt, base: v }); tick(); }} />
            <NumberField label="적용 비율" suffix="%" step={0.1} value={mt.pct} onChange={(v) => { setMt({ ...mt, pct: Math.max(0, v) }); tick(); }} />
          </div>
          <ChoiceChips<Risk> legend="왜곡 위험(수행 중요성 비율)" value={mt.risk} options={[{ value: "low", label: "낮음 75%" }, { value: "medium", label: "보통 65%" }, { value: "high", label: "높음 50%" }]} onChange={(v) => { setMt({ ...mt, risk: v }); tick(); }} />
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">전체 중요성 {won(m.overall)}원 · 수행 중요성 {won(m.performance)}원</p>
            <p className="mt-1 text-foreground">명백히 사소한 금액 {won(m.trivial)}원(전체의 5%)</p>
            {m.outOfRange && <p className="mt-1 text-warning">이 기준치의 흔한 범위({pctTxt(m.range[0])}~{pctTxt(m.range[1])})를 벗어났어요. 근거를 감사조서에 남겨요.</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="표본 모집단 금액(계정 잔액)" suffix="억 원" step={0.1} value={mt.population} onChange={(v) => { setMt({ ...mt, population: Math.max(0, v) }); tick(); }} />
            <NumberField label="예상왜곡" suffix="만 원" value={mt.expected} onChange={(v) => { setMt({ ...mt, expected: Math.max(0, v) }); tick(); }} />
            <NumberField label="통제 테스트 허용이탈률" suffix="%" step={0.5} value={mt.deviation} onChange={(v) => { setMt({ ...mt, deviation: Math.min(50, Math.max(0, v)) }); tick(); }} />
          </div>
          <ChoiceChips<ConfKey> legend="신뢰수준" value={String(mt.confidence) as ConfKey} options={CONF_KEYS.map((c) => ({ value: c, label: `${c}%` }))} onChange={(v) => { setMt({ ...mt, confidence: Number(v) as Confidence }); tick(); }} />
          <div className={box} aria-live="polite">
            <p className="text-lg font-semibold text-foreground">금액단위표본 {mus.size ?? "—"}개{mus.interval ? ` · 표본 간격 ${won(mus.interval)}원` : ""}</p>
            <p className="mt-1 text-foreground">허용왜곡은 수행 중요성({won(m.performance)}원)으로 놓았어요. 신뢰계수 {mus.factor}, 확장계수 {mus.expansion}.</p>
            {mus.reason && <p className="mt-1 text-muted-foreground">{mus.reason}</p>}
            <p className="mt-2 text-foreground">통제 테스트(예상 이탈 0개) 표본 {att.size ?? "—"}개</p>
          </div>
        </>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{ACCT_NOTE} {(kind === "deferred" || kind === "mat") && AUDIT_DEFERRED_NOTE} 기준일 {ACCT_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </>
      )}
    </CurveShell>
  );
}
