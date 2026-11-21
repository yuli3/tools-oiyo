#!/usr/bin/env node
// Guía fiscal y contable España — CLI. Cálculos: es-tax-pack-2026.mjs (mismo código que las páginas tools.oiyo.net/es/ y el MCP api.oiyo.net).
//   node scripts/calc.mjs <herramienta> '<json>'
//   herramienta: calendar | autonomo | iva | recargo | sancion | plazos | amortizacion | scope
import * as es from "./es-tax-pack-2026.mjs";

const TOOLS = {
  calendar: (x) => es.esTaxCalendar(x),
  autonomo: (x) => es.esAutonomo(x),
  iva: (x) => es.esIva(x),
  recargo: (x) => es.esRecargo(x),
  sancion: (x) => es.esSancion(x),
  plazos: (x) => es.esPlazos(x),
  amortizacion: (x) => es.esAmortizacion(x),
  scope: () => es.ES_SCOPE,
};
const [tool, json = "{}"] = process.argv.slice(2);
if (!TOOLS[tool]) {
  console.error(`usage: node scripts/calc.mjs <${Object.keys(TOOLS).join("|")}> '<json>'`);
  process.exit(2);
}
console.log(JSON.stringify({ asOf: es.ES_TAX_AS_OF, note: es.ES_TAX_NOTE, result: TOOLS[tool](JSON.parse(json)) }, null, 2));
