// Turkey thaw + roast planner (2026-11-23, think tank). Times: USDA FSIS "Let's Talk Turkey"
// as republished by the Minnesota Department of Health (checked 2026-11-23). 325°F oven, 165°F inside.
export const LB_PER_KG = 2.20462;

/** [upper lb, unstuffed min h, unstuffed max h, stuffed min h, stuffed max h] */
export const ROAST_TABLE: [number, number, number, number, number][] = [
  [8, 1.5, 3.25, 2.5, 3.5], // 4–8 lb (breast)
  [12, 2.75, 3, 3, 3.5],
  [14, 3, 3.75, 3.5, 4],
  [18, 3.75, 4.25, 4, 4.25],
  [20, 4.25, 4.5, 4.25, 4.75],
  [24, 4.5, 5, 4.75, 5.25],
];
export const REST_MIN = 20;
export const MIN_LB = 4;
export const MAX_LB = 24;

export type Thaw = "fridge" | "water" | "thawed";

export interface RoastTime { min: number; max: number; inTable: boolean }

export function roastHours(lb: number, stuffed: boolean): RoastTime | null {
  if (!Number.isFinite(lb) || lb <= 0) return null;
  const row = ROAST_TABLE.find((r) => lb <= r[0]) ?? ROAST_TABLE[ROAST_TABLE.length - 1];
  return { min: stuffed ? row[3] : row[1], max: stuffed ? row[4] : row[2], inTable: lb >= MIN_LB && lb <= MAX_LB };
}

/** Fridge: 24 h per 4–5 lb → plan with the slower 4 lb. Cold water: 30 min per lb. */
export function thawHours(lb: number, how: Thaw): number {
  if (!Number.isFinite(lb) || lb <= 0 || how === "thawed") return 0;
  return how === "fridge" ? Math.ceil(lb / 4) * 24 : Math.ceil(lb) * 0.5;
}

/** Rule of thumb (not USDA): about 1¼ lb of whole bird per guest, 1½ lb for leftovers. */
export function suggestLb(guests: number, leftovers: boolean): number {
  if (!Number.isFinite(guests) || guests <= 0) return 0;
  return Math.max(MIN_LB, Math.ceil(guests * (leftovers ? 1.5 : 1.25)));
}

export interface Plan { roast: RoastTime; thaw: number; ovenIn: Date; checkFrom: Date; restFrom: Date; thawStart: Date | null }

/** Work back from the time you want to carve: rest 20 min, oven in for the longest table time. */
export function plan(lb: number, stuffed: boolean, how: Thaw, carveAt: Date): Plan | null {
  const roast = roastHours(lb, stuffed);
  if (!roast || Number.isNaN(carveAt.getTime())) return null;
  const h = 3_600_000;
  const restFrom = new Date(carveAt.getTime() - REST_MIN * 60_000);
  const ovenIn = new Date(restFrom.getTime() - roast.max * h);
  const checkFrom = new Date(ovenIn.getTime() + roast.min * h);
  const thaw = thawHours(lb, how);
  const thawStart = thaw ? new Date(ovenIn.getTime() - thaw * h) : null;
  return { roast, thaw, ovenIn, checkFrom, restFrom, thawStart };
}
