// 전문가 사무소 허브 (2026-11-23). 건물 → 층(나라) → 방(세무·노무·행정·법무) → 상담 테이블(접수 → 도구 → AI 서가 → 결과지).
// 데이터: data/pro-office.ts (기존 도구·MCP·스킬만), 문구: data/pro-office-copy.ts. 새 계산 없음. 입력값은 브라우저에만 있어요.
import { useEffect, useMemo, useState } from "react";
import type { Floor, FloorId, OfficeLocale, OfficeTool, RoomId } from "../../../data/pro-office";
import type { OfficeCopy } from "../../../data/pro-office-copy";
import { track } from "../viz/track";

type Who = "all" | "public" | "pro";
type Props = { locale: OfficeLocale; floors: Floor[]; copy: OfficeCopy; asOf: string };
const ROOM_ICON: Record<RoomId, string> = { tax: "🧾", labor: "🤝", admin: "🏛️", legal: "⚖️", trade: "📦", insurance: "🛡️", realty: "🏠", biz: "🏪", welfare: "🩺", plan: "📈" };
const PIN_KEY = "oiyo-office-pins";
const load = (): string[] => { try { return JSON.parse(localStorage.getItem(PIN_KEY) || "[]"); } catch { return []; } };

export default function ProOffice({ locale, floors, copy: t, asOf }: Props) {
  const [floorId, setFloorId] = useState<FloorId | null>(null);
  const [roomId, setRoomId] = useState<RoomId | null>(null);
  const [who, setWho] = useState<Who>("all");
  const [board, setBoard] = useState(true);
  const [ticket, setTicket] = useState<number | null>(null);
  const [pins, setPins] = useState<string[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [used, setUsed] = useState<Record<string, boolean>>({});
  const [client, setClient] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setTicket(100 + Math.floor(Math.random() * 900));
    setPins(load());
    const [f, r] = decodeURIComponent(location.hash.slice(1)).split("/");
    if (floors.some((x) => x.id === f)) { setFloorId(f as FloorId); setBoard(false); if (Object.keys(ROOM_ICON).includes(r)) setRoomId(r as RoomId); }
  }, [floors]);
  const go = (f: FloorId | null, r: RoomId | null = null) => {
    setFloorId(f); setRoomId(r); setChecked({}); setUsed({}); setBoard(!f);
    try { history.replaceState(null, "", f ? `#${f}${r ? `/${r}` : ""}` : location.pathname); } catch { /* ignore */ }
    if (r) track("office_room_open", { floor: String(f), room: r, locale }, true);
    if (typeof window !== "undefined") document.getElementById(f ? "office-path" : "office-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const togglePin = (href: string) => setPins((p) => { const n = p.includes(href) ? p.filter((x) => x !== href) : [...p, href]; try { localStorage.setItem(PIN_KEY, JSON.stringify(n)); } catch { /* ignore */ } return n; });

  const floor = floors.find((f) => f.id === floorId) ?? null;
  const room = floor?.rooms.find((r) => r.id === roomId) ?? null;
  const allTools = useMemo(() => new Map(floors.flatMap((f) => f.rooms.flatMap((r) => r.tools.map((x) => [x.href, x] as const)))), [floors]);
  const pinned = pins.map((h) => allTools.get(h)).filter(Boolean) as OfficeTool[];
  const floorNo = (id: FloorId) => floors.findIndex((f) => f.id === id) + 2;
  const tools = room ? room.tools.filter((x) => who === "all" || x.who === who) : [];
  const fw = (n: number) => t.floorWord.replace("{n}", String(n));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div id="office-top" className="space-y-5 scroll-mt-20">

      {/* 건물 입구: 안내판 */}
      <section aria-label={t.directory} className="overflow-hidden rounded-xl border border-border bg-office-board text-office-paper shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <p className="font-serif text-lg font-bold tracking-wide">{t.building}</p>
          <p className="rounded bg-office-paper px-2 py-1 font-mono text-sm font-bold text-office-board" aria-live="polite">{t.ticket} {ticket ?? "—"}</p>
        </div>
        {!board && floor && (
          <button type="button" onClick={() => setBoard(true)} className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-white/5">
            <span className="w-14 shrink-0 font-mono text-office-brass">{fw(floorNo(floor.id))}</span>
            <span className="font-semibold">{floor.flag} {t.countries[floor.id]}</span>
            <span className="ml-auto text-xs text-office-brass">{t.directory} ▾</span>
          </button>
        )}
        {board && <ol className="grid gap-px bg-white/10 sm:grid-cols-2">
          {[...floors].reverse().map((f) => (
            <li key={f.id} className="bg-office-board">
              <button type="button" onClick={() => go(f.id)} aria-current={f.id === floorId ? "true" : undefined}
                className={`flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-white/5 ${f.id === floorId ? "bg-white/10" : ""}`}>
                <span className="w-14 shrink-0 font-mono text-office-brass">{fw(floorNo(f.id))}</span>
                <span className="whitespace-nowrap font-semibold">{f.flag} {t.countries[f.id]}</span>
                <span className="ml-auto hidden text-right text-xs text-office-paper/70 sm:block">{f.rooms.filter((r) => r.tools.length).map((r) => (t.rooms[r.id] ?? r.id)).join(" · ")}</span>
              </button>
            </li>
          ))}
          <li className="bg-office-board sm:col-span-2">
            <button type="button" onClick={() => go(null)} className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-white/5">
              <span className="w-14 shrink-0 font-mono text-office-brass">{fw(1)}</span>
              <span className="font-semibold">🛎️ {t.lobby}</span>
            </button>
          </li>
        </ol>}
      </section>

      {/* 경로 */}
      <nav id="office-path" aria-label="breadcrumb" className="scroll-mt-20 text-sm text-muted-foreground">
        <button type="button" className="underline-offset-4 hover:underline" onClick={() => go(null)}>{t.lobby}</button>
        {floor && <> › <button type="button" className="underline-offset-4 hover:underline" onClick={() => go(floor.id)}>{fw(floorNo(floor.id))} {floor.flag} {t.countries[floor.id]}</button></>}
        {room && <> › <span className="font-semibold text-foreground">{(t.rooms[room.id] ?? room.id)}</span></>}
      </nav>

      {/* 로비 */}
      {!floor && (
        <section className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-lg font-bold">🛎️ {t.lobby}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.lobbySub}</p>
          </div>
          {pinned.length > 0 && (
            <div className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold">⭐ {t.pinned}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">{pinned.map((p) => <li key={p.href}><a href={p.href} className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-sm hover:bg-muted">{p.title}</a></li>)}</ul>
            </div>
          )}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {floors.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => go(f.id)} className="flex min-h-20 w-full items-center gap-3 rounded-xl border border-border bg-background p-4 text-left hover:border-primary">
                  <span className="text-3xl" aria-hidden>{f.flag}</span>
                  <span><span className="block font-semibold">{t.countries[f.id]}</span><span className="block text-xs text-muted-foreground">{fw(floorNo(f.id))} · {f.rooms.reduce((s, r) => s + r.tools.length, 0)} tools</span></span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 복도: 방 문 4개 */}
      {floor && !room && (
        <section aria-label={t.countries[floor.id]} className="rounded-xl border border-border bg-linear-to-b from-muted to-transparent p-4">
          <h2 className="text-lg font-bold">{floor.flag} {t.countries[floor.id]} · {fw(floorNo(floor.id))}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {floor.rooms.map((r) => {
              const open = r.tools.length > 0 || r.skills.length > 0;
              return (
                <li key={r.id}>
                  <button type="button" disabled={!open} onClick={() => go(floor.id, r.id)}
                    className="group flex w-full flex-col rounded-t-3xl rounded-b-md border-2 border-office-wood bg-office-door p-4 text-left text-office-ink shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground dark:bg-office-door-dark dark:text-office-paper">
                    <span className="mx-auto rounded border border-office-wood bg-office-desk px-3 py-1 text-sm font-bold dark:bg-office-desk-dark">{ROOM_ICON[r.id]} {(t.rooms[r.id] ?? r.id)}</span>
                    <span className="mt-3 text-sm">{(t.roomDesc[r.id] ?? "")}</span>
                    <span className="mt-3 flex items-center justify-between text-xs">
                      <span>{open ? `${r.tools.length} tools · ${r.skills.length} skills` : t.closed}</span>
                      {open && <span className="rounded-full bg-office-wood px-3 py-1 font-semibold text-white">{t.enter} →</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 방 안: 상담 테이블 */}
      {floor && room && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-office-wood bg-office-door px-4 py-3 text-office-ink dark:bg-office-door-dark dark:text-office-paper">
            <h2 className="text-lg font-bold">{ROOM_ICON[room.id]} {floor.flag} {t.countries[floor.id]} · {(t.rooms[room.id] ?? room.id)}</h2>
            <div role="group" aria-label={t.both} className="flex rounded-full border border-office-wood p-0.5 text-sm">
              {(["all", "public", "pro"] as Who[]).map((w) => (
                <button key={w} type="button" aria-pressed={who === w} onClick={() => setWho(w)} className={`min-h-9 rounded-full px-3 ${who === w ? "bg-office-wood text-white" : ""}`}>{w === "all" ? t.both : t[w]}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <h3 className="font-semibold">{t.step1}</h3>
              <ul className="mt-2 space-y-1">
                {(t.intake[room.id] ?? []).map((q) => (
                  <li key={q}><label className="flex min-h-11 items-start gap-2 text-sm"><input type="checkbox" className="mt-1 h-5 w-5" checked={!!checked[q]} onChange={(e) => setChecked({ ...checked, [q]: e.target.checked })} />{q}</label></li>
                ))}
              </ul>
              {room.help.length > 0 && <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs leading-5"><b>{t.help}:</b> {room.help.join(" · ")}</p>}
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="font-semibold">{t.step2}</h3>
              {tools.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">{t.noTools}</p> : (
                <ul className="mt-2 max-h-96 space-y-1 overflow-y-auto pr-1">
                  {tools.map((x) => (
                    <li key={x.href} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" aria-label={`${t.sheet}: ${x.title}`} className="h-5 w-5 shrink-0" checked={!!used[x.href]} onChange={(e) => setUsed({ ...used, [x.href]: e.target.checked })} />
                      <a href={x.href} className="min-h-11 flex-1 py-2 underline-offset-4 hover:underline">{x.title}</a>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${x.who === "pro" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{x.who === "pro" ? t.pro : t.public}</span>
                      <button type="button" onClick={() => togglePin(x.href)} aria-label={pins.includes(x.href) ? t.unpin : t.pin} className="min-h-11 min-w-11 shrink-0 text-lg">{pins.includes(x.href) ? "★" : "☆"}</button>
                    </li>
                  ))}
                </ul>
              )}
              {room.gaps > 0 && <p className="mt-2 text-xs text-muted-foreground">{t.gaps.replace("{n}", String(room.gaps))}</p>}
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="font-semibold">{t.step3}</h3>
              {room.skills.length > 0 && (<>
                <p className="mt-2 text-xs text-muted-foreground">{t.skills} · {t.skillHint}</p>
                <ul className="mt-1 flex flex-wrap gap-2">{room.skills.map((s) => <li key={s.id}><a href={s.zip} download className="inline-flex min-h-11 items-center rounded-md border border-border px-3 font-mono text-xs hover:bg-muted">📦 {s.id}</a></li>)}</ul>
              </>)}
              <p className="mt-3 text-xs text-muted-foreground">{t.mcp} · {t.mcpHint}</p>
              <code className="mt-1 block break-all rounded bg-muted px-2 py-1 text-xs">{floor.mcp}</code>
              {room.tools.some((x) => x.mcp) && <p className="mt-2 break-words font-mono text-xs leading-5 text-muted-foreground">{room.tools.filter((x) => x.mcp).map((x) => x.mcp).join(", ")}</p>}
            </div>

            <div id="office-sheet" className="rounded-xl border border-border bg-background p-4">
              <h3 className="font-semibold">🗂️ {t.sheet}</h3>
              <p className="no-print mt-1 text-xs text-muted-foreground">{t.sheetHint}</p>
              <p className="mt-2 text-sm">{t.printed}: {today} · {floor.flag} {t.countries[floor.id]} · {(t.rooms[room.id] ?? room.id)}{ticket ? ` · #${ticket}` : ""}</p>
              <label className="mt-2 block text-sm">{t.client}<input value={client} onChange={(e) => setClient(e.target.value)} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" /></label>
              <ul className="mt-2 list-disc pl-5 text-sm">{(t.intake[room.id] ?? []).filter((q) => checked[q]).map((q) => <li key={q}>☑ {q}</li>)}</ul>
              <ul className="mt-1 list-disc pl-5 text-sm">{room.tools.filter((x) => used[x.href]).map((x) => <li key={x.href}>{x.title} <span className="text-xs text-muted-foreground">tools.oiyo.net{x.href}</span></li>)}</ul>
              <label className="mt-2 block text-sm">{t.notes}<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base" /></label>
              {room.help.length > 0 && <p className="mt-2 text-xs">{t.help}: {room.help.join(" · ")}</p>}
              <p className="mt-2 text-xs text-muted-foreground">{t.sheetFooter} {t.asOf} {asOf}.</p>
              <button type="button" onClick={() => { track("office_sheet_print", { room: room.id, locale }); window.print(); }} className="no-print mt-3 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">🖨️ {t.print}</button>
            </div>
          </div>
          <button type="button" onClick={() => go(floor.id)} className="min-h-11 text-sm underline underline-offset-4">← {t.countries[floor.id]} · {fw(floorNo(floor.id))}</button>
        </section>
      )}
    </div>
  );
}
