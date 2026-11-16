// Salario neto España (modo sencillo/experto, efecto de los supuestos, página en español) (2026-11-17). Cálculo: lib/spain-salary.ts
import { ES_SALARY_ASSUMPTIONS, esAnnualNet, esSalary, esSalaryPlain, type EsSalaryLite } from "../../lib/spain-salary";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["gross", "children", "pagas"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<EsSalaryLite>, k: Key[]) => void;
const EXAMPLE: EsSalaryLite = { gross: 30_000, children: 0, pagas: 14 };
const eur = (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`;
const KIDS = [
  { value: "0", label: "Sin hijos" },
  { value: "1", label: "1 hijo" },
  { value: "2", label: "2 hijos" },
  { value: "3", label: "3 o más" },
];
const PAGAS = [
  { value: "12", label: "12 pagas" },
  { value: "14", label: "14 pagas (con extras)" },
];

export default function SpainSalaryScenario() {
  const gross = (i: EsSalaryLite, edit: Edit) => <NumberField label="Salario bruto anual" value={i.gross} onChange={(v) => edit({ gross: v }, ["gross"])} suffix="€" step={1_000} min={0} />;
  const kids = (i: EsSalaryLite, edit: Edit) => <ChoiceChips<string> legend="Hijos a cargo" value={String(i.children)} options={KIDS} onChange={(v) => edit({ children: Number(v) }, ["children"])} />;
  const pagas = (i: EsSalaryLite, edit: Edit) => <ChoiceChips<string> legend="Número de pagas" value={String(i.pagas)} options={PAGAS} onChange={(v) => edit({ pagas: Number(v) }, ["pagas"])} />;
  return (
    <ScenarioTool<EsSalaryLite, Key>
      lang="es"
      currency="EUR"
      toolId="spain-salary-calculator"
      example={EXAMPLE}
      assumptions={ES_SALARY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={esAnnualNet}
      resultName="el neto anual"
      formatResult={eur}
      questions={({ input, edit }) => [
        { title: "¿Cuál es tu salario bruto anual?", keys: ["gross"], body: gross(input, edit) },
        { title: "¿Tienes hijos a cargo?", keys: ["children"], body: kids(input, edit) },
        { title: "¿En cuántas pagas cobras?", keys: ["pagas"], body: pagas(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {gross(input, edit)}
          {kids(input, edit)}
          {pagas(input, edit)}
        </div>
      )}
      summary={esSalaryPlain}
      metrics={(i) => {
        const r = esSalary(i);
        return [
          { label: `Neto por paga (${r.pagas})`, value: eur(r.perPaga), tone: "primary" },
          { label: "Seguridad Social (año)", value: eur(r.total) },
          { label: "IRPF (año)", value: eur(r.irpf) },
        ];
      }}
      sliders={["gross"]}
      sweepCaption={() => "La curva se aplana en cada tramo del IRPF (12.450, 20.200, 35.200 y 60.000 € de base liquidable)."}
      charts={(i) => {
        const r = esSalary(i);
        return (
          <>
            <BridgeChart
              title="Del bruto al neto (al año)"
              steps={[
                { label: "Bruto anual", value: i.gross, kind: "total" },
                { label: "Contingencias comunes", value: -r.cc, kind: "add" },
                { label: "Desempleo + FP + MEI", value: -(r.desempleo + r.fp + r.mei), kind: "add" },
                ...(r.solidaridad > 0 ? [{ label: "Cotización de solidaridad", value: -r.solidaridad, kind: "add" as const }] : []),
                { label: "IRPF", value: -r.irpf, kind: "add" },
                { label: "Neto anual", value: r.annualNet, kind: "total" },
              ]}
              format={eur}
            />
            <CompareBars
              title="Neto por paga según el bruto"
              items={[20_000, 30_000, 45_000, 70_000].map((g) => ({ label: `${eur(g)} brutos`, value: esSalary({ ...i, gross: g }).perPaga, current: g === i.gross }))}
              format={eur}
            />
          </>
        );
      }}
      askTitle="Conviene revisar"
      ask={["Tu comunidad autónoma aplica su propia escala de IRPF y deducciones.", "Contrato temporal, discapacidad o movilidad geográfica cambian la retención."]}
      expertFooter={(i) => {
        const r = esSalary(i);
        return (
          <ResultSteps
            steps={[
              `Seguridad Social = ${eur(r.cc)} + ${eur(r.desempleo)} + ${eur(r.fp)} + ${eur(r.mei)}${r.solidaridad ? ` + ${eur(r.solidaridad)}` : ""} = ${eur(r.total)}`,
              `IRPF = escala(base liquidable) − escala(mínimo personal y familiar) = ${eur(r.irpf)}`,
              `Neto = ${eur(i.gross)} − ${eur(r.total)} − ${eur(r.irpf)} = ${eur(r.annualNet)}`,
            ]}
            next={[{ href: "/es/france-salary-calculator/", label: "Salario Francia" }, { href: "/es/compound-interest-calculator/", label: "Interés compuesto" }]}
          />
        );
      }}
    />
  );
}
