// 국가장학금 1차 신청 안내·지원금액 계산 (2026-11-21, 20개 계획 #2).
// 일정: 2027학년도 1학기 1차 신청 2026-11-24 09:00 ~ 2027-01-07 18:00, 서류 제출·가구원 정보제공 동의 2027-01-14 18:00
//   (서울대 자유전공학부 공지 2026-11-20, 비건뉴스 2026-11-18 보도 — 한국장학재단 안내 인용).
// 금액: 2026년 국가장학금 연간 지원금액(교수신문 2026-02-10, 교육부 발표 인용: 2025년 2학기 인상 단가 유지).
// 2027년 1학기부터 학자금 지원구간이 10구간 → 5구간(가~마)으로 바뀌어요. 새 구간별 금액·경곗값은 아직 확인하지 못해 계산하지 않아요.
// 확인 안 된 것(계산 안 함): 2027 구간별 금액, 가~마 구간 경곗값, 성적 기준의 2027 세부, 2차 신청 기간.

export const SCHOLARSHIP_AS_OF = "2026-11-21";
export const SCHOLARSHIP_SCHEDULE = {
  applyStart: "2026-11-24T09:00",
  applyEnd: "2027-01-07T18:00",
  docsEnd: "2027-01-14T18:00",
} as const;

export type Bracket = "basic" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Children = "none" | "firstSecond" | "third";
export type SItem = { tone: "warn" | "info" | "good"; text: string; cite: string };

const CITE_AMT = "2026년 국가장학금 지원금액(교육부 발표, 교수신문 2026-02-10)";
const CITE_SCH = "2027학년도 1학기 1차 신청 공지(한국장학재단 안내)";

/** 2026년 연간 지원금액(원). null = 등록금 전액. 다자녀는 8구간 이하 셋째 이상이 전액. */
export function annual2026(b: Bracket, c: Children): number | null {
  if (b === "basic") return null;
  if (b === 10) return 0;
  if (c === "third") return b <= 8 ? null : 2_000_000;
  const band = b <= 3 ? 0 : b <= 6 ? 1 : b <= 8 ? 2 : 3;
  const base = [6_000_000, 4_400_000, 3_600_000, 1_000_000][band];
  const multi = [6_100_000, 5_050_000, 4_650_000, 1_350_000][band];
  return c === "firstSecond" ? multi : base;
}

const MIN = 60_000;
const at = (s: string) => Date.parse(s + ":00+09:00");

export function scholarship(x: { bracket: Bracket; children: Children; tuitionPerSemester?: number; student: "enrolled" | "freshman" | "returning"; now?: string }) {
  const yearly = annual2026(x.bracket, x.children);
  const tuition = Math.max(0, x.tuitionPerSemester ?? 0);
  const semester = yearly == null ? tuition : yearly / 2;
  const capped = tuition > 0 ? Math.min(semester, tuition) : semester;
  const now = x.now ? Date.parse(x.now) : NaN;
  const minutesLeft = (end: string) => (Number.isFinite(now) ? Math.floor((at(end) - now) / MIN) : null);
  const items: SItem[] = [];
  items.push({ tone: "warn", text: "2027년 1학기부터 학자금 지원구간이 10구간에서 5구간(가~마)으로 바뀌어요. 새 구간별 금액은 아직 확인하지 못해, 아래 금액은 2026년 기준이에요.", cite: "한국장학재단 안내(2027학년도 1학기 1차 신청 공지)" });
  if (x.student === "enrolled") items.push({ tone: "warn", text: "재학생은 1차 신청이 원칙이에요. 1차를 놓치면 재학 중 2번까지만 2차 신청 구제를 받아요.", cite: CITE_SCH });
  if (x.student === "freshman") items.push({ tone: "info", text: "입학 예정자는 대학이 정해지지 않았어도 신입생으로 1차 신청할 수 있어요.", cite: CITE_SCH });
  items.push({ tone: "warn", text: "신청만으로 끝나지 않아요. 부모(또는 배우자) 가구원 정보제공 동의와 서류 제출을 2027-01-14 18시까지 마쳐야 소득구간 산정이 시작돼요.", cite: CITE_SCH });
  if (yearly == null) items.push({ tone: "good", text: x.bracket === "basic" ? "기초생활수급자·차상위계층은 등록금 전액을 지원받을 수 있어요(성적 등 요건 충족 시)." : "8구간 이하 다자녀 가구의 셋째 이상은 등록금 전액을 지원받을 수 있어요(요건 충족 시).", cite: CITE_AMT });
  if (x.bracket === 10) items.push({ tone: "info", text: "10구간은 국가장학금 I유형 지원 대상이 아니에요. 대학 자체 장학금(II유형)과 다른 장학금을 확인해요.", cite: CITE_AMT });
  items.push({ tone: "info", text: "성적 기준(직전 학기 이수학점·성적)과 2차 신청 기간은 학기마다 공지가 나와요. 한국장학재단(1599-2000) 공지로 확인해요.", cite: "—" });
  return {
    yearly, semester, capped, fullTuition: yearly == null,
    startsInMinutes: minutesLeft(SCHOLARSHIP_SCHEDULE.applyStart),
    applyMinutesLeft: minutesLeft(SCHOLARSHIP_SCHEDULE.applyEnd),
    docsMinutesLeft: minutesLeft(SCHOLARSHIP_SCHEDULE.docsEnd),
    items,
  };
}

/** 구간별 연간 금액(같은 자녀 조건). 등록금 전액은 tuitionYear로 그려요. */
export function bracketBars(c: Children, tuitionYear: number) {
  const list: Bracket[] = ["basic", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return list.map((b) => ({ bracket: b, value: annual2026(b, c) ?? tuitionYear }));
}
