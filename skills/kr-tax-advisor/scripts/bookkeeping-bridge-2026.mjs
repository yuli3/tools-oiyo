// GENERATED from tools-oiyo src/lib/bookkeeping-bridge-2026.ts by scripts/build-advisor-skill.mjs. Do not edit here.
// 장부 입력 자료 정리 (2026-11-20). 세운: "세무사랑·TP·위하고·더존 같은 프로그램을 세무사무소 스킬·도구에 넣을까?"
// WHY: 세무 프로그램을 흉내 내거나 대신하지 않아요. 프로그램에 넣기 전(통장·카드 내역 → 분개 표)과
//   넣은 뒤(프로그램에서 내려받은 전표 검토)를 잇는 일만 해요. 프로그램마다 엑셀 업로드 양식이 다르고
//   우리가 원본 양식을 확인할 수 없어서, 열 순서를 사용자가 프로그램의 샘플 양식에 맞춰 고르게 했어요.
// 규칙 근거: 적격증빙 수취 의무(소득세법 제160조의2, 법인세법 제116조), 3만 원 초과 기업업무추진비는
//   적격증빙이 없으면 비용 불인정(법인세법 제25조, 소득세법 제35조), 신용카드 매출전표 매입세액 공제(부가가치세법 제46조),
//   기업업무추진비·비영업용 소형승용차 관련 매입세액 불공제(부가가치세법 제39조), 기한이 공휴일이면 다음 날(국세기본법 제5조).
// 계정 추천은 거래 내용의 낱말로 고르는 출발점이에요. 회사 계정과목표와 실제 용도로 사람이 확정해요.
import { krTaxDeadlineUTC } from "./kr-business-day.mjs";

export const BRIDGE_AS_OF = "2026-11-20";

                                     
                      
               
               
              
             
                        
                    
 
                                                              
                             
                  
               
                
                   
 

const HEAD = {
  date: /^(거래)?일(자|시)|거래일|이용일|승인일|날짜|date/i,
  desc: /적요|내용|거래내용|기재내용|가맹점|이용처|사용처|메모|desc/i,
  out: /출금|찾으신|지급|이용금액|승인금액|결제금액|사용금액|out/i,
  in: /입금|맡기신|받은|in$/i,
  amount: /^금액$|amount/i,
  counterparty: /거래처|받는\s?분|보낸\s?분|상대|예금주|의뢰인/i,
  approval: /승인번호/i,
};

const num = (s                    ) => {
  if (s === undefined) return NaN;
  const t = s.replace(/[,\s원₩]/g, "");
  if (t === "" || t === "-") return 0;
  return Number(t);
};

function normDate(raw        )                {
  const m = raw.trim().match(/^(\d{4})[-./년\s]*(\d{1,2})[-./월\s]*(\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

function splitLine(line        )           {
  const cells = line.includes("\t") ? line.split("\t") : line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  return cells.map((c) => c.trim().replace(/^"|"$/g, ""));
}

/** 은행·카드 내역(엑셀에서 복사, CSV)을 읽어요. 머리글로 열을 찾고, 없으면 날짜·내용·출금·입금 순서로 봐요. */
export function parseStatement(text        , source         = "bank") {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let col                                             = {};
  let start = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const cells = splitLine(lines[i]);
    if (normDate(cells[0] ?? "")) break;
    const found             = {};
    cells.forEach((c, j) => {
      for (const k of Object.keys(HEAD)                         ) if (found[k] === undefined && HEAD[k].test(c)) found[k] = j;
    });
    if (found.date !== undefined && (found.out !== undefined || found.in !== undefined || found.amount !== undefined)) {
      col = found;
      start = i + 1;
      break;
    }
  }
  const guessed = col.date === undefined;
  if (guessed) col = source === "card" ? { date: 0, desc: 1, out: 2 } : { date: 0, desc: 1, out: 2, in: 3 };
  const rows        = [];
  let skipped = start;
  for (const line of lines.slice(start)) {
    const c = splitLine(line);
    const date = normDate(c[col.date ] ?? "");
    let out = col.out !== undefined ? num(c[col.out]) : 0;
    let inn = col.in !== undefined ? num(c[col.in]) : 0;
    if (col.amount !== undefined && col.out === undefined && col.in === undefined) {
      const a = num(c[col.amount]);
      if (a < 0) out = -a;
      else if (source === "card") out = a;
      else inn = a;
    }
    if (!date || !Number.isFinite(out) || !Number.isFinite(inn) || out + inn === 0) {
      skipped++;
      continue;
    }
    if (source === "card" && out < 0) {
      inn = -out;
      out = 0;
    }
    rows.push({
      date,
      desc: col.desc !== undefined ? (c[col.desc] ?? "") : "",
      out: Math.abs(out),
      in: Math.abs(inn),
      counterparty: col.counterparty !== undefined ? c[col.counterparty] || undefined : undefined,
      approval: col.approval !== undefined ? c[col.approval] || undefined : undefined,
    });
  }
  return { rows, skipped, guessed, columns: col };
}

/* ---------- 계정 추천 ---------- */

                                                              
const R = (re        , out             , inn             )       => ({ re, out, in: inn });
export const ACCOUNT_RULES         = [
  R(/카드\s?(대금|결제)|카드사|(신한|국민|삼성|현대|롯데|하나|우리|비씨|BC|NH)카드/i, { account: "미지급금", vat: "none", note: "카드대금 결제(비용은 카드 내역에서 잡아요)", exempt: true }),
  R(/급여|월급|상여|임금/, { account: "급여", vat: "none", note: "원천징수한 세금·4대보험은 예수금으로 나눠요", exempt: true }),
  R(/국민연금/, { account: "세금과공과", vat: "none", note: "회사 부담분. 직원 부담분은 예수금", exempt: true }),
  R(/건강보험|고용보험|산재보험|4대보험|사회보험/, { account: "복리후생비", vat: "none", note: "회사 부담분(고용·산재는 보험료로 쓰기도 해요). 직원 부담분은 예수금", exempt: true }),
  R(/부가세|부가가치세/, { account: "미지급세금", vat: "none", note: "부가세 납부", exempt: true }, { account: "미수금", vat: "none", note: "부가세 환급", exempt: true }),
  R(/원천세|근로소득세|사업소득세/, { account: "예수금", vat: "none", note: "원천징수한 세금 납부", exempt: true }),
  R(/국세|지방세|재산세|자동차세|주민세|면허세|세무서|위택스|홈택스/, { account: "세금과공과", vat: "none", exempt: true }),
  R(/이자/, { account: "이자비용", vat: "none", exempt: true }, { account: "이자수익", vat: "none", exempt: true }),
  R(/대출\s?(원금|상환)|원금상환/, { account: "단기차입금", vat: "none", note: "만기 1년 넘으면 장기차입금", exempt: true }, { account: "단기차입금", vat: "none", note: "대출 실행", exempt: true }),
  R(/보험(?!료\s?환급)/, { account: "보험료", vat: "none", note: "보험료는 면세라 매입세액이 없어요", exempt: true }),
  R(/임대료|월세|임차료/, { account: "지급임차료", vat: "none", note: "임대인이 사업자면 세금계산서를 받아요" }),
  R(/관리비/, { account: "건물관리비", vat: "none", note: "세금계산서를 받았으면 매입세액 따로" }),
  R(/한전|전기|도시가스|가스|수도/, { account: "수도광열비", vat: "deductible" }),
  R(/KT|SKT|SK텔레콤|LG유플|U\+|통신|인터넷|휴대폰/i, { account: "통신비", vat: "deductible" }),
  R(/주유|칼텍스|SK에너지|S-?OIL|에쓰오일|현대오일|오일뱅크|알뜰주유|충전소|주차|하이패스|톨게이트|세차/i, { account: "차량유지비", vat: "deductible", note: "개별소비세 대상 승용차(경차·9인승 초과 등 제외)면 매입세액 불공제" }),
  R(/택시|카카오T|코레일|KTX|SRT|고속버스|시외버스|항공|대한항공|아시아나|제주항공|티웨이|진에어/i, { account: "여비교통비", vat: "nondeductible", note: "여객운송(택시·버스·철도·항공) 카드전표는 매입세액 공제가 안 돼요" }),
  R(/호텔|모텔|숙박|에어비앤비/i, { account: "여비교통비", vat: "deductible", note: "출장 숙박" }),
  R(/거래처\s?(식사|접대|선물|미팅)|접대/, { account: "기업업무추진비", vat: "nondeductible", note: "거래처 접대. 매입세액 불공제, 3만 원 넘으면 적격증빙 필수" }),
  R(/주점|룸|노래|단란|골프|백화점|상품권|선물|꽃집|화환/, { account: "기업업무추진비", vat: "nondeductible", note: "거래처 접대면 기업업무추진비(매입세액 불공제). 개인 사용이면 비용이 아니에요" }),
  R(/식당|한식|중식|일식|분식|김밥|치킨|식사|회식|피자|커피|카페|스타벅스|이디야|메가커피|투썸|배달의민족|배민|요기요|쿠팡이츠|편의점|CU|GS25|세븐일레븐|이마트24/i, { account: "복리후생비", vat: "deductible", note: "직원 식대·간식. 거래처 접대면 기업업무추진비(불공제)" }),
  R(/광고|네이버\s?광고|구글|Google|메타|Facebook|인스타|카카오\s?광고|당근\s?광고/i, { account: "광고선전비", vat: "deductible", note: "해외 결제(구글·메타)는 매입세액이 없을 수 있어요" }),
  R(/택배|우체국|대한통운|CJ|로젠|한진|퀵/i, { account: "운반비", vat: "deductible" }),
  R(/수수료|이체료|PG|토스페이먼츠|KG이니시스|나이스페이/i, { account: "지급수수료", vat: "deductible", note: "은행 이체수수료는 면세라 매입세액이 없어요" }, { account: "외상매출금", vat: "none", note: "PG사 정산 입금(매출 회수)" }),
  R(/세무|회계|노무|법무|기장/, { account: "지급수수료", vat: "deductible", note: "전문가 보수. 세금계산서를 받아요" }),
  R(/쿠팡|다이소|오피스|문구|알파|11번가|G마켓|옥션|네이버페이|스마트스토어/i, { account: "소모품비", vat: "deductible", note: "100만 원 넘는 물건은 비품(자산)인지 확인" }),
  R(/교육|강의|도서|서점|교보|yes24|알라딘/i, { account: "교육훈련비", vat: "none", note: "도서는 면세" }),
];

const DEFAULT_IN             = { account: "외상매출금", vat: "none", note: "매출 대금 입금이면 외상매출금 회수, 아니면 거래 내용 확인" };
const UNKNOWN             = { account: "미분류", vat: "none", note: "거래 내용을 확인해 계정을 정해요" };

export function suggestAccount(t                                                   )             {
  const text = `${t.desc} ${t.counterparty ?? ""}`;
  const dir = t.out > 0 ? "out" : "in";
  for (const r of ACCOUNT_RULES) if (r.re.test(text) && r[dir]) return r[dir] ;
  return dir === "in" ? DEFAULT_IN : UNKNOWN;
}

/* ---------- 분개 ---------- */

                              
               
                
                 
                 
                 
              
                       
               
                   
                  
                         
 

const isWeekend = (date        ) => {
  const d = new Date(`${date}T00:00:00Z`).getUTCDay();
  return d === 0 || d === 6;
};

export function toJournal(rows       , source        , opts                                                                                     = {})                {
  const bank = opts.bankAccount ?? "보통예금";
  const card = opts.cardAccount ?? "미지급금";
  const counter = source === "card" ? card : bank;
  const seen = new Map                ();
  for (const t of rows) seen.set(`${t.date}|${t.out}|${t.in}|${t.desc}`, (seen.get(`${t.date}|${t.out}|${t.in}|${t.desc}`) ?? 0) + 1);
  return rows.map((t, i) => {
    const sg = suggestAccount(t);
    const account = opts.overrides?.[i] ?? sg.account;
    const outflow = t.out > 0;
    const amount = outflow ? t.out : t.in;
    const vatable = source === "card" && outflow && sg.vat === "deductible" && account === sg.account;
    const supply = vatable ? Math.round((amount * 10) / 11) : amount;
    const flags           = [];
    if (account === "미분류") flags.push("계정 미정");
    if (seen.get(`${t.date}|${t.out}|${t.in}|${t.desc}`)  > 1) flags.push("같은 날·같은 금액·같은 내용 중복");
    if (account === "기업업무추진비" && amount > 30_000 && source === "bank") flags.push("3만 원 넘는 기업업무추진비는 카드·현금영수증·세금계산서가 없으면 비용 불인정");
    if (source === "bank" && outflow && !sg.exempt && amount > 30_000 && account !== "미분류") flags.push("계좌이체 3만 원 초과 경비: 세금계산서·계산서·현금영수증을 받았는지 확인(없으면 증빙불비가산세 2%)");
    if (source === "card" && isWeekend(t.date) && /기업업무추진비|소모품비/.test(account)) flags.push("주말 카드 사용: 업무용인지 확인");
    if (source === "card" && sg.vat === "nondeductible") flags.push("매입세액 불공제");
    if (source === "bank" && outflow && !sg.exempt && sg.vat === "deductible") flags.push("세금계산서를 받았으면 매입세액을 따로 잡아요");
    const evidence = source === "card" ? "카드" : sg.exempt ? "불필요" : outflow ? "확인 필요" : "-";
    return {
      date: t.date,
      debit: outflow ? account : counter,
      credit: outflow ? counter : account,
      amount,
      supply,
      vat: amount - supply,
      counterparty: t.counterparty ?? (source === "card" ? t.desc : ""),
      memo: t.desc,
      evidence,
      flags,
      suggestion: sg,
    };
  });
}

export function summarize(lines               ) {
  const byAccount = new Map                ();
  for (const l of lines) {
    const acc = l.debit === "보통예금" || l.debit === "미지급금" ? l.credit : l.debit;
    byAccount.set(acc, (byAccount.get(acc) ?? 0) + l.amount);
  }
  const debit = lines.reduce((a, l) => a + l.amount, 0);
  return {
    n: lines.length,
    debit,
    credit: debit,
    balanced: true,
    unclassified: lines.filter((l) => l.debit === "미분류" || l.credit === "미분류").length,
    flagged: lines.filter((l) => l.flags.length).length,
    vat: lines.reduce((a, l) => a + l.vat, 0),
    byAccount: [...byAccount.entries()].sort((a, b) => b[1] - a[1]).map(([account, amount]) => ({ account, amount })),
  };
}

/* ---------- 내보내기 ---------- */

export const EXPORT_FIELDS = {
  date: "일자",
  debit: "차변계정",
  credit: "대변계정",
  amount: "금액",
  supply: "공급가액",
  vat: "부가세",
  counterparty: "거래처",
  memo: "적요",
  evidence: "증빙",
}         ;
                                                     
export const DEFAULT_ORDER                = ["date", "debit", "credit", "amount", "supply", "vat", "counterparty", "memo", "evidence"];

/** 사용자가 고른 열 순서로 CSV를 만들어요. 프로그램의 엑셀 업로드 샘플 양식에 열을 맞추는 용도예요. */
export function toCsv(lines               , order                = DEFAULT_ORDER, header = true)         {
  const esc = (v                 ) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const out = lines.map((l) => order.map((k) => esc(l[k])).join(","));
  return (header ? [order.map((k) => EXPORT_FIELDS[k]).join(","), ...out] : out).join("\n");
}

/** "일자,계정,금액" 같은 머리글 문자열을 열 순서로 바꿔요. 모르는 이름은 건너뛰어요. */
export function orderFromHeader(text        )                {
  const alias                              = {
    일자: "date", 날짜: "date", 전표일자: "date", 거래일자: "date",
    차변: "debit", 차변계정: "debit", 차변과목: "debit", 계정: "debit", 계정과목: "debit",
    대변: "credit", 대변계정: "credit", 대변과목: "credit", 상대계정: "credit",
    금액: "amount", 합계: "amount", 합계금액: "amount",
    공급가액: "supply", 공급가: "supply",
    부가세: "vat", 세액: "vat", 부가가치세: "vat",
    거래처: "counterparty", 거래처명: "counterparty",
    적요: "memo", 내용: "memo",
    증빙: "evidence", 증빙구분: "evidence",
  };
  return text
    .split(/[,\t]/)
    .map((s) => alias[s.trim().replace(/\s/g, "")])
    .filter((x)                   => Boolean(x));
}

/* ---------- 신고 시즌 순서 ---------- */

                             
             
                
                                                          
                                                                                   
                  
               
 

const lastDay = (y        , m        ) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export const SEASON_TASKS               = [
  {
    id: "withholding",
    label: "원천세 신고·납부(매월)",
    who: "employer",
    due: (y, m) => ({ y, m, d: 10 }),
    steps: ["프로그램에서 지난달 급여·사업소득 지급 자료를 마감해요.", "원천징수이행상황신고서를 만들고 홈택스로 전자신고(또는 프로그램의 전자신고 파일 변환)해요.", "통장 출금 내역의 원천세 납부를 예수금으로 맞춰요."],
    cite: "소득세법 제128조",
  },
  {
    id: "vat",
    label: "부가가치세 신고(1·4·7·10월 25일)",
    who: "vat",
    due: (y, m) => ([1, 4, 7, 10].includes(m) ? { y, m, d: 25 } : null),
    steps: ["카드·현금영수증 매입 자료를 홈택스에서 내려받아 이 도구로 불공제 항목을 걸러요.", "전자세금계산서 매출·매입을 프로그램으로 불러와 거래처별로 맞춰요.", "부가세 신고서를 만들고, 프로그램에서 내려받은 매입 전표를 전표 데이터 분석기로 한 번 더 봐요."],
    cite: "부가가치세법 제48조·제49조",
  },
  {
    id: "payment-statement",
    label: "근로·퇴직·사업소득 지급명세서 제출(3월 10일)",
    who: "employer",
    due: (y, m) => (m === 3 ? { y, m, d: 10 } : null),
    steps: ["연말정산 자료를 프로그램에서 마감해요.", "지급명세서를 전자 제출해요.", "2월분 원천세 신고와 함께 확인해요."],
    cite: "소득세법 제164조",
  },
  {
    id: "corp-tax",
    label: "법인세 신고(12월 결산 법인, 3월 말)",
    who: "corp",
    due: (y, m) => (m === 3 ? { y, m, d: 31 } : null),
    steps: ["결산 전표를 마감하고 전표 데이터 분석기로 이상 전표를 확인해요.", "세무조정(기업업무추진비 한도, 감가상각 등)을 프로그램에서 해요.", "재무제표·세무조정계산서를 전자신고해요."],
    cite: "법인세법 제60조",
  },
  {
    id: "income-tax",
    label: "종합소득세 신고(5월 31일, 성실신고확인 대상은 6월 30일)",
    who: "individual",
    due: (y, m) => (m === 5 ? { y, m, d: 31 } : m === 6 ? { y, m, d: 30 } : null),
    steps: ["1년 치 통장·카드 내역을 이 도구로 분개하고 미분류를 없애요.", "프로그램에서 장부를 마감하고 소득금액을 계산해요.", "성실신고확인 대상이면 6월 30일까지 확인서를 붙여 신고해요."],
    cite: "소득세법 제70조·제70조의2",
  },
];

/** 오늘부터 months개월 안의 신고 일정. 마감일이 주말·공휴일이면 다음 영업일로 미뤄요. */
export function upcomingTasks(today        , who                      = ["all", "employer", "vat", "individual", "corp"], months = 3) {
  const [y0, m0] = today.split("-").map(Number);
  const out                                                                                                = [];
  const t0 = Date.UTC(y0, m0 - 1, Number(today.slice(8, 10)));
  for (let k = 0; k <= months; k++) {
    const y = y0 + Math.floor((m0 - 1 + k) / 12);
    const m = ((m0 - 1 + k) % 12) + 1;
    for (const t of SEASON_TASKS) {
      if (!who.includes(t.who)) continue;
      const d = t.due(y, m);
      if (!d) continue;
      const day = Math.min(d.d, lastDay(d.y, d.m));
      const rolled = krTaxDeadlineUTC(new Date(Date.UTC(d.y, d.m - 1, day)));
      const iso = rolled.toISOString().slice(0, 10);
      const left = Math.round((rolled.getTime() - t0) / 86_400_000);
      if (left < 0) continue;
      out.push({ id: `${t.id}-${iso}`, label: t.label, due: iso, daysLeft: left, steps: t.steps, cite: t.cite });
    }
  }
  return out.sort((a, b) => a.due.localeCompare(b.due));
}

/** 프로그램과 이어 쓰는 법(공통). 프로그램별 메뉴 이름은 판마다 달라서 샘플 양식으로 맞추라고 안내해요. */
export const PROGRAM_NOTES = [
  { name: "세무사랑", how: "전표 엑셀 업로드(자료 가져오기) 기능의 샘플 양식을 내려받아 첫 줄 머리글을 이 도구의 열 순서 칸에 붙여 넣으세요." },
  { name: "위하고(WEHAGO)", how: "엑셀 전표 업로드 샘플의 머리글을 붙여 넣고, 계정과목은 회사 계정과목표 이름과 똑같이 맞추세요." },
  { name: "더존 Smart A·iCUBE", how: "엑셀 전표 변환 양식의 열 순서에 맞추고, 계정코드가 필요한 양식이면 계정과목표에서 코드를 옮겨 적으세요." },
  { name: "Tax Partners(TP)", how: "자료 가져오기 양식의 머리글을 붙여 넣어 열을 맞추세요. 거래처는 프로그램에 먼저 등록돼 있어야 할 수 있어요." },
];

export const SAMPLE_BANK = `거래일자,적요,출금액,입금액,잔액,거래처
2026-10-01,월세 10월,1500000,,8500000,김건물
2026-10-02,스마트스토어 정산,,3200000,11700000,네이버파이낸셜
2026-10-05,한전 전기요금,82000,,11618000,한국전력
2026-10-10,원천세 납부,135000,,11483000,국세
2026-10-10,급여 10월,2800000,,8683000,홍길동
2026-10-12,국민연금,90000,,8593000,국민연금공단
2026-10-15,신한카드 결제,1240000,,7353000,신한카드
2026-10-18,디자인 외주,550000,,6803000,이디자인
2026-10-21,거래처 식사,120000,,6683000,한우명가
2026-10-25,부가세 납부,610000,,6073000,세무서
2026-10-25,부가세 납부,610000,,5463000,세무서
2026-10-28,이자,,3200,5466200,은행`;

export const SAMPLE_CARD = `이용일,가맹점명,이용금액,승인번호
2026-10-03,스타벅스 강남점,18500,12345678
2026-10-04,GS칼텍스 역삼주유소,70000,12345679
2026-10-06,쿠팡,45900,12345680
2026-10-07,카카오T 택시,23400,12345681
2026-10-11,골프장 레이크,320000,12345682
2026-10-13,KT 인터넷,33000,12345683
2026-10-17,네이버 광고,200000,12345684
2026-10-19,한식당 소담,96000,12345685`;
