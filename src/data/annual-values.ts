// 해마다 바뀌는 기준값 목록 (2026-11-21, 지속 작업 B "2027 요율 전환 + 기준값 만료 경보").
// WHY: 계산 파일 80여 개가 2026 값을 쓰고, 1월 1일·7월 1일에 최저임금·4대보험·세법·고시 금액이 한꺼번에 바뀌어요.
// 값마다 어느 파일에 있는지, 다음 해 값이 어떤 상태인지(확정·발표·정부안·미확인)를 한곳에 적어 두고,
// scripts/annual-values-check.mjs가 10월부터 빈칸을 알려 줘요(Hermes 주간 잡, 모델 호출 없음).
// 값 자체는 각 lib가 정본이에요. 여기는 "언제 무엇을 확인할지" 목록이에요. 다음 해 값을 넣으면 status와 note를 고쳐요.

export type NextStatus =
  | "enacted" // 고시·법령으로 확정
  | "announced" // 위원회·부처 발표, 시행령·고시 전
  | "proposal" // 정부안·개정안(국회 통과 전)
  | "unknown" // 아직 확인 안 함
  | "no-change"; // 바뀌지 않는다고 확인

export type AnnualValue = {
  id: string;
  label: string;
  /** 값이 있는 파일(저장소 기준 경로). */
  file: string;
  /** 바뀌는 때. */
  cycle: "jan" | "jul" | "quarter" | "irregular" | "sunset";
  /** 지금 계산에 쓰는 값의 적용 연도. */
  year: number;
  /** 다음 해 값 상태와 메모(확인한 날짜·근거). */
  next: { year: number; status: NextStatus; note: string };
  /** 보통 발표되는 달(알림 시작 기준). */
  expectMonth?: number;
  /** cycle이 sunset일 때 끝나는 날. */
  until?: string;
};

export const ANNUAL_VALUES_AS_OF = "2026-11-21";

export const ANNUAL_VALUES: AnnualValue[] = [
  { id: "holidays", label: "공휴일 표(기한 계산)", file: "src/lib/kr-business-day.ts", cycle: "jan", year: 2027, next: { year: 2028, status: "unknown", note: "2027까지 있음. 2028 월력요항은 2027년 6월쯤 발표" }, expectMonth: 6 },
  { id: "min-wage", label: "최저임금", file: "src/lib/kr-rates-2026.mjs", cycle: "jan", year: 2026, next: { year: 2027, status: "enacted", note: "10,700원(kr-rates-2027.mjs). 급여 계산 전환은 1월 1일" }, expectMonth: 8 },
  { id: "pension-rate", label: "국민연금 보험료율", file: "src/lib/kr-rates-2026.mjs", cycle: "jan", year: 2026, next: { year: 2027, status: "announced", note: "9.5% → 10%(국민연금공단 안내, kr-rates-2027.mjs insuranceEvidence)" } },
  { id: "pension-bounds", label: "국민연금 기준소득월액 상·하한", file: "src/lib/kr-rates-2026.mjs", cycle: "jul", year: 2026, next: { year: 2027, status: "unknown", note: "2027-07 구간은 2027년 초 고시" }, expectMonth: 2 },
  { id: "health-rate", label: "건강보험료율", file: "src/lib/kr-rates-2026.mjs", cycle: "jan", year: 2026, next: { year: 2027, status: "announced", note: "7.19%(2026-09-08 건정심), 시행령 개정 확인 전" }, expectMonth: 12 },
  { id: "ltc-rate", label: "장기요양보험료율", file: "src/lib/kr-rates-2026.mjs", cycle: "jan", year: 2026, next: { year: 2027, status: "announced", note: "소득 대비 0.9994%(2026-10-30 발표)" }, expectMonth: 12 },
  { id: "health-caps", label: "건강보험료 월 상·하한", file: "src/lib/kr-rates-2026.mjs", cycle: "jan", year: 2026, next: { year: 2027, status: "unknown", note: "복지부 고시(보통 12월)" }, expectMonth: 12 },
  { id: "employment-rate", label: "고용보험 실업급여 요율", file: "src/lib/kr-rates-2026.mjs", cycle: "jan", year: 2026, next: { year: 2027, status: "announced", note: "1.8% → 2.0%(고용보험위원회 보고), 시행령 개정 확인 전" }, expectMonth: 12 },
  { id: "unemployment-daily", label: "실업급여 1일 상·하한", file: "src/lib/kr-rates-2026.mjs", cycle: "jan", year: 2026, next: { year: 2027, status: "unknown", note: "하한은 최저임금 80% × 8시간을 따라 오름. 상한은 시행령" } },
  { id: "parental-leave", label: "육아휴직·출산전후휴가 급여 한도", file: "src/lib/kr-welfare-2026.ts", cycle: "jan", year: 2026, next: { year: 2027, status: "unknown", note: "고용노동부 고시" }, expectMonth: 12 },
  { id: "injury-wage-cap", label: "산재 최고·최저 보상기준 금액", file: "src/lib/kr-injury-disability-2026.ts", cycle: "jan", year: 2026, next: { year: 2027, status: "unknown", note: "2026: 268,299 / 82,560원. 최저는 최저임금 × 8시간이라 2027은 85,600원 예상, 최고는 고시" }, expectMonth: 12 },
  { id: "income-tax", label: "소득세 세율·공제(연말정산)", file: "src/lib/kr-payroll-2026.ts", cycle: "jan", year: 2026, next: { year: 2027, status: "proposal", note: "2026 세제개편안 국회 계류(12월 통과 여부 확인)" }, expectMonth: 12 },
  { id: "dependent-income", label: "부양가족 소득 요건", file: "src/lib/kr-household-tax-2026.ts", cycle: "jan", year: 2026, next: { year: 2027, status: "proposal", note: "세제개편안 상향안(국회 통과 전)" }, expectMonth: 12 },
  { id: "corp-tax", label: "법인세율", file: "src/lib/kr-incorporation-2026.ts", cycle: "jan", year: 2026, next: { year: 2027, status: "unknown", note: "2026 사업연도부터 10·20·22·25%. 2027 변경안 확인 필요" }, expectMonth: 12 },
  { id: "vat-card-credit", label: "신용카드 매출세액공제", file: "src/lib/kr-vat-credits-2026.ts", cycle: "jan", year: 2026, next: { year: 2027, status: "proposal", note: "정부안 1.2%·연 500만 원(국회 통과 전)" }, expectMonth: 12 },
  { id: "vat-deemed-input", label: "의제매입세액공제 특례", file: "src/lib/kr-vat-credits-2026.ts", cycle: "sunset", year: 2026, next: { year: 2027, status: "proposal", note: "음식점 9/109 등 2028년까지 연장 정부안" }, until: "2026-12-31", expectMonth: 12 },
  { id: "simple-expense-rate", label: "단순경비율·기준경비율", file: "src/lib/kr-income-tax-2026.ts", cycle: "jan", year: 2025, next: { year: 2027, status: "unknown", note: "2026 귀속분은 국세청 경비율 고시(2027년 3월쯤)" }, expectMonth: 3 },
  { id: "student-loan-threshold", label: "학자금 상환기준소득", file: "src/lib/kr-nts-pack-2026.ts", cycle: "jan", year: 2026, next: { year: 2027, status: "unknown", note: "2,056만 원(교육부고시 제2026-12호, 2026학년도 2학기). 학기마다 새 고시" }, expectMonth: 1 },
  { id: "estimate-multiple", label: "추계 비교소득 배율(3.4·2.8)", file: "src/lib/kr-nts-pack-2026.ts", cycle: "sunset", year: 2026, next: { year: 2028, status: "unknown", note: "소득세법 시행규칙 제67조, 2027 귀속까지" }, until: "2027-12-31" },
  { id: "copay-cap", label: "본인부담상한액", file: "src/lib/kr-medical-cost-2026.ts", cycle: "jan", year: 2026, next: { year: 2027, status: "unknown", note: "전년 물가로 조정, 보통 1월 발표" }, expectMonth: 1 },
  { id: "basic-pension", label: "기초연금 기준연금액", file: "src/lib/kr-benefits-2026.ts", cycle: "jan", year: 2026, next: { year: 2027, status: "unknown", note: "물가 반영, 보통 1월 고시" }, expectMonth: 1 },
  { id: "earned-income-credit", label: "근로·자녀장려금 기준", file: "src/lib/kr-welfare-2026.ts", cycle: "irregular", year: 2026, next: { year: 2027, status: "unknown", note: "조특법 개정 여부(세제개편안) 확인" }, expectMonth: 12 },
  { id: "acquisition-relief", label: "취득세 감면(지특법 제57조의2 ④)", file: "src/lib/kr-advisory-2026.ts", cycle: "sunset", year: 2026, next: { year: 2028, status: "unknown", note: "2027-12-31 취득분까지" }, until: "2027-12-31" },
  { id: "small-tenant", label: "소액임차인 최우선변제 표", file: "src/lib/kr-auction-distribution-2026.ts", cycle: "irregular", year: 2023, next: { year: 2027, status: "no-change", note: "2023-02-21 개정이 마지막(2026-11-20 확인)" } },
  { id: "deposit-rate", label: "공탁금 이자율", file: "src/lib/kr-court-deposit-2026.ts", cycle: "irregular", year: 2022, next: { year: 2027, status: "no-change", note: "연 0.35%(2022-10-01 시행), 일수 계산 방식은 미확인" } },
  { id: "registration-fee", label: "등기신청수수료", file: "src/lib/kr-self-registration-2026.ts", cycle: "irregular", year: 2025, next: { year: 2027, status: "no-change", note: "2025-08-01 시행 금액" } },
  { id: "housing-bond", label: "국민주택채권 매입률", file: "src/lib/kr-self-registration-2026.ts", cycle: "irregular", year: 2026, next: { year: 2027, status: "unknown", note: "주택도시기금법 시행령 별표" } },
  { id: "f27-points", label: "거주(F-2-7) 점수표", file: "src/lib/kr-f27-points-2026.ts", cycle: "irregular", year: 2025, next: { year: 2027, status: "no-change", note: "법무부 고시 제2025-408호" } },
  { id: "electricity", label: "주택용 전기요금·연료비조정", file: "src/lib/kr-electricity-2026.ts", cycle: "quarter", year: 2026, next: { year: 2027, status: "unknown", note: "분기마다 연료비조정단가 발표" } },
];

/** 알림 목록: 다음 해 값이 확정되지 않았고 알릴 때가 된 항목, 6개월 안에 끝나는 한시 규정, 공휴일 표가 모자란 경우. */
export function annualAlerts(today: string, holidayYears: number[]) {
  const [y, m] = today.split("-").map(Number);
  const out: { id: string; level: "warn" | "info"; text: string }[] = [];
  for (const v of ANNUAL_VALUES) {
    if (v.cycle === "sunset" && v.until) {
      const months = (Number(v.until.slice(0, 4)) - y) * 12 + Number(v.until.slice(5, 7)) - m;
      if (months <= 6 && v.next.status !== "enacted") out.push({ id: v.id, level: "warn", text: `${v.label}: ${v.until}에 끝나요. 연장 여부 확인(${v.next.note})` });
      continue;
    }
    if (v.next.status === "enacted" || v.next.status === "no-change") continue;
    const dueYear = v.next.year;
    const late = y > dueYear - 1 || (y === dueYear - 1 && m >= 10);
    if (late) out.push({ id: v.id, level: y >= dueYear ? "warn" : "info", text: `${v.label}(${v.file}): ${dueYear}년 값 ${v.next.status}. ${v.next.note}` });
  }
  const maxHoliday = Math.max(...holidayYears);
  if (m >= 10 ? maxHoliday < y + 1 : maxHoliday < y) out.push({ id: "holidays", level: "warn", text: `공휴일 표가 ${maxHoliday}년까지예요. ${y + 1}년을 넣어요(src/lib/kr-business-day.ts).` });
  return out;
}
