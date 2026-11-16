// DCF 기업가치 (2026-11-16 쉬운 설명·가정 변화 적용). 계산: lib/kr-advisory-2026.ts, 가정·문장: lib/kr-advisory-scenarios.ts.
import { useMemo, useRef, useState } from "react";
import { dcfValuation, wacc as computeWacc, type DcfInput, type WaccInput } from "../../../lib/kr-advisory-2026";
import { DCF_ASSUMPTIONS, dcfBridge, dcfPerShare, dcfPlain } from "../../../lib/kr-advisory-scenarios";
import { compactWon, tornado } from "../../../lib/scenario";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import AssumptionPanel from "../viz/AssumptionPanel";
import BridgeChart from "../viz/BridgeChart";
import HeatmapChart from "../viz/HeatmapChart";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import PlainSummary, { ReasonList } from "../viz/PlainSummary";
import QuestionStepper, { type Question } from "../viz/QuestionStepper";
import SweepPanel from "../viz/SweepPanel";
import Term from "../viz/Term";
import TornadoChart from "../viz/TornadoChart";
import { roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { useScenario } from "../viz/useScenario";
import { eok, pct, won } from "./fmt";

const TOOL_ID = "dcf-valuation-calculator";
const EXAMPLE: DcfInput = {
  revenue0: 10_000_000_000, growth: 0.1, ebitMargin: 0.12, taxRate: 0.22, daRatio: 0.03, capexRatio: 0.04, nwcRatio: 0.15,
  wacc: 0.1, terminalGrowth: 0.02, netDebt: 2_000_000_000, shares: 1_000_000, years: 5, midYear: false,
};
const KEYS = ["revenue0", "growth", "ebitMargin", "taxRate", "daRatio", "capexRatio", "nwcRatio", "wacc", "terminalGrowth", "netDebt", "shares", "midYear"] as const;
type Key = (typeof KEYS)[number];
const pick = (...keys: string[]) => DCF_ASSUMPTIONS.filter((a) => keys.includes(a.key));

type WaccMode = "direct" | "build";
const WACC_MODES = [
  { value: "direct", label: "WACC 직접 입력" },
  { value: "build", label: "CAPM으로 WACC 계산" },
] as const satisfies readonly { value: WaccMode; label: string }[];
type Timing = "end" | "mid";
const TIMING = [
  { value: "end", label: "기말 할인" },
  { value: "mid", label: "기중 할인" },
] as const satisfies readonly { value: Timing; label: string }[];
const chips = (values: number[], suffix = "%") => values.map((v) => ({ value: String(v), label: `${Math.round(v * 1000) / 10}${suffix}` }));
const GROWTH = chips([0, 0.05, 0.1, 0.2]);
const MARGIN = chips([0.05, 0.1, 0.15, 0.25]);
const RETURN = chips([0.08, 0.1, 0.12, 0.15]);
const DEFAULT_CAPM: Omit<WaccInput, "taxRate"> = { riskFree: 0.03, beta: 1.1, marketPremium: 0.06, sizePremium: 0.03, preTaxCostOfDebt: 0.055, debtWeight: 0.3 };

export default function DcfValuation() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const s = useScenario<DcfInput, Key>(TOOL_ID, EXAMPLE, DCF_ASSUMPTIONS, KEYS);
  const { input, edit } = s;
  const [waccMode, setWaccMode] = useState<WaccMode>("direct");
  const [capm, setCapm] = useState(DEFAULT_CAPM);
  const resultRef = useRef<HTMLDivElement>(null);
  const easy = mode === "easy";
  const pctField = (key: Key, v: number) => edit({ [key]: v / 100 } as Partial<DcfInput>, [key]);

  const w = computeWacc({ ...capm, taxRate: input.taxRate });
  const setCapmField = (patch: Partial<typeof capm>) => {
    const next = { ...capm, ...patch };
    setCapm(next);
    edit({ wacc: computeWacc({ ...next, taxRate: input.taxRate }).wacc }, ["wacc"]);
  };
  const chooseWaccMode = (m: WaccMode) => {
    setWaccMode(m);
    if (m === "build") edit({ wacc: w.wacc }, ["wacc"]);
  };
  const slide = (key: string, v: number) => {
    if (key === "wacc") setWaccMode("direct");
    s.slide(key, v);
  };

  const r = dcfValuation(input);
  const bars = useMemo(() => tornado(input, DCF_ASSUMPTIONS, dcfPerShare), [input]);
  const plain = dcfPlain(r, bars[0]);
  const waccSteps = [-0.01, -0.005, 0, 0.005, 0.01].map((d) => input.wacc + d);
  const growthSteps = [-0.01, -0.005, 0, 0.005, 0.01].map((d) => input.terminalGrowth + d);

  const questions: Question<Key>[] = [
    {
      title: "작년 매출과 내년 성장은 어느 정도인가요?",
      keys: ["revenue0", "growth"],
      body: (
        <div className="grid gap-4">
          <MoneyField label="작년 매출" value={input.revenue0} onChange={(v) => edit({ revenue0: v }, ["revenue0"])} />
          <ChoiceChips legend="내년 매출은 얼마나 늘까요? (5년에 걸쳐 먼 미래 성장률로 줄어들어요)" value={String(input.growth)} options={GROWTH} onChange={(v) => edit({ growth: Number(v) }, ["growth"])} />
        </div>
      ),
    },
    {
      title: "매출 100원 중 본업으로 몇 원을 남기나요?",
      keys: ["ebitMargin"],
      body: (
        <>
          <p className="text-sm leading-6 text-muted-foreground">
            <Term k="영업이익률">영업이익률</Term>이에요. 손익계산서의 영업이익 ÷ 매출이에요.
          </p>
          <div className="mt-3">
            <ChoiceChips legend="영업이익률" value={String(input.ebitMargin)} options={MARGIN} onChange={(v) => edit({ ebitMargin: Number(v) }, ["ebitMargin"])} />
          </div>
        </>
      ),
    },
    {
      title: "이 회사에 투자한다면 해마다 몇 %는 벌어야 할까요?",
      keys: ["wacc"],
      body: (
        <>
          <p className="text-sm leading-6 text-muted-foreground">
            미래 돈을 오늘 값으로 바꾸는 <Term k="할인율">할인율</Term>이에요. 작고 위험한 회사일수록 높게 잡아요. 상장 대기업은 8% 안팎, 비상장 중소기업은 12~15%를 흔히 써요.
          </p>
          <div className="mt-3">
            <ChoiceChips legend="바라는 연 수익률" value={String(input.wacc)} options={RETURN} onChange={(v) => edit({ wacc: Number(v) }, ["wacc"])} />
          </div>
        </>
      ),
    },
    {
      title: "회사 빚과 주식 수는요?",
      keys: ["netDebt", "shares"],
      body: (
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="빚 − 가진 현금(현금이 더 많으면 −로)" value={input.netDebt} onChange={(v) => edit({ netDebt: v }, ["netDebt"])} allowNegative />
          <NumberField label="주식 수" value={input.shares} onChange={(v) => edit({ shares: v }, ["shares"])} suffix="주" step={10_000} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      {easy ? (
        <QuestionStepper questions={questions} onUnknown={s.keepAsGuess} resultRef={resultRef} />
      ) : (
        <section aria-label="입력" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="직전 연도 매출" value={input.revenue0} onChange={(v) => edit({ revenue0: v }, ["revenue0"])} />
            <NumberField label="1년차 매출성장률(5년차에 영구성장률로 수렴)" value={round1(input.growth * 100)} onChange={(v) => pctField("growth", v)} suffix="%" step={0.5} min={-100} />
            <NumberField label="영업이익률(EBIT)" value={round1(input.ebitMargin * 100)} onChange={(v) => pctField("ebitMargin", v)} suffix="%" step={0.5} min={-100} />
            <NumberField label="유효 법인세율(지방세 포함)" value={round1(input.taxRate * 100)} onChange={(v) => pctField("taxRate", v)} suffix="%" step={0.1} />
            <NumberField label="감가상각비 / 매출" value={round1(input.daRatio * 100)} onChange={(v) => pctField("daRatio", v)} suffix="%" step={0.5} />
            <NumberField label="자본적 지출 / 매출" value={round1(input.capexRatio * 100)} onChange={(v) => pctField("capexRatio", v)} suffix="%" step={0.5} />
            <NumberField label="순운전자본 / 매출 증가분" value={round1(input.nwcRatio * 100)} onChange={(v) => pctField("nwcRatio", v)} suffix="%" step={1} min={-100} />
            <NumberField label="영구성장률" value={round1(input.terminalGrowth * 100)} onChange={(v) => pctField("terminalGrowth", v)} suffix="%" step={0.1} min={-5} />
            <MoneyField label="순차입금(차입금 − 현금)" value={input.netDebt} onChange={(v) => edit({ netDebt: v }, ["netDebt"])} allowNegative />
            <NumberField label="발행주식수" value={input.shares} onChange={(v) => edit({ shares: v }, ["shares"])} suffix="주" step={10_000} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceChips<WaccMode> legend="할인율" value={waccMode} options={WACC_MODES} onChange={chooseWaccMode} />
            <ChoiceChips<Timing> legend="현금흐름 시점" value={input.midYear ? "mid" : "end"} options={TIMING} onChange={(v) => edit({ midYear: v === "mid" }, ["midYear"])} />
          </div>
          {waccMode === "direct" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="WACC" value={round1(input.wacc * 100)} onChange={(v) => pctField("wacc", v)} suffix="%" step={0.1} />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberField label="무위험이자율(국고채)" value={round1(capm.riskFree * 100)} onChange={(v) => setCapmField({ riskFree: v / 100 })} suffix="%" step={0.1} />
              <NumberField label="베타" value={capm.beta} onChange={(v) => setCapmField({ beta: v })} step={0.05} />
              <NumberField label="시장위험프리미엄" value={round1(capm.marketPremium * 100)} onChange={(v) => setCapmField({ marketPremium: v / 100 })} suffix="%" step={0.1} />
              <NumberField label="규모·비상장 프리미엄" value={round1(capm.sizePremium * 100)} onChange={(v) => setCapmField({ sizePremium: v / 100 })} suffix="%" step={0.5} />
              <NumberField label="세전 타인자본비용" value={round1(capm.preTaxCostOfDebt * 100)} onChange={(v) => setCapmField({ preTaxCostOfDebt: v / 100 })} suffix="%" step={0.1} />
              <NumberField label="부채 비중 D/(D+E)" value={round1(capm.debtWeight * 100)} onChange={(v) => setCapmField({ debtWeight: v / 100 })} suffix="%" step={5} />
            </div>
          )}
        </section>
      )}

      <div ref={resultRef} className="scroll-mt-4 space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <PlainSummary headline={plain.headline} driver={plain.driver} hasExample={s.hasExample} hasGuess={s.hasGuess} />
        {r.valid && (
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">기업가치(EV)</dt>
              <dd className="font-mono text-xl font-bold text-foreground">{eok(r.enterprise)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">주주가치</dt>
              <dd className="font-mono text-xl font-bold text-foreground">{eok(r.equity)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">1주당 가치</dt>
              <dd className="font-mono text-xl font-bold text-primary">{easy ? roughWon(r.perShare) : won(r.perShare)}</dd>
            </div>
          </dl>
        )}
        <ReasonList reasons={plain.reasons} />

        <AssumptionPanel assumptions={pick("growth", "ebitMargin", "wacc", "terminalGrowth")} input={input} anchors={s.anchors} tags={s.tags} mode={mode} onSlide={slide} />
        <SweepPanel
          options={pick("wacc", "growth", "ebitMargin", "terminalGrowth")}
          input={input}
          anchors={s.anchors}
          evaluate={dcfPerShare}
          mode={mode}
          resultName="1주당 가치"
          formatY={roughWon}
          onSlide={slide}
          caption={(a) => (a.key === "wacc" || a.key === "terminalGrowth" ? "할인율이 먼 미래 성장률에 가까워질수록 값이 급하게 커져요. 할인율이 성장률 이하면 계산할 수 없어요." : undefined)}
        />
        {r.valid && (
          <>
            <HeatmapChart
              title="할인율과 먼 미래 성장률을 함께 바꾸면"
              caption="가운데 테두리 칸이 지금 값이에요. 두 가정이 0.5%p씩만 바뀌어도 1주당 가치가 크게 달라져요."
              rows={waccSteps}
              cols={growthSteps}
              cell={(rw, cg) => dcfPerShare({ ...input, wacc: rw, terminalGrowth: cg })}
              rowLabel={easy ? "할인율" : "WACC"}
              colLabel={easy ? "먼 미래 성장률" : "영구성장률"}
              formatRow={(v) => pct(v)}
              formatCol={(v) => pct(v)}
              formatCell={compactWon}
              current={[2, 2]}
            />
            <BridgeChart
              title="회사 가치는 이렇게 더해져요"
              caption={easy ? "해마다 벌 현금을 오늘 값으로 바꿔 더하고, 5년 뒤 전부를 한꺼번에 더한 뒤 빚을 빼요." : "FCFF 현재가치 + 잔존가치 현재가치 = EV, EV − 순차입금 = 주주가치"}
              steps={dcfBridge(input, r)}
              format={easy ? roughWon : eok}
            />
            <TornadoChart bars={bars} mode={mode} format={roughWon} />
            {!easy && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-130 text-right font-mono text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="text-left">연도</th>
                      <th>성장률</th>
                      <th>매출</th>
                      <th>NOPAT</th>
                      <th>FCFF</th>
                      <th>현재가치</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.rows.map((row) => (
                      <tr key={row.year} className="border-t border-border">
                        <td className="text-left">{row.year}년차</td>
                        <td>{pct(row.growth)}</td>
                        <td>{eok(row.revenue)}</td>
                        <td>{eok(row.nopat)}</td>
                        <td>{eok(row.fcff)}</td>
                        <td>{eok(row.pv)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {easy ? (
          <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
            <Term k="현금흐름할인">DCF</Term>는 가정에 따라 값이 크게 바뀌는 추정이에요. <Term k="잔존가치">잔존가치</Term>와 <Term k="영구성장률">영구성장률</Term>을 눌러 뜻을 확인해 보세요. 세금 신고용 주식 값은 <a className="underline" href="/ko/unlisted-share-valuation-calculator/">비상장주식 평가</a>로 따로 구해요.
          </p>
        ) : (
          <ResultSteps
            steps={[
              waccMode === "build" ? `자기자본비용 = ${pct(capm.riskFree)} + ${capm.beta} × ${pct(capm.marketPremium)} + ${pct(capm.sizePremium)} = ${pct(w.costOfEquity)}, 세후 타인자본비용 ${pct(w.afterTaxDebt)} → WACC ${pct(w.wacc, 2)}` : `WACC ${pct(input.wacc, 2)} 직접 입력`,
              "FCFF = EBIT × (1 − 세율) + 감가상각비 − 자본적 지출 − 순운전자본 증가",
              r.valid ? `5년 현금흐름 현재가치 합 ${eok(r.pvSum)} + 잔존가치 현재가치 ${eok(r.terminalPv)} (EV의 ${pct(r.terminalShare || 0)})` : "WACC가 영구성장률보다 커야 잔존가치를 계산할 수 있어요.",
              `주주가치 = EV − 순차입금 ${eok(input.netDebt)}. 비영업자산·소수지분·스톡옵션은 따로 조정해야 해요.`,
              "세법상 비상장주식 평가는 DCF가 아니라 보충적 평가(순손익·순자산 가중)가 원칙이에요. 평가심의위원회 심의 때 DCF를 쓸 수 있어요(시행령 제54조 제6항).",
            ]}
            next={[
              { href: "/ko/unlisted-share-valuation-calculator/", label: "상증법 비상장주식 평가" },
              { href: "/ko/present-value-calculator/", label: "현재가치 계산" },
            ]}
          />
        )}
      </div>
    </div>
  );
}

const round1 = (v: number) => Math.round(v * 10) / 10;
