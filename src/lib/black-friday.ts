/**
 * Black Friday / Cyber Monday cart math (2026-11-21).
 * Order of operations follows how US/EU checkouts usually work: item sale prices first,
 * then a cart coupon (percent or fixed amount, optional minimum spend), then sales tax on
 * the discounted subtotal, then shipping (free above a threshold). Pure functions only.
 */
export interface BfItem { price: number; pct: number }
export interface BfCart {
  items: BfItem[];
  couponType: "pct" | "amount";
  /** percent as a fraction (0.15) or an amount in the cart currency */
  coupon: number;
  /** minimum spend for the coupon, checked against the subtotal after item sales; 0 = none */
  minSpend: number;
  /** sales tax as a fraction (US). 0 where prices already include VAT */
  taxRate: number;
  shipping: number;
  /** free shipping at or above this subtotal after coupon; 0 = never free */
  freeShipOver: number;
}
export interface BfResult {
  list: number;
  sale: number;
  couponOff: number;
  couponApplied: boolean;
  afterCoupon: number;
  tax: number;
  ship: number;
  total: number;
  /** list − afterCoupon (before tax and shipping) */
  saved: number;
  /** saved ÷ list */
  effective: number;
  /** how much more to add to unlock the coupon (0 if unlocked or no minimum) */
  gapCoupon: number;
  /** how much more to add for free shipping (0 if free or no threshold) */
  gapShip: number;
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function salePrice(item: BfItem): number {
  return r2(pos(item.price) * (1 - clamp01(item.pct)));
}

export function bfCart(c: BfCart): BfResult {
  const list = r2(c.items.reduce((s, i) => s + pos(i.price), 0));
  const sale = r2(c.items.reduce((s, i) => s + salePrice(i), 0));
  const unlocked = pos(c.minSpend) === 0 || sale >= c.minSpend;
  const rawOff = c.couponType === "pct" ? sale * clamp01(c.coupon) : Math.min(pos(c.coupon), sale);
  const couponOff = unlocked ? r2(rawOff) : 0;
  const afterCoupon = r2(sale - couponOff);
  const tax = r2(afterCoupon * clamp01(c.taxRate));
  const freeShip = pos(c.freeShipOver) > 0 && afterCoupon >= c.freeShipOver;
  const ship = afterCoupon === 0 || freeShip ? 0 : r2(pos(c.shipping));
  const total = r2(afterCoupon + tax + ship);
  const saved = r2(list - afterCoupon);
  return {
    list, sale, couponOff, couponApplied: unlocked && couponOff > 0, afterCoupon, tax, ship, total, saved,
    effective: list > 0 ? saved / list : 0,
    gapCoupon: unlocked ? 0 : r2(c.minSpend - sale),
    gapShip: pos(c.freeShipOver) === 0 || freeShip || pos(c.shipping) === 0 ? 0 : r2(c.freeShipOver - afterCoupon),
  };
}

/** Two discounts taken one after the other: 1 − (1 − a)(1 − b). */
export const stacked = (a: number, b: number) => 1 - (1 - clamp01(a)) * (1 - clamp01(b));

export type DealVerdict = "real" | "same" | "worse";
/**
 * Compare today's sale price with the lowest price you saw before the sale
 * (EU rule: the "was" price in a price-cut announcement must be the lowest of the prior 30 days).
 */
export function dealCheck(now: number, lowestBefore: number): { verdict: DealVerdict; diff: number; pct: number } {
  const n = pos(now), l = pos(lowestBefore);
  const diff = r2(l - n);
  const pct = l > 0 ? diff / l : 0;
  return { verdict: diff > 0.005 ? "real" : diff < -0.005 ? "worse" : "same", diff, pct };
}

/** Is adding more to reach a threshold cheaper than not reaching it? */
export function worthTopUp(gap: number, reward: number): boolean {
  return pos(gap) > 0 && pos(reward) > pos(gap);
}
