// Practitioner tool: first-consultation intake sheet per country (2026-11-24, CHOSEUN: "각 나라 전문가가 상담할 때
// 쓸 수 있는 도구"). Not a calculation and not advice: it lists the usual first-meeting questions for tax, employment
// and family/debt matters in the local language and turns the adviser's notes into a copyable memo. Unanswered
// questions stay in the memo as open items. No deadline is computed; dates are the ones the adviser types.

export const INTAKE_AS_OF = "2026-11-24";
export type IntakeCountry = "jp" | "us" | "uk" | "de" | "fr" | "es";
export type IntakeArea = { id: string; label: string; questions: string[] };
export type IntakePack = {
  lang: string;
  common: string[];
  areas: IntakeArea[];
  text: { title: string; client: string; date: string; area: string; answered: string; open: string; none: string; conflict: string; noConflict: string };
};

export const INTAKE: Record<IntakeCountry, IntakePack> = {
  jp: {
    lang: "ja",
    common: ["相談したいことを一言で", "いつまでに何をしたいか（希望の結果）", "届いた通知・書類と、受け取った日", "相手方の名前（利益相反の確認用）", "これまでに相談した専門家・窓口"],
    areas: [
      { id: "tax", label: "税金", questions: ["収入の種類（給与・事業・不動産・年金など）", "前年の申告の有無と方法", "税務署からの連絡（お尋ね・調査・督促）の有無", "未申告・未納の年分", "使っている会計ソフト・帳簿"] },
      { id: "labor", label: "労働", questions: ["雇用形態と入社日", "賃金の額と支払方法", "労働時間・残業の記録の有無", "退職・解雇の有無と日付", "就業規則・労働契約書の有無"] },
      { id: "family", label: "家族・借金", questions: ["家族構成と同居の有無", "借入先・残高・延滞の状況", "財産（不動産・預金・保険）", "収入と毎月の支出", "裁判所からの書類の有無"] },
    ],
    text: { title: "初回相談メモ", client: "相談者", date: "相談日", area: "分野", answered: "聞き取り内容", open: "未確認の項目", none: "なし", conflict: "利益相反の確認が必要な相手方", noConflict: "相手方の記載なし" },
  },
  us: {
    lang: "en",
    common: ["What the client wants help with, in one line", "The outcome they want and by when", "Notices or papers received, and the date received", "Other parties' names (for a conflict check)", "Advisers or agencies already contacted"],
    areas: [
      { id: "tax", label: "Tax", questions: ["Income types (W-2, 1099, rental, investments)", "Filing status and dependents", "Last return filed and by whom", "IRS or state letters received (notice number)", "Unfiled years or balances owed"] },
      { id: "labor", label: "Employment", questions: ["Employer name and state of work", "Pay rate and how pay is set (hourly, salary, tips)", "Hours and overtime records", "Last day worked and how the job ended", "Written agreements or handbook"] },
      { id: "family", label: "Family and debt", questions: ["Household members", "Creditors, balances and collection activity", "Assets (home, car, retirement accounts)", "Monthly income and expenses", "Court papers or lawsuits served"] },
    ],
    text: { title: "First consultation memo", client: "Client", date: "Date", area: "Area", answered: "Notes", open: "Still to confirm", none: "None", conflict: "Run a conflict check on", noConflict: "No other party named" },
  },
  uk: {
    lang: "en",
    common: ["What the client wants help with, in one line", "The outcome they want and by when", "Letters received, and the date received", "Other parties' names (for a conflict check)", "Advisers or services already contacted"],
    areas: [
      { id: "tax", label: "Tax", questions: ["Income types (PAYE, self-employed, property, savings)", "Registered for Self Assessment? UTR", "Last return filed", "HMRC letters received (penalty, enquiry, payment)", "Unfiled years or tax owed"] },
      { id: "labor", label: "Employment", questions: ["Employer and start date", "Pay and how it is paid", "Hours and holiday records", "Last day worked and how the job ended", "Contract and staff handbook"] },
      { id: "family", label: "Family and debt", questions: ["Household members", "Creditors, balances and arrears", "Assets (home, car, pensions)", "Monthly income and outgoings", "County court claim or CCJ letters"] },
    ],
    text: { title: "First consultation memo", client: "Client", date: "Date", area: "Area", answered: "Notes", open: "Still to confirm", none: "None", conflict: "Run a conflict check on", noConflict: "No other party named" },
  },
  de: {
    lang: "de",
    common: ["Anliegen in einem Satz", "Gewünschtes Ergebnis und bis wann", "Erhaltene Schreiben und Eingangsdatum", "Namen der Gegenseite (für die Kollisionsprüfung)", "Bisherige Beratung oder Stellen"],
    areas: [
      { id: "tax", label: "Steuern", questions: ["Einkunftsarten (Lohn, Selbständigkeit, Vermietung, Kapital)", "Letzte Steuererklärung und wer sie gemacht hat", "Schreiben vom Finanzamt (Bescheid, Mahnung, Prüfung)", "Nicht abgegebene Jahre oder Rückstände", "Buchhaltung oder Software"] },
      { id: "labor", label: "Arbeit", questions: ["Arbeitgeber und Beginn des Arbeitsverhältnisses", "Gehalt und Auszahlung", "Arbeitszeit- und Überstundennachweise", "Kündigung: wer, wann zugegangen", "Arbeitsvertrag und Tarifvertrag"] },
      { id: "family", label: "Familie und Schulden", questions: ["Haushalt und Unterhaltspflichten", "Gläubiger, Höhe, Mahnungen", "Vermögen (Immobilie, Konten, Versicherungen)", "Monatliche Einnahmen und Ausgaben", "Gerichtliche Schreiben oder Pfändung"] },
    ],
    text: { title: "Notiz zum Erstgespräch", client: "Mandant", date: "Datum", area: "Bereich", answered: "Angaben", open: "Noch zu klären", none: "Keine", conflict: "Kollisionsprüfung für", noConflict: "Keine Gegenseite genannt" },
  },
  fr: {
    lang: "fr",
    common: ["La demande en une phrase", "Le résultat souhaité et l'échéance", "Courriers reçus et date de réception", "Noms des autres parties (vérification des conflits)", "Conseils ou services déjà consultés"],
    areas: [
      { id: "tax", label: "Impôts", questions: ["Types de revenus (salaires, BIC/BNC, fonciers, capitaux)", "Dernière déclaration et par qui", "Courriers de l'administration (relance, contrôle, avis)", "Années non déclarées ou impayées", "Comptabilité ou logiciel utilisé"] },
      { id: "labor", label: "Travail", questions: ["Employeur et date d'embauche", "Salaire et mode de paiement", "Relevés d'horaires et d'heures supplémentaires", "Fin du contrat : qui, quand", "Contrat de travail et convention collective"] },
      { id: "family", label: "Famille et dettes", questions: ["Composition du foyer", "Créanciers, montants, relances", "Patrimoine (logement, comptes, assurance-vie)", "Revenus et charges mensuels", "Actes de justice ou saisies reçus"] },
    ],
    text: { title: "Note de premier rendez-vous", client: "Client", date: "Date", area: "Domaine", answered: "Éléments recueillis", open: "À vérifier", none: "Aucun", conflict: "Vérifier les conflits pour", noConflict: "Aucune autre partie indiquée" },
  },
  es: {
    lang: "es",
    common: ["La consulta en una frase", "El resultado que busca y para cuándo", "Notificaciones recibidas y fecha de recepción", "Nombres de la otra parte (para revisar conflictos)", "Asesores u organismos ya consultados"],
    areas: [
      { id: "tax", label: "Impuestos", questions: ["Tipos de ingresos (trabajo, autónomo, alquiler, ahorro)", "Última declaración y quién la hizo", "Notificaciones de Hacienda (requerimiento, liquidación, embargo)", "Años sin declarar o deudas", "Contabilidad o programa que usa"] },
      { id: "labor", label: "Laboral", questions: ["Empresa y fecha de alta", "Salario y forma de pago", "Registro de jornada y horas extra", "Despido o baja: quién y cuándo", "Contrato y convenio colectivo"] },
      { id: "family", label: "Familia y deudas", questions: ["Unidad familiar", "Acreedores, importes y reclamaciones", "Bienes (vivienda, cuentas, seguros)", "Ingresos y gastos mensuales", "Documentos judiciales o embargos"] },
    ],
    text: { title: "Nota de primera consulta", client: "Cliente", date: "Fecha", area: "Área", answered: "Datos recogidos", open: "Pendiente de confirmar", none: "Ninguno", conflict: "Revisar conflictos con", noConflict: "No se indicó otra parte" },
  },
};

export function buildIntakeMemo(x: { country: IntakeCountry; area: string; client?: string; date?: string; answers?: Record<string, string>; parties?: string }) {
  const p = INTAKE[x.country];
  const area = p.areas.find((a) => a.id === x.area) ?? p.areas[0];
  const questions = [...p.common, ...area.questions];
  const ans = x.answers ?? {};
  const answered = questions.filter((q) => (ans[q] ?? "").trim());
  const open = questions.filter((q) => !(ans[q] ?? "").trim());
  const parties = (x.parties ?? "").split(/[\n,、，]/).map((s) => s.trim()).filter(Boolean);
  const t = p.text;
  const date = x.date && /^\d{4}-\d{2}-\d{2}$/.test(x.date) ? x.date : "";
  const memo = [
    t.title,
    `${t.client}: ${(x.client ?? "").trim() || "-"}`,
    `${t.date}: ${date || "-"}`,
    `${t.area}: ${area.label}`,
    "",
    `■ ${t.answered}`,
    ...(answered.length ? answered.map((q) => `- ${q}: ${ans[q].trim().replace(/\s*\n\s*/g, " / ")}`) : [`- ${t.none}`]),
    "",
    `■ ${t.open}`,
    ...(open.length ? open.map((q) => `- ${q}`) : [`- ${t.none}`]),
    "",
    `■ ${parties.length ? `${t.conflict}: ${parties.join(", ")}` : t.noConflict}`,
  ].join("\n");
  return { area, questions, answered, open, parties, memo };
}
