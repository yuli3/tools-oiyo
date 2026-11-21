// 장부 vs 추계 신고 비교(무기장가산세·기장세액공제) (2026-11-21, 국세청 주제 5종). 계산: lib/kr-nts-pack-2026.ts (kr-tax-advisor 스킬 calc book-vs-estimate와 같은 코드)
import { useState } from "react";
import { INDUSTRY_GROUPS, NTS_PACK_AS_OF, NTS_PACK_NOTE, bookVsEstimate, type IndustryGroup } from "../../../lib/kr-nts-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import { track } from "../viz/track";
import { Items, won } from "./Items";

const TOOL_ID = "bookkeeping-vs-estimate-calculator";

export default function BookVsEstimate() {
  const [x, setX] = useState({ group: "personal" as IndustryGroup, isNew: false, prev: 3000, revenue: 5000, expense: 1000, simpleRate: 64.1, simpleRateOver: 49.7, standardRate: 21.6, major: 300, other: 0, people: 1 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = bookVsEstimate({ group: x.group, newBusiness: x.isNew, prevRevenue: x.prev * 10_000, revenue: x.revenue * 10_000, actualExpense: x.expense * 10_000, simpleRate: x.simpleRate, simpleRateOver: x.simpleRateOver, standardRate: x.standardRate, majorExpense: x.major * 10_000, otherIncome: x.other * 10_000, people: x.people });
  return (
    <div className="space-y-5">
      <ChoiceChips<IndustryGroup> legend="업종" value={x.group} options={(Object.keys(INDUSTRY_GROUPS) as IndustryGroup[]).map((g) => ({ value: g, label: INDUSTRY_GROUPS[g].label }))} onChange={(v) => upd({ group: v })} />
      <ChoiceChips<"old" | "new"> legend="언제 시작했나요?" value={x.isNew ? "new" : "old"} options={[{ value: "old", label: "작년 이전부터" }, { value: "new", label: "올해 새로 시작" }]} onChange={(v) => upd({ isNew: v === "new" })} />
      <div className="grid gap-3 sm:grid-cols-2">
        {!x.isNew && <NumberField label="작년 수입금액" suffix="만 원" step={100} value={x.prev} onChange={(v) => upd({ prev: Math.max(0, v) })} />}
        <NumberField label="올해 수입금액" suffix="만 원" step={100} value={x.revenue} onChange={(v) => upd({ revenue: Math.max(0, v) })} />
        <NumberField label="장부로 정리한 실제 경비" suffix="만 원" step={100} value={x.expense} onChange={(v) => upd({ expense: Math.max(0, v) })} />
        <NumberField label="단순경비율(내 업종코드)" suffix="%" step={0.1} value={x.simpleRate} onChange={(v) => upd({ simpleRate: Math.min(100, Math.max(0, v)) })} />
        <NumberField label="단순경비율 자가율(4천만 원 초과분)" suffix="%" step={0.1} value={x.simpleRateOver} onChange={(v) => upd({ simpleRateOver: Math.min(100, Math.max(0, v)) })} />
        <NumberField label="기준경비율(내 업종코드)" suffix="%" step={0.1} value={x.standardRate} onChange={(v) => upd({ standardRate: Math.min(100, Math.max(0, v)) })} />
        <NumberField label="증빙 있는 매입·임차료·인건비" suffix="만 원" step={100} value={x.major} onChange={(v) => upd({ major: Math.max(0, v) })} />
        <NumberField label="다른 종합소득금액(근로 등)" suffix="만 원" step={100} value={x.other} onChange={(v) => upd({ other: Math.max(0, v) })} />
        <NumberField label="기본공제 인원(본인 포함)" suffix="명" value={x.people} onChange={(v) => upd({ people: Math.max(1, Math.round(v)) })} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          {r.better === "same" ? "두 방식 세금이 같아요" : r.better === "book" ? `장부로 신고하면 약 ${won(r.gap)} 덜 내요` : `${r.estimateMethod} 추계가 약 ${won(r.gap)} 덜 내요`}
        </p>
        <p className="mt-1 text-foreground">장부 소득 {won(r.bookIncome)} · 추계({r.estimateMethod}) 소득 {won(r.estimateIncome)} (소득세, 지방소득세 별도)</p>
        <Items items={r.items} />
      </div>
      <CompareBars
        title="방식별 소득세 어림"
        caption="기본공제만 넣은 비교예요. 다른 공제·세액공제는 두 방식에 똑같이 붙어요."
        items={[
          ...(r.doubleEntry ? [] : [{ label: "간편장부로 신고", value: r.book.taxSimpleLedger }]),
          { label: r.doubleEntry ? "복식부기 장부로 신고" : "복식부기로 신고(기장세액공제)", value: r.book.tax, current: r.better === "book" },
          { label: `${r.estimateMethod} 추계${r.estimate.penalty ? " + 무기장가산세" : ""}`, value: r.estimate.tax, current: r.better === "estimate" },
        ]}
        format={won}
      />
      <p className="text-xs leading-5 text-muted-foreground">{NTS_PACK_NOTE} 기준일 {NTS_PACK_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
