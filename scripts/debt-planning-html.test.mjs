import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
for (const [locale, lang, slug, marker, source] of [
  ['en','en-US','us-bankruptcy-income-worksheet','us','https://www.justice.gov/ust/means-testing'],
  ['en','en-US','credit-card-minimum-payment-calculator','us-card','https://www.law.cornell.edu/uscode/text/15/1637'],
  ['fr','fr-FR','france-surendettement-budget','fr','https://www.banque-france.fr/fr/detail-de-la-procedure-de-surendettement'],
]) test(`${slug}: native jurisdiction, static safety explanations, discovery and no generic translations`, () => {
  const html = readFileSync(new URL(`${locale}/${slug}/index.html`, root), 'utf8');
  assert.ok(html.includes(`lang="${lang}"`));
  assert.ok(html.includes(`rel="canonical" href="https://tools.oiyo.net/${locale}/${slug}/"`));
  assert.ok(html.includes(source));
  assert.ok(html.includes(`data-debt-worksheet="${marker}"`));
  assert.match(html, /aria-live="polite"/);
  assert.ok(html.includes(marker === 'us' ? 'not a bankruptcy eligibility result' : marker === 'us-card' ? 'This is an estimate, not your statement' : 'n’est pas la capacité de remboursement'));
  const home = readFileSync(new URL(`${locale}/index.html`, root), 'utf8');
  assert.ok(home.includes(`/${locale}/${slug}/`));
  for (const other of ['ko','en','fr','ja','zh','es'].filter(item => item !== locale)) assert.equal(existsSync(new URL(`${other}/${slug}/index.html`, root)), false);
});
