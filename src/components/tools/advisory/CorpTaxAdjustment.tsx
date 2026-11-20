// 법인세 어림과 세무조정 한도 (2026-11-20, 전수조사 #2). 계산: lib/kr-corp-tax-2026.ts (kr-tax-advisor 스킬 calc.mjs corp-tax와 같은 코드)
import { useState } from "react";
import { CORP_TAX_AS_OF, CORP_TAX_NOTE, corpTax, type CorpTaxInput } from "../../../lib/kr-corp-tax-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "corporate-tax-adjustment-calculator";
const MAN = 10_000;
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
type ManKey = "profit" | "addBack" | "deduct" | "revenue" | "relatedRevenue" | "entertainment" | "cultureEntertainment" | "entertainmentNoProof" | "specialDonation" | "generalDonation" | "losses" | "credits" | "prepaid";
const FIELDS: { key: ManKey; label: string; expert?: boolean }[] = [
  { key: "profit", label: "법인세 차감 전 당기순이익" },
  { key: "revenue", label: "매출(수입금액)" },
  { key: "entertainment", label: "기업업무추진비(접대비) 쓴 돈" },
  { key: "generalDonation", label: "일반기부금" },
  { key: "losses", label: "남은 이월결손금" },
  { key: "credits", label: "받을 세액공제·감면(최저한세 대상)" },
  { key: "relatedRevenue", label: "그중 특수관계인 매출", expert: true },
  { key: "cultureEntertainment", label: "문화 업무추진비", expert: true },
  { key: "entertainmentNoProof", label: "3만 원 넘는데 적격증빙 없는 업무추진비", expert: true },
  { key: "specialDonation", label: "특례기부금", expert: true },
  { key: "addBack", label: "그 밖의 익금산입·손금불산입 합계", expert: true },
  { key: "deduct", label: "그 밖의 손금산입·익금불산입 합계", expert: true },
  { key: "prepaid", label: "이미 낸 중간예납·원천징수", expert: true },
];

export default function CorpTaxAdjustment() {
  const [x, setX] = useState<CorpTaxInput>({ size: "sme", profit: 5 * 10 ** 8, revenue: 150 * 10 ** 8, entertainment: 8000 * MAN, generalDonation: 1000 * MAN, months: 12 });
  const [expert, setExpert] = useState(false);
  const r = corpTax(x);
  const set = (k: ManKey, v: number) => {
    setX({ ...x, [k]: Math.max(0, v) * MAN });
    track("tool_calculate", { tool_id: TOOL_ID, field: k }, true);
  };
  const rows: [string, number][] = [
    ["기업업무추진비 한도", r.entertainment.limit],
    ["기업업무추진비 손금불산입", r.entertainment.disallowed],
    ["기부금 한도 초과", r.donation.specialExcess + r.donation.generalExcess],
    ["각 사업연도 소득", r.income],
    ["이월결손금 공제", r.loss.used],
    ["과세표준", r.base],
    ["산출세액", r.computed],
    [`최저한세(${Math.round(r.minRate * 100)}%)`, r.minTax],
    ["최저한세로 잘린 공제", r.creditsCut],
    ["결정세액(법인세)", r.determined],
    ["지방소득세(어림)", r.local],
  ];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <ChoiceChips<"sme" | "general"> legend="회사 규모" value={x.size} options={[{ value: "sme", label: "중소기업" }, { value: "general", label: "그 밖의 법인" }]} onChange={(v) => setX({ ...x, size: v })} />
        <ChoiceChips<"easy" | "expert"> legend="보기" value={expert ? "expert" : "easy"} options={[{ value: "easy", label: "쉽게" }, { value: "expert", label: "전문가" }]} onChange={(v) => setExpert(v === "expert")} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.filter((f) => expert || !f.expert).map((f) => (
          <NumberField key={f.key} label={f.label} suffix="만 원" value={Math.round((x[f.key] ?? 0) / MAN)} onChange={(v) => set(f.key, v)} />
        ))}
        {expert && <NumberField label="사업연도 월수" suffix="개월" value={x.months ?? 12} onChange={(v) => setX({ ...x, months: Math.min(12, Math.max(1, v)) })} />}
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          낼 법인세 {won(r.due)} + 지방소득세 약 {won(r.local)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          과세표준 {won(r.base)}, 2026년 세율 적용. 다음 해 중간예납 {r.interim.exempt ? "없음(중소기업 50만 원 미만)" : `약 ${won(r.interim.amount)}`}: {r.interim.rule}.
        </p>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-t border-border">
                <th scope="row" className="py-2 text-left font-normal text-muted-foreground">{k}</th>
                <td className="py-2 text-right font-mono text-foreground">{won(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{CORP_TAX_NOTE} 기준일 {CORP_TAX_AS_OF}. 입력한 숫자는 서버로 보내지 않아요.</p>
    </div>
  );
}
