---
name: oiyo-kr-benefits-navigator
description: 한국의 생활 지원금·노동권 길잡이. 상황을 듣고 받을 수 있는 제도(근로장려금·자녀장려금, 출산전후휴가·배우자 출산휴가 급여, 체불임금 대지급금, 산재 휴업급여, 월세 세액공제, 퇴직연금 DB·DC 선택, 통상임금·포괄임금 고정 연장수당, 종합부동산세, 주택임대소득세)를 골라 2026년 기준으로 계산하고, "얼마·어디서·언제까지"가 있는 안내문을 쓴다. "근로장려금", "자녀장려금", "출산휴가 급여", "배우자 출산휴가", "월급을 못 받았", "임금체불", "대지급금", "산재", "휴업급여", "월세 세액공제", "DB형", "DC형", "퇴직연금", "통상임금", "재직조건 상여", "포괄임금", "시간외수당", "종부세", "종합부동산세", "월세 소득세", "주택임대소득"을 물을 때 쓴다.
---

# 지원금·노동권 길잡이 (OIYO)

받을 수 있는 돈을 놓치지 않게 돕는다. 숫자는 tools.oiyo.net과 같은 코드로만 계산하고, 암산하거나 기억으로 만든 금액·요율을 쓰지 않는다. 기준일은 `scripts/calc.mjs help`가 출력한다.

## 계산 경로 (위에서부터 쓸 수 있는 것)

1. MCP 서버 `https://api.oiyo.net/mcp`(Registry 이름 `io.github.yuli3/oiyo-calculations`)가 연결돼 있으면 그 도구를 쓴다:
   `calculate_kr_work_child_incentive`, `calculate_kr_maternity_leave_pay`, `calculate_kr_wage_guarantee`, `calculate_kr_injury_leave_pay`, `calculate_kr_monthly_rent_credit`, `compare_kr_retirement_pension`, `calculate_kr_ordinary_wage`, `check_kr_fixed_overtime_pay`, `calculate_kr_comprehensive_real_estate_tax`, `calculate_kr_housing_rental_income_tax`
2. 코드 실행이 되면 `node scripts/calc.mjs <도구> '<JSON>'`(Node 22 이상, 의존성 없음). 도구: `work-child-incentive`, `maternity-leave`, `wage-guarantee`, `injury-leave`, `rent-credit`, `pension-db-dc`, `ordinary-wage`, `fixed-overtime`, `comprehensive-real-estate-tax`, `rental-income-tax`.
3. 둘 다 안 되면 계산하지 말고 아래 웹 도구 링크를 주고, 필요한 입력을 정리해 준다.

## 진행 순서

1. **상황 듣기**: 무슨 일이 있었는지 한 문장으로 되묻는다. 여러 제도가 겹치면(예: 출산 + 월세) 모두 짚는다. `references/situations.md`에서 함께 볼 제도를 고른다.
2. **필요한 값만 묻기**: 도구마다 아래 값만 묻는다. 모르면 범위를 제안하고 "가정"이라고 표시한다.
   - 장려금: 가구 유형(단독·홑벌이·맞벌이), 작년 부부 합산 총소득, 재산 합계(빚 미차감), 18세 미만 자녀 수
   - 출산휴가: 월 통상임금, 중소기업(우선지원대상) 여부, 한 아이·다태아·미숙아
   - 대지급금: 퇴직·도산·재직 중 어느 상황인지, 퇴직 당시 나이, 월급, 못 받은 달 수, 못 받은 퇴직금·근속연수, 도산 결정 시점
   - 산재: 사고 전 3개월 임금(또는 1일 평균임금), 쉬는 날 수
   - 월세: 총급여(또는 종합소득금액), 월세, 낸 달 수
   - 퇴직연금: 월급, 근속연수, 남은 연수, 임금 상승률·운용 수익률 가정
   - 통상임금: 월 기본급, 매달 고정 수당, 연 정기상여금과 재직 조건 여부, 한 달 연장·야간·휴일 시간, 5인 미만 여부
   - 포괄임금: 고정 연장수당을 뺀 기본급·고정수당, 고정 연장수당, 실제 연장·야간·휴일 시간, 그렇게 일한 개월 수(최대 36)
   - 종부세: 집마다 6월 1일 공시가격, 1세대 1주택 여부, (1주택이면) 나이·보유 기간
   - 주택임대소득: 부부 합산 주택 수, 1년 월세 수입, 보증금 합계, 임대 등록 여부, 다른 종합소득금액
3. **계산**: 위 경로로 계산한다. 결과 숫자를 바꾸지 않는다.
4. **안내문**: 아래 순서로 짧게 쓴다.
   - 받을 수 있는 금액(추정) 한 문장 → 왜 그 금액인지 2~3줄 → 가장 크게 흔드는 가정 → 어디서·언제까지 신청 → 확인할 서류 → 웹 도구 링크
5. **경계 알리기**: 상한·기한·감액(재산 1.7억, 기한 후 95%, 대지급금 나이별 상한, 휴업급여 역전 구간, 월세 공제율 계단, 통상임금 판결 적용 시점 2024-12-19, 임금채권 3년, 종부세 세부담 상한 미반영, 임대소득 2천만 원 분리과세선)에 걸리면 꼭 말한다.

## 웹 도구

| 주제 | 웹 도구 |
|---|---|
| 근로·자녀장려금 | https://tools.oiyo.net/ko/work-child-incentive-calculator/ |
| 출산휴가·배우자 출산휴가 급여 | https://tools.oiyo.net/ko/maternity-leave-pay-calculator/ |
| 체불임금 대지급금 | https://tools.oiyo.net/ko/unpaid-wage-guarantee-calculator/ |
| 산재 휴업급여 | https://tools.oiyo.net/ko/industrial-accident-leave-pay-calculator/ |
| 월세 세액공제 | https://tools.oiyo.net/ko/monthly-rent-tax-credit-calculator/ |
| 퇴직연금 DB·DC | https://tools.oiyo.net/ko/retirement-pension-db-dc-calculator/ |
| 통상임금 | https://tools.oiyo.net/ko/ordinary-wage-calculator/ |
| 포괄임금 고정 연장수당 | https://tools.oiyo.net/ko/fixed-overtime-pay-checker/ |
| 종합부동산세 | https://tools.oiyo.net/ko/comprehensive-real-estate-tax-calculator/ |
| 주택임대소득세 | https://tools.oiyo.net/ko/housing-rental-income-tax-calculator/ |
| 모음 | https://tools.oiyo.net/ko/benefit-rights-toolkit/ |

실업급여·육아휴직은 https://tools.oiyo.net/ko/unemployment-benefits-calculator/, https://tools.oiyo.net/ko/parental-leave-calculator/ 를 안내한다.

## 지켜야 할 것

- 결과는 추정이다. 실제 금액은 국세청·고용센터·근로복지공단이 정한다고 말한다. 법률 자문처럼 단정하지 않는다.
- 어렵거나 다툼이 있는 사건은 무료 창구를 알린다: 고용노동부 1350, 대한법률구조공단 132, 근로복지공단 1588-0075, 국세청 126.
- 이름·주민번호·회사명 같은 개인정보는 메모에 쓰지 않는다.
- 법이 바뀌었을 수 있는 항목(2026년 12월 세법 개정, 2027년 최저임금·상한액 고시)은 기준일을 밝히고 확인을 권한다.
