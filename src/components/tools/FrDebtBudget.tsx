import { useState } from 'react';
import { monthlyDebtBudget } from '../../lib/debt-planning';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
const money = (cents: number) => (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
export default function FrDebtBudget() {
  const [income, setIncome] = useState('');
  const [essentials, setEssentials] = useState('');
  const [payments, setPayments] = useState('');
  const result = monthlyDebtBudget(income, essentials, payments);
  return <div className="space-y-4" data-debt-worksheet="fr">
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="text-lg font-bold">Votre budget mensuel, avant toute démarche</h2>
      <p className="text-sm">Rassemblez les ressources et dépenses de votre foyer sur un même mois. Ce solde de trésorerie n’est pas la capacité de remboursement calculée par la commission.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">Ressources reçues (€ / mois)<input inputMode="decimal" className={field} value={income} onChange={e => setIncome(e.target.value)} /></label>
        <label className="block text-sm">Dépenses essentielles hors dettes (€ / mois)<input inputMode="decimal" className={field} value={essentials} onChange={e => setEssentials(e.target.value)} /></label>
        <label className="block text-sm">Échéances des dettes (€ / mois)<input inputMode="decimal" className={field} value={payments} onChange={e => setPayments(e.target.value)} /></label>
      </div>
      <p className="text-sm text-muted-foreground">Évitez de compter deux fois une dépense. Inscrivez 0 si un poste est nul ; une case vide reste inconnue. Deux décimales au maximum.</p>
    </section>
    <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
      {result ? <><dl className="grid gap-3 sm:grid-cols-3">{[['Entrées', result.incomeCents],['Dépenses + dettes', result.essentialsCents + result.paymentsCents],['Solde mensuel', result.balanceCents]].map(([label,value]) => <div key={label}><dt className="text-sm">{label}</dt><dd className="break-words text-xl font-bold">{money(Number(value))}</dd></div>)}</dl><p className="mt-3 text-sm">Ressources − dépenses essentielles − échéances = solde. {result.balanceCents < 0 ? 'Le solde est négatif : votre budget saisi présente un manque mensuel.' : 'Un solde positif ou nul ne suffit pas à décider de la recevabilité d’un dossier.'}</p></> : <p>Saisissez trois montants valides et non négatifs pour afficher votre solde.</p>}
    </section>
    <section className="space-y-3 rounded-xl border border-border bg-card p-4"><h2 className="text-lg font-bold">Préparer → déposer → attendre la décision</h2><ol className="list-decimal space-y-2 pl-5 text-sm"><li>Réunissez justificatifs de ressources, charges, dettes et patrimoine. Faites-vous aider par un Point conseil budget ou la Banque de France.</li><li>Consultez les conditions officielles adaptées à votre situation, notamment si vous exercez une activité indépendante.</li><li>Le dépôt et la recevabilité sont deux étapes différentes. Le dépôt entraîne une inscription au FICP ; il n’efface pas vos dettes.</li><li>La commission examine notamment votre situation, votre endettement et votre bonne foi. Elle seule décide de la recevabilité et des suites.</li></ol><p className="text-sm">N’arrêtez pas vos paiements sur la seule base de ce calcul. Au stade du dépôt, suivez les consignes officielles ; les effets d’une décision de recevabilité sont distincts.</p></section>
  </div>;
}
