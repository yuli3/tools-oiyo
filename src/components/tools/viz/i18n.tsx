// 시각화 틀(ScenarioTool·ScenarioLite와 부품)의 화면 문구 6개 언어 (2026-11-17).
// 도구 문구(질문·결과 문장)는 도구가 직접 언어별로 넘기고, 여기는 틀의 공통 문구와 금액·단위 표기만 맡아요.
import { createContext, useContext } from "react";
import type { Locale } from "../../../lib/i18n";

export type VizLang = Locale;

export interface VizText {
  modeGroup: string;
  easy: string;
  easyHint: string;
  expert: string;
  expertHint: string;
  input: string;
  questions: string;
  question: (n: number, total: number) => string;
  prev: string;
  unknown: string;
  next: string;
  seeResult: string;
  stepperNote: string;
  hasExample: string;
  hasGuess: string;
  improve: string;
  askTitle: string;
  askNote: string;
  tryTitle: string;
  tryNote: string;
  tagExample: string;
  tagGuess: string;
  sweepLegend: string;
  sweepTitle: (name: string, result: string) => string;
  sweepMarks: string;
  sweepPlain: string;
  tornadoTitle: string;
  tornadoCaption: (pct: number) => string;
  tornadoHead: (pct: number) => [string, string, string, string];
  lower: string;
  higher: string;
  table: string;
  caseHead: [string, string];
  now: string;
  diff: string;
  bridgeHead: [string, string, string];
  howCalc: string;
  nextCheck: string;
}

const pctWord = (p: number) => `${p}%`;

export const VIZ_TEXT: Record<VizLang, VizText> = {
  ko: {
    modeGroup: "화면 모드", easy: "쉬운 설명", easyHint: "질문에 답하면 돼요", expert: "전문가", expertHint: "숫자·근거 직접 입력", input: "입력", questions: "질문",
    question: (n, t) => `질문 ${n} / ${t}`, prev: "이전", unknown: "잘 모르겠어요", next: "다음", seeResult: "결과 보기",
    stepperNote: '답할 때마다 아래 결과가 바로 바뀌어요. "잘 모르겠어요"는 예시 값을 그대로 두고 "가정"으로 표시해요.',
    hasExample: "아직 예시 값이 들어 있어요. ", hasGuess: "모른다고 답한 항목은 가정으로 계산했어요. ", improve: "아는 값으로 바꾸면 더 정확해져요.",
    askTitle: "세무사에게 확인할 것", askNote: "이 결과는 추정이에요. 실제 신고 금액은 세무사와 확인하세요.",
    tryTitle: "가정을 바꿔 보세요", tryNote: "슬라이더를 움직이면 위 결과와 아래 그래프가 같이 바뀌어요.", tagExample: "예시", tagGuess: "가정",
    sweepLegend: "한 가지 가정을 끝까지 바꿔 보기", sweepTitle: (n, r) => `${n}에 따라 ${r}이 이렇게 바뀌어요`,
    sweepMarks: "점선은 법이나 기준이 바뀌는 지점이에요. 그래프를 누르거나 끌어도 값이 바뀌어요.", sweepPlain: "그래프를 누르거나 끌어도 값이 바뀌어요.",
    tornadoTitle: "무엇이 결과를 가장 크게 흔드나요?", tornadoCaption: (p) => `각 가정을 ${p}% 낮추거나 높였을 때 결과가 움직이는 범위예요. 위에 있을수록 중요해요. 세로선은 지금 결과예요.`,
    tornadoHead: (p) => ["가정", `−${p}%일 때`, `+${p}%일 때`, "폭"], lower: "가정을 낮췄을 때", higher: "가정을 높였을 때",
    table: "표로 보기", caseHead: ["경우", "금액"], now: " (지금)", diff: "차이", bridgeHead: ["단계", "금액", "누계"], howCalc: "어떻게 계산했나요?", nextCheck: "다음에 확인할 것",
  },
  en: {
    modeGroup: "View mode", easy: "Simple", easyHint: "Answer a few questions", expert: "Expert", expertHint: "Enter numbers directly", input: "Inputs", questions: "Questions",
    question: (n, t) => `Question ${n} of ${t}`, prev: "Back", unknown: "Not sure", next: "Next", seeResult: "See result",
    stepperNote: 'The result below updates as you answer. "Not sure" keeps the example value and marks it as an assumption.',
    hasExample: "Some example values are still in use. ", hasGuess: "Items you weren't sure about are assumptions. ", improve: "Replace them with your own numbers for a better estimate.",
    askTitle: "Check with a professional", askNote: "This is an estimate. Confirm final figures with a qualified professional.",
    tryTitle: "Try different assumptions", tryNote: "Move a slider and the result and charts update together.", tagExample: "example", tagGuess: "assumed",
    sweepLegend: "Sweep one assumption end to end", sweepTitle: (n, r) => `How ${r} changes with ${n}`,
    sweepMarks: "Dashed lines mark thresholds where the rules change. Tap or drag the chart to set a value.", sweepPlain: "Tap or drag the chart to set a value.",
    tornadoTitle: "What moves the result most?", tornadoCaption: (p) => `Range of the result when each assumption is ${pctWord(p)} lower or higher. Higher rows matter more. The vertical line is the current result.`,
    tornadoHead: (p) => ["Assumption", `At −${p}%`, `At +${p}%`, "Range"], lower: "Assumption lower", higher: "Assumption higher",
    table: "Show as table", caseHead: ["Case", "Amount"], now: " (now)", diff: "Difference", bridgeHead: ["Step", "Amount", "Running total"], howCalc: "How was this calculated?", nextCheck: "Check next",
  },
  ja: {
    modeGroup: "表示モード", easy: "かんたん", easyHint: "質問に答えるだけ", expert: "専門家", expertHint: "数値を直接入力", input: "入力", questions: "質問",
    question: (n, t) => `質問 ${n} / ${t}`, prev: "戻る", unknown: "わからない", next: "次へ", seeResult: "結果を見る",
    stepperNote: "答えるたびに下の結果がすぐ変わります。「わからない」は例の値のまま「仮定」として表示します。",
    hasExample: "まだ例の値が入っています。", hasGuess: "わからない項目は仮定で計算しました。", improve: "実際の値に変えるとより正確になります。",
    askTitle: "専門家に確認すること", askNote: "この結果は概算です。実際の金額は専門家に確認してください。",
    tryTitle: "仮定を変えてみる", tryNote: "スライダーを動かすと結果とグラフが一緒に変わります。", tagExample: "例", tagGuess: "仮定",
    sweepLegend: "ひとつの仮定を端から端まで動かす", sweepTitle: (n, r) => `${n}による${r}の変化`,
    sweepMarks: "点線は制度や基準が変わる境目です。グラフをタップ・ドラッグしても値が変わります。", sweepPlain: "グラフをタップ・ドラッグしても値が変わります。",
    tornadoTitle: "結果を最も大きく動かすのは？", tornadoCaption: (p) => `各仮定を${p}%下げた・上げたときの結果の幅です。上ほど重要です。縦線は現在の結果です。`,
    tornadoHead: (p) => ["仮定", `−${p}%`, `+${p}%`, "幅"], lower: "仮定を下げたとき", higher: "仮定を上げたとき",
    table: "表で見る", caseHead: ["ケース", "金額"], now: "（現在）", diff: "差", bridgeHead: ["段階", "金額", "累計"], howCalc: "計算のしかた", nextCheck: "次に確認すること",
  },
  zh: {
    modeGroup: "显示模式", easy: "简单", easyHint: "回答几个问题即可", expert: "专业", expertHint: "直接输入数值", input: "输入", questions: "问题",
    question: (n, t) => `问题 ${n} / ${t}`, prev: "上一步", unknown: "不确定", next: "下一步", seeResult: "查看结果",
    stepperNote: "每回答一题，下方结果会立即更新。“不确定”会保留示例值并标记为假设。",
    hasExample: "仍有示例值。", hasGuess: "不确定的项目按假设计算。", improve: "换成实际数值会更准确。",
    askTitle: "请向专业人士确认", askNote: "此结果为估算。实际金额请向专业人士确认。",
    tryTitle: "试着改变假设", tryNote: "拖动滑块，结果和图表会一起变化。", tagExample: "示例", tagGuess: "假设",
    sweepLegend: "把一个假设从头调到尾", sweepTitle: (n, r) => `${r}随${n}的变化`,
    sweepMarks: "虚线是规则或标准改变的位置。点击或拖动图表也可改变数值。", sweepPlain: "点击或拖动图表也可改变数值。",
    tornadoTitle: "什么对结果影响最大？", tornadoCaption: (p) => `每个假设降低或提高${p}%时结果的变动范围。越靠上越重要。竖线为当前结果。`,
    tornadoHead: (p) => ["假设", `−${p}%`, `+${p}%`, "幅度"], lower: "假设降低时", higher: "假设提高时",
    table: "以表格查看", caseHead: ["情形", "金额"], now: "（当前）", diff: "差额", bridgeHead: ["步骤", "金额", "累计"], howCalc: "如何计算？", nextCheck: "接下来查看",
  },
  fr: {
    modeGroup: "Mode d'affichage", easy: "Simple", easyHint: "Répondez à quelques questions", expert: "Expert", expertHint: "Saisissez les chiffres", input: "Saisie", questions: "Questions",
    question: (n, t) => `Question ${n} sur ${t}`, prev: "Retour", unknown: "Je ne sais pas", next: "Suivant", seeResult: "Voir le résultat",
    stepperNote: "Le résultat se met à jour à chaque réponse. « Je ne sais pas » garde la valeur d'exemple et la marque comme hypothèse.",
    hasExample: "Des valeurs d'exemple sont encore utilisées. ", hasGuess: "Les éléments incertains sont des hypothèses. ", improve: "Remplacez-les par vos chiffres pour plus de précision.",
    askTitle: "À vérifier avec un professionnel", askNote: "Ceci est une estimation. Faites confirmer les montants définitifs par un professionnel.",
    tryTitle: "Changez les hypothèses", tryNote: "Déplacez un curseur : le résultat et les graphiques changent ensemble.", tagExample: "exemple", tagGuess: "hypothèse",
    sweepLegend: "Faire varier une hypothèse", sweepTitle: (n, r) => `${r} selon ${n}`,
    sweepMarks: "Les pointillés marquent les seuils où les règles changent. Touchez ou glissez sur le graphique.", sweepPlain: "Touchez ou glissez sur le graphique pour changer la valeur.",
    tornadoTitle: "Qu'est-ce qui pèse le plus ?", tornadoCaption: (p) => `Variation du résultat quand chaque hypothèse baisse ou monte de ${p} %. Les lignes du haut comptent le plus. La ligne verticale est le résultat actuel.`,
    tornadoHead: (p) => ["Hypothèse", `À −${p} %`, `À +${p} %`, "Écart"], lower: "Hypothèse plus basse", higher: "Hypothèse plus haute",
    table: "Voir en tableau", caseHead: ["Cas", "Montant"], now: " (actuel)", diff: "Écart", bridgeHead: ["Étape", "Montant", "Cumul"], howCalc: "Comment est-ce calculé ?", nextCheck: "À vérifier ensuite",
  },
  es: {
    modeGroup: "Modo de vista", easy: "Sencillo", easyHint: "Responde unas preguntas", expert: "Experto", expertHint: "Introduce los números", input: "Datos", questions: "Preguntas",
    question: (n, t) => `Pregunta ${n} de ${t}`, prev: "Atrás", unknown: "No lo sé", next: "Siguiente", seeResult: "Ver resultado",
    stepperNote: "El resultado se actualiza con cada respuesta. «No lo sé» mantiene el valor de ejemplo y lo marca como supuesto.",
    hasExample: "Aún hay valores de ejemplo. ", hasGuess: "Lo que no sabías se calculó como supuesto. ", improve: "Cámbialos por tus datos para mayor precisión.",
    askTitle: "Consultar con un profesional", askNote: "Es una estimación. Confirma las cifras finales con un profesional.",
    tryTitle: "Prueba otros supuestos", tryNote: "Mueve un control y el resultado y los gráficos cambian a la vez.", tagExample: "ejemplo", tagGuess: "supuesto",
    sweepLegend: "Recorrer un supuesto de punta a punta", sweepTitle: (n, r) => `${r} según ${n}`,
    sweepMarks: "Las líneas discontinuas marcan umbrales donde cambian las reglas. Toca o arrastra el gráfico.", sweepPlain: "Toca o arrastra el gráfico para cambiar el valor.",
    tornadoTitle: "¿Qué mueve más el resultado?", tornadoCaption: (p) => `Rango del resultado si cada supuesto baja o sube un ${p} %. Arriba, lo que más importa. La línea vertical es el resultado actual.`,
    tornadoHead: (p) => ["Supuesto", `Con −${p} %`, `Con +${p} %`, "Rango"], lower: "Supuesto más bajo", higher: "Supuesto más alto",
    table: "Ver como tabla", caseHead: ["Caso", "Importe"], now: " (actual)", diff: "Diferencia", bridgeHead: ["Paso", "Importe", "Acumulado"], howCalc: "¿Cómo se calculó?", nextCheck: "Revisa después",
  },
};

export interface VizCtx {
  lang: VizLang;
  /** 금액(unit "won") 표기 통화. 한국어는 KRW(억·만 표기), 그 밖에는 Intl 통화 표기 */
  currency: string;
  /** 2026-11-21: 틀 문구 덮어쓰기(예: 대만 zh-Hant). 없으면 lang 기본 문구 */
  text?: Partial<VizText>;
}

const Ctx = createContext<VizCtx>({ lang: "ko", currency: "KRW" });
export const VizLangProvider = Ctx.Provider;
export const useVizCtx = () => useContext(Ctx);
export const useVizText = (): VizText => {
  const c = useContext(Ctx);
  return c.text ? { ...VIZ_TEXT[c.lang], ...c.text } : VIZ_TEXT[c.lang];
};

const INTL: Record<VizLang, string> = { ko: "ko-KR", en: "en-US", ja: "ja-JP", zh: "zh-CN", fr: "fr-FR", es: "es-ES" };
export const intlOf = (lang: VizLang) => INTL[lang];

/** 통화 금액. easy면 짧게(1.2M, 120万), 아니면 끝자리까지 */
export function money(n: number, lang: VizLang, currency: string, easy = false): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(INTL[lang], {
    style: "currency",
    currency,
    maximumFractionDigits: easy || Math.abs(n) >= 1000 || currency === "JPY" || currency === "KRW" ? 0 : 2,
    ...(easy && Math.abs(n) >= 10000 ? { notation: "compact" as const, maximumFractionDigits: 1, minimumFractionDigits: 0 } : {}),
  }).format(n);
}
