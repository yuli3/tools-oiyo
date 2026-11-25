// 우리집 가구 배치 (2026-11-25). 분양 평면도에 가구를 실제 크기로 놓아 보는 도구의 순수 로직.
// 단위는 전부 cm. 좌표는 왼쪽 위가 (0,0), 아래쪽이 앞(남향 창). 화면·저장·검사가 이 파일 하나를 써요.
// 평면 예시는 흔한 판상형 구조를 단순화한 것이고 특정 단지 도면이 아니에요.

export type Room = { id: string; name: string; x: number; y: number; w: number; h: number };
export type Item = { id: string; key: string; label: string; x: number; y: number; w: number; d: number; rot: 0 | 90 };
export type Plan = { preset: string; rooms: Room[]; items: Item[] };

export type Furniture = { key: string; label: string; group: string; w: number; d: number; rug?: boolean };

/** 흔한 국내 시판 크기(가로×깊이, cm). 매트리스 기준이고 프레임은 보통 5~15cm 더 커요. */
export const FURNITURE: Furniture[] = [
  { key: "bed-single", label: "싱글 침대", group: "침대", w: 100, d: 200 },
  { key: "bed-ss", label: "슈퍼싱글 침대", group: "침대", w: 110, d: 200 },
  { key: "bed-queen", label: "퀸 침대", group: "침대", w: 150, d: 200 },
  { key: "bed-king", label: "킹 침대", group: "침대", w: 160, d: 200 },
  { key: "bed-lking", label: "라지킹 침대", group: "침대", w: 180, d: 200 },
  { key: "crib", label: "아기 침대", group: "침대", w: 70, d: 130 },
  { key: "bed-bumper", label: "패밀리(범퍼) 침대", group: "침대", w: 280, d: 200 },
  { key: "sofa-2", label: "2인 소파", group: "소파·테이블", w: 160, d: 85 },
  { key: "sofa-3", label: "3인 소파", group: "소파·테이블", w: 210, d: 90 },
  { key: "sofa-4", label: "4인 소파", group: "소파·테이블", w: 260, d: 95 },
  { key: "sofa-corner", label: "코너(ㄱ자) 소파", group: "소파·테이블", w: 270, d: 160 },
  { key: "coffee", label: "거실 테이블", group: "소파·테이블", w: 110, d: 55 },
  { key: "dining-2", label: "2인 식탁", group: "소파·테이블", w: 80, d: 75 },
  { key: "dining-4", label: "4인 식탁", group: "소파·테이블", w: 140, d: 80 },
  { key: "dining-6", label: "6인 식탁", group: "소파·테이블", w: 180, d: 90 },
  { key: "desk", label: "책상", group: "소파·테이블", w: 120, d: 60 },
  { key: "desk-l", label: "큰 책상", group: "소파·테이블", w: 160, d: 70 },
  { key: "tv-stand", label: "TV장", group: "수납", w: 180, d: 40 },
  { key: "wardrobe-2", label: "옷장(문 2짝)", group: "수납", w: 100, d: 60 },
  { key: "wardrobe-4", label: "옷장(문 4짝)", group: "수납", w: 200, d: 60 },
  { key: "drawer", label: "서랍장", group: "수납", w: 100, d: 50 },
  { key: "bookshelf", label: "책장", group: "수납", w: 80, d: 30 },
  { key: "vanity", label: "화장대", group: "수납", w: 80, d: 45 },
  { key: "fridge", label: "양문형 냉장고", group: "가전", w: 91, d: 93 },
  { key: "kimchi", label: "김치냉장고(스탠드)", group: "가전", w: 70, d: 85 },
  { key: "washer", label: "세탁기", group: "가전", w: 70, d: 75 },
  { key: "dryer", label: "건조기", group: "가전", w: 70, d: 75 },
  { key: "massage", label: "안마의자", group: "가전", w: 80, d: 140 },
  { key: "treadmill", label: "러닝머신", group: "가전", w: 80, d: 180 },
  { key: "piano", label: "업라이트 피아노", group: "기타", w: 150, d: 60 },
  { key: "rug", label: "러그(200×300)", group: "기타", w: 200, d: 300, rug: true },
];
export const FURNITURE_BY_KEY: Record<string, Furniture> = Object.fromEntries(FURNITURE.map((f) => [f.key, f]));
export const isRug = (it: Item) => !!FURNITURE_BY_KEY[it.key]?.rug;

const r = (id: string, name: string, x: number, y: number, w: number, h: number): Room => ({ id, name, x, y, w, h });

export type Preset = { id: string; label: string; hint: string; rooms: Room[] };

/** 평면 예시. 발코니 확장을 가정했고, 방 사이 빈 곳은 복도예요. */
export const PRESETS: Preset[] = [
  {
    id: "studio25", label: "원룸·오피스텔 (전용 25㎡)", hint: "방 하나 + 욕실",
    rooms: [r("main", "방", 0, 200, 420, 400), r("bath", "욕실", 0, 0, 180, 200), r("entry", "현관·주방", 180, 0, 240, 200)],
  },
  {
    id: "apt59", label: "아파트 59㎡ (24평형, 3베이)", hint: "방 3 · 욕실 2",
    rooms: [
      r("bed3", "침실3", 0, 0, 270, 300), r("entry", "현관", 270, 0, 150, 170), r("bath", "공용욕실", 270, 170, 150, 210),
      r("kitchen", "주방·식당", 420, 0, 230, 380), r("util", "발코니·실외기", 650, 0, 310, 120),
      r("dress", "드레스룸", 650, 120, 160, 260), r("mbath", "안방욕실", 810, 120, 150, 260),
      r("bed2", "침실2", 0, 380, 270, 380), r("living", "거실", 270, 380, 380, 380), r("master", "안방", 650, 380, 310, 380),
    ],
  },
  {
    id: "apt84", label: "아파트 84㎡ (34평형, 4베이)", hint: "방 3 · 욕실 2 · 드레스룸",
    rooms: [
      r("pantry", "팬트리·수납", 0, 0, 230, 280), r("entry", "현관", 230, 0, 170, 220), r("util", "다용도실", 400, 0, 130, 220),
      r("bath", "공용욕실", 0, 280, 230, 200), r("kitchen", "주방·식당", 530, 0, 400, 480),
      r("out", "발코니·실외기", 930, 0, 310, 200), r("dress", "드레스룸", 930, 200, 160, 240), r("mbath", "안방욕실", 1090, 200, 150, 240),
      r("bed3", "침실3", 0, 480, 260, 400), r("bed2", "침실2", 260, 480, 270, 400), r("living", "거실", 530, 480, 400, 400),
      r("master", "안방", 930, 440, 310, 440),
    ],
  },
  {
    id: "apt114", label: "아파트 114㎡ (45평형, 4베이)", hint: "방 4 · 욕실 2 · 드레스룸",
    rooms: [
      r("bed4", "침실4", 0, 0, 300, 340), r("entry", "현관", 300, 0, 180, 240), r("bath", "공용욕실", 300, 240, 180, 260),
      r("util", "다용도실", 480, 0, 120, 240), r("kitchen", "주방·식당", 600, 0, 460, 500), r("out", "발코니·실외기", 1060, 0, 360, 200),
      r("dress", "드레스룸", 1060, 200, 190, 300), r("mbath", "안방욕실", 1250, 200, 170, 300),
      r("bed3", "침실3", 0, 500, 300, 480), r("bed2", "침실2", 300, 500, 300, 480), r("living", "거실", 600, 500, 460, 480),
      r("master", "안방", 1060, 500, 360, 480),
    ],
  },
  { id: "room", label: "방 하나만 (크기 직접)", hint: "가로·세로를 넣어요", rooms: [r("room", "방", 0, 0, 360, 400)] },
];

export const planArea = (rooms: Room[]) => rooms.reduce((s, x) => s + x.w * x.h, 0) / 10000;

/** 회전을 반영한 실제 가로·세로. */
export const dims = (it: Item) => (it.rot === 90 ? { w: it.d, h: it.w } : { w: it.w, h: it.d });
export const rect = (it: Item) => ({ x: it.x, y: it.y, ...dims(it) });
type Rect = { x: number; y: number; w: number; h: number };

export const snap = (v: number, step = 5) => Math.round(v / step) * step;

export function overlapArea(a: Rect, b: Rect) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

/** 가구 중심이 들어 있는 방. */
export function roomOf(it: Item, rooms: Room[]) {
  const q = rect(it);
  const cx = q.x + q.w / 2, cy = q.y + q.h / 2;
  return rooms.find((m) => cx >= m.x && cx <= m.x + m.w && cy >= m.y && cy <= m.y + m.h) ?? null;
}

/** 두 사각형 사이 통로 폭(마주 보는 면이 30cm 이상 겹칠 때만). 아니면 null. */
export function gapBetween(a: Rect, b: Rect) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  if (oy >= 30 && ox < 0) return -ox;
  if (ox >= 30 && oy < 0) return -oy;
  return null;
}

/** 가구와 방 벽 사이 거리(네 면 중 가장 가까운 면 제외, 벽에 붙인 면은 제외). */
function wallGaps(q: Rect, m: Room) {
  return [q.x - m.x, m.x + m.w - (q.x + q.w), q.y - m.y, m.y + m.h - (q.y + q.h)];
}

export const PASSAGE_MIN = 60; // 한 사람이 지나가는 통로(일반 권장, 경험칙)
export const PASSAGE_OK = 90; // 편하게 지나가는 통로
const TOUCH = 10; // 이보다 가까우면 붙여 둔 것으로 봐요

export type Issue = { level: "error" | "warn"; ids: string[]; text: string };

export function checkPlan(plan: Plan): Issue[] {
  const out: Issue[] = [];
  const solid = plan.items.filter((i) => !isRug(i));
  for (const it of solid) {
    const m = roomOf(it, plan.rooms);
    const q = rect(it);
    if (!m) { if (plan.rooms.length) out.push({ level: "warn", ids: [it.id], text: `${it.label}이(가) 방 밖에 있어요.` }); continue; }
    const g = wallGaps(q, m);
    if (Math.min(...g) < -2) out.push({ level: "error", ids: [it.id], text: `${it.label}이(가) ${m.name} 벽을 넘어요.` });
    else {
      const narrow = g.filter((v) => v >= TOUCH && v < PASSAGE_MIN);
      if (narrow.length) out.push({ level: "warn", ids: [it.id], text: `${it.label}과(와) ${m.name} 벽 사이가 ${Math.round(Math.min(...narrow))}cm예요. 지나다니려면 ${PASSAGE_MIN}cm 이상이 좋아요.` });
    }
  }
  for (let i = 0; i < solid.length; i++) {
    for (let j = i + 1; j < solid.length; j++) {
      const a = solid[i], b = solid[j];
      const qa = rect(a), qb = rect(b);
      if (overlapArea(qa, qb) > 0) { out.push({ level: "error", ids: [a.id, b.id], text: `${a.label}과(와) ${b.label}이(가) 겹쳐요.` }); continue; }
      if (roomOf(a, plan.rooms)?.id !== roomOf(b, plan.rooms)?.id) continue;
      const gap = gapBetween(qa, qb);
      if (gap != null && gap >= TOUCH && gap < PASSAGE_MIN) out.push({ level: "warn", ids: [a.id, b.id], text: `${a.label}과(와) ${b.label} 사이 통로가 ${Math.round(gap)}cm예요(${PASSAGE_MIN}cm 이상 권장).` });
    }
  }
  return out;
}

export type RoomStat = { room: Room; area: number; used: number; ratio: number; items: Item[]; level: "여유" | "적당" | "빽빽" };

/** 방마다 가구가 바닥을 얼마나 차지하는지(러그 제외). 35% 아래 여유, 50% 넘으면 빽빽(경험칙). */
export function roomStats(plan: Plan): RoomStat[] {
  return plan.rooms.map((m) => {
    const items = plan.items.filter((it) => roomOf(it, plan.rooms)?.id === m.id);
    const used = items.filter((it) => !isRug(it)).reduce((s, it) => s + overlapArea(rect(it), m), 0);
    const area = m.w * m.h;
    const ratio = area ? used / area : 0;
    return { room: m, area: area / 10000, used: used / 10000, ratio, items, level: ratio > 0.5 ? "빽빽" : ratio >= 0.35 ? "적당" : "여유" };
  });
}

/** 쉬운 설명 한 문장. */
export function summary(plan: Plan): string {
  if (!plan.items.length) return "가구를 아직 놓지 않았어요. 아래 목록에서 가구를 눌러 넣어 보세요.";
  const issues = checkPlan(plan);
  const errs = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");
  const busy = roomStats(plan).filter((s) => s.items.length && s.level === "빽빽").map((s) => `${s.room.name}(${Math.round(s.ratio * 100)}%)`);
  const parts = [`가구 ${plan.items.length}개를 놓았어요.`];
  if (errs.length) parts.push(`겹치거나 벽을 넘는 곳이 ${errs.length}군데 있어요.`);
  else parts.push("겹치거나 벽을 넘는 가구는 없어요.");
  if (warns.length) parts.push(`통로가 ${PASSAGE_MIN}cm보다 좁은 곳이 ${warns.length}군데예요.`);
  if (busy.length) parts.push(`${busy.join(", ")}은 바닥의 절반 넘게 가구가 차지해 답답해 보일 수 있어요.`);
  return parts.join(" ");
}

let seq = 0;
export const newId = () => `i${Date.now().toString(36)}${(seq++).toString(36)}`;

/** 방 가운데에 가구를 놓아요(방보다 크면 왼쪽 위에 맞춰요). others를 주면 이미 놓인 가구와
 *  겹치지 않는 자리 중 가운데에서 가장 가까운 곳(10cm 격자, 필요하면 90° 돌려서)을 골라요. 러그는 늘 가운데. */
export function placeIn(f: Furniture, room: Room | undefined, id = newId(), others: Item[] = []): Item {
  const m = room ?? { x: 0, y: 0, w: f.w, h: f.d };
  const x = snap(m.x + Math.max(0, (m.w - f.w) / 2));
  const y = snap(m.y + Math.max(0, (m.h - f.d) / 2));
  const base: Item = { id, key: f.key, label: f.label, x, y, w: f.w, d: f.d, rot: 0 };
  const solid = others.filter((o) => !isRug(o)).map(rect);
  if (f.rug || !room || !solid.some((o) => overlapArea(o, rect(base)) > 0)) return base;
  const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
  let best: Item | null = null, bestD = Infinity;
  for (const rot of [0, 90] as const) {
    const w = rot ? f.d : f.w, h = rot ? f.w : f.d;
    for (let yy = m.y; yy + h <= m.y + m.h; yy += 10) {
      for (let xx = m.x; xx + w <= m.x + m.w; xx += 10) {
        const q = { x: xx, y: yy, w, h };
        if (solid.some((o) => overlapArea(o, q) > 0)) continue;
        const d = Math.hypot(xx + w / 2 - cx, yy + h / 2 - cy) + (rot ? 40 : 0);
        if (d < bestD) { bestD = d; best = { ...base, x: xx, y: yy, rot }; }
      }
    }
  }
  return best ?? base;
}

export function presetPlan(id: string): Plan {
  const p = PRESETS.find((x) => x.id === id) ?? PRESETS[2];
  return { preset: p.id, rooms: p.rooms.map((m) => ({ ...m })), items: [] };
}

/** 평면 바깥 경계. */
export function bounds(rooms: Room[], items: Item[] = []) {
  const rs: Rect[] = [...rooms, ...items.map(rect)];
  if (!rs.length) return { x: 0, y: 0, w: 400, h: 400 };
  const x0 = Math.min(...rs.map((q) => q.x)), y0 = Math.min(...rs.map((q) => q.y));
  const x1 = Math.max(...rs.map((q) => q.x + q.w)), y1 = Math.max(...rs.map((q) => q.y + q.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

// ── 공유 주소(#p=...) ────────────────────────────────────────────────
// 가구는 [key, x, y, rot, w, d, label?] 배열로 줄여요. 도면 이미지는 주소에 넣지 않아요(이 기기에만 있어요).
const b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const unb64 = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export function encodePlan(plan: Plan): string {
  const preset = PRESETS.find((p) => p.id === plan.preset);
  const sameRooms = preset && JSON.stringify(preset.rooms) === JSON.stringify(plan.rooms);
  const data = {
    v: 1, p: plan.preset,
    r: sameRooms ? undefined : plan.rooms.map((m) => [m.name, m.x, m.y, m.w, m.h]),
    i: plan.items.map((it) => {
      const f = FURNITURE_BY_KEY[it.key];
      const custom = !f || f.w !== it.w || f.d !== it.d || f.label !== it.label;
      return custom ? [it.key, it.x, it.y, it.rot, it.w, it.d, it.label] : [it.key, it.x, it.y, it.rot];
    }),
  };
  return b64(JSON.stringify(data));
}

const num = (v: unknown, lo: number, hi: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : null);

export function decodePlan(code: string): Plan | null {
  try {
    const d = JSON.parse(unb64(code));
    if (d?.v !== 1 || !Array.isArray(d.i)) return null;
    const base = presetPlan(typeof d.p === "string" ? d.p : "apt84");
    const rooms: Room[] = Array.isArray(d.r)
      ? d.r.slice(0, 40).flatMap((a: unknown[], k: number) => {
          const [name, x, y, w, h] = a;
          const v = [num(x, -5000, 5000), num(y, -5000, 5000), num(w, 50, 5000), num(h, 50, 5000)];
          return v.every((n) => n != null) && typeof name === "string" ? [{ id: `r${k}`, name: name.slice(0, 20), x: v[0]!, y: v[1]!, w: v[2]!, h: v[3]! }] : [];
        })
      : base.rooms;
    const items: Item[] = d.i.slice(0, 200).flatMap((a: unknown[]) => {
      const [key, x, y, rot, w, h, label] = a;
      const f = FURNITURE_BY_KEY[String(key)];
      const ww = w != null ? num(w, 10, 1000) : f?.w;
      const dd = h != null ? num(h, 10, 1000) : f?.d;
      const xx = num(x, -5000, 5000), yy = num(y, -5000, 5000);
      if (ww == null || dd == null || xx == null || yy == null) return [];
      const lab = typeof label === "string" ? label.slice(0, 30) : f?.label ?? "가구";
      return [{ id: newId(), key: f ? f.key : "custom", label: lab, x: xx, y: yy, w: ww, d: dd, rot: rot === 90 ? 90 : 0 }];
    });
    return { preset: base.preset, rooms, items };
  } catch {
    return null;
  }
}
