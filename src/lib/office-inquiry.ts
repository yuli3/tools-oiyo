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
