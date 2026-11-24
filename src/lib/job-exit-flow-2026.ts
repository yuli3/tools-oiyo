// 퇴사·해고·임금체불 상담 흐름 (2026-11-24, 로드맵 1단계 첫 흐름. CHOSEUN "상담하러 오는 사람들과 현업 전문가에게 도움이 되는 서비스").
// 계산 없음. 몇 가지 질문으로 해당하는 상황(이직·퇴사, 해고, 임금체불)을 고르고, 기존 인생 사건 데이터(kr-desks-2026)의
// 할 일·근거 조문·계산기·무료 창구를 한 화면에 모은 뒤, 상담 메모(consult-memo-2026)로 준비서를 만들어요.
// 기한 날짜는 계산하지 않아요. 조문에 적힌 기간과 기한 계산 도구 링크만 보여 줘요.
import { KR_DESKS, type Desk } from "./kr-desks-2026.ts";
import { buildConsultMemo } from "./consult-memo-2026.ts";

export const JOB_EXIT_AS_OF = "2026-11-24";
export type ExitHow = "resign" | "dismissed" | "contract" | "working";
export type ExitUnpaid = "none" | "wage" | "severance" | "both";
export type ExitInput = {
  how: ExitHow;
  unpaid: ExitUnpaid;
  written?: "yes" | "no" | "unknown"; // 해고 사유·날짜가 적힌 서면을 받았는지
  size?: "5plus" | "under5" | "unknown"; // 상시 근로자 수
  start?: string; // 입사일
  last?: string; // 마지막 근무일
  notice?: string; // 해고·퇴사 통보일
  amount?: number; // 못 받은 돈 (원)
  wants?: string;
  questions?: string[];
};

export const EXIT_HOW: { id: ExitHow; label: string }[] = [
  { id: "resign", label: "제가 그만뒀어요" },
  { id: "dismissed", label: "해고·권고사직을 당했어요" },
  { id: "contract", label: "계약 기간이 끝났어요" },
  { id: "working", label: "아직 다니고 있어요" },
];
export const EXIT_UNPAID: { id: ExitUnpaid; label: string }[] = [
  { id: "none", label: "밀린 돈은 없어요" },
  { id: "wage", label: "월급이 밀렸어요" },
  { id: "severance", label: "퇴직금을 못 받았어요" },
  { id: "both", label: "월급과 퇴직금 둘 다" },
];

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const desk = (id: string) => KR_DESKS.find((d) => d.id === id) as Desk;
const HOW_TEXT: Record<ExitHow, string> = { resign: "스스로 퇴사", dismissed: "해고 또는 권고사직", contract: "계약 기간 만료", working: "재직 중" };
const UNPAID_TEXT: Record<ExitUnpaid, string> = { none: "밀린 돈 없음", wage: "임금 체불", severance: "퇴직금 미지급", both: "임금·퇴직금 모두 미지급" };

export function buildJobExitFlow(x: ExitInput) {
  const ids = [
    ...(x.how === "dismissed" ? ["dismissal"] : []),
    ...(x.unpaid !== "none" ? ["unpaid"] : []),
    ...(x.how !== "working" ? ["quit"] : []),
  ];
  const desks = ids.map(desk);
  const tools = [...new Map(desks.flatMap((d) => d.tools).filter((t) => t.href !== "/ko/job-exit-consult-prep/").map((t) => [t.href, t])).values()];
  const help = [...new Set(desks.flatMap((d) => d.help))];
  const laws = [...new Set(desks.flatMap((d) => d.steps.map((s) => s.law).filter(Boolean) as string[]))];

  const checks: string[] = [];
  if (x.how === "dismissed" && x.written === "no") checks.push("해고 사유와 날짜를 적은 서면이 없으면 해고는 효력이 없어요(근로기준법 제27조). 받은 문자·카톡을 그대로 보관해요.");
  if (x.how === "dismissed" && x.size === "under5") checks.push("상시 5명 미만 사업장은 부당해고 구제신청 대상이 아니에요(근로기준법 제11조·제28조). 해고예고수당과 체불 임금은 따로 확인해요.");
  if (x.how === "dismissed" && x.size === "unknown") checks.push("상시 근로자 수에 따라 구제신청을 할 수 있는지가 달라져요. 상담 때 직원 수를 꼭 알려 주세요.");
  if (x.how === "resign") checks.push("스스로 그만뒀어도 임금 체불, 괴롭힘, 통근 곤란 같은 사유가 있으면 실업급여를 받을 수 있는지 확인해요.");
  if (x.unpaid !== "none") checks.push("근로계약서, 급여명세서, 통장 입금 내역, 출퇴근 기록을 모아 두면 진정과 상담이 빨라져요.");
  if (x.how === "working" && x.unpaid !== "none") checks.push("재직 중에도 임금체불 진정을 낼 수 있어요. 임금채권은 3년이 지나면 소멸해요(근로기준법 제49조).");

  const events = [
    x.start && dateRe.test(x.start) ? { date: x.start, what: "입사" } : null,
    x.notice && dateRe.test(x.notice) ? { date: x.notice, what: x.how === "dismissed" ? "해고·권고사직 통보" : "퇴사 의사 전달" } : null,
    x.last && dateRe.test(x.last) ? { date: x.last, what: "마지막 근무일" } : null,
  ].filter(Boolean) as { date: string; what: string }[];
  const situation = `${HOW_TEXT[x.how]} · ${UNPAID_TEXT[x.unpaid]}${x.how === "dismissed" ? ` · 서면 통보 ${x.written === "yes" ? "받음" : x.written === "no" ? "못 받음" : "모름"} · 상시 근로자 ${x.size === "5plus" ? "5명 이상" : x.size === "under5" ? "5명 미만" : "모름"}` : ""}`;
  const memo = buildConsultMemo({ expert: "labor", situation, events, amount: x.amount, wants: x.wants, questions: x.questions });
  const text = [memo.text, "", "8. 해당하는 조문 (원문 확인용)", ...(laws.length ? laws.map((l) => `- ${l}`) : ["- (없음)"]), "", "9. 무료 창구", ...help.map((h) => `- ${h}`)].join("\n");
  return { asOf: JOB_EXIT_AS_OF, desks, steps: desks.map((d) => ({ id: d.id, title: d.title, steps: d.steps })), tools, help, laws, checks, memo: text };
}

// 사건 파일: 이 브라우저에만 저장해요. 다른 도구가 같은 키를 읽어 다시 입력하지 않게 해요.
export const CASE_FILE_KEY = "oiyo-case-v1";
export type CaseFile = { flow: "job-exit"; savedAt: string; input: ExitInput };
export function toCaseFile(input: ExitInput, now = new Date()): CaseFile {
  return { flow: "job-exit", savedAt: now.toISOString().slice(0, 10), input };
}
export function parseCaseFile(raw: string | null): CaseFile | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (v?.flow !== "job-exit" || typeof v.input !== "object") return null;
    if (!EXIT_HOW.some((h) => h.id === v.input.how) || !EXIT_UNPAID.some((u) => u.id === v.input.unpaid)) return null;
    return v as CaseFile;
  } catch { return null; }
}
