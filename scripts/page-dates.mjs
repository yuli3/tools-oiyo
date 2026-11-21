// 사이트맵 lastmod용 페이지 날짜 (2026-11-21, 크롤 진단 대책 2).
// WHY: 사이트맵 1,472주소에 lastmod가 없어 Google이 새·바뀐 페이지를 먼저 읽을 근거가 없었어요.
// 빌드 시각이 아니라 페이지 소스 파일이 마지막으로 바뀐 커밋 날짜를 써요. 얕은 clone이면 한 번 전체 이력을
// 받아 보고, 그래도 이력이 없으면 lastmod를 넣지 않아요(틀린 날짜보다 없는 편이 나아요).
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const git = (args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 60_000 });

/** src/pages 아래 파일별 마지막 커밋 날짜(YYYY-MM-DD). 이력을 못 믿으면 빈 Map. */
export function pageFileDates() {
  const dates = new Map();
  try {
    if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
      try { git(["fetch", "--unshallow", "--quiet"]); } catch { /* 네트워크 없음 */ }
      if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") return dates;
    }
    let current = "";
    for (const line of git(["log", "--name-only", "--format=@%cs", "--", "src/pages"]).split("\n")) {
      if (line.startsWith("@")) current = line.slice(1);
      else if (line && !dates.has(line)) dates.set(line, current);
    }
  } catch {
    return new Map();
  }
  return dates;
}

/** 주소 경로(/ko/slug/)에 맞는 소스 파일 후보. 동적 [slug] 묶음 페이지는 찾지 않아요. */
export function sourceCandidates(pathname) {
  const parts = pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  if (parts.length === 0) return ["src/pages/index.astro"];
  const rest = parts.join("/");
  const out = [`src/pages/${rest}.astro`, `src/pages/${rest}/index.astro`];
  if (parts.length >= 2) {
    const tail = parts.slice(1).join("/");
    out.push(`src/pages/[locale]/${tail}.astro`, `src/pages/[locale]/${tail}/index.astro`);
  } else {
    out.push(`src/pages/[locale]/index.astro`);
  }
  return out;
}

export function lastmodFor(pathname, dates) {
  for (const f of sourceCandidates(pathname)) {
    const d = dates.get(f);
    if (d) return d;
    if (existsSync(f)) return undefined;
  }
  return undefined;
}
