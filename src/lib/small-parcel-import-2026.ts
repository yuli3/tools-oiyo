// Small-parcel import tax checks (2026-11-23, practice office trade room): Japan, Great Britain, Canada (mail).
// General information only: no customs brokerage, no tariff classification, no filing. Duty rates are not computed.
// Facts: company-brain projects/oiyo-ecosystem/customs-small-parcel-facts-2026-11-23.md (66aecd20), checked 2026-11-23:
// - Japan 税関 カスタムスアンサー 1006 (課税価格の合計額が1万円以下の物品の免税).
// - GOV.UK "Goods sent from abroad: tax and duty" (£39 gifts, £135 VAT and Customs Duty rules, Great Britain).
// - CBSA "Importing by mail" (Date modified 2025-11-25): duties and taxes on mail items over the $20 exemption.
// Not verified (so not covered): US de minimis, EU €150, Singapore low-value GST, Taiwan, Australia, China, Canada courier/CUSMA.

export const PARCEL_AS_OF = "2026-11-23";
export type Tone = "warn" | "info" | "good";
export type PItem = { tone: Tone; text: string; cite: string };

const JP_CITE = "税関 カスタムスアンサー1006";
export function jpSmallParcel(x: { taxableValue: number; alcoholOrTobacco?: boolean }) {
  const v = Math.max(0, x.taxableValue || 0);
  const exempt = v <= 10_000;
  const items: PItem[] = [
    exempt
      ? { tone: "good", text: `課税価格の合計 ${v.toLocaleString("ja-JP")}円は1万円以下なので、関税と消費税は免税です。`, cite: JP_CITE }
      : { tone: "warn", text: `課税価格の合計 ${v.toLocaleString("ja-JP")}円は1万円を超えるので、関税と消費税の免税はありません。税率は品目ごとに違います（ここでは計算しません）。`, cite: JP_CITE },
    { tone: "info", text: "判定は1申告の課税価格の合計で行います。1インボイスの貨物を分けて申告しても、そのインボイスの全貨物を合計します。", cite: JP_CITE },
    { tone: "info", text: "1万円以下でも、産業への影響などから特に定められた物品は免税になりません（個人使用の贈与品は例外あり）。", cite: JP_CITE },
  ];
  if (x.alcoholOrTobacco) items.push({ tone: "warn", text: "酒税・たばこ税など消費税以外の内国消費税は、1万円以下でも免税になりません。", cite: JP_CITE });
  return { asOf: PARCEL_AS_OF, exempt, items };
}

const UK_CITE = "GOV.UK Goods sent from abroad: tax and duty";
export function ukSmallParcel(x: { value: number; gift?: boolean; excise?: boolean }) {
  const v = Math.max(0, x.value || 0);
  const items: PItem[] = [];
  let vat: "none" | "paid-to-seller" | "pay-courier";
  if (x.gift && v <= 39 && !x.excise) {
    vat = "none";
    items.push({ tone: "good", text: `A gift worth £${v} (£39 or less): no VAT.`, cite: UK_CITE });
  } else if (!x.gift && !x.excise && v <= 135) {
    vat = "paid-to-seller";
    items.push({ tone: "info", text: `You bought it yourself for £${v} (£135 or less): the seller should already have charged you VAT in the price.`, cite: UK_CITE });
  } else {
    vat = "pay-courier";
    items.push({ tone: "warn", text: x.excise ? "Excise goods: you pay VAT to the delivery company, whatever the value." : v > 135 ? "Over £135: you pay import VAT on the value to the delivery company before delivery or when you collect." : "A gift worth more than £39: you pay VAT to the delivery company.", cite: UK_CITE });
  }
  const duty = Boolean(x.excise) || v > 135;
  items.push(duty
    ? { tone: "warn", text: x.excise ? "Customs Duty is due on excise goods of any value." : "Over £135: Customs Duty may be due on the price plus postage, packaging and insurance. The rate depends on the goods and where they came from (check the Trade Tariff; not calculated here).", cite: UK_CITE }
    : { tone: "good", text: "Non-excise goods worth £135 or less: no Customs Duty.", cite: UK_CITE });
  items.push({ tone: "info", text: "Great Britain rules. Northern Ireland has different rules for goods from the EU. The delivery company sends the bill and usually holds the parcel for about 3 weeks.", cite: UK_CITE });
  return { asOf: PARCEL_AS_OF, vat, duty, items };
}

const CA_CITE = "CBSA Importing by mail (2025-11-25)";
export function caMailParcel(x: { value: number }) {
  const v = Math.max(0, x.value || 0);
  const exempt = v <= 20;
  const items: PItem[] = [
    exempt
      ? { tone: "good", text: `$${v} by mail is within the $20 exemption: no duty or tax.`, cite: CA_CITE }
      : { tone: "warn", text: `$${v} by mail is over the $20 exemption: duty and/or taxes apply. The amount owing is shown on Form E14 (CBSA Postal Import Form) attached to the item. Rates are not calculated here.`, cite: CA_CITE },
    { tone: "info", text: "Canada Post charges a handling fee to process goods imported by mail that owe duty or tax. Courier shipments and CUSMA thresholds are not covered here.", cite: CA_CITE },
  ];
  return { asOf: PARCEL_AS_OF, exempt, items };
}
