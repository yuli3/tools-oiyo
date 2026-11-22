// 2026 귀속 연말정산 미리보기·간소화 시즌 안내 (2026-11-22, 전 분야 작업 1번). 화면: components/tools/nts/YearEndPreview2026.tsx
// 사실: 국세청 카드뉴스 「13월의 월급, 나는 얼마나 받을까?」(정책브리핑 2026-10-23) — 미리보기 2026.10.28~12.18, 간소화 2027년 1월 개통 예정,
// 2026년 달라지는 공제(카드 한도·교육비·고향사랑·월세). 법정 기한은 소득세법 조문. 간소화 개통일·회사 제출일은 공지 전이라 날짜를 만들지 않아요.
export const YE_PREVIEW_AS_OF = "2026-11-22";
export const NTS_CARD = "국세청 카드뉴스(정책브리핑 2026-10-23)";

export type YeEvent = { id: string; label: string; date: string | null; cite: string; note?: string; daysLeft: number | null };
const BASE: Omit<YeEvent, "daysLeft">[] = [
  { id: "preview-open", label: "연말정산 미리보기 열림(홈택스)", date: "2026-10-28", cite: NTS_CARD },
  { id: "preview-close", label: "연말정산 미리보기 마감", date: "2026-12-18", cite: NTS_CARD, note: "1~9월 카드 사용액은 실제 금액, 10~12월은 예상액을 넣어 계산해요." },
  { id: "year-close", label: "2026년 지출·납입이 공제에 잡히는 마지막 날", date: "2026-12-31", cite: "소득세법 제5조(과세기간 1월 1일~12월 31일)", note: "연금저축·IRP 납입, 기부, 카드 사용은 이날까지 한 것만 2026 귀속이에요." },
  { id: "simplified", label: "연말정산 간소화 자료 조회(홈택스)", date: null, cite: NTS_CARD, note: "2027년 1월 개통 예정이에요. 정확한 날은 국세청 공지로 확인해요." },
  { id: "company", label: "회사에 공제 신고서·증빙 내기", date: null, cite: "소득세법 제140조", note: "마감은 회사가 정해요." },
  { id: "settle", label: "회사가 2월분 급여 때 연말정산", date: null, cite: "소득세법 제137조①", note: "환급·추가 납부가 2월 급여(또는 3월)에 반영돼요." },
  { id: "statement", label: "회사의 근로소득 지급명세서·원천세 신고", date: "2027-03-10", cite: "소득세법 제128조①·제164조" },
  { id: "correct", label: "빠뜨린 공제는 5월 종합소득세 신고로 추가", date: "2027-05-31", cite: "소득세법 제70조", note: "월세·교육비·기부금·혼인 세액공제를 빠뜨렸으면 5월에 고쳐 신고할 수 있어요." },
];

const days = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export function yearEndTimeline(today: string = YE_PREVIEW_AS_OF): YeEvent[] {
  return BASE.map((e) => ({ ...e, daysLeft: e.date ? days(today, e.date) : null }));
}

export type Who = "single" | "parent" | "renter";
export type YeTip = { id: string; title: string; body: string; cite: string; href: string; tool: string; who?: Who[]; change2026?: boolean };
export const YE_TIPS: YeTip[] = [
  { id: "card", title: "카드는 체크카드·현금영수증 비율 확인", body: "신용카드는 15%, 체크카드·현금영수증은 30%를 공제해요. 기본 한도는 총급여 7천만 원 이하 300만 원, 자녀 1명 350만 원, 2명 이상 400만 원이에요(7천만 원 초과는 250만·275만·300만 원).", cite: NTS_CARD, href: "/ko/year-end-settlement-calculator/", tool: "연말정산 계산기", change2026: true },
  { id: "pension", title: "연금저축·IRP 남은 한도 채우기", body: "올해 납입한 금액과 남은 한도를 확인해요. 12월 31일까지 낸 금액만 올해 공제예요.", cite: NTS_CARD, href: "/ko/pension-optimizer-calculator/", tool: "연금 최적화 계산기" },
  { id: "dependent", title: "부양가족 중복 공제 피하기", body: "가족 한 명은 한 사람만 공제받아요. 중복 공제는 자주 나오는 실수예요. 성인 자녀 자료는 따로 동의를 받아야 조회돼요.", cite: `${NTS_CARD}; 국세청 「연말정산 실수, 가산세 없이 정정 신고하세요」(정책브리핑 2025-05-22)`, href: "/ko/dependent-deduction-checker/", tool: "부양가족 공제 체크", who: ["parent", "single"] },
  { id: "medical", title: "의료비 세액공제 따져 보기", body: "의료비는 허위·중복 공제가 자주 걸리는 항목이에요. 간소화 자료와 실제 영수증이 맞는지 확인해요.", cite: "국세청 「연말정산 실수, 가산세 없이 정정 신고하세요」(정책브리핑 2025-05-22)", href: "/ko/medical-expense-tax-credit-calculator/", tool: "의료비 세액공제 계산기" },
  { id: "rent", title: "월세 세액공제", body: "2026년부터 요건을 갖춘 맞벌이 부부 일부에게도 넓어지고, 자녀 셋 이상 가구는 주택 면적 요건이 완화돼요. 월세는 간소화에 없을 수 있어 계약서·이체 내역을 챙겨요.", cite: NTS_CARD, href: "/ko/monthly-rent-tax-credit-calculator/", tool: "월세 세액공제 계산기", who: ["renter"], change2026: true },
  { id: "education", title: "교육비: 9세 이하 예체능 학원", body: "2026년부터 9세 미만(초2 이하) 자녀의 예능학원·체육시설 수강료가 교육비 세액공제에 들어가요. 직계비속 소득 요건도 없어져서, 아르바이트하는 대학생 자녀의 등록금도 공제돼요.", cite: NTS_CARD, href: "/ko/year-end-settlement-calculator/", tool: "연말정산 계산기", who: ["parent"], change2026: true },
  { id: "hometown", title: "고향사랑기부금", body: "2026년부터 10만 원 초과 20만 원 이하 부분은 40%를 공제해요(20만 원 초과는 15%, 특별재난지역 요건을 갖추면 30%).", cite: NTS_CARD, href: "/ko/tax-season-checklist-2027/", tool: "1~3월 세무 시즌 점검표", change2026: true },
];

export const tipsFor = (who: Who | "all") => (who === "all" ? YE_TIPS : YE_TIPS.filter((t) => !t.who || t.who.includes(who)));
