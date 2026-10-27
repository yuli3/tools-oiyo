// W14 (2026-10-27): health tools that are not in all six locales, so they sit outside utilityCatalog.
// ko-only ones follow Korean sources (KDCA schedule, KOSTAT life table).
export const krHealthTools = [
  { slug: 'vaccination-schedule', title: '아기 예방접종 일정표', description: '아기 생년월일을 넣으면 질병관리청 국가예방접종 일정에 맞춰 백신별 접종 시기를 보여 줘요.' },
  { slug: 'life-expectancy-calculator', title: '기대수명 계산기', description: '통계청 2023 생명표 기대여명에 생활습관 요인을 더해 내 기대수명을 추정해요.' },
  { slug: 'male-to-female-running-time-converter', title: '달리기 기록 남녀 환산기', description: '5K·10K·하프·풀코스 남녀 세계기록 비율로 남자 기록과 여자 기록을 서로 환산해요.' },
] as const;
export const enHealthTools = [
  { slug: 'male-to-female-running-time-converter', title: 'Male to Female Running Time Converter' },
  { slug: 'crossfit-male-to-female-weight-converter', title: 'CrossFit Male to Female Weight Converter' },
] as const;
