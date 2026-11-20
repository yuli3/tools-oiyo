/**
 * One page per value for the two unit questions people ask one number at a time:
 * "170 cm in feet" and "70 kg in pounds". English only, because the queries are.
 * Exact definitions: 1 in = 2.54 cm (1959 international yard), 1 lb = 0.45359237 kg.
 */
export const CM_PER_INCH = 2.54;
export const KG_PER_LB = 0.45359237;
export const LB_PER_STONE = 14;

export const CM_RANGE = { from: 140, to: 210 } as const;
export const KG_RANGE = { from: 40, to: 150 } as const;

export interface HeightValue {
  cm: number;
  totalInches: number;
  feetDecimal: number;
  /** Rounded to the nearest whole inch, carried into feet when it reaches 12. */
  feet: number;
  inches: number;
  /** Feet and inches to one decimal, the way tape measures are read. */
  inchesExact: number;
  meters: number;
}

export function cmToFeet(cm: number): HeightValue {
  const totalInches = cm / CM_PER_INCH;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  const inchesExact = Math.round((totalInches - Math.floor(totalInches / 12) * 12) * 10) / 10;
  return {
    cm,
    totalInches: round(totalInches, 2),
    feetDecimal: round(totalInches / 12, 2),
    feet,
    inches,
    inchesExact,
    meters: round(cm / 100, 2),
  };
}

export interface WeightValue {
  kg: number;
  pounds: number;
  rawPounds: number;
  /** Whole pounds plus leftover ounces. */
  lbWhole: number;
  ounces: number;
  stone: number;
  stoneLb: number;
  grams: number;
}

export function kgToPounds(kg: number): WeightValue {
  const pounds = kg / KG_PER_LB;
  let lbWhole = Math.floor(pounds);
  let ounces = Math.round((pounds - lbWhole) * 16);
  if (ounces === 16) {
    lbWhole += 1;
    ounces = 0;
  }
  let stone = Math.floor(pounds / LB_PER_STONE);
  let stoneLb = Math.round(pounds - stone * LB_PER_STONE);
  if (stoneLb === LB_PER_STONE) {
    stone += 1;
    stoneLb = 0;
  }
  return { kg, pounds: round(pounds, 1), rawPounds: pounds, lbWhole, ounces, stone, stoneLb, grams: kg * 1000 };
}

export const heightSlug = (cm: number) => `${cm}-cm-in-feet`;
export const weightSlug = (kg: number) => `${kg}-kg-in-pounds`;

export function heightValues(): number[] {
  return range(CM_RANGE.from, CM_RANGE.to);
}
export function weightValues(): number[] {
  return range(KG_RANGE.from, KG_RANGE.to);
}

export const feetInches = (v: { feet: number; inches: number }) => `${v.feet}'${v.inches}"`;

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
function round(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
