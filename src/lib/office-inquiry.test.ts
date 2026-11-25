import { test } from "node:test";
import assert from "node:assert/strict";
import { officeInquiryBody, officeInquiryMailto, officeInquirySubject, OFFICE_INQUIRY_EMAIL } from "./office-inquiry.ts";

test("제목은 사무소 이름을 한 줄로 붙여요", () => {
  assert.equal(officeInquirySubject({}), "[사무소 위젯 문의]");
  assert.equal(officeInquirySubject({ office: " 한빛\n세무회계 " }), "[사무소 위젯 문의] 한빛 세무회계");
});

test("본문에 입력값이 들어가고 줄바꿈 주입을 막아요", () => {
  const b = officeInquiryBody({ office: "한빛", field: "노무", site: "https://a.kr\nBcc: x@y.z", tools: "연차, 퇴직금" });
  assert.match(b, /사무소 이름: 한빛/);
  assert.match(b, /분야: 노무/);
  assert.match(b, /홈페이지: https:\/\/a\.kr Bcc: x@y\.z/);
  assert.match(b, /원하는 계산기: 연차, 퇴직금/);
});

test("mailto는 문의 주소 하나로만 가고 값은 인코딩돼요", () => {
  const m = officeInquiryMailto({ office: "A&B?to=evil@x.com" });
  assert.ok(m.startsWith(`mailto:${OFFICE_INQUIRY_EMAIL}?subject=`));
  assert.equal(m.split("?").length, 2);
  assert.ok(!m.includes("&to="));
  assert.ok(m.includes("%26"));
});

test("office team interest mail carries price and page", async () => {
  const { officeTeamMailto, OFFICE_TEAM_PRICE_KRW, OFFICE_TEAM_FEATURES } = await import("./office-inquiry.ts");
  const href = officeTeamMailto("client-deadline-board", "가나\n세무회계");
  assert.ok(href.startsWith("mailto:support@oiyo.net?subject="));
  const body = decodeURIComponent(href.split("&body=")[1]);
  assert.match(body, /29,000원/);
  assert.match(body, /client-deadline-board/);
  assert.match(decodeURIComponent(href), /\[팀 기능 미리 신청\] 가나 세무회계/);
  assert.equal(OFFICE_TEAM_PRICE_KRW, 29000);
  assert.equal(OFFICE_TEAM_FEATURES.length, 3);
});
