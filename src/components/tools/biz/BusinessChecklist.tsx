// 반드시 할 것 / 하지 말 것 + 세무·노무 일정 (2026-11-14). 데이터·일정 계산: lib/biz-checklist.ts.
import { useMemo } from "react";
import { AREA_LABEL, CHECKLIST_AS_OF, ROLE_LABEL, STAGE_LABEL, filterItems, taxCalendar, type Role, type Stage, type TaxProfile } from "../../../lib/biz-checklist";
import ChoiceChips from "../payroll/ChoiceChips";
import BarTrack from "../viz/BarTrack";
import ModeToggle from "../viz/ModeToggle";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { SmallButton, useSaved } from "./common";

const TOOL_ID = "business-must-do-checklist";
const ROLES = Object.keys(ROLE_LABEL) as Role[];
const STAGES = Object.keys(STAGE_LABEL) as Stage[];
const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

function Multi<K extends string>({ legend, all, labels, value, onChange }: { legend: string; all: K[]; labels: Record<K, string>; value: K[]; onChange: (v: K[]) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-muted-foreground">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {all.map((k) => {
          const on = value.includes(k);
          return (
            <button key={k} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== k) : [...value, k])}
              className={"min-h-11 rounded-full border px-3 text-sm font-semibold " + (on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted")}>
              {labels[k]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function BusinessChecklist() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [roles, setRoles] = useSaved<Role[]>("ck-roles", ["ceo"]);
  const [stages, setStages] = useSaved<Stage[]>("ck-stages", ["start", "firstSale"]);
  const [done, setDone] = useSaved<string[]>("ck-done", []);
  const [profile, setProfile] = useSaved<TaxProfile>("ck-profile", { entity: "corp", vat: "general", employer: true, halfYearWithholding: false, sincere: false });
  const today = todayKst();
  const [year, setYear] = useSaved("ck-year", Number(today.slice(0, 4)));
  const easy = mode === "easy";

  const items = filterItems({ roles, stages });
  const dos = items.filter((i) => i.kind === "do");
  const donts = items.filter((i) => i.kind === "dont");
  const checked = dos.filter((i) => done.includes(i.id)).length;
  const cal = useMemo(() => taxCalendar(year, profile), [year, profile]);
  const events = easy ? cal.events.filter((e) => !(e.title.includes("지급분 사업·일용") || (e.title.includes("원천세") && !profile.halfYearWithholding && !e.statutory.endsWith("-01-10")))) : cal.events;
  const next = events.find((e) => e.due >= today);
  const toggle = (id: string) => setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id]);
  const setP = (p: Partial<TaxProfile>) => setProfile({ ...profile, ...p });

  const ics = () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OIYO Tools//biz checklist//KO", "CALSCALE:GREGORIAN"];
    cal.events.forEach((e, i) => {
      const d = e.due.replace(/-/g, "");
      const next = new Date(`${e.due}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      lines.push("BEGIN:VEVENT", `UID:${year}-${i}-${d}@tools.oiyo.net`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`, `SUMMARY:${e.title}`, `DESCRIPTION:${e.basis}${e.note ? " · " + e.note : ""}`, "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", `DESCRIPTION:${e.title} 1주 전`, "END:VALARM", "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `oiyo-tax-calendar-${year}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className="space-y-6">
      <ModeToggle mode={mode} onChange={setMode} />
      <Multi legend="누가 보나요?(여러 개 고를 수 있어요)" all={ROLES} labels={ROLE_LABEL} value={roles} onChange={setRoles} />
      <Multi legend="지금 어느 단계인가요?" all={STAGES} labels={STAGE_LABEL} value={stages} onChange={setStages} />

      <div aria-live="polite" className="rounded-md border border-border bg-background px-4 py-3">
        <p className="text-sm text-foreground">해야 할 것 <b>{dos.length}</b>개 중 <b>{checked}</b>개 했어요 · 하지 말아야 할 것 <b>{donts.length}</b>개</p>
        <div className="mt-2"><BarTrack segments={[{ from: 0, to: dos.length ? (checked / dos.length) * 100 : 0, tone: "primary" }]} /></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section>
          <h2 className="text-base font-bold text-foreground">반드시 할 것</h2>
          <ul className="mt-2 space-y-2">
            {dos.map((i) => (
              <li key={i.id} className="rounded-md border border-border bg-background p-3">
                <label className="flex cursor-pointer gap-3">
                  <input type="checkbox" checked={done.includes(i.id)} onChange={() => toggle(i.id)} className="mt-1 size-5 shrink-0 accent-primary" />
                  <span>
                    <span className={"block text-sm font-semibold " + (done.includes(i.id) ? "text-muted-foreground line-through" : "text-foreground")}>{i.text}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{i.why}</span>
                    <span className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-sm bg-muted px-1">{AREA_LABEL[i.area]}</span>
                      {!easy && (i.basis ? <span>근거: {i.basis}</span> : <span>경험칙</span>)}
                      {i.risk && <span className="text-destructive">{i.risk}</span>}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-base font-bold text-foreground">절대 하지 말 것</h2>
          <ul className="mt-2 space-y-2">
            {donts.map((i) => (
              <li key={i.id} className="rounded-md border border-destructive bg-background p-3">
                <span className="block text-sm font-semibold text-foreground">✕ {i.text}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{i.why}</span>
                <span className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-sm bg-muted px-1">{AREA_LABEL[i.area]}</span>
                  {!easy && (i.basis ? <span>근거: {i.basis}</span> : <span>경험칙</span>)}
                  {i.risk && <span className="text-destructive">{i.risk}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-foreground">{year}년 신고·납부 일정</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceChips legend="사업 형태" value={profile.entity} options={[{ value: "corp", label: "법인" }, { value: "indiv", label: "개인사업자" }] as const} onChange={(v) => setP({ entity: v, vat: v === "corp" && profile.vat === "simple" ? "general" : profile.vat })} />
          <ChoiceChips legend="부가세" value={profile.vat} options={(profile.entity === "corp" ? [{ value: "general", label: "일반과세" }, { value: "exempt", label: "면세" }] : [{ value: "general", label: "일반과세" }, { value: "simple", label: "간이과세" }, { value: "exempt", label: "면세" }]) as { value: TaxProfile["vat"]; label: string }[]} onChange={(v) => setP({ vat: v })} />
          <ChoiceChips legend="직원·프리랜서에게 돈을 주나요?" value={profile.employer ? "y" : "n"} options={[{ value: "y", label: "예" }, { value: "n", label: "아니요" }] as const} onChange={(v) => setP({ employer: v === "y" })} />
          <ChoiceChips legend="연도" value={String(year)} options={[{ value: "2026", label: "2026년" }, { value: "2027", label: "2027년" }]} onChange={(v) => setYear(Number(v))} />
          {!easy && profile.employer && <ChoiceChips legend="원천세 반기 납부 승인" value={profile.halfYearWithholding ? "y" : "n"} options={[{ value: "n", label: "매월" }, { value: "y", label: "반기" }] as const} onChange={(v) => setP({ halfYearWithholding: v === "y" })} />}
          {!easy && <ChoiceChips legend="성실신고확인 대상" value={profile.sincere ? "y" : "n"} options={[{ value: "n", label: "아니요" }, { value: "y", label: "예" }] as const} onChange={(v) => setP({ sincere: v === "y" })} />}
        </div>
        {next && <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">다음 기한: <b>{next.due}</b> {next.title}</p>}
        {easy && profile.employer && <p className="text-xs text-muted-foreground">쉬운 설명에서는 매달 반복되는 원천세(매월 10일)는 1월만, 간이지급명세서(매월 말)는 숨겨요. 전문가 모드에서 모두 보여요.</p>}
        <ol className="relative space-y-2 border-l-2 border-border pl-4">
          {events.map((e) => {
            const past = e.due < today;
            return (
              <li key={e.statutory + e.title} className={past ? "opacity-50" : ""}>
                <span className={"absolute -left-1.5 mt-1.5 size-3 rounded-full " + (e === next ? "bg-primary" : past ? "bg-muted-foreground" : "bg-border")} aria-hidden="true" />
                <p className="text-sm text-foreground"><b className="font-mono">{e.due.slice(5).replace("-", "/")}</b> {e.title}{e.due !== e.statutory && <span className="text-xs text-muted-foreground"> (법정 {e.statutory.slice(5).replace("-", "/")}이 휴일이라 미뤄짐)</span>}</p>
                {!easy && <p className="text-xs text-muted-foreground">{e.basis}{e.note ? ` · ${e.note}` : ""}</p>}
                {easy && e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap gap-2">
          <SmallButton onClick={ics}>내 달력에 넣기(.ics, 1주 전 알림)</SmallButton>
        </div>
        <p className="text-xs text-muted-foreground">12월 결산 법인 기준이에요. {!cal.holidaysKnown && "이 해의 공휴일은 아직 반영하지 않아 주말만 미뤘어요. "}기준일 {CHECKLIST_AS_OF}. 실제 고지·안내문과 홈택스 일정을 함께 확인하세요.</p>
      </section>
    </div>
  );
}
