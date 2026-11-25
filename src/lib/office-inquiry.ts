// 세무·노무 사무소용 위젯 문의 메일 (2026-11-23, 첫 B2B 문의 창구). 결제·가입 없이 메일 문의만 받아요.
// 입력값은 서버로 보내지 않고 mailto 주소에만 들어가요.
export const OFFICE_INQUIRY_EMAIL = "support@oiyo.net";

export const OFFICE_FIELDS = ["세무·회계", "노무", "법무·행정", "기타"] as const;

export interface OfficeInquiry {
  office?: string;
  field?: string;
  site?: string;
  tools?: string;
  message?: string;
}

const clip = (s: string | undefined, n: number) => (s ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, n);

export function officeInquirySubject(q: OfficeInquiry): string {
  const name = clip(q.office, 40);
  return name ? `[사무소 위젯 문의] ${name}` : "[사무소 위젯 문의]";
}

export function officeInquiryBody(q: OfficeInquiry): string {
  return [
    "안녕하세요. 사무소용 계산기 위젯을 문의해요.",
    "",
    `사무소 이름: ${clip(q.office, 40)}`,
    `분야: ${clip(q.field, 20)}`,
    `홈페이지: ${clip(q.site, 200)}`,
    `원하는 계산기: ${clip(q.tools, 200)}`,
    "",
    "더 하고 싶은 말:",
    (q.message ?? "").trim().slice(0, 1000),
  ].join("\n");
}

export function officeInquiryMailto(q: OfficeInquiry): string {
  const params = `subject=${encodeURIComponent(officeInquirySubject(q))}&body=${encodeURIComponent(officeInquiryBody(q))}`;
  return `mailto:${OFFICE_INQUIRY_EMAIL}?${params}`;
}

// 사무소 팀 기능 수요 확인 (2026-11-25, 싱크탱크 RT-07 유료 시험). 결제·가입 없이 예상 가격만 보여 주고 메일 신청 수를 셉니다.
// 비교 기준: 세모리포트 베이직 월 10만원(VAT 별도, 거래처 무제한).
export const OFFICE_TEAM_PRICE_KRW = 29000;
export const OFFICE_TEAM_FEATURES = [
  "직원 여러 명이 같은 고객 마감 보드를 함께 보기",
  "고객별 자료 요청 링크를 보내고 받은 서류를 체크하기",
  "마감 3일 전·당일 메일 알림",
] as const;

export function officeTeamMailto(page: string, office = ""): string {
  const name = clip(office, 40);
  const subject = name ? `[팀 기능 미리 신청] ${name}` : "[팀 기능 미리 신청]";
  const body = [
    "안녕하세요. 사무소 팀 기능이 나오면 써 보고 싶어요.",
    "",
    `사무소 이름: ${name}`,
    "직원 수: ",
    "맡은 고객 수: ",
    `본 페이지: ${clip(page, 80)}`,
    `예상 가격 월 ${OFFICE_TEAM_PRICE_KRW.toLocaleString("ko-KR")}원(VAT 별도)이면: 쓰겠다 / 비싸다 / 더 낼 수 있다`,
    "",
    "가장 필요한 기능:",
  ].join("\n");
  return `mailto:${OFFICE_INQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
