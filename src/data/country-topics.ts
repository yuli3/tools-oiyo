// "Same topic, other countries" links (2026-11-22). The country tool pages were each built in their own
// locale with no way across: a reader on the Japanese tenancy checker could not find the English, French
// or Taiwanese one. One slug per country per topic; DebtReliefPage and DeToolPage render the group.
import { debtReliefTools } from './debt-relief.ts';
import { deTools } from './de-tools.ts';

export const COUNTRY_TOPICS: Record<string, readonly string[]> = {
  taxCalendar: ['jp-tax-calendar', 'us-tax-deadline-calendar', 'calendrier-fiscal-entreprise', 'calendario-fiscal-autonomos-2026', 'china-tax-filing-calendar-2026', 'uk-self-assessment-deadlines-2026', 'taiwan-tax-filing-calendar-2026'],
  selfEmployedTax: ['aoiro-shinkoku-deduction-calculator', 'self-employment-tax-qbi-calculator', 'micro-entrepreneur-cotisations-impot', 'cuota-autonomos-tramos-irpf', 'china-business-income-tax-calculator', 'uk-self-employed-tax-ni-calculator', 'taiwan-income-tax-calculator', 'singapore-income-tax-calculator', 'de:einkommensteuer-rechner-2026'],
  vatThreshold: ['consumption-tax-invoice-check', 'franchise-tva-seuils', 'iva-tipos-recargo-equivalencia', 'china-small-scale-vat-threshold', 'uk-vat-registration-threshold-check', 'taiwan-business-tax-threshold', 'small-business-vat-registration-check'],
  taxPenalty: ['kasanzei-entaizei-calculator', 'irs-penalty-interest-calculator', 'interet-de-retard-majoration', 'recargo-extemporaneo-sanciones-plazos', 'china-late-payment-surcharge-appeal', 'hmrc-late-filing-penalty-interest-calculator', 'taiwan-late-tax-penalty-appeal'],
  depreciation: ['genka-shokyaku-calculator', 'macrs-section-179-calculator', 'amortissement-lineaire-degressif', 'amortizacion-tablas-oficiales', 'china-depreciation-calculator', 'uk-capital-allowances-aia-calculator', 'taiwan-depreciation-calculator'],
  taxAdviserScope: ['zeirishi-law-scope', 'irs-representation-scope', 'conseil-fiscal-qui-peut', 'quien-puede-asesorar-impuestos', 'china-tax-agent-scope', 'uk-tax-adviser-registration-free-help', 'taiwan-tax-agent-scope'],
  jobEnding: ['japan-dismissal-unemployment-checker', 'uk-redundancy-notice-tribunal-calculator', 'us-wage-layoff-deadline-checker', 'indemnite-licenciement-delais-prudhommes', 'indemnizacion-despido-paro-plazos', 'china-severance-compensation-calculator', 'taiwan-severance-notice-calculator', 'singapore-notice-period-calculator', 'de:kuendigungsfrist-rechner'],
  tenancy: ['japan-rental-deposit-notice-checker', 'england-tenancy-deposit-notice-checker', 'california-new-york-security-deposit-notice', 'depot-de-garantie-preavis-irl', 'fianza-alquiler-preaviso-actualizacion', 'china-rental-contract-deposit-check', 'taiwan-rental-deposit-termination', 'de:widerruf-kaution-verjaehrung-rechner'],
  coolingOff: ['japan-cooling-off-deadline', 'uk-consumer-cancellation-period', 'ftc-cooling-off-rule-deadline', 'delai-retractation-achat-distance', 'plazo-desistimiento-compra-online', 'china-7-day-return-deadline', 'taiwan-7-day-cancellation', 'de:widerruf-kaution-verjaehrung-rechner'],
  inheritance: ['japan-inheritance-gift-tax-deadline', 'uk-inheritance-tax-threshold-deadline', 'us-estate-gift-tax-exclusion-2026', 'droits-succession-abattement-delai', 'taiwan-estate-tax-filing-deadline', 'segunda-oportunidad-plazo-sucesiones', 'de:erbschaftsteuer-rechner-2026'],
  limitation: ['japan-shometsu-jiko-shogaku-sosho', 'uk-limitation-period-small-claims', 'california-statute-of-limitations-small-claims', 'delai-prescription-dette-injonction', 'taiwan-statute-limitation-small-claims', 'china-small-claims-threshold', 'de:widerruf-kaution-verjaehrung-rechner'],
  employerCost: ['japan-employer-social-insurance-cost', 'uk-employer-national-insurance-2026', 'us-employer-payroll-tax-fica-2026', 'coste-empresa-seguridad-social-2026', 'singapore-cpf-contribution-calculator-2026'],
  companyCalendar: ['japan-hojin-shinkoku-kigen-calendar', 'uk-company-accounts-ct600-deadlines', 'us-business-tax-return-due-dates', 'delai-approbation-depot-comptes-annuels'],
  eInvoicing: ['japan-invoice-keika-sochi-70', 'facturation-electronique-calendrier-entreprise', 'verifactu-plazo-obligatorio-2027', 'de:e-rechnung-pflicht-ab-wann'],
  taxResidency: ['us-substantial-presence-test-calculator', 'uk-statutory-residence-test-calculator', 'residencia-fiscal-espana-183-dias', 'taiwan-tax-resident-183-31-days'],
  takeHome: ['uk-take-home-pay-calculator-2026', 'us-take-home-pay-calculator-2026', 'canada-take-home-pay-calculator-2026', 'australia-take-home-pay-calculator-2026-27', 'de:einkommensteuer-rechner-2026'],
  taxReturnSeason: ['kakutei-shinkoku-2027-calculator', 'us-tax-refund-estimator-2026', 'uk-self-assessment-deadlines-2026'],
  debtRelief: ['personal-rehabilitation-calculator', 'kojin-saisei-calculator', 'uk-debt-relief-options', 'us-bankruptcy-income-worksheet', 'france-surendettement-budget', 'taiwan-debt-clearance-checker', 'segunda-oportunidad-plazo-sucesiones', 'de:pfaendungsfreigrenze-rechner-2026'],
  retirementSavings: ['nisa-limit-planner', 'lifetime-isa-bonus-calculator', 'uk-pension-tax-relief-calculator', 'us-401k-ira-limits-calculator', 'personal-pension-tax-calculator', 'hong-kong-tvc-tax-deduction-calculator'],
  homeLoan: ['housing-loan-deduction-calculator', 'pmi-removal-date-calculator', 'canada-mortgage-stress-test-calculator', 'housing-provident-fund-combo-loan-calculator', 'cpf-housing-refund-calculator', 'uk-stamp-duty-calculator-2026'],
};

export type CountryLink = { key: string; href: string; flag: string; title: string; lang: string };

function resolve(key: string): CountryLink {
  if (key.startsWith('de:')) {
    const t = deTools.find((x) => x.slug === key.slice(3));
    if (!t) throw new Error(`unknown German tool ${key}`);
    return { key, href: `/de/${t.slug}/`, flag: '🇩🇪', title: t.title, lang: 'de' };
  }
  const t = debtReliefTools.find((x) => x.slug === key);
  if (!t) throw new Error(`unknown country tool ${key}`);
  return { key, href: `/${t.locale}/${t.slug}/`, flag: [...t.jurisdiction][0] === '🌐' ? '🌐' : t.jurisdiction.split(' ')[0], title: t.title, lang: t.languageTag };
}

/** Other countries' tools on the same topics as `key` (a slug, or `de:<slug>`), first topic first, no duplicates. */
export function otherCountryLinks(key: string): CountryLink[] {
  const seen = new Set([key]);
  const out: CountryLink[] = [];
  for (const keys of Object.values(COUNTRY_TOPICS)) {
    if (!keys.includes(key)) continue;
    for (const k of keys) {
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(resolve(k));
    }
  }
  return out;
}

export const OTHER_COUNTRIES_HEADING: Record<string, string> = {
  ko: '같은 주제, 다른 나라', en: 'Same topic in other countries', ja: '同じテーマの他の国', fr: 'Même sujet, autres pays',
  es: 'Mismo tema en otros países', zh: '其他国家和地区的同类工具', 'zh-Hant': '其他國家和地區的同類工具', de: 'Gleiches Thema in anderen Ländern',
};
export const WORLD_GUIDE_LABEL: Record<string, string> = {
  ko: '나라별 도구 전체 보기', en: 'All countries: world law guide', ja: '国別ツールの一覧', fr: 'Tous les pays', es: 'Todos los países',
  zh: '查看全部国家', 'zh-Hant': '查看全部國家', de: 'Alle Länder im Überblick',
};
