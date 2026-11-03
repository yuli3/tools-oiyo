// 2026-11-03: the accounting trainers keep Korean account names as internal keys;
// non-Korean pages show these English labels instead (impeccable harden: i18n leak).
export const ACCOUNT_EN: Record<string, string> = {
  '현금': 'Cash', '매출채권': 'Accounts receivable', '재고자산': 'Inventory', '유형자산': 'Property, plant & equipment',
  '감가상각누계액': 'Accumulated depreciation', '선급비용': 'Prepaid expenses', '미수수익': 'Accrued revenue',
  '매입채무': 'Accounts payable', '선수금': 'Unearned revenue', '차입금': 'Borrowings', '사채': 'Bonds payable',
  '자본금': 'Share capital', '이익잉여금': 'Retained earnings', '매출': 'Sales revenue', '매출원가': 'Cost of goods sold',
  '급여': 'Salaries expense', '감가상각비': 'Depreciation expense', '이자비용': 'Interest expense',
  '법인세비용': 'Income tax expense', '배당금': 'Dividends',
};
export const accountLabel = (key: string, locale: string) => (locale === 'ko' ? key : ACCOUNT_EN[key] ?? key);
