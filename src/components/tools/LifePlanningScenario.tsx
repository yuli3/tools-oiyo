// 생애 설계 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 탭 3개가 각각 ScenarioTool이에요.
// 계산: lib/life-plan-scenarios.ts
import { useState } from "react";
import {
  EDU_ASSUMPTIONS, JEONSE_ASSUMPTIONS, START_ASSUMPTIONS, eduMonthly, eduPlain, eduResult, jeonseBand, jeonsePlain, jeonseRatio, startNet, startPlain,
  type EduLite, type JeonseLite, type StartLite,
} from "../../lib/life-plan-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";

type Tab = "start" | "edu" | "jeonse";
const TABS: { value: Tab; label: string }[] = [{ value: "start", label: "결혼 출발 자금" }, { value: "edu", label: "교육 자금" }, { value: "jeonse", label: "전세 안전도" }];
const man = (n: number) => {
  const v = Math.round(Math.abs(n) / 10000);
  const eok = Math.floor(v / 10000);
  const rest = v % 10000;
  const body = eok > 0 ? `${eok.toLocaleString("ko-KR")}억${rest ? ` ${rest.toLocaleString("ko-KR")}만` : ""} 원` : `${rest.toLocaleString("ko-KR")}만 원`;
  return `${n < 0 ? "−" : ""}${body}`;
};
const pct = (n: number) => `${(Math.round(n * 1000) / 10).toLocaleString("ko-KR")}%`;

function Start() {
  const KEYS = ["mine", "partner", "wedding", "housing"] as const;
  type K = (typeof KEYS)[number];
  const f = (i: StartLite, edit: (p: Partial<StartLite>, k: K[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <MoneyField label="내 자산" value={i.mine} onChange={(v) => edit({ mine: v }, ["mine"])} />
      <MoneyField label="배우자 자산" value={i.partner} onChange={(v) => edit({ partner: v }, ["partner"])} />
      <MoneyField label="결혼식 비용" value={i.wedding} onChange={(v) => edit({ wedding: v }, ["wedding"])} />
      <MoneyField label="신혼집 비용(보증금·매매)" value={i.housing} onChange={(v) => edit({ housing: v }, ["housing"])} />
    </div>
  );
  return (
    <ScenarioTool<StartLite, K>
      toolId="life-planning-start"
      example={{ mine: 50000000, partner: 50000000, wedding: 30000000, housing: 200000000 }}
      assumptions={START_ASSUMPTIONS}
      keys={KEYS}
      evaluate={startNet}
      resultName="남는 돈"
      questions={({ input, edit }) => [{ title: "두 사람 자산과 쓸 돈을 알려 주세요", keys: [...KEYS], body: f(input, edit) }]}
      expert={({ input, edit }) => f(input, edit)}
      summary={startPlain}
      metrics={(i) => [
        { label: "남는 돈", value: man(startNet(i)), tone: "primary" },
        { label: "두 사람 자산", value: man(i.mine + i.partner) },
        { label: "쓸 돈", value: man(i.wedding + i.housing) },
      ]}
      sliders={["housing", "wedding"]}
      charts={(i) => (
        <BridgeChart
          title="자산에서 쓸 돈을 빼면"
          steps={[
            { label: "두 사람 자산", value: i.mine + i.partner, kind: "total" },
            { label: "결혼식", value: -i.wedding, kind: "add" },
            { label: "신혼집", value: -i.housing, kind: "add" },
            { label: "남는 돈", value: startNet(i), kind: "total" },
          ]}
          format={man}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={["부모 지원이 크면 혼인 증여공제(혼인신고 전후 2년, 1억 원) 요건을 확인하세요."]}
      expertFooter={() => <ResultSteps steps={["남는 돈 = 내 자산 + 배우자 자산 − 결혼식 − 신혼집"]} next={[{ href: "/ko/wedding-planning-calculator/", label: "결혼 예산" }, { href: "/ko/gift-tax-calculator/", label: "증여세" }]} />}
    />
  );
}

function Edu() {
  const KEYS = ["cost", "years", "duration", "inflation", "ret"] as const;
  type K = (typeof KEYS)[number];
  const f = (i: EduLite, edit: (p: Partial<EduLite>, k: K[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <MoneyField label="1년 교육비(지금 값)" value={i.cost} onChange={(v) => edit({ cost: v }, ["cost"])} />
      <NumberField label="입학까지 남은 해" value={i.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
      <NumberField label="다니는 기간" value={i.duration} onChange={(v) => edit({ duration: v }, ["duration"])} suffix="년" step={1} min={1} />
      <NumberField label="교육비 상승률" value={Math.round(i.inflation * 1000) / 10} onChange={(v) => edit({ inflation: v / 100 }, ["inflation"])} suffix="%" step={0.5} min={0} />
      <NumberField label="모으는 돈 수익률" value={Math.round(i.ret * 1000) / 10} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.5} min={0} />
    </div>
  );
  return (
    <ScenarioTool<EduLite, K>
      toolId="life-planning-edu"
      example={{ cost: 10000000, years: 10, duration: 4, inflation: 0.03, ret: 0.035 }}
      assumptions={EDU_ASSUMPTIONS}
      keys={KEYS}
      evaluate={eduMonthly}
      resultName="한 달 저축액"
      questions={({ input, edit }) => [{ title: "언제, 얼마가 필요한가요?", keys: ["cost", "years", "duration"], body: f(input, edit) }]}
      expert={({ input, edit }) => f(input, edit)}
      summary={eduPlain}
      metrics={(i) => {
        const r = eduResult(i);
        return [
          { label: "한 달 저축액", value: man(r.monthly), tone: "primary" },
          { label: "그때 필요한 돈", value: man(r.future) },
          { label: "지금 값", value: man(r.today) },
        ];
      }}
      sliders={["inflation", "ret", "years"]}
      charts={(i) => (
        <CompareBars
          title="교육비 상승률별 한 달 저축액"
          items={[0, 0.02, 0.03, 0.05].map((x) => ({ label: `연 ${pct(x)}`, value: eduMonthly({ ...i, inflation: x }), current: Math.abs(x - i.inflation) < 1e-9 }))}
          format={man}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={["학자금 대출·장학금을 받으면 필요한 돈이 줄어요.", "수익률을 높게 잡으면 저축액이 적게 나와요. 원금 보장 상품이면 2~3%로 보세요."]}
      expertFooter={(i) => {
        const r = eduResult(i);
        return <ResultSteps steps={[`그때 필요한 돈 = Σ 1년 교육비 × (1+${pct(i.inflation)})^(${i.years}+k), k=0..${i.duration - 1} = ${man(r.future)}`, `한 달 저축액 = 필요한 돈 × r ÷ ((1+r)^${i.years * 12} − 1), r=${pct(i.ret)}/12 = ${man(r.monthly)}`]} next={[{ href: "/ko/compound-interest-calculator/", label: "복리" }]} />;
      }}
    />
  );
}

function Jeonse() {
  const KEYS = ["price", "deposit", "debt"] as const;
  type K = (typeof KEYS)[number];
  const f = (i: JeonseLite, edit: (p: Partial<JeonseLite>, k: K[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <MoneyField label="집값(시세)" value={i.price} onChange={(v) => edit({ price: v }, ["price"])} />
      <MoneyField label="내 전세 보증금" value={i.deposit} onChange={(v) => edit({ deposit: v }, ["deposit"])} />
      <MoneyField label="선순위 대출(근저당)" value={i.debt} onChange={(v) => edit({ debt: v }, ["debt"])} />
    </div>
  );
  return (
    <ScenarioTool<JeonseLite, K>
      toolId="life-planning-jeonse"
      example={{ price: 300000000, deposit: 200000000, debt: 50000000 }}
      assumptions={JEONSE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={jeonseRatio}
      resultName="집값 대비 비율"
      formatResult={pct}
      questions={({ input, edit }) => [{ title: "집값과 보증금, 대출을 알려 주세요", keys: [...KEYS], body: (
        <>
          {f(input, edit)}
          <p className="mt-2 text-xs text-muted-foreground">선순위 대출은 등기부등본 을구의 채권최고액을 넣으세요.</p>
        </>
      ) }]}
      expert={({ input, edit }) => f(input, edit)}
      summary={jeonsePlain}
      metrics={(i) => [
        { label: "집값 대비", value: pct(jeonseRatio(i)), tone: "primary" },
        { label: "판정", value: jeonseBand(jeonseRatio(i)) },
        { label: "보증금+대출", value: man(i.deposit + i.debt) },
      ]}
      sliders={["price", "deposit", "debt"]}
      sweepCaption={(a) => (a.key === "price" ? "집값이 내려가면 비율이 올라가요. 70%·80%·90%가 경계예요." : undefined)}
      charts={(i) => (
        <CompareBars
          title="집값이 떨어지면"
          caption="보증금+선순위 대출이 집값의 몇 %가 되는지 봤어요."
          items={[0, 0.1, 0.2, 0.3].map((d) => ({ label: d === 0 ? "지금 시세" : `${Math.round(d * 100)}% 하락`, value: jeonseRatio({ ...i, price: i.price * (1 - d) }), current: d === 0 }))}
          format={pct}
        />
      )}
      askTitle="계약 전에 확인할 것"
      ask={["등기부등본(근저당·압류·신탁), 집주인 국세·지방세 체납 여부를 확인하세요.", "전입신고와 확정일자를 잔금일에 바로 받으세요.", "전세보증금 반환보증 가입 가능 여부를 계약 전에 확인하세요."]}
      expertFooter={(i) => <ResultSteps steps={[`(보증금 ${man(i.deposit)} + 선순위 ${man(i.debt)}) ÷ 집값 ${man(i.price)} = ${pct(jeonseRatio(i))}`, "70% 이하 안전한 편 · 80% 이하 주의 · 90% 이하 위험 · 그 위 매우 위험"]} next={[{ href: "/ko/jeonse-guarantee-calculator/", label: "전세보증보험" }, { href: "/ko/jeonse-vs-rent-calculator/", label: "전세 vs 월세" }]} />}
    />
  );
}

export default function LifePlanningScenario() {
  const [tab, setTab] = useState<Tab>("start");
  return (
    <div className="space-y-4">
      <ChoiceChips<Tab> legend="무엇을 계산할까요?" value={tab} options={TABS} onChange={setTab} />
      {tab === "start" ? <Start /> : tab === "edu" ? <Edu /> : <Jeonse />}
    </div>
  );
}
