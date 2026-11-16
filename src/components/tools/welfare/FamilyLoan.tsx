// 가족 차용증 적정이자·증여 점검 (2026-11-16, Gemini 이전 B). 계산: lib/kr-household-tax-2026.ts familyLoanGift.
import { FAMILY_2026, HOUSEHOLD_TAX_AS_OF, familyLoanGift, type FamilyLoanInput } from "../../../lib/kr-household-tax-2026";
import { FAMILY_LOAN_ASSUMPTIONS, familyLoanAmount } from "../../../lib/kr-welfare-scenarios";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "family-loan-interest-checker";
const EXAMPLE: FamilyLoanInput = { principal: 300_000_000, rate: 0, deductionLeft: FAMILY_2026.childDeduction };
const pct = (r: number) => `${Math.round(r * 10000) / 100}%`;

export default function FamilyLoan() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<FamilyLoanInput>("household-family-loan", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<FamilyLoanInput>) => setInput({ ...input, ...p });
  const r = familyLoanGift(input);

  const reasons: string[] = [
    `세법은 가족끼리 빌려도 연 ${pct(FAMILY_2026.fairRate)} 이자를 받는 게 정상이라고 봐요. 이 원금이면 1년에 ${roughWon(r.fairInterest)}이에요.`,
    r.actualInterest > 0 ? `실제로 1년에 ${roughWon(r.actualInterest)}을 주기로 해서, 덜 낸 이자는 ${roughWon(r.benefit)}이에요.` : `이자를 안 주면 ${roughWon(r.benefit)}을 덜 낸 셈이에요.`,
    r.taxable
      ? `덜 낸 이자가 연 1천만 원 이상이라 그 ${roughWon(r.gift)} 전체를 해마다 증여로 봐요(상증법 제41조의4).${r.giftTax === 0 ? " 다만 증여재산공제 안이라 세금은 아직 0원이에요." : ""}`
      : "덜 낸 이자가 연 1천만 원 미만이라 이자 차이는 증여로 보지 않아요.",
  ];
  if (r.taxable && r.principal > 0) reasons.push(`이자율을 ${pct(r.safeRate)}보다 조금 높게 정하면 증여가 되지 않아요.`);
  reasons.push(`원금 자체는 차용증과 실제 상환 기록이 있어야 빌린 돈으로 인정돼요. 갚지 않으면 원금 ${roughWon(r.principal)}이 증여가 될 수 있어요.`);

  const memo = () =>
    [
      `[가족 차용 적정이자 점검] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `원금 ${exactWon(r.principal)}, 약정 이자율 ${pct(input.rate)}`,
      `적정이자(4.6%) ${exactWon(r.fairInterest)} − 실제 이자 ${exactWon(r.actualInterest)} = 이익 ${exactWon(r.benefit)} → ${r.taxable ? "증여(연 1천만 이상)" : "증여 아님"}`,
      `증여세 ${exactWon(r.giftTax)}(남은 공제 ${exactWon(input.deductionLeft ?? FAMILY_2026.childDeduction)}), 빌려준 사람 이자 원천세 27.5% ${exactWon(r.lenderTax)}`,
      `무이자 가능 원금 ${exactWon(r.zeroRateMaxPrincipal)} 이하, 이 원금의 안전 이자율 ${pct(r.safeRate)} 초과`,
      "근거: 상증법 제41조의4, 시행령 제31조의4, 시행규칙 제10조의5(4.6%), 소득세법 제129조(비영업대금 25%).",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "가족에게 빌리는 돈" : "차입 원금"} value={input.principal} onChange={(v) => edit({ principal: v })} hint="예: 3억" />
          <NumberField label={easy ? "1년에 주기로 한 이자율" : "약정 연 이자율"} value={Math.round(input.rate * 10000) / 100} onChange={(v) => edit({ rate: Math.max(0, v) / 100 })} suffix="%" step={0.1} />
          {!easy && <MoneyField label="받는 사람의 남은 증여재산공제(10년 합산)" value={input.deductionLeft ?? FAMILY_2026.childDeduction} onChange={(v) => edit({ deductionLeft: v })} hint="성년 자녀 5천만, 미성년 2천만, 배우자 6억" />}
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.taxable ? `덜 낸 이자 약 ${roughWon(r.gift)}이 해마다 증여로 잡혀요(추정).` : "이 조건이면 이자 차이는 증여가 아니에요(추정)."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "4.6% 이자(1년)", value: money(r.fairInterest) },
            { label: "덜 낸 이자", value: money(r.benefit) },
            { label: "증여세(1년)", value: money(r.giftTax) },
          ]}
        >
          <CompareBars
            title="1년 이자 비교"
            caption="덜 낸 이자가 1천만 원 이상이면 그 전체가 증여예요."
            items={[
              { label: "세법 적정이자 4.6%", value: r.fairInterest },
              { label: "실제 주는 이자", value: r.actualInterest, current: true },
              { label: "증여 기준 1천만", value: FAMILY_2026.loanThreshold },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={FAMILY_LOAN_ASSUMPTIONS}
          evaluate={familyLoanAmount}
          sliders={["principal", "rate"]}
          sweeps={["principal", "rate"]}
          yLabel="증여로 보는 이자(1년)"
          formatY={roughWon}
          caption={(k) =>
            k === "principal"
              ? `무이자라면 원금 약 ${roughWon(r.zeroRateMaxPrincipal)}까지는 0원, 넘는 순간 4.6% 이자 전체가 증여로 잡혀요.`
              : k === "rate"
                ? "이자율을 올릴수록 덜 낸 이자가 줄고, 1천만 원 아래로 내려가면 0이 돼요."
                : undefined
          }
        />
        {easy ? (
          <HowToApply
            title="이렇게 준비해요"
            items={[
              "차용증에 원금·이자율·갚는 날짜·방법을 쓰고 양쪽이 서명해요. 공증이나 내용증명으로 날짜를 남기면 더 좋아요.",
              "이자와 원금을 정해진 날 계좌이체로 갚고 기록을 남겨요. 현금은 증빙이 어려워요.",
              "빌려준 사람은 받은 이자에 27.5%(지방세 포함)를 원천징수해 신고해야 해요. 이자가 0원이면 낼 것도 없어요.",
              "자녀 소득으로 갚을 수 있는 금액인지도 함께 봐요. 갚을 능력이 없으면 원금 전체가 증여로 의심받아요.",
            ]}
            note="법령 정보이며 세무 대리·자문이 아니에요. 금액이 크면 세무사와 확인하세요."
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
