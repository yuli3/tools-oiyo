import type { Locale } from '../lib/i18n';

// 2026-10-29: country-specific scope stays explicit; English is shared by distinct US and GB jurisdictions.
export const debtReliefTools = [
  { locale: 'ko', languageTag: 'ko-KR', ogLocale: 'ko_KR', slug: 'personal-rehabilitation-calculator', title: '개인회생 월 변제금 계산기 — 생계비 60%·36개월', description: '월 소득과 가구원 수로 법원 인정 생계비(기준 중위소득 60%)를 빼고, 36개월 변제금과 청산가치·법정 최저 총액을 함께 확인해요.', jurisdiction: '🇰🇷 대한민국 · 채무자회생법' },
  { locale: 'ja', languageTag: 'ja-JP', ogLocale: 'ja_JP', slug: 'kojin-saisei-calculator', title: '債務整理の道しるべと個人再生の最低弁済額計算', description: '任意整理・個人再生・自己破産のどれが候補かを3つの質問で整理し、民事再生法の基準で個人再生の最低弁済額と月々の返済額を計算します。', jurisdiction: '🇯🇵 日本 · 民事再生法' },
  { locale: 'en', languageTag: 'en-GB', ogLocale: 'en_GB', slug: 'uk-debt-relief-options', title: 'UK debt options: DRO, IVA or bankruptcy (England & Wales)', description: 'Check the Debt Relief Order limits (£50,000 debt, £75 spare income, £2,000 assets, £4,000 vehicle) and compare an IVA and bankruptcy.', jurisdiction: '🇬🇧 England & Wales · gov.uk' },
  { locale: 'en', languageTag: 'en-US', ogLocale: 'en_US', slug: 'us-bankruptcy-income-worksheet', title: 'US bankruptcy income worksheet — six-month average', description: 'Organize six complete months of income for Form 122A-1 and optionally compare your annualized amount with an official median you verify. Not an eligibility decision.', jurisdiction: '🇺🇸 United States · Form 122A-1 preliminary arithmetic' },
  { locale: 'fr', languageTag: 'fr-FR', ogLocale: 'fr_FR', slug: 'france-surendettement-budget', title: 'Surendettement : budget mensuel et préparation du dossier', description: 'Visualisez votre solde mensuel après dépenses et échéances, puis préparez vos démarches auprès de la Banque de France. Sans décision de recevabilité.', jurisdiction: '🇫🇷 France · procédure de surendettement' },
] as const;

export const debtReliefForLocale = (locale: Locale) => debtReliefTools.filter((t) => t.locale === locale);
