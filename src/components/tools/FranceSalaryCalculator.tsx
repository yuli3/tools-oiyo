import React, { useState } from 'react';
import { ToolPanel } from './ToolPanel';
import { calcCotisations, calcIR } from '../../lib/france-salary';

interface Props {
    locale?: 'fr' | 'en';
}

type FamilyParts = 1 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

const labels = {
    fr: {
        title: 'Calculateur de salaire net France 2026',
        desc: 'Estimez vos cotisations sociales et votre impôt sur le revenu selon le barème 2026.',
        annualGross: 'Salaire brut annuel (€)',
        situation: 'Situation familiale',
        single: 'Célibataire (1 part)',
        married: 'Marié / Pacsé (2 parts)',
        married1child: 'Marié + 1 enfant (2,5 parts)',
        married2children: 'Marié + 2 enfants (3 parts)',
        married3children: 'Marié + 3 enfants (4 parts)',
        monthlyGross: 'Brut mensuel',
        monthlyNet: 'Net mensuel (avant IR)',
        annualNet: 'Net annuel (après IR)',
        cotisations: 'Cotisations salariales (mensuel)',
        csgCrds: 'CSG/CRDS (9,7% × 98,25%)',
        retraiteBase: 'Retraite de base CNAV (6,9% plafonné + 0,4%)',
        retraiteCompl1: 'AGIRC-ARRCO T1 + CEG (4,01% ≤ 1×PASS)',
        retraiteCompl2: 'AGIRC-ARRCO T2 + CEG + CET (9,72% entre 1–8×PASS, CET 0,14%)',
        totalCotisations: 'Total cotisations',
        netBeforeIR: 'Salaire net avant impôt (mensuel)',
        irAnnual: "Impôt sur le revenu (annuel estimé)",
        irMonthly: "IR mensuel estimé",
        note: '* Estimation basée sur le PASS 2026 (48 060 €), les taux de cotisations salariales 2026 et le barème de l\'impôt de la loi de finances 2026 (revenus 2025, dernier barème publié ; déduction de 10 % : min 509 €, max 14 556 €). Le barème applicable aux revenus 2026 sera fixé par la loi de finances 2027. Le montant réel dépend de votre déclaration fiscale et des crédits d\'impôt applicables.',
    },
    en: {
        title: 'France Net Salary Calculator 2026',
        desc: 'Estimate your social contributions and income tax under the 2026 scale.',
        annualGross: 'Annual Gross Salary (€)',
        situation: 'Family situation',
        single: 'Single (1 part)',
        married: 'Married / PACS (2 parts)',
        married1child: 'Married + 1 child (2.5 parts)',
        married2children: 'Married + 2 children (3 parts)',
        married3children: 'Married + 3 children (4 parts)',
        monthlyGross: 'Monthly Gross',
        monthlyNet: 'Monthly Net (before IR)',
        annualNet: 'Annual Net (after IR)',
        cotisations: 'Employee contributions (monthly)',
        csgCrds: 'CSG/CRDS (9.7% × 98.25%)',
        retraiteBase: 'Basic pension CNAV (6.9% capped + 0.4%)',
        retraiteCompl1: 'AGIRC-ARRCO T1 + CEG (4.01% ≤ 1×PASS)',
        retraiteCompl2: 'AGIRC-ARRCO T2 + CEG + CET (9.72% 1–8×PASS, CET 0.14%)',
        totalCotisations: 'Total contributions',
        netBeforeIR: 'Net salary before income tax (monthly)',
        irAnnual: 'Income tax (annual estimate)',
        irMonthly: 'IR monthly estimate',
        note: '* Estimate based on PASS 2026 (€48,060), 2026 employee contribution rates and the income tax scale of the 2026 Finance Act (2025 income, latest published scale; 10% expense deduction min €509, max €14,556). The scale for 2026 income will be set by the 2027 Finance Act. The actual amount depends on your tax return and applicable credits.',
    },
} as const;

const FAMILY_OPTIONS: { value: FamilyParts; labelKey: keyof (typeof labels)['fr'] }[] = [
    { value: 1, labelKey: 'single' },
    { value: 2, labelKey: 'married' },
    { value: 2.5, labelKey: 'married1child' },
    { value: 3, labelKey: 'married2children' },
    { value: 4, labelKey: 'married3children' },
];

const FranceSalaryCalculator: React.FC<Props> = ({ locale = 'fr' }) => {
    const t = labels[locale === 'fr' ? 'fr' : 'en'];

    const [annualGross, setAnnualGross] = useState(40_000);
    const [parts, setParts] = useState<FamilyParts>(1);

    const monthlyGross = Math.round(annualGross / 12);
    const cotisations = calcCotisations(annualGross);
    const annualCotisations = cotisations.total;

    const netBeforeIRAnnual = Math.max(0, annualGross - annualCotisations);
    const netBeforeIRMonthly = Math.round(netBeforeIRAnnual / 12);

    const irAnnual = calcIR(annualGross, annualCotisations, cotisations.csgCrdsNonDeductible, parts);
    const irMonthly = Math.round(irAnnual / 12);

    const annualNet = Math.max(0, netBeforeIRAnnual - irAnnual);
    const monthlyNet = Math.round(annualNet / 12);

    const fmtEuro = (n: number) => `${n.toLocaleString('fr-FR')} €`;

    const monthlyDeductionRows = [
        { label: t.csgCrds, value: Math.round(cotisations.csgCrds / 12) },
        { label: t.retraiteBase, value: Math.round(cotisations.retraiteBase / 12) },
        { label: t.retraiteCompl1, value: Math.round(cotisations.retraiteCompl1 / 12) },
        ...(cotisations.retraiteCompl2 > 0
            ? [{ label: t.retraiteCompl2, value: Math.round(cotisations.retraiteCompl2 / 12) }]
            : []),
    ];

    const handleReset = () => {
        setAnnualGross(40_000);
        setParts(1);
    };

    return (
        <ToolPanel title={t.title} subtitle="Simulateur salaire net — France 2026" onReset={handleReset}>
            <div className="flex flex-col gap-5 sm:gap-8">
                <p className="text-sm font-medium text-muted-foreground text-center">{t.desc}</p>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-foreground">{t.annualGross}</label>
                        <input
                            type="number"
                            value={annualGross}
                            onChange={(e) => setAnnualGross(Math.max(0, Number(e.target.value)))}
                            step={1_000}
                            min={0}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-success/30"
                            aria-label={t.annualGross}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-foreground">{t.situation}</label>
                        <select
                            value={parts}
                            onChange={(e) => setParts(Number(e.target.value) as FamilyParts)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-success/30"
                            aria-label={t.situation}
                        >
                            {FAMILY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {t[opt.labelKey] as string}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-success/10 border border-success/30 p-5 flex flex-col gap-1">
                        <span className="text-xs font-bold text-success uppercase tracking-wide">{t.monthlyGross}</span>
                        <span className="text-2xl font-bold text-success">{fmtEuro(monthlyGross)}</span>
                    </div>
                    <div className="rounded-2xl bg-success p-5 flex flex-col gap-1">
                        <span className="text-xs font-bold text-success uppercase tracking-wide">{t.monthlyNet}</span>
                        <span className="text-2xl font-bold text-white">{fmtEuro(monthlyNet)}</span>
                    </div>
                    <div className="rounded-2xl bg-success/10 border border-success/30 p-5 flex flex-col gap-1">
                        <span className="text-xs font-bold text-success uppercase tracking-wide">{t.annualNet}</span>
                        <span className="text-2xl font-bold text-success">{fmtEuro(annualNet)}</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-6 flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-foreground">{t.cotisations}</h3>
                    <div className="flex flex-col gap-2">
                        {monthlyDeductionRows.map(({ label, value }) => (
                            <div key={label} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">{label}</span>
                                <span className="font-bold text-foreground">{fmtEuro(value)}</span>
                            </div>
                        ))}
                        <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-foreground">{t.totalCotisations}</span>
                            <span className="text-sm font-bold text-destructive">{fmtEuro(Math.round(annualCotisations / 12))}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-6 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-muted-foreground">{t.netBeforeIR}</span>
                        <span className="font-bold text-foreground">{fmtEuro(netBeforeIRMonthly)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-muted-foreground">{t.irAnnual}</span>
                        <span className="font-bold text-destructive">{fmtEuro(irAnnual)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-border pt-2 mt-1">
                        <span className="font-bold text-foreground">{t.irMonthly}</span>
                        <span className="font-bold text-destructive">{fmtEuro(irMonthly)}</span>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">{t.note}</p>
            </div>
        </ToolPanel>
    );
};

export default FranceSalaryCalculator;
