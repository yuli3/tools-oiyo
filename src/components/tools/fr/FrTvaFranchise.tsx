// Franchise en base de TVA 2026. Calcul : lib/fr-tax-pack-2026.ts
import { useState } from "react";
import { FR_TAX_AS_OF, FR_TAX_NOTE, frTvaFranchise } from "../../../lib/fr-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";
import CurveShell from "../viz/CurveShell";

const TOOL_ID = "franchise-tva-seuils";
const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;
type A = "vente" | "services";
const TITLE = { franchise: "Franchise en base : pas de TVA à facturer", "redevable-n1": "Franchise cette année, TVA à partir du 1er janvier prochain", "redevable-n": "TVA due dès maintenant" };

export default function FrTvaFranchise() {
  const [x, setX] = useState({ activity: "services" as A, caPrev: 30_000, ca: 35_000 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = frTvaFranchise(x);
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="fr"
      currency="EUR"
      curve={{
        title: "Marge restante avant le seuil selon le chiffre d'affaires de l'année", caption: "Négatif : seuil dépassé. Même activité et même chiffre de l'année précédente.",
        xLabel: "Chiffre d'affaires de l'année", yLabel: "Marge avant le seuil", min: 0, max: 60000, step: 500, current: x.ca,
        f: (v) => frTvaFranchise({ ...x, ca: v }).headroom, formatX: (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`, formatY: (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`,
        onPick: (v) => upd({ ca: v }), marks: [],
      }}
    >
      {() => (
    <>
      <ChoiceChips<A> legend="Activité" value={x.activity} options={[{ value: "vente", label: "Vente, hébergement" }, { value: "services", label: "Prestations de services, libéral" }]} onChange={(v) => upd({ activity: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Chiffre d'affaires HT de l'année précédente" value={x.caPrev} onChange={(v) => upd({ caPrev: v })} suffix="€" step={1000} />
        <NumberField label="Chiffre d'affaires HT de cette année (à date ou prévu)" value={x.ca} onChange={(v) => upd({ ca: v })} suffix="€" step={1000} />
      </div>
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{TITLE[r.status]}</p>
        {r.status !== "redevable-n" && <p className="mt-1 text-muted-foreground">Marge avant le seuil suivant : {eur(r.headroom)}</p>}
        <progress className="mt-2 h-2 w-full accent-(--primary)" max={r.majore} value={Math.min(x.ca, r.majore)} aria-label="Chiffre d'affaires par rapport au seuil majoré" />
        <p className="mt-1 text-xs text-muted-foreground">Seuil {eur(r.base)} · seuil majoré {eur(r.majore)}</p>
        <Items items={r.items} />
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{FR_TAX_NOTE} À jour au {FR_TAX_AS_OF}.</p>
    </>
      )}
    </CurveShell>
  );
}
