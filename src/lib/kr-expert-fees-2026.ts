// 상담자 니즈 2차 (2026-11-24, CHOSEUN "상담자 니즈에 따른 도구와 스킬 계속 추가").
// 연관검색어: "감정평가사 수수료 계산기", "감정평가사 비용", "국선변호사 비용", "법률구조공단 무료".
// 일반 정보예요. 감정평가를 의뢰받거나 소송을 대리하지 않아요. 원문(2026-11-24 확인):
// - 국토교통부공고 제2026-145호 「감정평가법인등의 보수에 관한 기준」(2026. 2. 9. 시행) 제2·4·5·6·10·11·13·14·15조, [별표] 감정평가수수료 체계(PDF)
// - 대한법률구조공단 누리집 "법률구조 대상자 안내" 소득별 보기(klac.or.kr/legalstruct/legalRescueGuide.do)
// - 보건복지부고시 제2025-135호 2026년 기준 중위소득(kr-welfare-2026.ts MEDIAN_INCOME_2026와 같은 값, 표 이미지로 대조)
// 확인 못 한 것: 공단이 어떤 소득(가구 소득인정액 등)으로 재는지, 공단 변호사비용 금액표, 감정평가 여비 금액표.
import { MEDIAN_INCOME_2026 } from "./kr-welfare-2026.ts";

export const FEES_AS_OF = "2026-11-24";
export type Tone = "warn" | "info" | "good";
export type EItem = { tone: Tone; text: string; cite: string };

// ── 감정평가수수료 ──
const AP = "감정평가법인등의 보수에 관한 기준(국토교통부공고 제2026-145호)";
const EOK = 100_000_000;
/** [별표] 구간: from 초과 구간의 1만분의 rate. 5천만원 이하는 250,000원 고정. */
const BANDS: [number, number][] = [[0.5 * EOK, 11], [5 * EOK, 9], [10 * EOK, 8], [50 * EOK, 7], [100 * EOK, 6], [500 * EOK, 5], [1000 * EOK, 4], [3000 * EOK, 3], [6000 * EOK, 2], [10000 * EOK, 1]];

/** 별표 수수료(factor 0.8 하한 · 1 기준 · 1.2 상한). 초과액 부분에만 factor를 곱해요(별표 구간 시작 금액으로 대조). */
export function appraisalBaseFee(value: number, factor = 1): number {
  const v = Math.max(0, value || 0);
  let fee = 250_000;
  for (let i = 0; i < BANDS.length; i++) {
    const [from, rate] = BANDS[i];
    if (v <= from) break;
    const to = i + 1 < BANDS.length ? BANDS[i + 1][0] : Infinity;
    fee += ((Math.min(v, to) - from) * rate / 10_000) * factor;
  }
  return Math.floor(fee / 1000) * 1000; // 제15조: 1,000원 미만 절사
}

export type SurchargeId = "retro6m" | "forestIsland" | "road" | "court" | "expropriation" | "other";
export const SURCHARGE_CASES: { id: SurchargeId; label: string }[] = [
  { id: "retro6m", label: "의뢰일보다 6개월 이상 과거 시점 기준 평가" },
  { id: "forestIsland", label: "도로로 갈 수 없는 섬의 물건, 산림(임야)" },
  { id: "road", label: "도로·구거·철도·하천·제방·묘지·선하지 등" },
  { id: "court", label: "법원의 소송평가" },
  { id: "expropriation", label: "토지수용위원회 재결용 평가" },
  { id: "other", label: "그 밖의 특수평가(입목·광산·어장·구축물·해체처분 등)" },
];

export function appraisalFee(x: { value: number; surcharge?: SurchargeId[]; apartments10?: boolean; buildings?: number }) {
  const value = Math.max(0, x.value || 0);
  const low = appraisalBaseFee(value, 0.8), base = appraisalBaseFee(value, 1), high = appraisalBaseFee(value, 1.2);
  const surcharged = (x.surcharge ?? []).length > 0;
  const discount = Boolean(x.apartments10);
  const disc = (f: number) => Math.max(250_000, Math.floor((f * 0.8) / 1000) * 1000);
  const range = discount && !surcharged ? { low: disc(low), base: disc(base), high: disc(high) } : { low, base, high };
  const survey = Math.max(0, Math.round(x.buildings ?? 0)) * 10_000;
  const items: EItem[] = [
    { tone: "info", text: `별표 수수료: 하한(0.8배) ${range.low.toLocaleString("ko-KR")}원 · 기준 ${range.base.toLocaleString("ko-KR")}원 · 상한(1.2배) ${range.high.toLocaleString("ko-KR")}원. 착수 전에 이 범위에서 요율을 협의해요(제2조③, 제4조①).`, cite: AP },
    { tone: "info", text: `착수금은 감정평가예정액 기준 수수료의 2분의 1까지 받을 수 있어요(기준 수수료면 ${Math.floor(range.base / 2).toLocaleString("ko-KR")}원)(제13조).`, cite: AP },
    { tone: "info", text: `보수 = 수수료 + 실비. 실비는 여비, 물건조사비(건물 1동당 1만원${survey ? `, 입력한 ${x.buildings}동이면 ${survey.toLocaleString("ko-KR")}원` : ""}), 공부발급비(수입인지·증지대), 그 밖의 실비예요. 여비 금액표는 여기서 계산하지 않아요(제3조, 제10조).`, cite: AP },
    { tone: "info", text: "감정평가와 관련한 상담·자문은 구두·전화 1건 3만원, 서면 1건 10만원 범위에서 합의해요(제11조).", cite: AP },
    { tone: "info", text: "의뢰인이 임의로 철회하면, 감정평가서 발급 전에는 예정액 수수료의 2분의 1 이하에서 협의한 인건비와 실비, 발급 후에는 수수료의 2분의 1과 실비를 내요. 감정평가법인 사정으로 반려하면 받은 착수금의 1.5배를 돌려줘요(제14조, 제2조④).", cite: AP },
  ];
  if (discount && !surcharged) items.push({ tone: "good", text: "가치형성요인이 비슷한 10호 이상 공동주택 평가는 20% 할인을 적용했어요. 할인 후 25만원보다 적으면 25만원이에요(제6조②3, 제4조③).", cite: AP });
  if (surcharged) items.push({ tone: "warn", text: "고른 물건은 \"100분의 150의 할증률\" 적용 대상이에요(제5조②). 할증이 들어간 물건이 있으면 수수료 최저액은 375,000원이에요(제4조③). 할증 금액은 감정평가법인이 착수 전에 고지해요. 이 도구는 할증 후 금액을 계산하지 않아요.", cite: AP });
  if (value <= 50_000_000) items.push({ tone: "info", text: "감정평가액 5천만원 이하는 별표상 250,000원이에요.", cite: AP });
  items.push({ tone: "info", text: "같은 사람이 여러 물건을 한꺼번에 의뢰하면 감정평가액 총액으로 수수료를 계산해요. 다만 대출 건이 다르거나 경매번호가 다르면 따로예요(제8조①).", cite: AP });
  items.push({ tone: "info", text: "부가가치세는 이 기준에 적혀 있지 않아 더하지 않았어요. 견적서에서 따로 확인하세요.", cite: AP });
  return { asOf: FEES_AS_OF, ...range, survey, surcharged, items };
}

// ── 대한법률구조공단 소송지원 대상 ──
const LA = "대한법률구조공단 법률구조 대상자 안내(소득별 보기)";
export const medianIncome2026 = (size: number) => {
  const n = Math.max(1, Math.floor(size || 1));
  return n <= 7 ? MEDIAN_INCOME_2026[n - 1] : MEDIAN_INCOME_2026[6] + (n - 7) * 959_198; // 고시: 8인 이상 1인마다 959,198원
};

export type AidGroup = "none" | "noLimit" | "basic" | "wage400" | "median125" | "median150" | "smallBiz";
export const AID_GROUPS: { id: AidGroup; label: string; examples: string }[] = [
  { id: "noLimit", label: "소득 제한 없음", examples: "아동·청소년대상 성범죄 피해자, 성폭력범죄 피해자, 아동학대범죄 피해아동, 중대재해 피해자·유족, 가습기살균제 피해자, 임금체불·재해보상 피해선원 등" },
  { id: "basic", label: "기초생활수급자·차상위", examples: "생활보장수급대상자, 차상위 계층" },
  { id: "wage400", label: "최종 3개월 평균 임금 400만원 미만", examples: "임금 등 체불 피해근로자" },
  { id: "median125", label: "기준 중위소득 125% 이하", examples: "장애인, 한부모가족, 국가유공자 등 보훈 대상, 결혼이민자·귀화자, 국내 거주 외국인, 가정폭력·성폭력 피해자, 범죄피해자, 소액임차인, 개인회생·파산·면책 신청 대상자, 의료사고 피해자, 전세사기 피해자, 플랫폼종사자, 노무제공자, 청년미취업자·대학생, 국민 일반 등" },
  { id: "median150", label: "기준 중위소득 150% 이하", examples: "농·어업인, 소상공인" },
  { id: "smallBiz", label: "연매출 3억원 이하", examples: "소상공인" },
];

export function legalAidCheck(x: { group: AidGroup; household: number; monthlyIncome: number; avgWage3m?: number; sales?: number }) {
  const items: EItem[] = [];
  const median = medianIncome2026(x.household);
  let fits: boolean | null = null;
  const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
  switch (x.group) {
    case "noLimit": fits = true; items.push({ tone: "good", text: "소득 제한이 없는 대상이에요.", cite: LA }); break;
    case "basic": fits = true; items.push({ tone: "good", text: "수급자·차상위는 별도 소득 기준 없이 대상이에요.", cite: LA }); break;
    case "wage400": { const w = x.avgWage3m ?? 0; fits = w < 4_000_000; items.push({ tone: fits ? "good" : "warn", text: `최종 3개월 평균 임금 ${won(w)}: 400만원 미만${fits ? "이에요" : "이 아니에요"}.`, cite: LA }); break; }
    case "median125": case "median150": {
      const pct = x.group === "median125" ? 1.25 : 1.5;
      const line = Math.floor(median * pct);
      fits = (x.monthlyIncome || 0) <= line;
      items.push({ tone: fits ? "good" : "warn", text: `${x.household}인 가구 2026 기준 중위소득 ${won(median)} × ${pct * 100}% = ${won(line)}. 입력한 월소득 ${won(x.monthlyIncome || 0)}은 ${fits ? "이하예요" : "넘어요"}.`, cite: `${LA}, 보건복지부고시 제2025-135호` });
      items.push({ tone: "info", text: "공단이 어떤 소득(가구 소득, 재산 환산 포함 여부 등)으로 판단하는지는 누리집에 적혀 있지 않아요. 필요한 서류와 함께 132에서 확인하세요.", cite: LA });
      break;
    }
    case "smallBiz": { const s = x.sales ?? 0; fits = s <= 300_000_000; items.push({ tone: fits ? "good" : "warn", text: `연매출 ${won(s)}: 3억원 이하${fits ? "예요" : "가 아니에요"}.`, cite: LA }); break; }
    default: items.push({ tone: "info", text: "해당하는 대상 유형을 먼저 골라요. 목록에 없으면 공단 132에 물어보세요.", cite: LA });
  }
  items.push({ tone: "info", text: "공단 소송지원도 낮은 수준의 변호사비용과 송달료·인지대 같은 소송실비는 기본적으로 본인 부담이에요. 비용을 내주는 출연기관이 있는 대상이면 전부 또는 일부를 면제해요.", cite: LA });
  items.push({ tone: "info", text: "대상 사건(민사·형사)은 유형마다 달라요. 예술인처럼 대상 사건 제한이 있는 유형도 있어요.", cite: LA });
  return { asOf: FEES_AS_OF, fits, median, items };
}
