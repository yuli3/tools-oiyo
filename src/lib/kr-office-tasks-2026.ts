// 사무소 실무 작업 2종 (2026-11-24, CHOSEUN "새로운 니즈를 찾아보고 우리 사무소에서 전문가들이 할 만한 작업들 찾기").
// 연관검색어: "2026년 급여대장 엑셀", "급여대장 자동화", "급여대장 소득세 계산" / "임대차 신고 안하면 벌금", "임대차 계약 신고 기한".
// 원문(국가법령정보센터, 2026-11-24 확인):
// - 근로기준법 시행령 제27조(임금대장 기재사항)·제27조의2(임금명세서 기재사항) (대통령령 제35436호, 2025. 10. 23. 시행)
// - 부동산 거래신고 등에 관한 법률 제6조의2·제6조의3·제6조의5·제28조⑤·제29조, 시행령 제4조의3(대통령령 제36740호, 2026. 10. 1. 시행),
//   시행령 [별표 3] 과태료의 부과기준 마목 1) (개정 2025. 4. 29.)
// 소득세·4대보험은 이미 원문 대조한 kr-payroll-month-2026(간이세액표 별표2)·kr-rates-2026(2026 요율)을 그대로 써요.
import { simplifiedWithholding } from "./kr-payroll-month-2026.ts";
import { employeeInsurance2026 } from "./kr-rates-2026.mjs";

export const OFFICE_TASKS_AS_OF = "2026-11-24";

// ── 급여대장 ──
export type PayrollRow = { name: string; base: number; allowances: number; nonTaxable: number; family: number; children: number; workDays?: number; workHours?: number; overtimeHours?: number };
export type PayrollLine = PayrollRow & { gross: number; taxable: number; pension: number; health: number; care: number; employment: number; incomeTax: number; localTax: number; deductions: number; net: number };

export function payrollLine(r: PayrollRow): PayrollLine {
  const gross = Math.max(0, r.base || 0) + Math.max(0, r.allowances || 0);
  const nonTaxable = Math.min(gross, Math.max(0, r.nonTaxable || 0));
  const taxable = gross - nonTaxable;
  const ins = employeeInsurance2026(taxable);
  const w = simplifiedWithholding({ pay: taxable, family: Math.max(1, r.family || 1), children: Math.max(0, r.children || 0) });
  const deductions = ins.nationalPension + ins.healthInsurance + ins.longTermCare + ins.employmentInsurance + w.incomeTax + w.localTax;
  return { ...r, nonTaxable, gross, taxable, pension: ins.nationalPension, health: ins.healthInsurance, care: ins.longTermCare, employment: ins.employmentInsurance, incomeTax: w.incomeTax, localTax: w.localTax, deductions, net: gross - deductions };
}

export const LEDGER_COLUMNS: [keyof PayrollLine, string][] = [
  ["name", "성명"], ["workDays", "근로일수"], ["workHours", "근로시간수"], ["overtimeHours", "연장·야간·휴일 시간수"],
  ["base", "기본급"], ["allowances", "수당"], ["gross", "지급 합계"], ["nonTaxable", "비과세"],
  ["pension", "국민연금"], ["health", "건강보험"], ["care", "장기요양"], ["employment", "고용보험"],
  ["incomeTax", "소득세"], ["localTax", "지방소득세"], ["deductions", "공제 합계"], ["net", "차인지급액"],
];

export function payrollLedger(rows: PayrollRow[]) {
  const lines = rows.map(payrollLine);
  const sum = (k: keyof PayrollLine) => lines.reduce((a, l) => a + (Number(l[k]) || 0), 0);
  const totals = Object.fromEntries((["base", "allowances", "gross", "nonTaxable", "pension", "health", "care", "employment", "incomeTax", "localTax", "deductions", "net"] as const).map((k) => [k, sum(k)])) as Record<string, number>;
  return { asOf: OFFICE_TASKS_AS_OF, lines, totals };
}

const csvCell = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
/** 엑셀에서 바로 여는 CSV(UTF-8 BOM). */
export function ledgerCsv(rows: PayrollRow[], month: string): string {
  const { lines, totals } = payrollLedger(rows);
  const head = ["귀속월", ...LEDGER_COLUMNS.map(([, h]) => h)];
  const body = lines.map((l) => [month, ...LEDGER_COLUMNS.map(([k]) => l[k])]);
  const total = ["합계", ...LEDGER_COLUMNS.map(([k]) => (k in totals ? totals[k as string] : k === "name" ? `${lines.length}명` : ""))];
  return "﻿" + [head, ...body, total].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

/** 원문 기재사항 중 이 표가 채우지 못하는 칸 (시행령 제27조①). */
export const LEDGER_MISSING = ["생년월일·사원번호 등 근로자를 특정할 수 있는 정보", "고용 연월일", "종사하는 업무", "임금 및 가족수당의 계산기초가 되는 사항"];

// ── 주택 임대차 신고 ──
const RT = "부동산 거래신고 등에 관한 법률 제6조의2·제28조⑤, 시행령 제4조의3·[별표 3]";
export type LeaseInput = { deposit: number; monthlyRent: number; renewalSameTerms?: boolean; coveredArea?: boolean; tenantMovedIn?: boolean; contractDate: string; today: string };

const DAY = 86_400_000;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
const fmt = (t: number) => new Date(t).toISOString().slice(0, 10);
const addMonths = (t: number, n: number) => { const d = new Date(t); const day = d.getUTCDate(); const r = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1); const last = new Date(Date.UTC(new Date(r).getUTCFullYear(), new Date(r).getUTCMonth() + 1, 0)).getUTCDate(); return Date.UTC(new Date(r).getUTCFullYear(), new Date(r).getUTCMonth(), Math.min(day, last)); };

/** 별표 3 마목 1) 계약금액 = 보증금 + 월 차임 × 200 */
export const leaseContractAmount = (deposit: number, rent: number) => Math.max(0, deposit || 0) + Math.max(0, rent || 0) * 200;

const FINE: [number, number, number, number][] = [[2, 3, 4, 5], [4, 8, 12, 15], [6, 10, 16, 20], [8, 13, 20, 25], [10, 15, 25, 30]].map((r) => r.map((x) => x * 10_000) as [number, number, number, number]);
/** 신고하지 않은 기간(신고기간 만료일 다음 날 start부터 end까지)의 구간: 3개월·6개월·1년·2년 이하, 2년 초과. */
export function lateBand(start: number, end: number): number {
  if (end < addMonths(start, 3)) return 0;
  if (end < addMonths(start, 6)) return 1;
  if (end < addMonths(start, 12)) return 2;
  if (end < addMonths(start, 24)) return 3;
  return 4;
}
export function leaseLateFine(amount: number, band: number | "refused"): number {
  const col = amount < 100_000_000 ? 0 : amount < 300_000_000 ? 1 : amount < 500_000_000 ? 2 : 3;
  return FINE[band === "refused" ? 4 : band][col];
}

export function leaseReport(x: LeaseInput) {
  const items: { tone: "warn" | "info" | "good"; text: string; cite: string }[] = [];
  const over = (x.deposit || 0) > 60_000_000 || (x.monthlyRent || 0) > 300_000;
  const required = over && !x.renewalSameTerms && x.coveredArea !== false;
  const c = parse(x.contractDate);
  const deadline = c + 30 * DAY; // 체결일부터 30일(민법 제157조 초일 불산입). 말일이 공휴일이면 다음 날(제161조)은 따로 안내.
  const amount = leaseContractAmount(x.deposit, x.monthlyRent);
  const today = parse(x.today);
  const lateDays = Math.max(0, Math.round((today - deadline) / DAY));
  const fine = required && !x.tenantMovedIn && lateDays > 0 ? leaseLateFine(amount, lateBand(deadline + DAY, today)) : 0;
  if (!over) items.push({ tone: "good", text: "보증금 6천만원 이하이고 월 차임 30만원 이하라 신고 대상이 아니에요.", cite: RT });
  else if (x.renewalSameTerms) items.push({ tone: "good", text: "보증금·차임 증감 없이 기간만 늘리는 갱신은 신고 대상에서 빠져요.", cite: RT });
  else if (x.coveredArea === false) items.push({ tone: "good", text: "신고는 특별자치시·특별자치도·시·군(광역시·경기도의 군만)·자치구에 적용돼요. 그 밖의 군은 대상이 아니에요.", cite: RT });
  else items.push({ tone: "warn", text: `보증금 6천만원 초과 또는 월 차임 30만원 초과라 신고 대상이에요. 계약 체결일부터 30일 이내(${fmt(deadline)}까지, 말일이 토요일·공휴일이면 다음 날) 임대인·임차인이 함께 신고해요.`, cite: RT });
  if (required) {
    if (x.tenantMovedIn) items.push({ tone: "good", text: "임차인이 전입신고를 하면 임대차 신고를 한 것으로 봐요(법 제6조의5①). 다만 신고기간 안에 했는지는 따로 확인하세요.", cite: "부동산 거래신고 등에 관한 법률 제6조의5" });
    items.push({ tone: "info", text: `별표 3의 계약금액: 보증금 + 월 차임 × 200 = ${amount.toLocaleString("ko-KR")}원.`, cite: RT });
    if (lateDays > 0 && !x.tenantMovedIn) items.push({ tone: "warn", text: `오늘 기준 신고기한이 ${lateDays}일 지났어요. 별표 3 개별기준 과태료는 ${fine.toLocaleString("ko-KR")}원이에요. 신고관청은 위반 동기·결과 등을 보고 2분의 1 범위에서 늘리거나 줄일 수 있고, 자진 신고하면 감경·면제할 수 있어요(법 제29조).`, cite: RT });
    else if (!x.tenantMovedIn) items.push({ tone: "good", text: "아직 신고기한 안이에요.", cite: RT });
    items.push({ tone: "info", text: "공동신고를 거부하면 2년 넘긴 경우와 같은 금액(최대 30만원), 거짓 신고는 100만원이에요. 상대방이 거부하면 혼자 신고할 수 있어요(법 제6조의2③).", cite: RT });
    items.push({ tone: "info", text: "신고한 뒤 보증금·차임이 바뀌거나 계약이 해제되면 확정된 날부터 30일 이내에 변경·해제 신고를 해요(법 제6조의3). 계약서를 내고 신고 접수를 마치면 확정일자를 받은 것으로 봐요(법 제6조의5③).", cite: RT });
  }
  return { asOf: OFFICE_TASKS_AS_OF, required, deadline: fmt(deadline), amount, lateDays, fine, items };
}
