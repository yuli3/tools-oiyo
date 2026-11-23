import { test } from "node:test";
import assert from "node:assert/strict";
import { SearchRiseSet, Body, Observer } from "astronomy-engine";
import { KR_CITIES, yearDaylight } from "./daylight.ts";

test("서울 2027 일출·일몰이 astronomy-engine과 2분 안", () => {
  const c = KR_CITIES[0];
  const days = yearDaylight(c.lat, c.lon, 2027, 9);
  const obs = new Observer(c.lat, c.lon, 0);
  for (const i of [0, 80, 172, 265, 355]) {
    const d = days[i];
    const start = new Date(Date.parse(`${d.date}T00:00:00+09:00`));
    const r = SearchRiseSet(Body.Sun, obs, +1, start, 1)!;
    const s = SearchRiseSet(Body.Sun, obs, -1, start, 1)!;
    const toMin = (t: Date) => ((t.getTime() - start.getTime()) / 60000);
    assert.ok(Math.abs(toMin(r.date) - d.rise!) < 2, `${d.date} rise ${d.rise} vs ${toMin(r.date)}`);
    assert.ok(Math.abs(toMin(s.date) - d.set!) < 2, `${d.date} set ${d.set} vs ${toMin(s.date)}`);
  }
  assert.equal(days.length, 365);
  const longest = days.reduce((a, b) => (b.length! > a.length! ? b : a));
  assert.ok(["2027-06-20", "2027-06-21", "2027-06-22"].includes(longest.date), longest.date);
});
