// 매매 셀프 등기 총비용 (2026-11-21, 전수조사 남은 빈칸). 계산: lib/kr-self-registration-2026.ts (법령 길잡이 스킬 guide.mjs calc registration과 같은 코드)
import { useState } from "react";
import { REG_AS_OF, REG_NOTE, selfRegistrationCost, type FilingMethod } from "../../../lib/kr-self-registration-2026";
import type { HouseCount } from "../../../lib/kr-real-estate-tax";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell, { krwShort } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "self-registration-cost-calculator";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export default function SelfRegistration() {
  const [x, setX] = useState({ price: 50000, standard: 35000, metro: true, houses: 1 as HouseCount, regulated: false, over85: false, method: "efile" as FilingMethod, discount: 6, other: 2, agent: 50 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const calc = (price: number) => selfRegistrationCost({ price: price * 10_000, standardPrice: (x.price ? (x.standard * price) / x.price : x.standard) * 10_000, metro: x.metro, houses: x.houses, regulated: x.regulated, over85: x.over85, method: x.method, bondDiscount: x.discount / 100, other: x.other * 10_000, agentFee: x.agent * 10_000 });
  const r = selfRegistrationCost({ price: x.price * 10_000, standardPrice: x.standard * 10_000, metro: x.metro, houses: x.houses, regulated: x.regulated, over85: x.over85, method: x.method, bondDiscount: x.discount / 100, other: x.other * 10_000, agentFee: x.agent * 10_000 });
  const row = (label: string, v: number, note = "") => <li className="flex justify-between gap-3"><span>{label}{note && <span className="text-xs text-muted-foreground"> {note}</span>}</span><span className="font-mono">{won(v)}</span></li>;
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{
        title: "매매가에 따라 셀프 등기 총비용이 이렇게 바뀌어요", caption: "시가표준액은 지금 비율대로 함께 움직여요. 점선은 취득세율이 바뀌는 6억·9억이에요.",
        xLabel: "매매가", yLabel: "총비용", min: 10000, max: Math.max(150000, x.price), step: 1000, current: x.price,
        f: (v) => calc(v).total,
        formatX: (n: number) => krwShort(n * 10_000), formatY: krwShort,
        onPick: (v) => upd({ price: v, standard: x.price ? Math.round((x.standard * v) / x.price) : x.standard }),
        marks: [{ at: 60000, label: "6억" }, { at: 90000, label: "9억" }],
      }}
    >
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="매매가(취득가액)" suffix="만 원" value={x.price} onChange={(v) => upd({ price: Math.max(0, v) })} />
        <NumberField label="시가표준액(공동주택 공시가격)" suffix="만 원" value={x.standard} onChange={(v) => upd({ standard: Math.max(0, v) })} />
        {mode === "expert" && <NumberField label="채권 즉시 매도 할인율" suffix="%" step={0.1} value={x.discount} onChange={(v) => upd({ discount: Math.min(100, Math.max(0, v)) })} />}
        {mode === "expert" && <NumberField label="서류 발급·교통비 등" suffix="만 원" value={x.other} onChange={(v) => upd({ other: Math.max(0, v) })} />}
        <NumberField label="비교: 맡길 때 보수 견적" suffix="만 원" value={x.agent} onChange={(v) => upd({ agent: Math.max(0, v) })} />
      </div>
      <div className="flex flex-wrap gap-3">
        <ChoiceChips<"metro" | "other"> legend="집이 있는 곳" value={x.metro ? "metro" : "other"} options={[{ value: "metro", label: "서울·광역시" }, { value: "other", label: "그 밖의 지역" }]} onChange={(v) => upd({ metro: v === "metro" })} />
        <ChoiceChips<"1" | "2" | "3" | "4"> legend="이 집 포함 주택 수" value={String(x.houses) as "1"} options={[{ value: "1", label: "1주택" }, { value: "2", label: "2주택" }, { value: "3", label: "3주택" }, { value: "4", label: "4주택 이상" }]} onChange={(v) => upd({ houses: Number(v) as HouseCount })} />
        <ChoiceChips<"no" | "yes"> legend="조정대상지역" value={x.regulated ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => upd({ regulated: v === "yes" })} />
        <ChoiceChips<"no" | "yes"> legend="전용 85㎡ 초과" value={x.over85 ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => upd({ over85: v === "yes" })} />
        {mode === "expert" && <ChoiceChips<FilingMethod> legend="신청 방법" value={x.method} options={[{ value: "efile", label: "전자신청 1만 원" }, { value: "eform", label: "전자표준양식 1.5만 원" }, { value: "paper", label: "방문 서면 1.8만 원" }]} onChange={(v) => upd({ method: v })} />}
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">셀프 등기 총비용 약 {won(r.total)}</p>
        {r.withAgent && <p className="mt-1 text-foreground">맡기면 약 {won(r.withAgent)}, 직접 하면 {won(r.saving ?? 0)}을 아껴요.</p>}
        <ul className="mt-3 space-y-1 text-foreground">
          {row("취득세", r.acquisition.tax, `(${Math.round(r.acquisition.rate * 10000) / 100}%)`)}
          {row("지방교육세·농특세", r.acquisition.education + r.acquisition.rural)}
          {row("국민주택채권 매도 손실", r.bond.cost, `(매입 ${won(r.bond.amount)}, ${Math.round(r.bond.rate * 1000 * 10) / 10}/1000)`)}
          {row("등기신청수수료", r.fee)}
          {row("수입인지(매수인 몫)", r.stamp, r.stampFull ? `(계약서 ${won(r.stampFull)}의 절반)` : "(1억 원 이하 주택 비과세)")}
          {row("서류·교통비", r.other)}
        </ul>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">{r.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{REG_NOTE} 기준일 {REG_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </>
      )}
    </CurveShell>
  );
}
