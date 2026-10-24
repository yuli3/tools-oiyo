export declare const FX_CURRENCIES: readonly ['USD','EUR','JPY','GBP','CNY','HKD','CAD','AUD','CHF','SGD','THB','MYR','PHP','IDR','INR','NZD'];
export declare const FX_SOURCE: string;
export declare const FRANKFURTER_URL: string;
export interface KrwFeed { base: 'KRW'; unit: string; asOf: string; source: string; fetchedAt: string; rates: Record<string, number> }
export declare function buildKrwFeed(json: unknown, fetchedAt?: string): KrwFeed;
export declare function validateFeed(feed: unknown): KrwFeed | null;
export declare function convertViaKrw(amount: number, from: string, to: string, rates: Record<string, number>): number;
