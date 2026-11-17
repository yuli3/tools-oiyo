// 보험 설명·적합성 확인 기록 도우미 (2026-11-17, 역량 지도 agent-record). 계산·문구: lib/pro-practice-guides-2026.ts
import { useState } from "react";
import { EXPLAIN_ITEMS, SUITABILITY_ITEMS, recordCheck, recordText, type RecordInput } from "../../../lib/pro-practice-guides-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";

const START: RecordInput = { customer: "", product: "", date: "", suitability: [], explained: [], delivered: "", confirm: "", replace: false, note: "" };
const input = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground";

export default function ExplanationRecord() {
  const [i, setI] = useState<RecordInput>(START);
  const [copied, setCopied] = useState(false);
  const r = recordCheck(i);
  const text = recordText(i);
  const toggle = (k: "suitability" | "explained", id: string) => setI({ ...i, [k]: i[k].includes(id) ? i[k].filter((x) => x !== id) : [...i[k], id] });
  const box = (k: "suitability" | "explained", list: readonly { id: string; label: string }[]) => (
    <ul className="space-y-2">
      {list.map((x) => (
        <li key={x.id}>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm leading-6">
            <input type="checkbox" className="mt-1 size-5 shrink-0" checked={i[k].includes(x.id)} onChange={() => toggle(k, x.id)} />
            <span className="text-foreground">{x.label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-muted-foreground">고객(이니셜이어도 돼요)</span>
          <input className={input} value={i.customer} onChange={(e) => setI({ ...i, customer: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-muted-foreground">상품명</span>
          <input className={input} value={i.product} onChange={(e) => setI({ ...i, product: e.target.value })} />
        </label>
        <DateField label="청약일" value={i.date} onChange={(v) => setI({ ...i, date: v })} />
      </div>
      <ChoiceChips<string> legend="기존 보험을 해지하고 갈아타는 계약인가요?" value={i.replace ? "yes" : "no"} options={[{ value: "yes", label: "예" }, { value: "no", label: "아니요" }]} onChange={(v) => setI({ ...i, replace: v === "yes" })} />
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">1. 적합성 확인(금소법 제17조)</h3>
        {box("suitability", SUITABILITY_ITEMS)}
      </section>
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">2. 설명한 중요사항(금소법 제19조)</h3>
        {box("explained", i.replace ? EXPLAIN_ITEMS : EXPLAIN_ITEMS.filter((x) => x.id !== "compare"))}
      </section>
      <ChoiceChips<RecordInput["delivered"]> legend="3. 설명서는 어떻게 줬나요?" value={i.delivered} options={[{ value: "paper", label: "서면" }, { value: "email", label: "전자우편" }, { value: "app", label: "앱·문자 링크" }]} onChange={(v) => setI({ ...i, delivered: v })} />
      <ChoiceChips<RecordInput["confirm"]> legend="4. 이해했다는 확인은 어떻게 받았나요?" value={i.confirm} options={[{ value: "sign", label: "서명" }, { value: "seal", label: "기명날인" }, { value: "record", label: "녹취" }]} onChange={(v) => setI({ ...i, confirm: v })} />
      <label className="block">
        <span className="text-sm font-medium text-muted-foreground">메모(고객 질문, 추가 설명)</span>
        <textarea className={input + " h-20"} value={i.note} onChange={(e) => setI({ ...i, note: e.target.value })} />
      </label>

      <div className={"rounded-md border px-4 py-3 text-sm leading-6 " + (r.ok ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10")} aria-live="polite">
        {r.ok ? <p className="font-semibold text-foreground">빠진 항목이 없어요. 아래 기록을 복사해 계약 서류와 함께 보관하세요.</p> : (
          <ul className="list-disc space-y-1 pl-5 text-foreground">{r.problems.map((p) => <li key={p}>{p}</li>)}</ul>
        )}
      </div>
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-foreground">기록 문서</h3>
          <button
            type="button"
            className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            onClick={() => {
              navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false));
            }}
          >
            {copied ? "복사했어요" : "복사"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap break-all rounded-md border border-border bg-muted p-3 text-xs leading-5 text-foreground">{text}</pre>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">입력한 내용은 이 브라우저 밖으로 나가지 않아요. 회사 전산의 공식 확인서·녹취를 대신하지 않고, 개인 점검과 메모용이에요.</p>
    </div>
  );
}
