// 1~3월 세무 시즌 점검표 (2026 귀속 연말정산·부가세 확정·사업장현황신고·결산, 2026-11-21 20개 계획 #1).
// 법정 기한은 조문 날짜이고, 주말·공휴일이면 다음 영업일로 미뤄요(국세기본법 제5조①, lib/kr-business-day).
// 회사가 정하는 날(연말정산 서류 제출일)이나 관행(간소화 자료 1월 15일 개통)은 "회사 공지·국세청 안내 확인"으로만 써요.
import { krTaxDeadlineUTC } from "./kr-business-day.ts";

export const SEASON_AS_OF = "2026-11-21";
export type Role = "employee" | "employer" | "vat" | "exempt" | "corp";
export const ROLE_LABEL: Record<Role, string> = {
  employee: "월급 받는 근로자", employer: "직원에게 월급 주는 사업주", vat: "과세 개인사업자", exempt: "면세 개인사업자·프리랜서", corp: "법인(12월 결산)",
};

export interface SeasonTask {
  id: string;
  roles: Role[];
  label: string;
  /** 법정 기한(YYYY-MM-DD) — null이면 회사·기관 공지에 따라 달라요 */
  statutory: string | null;
  cite: string;
  tool?: { href: string; name: string };
  note?: string;
}

export const SEASON_TASKS: SeasonTask[] = [
  { id: "wht-dec", roles: ["employer", "corp"], label: "12월분 원천세(근로·사업소득 등) 신고·납부", statutory: "2027-01-10", cite: "소득세법 제128조①", tool: { href: "/ko/withholding-statement-penalty-calculator/", name: "지급명세서 기한·가산세" } },
  { id: "vat-2", roles: ["vat", "corp"], label: "부가가치세 2기 확정 신고·납부(2026년 7~12월분)", statutory: "2027-01-25", cite: "부가가치세법 제49조①", tool: { href: "/ko/vat-calculator/", name: "부가세 계산기" } },
  { id: "simplified-data", roles: ["employee"], label: "연말정산 간소화 자료 내려받기(홈택스)", statutory: null, cite: "국세청 안내", note: "개통일은 국세청 공지로 확인해요(해마다 1월 중순)." },
  { id: "ye-submit", roles: ["employee"], label: "회사에 공제 신고서·증빙 내기", statutory: null, cite: "소득세법 제140조", tool: { href: "/ko/year-end-settlement-calculator/", name: "연말정산 계산기" }, note: "제출 마감은 회사가 정해요." },
  { id: "dependents", roles: ["employee"], label: "부양가족 공제 중복·소득 요건 점검", statutory: null, cite: "소득세법 제50조", tool: { href: "/ko/dependent-deduction-checker/", name: "부양가족 공제 점검" } },
  { id: "ye-settle", roles: ["employer", "corp"], label: "연말정산 반영(2월분 급여 지급 때)", statutory: null, cite: "소득세법 제137조①", tool: { href: "/ko/year-end-settlement-calculator/", name: "연말정산 계산기" }, note: "2월분 급여를 지급할 때 정산해요." },
  { id: "exempt-report", roles: ["exempt"], label: "사업장현황신고(면세 매출·계산서합계표)", statutory: "2027-02-10", cite: "소득세법 제78조①", tool: { href: "/ko/exempt-business-report-checker/", name: "사업장현황신고 점검" } },
  { id: "pay-stmt-feb", roles: ["employer", "corp"], label: "이자·배당·기타소득 지급명세서 제출(2026년 지급분)", statutory: "2027-02-28", cite: "소득세법 제164조①", tool: { href: "/ko/withholding-statement-penalty-calculator/", name: "지급명세서 기한·가산세" } },
  { id: "wht-feb", roles: ["employer", "corp"], label: "2월분 원천세 신고·납부(연말정산 결과 포함)", statutory: "2027-03-10", cite: "소득세법 제128조①" },
  { id: "pay-stmt-mar", roles: ["employer", "corp"], label: "근로·퇴직·사업소득 지급명세서 제출(2026년 지급분)", statutory: "2027-03-10", cite: "소득세법 제164조①", tool: { href: "/ko/withholding-statement-penalty-calculator/", name: "지급명세서 기한·가산세" } },
  { id: "corp-tax", roles: ["corp"], label: "법인세 신고·납부(2026 사업연도, 12월 결산)", statutory: "2027-03-31", cite: "법인세법 제60조①", tool: { href: "/ko/corporate-tax-adjustment-calculator/", name: "법인세 세무조정 계산기" } },
];

export function seasonPlan(role: Role, today: string) {
  const t0 = Date.parse(today);
  const rows = SEASON_TASKS.filter((t) => t.roles.includes(role)).map((t) => {
    const due = t.statutory ? krTaxDeadlineUTC(new Date(Date.parse(t.statutory))).toISOString().slice(0, 10) : null;
    const shifted = !!due && due !== t.statutory;
    const daysLeft = due ? Math.round((Date.parse(due) - t0) / 86_400_000) : null;
    return { ...t, due, shifted, daysLeft };
  });
  rows.sort((a, b) => (a.due ?? "9999") < (b.due ?? "9999") ? -1 : (a.due ?? "9999") > (b.due ?? "9999") ? 1 : 0);
  return rows;
}
