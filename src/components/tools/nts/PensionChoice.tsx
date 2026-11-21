// 사적연금 1,500만 원 분리과세 vs 종합과세 비교 (2026-11-21, 국세청 주제 5종). 계산: lib/kr-nts-pack-2026.ts (kr-tax-advisor 스킬 calc pension-income과 같은 코드)
import { useState } from "react";
import { NTS_PACK_AS_OF, NTS_PACK_NOTE, PENSION_RULES, pensionCurve, pensionIncomeChoice } from "../../../lib/kr-nts-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import SweepChart from "../viz/SweepChart";
import { track } from "../viz/track";
import { Items, won } from "./Items";

const TOOL_ID = "private-pension-separate-tax-calculator";
const man = (n: number) => `${Math.round(n / 10_000).toLocaleString("ko-KR")}만`;

export default function PensionChoice() {
  const [x, setX] = useState({ priv: 2000, age: 66, lifelong: false, pub: 1200, other: 0, people: 1 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const input = { privatePension: x.priv * 10_000, age: x.age, lifelong: x.lifelong, publicPension: x.pub * 10_000, otherIncome: x.other * 10_000, people: x.people };
  const r = pensionIncomeChoice(input);
  const gap = pensionCurve(input).map((p) => ({ x: p.pension, y: p.separate - p.combined }));
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="연금저축·IRP에서 받은 연금(연)" suffix="만 원" step={100} value={x.priv} onChange={(v) => upd({ priv: Math.max(0, v) })} />
        <NumberField label="받을 때 나이" suffix="세" value={x.age} onChange={(v) => upd({ age: Math.min(110, Math.max(55, Math.round(v))) })} />
        <NumberField label="국민연금 등 공적연금(연, 과세분)" suffix="만 원" step={100} value={x.pub} onChange={(v) => upd({ pub: Math.max(0, v) })} />
        <NumberField label="다른 종합소득금액(사업·임대 등)" suffix="만 원" step={100} value={x.other} onChange={(v) => upd({ other: Math.max(0, v) })} />
        <NumberField label="기본공제 인원(본인 포함)" suffix="명" value={x.people} onChange={(v) => upd({ people: Math.max(1, Math.round(v)) })} />
      </div>
      <ChoiceChips<"no" | "yes"> legend="종신형(죽을 때까지 받고 해지할 수 없는) 계약인가요?" value={x.lifelong ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "네, 종신형이에요" }]} onChange={(v) => upd({ lifelong: v === "yes" })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          {r.better === "same" ? "두 방식 세금이 같아요" : r.better === "combined" ? `합쳐서(종합과세) 신고하면 약 ${won(r.gap)} 덜 내요` : `${r.over ? "15% 분리과세" : "떼인 세금으로 끝내는 쪽(분리과세)"}가 약 ${won(r.gap)} 덜 내요`}
        </p>
        <p className="mt-1 text-foreground">받을 때 떼는 세금 {won(r.withheld)} ({Math.round(r.withholdingRate * 1000) / 10}%) · 소득세 기준, 지방소득세 별도</p>
        <Items items={r.items} />
      </div>
      <CompareBars
        title="한 해 소득세 어림"
        items={[
          { label: "종합과세(공적·사적연금 합산)", value: r.combined.tax, current: r.better === "combined" },
          { label: r.over ? "사적연금 15% 분리 + 나머지 종합" : "사적연금 분리(원천징수로 끝) + 나머지 종합", value: r.separate.tax, current: r.better === "separate" },
        ]}
        format={won}
      />
      <SweepChart
        title="사적연금을 더 받으면 어느 쪽이 유리할까?"
        caption="0보다 위면 종합과세가, 아래면 분리과세가 덜 내요. 다른 입력은 그대로예요."
        points={gap}
        current={{ x: r.privatePension, y: r.separate.tax - r.combined.tax }}
        marks={[{ at: PENSION_RULES.separateLimit, label: "1,500만" }]}
        formatX={(v) => `${man(v)}원`}
        formatY={(v) => `${man(v)}원`}
        xLabel="사적연금(연)"
        yLabel="분리 − 종합"
      />
      <p className="text-xs leading-5 text-muted-foreground">{NTS_PACK_NOTE} 기준일 {NTS_PACK_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </div>
  );
}
