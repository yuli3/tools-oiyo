// 2026-10-25: ECB 일일 환율(Frankfurter)을 KRW 기준 피드로 바꾸는 순수 함수예요.
// sync 스크립트와 화면이 같은 검증 규칙을 쓰도록 .mjs 한 곳에 둬요.
// ECB 기준 통화에 없는 TWD·VND·AED는 피드에 넣지 않아요.
export const FX_CURRENCIES = ['USD','EUR','JPY','GBP','CNY','HKD','CAD','AUD','CHF','SGD','THB','MYR','PHP','IDR','INR','NZD'];
export const FX_SOURCE = 'European Central Bank via Frankfurter (api.frankfurter.dev)';
export const FRANKFURTER_URL = `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=KRW,${FX_CURRENCIES.filter(c => c !== 'EUR').join(',')}`;

/** Frankfurter EUR 기준 응답 → { base:'KRW', unit, rates: KRW per 1 unit, asOf, source, fetchedAt } */
export function buildKrwFeed(json, fetchedAt = new Date().toISOString()) {
  if (!json || json.base !== 'EUR' || typeof json.rates !== 'object' || json.rates === null) throw new Error('unexpected Frankfurter payload');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(json.date))) throw new Error('missing rate date');
  const eurKrw = json.rates.KRW;
  if (!(Number.isFinite(eurKrw) && eurKrw > 0)) throw new Error('missing KRW rate');
  const rates = {};
  for (const code of FX_CURRENCIES) {
    const perEur = code === 'EUR' ? 1 : json.rates[code];
    if (!(Number.isFinite(perEur) && perEur > 0)) throw new Error(`missing ${code} rate`);
    rates[code] = Number((eurKrw / perEur).toPrecision(8));
  }
  return { base: 'KRW', unit: 'KRW per 1 unit of currency', asOf: json.date, source: FX_SOURCE, fetchedAt, rates };
}

/** 저장·클라이언트 로드 공통 검증. 통과하면 feed, 아니면 null. */
export function validateFeed(feed) {
  if (!feed || feed.base !== 'KRW' || !/^\d{4}-\d{2}-\d{2}$/.test(String(feed.asOf)) || typeof feed.rates !== 'object' || feed.rates === null) return null;
  for (const code of FX_CURRENCIES) if (!(Number.isFinite(feed.rates[code]) && feed.rates[code] > 0)) return null;
  return feed;
}

export function convertViaKrw(amount, from, to, rates) {
  const per = c => (c === 'KRW' ? 1 : rates[c]);
  return amount * per(from) / per(to);
}
