// 일반과세 vs 간이과세 부가세 비교 (2026-11-16, Gemini 이전 B 2차). 계산: lib/kr-household-tax-2026.ts vatTypeCompare.
import { HOUSEHOLD_TAX_AS_OF, SIMPLIFIED_VAT, VAT_SECTOR_LABEL, vatTypeCompare, type VatSector, type VatTypeInput } from "../../../lib/kr-household-tax-2026";
import { VAT_TYPE_ASSUMPTIONS, vatSaving } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "general-vs-simplified-vat-calculator";
const EXAMPLE: VatTypeInput = { sector: "retail", sales: 80_000_000, purchases: 35_000_000, cardShare: 0.8 };
const SECTORS = (Object.keys(VAT_SECTOR_LABEL) as VatSector[]).map((value) => ({ value, label: VAT_SECTOR_LABEL[value] }));
const pct = (r: number) => `${Math.round(r * 1000) / 10}%`;

export default function VatTypeCompare() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<VatTypeInput>("household-vat-type", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<VatTypeInput>) => setInput({ ...input, ...p });
  const r = vatTypeCompare(input);

  const reasons: string[] = [];
  reasons.push(`일반과세는 매출 부가세 ${roughWon(r.outVat)}에서 매입 부가세 ${roughWon(r.inVat)}를 빼요${r.generalRefund > 0 ? `. 매입이 더 많아 약 ${roughWon(r.generalRefund)}을 돌려받아요` : ""}.`);
  reasons.push(r.exempt ? "간이과세는 1년 매출이 4,800만 원 미만이면 부가세를 내지 않아요." : `간이과세는 매출 × 업종 부가가치율 ${pct(r.rate)} × 10%에서 매입의 0.5%만 빼요. 환급은 없어요.`);
  if (r.card > 0) reasons.push(`카드·현금영수증 매출의 1.3%(${roughWon(r.card)})는 둘 다 납부세액에서 빼 줘요(연 1천만 원 한도).`);
  if (!r.simpleAllowed) reasons.push(`이 매출이면 간이과세를 쓸 수 없어요(${input.sector === "professional" ? "부동산임대 등은 4,800만 원" : "1억 400만 원"} 이상).`);
  if (!r.exempt) reasons.push("간이과세자도 매출 4,800만 원 이상이면 세금계산서를 발급해야 해요.");
  reasons.push("거래처가 세금계산서를 원하는 B2B나, 처음에 인테리어·장비 매입이 큰 업종은 일반과세가 유리할 때가 많아요.");

  const headline =
    !r.simpleAllowed ? `간이과세 대상이 아니에요. 일반과세 부가세 약 ${roughWon(Math.max(0, r.general))}${r.generalRefund > 0 ? `(환급 ${roughWon(r.generalRefund)})` : ""}.`
    : r.better === "simple" ? `간이과세가 1년 약 ${roughWon(r.saving)} 덜 내요(추정).`
    : r.better === "general" ? `일반과세가 1년 약 ${roughWon(-r.saving)} 유리해요(추정).`
    : "두 방식의 부가세가 같아요.";

  const memo = () =>
    [
      `[일반과세 vs 간이과세] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `${VAT_SECTOR_LABEL[input.sector]}, 매출(공급대가) ${exactWon(input.sales)}, 매입 ${exactWon(input.purchases)}, 카드매출 ${pct(input.cardShare ?? 0)}`,
      `일반: ${exactWon(r.outVat)} − ${exactWon(r.inVat)} − 카드 ${exactWon(Math.min(r.card, Math.max(0, r.outVat - r.inVat)))} = ${exactWon(r.general)}`,
      `간이: ${r.exempt ? "납부 면제(4,800만 미만)" : `${exactWon(input.sales)} × ${pct(r.rate)} × 10% − 매입 0.5% − 카드 = ${exactWon(r.simple)}`}`,
      "근거: 부가가치세법 제36조·제46조·제61조·제63조·제69조·제70조, 시행령 제109조·제111조.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<VatSector> legend="어떤 업종인가요?" value={input.sector} options={SECTORS} onChange={(v) => edit({ sector: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "1년 예상 매출(부가세 포함)" : "공급대가(1년)"} value={input.sales} onChange={(v) => edit({ sales: v })} hint="1억 400만 원 미만이면 간이 가능" />
          <MoneyField label={easy ? "세금계산서·카드로 산 재료·비용(1년, 부가세 포함)" : "매입(세금계산서·카드, 공급대가)"} value={input.purchases} onChange={(v) => edit({ purchases: v })} />
          <NumberField label="매출 중 카드·현금영수증 비율" value={Math.round((input.cardShare ?? 0) * 100)} onChange={(v) => edit({ cardShare: Math.min(100, Math.max(0, v)) / 100 })} suffix="%" />
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={headline}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "일반과세", value: r.general < 0 ? `환급 ${money(-r.general)}` : money(r.general) },
            { label: "간이과세", value: money(r.simple) },
            { label: "세금계산서 의무", value: r.invoiceRequired ? "있음" : "없음" },
          ]}
        >
          <CompareBars
            title="1년 부가세 비교"
            caption="일반과세가 환급이면 0으로 그렸어요."
            items={[
              { label: "일반과세", value: Math.max(0, r.general), current: r.better !== "simple" },
              { label: "간이과세", value: r.simple, current: r.better === "simple" },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={VAT_TYPE_ASSUMPTIONS}
          evaluate={vatSaving}
          sliders={["sales", "purchases"]}
          sweeps={["sales", "purchases"]}
          yLabel="간이과세로 아끼는 돈(음수면 일반이 유리)"
          formatY={roughWon}
          noTornado
          caption={(k) =>
            k === "sales" ? `매출 4,800만 원 미만은 간이 납부 면제, ${roughWon(SIMPLIFIED_VAT.threshold)}부터는 간이과세를 못 써요.` : k === "purchases" ? "매입이 많을수록 일반과세 쪽이 유리해져요. 간이는 매입의 0.5%만 빼 줘요." : undefined
          }
        />
        {easy ? (
          <HowToApply
            title="이렇게 정해요"
            items={[
              "사업자등록 때 홈택스에서 과세 유형을 골라요. 간이로 시작해도 매출이 기준을 넘으면 다음 해 7월부터 일반으로 바뀌어요.",
              "간이과세자는 1년에 한 번(1월 25일) 신고하고, 일반과세자는 반년마다(1월·7월 25일) 신고해요.",
              "간이과세를 포기하고 일반과세로 바꾸면 3년 동안 다시 간이를 쓸 수 없어요(부가가치세법 제70조). 큰 환급 한 번 때문에 포기할지는 3년치를 비교해요.",
            ]}
            note="법령 정보이며 세무 대리·자문이 아니에요. 일부 업종·지역(간이배제 기준)은 매출과 관계없이 간이를 못 써요."
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
