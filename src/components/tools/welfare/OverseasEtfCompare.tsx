// 해외주식 직접 vs 국내 상장 해외ETF vs ISA 세금 비교 (2026-11-16, Gemini 이전 B 3차). 계산: lib/kr-household-tax-2026.ts overseasCompare.
import { HOUSEHOLD_TAX_AS_OF, overseasCompare, type OverseasCompareInput } from "../../../lib/kr-household-tax-2026";
import { OVERSEAS_ASSUMPTIONS, overseasGap } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "overseas-stock-vs-etf-tax-calculator";
const EXAMPLE: OverseasCompareInput = { gain: 15_000_000, otherFinancial: 3_000_000, marginalRate: 0.264, isaLowIncome: false };
const LABEL = { direct: "해외주식 직접", etf: "국내 상장 해외ETF", isa: "ISA 안에서 해외ETF" } as const;

export default function OverseasEtfCompare() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<OverseasCompareInput>("household-overseas-etf", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<OverseasCompareInput>) => setInput({ ...input, ...p });
  const r = overseasCompare(input);

  const reasons: string[] = [
    `해외주식을 직접 사고팔면 이익에서 250만 원을 빼고 22%(지방세 포함)를 내요: ${roughWon(r.direct)}. 다른 소득과 합치지 않아요.`,
    `국내 증권시장에 상장된 해외ETF는 팔 때 이익의 15.4%를 떼요: ${roughWon(r.etf)}.${r.comprehensive ? ` 이자·배당과 합쳐 2천만 원을 넘어 종합과세로 약 ${roughWon(r.etfExtra)}을 더 내요.` : ""}`,
    `ISA 계좌 안에서 사면 ${input.isaLowIncome ? "400만" : "200만"} 원까지 비과세, 넘는 몫은 9.9%라 ${roughWon(r.isa)}이에요(3년 유지, 연 2천만 원 납입 한도).`,
    `이익이 약 ${roughWon(r.breakEven)}보다 적으면 직접 투자(250만 원 공제)가, 크면 ETF(15.4%)가 유리해요. 종합과세에 걸리면 다시 직접 투자 쪽으로 기울어요.`,
  ];

  const memo = () =>
    [
      `[해외주식 직접 vs 국내 상장 해외ETF] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `매매차익 ${exactWon(input.gain)}, 다른 금융소득 ${exactWon(input.otherFinancial ?? 0)}`,
      `직접 ${exactWon(r.direct)} / ETF ${exactWon(r.etf)}(종합과세 추가 ${exactWon(r.etfExtra)}) / ISA ${exactWon(r.isa)} → ${LABEL[r.best]}`,
      "근거: 소득세법 제17조·제94조①3호·제103조·제104조, 시행령 제26조의2, 조특법 제91조의18. 손실 통산·환차손익·해외 배당 원천징수는 넣지 않았어요.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "올해 팔아서 번 돈(이익)" : "연간 실현 매매차익"} value={input.gain} onChange={(v) => edit({ gain: v })} />
          <MoneyField label={easy ? "올해 예금 이자·배당 합계" : "다른 이자·배당소득"} value={input.otherFinancial ?? 0} onChange={(v) => edit({ otherFinancial: v })} hint="ETF 이익과 합쳐 2천만 원을 넘으면 종합과세" />
          {!easy && <NumberField label="종합과세 한계세율(지방세 포함)" value={Math.round((input.marginalRate ?? 0.264) * 1000) / 10} onChange={(v) => edit({ marginalRate: Math.min(100, Math.max(0, v)) / 100 })} suffix="%" step={0.1} />}
          {!easy && <ChoiceChips<"yes" | "no"> legend="ISA 서민형·농어민형인가요?" value={input.isaLowIncome ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ isaLowIncome: v === "yes" })} />}
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={`이 이익이면 ${LABEL[r.best]} 쪽이 세금이 가장 적어요(추정).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "직접 투자", value: money(r.direct) },
            { label: "국내 상장 ETF", value: money(r.etf) },
            { label: "ISA", value: money(r.isa) },
          ]}
        >
          <CompareBars
            title="같은 이익의 세금"
            items={(["direct", "etf", "isa"] as const).map((id) => ({ label: LABEL[id], value: r[id], current: r.best === id }))}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={OVERSEAS_ASSUMPTIONS}
          evaluate={overseasGap}
          sliders={["gain"]}
          sweeps={["gain", "otherFinancial"]}
          yLabel="직접 투자 세금 − ETF 세금"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "gain" ? "0보다 위면 ETF가, 아래면 직접 투자가 유리해요. 약 833만 원에서 갈리고, 2천만 원을 넘어 종합과세가 붙으면 다시 내려가요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 활용해요"
            items={[
              "해외주식은 해마다 250만 원 공제를 쓰도록 이익을 나눠 실현하고, 손실 난 종목은 같은 해에 팔아 이익과 상계해요.",
              "국내 상장 해외ETF는 ISA·연금저축·IRP 안에서 사면 세금을 미루거나 줄일 수 있어요.",
              "해외주식 양도세는 다음 해 5월에 직접 신고해요(증권사 대행 신청 가능).",
            ]}
            note="법령 정보이며 투자·세무 자문이 아니에요. 환율, 해외 배당 원천징수, 손실 통산은 넣지 않았어요."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <CopyMemo text={memo} />
            <button type="button" onClick={reset} className="min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
              예시로 되돌리기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
