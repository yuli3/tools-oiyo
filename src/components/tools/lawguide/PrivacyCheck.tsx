// 개인정보 유출 72시간·처리방침 점검 (2026-11-20, 다음 10종 #2). 계산: lib/privacy-check-2026.ts (스킬 guide.mjs calc breach|policy와 같은 코드).
// 쉬운 모드: 남은 시간 하나와 할 일 순서, 빠진 항목만. 전문가: 근거 조문, 찾은 문장, 메모 복사.
import { useEffect, useState } from "react";
import { POLICY_ITEMS, PRIVACY_AS_OF, SAMPLE_POLICY, breachClock, checkPolicy, parseAt, type BreachInput, type PolicyContext } from "../../../lib/privacy-check-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import BarTrack from "../viz/BarTrack";
import ModeToggle from "../viz/ModeToggle";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, useSaved } from "../biz/common";

const TOOL_ID = "privacy-breach-policy-check";
const nowLocal = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
type Tab = "breach" | "policy";
const CTX: { key: keyof PolicyContext; label: string }[] = [
  { key: "website", label: "홈페이지·앱으로 받아요" },
  { key: "outsource", label: "택배·결제·호스팅을 맡겨요" },
  { key: "thirdParty", label: "다른 회사에 넘겨요" },
  { key: "overseas", label: "해외로 옮겨요" },
];

function leftText(ms: number) {
  if (ms <= 0) return "마감이 지났어요";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}시간 ${m}분 남았어요`;
}

export default function PrivacyCheck() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const easy = mode === "easy";
  const [tab, setTab] = useState<Tab>("breach");
  const [b, setB] = useSaved<BreachInput>("privacy-breach-input", { knownAt: "", affected: 200, sensitive: false, hacking: false, contactUnknown: false });
  const [ctx, setCtx] = useSaved<PolicyContext>("privacy-policy-ctx", { website: true, outsource: true });
  const [text, setText] = useState(SAMPLE_POLICY);
  // 서버 렌더와 첫 화면을 맞추려고 현재 시각은 브라우저에서만 읽어요.
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!b.knownAt) setB({ ...b, knownAt: nowLocal() });
  }, [b, setB]);

  const r = breachClock(b);
  const due = parseAt(r.deadline);
  const left = due ? due.getTime() - now : 0;
  const elapsed = Math.min(1, Math.max(0, 1 - left / (72 * 3_600_000)));
  const p = checkPolicy(text, ctx);
  const editB = (x: Partial<BreachInput>) => setB({ ...b, ...x });

  const breachMemo = () =>
    [
      `[개인정보 유출 대응] 기준일 ${PRIVACY_AS_OF}`,
      `알게 된 때 ${r.knownAt} → 통지${r.report ? "·신고" : ""} 마감 ${r.deadline}`,
      r.report ? `신고 대상: ${r.reportReasons.join(", ")} → ${r.reportTo}` : "신고 의무 기준 아래(통지는 필수)",
      "통지문 필수 내용:",
      ...r.noticeItems.map((x, i) => `${i + 1}. ${x}`),
      ...r.steps.map((s) => `- ${s.when}: ${s.what} (${s.cite})`),
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");
  const policyMemo = () =>
    [
      `[처리방침 점검] 기준일 ${PRIVACY_AS_OF}: ${p.found}/${p.required} 항목 찾음`,
      ...p.items.map((i) => `${i.found ? "[v]" : "[ ]"} ${i.label} (${i.cite})`),
      ...p.notes.map((n) => `* ${n}`),
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <ChoiceChips<Tab> legend="무엇을 확인할까요?" value={tab} options={[{ value: "breach", label: "유출이 생겼어요(72시간)" }, { value: "policy", label: "처리방침 점검" }]} onChange={(v) => { setTab(v); track("privacy_check_tab", { tool_id: TOOL_ID, tab: v }); }} />

      {tab === "breach" ? (
        <section aria-label="유출 대응" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">유출을 알게 된 날짜와 시각</span>
              <input type="datetime-local" value={b.knownAt} onChange={(e) => editB({ knownAt: e.target.value })} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-muted-foreground">관련된 사람 수(추정)</span>
              <input type="number" inputMode="numeric" min={0} value={Number.isFinite(b.affected) ? b.affected : ""} onChange={(e) => editB({ affected: e.target.value === "" ? NaN : Number(e.target.value) })} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ["sensitive", "주민번호·건강 등 민감한 정보 포함"],
              ["hacking", "해킹 등 외부 공격"],
              ["contactUnknown", "연락처를 모르는 사람이 있어요"],
            ] as const).map(([k, label]) => (
              <button key={k} type="button" aria-pressed={!!b[k]} onClick={() => editB({ [k]: !b[k] })} className={`min-h-11 rounded-full border px-3 text-sm ${b[k] ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-3 rounded-md border border-border bg-card px-4 py-4">
            <p aria-live="polite" className="text-lg font-semibold leading-7 text-foreground">
              {r.report ? "정보주체 통지와 기관 신고" : "정보주체 통지"} 마감은 {r.deadline}이에요.{now ? ` ${leftText(left)}.` : ""}
            </p>
            <div role="img" aria-label={`72시간 중 ${Math.round(elapsed * 100)}% 지남`}>
              <BarTrack segments={[{ from: 0, to: elapsed * 100, tone: left <= 0 ? "destructive" : elapsed > 0.66 ? "warning" : "primary" }]} />
            </div>
            <p className="text-sm text-foreground">
              {r.report ? `신고 대상이에요: ${r.reportReasons.join(", ")}. ${r.reportTo}.` : "인원·정보 종류로는 신고 의무 기준 아래예요. 정보주체 통지는 꼭 해야 해요."}
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-foreground">
              {r.steps.map((s) => (
                <li key={s.what}>
                  <span className="font-semibold">{s.when}</span> {s.what}
                  {!easy && <span className="text-xs text-muted-foreground"> · {s.cite}</span>}
                </li>
              ))}
            </ol>
            <div className="rounded-md bg-muted px-3 py-3">
              <h3 className="text-sm font-semibold text-foreground">통지문에 꼭 넣을 다섯 가지</h3>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-foreground">
                {r.noticeItems.map((x) => <li key={x}>{x}</li>)}
              </ol>
            </div>
            {!easy && <CopyMemo text={breachMemo} />}
          </div>
        </section>
      ) : (
        <section aria-label="처리방침 점검" className="space-y-4">
          <fieldset>
            <legend className="text-sm font-medium text-muted-foreground">해당하는 것을 눌러 주세요</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CTX.map((c) => (
                <button key={c.key} type="button" aria-pressed={!!ctx[c.key]} onClick={() => setCtx({ ...ctx, [c.key]: !ctx[c.key] })} className={`min-h-11 rounded-full border px-3 text-sm ${ctx[c.key] ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">지금 쓰는 개인정보 처리방침을 붙여 넣으세요(서버로 보내지 않아요)</span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} className="mt-1 h-48 w-full rounded-md border border-border bg-background p-3 text-base text-foreground" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setText(SAMPLE_POLICY)} className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">예시</button>
            <button type="button" onClick={() => setText("")} className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">비우기</button>
          </div>
          <div className="space-y-3 rounded-md border border-border bg-card px-4 py-4">
            <p aria-live="polite" className="text-lg font-semibold leading-7 text-foreground">
              꼭 들어갈 {p.required}가지 중 {p.found}가지를 찾았어요{p.missing.length ? `. ${p.missing.length}가지가 빠진 것 같아요.` : "."}
            </p>
            <div role="img" aria-label={`필수 항목 ${p.found}/${p.required}`}>
              <BarTrack segments={[{ from: 0, to: p.required ? (p.found / p.required) * 100 : 0, tone: "primary" }]} />
            </div>
            <ul className="space-y-2">
              {(easy ? p.missing : p.items).map((i) => (
                <li key={i.id} className="rounded-md border border-border bg-background p-3 text-sm">
                  <p className="flex flex-wrap items-baseline justify-between gap-2 font-semibold text-foreground">
                    <span>{i.found ? "✓" : "✗"} {i.label}</span>
                    {!easy && <span className="text-xs font-normal text-muted-foreground">{i.cite}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{i.found && !easy ? `찾은 문장: ${i.evidence}` : `넣을 내용: ${i.why}`}</p>
                </li>
              ))}
            </ul>
            <ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
              {p.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
            {!easy && <CopyMemo text={policyMemo} />}
          </div>
        </section>
      )}
      <p className="text-xs leading-5 text-muted-foreground">
        판단을 돕는 도구예요. 유출 신고·처리방침 작성을 대신하지 않아요. 문의: 개인정보침해신고센터 118, 개인정보 포털 privacy.go.kr. 점검 항목 {POLICY_ITEMS.length}가지, 기준일 {PRIVACY_AS_OF}.
      </p>
    </div>
  );
}
