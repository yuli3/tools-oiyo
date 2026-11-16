// Salaire net France (mode simple/expert, effet des hypothèses, page en français) (2026-11-17). Calcul : lib/france-salary.ts
import { FR_SALARY_ASSUMPTIONS, PASS, frAnnualNet, frSalary, frSalaryPlain, type FrSalaryLite } from "../../lib/france-salary";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["gross", "parts"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<FrSalaryLite>, k: Key[]) => void;
const EXAMPLE: FrSalaryLite = { gross: 40_000, parts: 1 };
const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;
const PARTS = [
  { value: "1", label: "Célibataire (1)" },
  { value: "2", label: "Marié·e / PACS (2)" },
  { value: "2.5", label: "+ 1 enfant (2,5)" },
  { value: "3", label: "+ 2 enfants (3)" },
  { value: "4", label: "+ 3 enfants (4)" },
];

export default function FranceSalaryScenario() {
  const gross = (i: FrSalaryLite, edit: Edit) => <NumberField label="Salaire brut annuel" value={i.gross} onChange={(v) => edit({ gross: v }, ["gross"])} suffix="€" step={1_000} min={0} />;
  const parts = (i: FrSalaryLite, edit: Edit) => <ChoiceChips<string> legend="Situation familiale (parts fiscales)" value={String(i.parts)} options={PARTS} onChange={(v) => edit({ parts: Number(v) }, ["parts"])} />;
  return (
    <ScenarioTool<FrSalaryLite, Key>
      lang="fr"
      currency="EUR"
      toolId="france-salary-calculator"
      example={EXAMPLE}
      assumptions={FR_SALARY_ASSUMPTIONS}
      keys={KEYS}
      evaluate={frAnnualNet}
      resultName="le net annuel après impôt"
      formatResult={eur}
      questions={({ input, edit }) => [
        { title: "Quel est votre salaire brut annuel ?", keys: ["gross"], body: (
          <>
            {gross(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">Brut mensuel × 12 (ou × 13 avec un 13e mois).</p>
          </>
        ) },
        { title: "Quelle est votre situation familiale ?", keys: ["parts"], body: parts(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {gross(input, edit)}
          {parts(input, edit)}
        </div>
      )}
      summary={frSalaryPlain}
      metrics={(i) => {
        const r = frSalary(i);
        return [
          { label: "Net mensuel après impôt", value: eur(r.monthlyNet), tone: "primary" },
          { label: "Net avant impôt (mois)", value: eur(r.netBeforeIR / 12) },
          { label: "Impôt sur le revenu (an)", value: eur(r.ir) },
        ];
      }}
      sliders={["gross"]}
      sweepCaption={() => `La ligne pointillée marque 1 PASS (${eur(PASS)}) : au-delà, la retraite de base est plafonnée et la tranche 2 AGIRC-ARRCO commence.`}
      charts={(i) => {
        const r = frSalary(i);
        return (
          <>
            <BridgeChart
              title="Du brut au net après impôt (par an)"
              steps={[
                { label: "Brut annuel", value: i.gross, kind: "total" },
                { label: "CSG / CRDS", value: -r.csgCrds, kind: "add" },
                { label: "Retraite de base", value: -r.retraiteBase, kind: "add" },
                { label: "Retraite complémentaire", value: -(r.retraiteCompl1 + r.retraiteCompl2), kind: "add" },
                { label: "Impôt sur le revenu", value: -r.ir, kind: "add" },
                { label: "Net après impôt", value: r.annualNet, kind: "total" },
              ]}
              format={eur}
            />
            <CompareBars
              title="Net mensuel selon le brut annuel"
              items={[25_000, 40_000, 60_000, 90_000].map((g) => ({ label: `${eur(g)} brut`, value: frSalary({ ...i, gross: g }).monthlyNet, current: g === i.gross }))}
              format={eur}
            />
          </>
        );
      }}
      askTitle="À vérifier"
      ask={["Mutuelle, prévoyance et avantages en nature ne sont pas inclus : comparez avec votre fiche de paie.", "Le plafonnement du quotient familial n'est pas appliqué ; pour un revenu élevé avec enfants, l'impôt réel peut être plus haut."]}
      expertFooter={(i) => {
        const r = frSalary(i);
        return (
          <ResultSteps
            steps={[
              `Cotisations = CSG/CRDS ${eur(r.csgCrds)} + retraite de base ${eur(r.retraiteBase)} + AGIRC-ARRCO ${eur(r.retraiteCompl1 + r.retraiteCompl2)} = ${eur(r.total)}`,
              `Net imposable = brut − cotisations + CSG/CRDS non déductible, − 10 % de frais professionnels, ÷ ${i.parts} parts → barème 0/11/30/41/45 % = ${eur(r.ir)}`,
              `Net après impôt = ${eur(r.annualNet)} (${eur(r.monthlyNet)} / mois)`,
            ]}
            next={[{ href: "/fr/spain-salary-calculator/", label: "Salaire Espagne" }, { href: "/fr/compound-interest-calculator/", label: "Intérêts composés" }]}
          />
        );
      }}
    />
  );
}
