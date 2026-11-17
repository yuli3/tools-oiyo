// 전표 데이터 분석기 (2026-11-17, 역량 지도 cpa-data). 브라우저 안에서만 계산하고 데이터를 보내지 않아요.
// 계산: lib/pro-practice-2026.ts parseEntries·analyzeEntries
import { useMemo, useState } from "react";
import { BENFORD, BENFORD_FIT, SAMPLE_ENTRIES, analyzeEntries, parseEntries, type AuditFlags } from "../../../lib/pro-practice-2026";
import { KR_HOLIDAYS } from "../../../lib/kr-business-day";
import NumberField from "../payroll/NumberField";
import BarTrack from "../viz/BarTrack";

const FLAG_LABEL: Record<keyof AuditFlags, string> = {
  duplicate: "같은 날·계정·금액 중복",
  belowLimit: "결재 한도 바로 아래(95~100%)",
  weekend: "주말·공휴일 입력",
  round: "100만 원 단위 딱 떨어짐",
  periodEnd: "월말 3일·연초 5일",
};
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const pct = (v: number) => `${(Math.round(v * 1000) / 10).toFixed(1)}%`;
const holidays = Object.entries(KR_HOLIDAYS).flatMap(([y, list]) => list.map((md) => `${y}-${md}`));

export default function AuditAnalytics() {
  const [text, setText] = useState(SAMPLE_ENTRIES);
  const [limit, setLimit] = useState(5_000_000);
  const parsed = useMemo(() => parseEntries(text), [text]);
  const a = useMemo(() => analyzeEntries(parsed.rows, { approvalLimit: limit, holidays }), [parsed, limit]);

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="text-sm font-medium text-muted-foreground">전표 붙여넣기 (한 줄에 날짜, 계정, 금액, 적요, 입력자 · 쉼표나 탭으로 구분)</span>
        <textarea
          className="mt-1 h-48 w-full rounded-md border border-border bg-background p-3 font-mono text-base text-foreground"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
      </label>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-60">
          <NumberField label="결재 한도(이 금액부터 윗선 결재)" value={limit} onChange={setLimit} suffix="원" step={100_000} />
        </div>
        <button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => setText(SAMPLE_ENTRIES)}>예시 데이터</button>
        <button type="button" className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => setText("")}>비우기</button>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        읽은 전표 {a.n.toLocaleString("ko-KR")}건{parsed.skipped ? ` · 날짜·금액을 못 읽은 줄 ${parsed.skipped}개(머리글 포함)` : ""} · 데이터는 이 브라우저 밖으로 나가지 않아요.
      </p>

      <section aria-labelledby="flag-title" className="space-y-2">
        <h3 id="flag-title" className="text-base font-semibold text-foreground">먼저 볼 신호</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(FLAG_LABEL) as (keyof AuditFlags)[]).map((k) => (
            <li key={k} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
              <span className="text-foreground">{FLAG_LABEL[k]}</span>
              <span className="font-mono font-semibold text-foreground">{a.total[k]}건</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="benford-title" className="space-y-2">
        <h3 id="benford-title" className="text-base font-semibold text-foreground">벤포드 첫 자리 분포: {BENFORD_FIT[a.fit as keyof typeof BENFORD_FIT]}</h3>
        <p className="text-xs text-muted-foreground">평균 절대 편차(MAD) {a.mad.toFixed(4)} · 금액 {a.benfordN}건 기준. 건수가 수백 건은 넘어야 의미가 있어요(Nigrini 기준 0.012 이하면 맞는 편).</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-120 border-collapse text-xs">
            <thead>
              <tr className="bg-muted text-foreground">
                <th scope="col" className="p-2 text-left">첫 자리</th>
                <th scope="col" className="p-2 text-left">실제 vs 기대</th>
                <th scope="col" className="p-2 text-right">실제</th>
                <th scope="col" className="p-2 text-right">기대</th>
              </tr>
            </thead>
            <tbody>
              {BENFORD.map((e, d) => (
                <tr key={d} className="border-t border-border">
                  <th scope="row" className="p-2 text-left font-semibold text-foreground">{d + 1}</th>
                  <td className="p-2">
                    <BarTrack segments={[{ from: 0, to: a.observed[d] * 250, tone: "primary" }]} marker={e * 250} />
                  </td>
                  <td className="p-2 text-right font-mono text-foreground">{pct(a.observed[d])}</td>
                  <td className="p-2 text-right font-mono text-muted-foreground">{pct(e)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="list-title" className="space-y-2">
        <h3 id="list-title" className="text-base font-semibold text-foreground">살펴볼 전표 {a.flagged.length}건 (위험 신호가 많은 순)</h3>
        <ul className="space-y-2">
          {a.flagged.slice(0, 50).map((f, i) => (
            <li key={i} className="rounded-md border border-border bg-background p-3 text-sm">
              <p className="font-semibold text-foreground">
                {f.entry.date} · {f.entry.account} · {won(f.entry.amount)}
              </p>
              {(f.entry.memo || f.entry.user) && <p className="text-xs text-muted-foreground">{[f.entry.memo, f.entry.user].filter(Boolean).join(" · ")}</p>}
              <p className="mt-1 flex flex-wrap gap-1">
                {(Object.keys(f.flags) as (keyof AuditFlags)[])
                  .filter((k) => f.flags[k])
                  .map((k) => (
                    <span key={k} className="rounded bg-muted px-2 py-0.5 text-xs text-foreground">{FLAG_LABEL[k]}</span>
                  ))}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">
        신호는 부정이나 오류의 증거가 아니라 먼저 확인할 순서예요. 감사 절차와 감사의견은 공인회계사·감사인이 판단해요. 외부감사법 제6조의 회계처리기준, 감사기준서 240(부정)·520(분석적 절차)을 함께 보세요.
      </p>
    </div>
  );
}
