// 마크다운 표 만들기 (2026-11-16, Gemini 이전 D). 계산: lib/dev-tools.ts parseDelimited·toMarkdownTable.
import { useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { autoAlign, detectDelimiter, parseDelimited, toCsv, toMarkdownTable, type Align } from "../../../lib/dev-tools";
import { Chips, CopyButton, Field, areaCls, langOf, t } from "./common";

const SAMPLE = {
  ko: "도구,언어,월 방문\n연차 계산기,ko,12400\ncron 해석기,en,3100\nJSON 스키마 검사,en,2750",
  en: "Tool,Locale,Monthly visits\nLeave calculator,ko,12400\nCron explainer,en,3100\nJSON Schema validator,en,2750",
};
const ALIGNS: Align[] = ["left", "center", "right", "none"];
const ALIGN_LABEL = { ko: { left: "왼쪽", center: "가운데", right: "오른쪽", none: "기본" }, en: { left: "Left", center: "Center", right: "Right", none: "Default" } };

export default function MarkdownTableGenerator({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const [text, setText] = useState(SAMPLE[lang]);
  const [pretty, setPretty] = useState(true);
  const [override, setOverride] = useState<Record<number, Align>>({});
  const [out, setOut] = useState<"md" | "csv">("md");
  const delim = detectDelimiter(text);
  const rows = useMemo(() => parseDelimited(text, delim), [text, delim]);
  const auto = autoAlign(rows);
  const aligns = auto.map((a, i) => override[i] ?? a);
  const result = out === "md" ? toMarkdownTable(rows, aligns, pretty) : toCsv(rows);
  const delimName = { ",": t(lang, "쉼표(CSV)", "comma (CSV)"), "\t": t(lang, "탭(엑셀·시트 복사)", "tab (spreadsheet paste)"), ";": t(lang, "세미콜론", "semicolon"), "|": t(lang, "마크다운 표", "Markdown table") }[delim];

  return (
    <div className="space-y-5">
      <Field label={t(lang, "표 붙여 넣기 — 엑셀·구글 시트에서 복사, CSV, 또는 마크다운 표", "Paste a table — from Excel/Sheets, CSV, or an existing Markdown table")} hint={t(lang, `읽은 구분자: ${delimName}`, `Detected delimiter: ${delimName}`)}>
        <textarea value={text} onChange={(e) => { setText(e.target.value); setOverride({}); }} rows={8} spellCheck={false} className={areaCls} />
      </Field>
      <div className="flex flex-wrap items-end gap-4">
        <Chips<"md" | "csv"> legend={t(lang, "만들 형식", "Output")} value={out} onChange={setOut} options={[{ value: "md", label: "Markdown" }, { value: "csv", label: "CSV" }]} />
        {out === "md" && (
          <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} className="size-5" />
            {t(lang, "칸 맞춰 정렬(한글 2칸)", "Pad columns (CJK = 2 cells)")}
          </label>
        )}
      </div>
      {out === "md" && rows[0] && (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows[0].map((h, i) => (
            <label key={i} className="block text-sm">
              <span className="text-muted-foreground">{t(lang, `"${h}" 열 정렬`, `Align "${h}"`)}</span>
              <select value={aligns[i]} onChange={(e) => setOverride({ ...override, [i]: e.target.value as Align })} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base">
                {ALIGNS.map((a) => <option key={a} value={a}>{ALIGN_LABEL[lang][a]}{a === auto[i] ? t(lang, " (자동)", " (auto)") : ""}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}

      <div className="space-y-3 rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        <p className="text-base font-semibold text-foreground">{rows.length ? t(lang, `${rows.length - 1}행 × ${rows[0].length}열 표를 만들었어요.`, `Built a ${rows.length - 1} × ${rows[0].length} table.`) : t(lang, "표를 붙여 넣어 주세요.", "Paste a table to start.")}</p>
        {rows.length > 0 && (
          <>
            <pre className="max-h-80 overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs leading-5 text-foreground">{result}</pre>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>{rows[0].map((h, i) => <th key={i} className={"border-b border-border p-2 font-semibold text-foreground " + (aligns[i] === "right" ? "text-right" : aligns[i] === "center" ? "text-center" : "")}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((r, k) => (
                    <tr key={k}>{rows[0].map((_, i) => <td key={i} className={"border-b border-border p-2 text-foreground " + (aligns[i] === "right" ? "text-right" : aligns[i] === "center" ? "text-center" : "")}>{r[i] ?? ""}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CopyButton text={() => result} lang={lang} label={t(lang, out === "md" ? "마크다운 복사" : "CSV 복사", out === "md" ? "Copy Markdown" : "Copy CSV")} />
          </>
        )}
        <p className="text-xs leading-5 text-muted-foreground">{t(lang, "숫자만 있는 열은 자동으로 오른쪽 정렬해요. 칸 안의 | 기호는 \\|로, 줄바꿈은 <br>로 바꿔요. GitHub·Notion·Obsidian 표 문법(GFM)을 따라요.", "Numeric columns are right-aligned automatically. Pipes become \\| and line breaks <br>. Output follows GitHub-flavored Markdown tables (GitHub, Notion, Obsidian).")}</p>
      </div>
    </div>
  );
}
