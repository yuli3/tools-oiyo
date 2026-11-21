// 加算税・延滞税と不服申立ての期限 (2026-11-21)。計算: lib/jp-tax-pack-2026.ts
import { useState } from "react";
import { JP_TAX_AS_OF, JP_TAX_NOTE, jpAppealDeadlines, jpPenalty } from "../../../lib/jp-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "jp-penalty-tax-calculator";
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;
type Kind = "none" | "under";
type Stage = "voluntary" | "notice" | "audit";
type YN = "y" | "n";

export default function JpPenalty() {
  const [x, setX] = useState({ kind: "none" as Kind, stage: "voluntary" as Stage, tax: 500_000, original: 0, fraud: "n" as YN, deadline: "2026-03-16", paid: "", noticed: "" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = jpPenalty({ kind: x.kind, stage: x.stage, tax: Math.max(0, x.tax), original: x.original, fraud: x.fraud === "y", deadline: x.deadline || undefined, paid: x.paid || undefined });
  const ap = x.noticed ? jpAppealDeadlines({ noticed: x.noticed }) : [];
  return (
    <div className="space-y-5">
      <ChoiceChips<Kind> legend="どちらですか？" value={x.kind} options={[{ value: "none", label: "期限後申告（無申告）" }, { value: "under", label: "修正申告（過少申告）" }]} onChange={(v) => upd({ kind: v })} />
      <ChoiceChips<Stage> legend="いつ申告しましたか？" value={x.stage} options={[{ value: "voluntary", label: "調査の通知前に自主的に" }, { value: "notice", label: "通知後・調査前" }, { value: "audit", label: "調査の後" }]} onChange={(v) => upd({ stage: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="新たに納める本税" value={x.tax} onChange={(v) => upd({ tax: v })} suffix="円" step={10000} />
        {x.kind === "under" && <NumberField label="当初の申告納税額" value={x.original} onChange={(v) => upd({ original: v })} suffix="円" step={10000} />}
        <DateField label="法定納期限" value={x.deadline} onChange={(v) => upd({ deadline: v })} />
        <DateField label="納付日（予定）" value={x.paid} onChange={(v) => upd({ paid: v })} />
      </div>
      <ChoiceChips<YN> legend="仮装・隠ぺいがあったと指摘されていますか？" value={x.fraud} options={[{ value: "y", label: "はい" }, { value: "n", label: "いいえ" }]} onChange={(v) => upd({ fraud: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">本税のほかに 約{yen(r.total)}（推定）</p>
        <Items items={r.items} />
      </div>
      <section className="space-y-3 rounded-md border border-border bg-card px-4 py-4 text-sm">
        <h3 className="font-semibold">更正・決定に納得できないとき（不服申立ての期限）</h3>
        <DateField label="処分の通知を受けた日" value={x.noticed} onChange={(v) => upd({ noticed: v })} />
        {ap.length > 0 && <ul className="space-y-2">{ap.map((a) => <li key={a.id}><span className="font-mono font-semibold">{a.date}</span> {a.label} <span className="text-xs text-muted-foreground">({a.cite})</span></li>)}</ul>}
      </section>
      <p className="text-xs leading-5 text-muted-foreground">{JP_TAX_NOTE} 延滞税は令和8年の割合で計算しています。基準日 {JP_TAX_AS_OF}。</p>
    </div>
  );
}
