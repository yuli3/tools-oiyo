// 주택 경매 배당·소액임차인 최우선변제 (2026-11-20, 전수조사 4번). 계산: lib/kr-auction-distribution-2026.ts (법령 길잡이 스킬 guide.mjs calc auction과 같은 코드)
import { useState } from "react";
import { AUCTION_AS_OF, AUCTION_NOTE, REGION_LABEL, auctionDistribution, type Region } from "../../../lib/kr-auction-distribution-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { krwShort } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "auction-distribution-calculator";
const MAN = 10_000;
const man = (n: number) => {
  const m = Math.round(n / MAN);
  const eok = Math.floor(m / 10_000), rest = m % 10_000;
  return eok ? `${eok.toLocaleString("ko-KR")}억${rest ? ` ${rest.toLocaleString("ko-KR")}만` : ""} 원` : `${m.toLocaleString("ko-KR")}만 원`;
};

export default function AuctionDistribution() {
  const [s, setS] = useState({ sale: 20000, cost: 300, region: "seoul" as Region, mortgage: 12000, mortgageDate: "2023-05-01", deposit: 15000, tenantDate: "2024-03-02", hasDate: true, wage: 0, currentTax: 0, tax: 0, taxDate: "2025-03-31", general: 0 });
  const upd = (p: Partial<typeof s>) => { setS({ ...s, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const calc = (sale: number) => auctionDistribution({
    sale: sale * MAN, cost: s.cost * MAN, region: s.region, baseDate: s.mortgage > 0 ? s.mortgageDate : undefined,
    tenants: [{ label: "내 보증금", deposit: s.deposit * MAN, date: s.hasDate ? s.tenantDate : undefined }],
    claims: [
      ...(s.mortgage > 0 ? [{ label: "근저당", amount: s.mortgage * MAN, date: s.mortgageDate, kind: "mortgage" as const }] : []),
      ...(s.tax > 0 ? [{ label: "세금(법정기일)", amount: s.tax * MAN, date: s.taxDate, kind: "tax" as const }] : []),
    ],
    wagePriority: s.wage * MAN, currentTax: s.currentTax * MAN, general: s.general * MAN,
  });
  const r = calc(s.sale);
  const me = r.tenants[0];
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{
        title: "낙찰가에 따라 내 보증금 배당이 이렇게 바뀌어요", caption: "앞선 권리와 비용을 먼저 빼고 남는 돈으로 받아요. 다른 입력은 그대로예요.",
        xLabel: "낙찰가", yLabel: "내 배당", min: 0, max: Math.max(s.sale * 1.5, s.deposit + s.mortgage + 5000), step: 500, current: s.sale,
        f: (v) => calc(v).tenants[0].paid,
        formatX: (n: number) => krwShort(n * MAN), formatY: krwShort,
        onPick: (v) => upd({ sale: v }),
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<Region> legend="집이 있는 곳" value={s.region} options={(Object.keys(REGION_LABEL) as Region[]).map((k) => ({ value: k, label: REGION_LABEL[k] }))} onChange={(v) => upd({ region: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="예상 매각가(낙찰가)" suffix="만 원" value={s.sale} onChange={(v) => upd({ sale: Math.max(0, v) })} />
        <NumberField label="내 보증금" suffix="만 원" value={s.deposit} onChange={(v) => upd({ deposit: Math.max(0, v) })} />
        <NumberField label="앞선 근저당 채권최고액(없으면 0)" suffix="만 원" value={s.mortgage} onChange={(v) => upd({ mortgage: Math.max(0, v) })} />
        {s.mortgage > 0 && <DateField label="근저당 설정일" value={s.mortgageDate} onChange={(v) => upd({ mortgageDate: v })} />}
        <ChoiceChips<"yes" | "no"> legend="확정일자와 전입신고를 했나요?" value={s.hasDate ? "yes" : "no"} options={[{ value: "yes", label: "했어요" }, { value: "no", label: "안 했어요" }]} onChange={(v) => upd({ hasDate: v === "yes" })} />
        {s.hasDate && <DateField label="확정일자·전입 다음 날 중 늦은 날" value={s.tenantDate} onChange={(v) => upd({ tenantDate: v })} />}
      </div>
      {mode === "easy" && <p className="text-xs text-muted-foreground">집행비용·임금·세금·일반 채권은 전문가 모드에서 넣어요.</p>}
      {mode === "expert" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="집행비용" suffix="만 원" value={s.cost} onChange={(v) => upd({ cost: Math.max(0, v) })} />
          <NumberField label="최종 3개월 임금·3년 퇴직금" suffix="만 원" value={s.wage} onChange={(v) => upd({ wage: Math.max(0, v) })} />
          <NumberField label="당해세(그 집의 재산세·종부세 등)" suffix="만 원" value={s.currentTax} onChange={(v) => upd({ currentTax: Math.max(0, v) })} />
          <NumberField label="다른 세금" suffix="만 원" value={s.tax} onChange={(v) => upd({ tax: Math.max(0, v) })} />
          {s.tax > 0 && <DateField label="그 세금의 법정기일" value={s.taxDate} onChange={(v) => upd({ taxDate: v })} />}
          <NumberField label="일반 채권(가압류 등)" suffix="만 원" value={s.general} onChange={(v) => upd({ general: Math.max(0, v) })} />
        </div>
      )}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">내 보증금 {man(me.paid)} 배당, {me.unpaid ? `${man(me.unpaid)} 못 받아요` : "전액 받아요"}</p>
        <p className="mt-1 text-muted-foreground">
          {r.table ? `${r.table.from} 이후 기준 ${r.table.label}: 보증금 ${man(r.table.limit)} 이하면 ${man(r.table.priority)}까지 먼저 받아요. ` : "2018-09-18 전 담보물권이라 이 표 밖이에요. 법원경매정보에서 그때 표를 확인하세요. "}
          {me.small ? "소액임차인에 해당해요." : "소액임차인 범위를 넘어요."}{r.smallCapped ? " 최우선변제 합이 배당할 금액의 절반을 넘어 나눴어요." : ""}
        </p>
        <ol className="mt-3 space-y-1 text-foreground">
          {r.payouts.map((p, i) => <li key={i}>{i + 1}. {p.step} · {p.label}: {man(p.paid)}{p.paid < p.claim ? ` (청구 ${man(p.claim)})` : ""}</li>)}
          {r.leftover > 0 && <li>남은 돈 {man(r.leftover)}은 집주인(채무자)에게 가요.</li>}
        </ol>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{AUCTION_NOTE} 기준일 {AUCTION_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </>
      )}
    </CurveShell>
  );
}
