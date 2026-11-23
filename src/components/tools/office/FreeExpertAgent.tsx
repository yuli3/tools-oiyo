// 무료 전문가 대리 자격 확인 (노동위원회 권리구제 대리 · 국세 국선대리인). 계산: lib/kr-free-expert-2026.ts
import { useState } from "react";
import { FREE_AS_OF, laborCommissionAgent, nationalTaxAgent, type TaxKind } from "../../../lib/kr-free-expert-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import ChoiceChips from "../payroll/ChoiceChips";
import { track } from "../viz/track";

const TOOL_ID = "free-expert-representation-check";
type Kind = "labor" | "tax";
type Person = "individual" | "corp";

export default function FreeExpertAgent() {
  const [kind, setKind] = useState<Kind>("labor");
  const [wage, setWage] = useState(2_500_000);
  const [ownAgent, setOwnAgent] = useState(false);
  const [person, setPerson] = useState<Person>("individual");
  const [income, setIncome] = useState(30_000_000);
  const [assets, setAssets] = useState(200_000_000);
  const [claim, setClaim] = useState(5_000_000);
  const [taxKind, setTaxKind] = useState<TaxKind>("income");
  const upd = (f: () => void) => { f(); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const note = `일반 정보예요. 사건을 대리하거나 선정을 보장하지 않아요. 국가법령정보센터 원문 기준, 확인 ${FREE_AS_OF}. 입력은 브라우저 밖으로 나가지 않아요.`;

  return (
    <div className="space-y-4">
      <ChoiceChips<Kind> legend="어떤 일로 전문가가 필요해요?" value={kind} options={[{ value: "labor", label: "해고·징계·차별 (노동위원회)" }, { value: "tax", label: "세금 불복·고충 (국세)" }]} onChange={(v) => upd(() => setKind(v))} />
      {kind === "labor" ? (
        <>
          <NumberField label="월평균임금" value={wage} onChange={(v) => upd(() => setWage(v))} suffix="원" step={50_000} />
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={ownAgent} onChange={(e) => upd(() => setOwnAgent(e.target.checked))} />이미 다른 변호사·공인노무사를 선임했어요</label>
          {(() => { const r = laborCommissionAgent({ monthlyWage: wage, hasOwnAgent: ownAgent }); return <LaborResult headline={r.eligible ? "무료 대리인 선임을 신청할 수 있어요" : "무료 대리인 신청 대상이 아니에요"} items={r.items} dates={[]} datesTitle="날짜" note={note} />; })()}
        </>
      ) : (
        <>
          <ChoiceChips<Person> legend="신청하는 사람" value={person} options={[{ value: "individual", label: "개인" }, { value: "corp", label: "법인" }]} onChange={(v) => upd(() => setPerson(v))} />
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label={person === "individual" ? "종합소득금액" : "수입금액(매출액)"} value={income} onChange={(v) => upd(() => setIncome(v))} suffix="원" step={1_000_000} />
            <NumberField label={person === "individual" ? "소유 재산 가액 합계" : "자산가액"} value={assets} onChange={(v) => upd(() => setAssets(v))} suffix="원" step={10_000_000} />
            <NumberField label="다투는 세액(신청·청구 금액)" value={claim} onChange={(v) => upd(() => setClaim(v))} suffix="원" step={1_000_000} />
          </div>
          <ChoiceChips<TaxKind> legend="세목" value={taxKind} options={[{ value: "income", label: "소득세" }, { value: "vat", label: "부가가치세" }, { value: "corporate", label: "법인세" }, { value: "other", label: "그 밖의 국세" }, { value: "inheritance", label: "상속세" }, { value: "gift", label: "증여세" }, { value: "comprehensiveRealEstate", label: "종합부동산세" }]} onChange={(v) => upd(() => setTaxKind(v))} />
          {(() => { const r = nationalTaxAgent({ person, income, assets, claim, taxKind }); return <LaborResult headline={r.eligible ? "국선대리인 선정을 신청할 수 있어요" : "국선대리인 요건에 맞지 않아요"} items={r.items} dates={[]} datesTitle="날짜" note={note} />; })()}
        </>
      )}
    </div>
  );
}
