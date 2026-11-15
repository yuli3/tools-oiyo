// 경영 도구 모음 (2026-11-14). 기업가·경영팀·회계사·세무사·경리가 함께 쓰는 ko 전용 도구와 경영 이론 정리.
export const bizTools = [
  { slug: "business-toolkit", title: "경영 도구 모음", description: "의사결정 트리·타임라인·SWOT·BCG·포지셔닝·단위경제와 경영 이론 정리, MCP·Claude 스킬을 모았어요." },
  { slug: "decision-tree-calculator", title: "의사결정 트리 계산기", description: "선택지별 성공 확률과 결과로 기대값·손실 확률·1등이 바뀌는 확률을 트리로 보여 줘요." },
  { slug: "project-timeline-planner", title: "타임라인·마일스톤 관리", description: "할 일과 선후관계로 간트 차트·핵심 경로·지연 영향·PERT 마감 확률을 계산해요." },
  { slug: "business-must-do-checklist", title: "반드시 할 것 · 하지 말 것", description: "창업 단계·역할별 필수 체크리스트와 사업자 세무 신고 일정(달력 내보내기)." },
  { slug: "swot-analysis", title: "SWOT·TOWS 분석", description: "강점·약점·기회·위협으로 전략 위치와 TOWS 전략 조합, IFE·EFE·IE 매트릭스를 만들어요." },
  { slug: "bcg-matrix", title: "BCG 매트릭스", description: "사업별 시장 성장률과 상대 점유율로 스타·캐시카우·물음표·개를 나누고 포트폴리오를 진단해요." },
  { slug: "positioning-map", title: "마케팅 포지셔닝 맵", description: "두 축 위에 경쟁 브랜드를 놓고 가장 가까운 경쟁자와 빈자리, 포지셔닝 문장을 만들어요." },
  { slug: "unit-economics-runway-calculator", title: "단위경제·런웨이 계산기", description: "LTV/CAC·CAC 회수 기간과 월별 현금 잔고, 흑자 전환·현금 소진 달을 계산해요." },
  { slug: "priority-decision-matrix", title: "우선순위·가중 의사결정표", description: "기준별 가중 점수로 선택지를 비교하고, RICE로 할 일 순서를 정해요." },
] as const;

export type FrameworkGroup = "strategy" | "customer" | "execution" | "finance" | "decision" | "people";
export const FRAMEWORK_GROUPS: Record<FrameworkGroup, string> = {
  strategy: "전략·경쟁",
  customer: "고객·시장·마케팅",
  execution: "목표·실행",
  finance: "재무·숫자",
  decision: "의사결정",
  people: "조직·사람",
};

export interface Framework {
  name: string;
  group: FrameworkGroup;
  /** 언제 쓰나 */
  when: string;
  /** 핵심 방법 한 줄 */
  how: string;
  /** tools.oiyo.net 도구 slug(있으면) */
  tool?: string;
}

export const FRAMEWORKS: Framework[] = [
  { name: "SWOT·TOWS", group: "strategy", when: "연간 계획, 신사업 검토 첫 회의", how: "강점·약점(내부)과 기회·위협(외부)을 적고, 짝지어 SO·ST·WO·WT 전략을 만들어요.", tool: "swot-analysis" },
  { name: "PESTEL", group: "strategy", when: "새 시장·해외 진출 전 거시 환경 점검", how: "정치·경제·사회·기술·환경·법률 변화를 적고 우리 사업에 주는 영향을 1~5로 매겨요." },
  { name: "포터의 5가지 경쟁 요인", group: "strategy", when: "업종이 돈을 벌기 좋은 구조인지 볼 때", how: "기존 경쟁, 신규 진입, 대체재, 공급자 힘, 구매자 힘이 셀수록 이익률이 낮아져요." },
  { name: "BCG 매트릭스", group: "strategy", when: "사업·제품이 여러 개일 때 투자 배분", how: "시장 성장률 × 상대 점유율로 스타·캐시카우·물음표·개를 나눠 현금 흐름을 설계해요.", tool: "bcg-matrix" },
  { name: "GE-맥킨지 9셀", group: "strategy", when: "BCG보다 여러 요인을 넣어 사업을 평가할 때", how: "시장 매력도와 사업 경쟁력을 여러 기준의 가중 점수로 매겨 3×3 칸에 놓아요.", tool: "priority-decision-matrix" },
  { name: "앤소프 매트릭스", group: "strategy", when: "성장 방향을 고를 때", how: "기존·새 제품 × 기존·새 시장: 시장 침투, 시장 개발, 제품 개발, 다각화 순으로 위험이 커져요." },
  { name: "블루오션 ERRC·전략 캔버스", group: "strategy", when: "경쟁이 치열한 시장에서 차별화할 때", how: "업계가 경쟁하는 요소를 없애고(E)·줄이고(R)·늘리고(R)·새로 만들어(C) 가치 곡선을 다르게 그려요." },
  { name: "VRIO", group: "strategy", when: "우리 강점이 오래가는지 확인할 때", how: "가치 있고(V), 드물고(R), 따라 하기 어렵고(I), 조직이 활용하는(O) 자원만 지속 경쟁우위예요." },
  { name: "7 Powers", group: "strategy", when: "장기 해자(moat)를 설계할 때", how: "규모의 경제, 네트워크 효과, 전환 비용, 브랜드, 독점 자원, 카운터 포지셔닝, 공정 역량 중 무엇을 쌓을지 정해요." },
  { name: "와들리 맵", group: "strategy", when: "기술·서비스 구성요소 중 무엇을 직접 만들고 살지", how: "고객 필요에서 출발해 구성요소를 가치 사슬(세로)과 진화 단계(가로: 신생→상품)에 놓아요." },
  { name: "Playing to Win", group: "strategy", when: "전략 문장을 한 장으로 정리할 때", how: "포부, 어디서 경쟁할지, 어떻게 이길지, 필요한 역량, 관리 체계 다섯 질문에 답해요." },
  { name: "JTBD(해야 할 일)", group: "customer", when: "고객이 왜 사는지 이해하고 싶을 때", how: "'~할 때, ~하고 싶어서, ~하려고 이 제품을 고용한다' 문장으로 고객의 진짜 목적을 찾아요." },
  { name: "STP·포지셔닝", group: "customer", when: "타깃과 메시지를 정할 때", how: "시장을 나누고(S), 고를 고객을 정하고(T), 경쟁 대비 자리를 정해(P) 한 문장으로 써요.", tool: "positioning-map" },
  { name: "TAM·SAM·SOM", group: "customer", when: "시장 규모를 투자자에게 설명할 때", how: "전체 시장 → 우리가 닿을 수 있는 시장 → 몇 년 안에 실제로 가져올 시장을 고객 수 × 단가로 아래에서부터 계산해요." },
  { name: "린 캔버스", group: "customer", when: "아이디어를 한 장으로 검증할 때", how: "문제, 고객, 고유 가치, 해결책, 채널, 수익, 비용, 핵심 지표, 경쟁 우위 9칸을 채우고 가장 위험한 가정부터 실험해요." },
  { name: "비즈니스 모델 캔버스", group: "customer", when: "운영 중인 사업 구조를 정리할 때", how: "고객·가치·채널·관계·수익과 핵심 자원·활동·파트너·비용 9블록으로 돈이 도는 구조를 그려요." },
  { name: "가치 제안 캔버스", group: "customer", when: "제품 기능과 고객 고통을 맞출 때", how: "고객의 할 일·고통·기대와 우리 제품의 진통제·이득 창출을 짝지어요." },
  { name: "AARRR(해적 지표)", group: "customer", when: "성장 퍼널에서 막힌 곳을 찾을 때", how: "획득→활성→유지→추천→수익 단계별 전환율을 보고 가장 약한 단계부터 고쳐요." },
  { name: "북극성 지표", group: "customer", when: "팀 전체가 볼 숫자 하나를 정할 때", how: "고객이 얻는 가치와 매출이 함께 움직이는 지표(예: 주간 활성 거래 수)를 하나 골라요." },
  { name: "PMF 40% 설문", group: "customer", when: "제품-시장 적합성(PMF)을 확인할 때", how: "'이 제품을 못 쓰게 되면 얼마나 아쉬운가요?'에 '매우 아쉽다'가 40% 이상이면 PMF 신호예요." },
  { name: "OKR", group: "execution", when: "분기 목표를 정하고 팀을 정렬할 때", how: "도전적인 목표(O) 1~3개와 숫자로 확인하는 핵심 결과(KR) 2~4개, 70% 달성이면 잘한 거예요." },
  { name: "핵심 경로(CPM)·간트", group: "execution", when: "출시·설립·투자 일정 관리", how: "할 일·기간·선후관계로 가장 긴 줄(핵심 경로)을 찾고, 그 일부터 지켜요.", tool: "project-timeline-planner" },
  { name: "RICE·ICE", group: "execution", when: "할 일이 너무 많을 때 순서 정하기", how: "도달 × 영향 × 확신 ÷ 노력으로 점수를 매겨 높은 순서로 해요.", tool: "priority-decision-matrix" },
  { name: "아이젠하워 매트릭스", group: "execution", when: "대표·관리자 개인 시간 관리", how: "급함 × 중요함 4칸: 중요하지만 급하지 않은 일에 시간을 먼저 막아 둬요." },
  { name: "프리모템", group: "execution", when: "큰 프로젝트 시작 직전", how: "'1년 뒤 이 프로젝트가 실패했다'고 가정하고 이유를 모두 적어 미리 막아요." },
  { name: "3 Horizons", group: "execution", when: "지금 사업과 미래 사업에 자원 배분", how: "H1 현재 핵심(70%), H2 떠오르는 사업(20%), H3 미래 실험(10%)으로 나눠요." },
  { name: "단위경제(LTV/CAC)", group: "finance", when: "광고비를 늘려도 되는지 판단할 때", how: "고객 한 명의 평생 이익(LTV)이 획득 비용(CAC)의 3배 이상이고 12개월 안에 회수되는지 봐요.", tool: "unit-economics-runway-calculator" },
  { name: "런웨이·기본 생존", group: "finance", when: "채용·투자 유치 시점 결정", how: "현금 ÷ 월 순소진으로 버틸 달을 보고, 돈이 떨어지기 전에 흑자 전환하는지(default alive) 확인해요.", tool: "unit-economics-runway-calculator" },
  { name: "손익분기점", group: "finance", when: "가격·원가 결정, 매장 오픈 검토", how: "고정비 ÷ (단가 − 단위 변동비)만큼 팔아야 본전이에요.", tool: "unit-economics-runway-calculator" },
  { name: "13주 현금흐름표", group: "finance", when: "현금이 빠듯할 때 주 단위 관리", how: "앞으로 13주 동안 들어오고 나갈 돈을 주별로 적고 매주 실제와 비교해 고쳐요." },
  { name: "DCF 기업가치", group: "finance", when: "투자·M&A·지분 거래 가격 협상", how: "앞으로의 잉여현금흐름을 할인율(WACC)로 현재가치로 바꿔 더해요.", tool: "dcf-valuation-calculator" },
  { name: "제로베이스 예산", group: "finance", when: "비용 구조를 새로 짤 때", how: "작년 예산에서 출발하지 않고, 모든 비용을 0에서 필요성을 따져 다시 배정해요." },
  { name: "의사결정 트리", group: "decision", when: "불확실성이 큰 투자·출시 결정", how: "선택과 운을 나눠 그리고 끝에서부터 기대값을 계산해, 손실 확률과 함께 비교해요.", tool: "decision-tree-calculator" },
  { name: "가중 의사결정표", group: "decision", when: "여러 기준으로 선택지를 비교할 때(채용·업체 선정)", how: "기준별 중요도와 점수를 곱해 더하고, 순위가 뒤집히는 중요도를 확인해요.", tool: "priority-decision-matrix" },
  { name: "되돌릴 수 있는 결정(투웨이 도어)", group: "decision", when: "결정 속도를 정할 때", how: "되돌릴 수 있는 결정은 빨리 실무자가, 되돌릴 수 없는 결정은 천천히 신중하게 해요." },
  { name: "시나리오 플래닝", group: "decision", when: "환율·금리·규제처럼 큰 변수가 있을 때", how: "가장 불확실하고 영향이 큰 두 변수로 4개 미래를 그리고, 어느 미래에서도 통하는 행동을 골라요." },
  { name: "제1원리 사고", group: "decision", when: "업계 관행을 깨고 원가·구조를 다시 볼 때", how: "'원래 그렇다'를 빼고 물리적·경제적 기본 요소까지 쪼개 다시 조립해요." },
  { name: "RACI", group: "people", when: "누가 무엇을 책임지는지 흐릴 때", how: "일마다 실행(R)·최종 책임(A)·상의(C)·공유(I)를 한 명씩 정해요. A는 한 명만." },
  { name: "SBI 피드백", group: "people", when: "직원 피드백·평가 면담", how: "상황(S)·행동(B)·영향(I) 순서로 사실만 말하고, 다음 행동을 함께 정해요." },
  { name: "회고(KPT)", group: "people", when: "프로젝트·분기 마무리", how: "유지할 것(Keep), 문제(Problem), 시도할 것(Try)을 적고 Try 하나는 담당자와 기한을 붙여요." },
];
