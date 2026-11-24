// Legal aid eligibility: Japan (法テラス) and France (aide juridictionnelle). Logic: lib/world-legal-aid-2026.ts
import { useState } from "react";
import { AID_AS_OF, FR_MAX_PEOPLE, frAideJuridictionnelle, jpHouterasu } from "../../../lib/world-legal-aid-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

type Country = "jp" | "fr";
const TOOL_ID: Record<Country, string> = { jp: "houterasu-eligibility-check", fr: "aide-juridictionnelle-plafonds-2026" };
const box = "flex min-h-11 items-center gap-2 text-sm";

export default function WorldLegalAid({ country }: { country: Country }) {
  const [people, setPeople] = useState(1);
  const [a, setA] = useState(country === "jp" ? 200_000 : 14_000);
  const [b, setB] = useState(country === "jp" ? 60_000 : 5_000);
  const [c, setC] = useState(country === "jp" ? 500_000 : 0);
  const [big, setBig] = useState(true);
  const [t23, setT23] = useState(false);
  const upd = (f: () => void) => { f(); track("tool_calculate", { tool_id: TOOL_ID[country] }, true); };

  if (country === "jp") {
    const r = jpHouterasu({ people, bigCity: big, tokyo23: t23, monthlyTakeHome: a, rentOrLoan: b, cashSavings: c });
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="同居の家族人数（本人を含む）" value={people} onChange={(v) => upd(() => setPeople(Math.max(1, Math.round(v))))} suffix="人" min={1} />
          <NumberField label="手取りの平均月収（賞与を含む、本人＋配偶者）" value={a} onChange={(v) => upd(() => setA(v))} suffix="円" step={5_000} />
          <NumberField label="家賃・住宅ローン（月）" value={b} onChange={(v) => upd(() => setB(v))} suffix="円" step={1_000} />
          <NumberField label="現金・預貯金" value={c} onChange={(v) => upd(() => setC(v))} suffix="円" step={100_000} />
        </div>
        <label className={box}><input type="checkbox" className="size-5" checked={big} onChange={(e) => upd(() => setBig(e.target.checked))} />東京都特別区・大阪市など（生活保護の一級地）に住んでいる</label>
        <label className={box}><input type="checkbox" className="size-5" checked={t23} onChange={(e) => upd(() => setT23(e.target.checked))} />東京都特別区（23区）に住んでいる</label>
        <LaborResult headline={r.eligible ? "無料法律相談の資力基準を満たします" : "資力基準を超えています"} items={r.items} dates={[]} datesTitle="日付" note={`一般的な情報です。利用の可否は法テラスが判断します。法テラス公表基準、確認 ${AID_AS_OF}。入力はブラウザの外に送られません。`} />
      </div>
    );
  }
  const r = frAideJuridictionnelle({ people, rfr: a, movable: b, property: c });
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label={`Personnes du foyer fiscal (1 à ${FR_MAX_PEOPLE})`} value={people} onChange={(v) => upd(() => setPeople(Math.max(1, Math.round(v))))} suffix="pers." min={1} />
        <NumberField label="Revenu fiscal de référence (annuel)" value={a} onChange={(v) => upd(() => setA(v))} suffix="€" step={100} />
        <NumberField label="Patrimoine mobilier (épargne, placements)" value={b} onChange={(v) => upd(() => setB(v))} suffix="€" step={500} />
        <NumberField label="Patrimoine immobilier hors résidence principale" value={c} onChange={(v) => upd(() => setC(v))} suffix="€" step={1_000} />
      </div>
      <LaborResult headline={r.rate === null ? "Non couvert ici" : r.rate > 0 ? `Aide juridictionnelle ${r.rate === 100 ? "totale (100 %)" : `partielle (${r.rate} %)`}` : "Pas d'aide juridictionnelle"} items={r.items} dates={[]} datesTitle="Dates" note={`Information générale. Le bureau d'aide juridictionnelle décide. Plafonds Service-Public, vérifiés le ${AID_AS_OF}. Rien de ce que vous saisissez ne quitte votre navigateur.`} />
    </div>
  );
}
