import assert from "node:assert/strict";
import { test } from "node:test";
import { BENEFITS, findBenefits, type FinderInput } from "./kr-benefits-2026.ts";

const base: FinderInput = {
  group: "senior",
  basicPension: "unknown",
  lowIncome: "unknown",
  alone: "unknown",
  employed: "unknown",
  noHome: "unknown",
  registered2026: "unknown",
  hasBaby: "unknown",
};

const ids = (input: FinderInput) => findBenefits(input).map((r) => r.benefit.id);

test("ids are unique", () => {
  assert.equal(new Set(BENEFITS.map((b) => b.id)).size, BENEFITS.length);
});

test("pins the headline 2026 amounts so a change is a deliberate edit", () => {
  const amount = (id: string) => BENEFITS.find((b) => b.id === id)?.amount ?? "";
  assert.match(amount("basic-pension"), /349,700원/);
  assert.match(amount("senior-job-public"), /29만 원/);
  assert.match(amount("parent-pay"), /0세 월 100만 원, 1세 월 50만 원/);
  assert.match(amount("first-meeting"), /첫째 200만 원, 둘째부터 300만 원/);
  assert.match(amount("telecom"), /11,000원/);
});

test("the senior list keeps its 27 entries (blog hub folds them into 30 rows)", () => {
  assert.ok(BENEFITS.filter((b) => b.group === "senior").length >= 27);
});

test("a 65~69 pensioner living alone gets the pension-linked items as matches", () => {
  const r = findBenefits({ ...base, age: "65-69", basicPension: "yes", lowIncome: "no", alone: "yes" });
  const got = r.map((x) => x.benefit.id);
  assert.ok(got.includes("basic-pension"));
  assert.ok(got.includes("telecom"));
  assert.ok(got.includes("emergency-safety"));
  assert.ok(!got.includes("knee"), "low-income-only surgery support is excluded when the answer is no");
  assert.equal(r.find((x) => x.benefit.id === "telecom")?.fit, "match");
});

test("unknown answers keep the item but flag it", () => {
  const r = findBenefits({ ...base, age: "70+" });
  const telecom = r.find((x) => x.benefit.id === "telecom");
  assert.equal(telecom?.fit, "check");
  assert.deepEqual(telecom?.unknown, ["기초연금 수급"]);
});

test("60~64 sees only items open before 65", () => {
  const got = ids({ ...base, age: "60-64", lowIncome: "yes" });
  assert.ok(got.includes("dementia-check"));
  assert.ok(got.includes("knee"));
  assert.ok(!got.includes("basic-pension"));
  assert.ok(!got.includes("transit"));
});

test("child stages filter by stage", () => {
  const preg = ids({ ...base, group: "child", stage: "pregnant", employed: "yes" });
  assert.ok(preg.includes("pregnancy-card"));
  assert.ok(preg.includes("maternity-leave"));
  assert.ok(!preg.includes("neulbom"));
  const elem = ids({ ...base, group: "child", stage: "elementary", employed: "no", lowIncome: "no" });
  assert.ok(elem.includes("neulbom"));
  assert.ok(elem.includes("child-allowance"));
  assert.ok(!elem.includes("parental-leave"));
  assert.ok(!elem.includes("after-school-voucher"));
});

test("newlyweds who own a home do not see homeless-only housing", () => {
  const got = ids({ ...base, group: "newlywed", noHome: "no", registered2026: "yes", hasBaby: "no" });
  assert.ok(got.includes("marriage-tax-credit"));
  assert.ok(got.includes("marriage-gift"));
  assert.ok(!got.includes("newlywed-jeonse-loan"));
  assert.ok(!got.includes("newborn-loan"));
});
