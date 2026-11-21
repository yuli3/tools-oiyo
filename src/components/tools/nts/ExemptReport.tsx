// 면세 사업자 사업장현황신고 점검 (2026-11-21, 국세청 주제 5종). 계산: lib/kr-nts-pack-2026.ts (kr-tax-advisor 스킬 calc exempt-report와 같은 코드)
import { useState } from "react";
import { EXEMPT_KINDS, NTS_PACK_AS_OF, NTS_PACK_NOTE, exemptBusinessReport, type ExemptKind } from "../../../lib/kr-nts-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items, useToday } from "./Items";

const TOOL_ID = "exempt-business-report-checker";

export default function ExemptReport() {
  const today = useToday();
  const [x, setX] = useState({ year: 2026, kind: "personal" as ExemptKind, vat: "none" as "none" | "mixed" | "all", unreported: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = exemptBusinessReport({ year: x.year, kind: x.kind, vatFiledAll: x.vat === "all", mixed: x.vat === "mixed", unreported: x.unreported * 10_000, today });
  return (
    <div className="space-y-5">
      <ChoiceChips<ExemptKind> legend="어떤 일을 하나요?" value={x.kind} options={(Object.keys(EXEMPT_KINDS) as ExemptKind[]).map((k) => ({ value: k, label: EXEMPT_KINDS[k] }))} onChange={(v) => upd({ kind: v })} />
      <ChoiceChips<"none" | "mixed" | "all"> legend="부가가치세 신고는요?" value={x.vat} options={[{ value: "none", label: "면세만 해서 안 해요" }, { value: "mixed", label: "과세·면세를 같이 해요" }, { value: "all", label: "모든 수입을 부가세로 신고했어요" }]} onChange={(v) => upd({ vat: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="수입이 생긴 해" value={x.year} onChange={(v) => upd({ year: Math.min(2030, Math.max(2024, Math.round(v))) })} />
        {(x.kind === "medical" || x.kind === "vet" || x.kind === "pharmacy") && <NumberField label="신고에서 빠진 수입금액" suffix="만 원" step={100} value={x.unreported} onChange={(v) => upd({ unreported: Math.max(0, v) })} />}
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          {r.must ? <>신고 기한 <span className="font-mono">{r.due}</span>{r.dday != null && <span className="ml-2 text-base font-normal text-muted-foreground">{r.dday >= 0 ? `D-${r.dday}` : `${-r.dday}일 지남`}</span>}</> : "따로 하지 않아도 돼요"}
        </p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{NTS_PACK_NOTE} 기준일 {NTS_PACK_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
