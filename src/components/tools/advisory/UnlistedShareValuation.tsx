import { useState } from "react";
import { valueUnlistedShares } from "../../../lib/kr-advisory-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import { won } from "./fmt";

type YesNo = "no" | "yes";
const YES_NO = [
  { value: "no", label: "아니요" },
  { value: "yes", label: "예" },
] as const satisfies readonly { value: YesNo; label: string }[];
const CLASS_LABEL = { general: "일반법인 (순손익 3 : 순자산 2)", realEstateHeavy: "부동산과다법인 (순손익 2 : 순자산 3)", netAssetOnly: "순자산가치만 평가" } as const;

export default function UnlistedShareValuation() {
  const [shares, setShares] = useState(100_000);
  const [y1, setY1] = useState(600_000_000);
  const [y2, setY2] = useState(500_000_000);
  const [y3, setY3] = useState(400_000_000);
  const [netAssets, setNetAssets] = useState(3_000_000_000);
  const [goodwill, setGoodwill] = useState(0);
  const [rePct, setRePct] = useState(20);
  const [held, setHeld] = useState(60_000);
  const [netOnly, setNetOnly] = useState<YesNo>("no");
  const [majority, setMajority] = useState<YesNo>("yes");
  const [exempt, setExempt] = useState<YesNo>("yes");

  const r = valueUnlistedShares({
    sharesOutstanding: shares, netIncome: [y1, y2, y3], netAssets, goodwill, realEstateRatio: rePct / 100,
    netAssetOnlyReason: netOnly === "yes", heldShares: held, isMajorityHolder: majority === "yes", premiumExempt: exempt === "yes",
  });

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="발행주식총수(자기주식 제외)" value={shares} onChange={setShares} suffix="주" step={1000} />
        <NumberField label="평가할 보유 주식 수" value={held} onChange={setHeld} suffix="주" step={1000} />
        <NumberField label="최근 1년 순손익액(직전 사업연도)" value={y1} onChange={setY1} suffix="원" step={10_000_000} min={-1e13} />
        <NumberField label="2년 전 순손익액" value={y2} onChange={setY2} suffix="원" step={10_000_000} min={-1e13} />
        <NumberField label="3년 전 순손익액" value={y3} onChange={setY3} suffix="원" step={10_000_000} min={-1e13} />
        <NumberField label="평가기준일 순자산가액(상증법 시가 기준)" value={netAssets} onChange={setNetAssets} suffix="원" step={100_000_000} min={-1e13} />
        <NumberField label="영업권 평가액(시행령 제59조, 없으면 0)" value={goodwill} onChange={setGoodwill} suffix="원" step={10_000_000} />
        <NumberField label="자산 중 부동산 등 비율" value={rePct} onChange={setRePct} suffix="%" step={1} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <ChoiceChips legend="순자산가치만 평가하는 법인인가요?" value={netOnly} options={YES_NO} onChange={setNetOnly} />
        <ChoiceChips legend="최대주주 등인가요?" value={majority} options={YES_NO} onChange={setMajority} />
        <ChoiceChips legend="할증 제외 대상인가요?" value={exempt} options={YES_NO} onChange={setExempt} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">순자산가치만 평가: 사업개시 3년 미만, 휴·폐업·청산 중, 주식 등 비율 80% 이상 등(시행령 제54조 제4항). 할증 제외: 중소기업, 직전 3년 평균 매출 5천억 원 미만 중견기업, 3년 연속 결손 등(시행령 제53조 제8항).</p>

      <div aria-live="polite" className="mt-5 rounded-md border border-border bg-background px-4 py-4">
        <p className="text-sm text-muted-foreground">{CLASS_LABEL[r.shareClass]}</p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-muted-foreground">1주당 평가액</dt><dd className="font-mono text-xl font-bold text-foreground">{won(r.perShare)}</dd></div>
          <div><dt className="text-muted-foreground">보유 주식 평가액</dt><dd className="font-mono text-xl font-bold text-foreground">{won(r.total)}</dd></div>
          <div><dt className="text-muted-foreground">순손익가치 / 순자산가치</dt><dd className="font-mono text-base font-semibold text-foreground">{won(r.incomeValue)} / {won(r.assetValue)}</dd></div>
        </dl>
        <ResultSteps
          steps={[
            `1주당 순손익액: ${r.perShareIncome.map((v) => won(Math.floor(v))).join(", ")} → 가중평균 (3·2·1) ${won(Math.floor(r.weightedRaw))}${r.weightedRaw < 0 ? " → 음수라 0" : ""}`,
            `순손익가치 = 가중평균 ÷ 10%(순손익가치환원율) = ${won(r.incomeValue)}`,
            `순자산가치 = (순자산 + 영업권) ÷ 발행주식수 = ${won(r.assetValue)}`,
            r.shareClass === "netAssetOnly" ? "순자산가치만 적용" : `가중평균 ${won(r.blended)}, 하한(순자산가치 80%) ${won(r.floorValue)}${r.floorApplied ? " → 하한 적용" : ""}`,
            r.premiumApplied ? `최대주주 할증 20%: ${won(r.basePerShare)} × 1.2 = ${won(r.perShare)}` : "최대주주 할증 없음",
            "추정이익 평가(시행령 제56조 제2항), 증자·감자 시 주식수 환산, 매매사례가액 등 시가는 넣지 않았어요.",
          ]}
          next={[
            { href: "/ko/family-business-inheritance-calculator/", label: "가업상속공제 계산" },
            { href: "/ko/dcf-valuation-calculator/", label: "DCF 기업가치" },
          ]}
        />
      </div>
    </div>
  );
}
