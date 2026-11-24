// Practitioner tool: client document request for the personal tax return, per country (2026-11-24, CHOSEUN:
// "각 나라 전문가가 상담할 때 쓸 수 있는 도구"). Not a calculation: it lists the usual papers by return type and
// drafts a request and a reminder in the local language. The due date is the one the adviser types; no deadline is computed.

export const CLIENT_DOCS_AS_OF = "2026-11-24";
export type DocCountry = "jp" | "us" | "uk" | "de" | "fr" | "es";
export type DocJob = { id: string; label: string; docs: string[] };
export type DocPack = {
  lang: string;
  jobs: DocJob[];
  always: string[];
  text: {
    hello: (client: string) => string;
    ask: (job: string) => string;
    due: (date: string) => string;
    noDue: string;
    close: (office: string) => string;
    remind: (client: string, n: number) => string;
    thanks: string;
    done: string;
  };
};

export const CLIENT_DOCS: Record<DocCountry, DocPack> = {
  jp: {
    lang: "ja",
    always: ["マイナンバーカード（または通知カード＋本人確認書類）の写し", "前年の確定申告書の控え（ある方）", "還付金の振込先口座"],
    jobs: [
      { id: "salary", label: "給与所得者の還付申告（医療費・寄附金など）", docs: ["源泉徴収票", "医療費の領収書の集計（医療費控除の明細書）または医療費通知", "ふるさと納税などの寄附金受領証明書", "生命保険料・地震保険料控除証明書"] },
      { id: "business", label: "個人事業（青色・白色）", docs: ["売上の記録（請求書・入金明細）", "経費の領収書・レシート", "帳簿（会計ソフトのデータ）", "国民年金・国民健康保険の支払額がわかるもの", "小規模企業共済・iDeCoの掛金払込証明書"] },
      { id: "rental", label: "不動産所得", docs: ["家賃収入の明細（管理会社の報告書）", "固定資産税の納税通知書", "修繕費・管理費の領収書", "借入金の返済予定表（利息がわかるもの）"] },
      { id: "housing", label: "住宅ローン控除（1年目）", docs: ["住宅借入金の年末残高等証明書", "売買契約書または工事請負契約書の写し", "登記事項証明書"] },
    ],
    text: {
      hello: (c) => `${c || "お客様"}様\nいつもお世話になっております。`,
      ask: (j) => `${j}の準備のため、次の書類をご用意いただけますでしょうか。`,
      due: (d) => `お手数ですが、${d}までにお送りください。`,
      noDue: "お手数ですが、ご準備でき次第お送りください。",
      close: (o) => `ご不明な点はお気軽にご連絡ください。\n${o || "事務所"}`,
      remind: (c, n) => `${c || "お客様"}様\n先日お願いした書類のうち、まだ${n}点が届いていません。`,
      thanks: "ご協力ありがとうございます。",
      done: "必要な書類はすべて届いています。",
    },
  },
  us: {
    lang: "en",
    always: ["Last year's federal and state returns", "Photo ID and Social Security numbers for you, your spouse and dependents", "Bank account and routing number for a refund", "Any IRS or state notices you received"],
    jobs: [
      { id: "wage", label: "Wage earner (Form 1040)", docs: ["Form W-2 from each employer", "Form 1099-INT / 1099-DIV for interest and dividends", "Form 1098 mortgage interest statement", "Receipts for charitable donations", "Childcare provider name, address and tax ID"] },
      { id: "self", label: "Self-employed (Schedule C)", docs: ["Forms 1099-NEC and 1099-K", "Income records for the year", "Business expense receipts", "Mileage log for business use of a car", "Estimated tax payments made (dates and amounts)", "Health insurance premiums paid"] },
      { id: "investor", label: "Investments", docs: ["Form 1099-B (sales of stocks, funds, crypto)", "Cost basis records not shown on the 1099-B", "Form 1099-DIV and 1099-INT", "Schedule K-1 from partnerships or trusts"] },
      { id: "family", label: "Family and education", docs: ["Form 1098-T tuition statement", "Form 1098-E student loan interest", "Form 1095-A if you bought insurance on the Marketplace", "Form SSA-1099 for Social Security benefits"] },
    ],
    text: {
      hello: (c) => `Hi ${c || "there"},`,
      ask: (j) => `To prepare your ${j} return, could you send us the following?`,
      due: (d) => `Please send them by ${d}.`,
      noDue: "Please send them when you have them ready.",
      close: (o) => `Let us know if you have any questions.\n${o || "Our office"}`,
      remind: (c, n) => `Hi ${c || "there"},\nWe are still missing ${n} item(s) from our earlier request:`,
      thanks: "Thank you!",
      done: "We have everything we need.",
    },
  },
  uk: {
    lang: "en",
    always: ["Your Unique Taxpayer Reference (UTR) and National Insurance number", "Last year's tax return and HMRC statements", "Any letters from HMRC"],
    jobs: [
      { id: "employee", label: "Employee with other income", docs: ["P60 for the tax year", "P45 if you changed job", "P11D for benefits in kind", "Bank and building society interest statements", "Dividend vouchers", "Gift Aid donation records", "Personal pension contribution statements"] },
      { id: "self", label: "Self-employed", docs: ["Sales and income records for the tax year", "Business expense receipts", "Mileage or vehicle cost records", "Records of equipment bought", "Payments on account already made"] },
      { id: "landlord", label: "Landlord", docs: ["Rent received for the tax year", "Letting agent statements", "Repair and maintenance invoices", "Mortgage interest statement", "Insurance and service charge bills"] },
      { id: "gains", label: "Capital gains", docs: ["Completion statements for property sold", "Purchase and sale contract notes for shares or crypto", "Records of improvement costs"] },
    ],
    text: {
      hello: (c) => `Dear ${c || "client"},`,
      ask: (j) => `To prepare your Self Assessment (${j}), please send us the following:`,
      due: (d) => `We would be grateful to receive them by ${d}.`,
      noDue: "Please send them as soon as you have them.",
      close: (o) => `Kind regards,\n${o || "Our office"}`,
      remind: (c, n) => `Dear ${c || "client"},\nWe are still waiting for ${n} item(s):`,
      thanks: "Thank you for your help.",
      done: "We now have everything we need.",
    },
  },
  de: {
    lang: "de",
    always: ["Steuer-Identifikationsnummer", "Letzter Steuerbescheid", "Bankverbindung (IBAN) für die Erstattung", "Schreiben des Finanzamts"],
    jobs: [
      { id: "employee", label: "Arbeitnehmer", docs: ["Lohnsteuerbescheinigung", "Entfernung zur Arbeit und Zahl der Bürotage", "Zahl der Homeoffice-Tage", "Belege für Arbeitsmittel und Fortbildung", "Spendenbescheinigungen", "Handwerker- und Haushaltsrechnungen mit Überweisungsnachweis", "Nebenkostenabrechnung", "Bescheinigungen über Elterngeld, Kranken- oder Arbeitslosengeld"] },
      { id: "self", label: "Selbstständig (EÜR)", docs: ["Einnahmen des Jahres (Rechnungen)", "Ausgabenbelege", "Umsatzsteuer-Voranmeldungen", "Kontoauszüge des Geschäftskontos", "Fahrtenbuch oder Kfz-Kosten", "Anlagenverzeichnis / Anschaffungen"] },
      { id: "landlord", label: "Vermieter", docs: ["Mieteinnahmen des Jahres", "Nebenkostenabrechnungen", "Zinsbescheinigung des Darlehens", "Rechnungen für Reparaturen", "Grundsteuerbescheid"] },
      { id: "pension", label: "Rentner", docs: ["Rentenbezugsmitteilung oder Rentenanpassungsmitteilung", "Bescheinigungen über Kranken- und Pflegeversicherung", "Jahressteuerbescheinigung der Bank"] },
    ],
    text: {
      hello: (c) => `Guten Tag ${c || ""},`.replace(" ,", ","),
      ask: (j) => `für Ihre Einkommensteuererklärung (${j}) benötigen wir folgende Unterlagen:`,
      due: (d) => `Bitte senden Sie uns die Unterlagen bis ${d}.`,
      noDue: "Bitte senden Sie uns die Unterlagen, sobald sie vorliegen.",
      close: (o) => `Bei Fragen melden Sie sich gern.\nMit freundlichen Grüßen\n${o || "Ihre Kanzlei"}`,
      remind: (c, n) => `Guten Tag ${c || ""},\nvon unserer Anfrage fehlen noch ${n} Unterlage(n):`.replace(" ,", ","),
      thanks: "Vielen Dank!",
      done: "Alle Unterlagen liegen vor.",
    },
  },
  fr: {
    lang: "fr",
    always: ["Numéro fiscal et identifiants impots.gouv.fr", "Dernier avis d'impôt", "RIB pour un éventuel remboursement"],
    jobs: [
      { id: "salarie", label: "Salarié", docs: ["Dernier bulletin de salaire de l'année", "Justificatifs des frais réels (si option)", "Reçus fiscaux des dons", "Attestation emploi à domicile (CESU)", "Attestation de frais de garde d'enfants", "Versements sur un PER"] },
      { id: "independant", label: "Indépendant / micro-entrepreneur", docs: ["Chiffre d'affaires de l'année", "Livre des recettes", "Déclarations URSSAF de l'année", "Factures de dépenses (régime réel)"] },
      { id: "bailleur", label: "Propriétaire bailleur", docs: ["Loyers encaissés", "Relevés de l'agence", "Taxe foncière", "Intérêts d'emprunt", "Factures de travaux"] },
      { id: "capital", label: "Placements et comptes à l'étranger", docs: ["Imprimé fiscal unique (IFU) de la banque", "Relevés des comptes ouverts à l'étranger", "Plus-values de cession de titres"] },
    ],
    text: {
      hello: (c) => `Bonjour ${c || ""},`.replace(" ,", ","),
      ask: (j) => `Pour préparer votre déclaration de revenus (${j}), merci de nous transmettre :`,
      due: (d) => `Merci de nous les envoyer avant le ${d}.`,
      noDue: "Merci de nous les envoyer dès que possible.",
      close: (o) => `Nous restons à votre disposition.\nCordialement,\n${o || "Le cabinet"}`,
      remind: (c, n) => `Bonjour ${c || ""},\nIl nous manque encore ${n} document(s) :`.replace(" ,", ","),
      thanks: "Merci beaucoup.",
      done: "Nous avons tous les documents.",
    },
  },
  es: {
    lang: "es",
    always: ["DNI o NIE", "Número de referencia, Cl@ve o certificado digital", "Declaración del año anterior", "IBAN para la devolución"],
    jobs: [
      { id: "asalariado", label: "Asalariado", docs: ["Certificado de retenciones de la empresa", "Aportaciones a planes de pensiones", "Certificados de donativos", "Justificantes de deducciones autonómicas (alquiler, guardería…)", "Certificado del préstamo hipotecario (vivienda adquirida antes de 2013)"] },
      { id: "autonomo", label: "Autónomo", docs: ["Libro de ingresos y gastos", "Facturas emitidas y recibidas", "Modelos 130 y 303 presentados", "Cuotas de autónomos pagadas"] },
      { id: "arrendador", label: "Arrendador", docs: ["Ingresos por alquiler", "Recibo del IBI", "Intereses del préstamo", "Facturas de reparaciones y comunidad"] },
      { id: "ahorro", label: "Ahorro e inversiones", docs: ["Certificado fiscal del banco (intereses y dividendos)", "Ventas de acciones o fondos con fecha y precio de compra"] },
    ],
    text: {
      hello: (c) => `Hola ${c || ""},`.replace(" ,", ","),
      ask: (j) => `Para preparar su declaración de la renta (${j}), necesitamos:`,
      due: (d) => `Por favor, envíenoslo antes del ${d}.`,
      noDue: "Por favor, envíenoslo cuando lo tenga.",
      close: (o) => `Quedamos a su disposición.\nUn saludo,\n${o || "La asesoría"}`,
      remind: (c, n) => `Hola ${c || ""},\nTodavía nos faltan ${n} documento(s):`.replace(" ,", ","),
      thanks: "Muchas gracias.",
      done: "Ya tenemos toda la documentación.",
    },
  },
};

export function buildClientDocRequest(x: { country: DocCountry; job: string; client?: string; office?: string; due?: string; received?: string[]; extra?: string[] }) {
  const p = CLIENT_DOCS[x.country];
  const job = p.jobs.find((j) => j.id === x.job) ?? p.jobs[0];
  const extra = (x.extra ?? []).map((s) => s.trim()).filter(Boolean);
  const docs = [...job.docs, ...p.always, ...extra];
  const got = new Set(x.received ?? []);
  const missing = docs.filter((d) => !got.has(d));
  const list = (a: string[]) => a.map((d) => `- ${d}`).join("\n");
  const due = x.due && /^\d{4}-\d{2}-\d{2}$/.test(x.due) ? p.text.due(x.due) : p.text.noDue;
  const first = [p.text.hello(x.client ?? ""), "", p.text.ask(job.label), list(docs), "", due, "", p.text.close(x.office ?? "")].join("\n");
  const reminder = missing.length ? [p.text.remind(x.client ?? "", missing.length), list(missing), "", due, "", p.text.thanks, p.text.close(x.office ?? "")].join("\n") : p.text.done;
  return { job, docs, missing, first, reminder, done: missing.length === 0 };
}
