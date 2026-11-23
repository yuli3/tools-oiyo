// 고객별 신고 마감 보드 (2026-11-23). 고객 목록은 이 브라우저(localStorage)에만 저장해요. 서버로 보내지 않아요.
import { useEffect, useMemo, useState } from "react";
import { boardIcs, clientBoard, perClient, urgency, type Client } from "../../../lib/client-deadline-board";
import type { TaxProfile } from "../../../lib/biz-checklist";
import { useToday } from "../nts/Items";
import { track } from "../viz/track";

const KEY = "oiyo-client-board";
const RANGES = [30, 60, 90, 180] as const;
const ENTITY: Record<TaxProfile["entity"], string> = { indiv: "개인사업자", corp: "법인(12월 결산)" };
const VAT: Record<TaxProfile["vat"], string> = { general: "일반과세", simple: "간이과세", exempt: "면세" };
const LEVEL: Record<string, { label: string; cls: string }> = {
  late: { label: "지남", cls: "bg-red-600 text-white" },
  today: { label: "오늘", cls: "bg-red-600 text-white" },
  week: { label: "7일 안", cls: "bg-amber-500 text-black" },
  month: { label: "한 달 안", cls: "bg-sky-600 text-white" },
  later: { label: "여유", cls: "bg-muted text-foreground" },
};
const addDays = (s: string, n: number) => { const t = new Date(`${s}T00:00:00Z`); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const SAMPLE: Client[] = [
  { id: "s1", name: "예시 법인", profile: { entity: "corp", vat: "general", employer: true } },
  { id: "s2", name: "예시 개인", profile: { entity: "indiv", vat: "simple", employer: false } },
];

export default function ClientDeadlineBoard() {
  const today = useToday();
  const [clients, setClients] = useState<Client[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [range, setRange] = useState<number>(60);
  const [filter, setFilter] = useState<string>("");
  const [draft, setDraft] = useState<{ name: string } & TaxProfile>({ name: "", entity: "indiv", vat: "general", employer: false });

  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); setClients(Array.isArray(v) ? v : SAMPLE); } catch { setClients(SAMPLE); }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(clients)); } catch { /* 저장 불가 */ } }, [clients, loaded]);

  const from = today ? addDays(today, -7) : "";
  const to = today ? addDays(today, range) : "";
  const items = useMemo(() => (today ? clientBoard(clients, from, to) : []), [clients, from, to, today]);
  const shown = filter ? items.filter((i) => i.clients.includes(filter)) : items;
  const counts = useMemo(() => perClient(items.filter((i) => today && i.due >= today)), [items, today]);

  const add = () => {
    const name = draft.name.trim();
    if (!name || clients.some((c) => c.name === name)) return;
    const { name: _n, ...profile } = draft;
    setClients([...clients, { id: `${Date.now()}`, name, profile }]);
    setDraft({ ...draft, name: "" });
    track("client_board_add", { n: String(clients.length + 1) });
  };
  const remove = (id: string) => { const c = clients.find((x) => x.id === id); setClients(clients.filter((x) => x.id !== id)); if (c && filter === c.name) setFilter(""); };
  const toggle = (id: string, k: "employer" | "halfYearWithholding" | "sincere") =>
    setClients(clients.map((c) => (c.id === id ? { ...c, profile: { ...c.profile, [k]: !c.profile[k] } } : c)));
  const download = () => {
    const blob = new Blob([boardIcs(shown.filter((i) => today && i.due >= today))], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `client-deadlines-${today}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
    track("client_board_ics", { n: String(shown.length) });
  };

  const sel = "min-h-11 rounded-md border bg-background px-3 text-base";
  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4 print:hidden" aria-labelledby="cdb-clients">
        <h2 id="cdb-clients" className="text-lg font-semibold">맡은 고객</h2>
        <p className="mt-1 text-sm text-muted-foreground">이름은 별칭이나 이니셜로 적어도 돼요. 목록은 이 브라우저에만 저장돼요.</p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-sm">고객 이름
            <input className={sel} value={draft.name} maxLength={30} onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="예: ○○상사" />
          </label>
          <label className="flex flex-col text-sm">사업자
            <select className={sel} value={draft.entity} onChange={(e) => setDraft({ ...draft, entity: e.currentTarget.value as TaxProfile["entity"] })}>
              {Object.entries(ENTITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-sm">부가세
            <select className={sel} value={draft.vat} onChange={(e) => setDraft({ ...draft, vat: e.currentTarget.value as TaxProfile["vat"] })}>
              {Object.entries(VAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={draft.employer} onChange={() => setDraft({ ...draft, employer: !draft.employer })} />직원·프리랜서에게 지급</label>
          <button type="button" onClick={add} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">추가</button>
        </div>
        <ul className="mt-4 divide-y">
          {clients.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
              <button type="button" onClick={() => setFilter(filter === c.name ? "" : c.name)} aria-pressed={filter === c.name} className={`min-h-11 rounded-md px-2 text-left font-medium ${filter === c.name ? "bg-primary/15" : ""}`}>
                {c.name} <span className="text-muted-foreground">· {ENTITY[c.profile.entity]} · {VAT[c.profile.vat]}</span> <span className="tabular-nums">({counts[c.name] ?? 0}건)</span>
              </button>
              <label className="flex items-center gap-1"><input type="checkbox" className="size-4" checked={c.profile.employer} onChange={() => toggle(c.id, "employer")} />직원</label>
              {c.profile.employer && <label className="flex items-center gap-1"><input type="checkbox" className="size-4" checked={!!c.profile.halfYearWithholding} onChange={() => toggle(c.id, "halfYearWithholding")} />원천세 반기납부</label>}
              <label className="flex items-center gap-1"><input type="checkbox" className="size-4" checked={!!c.profile.sincere} onChange={() => toggle(c.id, "sincere")} />성실신고확인</label>
              <button type="button" onClick={() => remove(c.id)} className="ml-auto min-h-11 px-2 text-muted-foreground underline" aria-label={`${c.name} 빼기`}>빼기</button>
            </li>
          ))}
          {clients.length === 0 && <li className="py-3 text-sm text-muted-foreground">고객을 추가하면 마감이 아래에 모여요.</li>}
        </ul>
      </section>

      <section aria-labelledby="cdb-board">
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <h2 id="cdb-board" className="mr-auto text-lg font-semibold">다가오는 마감{filter && ` · ${filter}`}</h2>
          {RANGES.map((r) => (
            <button key={r} type="button" onClick={() => setRange(r)} aria-pressed={range === r} className={`min-h-11 rounded-full border px-3 text-sm ${range === r ? "bg-foreground text-background" : ""}`}>{r}일</button>
          ))}
          <button type="button" onClick={download} disabled={!shown.length} className="min-h-11 rounded-md border px-3 text-sm disabled:opacity-50">달력 파일(.ics)</button>
          <button type="button" onClick={() => { track("client_board_print", { n: String(shown.length) }); window.print(); }} className="min-h-11 rounded-md border px-3 text-sm">인쇄</button>
        </div>
        <h2 className="hidden text-lg font-semibold print:block">고객 신고 마감 ({today} 기준, {range}일)</h2>
        {!today ? <p className="mt-3 text-sm text-muted-foreground">오늘 날짜를 확인하는 중이에요.</p> : (
          <ol className="mt-3 space-y-2">
            {shown.map((it) => {
              const u = urgency(today, it.due);
              const lv = LEVEL[u.level];
              return (
                <li key={`${it.due}${it.title}`} className={`rounded-lg border p-3 ${u.level === "late" ? "opacity-60" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold tabular-nums">{it.due}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${lv.cls}`}>{lv.label}{u.days !== 0 && ` ${u.days > 0 ? `D-${u.days}` : `D+${-u.days}`}`}</span>
                    <span className="font-medium">{it.title}</span>
                  </div>
                  <p className="mt-1 text-sm">{it.clients.join(", ")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{it.basis}{it.statutory !== it.due && ` · 법정 기한 ${it.statutory}이 휴일이라 다음 영업일`}{it.note && ` · ${it.note}`}</p>
                </li>
              );
            })}
            {shown.length === 0 && <li className="text-sm text-muted-foreground">이 기간에는 마감이 없어요.</li>}
          </ol>
        )}
      </section>
    </div>
  );
}
