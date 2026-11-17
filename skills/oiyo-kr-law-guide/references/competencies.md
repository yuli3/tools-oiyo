# 전문 직업 역량 지도

GENERATED from tools-oiyo src/data/pro-competencies.ts. 기준일 2026-11-17. 웹: https://tools.oiyo.net/ko/pro-competency-map/

질문이 어느 직업의 어떤 역량에 해당하는지 고른 뒤, 연결된 도구·MCP로 계산하고 업무 범위(ethics) 역량으로 경계를 확인한다. '준비 중'은 아직 도구가 없으니 계산하지 말고 공공 창구나 자격사로 안내한다.

## 역량 분류

- `law` 법령 해석: 근거 조문을 찾고, 개정과 시행일을 따라가며, 사실관계에 맞게 읽는 힘
- `calc` 계산·평가: 세액·임금·손해액·보험료·기업가치처럼 결론이 숫자로 나오는 일
- `deadline` 기한·절차: 신고·신청·불복·청구 기한을 세고, 절차 순서를 놓치지 않는 일
- `docs` 서류·증빙: 어떤 사실을 어떤 서류로 증명할지 정리하고 기록을 남기는 일
- `consult` 상담·설계: 결론을 바꾸는 질문을 먼저 하고, 선택지를 비교해 설명하는 일
- `ethics` 업무 범위·윤리: 자격법이 정한 업무 범위, 금지 행위, 성실·비밀유지 의무
- `digital` 전자 업무·데이터: 홈택스·전자소송·인터넷등기소 같은 전자 창구와 데이터 분석·자동화

## 세무사 (세무사법 제2조)

세금 신고·불복 대리, 세무 상담, 장부 작성 대행

- **세법 체계와 개정 추적** [법령 해석] (일반인도 씀): 국세기본법·소득세법·법인세법·부가가치세법·상증법의 구조, 매년 12월 개정과 시행일을 따라가요.
  - 도구: 세금 법령 길잡이 https://tools.oiyo.net/ko/tax-law-guide/ · 세금 공식 탐색기 https://tools.oiyo.net/ko/tax-formula-explorer/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide, kr-tax-advisor
- **소득·양도·상속·증여 세액 계산** [계산·평가] (일반인도 씀): 과세표준 → 세율 → 공제·감면 순서로 세액을 구하고, 같은 사실에서 결론이 갈리는 지점을 찾아요.
  - 도구: 종합소득세 계산기 https://tools.oiyo.net/ko/comprehensive-income-tax-calculator/ · 프리랜서 세금 계산기 https://tools.oiyo.net/ko/freelancer-tax-calculator/ · 양도소득세 계산기 https://tools.oiyo.net/ko/capital-gains-tax-calculator/ · 상속세 계산기 https://tools.oiyo.net/ko/inheritance-tax-calculator/ · 증여세 계산기 https://tools.oiyo.net/ko/gift-tax-calculator/
  - MCP: `calculate_kr_freelancer_income_tax`, `calculate_capital_gains_tax`, `calculate_inheritance_gift_tax`
  - 스킬: kr-tax-advisor
- **연말정산·공제 판정** [계산·평가] (일반인도 씀): 부양가족·의료비·월세·카드 공제 요건을 하나씩 판정하고 환급액 차이를 비교해요.
  - 도구: 연말정산 계산기 https://tools.oiyo.net/ko/year-end-settlement-calculator/ · 부양가족 공제 판정 https://tools.oiyo.net/ko/dependent-deduction-checker/ · 의료비 세액공제 https://tools.oiyo.net/ko/medical-expense-tax-credit-calculator/ · 월세 세액공제 https://tools.oiyo.net/ko/monthly-rent-tax-credit-calculator/
  - MCP: `calculate_kr_year_end_settlement`, `check_kr_dependent_deduction`, `calculate_kr_monthly_rent_credit`, `calculate_card_tax_deduction`
  - 스킬: oiyo-kr-benefits-navigator
- **비상장주식·가업상속 평가** [계산·평가]: 상증법 보충적 평가(순손익가치·순자산가치 가중), 가업상속공제 요건과 사후관리를 계산해요.
  - 도구: 비상장주식 평가 https://tools.oiyo.net/ko/unlisted-share-valuation-calculator/ · 가업상속공제 https://tools.oiyo.net/ko/family-business-inheritance-calculator/
  - MCP: `value_kr_unlisted_shares`, `calculate_kr_family_business_deduction`
  - 스킬: kr-tax-advisor
- **신고·납부 일정과 가산세 관리** [기한·절차] (일반인도 씀): 부가세·원천세·종합소득세·법인세 신고 일정을 잡고, 늦었을 때 가산세 감면 구간을 계산해요.
  - 도구: 세무 일정 https://tools.oiyo.net/ko/tax-calendar/ · 부가세 가산세 https://tools.oiyo.net/ko/vat-penalty-calculator/ · 상속·증여 신고기한 https://tools.oiyo.net/ko/inheritance-gift-filing-deadline-calculator/
  - MCP: `get_kr_business_tax_calendar`, `plan_kr_inheritance_gift_filing_deadline`, `check_kr_business_day`
- **조세불복 기한과 절차** [기한·절차] (일반인도 씀, 자격사 업무와 맞닿음: 정보만): 고지서를 받은 날부터 90일 안에 이의신청·심사청구·심판청구를 고르고, 경정청구 5년을 따져요.
  - 도구: 세금 법령 길잡이 https://tools.oiyo.net/ko/tax-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **장부·증빙 검토** [서류·증빙] (자격사 업무와 맞닿음: 정보만): 간편장부·복식부기 대상, 업무용 승용차 운행기록, 적격증빙을 확인해요.
  - 도구: 회계·장부 법령 길잡이 https://tools.oiyo.net/ko/accounting-law-guide/ · 업무용 승용차 비용 https://tools.oiyo.net/ko/business-car-expense-calculator/ · 경비율 계산기 https://tools.oiyo.net/ko/expense-ratio-calculator/
  - MCP: `calculate_kr_business_car_expense`
- **사업자 유형과 절세 설계** [상담·설계] (일반인도 씀): 간이·일반과세, 개인·법인, 법인전환 시점을 숫자로 비교해 선택지를 설명해요.
  - 도구: 간이 vs 일반과세 https://tools.oiyo.net/ko/general-vs-simplified-vat-calculator/ · 법인전환 계산기 https://tools.oiyo.net/ko/incorporation-conversion-calculator/ · 절세 로드맵 https://tools.oiyo.net/ko/tax-savings-roadmap/
  - MCP: `compare_kr_general_vs_simplified_vat`, `calculate_kr_incorporation_conversion`
  - 스킬: kr-tax-advisor, oiyo-business-strategist
- **세무대리 범위와 성실의무** [업무 범위·윤리]: 세무대리는 세무사 업무예요(세무사법 제2조). 개정 제20조 제3항(2026-06-24 시행)은 무자격자의 세무대리 암시 광고도 금지해요.
  - 도구: 법령 길잡이 6분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
- **홈택스 전자신고·자료 조회** [전자 업무·데이터] (준비 중): 간소화 자료, 전자세금계산서, 신고서 제출 화면을 다루는 실무 역량이에요.

## 공인회계사 (공인회계사법 제2조)

회계감사, 재무 자문, 기업가치 평가, 세무 대리

- **외부감사법과 회계기준** [법령 해석]: 외부감사 대상 판정, K-IFRS·일반기업회계기준의 인식·측정 원칙을 적용해요.
  - 도구: 회계·장부 법령 길잡이 https://tools.oiyo.net/ko/accounting-law-guide/
  - MCP: `search_kr_statutes`, `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **재무제표 분석** [계산·평가] (일반인도 씀): 수익성·안정성·활동성 비율 추세로 회사 상태를 읽어요.
  - 도구: 재무비율 추세 https://tools.oiyo.net/ko/financial-ratio-trend/ · 원가계산 시뮬레이터 https://tools.oiyo.net/ko/cost-accounting-simulator/
- **기업가치 평가** [계산·평가]: DCF·WACC, 상증법 평가를 나란히 놓고 가정이 바뀔 때 가치가 어떻게 움직이는지 봐요.
  - 도구: DCF 기업가치 https://tools.oiyo.net/ko/dcf-valuation-calculator/ · 비상장주식 평가 https://tools.oiyo.net/ko/unlisted-share-valuation-calculator/
  - MCP: `calculate_dcf_valuation`, `value_kr_unlisted_shares`, `calculate_cagr`
  - 스킬: kr-tax-advisor
- **분개와 계정 흐름** [서류·증빙] (일반인도 씀): 거래를 차변·대변으로 나누고 T계정으로 잔액 흐름을 확인해요.
  - 도구: 분개 연습 https://tools.oiyo.net/ko/journal-entry-trainer/ · T계정 시각화 https://tools.oiyo.net/ko/t-account-visualizer/
- **결산·감사·법인세 일정** [기한·절차]: 결산 → 감사 → 주총 → 법인세 신고(사업연도 종료 후 3개월) 순서를 맞춰요.
  - 도구: 회계·장부 법령 길잡이 https://tools.oiyo.net/ko/accounting-law-guide/ · 세무 일정 https://tools.oiyo.net/ko/tax-calendar/
  - MCP: `get_kr_business_tax_calendar`
- **경영·재무 자문** [상담·설계]: 단위경제·런웨이·인수 통합을 숫자로 검토하고 결론·근거·다음 행동을 한 장으로 정리해요.
  - 도구: 단위경제·런웨이 https://tools.oiyo.net/ko/unit-economics-runway-calculator/ · 인수 통합 점검 https://tools.oiyo.net/ko/acquisition-integration-check/ · 의사결정 트리 https://tools.oiyo.net/ko/decision-tree-calculator/
  - MCP: `calculate_unit_economics_runway`
  - 스킬: oiyo-business-strategist
- **독립성과 감사 업무 범위** [업무 범위·윤리] (자격사 업무와 맞닿음: 정보만): 회계감사는 공인회계사 업무예요(공인회계사법 제2조). 이해관계가 있는 회사의 감사는 제한돼요(제21조).
  - 도구: 법령 길잡이 6분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
- **감사 데이터 분석** [전자 업무·데이터] (준비 중): 전표 전수 분석, 이상 거래 탐지 같은 데이터 기반 감사 기법이에요.

## 공인노무사 (공인노무사법 제2조)

노동 사건 대리(구제신청 등), 노무 서류 작성, 노무관리진단, 노동 상담

- **근로기준법·노조법·산재법** [법령 해석] (일반인도 씀): 5인 미만 적용 제외, 근로자성, 해고 제한처럼 결론을 바꾸는 요건을 읽어요.
  - 도구: 노동법 길잡이 https://tools.oiyo.net/ko/labor-law-guide/ · 노동법 빠른 점검 https://tools.oiyo.net/ko/labor-law-quick-check/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **임금 계산** [계산·평가] (일반인도 씀): 통상임금 → 연장·야간·휴일수당, 주휴수당, 퇴직금을 같은 기준으로 계산해요.
  - 도구: 통상임금 계산기 https://tools.oiyo.net/ko/ordinary-wage-calculator/ · 연장수당 계산기 https://tools.oiyo.net/ko/overtime-pay-calculator/ · 주휴수당 계산기 https://tools.oiyo.net/ko/weekly-holiday-pay-calculator/ · 퇴직금 계산기 https://tools.oiyo.net/ko/severance-calculator/ · 포괄임금 점검 https://tools.oiyo.net/ko/fixed-overtime-pay-checker/
  - MCP: `calculate_kr_ordinary_wage`, `calculate_overtime_pay`, `calculate_weekly_allowance`, `calculate_severance_pay`, `check_kr_fixed_overtime_pay`, `get_kr_minimum_wage`
  - 스킬: oiyo-kr-benefits-navigator
- **휴가·휴직 급여** [계산·평가] (일반인도 씀): 연차 일수, 출산전후휴가·육아휴직·육아기 단축 급여를 계산해요.
  - 도구: 연차 계산기 https://tools.oiyo.net/ko/annual-leave-calculator/ · 출산휴가 급여 https://tools.oiyo.net/ko/maternity-leave-pay-calculator/ · 육아휴직 급여 https://tools.oiyo.net/ko/parental-leave-calculator/ · 육아기 단축 급여 https://tools.oiyo.net/ko/reduced-hours-childcare-pay-calculator/
  - MCP: `calculate_annual_leave`, `calculate_kr_maternity_leave_pay`, `calculate_kr_reduced_hours_childcare_pay`
  - 스킬: oiyo-kr-benefits-navigator
- **4대보험과 인건비** [계산·평가] (일반인도 씀): 건강·연금·고용·산재보험료와 사업주 부담을 합쳐 실제 인건비를 구해요.
  - 도구: 인건비 계산기 https://tools.oiyo.net/ko/labor-cost-calculator/ · 건강보험료 계산기 https://tools.oiyo.net/ko/health-insurance-calculator/ · 일용직 4대보험 https://tools.oiyo.net/ko/daily-worker-insurance-checker/ · 실수령액 계산기 https://tools.oiyo.net/ko/salary-calculator/
  - MCP: `calculate_health_insurance`, `calculate_net_salary`
- **해고·체불 구제 기한** [기한·절차] (일반인도 씀, 자격사 업무와 맞닿음: 정보만): 부당해고 구제신청 3개월, 해고예고수당, 체불임금 대지급금 신청 기한을 세요.
  - 도구: 노동법 길잡이 https://tools.oiyo.net/ko/labor-law-guide/ · 해고예고수당 https://tools.oiyo.net/ko/dismissal-notice-pay-calculator/ · 체불 대지급금 https://tools.oiyo.net/ko/unpaid-wage-guarantee-calculator/ · 휴업수당 https://tools.oiyo.net/ko/shutdown-allowance-calculator/
  - MCP: `start_kr_law_intake`, `calculate_kr_dismissal_notice_pay`, `calculate_kr_wage_guarantee`, `calculate_kr_shutdown_allowance`
  - 스킬: oiyo-kr-law-guide, oiyo-kr-benefits-navigator
- **근로계약·연차촉진·수습 서류** [서류·증빙] (자격사 업무와 맞닿음: 정보만): 연차 사용촉진 통보 순서, 수습 감액 요건처럼 서류로 남겨야 효력이 생기는 절차를 챙겨요.
  - 도구: 연차 사용촉진 일정 https://tools.oiyo.net/ko/annual-leave-promotion-planner/ · 수습 최저임금 점검 https://tools.oiyo.net/ko/probation-minimum-wage-checker/
  - MCP: `plan_kr_annual_leave_promotion`, `check_kr_probation_minimum_wage`
  - 스킬: oiyo-kr-benefits-navigator
- **산재·실업급여 안내** [상담·설계] (일반인도 씀): 휴업급여, 실업급여 수급 요건, 자진퇴사 정당 사유를 사실관계로 확인해요.
  - 도구: 산재 휴업급여 https://tools.oiyo.net/ko/industrial-accident-leave-pay-calculator/ · 실업급여 계산기 https://tools.oiyo.net/ko/unemployment-benefits-calculator/ · 자진퇴사 실업급여 점검 https://tools.oiyo.net/ko/voluntary-quit-unemployment-checker/
  - MCP: `calculate_kr_injury_leave_pay`, `calculate_unemployment_benefits`, `check_kr_voluntary_quit_unemployment`
  - 스킬: oiyo-kr-benefits-navigator
- **대리·서류 작성의 독점 범위** [업무 범위·윤리]: 노동 상담은 누구나 할 수 있지만, 사건 대리·서류 작성·노무관리진단은 공인노무사 업무예요(공인노무사법 제2조·제27조).
  - 도구: 법령 길잡이 6분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
- **고용24·노동포털 전자 신고** [전자 업무·데이터] (준비 중): 4대보험 취득·상실 신고, 진정 접수 같은 전자 창구 실무예요.

## 행정사 (행정사법 제2조)

행정기관 제출 서류 작성·제출 대행, 인허가·체류 민원, 행정심판 관련 사실조사

- **행정절차법·행정심판법·행정기본법** [법령 해석] (일반인도 씀): 처분 사전통지·의견제출, 재량권 일탈, 행정심판 청구 요건을 읽어요.
  - 도구: 행정 절차 길잡이 https://tools.oiyo.net/ko/administrative-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **의견제출·행정심판·소송 기한** [기한·절차] (일반인도 씀): 처분을 안 날부터 90일, 있은 날부터 180일, 영업일 기준 기한을 계산해요.
  - 도구: 행정 절차 길잡이 https://tools.oiyo.net/ko/administrative-law-guide/ · 영업일 계산 https://tools.oiyo.net/ko/business-day-checker/
  - MCP: `start_kr_law_intake`, `check_kr_business_day`
  - 스킬: oiyo-kr-law-guide
- **인허가·민원 서류** [서류·증빙] (자격사 업무와 맞닿음: 정보만, 준비 중): 영업신고·허가 신청에 필요한 서류와 요건을 정리해요. 작성·제출 대행은 행정사 업무예요.
- **출입국·체류 자격** [법령 해석] (준비 중): 체류자격 변경·연장, 사증 종류별 요건을 다뤄요.
- **건축·토지 규제 수치** [계산·평가] (일반인도 씀): 건폐율·용적률처럼 인허가 판단에 쓰는 수치를 계산해요.
  - 도구: 건폐율·용적률 https://tools.oiyo.net/ko/building-coverage-floor-area-ratio-calculator/
- **과태료·이행강제금 감경** [계산·평가] (준비 중): 의견제출 기한 안 자진 납부 감경, 이행강제금 산정 방식을 계산해요.
- **정보공개청구와 사실조사** [상담·설계] (일반인도 씀): 필요한 행정 정보를 청구하고, 비공개 결정에 이의신청하는 순서를 안내해요.
  - 도구: 행정 절차 길잡이 https://tools.oiyo.net/ko/administrative-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **행정사 업무 범위** [업무 범위·윤리]: 행정기관 제출 서류 작성·제출 대행은 행정사 업무예요(행정사법 제2조·제3조).
  - 도구: 법령 길잡이 6분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 법무사 (법무사법 제2조)

등기·공탁 신청 대리, 법원·검찰 제출 서류 작성

- **상속·부동산등기·민사집행** [법령 해석] (일반인도 씀): 상속 순위와 포기·한정승인, 등기 원인, 지급명령·강제집행 요건을 읽어요.
  - 도구: 등기·법원 서류 길잡이 https://tools.oiyo.net/ko/registry-court-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **상속 포기·신고·등기 기한** [기한·절차] (일반인도 씀): 상속 포기·한정승인 3개월, 상속세 신고 6개월, 소유권이전등기 60일을 함께 세요.
  - 도구: 등기·법원 서류 길잡이 https://tools.oiyo.net/ko/registry-court-law-guide/ · 상속·증여 신고기한 https://tools.oiyo.net/ko/inheritance-gift-filing-deadline-calculator/ · 소멸시효 계산기 https://tools.oiyo.net/ko/statute-limitations-calculator/
  - MCP: `start_kr_law_intake`, `plan_kr_inheritance_gift_filing_deadline`
  - 스킬: oiyo-kr-law-guide
- **등기 비용·취득세** [계산·평가] (일반인도 씀): 취득세·등록면허세·국민주택채권 매입액을 계산해요.
  - 도구: 취득세 계산기 https://tools.oiyo.net/ko/acquisition-tax-calculator/ · 생애최초 취득세 https://tools.oiyo.net/ko/first-home-tax-calculator/ · 국민주택채권 할인 https://tools.oiyo.net/ko/car-bond-refund-calculator/
  - MCP: `calculate_kr_acquisition_tax`
- **이자·지연손해금·소송비용** [계산·평가] (일반인도 씀): 법정이율, 소송촉진법 지연이자, 인지대·송달료를 계산해요.
  - 도구: 법정이자 계산기 https://tools.oiyo.net/ko/legal-interest-calculator/ · 소송비용 계산기 https://tools.oiyo.net/ko/litigation-cost-calculator/
- **지급명령·공탁·등기 신청 서류** [서류·증빙] (자격사 업무와 맞닿음: 정보만): 청구 원인과 증거를 정리해요. 신청서 작성·제출 대리는 법무사 업무예요.
  - 도구: 등기·법원 서류 길잡이 https://tools.oiyo.net/ko/registry-court-law-guide/
  - 스킬: oiyo-kr-law-guide
- **보증금 회수와 전세 보증** [상담·설계] (일반인도 씀): 임차권등기명령, 보증보험 가입 가능 여부를 사실관계로 확인해요.
  - 도구: 전세보증 진단 https://tools.oiyo.net/ko/jeonse-guarantee-calculator/ · 전월세 전환 https://tools.oiyo.net/ko/jeonse-monthly-converter/
  - MCP: `diagnose_hug_guarantee`
- **채무 조정 선택지** [상담·설계] (일반인도 씀): 개인회생 변제액과 기간을 계산해 선택지를 비교해요.
  - 도구: 개인회생 계산기 https://tools.oiyo.net/ko/personal-rehabilitation-calculator/
- **법무사 업무 범위** [업무 범위·윤리]: 등기·공탁 신청 대리와 법원 제출 서류 작성은 법무사 업무예요(법무사법 제2조). 소송 대리는 변호사 업무예요(변호사법 제109조).
  - 도구: 법령 길잡이 6분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
- **인터넷등기소·전자소송** [전자 업무·데이터] (준비 중): 등기부 열람, 전자소송 제출 같은 전자 창구 실무예요.

## 보험계리사 (보험업법 제181조·제184조)

보험료·책임준비금 산출, 기초서류 확인, 지급여력 평가

- **보험업법과 기초서류 규제** [법령 해석]: 보험료·책임준비금 산출 기준, 기초서류 작성·변경 규정을 읽어요.
  - 도구: 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/
  - MCP: `search_kr_statutes`, `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
- **보험료 산출** [계산·평가] (일반인도 씀): 수지상등 원칙으로 예정위험률·예정이율·예정사업비를 조합해 보험료를 만들어요.
  - 도구: 보험료 계산 원리 https://tools.oiyo.net/ko/insurance-premium-basics/ · 보험료 계산기 https://tools.oiyo.net/ko/insurance-premium-calculator/
  - 스킬: oiyo-kr-law-guide
- **생명표·위험률** [계산·평가] (일반인도 씀): 나이별 사망률과 기대여명이 보험료와 연금 가치에 어떻게 들어가는지 봐요.
  - 도구: 기대수명 계산기 https://tools.oiyo.net/ko/life-expectancy-calculator/ · 보험료 계산 원리 https://tools.oiyo.net/ko/insurance-premium-basics/
- **이자론·현가** [계산·평가] (일반인도 씀): 할인율에 따른 현재가치와 복리 효과를 계산해요.
  - 도구: 현재가치 계산기 https://tools.oiyo.net/ko/present-value-calculator/ · 복리 계산기 https://tools.oiyo.net/ko/compound-interest-calculator/
  - MCP: `calculate_compound_interest`, `calculate_cagr`
- **책임준비금·IFRS 17** [계산·평가] (준비 중): 보험계약마진(CSM)과 위험조정을 측정하는 역량이에요.
- **지급여력(K-ICS)** [계산·평가] (준비 중): 요구자본과 가용자본으로 지급여력비율을 평가하는 역량이에요.
- **상품 구조 비교** [상담·설계] (일반인도 씀): 실손 세대별 자기부담률처럼 상품 구조가 소비자 부담을 어떻게 바꾸는지 설명해요.
  - 도구: 실손보험 세대 비교 https://tools.oiyo.net/ko/silson-insurance-generation-calculator/
- **계리 업무 범위** [업무 범위·윤리] (자격사 업무와 맞닿음: 정보만): 기초서류 확인, 책임준비금·잉여금 배분 계산은 보험계리사 업무예요(보험업법 제181조·제184조).
  - 도구: 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 손해사정사 (보험업법 제185조·제188조)

손해 발생 사실 확인, 손해액·보험금 사정, 손해사정서 작성

- **상법 보험편과 약관 해석** [법령 해석] (일반인도 씀): 고지의무 위반 해지(안 날부터 1개월, 계약 후 3년), 면책 사유, 약관 설명의무를 읽어요.
  - 도구: 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **손해액 산정** [계산·평가] (일반인도 씀): 일실수입, 휴업손해를 소득과 기간으로 계산해요.
  - 도구: 일실수입 계산기 https://tools.oiyo.net/ko/loss-of-income-calculator/ · 산재 휴업급여 https://tools.oiyo.net/ko/industrial-accident-leave-pay-calculator/
  - MCP: `calculate_kr_injury_leave_pay`
- **의료비·실손 보상 계산** [계산·평가] (일반인도 씀): 실손 세대별 자기부담, 본인부담상한제 환급을 계산해요.
  - 도구: 실손보험 세대 비교 https://tools.oiyo.net/ko/silson-insurance-generation-calculator/ · 본인부담상한 환급 https://tools.oiyo.net/ko/copay-cap-refund-calculator/
- **보험금 청구 시효와 지급 기한** [기한·절차] (일반인도 씀): 청구권 소멸시효 3년, 고지의무 해지 제한 기간을 날짜로 세요.
  - 도구: 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/ · 소멸시효 계산기 https://tools.oiyo.net/ko/statute-limitations-calculator/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **손해사정서 작성** [서류·증빙] (자격사 업무와 맞닿음: 정보만, 준비 중): 사고 사실·손해액·근거를 정리한 손해사정서는 손해사정사 업무예요(보험업법 제188조).
- **장해 등급·과실 비율** [상담·설계] (준비 중): 장해 평가 기준과 과실 비율이 보험금에 미치는 영향을 설명하는 역량이에요.
- **손해사정 업무 범위와 금지 행위** [업무 범위·윤리]: 손해사정은 손해사정사 업무이고, 보험회사와 합의·소송 대리는 변호사 업무예요(보험업법 제188조·제189조, 변호사법 제109조).
  - 도구: 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 보험설계사·대리점 (보험업법 제83조·제84조·제87조)

등록한 소속 회사 상품 모집, 설명·적합성 확인, 계약 관리

- **모집 규제와 금융소비자보호법** [법령 해석]: 설명의무·적합성 원칙·부당권유 금지(금소법 제17~21조), 모집 제한(보험업법 제83조)을 읽어요.
  - 도구: 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/ · 사은품 한도·승환 점검 https://tools.oiyo.net/ko/insurance-sales-compliance-checker/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **특별이익(사은품) 한도** [계산·평가]: 첫해 보험료 10%와 20만 원 중 적은 금액 안에서만 줄 수 있어요(보험업법 제98조).
  - 도구: 사은품 한도·승환 점검 https://tools.oiyo.net/ko/insurance-sales-compliance-checker/
  - 스킬: oiyo-kr-law-guide
- **승환계약·청약철회 기한** [기한·절차] (일반인도 씀): 기존 계약 소멸 전후 1개월(비교 안내 없으면 6개월), 청약철회 15일·30일을 날짜로 세요.
  - 도구: 사은품 한도·승환 점검 https://tools.oiyo.net/ko/insurance-sales-compliance-checker/ · 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **필요 보장 분석** [상담·설계] (일반인도 씀): 가계 현금흐름·은퇴 자금을 먼저 계산하고 보장 크기를 정해요.
  - 도구: 생애 재무 설계 https://tools.oiyo.net/ko/life-planning-calculator/ · 은퇴 자금 계산기 https://tools.oiyo.net/ko/fire-retirement-calculator/ · 연금 수령 최적화 https://tools.oiyo.net/ko/pension-optimizer-calculator/ · 보험료 계산 원리 https://tools.oiyo.net/ko/insurance-premium-basics/
- **실손·장기요양 구조 이해** [상담·설계] (일반인도 씀): 실손 세대별 차이, 장기요양 본인부담을 비교해 설명해요.
  - 도구: 실손보험 세대 비교 https://tools.oiyo.net/ko/silson-insurance-generation-calculator/ · 장기요양 본인부담 https://tools.oiyo.net/ko/long-term-care-copay-calculator/
  - MCP: `calculate_kr_long_term_care_copay`
  - 스킬: oiyo-kr-benefits-navigator
- **보험·연금 세제** [계산·평가] (일반인도 씀): 연금 수령 세금, ISA·연금저축 비교처럼 상품 선택에 붙는 세금을 계산해요.
  - 도구: 연금소득세 계산기 https://tools.oiyo.net/ko/pension-tax-calculator/ · ISA vs 연금저축 https://tools.oiyo.net/ko/isa-vs-pension-calculator/
- **설명·적합성 기록** [서류·증빙] (준비 중): 설명서 교부, 적합성 확인 결과를 계약마다 남기는 역량이에요.
- **등록·소속 범위** [업무 범위·윤리]: 등록한 설계사·대리점·중개사만 모집할 수 있고(보험업법 제83조), 소속 회사 상품만 다뤄요.
  - 도구: 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
