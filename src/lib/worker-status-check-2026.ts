// 근로자성 점검 (2026-11-24, CHOSEUN "새로운 니즈를 찾아보고 우리 사무소에서 전문가들이 할 만한 작업들 찾기").
// 노무 상담 게시판에 가장 자주 오는 질문: "프리랜서(3.3%) 계약인데 근로자로 볼 수 있나요?"
// 대법원 2006. 12. 7. 선고 2004다29736 판결이 든 판단 요소를 체크리스트로 보여 줘요.
// 판정하지 않아요. 몇 개가 근로자 쪽인지 세고, 실제 판단은 노동청·노동위원회·법원이 한다고 안내해요.
export const WORKER_STATUS_AS_OF = "2026-11-24";
export const WORKER_STATUS_CASE = "대법원 2006. 12. 7. 선고 2004다29736 판결";

export type Factor = { id: string; q: string; group: "지휘·감독" | "독립성" | "보수·계속성" | "제도"; weight: "main" | "sub" };
/** yes = 근로자 쪽 요소 */
export const FACTORS: Factor[] = [
  { id: "task", q: "할 일을 회사가 정해 주나요?", group: "지휘·감독", weight: "main" },
  { id: "rules", q: "취업규칙·복무규정·인사규정을 똑같이 적용받나요?", group: "지휘·감독", weight: "main" },
  { id: "supervise", q: "일하는 과정에서 구체적인 지시·감독을 받나요? (보고, 결재, 업무 평가 등)", group: "지휘·감독", weight: "main" },
  { id: "time", q: "출퇴근 시간이나 근무 장소를 회사가 정하고 따라야 하나요?", group: "지휘·감독", weight: "main" },
  { id: "noTools", q: "장비·재료·작업 도구를 회사가 대 주나요?", group: "독립성", weight: "sub" },
  { id: "noSub", q: "다른 사람을 대신 보내거나 직접 사람을 써서 일하게 할 수 없나요?", group: "독립성", weight: "sub" },
  { id: "noRisk", q: "일의 결과에 따라 손해를 떠안을 위험이 없나요? (이윤·손실을 스스로 지지 않음)", group: "독립성", weight: "sub" },
  { id: "pay", q: "보수가 일한 시간·날짜에 따라 정해지나요? (결과물 단가가 아니라)", group: "보수·계속성", weight: "main" },
  { id: "fixed", q: "기본급이나 고정급이 있나요?", group: "보수·계속성", weight: "sub" },
  { id: "exclusive", q: "이 회사 일만 하거나, 오래 계속 일해 왔나요? (전속성·계속성)", group: "보수·계속성", weight: "sub" },
  { id: "wageTax", q: "근로소득세를 떼거나 4대보험에 근로자로 가입돼 있나요?", group: "제도", weight: "sub" },
];

export function workerStatusCheck(yes: string[]) {
  const set = new Set(yes);
  const hits = FACTORS.filter((f) => set.has(f.id));
  const main = hits.filter((f) => f.weight === "main").length;
  const mainTotal = FACTORS.filter((f) => f.weight === "main").length;
  const lean = main >= 3 ? "근로자 쪽 요소가 많아요" : hits.length >= 4 ? "근로자 쪽 요소가 여럿 있어요" : hits.length ? "근로자 쪽 요소가 일부 있어요" : "근로자 쪽 요소가 보이지 않아요";
  return {
    asOf: WORKER_STATUS_AS_OF,
    case: WORKER_STATUS_CASE,
    count: hits.length,
    total: FACTORS.length,
    main,
    mainTotal,
    lean,
    hits: hits.map((f) => f.q),
    notes: [
      "계약서 이름(프리랜서·위탁·도급)보다 실제로 어떻게 일했는지로 판단해요(근로기준법 제2조).",
      "근로소득세를 떼지 않았거나 4대보험에 가입하지 않았다는 사실만으로 근로자가 아니라고 단정하지 않아요. 회사가 마음대로 정할 수 있는 사정이기 때문이에요.",
      "이 점검은 판정이 아니에요. 다툼이 있으면 고용노동부 1350, 노동위원회, 대한법률구조공단 132에 상담하세요.",
    ],
    ifWorker: ["퇴직금(1년 이상)", "연차휴가·주휴수당", "4대보험 소급 가입", "해고 제한", "최저임금"],
    keep: ["계약서", "업무 지시 메시지·메일", "출퇴근 기록", "보수 입금 내역", "업무 보고·평가 자료"],
  };
}
