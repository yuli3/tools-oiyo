// 전문 직업 역량 지도 (2026-11-17). 직업 × 역량 분류 표에서 칸을 누르면 그 역량과 연결된 도구·스킬·MCP가 아래에 나와요.
// 데이터: src/data/pro-competencies.ts
import { useMemo, useState } from "react";
import { CATEGORIES, COMPETENCIES, JOBS, MCP_URL, SKILLS, SKILLS_REPO, TOOL_NAMES, coverage, isGap, toolHref, type CategoryId, type JobId } from "../../../data/pro-competencies";

type Who = "all" | "pro" | "public";
const WHO: { id: Who; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pro", label: "종사자만 쓰는 역량" },
  { id: "public", label: "일반인도 쓰는 역량" },
];

const chip = (on: boolean) =>
  "min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition-colors " +
  (on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted");

export default function CompetencyMap() {
  const [job, setJob] = useState<JobId | "all">("all");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [who, setWho] = useState<Who>("all");
  const [gapsOnly, setGapsOnly] = useState(false);
  const cov = useMemo(coverage, []);

  const list = COMPETENCIES.filter(
    (x) =>
      (job === "all" || x.job === job) &&
      (cat === "all" || x.cat === cat) &&
      (who === "all" || (who === "public" ? x.audience.includes("public") : !x.audience.includes("public"))) &&
      (!gapsOnly || isGap(x)),
  );
  const pick = (j: JobId | "all", c: CategoryId | "all") => {
    setJob(j);
    setCat(c);
  };
  const jobName = (id: JobId) => JOBS.find((j) => j.id === id)!.name;
  const catName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.name;

  return (
    <div className="space-y-6">
      <section aria-labelledby="cov-title" className="space-y-2">
        <h3 id="cov-title" className="text-sm font-semibold text-foreground">직업 × 역량 분류 (칸: 도구가 붙은 역량 / 전체 역량)</h3>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-160 border-collapse text-xs">
            <thead>
              <tr className="bg-muted">
                <th scope="col" className="p-2 text-left font-semibold text-foreground">직업</th>
                {CATEGORIES.map((c) => (
                  <th key={c.id} scope="col" className="p-2 text-center font-semibold text-foreground">
                    <button type="button" className="min-h-11 underline-offset-4 hover:underline" onClick={() => pick("all", c.id)}>{c.name}</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cov.map((row) => (
                <tr key={row.job} className="border-t border-border">
                  <th scope="row" className="p-2 text-left font-semibold text-foreground">
                    <button type="button" className="min-h-11 text-left underline-offset-4 hover:underline" onClick={() => pick(row.job, "all")}>{jobName(row.job)}</button>
                  </th>
                  {row.cells.map((cell) => {
                    const on = job === row.job && cat === cell.cat;
                    const ratio = cell.total ? cell.linked / cell.total : 0;
                    const tone = !cell.total ? "bg-background text-muted-foreground" : ratio === 1 ? "bg-primary/25 text-foreground" : ratio > 0 ? "bg-primary/10 text-foreground" : "bg-destructive/10 text-foreground";
                    return (
                      <td key={cell.cat} className="p-1 text-center">
                        {cell.total ? (
                          <button
                            type="button"
                            aria-pressed={on}
                            aria-label={`${jobName(row.job)} ${catName(cell.cat)}: 역량 ${cell.total}개 중 ${cell.linked}개에 도구 연결`}
                            onClick={() => pick(row.job, cell.cat)}
                            className={"min-h-11 w-full rounded px-1 font-semibold tabular-nums " + tone + (on ? " ring-2 ring-primary" : "")}
                          >
                            {cell.linked}/{cell.total}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">빨간 칸은 아직 도구가 없는 역량이에요. 다음에 만들 도구 목록으로 써요.</p>
      </section>

      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">직업</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={chip(job === "all")} aria-pressed={job === "all"} onClick={() => setJob("all")}>전체</button>
          {JOBS.map((j) => (
            <button key={j.id} type="button" className={chip(job === j.id)} aria-pressed={job === j.id} onClick={() => setJob(j.id)}>{j.name}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">역량 분류</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={chip(cat === "all")} aria-pressed={cat === "all"} onClick={() => setCat("all")}>전체</button>
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" className={chip(cat === c.id)} aria-pressed={cat === c.id} onClick={() => setCat(c.id)} title={c.desc}>{c.name}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">누가 쓰나요</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {WHO.map((w) => (
            <button key={w.id} type="button" className={chip(who === w.id)} aria-pressed={who === w.id} onClick={() => setWho(w.id)}>{w.label}</button>
          ))}
          <button type="button" className={chip(gapsOnly)} aria-pressed={gapsOnly} onClick={() => setGapsOnly(!gapsOnly)}>도구 없는 역량만</button>
        </div>
      </fieldset>

      {job !== "all" && (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm leading-6 text-foreground">
          <strong>{jobName(job)}</strong> · {JOBS.find((j) => j.id === job)!.summary} ({JOBS.find((j) => j.id === job)!.act})
        </p>
      )}
      {cat !== "all" && <p className="text-sm text-muted-foreground">{catName(cat)}: {CATEGORIES.find((c) => c.id === cat)!.desc}</p>}

      <p className="text-sm font-semibold text-foreground" aria-live="polite">역량 {list.length}개</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((x) => (
          <li key={x.id} className="rounded-md border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">{jobName(x.job)} · {catName(x.cat)}</p>
            <p className="mt-1 text-base font-semibold text-foreground">{x.name}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {x.audience.includes("public") && <span className="rounded bg-muted px-2 py-0.5 text-xs text-foreground">일반인도 씀</span>}
              {x.exclusive && <span className="rounded bg-muted px-2 py-0.5 text-xs text-foreground">자격사 업무와 맞닿음: 정보만</span>}
              {isGap(x) && <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-foreground">도구 준비 중</span>}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{x.desc}</p>
            {x.tools.length > 0 && (
              <p className="mt-2 text-sm leading-6">
                <span className="text-xs font-semibold text-muted-foreground">도구 </span>
                {x.tools.map((t, i) => (
                  <span key={t}>
                    {i > 0 && " · "}
                    <a className="text-foreground underline" href={toolHref(t)}>{TOOL_NAMES[t]}</a>
                  </span>
                ))}
              </p>
            )}
            {x.skills.length > 0 && (
              <p className="mt-1 text-sm leading-6">
                <span className="text-xs font-semibold text-muted-foreground">스킬 </span>
                {x.skills.map((s, i) => (
                  <span key={s}>
                    {i > 0 && " · "}
                    <a className="text-foreground underline" href={SKILLS[s].zip} download>{SKILLS[s].name}</a>
                  </span>
                ))}
              </p>
            )}
            {x.mcp.length > 0 && (
              <p className="mt-1 break-all text-xs leading-5 text-muted-foreground">
                <span className="font-semibold">MCP </span>
                {x.mcp.map((m) => <code key={m} className="mr-1">{m}</code>)}
              </p>
            )}
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="text-sm text-muted-foreground">조건에 맞는 역량이 없어요. 필터를 하나 풀어 보세요.</p>}
      <p className="text-xs leading-5 text-muted-foreground">
        스킬 원본과 묶음 zip: <a className="underline" href={SKILLS_REPO}>github.com/yuli3/oiyo-skills</a> · MCP 서버: <code className="break-all">{MCP_URL}</code>
      </p>
    </div>
  );
}
