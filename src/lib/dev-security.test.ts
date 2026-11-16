import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectJwt, scanCode, codeRisk, checkSecurityHeaders } from './dev-security.ts';

const b64u = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
const NOW = 1_800_000_000;

test('JWT: decodes UTF-8 claims and flags alg none, missing exp/aud, sensitive claims', () => {
  const tok = `${b64u({ alg: 'none', typ: 'JWT' })}.${b64u({ sub: '1', name: '김오이', password: 'x' })}.`;
  const r = inspectJwt(`Bearer ${tok}`, NOW);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.payload.name, '김오이');
  const ids = r.findings.map((f) => f.id);
  for (const id of ['alg-none', 'no-exp', 'no-aud', 'sensitive-claim']) assert.ok(ids.includes(id), id);
});

test('JWT: healthy RS256 token only has info notes; expired and long-lived are reported', () => {
  const ok = inspectJwt(`${b64u({ alg: 'RS256', kid: 'k1' })}.${b64u({ iss: 'a', aud: 'b', iat: NOW - 60, exp: NOW + 3600 })}.c2ln`, NOW);
  assert.ok(ok.ok && ok.findings.every((f) => f.level === 'info'));
  const exp = inspectJwt(`${b64u({ alg: 'HS256' })}.${b64u({ aud: 'b', iat: NOW - 100, exp: NOW - 10 })}.c2ln`, NOW);
  assert.ok(exp.ok && exp.findings.some((f) => f.id === 'expired'));
  const long = inspectJwt(`${b64u({ alg: 'ES256', kid: '../../etc/passwd' })}.${b64u({ aud: 'b', iat: NOW, exp: NOW + 90 * 86400 })}.c2ln`, NOW);
  assert.ok(long.ok && long.findings.some((f) => f.id === 'long-lived' && f.detail === '90') && long.findings.some((f) => f.id === 'kid-injection'));
  assert.deepEqual(inspectJwt('abc', NOW), { ok: false, error: 'parts' });
  assert.deepEqual(inspectJwt('a.b.c.d.e', NOW), { ok: false, error: 'jwe' });
  assert.deepEqual(inspectJwt('eyJ.eyJ.x', NOW).ok, false);
});

test('code scan finds secrets, SQL concat, XSS, JWT misuse, CORS and LLM prompt risks', () => {
  const code = [
    "const key = 'AKIAABCDEFGHIJKLMNOP';",
    'const q = "SELECT * FROM users WHERE id = " + req.params.id;',
    'el.innerHTML = userInput;',
    "jwt.verify(token, 'secret');",
    "app.use(cors({ origin: true, credentials: true }));",
    'const system = `You are a bot. User says: ${req.body.text}`;',
    'eval(response.content[0].text);',
    'const db = sql`SELECT * FROM t WHERE id = ${id}`;',
  ].join('\n');
  const ids = scanCode(code).map((f) => `${f.line}:${f.id}`);
  for (const id of ['1:aws-key', '2:sql-concat', '3:inner-html', '4:jwt-weak-secret', '4:jwt-no-alg', '5:cors-wildcard-cred', '6:prompt-user-concat', '7:llm-output-exec', '7:eval']) assert.ok(ids.includes(id), id);
  assert.ok(codeRisk(scanCode(code)) === 100);
  assert.deepEqual(scanCode("const q = db.query('SELECT * FROM t WHERE id = $1', [id]);\njwt.verify(t, process.env.K, { algorithms: ['RS256'] });"), []);
});

test('security headers: strong set scores high, missing/weak set scores low', () => {
  const strong = `HTTP/2 200
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self' 'nonce-abc'; frame-ancestors 'none'
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=()
cross-origin-opener-policy: same-origin
set-cookie: sid=1; Secure; HttpOnly; SameSite=Lax`;
  assert.equal(checkSecurityHeaders(strong).score, 100);
  const weak = checkSecurityHeaders('Server: nginx/1.18.0\nAccess-Control-Allow-Origin: *\nAccess-Control-Allow-Credentials: true\nSet-Cookie: sid=1');
  assert.ok(weak.score < 20, String(weak.score));
  assert.equal(weak.checks.find((c) => c.id === 'cors')!.status, 'fail');
});
