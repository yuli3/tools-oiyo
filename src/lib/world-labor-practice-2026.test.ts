import { test } from "node:test";
import assert from "node:assert/strict";
import { jpOvertimeCheck, ukIrregularHoliday } from "./world-labor-practice-2026.ts";

test("labour practice checks", () => {
  const ok = jpOvertimeCheck({ months: Array.from({ length: 12 }, () => ({ overtime: 30 })) });
  assert.ok(ok.ok && ok.compliant && ok.yearOvertime === 360);
  const over = jpOvertimeCheck({ months: [{ overtime: 50 }] });
  assert.ok(over.ok && !over.compliant);
  const sp = jpOvertimeCheck({ special: true, months: [{ overtime: 90, holiday: 5 }, { overtime: 80 }, ...Array.from({ length: 10 }, () => ({ overtime: 40 }))] });
  assert.ok(sp.ok && !sp.compliant && sp.violations.some((v) => v.includes("平均")));
  const hundred = jpOvertimeCheck({ special: true, months: [{ overtime: 95, holiday: 5 }] });
  assert.ok(hundred.ok && hundred.violations.some((v) => v.includes("100時間未満")));
  const seven = jpOvertimeCheck({ special: true, months: Array.from({ length: 7 }, () => ({ overtime: 50 })) });
  assert.ok(seven.ok && seven.monthsOver45 === 7 && !seven.compliant);
  const driver = jpOvertimeCheck({ special: true, sector: "driver", months: Array.from({ length: 12 }, () => ({ overtime: 79 })) });
  assert.ok(driver.ok && driver.compliant && driver.yearOvertime === 948);
  assert.equal(jpOvertimeCheck({ sector: "doctor_a", months: Array.from({ length: 12 }, () => ({ overtime: 70, holiday: 10 })) }).compliant, true);
  assert.equal(jpOvertimeCheck({ henkei: true, months: [{ overtime: 43 }] }).compliant, false);
  const uk = ukIrregularHoliday({ hours: [100, 50] });
  assert.ok(uk.ok && uk.perPeriod[0] === 12.07 && uk.totalHours === 18.11);
});
