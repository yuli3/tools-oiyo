import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LLM_PRICES, llmCost, parseCron, nextRuns, describeCron, diffLines, diffStats, unifiedDiff, validateSchema, inferSchema, parseDelimited, toMarkdownTable, autoAlign, displayWidth, toCsv, robotsBlocks, auditAiReadiness, type Json } from './dev-tools.ts';

const price = (id: string) => LLM_PRICES.find((p) => p.id === id)!;

test('LLM cost: 1,000 req/day × (2K in + 500 out) on Opus 5.5 = $0.018/req, $540/30d', () => {
  const c = llmCost(price('claude-opus-5-5'), { requestsPerDay: 1000, inputTokens: 2000, outputTokens: 500, cachedShare: 0, batch: false, days: 30 });
  assert.ok(Math.abs(c.perRequest - 0.018) < 1e-12);
  assert.ok(Math.abs(c.monthly - 540) < 1e-9);
});

test('LLM cost: cache reads and batch both cut cost; Haiku long prompts use the higher tier', () => {
  const base = { requestsPerDay: 100, inputTokens: 10_000, outputTokens: 0, cachedShare: 0.8, batch: false, days: 30 };
  const s = llmCost(price('claude-sonnet-5-5'), base);
  // 2,000 fresh × $2 + 8,000 cached × $0.10 = $0.0048
  assert.ok(Math.abs(s.perRequest - 0.0048) < 1e-12);
  assert.ok(Math.abs(llmCost(price('claude-sonnet-5-5'), { ...base, batch: true }).perRequest - 0.0024) < 1e-12);
  assert.ok(s.cacheSaving > 0);
  const h = llmCost(price('claude-haiku-5-5'), { ...base, inputTokens: 200_000, cachedShare: 0 });
  assert.equal(h.long, true);
  assert.ok(Math.abs(h.perRequest - 0.1) < 1e-12);
  assert.equal(llmCost(price('claude-opus-5-5'), { ...base, requestsPerDay: NaN }).monthly, 0);
});

test('cron parses ranges, steps, names, macros and rejects bad fields', () => {
  const r = parseCron('*/15 9-17 * * MON-FRI');
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.deepEqual(r.cron.minute.values, [0, 15, 30, 45]);
  assert.deepEqual(r.cron.dow.values, [1, 2, 3, 4, 5]);
  const daily = parseCron('@daily');
  assert.ok(daily.ok && daily.cron.source === '0 0 * * *');
  const sun = parseCron('0 0 * * 7');
  assert.ok(sun.ok && sun.cron.dow.values[0] === 0);
  assert.deepEqual(parseCron('0 0 * * * *'), { ok: false, error: 'six-fields' });
  assert.equal(parseCron('60 * * * *').ok, false);
  assert.equal(parseCron('* * * *').ok, false);
});

test('cron next runs follow local time and OR rule for day-of-month + weekday', () => {
  const r = parseCron('30 8 * * 1-5');
  assert.ok(r.ok);
  if (!r.ok) return;
  const from = new Date(2026, 10, 14, 12, 0); // 2026-11-14 토요일
  const runs = nextRuns(r.cron, from, 3);
  assert.deepEqual(runs.map((d) => [d.getDate(), d.getHours(), d.getMinutes()]), [[16, 8, 30], [17, 8, 30], [18, 8, 30]]);
  const or = parseCron('0 0 1 * 0');
  assert.ok(or.ok);
  if (!or.ok) return;
  const days = nextRuns(or.cron, new Date(2026, 10, 16, 0, 0), 3).map((d) => d.getDate());
  assert.deepEqual(days, [22, 29, 1]); // 일요일 22·29일, 그리고 12월 1일
  const feb30 = parseCron('0 0 30 2 *');
  assert.ok(feb30.ok);
  if (feb30.ok) assert.equal(nextRuns(feb30.cron, new Date(2026, 0, 1), 1).length, 0);
});

test('cron description reads naturally in Korean and English', () => {
  const r = parseCron('0 9 * * 1-5');
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(describeCron(r.cron, 'ko'), '매주 월~금요일 09:00에 실행해요.');
  assert.equal(describeCron(r.cron, 'en'), 'Runs at 09:00, on Monday–Friday.');
  const m = parseCron('*/5 * * * *');
  assert.ok(m.ok && describeCron(m.cron, 'ko') === '매일 5분마다 실행해요.');
});

test('line diff marks additions/removals and builds unified hunks', () => {
  const ops = diffLines('a\nb\nc\nd', 'a\nB\nc\nd\ne');
  assert.deepEqual(ops.map((o) => o.type), ['eq', 'add', 'del', 'eq', 'eq', 'add']);
  assert.deepEqual(diffStats(ops), { added: 2, removed: 1, same: 3, similarity: 0.6 });
  const u = unifiedDiff(ops, 1);
  assert.ok(u.startsWith('--- a\n+++ b\n@@ -1,'));
  assert.ok(u.includes('-b') && u.includes('+B') && u.includes('+e'));
  assert.equal(unifiedDiff(diffLines('x', 'x')), '');
  assert.equal(diffStats(diffLines('Hello  World', 'hello world', { ignoreSpace: true, ignoreCase: true })).added, 0);
});

test('JSON schema: types, required, enum, formats, refs, additionalProperties, oneOf', () => {
  const schema: Json = {
    type: 'object', required: ['id', 'email', 'tags'], additionalProperties: false,
    properties: { id: { type: 'integer', minimum: 1 }, email: { type: 'string', format: 'email' }, tags: { type: 'array', items: { $ref: '#/$defs/tag' }, uniqueItems: true }, role: { enum: ['admin', 'user'] }, x: { oneOf: [{ type: 'string' }, { type: 'integer' }] } },
    $defs: { tag: { type: 'string', minLength: 2 } },
  };
  assert.deepEqual(validateSchema(schema, { id: 3, email: 'a@b.co', tags: ['ab'] }).issues, []);
  const bad = validateSchema(schema, { id: 1.5, email: 'nope', tags: ['a', 'a'], role: 'root', extra: 1 }).issues;
  const kw = bad.map((i) => `${i.path}:${i.keyword}`).sort();
  assert.deepEqual(kw, ['/email:format', '/extra:additionalProperties', '/id:type', '/role:enum', '/tags/0:minLength', '/tags/1:minLength', '/tags:uniqueItems'].sort());
  assert.equal(validateSchema(schema, { id: 1, email: 'a@b.co', tags: [], x: 1.5 }).issues[0].keyword, 'oneOf');
  assert.deepEqual(validateSchema({ type: 'string', if: {} }, 'a').unsupported, ['if']);
});

test('inferSchema drafts a schema the sample itself passes', () => {
  const sample: Json = { id: 1, name: 'x', when: '2026-11-16', tags: ['a'], price: 1.5, nested: { ok: true } };
  const s = inferSchema(sample);
  assert.deepEqual(validateSchema(s, sample).issues, []);
  assert.equal(validateSchema(s, { ...(sample as object), extra: 1 } as Json).issues[0].keyword, 'additionalProperties');
});

test('markdown table: CSV quotes, pipes escaped, numbers right-aligned, CJK width', () => {
  const rows = parseDelimited('name,price,memo\n"Kim, J",1200,"a|b"\n이영희,35,"x ""y"""');
  assert.deepEqual(rows[1], ['Kim, J', '1200', 'a|b']);
  assert.deepEqual(rows[2], ['이영희', '35', 'x "y"']);
  const al = autoAlign(rows);
  assert.deepEqual(al, ['left', 'right', 'left']);
  const md = toMarkdownTable(rows, al);
  const lines = md.split('\n');
  assert.equal(lines[1], '| :----- | ----: | :---- |');
  assert.ok(lines[2].includes('a\\|b'));
  assert.equal(displayWidth('이영희'), 6);
  assert.equal(new Set(lines.map(displayWidth)).size, 1);
  assert.deepEqual(parseDelimited(md), [['name', 'price', 'memo'], ['Kim, J', '1200', 'a|b'], ['이영희', '35', 'x "y"']]);
  assert.equal(toCsv([['a,b', 'c']]), '"a,b",c');
  assert.deepEqual(parseDelimited('a\tb\n1\t2'), [['a', 'b'], ['1', '2']]);
});

test('robots.txt: specific group wins over *, longest rule wins, empty Disallow allows', () => {
  const r = 'User-agent: *\nDisallow: /\n\nUser-agent: ClaudeBot\nUser-agent: GPTBot\nDisallow:\n\nUser-agent: CCBot\nDisallow: /\nAllow: /public';
  assert.equal(robotsBlocks(r, 'Bingbot'), true);
  assert.equal(robotsBlocks(r, 'ClaudeBot'), false);
  assert.equal(robotsBlocks(r, 'gptbot'), false);
  assert.equal(robotsBlocks(r, 'CCBot'), true);
  assert.equal(robotsBlocks(r, 'CCBot', '/public/x'), false);
  assert.equal(robotsBlocks('', 'GPTBot'), false);
});

test('AI readiness audit scores a good page above a bare page and flags noindex', () => {
  const good = `<html lang="ko"><head><title>연차수당 계산기 — 남은 연차 돈으로 받기</title><meta name="description" content="${'연차수당을 계산하는 방법과 근거 조문을 쉬운 말로 설명해요. '.repeat(2)}"><link rel="canonical" href="https://x/"><meta property="og:title" content="a"><meta property="og:description" content="b"><meta property="article:modified_time" content="2026-11-16"><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}</script></head><body><h1>연차수당</h1><h2>계산법</h2><ul><li>a</li></ul><h2>자주 묻는 질문?</h2><p>${'본문 '.repeat(800)}</p></body></html>`;
  const g = auditAiReadiness(good, 'User-agent: *\nAllow: /');
  assert.ok(g.score >= 95, String(g.score));
  const bare = auditAiReadiness('<html><head><meta name="robots" content="noindex"></head><body>hi</body></html>', 'User-agent: OAI-SearchBot\nDisallow: /');
  assert.ok(bare.score < 30, String(bare.score));
  assert.equal(bare.checks.find((c) => c.id === 'noindex')!.status, 'fail');
  assert.deepEqual(bare.blocked, ['OAI-SearchBot']);
  assert.equal(auditAiReadiness('<script type="application/ld+json">{bad</script>').checks.find((c) => c.id === 'jsonld')!.status, 'fail');
});
