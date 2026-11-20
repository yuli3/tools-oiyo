# 전문 직업 역량 지도

GENERATED from tools-oiyo src/data/pro-competencies.ts. 기준일 2026-11-20. 웹: https://tools.oiyo.net/ko/pro-competency-map/

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
- **세무 프로그램 자료 연결** [전자 업무·데이터] (일반인도 씀): 통장·카드 내역을 분개 표로 바꿔 세무사랑·위하고·더존 등 프로그램의 엑셀 업로드 순서로 넘기고, 불공제·증빙·중복을 먼저 걸러요.
  - 도구: 장부 입력 자료 정리기 https://tools.oiyo.net/ko/bookkeeping-data-bridge/ · 전표 데이터 분석기 https://tools.oiyo.net/ko/journal-entry-analytics/
  - MCP: `analyze_journal_entries`
  - 스킬: kr-tax-advisor
- **세무대리 범위와 성실의무** [업무 범위·윤리]: 세무대리는 세무사 업무예요(세무사법 제2조). 개정 제20조 제3항(2026-06-24 시행)은 무자격자의 세무대리 암시 광고도 금지해요.
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
- **홈택스 전자신고·자료 조회** [전자 업무·데이터]: 간소화 자료, 전자세금계산서, 신고서 제출 화면을 다루는 실무 역량이에요.
  - 도구: 전자 창구 실무 길잡이 https://tools.oiyo.net/ko/eportal-practice-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide

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
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
- **감사 데이터 분석** [전자 업무·데이터]: 전표 전수 분석, 이상 거래 탐지 같은 데이터 기반 감사 기법이에요.
  - 도구: 전표 데이터 분석기 https://tools.oiyo.net/ko/journal-entry-analytics/
  - MCP: `analyze_journal_entries`
  - 스킬: oiyo-kr-law-guide

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
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
- **고용24·노동포털 전자 신고** [전자 업무·데이터]: 4대보험 취득·상실 신고, 진정 접수 같은 전자 창구 실무예요.
  - 도구: 전자 창구 실무 길잡이 https://tools.oiyo.net/ko/eportal-practice-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide

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
- **인허가·민원 서류** [서류·증빙] (일반인도 씀, 자격사 업무와 맞닿음: 정보만): 영업신고·허가 신청에 필요한 서류와 요건을 정리해요. 작성·제출 대행은 행정사 업무예요.
  - 도구: 영업신고 서류 점검표 https://tools.oiyo.net/ko/permit-document-checklist/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide
- **출입국·체류 자격** [법령 해석] (일반인도 씀): 체류자격 변경·연장, 사증 종류별 요건을 다뤄요.
  - 도구: 체류자격·외국인등록 기한 길잡이 https://tools.oiyo.net/ko/visa-stay-status-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide
- **건축·토지 규제 수치** [계산·평가] (일반인도 씀): 건폐율·용적률처럼 인허가 판단에 쓰는 수치를 계산해요.
  - 도구: 건폐율·용적률 https://tools.oiyo.net/ko/building-coverage-floor-area-ratio-calculator/
- **과태료·이행강제금 감경** [계산·평가] (일반인도 씀): 의견제출 기한 안 자진납부 감경과 늦게 낼 때 붙는 가산금을 계산해요. 이행강제금은 개별 법률 기준을 따라요.
  - 도구: 과태료 감경·가산금 계산기 https://tools.oiyo.net/ko/fine-reduction-calculator/
  - MCP: `calculate_kr_fine_reduction`
  - 스킬: oiyo-kr-law-guide
- **정보공개청구와 사실조사** [상담·설계] (일반인도 씀): 필요한 행정 정보를 청구하고, 비공개 결정에 이의신청하는 순서를 안내해요.
  - 도구: 행정 절차 길잡이 https://tools.oiyo.net/ko/administrative-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **행정사 업무 범위** [업무 범위·윤리]: 행정기관 제출 서류 작성·제출 대행은 행정사 업무예요(행정사법 제2조·제3조).
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
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
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
- **인터넷등기소·전자소송** [전자 업무·데이터]: 등기부 열람, 전자소송 제출 같은 전자 창구 실무예요.
  - 도구: 전자 창구 실무 길잡이 https://tools.oiyo.net/ko/eportal-practice-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide

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
- **책임준비금·IFRS 17** [계산·평가]: 보험계약마진(CSM)과 위험조정을 측정하는 역량이에요.
  - 도구: IFRS 17 CSM 원리 https://tools.oiyo.net/ko/ifrs17-csm-simulator/
  - MCP: `simulate_ifrs17_csm`
  - 스킬: oiyo-kr-law-guide
- **지급여력(K-ICS)** [계산·평가]: 요구자본과 가용자본으로 지급여력비율을 평가하는 역량이에요.
  - 도구: 지급여력비율(K-ICS) 원리 https://tools.oiyo.net/ko/kics-solvency-ratio-calculator/
  - MCP: `calculate_kics_ratio`
  - 스킬: oiyo-kr-law-guide
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
- **손해사정서 작성** [서류·증빙] (일반인도 씀, 자격사 업무와 맞닿음: 정보만): 사고 사실·손해액·근거를 정리한 손해사정서는 손해사정사 업무예요(보험업법 제188조).
  - 도구: 전문가 서류 읽는 법 https://tools.oiyo.net/ko/pro-document-reading-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide
- **장해 등급·과실 비율** [상담·설계] (일반인도 씀): 장해 평가 기준과 과실 비율이 보험금에 미치는 영향을 설명하는 역량이에요.
  - 도구: 장해·과실 보험금 계산기 https://tools.oiyo.net/ko/disability-fault-claim-calculator/
  - MCP: `calculate_insurance_claim_payout`
  - 스킬: oiyo-kr-law-guide
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
- **설명·적합성 기록** [서류·증빙]: 설명서 교부, 적합성 확인 결과를 계약마다 남기는 역량이에요.
  - 도구: 설명·적합성 기록 도우미 https://tools.oiyo.net/ko/insurance-explanation-record/
  - MCP: `check_insurance_explanation_record`
  - 스킬: oiyo-kr-law-guide
- **등록·소속 범위** [업무 범위·윤리]: 등록한 설계사·대리점·중개사만 모집할 수 있고(보험업법 제83조), 소속 회사 상품만 다뤄요.
  - 도구: 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 관세사 (관세사법 제2조·제3조)

수출입 통관 신고 대리, 관세 불복 대리, 품목분류·관세평가·원산지 자문

- **관세법·FTA 원산지 규정** [법령 해석] (일반인도 씀): 신고납부·보정·경정, 소액 면세, FTA 원산지 결정 기준을 읽어요.
  - 도구: 관세·통관 법령 길잡이 https://tools.oiyo.net/ko/customs-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **납부·보정·경정·불복 기한** [기한·절차] (일반인도 씀, 자격사 업무와 맞닿음: 정보만): 수리일부터 15일 납부, 6개월 보정, 5년 경정청구, 90일 불복을 날짜로 세요.
  - 도구: 관세·통관 법령 길잡이 https://tools.oiyo.net/ko/customs-law-guide/
  - MCP: `start_kr_law_intake`, `check_kr_business_day`
  - 스킬: oiyo-kr-law-guide
- **해외직구 면세 판정** [상담·설계] (일반인도 씀): 150달러(미국발 200달러), 합산과세, 판매용 여부를 확인해요.
  - 도구: 관세·통관 법령 길잡이 https://tools.oiyo.net/ko/customs-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **과세가격·환율 환산** [계산·평가] (일반인도 씀): 물품가격과 운임을 과세환율로 원화 환산해요.
  - 도구: 환율 계산기 https://tools.oiyo.net/ko/currency-converter/ · 환전 수수료 계산기 https://tools.oiyo.net/ko/foreign-exchange-fee-calculator/
- **품목분류(HS)와 세율** [계산·평가] (일반인도 씀, 자격사 업무와 맞닿음: 정보만): HS 코드를 정하고 기본·FTA 세율을 비교하는 역량이에요.
  - 도구: 수입 관세·FTA 비교 계산기 https://tools.oiyo.net/ko/import-duty-fta-calculator/
  - MCP: `calculate_kr_import_duty`
  - 스킬: oiyo-kr-law-guide
- **수입신고·원산지증명 서류** [서류·증빙] (자격사 업무와 맞닿음: 정보만): 인보이스·패킹리스트·원산지증명서를 맞춰 신고해요. 신고 대리는 관세사 업무예요.
  - 도구: 전문가 서류 읽는 법 https://tools.oiyo.net/ko/pro-document-reading-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide
- **유니패스 전자 통관** [전자 업무·데이터]: 통관 진행 조회와 전자 신고 실무예요.
  - 도구: 전자 창구 실무 길잡이 https://tools.oiyo.net/ko/eportal-practice-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide
- **통관업 범위와 명칭 제한** [업무 범위·윤리]: 관세사·관세법인·통관취급법인만 남의 의뢰로 통관업을 하고(관세사법 제3조), 유사명칭을 쓸 수 없어요(제25조).
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 변리사 (변리사법 제2조·제21조)

특허·상표·디자인 출원과 심판 대리, 침해 감정, 심결취소소송 대리

- **특허법·상표법·디자인보호법** [법령 해석] (일반인도 씀): 신규성·진보성, 상표 식별력·유사 판단 기준을 읽어요.
  - 도구: 특허·상표 법령 길잡이 https://tools.oiyo.net/ko/ip-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **공지예외·거절 대응 기한** [기한·절차] (일반인도 씀): 공지예외 12개월, 의견서 제출기간, 거절결정 불복 3개월, 연차료 납부를 관리해요.
  - 도구: 특허·상표 법령 길잡이 https://tools.oiyo.net/ko/ip-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **선행기술·등록상표 조사** [상담·설계] (일반인도 씀): 출원 전에 키프리스로 같은 기술·비슷한 상표를 찾아 가능성을 가늠해요.
  - 도구: 특허·상표 법령 길잡이 https://tools.oiyo.net/ko/ip-law-guide/
- **명세서·청구범위 작성** [서류·증빙] (자격사 업무와 맞닿음: 정보만): 권리 범위를 정하는 청구범위를 쓰는 역량이에요. 출원 대리는 변리사 업무예요.
  - 도구: 전문가 서류 읽는 법 https://tools.oiyo.net/ko/pro-document-reading-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide
- **지식재산 가치평가** [계산·평가]: 특허의 미래 현금흐름을 할인해 가치를 추정해요.
  - 도구: DCF 기업가치 https://tools.oiyo.net/ko/dcf-valuation-calculator/ · 현재가치 계산기 https://tools.oiyo.net/ko/present-value-calculator/
  - MCP: `calculate_dcf_valuation`
- **침해 경고장 대응** [상담·설계] (일반인도 씀, 자격사 업무와 맞닿음: 정보만): 권리 유효성·침해 여부·선사용 여부를 사실로 나눠 대응 순서를 정해요.
  - 도구: 특허·상표 법령 길잡이 https://tools.oiyo.net/ko/ip-law-guide/
  - 스킬: oiyo-kr-law-guide
- **특허로 전자출원** [전자 업무·데이터]: 전자출원과 수수료 납부, 심사 진행 조회 실무예요.
  - 도구: 전자 창구 실무 길잡이 https://tools.oiyo.net/ko/eportal-practice-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide
- **변리 업무 범위와 명칭 제한** [업무 범위·윤리]: 변리사가 아니면 특허 등 대리를 업으로 할 수 없고(변리사법 제21조), 유사명칭을 쓸 수 없어요(제22조).
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 감정평가사 (감정평가법 제10조)

공시지가 평가, 보상·소송·경매·담보 감정평가, 감정 상담

- **감정평가법·토지보상법·부동산공시법** [법령 해석] (일반인도 씀): 감정평가 기준, 보상 원칙, 공시가격 체계를 읽어요.
  - 도구: 감정평가·보상 법령 길잡이 https://tools.oiyo.net/ko/appraisal-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **보상금·공시가격 다툼 기한** [기한·절차] (일반인도 씀): 재결 이의신청 30일, 소송 90일(이의재결 뒤 60일), 공시가격 이의신청 30일을 세요.
  - 도구: 감정평가·보상 법령 길잡이 https://tools.oiyo.net/ko/appraisal-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **수익환원법** [계산·평가] (일반인도 씀): 임대수익과 환원율로 수익 부동산 가치를 구해요.
  - 도구: 임대수익률 계산기 https://tools.oiyo.net/ko/rental-yield-calculator/ · 현재가치 계산기 https://tools.oiyo.net/ko/present-value-calculator/
- **감정가와 세금** [계산·평가] (일반인도 씀): 상속·증여 신고에서 감정가와 공시가격의 세금 차이를 비교해요.
  - 도구: 감정가 vs 공시가격 https://tools.oiyo.net/ko/inherited-house-appraisal-vs-official-price-calculator/ · 상속세 계산기 https://tools.oiyo.net/ko/inheritance-tax-calculator/
  - MCP: `compare_kr_inherited_house_valuation`, `calculate_inheritance_gift_tax`
- **정비사업 권리가액** [계산·평가] (일반인도 씀): 재건축·재개발 종전자산 평가와 분담금 구조를 이해해요.
  - 도구: 재건축 수익 계산 https://tools.oiyo.net/ko/reconstruction-profit/ · 입주권 vs 분양권 세금 https://tools.oiyo.net/ko/redevelopment-ticket-vs-presale-tax-calculator/
  - MCP: `compare_kr_ticket_vs_presale_tax`
- **감정평가서 작성** [서류·증빙] (일반인도 씀, 자격사 업무와 맞닿음: 정보만): 가격 결정 근거를 담은 감정평가서는 감정평가사 업무예요.
  - 도구: 전문가 서류 읽는 법 https://tools.oiyo.net/ko/pro-document-reading-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide
- **감정평가 업무 범위와 명칭 제한** [업무 범위·윤리]: 감정평가는 사무소·법인 소속 감정평가사가 하고(감정평가법 제21조·제29조), 유사명칭을 쓸 수 없어요(제22조).
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 공인중개사 (공인중개사법 제9조·제25조)

등록 사무소에서 매매·임대차 중개, 확인·설명, 거래계약서 작성

- **공인중개사법·주택임대차보호법** [법령 해석] (일반인도 씀): 확인·설명 의무, 금지행위, 대항력·우선변제를 읽어요.
  - 도구: 부동산 거래·중개 법령 길잡이 https://tools.oiyo.net/ko/realty-brokerage-law-guide/ · 등기·법원 서류 길잡이 https://tools.oiyo.net/ko/registry-court-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **중개보수 계산** [계산·평가] (일반인도 씀): 거래 종류·금액별 상한요율로 보수를 계산해요.
  - 도구: 중개보수 계산기 https://tools.oiyo.net/ko/brokerage-calculator/ · 부동산 거래·중개 법령 길잡이 https://tools.oiyo.net/ko/realty-brokerage-law-guide/
- **거래·임대차 신고 기한** [기한·절차] (일반인도 씀): 매매 거래신고와 주택 임대차 신고를 계약일부터 30일 안에 해요.
  - 도구: 부동산 거래·중개 법령 길잡이 https://tools.oiyo.net/ko/realty-brokerage-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **전세 위험 점검** [상담·설계] (일반인도 씀): 보증금 대비 시세·선순위, 보증보험 가입 가능성을 확인해요.
  - 도구: 전세보증 진단 https://tools.oiyo.net/ko/jeonse-guarantee-calculator/ · 전세 vs 매매 https://tools.oiyo.net/ko/jeonse-vs-buy-calculator/ · 전월세 전환 https://tools.oiyo.net/ko/jeonse-monthly-converter/
  - MCP: `diagnose_hug_guarantee`
- **거래 세금 안내** [계산·평가] (일반인도 씀): 취득세·양도세·보유세를 거래 전에 가늠해요.
  - 도구: 취득세 계산기 https://tools.oiyo.net/ko/acquisition-tax-calculator/ · 양도소득세 계산기 https://tools.oiyo.net/ko/capital-gains-tax-calculator/ · 재산세 계산기 https://tools.oiyo.net/ko/property-tax-calculator/
  - MCP: `calculate_kr_acquisition_tax`, `calculate_capital_gains_tax`, `calculate_kr_property_tax`
- **확인·설명서와 계약서** [서류·증빙] (일반인도 씀, 자격사 업무와 맞닿음: 정보만): 등기부·건축물대장을 확인해 확인·설명서를 쓰는 역량이에요. 중개는 등록한 개업공인중개사 업무예요.
  - 도구: 전문가 서류 읽는 법 https://tools.oiyo.net/ko/pro-document-reading-guide/
  - MCP: `get_kr_practice_guide`
  - 스킬: oiyo-kr-law-guide
- **등록과 금지행위** [업무 범위·윤리]: 개설등록한 사람만 중개하고(공인중개사법 제9조), 초과 보수·직접거래·쌍방대리가 금지돼요(제33조).
  - 도구: 부동산 거래·중개 법령 길잡이 https://tools.oiyo.net/ko/realty-brokerage-law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 건축사 (건축사법 제19조, 건축법 제23조)

건축물 설계·공사감리, 건축허가·사용승인 등 행정 절차 대행, 건축물 조사·감정

- **건축법·용도변경 기준** [법령 해석] (일반인도 씀): 허가·신고·용도변경(시설군)·사용승인 기준을 읽어요.
  - 도구: 건축·인허가 법령 길잡이 https://tools.oiyo.net/ko/building-permit-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **건폐율·용적률 계산** [계산·평가] (일반인도 씀): 대지면적과 바닥면적으로 증축 여유를 계산해요.
  - 도구: 건폐율·용적률 https://tools.oiyo.net/ko/building-coverage-floor-area-ratio-calculator/
- **착공·불복 기한** [기한·절차] (일반인도 씀): 허가 2년·신고 1년 착공 기한, 시정명령·이행강제금 행정심판 90일을 챙겨요.
  - 도구: 건축·인허가 법령 길잡이 https://tools.oiyo.net/ko/building-permit-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **설계도서 작성** [서류·증빙] (자격사 업무와 맞닿음: 정보만, 준비 중): 허가·신고 대상 건축물의 설계는 건축사 업무예요(건축법 제23조).
- **세움터 인허가 전자 신청** [전자 업무·데이터] (일반인도 씀): 건축물대장 열람과 인허가 신청을 세움터에서 해요.
  - 도구: 영업신고 서류 점검표 https://tools.oiyo.net/ko/permit-document-checklist/ · 전자 창구 실무 길잡이 https://tools.oiyo.net/ko/eportal-practice-guide/
- **위반건축물 상담** [상담·설계] (일반인도 씀): 무단 증축·용도변경을 원상복구나 추인으로 바로잡는 길을 정리해요.
  - 도구: 건축·인허가 법령 길잡이 https://tools.oiyo.net/ko/building-permit-law-guide/ · 과태료 감경·가산금 계산기 https://tools.oiyo.net/ko/fine-reduction-calculator/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **설계 독점과 감리 독립** [업무 범위·윤리]: 허가 대상 설계는 건축사만 하고, 감리는 시공자와 독립해 해요.
  - 도구: 건축·인허가 법령 길잡이 https://tools.oiyo.net/ko/building-permit-law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 의료인·약사 (의료법 제2조·제27조, 약사법 제44조)

진료·진단서 발급, 진료기록 관리·열람 제공, 조제·의약품 판매와 복약 설명

- **의료법·약사법 기본** [법령 해석] (일반인도 씀): 진단서·기록 열람·무면허 금지·의약품 판매 제한을 읽어요.
  - 도구: 보건·의료 이용 길잡이 https://tools.oiyo.net/ko/medical-care-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **진료·조제** [상담·설계] (자격사 업무와 맞닿음: 정보만, 준비 중): 진단·치료·조제는 의료인·약사의 면허 업무예요.
- **진료기록 관리와 사본 발급** [서류·증빙] (일반인도 씀): 보존기간(진료기록부 10년·처방전 2년)과 본인·가족·대리인 발급 요건을 챙겨요.
  - 도구: 보건·의료 이용 길잡이 https://tools.oiyo.net/ko/medical-care-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **의료분쟁 조정 기한** [기한·절차] (일반인도 씀): 안 날부터 3년·진료 끝난 날부터 10년 안에 조정을 신청해요.
  - 도구: 보건·의료 이용 길잡이 https://tools.oiyo.net/ko/medical-care-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **진료비·보험료·의료비 공제** [계산·평가] (일반인도 씀): 비급여 확인 요청, 건강보험료, 의료비 세액공제를 계산해요.
  - 도구: 건강보험료 계산기 https://tools.oiyo.net/ko/health-insurance-calculator/ · 의료비 세액공제 https://tools.oiyo.net/ko/medical-expense-tax-credit-calculator/
  - MCP: `calculate_health_insurance`, `calculate_kr_long_term_care_copay`
- **실손·장해 보험금 연결** [상담·설계] (일반인도 씀): 진단서·기록으로 보험금 청구와 장해 지급률을 확인해요.
  - 도구: 장해·과실 보험금 계산기 https://tools.oiyo.net/ko/disability-fault-claim-calculator/ · 보험 법령 길잡이 https://tools.oiyo.net/ko/insurance-law-guide/
  - MCP: `calculate_insurance_claim_payout`
- **무면허·환자 유인 금지** [업무 범위·윤리]: 의료인이 아니면 의료행위를 할 수 없고, 돈을 주고 환자를 소개·유인할 수 없어요(의료법 제27조).
  - 도구: 보건·의료 이용 길잡이 https://tools.oiyo.net/ko/medical-care-law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 변호사(가사) (변호사법 제3조·제109조)

이혼·양육비·재산분할 소송과 조정 대리, 가사 법률상담(서류 작성은 법무사도)

- **민법 친족편·가사소송법** [법령 해석] (일반인도 씀): 협의·재판상 이혼, 양육, 재산분할, 이행명령·감치를 읽어요.
  - 도구: 가사·이혼 법령 길잡이 https://tools.oiyo.net/ko/divorce-family-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **이혼 절차 기한** [기한·절차] (일반인도 씀): 숙려 3개월·1개월, 이혼신고 3개월, 재산분할 2년, 이혼청구 6개월·2년을 챙겨요.
  - 도구: 가사·이혼 법령 길잡이 https://tools.oiyo.net/ko/divorce-family-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **양육비 이행 확보** [상담·설계] (일반인도 씀): 이행명령 → 감치 → 양육비이행관리원 지원 순서를 안내해요.
  - 도구: 가사·이혼 법령 길잡이 https://tools.oiyo.net/ko/divorce-family-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **재산분할 세금** [계산·평가] (일반인도 씀): 분할로 넘기는 집의 취득세·양도세, 증여로 보는 경우를 가늠해요.
  - 도구: 취득세 계산기 https://tools.oiyo.net/ko/acquisition-tax-calculator/ · 양도소득세 계산기 https://tools.oiyo.net/ko/capital-gains-tax-calculator/ · 증여세 계산기 https://tools.oiyo.net/ko/gift-tax-calculator/
  - MCP: `calculate_kr_acquisition_tax`, `calculate_capital_gains_tax`, `calculate_inheritance_gift_tax`
- **소장·조정 신청서와 대리** [서류·증빙] (자격사 업무와 맞닿음: 정보만): 가사 소송 대리는 변호사, 가정법원 제출 서류 작성은 법무사도 해요.
  - 도구: 등기·법원 서류 길잡이 https://tools.oiyo.net/ko/registry-court-law-guide/
- **전자소송·가족관계 증명** [전자 업무·데이터] (일반인도 씀): 전자소송과 가족관계증명서 발급을 온라인으로 해요.
  - 도구: 전자 창구 실무 길잡이 https://tools.oiyo.net/ko/eportal-practice-guide/
  - MCP: `get_kr_practice_guide`
- **비변호사 법률사무 금지** [업무 범위·윤리]: 대가를 받고 이혼 상담·서류 작성·대리를 하면 변호사법 위반이에요(제109조).
  - 도구: 가사·이혼 법령 길잡이 https://tools.oiyo.net/ko/divorce-family-law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 사회복지사 (사회복지사업법 제11조)

복지 상담과 사례관리, 급여 신청 연계(신청 서류 대행은 행정사)

- **기초생활보장법·긴급복지지원법** [법령 해석] (일반인도 씀): 신청권자, 결정 30일, 이의신청 90일, 긴급지원 선지원을 읽어요.
  - 도구: 복지급여 길잡이 https://tools.oiyo.net/ko/welfare-benefit-law-guide/
  - MCP: `search_kr_statutes`
  - 스킬: oiyo-kr-law-guide
- **받을 수 있는 지원 찾기** [상담·설계] (일반인도 씀): 나이·소득·가구로 받을 수 있는 급여와 지원금을 찾아요.
  - 도구: 복지 혜택 찾기 https://tools.oiyo.net/ko/benefit-finder/ · 생활 지원금·노동권 도구 https://tools.oiyo.net/ko/benefit-rights-toolkit/ · 청년 월세 지원 확인 https://tools.oiyo.net/ko/youth-monthly-rent-support-checker/
  - 스킬: oiyo-kr-benefits-navigator
- **근로·자녀장려금과 실업급여** [계산·평가] (일반인도 씀): 장려금과 실업급여를 계산해 생계 계획에 넣어요.
  - 도구: 근로·자녀장려금 계산기 https://tools.oiyo.net/ko/work-child-incentive-calculator/ · 실업급여 계산기 https://tools.oiyo.net/ko/unemployment-benefits-calculator/
  - MCP: `calculate_unemployment_benefits`
  - 스킬: oiyo-kr-benefits-navigator
- **결정·이의신청 기한** [기한·절차] (일반인도 씀): 신청일부터 30일, 통지일부터 90일을 챙겨요.
  - 도구: 복지급여 길잡이 https://tools.oiyo.net/ko/welfare-benefit-law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide
- **사례관리 기록** [서류·증빙] (준비 중): 상담·욕구 조사·서비스 연계를 기록해요.
- **복지로·사회보장정보시스템** [전자 업무·데이터] (일반인도 씀): 온라인 신청과 모의계산을 안내해요.
  - 도구: 복지급여 길잡이 https://tools.oiyo.net/ko/welfare-benefit-law-guide/
- **신청 대행의 경계** [업무 범위·윤리]: 복지 상담은 누구나 돕지만, 대가를 받고 신청 서류를 대행하는 일은 행정사 업무예요(행정사법 제3조).
  - 도구: 복지급여 길잡이 https://tools.oiyo.net/ko/welfare-benefit-law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide

## 경영지도사 (중소기업진흥에 관한 법률(지도사))

중소기업 경영 진단·지도: 전략·마케팅·재무·인사·생산 관리 자문(독점 업무는 아님)

- **전략 진단** [상담·설계] (일반인도 씀): SWOT·BCG·포지셔닝으로 현재 위치와 선택지를 정리해요.
  - 도구: SWOT 분석 https://tools.oiyo.net/ko/swot-analysis/ · BCG 매트릭스 https://tools.oiyo.net/ko/bcg-matrix/ · 포지셔닝 맵 https://tools.oiyo.net/ko/positioning-map/
  - MCP: `analyze_swot`
  - 스킬: oiyo-business-strategist
- **의사결정 분석** [계산·평가] (일반인도 씀): 가중 의사결정표·의사결정 트리로 대안을 숫자로 비교해요.
  - 도구: 가중 의사결정표 https://tools.oiyo.net/ko/priority-decision-matrix/ · 의사결정 트리 https://tools.oiyo.net/ko/decision-tree-calculator/
  - 스킬: oiyo-business-strategist
- **단위경제·런웨이·시장 실험** [계산·평가] (일반인도 씀): LTV/CAC, 남은 현금 개월 수, 시장 테스트 손익을 계산해요.
  - 도구: 단위경제·런웨이 https://tools.oiyo.net/ko/unit-economics-runway-calculator/ · 시장 실험 손익 https://tools.oiyo.net/ko/market-test-calculator/
  - MCP: `calculate_unit_economics_runway`, `analyze_market_test`
  - 스킬: oiyo-business-strategist
- **운영 문제 해결** [상담·설계] (일반인도 씀): 캠페인 품절, 품질 회수, 대체 원료, 대형 수주, 판매장려금, 인수 통합을 점검해요.
  - 도구: 캠페인 품절 대비 https://tools.oiyo.net/ko/campaign-supply-planner/ · 품질 회수 계획 https://tools.oiyo.net/ko/quality-recovery-planner/ · 대체 원료 검토 https://tools.oiyo.net/ko/alternative-material-review/ · 대형 수주 생산 점검 https://tools.oiyo.net/ko/big-order-capacity-check/ · 판매장려금 점검 https://tools.oiyo.net/ko/sales-rebate-checker/ · 인수 통합 점검 https://tools.oiyo.net/ko/acquisition-integration-check/ · 인플루언서 계약 계산 https://tools.oiyo.net/ko/influencer-deal-calculator/
  - MCP: `plan_campaign_supply`, `plan_quality_recovery`, `compare_alternative_materials`, `check_big_order_capacity`, `check_sales_rebates`
  - 스킬: oiyo-business-strategist
- **일정·마일스톤 관리** [기한·절차] (일반인도 씀): CPM으로 핵심 경로를 찾고 신고·납부 일정을 사업 일정에 얹어요.
  - 도구: 프로젝트 일정(CPM) https://tools.oiyo.net/ko/project-timeline-planner/ · 세무 일정 https://tools.oiyo.net/ko/tax-calendar/
  - MCP: `get_kr_business_tax_calendar`
  - 스킬: oiyo-business-strategist
- **사업자 필수 의무 점검** [서류·증빙] (일반인도 씀): 창업·고용·신고 단계별로 반드시 할 것과 하지 말 것을 챙겨요.
  - 도구: 사업자 필수 체크리스트 https://tools.oiyo.net/ko/business-must-do-checklist/ · 경영 도구 모음 https://tools.oiyo.net/ko/business-toolkit/
  - 스킬: oiyo-business-strategist
- **경영 문제의 법령 연결** [법령 해석] (일반인도 씀): 운영 문제가 세금·노무·행정·보험 중 어디에 걸리는지 찾아 해당 길잡이로 넘겨요.
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `start_kr_law_intake`
  - 스킬: oiyo-kr-law-guide, oiyo-business-strategist
- **자문 범위** [업무 범위·윤리]: 경영 지도는 독점 업무가 아니지만, 세무대리·노무 대리·법률 사무는 해당 자격사에게 넘겨요.
  - 도구: 법령 길잡이 15분야 https://tools.oiyo.net/ko/law-guide/
  - MCP: `get_kr_professional_scope`
  - 스킬: oiyo-kr-law-guide
