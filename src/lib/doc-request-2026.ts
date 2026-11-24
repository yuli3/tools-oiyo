// 고객 자료 요청 메시지 만들기 (2026-11-24, CHOSEUN "우리 사무소에서 전문가들이 할 만한 작업들").
// 세무·회계 사무실이 매달 가장 많은 시간을 쓰는 일은 수임처 자료 요청·누락 확인·재요청이에요.
// 업무 종류별 자료 목록으로 요청 문자를 만들고, 받은 자료를 체크하면 빠진 것만 다시 요청하는 문구를 만들어요.
// 신고 기한은 사용자가 넣은 날짜만 써요(기한 계산은 고객별 신고 마감 보드에서).
export const DOC_REQUEST_AS_OF = "2026-11-24";

export type JobKind = "income" | "vat" | "yearend" | "corp" | "payroll" | "gift";
export const DOC_JOBS: { id: JobKind; title: string; docs: string[] }[] = [
  { id: "income", title: "종합소득세 신고 (프리랜서·개인사업자)", docs: ["홈택스 아이디 또는 수임 동의", "사업소득·기타소득 원천징수영수증(지급명세서)", "사업용 카드·통장 거래 내역", "세금계산서·계산서·현금영수증 외 비용 증빙", "부양가족 정보(주민등록번호 앞자리·관계)", "연금저축·IRP·노란우산 납입 증명", "지난해 신고서(처음 맡기는 경우)"] },
  { id: "vat", title: "부가가치세 신고 (개인·법인사업자)", docs: ["매출 내역(카드·현금영수증·배달앱·오픈마켓 정산서)", "매입 세금계산서·계산서 누락분", "사업용 카드 사용 내역 중 개인 사용분 표시", "임대차계약서(사업장 임차 시)", "수출·영세율 증빙(해당 시)"] },
  { id: "yearend", title: "근로소득 연말정산 (회사·직원)", docs: ["직원별 간소화 자료 PDF", "부양가족 변동(결혼·출산·사망·분가)", "월세 계약서와 이체 내역", "간소화에 없는 의료비·교육비·기부금 영수증", "중도 입사자의 전 직장 원천징수영수증"] },
  { id: "corp", title: "법인 결산·법인세 신고", docs: ["통장 전체 거래 내역(연말 잔액 포함)", "법인카드 사용 내역", "재고 실사 자료", "차입금·대여금 약정서와 이자 내역", "유형자산 취득·처분 계약서", "가지급금·가수금 내역", "주주 변동 내역(주식 양도 계약서)"] },
  { id: "payroll", title: "월 급여·원천세 신고", docs: ["이번 달 입사·퇴사자(입사일·퇴사일)", "근무시간·연장·야간·휴일근로 기록", "상여·수당 변동", "사업소득(3.3%)·기타소득 지급 내역", "4대보험 변동(휴직·출산휴가)"] },
  { id: "gift", title: "상속·증여세 신고", docs: ["가족관계증명서·제적등본", "재산 목록(부동산 등기부, 예금 잔액증명, 주식 잔고)", "증여 계약서 또는 이체 내역", "최근 10년 안 사전 증여 내역", "채무 증빙(대출 잔액, 임대보증금)", "장례비 영수증(상속)"] },
];

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const kd = (s?: string) => (s && dateRe.test(s) ? `${Number(s.slice(5, 7))}월 ${Number(s.slice(8, 10))}일` : "");

export function buildDocRequest(x: { job: JobKind; client?: string; office?: string; due?: string; received?: string[]; extra?: string[] }) {
  const j = DOC_JOBS.find((d) => d.id === x.job);
  if (!j) throw new Error("job");
  const client = (x.client ?? "").trim() || "고객님";
  const office = (x.office ?? "").trim() || "사무실";
  const due = kd(x.due);
  const got = new Set(x.received ?? []);
  const all = [...j.docs, ...(x.extra ?? []).map((e) => e.trim()).filter(Boolean)];
  const missing = all.filter((d) => !got.has(d));
  const list = (arr: string[]) => arr.map((d, i) => `${i + 1}. ${d}`).join("\n");
  const first = [
    `[${office}] ${client}, 안녕하세요. ${j.title} 준비를 위해 아래 자료를 부탁드려요.`,
    "",
    list(all),
    "",
    due ? `${due}까지 보내 주시면 기한 안에 처리할 수 있어요.` : "자료가 준비되는 대로 보내 주세요.",
    "해당 없는 항목은 '없음'이라고만 답해 주셔도 돼요.",
  ].join("\n");
  const reminder = missing.length
    ? [`[${office}] ${client}, 보내 주신 자료 잘 받았어요. 아래 ${missing.length}가지만 더 부탁드려요.`, "", list(missing), "", due ? `${due}까지 부탁드려요.` : "확인 부탁드려요."].join("\n")
    : `[${office}] ${client}, 필요한 자료를 모두 받았어요. 검토 후 다시 연락드릴게요.`;
  return { asOf: DOC_REQUEST_AS_OF, title: j.title, docs: all, missing, first, reminder, done: missing.length === 0 };
}
