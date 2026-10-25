// 2026-10-25: 키 없는 환율 소스를 KRW 기준 피드로 바꾸는 순수 함수예요.
// sync 스크립트와 화면이 같은 검증 규칙을 쓰도록 .mjs 한 곳에 둬요.
// 체인: Frankfurter v2(중앙은행 블렌딩) → 빠진 통화만 fawazahmed0(jsDelivr → pages.dev)로 보충
//       → v2 전체 실패 시 fawazahmed0 단독 → 모두 실패하면 throw(스크립트가 기존 파일 유지 + exit 1).
// WHY USD 기준: v2 `base=KRW` 값은 유효숫자 3~5자리(예: AED 0.00277)라 너무 거칠어요. USD 기준(5자리)에서 KRW/통화로 나눠 계산해요.
// open.er-api.com(재배포 금지)·FloatRates(약관 미확인)는 쓰지 않아요.
export const FX_CURRENCIES = ['USD','EUR','JPY','GBP','CNY','TWD','HKD','CAD','AUD','CHF','SGD','THB','MYR','VND','PHP','IDR','INR','AED','NZD'];
export const SOURCE_LABELS = {
  'frankfurter-v2': 'Frankfurter v2 (central bank blend, api.frankfurter.dev)',
  fawazahmed0: 'fawazahmed0/exchange-api (CC0, jsDelivr / currency-api.pages.dev)',
  'aed-peg': 'AED peg 3.6725 per USD (페그 환산)',
};
export const FRANKFURTER_V2_URL = `https://api.frankfurter.dev/v2/rates?base=USD&quotes=KRW,${FX_CURRENCIES.filter(c => c !== 'USD').join(',')}`;
export const FAWAZ_URLS = [
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json',
  'https://latest.currency-api.pages.dev/v1/currencies/krw.json',
];
export const AED_PEG = 3.6725;
export const FETCH_TIMEOUT_MS = 10000;
/** 전 영업일 대비 이 비율보다 크게 움직이면 데이터 오류로 보고 거부해요(실제 주요 통화 하루 변동은 수 % 이내). */
export const MAX_DAILY_CHANGE = 0.3;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const positive = n => typeof n === 'number' && Number.isFinite(n) && n > 0;
const round = n => Number(n.toPrecision(8));

/** Frankfurter v2 `[{date, base:'USD', quote, rate}]` → { asOf, rates: KRW per unit, dates } (없는 통화는 빠짐) */
export function parseFrankfurterV2(json) {
  if (!Array.isArray(json)) throw new Error('unexpected Frankfurter v2 payload');
  const usd = {}; const dates = {};
  for (const row of json) {
    if (!row || row.base !== 'USD' || typeof row.quote !== 'string' || !DATE_RE.test(String(row.date))) continue;
    if (!positive(row.rate)) continue;
    usd[row.quote] = row.rate; dates[row.quote] = row.date;
  }
  if (!positive(usd.KRW)) throw new Error('Frankfurter v2: missing USD/KRW');
  const rates = {}; const out = {};
  for (const code of FX_CURRENCIES) {
    const perUsd = code === 'USD' ? 1 : usd[code];
    if (!positive(perUsd)) continue;
    rates[code] = round(usd.KRW / perUsd);
    out[code] = code === 'USD' ? dates.KRW : dates[code];
  }
  return { asOf: dates.KRW, rates, dates: out };
}

/** fawazahmed0 `{date, krw:{usd:…}}`(통화 per 1 KRW) → { asOf, rates: KRW per unit, dates } */
export function parseFawaz(json) {
  if (!json || !DATE_RE.test(String(json.date)) || typeof json.krw !== 'object' || json.krw === null) throw new Error('unexpected fawazahmed0 payload');
  const rates = {}; const dates = {};
  for (const code of FX_CURRENCIES) {
    const perKrw = json.krw[code.toLowerCase()];
    if (!positive(perKrw)) continue;
    rates[code] = round(1 / perKrw); dates[code] = json.date;
  }
  return { asOf: json.date, rates, dates };
}

/** 저장·클라이언트 로드 공통 검증. 통과하면 feed, 아니면 null. */
export function validateFeed(feed) {
  if (!feed || feed.base !== 'KRW' || !DATE_RE.test(String(feed.asOf)) || typeof feed.rates !== 'object' || feed.rates === null) return null;
  for (const code of FX_CURRENCIES) if (!positive(feed.rates[code])) return null;
  return feed;
}

/** 전날 피드 대비 ±MAX_DAILY_CHANGE 밖이면 그 통화 목록을 돌려줘요(전날 값이 없는 통화는 건너뜀). */
export function findOutliers(feed, previous, max = MAX_DAILY_CHANGE) {
  if (!previous || typeof previous.rates !== 'object' || previous.rates === null) return [];
  return FX_CURRENCIES.filter(code => positive(previous.rates[code]) && Math.abs(feed.rates[code] / previous.rates[code] - 1) > max);
}

async function getJson(fetchImpl, url, timeoutMs) {
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs), headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function fetchFawaz(fetchImpl, timeoutMs, log) {
  let last;
  for (const url of FAWAZ_URLS) {
    try { return parseFawaz(await getJson(fetchImpl, url, timeoutMs)); } catch (e) { last = e; log(`fawazahmed0 failed (${url}): ${e?.message ?? e}`); }
  }
  throw last ?? new Error('fawazahmed0 failed');
}

/**
 * 체인 실행. 성공하면 검증된 feed, 아니면 throw.
 * feed: { base, unit, asOf, fetchedAt, source, sources:{CODE:id}, filled:[CODE], notes:{CODE:text}, dates:{CODE:date}, rates }
 */
export async function fetchKrwFeed({ fetch: fetchImpl = globalThis.fetch, previous = null, timeoutMs = FETCH_TIMEOUT_MS, now = () => new Date().toISOString(), log = () => {} } = {}) {
  const rates = {}; const sources = {}; const dates = {}; const notes = {}; const filled = [];
  let asOf;
  try {
    const v2 = parseFrankfurterV2(await getJson(fetchImpl, FRANKFURTER_V2_URL, timeoutMs));
    asOf = v2.asOf;
    for (const [code, r] of Object.entries(v2.rates)) { rates[code] = r; sources[code] = 'frankfurter-v2'; dates[code] = v2.dates[code]; }
  } catch (e) { log(`Frankfurter v2 failed: ${e?.message ?? e}`); }
  const missing = () => FX_CURRENCIES.filter(c => !(c in rates));
  if (missing().length) {
    try {
      const fz = await fetchFawaz(fetchImpl, timeoutMs, log);
      asOf ??= fz.asOf;
      for (const code of missing()) if (code in fz.rates) {
        rates[code] = fz.rates[code]; sources[code] = 'fawazahmed0'; dates[code] = fz.dates[code];
        filled.push(code);
      }
    } catch (e) { log(`fawazahmed0 chain failed: ${e?.message ?? e}`); }
  }
  // 최후 수단: AED는 USD 고정 페그라 USD 값에서 계산해요.
  if (!('AED' in rates) && positive(rates.USD)) {
    rates.AED = round(rates.USD / AED_PEG); sources.AED = 'aed-peg'; dates.AED = dates.USD; notes.AED = '페그 환산 (3.6725 AED per USD)'; filled.push('AED');
  }
  const stillMissing = missing();
  if (stillMissing.length) throw new Error(`all sources failed for ${stillMissing.join(',')}`);
  // v2를 아예 못 받았으면 filled 대신 전부 fawaz 출처로만 남겨요.
  const usedV2 = Object.values(sources).includes('frankfurter-v2');
  const ids = [...new Set(FX_CURRENCIES.map(c => sources[c]))];
  const feed = {
    base: 'KRW', unit: 'KRW per 1 unit of currency', asOf, fetchedAt: now(),
    source: ids.map(id => SOURCE_LABELS[id]).join(' + '),
    sources: Object.fromEntries(FX_CURRENCIES.map(c => [c, sources[c]])),
    filled: usedV2 ? filled : filled.filter(c => sources[c] === 'aed-peg'),
    notes, dates: Object.fromEntries(FX_CURRENCIES.map(c => [c, dates[c]])),
    rates: Object.fromEntries(FX_CURRENCIES.map(c => [c, rates[c]])),
  };
  if (!validateFeed(feed)) throw new Error('feed failed validation');
  const outliers = findOutliers(feed, previous);
  if (outliers.length) throw new Error(`rate moved more than ${MAX_DAILY_CHANGE * 100}% vs previous feed: ${outliers.join(',')}`);
  return feed;
}

export function convertViaKrw(amount, from, to, rates) {
  const per = c => (c === 'KRW' ? 1 : rates[c]);
  return amount * per(from) / per(to);
}
