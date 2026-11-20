/**
 * Ring size numbers for the per-size pages under /ring-size-converter/[size]/.
 *
 * Same formulas as components/tools/RingSizeConverter.tsx, which now imports the
 * constants from here so a per-size page can never disagree with the tool it
 * links to (the height pages on blog had to copy them by hand; this avoids that).
 * 2026-11-20: added because English converter pages earn the best RPM in the
 * family (operator revenue pass 2026-11-09) and "ring size 7 in mm" style
 * queries are answered per size.
 */
export const US_BASE = 11.63;
export const US_STEP = 0.8128;
export const JP_BASE = 13.0;
export const JP_STEP = 1 / 3;
export const UK_BASE = 37.8;
export const UK_STEP = 1.25;
export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const idFromUs = (n: number) => US_BASE + US_STEP * n;
export const usFromId = (d: number) => (d - US_BASE) / US_STEP;
export const idFromJp = (n: number) => JP_BASE + (n - 1) * JP_STEP;
export const jpFromId = (d: number) => (d - JP_BASE) / JP_STEP + 1;
export const circFromUkIndex = (i: number) => UK_BASE + UK_STEP * i;
export const ukIndexFromCirc = (c: number) => (c - UK_BASE) / UK_STEP;
export const half = (n: number) => Math.round(n * 2) / 2;

/** UK index snapped to a sold size, e.g. 19.5 -> "T½". */
export const ukLabel = (index: number) => {
  const snapped = half(index);
  const letter = Math.floor(snapped);
  if (letter < 0 || letter > 25) return "—";
  return LETTERS[letter] + (snapped - letter >= 0.5 ? "½" : "");
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface RingSizeEquivalent {
  /** Inside diameter, mm. */
  diameter: number;
  /** Inside circumference, mm. Also the EU / ISO 8653 size before rounding. */
  circumference: number;
  usExact: number;
  us: number;
  uk: string;
  eu: number;
  jpExact: number;
  jp: number;
}

export function ringFromDiameter(d: number): RingSizeEquivalent {
  const c = Math.PI * d;
  const usExact = usFromId(d);
  const jpExact = jpFromId(d);
  return {
    diameter: r2(d),
    circumference: r2(c),
    usExact: r2(usExact),
    us: half(usExact),
    uk: ukLabel(ukIndexFromCirc(c)),
    eu: Math.round(c),
    jpExact: r2(jpExact),
    jp: Math.round(jpExact),
  };
}

export const ringFromUs = (us: number) => ringFromDiameter(idFromUs(us));
export const ringFromJp = (jp: number) => ringFromDiameter(idFromJp(jp));

export interface RingSizePage {
  slug: string;
  locale: "ko" | "en";
  system: "us" | "jp";
  value: number;
  data: RingSizeEquivalent;
}

/** English: US 3 to 13 in half sizes. Korean: 1호 to 27호 (JIS scale Korean shops use). */
export function ringSizePages(locale: "ko" | "en"): RingSizePage[] {
  if (locale === "ko") {
    return Array.from({ length: 27 }, (_, i) => i + 1).map((n) => ({
      slug: `${n}ho`,
      locale,
      system: "jp" as const,
      value: n,
      data: ringFromJp(n),
    }));
  }
  return Array.from({ length: 21 }, (_, i) => 3 + i / 2).map((s) => ({
    slug: `us-${String(s).replace(".", "-")}`,
    locale,
    system: "us" as const,
    value: s,
    data: ringFromUs(s),
  }));
}
