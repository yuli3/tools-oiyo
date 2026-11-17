// 법령 길잡이 10분야 (2026-11-16, 11-17 관세·특허·감정평가·중개 추가). 엔진: src/lib/kr-expert-guide-2026.ts.
// 자격 명칭(세무사·노무사 등)을 이름에 쓰지 않아요(각 자격법의 유사명칭 금지, 개정 세무사법 제20조 제3항).
import type { DomainId } from "../lib/kr-expert-guide-2026";

export const lawGuides: { slug: string; domain?: DomainId; title: string; description: string }[] = [
  { slug: "law-guide", title: "법령 길잡이 10분야", description: "세금·회계·노동·행정·등기·보험·관세·특허·감정평가·부동산 중개 문제를 고르면 먼저 필요한 질문을 하고, 근거 조문과 신고·신청 기한(D-day), 계산기, 무료 공공 창구를 정리해 줘요." },
  { slug: "tax-law-guide", domain: "tax", title: "세금 법령 길잡이", description: "고지서 불복, 신고 누락·수정신고, 상속·증여, 집 팔 때 양도세의 기한과 근거 조문, 가산세 감면 구간을 질문 몇 개로 정리해요." },
  { slug: "accounting-law-guide", domain: "accounting", title: "회계·장부 법령 길잡이", description: "복식부기·간편장부·성실신고 대상, 외부감사 대상인지, 법인세 신고와 배당 한도를 기준표와 조문으로 판정해요." },
  { slug: "labor-law-guide", domain: "labor", title: "노동법 길잡이", description: "해고·임금체불·직장 내 괴롭힘·산재에서 5인 미만 여부, 구제신청 3개월 같은 기한, 근거 조문과 무료 상담 창구를 알려 줘요." },
  { slug: "administrative-law-guide", domain: "admin", title: "행정 절차 길잡이", description: "영업정지·허가취소, 인허가 거부, 과태료·범칙금, 정보공개에서 의견제출·이의신청·행정심판·소송 기한을 계산해요." },
  { slug: "registry-court-law-guide", domain: "court", title: "등기·법원 서류 길잡이", description: "상속 포기·한정승인, 부동산 이전등기, 빌려준 돈 받기(지급명령·소액), 전세보증금, 법인 변경등기의 기한과 절차를 정리해요." },
  { slug: "insurance-law-guide", domain: "insurance", title: "보험 법령 길잡이", description: "청약철회 15일·30일, 약관 미설명 취소 3개월, 위법계약해지 1년, 보험금 청구 시효 3년, 고지의무 해지 3년 제한을 날짜로 계산하고, 설계사·대리점의 사은품 한도와 승환계약 기간을 점검해요." },
  { slug: "customs-law-guide", domain: "customs", title: "관세·통관 법령 길잡이", description: "해외직구 면세(150달러·미국발 200달러)와 합산과세, 관세 보정 6개월·경정청구 5년·불복 90일을 날짜로 계산해요." },
  { slug: "ip-law-guide", domain: "ip", title: "특허·상표 법령 길잡이", description: "먼저 공개한 발명의 공지예외 12개월, 거절이유통지 의견서와 거절결정 불복 3개월, 특허·상표 존속기간을 정리해요." },
  { slug: "appraisal-law-guide", domain: "appraisal", title: "감정평가·보상 법령 길잡이", description: "수용 보상금 이의신청 30일·행정소송 90일, 공시지가 이의신청 30일을 날짜로 계산하고 준비할 자료를 알려 줘요." },
  { slug: "realty-brokerage-law-guide", domain: "realty", title: "부동산 거래·중개 법령 길잡이", description: "중개보수 상한과 초과 수수, 거래·임대차 신고 30일, 중개사 설명과 달라 손해 봤을 때 배상·공제 청구와 시효를 정리해요." },
  { slug: "insurance-sales-compliance-checker", title: "보험 사은품 한도·승환 점검기", description: "월 보험료와 사은품 가액, 기존·신규 계약 날짜로 특별이익 한도(10%와 20만 원 중 적은 금액)와 승환계약 간주(1개월·6개월)를 판정해요. 설계사·대리점용." },
  { slug: "pro-competency-map", title: "전문 직업 역량 지도", description: "세무·회계·노무·행정·등기·보험·관세·특허·감정평가·중개·경영 13개 직업의 역량 105개를 7가지로 분류하고, 역량마다 계산 도구·Claude 스킬·MCP를 연결했어요. 일반인도 쓰는 역량만 골라 볼 수 있어요." },
  { slug: "insurance-premium-basics", title: "보험료 계산 원리", description: "나이·보험기간·보험금과 예정이율·사업비·위험률을 바꾸며 정기보험 보험료가 어떻게 만들어지는지 워터폴 그래프로 봐요." },
];
