// 생활 지원금·노동권 도구 모음 (2026-11-16). Gemini가 만들던 공익 도구를 Claude가 이어받아 ko 전용으로 만들었어요.
// 받을 수 있는 돈을 놓치지 않게 돕는 도구라 "얼마 받나 + 어디서 신청하나"를 같이 보여 줘요.
export const welfareTools = [
  { slug: "benefit-rights-toolkit", title: "생활 지원금·노동권 도구 모음", description: "근로·자녀장려금, 출산휴가 급여, 체불 대지급금, 산재 휴업급여, 월세 세액공제, 퇴직연금 DB·DC, 통상임금·포괄임금 점검, 종부세·주택임대소득세, 부양가족 공제, 주식 대주주 양도세, 해고예고수당·휴업수당·육아기 단축급여·수습 최저임금·연차 사용촉진을 한곳에 모았어요." },
  { slug: "work-child-incentive-calculator", title: "근로장려금·자녀장려금 계산기", description: "가구 유형·소득·재산·자녀 수로 2026년 근로장려금과 자녀장려금 예상액, 신청 방법을 알려 줘요." },
  { slug: "maternity-leave-pay-calculator", title: "출산휴가 급여 계산기", description: "출산전후휴가 90일(다태아 120일·미숙아 100일)과 배우자 출산휴가 20일 급여를 회사·고용보험 몫으로 나눠 계산해요." },
  { slug: "unpaid-wage-guarantee-calculator", title: "체불임금 대지급금 계산기", description: "월급·퇴직금을 못 받았을 때 나라가 먼저 주는 간이·도산 대지급금을 나이별 상한과 2026년 6개월 확대까지 반영해 계산해요." },
  { slug: "industrial-accident-leave-pay-calculator", title: "산재 휴업급여 계산기", description: "평균임금 70%, 최저임금 보장, 2026 최고 보상기준을 반영해 산재로 쉬는 동안 받는 휴업급여를 계산해요." },
  { slug: "monthly-rent-tax-credit-calculator", title: "월세 세액공제 계산기", description: "총급여 5,500만 원 이하 17%, 8,000만 원 이하 15%, 연 1,000만 원 한도로 월세 세액공제와 지방소득세 환급을 계산해요." },
  { slug: "retirement-pension-db-dc-calculator", title: "퇴직연금 DB형 vs DC형 비교", description: "임금 상승률과 운용 수익률에 따라 DB형과 DC형 중 무엇이 유리한지, 갈림길 수익률까지 보여 줘요." },
  { slug: "ordinary-wage-calculator", title: "통상임금 계산기", description: "재직 조건 붙은 상여도 넣는 2024년 대법원 판결 기준으로 통상임금 시급과 연장·야간·휴일수당, 연차수당을 계산해요." },
  { slug: "fixed-overtime-pay-checker", title: "포괄임금 고정 연장수당 점검", description: "고정 연장수당이 실제로 일한 시간의 법정 수당보다 적은지 확인하고, 모자란 돈을 3년치까지 계산해요." },
  { slug: "comprehensive-real-estate-tax-calculator", title: "종합부동산세 계산기", description: "공시가격으로 2026년 주택분 종부세를 계산해요. 12억·9억 공제, 다주택 중과, 재산세 중복분, 고령·장기보유 공제까지 반영해요." },
  { slug: "housing-rental-income-tax-calculator", title: "주택임대소득세 계산기", description: "집 수·월세·보증금으로 주택임대소득세를 계산하고 2천만 원 이하 분리과세 14%와 종합과세 중 싼 쪽을 알려 줘요." },
  { slug: "long-term-care-copay-calculator", title: "노인장기요양 본인부담금 계산기", description: "장기요양등급과 집·요양원 여부로 2026년 한 달 본인부담금을 계산해요. 한도액, 감경, 식사비까지 반영해요." },
  { slug: "dependent-deduction-checker", title: "부양가족 공제 판정기", description: "부모님·배우자·자녀·형제자매를 연말정산 부양가족으로 올릴 수 있는지 나이·소득·동거로 판정하고 줄어드는 세금을 보여 줘요." },
  { slug: "stock-major-shareholder-tax-calculator", title: "주식 대주주 양도세 계산기", description: "작년 말 종목당 50억 원·지분율 기준으로 대주주인지 판정하고, 상장주식 양도세(20·25%)와 연말 보유 점검을 보여 줘요." },
  { slug: "dismissal-notice-pay-calculator", title: "해고예고수당 계산기", description: "월 통상임금과 예고 일수, 근무 기간으로 해고예고수당(30일분 통상임금)을 계산하고, 3개월 미만·천재지변 예외와 5명 미만 사업장 적용 여부를 알려 줘요." },
  { slug: "shutdown-allowance-calculator", title: "휴업수당 계산기", description: "직전 3개월 임금과 휴업 일수로 휴업수당(평균임금 70%, 통상임금 대체), 쉬는 동안 받은 임금 공제, 노동위원회 감액 승인과 5명 미만 미적용까지 계산해요." },
  { slug: "reduced-hours-childcare-pay-calculator", title: "육아기 근로시간 단축 급여 계산기", description: "월 통상임금과 단축 전후 주 근로시간으로 2026년 육아기 근로시간 단축 급여(처음 10시간 100%·상한 250만 원, 나머지 80%·상한 160만 원)와 회사 월급 합계를 계산해요." },
  { slug: "probation-minimum-wage-checker", title: "수습 최저임금 점검", description: "시급과 계약 기간, 수습 개월, 단순노무 여부로 2026년 수습 최저임금 90%(시급 9,288원) 감액이 되는지, 모자란 금액이 얼마인지 알려 줘요." },
  { slug: "annual-leave-promotion-planner", title: "연차 사용촉진 날짜 계산기", description: "연차 사용기간 종료일로 근로기준법 제61조 연차 사용촉진 일정(6개월 전 10일 안 촉구, 2개월 전까지 지정 통보, 입사 첫해 3개월·1개월 전)을 계산하고, 수당을 청구할 수 있는지 알려 줘요." },
] as const;
