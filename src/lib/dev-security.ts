// 개발 보안 점검 (2026-11-16, Gemini 이전 D2). Gemini의 agent-* 가드 18종 중 겹치는 보안 가드(JWT·SQL 주입·XSS·
// 프롬프트 유출·CORS·비밀키)를 세 도구로 묶었다: JWT 해석기, 코드 보안 점검, HTTP 보안 헤더 점검. 모두 브라우저 안에서만 돈다.

// ───────────────────────── JWT ─────────────────────────
export interface JwtFinding { id: string; level: 'high' | 'medium' | 'info'; detail?: string }
export type JwtResult =
  | { ok: true; header: Record<string, unknown>; payload: Record<string, unknown>; signature: string; findings: JwtFinding[]; times: { iat?: number; nbf?: number; exp?: number } }
  | { ok: false; error: 'parts' | 'base64' | 'json' | 'jwe' };

export function base64UrlDecode(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new Error('base64');
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const SENSITIVE_CLAIM = /pass(word)?|pwd|secret|ssn|주민|card|cvv|api[_-]?key|private/i;

/** 서명은 검증하지 않는다(키가 없으므로). 모양과 흔한 실수만 본다. nowSec = 지금(초). */
export function inspectJwt(token: string, nowSec: number): JwtResult {
  const t = token.trim().replace(/^Bearer\s+/i, '');
  const parts = t.split('.');
  if (parts.length === 5) return { ok: false, error: 'jwe' };
  if (parts.length !== 3) return { ok: false, error: 'parts' };
  let header: Record<string, unknown>, payload: Record<string, unknown>;
  try {
    const h = base64UrlDecode(parts[0]), p = base64UrlDecode(parts[1]);
    try { header = JSON.parse(h); payload = JSON.parse(p); } catch { return { ok: false, error: 'json' }; }
  } catch { return { ok: false, error: 'base64' }; }
  if (typeof header !== 'object' || header === null || typeof payload !== 'object' || payload === null) return { ok: false, error: 'json' };
  const f: JwtFinding[] = [];
  const alg = String(header.alg ?? '');
  if (!alg || alg.toLowerCase() === 'none') f.push({ id: 'alg-none', level: 'high' });
  if (alg.toLowerCase() !== 'none' && !parts[2]) f.push({ id: 'no-signature', level: 'high' });
  if (/^HS/.test(alg)) f.push({ id: 'hmac', level: 'info', detail: alg });
  if (typeof header.jku === 'string' || typeof header.x5u === 'string') f.push({ id: 'remote-key', level: 'medium', detail: String(header.jku ?? header.x5u) });
  if (header.jwk) f.push({ id: 'embedded-jwk', level: 'medium' });
  if (typeof header.kid === 'string' && /[./\\'"]|\.\./.test(header.kid)) f.push({ id: 'kid-injection', level: 'medium', detail: header.kid });
  const num = (k: string) => (typeof payload[k] === 'number' ? (payload[k] as number) : undefined);
  const times = { iat: num('iat'), nbf: num('nbf'), exp: num('exp') };
  if (times.exp === undefined) f.push({ id: 'no-exp', level: 'high' });
  else if (times.exp < nowSec) f.push({ id: 'expired', level: 'info', detail: String(nowSec - times.exp) });
  else if (times.exp - (times.iat ?? nowSec) > 30 * 86400) f.push({ id: 'long-lived', level: 'medium', detail: String(Math.round((times.exp - (times.iat ?? nowSec)) / 86400)) });
  if (times.nbf !== undefined && times.nbf > nowSec) f.push({ id: 'not-yet', level: 'info' });
  if (times.iat !== undefined && times.iat > nowSec + 300) f.push({ id: 'future-iat', level: 'medium' });
  if (payload.aud === undefined) f.push({ id: 'no-aud', level: 'medium' });
  if (payload.iss === undefined) f.push({ id: 'no-iss', level: 'info' });
  const sens = Object.keys(payload).filter((k) => SENSITIVE_CLAIM.test(k));
  if (sens.length) f.push({ id: 'sensitive-claim', level: 'high', detail: sens.join(', ') });
  return { ok: true, header, payload, signature: parts[2], findings: f, times };
}

// ───────────────────────── 코드 보안 점검 ─────────────────────────
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type RuleGroup = 'secret' | 'injection' | 'xss' | 'jwt' | 'cors' | 'llm' | 'crypto';
export interface CodeRule { id: string; group: RuleGroup; severity: Severity; re: RegExp }
export interface CodeFinding { id: string; group: RuleGroup; severity: Severity; line: number; excerpt: string }

// WHY: 정규식 점검은 빠르지만 문맥을 모른다. 그래서 "의심 위치"로만 보여 주고, 고치는 법은 화면 문구에서 안내한다.
export const CODE_RULES: CodeRule[] = [
  { id: 'aws-key', group: 'secret', severity: 'critical', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'private-key', group: 'secret', severity: 'critical', re: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { id: 'api-token', group: 'secret', severity: 'critical', re: /\b(sk-(ant-|proj-)?[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35})\b/ },
  { id: 'hardcoded-secret', group: 'secret', severity: 'high', re: /\b(password|passwd|secret|api[_-]?key|token|auth[_-]?key)\b\s*[:=]\s*['"`][^'"`\s]{6,}['"`]/i },
  { id: 'sql-concat', group: 'injection', severity: 'critical', re: /\b(SELECT|INSERT|UPDATE|DELETE)\b[^;\n]*(['"`]\s*\+\s*\w|\$\{[^}]+\}|%s['"]\s*%|f["'][^"']*\{)/i },
  { id: 'cmd-exec', group: 'injection', severity: 'high', re: /\b(child_process\.)?(exec|execSync)\s*\(\s*[`'"][^`'"]*(\$\{|['"]\s*\+)|os\.system\(|subprocess\.\w+\([^)]*shell\s*=\s*True/ },
  { id: 'eval', group: 'injection', severity: 'high', re: /\beval\s*\(|new Function\s*\(|setTimeout\s*\(\s*['"`]/ },
  { id: 'inner-html', group: 'xss', severity: 'high', re: /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(|document\.write\s*\(/ },
  { id: 'react-dangerous', group: 'xss', severity: 'medium', re: /dangerouslySetInnerHTML|v-html\s*=|\{@html\s/ },
  { id: 'jwt-weak-secret', group: 'jwt', severity: 'critical', re: /jwt\.(sign|verify)\s*\([^,]+,\s*['"`][^'"`]{0,15}['"`]/ },
  { id: 'jwt-no-alg', group: 'jwt', severity: 'high', re: /jwt\.verify\s*\((?![^)]*algorithms)[^)]*\)/ },
  { id: 'jwt-decode-trust', group: 'jwt', severity: 'high', re: /jwt\.decode\s*\(/ },
  { id: 'cors-wildcard-cred', group: 'cors', severity: 'high', re: /(origin\s*:\s*(true|['"`]\*['"`])[^}]*credentials\s*:\s*true|credentials\s*:\s*true[^}]*origin\s*:\s*(true|['"`]\*['"`]))/s },
  { id: 'cors-wildcard', group: 'cors', severity: 'low', re: /Access-Control-Allow-Origin['"]?\s*[:,]\s*['"]\*['"]|cors\(\s*\)/ },
  { id: 'prompt-user-concat', group: 'llm', severity: 'medium', re: /(system|prompt|instructions?)\w*\s*[:=+]\s*[`'"][^`'"]*(\$\{\s*(req|request|input|user|body|query)[\w.]*\}|['"]\s*\+\s*(req|request|input|user|body|query))/i },
  { id: 'llm-output-exec', group: 'llm', severity: 'high', re: /(eval|exec|Function)\s*\(\s*(response|completion|output|message|result)[\w.[\]]*\.(content|text)/ },
  { id: 'secret-in-prompt', group: 'llm', severity: 'high', re: /(system|prompt)\w*\s*[:=][^\n]*(api[_-]?key|password|secret)\s*[:=]/i },
  { id: 'weak-hash', group: 'crypto', severity: 'medium', re: /createHash\(\s*['"](md5|sha1)['"]|\bhashlib\.(md5|sha1)\(|\bMD5\(/i },
  { id: 'math-random-token', group: 'crypto', severity: 'medium', re: /(token|secret|password|otp|nonce|key)\w*\s*=\s*[^;\n]*Math\.random\(/i },
  { id: 'tls-off', group: 'crypto', severity: 'high', re: /rejectUnauthorized\s*:\s*false|verify\s*=\s*False|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0/ },
];

export function scanCode(code: string): CodeFinding[] {
  const out: CodeFinding[] = [];
  const lines = code.split(/\r?\n/);
  for (const rule of CODE_RULES) {
    if (rule.re.flags.includes('s')) {
      const m = code.match(rule.re);
      if (m && m.index !== undefined) {
        const line = code.slice(0, m.index).split('\n').length;
        out.push({ id: rule.id, group: rule.group, severity: rule.severity, line, excerpt: lines[line - 1].trim().slice(0, 160) });
      }
      continue;
    }
    lines.forEach((l, i) => {
      if (/^\s*(\/\/|#)\s*(ok|nosec|safe)\b/i.test(l)) return;
      if (rule.re.test(l)) out.push({ id: rule.id, group: rule.group, severity: rule.severity, line: i + 1, excerpt: l.trim().slice(0, 160) });
    });
  }
  // jwt-weak-secret에 걸린 줄은 hardcoded-secret 중복을 지운다.
  const weak = new Set(out.filter((f) => f.id === 'jwt-weak-secret').map((f) => f.line));
  const rank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return out.filter((f) => !(f.id === 'hardcoded-secret' && weak.has(f.line))).sort((a, b) => rank[a.severity] - rank[b.severity] || a.line - b.line);
}

export function codeRisk(findings: CodeFinding[]): number {
  const w: Record<Severity, number> = { critical: 40, high: 20, medium: 8, low: 3 };
  return Math.min(100, findings.reduce((s, f) => s + w[f.severity], 0));
}

// ───────────────────────── HTTP 보안 헤더 ─────────────────────────
export interface HeaderCheck { id: string; status: 'pass' | 'warn' | 'fail'; weight: number; value: string }

export function parseHeaders(raw: string): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const line of raw.split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i <= 0 || /^HTTP\//i.test(line)) continue;
    const k = line.slice(0, i).trim().toLowerCase(), v = line.slice(i + 1).trim();
    m.set(k, [...(m.get(k) ?? []), v]);
  }
  return m;
}

export function checkSecurityHeaders(raw: string): { score: number; checks: HeaderCheck[] } {
  const h = parseHeaders(raw);
  const get = (k: string) => (h.get(k) ?? []).join(', ');
  const checks: HeaderCheck[] = [];
  const add = (id: string, status: HeaderCheck['status'], weight: number, value: string) => checks.push({ id, status, weight, value });
  const hsts = get('strict-transport-security');
  const maxAge = Number(hsts.match(/max-age\s*=\s*(\d+)/i)?.[1] ?? 0);
  add('hsts', !hsts ? 'fail' : maxAge >= 15552000 ? 'pass' : 'warn', 15, hsts);
  const csp = get('content-security-policy');
  add('csp', !csp ? (get('content-security-policy-report-only') ? 'warn' : 'fail') : /unsafe-inline|unsafe-eval|\*\s*;|default-src\s+\*/.test(csp) && !/'(nonce|sha256)-/.test(csp) ? 'warn' : 'pass', 20, csp || get('content-security-policy-report-only'));
  const xfo = get('x-frame-options');
  add('frame', xfo || /frame-ancestors/i.test(csp) ? 'pass' : 'fail', 10, xfo || (csp.match(/frame-ancestors[^;]*/i)?.[0] ?? ''));
  add('nosniff', /nosniff/i.test(get('x-content-type-options')) ? 'pass' : 'fail', 10, get('x-content-type-options'));
  const rp = get('referrer-policy');
  add('referrer', !rp ? 'warn' : /unsafe-url|no-referrer-when-downgrade/i.test(rp) ? 'warn' : 'pass', 8, rp);
  add('permissions', get('permissions-policy') ? 'pass' : 'warn', 5, get('permissions-policy'));
  const acao = get('access-control-allow-origin'), acac = get('access-control-allow-credentials');
  if (acao) add('cors', acao === '*' && /true/i.test(acac) ? 'fail' : acao === '*' ? 'warn' : 'pass', 12, `${acao}${acac ? `; credentials=${acac}` : ''}`);
  const cookies = h.get('set-cookie') ?? [];
  if (cookies.length) {
    const bad = cookies.filter((c) => !/;\s*secure/i.test(c) || !/;\s*httponly/i.test(c) || !/;\s*samesite/i.test(c));
    add('cookies', bad.length ? 'warn' : 'pass', 10, bad.map((c) => c.split('=')[0]).join(', '));
  }
  const leak = ['server', 'x-powered-by', 'x-aspnet-version'].map((k) => get(k)).filter((v) => /\d/.test(v));
  add('version-leak', leak.length ? 'warn' : 'pass', 5, leak.join(', '));
  add('corp', get('cross-origin-opener-policy') ? 'pass' : 'warn', 5, get('cross-origin-opener-policy'));
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.status === 'pass' ? c.weight : c.status === 'warn' ? c.weight / 2 : 0), 0);
  return { score: Math.round((got / total) * 100), checks };
}
