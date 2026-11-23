// 무료 전문가 대리 자격 확인 + 양도소득 필요경비 점검 (2026-11-23, CHOSEUN "사람들이 전문가를 찾아가는 니즈").
// 연관검색어 조사에서 가장 많이 나온 두 갈래: "○○ 무료 상담·국선" / "중개수수료·법무사비 필요경비".
// 일반 정보예요. 사건을 대리하거나 세액을 신고하지 않아요. 원문(국가법령정보센터, 2026-11-23 확인):
// - 노동위원회법 제6조의2, 시행규칙 제3·4·6조(고용노동부령 제135호, 2015. 7. 21. 시행)
// - 고용노동부고시 제2021-131호(2022. 1. 1. 시행): 월평균임금 300만원 미만
// - 국세기본법 제59조의2(법률 제21987호, 2026. 10. 2. 시행), 시행령 제48조의2(대통령령 제36125호, 2026. 7. 1. 시행)
// - 소득세법 시행령 제89조①1·제163조①③⑤(대통령령 제36737호, 2026. 10. 1. 시행)
// 확인 못 한 것(그래서 넣지 않음): 대한법률구조공단 소득 기준, 마을세무사·마을변호사 운영 기준.

export const FREE_AS_OF = "2026-11-23";
export type Tone = "warn" | "info" | "good";
export type FItem = { tone: Tone; text: string; cite: string };

const LC = "노동위원회법 제6조의2·시행규칙 제3·4·6조, 고용노동부고시 제2021-131호";
/** 노동위원회 권리구제업무 대리(변호사·공인노무사 무료 선임). */
export function laborCommissionAgent(x: { monthlyWage: number; hasOwnAgent?: boolean }) {
  const w = Math.max(0, x.monthlyWage || 0);
  const wageOk = w < 3_000_000;
  const eligible = wageOk && !x.hasOwnAgent;
  const items: FItem[] = [
    wageOk
      ? { tone: "good", text: `월평균임금 ${w.toLocaleString("ko-KR")}원은 300만원 미만이라 권리구제업무 대리인 선임을 신청할 수 있어요.`, cite: LC }
      : { tone: "warn", text: `월평균임금 ${w.toLocaleString("ko-KR")}원은 300만원 미만이 아니라 신청 대상이 아니에요(300만원은 대상 아님).`, cite: LC },
    { tone: "info", text: "대상 사건: 노동위원회의 판정·결정·승인·인정 또는 차별시정 등에 관한 사건(부당해고 구제신청 등). 노동위원회가 위촉한 변호사·공인노무사 중에서 선임해요.", cite: LC },
    { tone: "info", text: "신청서(별지 제2호서식)에 월평균임금이 기준 미만임을 증명하는 서류를 함께 내요.", cite: LC },
    { tone: "info", text: "대리인 보수는 노동위원회가 예산 범위에서 1건당 70만원 이하로 지급해요. 신청인이 내는 돈이 아니에요.", cite: LC },
  ];
  if (x.hasOwnAgent) items.push({ tone: "warn", text: "이미 다른 변호사·공인노무사를 대리인으로 선임했다면 선임이 취소돼요(시행규칙 제3조②1).", cite: LC });
  return { asOf: FREE_AS_OF, eligible, items };
}

const NT = "국세기본법 제59조의2, 시행령 제48조의2";
export type TaxKind = "income" | "vat" | "corporate" | "other" | "inheritance" | "gift" | "comprehensiveRealEstate";
/** 국세 국선대리인(이의신청·심사·심판청구, 고충민원, 과세전적부심사). */
export function nationalTaxAgent(x: { person: "individual" | "corp"; income: number; assets: number; claim: number; taxKind: TaxKind }) {
  const items: FItem[] = [];
  const income = Math.max(0, x.income || 0), assets = Math.max(0, x.assets || 0), claim = Math.max(0, x.claim || 0);
  const incomeLimit = x.person === "individual" ? 50_000_000 : 300_000_000;
  const okIncome = income <= incomeLimit, okAssets = assets <= 500_000_000, okClaim = claim <= 50_000_000;
  const okKind = !["inheritance", "gift", "comprehensiveRealEstate"].includes(x.taxKind);
  const incomeLabel = x.person === "individual" ? "종합소득금액" : "수입금액(매출액)";
  const assetLabel = x.person === "individual" ? "소유 재산 가액(토지·건물, 승용차, 전세금·임차보증금, 골프·콘도회원권, 주식·출자지분 합계)" : "자산가액";
  items.push({ tone: okIncome ? "good" : "warn", text: `${incomeLabel} ${income.toLocaleString("ko-KR")}원: 기준 ${incomeLimit.toLocaleString("ko-KR")}원 이하${okIncome ? "예요" : "가 아니에요"}.`, cite: NT });
  items.push({ tone: okAssets ? "good" : "warn", text: `${assetLabel} ${assets.toLocaleString("ko-KR")}원: 기준 5억원 이하${okAssets ? "예요" : "가 아니에요"}.`, cite: NT });
  items.push({ tone: okClaim ? "good" : "warn", text: `신청·청구 금액 ${claim.toLocaleString("ko-KR")}원: 기준 5천만원 이하${okClaim ? "예요" : "가 아니에요"}.`, cite: NT });
  items.push({ tone: okKind ? "good" : "warn", text: okKind ? "상속세·증여세·종합부동산세가 아닌 세목이에요." : "상속세·증여세·종합부동산세는 국선대리인 대상이 아니에요.", cite: NT });
  items.push({ tone: "info", text: x.person === "individual" ? "종합소득금액은 신고기한(5월) 전 신청이면 전전 과세기간, 신고기한 뒤 신청이면 직전 과세기간 금액으로 봐요." : "법인세 신고기한 전 신청이면 전전 사업연도, 뒤면 직전 사업연도의 수입금액과 그 사업연도말 자산가액으로 봐요.", cite: NT });
  items.push({ tone: "info", text: "대상 절차: 이의신청·심사청구·심판청구, 정해진 고충민원, 과세전적부심사. 재결청은 요건을 갖춘 신청을 받은 날부터 5일 안에 선정 결과를 알려야 해요. 국선대리인은 변호사·세무사·세무대리 등록 공인회계사예요.", cite: NT });
  return { asOf: FREE_AS_OF, eligible: okIncome && okAssets && okClaim && okKind, items };
}

const CG = "소득세법 시행령 제89조①1·제163조①③⑤";
export type ExpenseId = "acqTax" | "acqOther" | "acqLawsuit" | "improve" | "repair" | "devCharge" | "saleBrokerage" | "saleReturnPrep" | "saleNotary" | "saleEviction" | "bondLoss";
/** 양도소득 필요경비로 원문에 적힌 항목인지 보여줘요. 금액 판정은 하지 않아요. */
export const NECESSARY_EXPENSES: { id: ExpenseId; label: string; status: "listed" | "check" | "not"; text: string }[] = [
  { id: "acqTax", label: "살 때 낸 취득세·등록면허세", status: "listed", text: "취득가액 = 매입가액 + 취득세·등록면허세 기타 부대비용(시행령 제89조①1, 제163조①1)." },
  { id: "acqOther", label: "살 때 쓴 그 밖의 부대비용(중개보수·법무사 보수 등)", status: "check", text: "원문은 \"기타 부대비용\"으로만 적어요. 개별 항목이 부대비용인지는 이 도구가 판정하지 않아요. 영수증을 챙겨 국세상담센터 126에 확인하세요." },
  { id: "acqLawsuit", label: "소유권을 지키려고 쓴 소송·화해비용", status: "listed", text: "취득·보유 중 쟁송에서 소유권 확보에 직접 든 소송비용·화해비용(다른 소득 필요경비로 넣은 것 제외)(제163조①2, ③2)." },
  { id: "improve", label: "용도변경·개량·이용편의 비용(확장, 새시 등 자본적 지출)", status: "listed", text: "자본적 지출액, 용도변경·개량·이용편의 비용(제163조③1·3). 증명서류를 받아 두었거나 금융거래로 지출이 확인돼야 해요." },
  { id: "repair", label: "도배·장판 같은 수선비(수익적 지출)", status: "not", text: "제163조③은 자본적 지출만 적어요. 원상회복·현상유지용 수선비는 목록에 없어요." },
  { id: "devCharge", label: "개발부담금·재건축부담금", status: "listed", text: "개발이익환수법 개발부담금, 재건축초과이익환수법 재건축부담금(제163조③3의2·3의3)." },
  { id: "saleBrokerage", label: "팔 때 낸 소개비(중개보수)", status: "listed", text: "양도를 위해 직접 지출한 공증비용·인지대·소개비(제163조⑤1다)." },
  { id: "saleReturnPrep", label: "양도세 신고서·계약서 작성비용", status: "listed", text: "양도소득세 과세표준 신고서 작성비용과 계약서 작성비용(제163조⑤1나)." },
  { id: "saleNotary", label: "팔 때 공증비용·인지대", status: "listed", text: "제163조⑤1다." },
  { id: "saleEviction", label: "매수인에게 넘기려고 쓴 명도비용", status: "listed", text: "매매계약에 따른 인도의무를 이행하려고 양도자가 지출하는 명도비용(제163조⑤1라)." },
  { id: "bondLoss", label: "살 때 산 국민주택채권을 만기 전에 팔아 생긴 손실", status: "listed", text: "법령에 따라 매입한 국민주택채권·토지개발채권의 만기 전 매각차손(금융기관에 판 경우 기준)(제163조⑤2)." },
];

export function necessaryExpenseCheck(picked: ExpenseId[]) {
  const sel = NECESSARY_EXPENSES.filter((e) => picked.includes(e.id));
  const items: FItem[] = sel.map((e) => ({ tone: e.status === "listed" ? "good" : e.status === "check" ? "info" : "warn", text: `${e.label}: ${e.text}`, cite: CG }));
  items.push({ tone: "info", text: "자본적 지출·양도비는 증명서류(세금계산서·신용카드 매출전표·현금영수증 등)를 받아 보관하거나 금융거래로 지출이 확인돼야 해요(제163조③⑤ 본문).", cite: CG });
  items.push({ tone: "info", text: "실지거래가액을 확인할 수 없어 매매사례가액·감정가액·환산취득가액을 쓰면, 이 항목들 대신 정해진 금액(토지는 취득 당시 개별공시지가, 건물·주택은 취득 당시 기준시가 × 3%, 미등기는 0.3%)을 더해요. 환산취득가액이면 '환산취득가액 + 정해진 금액'보다 자본적 지출·양도비 합계가 클 때 그 합계를 필요경비로 할 수 있어요(소득세법 제97조②2, 시행령 제163조⑥).", cite: `${CG}, 소득세법 제97조②` });
  return { asOf: FREE_AS_OF, listed: sel.filter((e) => e.status === "listed").length, check: sel.filter((e) => e.status === "check").length, not: sel.filter((e) => e.status === "not").length, items };
}
