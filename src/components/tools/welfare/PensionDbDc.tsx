// 퇴직연금 DB형 vs DC형 (2026-11-16). 계산: lib/kr-welfare-2026.ts.
import { useMemo } from "react";
import { WELFARE_AS_OF, breakEvenReturn, dbVsDc, type PensionInput } from "../../../lib/kr-welfare-2026";
import { PENSION_ASSUMPTIONS, pensionDiff } from "../../../lib/kr-welfare-scenarios";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import SweepChart from "../viz/SweepChart";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "retirement-pension-db-dc-calculator";
const EXAMPLE: PensionInput = { monthlyWage: 4_000_000, yearsServed: 5, yearsLeft: 20, wageGrowth: 0.03, dcReturn: 0.04 };
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function PensionDbDc() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<PensionInput>("welfare-pension", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<PensionInput>) => setInput({ ...input, ...p });
  const r = dbVsDc(input);
  const be = useMemo(() => breakEvenReturn(input), [input.monthlyWage, input.yearsServed, input.yearsLeft, input.wageGrowth]);
  const better = r.better === "dc" ? "DC형(직접 굴리기)" : "DB형(회사가 책임)";
  const reasons = [
    `DB형은 퇴직 직전 월급 × 근속연수예요. 월급이 해마다 ${pct(input.wageGrowth)} 오르면 퇴직 때 월급은 약 ${roughWon(r.finalWage)}이에요.`,
    `DC형은 해마다 월급 한 달 치를 넣고 ${pct(input.dcReturn)}로 굴린다고 봤어요.`,
    `연 수익률이 약 ${pct(be)}보다 높으면 DC형, 낮으면 DB형이 유리해요.`,
  ];
  if (input.yearsLeft <= 3) reasons.push("퇴직이 가까우면 굴릴 시간이 짧아 DB형이 대체로 안전해요. 한번 DC로 바꾸면 DB로 돌아가기 어려워요.");
  const dcPts = r.series.map((s) => ({ x: s.year, y: s.dc }));

  const memo = () =>
    [
      `[퇴직연금 DB vs DC 추정] 기준일 ${WELFARE_AS_OF}`,
      `월 평균임금 ${exactWon(input.monthlyWage)}, 근속 ${input.yearsServed}년, 남은 ${input.yearsLeft}년, 임금상승 ${pct(input.wageGrowth)}, DC 수익률 ${pct(input.dcReturn)}`,
      `DB ${exactWon(r.db)} vs DC(지금 전환) ${exactWon(r.dc)} → ${better} ${exactWon(Math.abs(r.diff))} 유리, 손익분기 수익률 ${pct(be)}`,
      "근거: 근로자퇴직급여 보장법 제13조·제20조. 세전·명목, 수수료는 수익률에서 뺀 값으로 가정. 퇴직소득세는 같은 금액이면 같아요.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="grid gap-3 sm:grid-cols-3">
        <MoneyField label={easy ? "지금 한 달 월급(세금 떼기 전, 상여 포함 평균)" : "현재 월 평균임금"} value={input.monthlyWage} onChange={(v) => edit({ monthlyWage: v })} />
        <NumberField label={easy ? "지금까지 다닌 햇수" : "현재 근속연수"} value={input.yearsServed} onChange={(v) => edit({ yearsServed: Math.max(0, v) })} suffix="년" step={0.5} />
        <NumberField label={easy ? "앞으로 더 다닐 햇수" : "퇴직까지 남은 연수"} value={input.yearsLeft} onChange={(v) => edit({ yearsLeft: Math.max(0, Math.round(v)) })} suffix="년" />
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={`지금 가정이면 ${better}이 퇴직 때 약 ${roughWon(Math.abs(r.diff))} 더 많아요(추정).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "DB형 (그대로)", value: money(r.db) },
            { label: "DC형 (지금 바꾸면)", value: money(r.dc) },
            { label: "갈림길 수익률", value: pct(be) },
          ]}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={PENSION_ASSUMPTIONS}
          evaluate={pensionDiff}
          sliders={["wageGrowth", "dcReturn"]}
          sweeps={["dcReturn", "wageGrowth", "yearsLeft"]}
          yLabel="DC − DB"
          formatY={roughWon}
          caption={(k) => (k === "dcReturn" ? "0보다 위면 DC형이 유리해요. 선이 0을 지나는 곳이 갈림길 수익률이에요." : k === "wageGrowth" ? "월급이 빨리 오를수록 DB형이 유리해져요." : "오래 다닐수록 두 방식의 차이가 커져요.")}
        />
        <SweepChart
          title="DC형 적립금이 쌓이는 모습"
          caption={`지금 DC형으로 바꾸면 적립금이 해마다 이렇게 쌓여요. DB형은 퇴직 때 한 번에 ${roughWon(r.db)}이에요.`}
          points={dcPts}
          current={{ x: input.yearsLeft, y: r.dc }}
          formatX={(v) => `${Math.round(v)}년 뒤`}
          formatY={roughWon}
          xLabel="지금부터"
          yLabel="DC형 적립금"
        />
        <CompareBars
          title="퇴직할 때"
          items={[
            { label: "DB형", value: r.db, current: r.better === "db" },
            { label: "DC형", value: r.dc, current: r.better === "dc" },
          ]}
          format={money}
        />
        {easy ? (
          <HowToApply
            title="바꾸기 전에 확인해요"
            items={[
              "회사 퇴직연금 규약에 DB→DC 전환이 있는지 인사팀에 물어요. 보통 DC에서 DB로는 돌아갈 수 없어요.",
              "임금피크제가 있거나 월급이 곧 줄어들 예정이면, 줄기 전에 DC로 바꾸는 게 유리할 수 있어요.",
              "DC형은 운용을 직접 골라야 해요. 원리금보장 상품만 고르면 수익률이 낮아 DB보다 불리할 수 있어요.",
            ]}
            note="세전·명목 금액 추정이에요. 실제 DB 금액은 퇴직 전 3개월 평균임금으로 정해요."
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
