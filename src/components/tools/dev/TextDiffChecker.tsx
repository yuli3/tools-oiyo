// 텍스트 비교(diff) (2026-11-16, Gemini 이전 D). 계산: lib/dev-tools.ts diffLines.
import { useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { DIFF_MAX_LINES, diffLines, diffStats, unifiedDiff, type DiffOp } from "../../../lib/dev-tools";
import BarTrack from "../viz/BarTrack";
import { Chips, CopyButton, Field, areaCls, langOf, t } from "./common";

const SAMPLE_A = "name: oiyo-tools\nversion: 1.4.0\nport: 8080\nfeatures:\n  - cron\n  - diff\nlog_level: info";
const SAMPLE_B = "name: oiyo-tools\nversion: 1.5.0\nport: 8080\nfeatures:\n  - cron\n  - diff\n  - json-schema\nlog_level: debug";

export default function TextDiffChecker({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const [a, setA] = useState(SAMPLE_A);
  const [b, setB] = useState(SAMPLE_B);
  const [ignoreSpace, setIgnoreSpace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [view, setView] = useState<"inline" | "changes">("inline");
  const result = useMemo(() => {
    try {
      return { ops: diffLines(a, b, { ignoreSpace, ignoreCase }), error: "" };
    } catch {
      return { ops: [] as DiffOp[], error: "too-many" };
    }
  }, [a, b, ignoreSpace, ignoreCase]);
  const stats = diffStats(result.ops);
  const shown = view === "changes" ? result.ops.filter((o, i, all) => o.type !== "eq" || all.slice(Math.max(0, i - 2), i + 3).some((x) => x.type !== "eq")) : result.ops;
  const pct = Math.round(stats.similarity * 100);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t(lang, "원본(이전)", "Original")}>
          <textarea value={a} onChange={(e) => setA(e.target.value)} rows={10} spellCheck={false} className={areaCls} />
        </Field>
        <Field label={t(lang, "변경본(이후)", "Changed")}>
          <textarea value={b} onChange={(e) => setB(e.target.value)} rows={10} spellCheck={false} className={areaCls} />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex min-h-11 items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={ignoreSpace} onChange={(e) => setIgnoreSpace(e.target.checked)} className="size-5" />{t(lang, "공백 차이 무시", "Ignore whitespace")}</label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="size-5" />{t(lang, "대소문자 무시", "Ignore case")}</label>
        <button type="button" onClick={() => { setA(b); setB(a); }} className="min-h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-muted">{t(lang, "좌우 바꾸기", "Swap")}</button>
      </div>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        {result.error ? (
          <p className="text-sm text-destructive">{t(lang, `한쪽이 ${DIFF_MAX_LINES.toLocaleString()}줄을 넘어 브라우저에서 비교하지 않았어요. 나눠서 넣어 주세요.`, `One side is over ${DIFF_MAX_LINES.toLocaleString()} changed lines. Split it into smaller parts.`)}</p>
        ) : (
          <>
            <p className="text-base font-semibold text-foreground">
              {stats.added + stats.removed === 0
                ? t(lang, "두 글이 같아요.", "The two texts are identical.")
                : t(lang, `${stats.added}줄 추가, ${stats.removed}줄 삭제. 줄 기준으로 ${pct}% 같아요.`, `${stats.added} added, ${stats.removed} removed. ${pct}% of lines match.`)}
            </p>
            <BarTrack segments={[{ from: 0, to: pct, tone: "primary" }, { from: pct, to: 100, tone: "warning" }]} />
            <Chips<"inline" | "changes"> legend={t(lang, "보기", "View")} value={view} onChange={setView} options={[{ value: "inline", label: t(lang, "전체", "All lines") }, { value: "changes", label: t(lang, "바뀐 곳 주변만", "Changes only") }]} />
            <div className="max-h-96 overflow-auto rounded-md border border-border bg-background">
              <table className="w-full border-collapse font-mono text-xs leading-5">
                <tbody>
                  {shown.map((o, i) => (
                    <tr key={i} className={o.type === "add" ? "bg-success/15" : o.type === "del" ? "bg-destructive/15" : ""}>
                      <td className="w-10 select-none px-1 text-right text-muted-foreground">{o.a ?? ""}</td>
                      <td className="w-10 select-none px-1 text-right text-muted-foreground">{o.b ?? ""}</td>
                      <td className="w-4 select-none text-center text-foreground" aria-label={o.type === "add" ? t(lang, "추가", "added") : o.type === "del" ? t(lang, "삭제", "removed") : undefined}>{o.type === "add" ? "+" : o.type === "del" ? "−" : ""}</td>
                      <td className="whitespace-pre-wrap break-all px-1 text-foreground">{o.text || " "}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={() => unifiedDiff(result.ops, 3, ["original", "changed"])} lang={lang} label={t(lang, "unified diff 복사", "Copy unified diff")} />
            </div>
          </>
        )}
        <p className="text-xs leading-5 text-muted-foreground">{t(lang, "글은 이 브라우저 안에서만 비교하고 서버로 보내지 않아요. 줄 단위(LCS) 비교라 한 줄 안에서 바뀐 글자는 줄 전체가 바뀐 것으로 보여요.", "Text is compared in your browser and never uploaded. Comparison is line-based (LCS), so a small edit marks the whole line as changed.")}</p>
      </div>
    </div>
  );
}
