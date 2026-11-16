// 개발·AI 도구 계산 (2026-11-16, Gemini 이전 D). 화면: components/tools/dev/*. 모두 브라우저 안에서만 계산한다.

// ───────────────────────── LLM API 비용 ─────────────────────────
// WHY: Claude 가격은 claude-api 스킬 표(2026-11-03 캐시)에서 옮겼다. 다른 회사 모델은 가격이 자주 바뀌어
// 고정값을 두지 않고 "직접 입력" 줄로 받는다(낡은 가격표가 틀린 답을 내는 것보다 낫다).
export const LLM_PRICES_AS_OF = '2026-11-03';
export interface LlmPrice { id: string; label: string; input: number; output: number; cacheRead: number; longInput?: number; longOutput?: number; longFrom?: number }
export const LLM_PRICES: LlmPrice[] = [
  { id: 'claude-fable-5-2', label: 'Claude Fable 5.2', input: 8, output: 40, cacheRead: 0.2 },
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5', input: 4, output: 20, cacheRead: 0.2 },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', input: 2, output: 10, cacheRead: 0.1 },
  // Haiku 5.5: 입력 100K 토큰 넘는 요청은 $0.50/$2.50. 캐시 읽기 가격은 표에 없어 입력의 10%로 둔다.
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5', input: 0.1, output: 0.5, cacheRead: 0.01, longInput: 0.5, longOutput: 2.5, longFrom: 100_000 },
];
export const CACHE_WRITE_MULTIPLIER = 1.25; // 5분 캐시 쓰기 = 입력 단가 × 1.25
export const BATCH_DISCOUNT = 0.5;

export interface LlmUsage { requestsPerDay: number; inputTokens: number; outputTokens: number; cachedShare: number; batch: boolean; days: number }
export interface LlmCost { perRequest: number; daily: number; monthly: number; inputCost: number; outputCost: number; cacheSaving: number; long: boolean }

const finite = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function llmCost(p: LlmPrice, u: LlmUsage): LlmCost {
  const req = finite(u.requestsPerDay), inTok = finite(u.inputTokens), outTok = finite(u.outputTokens);
  const share = Math.min(1, Math.max(0, Number.isFinite(u.cachedShare) ? u.cachedShare : 0));
  const long = !!p.longFrom && inTok > p.longFrom;
  const inPrice = long ? p.longInput! : p.input, outPrice = long ? p.longOutput! : p.output;
  const mult = u.batch ? BATCH_DISCOUNT : 1;
  const cached = inTok * share, fresh = inTok - cached;
  // 캐시로 읽힌 몫은 읽기 단가. 캐시를 처음 쓰는 비용(1.25배)은 요청 수에 비해 작아 여기선 빼고 화면에서 안내한다.
  const inputCost = ((fresh * inPrice + cached * p.cacheRead) / 1e6) * mult;
  const outputCost = ((outTok * outPrice) / 1e6) * mult;
  const perRequest = inputCost + outputCost;
  const cacheSaving = ((cached * (inPrice - p.cacheRead)) / 1e6) * mult * req * finite(u.days);
  const daily = perRequest * req;
  return { perRequest, daily, monthly: daily * finite(u.days), inputCost, outputCost, cacheSaving, long };
}

// ───────────────────────── cron 표현식 ─────────────────────────
export interface CronField { values: number[]; any: boolean }
export interface CronParsed { minute: CronField; hour: CronField; dom: CronField; month: CronField; dow: CronField; source: string }
export type CronResult = { ok: true; cron: CronParsed } | { ok: false; error: string; field?: number };

const MACROS: Record<string, string> = { '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *', '@weekly': '0 0 * * 0', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *' };
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DOW_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const RANGES: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];

function parseField(raw: string, idx: number): CronField | string {
  const [lo, hi] = RANGES[idx];
  const names = idx === 3 ? MONTH_NAMES : idx === 4 ? DOW_NAMES : null;
  const num = (s: string): number | null => {
    const up = s.toUpperCase();
    if (names) { const i = names.indexOf(up); if (i >= 0) return idx === 3 ? i + 1 : i; }
    return /^\d+$/.test(s) ? Number(s) : null;
  };
  const set = new Set<number>();
  for (const part of raw.split(',')) {
    const m = part.match(/^(\*|[A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)(?:\/(\d+))?$/);
    if (!m) return part;
    const step = m[2] ? Number(m[2]) : 1;
    if (step < 1) return part;
    let a: number, b: number;
    if (m[1] === '*') { a = lo; b = hi; }
    else if (m[1].includes('-')) {
      const [x, y] = m[1].split('-').map(num);
      if (x === null || y === null) return part;
      a = x; b = y;
    } else {
      const x = num(m[1]);
      if (x === null) return part;
      a = x; b = m[2] ? hi : x; // "5/15" = 5부터 끝까지 15씩
    }
    if (a < lo || b > hi || a > b) return part;
    for (let v = a; v <= b; v += step) set.add(idx === 4 && v === 7 ? 0 : v);
  }
  const values = [...set].sort((x, y) => x - y);
  const full = idx === 4 ? 7 : hi - lo + 1;
  return { values, any: raw === '*' || values.length === full };
}

export function parseCron(expr: string): CronResult {
  const src = expr.trim().replace(/\s+/g, ' ');
  const text = MACROS[src.toLowerCase()] ?? src;
  const parts = text.split(' ');
  if (parts.length === 6) return { ok: false, error: 'six-fields' };
  if (parts.length !== 5) return { ok: false, error: 'field-count' };
  const fields: CronField[] = [];
  for (let i = 0; i < 5; i++) {
    const f = parseField(parts[i], i);
    if (typeof f === 'string') return { ok: false, error: 'bad-field', field: i };
    fields.push(f);
  }
  const [minute, hour, dom, month, dow] = fields;
  return { ok: true, cron: { minute, hour, dom, month, dow, source: text } };
}

function dayMatches(c: CronParsed, d: Date): boolean {
  const domOk = c.dom.values.includes(d.getDate());
  const dowOk = c.dow.values.includes(d.getDay());
  // WHY: Vixie cron 규칙 — 일(dom)과 요일(dow)이 둘 다 제한되면 둘 중 하나만 맞아도 실행한다.
  if (!c.dom.any && !c.dow.any) return domOk || dowOk;
  return domOk && dowOk;
}

/** from 이후(초 버림, 다음 분부터) 실행 시각 n개. 로컬 시간대 기준. 5년 안에 없으면 그만큼만 돌려준다. */
export function nextRuns(c: CronParsed, from: Date, n: number): Date[] {
  const out: Date[] = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), from.getHours(), from.getMinutes() + 1, 0, 0);
  const limit = from.getFullYear() + 5;
  while (out.length < n && d.getFullYear() <= limit) {
    if (!c.month.values.includes(d.getMonth() + 1)) { d.setMonth(d.getMonth() + 1, 1); d.setHours(0, 0, 0, 0); continue; }
    if (!dayMatches(c, d)) { d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); continue; }
    if (!c.hour.values.includes(d.getHours())) { d.setHours(d.getHours() + 1, 0, 0, 0); continue; }
    if (!c.minute.values.includes(d.getMinutes())) { d.setMinutes(d.getMinutes() + 1, 0, 0); continue; }
    out.push(new Date(d));
    d.setMinutes(d.getMinutes() + 1, 0, 0);
  }
  return out;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const DOW_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DOW_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function listText(vals: number[], fmt: (v: number) => string, lang: 'ko' | 'en'): string {
  // 3개 이상 이어지는 값은 "월~금"·"Monday–Friday"처럼 묶는다.
  const runs: string[] = [];
  for (let i = 0; i < vals.length; ) {
    let j = i;
    while (j + 1 < vals.length && vals[j + 1] === vals[j] + 1) j++;
    if (j - i >= 2) runs.push(`${fmt(vals[i])}${lang === 'ko' ? '~' : '–'}${fmt(vals[j])}`);
    else for (let k = i; k <= j; k++) runs.push(fmt(vals[k]));
    i = j + 1;
  }
  if (runs.length <= 1) return runs.join('');
  return lang === 'ko' ? runs.join(', ') : `${runs.slice(0, -1).join(', ')} and ${runs[runs.length - 1]}`;
}

// 0부터 일정 간격으로 끝까지 채운 값이면 그 간격(별/n), 아니면 0.
function stepOf(vals: number[], lo: number, hi: number): number {
  if (vals.length < 3 || vals[0] !== lo) return 0;
  const d = vals[1] - vals[0];
  for (let i = 2; i < vals.length; i++) if (vals[i] - vals[i - 1] !== d) return 0;
  return vals[vals.length - 1] + d > hi ? d : 0;
}

/** 사람이 읽는 설명 한 문장. */
export function describeCron(c: CronParsed, lang: 'ko' | 'en'): string {
  const ko = lang === 'ko';
  const { minute: mi, hour: h, dom, month: mo, dow } = c;
  const mStep = stepOf(mi.values, 0, 59), hStep = stepOf(h.values, 0, 23);
  const one = (v: number[]) => v.length === 1;
  let time: string;
  if (mi.any && h.any) time = ko ? '매분' : 'every minute';
  else if (h.any && mStep) time = ko ? `${mStep}분마다` : `every ${mStep} minutes`;
  else if (h.any) time = ko ? `매시 ${listText(mi.values, (v) => `${v}분`, lang)}에` : `at minute ${listText(mi.values, String, lang)} past every hour`;
  else if (hStep && one(mi.values)) time = ko ? `${hStep}시간마다 ${mi.values[0] === 0 ? '정각' : `${mi.values[0]}분`}에` : `every ${hStep} hours at minute ${mi.values[0]}`;
  else if (mi.any) time = ko ? `${listText(h.values, (v) => `${v}시`, lang)} 동안 매분` : `every minute during hour ${listText(h.values, String, lang)}`;
  else if (mStep && one(h.values)) time = ko ? `${h.values[0]}시대에 ${mStep}분마다` : `every ${mStep} minutes during hour ${h.values[0]}`;
  else if (h.values.length * mi.values.length <= 6) {
    const ts = h.values.flatMap((hh) => mi.values.map((mm) => `${pad2(hh)}:${pad2(mm)}`));
    time = ko ? `${ts.join(', ')}에` : `at ${ts.length > 1 ? `${ts.slice(0, -1).join(', ')} and ${ts[ts.length - 1]}` : ts[0]}`;
  } else time = ko ? `${listText(h.values, (v) => `${v}시`, lang)} ${listText(mi.values, (v) => `${v}분`, lang)}에` : `at minute ${listText(mi.values, String, lang)} past hour ${listText(h.values, String, lang)}`;
  const months = ko ? listText(mo.values, (v) => `${v}월`, lang) : listText(mo.values, (v) => MON_EN[v - 1], lang);
  const doms = ko ? listText(dom.values, (v) => `${v}일`, lang) : `day ${listText(dom.values, String, lang)} of the month`;
  const dows = ko ? `${listText(dow.values, (v) => DOW_KO[v], lang)}요일` : listText(dow.values, (v) => DOW_EN[v], lang);
  if (ko) {
    let day: string;
    const domPart = mo.any ? `매월 ${doms}` : `${months} ${doms}`;
    if (!dom.any && !dow.any) day = `${domPart} 또는 ${mo.any ? '매주 ' : ''}${dows}`;
    else if (!dom.any) day = domPart;
    else if (!dow.any) day = mo.any ? `매주 ${dows}` : `${months}의 ${dows}`;
    else day = mo.any ? '매일' : `${months} 매일`;
    return `${day} ${time} 실행해요.`;
  }
  const parts: string[] = [];
  if (!dom.any && !dow.any) parts.push(`on ${doms} or on ${dows}`);
  else if (!dom.any) parts.push(`on ${doms}`);
  else if (!dow.any) parts.push(`on ${dows}`);
  if (!mo.any) parts.push(`in ${months}`);
  const s = `Runs ${time}${parts.length ? ', ' + parts.join(', ') : ''}.`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** 하루(같은 요일·일 조건이면) 실행 횟수 — 부하 감 잡기용. */
export const runsPerMatchingDay = (c: CronParsed) => c.minute.values.length * c.hour.values.length;

// ───────────────────────── 텍스트 비교(diff) ─────────────────────────
export type DiffOp = { type: 'eq' | 'del' | 'add'; text: string; a?: number; b?: number };
export const DIFF_MAX_LINES = 4000;

/** 줄 단위 LCS diff. 앞뒤 같은 줄은 먼저 잘라 표를 작게 만든다. */
export function diffLines(left: string, right: string, opts: { ignoreSpace?: boolean; ignoreCase?: boolean } = {}): DiffOp[] {
  const A = left.split(/\r?\n/), B = right.split(/\r?\n/);
  const key = (s: string) => { let t = opts.ignoreSpace ? s.replace(/\s+/g, ' ').trim() : s; if (opts.ignoreCase) t = t.toLowerCase(); return t; };
  const ka = A.map(key), kb = B.map(key);
  let pre = 0;
  while (pre < A.length && pre < B.length && ka[pre] === kb[pre]) pre++;
  let suf = 0;
  while (suf < A.length - pre && suf < B.length - pre && ka[A.length - 1 - suf] === kb[B.length - 1 - suf]) suf++;
  const ops: DiffOp[] = [];
  for (let i = 0; i < pre; i++) ops.push({ type: 'eq', text: B[i], a: i + 1, b: i + 1 });
  const a0 = pre, a1 = A.length - suf, b0 = pre, b1 = B.length - suf;
  const n = a1 - a0, m = b1 - b0;
  if (n > DIFF_MAX_LINES || m > DIFF_MAX_LINES) throw new RangeError('too-many-lines');
  const W = m + 1;
  const T = new Uint32Array((n + 1) * W);
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    T[i * W + j] = ka[a0 + i] === kb[b0 + j] ? T[(i + 1) * W + j + 1] + 1 : Math.max(T[(i + 1) * W + j], T[i * W + j + 1]);
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && ka[a0 + i] === kb[b0 + j]) { ops.push({ type: 'eq', text: B[b0 + j], a: a0 + i + 1, b: b0 + j + 1 }); i++; j++; }
    else if (j < m && (i >= n || T[i * W + j + 1] >= T[(i + 1) * W + j])) { ops.push({ type: 'add', text: B[b0 + j], b: b0 + j + 1 }); j++; }
    else { ops.push({ type: 'del', text: A[a0 + i], a: a0 + i + 1 }); i++; }
  }
  for (let k = 0; k < suf; k++) ops.push({ type: 'eq', text: B[b1 + k], a: a1 + k + 1, b: b1 + k + 1 });
  return ops;
}

export function diffStats(ops: DiffOp[]) {
  const added = ops.filter((o) => o.type === 'add').length, removed = ops.filter((o) => o.type === 'del').length;
  const same = ops.length - added - removed;
  const total = same + Math.max(added, removed);
  return { added, removed, same, similarity: total ? same / total : 1 };
}

/** git 스타일 통합(unified) diff 텍스트. 바뀐 곳 앞뒤 context 줄만 남긴다. */
export function unifiedDiff(ops: DiffOp[], context = 3, names: [string, string] = ['a', 'b']): string {
  const changed = ops.map((o) => o.type !== 'eq');
  if (!changed.includes(true)) return '';
  const lines = [`--- ${names[0]}`, `+++ ${names[1]}`];
  let k = 0;
  while (k < ops.length) {
    if (!changed[k]) { k++; continue; }
    let start = Math.max(0, k - context), end = k;
    while (end < ops.length) {
      let next = end; while (next < ops.length && !changed[next]) next++;
      if (next >= ops.length || next - end > context * 2) { end = Math.min(ops.length, end + context); break; }
      end = next + 1; while (end < ops.length && changed[end]) end++;
    }
    const hunk = ops.slice(start, end);
    const aStart = hunk.find((o) => o.a)?.a ?? 0, bStart = hunk.find((o) => o.b)?.b ?? 0;
    const aLen = hunk.filter((o) => o.type !== 'add').length, bLen = hunk.filter((o) => o.type !== 'del').length;
    lines.push(`@@ -${aStart},${aLen} +${bStart},${bLen} @@`);
    for (const o of hunk) lines.push((o.type === 'eq' ? ' ' : o.type === 'del' ? '-' : '+') + o.text);
    k = end;
  }
  return lines.join('\n');
}

// ───────────────────────── JSON 스키마 검사 ─────────────────────────
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
export interface SchemaIssue { path: string; message: string; keyword: string }
const SUPPORTED = new Set(['$schema', '$id', '$ref', '$defs', 'definitions', 'title', 'description', 'default', 'examples', '$comment', 'type', 'enum', 'const', 'required', 'properties', 'additionalProperties', 'patternProperties', 'items', 'prefixItems', 'minItems', 'maxItems', 'uniqueItems', 'minLength', 'maxLength', 'pattern', 'format', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'minProperties', 'maxProperties', 'anyOf', 'oneOf', 'allOf', 'not']);

const typeOf = (v: Json): string => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
const isObj = (v: unknown): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v);
const ptr = (base: string, k: string | number) => `${base}/${String(k).replace(/~/g, '~0').replace(/\//g, '~1')}`;
const FORMATS: Record<string, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/i,
  uri: /^[a-z][a-z0-9+.-]*:[^\s]*$/i,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ipv4: /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/,
};
const deepEq = (a: Json, b: Json): boolean => JSON.stringify(a) === JSON.stringify(b);

export function validateSchema(schema: Json, data: Json): { issues: SchemaIssue[]; unsupported: string[] } {
  const root = schema;
  const unsupported = new Set<string>();
  const resolve = (ref: string): Json | undefined => {
    if (!ref.startsWith('#')) return undefined;
    let cur: Json | undefined = root;
    for (const seg of ref.slice(1).split('/').filter(Boolean)) {
      const k = seg.replace(/~1/g, '/').replace(/~0/g, '~');
      cur = isObj(cur) ? cur[k] : undefined;
    }
    return cur;
  };
  const check = (s: Json, v: Json, path: string, depth: number): SchemaIssue[] => {
    if (depth > 64) return [{ path, keyword: '$ref', message: 'ref-depth' }];
    if (s === true || s === undefined) return [];
    if (s === false) return [{ path, keyword: 'false', message: 'not-allowed' }];
    if (!isObj(s)) return [];
    for (const k of Object.keys(s)) if (!SUPPORTED.has(k)) unsupported.add(k);
    const out: SchemaIssue[] = [];
    const add = (keyword: string, message: string, p = path) => out.push({ path: p, keyword, message });
    if (typeof s.$ref === 'string') {
      const target = resolve(s.$ref);
      if (target === undefined) add('$ref', `unresolved:${s.$ref}`);
      else out.push(...check(target, v, path, depth + 1));
    }
    const t = typeOf(v);
    if (s.type !== undefined) {
      const types = Array.isArray(s.type) ? s.type : [s.type];
      const ok = types.some((x) => x === t || (x === 'integer' && t === 'number' && Number.isInteger(v)) || (x === 'number' && t === 'number'));
      if (!ok) { add('type', `type:${types.join('|')}:${t === 'number' && Number.isInteger(v) ? 'integer' : t}`); return out; }
    }
    if (Array.isArray(s.enum) && !s.enum.some((e) => deepEq(e, v))) add('enum', `enum:${s.enum.map((e) => JSON.stringify(e)).join(', ')}`);
    if ('const' in s && !deepEq(s.const as Json, v)) add('const', `const:${JSON.stringify(s.const)}`);
    if (t === 'string') {
      const str = v as string, len = [...str].length;
      if (typeof s.minLength === 'number' && len < s.minLength) add('minLength', `minLength:${s.minLength}:${len}`);
      if (typeof s.maxLength === 'number' && len > s.maxLength) add('maxLength', `maxLength:${s.maxLength}:${len}`);
      if (typeof s.pattern === 'string') { try { if (!new RegExp(s.pattern, 'u').test(str)) add('pattern', `pattern:${s.pattern}`); } catch { add('pattern', `bad-pattern:${s.pattern}`); } }
      if (typeof s.format === 'string' && FORMATS[s.format] && !FORMATS[s.format].test(str)) add('format', `format:${s.format}`);
    }
    if (t === 'number') {
      const n = v as number;
      if (typeof s.minimum === 'number' && n < s.minimum) add('minimum', `minimum:${s.minimum}`);
      if (typeof s.maximum === 'number' && n > s.maximum) add('maximum', `maximum:${s.maximum}`);
      if (typeof s.exclusiveMinimum === 'number' && n <= s.exclusiveMinimum) add('exclusiveMinimum', `exclusiveMinimum:${s.exclusiveMinimum}`);
      if (typeof s.exclusiveMaximum === 'number' && n >= s.exclusiveMaximum) add('exclusiveMaximum', `exclusiveMaximum:${s.exclusiveMaximum}`);
      if (typeof s.multipleOf === 'number' && s.multipleOf > 0 && Math.abs(n / s.multipleOf - Math.round(n / s.multipleOf)) > 1e-9) add('multipleOf', `multipleOf:${s.multipleOf}`);
    }
    if (t === 'array') {
      const arr = v as Json[];
      if (typeof s.minItems === 'number' && arr.length < s.minItems) add('minItems', `minItems:${s.minItems}:${arr.length}`);
      if (typeof s.maxItems === 'number' && arr.length > s.maxItems) add('maxItems', `maxItems:${s.maxItems}:${arr.length}`);
      if (s.uniqueItems === true && new Set(arr.map((x) => JSON.stringify(x))).size !== arr.length) add('uniqueItems', 'uniqueItems');
      const prefix = Array.isArray(s.prefixItems) ? s.prefixItems : [];
      arr.forEach((item, i) => {
        if (i < prefix.length) out.push(...check(prefix[i], item, ptr(path, i), depth + 1));
        else if (s.items !== undefined && !Array.isArray(s.items)) out.push(...check(s.items, item, ptr(path, i), depth + 1));
      });
    }
    if (t === 'object') {
      const obj = v as Record<string, Json>;
      const keys = Object.keys(obj);
      if (Array.isArray(s.required)) for (const r of s.required) if (typeof r === 'string' && !(r in obj)) add('required', `required:${r}`);
      if (typeof s.minProperties === 'number' && keys.length < s.minProperties) add('minProperties', `minProperties:${s.minProperties}`);
      if (typeof s.maxProperties === 'number' && keys.length > s.maxProperties) add('maxProperties', `maxProperties:${s.maxProperties}`);
      const props = isObj(s.properties) ? s.properties : {};
      const pats = isObj(s.patternProperties) ? Object.entries(s.patternProperties) : [];
      for (const k of keys) {
        let matched = false;
        if (k in props) { matched = true; out.push(...check(props[k], obj[k], ptr(path, k), depth + 1)); }
        for (const [p, ps] of pats) { try { if (new RegExp(p, 'u').test(k)) { matched = true; out.push(...check(ps, obj[k], ptr(path, k), depth + 1)); } } catch { /* 잘못된 패턴은 무시 */ } }
        if (!matched && s.additionalProperties !== undefined) {
          if (s.additionalProperties === false) add('additionalProperties', `additional:${k}`, ptr(path, k));
          else out.push(...check(s.additionalProperties, obj[k], ptr(path, k), depth + 1));
        }
      }
    }
    if (Array.isArray(s.allOf)) for (const sub of s.allOf) out.push(...check(sub, v, path, depth + 1));
    if (Array.isArray(s.anyOf) && !s.anyOf.some((sub) => check(sub, v, path, depth + 1).length === 0)) add('anyOf', 'anyOf');
    if (Array.isArray(s.oneOf)) {
      const passing = s.oneOf.filter((sub) => check(sub, v, path, depth + 1).length === 0).length;
      if (passing !== 1) add('oneOf', `oneOf:${passing}`);
    }
    if (s.not !== undefined && check(s.not, v, path, depth + 1).length === 0) add('not', 'not');
    return out;
  };
  const issues = check(schema, data, '', 0);
  return { issues, unsupported: [...unsupported].sort() };
}

/** 예시 JSON 하나로 초안 스키마를 만든다. 모든 키를 required로 두므로 손으로 다듬어 써야 한다. */
export function inferSchema(v: Json): Json {
  const t = typeOf(v);
  if (t === 'number') return { type: Number.isInteger(v) ? 'integer' : 'number' };
  if (t === 'string') {
    const s = v as string;
    const fmt = (['date-time', 'date', 'email', 'uuid', 'uri'] as const).find((f) => FORMATS[f].test(s));
    return fmt ? { type: 'string', format: fmt } : { type: 'string' };
  }
  if (t === 'array') {
    const arr = v as Json[];
    if (!arr.length) return { type: 'array', items: {} };
    const schemas = arr.map(inferSchema);
    const uniq = [...new Map(schemas.map((x) => [JSON.stringify(x), x])).values()];
    return { type: 'array', items: uniq.length === 1 ? uniq[0] : { anyOf: uniq } };
  }
  if (t === 'object') {
    const obj = v as Record<string, Json>;
    const properties: Record<string, Json> = {};
    for (const [k, x] of Object.entries(obj)) properties[k] = inferSchema(x);
    return { type: 'object', properties, required: Object.keys(obj), additionalProperties: false };
  }
  return { type: t };
}

// ───────────────────────── 마크다운 표 ─────────────────────────
export type Align = 'left' | 'center' | 'right' | 'none';

export function detectDelimiter(text: string): ',' | '\t' | ';' | '|' {
  const first = text.split(/\r?\n/).find((l) => l.trim()) ?? '';
  const counts: [',' | '\t' | ';' | '|', number][] = [['\t', 0], [',', 0], [';', 0], ['|', 0]];
  for (const c of counts) c[1] = first.split(c[0]).length - 1;
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ',';
}

/** RFC 4180 따옴표를 지키는 구분자 표 파서. */
export function parseDelimited(text: string, delim = detectDelimiter(text)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += ch;
    } else if (delim === '|' && ch === '\\' && text[i + 1] === '|') { cell += '|'; i++; }
    else if (ch === '"' && cell === '' && delim !== '|') q = true;
    else if (ch === delim) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const trimmed = rows.map((r) => (delim === '|' ? r.map((c) => c.trim()) : r)).filter((r) => r.some((c) => c.trim() !== ''));
  if (delim === '|') return trimmed.map((r) => { const x = [...r]; if (x[0] === '') x.shift(); if (x[x.length - 1] === '') x.pop(); return x; }).filter((r) => !r.every((c) => /^:?-{3,}:?$/.test(c)));
  return trimmed;
}

/** 화면 폭: 한글·한자·전각은 2칸. 표 정렬용. */
export function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    w += (c >= 0x1100 && c <= 0x115f) || (c >= 0x2e80 && c <= 0xa4cf) || (c >= 0xac00 && c <= 0xd7a3) || (c >= 0xf900 && c <= 0xfaff) || (c >= 0xfe30 && c <= 0xfe4f) || (c >= 0xff00 && c <= 0xff60) || (c >= 0xffe0 && c <= 0xffe6) || (c >= 0x1f300 && c <= 0x1faff) ? 2 : 1;
  }
  return w;
}

const isNumeric = (s: string) => /^[-+]?[$₩€¥£]?\s?\d[\d,]*(\.\d+)?\s?%?$/.test(s.trim());
export function autoAlign(rows: string[][]): Align[] {
  const cols = Math.max(0, ...rows.map((r) => r.length));
  return Array.from({ length: cols }, (_, c) => {
    const body = rows.slice(1).map((r) => r[c] ?? '').filter((x) => x.trim());
    return body.length && body.every(isNumeric) ? 'right' : 'left';
  });
}

export function toMarkdownTable(rows: string[][], aligns?: Align[], pretty = true): string {
  if (!rows.length) return '';
  const cols = Math.max(...rows.map((r) => r.length));
  const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>').trim();
  const grid = rows.map((r) => Array.from({ length: cols }, (_, c) => esc(r[c] ?? '')));
  const al = Array.from({ length: cols }, (_, c) => aligns?.[c] ?? 'none');
  const widths = Array.from({ length: cols }, (_, c) => Math.max(3, ...grid.map((r) => displayWidth(r[c]))));
  const cell = (s: string, c: number) => {
    if (!pretty) return s;
    const gap = widths[c] - displayWidth(s);
    if (al[c] === 'right') return ' '.repeat(gap) + s;
    if (al[c] === 'center') return ' '.repeat(Math.floor(gap / 2)) + s + ' '.repeat(Math.ceil(gap / 2));
    return s + ' '.repeat(gap);
  };
  const sep = al.map((a, c) => {
    const w = pretty ? widths[c] : 3;
    if (a === 'left') return ':' + '-'.repeat(w - 1);
    if (a === 'right') return '-'.repeat(w - 1) + ':';
    if (a === 'center') return ':' + '-'.repeat(w - 2) + ':';
    return '-'.repeat(w);
  });
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
  return [line(grid[0].map(cell)), line(sep), ...grid.slice(1).map((r) => line(r.map(cell)))].join('\n');
}

export function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n');
}

// ───────────────────────── AI 검색 노출 준비도 ─────────────────────────
// WHY: 브라우저에서는 다른 사이트를 직접 읽을 수 없어(CORS) 사용자가 붙여 넣은 HTML·robots.txt만 본다.
export const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Googlebot', 'Bingbot', 'CCBot', 'Applebot-Extended'] as const;
export type CheckStatus = 'pass' | 'warn' | 'fail';
export interface AuditCheck { id: string; status: CheckStatus; weight: number; detail: string }

/** robots.txt에서 에이전트가 "/" 전체를 막혔는지. 가장 구체적인 그룹을 쓰고, 없으면 * 그룹. */
export function robotsBlocks(robots: string, agent: string, path = '/'): boolean {
  const groups: { agents: string[]; rules: [boolean, string][] }[] = [];
  let cur: { agents: string[]; rules: [boolean, string][] } | null = null;
  let lastWasAgent = false;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const k = m[1].toLowerCase(), val = m[2].trim();
    if (k === 'user-agent') {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
    } else if ((k === 'allow' || k === 'disallow') && cur) {
      lastWasAgent = false;
      if (val !== '') cur.rules.push([k === 'allow', val]);
    } else lastWasAgent = false;
  }
  const a = agent.toLowerCase();
  const group = groups.find((g) => g.agents.includes(a)) ?? groups.find((g) => g.agents.includes('*'));
  if (!group) return false;
  let best: [boolean, string] | null = null;
  for (const r of group.rules) {
    const pat = r[1].replace(/\$$/, '');
    const re = new RegExp('^' + pat.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*'));
    if (re.test(path) && (!best || r[1].length > best[1].length || (r[1].length === best[1].length && r[0]))) best = r;
  }
  return !!best && !best[0];
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))?.slice(2).find((x) => x !== undefined) ?? '';
const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

export function auditAiReadiness(html: string, robots = ''): { score: number; checks: AuditCheck[]; blocked: string[]; facts: Record<string, string | number> } {
  const checks: AuditCheck[] = [];
  const push = (id: string, status: CheckStatus, weight: number, detail = '') => checks.push({ id, status, weight, detail });
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  const meta = (key: string) => { const t = metas.find((m) => new RegExp(`(name|property)\\s*=\\s*["']?${key}["']?`, 'i').test(m)); return t ? decode(attr(t, 'content')) : null; };
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim());
  const desc = meta('description');
  const robotsMeta = (meta('robots') ?? '') + ' ' + (meta('googlebot') ?? '');
  const canonical = (html.match(/<link\b[^>]*rel\s*=\s*["']?canonical["']?[^>]*>/i) ?? [''])[0];
  const lang = attr((html.match(/<html\b[^>]*>/i) ?? [''])[0], 'lang');
  const h1 = (html.match(/<h1\b/gi) ?? []).length, h2 = (html.match(/<h2\b/gi) ?? []).length;
  const ldBlocks = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const ldTypes = new Set<string>();
  let ldBroken = 0;
  const walk = (x: unknown) => {
    if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === 'object') {
      const o = x as Record<string, unknown>;
      const t = o['@type'];
      (Array.isArray(t) ? t : [t]).forEach((y) => typeof y === 'string' && ldTypes.add(y));
      Object.values(o).forEach(walk);
    }
  };
  for (const b of ldBlocks) { try { walk(JSON.parse(b)); } catch { ldBroken++; } }
  const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const text = decode(body).replace(/\s+/g, ' ').trim();
  const chars = text.replace(/\s/g, '').length;
  const lists = (html.match(/<(ul|ol|table|dl)\b/gi) ?? []).length;
  const dated = !!(meta('article:modified_time') || meta('article:published_time') || /"date(Modified|Published)"\s*:/.test(html) || /<time\b[^>]*datetime/i.test(html));
  const og = !!meta('og:title') && !!meta('og:description');

  push('title', title.length >= 10 && title.length <= 70 ? 'pass' : title ? 'warn' : 'fail', 10, String(title.length));
  push('description', desc && desc.length >= 50 && desc.length <= 170 ? 'pass' : desc ? 'warn' : 'fail', 8, String(desc?.length ?? 0));
  push('noindex', /noindex|none/i.test(robotsMeta) ? 'fail' : /nosnippet|max-snippet\s*:\s*0/i.test(robotsMeta) ? 'warn' : 'pass', 15, robotsMeta.trim());
  push('canonical', canonical ? 'pass' : 'warn', 6, canonical ? attr(canonical, 'href') : '');
  push('lang', lang ? 'pass' : 'warn', 4, lang);
  push('h1', h1 === 1 ? 'pass' : h1 === 0 ? 'fail' : 'warn', 8, String(h1));
  push('headings', h2 >= 2 ? 'pass' : h2 === 1 ? 'warn' : 'fail', 8, String(h2));
  push('jsonld', ldBroken ? 'fail' : ldTypes.size ? 'pass' : 'warn', 10, [...ldTypes].join(', '));
  push('faq', ldTypes.has('FAQPage') || /<(details|dt)\b/i.test(html) || /<h[23][^>]*>[^<]*\?\s*</i.test(html) ? 'pass' : 'warn', 6);
  push('text', chars >= 1500 ? 'pass' : chars >= 400 ? 'warn' : 'fail', 10, String(chars));
  push('structure', lists >= 1 ? 'pass' : 'warn', 5, String(lists));
  push('date', dated ? 'pass' : 'warn', 5);
  push('og', og ? 'pass' : 'warn', 3);
  const blocked = robots.trim() ? AI_CRAWLERS.filter((a) => robotsBlocks(robots, a)) : [];
  if (robots.trim()) push('robots', blocked.length === 0 ? 'pass' : blocked.some((b) => ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'Googlebot', 'Bingbot'].includes(b)) ? 'fail' : 'warn', 12, blocked.join(', '));
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.status === 'pass' ? c.weight : c.status === 'warn' ? c.weight / 2 : 0), 0);
  return { score: Math.round((got / total) * 100), checks, blocked, facts: { title, chars, h1, h2, jsonld: ldBlocks.length } };
}
