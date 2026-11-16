// 근로장려금·자녀장려금 (2026-11-16). 계산: lib/kr-welfare-2026.ts, 가정·문장: lib/kr-welfare-scenarios.ts.
import { useMemo } from "react";
import { WELFARE_AS_OF, eitcAmount, workChildCredit, type EitcInput, type Household } from "../../../lib/kr-welfare-2026";
import { EITC_ASSUMPTIONS, HOUSEHOLD_LABEL, eitcPlain, eitcTotal } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "work-child-incentive-calculator";
const EXAMPLE: EitcInput = { household: "oneEarner", income: 24_000_000, assets: 120_000_000, children: 1, late: false };
const HOUSEHOLDS: { value: Household; label: string }[] = [
  { value: "single", label: "혼자(배우자·부양가족 없음)" },
  { value: "oneEarner", label: "홑벌이(배우자 소득 300만 원 미만 등)" },
  { value: "twoEarner", label: "맞벌이(배우자도 300만 원 이상)" },
];
const ASSET_BANDS = [
  { value: "low", label: "1억 7천만 원 미만", v: 120_000_000 },
  { value: "mid", label: "1억 7천만 ~ 2억 4천만 원", v: 200_000_000 },
  { value: "high", label: "2억 4천만 원 이상", v: 250_000_000 },
] as const;
type AssetBand = (typeof ASSET_BANDS)[number]["value"];
const bandOf = (v: number): AssetBand => (v >= 240_000_000 ? "high" : v >= 170_000_000 ? "mid" : "low");

export default function WorkChildCredit() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<EitcInput>("welfare-eitc", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<EitcInput>) => setInput({ ...input, ...p });
  const r = workChildCredit(input);
  const plain = eitcPlain(input);
  const assumptions = useMemo(() => EITC_ASSUMPTIONS(input), [input.household, input.children]);
  const otherTypes = (["single", "oneEarner", "twoEarner"] as const).filter((h) => !(h === "single" && input.children > 0));

  const memo = () =>
    [
      `[근로·자녀장려금 추정] 기준일 ${WELFARE_AS_OF} (2025년 소득 → 2026년 신청)`,
      `${HOUSEHOLD_LABEL[r.household]}, 총소득 ${exactWon(input.income)}, 재산 ${exactWon(input.assets)}, 18세 미만 자녀 ${input.children}명${input.late ? ", 기한 후 신청" : ""}`,
      `근로장려금 ${exactWon(r.eitc)}(산정액 ${exactWon(r.eitcRaw)}), 자녀장려금 ${exactWon(r.ctc)}(1명당 ${exactWon(r.perChild)}), 합계 ${exactWon(r.total)}`,
      "근거: 조세특례제한법 제100조의3·제100조의5·제100조의28·제100조의29. 자녀세액공제와 겹치면 그만큼 빼고, 체납액은 먼저 충당돼요.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<Household> legend={easy ? "누구와 사나요?" : "가구 유형(신청연도 6월 1일 기준)"} value={input.household} options={HOUSEHOLDS} onChange={(v) => edit({ household: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "작년에 번 돈(부부 합쳐서, 세금 떼기 전)" : "부부 합산 총소득(근로 총급여·사업 총수입×조정률 등)"} value={input.income} onChange={(v) => edit({ income: v })} hint="예: 2400만" />
          <NumberField label="18세 미만 자녀 수" value={input.children} onChange={(v) => edit({ children: Math.max(0, Math.round(v)) })} suffix="명" />
        </div>
        {easy ? (
          <ChoiceChips<AssetBand> legend="집·전세금·예금·차를 모두 더한 재산은요?(빚은 빼지 않아요)" value={bandOf(input.assets)} options={ASSET_BANDS} onChange={(b) => edit({ assets: ASSET_BANDS.find((x) => x.value === b)?.v ?? 0 })} />
        ) : (
          <MoneyField label="가구원 재산 합계(작년 6월 1일 기준, 부채 미차감)" value={input.assets} onChange={(v) => edit({ assets: v })} />
        )}
        <ChoiceChips<"no" | "yes"> legend={easy ? "5월 신청 기간을 놓쳤나요?" : "기한 후 신청(6월~11월, 95%)"} value={input.late ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => edit({ late: v === "yes" })} />
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={plain.headline}
          reasons={plain.reasons}
          easy={easy}
          stats={[
            { label: "근로장려금", value: money(r.eitc) },
            { label: `자녀장려금${input.children ? ` (${input.children}명)` : ""}`, value: money(r.ctc) },
            { label: "합계", value: money(r.total) },
          ]}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={assumptions}
          evaluate={eitcTotal}
          sliders={["income"]}
          sweeps={["income", "assets"]}
          yLabel="받는 돈"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "income" ? "처음엔 벌수록 늘고, 최대액 구간을 지나면 천천히 줄어요. 점선은 구간이 바뀌는 소득이에요." : "재산은 1억 7천만 원부터 절반, 2억 4천만 원부터 0이에요.")}
        />
        <CompareBars
          title="가구 유형이 다르면 근로장려금은"
          caption="같은 소득일 때 가구 유형별 근로장려금(재산·기한 감액 전)이에요."
          items={otherTypes.map((h) => ({ label: HOUSEHOLD_LABEL[h], value: eitcAmount(h, input.income), current: h === r.household }))}
          format={money}
        />
        {easy ? (
          <HowToApply
            items={[
              "5월 1일~31일 정기 신청: 국세청 안내문(카카오톡·문자)을 받았으면 ARS 1544-9944나 손택스로 바로 신청해요.",
              "안내문이 없어도 홈택스 → 장려금·연말정산·전자기부금 → 근로·자녀장려금에서 신청할 수 있어요.",
              "근로소득만 있으면 3월·9월 반기 신청도 돼요. 놓쳤다면 11월 30일까지 기한 후 신청(95%).",
              "보통 8월 말, 반기 신청은 6월·12월에 들어와요.",
            ]}
            note="이 결과는 추정이에요. 실제 금액은 국세청이 소득·재산 자료로 다시 계산해요."
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
