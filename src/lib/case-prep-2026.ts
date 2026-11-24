// 상황별 상담 준비서 (2026-11-24, AI 전문가 집중 계획 2·3번: 전세·월세 보증금, 빌려준 돈).
// 퇴사·해고·체불 흐름(job-exit-flow-2026)과 같은 방식이에요. 계산 없음, 판단 없음.
// 몇 가지 질문으로 "먼저 확인할 것"을 고르고, 인생 사건 데이터(kr-desks-2026)의 할 일·조문·계산기·무료 창구를 모은 뒤
// 상담 메모(consult-memo-2026)로 준비서를 만들어요. 기한 날짜는 계산하지 않고 조문에 적힌 기간과 기한 도구 링크만 보여 줘요.
import { KR_DESKS, type Desk } from "./kr-desks-2026.ts";
import { buildConsultMemo } from "./consult-memo-2026.ts";

export const CASE_PREP_AS_OF = "2026-11-24";
export type CaseFlowId = "deposit" | "lend" | "yearend" | "inherit";
export type Choice = { id: string; label: string };
export type Question = { id: string; label: string; choices: Choice[] };
export type DateField = { id: string; label: string; what: string };
export type CaseInput = {
  answers: Record<string, string>;
  dates?: Record<string, string>;
  amount?: number;
  wants?: string;
  questions?: string[];
};
type Rule = { when: (a: Record<string, string>, x: CaseInput) => boolean; text: string };
type Step = { when: string; what: string; law?: string };
type Link = { href: string; title: string };
export type CaseFlow = {
  id: CaseFlowId;
  slug: string; // /ko/<slug>/
  desk?: string; // kr-desks-2026 id. 없으면 아래 steps·tools·help를 써요.
  steps?: Step[];
  tools?: Link[];
  help?: string[];
  expert: string | ((a: Record<string, string>) => string); // EXPERTS id (consult-memo)
  title: string;
  amountLabel: string;
  questions: Question[];
  dates: DateField[];
  rules: Rule[];
  extraTools: Link[];
};

const yn = (yes: string, no: string): Choice[] => [{ id: "yes", label: yes }, { id: "no", label: no }, { id: "unknown", label: "모르겠어요" }];

export const CASE_FLOWS: Record<CaseFlowId, CaseFlow> = {
  deposit: {
    id: "deposit",
    slug: "deposit-return-consult-prep",
    desk: "deposit",
    expert: "court",
    title: "전세·월세 보증금",
    amountLabel: "보증금(원)",
    questions: [
      { id: "stage", label: "지금 어느 단계인가요?", choices: [{ id: "before", label: "계약이 아직 안 끝났어요" }, { id: "living", label: "계약이 끝났는데 아직 살고 있어요" }, { id: "moved", label: "이미 이사 나왔어요" }] },
      { id: "fixed", label: "전입신고와 확정일자를 받았나요?", choices: yn("둘 다 받았어요", "못 받았어요") },
      { id: "lease", label: "임차권등기를 했나요?", choices: yn("했어요", "안 했어요") },
      { id: "guarantee", label: "전세보증보험에 가입했나요?", choices: yn("가입했어요", "안 했어요") },
      { id: "house", label: "집 상황은 어떤가요?", choices: [{ id: "normal", label: "특별한 일은 없어요" }, { id: "auction", label: "경매·공매가 시작됐어요" }, { id: "fraud", label: "집주인이 연락이 안 되거나 전세사기가 의심돼요" }] },
    ],
    dates: [
      { id: "contract", label: "계약일", what: "임대차 계약" },
      { id: "end", label: "계약 끝나는 날", what: "계약 만료(예정)" },
      { id: "notice", label: "갱신 거절을 알린 날", what: "집주인에게 갱신 거절·반환 요청" },
      { id: "moveout", label: "이사 나온 날", what: "이사(전출)" },
    ],
    rules: [
      { when: (a) => a.stage === "before", text: "임차인은 계약이 끝나기 2개월 전까지 갱신하지 않겠다고 알려야 해요(집주인은 6개월~2개월 전). 이때까지 아무도 알리지 않으면 같은 조건으로 다시 계약한 것으로 봐요(주택임대차보호법 제6조). 그 뒤에는 임차인이 언제든 해지를 알릴 수 있고, 알린 날부터 3개월이 지나면 효력이 생겨요(제6조의2)." },
      { when: (a) => a.stage === "living" && a.lease !== "yes", text: "이사 가기 전에 임차권등기명령을 신청하고, 등기부에 올라간 것을 확인한 다음 이사해요. 등기 전에 이사·전출하면 대항력과 우선변제권을 잃을 수 있어요(주택임대차보호법 제3조의3)." },
      { when: (a) => a.stage === "moved" && a.lease !== "yes", text: "임차권등기 없이 이미 이사했다면 원래 순위를 잃었을 수 있어요. 지금이라도 임차권등기명령을 신청하고, 상담 때 이사·전출한 날짜를 꼭 알려 주세요." },
      { when: (a) => a.fixed === "no", text: "전입신고와 확정일자가 없으면 경매 때 먼저 배당받을 권리(우선변제권)가 없어요. 지금 받으면 그때부터 효력이 생기니 바로 받아 두세요(주택임대차보호법 제3조·제3조의2)." },
      { when: (a) => a.fixed === "unknown", text: "전입신고·확정일자는 주민센터나 정부24에서 확인할 수 있어요. 받은 날짜가 순위를 정하니 상담 전에 확인해 두세요." },
      { when: (a) => a.guarantee === "yes", text: "전세보증보험에 가입했다면 보증한 기관(주택도시보증공사·한국주택금융공사·서울보증보험)에 이행청구를 해요. 청구 기한과 서류는 기관과 상품마다 달라서 가입한 곳에 먼저 확인해요." },
      { when: (a) => a.house === "auction", text: "집이 경매에 넘어갔다면 법원이 정한 배당요구 종기까지 배당요구를 해야 배당을 받을 수 있어요(민사집행법 제84조·제88조). 경매 사건번호를 메모에 적어 두세요." },
      { when: (a) => a.house === "fraud", text: "전세사기가 의심되면 전세피해지원센터에서 피해자 결정 신청과 지원을 상담해요(전세사기피해자 지원 및 주거안정에 관한 특별법). 계약서·등기부등본·이체 내역을 모아 두세요." },
      { when: () => true, text: "임대차계약서, 등기부등본, 보증금 이체 내역, 집주인과 주고받은 문자를 모아 두면 상담과 신청이 빨라져요." },
    ],
    extraTools: [{ href: "/ko/housing-lease-report-checker/", title: "전월세 신고 확인" }],
  },
  lend: {
    id: "lend",
    slug: "unpaid-loan-consult-prep",
    desk: "lend",
    expert: "court",
    title: "빌려준 돈",
    amountLabel: "받을 돈(원)",
    questions: [
      { id: "kind", label: "어떤 돈인가요?", choices: [{ id: "loan", label: "개인에게 빌려준 돈" }, { id: "trade", label: "물건값·공사비·일한 대가" }, { id: "wage", label: "회사에서 못 받은 월급·퇴직금" }] },
      { id: "proof", label: "빌려준 증거가 있나요?", choices: [{ id: "note", label: "차용증·계약서가 있어요" }, { id: "transfer", label: "이체 내역·문자만 있어요" }, { id: "none", label: "증거가 거의 없어요" }] },
      { id: "debtor", label: "상대는 어떤가요?", choices: [{ id: "reach", label: "연락은 돼요" }, { id: "noaddr", label: "연락이 안 되고 주소도 몰라요" }, { id: "hide", label: "재산을 빼돌릴 것 같아요" }] },
      { id: "admitted", label: "상대가 갚겠다고 인정한 적이 있나요?", choices: yn("문자·말로 인정했어요", "인정한 적 없어요") },
    ],
    dates: [
      { id: "lent", label: "빌려준 날", what: "돈을 빌려줌(거래)" },
      { id: "due", label: "갚기로 한 날", what: "갚기로 한 날(변제기)" },
      { id: "last", label: "마지막으로 독촉한 날", what: "마지막 독촉" },
      { id: "admit", label: "상대가 인정한 날", what: "상대가 빚을 인정" },
    ],
    rules: [
      { when: (a) => a.kind === "wage", text: "회사에서 못 받은 월급·퇴직금은 '퇴사·해고·체불 상담 준비서'가 더 맞아요. 고용노동부 진정과 대지급금 제도를 함께 볼 수 있어요." },
      { when: (a) => a.kind === "trade", text: "물건값·공사비 같은 돈은 소멸시효가 3년(민법 제163조)이나 1년(제164조)으로 짧은 경우가 있어요. 어떤 돈인지 상담 때 먼저 알려 주세요." },
      { when: (a) => a.kind === "loan", text: "개인 간 대여금의 소멸시효는 보통 10년이에요(민법 제162조). 장사하는 사람끼리 빌려준 돈처럼 상행위로 생긴 돈은 5년일 수 있어요(상법 제64조)." },
      { when: (a) => a.proof === "transfer", text: "이체 내역만 있으면 상대가 '빌린 게 아니라 받은 돈'이라고 다툴 수 있어요. 빌려준 돈이라는 내용이 담긴 문자·카톡을 함께 보관해요." },
      { when: (a) => a.proof === "none", text: "증거가 거의 없으면 상대가 금액을 인정하는 문자 답장을 받아 두는 것부터 해요. 빚을 인정하면 소멸시효도 다시 시작돼요(민법 제168조)." },
      { when: (a) => a.admitted === "yes", text: "상대가 빚을 인정한 날부터 소멸시효가 새로 시작돼요(민법 제168조·제178조). 인정한 문자나 녹취 날짜를 메모에 적어 두세요." },
      { when: (a) => a.debtor === "noaddr", text: "상대 주소를 모르면 지급명령을 쓰기 어려워요. 지급명령은 공시송달로 보낼 수 없어서(민사소송법 제462조) 소송으로 가야 할 수 있어요. 상대의 전화번호·계좌번호를 메모에 적어 두세요." },
      { when: (a) => a.debtor === "hide", text: "상대가 재산을 빼돌릴 우려가 있으면 소송 전에 가압류를 신청할 수 있어요(민사집행법 제276조). 상대의 부동산·예금·급여처를 아는 대로 적어 두세요." },
      { when: (_a, x) => !!x.amount && x.amount <= 30_000_000, text: "3천만 원 이하 돈을 청구하는 소송은 소액사건으로 비교적 간단한 절차를 밟아요(소액사건심판규칙 제1조의2)." },
      { when: (a) => a.kind !== "wage", text: "내용증명은 독촉한 기록을 남겨요. 다만 내용증명만으로는 시효가 멈추지 않고, 6개월 안에 지급명령·소송 같은 절차를 밟아야 해요(민법 제174조)." },
    ],
    extraTools: [{ href: "/ko/job-exit-consult-prep/", title: "퇴사·해고·체불 상담 준비서" }],
  },

  yearend: {
    id: "yearend",
    slug: "year-end-settlement-consult-prep",
    expert: "tax",
    title: "연말정산",
    amountLabel: "작년 총급여(원, 아는 경우)",
    questions: [
      { id: "work", label: "올해 회사는 어땠나요?", choices: [{ id: "same", label: "한 회사에 계속 다녔어요" }, { id: "moved", label: "중간에 회사를 옮겼어요" }, { id: "quit", label: "중간에 그만두고 지금은 안 다녀요" }] },
      { id: "other", label: "월급 말고 다른 소득이 있나요?", choices: [{ id: "none", label: "없어요" }, { id: "biz", label: "프리랜서·사업·임대 소득" }, { id: "fin", label: "이자·배당이 많아요" }] },
      { id: "family", label: "가족 공제는요?", choices: [{ id: "single", label: "저만 공제받아요" }, { id: "dep", label: "부모님·자녀를 공제받아요" }, { id: "dual", label: "맞벌이라 누가 받을지 정해야 해요" }] },
      { id: "home", label: "사는 집은요?", choices: [{ id: "own", label: "자가·가족 집" }, { id: "rent", label: "월세" }, { id: "jeonse", label: "전세(전세대출 포함)" }] },
      { id: "missed", label: "작년이나 그 전에 빠뜨린 공제가 있나요?", choices: yn("있는 것 같아요", "없어요") },
    ],
    dates: [
      { id: "join", label: "지금 회사 입사일", what: "지금 회사 입사" },
      { id: "leave", label: "이전 회사 퇴사일", what: "이전 회사 퇴사" },
      { id: "deadline", label: "회사가 정한 서류 마감일", what: "회사 연말정산 서류 마감" },
    ],
    steps: [
      { when: "1월 중순", what: "홈택스 연말정산 간소화 서비스가 열리면 의료비·카드·보험료 같은 자료를 조회하고 내려받아요." },
      { when: "회사가 정한 마감일까지", what: "소득·세액공제 신고서와 간소화에 없는 영수증을 회사에 내요.", law: "소득세법 제140조" },
      { when: "2월 급여", what: "회사가 정산해서 더 낸 세금은 돌려주고 덜 낸 세금은 걷어요.", law: "소득세법 제137조" },
      { when: "3월", what: "회사가 지급명세서를 내요(3월 10일까지). 근로소득 원천징수영수증을 받아 두세요.", law: "소득세법 제164조" },
      { when: "5월", what: "빠뜨린 공제나 다른 소득은 종합소득세 신고 때 함께 정리해요.", law: "소득세법 제70조" },
    ],
    tools: [{ href: "/ko/year-end-settlement-preview-2026/", title: "연말정산 미리보기" }, { href: "/ko/midyear-leaver-year-end-settlement/", title: "중도퇴사자 연말정산" }, { href: "/ko/dependent-deduction-checker/", title: "부양가족 공제 확인" }, { href: "/ko/medical-expense-tax-credit-calculator/", title: "의료비 세액공제" }, { href: "/ko/monthly-rent-tax-credit-calculator/", title: "월세 세액공제" }, { href: "/ko/simplified-withholding-tax-calculator/", title: "간이세액표 월 원천징수" }],
    help: ["국세청 126", "홈택스 연말정산 간소화 서비스"],
    rules: [
      { when: () => true, text: "홈택스 간소화 자료는 보통 1월 중순에 열려요. 회사마다 서류 마감일이 달라서 먼저 마감일을 확인하세요." },
      { when: (a) => a.work === "moved", text: "올해 회사를 옮겼다면 이전 회사의 근로소득 원천징수영수증을 지금 회사에 내서 합쳐서 정산해요. 내지 않으면 5월에 직접 종합소득세를 신고해야 해요." },
      { when: (a) => a.work === "quit", text: "연말에 다니는 회사가 없으면 퇴사할 때 회사가 한 정산으로 끝나서 의료비·카드·부양가족 공제가 빠졌을 수 있어요. 다음 해 5월 종합소득세 신고 때 추가하세요." },
      { when: (a) => a.other === "biz", text: "프리랜서·사업·임대 소득이 있으면 연말정산과 따로 5월에 종합소득세를 신고해요(소득세법 제70조). 3.3% 원천징수 영수증과 경비 자료를 모아 두세요." },
      { when: (a) => a.other === "fin", text: "이자·배당 같은 금융소득이 한 해 2천만 원을 넘으면 다른 소득과 합쳐 5월에 종합소득세를 신고해요(소득세법 제14조)." },
      { when: (a) => a.family === "dep", text: "부모님·자녀 같은 부양가족은 한 사람만 공제받을 수 있어요. 형제자매와 겹치면 나중에 세금과 가산세를 낼 수 있으니 미리 정하세요." },
      { when: (a) => a.family === "dual", text: "맞벌이는 부양가족과 의료비·카드 공제를 누구에게 몰지에 따라 결과가 달라요. 두 사람 급여로 미리보기를 각각 돌려 보세요." },
      { when: (a) => a.home === "rent", text: "월세 세액공제는 무주택 세대주 같은 요건이 있고 간소화 자료에 나오지 않는 경우가 많아요. 임대차계약서, 주민등록등본, 월세 이체 내역을 준비하세요." },
      { when: (a) => a.home === "jeonse", text: "전세대출 원리금 상환액 공제는 금융기관 자료가 간소화에 나오는지 확인하고, 없으면 은행에서 증명서를 받아요." },
      { when: (a) => a.missed === "yes", text: "예전에 빠뜨린 공제는 신고기한 다음 날부터 5년 안에 경정청구로 돌려받을 수 있어요(국세기본법 제45조의2). 그해 원천징수영수증을 준비하세요." },
      { when: () => true, text: "안경·교복비, 일부 기부금처럼 간소화에 안 나오는 자료는 영수증을 따로 받아야 해요." },
    ],
    extraTools: [],
  },
  inherit: {
    id: "inherit",
    slug: "inheritance-consult-prep",
    desk: "death",
    expert: (a) => (a.debt === "more" || a.debt === "unknown" ? "court" : "tax"),
    title: "상속",
    amountLabel: "아는 재산(원, 대략)",
    questions: [
      { id: "elapsed", label: "돌아가신 지 얼마나 됐나요?", choices: [{ id: "m1", label: "1개월이 안 됐어요" }, { id: "m3", label: "1~3개월" }, { id: "over", label: "3개월이 넘었어요" }] },
      { id: "debt", label: "빚과 재산 중 어느 쪽이 많아 보이나요?", choices: [{ id: "asset", label: "재산이 더 많아요" }, { id: "more", label: "빚이 더 많아요" }, { id: "unknown", label: "모르겠어요" }] },
      { id: "will", label: "유언장이 있나요?", choices: yn("있어요", "없어요") },
      { id: "heirs", label: "상속인끼리는요?", choices: [{ id: "agree", label: "나누는 데 합의됐어요" }, { id: "dispute", label: "다툼이 있어요" }, { id: "who", label: "상속인이 누구인지부터 모르겠어요" }] },
      { id: "house", label: "부동산이 있나요?", choices: yn("있어요", "없어요") },
      { id: "income", label: "돌아가신 분에게 사업·임대 소득이 있었나요?", choices: yn("있었어요", "없었어요") },
    ],
    dates: [
      { id: "death", label: "돌아가신 날", what: "사망(상속 개시)" },
      { id: "knew", label: "빚이 있는 걸 안 날", what: "빚이 있는 것을 앎" },
      { id: "report", label: "사망신고한 날", what: "사망신고" },
    ],
    rules: [
      { when: (a) => a.elapsed === "m1", text: "사망신고는 사망을 안 날부터 1개월 안에 해요. 신고할 때 정부24 안심상속 원스톱 서비스를 함께 신청하면 재산과 빚을 한 번에 조회할 수 있어요." },
      { when: (a) => a.debt !== "asset" && a.elapsed !== "over", text: "빚이 더 많거나 잘 모르면 상속이 시작된 것을 안 날부터 3개월 안에 가정법원에 상속포기나 한정승인을 신청해요(민법 제1019조 제1항). 그 전에 재산을 쓰거나 팔면 단순승인으로 볼 수 있어요(민법 제1026조)." },
      { when: (a) => a.debt !== "asset" && a.elapsed === "over", text: "3개월이 지났어도 빚이 더 많다는 걸 중대한 과실 없이 늦게 알았다면, 안 날부터 3개월 안에 특별한정승인을 신청할 수 있어요(민법 제1019조 제3항). 빚을 알게 된 날짜를 꼭 적어 두세요." },
      { when: (a) => a.will === "yes", text: "자필로 쓴 유언장은 가정법원의 검인을 받아야 해요(민법 제1091조). 유언장을 뜯거나 고치지 말고 그대로 보관하세요." },
      { when: (a) => a.heirs === "dispute", text: "상속인끼리 나누는 협의가 안 되면 가정법원에 상속재산분할 심판을 청구해요(민법 제1013조). 유류분은 증여·유증을 안 날부터 1년, 상속이 시작된 날부터 10년 안에 청구해요(민법 제1117조)." },
      { when: (a) => a.heirs === "who", text: "돌아가신 분의 가족관계증명서와 기본증명서로 상속인을 확인해요. 법정 상속분은 아래 계산기로 볼 수 있어요(민법 제1000조·제1009조)." },
      { when: (a) => a.house === "yes", text: "상속 부동산은 상속이 시작된 달의 말일부터 6개월 안에 취득세를 신고·납부하고 상속등기를 해요(지방세법 제20조)." },
      { when: (a) => a.income === "yes", text: "돌아가신 분에게 사업·임대 소득이 있었다면 상속인이 상속이 시작된 달의 말일부터 6개월 안에 그해 소득세를 신고해요(소득세법 제74조)." },
      { when: () => true, text: "상속세는 상속이 시작된 달의 말일부터 6개월 안에 신고해요(상속세 및 증여세법 제67조). 낼 세금이 없어 보여도 상담 때 재산 목록을 가져가세요." },
    ],
    extraTools: [],
  },
};

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const desk = (id: string) => KR_DESKS.find((d) => d.id === id) as Desk;

export function isValidInput(flow: CaseFlow, x: CaseInput): boolean {
  return flow.questions.every((q) => q.choices.some((c) => c.id === x.answers?.[q.id]));
}

export function buildCasePrep(id: CaseFlowId, x: CaseInput) {
  const flow = CASE_FLOWS[id];
  if (!flow) throw new Error("flow");
  if (!isValidInput(flow, x)) throw new Error("answers");
  const dk = flow.desk ? desk(flow.desk) : undefined;
  const d = { title: dk?.title ?? flow.title, steps: flow.steps ?? dk?.steps ?? [], tools: flow.tools ?? dk?.tools ?? [], help: flow.help ?? dk?.help ?? [] };
  const self = `/ko/${flow.slug}/`;
  const tools = [...new Map([...d.tools, ...flow.extraTools].filter((t) => t.href !== self).map((t) => [t.href, t])).values()];
  const laws = [...new Set(d.steps.map((s) => s.law).filter(Boolean) as string[])];
  const checks = flow.rules.filter((r) => r.when(x.answers, x)).map((r) => r.text);
  const events = flow.dates
    .map((f) => (x.dates?.[f.id] && dateRe.test(x.dates[f.id]) ? { date: x.dates[f.id], what: f.what } : null))
    .filter(Boolean) as { date: string; what: string }[];
  const situation = `${flow.title} · ${flow.questions.map((q) => q.choices.find((c) => c.id === x.answers[q.id])?.label).join(" · ")}`;
  const memo = buildConsultMemo({ expert: typeof flow.expert === "function" ? flow.expert(x.answers) : flow.expert, situation, events, amount: x.amount, wants: x.wants, questions: x.questions });
  const text = [
    memo.text,
    "",
    "8. 먼저 확인할 것",
    ...checks.map((c) => `- ${c}`),
    "",
    "9. 해당하는 조문 (원문 확인용)",
    ...(laws.length ? laws.map((l) => `- ${l}`) : ["- (없음)"]),
    "",
    "10. 무료 창구",
    ...d.help.map((h) => `- ${h}`),
  ].join("\n");
  return { asOf: CASE_PREP_AS_OF, flow: flow.id, title: d.title, steps: d.steps, tools, help: d.help, laws, checks, memo: text };
}

// 사건 파일: 흐름마다 다른 키로 이 브라우저에만 저장해요 (퇴사 흐름의 oiyo-case-v1과 겹치지 않게).
export const caseFileKey = (id: CaseFlowId) => `oiyo-case-v1-${id}`;
export type CasePrepFile = { flow: CaseFlowId; savedAt: string; input: CaseInput };
export function toCasePrepFile(id: CaseFlowId, input: CaseInput, now = new Date()): CasePrepFile {
  return { flow: id, savedAt: now.toISOString().slice(0, 10), input };
}
export function parseCasePrepFile(id: CaseFlowId, raw: string | null): CasePrepFile | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (v?.flow !== id || typeof v.input !== "object" || typeof v.input?.answers !== "object") return null;
    if (!isValidInput(CASE_FLOWS[id], v.input)) return null;
    return v as CasePrepFile;
  } catch { return null; }
}
