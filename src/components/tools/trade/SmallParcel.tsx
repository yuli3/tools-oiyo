// Small-parcel import tax check for one country (JP, GB, CA mail). Logic: lib/small-parcel-import-2026.ts
import { useState } from "react";
import { PARCEL_AS_OF, caMailParcel, jpSmallParcel, ukSmallParcel } from "../../../lib/small-parcel-import-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

type Country = "jp" | "uk" | "ca";
const TOOL_ID: Record<Country, string> = { jp: "japan-import-10000-yen-duty-free", uk: "uk-parcel-import-vat-duty-135", ca: "canada-mail-import-20-exemption" };

export default function SmallParcel({ country }: { country: Country }) {
  const [value, setValue] = useState(country === "jp" ? 8_000 : country === "uk" ? 120 : 25);
  const [flag, setFlag] = useState(false);
  const [gift, setGift] = useState(false);
  const upd = (f: () => void) => { f(); track("tool_calculate", { tool_id: TOOL_ID[country] }, true); };

  if (country === "jp") {
    const r = jpSmallParcel({ taxableValue: value, alcoholOrTobacco: flag });
    return (
      <div className="space-y-4">
        <NumberField label="課税価格の合計（1申告分）" value={value} onChange={(v) => upd(() => setValue(v))} suffix="円" step={500} />
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={flag} onChange={(e) => upd(() => setFlag(e.target.checked))} />お酒・たばこが含まれる</label>
        <LaborResult headline={r.exempt ? "関税・消費税は免税" : "免税の対象外（1万円超）"} items={r.items} dates={[]} datesTitle="日付" note={`一般的な情報です。通関手続の代理や品目分類はしていません。税関カスタムスアンサー1006にもとづきます。更新 ${PARCEL_AS_OF}。入力はブラウザの外に送られません。`} />
      </div>
    );
  }
  if (country === "uk") {
    const r = ukSmallParcel({ value, gift, excise: flag });
    return (
      <div className="space-y-4">
        <NumberField label="Value of the goods" value={value} onChange={(v) => upd(() => setValue(v))} suffix="£" step={5} />
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={gift} onChange={(e) => upd(() => setGift(e.target.checked))} />It is a gift someone sent me</label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={flag} onChange={(e) => upd(() => setFlag(e.target.checked))} />Alcohol, tobacco or vaping products (excise goods)</label>
        <LaborResult headline={r.vat === "none" ? "No VAT and no duty" : r.vat === "paid-to-seller" ? "VAT paid to the seller, no duty" : r.duty ? "VAT and Customs Duty to the delivery company" : "VAT to the delivery company"} items={r.items} dates={[]} datesTitle="Dates" note={`General information from GOV.UK "Goods sent from abroad" (Great Britain). Not a customs or tax ruling. Checked ${PARCEL_AS_OF}. Nothing you type leaves your browser.`} />
      </div>
    );
  }
  const r = caMailParcel({ value });
  return (
    <div className="space-y-4">
      <NumberField label="Value of the item sent by mail" value={value} onChange={(v) => upd(() => setValue(v))} suffix="CAD" step={5} />
      <LaborResult headline={r.exempt ? "Within the $20 exemption" : "Duty and/or taxes apply"} items={r.items} dates={[]} datesTitle="Dates" note={`General information from CBSA "Importing by mail" (modified 2025-11-25). Not a customs ruling. Checked ${PARCEL_AS_OF}. Nothing you type leaves your browser.`} />
    </div>
  );
}
