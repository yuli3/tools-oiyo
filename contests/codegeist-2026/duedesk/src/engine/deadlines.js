// DueDesk deadline engine: statutory company filing deadlines from a client's financial year end.
// Pure functions, no Atlassian APIs, so the same rules run in the Jira page, the Rovo agent and the daily trigger.
//
// Coverage (annual company obligations): Japan, United Kingdom, United States (federal), France, South Korea.
// Weekend due dates move to the next Monday. Public holidays are NOT applied: every task says so.
// Sources are cited on every deadline. This is general information, not tax advice, and files nothing.

export const RULES_AS_OF = '2026-11-24';

export const COUNTRIES = {
  JP: { name: 'Japan', authority: 'National Tax Agency (国税庁)' },
  UK: { name: 'United Kingdom', authority: 'Companies House / HMRC' },
  US: { name: 'United States (federal)', authority: 'IRS' },
  FR: { name: 'France', authority: 'Greffe du tribunal de commerce' },
  KR: { name: 'South Korea', authority: 'National Tax Service (국세청)' },
};

const DAY = 86_400_000;
const isIso = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const parts = (s) => s.split('-').map(Number);
const iso = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
const lastDay = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const isMonthEnd = (s) => { const [y, m, d] = parts(s); return d === lastDay(y, m); };

/** Same day n months later, clamped; a month-end date stays at month end. */
export function addMonths(s, n) {
  const [y, m, d] = parts(s);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  const ty = t.getUTCFullYear();
  const tm = t.getUTCMonth() + 1;
  const ld = lastDay(ty, tm);
  return iso(ty, tm, isMonthEnd(s) ? ld : Math.min(d, ld));
}
/** Same calendar day n months later, clamped to the month length (no month-end stickiness). Used where the law counts from a meeting date. */
export function addMonthsPlain(s, n) {
  const [y, m, d] = parts(s);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, Math.min(d, lastDay(t.getUTCFullYear(), t.getUTCMonth() + 1)));
}
export const addDays = (s, n) => { const [y, m, d] = parts(s); return iso(y, m, d + n); };
/** Last day of the month that is n months after the month of s. */
const monthEndAfter = (s, n) => { const [y, m] = parts(s); const t = new Date(Date.UTC(y, m - 1 + n, 1)); return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, lastDay(t.getUTCFullYear(), t.getUTCMonth() + 1)); };
/** 15th day of the n-th month after the month of s. */
const fifteenth = (s, n) => { const [y, m] = parts(s); return iso(y, m + n, 15); };
export function nextWeekday(s) {
  let x = s;
  for (;;) {
    const w = new Date(`${x}T00:00:00Z`).getUTCDay();
    if (w !== 0 && w !== 6) return x;
    x = addDays(x, 1);
  }
}
export const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);

/**
 * Deadlines for ONE financial year ending on `yearEnd`.
 * Each item: { id, label, statutory, due, cite, penalty?, note? }
 */
export function deadlinesForYear(client, yearEnd) {
  const fy = yearEnd;
  const out = [];
  const add = (id, label, statutory, cite, extra = {}) => out.push({ id, label, statutory, due: nextWeekday(statutory), cite, ...extra });

  switch (client.country) {
    case 'JP': {
      add('jp-interim', 'Corporate tax interim return and payment (中間申告)', addMonths(addMonths(fy, -6), 2), 'NTA: 法人税の申告',
        { note: 'Not needed when the forecast amount from last year is ¥100,000 or less.' });
      add('jp-corp', 'Corporate tax final return and payment (確定申告)', addMonths(fy, 2), 'NTA: within 2 months after the year end',
        { penalty: 'Late filing additional tax (無申告加算税) and delinquency tax (延滞税) apply.' });
      if (client.consumptionTax) {
        add('jp-ct', client.extensionFiled ? 'Consumption tax return (1-month extension filed)' : 'Consumption tax return and payment', addMonths(fy, client.extensionFiled ? 3 : 2), 'NTA Tax Answer No.6610');
      }
      break;
    }
    case 'UK': {
      const firstAcc = client.firstAccounts && isIso(client.incorporated);
      add('uk-accounts', firstAcc ? 'First annual accounts to Companies House (21 months after incorporation)' : 'Annual accounts to Companies House (9 months after year end)',
        firstAcc ? addMonths(client.incorporated, 21) : addMonths(fy, 9), 'gov.uk: annual accounts deadlines',
        { penalty: 'Private company: £150 up to 1 month late, £375 up to 3 months, £750 up to 6 months, £1,500 after. Doubled if late two years running.', weekendShift: false });
      add('uk-ctpay', 'Corporation Tax payment (9 months and 1 day)', addDays(addMonths(fy, 9), 1), 'gov.uk: Company Tax Returns',
        { note: 'Large companies pay in quarterly instalments instead.', weekendShift: false });
      add('uk-ct600', 'Company Tax Return CT600 (12 months)', addMonths(fy, 12), 'gov.uk: Company Tax Returns',
        { penalty: '£200 when late, another £200 at 3 months, then 10% of unpaid tax at 6 and 12 months.', weekendShift: false });
      break;
    }
    case 'US': {
      const entity = client.entity || 'ccorp';
      const june = parts(fy)[1] === 6;
      if (entity === 'ccorp') {
        const due = fifteenth(fy, june ? 3 : 4);
        add('us-1120', `Form 1120 (${june ? 'June year end: 15th day of 3rd month' : '15th day of 4th month'})`, due, 'IRS Form 7004 due date chart',
          { note: 'An extension (Form 7004) gives more time to file, not to pay.' });
        add('us-1120-ext', `Extended Form 1120 after Form 7004 (${june ? 7 : 6} more months)`, addMonths(due, june ? 7 : 6), 'IRS Form 7004 due date chart',
          { optional: true });
      } else {
        add(entity === 'scorp' ? 'us-1120s' : 'us-1065', `${entity === 'scorp' ? 'Form 1120-S' : 'Form 1065'} (15th day of 3rd month)`, fifteenth(fy, 3), 'IRS Form 7004 due date chart',
          { penalty: 'Per-shareholder/partner monthly late-filing penalty applies (see IRS).' });
      }
      break;
    }
    case 'FR': {
      const approval = addMonths(fy, 6);
      add('fr-ag', 'Approval of the annual accounts by the shareholders (6 months)', approval, 'entreprendre.service-public.gouv.fr',
        { note: 'Six months is the usual statutory period; a court can extend it.' });
      add('fr-greffe', `Filing of the accounts with the greffe (${client.online ? '2 months' : '1 month'} after approval)`, addMonthsPlain(approval, client.online ? 2 : 1), 'justice.fr: dépôt des comptes annuels',
        { penalty: 'Fine of €1,500 (€3,000 if repeated) and court injunction.' });
      break;
    }
    case 'KR': {
      add('kr-cit', 'Corporate income tax return and payment (법인세)', monthEndAfter(fy, client.sincere ? 4 : 3), client.sincere ? 'Corporate Tax Act art. 60, 60-2 (sincere-filing confirmation)' : 'Corporate Tax Act art. 60',
        { penalty: 'Non-filing penalty: 20% of tax (40% if fraudulent), plus late-payment interest.', note: 'Instalments allowed on tax over ₩10 million.' });
      add('kr-local', 'Local corporate income tax (법인지방소득세)', monthEndAfter(fy, client.sincere ? 5 : 4), 'Local Tax Act art. 103-23');
      add('kr-interim', 'Corporate tax interim prepayment (중간예납)', monthEndAfter(addMonths(fy, -6), 2), 'Corporate Tax Act art. 63',
        { note: 'SMEs whose interim amount is under ₩500,000 are exempt.' });
      break;
    }
    default:
      return [];
  }
  // UK statutory dates are fixed dates (no weekend shift), others move to the next weekday.
  for (const d of out) {
    if (d.weekendShift === false) { d.due = d.statutory; }
    delete d.weekendShift;
  }
  return out;
}

/** The financial year ends (same month/day) for a client between two calendar years. */
function yearEnds(client, fromYear, toYear) {
  const [, m, d] = parts(client.yearEnd);
  const monthEnd = isMonthEnd(client.yearEnd);
  const ends = [];
  for (let y = fromYear; y <= toYear; y++) ends.push(iso(y, m, monthEnd ? lastDay(y, m) : Math.min(d, lastDay(y, m))));
  return ends;
}

/**
 * All deadlines for a client whose due date is between `from` and `to` (inclusive, ISO dates).
 * Looks at year ends up to two years back because some deadlines fall 21 months later.
 */
export function deadlinesBetween(client, from, to) {
  const errs = validateClient(client);
  if (errs.length) return [];
  const fy0 = +from.slice(0, 4) - 2;
  const fy1 = +to.slice(0, 4);
  const seen = new Set();
  const out = [];
  for (const ye of yearEnds(client, fy0, fy1)) {
    for (const d of deadlinesForYear(client, ye)) {
      if (d.due < from || d.due > to) continue;
      const key = instanceKey(client.id, d.id, ye);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...d, yearEnd: ye, key, clientId: client.id, clientName: client.name, country: client.country });
    }
  }
  return out.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.label < b.label ? -1 : 1));
}

/** Stable id for one deadline of one client for one financial year; used to never create a Jira task twice. */
export const instanceKey = (clientId, deadlineId, yearEnd) => `${clientId}:${deadlineId}:${yearEnd}`;

export function urgency(today, due) {
  const days = daysBetween(today, due);
  const level = days < 0 ? 'overdue' : days === 0 ? 'today' : days <= 7 ? 'week' : days <= 31 ? 'month' : 'later';
  return { days, level };
}

export const LEVEL_LABEL = { overdue: 'Overdue', today: 'Due today', week: 'This week', month: 'This month', later: 'Later' };

export function validateClient(c) {
  const errs = [];
  if (!c || typeof c !== 'object') return ['Client is missing.'];
  if (!c.name || !String(c.name).trim()) errs.push('Client name is required.');
  if (!COUNTRIES[c.country]) errs.push(`Country must be one of ${Object.keys(COUNTRIES).join(', ')}.`);
  if (!isIso(c.yearEnd)) errs.push('Financial year end must be a date like 2026-12-31.');
  if (c.country === 'US' && c.entity && !['ccorp', 'scorp', 'partnership'].includes(c.entity)) errs.push('US entity must be ccorp, scorp or partnership.');
  if (c.country === 'UK' && c.firstAccounts && !isIso(c.incorporated)) errs.push('First accounts need the incorporation date.');
  return errs;
}

export const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'client';

/** Normalise loose input (from a form or from the Rovo agent) into a client record. */
export function normaliseClient(input, existingIds = []) {
  const country = String(input.country || '').trim().toUpperCase().replace(/^GB$/, 'UK').replace(/^(KOREA|SOUTH KOREA)$/, 'KR').replace(/^JAPAN$/, 'JP').replace(/^(USA|UNITED STATES)$/, 'US').replace(/^FRANCE$/, 'FR').replace(/^(UNITED KINGDOM)$/, 'UK');
  const bool = (v) => v === true || v === 'true' || v === 'yes';
  const c = {
    name: String(input.name || '').trim(),
    country,
    yearEnd: String(input.yearEnd || '').trim(),
  };
  if (country === 'US') c.entity = String(input.entity || 'ccorp').toLowerCase().replace(/[^a-z]/g, '').replace(/^ccorporation$/, 'ccorp').replace(/^scorporation$/, 'scorp');
  if (country === 'JP') { c.consumptionTax = bool(input.consumptionTax); c.extensionFiled = bool(input.extensionFiled); }
  if (country === 'UK') { c.firstAccounts = bool(input.firstAccounts); if (input.incorporated) c.incorporated = String(input.incorporated); }
  if (country === 'FR') c.online = bool(input.online);
  if (country === 'KR') c.sincere = bool(input.sincere);
  let id = input.id || slug(c.name);
  let n = 2;
  const base = id;
  while (!input.id && existingIds.includes(id)) id = `${base}-${n++}`;
  c.id = id;
  return c;
}

/** Sample firm for judges and first-run: one client per country, realistic mixed year ends. */
export const SAMPLE_CLIENTS = [
  { id: 'kintsugi-trading', name: 'Kintsugi Trading KK', country: 'JP', yearEnd: '2026-03-31', consumptionTax: true, extensionFiled: false },
  { id: 'thames-robotics', name: 'Thames Robotics Ltd', country: 'UK', yearEnd: '2026-03-31' },
  { id: 'hudson-labs', name: 'Hudson Labs Inc', country: 'US', yearEnd: '2026-12-31', entity: 'ccorp' },
  { id: 'lyon-ceramique', name: 'Lyon Céramique SAS', country: 'FR', yearEnd: '2026-12-31', online: true },
  { id: 'hangang-foods', name: 'Hangang Foods Co., Ltd.', country: 'KR', yearEnd: '2026-12-31' },
  { id: 'pine-partners', name: 'Pine & Partners LLC', country: 'US', yearEnd: '2026-12-31', entity: 'partnership' },
];

/** Plain-text summary used by the agent and in Jira descriptions. */
export function describeDeadline(d, today) {
  const u = today ? urgency(today, d.due) : null;
  const lines = [
    `${d.clientName} (${COUNTRIES[d.country]?.name ?? d.country}): ${d.label}`,
    `Due ${d.due}${d.due !== d.statutory ? ` (statutory ${d.statutory}, moved off the weekend)` : ''}${u ? `, ${u.days < 0 ? `${-u.days} days overdue` : `in ${u.days} days`}` : ''}.`,
    `Financial year ending ${d.yearEnd}. Source: ${d.cite}.`,
  ];
  if (d.penalty) lines.push(`If late: ${d.penalty}`);
  if (d.note) lines.push(`Note: ${d.note}`);
  return lines.join('\n');
}
