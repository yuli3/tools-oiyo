// Secret Santa / 마니또 draw (2026-11-22, think tank pick). Pure logic, no server.
// Each person gets a private link whose #hash carries only their own match. The hash never
// reaches the server or analytics, but it is not encryption: anyone holding the link can read it.

export interface DrawInput {
  names: string[];
  /** Pairs that must not draw each other (both directions), e.g. couples. */
  exclusions?: [string, string][];
}

export type Assignment = { giver: string; receiver: string };

/** Clean a free-text list: one name per line or comma, trimmed, empty and duplicate names dropped. */
export function parseNames(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\n,，、]/)) {
    const n = part.trim().slice(0, 40);
    if (!n) continue;
    const key = n.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out.slice(0, 50);
}

function blocked(ex: [string, string][], a: string, b: string): boolean {
  return ex.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/**
 * Random assignment where nobody draws themselves and excluded pairs never meet.
 * Backtracking over a shuffled order; returns null when the rules make a draw impossible.
 */
export function draw(input: DrawInput, rand: () => number = Math.random): Assignment[] | null {
  const names = input.names;
  const ex = input.exclusions ?? [];
  if (names.length < 2) return null;
  const order = shuffle(names, rand);
  const used = new Set<string>();
  const result: Assignment[] = [];
  let steps = 0;
  const go = (i: number): boolean => {
    if (++steps > 200_000) return false;
    if (i === order.length) return true;
    const giver = order[i];
    for (const receiver of shuffle(names, rand)) {
      if (receiver === giver || used.has(receiver) || blocked(ex, giver, receiver)) continue;
      used.add(receiver);
      result.push({ giver, receiver });
      if (go(i + 1)) return true;
      result.pop();
      used.delete(receiver);
    }
    return false;
  };
  return go(0) ? names.map((g) => result.find((r) => r.giver === g)!) : null;
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface RevealData {
  /** giver */ g: string;
  /** receiver */ r: string;
  /** event name */ e?: string;
  /** budget text, e.g. "3만 원" */ b?: string;
  /** exchange date YYYY-MM-DD */ d?: string;
}

const PREFIX = "s1.";

/** URL-safe token for the #hash. Base64url of UTF-8 JSON, reversed so a glance does not spoil it. */
export function encodeReveal(data: RevealData): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return PREFIX + b64.split("").reverse().join("");
}

export function decodeReveal(token: string): RevealData | null {
  try {
    if (!token.startsWith(PREFIX)) return null;
    const b64 = token.slice(PREFIX.length).split("").reverse().join("").replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes)) as RevealData;
    if (typeof data.g !== "string" || typeof data.r !== "string" || !data.g || !data.r) return null;
    return data;
  } catch {
    return null;
  }
}
