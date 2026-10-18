// 자동차 신규등록 공채(도시철도채권·지역개발채권) 매입 기준 데이터 (2026-10-17 grokbot 재작성).
// WHY: Gemini 초안(ef6d566)은 지역별 요율을 페이지 스크립트에 하드코딩했고 부산·대구·인천의 2026 면제,
// 서울 소형차 면제 연장(2028-12-31), 2023년 이후 표면금리 2.5%를 반영하지 못했다.
// 원칙: 공식 자료로 확인한 값만 숫자로 둔다. 확인 못 한 칸은 null(= 화면에 '확인 필요')로 두고 추측하지 않는다.
// 범위: 비사업용 승용자동차 "신규등록"만. 이전등록·사업용·승합·화물·하이브리드 별도 규정은 다루지 않는다.

export const CAR_BOND_VERIFIED_ON = "2026-10-17";

/** 크기 구분. 내연기관은 배기량, 전기·수소차는 길이·너비·높이(소형 4.7m·1.7m·2.0m 이하) 기준. */
export const SIZE_CLASSES = [
  { id: "compact", label: "경형 (1,000cc 미만)" },
  { id: "small", label: "소형 (1,000cc 이상 1,600cc 미만)" },
  { id: "mid", label: "중형 (1,600cc 이상 2,000cc 미만)" },
  { id: "large", label: "대형 (2,000cc 이상)" },
];

/** 채권 종류별 상환 조건(확인된 것만). */
export const BOND_TERMS = {
  seoulRail: {
    name: "서울 도시철도공채",
    maturityYears: 7, // 서울특별시 도시철도공채 조례 제4조①: 발행일부터 7년 후 일시 상환
    couponRate: 0.025, // 2023-01-01 발행분부터 연 2.5%(1.0%에서 인상), 연 복리
    source: "서울특별시 도시철도공채 조례 제4조, 서울시 보도(2022-12) 발행금리 2.5% 인상",
  },
  regionalDev: {
    name: "지역개발채권",
    maturityYears: 5, // 매입 5년 후 만기 일시 상환
    couponRate: 0.025, // 행정안전부 개선방안: 2023-01부터 표면금리 1.05% → 2.5% 전국 일괄
    source: "행정안전부 지역개발채권·도시철도채권 개선방안(2023-01 시행, 충남도 보도 인용)",
  },
};

/** 비율 r = 취득세 과세표준 × r, 0 = 면제, null = 확인 필요. */
export const CAR_BOND_REGIONS = [
  {
    id: "seoul",
    name: "서울특별시",
    bond: "seoulRail",
    rates: { compact: 0, small: 0, mid: 0.12, large: 0.2 },
    // 전기·수소차(다목적형·7인승 이상 제외): 도시철도법 시행령 별표 크기별 9·12·20%에서 250만 원 면제(2026-12-31 등록분까지)
    ev: { rates: { compact: 0, small: 0.09, mid: 0.12, large: 0.2 }, deduction: 2_500_000, until: "2026-12-31" },
    note: "소형(1,000~1,600cc 미만) 신규·이전등록 면제는 2028-12-31까지 연장됐어요.",
    basisDate: "2026-01-01",
    source: "서울특별시 도시철도공채 조례 제3조(시행 2026-01-01, 조례 제9928호), 도시철도법 시행령 별표",
    url: "https://www.law.go.kr/LSW/ordinInfoR.do?ordinSeq=2098693",
  },
  {
    id: "busan",
    name: "부산광역시",
    bond: null,
    rates: { compact: 0, small: 0, mid: 0, large: 0 },
    ev: { rates: { compact: 0, small: 0, mid: 0, large: 0 }, deduction: 0, until: "2026-12-31" },
    note: "신규등록은 1,000~2,000cc 미만, 대형, 다목적형 모두 2026-12-31까지 매입 면제예요.",
    basisDate: "2026-12-31 면제 기한",
    source: "부산광역시 차량등록사업소 도시철도채권 매입 기준표",
    url: "https://www.busan.go.kr/car/crregistfeerail",
  },
  {
    id: "daegu",
    name: "대구광역시",
    bond: null,
    rates: { compact: 0, small: 0, mid: 0, large: 0.05 },
    ev: null,
    note: "경형·소형·중형 신규등록은 2026-12-31까지 면제, 대형(2,000cc 이상 또는 길이·너비·높이 모두 소형 초과)은 5%예요. 시의회에서 면제 기한을 2029-12-31로 늘리는 조례 개정안을 다뤘어요(2026-06).",
    basisDate: "적용기간 2026-12-31까지",
    source: "대구광역시 도시철도채권 안내(교통), 대구시의회 제325회 제2차 본회의 부록",
    url: "https://www.daegu.go.kr/tra/index.do?menu_id=00933834",
  },
  {
    id: "incheon",
    name: "인천광역시",
    bond: "regionalDev",
    rates: { compact: 0, small: 0, mid: 0, large: 0.05 },
    ev: null,
    note: "2026년도 기준 1,600cc 이상(2,000cc 미만)은 면제, 2,000cc 이상 일반형은 5% 매입 유지예요(다목적형 면제, 리스·하이브리드는 2026-12-31까지 면제).",
    basisDate: "2026년도 매입기준",
    source: "인천광역시 부평구청 2026년도 인천광역시 지역개발채권 매입기준",
    url: "https://www.icbp.go.kr/main/civil/car/penalty.jsp",
  },
  {
    id: "gyeonggi",
    name: "경기도",
    bond: "regionalDev",
    rates: { compact: 0, small: 0, mid: 0.08, large: 0.12 },
    ev: null,
    note: "경기도는 경계가 '초과'예요: 1,600cc 이하 면제, 1,600cc 초과 8%, 2,000cc 초과 12%. 1,600cc 초과 하이브리드도 2025-07부터 매입 대상이에요.",
    basisDate: "경기도 지역개발기금 설치 조례 현행",
    source: "경기도 광주시청 취득세율·공채율(경기도 기준), 경기도 보도(하이브리드 매입 의무화)",
    url: "https://corona.gjcity.go.kr/depart/contents.do?mId=0409080000",
  },
  // Keep tuple positions typed: inferred string[] unions hide numeric rate columns (2026-10-19).
  .../** @type {Array<[string, string, number, number]>} */ ([
    ["gwangju", "광주광역시", 0.04, 0.05],
    ["daejeon", "대전광역시", 0.12, 0.2],
    ["ulsan", "울산광역시", 0.08, 0.12],
    ["sejong", "세종특별자치시", 0.08, 0.12],
    ["gangwon", "강원특별자치도", 0.08, 0.12],
    ["chungbuk", "충청북도", 0.06, 0.12],
    ["chungnam", "충청남도", 0.04, 0.05],
    ["jeonbuk", "전북특별자치도", 0.04, 0.05],
    ["jeonnam", "전라남도", 0.06, 0.1],
    ["gyeongbuk", "경상북도", 0.04, 0.08],
  ]).map(([id, name, mid, large]) => ({
    id,
    name,
    bond: null,
    rates: { compact: 0, small: null, mid, large },
    ev: null,
    note: "중형·대형 요율은 대구시의회 자료의 시·도 비교표(2026-04-01 기준)예요. 소형(1,000~1,600cc 미만) 면제 여부와 상환 조건은 해당 시·도 공고로 확인해 주세요.",
    basisDate: "2026-04-01 (시·도 비교표)",
    source: "대구광역시의회 제325회 제2차 본회의 부록, 시·도별 채권 매입 비교(승용자동차 기준)",
    url: "https://council.daegu.go.kr/record/main?reform=appendix_download&uid=23235",
  })),
  ...[
    ["gyeongnam", "경상남도"],
    ["jeju", "제주특별자치도"],
  ].map(([id, name]) => ({
    id,
    name,
    bond: null,
    rates: { compact: 0, small: null, mid: null, large: null },
    ev: null,
    note: "비교표에는 '면제'로만 적혀 있어 일반 구매에도 적용되는지 확인하지 못했어요. 해당 도 공고로 확인해 주세요.",
    basisDate: "확인 필요",
    source: "대구광역시의회 제325회 제2차 본회의 부록(표기만 확인)",
    url: "https://council.daegu.go.kr/record/main?reform=appendix_download&uid=23235",
  })),
];

/** 매입금액 끝수: 최저 5천 원, 5천 원 단위로 2,500원 미만 버리고 이상은 5천 원으로 올림(부산시 안내 기준). */
export function roundBondAmount(amount) {
  const a = Math.max(0, Number(amount) || 0);
  if (a === 0) return 0;
  const rounded = Math.floor(a / 5000) * 5000 + (a % 5000 >= 2500 ? 5000 : 0);
  return Math.max(5000, rounded);
}

/**
 * @param {{ regionId: string, sizeClass: string, isEv?: boolean, taxBase: number, discountRate?: number }} p
 * taxBase = 취득세 과세표준(부가세 제외 공급가액), discountRate = 당일 즉시 매도 할인율(0.06 = 6%)
 */
export function carBond2026({ regionId, sizeClass, isEv = false, taxBase, discountRate = 0 }) {
  const region = CAR_BOND_REGIONS.find((r) => r.id === regionId);
  if (!region) throw new Error(`unknown region: ${regionId}`);
  const base = Math.max(0, Number(taxBase) || 0);
  const rule = isEv ? region.ev : { rates: region.rates, deduction: 0 };
  const rate = rule ? rule.rates[sizeClass] : null;
  if (rate === null || rate === undefined) {
    return { region, status: "unknown", rate: null, bondAmount: null, discountCost: null, bankPayout: null, maturity: null };
  }
  if (rate === 0) {
    return { region, status: "exempt", rate: 0, bondAmount: 0, discountCost: 0, bankPayout: 0, maturity: null };
  }
  const gross = base * rate;
  const bondAmount = roundBondAmount(Math.max(0, gross - (rule.deduction || 0)));
  if (bondAmount === 0 || gross <= (rule.deduction || 0)) {
    return { region, status: "exempt", rate, bondAmount: 0, discountCost: 0, bankPayout: 0, maturity: null };
  }
  const discountCost = Math.floor(bondAmount * Math.max(0, Number(discountRate) || 0));
  const terms = region.bond ? BOND_TERMS[region.bond] : null;
  const maturity = terms
    ? {
        years: terms.maturityYears,
        couponRate: terms.couponRate,
        amount: Math.floor(bondAmount * Math.pow(1 + terms.couponRate, terms.maturityYears)),
        source: terms.source,
      }
    : null;
  return { region, status: "purchase", rate, bondAmount, discountCost, bankPayout: bondAmount - discountCost, maturity };
}
