import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
for (const [locale, lang, slug, marker, source] of [
  ['en','en-US','us-bankruptcy-income-worksheet','us','https://www.justice.gov/ust/means-testing'],
  ['en','en-US','credit-card-minimum-payment-calculator','us-card','https://www.law.cornell.edu/uscode/text/15/1637'],
  ['en','en-US','social-security-claiming-age-calculator','us-ss','https://www.ssa.gov/oact/quickcalc/early_late.html'],
  ['en','en-US','pmi-removal-date-calculator','us-pmi','https://www.law.cornell.edu/uscode/text/12/4902'],
  ['en','en-GB','uk-student-loan-plan-2-plan-5-calculator','uk-sl','https://www.gov.uk/repaying-your-student-loan/what-you-pay'],
  ['ja','ja-JP','nisa-limit-planner','jp-nisa','https://www.fsa.go.jp/policy/nisa2/about/nisa2024/index.html'],
  ['fr','fr-FR','france-surendettement-budget','fr','https://www.banque-france.fr/fr/detail-de-la-procedure-de-surendettement'],
]) test(`${slug}: native jurisdiction, static safety explanations, discovery and no generic translations`, () => {
  const html = readFileSync(new URL(`${locale}/${slug}/index.html`, root), 'utf8');
  assert.ok(html.includes(`lang="${lang}"`));
  assert.ok(html.includes(`rel="canonical" href="https://tools.oiyo.net/${locale}/${slug}/"`));
  assert.ok(html.includes(source));
  assert.ok(html.includes(`data-debt-worksheet="${marker}"`));
  assert.match(html, /aria-live="polite"/);
  const safety = { us: 'not a bankruptcy eligibility result', 'us-card': 'This is an estimate, not your statement', 'us-ss': 'not your SSA statement', 'us-pmi': 'original amortization schedule', 'uk-sl': 'Student Loans Company account is the figure to trust', 'jp-nisa': '年間投資枠（合計360万円）は増えません', fr: 'n’est pas la capacité de remboursement' }[marker];
  assert.ok(html.includes(safety), `${slug} safety note`);
  const home = readFileSync(new URL(`${locale}/index.html`, root), 'utf8');
  assert.ok(home.includes(`/${locale}/${slug}/`));
  for (const other of ['ko','en','fr','ja','zh','es'].filter(item => item !== locale)) assert.equal(existsSync(new URL(`${other}/${slug}/index.html`, root)), false);
});
