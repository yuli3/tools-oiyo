// 장부 입력 자료 정리기 (2026-11-20). 통장·카드 내역 → 분개 표 → 세무 프로그램 엑셀 업로드 양식 순서의 CSV.
// 쉬운 설명: 붙여넣기 → 확인할 것만 → 내려받기. 전문가: 줄마다 계정 바꾸기, 열 순서 맞추기, 신고 시즌 순서.
// 계산: lib/bookkeeping-bridge-2026.ts. 데이터는 브라우저 밖으로 나가지 않아요.
import { useMemo, useState } from "react";
import { BRIDGE_AS_OF, DEFAULT_ORDER, EXPORT_FIELDS, PROGRAM_NOTES, SAMPLE_BANK, SAMPLE_CARD, orderFromHeader, parseStatement, summarize, toCsv, toJournal, upcomingTasks, type Source } from "../../../lib/bookkeeping-bridge-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const ACCOUNTS = ["복리후생비", "기업업무추진비", "여비교통비", "차량유지비", "통신비", "수도광열비", "소모품비", "지급수수료", "광고선전비", "운반비", "지급임차료", "건물관리비", "보험료", "세금과공과", "교육훈련비", "외주용역비", "급여", "예수금", "미지급금", "미지급세금", "외상매출금", "상품매출", "이자수익", "이자비용", "단기차입금", "가지급금", "미분류"];
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function BookkeepingBridge() {
  const [mode, setMode] = useAdvisoryMode("bookkeeping-bridge");
  const easy = mode === "easy";
  const [source, setSource] = useState<Source>("bank");
  const [text, setText] = useState(SAMPLE_BANK);
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [header, setHeader] = useState(DEFAULT_ORDER.map((k) => EXPORT_FIELDS[k]).join(","));
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseStatement(text, source), [text, source]);
  const lines = useMemo(() => toJournal(parsed.rows, source, { overrides }), [parsed, source, overrides]);
  const s = summarize(lines);
  const order = orderFromHeader(header);
  const csv = toCsv(lines, order.length ? order : DEFAULT_ORDER);
  const tasks = useMemo(() => upcomingTasks(today(), ["all", "employer", "vat", "individual", "corp"], 3).slice(0, 6), []);

  const pickSource = (v: Source) => {
    setSource(v);
    setText(v === "bank" ? SAMPLE_BANK : SAMPLE_CARD);
    setOverrides({});
  };
  const download = () => {
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `전표-${source === "bank" ? "통장" : "카드"}-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    track("bookkeeping_bridge_download", { tool_id: "bookkeeping-bridge", source }, true);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(csv.replace(/,/g, "\t"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const shown = easy ? lines.map((l, i) => ({ l, i })).filter((x) => x.l.flags.length) : lines.map((l, i) => ({ l, i }));

  return (
    <div className="space-y-6">
      <ModeToggle mode={mode} onChange={setMode} />
      <ChoiceChips legend="어떤 내역인가요?" value={source} options={[{ value: "bank", label: "통장 거래내역" }, { value: "card", label: "법인·사업용 카드 내역" }]} onChange={pickSource} />
      <label className="block">
        <span className="text-sm font-medium text-muted-foreground">은행·카드사에서 내려받은 엑셀을 복사해 붙여 넣으세요 (머리글 포함, 쉼표나 탭)</span>
        <textarea className="mt-1 h-44 w-full rounded-md border border-border bg-background p-3 font-mono text-base text-foreground" value={text} onChange={(e) => { setText(e.target.value); setOverrides({}); }} spellCheck={false} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => pickSource(source)}>예시 데이터</button>
        <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => setText("")}>비우기</button>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        읽은 거래 {s.n}건{parsed.skipped ? ` · 건너뛴 줄 ${parsed.skipped}개(머리글 포함)` : ""}{parsed.guessed && s.n ? " · 머리글이 없어 날짜·내용·출금·입금 순서로 읽었어요" : ""} · 데이터는 이 브라우저 밖으로 나가지 않아요.
      </p>

      <section aria-labelledby="bb-sum" className="grid gap-2 sm:grid-cols-4">
        <h3 id="bb-sum" className="sr-only">요약</h3>
        {[
          ["분개한 거래", `${s.n}건`],
          ["계정 미정", `${s.unclassified}건`],
          ["확인할 거래", `${s.flagged}건`],
          ["카드 매입세액(공제 후보)", won(s.vat)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="font-mono text-lg font-semibold text-foreground">{v}</p>
          </div>
        ))}
      </section>

      {s.byAccount.length > 0 && <CompareBars title="계정별 금액" caption="추천 계정 기준이에요. 아래에서 바꾸면 바로 다시 계산해요." items={s.byAccount.slice(0, 8).map((x) => ({ label: x.account, value: x.amount, current: x.account === "미분류" }))} format={won} />}

      <section aria-labelledby="bb-lines" className="space-y-2">
        <h3 id="bb-lines" className="text-base font-semibold text-foreground">{easy ? `먼저 확인할 거래 ${shown.length}건` : `분개 ${lines.length}줄`}</h3>
        {easy && shown.length === 0 && <p className="text-sm text-muted-foreground">확인할 거래가 없어요. 아래에서 내려받으세요.</p>}
        <ul className="space-y-2">
          {shown.slice(0, 200).map(({ l, i }) => (
            <li key={i} className="rounded-md border border-border bg-background p-3 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-foreground">{l.date} · {l.memo || "(내용 없음)"}</p>
                <p className="font-mono text-foreground">{won(l.amount)}{l.vat ? ` (부가세 ${won(l.vat)})` : ""}</p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>차변</span>
                {l.credit === "보통예금" || l.credit === "미지급금" ? (
                  <AccountPick value={l.debit} onChange={(v) => setOverrides({ ...overrides, [i]: v })} id={`acc-${i}`} />
                ) : (
                  <span className="font-semibold text-foreground">{l.debit}</span>
                )}
                <span>/ 대변</span>
                {l.credit === "보통예금" || l.credit === "미지급금" ? (
                  <span className="font-semibold text-foreground">{l.credit}</span>
                ) : (
                  <AccountPick value={l.credit} onChange={(v) => setOverrides({ ...overrides, [i]: v })} id={`acc-${i}`} />
                )}
                <span>· 증빙 {l.evidence}</span>
              </div>
              {l.suggestion.note && <p className="mt-1 text-xs text-muted-foreground">{l.suggestion.note}</p>}
              {l.flags.length > 0 && (
                <p className="mt-1 flex flex-wrap gap-1">
                  {l.flags.map((f) => (
                    <span key={f} className="rounded bg-muted px-2 py-0.5 text-xs text-foreground">{f}</span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="bb-export" className="space-y-3 rounded-md border border-border bg-background p-4">
        <h3 id="bb-export" className="text-base font-semibold text-foreground">세무 프로그램에 넣기</h3>
        {!easy && (
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">열 순서: 프로그램 엑셀 업로드 샘플의 첫 줄(머리글)을 붙여 넣으세요</span>
            <input className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground" value={header} onChange={(e) => setHeader(e.target.value)} />
            <span className="mt-1 block text-xs text-muted-foreground">알아들은 열: {(order.length ? order : DEFAULT_ORDER).map((k) => EXPORT_FIELDS[k]).join(" · ")}. 계정코드 열은 회사 계정과목표에서 채워요.</span>
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={download} disabled={!lines.length} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">CSV 내려받기</button>
          <button type="button" onClick={copy} disabled={!lines.length} className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50">{copied ? "복사했어요" : "엑셀에 붙일 표 복사"}</button>
        </div>
        <ul className="space-y-1 text-xs leading-5 text-muted-foreground">
          {PROGRAM_NOTES.map((p) => (
            <li key={p.name}><span className="font-semibold text-foreground">{p.name}</span>: {p.how}</li>
          ))}
        </ul>
      </section>

      {!easy && (
        <section aria-labelledby="bb-season" className="space-y-2">
          <h3 id="bb-season" className="text-base font-semibold text-foreground">다가오는 신고와 프로그램 작업 순서</h3>
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="rounded-md border border-border bg-background p-3 text-sm">
                <p className="font-semibold text-foreground">{t.label} · {t.due} (D-{t.daysLeft})</p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
                  {t.steps.map((st) => <li key={st}>{st}</li>)}
                </ol>
                <p className="mt-1 text-xs text-muted-foreground">{t.cite}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        계정 추천은 거래 내용의 낱말로 고른 출발점이에요. 실제 용도와 회사 계정과목표로 확정하고, 장부 작성·신고 대리는 세무 대리인 업무예요(세무사법 제2조). 기준일 {BRIDGE_AS_OF}.
      </p>
    </div>
  );
}

function AccountPick({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <>
      <label htmlFor={id} className="sr-only">계정과목</label>
      <select id={id} value={ACCOUNTS.includes(value) ? value : ""} onChange={(e) => onChange(e.target.value)} className="min-h-11 rounded-md border border-border bg-background px-2 text-base text-foreground">
        {!ACCOUNTS.includes(value) && <option value="">{value}</option>}
        {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
    </>
  );
}
