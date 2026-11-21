import { test } from "node:test";
import assert from "node:assert/strict";
import { esTaxCalendar, esAutonomo, esIrpf, esIva, esRecargo, esSancion, esPlazos, esAmortizacion, esShift, ES_SCOPE } from "./es-tax-pack-2026.ts";

test("calendar 2026", () => {
  const r = esTaxCalendar({ year: 2026, iva: true, pago: "130", retenciones: true, sociedad: true, today: "2026-11-21" });
  const by = Object.fromEntries(r.events.map((e) => [e.id, e]));
  assert.equal(by["303-4T"].date, "2026-01-30");
  assert.equal(by["390"].date, "2026-01-30");
  assert.equal(by["111-4T"].date, "2026-01-20");
  assert.equal(by["303-3T"].date, "2026-10-20");
  assert.equal(by["130-2T"].date, "2026-07-20");
  assert.equal(by["200"].date, "2026-07-27");
  assert.equal(by["202-3P"].date, "2026-12-21");
  assert.equal(by["202-3P"].daysLeft, 30);
  assert.equal(by["100"].until, "2026-06-30");
  assert.equal(by["100-dom"].date, "2026-06-25");
  assert.equal(by["q4-2026"].month, "2027-01");
  const o = esTaxCalendar({ year: 2027, iva: true });
  assert.ok(o.events.every((e) => !e.date));
  assert.equal(o.items[0].tone, "warn");
  assert.equal(esShift(new Date(Date.UTC(2026, 11, 20))).toISOString().slice(0, 10), "2026-12-21");
});

test("autónomo tramos and IRPF", () => {
  assert.equal(esAutonomo({ netMonthly: 600 }).tramo.n, 1);
  assert.equal(esAutonomo({ netMonthly: 1_166.7 }).tramo.n, 4);
  assert.equal(esAutonomo({ netMonthly: 1_166.69 }).tramo.n, 3);
  const top = esAutonomo({ netMonthly: 7_000 });
  assert.equal(top.tramo.n, 15);
  assert.equal(top.cuotaMin, 607.35);
  assert.equal(esAutonomo({ netMonthly: 500 }).cuotaMin, 205.88);
  assert.equal(esIrpf(5_550).total, 0);
  assert.equal(esIrpf(12_450).estatal, Math.round((12_450 - 5_550) * 0.095));
  const a = esAutonomo({ netMonthly: 2_000, ingresos: 40_000, gastos: 10_000 });
  assert.equal(a.irpf?.dificil, 1_500);
  assert.equal(a.irpf?.base, 28_500);
  assert.equal(a.irpf?.retencion, 6_000);
  assert.equal(esAutonomo({ netMonthly: 5_000, ingresos: 100_000, gastos: 0, nuevo: true }).irpf?.dificil, 2_000);
  assert.equal(esAutonomo({ netMonthly: 5_000, ingresos: 100_000, nuevo: true }).irpf?.retencion, 7_000);
});

test("IVA and recargo de equivalencia", () => {
  const r = esIva({ base: 1_000, tipo: 21, recargo: true });
  assert.equal(r.iva, 210);
  assert.equal(r.recargo, 52);
  assert.equal(r.total, 1_262);
  assert.equal(esIva({ base: 1_000, tipo: 4, recargo: true }).recargo, 5);
});

test("recargo, sanción, plazos", () => {
  assert.equal(esRecargo({ cuota: 1_000, due: "2026-04-20", filed: "2026-04-25" }).rate, 0.01);
  const r = esRecargo({ cuota: 1_000, due: "2026-04-20", filed: "2026-07-21" });
  assert.equal(r.months, 3);
  assert.equal(r.recargo, 40);
  assert.equal(esRecargo({ cuota: 1_000, due: "2026-04-20", filed: "2026-07-21", pagoEnPlazo: true }).recargo, 30);
  const l = esRecargo({ cuota: 1_000, due: "2025-01-30", filed: "2026-07-30" });
  assert.equal(l.rate, 0.15);
  assert.equal(l.interes, null);
  assert.equal(esRecargo({ cuota: 1_000, due: "2025-01-30", filed: "2026-01-30", interesAnual: 4 }).interes, 0);
  assert.equal(esSancion({ base: 10_000, gravedad: "grave" }).max, 10_000);
  assert.equal(esSancion({ base: 10_000, gravedad: "leve", acuerdo: "conformidad", pronto: true }).min, Math.round(5_000 * 0.7 * 0.6));
  const p = esPlazos({ notificacion: "2026-01-31", finPlazoVoluntario: "2026-06-30" });
  const by = Object.fromEntries(p.plazos.map((e) => [e.id, e.date]));
  assert.equal(by.tear, "2026-03-02"); // 28 Feb is Saturday → Monday 2 March
  assert.equal(by.contencioso, "2026-03-31");
  assert.equal(by.prescripcion, "2030-06-30");
});

test("amortización LIS", () => {
  const r = esAmortizacion({ elemento: "equipos-informaticos", coste: 2_000, inicio: "2026-07-02" });
  assert.equal(r.coef, 0.25);
  assert.equal(r.schedule[0].amount, Math.round(500 * 183 / 365));
  assert.equal(r.schedule.at(-1)?.pendiente, 0);
  assert.equal(esAmortizacion({ elemento: "mobiliario", coste: 1_000, inicio: "2026-01-01", coef: 0.01 }).coef, 0.05);
  assert.equal(esAmortizacion({ elemento: "utiles", coste: 250, inicio: "2026-03-01", nuevo: true }).schedule[0].amount, 250);
  assert.ok(ES_SCOPE.length >= 6);
});
