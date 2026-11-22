// German-language calculator pages (2026-11-22, world pro-gap #9). The shared shell has no German locale,
// so these pages use DeToolPage (German shell text on the English frame), like the labor navigator pages.
export const deTools = [
  { slug: "einkommensteuer-rechner-2026", title: "Einkommensteuer-Rechner 2026 (Grund- und Splittingtabelle)", description: "Einkommensteuer nach § 32a EStG für 2026 berechnen: Grundfreibetrag 12.348 €, Grenz- und Durchschnittssteuersatz, Einzel- oder Zusammenveranlagung.", jurisdiction: "🇩🇪 Deutschland · § 32a EStG (Tarif ab 2026)" },
  { slug: "kuendigungsfrist-rechner", title: "Kündigungsfrist-Rechner nach § 622 BGB", description: "Letzten Arbeitstag berechnen: 4 Wochen zum 15. oder Monatsende, verlängerte Fristen für den Arbeitgeber nach 2 bis 20 Jahren und 2 Wochen in der Probezeit.", jurisdiction: "🇩🇪 Deutschland · § 622 BGB" },
  { slug: "e-rechnung-pflicht-ab-wann", title: "E-Rechnung: ab wann Pflicht für Ihr Unternehmen?", description: "Empfang seit 2025, Ausstellen ab 2027 bei mehr als 800.000 € Vorjahresumsatz, sonst ab 2028. Mit Ausnahmen für Kleinbetragsrechnungen und B2C.", jurisdiction: "🇩🇪 Deutschland · E-Rechnung im Inland, B2B (IHK Stuttgart)" },
] as const;
