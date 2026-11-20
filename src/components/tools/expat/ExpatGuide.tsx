// Korea guide for foreign residents (2026-11-20, next-10 #7). Engine: lib/korea-expat-guide-2026.ts (same code as the
// oiyo-korea-expat-guide skill). Easy: nearest deadline + matching topics. Expert: citations and every topic.
import { useState } from "react";
import { EXPAT_AS_OF, EXPAT_NOTE, EXPAT_TOPICS, expatDeadlines, suggestExpatTopics, type ExpatInput } from "../../../lib/korea-expat-guide-2026";
import ModeToggle from "../viz/ModeToggle";
import { VizLangProvider } from "../viz/i18n";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";

const TOOL_ID = "korea-foreign-resident-guide";
const FIELDS: { key: keyof ExpatInput; label: string }[] = [
  { key: "arrival", label: "Date you entered Korea" },
  { key: "moved", label: "Date you moved (new address)" },
  { key: "expiry", label: "Last day of stay on your residence card" },
  { key: "changed", label: "Date your passport, employer or school changed" },
  { key: "leftJob", label: "Date you left your job" },
  { key: "injury", label: "Date of a work accident" },
];
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const left = (n?: number) => (n === undefined ? "" : n < 0 ? `${-n} days ago` : n === 0 ? "today" : `in ${n} days`);

function Guide() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const easy = mode === "easy";
  const [input, setInput] = useState<ExpatInput>({ arrival: "" });
  const [question, setQuestion] = useState("");
  const today = todayIso();
  const deadlines = expatDeadlines(input, today);
  const next = deadlines.find((d) => (d.daysLeft ?? 0) >= 0);
  const picked = suggestExpatTopics(question);
  const topics = easy ? (picked.length ? picked : EXPAT_TOPICS.slice(0, 3)) : EXPAT_TOPICS;

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="Your dates" className="space-y-3">
        <p className="text-sm text-muted-foreground">Fill in only the dates you know. Nothing is sent to a server.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.filter((f) => !easy || ["arrival", "moved", "expiry", "leftJob"].includes(f.key)).map((f) => (
            <label key={f.key} className="block">
              <span className="text-sm font-medium text-muted-foreground">{f.label}</span>
              <input
                type="date"
                value={input[f.key] ?? ""}
                onChange={(e) => {
                  setInput({ ...input, [f.key]: e.target.value });
                  track("expat_date", { tool_id: TOOL_ID, field: f.key }, true);
                }}
                className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base"
              />
            </label>
          ))}
        </div>
      </section>

      <div className="space-y-3 rounded-md border border-border bg-card px-4 py-4">
        <p aria-live="polite" className="text-lg font-semibold leading-7 text-foreground">
          {next ? `Next: ${next.label} by ${next.due} (${left(next.daysLeft)}).` : deadlines.length ? "All deadlines from your dates have passed. Check the help lines below." : "Enter a date to see your deadlines."}
        </p>
        {deadlines.length > 0 && (
          <ul className="space-y-2">
            {deadlines.map((d) => (
              <li key={d.id} className="flex flex-wrap items-baseline justify-between gap-x-3 rounded-md border border-border bg-background p-3 text-sm">
                <span className="font-semibold text-foreground">{d.label}</span>
                <span className={`font-mono text-xs ${(d.daysLeft ?? 0) < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {d.due} · {left(d.daysLeft)}
                  {d.shifted ? " · moved past a weekend or holiday" : ""}
                </span>
                {!easy && <span className="w-full text-xs text-muted-foreground">{d.cite}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <section aria-labelledby="expat-topics" className="space-y-3">
        <h2 id="expat-topics" className="text-base font-semibold text-foreground">{easy ? "What do you need help with?" : "All topics"}</h2>
        {easy && (
          <label className="block">
            <span className="text-sm text-muted-foreground">Describe your situation in a few words (e.g. "my boss did not pay my salary")</span>
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
          </label>
        )}
        <ul className="space-y-3">
          {topics.map((t) => (
            <li key={t.id} className="rounded-md border border-border bg-background p-3 text-sm">
              <h3 className="font-semibold text-foreground">{t.title}</h3>
              <p className="mt-1 leading-6 text-foreground">{t.summary}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-5 text-foreground">
                {t.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
              <p className="mt-2 text-xs text-foreground">Help: {t.help.map((h) => `${h.name} (${h.how})`).join(" · ")}</p>
              {!easy && <p className="text-xs text-muted-foreground">Law: {t.cite.join("; ")}</p>}
            </li>
          ))}
        </ul>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">{EXPAT_NOTE} Checked {EXPAT_AS_OF}.</p>
    </div>
  );
}

export default function ExpatGuide() {
  return (
    <VizLangProvider value={{ lang: "en", currency: "KRW" }}>
      <Guide />
    </VizLangProvider>
  );
}
