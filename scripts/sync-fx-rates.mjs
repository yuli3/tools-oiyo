#!/usr/bin/env node
// 2026-10-25: ECB 일일 환율(Frankfurter, 키 없음)을 받아 KRW 기준 피드를 써요.
//   npm run sync:fx-rates
// 쓰는 파일: public/data/fx/latest.json, public/data/fx/<asOf>.json, src/data/fx-snapshot.json(빌드 내장 폴백)
// 실패하면 기존 파일을 건드리지 않고 0이 아닌 코드로 끝나요. ECB는 영업일 하루 한 번(약 16:00 CET) 갱신해요.
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildKrwFeed, validateFeed, FRANKFURTER_URL } from '../src/lib/fx-feed.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/data/fx');

function writeAtomic(file, text) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, text);
  renameSync(tmp, file);
}

try {
  const res = await fetch(FRANKFURTER_URL, { signal: AbortSignal.timeout(15000), headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const feed = validateFeed(buildKrwFeed(await res.json()));
  if (!feed) throw new Error('feed failed validation');
  const text = `${JSON.stringify(feed, null, 2)}\n`;
  writeAtomic(resolve(outDir, `${feed.asOf}.json`), text);
  writeAtomic(resolve(outDir, 'latest.json'), text);
  writeAtomic(resolve(root, 'src/data/fx-snapshot.json'), text);
  console.log(`fx rates as of ${feed.asOf} written`);
} catch (error) {
  console.error(`fx sync failed, existing files kept: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
