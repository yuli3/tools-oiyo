#!/usr/bin/env node
// Yearly law/tax revision checklist (2026-11-24, roadmap stage 1). Lists every calculation library that carries
// year-bound values, so each one is checked against the new year's official sources before 1 January.
// It reads code only and changes nothing. Usage: node scripts/annual-revision-inventory.mjs [year] > checklist.md
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const year = Number(process.argv[2] ?? new Date().getFullYear());
const next = year + 1;
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const libs = walk(join(root, "src/lib")).filter((p) => p.endsWith(".ts") && !p.endsWith(".test.ts"));
const users = walk(join(root, "src")).filter((p) => /\.(astro|tsx|ts)$/.test(p) && !p.includes("/lib/"));
const userText = users.map((p) => [p, readFileSync(p, "utf8")]);

const COUNTRY = [["kr", /^kr-|korea|^ko-|yearend|year-end|severance|minimum-wage|4대|national-pension/], ["jp", /^jp-|japan/], ["us", /^us-|irs/], ["uk", /^uk-|hmrc/], ["de", /^de-|germany/], ["fr", /^fr-|france/], ["es", /^es-|spain/], ["cn", /^cn-|china/], ["tw", /^tw-|taiwan/], ["sg", /^sg-|singapore/], ["au", /^au-|australia/], ["ca", /^ca-|canada/], ["world", /^world-|countries/]];
const country = (f, src) => { const c = (COUNTRY.find(([, re]) => re.test(f)) ?? ["?"])[0]; return c === "?" && (src.match(/[가-힣]/g) ?? []).length > 80 ? "kr" : c; };

const rows = [];
for (const p of libs) {
  const src = readFileSync(p, "utf8");
  const f = basename(p, ".ts");
  const asOf = [...src.matchAll(/[A-Z_]*AS_OF[A-Z_]*\s*=\s*"(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]);
  const yearHits = (src.match(new RegExp(`\\b${year}\\b`, "g")) ?? []).length;
  const nextHits = (src.match(new RegExp(`\\b${next}\\b`, "g")) ?? []).length;
  const bound = f.includes(String(year)) || asOf.length > 0 || yearHits >= 3;
  if (!bound) continue;
  const sources = new Set(src.match(/https?:\/\/[^\s"'`)]+/g) ?? []).size;
  const unverified = (src.match(/미확인|unverified|not verified|확인 필요/gi) ?? []).length;
  const mod = f.replace(/\.ts$/, "");
  const pages = userText.filter(([, t]) => t.includes(`/lib/${mod}"`) || t.includes(`/lib/${mod}'`) || t.includes(`lib/${mod}.ts`)).length;
  rows.push({ file: relative(root, p), country: country(f, src), asOf: asOf.sort()[0] ?? "", yearHits, nextHits, sources, unverified, pages });
}
const order = ["kr", "jp", "us", "uk", "de", "fr", "es", "cn", "tw", "sg", "au", "ca", "world", "?"];
rows.sort((a, b) => order.indexOf(a.country) - order.indexOf(b.country) || b.pages - a.pages || a.file.localeCompare(b.file));

const out = [`# ${next} revision checklist`, "", `Generated from code on ${new Date().toISOString().slice(0, 10)}. ${rows.length} libraries carry ${year} values. Check each against the official ${next} source, then tick it.`, "", "Columns: as-of = oldest *_AS_OF date in the file; " + `${year}/${next} = mentions of each year; sources = official links in the file; open = 미확인 marks; used by = pages and components importing it.`, ""];
for (const c of order) {
  const g = rows.filter((r) => r.country === c);
  if (!g.length) continue;
  out.push(`## ${c.toUpperCase()} (${g.length})`, "", `| done | file | as-of | ${year} | ${next} | sources | open | used by |`, "| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const r of g) out.push(`| [ ] | ${r.file} | ${r.asOf || "-"} | ${r.yearHits} | ${r.nextHits} | ${r.sources} | ${r.unverified} | ${r.pages} |`);
  out.push("");
}
process.stdout.write(out.join("\n"));
