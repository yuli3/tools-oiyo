import { test } from "node:test";
import assert from "node:assert/strict";
import { intake, WORLD_TOOLS, audienceOf } from "./world-law-intake-2026.ts";

test("routes local-language questions to the local tool", () => {
  assert.equal(intake({ country: "JP", question: "退去したのに敷金が返ってきません" }).matches[0].mcp, "check_jp_rental_deposit_notice");
  assert.equal(intake({ country: "JP", question: "インボイスの2割特例は使えますか" }).matches[0].mcp, "check_jp_consumption_tax");
  assert.equal(intake({ country: "UK", question: "I'm being made redundant after 6 years, what notice do I get?" }).matches[0].mcp, "calculate_uk_labor_exit");
  assert.equal(intake({ country: "FR", question: "Mon propriétaire garde mon dépôt de garantie" }).matches[0].mcp, "check_fr_deposit_notice_irl");
  assert.equal(intake({ country: "ES", question: "Me han despedido, ¿cuánta indemnización me toca?" }).matches[0].mcp, "calculate_es_labor_exit");
  assert.equal(intake({ country: "CN", question: "公司违法辞退我，经济补偿怎么算" }).matches[0].mcp, "calculate_cn_labor_exit");
  assert.equal(intake({ country: "TW", question: "房東不退押金怎麼辦" }).matches[0].mcp, "check_tw_rental_deposit_termination");
  assert.equal(intake({ country: "US", question: "When is my quarterly estimated tax due and what is the safe harbor?" }).matches[0].mcp, "calculate_us_estimated_tax");
});

test("no match lists every tool for the country, with help channels and tax scope", () => {
  const r = intake({ country: "TW", question: "hello" });
  assert.equal(r.matches.length, 0);
  assert.equal(r.tools?.length, WORLD_TOOLS.filter((w) => w.country === "TW").length);
  assert.equal(r.help.length, 5);
  assert.ok(r.taxScope?.length);
});

test("every tool has a unique MCP name and a tools.oiyo.net page", () => {
  const names = WORLD_TOOLS.map((w) => w.mcp);
  assert.equal(new Set(names).size, names.length);
  for (const w of WORLD_TOOLS) assert.match(w.page, /^https:\/\/tools\.oiyo\.net\/(ja|en|fr|es|zh|de)\/[a-z0-9-]+\/$/);
});

test("cooling-off questions route to the consumer tools", () => {
  assert.equal(intake({ country: "JP", question: "訪問販売で契約したのをクーリング・オフしたい" }).matches[0].mcp, "check_jp_cooling_off");
  assert.equal(intake({ country: "CN", question: "网购衣服七天无理由退货" }).matches[0].mcp, "check_cn_7day_return");
  assert.equal(intake({ country: "FR", question: "délai de rétractation pour un achat en ligne" }).matches[0].mcp, "check_fr_retractation");
});

test("inheritance questions route to the inheritance tools", () => {
  assert.equal(intake({ country: "JP", question: "父の遺産の相続税はいつまでに申告？" }).matches[0].mcp, "calculate_jp_inheritance_gift_tax");
  assert.equal(intake({ country: "UK", question: "Will my mum's estate pay inheritance tax?" }).matches[0].mcp, "calculate_uk_inheritance_tax");
  assert.equal(intake({ country: "TW", question: "父親過世，遺產稅什麼時候申報" }).matches[0].mcp, "check_tw_estate_tax_deadline");
});

test("time-limit and small-claims questions route to the claims tools", () => {
  assert.equal(intake({ country: "JP", question: "貸したお金の消滅時効は何年？少額訴訟できる？" }).matches[0].mcp, "check_jp_limitation_small_claims");
  assert.equal(intake({ country: "UK", question: "How long do I have to make a small claims money claim?" }).matches[0].mcp, "check_uk_limitation_small_claims");
});

test("audience: everyday topics vs practitioner topics", () => {
  assert.equal(audienceOf("check_jp_rental_deposit_notice"), "person");
  assert.equal(audienceOf("calculate_uk_labor_exit"), "person");
  assert.equal(audienceOf("calculate_jp_inheritance_gift_tax"), "person");
  assert.equal(audienceOf("calculate_jp_depreciation"), "pro");
  assert.equal(audienceOf("get_fr_tax_calendar"), "pro");
  assert.equal(audienceOf("check_uk_vat_registration"), "pro");
  assert.equal(audienceOf("calculate_es_employer_cost"), "pro");
  for (const c of ["JP", "US", "FR", "ES", "CN", "UK", "TW", "DE"] as const) {
    const pool = WORLD_TOOLS.filter((w) => w.country === c);
    assert.ok(pool.some((w) => w.audience === "person") && pool.some((w) => w.audience === "pro"), c);
  }
  const r = intake({ country: "JP", question: "hello", audience: "person" });
  assert.equal(r.audience, "person");
  assert.ok(r.tools?.every((t) => t.audience === "person"));
  assert.equal(intake({ country: "JP", question: "減価償却の耐用年数", audience: "person" }).matches.length, 0);
});

test("Germany and Singapore are routed with help channels from the statutes", () => {
  assert.equal(intake({ country: "DE", question: "Mir wurde gekündigt, wann ist mein letzter Arbeitstag?" }).matches[0].mcp, "calculate_de_notice_period");
  assert.equal(intake({ country: "DE", question: "Ab wann muss ich E-Rechnungen ausstellen?" }).matches[0].mcp, "check_de_einvoicing");
  assert.equal(intake({ country: "SG", question: "How much CPF does my employer pay?" }).matches[0].mcp, "calculate_sg_cpf");
  assert.equal(intake({ country: "SG", question: "What is my income tax on S$80,000 chargeable income?" }).matches[0].mcp, "calculate_sg_income_tax");
  const sg = intake({ country: "SG", question: "hello" });
  assert.match(sg.help.find((h) => h.area === "labor")!.channel, /TADM/);
  assert.ok(intake({ country: "DE", question: "Einkommensteuer" }).taxScope?.some((x) => x.cite === "§ 4 StBerG"));
});
