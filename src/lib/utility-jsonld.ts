// WebApplication + HowTo + FAQPage for utilities migrated from Blog (2026-10-27).
export function utilityJsonLd(o: { name: string; description: string; url: string; locale: string; steps: string[]; faqs: { question: string; answer: string }[] }) {
  return [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: o.name, description: o.description, url: o.url, inLanguage: o.locale,
      applicationCategory: 'UtilityApplication', operatingSystem: 'All', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'HowTo', name: o.name, description: o.description,
      step: o.steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: o.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
  ];
}
