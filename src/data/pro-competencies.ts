// 전문 직업 역량 지도 (2026-11-17). 세운 요청: "각 전문가들에게 필요한 역량들을 리스트화·분류·카테고리화, 도구와 스킬 등을 연결".
// 직업 13개(11-17 관세사·변리사·감정평가사·공인중개사·경영지도사 추가) × 역량 분류 7개. 역량마다 tools.oiyo.net 도구, Claude 스킬(github.com/yuli3/oiyo-skills), MCP 도구를 붙이고,
// 아직 도구가 없는 역량은 gap으로 남겨 다음 제작 목록이 되게 해요.
// 이름 경계: 우리는 자격사가 아니에요. 직업 이름은 "누가 이 역량을 쓰는지" 설명할 때만 쓰고, 도구·페이지 이름에는 넣지 않아요.
// exclusive: 그 자격사만 할 수 있는 업무와 맞닿은 역량. 도구는 원리·정보만 주고 대리·작성은 하지 않아요.
// 검증: src/data/pro-competencies.test.ts (도구 slug가 실제 페이지인지, 스킬 폴더가 있는지, MCP 이름이 목록에 있는지).
import type { DomainId } from "../lib/kr-expert-guide-2026";

export type CategoryId = "law" | "calc" | "deadline" | "docs" | "consult" | "ethics" | "digital";
export type JobId = "tax" | "cpa" | "labor" | "admin" | "court" | "actuary" | "adjuster" | "agent" | "customs" | "patent" | "appraiser" | "broker" | "architect" | "medic" | "family" | "social" | "mgmt";
export type Audience = "pro" | "public";

export const COMPETENCY_AS_OF = "2026-11-20";

export const CATEGORIES: { id: CategoryId; name: string; desc: string }[] = [
  { id: "law", name: "법령 해석", desc: "근거 조문을 찾고, 개정과 시행일을 따라가며, 사실관계에 맞게 읽는 힘" },
  { id: "calc", name: "계산·평가", desc: "세액·임금·손해액·보험료·기업가치처럼 결론이 숫자로 나오는 일" },
  { id: "deadline", name: "기한·절차", desc: "신고·신청·불복·청구 기한을 세고, 절차 순서를 놓치지 않는 일" },
  { id: "docs", name: "서류·증빙", desc: "어떤 사실을 어떤 서류로 증명할지 정리하고 기록을 남기는 일" },
  { id: "consult", name: "상담·설계", desc: "결론을 바꾸는 질문을 먼저 하고, 선택지를 비교해 설명하는 일" },
  { id: "ethics", name: "업무 범위·윤리", desc: "자격법이 정한 업무 범위, 금지 행위, 성실·비밀유지 의무" },
  { id: "digital", name: "전자 업무·데이터", desc: "홈택스·전자소송·인터넷등기소 같은 전자 창구와 데이터 분석·자동화" },
];

/** domain: 법령 길잡이 분야(없으면 법령 길잡이 밖의 직업, 예: 경영지도사는 경영 도구와 이어져요). */
export const JOBS: { id: JobId; name: string; domain?: DomainId; act: string; summary: string }[] = [
  { id: "tax", name: "세무사", domain: "tax", act: "세무사법 제2조", summary: "세금 신고·불복 대리, 세무 상담, 장부 작성 대행" },
  { id: "cpa", name: "공인회계사", domain: "accounting", act: "공인회계사법 제2조", summary: "회계감사, 재무 자문, 기업가치 평가, 세무 대리" },
  { id: "labor", name: "공인노무사", domain: "labor", act: "공인노무사법 제2조", summary: "노동 사건 대리(구제신청 등), 노무 서류 작성, 노무관리진단, 노동 상담" },
  { id: "admin", name: "행정사", domain: "admin", act: "행정사법 제2조", summary: "행정기관 제출 서류 작성·제출 대행, 인허가·체류 민원, 행정심판 관련 사실조사" },
  { id: "court", name: "법무사", domain: "court", act: "법무사법 제2조", summary: "등기·공탁 신청 대리, 법원·검찰 제출 서류 작성" },
  { id: "actuary", name: "보험계리사", domain: "insurance", act: "보험업법 제181조·제184조", summary: "보험료·책임준비금 산출, 기초서류 확인, 지급여력 평가" },
  { id: "adjuster", name: "손해사정사", domain: "insurance", act: "보험업법 제185조·제188조", summary: "손해 발생 사실 확인, 손해액·보험금 사정, 손해사정서 작성" },
  { id: "agent", name: "보험설계사·대리점", domain: "insurance", act: "보험업법 제83조·제84조·제87조", summary: "등록한 소속 회사 상품 모집, 설명·적합성 확인, 계약 관리" },
  { id: "customs", name: "관세사", domain: "customs", act: "관세사법 제2조·제3조", summary: "수출입 통관 신고 대리, 관세 불복 대리, 품목분류·관세평가·원산지 자문" },
  { id: "patent", name: "변리사", domain: "ip", act: "변리사법 제2조·제21조", summary: "특허·상표·디자인 출원과 심판 대리, 침해 감정, 심결취소소송 대리" },
  { id: "appraiser", name: "감정평가사", domain: "appraisal", act: "감정평가법 제10조", summary: "공시지가 평가, 보상·소송·경매·담보 감정평가, 감정 상담" },
  { id: "broker", name: "공인중개사", domain: "realty", act: "공인중개사법 제9조·제25조", summary: "등록 사무소에서 매매·임대차 중개, 확인·설명, 거래계약서 작성" },
  { id: "architect", name: "건축사", domain: "building", act: "건축사법 제19조, 건축법 제23조", summary: "건축물 설계·공사감리, 건축허가·사용승인 등 행정 절차 대행, 건축물 조사·감정" },
  { id: "medic", name: "의료인·약사", domain: "health", act: "의료법 제2조·제27조, 약사법 제44조", summary: "진료·진단서 발급, 진료기록 관리·열람 제공, 조제·의약품 판매와 복약 설명" },
  { id: "family", name: "변호사(가사)", domain: "family", act: "변호사법 제3조·제109조", summary: "이혼·양육비·재산분할 소송과 조정 대리, 가사 법률상담(서류 작성은 법무사도)" },
  { id: "social", name: "사회복지사", domain: "welfare", act: "사회복지사업법 제11조", summary: "복지 상담과 사례관리, 급여 신청 연계(신청 서류 대행은 행정사)" },
  { id: "mgmt", name: "경영지도사", act: "중소기업진흥에 관한 법률(지도사)", summary: "중소기업 경영 진단·지도: 전략·마케팅·재무·인사·생산 관리 자문(독점 업무는 아님)" },
];

export type Competency = {
  id: string;
  job: JobId;
  cat: CategoryId;
  name: string;
  desc: string;
  /** 이 역량이 일반인 문제와도 겹치는지(같은 도구를 일반인도 씀). */
  audience: Audience[];
  exclusive?: boolean;
  tools: string[];
  skills: string[];
  mcp: string[];
};

const c = (id: string, job: JobId, cat: CategoryId, name: string, desc: string, links: { tools?: string[]; skills?: string[]; mcp?: string[]; audience?: Audience[]; exclusive?: boolean } = {}): Competency => ({
  id, job, cat, name, desc,
  audience: links.audience ?? ["pro"],
  exclusive: links.exclusive,
  tools: links.tools ?? [],
  skills: links.skills ?? [],
  mcp: links.mcp ?? [],
});

const LAW = "oiyo-kr-law-guide";
const ADV = "kr-tax-advisor";
const BEN = "oiyo-kr-benefits-navigator";
const BIZ = "oiyo-business-strategist";

export const COMPETENCIES: Competency[] = [
  // 세무사
  c("tax-law", "tax", "law", "세법 체계와 개정 추적", "국세기본법·소득세법·법인세법·부가가치세법·상증법의 구조, 매년 12월 개정과 시행일을 따라가요.", { tools: ["tax-law-guide", "tax-formula-explorer"], skills: [LAW, ADV], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("tax-income", "tax", "calc", "소득·양도·상속·증여 세액 계산", "과세표준 → 세율 → 공제·감면 순서로 세액을 구하고, 같은 사실에서 결론이 갈리는 지점을 찾아요.", { tools: ["comprehensive-income-tax-calculator", "freelancer-tax-calculator", "capital-gains-tax-calculator", "inheritance-tax-calculator", "gift-tax-calculator"], skills: [ADV], mcp: ["calculate_kr_freelancer_income_tax", "calculate_capital_gains_tax", "calculate_inheritance_gift_tax"], audience: ["pro", "public"] }),
  c("tax-yearend", "tax", "calc", "연말정산·공제 판정", "부양가족·의료비·월세·카드 공제 요건을 하나씩 판정하고 환급액 차이를 비교해요.", { tools: ["year-end-settlement-calculator", "dependent-deduction-checker", "medical-expense-tax-credit-calculator", "monthly-rent-tax-credit-calculator"], skills: [BEN], mcp: ["calculate_kr_year_end_settlement", "check_kr_dependent_deduction", "calculate_kr_monthly_rent_credit", "calculate_card_tax_deduction"], audience: ["pro", "public"] }),
  c("tax-valuation", "tax", "calc", "비상장주식·가업상속 평가", "상증법 보충적 평가(순손익가치·순자산가치 가중), 가업상속공제 요건과 사후관리를 계산해요.", { tools: ["unlisted-share-valuation-calculator", "family-business-inheritance-calculator"], skills: [ADV], mcp: ["value_kr_unlisted_shares", "calculate_kr_family_business_deduction"] }),
  c("tax-calendar", "tax", "deadline", "신고·납부 일정과 가산세 관리", "부가세·원천세·종합소득세·법인세 신고 일정을 잡고, 늦었을 때 가산세 감면 구간을 계산해요.", { tools: ["tax-calendar", "vat-penalty-calculator", "inheritance-gift-filing-deadline-calculator"], mcp: ["get_kr_business_tax_calendar", "plan_kr_inheritance_gift_filing_deadline", "check_kr_business_day"], audience: ["pro", "public"] }),
  c("tax-appeal", "tax", "deadline", "조세불복 기한과 절차", "고지서를 받은 날부터 90일 안에 이의신청·심사청구·심판청구를 고르고, 경정청구 5년을 따져요.", { tools: ["tax-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"], exclusive: true }),
  c("tax-books", "tax", "docs", "장부·증빙 검토", "간편장부·복식부기 대상, 업무용 승용차 운행기록, 적격증빙을 확인해요.", { tools: ["accounting-law-guide", "business-car-expense-calculator", "expense-ratio-calculator"], mcp: ["calculate_kr_business_car_expense"], exclusive: true }),
  c("tax-planning", "tax", "consult", "사업자 유형과 절세 설계", "간이·일반과세, 개인·법인, 법인전환 시점을 숫자로 비교해 선택지를 설명해요.", { tools: ["general-vs-simplified-vat-calculator", "incorporation-conversion-calculator", "tax-savings-roadmap"], skills: [ADV, BIZ], mcp: ["compare_kr_general_vs_simplified_vat", "calculate_kr_incorporation_conversion"], audience: ["pro", "public"] }),
  c("tax-program", "tax", "digital", "세무 프로그램 자료 연결", "통장·카드 내역을 분개 표로 바꿔 세무사랑·위하고·더존 등 프로그램의 엑셀 업로드 순서로 넘기고, 불공제·증빙·중복을 먼저 걸러요.", { tools: ["bookkeeping-data-bridge", "journal-entry-analytics"], skills: [ADV], mcp: ["analyze_journal_entries"], audience: ["pro", "public"] }),
  c("tax-scope", "tax", "ethics", "세무대리 범위와 성실의무", "세무대리는 세무사 업무예요(세무사법 제2조). 개정 제20조 제3항(2026-06-24 시행)은 무자격자의 세무대리 암시 광고도 금지해요.", { tools: ["law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),
  c("tax-hometax", "tax", "digital", "홈택스 전자신고·자료 조회", "간소화 자료, 전자세금계산서, 신고서 제출 화면을 다루는 실무 역량이에요.", { tools: ["eportal-practice-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"] }),

  // 공인회계사
  c("cpa-law", "cpa", "law", "외부감사법과 회계기준", "외부감사 대상 판정, K-IFRS·일반기업회계기준의 인식·측정 원칙을 적용해요.", { tools: ["accounting-law-guide"], skills: [LAW], mcp: ["search_kr_statutes", "start_kr_law_intake"] }),
  c("cpa-ratio", "cpa", "calc", "재무제표 분석", "수익성·안정성·활동성 비율 추세로 회사 상태를 읽어요.", { tools: ["financial-ratio-trend", "cost-accounting-simulator"], audience: ["pro", "public"] }),
  c("cpa-valuation", "cpa", "calc", "기업가치 평가", "DCF·WACC, 상증법 평가를 나란히 놓고 가정이 바뀔 때 가치가 어떻게 움직이는지 봐요.", { tools: ["dcf-valuation-calculator", "unlisted-share-valuation-calculator"], skills: [ADV], mcp: ["calculate_dcf_valuation", "value_kr_unlisted_shares", "calculate_cagr"] }),
  c("cpa-journal", "cpa", "docs", "분개와 계정 흐름", "거래를 차변·대변으로 나누고 T계정으로 잔액 흐름을 확인해요.", { tools: ["journal-entry-trainer", "t-account-visualizer"], audience: ["pro", "public"] }),
  c("cpa-close", "cpa", "deadline", "결산·감사·법인세 일정", "결산 → 감사 → 주총 → 법인세 신고(사업연도 종료 후 3개월) 순서를 맞춰요.", { tools: ["accounting-law-guide", "tax-calendar"], mcp: ["get_kr_business_tax_calendar"] }),
  c("cpa-advisory", "cpa", "consult", "경영·재무 자문", "단위경제·런웨이·인수 통합을 숫자로 검토하고 결론·근거·다음 행동을 한 장으로 정리해요.", { tools: ["unit-economics-runway-calculator", "acquisition-integration-check", "decision-tree-calculator"], skills: [BIZ], mcp: ["calculate_unit_economics_runway"] }),
  c("cpa-scope", "cpa", "ethics", "독립성과 감사 업무 범위", "회계감사는 공인회계사 업무예요(공인회계사법 제2조). 이해관계가 있는 회사의 감사는 제한돼요(제21조).", { tools: ["law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"], exclusive: true }),
  c("cpa-data", "cpa", "digital", "감사 데이터 분석", "전표 전수 분석, 이상 거래 탐지 같은 데이터 기반 감사 기법이에요.", { tools: ["journal-entry-analytics"], skills: ["oiyo-kr-law-guide"], mcp: ["analyze_journal_entries"] }),

  // 공인노무사
  c("labor-law", "labor", "law", "근로기준법·노조법·산재법", "5인 미만 적용 제외, 근로자성, 해고 제한처럼 결론을 바꾸는 요건을 읽어요.", { tools: ["labor-law-guide", "labor-law-quick-check"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("labor-wage", "labor", "calc", "임금 계산", "통상임금 → 연장·야간·휴일수당, 주휴수당, 퇴직금을 같은 기준으로 계산해요.", { tools: ["ordinary-wage-calculator", "overtime-pay-calculator", "weekly-holiday-pay-calculator", "severance-calculator", "fixed-overtime-pay-checker"], skills: [BEN], mcp: ["calculate_kr_ordinary_wage", "calculate_overtime_pay", "calculate_weekly_allowance", "calculate_severance_pay", "check_kr_fixed_overtime_pay", "get_kr_minimum_wage"], audience: ["pro", "public"] }),
  c("labor-leave", "labor", "calc", "휴가·휴직 급여", "연차 일수, 출산전후휴가·육아휴직·육아기 단축 급여를 계산해요.", { tools: ["annual-leave-calculator", "maternity-leave-pay-calculator", "parental-leave-calculator", "reduced-hours-childcare-pay-calculator"], skills: [BEN], mcp: ["calculate_annual_leave", "calculate_kr_maternity_leave_pay", "calculate_kr_reduced_hours_childcare_pay"], audience: ["pro", "public"] }),
  c("labor-insurance", "labor", "calc", "4대보험과 인건비", "건강·연금·고용·산재보험료와 사업주 부담을 합쳐 실제 인건비를 구해요.", { tools: ["labor-cost-calculator", "health-insurance-calculator", "daily-worker-insurance-checker", "salary-calculator"], mcp: ["calculate_health_insurance", "calculate_net_salary"], audience: ["pro", "public"] }),
  c("labor-remedy", "labor", "deadline", "해고·체불 구제 기한", "부당해고 구제신청 3개월, 해고예고수당, 체불임금 대지급금 신청 기한을 세요.", { tools: ["labor-law-guide", "dismissal-notice-pay-calculator", "unpaid-wage-guarantee-calculator", "shutdown-allowance-calculator"], skills: [LAW, BEN], mcp: ["start_kr_law_intake", "calculate_kr_dismissal_notice_pay", "calculate_kr_wage_guarantee", "calculate_kr_shutdown_allowance"], audience: ["pro", "public"], exclusive: true }),
  c("labor-docs", "labor", "docs", "근로계약·연차촉진·수습 서류", "연차 사용촉진 통보 순서, 수습 감액 요건처럼 서류로 남겨야 효력이 생기는 절차를 챙겨요.", { tools: ["annual-leave-promotion-planner", "probation-minimum-wage-checker"], skills: [BEN], mcp: ["plan_kr_annual_leave_promotion", "check_kr_probation_minimum_wage"], exclusive: true }),
  c("labor-benefit", "labor", "consult", "산재·실업급여 안내", "휴업급여, 실업급여 수급 요건, 자진퇴사 정당 사유를 사실관계로 확인해요.", { tools: ["industrial-accident-leave-pay-calculator", "unemployment-benefits-calculator", "voluntary-quit-unemployment-checker"], skills: [BEN], mcp: ["calculate_kr_injury_leave_pay", "calculate_unemployment_benefits", "check_kr_voluntary_quit_unemployment"], audience: ["pro", "public"] }),
  c("labor-scope", "labor", "ethics", "대리·서류 작성의 독점 범위", "노동 상담은 누구나 할 수 있지만, 사건 대리·서류 작성·노무관리진단은 공인노무사 업무예요(공인노무사법 제2조·제27조).", { tools: ["law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),
  c("labor-portal", "labor", "digital", "고용24·노동포털 전자 신고", "4대보험 취득·상실 신고, 진정 접수 같은 전자 창구 실무예요.", { tools: ["eportal-practice-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"] }),

  // 행정사
  c("admin-law", "admin", "law", "행정절차법·행정심판법·행정기본법", "처분 사전통지·의견제출, 재량권 일탈, 행정심판 청구 요건을 읽어요.", { tools: ["administrative-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("admin-deadline", "admin", "deadline", "의견제출·행정심판·소송 기한", "처분을 안 날부터 90일, 있은 날부터 180일, 영업일 기준 기한을 계산해요.", { tools: ["administrative-law-guide", "business-day-checker"], skills: [LAW], mcp: ["start_kr_law_intake", "check_kr_business_day"], audience: ["pro", "public"] }),
  c("admin-permit", "admin", "docs", "인허가·민원 서류", "영업신고·허가 신청에 필요한 서류와 요건을 정리해요. 작성·제출 대행은 행정사 업무예요.", { exclusive: true, tools: ["permit-document-checklist"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"], audience: ["pro", "public"] }),
  c("admin-visa", "admin", "law", "출입국·체류 자격", "체류자격 변경·연장, 사증 종류별 요건을 다뤄요.", { tools: ["visa-stay-status-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"], audience: ["pro", "public"] }),
  c("admin-zoning", "admin", "calc", "건축·토지 규제 수치", "건폐율·용적률처럼 인허가 판단에 쓰는 수치를 계산해요.", { tools: ["building-coverage-floor-area-ratio-calculator"], audience: ["pro", "public"] }),
  c("admin-fine", "admin", "calc", "과태료·이행강제금 감경", "의견제출 기한 안 자진납부 감경과 늦게 낼 때 붙는 가산금을 계산해요. 이행강제금은 개별 법률 기준을 따라요.", { tools: ["fine-reduction-calculator"], skills: ["oiyo-kr-law-guide"], mcp: ["calculate_kr_fine_reduction"], audience: ["pro", "public"] }),
  c("admin-info", "admin", "consult", "정보공개청구와 사실조사", "필요한 행정 정보를 청구하고, 비공개 결정에 이의신청하는 순서를 안내해요.", { tools: ["administrative-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("admin-scope", "admin", "ethics", "행정사 업무 범위", "행정기관 제출 서류 작성·제출 대행은 행정사 업무예요(행정사법 제2조·제3조).", { tools: ["law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 법무사
  c("court-law", "court", "law", "상속·부동산등기·민사집행", "상속 순위와 포기·한정승인, 등기 원인, 지급명령·강제집행 요건을 읽어요.", { tools: ["registry-court-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("court-deadline", "court", "deadline", "상속 포기·신고·등기 기한", "상속 포기·한정승인 3개월, 상속세 신고 6개월, 소유권이전등기 60일을 함께 세요.", { tools: ["registry-court-law-guide", "inheritance-gift-filing-deadline-calculator", "statute-limitations-calculator"], skills: [LAW], mcp: ["start_kr_law_intake", "plan_kr_inheritance_gift_filing_deadline"], audience: ["pro", "public"] }),
  c("court-cost", "court", "calc", "등기 비용·취득세", "취득세·등록면허세·국민주택채권 매입액을 계산해요.", { tools: ["acquisition-tax-calculator", "first-home-tax-calculator", "car-bond-refund-calculator"], mcp: ["calculate_kr_acquisition_tax"], audience: ["pro", "public"] }),
  c("court-interest", "court", "calc", "이자·지연손해금·소송비용", "법정이율, 소송촉진법 지연이자, 인지대·송달료를 계산해요.", { tools: ["legal-interest-calculator", "litigation-cost-calculator"], audience: ["pro", "public"] }),
  c("court-docs", "court", "docs", "지급명령·공탁·등기 신청 서류", "청구 원인과 증거를 정리해요. 신청서 작성·제출 대리는 법무사 업무예요.", { tools: ["registry-court-law-guide"], skills: [LAW], exclusive: true }),
  c("court-deposit", "court", "consult", "보증금 회수와 전세 보증", "임차권등기명령, 보증보험 가입 가능 여부를 사실관계로 확인해요.", { tools: ["jeonse-guarantee-calculator", "jeonse-monthly-converter"], mcp: ["diagnose_hug_guarantee"], audience: ["pro", "public"] }),
  c("court-debt", "court", "consult", "채무 조정 선택지", "개인회생 변제액과 기간을 계산해 선택지를 비교해요.", { tools: ["personal-rehabilitation-calculator"], audience: ["pro", "public"] }),
  c("court-scope", "court", "ethics", "법무사 업무 범위", "등기·공탁 신청 대리와 법원 제출 서류 작성은 법무사 업무예요(법무사법 제2조). 소송 대리는 변호사 업무예요(변호사법 제109조).", { tools: ["law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),
  c("court-efile", "court", "digital", "인터넷등기소·전자소송", "등기부 열람, 전자소송 제출 같은 전자 창구 실무예요.", { tools: ["eportal-practice-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"] }),

  // 보험계리사
  c("act-law", "actuary", "law", "보험업법과 기초서류 규제", "보험료·책임준비금 산출 기준, 기초서류 작성·변경 규정을 읽어요.", { tools: ["insurance-law-guide"], skills: [LAW], mcp: ["search_kr_statutes", "get_kr_professional_scope"] }),
  c("act-premium", "actuary", "calc", "보험료 산출", "수지상등 원칙으로 예정위험률·예정이율·예정사업비를 조합해 보험료를 만들어요.", { tools: ["insurance-premium-basics", "insurance-premium-calculator"], skills: [LAW], audience: ["pro", "public"] }),
  c("act-mortality", "actuary", "calc", "생명표·위험률", "나이별 사망률과 기대여명이 보험료와 연금 가치에 어떻게 들어가는지 봐요.", { tools: ["life-expectancy-calculator", "insurance-premium-basics"], audience: ["pro", "public"] }),
  c("act-interest", "actuary", "calc", "이자론·현가", "할인율에 따른 현재가치와 복리 효과를 계산해요.", { tools: ["present-value-calculator", "compound-interest-calculator"], mcp: ["calculate_compound_interest", "calculate_cagr"], audience: ["pro", "public"] }),
  c("act-reserve", "actuary", "calc", "책임준비금·IFRS 17", "보험계약마진(CSM)과 위험조정을 측정하는 역량이에요.", { tools: ["ifrs17-csm-simulator"], skills: ["oiyo-kr-law-guide"], mcp: ["simulate_ifrs17_csm"] }),
  c("act-solvency", "actuary", "calc", "지급여력(K-ICS)", "요구자본과 가용자본으로 지급여력비율을 평가하는 역량이에요.", { tools: ["kics-solvency-ratio-calculator"], skills: ["oiyo-kr-law-guide"], mcp: ["calculate_kics_ratio"] }),
  c("act-product", "actuary", "consult", "상품 구조 비교", "실손 세대별 자기부담률처럼 상품 구조가 소비자 부담을 어떻게 바꾸는지 설명해요.", { tools: ["silson-insurance-generation-calculator"], audience: ["pro", "public"] }),
  c("act-scope", "actuary", "ethics", "계리 업무 범위", "기초서류 확인, 책임준비금·잉여금 배분 계산은 보험계리사 업무예요(보험업법 제181조·제184조).", { tools: ["insurance-law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"], exclusive: true }),

  // 손해사정사
  c("adj-law", "adjuster", "law", "상법 보험편과 약관 해석", "고지의무 위반 해지(안 날부터 1개월, 계약 후 3년), 면책 사유, 약관 설명의무를 읽어요.", { tools: ["insurance-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("adj-loss", "adjuster", "calc", "손해액 산정", "일실수입, 휴업손해를 소득과 기간으로 계산해요.", { tools: ["loss-of-income-calculator", "industrial-accident-leave-pay-calculator"], mcp: ["calculate_kr_injury_leave_pay"], audience: ["pro", "public"] }),
  c("adj-medical", "adjuster", "calc", "의료비·실손 보상 계산", "실손 세대별 자기부담, 본인부담상한제 환급을 계산해요.", { tools: ["silson-insurance-generation-calculator", "copay-cap-refund-calculator"], audience: ["pro", "public"] }),
  c("adj-deadline", "adjuster", "deadline", "보험금 청구 시효와 지급 기한", "청구권 소멸시효 3년, 고지의무 해지 제한 기간을 날짜로 세요.", { tools: ["insurance-law-guide", "statute-limitations-calculator"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("adj-report", "adjuster", "docs", "손해사정서 작성", "사고 사실·손해액·근거를 정리한 손해사정서는 손해사정사 업무예요(보험업법 제188조).", { exclusive: true, tools: ["pro-document-reading-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"], audience: ["pro", "public"] }),
  c("adj-fault", "adjuster", "consult", "장해 등급·과실 비율", "장해 평가 기준과 과실 비율이 보험금에 미치는 영향을 설명하는 역량이에요.", { tools: ["disability-fault-claim-calculator"], skills: ["oiyo-kr-law-guide"], mcp: ["calculate_insurance_claim_payout"], audience: ["pro", "public"] }),
  c("adj-scope", "adjuster", "ethics", "손해사정 업무 범위와 금지 행위", "손해사정은 손해사정사 업무이고, 보험회사와 합의·소송 대리는 변호사 업무예요(보험업법 제188조·제189조, 변호사법 제109조).", { tools: ["insurance-law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 보험설계사·대리점
  c("agent-law", "agent", "law", "모집 규제와 금융소비자보호법", "설명의무·적합성 원칙·부당권유 금지(금소법 제17~21조), 모집 제한(보험업법 제83조)을 읽어요.", { tools: ["insurance-law-guide", "insurance-sales-compliance-checker"], skills: [LAW], mcp: ["search_kr_statutes"] }),
  c("agent-gift", "agent", "calc", "특별이익(사은품) 한도", "첫해 보험료 10%와 20만 원 중 적은 금액 안에서만 줄 수 있어요(보험업법 제98조).", { tools: ["insurance-sales-compliance-checker"], skills: [LAW] }),
  c("agent-twisting", "agent", "deadline", "승환계약·청약철회 기한", "기존 계약 소멸 전후 1개월(비교 안내 없으면 6개월), 청약철회 15일·30일을 날짜로 세요.", { tools: ["insurance-sales-compliance-checker", "insurance-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("agent-needs", "agent", "consult", "필요 보장 분석", "가계 현금흐름·은퇴 자금을 먼저 계산하고 보장 크기를 정해요.", { tools: ["life-planning-calculator", "fire-retirement-calculator", "pension-optimizer-calculator", "insurance-premium-basics"], audience: ["pro", "public"] }),
  c("agent-product", "agent", "consult", "실손·장기요양 구조 이해", "실손 세대별 차이, 장기요양 본인부담을 비교해 설명해요.", { tools: ["silson-insurance-generation-calculator", "long-term-care-copay-calculator"], skills: [BEN], mcp: ["calculate_kr_long_term_care_copay"], audience: ["pro", "public"] }),
  c("agent-tax", "agent", "calc", "보험·연금 세제", "연금 수령 세금, ISA·연금저축 비교처럼 상품 선택에 붙는 세금을 계산해요.", { tools: ["pension-tax-calculator", "isa-vs-pension-calculator"], audience: ["pro", "public"] }),
  c("agent-record", "agent", "docs", "설명·적합성 기록", "설명서 교부, 적합성 확인 결과를 계약마다 남기는 역량이에요.", { tools: ["insurance-explanation-record"], skills: ["oiyo-kr-law-guide"], mcp: ["check_insurance_explanation_record"] }),
  c("agent-scope", "agent", "ethics", "등록·소속 범위", "등록한 설계사·대리점·중개사만 모집할 수 있고(보험업법 제83조), 소속 회사 상품만 다뤄요.", { tools: ["insurance-law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),
  // 관세사
  c("cu-law", "customs", "law", "관세법·FTA 원산지 규정", "신고납부·보정·경정, 소액 면세, FTA 원산지 결정 기준을 읽어요.", { tools: ["customs-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("cu-deadline", "customs", "deadline", "납부·보정·경정·불복 기한", "수리일부터 15일 납부, 6개월 보정, 5년 경정청구, 90일 불복을 날짜로 세요.", { tools: ["customs-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake", "check_kr_business_day"], audience: ["pro", "public"], exclusive: true }),
  c("cu-direct", "customs", "consult", "해외직구 면세 판정", "150달러(미국발 200달러), 합산과세, 판매용 여부를 확인해요.", { tools: ["customs-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("cu-fx", "customs", "calc", "과세가격·환율 환산", "물품가격과 운임을 과세환율로 원화 환산해요.", { tools: ["currency-converter", "foreign-exchange-fee-calculator"], audience: ["pro", "public"] }),
  c("cu-hs", "customs", "calc", "품목분류(HS)와 세율", "HS 코드를 정하고 기본·FTA 세율을 비교하는 역량이에요.", { exclusive: true, tools: ["import-duty-fta-calculator"], skills: ["oiyo-kr-law-guide"], mcp: ["calculate_kr_import_duty"], audience: ["pro", "public"] }),
  c("cu-docs", "customs", "docs", "수입신고·원산지증명 서류", "인보이스·패킹리스트·원산지증명서를 맞춰 신고해요. 신고 대리는 관세사 업무예요.", { exclusive: true, tools: ["pro-document-reading-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"] }),
  c("cu-unipass", "customs", "digital", "유니패스 전자 통관", "통관 진행 조회와 전자 신고 실무예요.", { tools: ["eportal-practice-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"] }),
  c("cu-scope", "customs", "ethics", "통관업 범위와 명칭 제한", "관세사·관세법인·통관취급법인만 남의 의뢰로 통관업을 하고(관세사법 제3조), 유사명칭을 쓸 수 없어요(제25조).", { tools: ["law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 변리사
  c("pt-law", "patent", "law", "특허법·상표법·디자인보호법", "신규성·진보성, 상표 식별력·유사 판단 기준을 읽어요.", { tools: ["ip-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("pt-deadline", "patent", "deadline", "공지예외·거절 대응 기한", "공지예외 12개월, 의견서 제출기간, 거절결정 불복 3개월, 연차료 납부를 관리해요.", { tools: ["ip-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("pt-search", "patent", "consult", "선행기술·등록상표 조사", "출원 전에 키프리스로 같은 기술·비슷한 상표를 찾아 가능성을 가늠해요.", { tools: ["ip-law-guide"], audience: ["pro", "public"] }),
  c("pt-claims", "patent", "docs", "명세서·청구범위 작성", "권리 범위를 정하는 청구범위를 쓰는 역량이에요. 출원 대리는 변리사 업무예요.", { exclusive: true, tools: ["pro-document-reading-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"] }),
  c("pt-value", "patent", "calc", "지식재산 가치평가", "특허의 미래 현금흐름을 할인해 가치를 추정해요.", { tools: ["dcf-valuation-calculator", "present-value-calculator"], mcp: ["calculate_dcf_valuation"] }),
  c("pt-infringe", "patent", "consult", "침해 경고장 대응", "권리 유효성·침해 여부·선사용 여부를 사실로 나눠 대응 순서를 정해요.", { tools: ["ip-law-guide"], skills: [LAW], audience: ["pro", "public"], exclusive: true }),
  c("pt-efile", "patent", "digital", "특허로 전자출원", "전자출원과 수수료 납부, 심사 진행 조회 실무예요.", { tools: ["eportal-practice-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"] }),
  c("pt-scope", "patent", "ethics", "변리 업무 범위와 명칭 제한", "변리사가 아니면 특허 등 대리를 업으로 할 수 없고(변리사법 제21조), 유사명칭을 쓸 수 없어요(제22조).", { tools: ["law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 감정평가사
  c("ap-law", "appraiser", "law", "감정평가법·토지보상법·부동산공시법", "감정평가 기준, 보상 원칙, 공시가격 체계를 읽어요.", { tools: ["appraisal-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("ap-deadline", "appraiser", "deadline", "보상금·공시가격 다툼 기한", "재결 이의신청 30일, 소송 90일(이의재결 뒤 60일), 공시가격 이의신청 30일을 세요.", { tools: ["appraisal-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("ap-income", "appraiser", "calc", "수익환원법", "임대수익과 환원율로 수익 부동산 가치를 구해요.", { tools: ["rental-yield-calculator", "present-value-calculator"], audience: ["pro", "public"] }),
  c("ap-tax", "appraiser", "calc", "감정가와 세금", "상속·증여 신고에서 감정가와 공시가격의 세금 차이를 비교해요.", { tools: ["inherited-house-appraisal-vs-official-price-calculator", "inheritance-tax-calculator"], mcp: ["compare_kr_inherited_house_valuation", "calculate_inheritance_gift_tax"], audience: ["pro", "public"] }),
  c("ap-redevelop", "appraiser", "calc", "정비사업 권리가액", "재건축·재개발 종전자산 평가와 분담금 구조를 이해해요.", { tools: ["reconstruction-profit", "redevelopment-ticket-vs-presale-tax-calculator"], mcp: ["compare_kr_ticket_vs_presale_tax"], audience: ["pro", "public"] }),
  c("ap-report", "appraiser", "docs", "감정평가서 작성", "가격 결정 근거를 담은 감정평가서는 감정평가사 업무예요.", { exclusive: true, tools: ["pro-document-reading-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"], audience: ["pro", "public"] }),
  c("ap-scope", "appraiser", "ethics", "감정평가 업무 범위와 명칭 제한", "감정평가는 사무소·법인 소속 감정평가사가 하고(감정평가법 제21조·제29조), 유사명칭을 쓸 수 없어요(제22조).", { tools: ["law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 공인중개사
  c("br-law", "broker", "law", "공인중개사법·주택임대차보호법", "확인·설명 의무, 금지행위, 대항력·우선변제를 읽어요.", { tools: ["realty-brokerage-law-guide", "registry-court-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("br-fee", "broker", "calc", "중개보수 계산", "거래 종류·금액별 상한요율로 보수를 계산해요.", { tools: ["brokerage-calculator", "realty-brokerage-law-guide"], audience: ["pro", "public"] }),
  c("br-deadline", "broker", "deadline", "거래·임대차 신고 기한", "매매 거래신고와 주택 임대차 신고를 계약일부터 30일 안에 해요.", { tools: ["realty-brokerage-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("br-jeonse", "broker", "consult", "전세 위험 점검", "보증금 대비 시세·선순위, 보증보험 가입 가능성을 확인해요.", { tools: ["jeonse-guarantee-calculator", "jeonse-vs-buy-calculator", "jeonse-monthly-converter"], mcp: ["diagnose_hug_guarantee"], audience: ["pro", "public"] }),
  c("br-tax", "broker", "calc", "거래 세금 안내", "취득세·양도세·보유세를 거래 전에 가늠해요.", { tools: ["acquisition-tax-calculator", "capital-gains-tax-calculator", "property-tax-calculator"], mcp: ["calculate_kr_acquisition_tax", "calculate_capital_gains_tax", "calculate_kr_property_tax"], audience: ["pro", "public"] }),
  c("br-docs", "broker", "docs", "확인·설명서와 계약서", "등기부·건축물대장을 확인해 확인·설명서를 쓰는 역량이에요. 중개는 등록한 개업공인중개사 업무예요.", { exclusive: true, tools: ["pro-document-reading-guide"], skills: ["oiyo-kr-law-guide"], mcp: ["get_kr_practice_guide"], audience: ["pro", "public"] }),
  c("br-scope", "broker", "ethics", "등록과 금지행위", "개설등록한 사람만 중개하고(공인중개사법 제9조), 초과 보수·직접거래·쌍방대리가 금지돼요(제33조).", { tools: ["realty-brokerage-law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 건축사 (11-20)
  c("ar-law", "architect", "law", "건축법·용도변경 기준", "허가·신고·용도변경(시설군)·사용승인 기준을 읽어요.", { tools: ["building-permit-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("ar-calc", "architect", "calc", "건폐율·용적률 계산", "대지면적과 바닥면적으로 증축 여유를 계산해요.", { tools: ["building-coverage-floor-area-ratio-calculator"], audience: ["pro", "public"] }),
  c("ar-deadline", "architect", "deadline", "착공·불복 기한", "허가 2년·신고 1년 착공 기한, 시정명령·이행강제금 행정심판 90일을 챙겨요.", { tools: ["building-permit-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("ar-design", "architect", "docs", "설계도서 작성", "허가·신고 대상 건축물의 설계는 건축사 업무예요(건축법 제23조).", { exclusive: true }),
  c("ar-permit", "architect", "digital", "세움터 인허가 전자 신청", "건축물대장 열람과 인허가 신청을 세움터에서 해요.", { tools: ["permit-document-checklist", "eportal-practice-guide"], audience: ["pro", "public"] }),
  c("ar-violation", "architect", "consult", "위반건축물 상담", "무단 증축·용도변경을 원상복구나 추인으로 바로잡는 길을 정리해요.", { tools: ["building-permit-law-guide", "fine-reduction-calculator"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("ar-scope", "architect", "ethics", "설계 독점과 감리 독립", "허가 대상 설계는 건축사만 하고, 감리는 시공자와 독립해 해요.", { tools: ["building-permit-law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 의료인·약사 (11-20, 진료 자체는 다루지 않음)
  c("md-law", "medic", "law", "의료법·약사법 기본", "진단서·기록 열람·무면허 금지·의약품 판매 제한을 읽어요.", { tools: ["medical-care-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("md-care", "medic", "consult", "진료·조제", "진단·치료·조제는 의료인·약사의 면허 업무예요.", { exclusive: true }),
  c("md-records", "medic", "docs", "진료기록 관리와 사본 발급", "보존기간(진료기록부 10년·처방전 2년)과 본인·가족·대리인 발급 요건을 챙겨요.", { tools: ["medical-care-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("md-dispute", "medic", "deadline", "의료분쟁 조정 기한", "안 날부터 3년·진료 끝난 날부터 10년 안에 조정을 신청해요.", { tools: ["medical-care-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("md-bill", "medic", "calc", "진료비·보험료·의료비 공제", "비급여 확인 요청, 건강보험료, 의료비 세액공제를 계산해요.", { tools: ["health-insurance-calculator", "medical-expense-tax-credit-calculator"], mcp: ["calculate_health_insurance", "calculate_kr_long_term_care_copay"], audience: ["pro", "public"] }),
  c("md-claim", "medic", "consult", "실손·장해 보험금 연결", "진단서·기록으로 보험금 청구와 장해 지급률을 확인해요.", { tools: ["disability-fault-claim-calculator", "insurance-law-guide"], mcp: ["calculate_insurance_claim_payout"], audience: ["pro", "public"] }),
  c("md-scope", "medic", "ethics", "무면허·환자 유인 금지", "의료인이 아니면 의료행위를 할 수 없고, 돈을 주고 환자를 소개·유인할 수 없어요(의료법 제27조).", { tools: ["medical-care-law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 변호사(가사) (11-20)
  c("fm-law", "family", "law", "민법 친족편·가사소송법", "협의·재판상 이혼, 양육, 재산분할, 이행명령·감치를 읽어요.", { tools: ["divorce-family-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("fm-deadline", "family", "deadline", "이혼 절차 기한", "숙려 3개월·1개월, 이혼신고 3개월, 재산분할 2년, 이혼청구 6개월·2년을 챙겨요.", { tools: ["divorce-family-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("fm-support", "family", "consult", "양육비 이행 확보", "이행명령 → 감치 → 양육비이행관리원 지원 순서를 안내해요.", { tools: ["divorce-family-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("fm-property", "family", "calc", "재산분할 세금", "분할로 넘기는 집의 취득세·양도세, 증여로 보는 경우를 가늠해요.", { tools: ["acquisition-tax-calculator", "capital-gains-tax-calculator", "gift-tax-calculator"], mcp: ["calculate_kr_acquisition_tax", "calculate_capital_gains_tax", "calculate_inheritance_gift_tax"], audience: ["pro", "public"] }),
  c("fm-litigate", "family", "docs", "소장·조정 신청서와 대리", "가사 소송 대리는 변호사, 가정법원 제출 서류 작성은 법무사도 해요.", { exclusive: true, tools: ["registry-court-law-guide"] }),
  c("fm-ecourt", "family", "digital", "전자소송·가족관계 증명", "전자소송과 가족관계증명서 발급을 온라인으로 해요.", { tools: ["eportal-practice-guide"], mcp: ["get_kr_practice_guide"], audience: ["pro", "public"] }),
  c("fm-scope", "family", "ethics", "비변호사 법률사무 금지", "대가를 받고 이혼 상담·서류 작성·대리를 하면 변호사법 위반이에요(제109조).", { tools: ["divorce-family-law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 사회복지사 (11-20)
  c("sw-law", "social", "law", "기초생활보장법·긴급복지지원법", "신청권자, 결정 30일, 이의신청 90일, 긴급지원 선지원을 읽어요.", { tools: ["welfare-benefit-law-guide"], skills: [LAW], mcp: ["search_kr_statutes"], audience: ["pro", "public"] }),
  c("sw-find", "social", "consult", "받을 수 있는 지원 찾기", "나이·소득·가구로 받을 수 있는 급여와 지원금을 찾아요.", { tools: ["benefit-finder", "benefit-rights-toolkit", "youth-monthly-rent-support-checker"], skills: [BEN], audience: ["pro", "public"] }),
  c("sw-calc", "social", "calc", "근로·자녀장려금과 실업급여", "장려금과 실업급여를 계산해 생계 계획에 넣어요.", { tools: ["work-child-incentive-calculator", "unemployment-benefits-calculator"], skills: [BEN], mcp: ["calculate_unemployment_benefits"], audience: ["pro", "public"] }),
  c("sw-deadline", "social", "deadline", "결정·이의신청 기한", "신청일부터 30일, 통지일부터 90일을 챙겨요.", { tools: ["welfare-benefit-law-guide"], skills: [LAW], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("sw-case", "social", "docs", "사례관리 기록", "상담·욕구 조사·서비스 연계를 기록해요.", {}),
  c("sw-portal", "social", "digital", "복지로·사회보장정보시스템", "온라인 신청과 모의계산을 안내해요.", { tools: ["welfare-benefit-law-guide"], audience: ["pro", "public"] }),
  c("sw-scope", "social", "ethics", "신청 대행의 경계", "복지 상담은 누구나 돕지만, 대가를 받고 신청 서류를 대행하는 일은 행정사 업무예요(행정사법 제3조).", { tools: ["welfare-benefit-law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),

  // 경영지도사 (법령 길잡이 밖: 경영 도구·경영 전략 참모 스킬과 연결)
  c("mg-strategy", "mgmt", "consult", "전략 진단", "SWOT·BCG·포지셔닝으로 현재 위치와 선택지를 정리해요.", { tools: ["swot-analysis", "bcg-matrix", "positioning-map"], skills: [BIZ], mcp: ["analyze_swot"], audience: ["pro", "public"] }),
  c("mg-decision", "mgmt", "calc", "의사결정 분석", "가중 의사결정표·의사결정 트리로 대안을 숫자로 비교해요.", { tools: ["priority-decision-matrix", "decision-tree-calculator"], skills: [BIZ], audience: ["pro", "public"] }),
  c("mg-finance", "mgmt", "calc", "단위경제·런웨이·시장 실험", "LTV/CAC, 남은 현금 개월 수, 시장 테스트 손익을 계산해요.", { tools: ["unit-economics-runway-calculator", "market-test-calculator"], skills: [BIZ], mcp: ["calculate_unit_economics_runway", "analyze_market_test"], audience: ["pro", "public"] }),
  c("mg-ops", "mgmt", "consult", "운영 문제 해결", "캠페인 품절, 품질 회수, 대체 원료, 대형 수주, 판매장려금, 인수 통합을 점검해요.", { tools: ["campaign-supply-planner", "quality-recovery-planner", "alternative-material-review", "big-order-capacity-check", "sales-rebate-checker", "acquisition-integration-check", "influencer-deal-calculator"], skills: [BIZ], mcp: ["plan_campaign_supply", "plan_quality_recovery", "compare_alternative_materials", "check_big_order_capacity", "check_sales_rebates"], audience: ["pro", "public"] }),
  c("mg-plan", "mgmt", "deadline", "일정·마일스톤 관리", "CPM으로 핵심 경로를 찾고 신고·납부 일정을 사업 일정에 얹어요.", { tools: ["project-timeline-planner", "tax-calendar"], skills: [BIZ], mcp: ["get_kr_business_tax_calendar"], audience: ["pro", "public"] }),
  c("mg-checklist", "mgmt", "docs", "사업자 필수 의무 점검", "창업·고용·신고 단계별로 반드시 할 것과 하지 말 것을 챙겨요.", { tools: ["business-must-do-checklist", "business-toolkit"], skills: [BIZ], audience: ["pro", "public"] }),
  c("mg-law", "mgmt", "law", "경영 문제의 법령 연결", "운영 문제가 세금·노무·행정·보험 중 어디에 걸리는지 찾아 해당 길잡이로 넘겨요.", { tools: ["law-guide"], skills: [LAW, BIZ], mcp: ["start_kr_law_intake"], audience: ["pro", "public"] }),
  c("mg-scope", "mgmt", "ethics", "자문 범위", "경영 지도는 독점 업무가 아니지만, 세무대리·노무 대리·법률 사무는 해당 자격사에게 넘겨요.", { tools: ["law-guide"], skills: [LAW], mcp: ["get_kr_professional_scope"] }),
];

/** 링크한 도구의 짧은 한국어 이름. 테스트가 COMPETENCIES에 쓰인 slug와 1:1로 맞는지 봐요. */
export const TOOL_NAMES: Record<string, string> = {
  "fine-reduction-calculator": "과태료 감경·가산금 계산기",
  "import-duty-fta-calculator": "수입 관세·FTA 비교 계산기",
  "ifrs17-csm-simulator": "IFRS 17 CSM 원리",
  "kics-solvency-ratio-calculator": "지급여력비율(K-ICS) 원리",
  "disability-fault-claim-calculator": "장해·과실 보험금 계산기",
  "bookkeeping-data-bridge": "장부 입력 자료 정리기",
  "journal-entry-analytics": "전표 데이터 분석기",
  "permit-document-checklist": "영업신고 서류 점검표",
  "visa-stay-status-guide": "체류자격·외국인등록 기한 길잡이",
  "eportal-practice-guide": "전자 창구 실무 길잡이",
  "pro-document-reading-guide": "전문가 서류 읽는 법",
  "insurance-explanation-record": "설명·적합성 기록 도우미",
  "tax-law-guide": "세금 법령 길잡이",
  "tax-formula-explorer": "세금 공식 탐색기",
  "comprehensive-income-tax-calculator": "종합소득세 계산기",
  "freelancer-tax-calculator": "프리랜서 세금 계산기",
  "capital-gains-tax-calculator": "양도소득세 계산기",
  "inheritance-tax-calculator": "상속세 계산기",
  "gift-tax-calculator": "증여세 계산기",
  "year-end-settlement-calculator": "연말정산 계산기",
  "dependent-deduction-checker": "부양가족 공제 판정",
  "medical-expense-tax-credit-calculator": "의료비 세액공제",
  "monthly-rent-tax-credit-calculator": "월세 세액공제",
  "unlisted-share-valuation-calculator": "비상장주식 평가",
  "family-business-inheritance-calculator": "가업상속공제",
  "tax-calendar": "세무 일정",
  "vat-penalty-calculator": "부가세 가산세",
  "inheritance-gift-filing-deadline-calculator": "상속·증여 신고기한",
  "accounting-law-guide": "회계·장부 법령 길잡이",
  "business-car-expense-calculator": "업무용 승용차 비용",
  "expense-ratio-calculator": "경비율 계산기",
  "general-vs-simplified-vat-calculator": "간이 vs 일반과세",
  "incorporation-conversion-calculator": "법인전환 계산기",
  "tax-savings-roadmap": "절세 로드맵",
  "law-guide": "법령 길잡이 15분야",
  "financial-ratio-trend": "재무비율 추세",
  "cost-accounting-simulator": "원가계산 시뮬레이터",
  "dcf-valuation-calculator": "DCF 기업가치",
  "journal-entry-trainer": "분개 연습",
  "t-account-visualizer": "T계정 시각화",
  "unit-economics-runway-calculator": "단위경제·런웨이",
  "acquisition-integration-check": "인수 통합 점검",
  "decision-tree-calculator": "의사결정 트리",
  "labor-law-guide": "노동법 길잡이",
  "labor-law-quick-check": "노동법 빠른 점검",
  "ordinary-wage-calculator": "통상임금 계산기",
  "overtime-pay-calculator": "연장수당 계산기",
  "weekly-holiday-pay-calculator": "주휴수당 계산기",
  "severance-calculator": "퇴직금 계산기",
  "fixed-overtime-pay-checker": "포괄임금 점검",
  "annual-leave-calculator": "연차 계산기",
  "maternity-leave-pay-calculator": "출산휴가 급여",
  "parental-leave-calculator": "육아휴직 급여",
  "reduced-hours-childcare-pay-calculator": "육아기 단축 급여",
  "labor-cost-calculator": "인건비 계산기",
  "health-insurance-calculator": "건강보험료 계산기",
  "daily-worker-insurance-checker": "일용직 4대보험",
  "salary-calculator": "실수령액 계산기",
  "dismissal-notice-pay-calculator": "해고예고수당",
  "unpaid-wage-guarantee-calculator": "체불 대지급금",
  "shutdown-allowance-calculator": "휴업수당",
  "annual-leave-promotion-planner": "연차 사용촉진 일정",
  "probation-minimum-wage-checker": "수습 최저임금 점검",
  "industrial-accident-leave-pay-calculator": "산재 휴업급여",
  "unemployment-benefits-calculator": "실업급여 계산기",
  "voluntary-quit-unemployment-checker": "자진퇴사 실업급여 점검",
  "administrative-law-guide": "행정 절차 길잡이",
  "business-day-checker": "영업일 계산",
  "building-coverage-floor-area-ratio-calculator": "건폐율·용적률",
  "registry-court-law-guide": "등기·법원 서류 길잡이",
  "statute-limitations-calculator": "소멸시효 계산기",
  "acquisition-tax-calculator": "취득세 계산기",
  "first-home-tax-calculator": "생애최초 취득세",
  "car-bond-refund-calculator": "국민주택채권 할인",
  "legal-interest-calculator": "법정이자 계산기",
  "litigation-cost-calculator": "소송비용 계산기",
  "jeonse-guarantee-calculator": "전세보증 진단",
  "jeonse-monthly-converter": "전월세 전환",
  "personal-rehabilitation-calculator": "개인회생 계산기",
  "insurance-law-guide": "보험 법령 길잡이",
  "insurance-premium-basics": "보험료 계산 원리",
  "insurance-premium-calculator": "보험료 계산기",
  "life-expectancy-calculator": "기대수명 계산기",
  "present-value-calculator": "현재가치 계산기",
  "compound-interest-calculator": "복리 계산기",
  "silson-insurance-generation-calculator": "실손보험 세대 비교",
  "loss-of-income-calculator": "일실수입 계산기",
  "copay-cap-refund-calculator": "본인부담상한 환급",
  "insurance-sales-compliance-checker": "사은품 한도·승환 점검",
  "life-planning-calculator": "생애 재무 설계",
  "fire-retirement-calculator": "은퇴 자금 계산기",
  "pension-optimizer-calculator": "연금 수령 최적화",
  "long-term-care-copay-calculator": "장기요양 본인부담",
  "pension-tax-calculator": "연금소득세 계산기",
  "isa-vs-pension-calculator": "ISA vs 연금저축",
  "customs-law-guide": "관세·통관 법령 길잡이",
  "ip-law-guide": "특허·상표 법령 길잡이",
  "appraisal-law-guide": "감정평가·보상 법령 길잡이",
  "realty-brokerage-law-guide": "부동산 거래·중개 법령 길잡이",
  "building-permit-law-guide": "건축·인허가 법령 길잡이",
  "medical-care-law-guide": "보건·의료 이용 길잡이",
  "divorce-family-law-guide": "가사·이혼 법령 길잡이",
  "welfare-benefit-law-guide": "복지급여 길잡이",
  "benefit-finder": "복지 혜택 찾기",
  "benefit-rights-toolkit": "생활 지원금·노동권 도구",
  "youth-monthly-rent-support-checker": "청년 월세 지원 확인",
  "work-child-incentive-calculator": "근로·자녀장려금 계산기",
  "currency-converter": "환율 계산기",
  "foreign-exchange-fee-calculator": "환전 수수료 계산기",
  "rental-yield-calculator": "임대수익률 계산기",
  "inherited-house-appraisal-vs-official-price-calculator": "감정가 vs 공시가격",
  "reconstruction-profit": "재건축 수익 계산",
  "redevelopment-ticket-vs-presale-tax-calculator": "입주권 vs 분양권 세금",
  "brokerage-calculator": "중개보수 계산기",
  "jeonse-vs-buy-calculator": "전세 vs 매매",
  "property-tax-calculator": "재산세 계산기",
  "swot-analysis": "SWOT 분석",
  "bcg-matrix": "BCG 매트릭스",
  "positioning-map": "포지셔닝 맵",
  "priority-decision-matrix": "가중 의사결정표",
  "market-test-calculator": "시장 실험 손익",
  "campaign-supply-planner": "캠페인 품절 대비",
  "quality-recovery-planner": "품질 회수 계획",
  "alternative-material-review": "대체 원료 검토",
  "big-order-capacity-check": "대형 수주 생산 점검",
  "sales-rebate-checker": "판매장려금 점검",
  "influencer-deal-calculator": "인플루언서 계약 계산",
  "project-timeline-planner": "프로젝트 일정(CPM)",
  "business-must-do-checklist": "사업자 필수 체크리스트",
  "business-toolkit": "경영 도구 모음",
};

/** 링크할 수 있는 스킬. 소스는 tools-oiyo skills/, 공개 배포는 github.com/yuli3/oiyo-skills. */
export const SKILLS: Record<string, { name: string; zip: string }> = {
  "oiyo-kr-law-guide": { name: "법령 길잡이 15분야", zip: "/downloads/oiyo-kr-law-guide-skill.zip" },
  "kr-tax-advisor": { name: "세무·회계 실무 보조", zip: "/downloads/oiyo-kr-tax-advisor-skill.zip" },
  "oiyo-kr-benefits-navigator": { name: "생활 지원금·노동권 길잡이", zip: "/downloads/oiyo-kr-benefits-navigator-skill.zip" },
  "oiyo-business-strategist": { name: "경영 전략 참모", zip: "/downloads/oiyo-business-strategist-skill.zip" },
};
export const SKILLS_REPO = "https://github.com/yuli3/oiyo-skills";
export const MCP_URL = "https://api.oiyo.net/mcp";

/** api.oiyo.net/mcp에 실제로 있는 도구 이름(api-oiyo tools-spec, 2026-11-17 v1.22.0 기준). */
export const MCP_TOOLS = [
  "search_kr_statutes", "start_kr_law_intake", "get_kr_professional_scope",
  "calculate_kr_freelancer_income_tax", "calculate_capital_gains_tax", "calculate_inheritance_gift_tax",
  "calculate_kr_year_end_settlement", "check_kr_dependent_deduction", "calculate_kr_monthly_rent_credit", "calculate_card_tax_deduction",
  "value_kr_unlisted_shares", "calculate_kr_family_business_deduction", "get_kr_business_tax_calendar", "plan_kr_inheritance_gift_filing_deadline",
  "check_kr_business_day", "calculate_kr_business_car_expense", "compare_kr_general_vs_simplified_vat", "calculate_kr_incorporation_conversion",
  "calculate_dcf_valuation", "calculate_cagr", "calculate_unit_economics_runway",
  "calculate_kr_ordinary_wage", "calculate_overtime_pay", "calculate_weekly_allowance", "calculate_severance_pay", "check_kr_fixed_overtime_pay", "get_kr_minimum_wage",
  "calculate_annual_leave", "calculate_kr_maternity_leave_pay", "calculate_kr_reduced_hours_childcare_pay", "calculate_health_insurance", "calculate_net_salary",
  "calculate_kr_dismissal_notice_pay", "calculate_kr_wage_guarantee", "calculate_kr_shutdown_allowance", "plan_kr_annual_leave_promotion", "check_kr_probation_minimum_wage",
  "calculate_kr_injury_leave_pay", "calculate_unemployment_benefits", "check_kr_voluntary_quit_unemployment",
  "calculate_kr_acquisition_tax", "diagnose_hug_guarantee", "calculate_compound_interest", "calculate_kr_long_term_care_copay",
  "compare_kr_inherited_house_valuation", "compare_kr_ticket_vs_presale_tax", "calculate_kr_property_tax",
  "calculate_kr_fine_reduction", "calculate_kr_import_duty", "simulate_ifrs17_csm", "calculate_kics_ratio", "calculate_insurance_claim_payout", "analyze_journal_entries", "get_kr_practice_guide", "check_insurance_explanation_record",
  "analyze_swot", "analyze_market_test", "plan_campaign_supply", "plan_quality_recovery", "compare_alternative_materials", "check_big_order_capacity", "check_sales_rebates",
] as const;

export const isGap = (x: Competency) => x.tools.length + x.skills.length + x.mcp.length === 0;
export const toolHref = (slug: string) => `/ko/${slug}/`;

/** 직업 × 분류 칸마다 역량 수와 도구가 붙은 수. */
export function coverage() {
  return JOBS.map((j) => ({
    job: j.id,
    cells: CATEGORIES.map((cat) => {
      const list = COMPETENCIES.filter((x) => x.job === j.id && x.cat === cat.id);
      return { cat: cat.id, total: list.length, linked: list.filter((x) => !isGap(x)).length };
    }),
  }));
}
