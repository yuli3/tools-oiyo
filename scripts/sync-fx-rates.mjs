#!/usr/bin/env node
// 2026-10-25: 키 없는 환율 체인(Frankfurter v2 → fawazahmed0 jsDelivr → pages.dev)으로 KRW 기준 피드를 써요.
//   npm run sync:fx-rates
// 쓰는 파일: public/data/fx/latest.json, public/data/fx/<asOf>.json, src/data/fx-snapshot.json(빌드 내장 폴백)
// 실패(전 소스 실패·검증 실패·전날 대비 ±30% 초과)하면 기존 파일을 건드리지 않고 exit 1로 끝나요.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchKrwFeed } from '../src/lib/fx-feed.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/data/fx');
const latestFile = resolve(outDir, 'latest.json');

function writeAtomic(file, text) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

try {
  const previous = existsSync(latestFile) ? JSON.parse(readFileSync(latestFile, 'utf8')) : null;
  const feed = await fetchKrwFeed({ previous, log: msg => console.warn(msg) });
  const text = `${JSON.stringify(feed, null, 2)}\n`;
  writeAtomic(resolve(outDir, `${feed.asOf}.json`), text);
  writeAtomic(latestFile, text);
  writeAtomic(resolve(root, 'src/data/fx-snapshot.json'), text);
  const bySource = {};
  for (const [code, id] of Object.entries(feed.sources)) (bySource[id] ??= []).push(code);
  console.log(`fx rates as of ${feed.asOf} written (USD ${feed.rates.USD} KRW)`);
  for (const [id, codes] of Object.entries(bySource)) console.log(`  ${id}: ${codes.join(',')}`);
} catch (error) {
  console.error(`fx sync failed, existing files kept: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
