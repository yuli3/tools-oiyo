// 판매장려금·특수관계 거래처 점검 (2026-11-16). 계산: lib/biz-ops.ts rebateCheck. 구간 장려금, 관계사 합산, 과다 지급·정상가격 경고.
import { rebateCheck, type RebateInput } from "../../../lib/biz-ops";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, SmallButton, TextField, Verdict, pct1, useSaved } from "./common";

const TOOL_ID = "sales-rebate-checker";
const EXAMPLE: RebateInput = {
  tiers: [{ from: 0, rate: 0.01 }, { from: 50_000_000, rate: 0.02 }, { from: 100_000_000, rate: 0.03 }],
  partners: [
    { name: "대리점 가", sales: 42_000_000, group: "가나 그룹", related: true, paid: 1_260_000 },
    { name: "대리점 나", sales: 38_000_000, group: "가나 그룹", related: true },
    { name: "대리점 다", sales: 65_000_000, paid: 1_300_000 },
    { name: "대리점 라", sales: 120_000_000 },
  ],
  aggregateGroups: false,
  armsLengthCheck: true,
};

export default function RebateCheck() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [s, setS, reset] = useSaved<RebateInput>("rebate-check", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const r = rebateCheck(s);
  const setP = (k: number, p: Partial<RebateInput["partners"][number]>) => setS({ ...s, partners: s.partners.map((x, j) => (j === k ? { ...x, ...p } : x)) });
  const setT = (k: number, p: Partial<RebateInput["tiers"][number]>) => setS({ ...s, tiers: s.tiers.map((x, j) => (j === k ? { ...x, ...p } : x)) });
  const blocks = r.flags.filter((f) => f.level === "block");
  const reviews = r.flags.filter((f) => f.level === "review");

  const memo = () =>
    [
      "[판매장려금 점검]",
      `구간: ${s.tiers.map((t) => `${exactWon(t.from)} 이상 ${pct1(t.rate)}`).join(", ")} / 관계사 합산 ${s.aggregateGroups ? "함" : "안 함"}`,
      ...r.rows.map((x) => `- ${x.name}${x.related ? "(특수관계)" : ""}: 매출 ${exactWon(x.sales)}, 구간 기준 ${exactWon(x.basisSales)} → ${pct1(x.rate)}, 지급할 금액 ${exactWon(x.due)}${x.paid !== null ? `, 요청 ${exactWon(x.paid)}(차이 ${exactWon(x.diff ?? 0)})` : ""}`),
      ...r.flags.map((f) => `[${f.level === "block" ? "보류" : "검토"}] ${f.name}: ${f.text}`),
      ...r.taxNotes.map((t) => `· ${t.text} (${t.basis})`),
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">장려금 구간(계약서)</h2>
        {s.tiers.map((t, k) => (
          <div key={k} className="grid grid-cols-2 items-end gap-2">
            <MoneyField label="매출 이 금액 이상이면" value={t.from} onChange={(v) => setT(k, { from: v })} />
            <NumberField label="장려금률" value={Math.round(t.rate * 1000) / 10} onChange={(v) => setT(k, { rate: v / 100 })} suffix="%" step={0.5} />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {s.tiers.length < 8 && <SmallButton onClick={() => setS({ ...s, tiers: [...s.tiers, { from: (s.tiers[s.tiers.length - 1]?.from ?? 0) + 50_000_000, rate: (s.tiers[s.tiers.length - 1]?.rate ?? 0) + 0.01 }] })}>구간 추가</SmallButton>}
          {s.tiers.length > 1 && <SmallButton onClick={() => setS({ ...s, tiers: s.tiers.slice(0, -1) })}>마지막 구간 빼기</SmallButton>}
        </div>
        <ChoiceChips legend="같은 그룹(특수관계) 거래처 매출을 합쳐 구간을 정하나요?" value={s.aggregateGroups ? "yes" : "no"} options={[{ value: "no", label: "따로(계약 기본)" }, { value: "yes", label: "합산(계약에 명시)" }] as const} onChange={(v) => setS({ ...s, aggregateGroups: v === "yes" })} />
        {!easy && <ChoiceChips legend="특수관계 거래처 장려금률을 일반 거래처 범위와 비교" value={s.armsLengthCheck ? "on" : "off"} options={[{ value: "on", label: "비교" }, { value: "off", label: "안 함" }] as const} onChange={(v) => setS({ ...s, armsLengthCheck: v === "on" })} />}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">거래처</h2>
        {s.partners.map((p, k) => (
          <div key={k} className="space-y-2 rounded-md border border-border bg-background p-3">
            <div className="flex items-end gap-2">
              <div className="flex-1"><TextField label="거래처" value={p.name} onChange={(v) => setP(k, { name: v })} /></div>
              {s.partners.length > 1 && <SmallButton tone="danger" label={`${p.name} 지우기`} onClick={() => setS({ ...s, partners: s.partners.filter((_, j) => j !== k) })}>삭제</SmallButton>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <MoneyField label="기간 매출(공급가액)" value={p.sales} onChange={(v) => setP(k, { sales: v })} />
              <MoneyField label="지급 요청 금액(비우면 계산값)" value={p.paid ?? 0} onChange={(v) => setP(k, { paid: v > 0 ? v : undefined })} />
              <TextField label="묶음 그룹(같은 주인·친족 등)" value={p.group ?? ""} onChange={(v) => setP(k, { group: v || undefined })} placeholder="없으면 비워 두기" />
              <label className="flex min-h-11 items-center gap-2 self-end text-sm text-foreground">
                <input type="checkbox" className="size-5 accent-primary" checked={!!p.related} onChange={(e) => setP(k, { related: e.target.checked })} />
                우리 회사와 특수관계(주주·임원·계열사)
              </label>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {s.partners.length < 30 && <SmallButton onClick={() => setS({ ...s, partners: [...s.partners, { name: `거래처 ${s.partners.length + 1}`, sales: 30_000_000 }] })}>거래처 추가</SmallButton>}
          <SmallButton onClick={reset}>예시로 되돌리기</SmallButton>
        </div>
      </section>

      <Verdict title="결론">
        계약 기준 지급액은 모두 <b>{money(r.totalDue)}</b>예요. {blocks.length ? <><b>{blocks.length}건은 보류</b>해요(계약보다 많이 요청).</> : <>계약보다 많이 요청된 건은 없어요.</>} {reviews.length ? <>{reviews.length}건은 담당자 검토가 필요해요.</> : null}
        <ul className="mt-2 space-y-1 text-sm">
          {r.flags.map((f, k) => <li key={k} className={f.level === "block" ? "text-destructive" : "text-warning-foreground"}><b>{f.name}</b>: {f.text}</li>)}
        </ul>
        <span className="mt-1 block text-sm text-muted-foreground">영향 부서: 영업(거래처 안내), 재무(지급·전표), 세무(부가세·손금 처리), 내부감사(특수관계 거래 보고), 지주사(내부거래 공시).</span>
      </Verdict>

      <CompareBars title="거래처별 지급할 장려금" items={r.rows.map((x) => ({ label: `${x.name} (${pct1(x.rate)})`, value: x.due, current: x.related }))} format={money} />

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">세무·법 메모</h2>
        <ul className="space-y-2">
          {r.taxNotes.map((t) => (
            <li key={t.text} className="rounded-md border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground">{t.text}<span className="block text-xs text-muted-foreground">{t.basis}</span></li>
          ))}
        </ul>
      </section>
      <div className="flex flex-wrap gap-2"><CopyMemo text={memo} /></div>
    </div>
  );
}
