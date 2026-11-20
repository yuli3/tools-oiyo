// 프리랜서·외주 계약서 읽기 점검 (2026-11-20, 다음 10종 #5). 계산: lib/freelance-contract-check-2026.ts (스킬 guide.mjs calc contract와 같은 코드).
// 쉬운 모드: 받을 돈 하나, 조심할 문장, 빠진 항목만. 전문가: 근거 조문, 찾은 문장, 메모 복사.
import { useState } from "react";
import { CONTRACT_AS_OF, CONTRACT_ITEMS, SAMPLE_CONTRACT, checkContract, type ContractContext } from "../../../lib/freelance-contract-check-2026";
import BarTrack from "../viz/BarTrack";
import ModeToggle from "../viz/ModeToggle";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, useSaved } from "../biz/common";

const TOOL_ID = "freelance-contract-check";
const CTX: { key: keyof ContractContext; label: string }[] = [
  { key: "creative", label: "디자인·글·영상·개발처럼 저작권이 생기는 결과물" },
  { key: "registered", label: "나도 사업자등록(일반과세자)을 했어요" },
];
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export default function FreelanceContractCheck() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const easy = mode === "easy";
  const [ctx, setCtx] = useSaved<ContractContext>("freelance-contract-ctx", { creative: true });
  const [amount, setAmount] = useSaved<number>("freelance-contract-amount", 3_000_000);
  const [text, setText] = useState(SAMPLE_CONTRACT);
  const r = checkContract(text, ctx, Number.isFinite(amount) ? amount : undefined);

  const memo = () =>
    [
      `[계약서 점검] 기준일 ${CONTRACT_AS_OF}: ${r.found}/${r.required} 항목 찾음, 조심할 문장 ${r.flags.length}개`,
      ...(r.pay ? [`받을 돈: 계약 ${won(r.pay.amount)} → ${won(r.pay.receive)} (${r.pay.mode === "vat" ? `부가세 ${won(r.pay.vat)} 더함` : `소득세 ${won(r.pay.incomeTax)}·지방소득세 ${won(r.pay.localTax)} 뗌`})`] : []),
      ...r.flags.map((f) => `! ${f.label}: "${f.evidence}" → ${f.advice} (${f.cite})`),
      ...r.items.map((i) => `${i.found ? "[v]" : "[ ]"} ${i.label} (${i.cite})`),
      ...r.notes.map((n) => `* ${n}`),
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <fieldset>
          <legend className="text-sm font-medium text-muted-foreground">해당하는 것을 눌러 주세요</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CTX.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={!!ctx[c.key]}
                onClick={() => {
                  setCtx({ ...ctx, [c.key]: !ctx[c.key] });
                  track("freelance_contract_ctx", { tool_id: TOOL_ID, key: c.key });
                }}
                className={`min-h-11 rounded-full border px-3 text-sm ${ctx[c.key] ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="text-sm font-medium text-muted-foreground">계약 금액(부가세·3.3% 빼기 전)</span>
          <input type="number" inputMode="numeric" min={0} step={10000} value={Number.isFinite(amount) ? amount : ""} onChange={(e) => setAmount(e.target.value === "" ? NaN : Number(e.target.value))} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-muted-foreground">받은 계약서 글을 붙여 넣으세요(서버로 보내지 않아요)</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} className="mt-1 h-56 w-full rounded-md border border-border bg-background p-3 text-base text-foreground" />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setText(SAMPLE_CONTRACT)} className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">예시</button>
          <button type="button" onClick={() => setText("")} className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">비우기</button>
        </div>
      </section>

      <div className="space-y-3 rounded-md border border-border bg-card px-4 py-4">
        <p aria-live="polite" className="text-lg font-semibold leading-7 text-foreground">
          {r.pay ? `통장에 들어올 돈은 ${won(r.pay.receive)}이에요. ` : ""}
          조심할 문장 {r.flags.length}개, 꼭 있어야 할 {r.required}가지 중 {r.missing.length}가지가 안 보여요.
        </p>
        {r.pay && (
          <p className="text-sm text-foreground">
            {r.pay.mode === "vat" ? `계약 ${won(r.pay.amount)} + 부가세 ${won(r.pay.vat)}.` : `계약 ${won(r.pay.amount)} − 소득세 3% ${won(r.pay.incomeTax)} − 지방소득세 ${won(r.pay.localTax)}.`} {!easy && r.pay.note}
          </p>
        )}
        <div role="img" aria-label={`필수 항목 ${r.found}/${r.required}`}>
          <BarTrack segments={[{ from: 0, to: r.required ? (r.found / r.required) * 100 : 0, tone: r.missing.length > 3 ? "warning" : "primary" }]} />
        </div>
      </div>

      {r.flags.length > 0 && (
        <section aria-labelledby="fc-flags" className="space-y-2">
          <h2 id="fc-flags" className="text-base font-semibold text-foreground">조심해서 읽을 문장</h2>
          <ul className="space-y-2">
            {r.flags.map((f) => (
              <li key={f.id} className="rounded-md border border-destructive/40 bg-background p-3 text-sm">
                <p className="flex flex-wrap items-baseline justify-between gap-2 font-semibold text-foreground">
                  <span>! {f.label}</span>
                  {!easy && <span className="text-xs font-normal text-muted-foreground">{f.cite}</span>}
                </p>
                <p className="text-xs text-muted-foreground">찾은 문장: {f.evidence}</p>
                <p className="mt-1 text-xs text-foreground">{f.advice}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="fc-items" className="space-y-2">
        <h2 id="fc-items" className="text-base font-semibold text-foreground">{easy ? "안 보이는 항목" : "꼭 있어야 할 항목"}</h2>
        {easy && r.missing.length === 0 ? (
          <p className="text-sm text-foreground">필수 항목 낱말은 모두 보여요.</p>
        ) : (
          <ul className="space-y-2">
            {(easy ? r.missing : r.items).map((i) => (
              <li key={i.id} className="rounded-md border border-border bg-background p-3 text-sm">
                <p className="flex flex-wrap items-baseline justify-between gap-2 font-semibold text-foreground">
                  <span>{i.found ? "✓" : "✗"} {i.label}</span>
                  {!easy && <span className="text-xs font-normal text-muted-foreground">{i.cite}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{i.found && !easy ? `찾은 문장: ${i.evidence}` : `확인할 것: ${i.why}`}</p>
              </li>
            ))}
          </ul>
        )}
        <ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
          {r.notes.map((n) => <li key={n}>{n}</li>)}
        </ul>
        {!easy && <CopyMemo text={memo} />}
      </section>
      <p className="text-xs leading-5 text-muted-foreground">
        읽기를 돕는 도구예요. 계약서를 대신 쓰거나 고치지 않아요. 대금을 못 받거나 다툼이 생기면 대한법률구조공단 132, 문화예술 분야는 예술인 신문고(한국예술인복지재단)에 물어보세요. 점검 항목 {CONTRACT_ITEMS.length}가지, 기준일 {CONTRACT_AS_OF}.
      </p>
    </div>
  );
}
