#!/usr/bin/env node
// 해마다 바뀌는 기준값 점검 (2026-11-21). Hermes 주간 잡이 돌려요(모델 호출 없음).
// 사용: node --experimental-strip-types scripts/annual-values-check.mjs [YYYY-MM-DD]
// 알릴 항목이 있으면 목록을 출력하고 종료 코드 1, 없으면 0이에요.
import { ANNUAL_VALUES_AS_OF, annualAlerts } from "../src/data/annual-values.ts";
import { KR_HOLIDAYS } from "../src/lib/kr-business-day.ts";

const kst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
const today = process.argv[2] ?? kst;
const alerts = annualAlerts(today, Object.keys(KR_HOLIDAYS).map(Number));
console.log(`기준값 점검 ${today} (목록 갱신 ${ANNUAL_VALUES_AS_OF}): ${alerts.length}건`);
for (const a of alerts) console.log(`${a.level === "warn" ? "!" : "-"} ${a.text}`);
process.exit(alerts.length ? 1 : 0);
