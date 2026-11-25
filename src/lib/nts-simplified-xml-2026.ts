// 연말정산 간소화 자료(XML) 읽기 (2026-11-25, AI 빌더 조사 추천 1번).
// 구조·서식 코드·태그 이름은 국세청 「연말정산간소화 전자문서 XML 정의서 v1.79」(홈택스 자료실, 2025-12-19)에서 옮겼어요.
//   요약: oiyo-company-brain projects/research/specs/nts-simplified-pdf-xml-2026.md
// 여기서는 XML 글자를 읽어 서식별·사람별 합계를 만들고, 연말정산 계산기 칸으로 옮길 수 있는 것만 옮겨요.
// 사람마다 자격·한도를 따져야 하는 것(가족 교육비, 가족 카드, 부양가족 수 등)은 칸에 넣지 않고 "확인할 것"으로 남겨요.
// 브라우저 안에서만 쓰고, 주민등록번호는 결과에 남기지 않아요(본인 여부만 봐요).

export const NTS_XML_SPEC = "국세청 연말정산간소화 전자문서 XML 정의서 v1.79 (2025-12-19)";

// ── 아주 작은 XML 읽기 (정의서 구조만: 요소·속성·글자. DTD·CDATA·네임스페이스 없음) ──
export type XmlNode = { tag: string; attrs: Record<string, string>; children: XmlNode[]; text: string };
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const unescape = (s: string) => s.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, (_m, e: string) => (e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENT[e.toLowerCase()]));

export function parseXml(src: string): XmlNode {
  const root: XmlNode = { tag: "#root", attrs: {}, children: [], text: "" };
  const stack: XmlNode[] = [root];
  const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[([\s\S]*?)\]\]>|<(\/?)([A-Za-z_][\w.:-]*)((?:\s+[\w.:-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const top = stack[stack.length - 1];
    if (m[1] !== undefined) top.text += m[1];
    else if (m[3]) {
      if (m[2]) {
        if (stack.length > 1 && top.tag === m[3]) stack.pop();
        else throw new Error(`xml: </${m[3]}>`);
      } else {
        const attrs: Record<string, string> = {};
        for (const a of m[4].matchAll(/([\w.:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[a[1]] = unescape(a[2] ?? a[3] ?? "");
        const node: XmlNode = { tag: m[3], attrs, children: [], text: "" };
        top.children.push(node);
        if (!m[5]) stack.push(node);
      }
    } else if (m[6] !== undefined) top.text += unescape(m[6]);
  }
  if (stack.length !== 1) throw new Error("xml: unclosed");
  return root;
}
const kids = (n: XmlNode, tag: string) => n.children.filter((c) => c.tag === tag);
const kid = (n: XmlNode, tag: string) => n.children.find((c) => c.tag === tag);
const won = (s: string | undefined) => {
  const t = (s ?? "").replace(/[,\s]/g, "");
  return /^-?\d+$/.test(t) ? Number(t) : 0;
};

// ── 정의서 구조로 읽기 ──
export type NtsData = { datCd: string; attrs: Record<string, string>; sum: number; sumAttrs: Record<string, string>; fields: Record<string, string> };
export type NtsMan = { self: boolean; name: string; data: NtsData[] };
export type NtsForm = { formCd: string; men: NtsMan[] };
export type NtsDoc = { docType: string; year: string; forms: NtsForm[] };

/** XML 글자 하나(문서 하나)를 읽어요. 루트가 yesone이 아니면 오류예요. */
export function readNtsXml(xml: string): NtsDoc[] {
  const root = parseXml(xml.replace(/^﻿/, ""));
  const yes = kid(root, "yesone");
  if (!yes) throw new Error("not yesone");
  const docs: NtsDoc[] = [];
  // 정의서: yesone > doc(공통) > form 반복. 여러 문서가 한 파일에 들어와도 읽어요.
  for (const doc of kids(yes, "doc")) {
    const selfResid = (kid(doc, "resid")?.text ?? "").trim();
    const forms: NtsForm[] = kids(doc, "form").map((f) => ({
      formCd: (f.attrs.form_cd ?? "").trim(),
      men: kids(f, "man").map((man) => ({
        self: !!selfResid && (man.attrs.resid ?? "").trim() === selfResid,
        name: man.attrs.name ?? "",
        data: kids(man, "data").map((d) => {
          const sumEl = kid(d, "sum");
          const fields: Record<string, string> = {};
          for (const c of d.children) if (c.tag !== "amt" && c.tag !== "sum" && c.tag !== "sum_data") fields[c.tag] = c.text.trim();
          const sd = kid(d, "sum_data") ?? kid(man, "sum_data");
          if (sd) for (const c of sd.children) fields[`sum_data.${c.tag}`] = c.text.trim();
          return { datCd: d.attrs.dat_cd ?? "", attrs: d.attrs, sum: won(sumEl?.text), sumAttrs: sumEl?.attrs ?? {}, fields };
        }),
      })),
    }));
    docs.push({ docType: (kid(doc, "doc_type")?.text ?? "").trim(), year: (kid(doc, "att_year")?.text ?? "").trim(), forms });
  }
  return docs;
}

// ── 계산기 칸으로 옮기기 ──
export type YeFill = Partial<{
  insurancePremium: number; disabledInsurance: number; medical: number; medicalSpecific: number; educationSelf: number;
  credit: number; debit: number; culture: number; market: number; transit: number;
  pensionSavings: number; irp: number; isaTransfer: number; rent: number; leaseRepaid: number; subscriptionPaid: number; mortgageInterest: number;
  donation: number; religiousDonation: number; politicalDonation: number; hometownDonation: number; nationalPension: number; healthEmployment: number;
}>;
/** PDF로 채우는 칸 전부. 넣을 때 이 칸은 0으로 비운 뒤 채워서, 예시 값이 남지 않게 해요. */
export const YE_FILL_KEYS = ["insurancePremium", "disabledInsurance", "medical", "medicalSpecific", "educationSelf", "credit", "debit", "culture", "market", "transit", "pensionSavings", "irp", "isaTransfer", "rent", "leaseRepaid", "subscriptionPaid", "mortgageInterest", "donation", "religiousDonation", "politicalDonation", "hometownDonation", "nationalPension", "healthEmployment"] as const satisfies readonly (keyof YeFill)[];
export const withZeros = (fill: YeFill): Required<YeFill> => ({ ...(Object.fromEntries(YE_FILL_KEYS.map((k) => [k, 0])) as Required<YeFill>), ...fill });
export type YeCheck = { what: string; amount?: number; why: string };
export type YeImport = { year: string; fill: YeFill; checks: YeCheck[]; forms: string[]; people: number };

const base = (cd: string) => cd.slice(0, 4);
const add = (o: YeFill, k: keyof YeFill, v: number) => { if (v > 0) o[k] = (o[k] ?? 0) + v; };
const sumOf = (d: NtsData, ...keys: string[]) => keys.reduce((s, k) => s + won(d.sumAttrs[k]), 0);

/** 같은 해 문서들을 합쳐 계산기 칸 값과 확인할 것을 만들어요. 기본내역(Y)과 상세내역(M·D)이 함께 있으면 상세를 써요(이중 합산 방지). */
export function toYearEndFill(docs: NtsDoc[]): YeImport {
  const fill: YeFill = {};
  const checks: YeCheck[] = [];
  const all = docs.flatMap((d) => d.forms);
  const detailed = new Set(all.filter((f) => /[MD]$/.test(f.formCd)).map((f) => base(f.formCd)));
  const forms = all.filter((f) => !(f.formCd.endsWith("Y") && detailed.has(base(f.formCd))));
  const names = new Set<string>();
  const famly = (what: string, amount: number, why: string) => { if (amount > 0) checks.push({ what, amount, why }); };
  // 실손의료보험금(B201)은 같은 사람 의료비에서 빼요.
  const reimb = new Map<string, number>();
  for (const f of forms) if (base(f.formCd) === "B201") for (const man of f.men) reimb.set(man.name + man.self, (reimb.get(man.name + man.self) ?? 0) + man.data.reduce((s, d) => s + d.sum, 0));

  for (const f of forms) {
    const fb = base(f.formCd);
    for (const man of f.men) {
      names.add(man.name + man.self);
      const tot = man.data.reduce((s, d) => s + d.sum, 0);
      const who = man.self ? "본인" : "가족";
      switch (fb) {
        case "A102":
          for (const d of man.data) add(fill, d.datCd === "G0002" ? "disabledInsurance" : "insurancePremium", d.sum);
          break;
        case "B101": {
          const net = Math.max(0, tot - (reimb.get(man.name + man.self) ?? 0));
          if (man.self) add(fill, "medicalSpecific", net);
          else { add(fill, "medical", net); famly("가족 의료비", net, "65세 이상·장애인·6세 이하 가족이면 한도 없는 칸(본인 등 의료비)으로 옮겨요. 일반 칸에 넣어 두었어요."); }
          break;
        }
        case "C102": case "C202": case "C401": case "C501":
          if (man.self) add(fill, "educationSelf", tot);
          else famly(`가족 교육비(${f.formCd})`, tot, "가족마다 학교 단계별 한도가 달라 칸에 넣지 않았어요. 계산기의 교육비 칸에 한도를 확인해 넣어요.");
          break;
        case "C301":
          famly(`교복 구입비(${who})`, tot, "중·고생 1명당 한도가 있어 칸에 넣지 않았어요.");
          break;
        case "E103": case "F103":
          for (const d of man.data) {
            const net = won(d.fields.ddct_bs_ass_amt) || d.sum;
            add(fill, fb === "E103" ? "pensionSavings" : "irp", net);
            add(fill, "isaTransfer", won(d.fields.isa_ddct_bs_ass_amt));
          }
          break;
        case "G113": case "G213": case "G313": case "G413":
          for (const d of man.data) {
            const p = (d.attrs.use_place_cd ?? "").trim();
            if (p === "8") { famly("현금영수증 주택임차료(월세)", d.sum, "월세 세액공제를 받으면 카드 공제와 겹치지 않게 빼요."); continue; }
            const k: keyof YeFill = p === "2" ? "market" : p === "3" ? "transit" : p === "4" ? "culture" : fb === "G113" ? "credit" : "debit";
            add(fill, k, d.sum);
          }
          if (!man.self && tot > 0) famly(`가족 카드 사용액(${f.formCd})`, tot, "연 소득 100만원 이하 기본공제 가족 것만 합칠 수 있어요(형제자매 제외). 이미 칸에 더했으니 해당 없으면 빼요.");
          break;
        case "J101": add(fill, "leaseRepaid", tot); break;
        case "J203": for (const d of man.data) add(fill, "mortgageInterest", won(d.sumAttrs.ddct) || d.sum); break;
        case "J301": add(fill, "subscriptionPaid", tot); break;
        case "J501": add(fill, "rent", tot); break;
        case "L102":
          for (const d of man.data) {
            const c = (d.attrs.donation_cd ?? "").trim();
            const k: keyof YeFill | null = c === "10" || c === "40" ? "donation" : c === "41" ? "religiousDonation" : c === "20" ? "politicalDonation" : c === "43" || c === "44" ? "hometownDonation" : null;
            if (k) add(fill, k, d.sum);
            else famly(`기부금(유형 ${c || "없음"})`, d.sum, "이 계산기에 칸이 없는 유형이에요.");
            if (c === "44") famly("고향사랑기부금(특별재난지역)", d.sum, "특별재난지역 특례 공제율은 이 계산기가 자동 판정하지 않아요. 일반 고향사랑 칸에 넣었어요.");
          }
          break;
        case "O101":
          for (const d of man.data) add(fill, "healthEmployment", sumOf(d, "hi_pmt", "ltrm_pmt") || d.sum);
          break;
        case "S101": add(fill, "healthEmployment", tot); break;
        case "P102":
          for (const d of man.data) add(fill, "nationalPension", sumOf(d, "pmt") || d.sum);
          break;
        case "B201": break;
        case "T101": for (const d of man.data) checks.push({ what: `소득기준 초과 부양가족: ${d.attrs.sup_name || "이름 없음"}`, why: "국세청 자료에 소득이 기준을 넘는 가족으로 나와요. 기본공제 인원에서 빼요." }); break;
        case "R101": case "R201": checks.push({ what: `장애인 증명 자료: ${man.self ? "본인" : man.name || "가족"}`, why: "장애인 추가공제 인원을 직접 확인해 넣어요." }); break;
        default:
          if (tot > 0) famly(`이 계산기에 없는 항목(${f.formCd})`, tot, "노란우산·투자조합·장기집합투자증권저축 같은 항목은 회사 연말정산에서 따로 확인해요.");
      }
    }
  }
  if (fill.mortgageInterest) checks.push({ what: "주택담보대출 이자 종류", why: "상환 기간·고정금리 여부로 한도가 달라요. 계산기에서 대출 종류를 골라요." });
  if (fill.rent) checks.push({ what: "월세 세액공제 대상 확인", amount: fill.rent, why: "무주택 세대주·총급여 기준·주택 요건을 직접 확인하고 계산기에서 '대상' 칸을 눌러요." });
  if ([...names].some((n) => n.endsWith("false"))) checks.push({ what: "부양가족 수", why: "가족 자료가 있어도 기본공제 인원은 자동으로 바꾸지 않아요. 직접 넣어요." });
  return { year: docs[0]?.year ?? "", fill, checks: checks.filter((c) => c.why), forms: [...new Set(forms.map((f) => f.formCd))], people: names.size };
}

/** 글자 안에서 yesone XML 덩어리를 찾아요(PDF에서 꺼낸 바이트를 글자로 바꾼 뒤 써요). */
export function findYesoneXml(text: string): string[] {
  const out: string[] = [];
  const re = /(?:<\?xml[^>]*\?>\s*)?<yesone[\s>][\s\S]*?<\/yesone>/g;
  for (const m of text.matchAll(re)) out.push(m[0]);
  return out;
}
