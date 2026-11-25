// 우리집 가구 배치 (2026-11-25). 분양 평면도(예시 평면 또는 내 도면 이미지)에 가구를 실제 크기로 놓아 봐요.
// 배치는 이 브라우저(localStorage)와 공유 주소(#p=)에만 있어요. 도면 이미지는 이 기기 밖으로 나가지 않아요.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FURNITURE, PASSAGE_MIN, PRESETS, bounds, checkPlan, decodePlan, encodePlan, newId, placeIn, planArea, presetPlan, rect, roomOf, roomStats, snap, summary,
  type Item, type Plan, type Room,
} from "../../../lib/furniture-layout";
import ModeToggle from "../viz/ModeToggle";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { track } from "../viz/track";

const KEY = "oiyo-furniture-layout";
const GROUP_FILL: Record<string, string> = { 침대: "#c7d7f5", "소파·테이블": "#f3d3b5", 수납: "#d9c9b0", 가전: "#d6e9e2", 기타: "#e8d5ef", 직접: "#f4e7a1" };
// SVG 안 색은 PNG 저장(독립 SVG로 직렬화) 때도 같은 색이 나오도록 CSS 변수 대신 값으로 둬요.
const INK = { paper: "#ffffff", wall: "#5b4b3a", wallSub: "#8a7a69", text: "#1f2937", textSub: "#4b5563", bad: "#dc2626", warn: "#d97706", sel: "#0f766e", line: "#6b7280", floor: "#faf6ee" };
const groupOf = (key: string) => FURNITURE.find((f) => f.key === key)?.group ?? "직접";
const btn = "inline-flex min-h-11 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50";
const field = "mt-1 block min-h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground";
const m2 = (v: number) => `${v.toFixed(1)}㎡`;
const pyeong = (v: number) => `${(v / 3.3058).toFixed(1)}평`;
const meters = (cm: number) => `${(cm / 100).toFixed(cm % 10 ? 2 : 1)}m`;

type Bg = { url: string; natW: number; natH: number; scale: number; x: number; y: number; opacity: number };

export default function FurnitureLayout() {
  const [mode, setMode] = useAdvisoryMode("furniture-layout");
  const expert = mode === "expert";
  const [plan, setPlan] = useState<Plan>(() => presetPlan("apt84"));
  const [loaded, setLoaded] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [selRoom, setSelRoom] = useState<string>("living");
  const [target, setTarget] = useState<string>("living");
  const [bg, setBg] = useState<Bg | null>(null);
  const [hideRooms, setHideRooms] = useState(false);
  const [calib, setCalib] = useState<{ pts: { x: number; y: number }[]; mm: string } | null>(null);
  const [custom, setCustom] = useState({ label: "내 가구", w: "120", d: "60" });
  const [note, setNote] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);

  // 처음: 공유 주소 → 이 브라우저에 저장된 배치 → 84㎡ 예시
  useEffect(() => {
    const hash = new URLSearchParams(location.hash.slice(1)).get("p");
    let p: Plan | null = hash ? decodePlan(hash) : null;
    if (!p) try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v?.rooms && v?.items) p = v; } catch { /* 없음 */ }
    if (p) { setPlan(p); const living = p.rooms.find((m) => m.id === "living") ?? p.rooms[0]; if (living) { setTarget(living.id); setSelRoom(living.id); } }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch { /* 저장 불가 */ } }, [plan, loaded]);

  const issues = useMemo(() => checkPlan(plan), [plan]);
  const stats = useMemo(() => roomStats(plan), [plan]);
  const bad = useMemo(() => {
    const m = new Map<string, "error" | "warn">();
    for (const i of issues) for (const id of i.ids) if (m.get(id) !== "error") m.set(id, i.level);
    return m;
  }, [issues]);
  const box = useMemo(() => {
    const b = bounds(hideRooms ? [] : plan.rooms, plan.items);
    if (bg) {
      const x1 = Math.max(b.x + b.w, bg.x + bg.natW * bg.scale), y1 = Math.max(b.y + b.h, bg.y + bg.natH * bg.scale);
      const x0 = Math.min(b.x, bg.x), y0 = Math.min(b.y, bg.y);
      return { x: x0 - 30, y: y0 - 30, w: x1 - x0 + 60, h: y1 - y0 + 60 };
    }
    return { x: b.x - 30, y: b.y - 30, w: b.w + 60, h: b.h + 60 };
  }, [plan, bg, hideRooms]);
  const selected = plan.items.find((i) => i.id === sel) ?? null;
  const room = plan.rooms.find((m) => m.id === selRoom) ?? null;
  const area = planArea(plan.rooms);

  const update = (fn: (p: Plan) => Plan) => setPlan((p) => fn(p));
  const setItem = (id: string, patch: Partial<Item>) => update((p) => ({ ...p, items: p.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const setRoom = (id: string, patch: Partial<Room>) => update((p) => ({ ...p, rooms: p.rooms.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));

  const toSvg = (e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: q.x, y: q.y };
  };

  function choosePreset(id: string) {
    const p = presetPlan(id);
    setPlan(p); setSel(null);
    const first = p.rooms.find((m) => m.id === "living") ?? p.rooms.find((m) => m.id === "main") ?? p.rooms[0];
    setTarget(first.id); setSelRoom(first.id);
    track("furniture_layout_preset", { preset: id });
  }
  function add(key: string) {
    const f = FURNITURE.find((x) => x.key === key)!;
    const it = placeIn(f, plan.rooms.find((m) => m.id === target), undefined, plan.items);
    update((p) => ({ ...p, items: [...p.items, it] }));
    setSel(it.id);
    track("furniture_layout_add", { item: key });
  }
  function addCustom() {
    const w = Number(custom.w), d = Number(custom.d);
    if (!(w >= 10 && w <= 1000 && d >= 10 && d <= 1000)) { setNote("가구 크기는 10~1000cm로 넣어 주세요."); return; }
    const it = placeIn({ key: "custom", label: custom.label.trim().slice(0, 30) || "내 가구", group: "직접", w, d }, plan.rooms.find((m) => m.id === target), undefined, plan.items);
    update((p) => ({ ...p, items: [...p.items, it] }));
    setSel(it.id);
  }
  const rotate = (it: Item) => {
    const q = rect(it);
    // 가운데를 기준으로 돌려요
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2;
    const nw = q.h, nh = q.w;
    setItem(it.id, { rot: it.rot === 90 ? 0 : 90, x: snap(cx - nw / 2), y: snap(cy - nh / 2) });
  };
  const duplicate = (it: Item) => { const c = { ...it, id: newId(), x: it.x + 20, y: it.y + 20 }; update((p) => ({ ...p, items: [...p.items, c] })); setSel(c.id); };
  const remove = (id: string) => { update((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) })); setSel(null); };

  function onDown(e: React.PointerEvent<SVGSVGElement>) {
    const p = toSvg(e);
    if (calib) {
      if (calib.pts.length < 2) setCalib({ ...calib, pts: [...calib.pts, p] });
      return;
    }
    const target = (e.target as Element).closest("[data-item]");
    const id = target?.getAttribute("data-item");
    if (!id) { setSel(null); const m = plan.rooms.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (m) { setSelRoom(m.id); setTarget(m.id); } return; }
    const it = plan.items.find((i) => i.id === id)!;
    setSel(id);
    drag.current = { id, dx: p.x - it.x, dy: p.y - it.y, moved: false };
    svgRef.current?.setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const d = drag.current;
    if (!d) return;
    const p = toSvg(e);
    d.moved = true;
    setItem(d.id, { x: snap(p.x - d.dx), y: snap(p.y - d.dy) });
  }
  function onUp() {
    if (drag.current?.moved) track("furniture_layout_move", {}, true);
    drag.current = null;
  }
  function onKey(e: React.KeyboardEvent, it: Item) {
    const step = e.shiftKey ? 1 : 5;
    const mv: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (mv[e.key]) { e.preventDefault(); setItem(it.id, { x: it.x + mv[e.key][0], y: it.y + mv[e.key][1] }); }
    else if (e.key === "r" || e.key === "R") { e.preventDefault(); rotate(it); }
    else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); remove(it.id); }
  }

  function onImage(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const b = bounds(plan.rooms);
      setBg((old) => { if (old) URL.revokeObjectURL(old.url); return { url, natW: img.naturalWidth, natH: img.naturalHeight, scale: (b.w || 1000) / img.naturalWidth, x: b.x, y: b.y, opacity: 0.6 }; });
      setNote("도면을 깔았어요. '축척 맞추기'로 도면 위 치수 하나를 맞추면 가구가 실제 크기로 보여요.");
      track("furniture_layout_image", {});
    };
    img.src = url;
  }
  function applyCalib() {
    if (!calib || calib.pts.length < 2 || !bg) return;
    const [a, b] = calib.pts;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const real = Number(calib.mm) / 10;
    if (!(dist > 1 && real > 10)) { setNote("두 점을 찍고 실제 길이(mm)를 넣어 주세요."); return; }
    const k = real / dist;
    // 첫 점을 고정점으로 도면을 키우거나 줄여요
    setBg({ ...bg, scale: bg.scale * k, x: a.x - (a.x - bg.x) * k, y: a.y - (a.y - bg.y) * k });
    setCalib(null);
    setNote(`축척을 맞췄어요. 도면 1px = ${(bg.scale * k * 10).toFixed(1)}mm예요.`);
  }

  function shareLink() {
    const url = `${location.origin}${location.pathname}#p=${encodePlan(plan)}`;
    history.replaceState(null, "", url);
    navigator.clipboard?.writeText(url).then(() => setNote("공유 주소를 복사했어요. 도면 이미지는 주소에 들어가지 않아요."), () => setNote("주소창의 주소를 복사해 공유하세요."));
    track("furniture_layout_share", {});
  }
  function savePng() {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("image").forEach((n) => n.remove());
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const W = 1600, H = Math.round((W * box.h) / box.w);
    clone.setAttribute("width", String(W)); clone.setAttribute("height", String(H));
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = W; cv.height = H + 60;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, W, H);
      ctx.fillStyle = "#555"; ctx.font = "24px sans-serif";
      ctx.fillText("우리집 가구 배치 · tools.oiyo.net/ko/furniture-layout-planner", 24, H + 40);
      URL.revokeObjectURL(url);
      cv.toBlob((b) => { if (!b) return; const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "furniture-layout.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }, "image/png");
    };
    img.src = url;
    track("furniture_layout_png", {});
  }

  const font = Math.max(14, Math.round(box.w / 60));
  const groups = [...new Set(FURNITURE.map((f) => f.group))];

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />

      <section aria-labelledby="fl-step1" className="space-y-2">
        <h3 id="fl-step1" className="text-base font-bold">1. 집 고르기</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" aria-pressed={plan.preset === p.id} onClick={() => choosePreset(p.id)}
              className={"min-h-11 rounded-md border px-3 py-2 text-left text-sm " + (plan.preset === p.id ? "border-primary bg-muted font-semibold" : "border-border hover:bg-muted")}>
              <span className="block">{p.label}</span><span className="block text-xs text-muted-foreground">{p.hint}</span>
            </button>
          ))}
        </div>
        {plan.preset === "room" && room && (
          <div className="flex flex-wrap gap-3">
            <label className="text-sm font-semibold">가로(cm)<input type="number" inputMode="numeric" min={50} max={2000} value={room.w} onChange={(e) => setRoom(room.id, { w: Math.max(50, Number(e.target.value) || 50) })} className={field} /></label>
            <label className="text-sm font-semibold">세로(cm)<input type="number" inputMode="numeric" min={50} max={2000} value={room.h} onChange={(e) => setRoom(room.id, { h: Math.max(50, Number(e.target.value) || 50) })} className={field} /></label>
          </div>
        )}
        <p className="text-xs text-muted-foreground">예시 평면은 흔한 구조를 단순화한 거예요. 분양 도면의 방 치수(mm)가 있으면 전문가 모드에서 방 크기를 맞추거나 도면 이미지를 깔 수 있어요.</p>
      </section>

      <section aria-labelledby="fl-plan" className="space-y-2">
        <h3 id="fl-plan" className="text-base font-bold">2. 끌어서 놓아 보기</h3>
        <p aria-live="polite" className="rounded-md bg-muted p-3 text-base font-semibold text-foreground">{summary(plan)}</p>
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <svg ref={svgRef} viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} width="100%" role="application" aria-label="평면도. 가구를 끌어 옮기고, 고른 가구는 화살표 키로 옮기고 R로 돌려요."
            data-plan className="block touch-none select-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            fontFamily="system-ui, sans-serif">
            <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={INK.paper} />
            {bg && <image href={bg.url} x={bg.x} y={bg.y} width={bg.natW * bg.scale} height={bg.natH * bg.scale} opacity={bg.opacity} preserveAspectRatio="none" />}
            {!hideRooms && plan.rooms.map((m) => (
              <g key={m.id}>
                <rect x={m.x} y={m.y} width={m.w} height={m.h} fill={bg ? "none" : INK.floor} stroke={m.id === selRoom && expert ? INK.sel : INK.wall} strokeWidth={m.id === selRoom && expert ? 6 : 4} />
                <text x={m.x + 8} y={m.y + font + 4} fontSize={font} fill={INK.wall} fontWeight="700">{m.name}</text>
                <text x={m.x + 8} y={m.y + font * 2 + 8} fontSize={font * 0.8} fill={INK.wallSub}>{meters(m.w)}×{meters(m.h)}</text>
              </g>
            ))}
            {[...plan.items].sort((a, b) => Number(!a.key.startsWith("rug")) - Number(!b.key.startsWith("rug"))).map((it) => {
              const q = rect(it);
              const state = bad.get(it.id);
              const isSel = it.id === sel;
              return (
                <g key={it.id} data-item={it.id} tabIndex={0} role="button" aria-label={`${it.label} ${it.w}×${it.d}cm${state === "error" ? ", 겹치거나 벽을 넘어요" : state === "warn" ? ", 통로가 좁아요" : ""}`}
                  aria-pressed={isSel} onFocus={() => setSel(it.id)} onKeyDown={(e) => onKey(e, it)} className="cursor-move outline-none">
                  <rect x={q.x} y={q.y} width={q.w} height={q.h} rx={4} fill={GROUP_FILL[groupOf(it.key)]} fillOpacity={it.key === "rug" ? 0.45 : 0.92}
                    stroke={state === "error" ? INK.bad : state === "warn" ? INK.warn : isSel ? INK.sel : INK.line} strokeWidth={state || isSel ? 5 : 2} strokeDasharray={state === "warn" ? "10 6" : undefined} />
                  <text x={q.x + q.w / 2} y={q.y + q.h / 2} fontSize={Math.min(font, q.w / 5, q.h / 2.2)} textAnchor="middle" dominantBaseline="middle" fill={INK.text} pointerEvents="none">{it.label}</text>
                  {(isSel || q.w >= 120) && <text x={q.x + q.w / 2} y={q.y + q.h / 2 + Math.min(font, q.h / 2.2)} fontSize={Math.min(font * 0.75, q.w / 6)} textAnchor="middle" dominantBaseline="middle" fill={INK.textSub} pointerEvents="none">{q.w}×{q.h}</text>}
                </g>
              );
            })}
            {calib?.pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={font * 0.5} fill={INK.bad} />)}
            {calib?.pts.length === 2 && <line x1={calib.pts[0].x} y1={calib.pts[0].y} x2={calib.pts[1].x} y2={calib.pts[1].y} stroke={INK.bad} strokeWidth={4} />}
          </svg>
        </div>
        <p className="text-xs text-muted-foreground">전체 {m2(area)} ({pyeong(area)}) · 빨간 테두리는 겹침·벽 넘음, 주황 점선은 통로 {PASSAGE_MIN}cm 미만이에요. 빈 곳을 누르면 그 방이 '넣을 방'이 돼요.</p>

        {selected ? (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3">
            <strong className="mr-1 text-sm">{selected.label} {rect(selected).w}×{rect(selected).h}cm</strong>
            <button type="button" className={btn} onClick={() => rotate(selected)}>90° 돌리기</button>
            <button type="button" className={btn} onClick={() => duplicate(selected)}>하나 더</button>
            <button type="button" className={btn} onClick={() => remove(selected.id)}>빼기</button>
            {expert && (
              <div className="flex w-full flex-wrap gap-3">
                <label className="text-sm">이름<input value={selected.label} maxLength={30} onChange={(e) => setItem(selected.id, { label: e.target.value })} className={field} /></label>
                <label className="text-sm">가로(cm)<input type="number" inputMode="numeric" min={10} max={1000} value={selected.w} onChange={(e) => setItem(selected.id, { w: Math.max(10, Number(e.target.value) || 10) })} className={field} /></label>
                <label className="text-sm">깊이(cm)<input type="number" inputMode="numeric" min={10} max={1000} value={selected.d} onChange={(e) => setItem(selected.id, { d: Math.max(10, Number(e.target.value) || 10) })} className={field} /></label>
                <label className="text-sm">X(cm)<input type="number" inputMode="numeric" value={selected.x} onChange={(e) => setItem(selected.id, { x: Number(e.target.value) || 0 })} className={field} /></label>
                <label className="text-sm">Y(cm)<input type="number" inputMode="numeric" value={selected.y} onChange={(e) => setItem(selected.id, { y: Number(e.target.value) || 0 })} className={field} /></label>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">가구를 누르면 돌리기·복제·빼기 버튼이 나와요. 키보드로는 Tab으로 고르고 화살표로 5cm씩(Shift는 1cm), R로 돌려요.</p>
        )}
      </section>

      <section aria-labelledby="fl-add" className="space-y-3">
        <h3 id="fl-add" className="text-base font-bold">3. 가구 넣기</h3>
        <label className="block max-w-xs text-sm font-semibold">넣을 방
          <select value={target} onChange={(e) => setTarget(e.target.value)} className={field}>
            {plan.rooms.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        {groups.map((g) => (
          <div key={g}>
            <p className="mb-1 text-sm font-semibold text-muted-foreground">{g}</p>
            <div className="flex flex-wrap gap-2">
              {FURNITURE.filter((f) => f.group === g).map((f) => (
                <button key={f.key} type="button" className={btn} onClick={() => add(f.key)}>+ {f.label} <span className="ml-1 text-xs text-muted-foreground">{f.w}×{f.d}</span></button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border p-3">
          <label className="text-sm">우리 집 가구 이름<input value={custom.label} maxLength={30} onChange={(e) => setCustom({ ...custom, label: e.target.value })} className={field} /></label>
          <label className="w-24 text-sm">가로(cm)<input type="number" inputMode="numeric" value={custom.w} onChange={(e) => setCustom({ ...custom, w: e.target.value })} className={field} /></label>
          <label className="w-24 text-sm">깊이(cm)<input type="number" inputMode="numeric" value={custom.d} onChange={(e) => setCustom({ ...custom, d: e.target.value })} className={field} /></label>
          <button type="button" className={btn} onClick={addCustom}>+ 직접 넣기</button>
        </div>
        <p className="text-xs text-muted-foreground">크기는 흔한 시판 제품 기준(매트리스·본체)이에요. 지금 쓰는 가구는 줄자로 재서 '직접 넣기'로 넣으면 가장 정확해요.</p>
      </section>

      {expert && (
        <section aria-labelledby="fl-expert" className="space-y-4 rounded-lg border border-border p-4">
          <h3 id="fl-expert" className="text-base font-bold">전문가 모드: 내 도면에 맞추기</h3>
          <div className="space-y-2">
            <p className="text-sm font-semibold">분양 도면 이미지 깔기</p>
            <input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} className="block text-sm" aria-label="평면도 이미지 고르기" />
            {bg && (
              <div className="flex flex-wrap items-end gap-3">
                <button type="button" className={btn} onClick={() => { setCalib({ pts: [], mm: "" }); setSel(null); setNote("도면에서 치수가 적힌 벽의 양 끝 두 점을 차례로 누르세요."); }}>축척 맞추기</button>
                {calib && (
                  <>
                    <label className="w-40 text-sm">두 점 사이 실제 길이(mm)<input type="number" inputMode="numeric" value={calib.mm} onChange={(e) => setCalib({ ...calib, mm: e.target.value })} className={field} placeholder="예: 3900" /></label>
                    <button type="button" className={btn} disabled={calib.pts.length < 2} onClick={applyCalib}>적용 ({calib.pts.length}/2점)</button>
                    <button type="button" className={btn} onClick={() => setCalib(null)}>취소</button>
                  </>
                )}
                <label className="text-sm">도면 진하기<input type="range" min={0.15} max={1} step={0.05} value={bg.opacity} onChange={(e) => setBg({ ...bg, opacity: Number(e.target.value) })} className="mt-1 block min-h-11 w-40" /></label>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={hideRooms} onChange={(e) => setHideRooms(e.target.checked)} className="size-5" />예시 방 숨기기</label>
                <button type="button" className={btn} onClick={() => { URL.revokeObjectURL(bg.url); setBg(null); setCalib(null); }}>도면 빼기</button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">이미지는 이 기기 화면에서만 쓰고 어디에도 올리지 않아요. 새로고침하면 다시 골라야 해요.</p>
          </div>
          {room && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">방 크기 맞추기 (도면 위 방을 누르거나 아래에서 고르기)</p>
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-sm">방<select value={selRoom} onChange={(e) => setSelRoom(e.target.value)} className={field}>{plan.rooms.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
                <label className="w-28 text-sm">이름<input value={room.name} maxLength={20} onChange={(e) => setRoom(room.id, { name: e.target.value })} className={field} /></label>
                {(["w", "h", "x", "y"] as const).map((k) => (
                  <label key={k} className="w-24 text-sm">{{ w: "가로", h: "세로", x: "X", y: "Y" }[k]}(mm)
                    <input type="number" inputMode="numeric" step={10} value={room[k] * 10} onChange={(e) => { const v = Math.round((Number(e.target.value) || 0) / 10); setRoom(room.id, { [k]: k === "w" || k === "h" ? Math.max(50, v) : v }); }} className={field} />
                  </label>
                ))}
                <button type="button" className={btn} onClick={() => { const b = bounds(plan.rooms); const n: Room = { id: newId(), name: "새 방", x: b.x + b.w + 20, y: b.y, w: 300, h: 300 }; update((p) => ({ ...p, rooms: [...p.rooms, n] })); setSelRoom(n.id); }}>방 추가</button>
                <button type="button" className={btn} disabled={plan.rooms.length <= 1} onClick={() => { update((p) => ({ ...p, rooms: p.rooms.filter((m) => m.id !== room.id) })); setSelRoom(plan.rooms.find((m) => m.id !== room.id)!.id); }}>이 방 지우기</button>
              </div>
              <p className="text-xs text-muted-foreground">분양 도면의 치수는 보통 벽 중심선 기준 mm예요. 실제 안쪽 크기는 벽 두께만큼(한쪽 약 10cm) 작아요.</p>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="fl-stats" className="space-y-2">
        <h3 id="fl-stats" className="text-base font-bold">방마다 얼마나 찼나</h3>
        <ul className="space-y-2">
          {stats.filter((s) => s.items.length || s.room.id === target).map((s) => (
            <li key={s.room.id} className="text-sm">
              <div className="flex justify-between gap-2"><span className="font-semibold">{s.room.name} <span className="font-normal text-muted-foreground">{m2(s.area)}</span></span><span>{Math.round(s.ratio * 100)}% · {s.level}</span></div>
              <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="mt-1 block h-3 w-full overflow-hidden rounded-full" aria-hidden="true">
                <rect width="100" height="4" className="fill-muted" />
                <rect width={Math.min(100, s.ratio * 100)} height="4" className={s.level === "빽빽" ? "fill-destructive" : s.level === "적당" ? "fill-warning" : "fill-success"} />
              </svg>
              {expert && s.items.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{s.items.map((i) => `${i.label} ${rect(i).w}×${rect(i).h}`).join(" · ")}</p>}
            </li>
          ))}
        </ul>
        {issues.length > 0 && (
          <ul className="space-y-1 text-sm" aria-label="확인할 곳">
            {issues.slice(0, expert ? 30 : 6).map((i, k) => <li key={k} className={i.level === "error" ? "text-destructive" : "text-foreground"}>{i.level === "error" ? "✕ " : "△ "}{i.text}</li>)}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">바닥의 35% 아래면 여유, 50%를 넘으면 빽빽하게 느껴지기 쉬워요(인테리어 경험칙). 러그는 계산에서 빼요.</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={shareLink}>공유 주소 복사</button>
        <button type="button" className={btn} onClick={savePng}>PNG로 저장</button>
        <button type="button" className={btn} onClick={() => { update((p) => ({ ...p, items: [] })); setSel(null); }}>가구 모두 빼기</button>
      </div>
      {note && <p role="status" className="text-sm text-foreground">{note}</p>}
    </div>
  );
}
