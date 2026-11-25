// 쉬운 말(Easy Read) 보기 (2026-11-25, AI 빌더 조사 추천 2번, CHOSEUN "좋아요 진행").
// DeepMind·Mencap Easy Read처럼 정해진 규칙으로 결과를 다시 써요. 모델 없이 코드만 써서 같은 입력이면 늘 같은 결과예요.
// 규칙: ① 한 줄에 한 뜻(문장마다 나눔) ② 괄호 속 조문 번호는 빼고 맨 아래 "근거"로 모음 ③ 어려운 말은 처음 나올 때 한 줄로 풀이
// ④ 날짜는 "2026년 12월 1일"처럼 ⑤ 급한 것(주의·기한) 먼저 ⑥ 처음에는 7줄까지만, 나머지는 "더 보기".
// 뜻을 새로 만들지 않아요. 원래 문장을 나누고 빼기만 하고, 풀이는 아래 사전에 있는 말만 붙여요.

export type EasyKind = "warn" | "date" | "money" | "todo" | "doc" | "call";
export type EasyItem = { kind: EasyKind; text: string };
export type EasyLine = { kind: EasyKind | "word"; text: string };
export type EasyResult = { lines: EasyLine[]; more: EasyLine[]; cites: string[] };

export const EASY_ICON: Record<EasyLine["kind"], string> = { warn: "⚠️", date: "📅", money: "💰", todo: "👉", doc: "📄", call: "📞", word: "💡" };
const ORDER: EasyKind[] = ["warn", "date", "money", "todo", "doc", "call"];

// 어려운 말 풀이 (한 줄, 해요체). 법령 길잡이·복지·상담 준비서에 자주 나오는 말만 넣어요.
export const EASY_WORDS: Record<string, string> = {
  소멸시효: "정해진 기간이 지나면 돈을 달라고 할 수 없게 되는 제도예요.",
  경정청구: "세금을 더 냈을 때 돌려 달라고 하는 신청이에요.",
  대항력: "집주인이 바뀌어도 계속 살 수 있는 힘이에요.",
  우선변제권: "집이 경매로 팔릴 때 보증금을 먼저 받을 수 있는 권리예요.",
  임차권등기명령: "이사 가도 세입자 권리가 남도록 법원에 올려 두는 절차예요.",
  확정일자: "계약서에 날짜 도장을 받아 두는 거예요. 보증금 순서를 정해요.",
  한정승인: "물려받는 재산만큼만 빚을 갚겠다고 법원에 알리는 거예요.",
  상속포기: "재산도 빚도 물려받지 않겠다고 법원에 알리는 거예요.",
  단순승인: "재산과 빚을 모두 물려받는 거예요.",
  지급명령: "법원이 '돈을 갚으라'고 보내는 간단한 명령이에요.",
  가압류: "재판 전에 상대 재산을 못 팔게 묶어 두는 거예요.",
  내용증명: "어떤 내용을 언제 보냈는지 우체국이 증명해 주는 편지예요.",
  구제신청: "부당하게 해고됐을 때 노동위원회에 바로잡아 달라고 하는 신청이에요.",
  체불: "줘야 할 돈을 주지 않은 거예요.",
  대지급금: "회사가 못 준 월급 일부를 나라가 먼저 주는 돈이에요.",
  원천징수: "돈을 줄 때 세금을 미리 떼고 주는 거예요.",
  세액공제: "낼 세금에서 바로 빼 주는 금액이에요.",
  소득공제: "세금을 매기는 소득에서 빼 주는 금액이에요.",
  피부양자: "가족 건강보험에 함께 올라가 보험료를 따로 안 내는 사람이에요.",
  중위소득: "모든 가구를 소득 순서로 세웠을 때 가운데 가구의 소득이에요.",
  수급자: "기초생활보장 지원을 받는 사람이에요.",
  차상위: "수급자는 아니지만 소득이 낮아 지원을 받을 수 있는 계층이에요.",
  가산세: "기한을 넘기거나 틀리게 신고하면 더 내는 세금이에요.",
  과태료: "법에서 정한 의무를 지키지 않으면 내는 돈이에요. 범죄 기록은 남지 않아요.",
  이의신청: "결정이 잘못됐다고 다시 봐 달라고 하는 신청이에요.",
  검인: "유언장이 있는 그대로라는 것을 법원이 확인하는 절차예요.",
  유류분: "가족이 법으로 꼭 받을 수 있게 남겨 둔 몫이에요.",
  갱신: "기간이 끝나는 계약이나 자격을 다시 이어 가는 거예요.",
  권리금: "가게 자리·단골 값으로 다음 세입자에게 받는 돈이에요.",
};

const CITE_RE = /\s*\(([^()]*(?:제\s?\d+조|법\s?§|art\.|Art\.)[^()]*)\)/g;
const ISO_RE = /(\d{4})-(\d{2})-(\d{2})/g;

export const koDate = (s: string) => s.replace(ISO_RE, (_m, y, m, d) => `${Number(y)}년 ${Number(m)}월 ${Number(d)}일`);

/** 문장 단위로 나눠요. 마침표·물음표·느낌표 뒤 공백 기준이고, 숫자 사이 마침표(1.5)는 나누지 않아요. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?。])\s+(?=[^\d\s])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toEasyRead(items: EasyItem[], opts: { max?: number; words?: boolean; locale?: string; keepOrder?: boolean } = {}): EasyResult {
  const max = opts.max ?? 7;
  const ko = (opts.locale ?? "ko") === "ko";
  const cites: string[] = [];
  const seenWord = new Set<string>();
  const seenLine = new Set<string>();
  const out: EasyLine[] = [];
  const sorted = opts.keepOrder ? items : [...items].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  for (const it of sorted) {
    const stripped = it.text.replace(CITE_RE, (_m, c: string) => {
      // "주택임대차보호법 제6조, 제6조의2"처럼 법 이름이 빠진 조각은 앞 조각의 법 이름을 붙여요.
      let law = "";
      for (const raw of c.split(/[,;·]\s*/)) {
        let part = raw.trim();
        if (!part) continue;
        const m = part.match(/^(.*?)\s*제\s?\d+조/);
        if (m && m[1]) law = m[1];
        else if (m && law) part = `${law} ${part}`;
        if (!cites.includes(part)) cites.push(part);
      }
      return "";
    });
    for (const s0 of splitSentences(stripped)) {
      const s = ko ? koDate(s0) : s0;
      if (seenLine.has(s)) continue;
      seenLine.add(s);
      out.push({ kind: it.kind, text: s });
      if (ko && opts.words !== false) {
        for (const w of Object.keys(EASY_WORDS)) {
          if (!seenWord.has(w) && s.includes(w)) {
            seenWord.add(w);
            out.push({ kind: "word", text: `${w}: ${EASY_WORDS[w]}` });
          }
        }
      }
    }
  }
  // "더 보기" 경계는 풀이 줄이 원래 문장과 떨어지지 않게 잡아요.
  let cut = 0, shown = 0;
  while (cut < out.length && (shown < max || out[cut].kind === "word")) {
    if (out[cut].kind !== "word") shown++;
    cut++;
  }
  return { lines: out.slice(0, cut), more: out.slice(cut), cites };
}

export const EASY_LABEL: Record<string, { open: string; close: string; more: string; cites: string; title: string }> = {
  ko: { open: "쉬운 말로 보기", close: "원래대로 보기", more: "더 보기", cites: "근거", title: "쉬운 말로 다시 썼어요" },
  en: { open: "Easy Read", close: "Back to normal view", more: "Show more", cites: "Sources", title: "In plain words" },
  ja: { open: "やさしい言葉で見る", close: "元に戻す", more: "もっと見る", cites: "根拠", title: "やさしい言葉で書き直しました" },
  cn: { open: "用简单的话看", close: "恢复原样", more: "查看更多", cites: "依据", title: "用简单的话重新写了" },
  fr: { open: "Facile à lire", close: "Revenir à l’affichage normal", more: "Voir plus", cites: "Sources", title: "En mots simples" },
  es: { open: "Lectura fácil", close: "Volver a la vista normal", more: "Ver más", cites: "Fuentes", title: "En palabras sencillas" },
};
