// 2026-10-19: migrated utility schemas keep the same page content, with Tools as canonical owner.
export function toolStructuredData(opts: {
  name: string; description: string; url: string; steps: string[];
  faqs: { question: string; answer: string }[]; webApplication?: boolean;
  breadcrumbs: { name: string; url: string }[];
}) {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebApplication', name: opts.name, description: opts.description, url: opts.url, applicationCategory: 'UtilityApplication', operatingSystem: 'All', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@type': 'HowTo', name: opts.name, description: opts.description, step: opts.steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })) },
    { '@type': 'FAQPage', mainEntity: opts.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
    { '@type': 'BreadcrumbList', itemListElement: opts.breadcrumbs.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.url })) },
  ] };
}
