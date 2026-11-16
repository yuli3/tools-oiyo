// 오피스텔 주택 수·세금 판정 (2026-11-16, Gemini 이전 B 4차). 계산: lib/kr-household-tax-2026.ts officetelHouseCount.
import { HOUSEHOLD_TAX_AS_OF, OFFICETEL, officetelHouseCount, type OfficetelInput } from "../../../lib/kr-household-tax-2026";
import { OFFICETEL_ASSUMPTIONS, officetelExtra } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "officetel-house-count-checker";
const EXAMPLE: OfficetelInput = { price: 250_000_000, acquired: "2023-05-01", residentialUse: true, areaM2: 30, metro: true, firstSaleNew: false, otherHouses: 1, nextHomePrice: 800_000_000, nextRegulated: true };
const yn = (b: boolean) => (b ? "들어가요" : "안 들어가요");

export default function OfficetelHouseCount() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<OfficetelInput>("household-officetel", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<OfficetelInput>) => setInput({ ...input, ...p });
  const r = officetelHouseCount(input);
  const taxAsHouse = input.propertyTaxAsHouse ?? input.residentialUse;

  const reasons: string[] = [
    `오피스텔을 살 때 취득세는 주택이 아니라 4.6%(농특세·지방교육세 포함)예요: ${roughWon(r.officetelTax)}.`,
    r.smallNew
      ? "전용 60㎡ 이하·가격 기준 안의 2024-01-10~2027-12-31 신축을 처음 분양받아 소형 신축 특례로 취득세·양도세 중과·종부세 주택 수에서 빠져요. 다만 1세대1주택 비과세 판단에는 들어가요."
      : `다음 집 취득세: ${input.acquired < OFFICETEL.taxCountFrom ? "2020-08-12 전에 산 오피스텔이라 주택 수에 안 들어가요." : taxAsHouse ? "2020-08-12 이후 취득했고 재산세를 주택으로 내서 주택 수에 들어가요." : "재산세를 업무용(건축물)으로 내면 주택 수에 안 들어가요."}`,
    `양도세·종부세는 서류가 아니라 실제로 사는 곳으로 쓰는지로 봐요. 지금 입력으로는 중과·종부세 주택 수에 ${yn(r.heavyCount)}.`,
    "청약에서는 오피스텔이 주택이 아니라 무주택 자격이 그대로예요.",
  ];
  if (r.nextExtra > 0) reasons.push(`이 오피스텔 때문에 다음 집 취득세가 ${r.nextHouses}주택 기준(${(r.nextRate * 100).toFixed(1)}%)이 돼 약 ${roughWon(r.nextExtra)} 더 내요.`);

  const memo = () =>
    [
      `[오피스텔 주택 수 판정] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `취득 ${input.acquired}, ${exactWon(input.price)}, 전용 ${input.areaM2}㎡, ${input.residentialUse ? "주거용" : "업무용"}${r.smallNew ? ", 소형 신축 특례" : ""}`,
      `취득세 주택 수 ${yn(r.acquisitionCount)} / 양도세 중과·종부세 ${yn(r.heavyCount)} / 1주택 비과세 판단 ${yn(r.exemptCount)} / 청약 안 들어가요`,
      `오피스텔 취득세 ${exactWon(r.officetelTax)}, 다음 집 ${exactWon(input.nextHomePrice ?? 0)} 취득세 ${exactWon(r.nextTax)}(오피스텔 빼면 ${exactWon(r.nextTaxWithout)})`,
      "근거: 지방세법 제13조의3·시행령 제28조의4, 소득세법 제88조, 종부세법 제8조, 2024-01-10 소형 신축 특례.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "오피스텔 산 값" : "취득가액"} value={input.price} onChange={(v) => edit({ price: v })} />
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">{easy ? "산 날(잔금일)" : "취득일"}</span>
            <input type="date" value={input.acquired} onChange={(e) => edit({ acquired: e.target.value })} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
          </label>
          <ChoiceChips<"yes" | "no"> legend="사는 곳(주거)으로 쓰나요? 세입자 거주 포함" value={input.residentialUse ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ residentialUse: v === "yes", propertyTaxAsHouse: undefined })} />
          <NumberField label={easy ? "오피스텔 말고 가진 집 수" : "세대 보유 주택 수(오피스텔 제외)"} value={input.otherHouses} onChange={(v) => edit({ otherHouses: Math.max(0, Math.round(v)) })} suffix="채" />
        </div>
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceChips<"yes" | "no"> legend="재산세를 주택분으로 내나요?" value={taxAsHouse ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ propertyTaxAsHouse: v === "yes" })} />
            <NumberField label="전용면적" value={input.areaM2} onChange={(v) => edit({ areaM2: Math.max(0, v) })} suffix="㎡" />
            <ChoiceChips<"yes" | "no"> legend="수도권인가요?" value={input.metro ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ metro: v === "yes" })} />
            <ChoiceChips<"yes" | "no"> legend="2024-01-10 뒤 준공 신축을 처음 분양받았나요?" value={input.firstSaleNew ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ firstSaleNew: v === "yes" })} />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label="다음에 살 집 가격(비교용)" value={input.nextHomePrice ?? 0} onChange={(v) => edit({ nextHomePrice: v })} />
          <ChoiceChips<"yes" | "no"> legend="다음 집이 조정대상지역인가요?" value={input.nextRegulated ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ nextRegulated: v === "yes" })} />
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.acquisitionCount || r.heavyCount ? `이 오피스텔은 주택 수에 들어가요${r.nextExtra > 0 ? `. 다음 집 취득세가 약 ${roughWon(r.nextExtra)} 늘어요` : ""}(추정).` : r.exemptCount ? "중과 주택 수에서는 빠지지만, 1세대1주택 비과세 판단에는 들어가요(추정)." : "이 오피스텔은 주택 수에 들어가지 않아요(추정)."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "다음 집 취득세 주택 수", value: yn(r.acquisitionCount) },
            { label: "양도세 중과·종부세", value: yn(r.heavyCount) },
            { label: "청약 무주택", value: "유지" },
          ]}
        >
          <CompareBars
            title="다음 집 취득세"
            items={[
              { label: "오피스텔 포함", value: r.nextTax, current: r.acquisitionCount },
              { label: "오피스텔 빼면", value: r.nextTaxWithout, current: !r.acquisitionCount },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={OFFICETEL_ASSUMPTIONS}
          evaluate={officetelExtra}
          sliders={["nextHomePrice"]}
          sweeps={["nextHomePrice", "price"]}
          yLabel="오피스텔 때문에 늘어나는 다음 집 취득세"
          formatY={roughWon}
          noTornado
        />
        {easy ? (
          <HowToApply
            title="이렇게 확인해요"
            items={[
              "재산세 고지서에서 오피스텔이 '주택'인지 '건축물'인지 확인해요. 업무용으로 쓰면 구청에 과세 구분을 바꿔 달라고 할 수 있어요.",
              "세입자가 전입신고를 했다면 주거용으로 볼 가능성이 커요.",
              "다음 집을 사기 전에 오피스텔을 정리할지, 소형 신축 특례가 되는지 먼저 따져요.",
            ]}
            note="법령 정보이며 세무 자문이 아니에요. 실제 판단은 관할 구청·세무서가 해요."
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
