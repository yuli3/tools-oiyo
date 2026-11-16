// 생활 지원금·노동권 도구 모음 (2026-11-16). Gemini가 만들던 공익 도구를 Claude가 이어받아 ko 전용으로 만들었어요.
// 받을 수 있는 돈을 놓치지 않게 돕는 도구라 "얼마 받나 + 어디서 신청하나"를 같이 보여 줘요.
export const welfareTools = [
  { slug: "benefit-rights-toolkit", title: "생활 지원금·노동권 도구 모음", description: "근로·자녀장려금, 출산휴가 급여, 체불 대지급금, 산재 휴업급여, 월세 세액공제, 퇴직연금 DB·DC를 한곳에 모았어요." },
  { slug: "work-child-incentive-calculator", title: "근로장려금·자녀장려금 계산기", description: "가구 유형·소득·재산·자녀 수로 2026년 근로장려금과 자녀장려금 예상액, 신청 방법을 알려 줘요." },
  { slug: "maternity-leave-pay-calculator", title: "출산휴가 급여 계산기", description: "출산전후휴가 90일(다태아 120일·미숙아 100일)과 배우자 출산휴가 20일 급여를 회사·고용보험 몫으로 나눠 계산해요." },
  { slug: "unpaid-wage-guarantee-calculator", title: "체불임금 대지급금 계산기", description: "월급·퇴직금을 못 받았을 때 나라가 먼저 주는 간이·도산 대지급금을 나이별 상한과 2026년 6개월 확대까지 반영해 계산해요." },
  { slug: "industrial-accident-leave-pay-calculator", title: "산재 휴업급여 계산기", description: "평균임금 70%, 최저임금 보장, 2026 최고 보상기준을 반영해 산재로 쉬는 동안 받는 휴업급여를 계산해요." },
  { slug: "monthly-rent-tax-credit-calculator", title: "월세 세액공제 계산기", description: "총급여 5,500만 원 이하 17%, 8,000만 원 이하 15%, 연 1,000만 원 한도로 월세 세액공제와 지방소득세 환급을 계산해요." },
  { slug: "retirement-pension-db-dc-calculator", title: "퇴직연금 DB형 vs DC형 비교", description: "임금 상승률과 운용 수익률에 따라 DB형과 DC형 중 무엇이 유리한지, 갈림길 수익률까지 보여 줘요." },
] as const;
