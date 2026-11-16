// 세금·회계·노동·행정·등기 법령 길잡이 (2026-11-16). 엔진: src/lib/kr-expert-guide-2026.ts.
// 자격 명칭(세무사·노무사 등)을 이름에 쓰지 않아요(각 자격법의 유사명칭 금지, 개정 세무사법 제20조 제3항).
import type { DomainId } from "../lib/kr-expert-guide-2026";

export const lawGuides: { slug: string; domain?: DomainId; title: string; description: string }[] = [
  { slug: "law-guide", title: "법령 길잡이 5분야", description: "세금·회계·노동·행정·등기 문제를 고르면 먼저 필요한 질문을 하고, 근거 조문과 신고·신청 기한(D-day), 계산기, 무료 공공 창구를 정리해 줘요." },
  { slug: "tax-law-guide", domain: "tax", title: "세금 법령 길잡이", description: "고지서 불복, 신고 누락·수정신고, 상속·증여, 집 팔 때 양도세의 기한과 근거 조문, 가산세 감면 구간을 질문 몇 개로 정리해요." },
  { slug: "accounting-law-guide", domain: "accounting", title: "회계·장부 법령 길잡이", description: "복식부기·간편장부·성실신고 대상, 외부감사 대상인지, 법인세 신고와 배당 한도를 기준표와 조문으로 판정해요." },
  { slug: "labor-law-guide", domain: "labor", title: "노동법 길잡이", description: "해고·임금체불·직장 내 괴롭힘·산재에서 5인 미만 여부, 구제신청 3개월 같은 기한, 근거 조문과 무료 상담 창구를 알려 줘요." },
  { slug: "administrative-law-guide", domain: "admin", title: "행정 절차 길잡이", description: "영업정지·허가취소, 인허가 거부, 과태료·범칙금, 정보공개에서 의견제출·이의신청·행정심판·소송 기한을 계산해요." },
  { slug: "registry-court-law-guide", domain: "court", title: "등기·법원 서류 길잡이", description: "상속 포기·한정승인, 부동산 이전등기, 빌려준 돈 받기(지급명령·소액), 전세보증금, 법인 변경등기의 기한과 절차를 정리해요." },
];
