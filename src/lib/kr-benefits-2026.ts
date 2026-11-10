// 생애주기 혜택 찾기 (2026-11-10, CHOSEUN 선택 "3편 + 혜택 찾기 도구").
// Amounts come from the MOHW booklet "2026 나에게 힘이 되는 복지서비스" (노령층·임신출산영유아·아동청소년·청년층)
// unless `source` says otherwise. The same list backs the three blog hub posts; change both together.
// Nothing the visitor picks is stored: the filter runs in the browser only.

export const BENEFITS_AS_OF = "2026-11-10";

export type Group = "senior" | "child" | "newlywed";
export type AgeBand = "60-64" | "65-69" | "70+";
export type ChildStage = "planning" | "pregnant" | "age0" | "age1" | "age2to5" | "elementary";
export type Answer = "yes" | "no" | "unknown";

export interface Cond {
  ages?: AgeBand[];
  stages?: ChildStage[];
  basicPension?: true; // 기초연금 수급자
  lowIncome?: true; // 기초생활수급·차상위 등 저소득
  alone?: true; // 혼자 사는 어르신
  employed?: true; // 고용보험 가입 근로자
  noHome?: true; // 무주택
  registered2026?: true; // 2026년 안에 혼인신고(했거나 할 예정)
  hasBaby?: true; // 2023년 이후 태어난 아이가 있음
}

export interface Benefit {
  id: string;
  group: Group;
  category: string;
  name: string;
  amount: string;
  who: string;
  apply: string;
  cond: Cond;
  source: "official" | "press";
  note2027?: string;
}

export const BENEFITS: Benefit[] = [
  // ── 65세 이상 ─────────────────────────────────────────────
  { id: "basic-pension", group: "senior", category: "소득", name: "기초연금", amount: "단독 월 최대 349,700원, 부부 각 279,760원", who: "65세 이상, 소득인정액 단독 247만 원·부부 395만 2천 원 이하", apply: "주민센터, 국민연금공단(1355), 복지로", cond: { ages: ["65-69", "70+"] }, source: "official", note2027: "정부안: 소득 하위 30%에 월 3만 원 추가" },
  { id: "senior-job-public", group: "senior", category: "소득", name: "노인일자리 공익활동", amount: "월 30시간, 활동비 월 29만 원", who: "65세 이상 기초연금 수급자", apply: "주민센터, 시니어클럽·노인복지관(1544-3388)", cond: { ages: ["65-69", "70+"], basicPension: true }, source: "official" },
  { id: "senior-job-service", group: "senior", category: "소득", name: "노인일자리 사회서비스형", amount: "월 60시간, 월 최대 634,000원", who: "65세 이상", apply: "노인일자리 수행기관(1544-3388)", cond: { ages: ["65-69", "70+"] }, source: "official" },
  { id: "housing-pension", group: "senior", category: "소득", name: "주택연금", amount: "집값 3억·70세 가입 시 월 약 92만 3천 원(종신 정액형)", who: "55세 이상, 공시가 12억 원 이하 주택 보유", apply: "한국주택금융공사(1688-8114)", cond: {}, source: "official" },
  { id: "emergency-welfare", group: "senior", category: "소득", name: "긴급복지 지원", amount: "생계비(4인 199만 4,600원, 최대 6회), 의료 300만 원, 장제비 80만 원 등", who: "갑작스러운 위기 + 중위소득 75% 이하", apply: "시군구, 주민센터, 129", cond: { lowIncome: true }, source: "official" },
  { id: "transit", group: "senior", category: "교통·문화", name: "지하철 무료·철도 할인", amount: "지하철 무료, KTX·새마을·무궁화 30%(KTX·새마을은 주말·공휴일 제외)", who: "65세 이상", apply: "신분증 제시", cond: { ages: ["65-69", "70+"] }, source: "official" },
  { id: "kpass-senior", group: "senior", category: "교통·문화", name: "K-패스 어르신 환급", amount: "대중교통비 30% 환급", who: "65세 이상 K-패스 가입자", apply: "K-패스 카드사", cond: { ages: ["65-69", "70+"] }, source: "press" },
  { id: "culture", group: "senior", category: "교통·문화", name: "고궁·박물관 무료, 공연 할인", amount: "고궁·국공립 박물관·미술관 무료, 국가·지자체 공연장 50%", who: "65세 이상", apply: "현장", cond: { ages: ["65-69", "70+"] }, source: "official" },
  { id: "telecom", group: "senior", category: "요금", name: "휴대폰 요금 감면", amount: "요금 50%, 월 최대 11,000원", who: "기초연금 수급자", apply: "통신사 대리점, 주민센터, 정부24", cond: { ages: ["65-69", "70+"], basicPension: true }, source: "official" },
  { id: "energy-voucher", group: "senior", category: "요금", name: "에너지바우처", amount: "가구당 평균 367,000원(전기·가스·연탄)", who: "생계·의료·주거·교육급여 수급 세대 중 노인 포함", apply: "6~12월 주민센터, 복지로(1600-3190)", cond: { ages: ["65-69", "70+"], lowIncome: true }, source: "official" },
  { id: "flu-pneumo", group: "senior", category: "건강", name: "독감·폐렴구균 무료 접종", amount: "독감 매년 1회, 폐렴구균(PPSV23) 1회 무료", who: "65세 이상", apply: "위탁의료기관, 보건소(신분증 지참)", cond: { ages: ["65-69", "70+"] }, source: "official" },
  { id: "checkup", group: "senior", category: "건강", name: "노인 건강검진 항목", amount: "인지기능장애 검사, 노인신체기능 검사(66·70·80세)", who: "66세 이상", apply: "건강검진기관(1577-1000)", cond: { ages: ["65-69", "70+"] }, source: "official" },
  { id: "implant", group: "senior", category: "건강", name: "치과 임플란트", amount: "평생 2개, 본인부담 30%(의료급여 1종 10%·2종 20%)", who: "65세 이상 부분 무치악", apply: "치과 병·의원", cond: { ages: ["65-69", "70+"] }, source: "official" },
  { id: "denture", group: "senior", category: "건강", name: "틀니", amount: "본인부담 30%(의료급여 1종 5%·2종 15%)", who: "65세 이상", apply: "치과 병·의원", cond: { ages: ["65-69", "70+"] }, source: "official" },
  { id: "outpatient-flat", group: "senior", category: "건강", name: "동네 의원 외래 정액제", amount: "진료비 1만 5천 원 이하면 1,500원만 냄", who: "65세 이상", apply: "자동 적용", cond: { ages: ["65-69", "70+"] }, source: "press" },
  { id: "eye-surgery", group: "senior", category: "건강", name: "안검진·개안수술", amount: "백내장·망막 수술 본인부담 전액 지원", who: "60세 이상(수술은 기초·차상위·한부모)", apply: "보건소, 한국실명예방재단(02-718-1102)", cond: { ages: ["60-64", "65-69", "70+"], lowIncome: true }, source: "official" },
  { id: "knee", group: "senior", category: "건강", name: "무릎인공관절 수술비", amount: "한쪽 무릎 최대 120만 원", who: "60세 이상 기초·차상위·한부모", apply: "보건소, 노인의료나눔재단(02-711-6599)", cond: { ages: ["60-64", "65-69", "70+"], lowIncome: true }, source: "official" },
  { id: "dementia-check", group: "senior", category: "치매", name: "치매 검진", amount: "선별검사 무료, 진단검사 15만 원 한도(중위 120% 이하)", who: "60세 이상", apply: "보건소 치매안심센터(1899-9988)", cond: { ages: ["60-64", "65-69", "70+"] }, source: "official" },
  { id: "dementia-care", group: "senior", category: "치매", name: "치매치료관리비", amount: "월 최대 3만 원(연 36만 원)", who: "60세 이상 치매 진단, 소득 기준 충족", apply: "보건소 치매안심센터", cond: { ages: ["60-64", "65-69", "70+"] }, source: "official" },
  { id: "ltc", group: "senior", category: "돌봄", name: "노인장기요양보험", amount: "재가 본인부담 15%, 시설 20%, 가족요양비 월 240,450원", who: "65세 이상 장기요양등급 인정자", apply: "국민건강보험공단(1577-1000)", cond: { ages: ["65-69", "70+"] }, source: "official" },
  { id: "custom-care", group: "senior", category: "돌봄", name: "노인맞춤돌봄서비스", amount: "안부확인·말벗·생활지원 방문", who: "65세 이상 기초연금 수급 등, 돌봄 필요", apply: "주민센터(129)", cond: { ages: ["65-69", "70+"], basicPension: true }, source: "official" },
  { id: "emergency-safety", group: "senior", category: "돌봄", name: "응급안전안심서비스", amount: "화재·활동감지기·응급호출기 무료 설치, 119 연결", who: "혼자 사는 65세 이상 등", apply: "주민센터(1566-3232)", cond: { ages: ["65-69", "70+"], alone: true }, source: "official" },
  { id: "senior-housing", group: "senior", category: "주거", name: "고령자 매입임대·행복주택", amount: "시세 40~80% 임대, 고령자 매입임대는 갱신 제한 없음", who: "65세 이상 무주택, 소득·자산 기준", apply: "주민센터, LH(1600-1004)", cond: { ages: ["65-69", "70+"], lowIncome: true }, source: "official" },
  { id: "dependent-deduction", group: "senior", category: "세금", name: "부모님 부양가족·경로우대공제", amount: "자녀 연말정산에서 1인 150만 원, 70세 이상 100만 원 추가", who: "60세 이상 부모(연소득 100만 원 이하)", apply: "자녀의 연말정산", cond: { ages: ["60-64", "65-69", "70+"] }, source: "press" },
  { id: "taxfree-savings", group: "senior", category: "세금", name: "비과세종합저축", amount: "1인 5,000만 원까지 이자·배당 비과세", who: "2026년 신규 가입은 65세 이상 기초연금 수급자", apply: "은행·증권사", cond: { ages: ["65-69", "70+"], basicPension: true }, source: "press" },
  { id: "comp-property-tax", group: "senior", category: "세금", name: "종부세 고령자 세액공제", amount: "60세 20%, 65세 30%, 70세 40%(장기보유 합산 최대 80%)", who: "60세 이상 1세대 1주택 종부세 대상", apply: "자동 적용", cond: { ages: ["60-64", "65-69", "70+"] }, source: "press" },
  { id: "pension-tax", group: "senior", category: "세금", name: "연금소득 저율과세", amount: "5.5%(70세 미만), 4.4%(70~79세), 3.3%(80세 이상), 연 1,500만 원까지 분리과세", who: "연금저축·IRP 수령자", apply: "금융사", cond: {}, source: "press" },

  // ── 임신·출산~초등 ───────────────────────────────────────
  { id: "preconception", group: "child", category: "임신", name: "임신 사전건강관리", amount: "검사비 여성 13만 원·남성 5만 원, 최대 3회", who: "임신을 준비하는 부부(예비부부 포함)", apply: "보건소, e보건소", cond: { stages: ["planning"] }, source: "official" },
  { id: "ivf", group: "child", category: "임신", name: "난임 시술비", amount: "체외수정 신선배아 최대 110만 원, 동결 50만 원, 인공수정 30만 원", who: "난임 진단 부부(소득 무관)", apply: "보건소, 정부24", cond: { stages: ["planning"] }, source: "official" },
  { id: "ivf-leave", group: "child", category: "임신", name: "난임치료휴가", amount: "연 6일, 처음 2일 유급", who: "근로자", apply: "회사, 고용24", cond: { stages: ["planning"], employed: true }, source: "official" },
  { id: "pregnancy-card", group: "child", category: "임신", name: "임신·출산 진료비(국민행복카드)", amount: "100만 원(다태아 태아당 100만 원), 분만취약지 20만 원 추가", who: "임신부", apply: "건보공단, 카드사", cond: { stages: ["pregnant"] }, source: "official" },
  { id: "high-risk", group: "child", category: "임신", name: "고위험 임산부 의료비", amount: "입원비 90%, 300만 원 한도", who: "19개 고위험 임신질환 입원", apply: "보건소(분만 후 6개월 내)", cond: { stages: ["pregnant"] }, source: "official" },
  { id: "iron-folate", group: "child", category: "임신", name: "철분제·엽산제", amount: "무료", who: "임신부(엽산은 임신 전후 3개월)", apply: "보건소", cond: { stages: ["planning", "pregnant"] }, source: "official" },
  { id: "mom-insurance", group: "child", category: "임신", name: "우체국 엄마보험", amount: "무료, 태아 희귀질환 진단금 100만 원", who: "임신부", apply: "우체국", cond: { stages: ["pregnant"] }, source: "official" },
  { id: "first-meeting", group: "child", category: "출산", name: "첫만남이용권", amount: "첫째 200만 원, 둘째부터 300만 원 바우처", who: "출생아", apply: "주민센터, 복지로(2년 안에 사용)", cond: { stages: ["pregnant", "age0"] }, source: "official", note2027: "정부안: 2027-07-01 이후 출생아부터 아이맞이지원금(첫째 1,000만·둘째 1,200만·셋째+ 1,500만 원)으로 통합" },
  { id: "postpartum", group: "child", category: "출산", name: "산모·신생아 건강관리", amount: "산후도우미 바우처 5~40일", who: "출산 가정", apply: "보건소, 복지로(예정일 40일 전~출산 후 60일)", cond: { stages: ["pregnant", "age0"] }, source: "official" },
  { id: "maternity-leave", group: "child", category: "출산", name: "출산전후휴가 급여", amount: "90일(단태아), 월 상한 220만 원", who: "고용보험 가입 근로자", apply: "고용24", cond: { stages: ["pregnant", "age0"], employed: true }, source: "official" },
  { id: "paternity-leave", group: "child", category: "출산", name: "배우자 출산휴가", amount: "20일 유급(급여 상한 1,684,410원)", who: "배우자가 출산한 근로자", apply: "회사, 고용24", cond: { stages: ["pregnant", "age0"], employed: true }, source: "official" },
  { id: "birth-benefit-uninsured", group: "child", category: "출산", name: "고용보험 미적용자 출산급여", amount: "150만 원", who: "프리랜서·1인 자영업자 등", apply: "고용24(출산 후 1년 안)", cond: { stages: ["pregnant", "age0"] }, source: "official" },
  { id: "parent-pay", group: "child", category: "0~5세", name: "부모급여", amount: "0세 월 100만 원, 1세 월 50만 원(어린이집 이용 시 보육료 차감)", who: "0~1세 아이", apply: "주민센터, 복지로(출생 60일 안 신청해야 소급)", cond: { stages: ["age0", "age1"] }, source: "official", note2027: "정부안: 2027-07-01 이후 출생아는 아이맞이지원금으로 통합" },
  { id: "child-allowance", group: "child", category: "0~5세", name: "아동수당", amount: "월 10만 원 + 비수도권·인구감소지역 5천~2만 원 추가", who: "9세 미만(2030년까지 매년 1세씩 확대)", apply: "주민센터, 복지로", cond: { stages: ["age0", "age1", "age2to5", "elementary"] }, source: "official", note2027: "정부안: 2027-07-01 이후 출생아부터 아동기본수당 월 20만 원" },
  { id: "parental-leave", group: "child", category: "0~5세", name: "육아휴직 급여", amount: "1~3개월 월 250만, 4~6개월 200만, 7개월부터 160만 원 상한", who: "고용보험 가입 근로자, 8세 이하 자녀", apply: "고용24", cond: { stages: ["age0", "age1", "age2to5", "elementary"], employed: true }, source: "official" },
  { id: "six-plus-six", group: "child", category: "0~5세", name: "6+6 부모육아휴직", amount: "부모 모두 쉬면 첫 6개월 상한 250→450만 원, 1인 6개월 최대 2,000만 원", who: "생후 18개월 안에 부모 모두 육아휴직", apply: "고용24", cond: { stages: ["age0", "age1"], employed: true }, source: "official" },
  { id: "daycare-0-2", group: "child", category: "0~5세", name: "0~2세 보육료", amount: "월 42만 6천~58만 4천 원(국민행복카드)", who: "어린이집 다니는 0~2세", apply: "복지로", cond: { stages: ["age0", "age1", "age2to5"] }, source: "official" },
  { id: "nuri", group: "child", category: "0~5세", name: "3~5세 누리과정", amount: "사립 유치원·어린이집 월 28만 원, 국공립 유치원 10만 원 + 방과후비", who: "3~5세", apply: "복지로", cond: { stages: ["age2to5"] }, source: "official" },
  { id: "home-care", group: "child", category: "0~5세", name: "가정양육수당", amount: "월 10만 원(농어촌 15만 6천 원)", who: "어린이집·유치원 안 다니는 24~86개월", apply: "복지로", cond: { stages: ["age2to5"] }, source: "official" },
  { id: "vaccination", group: "child", category: "0~5세", name: "어린이 국가예방접종", amount: "17종 무료, 2026 가을부터 14세 독감까지", who: "12세 이하", apply: "위탁의료기관, 보건소", cond: { stages: ["age0", "age1", "age2to5", "elementary"] }, source: "official" },
  { id: "neulbom", group: "child", category: "초등", name: "늘봄학교", amount: "정규수업 외 교육·돌봄", who: "희망하는 초등학생", apply: "학교 늘봄지원실", cond: { stages: ["elementary"] }, source: "official" },
  { id: "together-care", group: "child", category: "초등", name: "다함께돌봄", amount: "학기 중 13~20시, 방학 9~18시 돌봄", who: "6~12세", apply: "센터, 정부24", cond: { stages: ["elementary"] }, source: "official" },
  { id: "child-inpatient", group: "child", category: "초등", name: "아동 입원진료비", amount: "본인부담 5%", who: "15세 이하", apply: "자동 적용", cond: { stages: ["age0", "age1", "age2to5", "elementary"] }, source: "official" },
  { id: "after-school-voucher", group: "child", category: "초등", name: "방과후 자유수강권", amount: "연 60만 원 내외", who: "기초·차상위·한부모 초·중·고생", apply: "복지로, 교육비 원클릭", cond: { stages: ["elementary"], lowIncome: true }, source: "official" },
  { id: "sports-voucher", group: "child", category: "초등", name: "스포츠강좌이용권", amount: "월 10.5만 원 이내", who: "기초·차상위·한부모 5~18세", apply: "누리집(매년 11월 접수)", cond: { stages: ["age2to5", "elementary"], lowIncome: true }, source: "official" },
  { id: "birth-tax-credit", group: "child", category: "세금", name: "출산·입양 세액공제", amount: "첫째 30만, 둘째 50만, 셋째+ 70만 원", who: "그해 아이를 낳거나 입양한 근로자·사업자", apply: "연말정산", cond: { stages: ["age0"] }, source: "press", note2027: "정부안: 2026년 말 폐지하고 재정지원으로 전환" },
  { id: "child-tax-credit", group: "child", category: "세금", name: "자녀세액공제", amount: "1명 25만, 2명 55만, 3명부터 1명당 40만 원 추가", who: "8세 이상 자녀", apply: "연말정산", cond: { stages: ["elementary"] }, source: "press" },
  { id: "childcare-allowance-taxfree", group: "child", category: "세금", name: "회사 보육수당 비과세", amount: "월 20만 원까지 비과세", who: "6세 이하 자녀를 둔 근로자", apply: "회사 급여 처리", cond: { stages: ["age0", "age1", "age2to5"], employed: true }, source: "press" },

  // ── 결혼·신혼 ────────────────────────────────────────────
  { id: "marriage-tax-credit", group: "newlywed", category: "세금", name: "결혼(혼인)세액공제", amount: "1인 50만 원, 부부 최대 100만 원(생애 1회)", who: "2024~2026년 혼인신고한 근로자·사업자", apply: "다음 해 연말정산·종합소득세", cond: { registered2026: true }, source: "press", note2027: "정부안: 2026년 말 종료, 재정지원으로 전환(금액 미정)" },
  { id: "marriage-gift", group: "newlywed", category: "세금", name: "혼인 증여재산공제", amount: "1인 1억 원 추가(기본 5천만 원 포함 1.5억, 부부 3억)", who: "혼인신고 전후 2년 안에 부모 등에게 받은 증여", apply: "증여세 신고", cond: {}, source: "press" },
  { id: "merge-two-homes", group: "newlywed", category: "세금", name: "혼인 합가 1주택 특례", amount: "각자 1주택이면 혼인 후 10년 안에 파는 집 1세대 1주택 비과세", who: "결혼 전 각자 집이 있던 부부", apply: "양도세 신고", cond: {}, source: "press" },
  { id: "newlywed-jeonse-loan", group: "newlywed", category: "주거", name: "신혼부부 버팀목 전세대출", amount: "수도권 2.5억·그 외 1.6억 원, 연 1.9~3.3%", who: "혼인 7년 안, 부부 소득 7,500만 원 이하, 무주택", apply: "기금 취급 은행", cond: { noHome: true }, source: "press" },
  { id: "newlywed-purchase-loan", group: "newlywed", category: "주거", name: "신혼부부 디딤돌 구입대출", amount: "최대 3.2억 원(주택 6억 이하), 연 2.55~3.85%", who: "혼인 7년 안, 부부 소득 8,500만 원 이하, 무주택", apply: "기금 취급 은행", cond: { noHome: true }, source: "press" },
  { id: "newborn-loan", group: "newlywed", category: "주거", name: "신생아 특례 대출", amount: "구입 최대 4억(연 1.8~4.5%), 전세 최대 2.4억 원(연 1.3~4.3%)", who: "2023년 이후 출생아, 출생 2년 안, 부부 소득 1.3억(맞벌이 2억) 이하", apply: "기금 취급 은행", cond: { noHome: true, hasBaby: true }, source: "press" },
  { id: "newlywed-purchase-rental-1", group: "newlywed", category: "주거", name: "신혼·신생아 매입임대 Ⅰ", amount: "시세 40% 이하, 최장 20년", who: "혼인 7년 안, 소득 70%(맞벌이 90%) 이하, 무주택", apply: "LH 청약플러스", cond: { noHome: true }, source: "official" },
  { id: "newlywed-purchase-rental-2", group: "newlywed", category: "주거", name: "신혼·신생아 매입임대 Ⅱ", amount: "시세 80% 이하, 최장 10년(유자녀 14년), 6년 뒤 분양전환 가능", who: "소득 130%(맞벌이 200%) 이하, 무주택", apply: "LH 청약플러스", cond: { noHome: true }, source: "official" },
  { id: "newlywed-jeonse-rental", group: "newlywed", category: "주거", name: "신혼부부 전세임대 Ⅰ·Ⅱ", amount: "수도권 1.45억(Ⅰ)·2.4억 원(Ⅱ)까지 LH가 전세 계약, 월 임대료 연 1.2~2.2%", who: "혼인 7년 안, 소득 70~130% 이하, 무주택", apply: "LH 청약플러스(1670-0002)", cond: { noHome: true }, source: "official" },
  { id: "happy-house", group: "newlywed", category: "주거", name: "행복주택(신혼)", amount: "시세 60~80%, 10~20년", who: "혼인 7년 안 또는 6세 이하 자녀, 소득 130% 이하", apply: "LH·SH 청약", cond: { noHome: true }, source: "official" },
  { id: "special-supply", group: "newlywed", category: "주거", name: "청약 신혼부부 특별공급", amount: "공고별 물량, 배우자 통장 기간 합산 등", who: "혼인 7년 안 무주택", apply: "청약홈", cond: { noHome: true }, source: "press" },
  { id: "preconception-couple", group: "newlywed", category: "건강", name: "임신 사전건강관리(예비부부)", amount: "검사비 여성 13만·남성 5만 원", who: "예비부부·신혼부부", apply: "보건소, e보건소", cond: {}, source: "official" },
];

export interface FinderInput {
  group: Group;
  age?: AgeBand;
  stage?: ChildStage;
  basicPension: Answer;
  lowIncome: Answer;
  alone: Answer;
  employed: Answer;
  noHome: Answer;
  registered2026: Answer;
  hasBaby: Answer;
}

export type Fit = "match" | "check";

export interface FinderResult {
  benefit: Benefit;
  fit: Fit;
  unknown: string[];
}

const COND_LABEL: Record<keyof Omit<Cond, "ages" | "stages">, string> = {
  basicPension: "기초연금 수급",
  lowIncome: "저소득(기초·차상위)",
  alone: "혼자 사는지",
  employed: "고용보험 가입",
  noHome: "무주택",
  registered2026: "2026년 혼인신고",
  hasBaby: "2023년 이후 출생아",
};

// A benefit drops out when the visitor said "no" to one of its conditions;
// an "unknown" answer keeps it but marks it as "조건 확인" so nothing is hidden by a guess.
export function findBenefits(input: FinderInput): FinderResult[] {
  const out: FinderResult[] = [];
  for (const b of BENEFITS) {
    if (b.group !== input.group) continue;
    if (b.cond.ages && (!input.age || !b.cond.ages.includes(input.age))) continue;
    if (b.cond.stages && (!input.stage || !b.cond.stages.includes(input.stage))) continue;
    const unknown: string[] = [];
    let excluded = false;
    for (const key of Object.keys(COND_LABEL) as (keyof typeof COND_LABEL)[]) {
      if (!b.cond[key]) continue;
      const a = input[key];
      if (a === "no") excluded = true;
      else if (a === "unknown") unknown.push(COND_LABEL[key]);
    }
    if (excluded) continue;
    out.push({ benefit: b, fit: unknown.length ? "check" : "match", unknown });
  }
  return out;
}

export const GROUP_LABEL: Record<Group, string> = {
  senior: "60세 이상 어르신",
  child: "임신·아이(초등학생까지)",
  newlywed: "결혼·신혼부부",
};

export const STAGE_LABEL: Record<ChildStage, string> = {
  planning: "임신 준비",
  pregnant: "임신 중",
  age0: "0세",
  age1: "1세",
  age2to5: "2~5세",
  elementary: "초등학생",
};

export const AGE_LABEL: Record<AgeBand, string> = {
  "60-64": "60~64세",
  "65-69": "65~69세",
  "70+": "70세 이상",
};
