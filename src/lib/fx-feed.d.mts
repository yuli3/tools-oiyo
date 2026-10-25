export declare const FX_CURRENCIES: readonly ['USD','EUR','JPY','GBP','CNY','TWD','HKD','CAD','AUD','CHF','SGD','THB','MYR','VND','PHP','IDR','INR','AED','NZD'];
export type FxSourceId = 'frankfurter-v2' | 'fawazahmed0' | 'aed-peg';
export declare const SOURCE_LABELS: Record<FxSourceId, string>;
export declare const FRANKFURTER_V2_URL: string;
export declare const FAWAZ_URLS: readonly string[];
export declare const AED_PEG: number;
export declare const FETCH_TIMEOUT_MS: number;
export declare const MAX_DAILY_CHANGE: number;
export interface KrwFeed { base: 'KRW'; unit: string; asOf: string; source: string; fetchedAt: string; rates: Record<string, number>; sources?: Record<string, FxSourceId>; filled?: string[]; notes?: Record<string, string>; dates?: Record<string, string> }
export interface PartialRates { asOf: string; rates: Record<string, number>; dates: Record<string, string> }
export declare function parseFrankfurterV2(json: unknown): PartialRates;
export declare function parseFawaz(json: unknown): PartialRates;
export declare function validateFeed(feed: unknown): KrwFeed | null;
export declare function findOutliers(feed: KrwFeed, previous: unknown, max?: number): string[];
export declare function fetchKrwFeed(options?: { fetch?: typeof fetch; previous?: unknown; timeoutMs?: number; now?: () => string; log?: (msg: string) => void }): Promise<KrwFeed>;
export declare function convertViaKrw(amount: number, from: string, to: string, rates: Record<string, number>): number;
