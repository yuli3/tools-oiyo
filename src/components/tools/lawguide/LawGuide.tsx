// 법령 길잡이 (2026-11-16, 11-17 분야 팩으로 10분야, 11-20 17분야). 분야 목록은 엔진의 DOMAIN_LABEL에서 와요. 계산·자료: lib/kr-expert-guide-2026.ts.
// 쉬운 설명: 상황 고르기 → 한 번에 한 질문(왜 묻는지 함께) → 기한·조문·할 일.
// 전문가: 질문 전체를 한 화면에, 조문 찾기와 자격사 업무 범위 표.
// 가정 변화: "며칠 뒤에 움직이면?" 슬라이더로 어느 기한을 놓치는지 막대가 바로 바뀌어요.
import { useMemo, useState } from "react";
import { DISCLAIMER, DOMAIN_LABEL, LAW_GUIDE_AS_OF, PROFESSIONS, SCOPE_MATRIX, domainTopics, findStatutes, intake, statuteUrl, visibleQuestions, type Answers, type DomainId, type Question, type Topic } from "../../../lib/kr-expert-guide-2026";
import { useSaved, CopyMemo } from "../biz/common";
import ChoiceChips from "../payroll/ChoiceChips";
import BarTrack from "../viz/BarTrack";
import DeadlineChart from "../viz/DeadlineChart";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";

const DOMAIN_IDS = Object.keys(DOMAIN_LABEL) as DomainId[];
const DOMAINS: { value: DomainId; label: string }[] = DOMAIN_IDS.map((d) => ({ value: d, label: DOMAIN_LABEL[d].area }));
const MATRIX_COLS = [...DOMAIN_IDS, "lawyer"] as const;
const UNIT = { months: "개월", days: "일", people: "명", count: "개", years: "년", sqm: "㎡" } as const;
const TONE = { warn: "border-destructive/40", info: "border-border", good: "border-primary/40" } as const;
const TONE_LABEL = { warn: "주의", info: "참고", good: "유리" } as const;
const SKIP = "skip";

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function show(q: Question, v: Answers[string]): string {
  if (v === SKIP) return "모름";
  if (q.kind === "yesno") return v === "yes" ? "예" : "아니요";
  if (q.kind === "choice") return q.options?.find((o) => o.value === v)?.label ?? String(v);
  if (q.kind === "number" && typeof v === "number") return q.unit === "won" ? `${v.toLocaleString("ko-KR")}원` : `${v.toLocaleString("ko-KR")}${q.unit ? UNIT[q.unit as keyof typeof UNIT] : ""}`;
  return String(v);
}

// WHY(11-20 세운 제보): 쉬운 모드에서 숫자 한 자리만 쳐도 다음 질문으로 넘어갔어요.
//   step이면 숫자·날짜·금액은 "다음"(또는 Enter)을 눌러야 답이 확정돼요. 전문가 모드는 그대로 바로 반영해요.
function QuestionInput({ q, value, onAnswer, step = false }: { q: Question; value: Answers[string]; onAnswer: (v: Answers[string]) => void; step?: boolean }) {
  const [held, setHeld] = useState<Answers[string]>(value);
  if (step && q.kind !== "choice" && q.kind !== "yesno") {
    const ready = held !== undefined && held !== "" && !(typeof held === "number" && !Number.isFinite(held));
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onAnswer(held);
        }}
        className="space-y-2"
      >
        <QuestionField q={q} value={held} onAnswer={setHeld} />
        <button type="submit" disabled={!ready} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          다음
        </button>
      </form>
    );
  }
  return <QuestionField q={q} value={value} onAnswer={onAnswer} />;
}

function QuestionField({ q, value, onAnswer }: { q: Question; value: Answers[string]; onAnswer: (v: Answers[string]) => void }) {
  const [draft, setDraft] = useState<string>(typeof value === "string" || typeof value === "number" ? String(value) : "");
  if (q.kind === "choice" || q.kind === "yesno") {
    const options = q.kind === "yesno" ? [{ value: "yes", label: "예" }, { value: "no", label: "아니요" }] : (q.options ?? []);
    return <ChoiceChips legend={q.ask} value={String(value ?? "")} options={options} onChange={(v) => onAnswer(v)} />;
  }
  if (q.kind === "number" && q.unit === "won") {
    return <MoneyField label={q.ask} value={typeof value === "number" ? value : NaN} onChange={(v) => onAnswer(v)} />;
  }
  const id = `q-${q.key}`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {q.ask}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={id}
          type={q.kind === "date" ? "date" : "number"}
          inputMode={q.kind === "number" ? "numeric" : undefined}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (e.target.value === "") return;
            onAnswer(q.kind === "number" ? Number(e.target.value) : e.target.value);
          }}
          className="min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-base text-foreground"
        />
        {q.unit && q.kind === "number" && <span className="self-center text-sm text-muted-foreground">{UNIT[q.unit as keyof typeof UNIT]}</span>}
      </div>
    </div>
  );
}

export default function LawGuide({ domain: fixed }: { domain?: DomainId }) {
  const toolId = `law-guide-${fixed ?? "all"}`;
  const [mode, setMode] = useAdvisoryMode(toolId);
  const easy = mode === "easy";
  const [domain, setDomain] = useState<DomainId>(fixed ?? "labor");
  const topics = domainTopics(domain);
  const [topicId, setTopicId] = useState<string>(topics[0].id);
  const topic: Topic = topics.find((t) => t.id === topicId) ?? topics[0];
  const [all, setAll] = useSaved<Record<string, Answers>>("law-guide-answers", {});
  const answers = all[topic.id] ?? {};
  const [delay, setDelay] = useState(0);
  const [query, setQuery] = useState("");
  const today = todayIso();
  const prof = PROFESSIONS[domain];

  const clean: Answers = useMemo(() => Object.fromEntries(Object.entries(answers).filter(([, v]) => v !== SKIP)), [answers]);
  const r = intake(topic.id, clean, today, 1);
  const qs = visibleQuestions(topic, { ...answers, today });
  const pending = qs.filter((q) => answers[q.key] === undefined);
  const next = pending.find((q) => q.required) ?? pending[0];

  const answer = (key: string, v: Answers[string]) => {
    setAll({ ...all, [topic.id]: { ...answers, [key]: v } });
    track("law_guide_answer", { tool_id: toolId, topic: topic.id }, true);
  };
  const resetTopic = () => {
    const rest = { ...all };
    delete rest[topic.id];
    setAll(rest);
    setDelay(0);
  };
  const pickDomain = (d: DomainId) => {
    setDomain(d);
    setTopicId(domainTopics(d)[0].id);
    setDelay(0);
  };

  const memo = () =>
    [
      `[${prof.name}] ${topic.label} (기준일 ${today})`,
      "",
      "내 상황",
      ...qs.filter((q) => answers[q.key] !== undefined).map((q) => `- ${q.ask} → ${show(q, answers[q.key])}`),
      ...(pending.length ? ["", "아직 모르는 것", ...pending.map((q) => `- ${q.ask}`)] : []),
      ...(r.deadlines.length ? ["", "기한", ...r.deadlines.map((d) => `- ${d.label}: ${d.due} (${d.daysLeft < 0 ? `${-d.daysLeft}일 지남` : `D-${d.daysLeft}`}, ${d.cite})`)] : []),
      ...(r.flags.length ? ["", "확인할 점", ...r.flags.map((f) => `- ${f.text}${f.cite ? ` (${f.cite})` : ""}`)] : []),
      "",
      "가져갈 서류",
      ...r.documents.map((d) => `- ${d}`),
      "",
      `근거: ${r.statutes.map((s) => `${s.law} ${s.article}`).join(", ")}`,
      "",
      DISCLAIMER,
    ].join("\n");

  const found = useMemo(() => findStatutes(query, easy ? domain : undefined, 10), [query, domain, easy]);

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />

      {!fixed && <ChoiceChips legend="어떤 분야인가요?" value={domain} options={DOMAINS} onChange={pickDomain} />}

      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">어떤 일이 있었나요?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {topics.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={t.id === topic.id}
              onClick={() => {
                setTopicId(t.id);
                setDelay(0);
              }}
              className={"min-h-11 rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors " + (t.id === topic.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="text-sm leading-6 text-foreground">{topic.plain}</p>

      <section aria-labelledby="readiness" className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="readiness" className="text-sm font-semibold text-foreground">
            상담 준비 {r.readiness}%
          </h3>
          <span className="text-xs text-muted-foreground">
            질문 {qs.length - pending.length}/{qs.length}
          </span>
        </div>
        <BarTrack segments={[{ from: 0, to: r.readiness, tone: r.readiness === 100 ? "primary" : "warning" }]} />
      </section>

      {easy ? (
        <section className="space-y-3 rounded-md border border-border bg-background p-4" aria-live="polite">
          {next ? (
            <>
              <p className="text-xs font-semibold text-primary">먼저 물어볼게요{next.required ? "" : " (선택)"}</p>
              <QuestionInput key={topic.id + next.key} step q={next} value={answers[next.key]} onAnswer={(v) => answer(next.key, v)} />
              <p className="text-xs leading-5 text-muted-foreground">왜 묻나요? {next.why}</p>
              <button type="button" onClick={() => answer(next.key, SKIP)} className="min-h-11 text-sm text-muted-foreground underline">
                모르겠어요, 다음 질문
              </button>
            </>
          ) : (
            <p className="text-sm font-semibold text-foreground">질문을 다 했어요. 아래 기한과 확인할 점을 보세요.</p>
          )}
          {qs.some((q) => answers[q.key] !== undefined) && (
            <details>
              <summary className="cursor-pointer text-xs text-muted-foreground">내 답 고치기</summary>
              <ul className="mt-2 space-y-1 text-xs">
                {qs
                  .filter((q) => answers[q.key] !== undefined)
                  .map((q) => (
                    <li key={q.key} className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-muted-foreground">{q.ask}</span>
                      <button
                        type="button"
                        className="min-h-11 font-semibold text-foreground underline"
                        onClick={() => {
                          const rest = { ...answers };
                          delete rest[q.key];
                          setAll({ ...all, [topic.id]: rest });
                        }}
                      >
                        {show(q, answers[q.key])} 다시 답하기
                      </button>
                    </li>
                  ))}
              </ul>
            </details>
          )}
        </section>
      ) : (
        <section className="space-y-4 rounded-md border border-border bg-background p-4">
          {qs.map((q) => (
            <div key={topic.id + q.key}>
              <QuestionInput q={q} value={answers[q.key] === SKIP ? undefined : answers[q.key]} onAnswer={(v) => answer(q.key, v)} />
              <p className="mt-1 text-xs text-muted-foreground">
                {q.required ? "필수 · " : ""}
                {q.why}
              </p>
            </div>
          ))}
        </section>
      )}

      {r.deadlines.length > 0 && (
        <section className="space-y-3">
          <DeadlineChart
            title="기한까지 남은 날"
            caption={easy ? "막대가 짧을수록 급해요. 아래에서 며칠 뒤에 움직일지 바꿔 보세요." : "초일 불산입, 말일이 토·일·공휴일이면 다음 날(국세는 근로자의 날 포함)로 계산했어요."}
            rows={r.deadlines}
            delay={delay}
          />
          <div className="rounded-md border border-border bg-background px-3 py-2">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor="law-delay" className="text-sm text-muted-foreground">
                며칠 뒤에 움직이면?
              </label>
              <span className="font-mono text-sm font-semibold text-foreground">{delay === 0 ? "오늘" : `${delay}일 뒤`}</span>
            </div>
            <input
              id="law-delay"
              type="range"
              min={0}
              max={180}
              step={1}
              value={delay}
              onChange={(e) => {
                setDelay(Number(e.target.value));
                track("law_guide_delay", { tool_id: toolId }, true);
              }}
              className="mt-2 h-11 w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              {(() => {
                const miss = r.deadlines.filter((d) => d.daysLeft >= 0 && d.daysLeft < delay);
                const gone = r.deadlines.filter((d) => d.daysLeft < 0);
                if (gone.length && !miss.length) return `이미 지난 기한이 ${gone.length}개 있어요. 지났어도 다른 길(재심사·기한 후 신고 등)이 있는지 확인하세요.`;
                return miss.length ? `${delay}일 뒤에 움직이면 놓치는 기한: ${miss.map((d) => d.label).join(", ")}.` : "이 날짜까지는 놓치는 기한이 없어요.";
              })()}
            </p>
          </div>
        </section>
      )}

      {r.flags.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">확인할 점</h3>
          <ul className="space-y-2">
            {r.flags.map((f, i) => (
              <li key={i} className={"rounded-md border bg-background px-3 py-2 text-sm leading-6 " + TONE[f.tone]}>
                <span className="mr-1 text-xs font-semibold text-muted-foreground">{TONE_LABEL[f.tone]}</span>
                {f.text}
                {f.cite && <span className="block text-xs text-muted-foreground">{f.cite}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">근거 조문</h3>
        <ul className="space-y-2">
          {r.statutes.map((s) => (
            <li key={s.id} className="rounded-md border border-border bg-background px-3 py-2 text-sm leading-6">
              <a href={s.url} target="_blank" rel="noopener" className="font-semibold text-foreground underline break-all">
                {s.law} {s.article}
              </a>{" "}
              <span className="text-muted-foreground">{s.title}</span>
              <span className="block text-foreground">{s.plain}</span>
            </li>
          ))}
        </ul>
      </section>

      {r.tools.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">금액 계산</h3>
          <ul className="flex flex-wrap gap-2">
            {r.tools.map((t) => (
              <li key={t.href}>
                <a href={t.href} className="inline-flex min-h-11 items-center rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground hover:bg-muted">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">누구에게 물어볼까</h3>
        {r.handOff && <p className="text-sm leading-6 text-foreground">{r.handOff}</p>}
        <ul className="space-y-1 text-sm">
          {prof.freeHelp.map((h) => (
            <li key={h.name} className="leading-6">
              <span className="font-semibold text-foreground">{h.name}</span> <span className="text-muted-foreground break-all">{h.how}</span> · <span className="text-foreground">{h.what}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">가져갈 서류: {r.documents.join(", ")}</p>
        <div className="flex flex-wrap gap-2">
          <CopyMemo text={memo} />
          <button type="button" onClick={resetTopic} className="inline-flex min-h-11 items-center rounded-md border border-border bg-background px-4 text-sm text-muted-foreground hover:bg-muted">
            이 주제 처음부터
          </button>
        </div>
      </section>

      <details className="rounded-md border border-border bg-background px-3 py-2" open={!easy}>
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          {prof.licensed}의 업무 범위와 이 길잡이의 경계 ({prof.act} {prof.scopeCite.article})
        </summary>
        <div className="mt-2 space-y-2 text-sm leading-6">
          <ul className="list-disc pl-5 text-foreground">
            {prof.scope.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <ul className="space-y-1">
            {prof.exclusive.map((x) => (
              <li key={x.text}>
                {x.text}{" "}
                <a className="text-xs text-muted-foreground underline" href={statuteUrl(x.cite)} target="_blank" rel="noopener">
                  {x.cite.law} {x.cite.article}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground">이 길잡이가 하는 일: {prof.guideDoes.join(" ")}</p>
          <p className="text-muted-foreground">하지 않는 일: {prof.guideDoesNot.join(" ")}</p>
        </div>
      </details>

      {!easy && (
        <>
          <section className="space-y-2">
            <label htmlFor="law-search" className="text-sm font-semibold text-foreground">
              조문 찾기 (전 분야)
            </label>
            <input id="law-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="예: 경정청구, 임차권등기, 구제신청" className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground" />
            <ul className="space-y-1 text-sm">
              {found.map((s) => (
                <li key={s.id} className="leading-6">
                  <a href={statuteUrl(s)} target="_blank" rel="noopener" className="font-semibold text-foreground underline">
                    {s.law} {s.article}
                  </a>{" "}
                  <span className="text-muted-foreground">{s.plain}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">누가 무엇을 할 수 있나 (업무 범위 비교)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th className="p-1 font-semibold">업무</th>
                    {[...DOMAIN_IDS.map((d) => DOMAIN_LABEL[d].pro), "변호사"].map((h) => (
                      <th key={h} className="p-1 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SCOPE_MATRIX.map((m) => (
                    <tr key={m.task} className="border-t border-border">
                      <td className="p-1 text-foreground">
                        {m.task}
                        <span className="block text-muted-foreground">{m.cite}</span>
                      </td>
                      {MATRIX_COLS.map((k) => (
                        <td key={k} className="p-1 text-center font-mono">
                          {m.who[k] === "yes" ? "○" : m.who[k] === "partial" ? "△" : "–"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">○ 할 수 있음, △ 등록·범위 조건이 있음, – 할 수 없음. 각 법의 예외 조항은 원문을 확인하세요.</p>
          </section>
        </>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        {DISCLAIMER} 기준일 {LAW_GUIDE_AS_OF}.
      </p>
    </div>
  );
}
