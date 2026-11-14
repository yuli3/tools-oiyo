import { useState } from "react";
import { ACQUISITION_RELIEF_UNTIL, incorporationConversion, type ConversionBusiness } from "../../../lib/kr-advisory-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import { pct, won } from "./fmt";

const BUSINESS = [
  { value: "general", label: "일반 업종(제조·도소매·서비스 등)" },
  { value: "realEstateRental", label: "부동산임대·공급업" },
  { value: "consumptionService", label: "소비성서비스업(숙박·주점 등)" },
] as const satisfies readonly { value: ConversionBusiness; label: string }[];

export default function IncorporationConversion() {
  const [business, setBusiness] = useState<ConversionBusiness>("general");
  const [market, setMarket] = useState(1_000_000_000);
  const [cost, setCost] = useState(400_000_000);
  const [holdYears, setHoldYears] = useState(10);
  const [otherAssets, setOtherAssets] = useState(300_000_000);
  const [liabilities, setLiabilities] = useState(500_000_000);
  const [acqBase, setAcqBase] = useState(0);

  const r = incorporationConversion({ business, realEstateMarket: market, realEstateCost: cost, holdYears, otherAssets, liabilities, acquisitionBase: acqBase });

  return (
    <div>
      <ChoiceChips legend="업종" value={business} options={BUSINESS} onChange={setBusiness} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <NumberField label="사업용 부동산 시가(주택 제외)" value={market} onChange={setMarket} suffix="원" step={10_000_000} />
        <NumberField label="그 부동산 취득가액 + 필요경비" value={cost} onChange={setCost} suffix="원" step={10_000_000} />
        <NumberField label="부동산 보유 기간" value={holdYears} onChange={setHoldYears} suffix="년" step={1} />
        <NumberField label="부동산 외 사업용 자산 시가" value={otherAssets} onChange={setOtherAssets} suffix="원" step={10_000_000} />
        <NumberField label="사업 관련 부채" value={liabilities} onChange={setLiabilities} suffix="원" step={10_000_000} />
        <NumberField label="취득세 과세표준(0이면 시가)" value={acqBase} onChange={setAcqBase} suffix="원" step={10_000_000} />
      </div>

      <div aria-live="polite" className="mt-5 rounded-md border border-border bg-background px-4 py-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-muted-foreground">새 법인 최소 자본금</dt><dd className="font-mono text-xl font-bold text-foreground">{won(r.minCapital)}</dd></div>
          <div><dt className="text-muted-foreground">이월과세로 미루는 양도세</dt><dd className="font-mono text-xl font-bold text-foreground">{won(r.deferred)}</dd></div>
          <div><dt className="text-muted-foreground">취득세 감면(농특세 차감 후)</dt><dd className="font-mono text-xl font-bold text-primary">{won(r.relief - r.ruralOnRelief)}</dd></div>
        </dl>
        {!r.rolloverEligible && <p className="mt-3 text-sm font-semibold text-foreground">소비성서비스업은 양도세 이월과세와 취득세 감면을 받을 수 없어요.</p>}
        {business === "realEstateRental" && <p className="mt-3 text-sm font-semibold text-foreground">부동산임대·공급업은 취득세 감면에서 빠져요. 양도세 이월과세는 받을 수 있지만 주택은 대상이 아니에요.</p>}
        <ResultSteps
          steps={[
            `순자산가액 = 부동산 ${won(market)} + 기타 자산 ${won(otherAssets)} − 부채 ${won(liabilities)} = ${won(r.netAssets)} → 자본금이 이 금액 이상이어야 해요(영업권 제외).`,
            `양도차익 ${won(r.gain)} − 장기보유특별공제 ${pct(r.longTermRate, 0)} ${won(r.longTerm)} − 기본공제 250만 = 과세표준 ${won(r.base)}`,
            `양도소득세 ${won(r.cgt)} + 지방소득세 ${won(r.cgtLocal)} = ${won(r.cgtTotal)}${r.rolloverEligible ? " → 개인이 내지 않고 법인이 나중에 그 부동산을 팔 때 법인세로 내요." : ""}`,
            `취득세 본세 ${won(r.acqBase)} × 4% = ${won(r.acquisitionTax)}${r.reliefEligible ? ` → 50% 감면 ${won(r.relief)}, 감면분 농특세 20% ${won(r.ruralOnRelief)}` : ""}`,
            `감면은 ${ACQUISITION_RELIEF_UNTIL} 취득분까지예요. 지방교육세·농특세(10%)·과밀억제권역 중과·국민주택채권·등기비용은 넣지 않았어요.`,
            "5년 안에 사업을 폐지하거나 받은 주식의 50% 이상을 처분하면 미룬 양도세를 개인이 내야 하고, 취득세도 추징될 수 있어요.",
          ]}
          next={[
            { href: "/ko/incorporation-calculator/", label: "개인 vs 법인 연간 세금" },
            { href: "/ko/capital-gains-tax-calculator/", label: "양도소득세 계산" },
          ]}
        />
      </div>
    </div>
  );
}
