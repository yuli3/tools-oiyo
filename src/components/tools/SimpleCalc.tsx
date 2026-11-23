'use client';
/**
 * 간단계산기 (2026-11-22, 3차 2026-11-24). 어르신·저시력·시각장애인용 큰 글씨 계산기 15종.
 * 규칙: 입력 2~3개, 결과는 크게 한 문장(aria-live), "소리로 듣기", 버튼 최소 56px, 키보드 완전 지원.
 * 수수료율·송금 단위 같은 설정은 나라별 기본값으로 숨기고, 자세한 계산기는 페이지 아래 링크로 보내요.
 */
import { useEffect, useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import type { SimpleTool } from '../../data/simple-calculators';
import { SIMPLE_UI } from '../../data/simple-calculators';
import { splitBill, cardInstallment, type InstallmentMethod } from '../../lib/bill-split';
import { pressKey, initialCalc, koreanUnits, parseAmount, discount, daysBetween, todayIso, ageOn, zodiacIndex, addTime, depositInterest, convertArea, comparePrice, percentChange, pillsLeft, bmiValue, FT_IN_TO_CM, LB_TO_KG, convertTemp, type CalcState } from '../../lib/simple-calc';
import { BMI_BANDS } from '../../lib/health-scenarios';
import { BMI_BANDS_L, NORMAL_TOP } from '../../lib/health-i18n';
import { convertViaKrw, validateFeed } from '../../lib/fx-feed.mjs';

const INTL: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', fr: 'fr-FR', es: 'es-ES' };
const HOME: Record<Locale, string> = { ko: 'KRW', en: 'USD', ja: 'JPY', zh: 'CNY', fr: 'EUR', es: 'EUR' };
const DP: Record<string, number> = { KRW: 0, JPY: 0, VND: 0, TWD: 0 };
const dpOf = (c: string) => DP[c] ?? 2;
const FOREIGN = ['USD', 'EUR', 'JPY', 'CNY', 'GBP', 'KRW', 'THB', 'VND', 'TWD'];
const SPLIT_UNIT: Record<string, number> = { KRW: 10, JPY: 1 };
const INSTALL: Record<Locale, { method: InstallmentMethod; rate: number }> = {
  ko: { method: 'declining', rate: 16 }, ja: { method: 'annuity', rate: 15 }, zh: { method: 'flat', rate: 0.6 },
  en: { method: 'annuity', rate: 22 }, fr: { method: 'annuity', rate: 15 }, es: { method: 'annuity', rate: 20 },
};
/** 쉼표가 천 단위 구분인 언어. fr·es는 쉼표를 소수점으로 받아요. */
const COMMA_GROUP: Record<Locale, boolean> = { ko: true, en: true, ja: true, zh: true, fr: false, es: false };

interface W {
  amountLabel: string; people: string; peopleUnit: (n: number) => string; fewer: string; more: string;
  splitEach: (each: string) => string; splitPayer: (pay: string, extra: string) => string; splitEven: string;
  fxFrom: string; fxSays: (from: string, to: string) => string; fxRate: (one: string, date: string) => string; fxLoading: string; fxFail: string; swap: (a: string, b: string) => string;
  price: string; rate: string; pay: (v: string) => string; save: (v: string) => string;
  date: string; daysLeft: (d: string, n: number) => string; today: string; daysAgo: (d: string, n: number) => string; pick: string;
  months: string; monthsUnit: (n: number) => string; perMonth: (v: string) => string; instDetail: (first: string, fee: string, rate: string) => string; free: string; freeLine: string;
  enter: string; ops: Record<string, string>; display: string; keypad: string; keys: Record<string, string>; currency: Record<string, string>;
}
const W_: Record<Locale, W> = {
  ko: {
    amountLabel: '모두 낸 돈', people: '사람 수', peopleUnit: (n) => `${n}명`, fewer: '한 명 줄이기', more: '한 명 늘리기',
    splitEach: (e) => `한 사람당 ${e}씩 보내면 돼요.`, splitPayer: (p, x) => `결제한 분은 남는 ${x}을 더해 ${p}을 내요.`, splitEven: '모두 똑같이 나눠떨어져요.',
    fxFrom: '바꿀 돈', fxSays: (f, t) => `${josa(f, '은', '는')} 약 ${josa(t, '이에요', '예요')}.`, fxRate: (o, d) => `${o} (${d} 기준, 은행 수수료 제외)`, fxLoading: '환율을 불러오고 있어요…', fxFail: '환율을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.', swap: (a, b) => `거꾸로 계산: ${a} → ${b}`,
    price: '원래 가격', rate: '할인율', pay: (v) => `내실 돈은 ${v}이에요.`, save: (v) => `${v} 아껴요.`,
    date: '날짜', daysLeft: (d, n) => `${d}까지 ${n}일 남았어요.`, today: '바로 오늘이에요.', daysAgo: (d, n) => `${d}은 ${n}일 지났어요.`, pick: '날짜를 고르면 남은 날을 알려 드려요.',
    months: '할부 개월', monthsUnit: (n) => `${n}개월`, perMonth: (v) => `한 달에 약 ${v}씩 나가요.`, instDetail: (f, fee, r) => `첫 달 ${f}, 수수료는 모두 ${fee}이에요. (연 ${r}% 가정, 카드사마다 달라요)`, free: '무이자 할부예요', freeLine: '무이자라 수수료가 없어요.',
    enter: '숫자를 넣으면 답이 여기에 나와요.', ops: { '+': '더하기', '-': '빼기', '×': '곱하기', '÷': '나누기', '=': '는' }, display: '계산 결과', keypad: '계산기 버튼',
    keys: { C: '모두 지우기', '⌫': '한 글자 지우기', '%': '퍼센트', '÷': '나누기', '×': '곱하기', '-': '빼기', '+': '더하기', '=': '계산하기', '.': '소수점', '00': '영영' },
    currency: { USD: '미국 달러', EUR: '유로', JPY: '일본 엔', CNY: '중국 위안', GBP: '영국 파운드', KRW: '한국 원', THB: '태국 바트', VND: '베트남 동', TWD: '대만 달러' },
  },
  en: {
    amountLabel: 'Bill total', people: 'People', peopleUnit: (n) => `${n} people`, fewer: 'One fewer person', more: 'One more person',
    splitEach: (e) => `Each person sends ${e}.`, splitPayer: (p, x) => `The person who paid covers the extra ${x} and pays ${p}.`, splitEven: 'It divides evenly.',
    fxFrom: 'Amount to convert', fxSays: (f, t) => `${f} is about ${t}.`, fxRate: (o, d) => `${o} (as of ${d}, before bank fees)`, fxLoading: 'Loading exchange rates…', fxFail: 'Could not load exchange rates. Please try again later.', swap: (a, b) => `Reverse: ${a} → ${b}`,
    price: 'Original price', rate: 'Discount', pay: (v) => `You pay ${v}.`, save: (v) => `You save ${v}.`,
    date: 'Date', daysLeft: (d, n) => `${n} days left until ${d}.`, today: 'That is today.', daysAgo: (d, n) => `${d} was ${n} days ago.`, pick: 'Pick a date to see how many days are left.',
    months: 'Months', monthsUnit: (n) => `${n} months`, perMonth: (v) => `About ${v} a month.`, instDetail: (f, fee, r) => `First payment ${f}; total interest ${fee}. (Assumes ${r}% APR; your card may differ.)`, free: 'It is 0% interest', freeLine: 'No interest to pay.',
    enter: 'Enter numbers and the answer appears here.', ops: { '+': 'plus', '-': 'minus', '×': 'times', '÷': 'divided by', '=': 'equals' }, display: 'Result', keypad: 'Calculator keys',
    keys: { C: 'Clear all', '⌫': 'Delete one digit', '%': 'Percent', '÷': 'Divide', '×': 'Multiply', '-': 'Minus', '+': 'Plus', '=': 'Equals', '.': 'Decimal point', '00': 'Double zero' },
    currency: { USD: 'US dollar', EUR: 'Euro', JPY: 'Japanese yen', CNY: 'Chinese yuan', GBP: 'British pound', KRW: 'Korean won', THB: 'Thai baht', VND: 'Vietnamese dong', TWD: 'Taiwan dollar' },
  },
  ja: {
    amountLabel: '支払った合計', people: '人数', peopleUnit: (n) => `${n}人`, fewer: '1人減らす', more: '1人増やす',
    splitEach: (e) => `1人${e}ずつ送ればよいです。`, splitPayer: (p, x) => `支払った人は端数${x}を足して${p}を負担します。`, splitEven: 'ちょうど割り切れます。',
    fxFrom: '換算する金額', fxSays: (f, t) => `${f}は約${t}です。`, fxRate: (o, d) => `${o}（${d}時点・銀行手数料を除く）`, fxLoading: '為替レートを読み込んでいます…', fxFail: '為替レートを読み込めませんでした。しばらくしてからもう一度開いてください。', swap: (a, b) => `逆に計算：${a} → ${b}`,
    price: '元の値段', rate: '割引率', pay: (v) => `支払う金額は${v}です。`, save: (v) => `${v}お得です。`,
    date: '日付', daysLeft: (d, n) => `${d}まであと${n}日です。`, today: 'ちょうど今日です。', daysAgo: (d, n) => `${d}から${n}日たちました。`, pick: '日付を選ぶと、あと何日かをお知らせします。',
    months: '支払回数', monthsUnit: (n) => `${n}回`, perMonth: (v) => `毎月約${v}です。`, instDetail: (f, fee, r) => `初回${f}、手数料の合計は${fee}です。（実質年率${r}%と仮定、カード会社で異なります）`, free: '手数料なし（0%）', freeLine: '手数料はかかりません。',
    enter: '数字を入れると、ここに答えが出ます。', ops: { '+': 'たす', '-': 'ひく', '×': 'かける', '÷': 'わる', '=': 'は' }, display: '計算結果', keypad: '電卓のボタン',
    keys: { C: '全部消す', '⌫': '1文字消す', '%': 'パーセント', '÷': 'わる', '×': 'かける', '-': 'ひく', '+': 'たす', '=': '計算する', '.': '小数点', '00': 'ゼロゼロ' },
    currency: { USD: '米ドル', EUR: 'ユーロ', JPY: '日本円', CNY: '人民元', GBP: '英ポンド', KRW: '韓国ウォン', THB: 'タイバーツ', VND: 'ベトナムドン', TWD: '台湾ドル' },
  },
  zh: {
    amountLabel: '总金额', people: '人数', peopleUnit: (n) => `${n}人`, fewer: '减少一人', more: '增加一人',
    splitEach: (e) => `每人转 ${e} 即可。`, splitPayer: (p, x) => `付款人多承担零头 ${x}，共 ${p}。`, splitEven: '正好平均分完。',
    fxFrom: '要换算的金额', fxSays: (f, t) => `${f} 约等于 ${t}。`, fxRate: (o, d) => `${o}（${d}，不含银行手续费）`, fxLoading: '正在加载汇率…', fxFail: '汇率加载失败，请稍后再试。', swap: (a, b) => `反向换算：${a} → ${b}`,
    price: '原价', rate: '折扣', pay: (v) => `应付 ${v}。`, save: (v) => `省下 ${v}。`,
    date: '日期', daysLeft: (d, n) => `离${d}还有 ${n} 天。`, today: '就是今天。', daysAgo: (d, n) => `${d}已经过去 ${n} 天。`, pick: '选择日期后显示还有几天。',
    months: '分期期数', monthsUnit: (n) => `${n}期`, perMonth: (v) => `每月约还 ${v}。`, instDetail: (f, fee, r) => `首期 ${f}，手续费合计 ${fee}。（按每期费率 ${r}% 估算，各银行不同）`, free: '免息分期', freeLine: '免息，没有手续费。',
    enter: '输入数字后，答案显示在这里。', ops: { '+': '加', '-': '减', '×': '乘', '÷': '除以', '=': '等于' }, display: '计算结果', keypad: '计算器按键',
    keys: { C: '全部清除', '⌫': '删除一位', '%': '百分号', '÷': '除', '×': '乘', '-': '减', '+': '加', '=': '等于', '.': '小数点', '00': '双零' },
    currency: { USD: '美元', EUR: '欧元', JPY: '日元', CNY: '人民币', GBP: '英镑', KRW: '韩元', THB: '泰铢', VND: '越南盾', TWD: '新台币' },
  },
  fr: {
    amountLabel: 'Montant total', people: 'Personnes', peopleUnit: (n) => `${n} personnes`, fewer: 'Une personne de moins', more: 'Une personne de plus',
    splitEach: (e) => `Chacun envoie ${e}.`, splitPayer: (p, x) => `Celui qui a payé ajoute les ${x} restants et paie ${p}.`, splitEven: 'Le partage tombe juste.',
    fxFrom: 'Montant à convertir', fxSays: (f, t) => `${f} valent environ ${t}.`, fxRate: (o, d) => `${o} (au ${d}, hors frais bancaires)`, fxLoading: 'Chargement des taux…', fxFail: 'Impossible de charger les taux. Réessayez plus tard.', swap: (a, b) => `Dans l’autre sens : ${a} → ${b}`,
    price: 'Prix de départ', rate: 'Remise', pay: (v) => `Vous payez ${v}.`, save: (v) => `Vous économisez ${v}.`,
    date: 'Date', daysLeft: (d, n) => `Il reste ${n} jours avant le ${d}.`, today: 'C’est aujourd’hui.', daysAgo: (d, n) => `Le ${d}, c’était il y a ${n} jours.`, pick: 'Choisissez une date pour voir les jours restants.',
    months: 'Nombre de mois', monthsUnit: (n) => `${n} mois`, perMonth: (v) => `Environ ${v} par mois.`, instDetail: (f, fee, r) => `Première mensualité ${f} ; frais au total ${fee}. (TAEG supposé ${r} %, selon votre carte)`, free: 'C’est sans frais', freeLine: 'Aucun frais à payer.',
    enter: 'Entrez des chiffres : la réponse s’affiche ici.', ops: { '+': 'plus', '-': 'moins', '×': 'fois', '÷': 'divisé par', '=': 'égale' }, display: 'Résultat', keypad: 'Touches de la calculatrice',
    keys: { C: 'Tout effacer', '⌫': 'Effacer un chiffre', '%': 'Pour cent', '÷': 'Diviser', '×': 'Multiplier', '-': 'Moins', '+': 'Plus', '=': 'Égal', '.': 'Virgule', '00': 'Double zéro' },
    currency: { USD: 'Dollar américain', EUR: 'Euro', JPY: 'Yen japonais', CNY: 'Yuan chinois', GBP: 'Livre sterling', KRW: 'Won coréen', THB: 'Baht thaï', VND: 'Dong vietnamien', TWD: 'Dollar de Taïwan' },
  },
  es: {
    amountLabel: 'Total de la cuenta', people: 'Personas', peopleUnit: (n) => `${n} personas`, fewer: 'Una persona menos', more: 'Una persona más',
    splitEach: (e) => `Cada uno envía ${e}.`, splitPayer: (p, x) => `Quien pagó pone los ${x} sobrantes y paga ${p}.`, splitEven: 'Sale exacto.',
    fxFrom: 'Cantidad a convertir', fxSays: (f, t) => `${f} son unos ${t}.`, fxRate: (o, d) => `${o} (a ${d}, sin comisiones bancarias)`, fxLoading: 'Cargando tipos de cambio…', fxFail: 'No se pudieron cargar los tipos de cambio. Inténtalo más tarde.', swap: (a, b) => `Al revés: ${a} → ${b}`,
    price: 'Precio original', rate: 'Descuento', pay: (v) => `Pagas ${v}.`, save: (v) => `Ahorras ${v}.`,
    date: 'Fecha', daysLeft: (d, n) => `Faltan ${n} días para el ${d}.`, today: 'Es hoy.', daysAgo: (d, n) => `El ${d} fue hace ${n} días.`, pick: 'Elige una fecha para ver cuántos días faltan.',
    months: 'Meses', monthsUnit: (n) => `${n} meses`, perMonth: (v) => `Unos ${v} al mes.`, instDetail: (f, fee, r) => `Primera cuota ${f}; intereses en total ${fee}. (Supone TAE del ${r} %, según tu tarjeta)`, free: 'Es sin intereses', freeLine: 'No pagas intereses.',
    enter: 'Escribe números y la respuesta aparece aquí.', ops: { '+': 'más', '-': 'menos', '×': 'por', '÷': 'entre', '=': 'igual a' }, display: 'Resultado', keypad: 'Teclas de la calculadora',
    keys: { C: 'Borrar todo', '⌫': 'Borrar un dígito', '%': 'Por ciento', '÷': 'Dividir', '×': 'Multiplicar', '-': 'Menos', '+': 'Más', '=': 'Igual', '.': 'Coma decimal', '00': 'Doble cero' },
    currency: { USD: 'Dólar estadounidense', EUR: 'Euro', JPY: 'Yen japonés', CNY: 'Yuan chino', GBP: 'Libra esterlina', KRW: 'Won coreano', THB: 'Baht tailandés', VND: 'Dong vietnamita', TWD: 'Dólar taiwanés' },
  },
};

// ── 공통 부품 ─────────────────────────────────────────────
const bigBtn = 'min-h-14 rounded-xl border-2 px-4 text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring';
const btnOn = 'border-primary bg-primary text-primary-foreground';
const btnOff = 'border-border bg-card text-foreground hover:border-primary';
const stepBtn = 'min-h-16 min-w-16 rounded-xl border-2 border-border bg-card text-4xl font-black text-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring';
const inputCls = 'min-h-16 w-full rounded-xl border-2 border-input bg-background px-4 text-3xl font-bold tabular-nums text-foreground focus:border-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-ring';
const labelCls = 'block text-xl font-bold text-foreground';

function useSpeech(lang: string) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  useEffect(() => { setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window); }, []);
  const speak = (text: string) => {
    if (!supported) return;
    const s = window.speechSynthesis;
    if (speaking) { s.cancel(); setSpeaking(false); return; }
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 0.9;
    u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    setSpeaking(true); s.speak(u);
  };
  return { speak, speaking, supported };
}

function Answer({ locale, main, sub, speech }: { locale: Locale; main: string; sub?: string; speech?: string }) {
  const ui = SIMPLE_UI[locale];
  const { speak, speaking, supported } = useSpeech(ui.speechLang);
  return (
    <section className="space-y-4 rounded-2xl border-2 border-primary bg-primary/5 p-5">
      <div aria-live="polite" aria-atomic="true">
        <p className="text-2xl font-black leading-snug text-foreground sm:text-3xl">{main}</p>
        {sub && <p className="mt-2 text-lg leading-relaxed text-foreground">{sub}</p>}
      </div>
      {supported ? (
        <button type="button" onClick={() => speak(speech ?? [main, sub].filter(Boolean).join(' '))} aria-pressed={speaking} className={`${bigBtn} ${btnOn} w-full`}>
          <span aria-hidden="true">{speaking ? '⏹ ' : '🔊 '}</span>{speaking ? ui.stop : ui.listen}
        </button>
      ) : <p className="text-base text-muted-foreground">{ui.noSpeech}</p>}
    </section>
  );
}

function AmountInput({ locale, id, label, value, onChange, suffix }: { locale: Locale; id: string; label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  const group = COMMA_GROUP[locale];
  const handle = (raw: string) => {
    let s = group ? raw.replace(/,/g, '') : raw.replace(/\s/g, '').replace(',', '.');
    s = s.replace(/[^\d.]/g, '');
    const i = s.indexOf('.');
    if (i >= 0) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '').slice(0, 2);
    s = s.replace(/^0+(?=\d)/, '').slice(0, 15);
    if (!group) { onChange(s); return; }
    const [int, dec] = s.split('.');
    const grouped = int ? Number(int).toLocaleString('en-US') : '';
    onChange(dec !== undefined ? `${grouped || '0'}.${dec}` : grouped);
  };
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelCls}>{label}{suffix ? <span className="ml-2 text-lg font-semibold text-muted-foreground">({suffix})</span> : null}</label>
      <input id={id} className={inputCls} type="text" inputMode="decimal" autoComplete="off" enterKeyHint="done" value={group ? value : value.replace('.', ',')} onChange={(e) => handle(e.target.value)} />
    </div>
  );
}

function Stepper({ id, label, value, min, max, onChange, show, fewer, more }: { id: string; label: string; value: number; min: number; max: number; onChange: (n: number) => void; show: (n: number) => string; fewer: string; more: string }) {
  return (
    <div className="space-y-2">
      <p id={id} className={labelCls}>{label}</p>
      <div className="flex items-stretch gap-3" role="group" aria-labelledby={id}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={fewer} className={`${stepBtn} disabled:opacity-40`}>−</button>
        <output aria-live="polite" className="flex min-h-16 flex-1 items-center justify-center rounded-xl border-2 border-input bg-background text-3xl font-black tabular-nums text-foreground">{show(value)}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={more} className={`${stepBtn} disabled:opacity-40`}>+</button>
      </div>
    </div>
  );
}

function Chips<T extends string | number>({ label, options, value, onChange, show }: { label: string; options: T[]; value: T; onChange: (v: T) => void; show: (v: T) => string }) {
  return (
    <fieldset className="space-y-2">
      <legend className={labelCls}>{label}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((o) => <button key={String(o)} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={`${bigBtn} ${value === o ? btnOn : btnOff}`}>{show(o)}</button>)}
      </div>
    </fieldset>
  );
}

/** 한국어 받침에 맞춰 은/는을 붙여요. */
function josa(word: string, withBatchim: string, without: string) {
  const ch = word.trim().slice(-1);
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return word + without;
  return word + (code % 28 ? withBatchim : without);
}
const KO_UNIT: Record<string, string> = { USD: '달러', EUR: '유로', JPY: '엔', CNY: '위안', GBP: '파운드', THB: '바트', VND: '동', TWD: '대만달러', KRW: '원' };
const KO_SUFFIX: Record<string, string> = { KRW: '원' };

function useMoney(locale: Locale) {
  return (v: number, cur: string) => {
    const dp = dpOf(cur);
    if (locale === 'ko' && cur !== 'KRW' && KO_UNIT[cur]) return `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: dp }).format(v)}${KO_UNIT[cur]}`;
    const s = new Intl.NumberFormat(INTL[locale], { style: 'currency', currency: cur, minimumFractionDigits: dp, maximumFractionDigits: dp }).format(v);
    // 한국어 원화는 "2만 9,000원"처럼 읽기 쉬운 단위로 보여 줘요.
    if (locale === 'ko' && cur === 'KRW') return `${koreanUnits(Math.round(v))}원`;
    return s;
  };
}

// ── 6종 ──────────────────────────────────────────────────
function SplitBill({ locale }: { locale: Locale }) {
  const w = W_[locale]; const cur = HOME[locale]; const money = useMoney(locale);
  const [total, setTotal] = useState('');
  const [n, setN] = useState(2);
  const scale = 10 ** dpOf(cur);
  const t = Math.round(parseAmount(total.replace(/,/g, '')) * scale);
  const r = splitBill({ total: t, people: Array.from({ length: n }, (_, i) => ({ name: String(i) })), mode: 'equal', unit: Math.round((SPLIT_UNIT[cur] ?? 0.01) * scale), payer: 0 });
  const each = r.rows[1]?.share ?? 0;
  const payer = r.rows[0]?.share ?? 0;
  const main = t > 0 ? w.splitEach(money(each / scale, cur)) : w.enter;
  const sub = t > 0 ? (payer !== each ? w.splitPayer(money(payer / scale, cur), money((payer - each) / scale, cur)) : w.splitEven) : undefined;
  return (
    <div className="space-y-6">
      <AmountInput locale={locale} id="sc-total" label={w.amountLabel} value={total} onChange={setTotal} suffix={locale === 'ko' ? (KO_SUFFIX[cur] ?? cur) : cur} />
      <Stepper id="sc-people" label={w.people} value={n} min={2} max={30} onChange={setN} show={w.peopleUnit} fewer={w.fewer} more={w.more} />
      <Answer locale={locale} main={main} sub={sub} />
    </div>
  );
}

interface Feed { asOf: string; rates: Record<string, number> }
function ExchangeRate({ locale }: { locale: Locale }) {
  const w = W_[locale]; const home = HOME[locale]; const money = useMoney(locale);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [fail, setFail] = useState(false);
  const options = FOREIGN.filter((c) => c !== home);
  const [cur, setCur] = useState(options[0]);
  const [reverse, setReverse] = useState(false);
  const [amount, setAmount] = useState('');
  useEffect(() => {
    let alive = true;
    fetch('/data/fx/latest.json', { cache: 'no-cache' }).then((r) => r.json()).then((j) => { if (!alive) return; const v = validateFeed(j); if (v) setFeed(v as Feed); else setFail(true); }).catch(() => alive && setFail(true));
    return () => { alive = false; };
  }, []);
  const from = reverse ? home : cur; const to = reverse ? cur : home;
  const a = parseAmount(amount.replace(/,/g, ''));
  const ok = feed && (from === 'KRW' || feed.rates[from]) && (to === 'KRW' || feed.rates[to]);
  const out = ok ? convertViaKrw(a, from, to, feed!.rates) : 0;
  const one = ok ? `1 ${from} = ${money(convertViaKrw(1, from, to, feed!.rates), to)}` : '';
  const main = fail ? w.fxFail : !feed ? w.fxLoading : a > 0 ? w.fxSays(money(a, from), money(out, to)) : w.enter;
  const sub = ok ? w.fxRate(one, feed!.asOf) : undefined;
  return (
    <div className="space-y-6">
      <fieldset className="space-y-2">
        <legend className={labelCls}>{w.currency[reverse ? to : from] ?? ''}</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {options.map((c) => <button key={c} type="button" aria-pressed={cur === c} onClick={() => setCur(c)} className={`${bigBtn} ${cur === c ? btnOn : btnOff} text-lg`}>{w.currency[c]}</button>)}
        </div>
      </fieldset>
      <AmountInput locale={locale} id="sc-fx" label={w.fxFrom} value={amount} onChange={setAmount} suffix={w.currency[from]} />
      <button type="button" onClick={() => setReverse((v) => !v)} className={`${bigBtn} ${btnOff} w-full text-lg`}>⇅ {w.swap(w.currency[to], w.currency[from])}</button>
      <Answer locale={locale} main={main} sub={sub} />
    </div>
  );
}

function Discount({ locale }: { locale: Locale }) {
  const w = W_[locale]; const cur = HOME[locale]; const money = useMoney(locale);
  const [price, setPrice] = useState('');
  const [pct, setPct] = useState(20);
  const p = parseAmount(price.replace(/,/g, ''));
  const r = discount(p, pct);
  return (
    <div className="space-y-6">
      <AmountInput locale={locale} id="sc-price" label={w.price} value={price} onChange={setPrice} suffix={locale === 'ko' ? (KO_SUFFIX[cur] ?? cur) : cur} />
      <Chips label={w.rate} options={[10, 20, 30, 40, 50, 70]} value={pct} onChange={setPct} show={(v) => `${v}%`} />
      <Answer locale={locale} main={p > 0 ? w.pay(money(r.final, cur)) : w.enter} sub={p > 0 ? w.save(money(r.saved, cur)) : undefined} />
    </div>
  );
}

function DaysLeft({ locale }: { locale: Locale }) {
  const w = W_[locale];
  const [date, setDate] = useState('');
  const [today, setToday] = useState('');
  useEffect(() => { setToday(todayIso()); }, []);
  const diff = date && today ? daysBetween(today, date) : null;
  const label = date ? new Intl.DateTimeFormat(INTL[locale], { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)) : '';
  const main = diff == null ? w.pick : diff > 0 ? w.daysLeft(label, diff) : diff === 0 ? w.today : w.daysAgo(label, -diff);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="sc-date" className={labelCls}>{w.date}</label>
        <input id="sc-date" type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <Answer locale={locale} main={main} />
    </div>
  );
}

function Installment({ locale }: { locale: Locale }) {
  const w = W_[locale]; const cur = HOME[locale]; const money = useMoney(locale); const d = INSTALL[locale];
  const [price, setPrice] = useState('');
  const [months, setMonths] = useState(3);
  const [free, setFree] = useState(false);
  const scale = 10 ** dpOf(cur);
  const p = Math.round(parseAmount(price.replace(/,/g, '')) * scale);
  const r = cardInstallment({ principal: p, months, ratePct: free ? 0 : d.rate, method: d.method });
  const step = cur === 'KRW' ? 10 : 1;
  const avg = Math.round(r.totalPaid / months / step) * step / scale;
  const main = p > 0 ? w.perMonth(money(avg, cur)) : w.enter;
  const sub = p > 0 ? (free ? w.freeLine : w.instDetail(money(r.firstPayment / scale, cur), money(r.totalFee / scale, cur), String(d.rate))) : undefined;
  return (
    <div className="space-y-6">
      <AmountInput locale={locale} id="sc-inst" label={w.price} value={price} onChange={setPrice} suffix={locale === 'ko' ? (KO_SUFFIX[cur] ?? cur) : cur} />
      <Chips label={w.months} options={[2, 3, 6, 10, 12, 24]} value={months} onChange={setMonths} show={w.monthsUnit} />
      <label className={`${bigBtn} ${free ? btnOn : btnOff} flex cursor-pointer items-center gap-3`}>
        <input type="checkbox" className="size-6 accent-primary" checked={free} onChange={(e) => setFree(e.target.checked)} />
        <span>{w.free}</span>
      </label>
      <Answer locale={locale} main={main} sub={sub} />
    </div>
  );
}

// ── 2차(2026-11-22): 나이·몇 시간 뒤·예금 이자·넓이 ─────────────
/** 예금 이자 세율: 한국 15.4%(소득세 14% + 지방세 1.4%), 일본 20.315%, 중국 0%(2008년부터 예금 이자 개인소득세 면제). 나머지는 세전. */
const DEPOSIT_TAX: Record<Locale, number | null> = { ko: 0.154, ja: 0.20315, zh: 0, en: null, fr: null, es: null };
const DEPOSIT_RATE: Record<Locale, string> = { ko: '3', ja: '0.4', zh: '1.5', en: '4', fr: '2.5', es: '2' };
const AREA_PAIRS: Record<Locale, [string, string]> = { ko: ['pyeong', 'm2'], ja: ['pyeong', 'm2'], zh: ['m2', 'ft2'], en: ['ft2', 'm2'], fr: ['m2', 'ft2'], es: ['m2', 'ft2'] };
interface W2 {
  birth: string; age: (n: number) => string; ageSub: (days: number, zodiac: string) => string; ageToday: string; zodiac: string[] | null; pickBirth: string;
  start: string; hoursQ: string; hoursUnit: (n: number) => string; plusMin: string; minUnit: (n: number) => string; at: (time: string, day: number) => string;
  deposit: string; ratePct: string; term: string; termUnit: (n: number) => string; interestMain: (v: string) => string; interestSub: (gross: string, tax: string, total: string, taxPct: string | null) => string;
  areaValue: string; unit: Record<string, string>; areaMain: (a: string, b: string) => string; reverse: string;
}
const ZK = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const ZJ = ['子（ねずみ）', '丑（うし）', '寅（とら）', '卯（うさぎ）', '辰（たつ）', '巳（へび）', '午（うま）', '未（ひつじ）', '申（さる）', '酉（とり）', '戌（いぬ）', '亥（いのしし）'];
const ZC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const W2_: Record<Locale, W2> = {
  ko: {
    birth: '태어난 날', age: (n) => `만 ${n}세예요.`, ageSub: (d, z) => `${z}띠예요. 다음 생일까지 ${d}일 남았어요. (띠는 양력 연도 기준, 설 전에 태어났으면 앞 해 띠예요)`, ageToday: '오늘이 생신이에요. 축하드려요!', zodiac: ZK, pickBirth: '태어난 날을 고르면 만 나이를 알려 드려요.',
    start: '시작 시각', hoursQ: '몇 시간 뒤?', hoursUnit: (n) => `${n}시간`, plusMin: '분 더하기', minUnit: (n) => `${n}분`, at: (t, d) => `${d === 0 ? '오늘' : d === 1 ? '내일' : `${d}일 뒤`} ${t}이에요.`,
    deposit: '맡길 돈', ratePct: '연 이자율(%)', term: '기간', termUnit: (n) => (n % 12 === 0 ? `${n / 12}년` : `${n}개월`), interestMain: (v) => `만기에 이자 ${v}을 받아요.`, interestSub: (g, t, tot, p) => `세금 ${p} ${t}을 뗀 금액이에요(세전 ${g}). 만기에 모두 ${tot}을 받아요. 단리 기준이에요.`,
    areaValue: '넓이', unit: { pyeong: '평', m2: '㎡', ft2: '제곱피트', acre: '에이커' }, areaMain: (a, b) => `${a}는 ${b}예요.`, reverse: '거꾸로 바꾸기',
  },
  en: {
    birth: 'Date of birth', age: (n) => `${n} years old.`, ageSub: (d) => `${d} days until the next birthday.`, ageToday: 'Today is the birthday. Happy birthday!', zodiac: null, pickBirth: 'Pick a date of birth to see the age.',
    start: 'Start time', hoursQ: 'How many hours later?', hoursUnit: (n) => `${n} hours`, plusMin: 'Add minutes', minUnit: (n) => `${n} min`, at: (t, d) => `${d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `In ${d} days`} at ${t}.`,
    deposit: 'Deposit', ratePct: 'Annual rate (%)', term: 'Term', termUnit: (n) => (n % 12 === 0 ? `${n / 12} yr` : `${n} months`), interestMain: (v) => `You earn ${v} in interest.`, interestSub: (g, t, tot) => `Total at maturity: ${tot}. Simple interest, before tax.`,
    areaValue: 'Area', unit: { pyeong: 'pyeong', m2: 'm²', ft2: 'sq ft', acre: 'acres' }, areaMain: (a, b) => `${a} is ${b}.`, reverse: 'Convert the other way',
  },
  ja: {
    birth: '生年月日', age: (n) => `満${n}歳です。`, ageSub: (d, z) => `${z}年生まれです。次の誕生日まであと${d}日です。`, ageToday: '今日がお誕生日です。おめでとうございます！', zodiac: ZJ, pickBirth: '生年月日を選ぶと満年齢をお知らせします。',
    start: '開始時刻', hoursQ: '何時間後？', hoursUnit: (n) => `${n}時間`, plusMin: '分を足す', minUnit: (n) => `${n}分`, at: (t, d) => `${d === 0 ? '今日' : d === 1 ? '明日' : `${d}日後`}の${t}です。`,
    deposit: '預ける金額', ratePct: '年利（%）', term: '期間', termUnit: (n) => (n % 12 === 0 ? `${n / 12}年` : `${n}か月`), interestMain: (v) => `満期の利息は${v}です。`, interestSub: (g, t, tot, p) => `税金${p}（${t}）を引いた額です（税引前${g}）。満期に合計${tot}を受け取ります。単利で計算しています。`,
    areaValue: '面積', unit: { pyeong: '坪', m2: '㎡', ft2: '平方フィート', acre: 'エーカー' }, areaMain: (a, b) => `${a}は${b}です。`, reverse: '逆に変換',
  },
  zh: {
    birth: '出生日期', age: (n) => `${n}周岁。`, ageSub: (d, z) => `属${z}（按公历年份估算，春节前出生属上一年）。距离下次生日还有 ${d} 天。`, ageToday: '今天是生日，生日快乐！', zodiac: ZC, pickBirth: '选择出生日期后显示周岁。',
    start: '开始时间', hoursQ: '几小时后？', hoursUnit: (n) => `${n}小时`, plusMin: '再加几分钟', minUnit: (n) => `${n}分`, at: (t, d) => `${d === 0 ? '今天' : d === 1 ? '明天' : `${d}天后`} ${t}。`,
    deposit: '存款金额', ratePct: '年利率（%）', term: '期限', termUnit: (n) => (n % 12 === 0 ? `${n / 12}年` : `${n}个月`), interestMain: (v) => `到期利息 ${v}。`, interestSub: (g, t, tot) => `到期本息合计 ${tot}。按单利计算，存款利息目前免征个人所得税。`,
    areaValue: '面积', unit: { pyeong: '坪', m2: '平方米', ft2: '平方英尺', acre: '英亩' }, areaMain: (a, b) => `${a} 等于 ${b}。`, reverse: '反向换算',
  },
  fr: {
    birth: 'Date de naissance', age: (n) => `${n} ans.`, ageSub: (d) => `Prochain anniversaire dans ${d} jours.`, ageToday: 'C’est l’anniversaire aujourd’hui. Bon anniversaire !', zodiac: null, pickBirth: 'Choisissez la date de naissance pour voir l’âge.',
    start: 'Heure de départ', hoursQ: 'Dans combien d’heures ?', hoursUnit: (n) => `${n} h`, plusMin: 'Ajouter des minutes', minUnit: (n) => `${n} min`, at: (t, d) => `${d === 0 ? 'Aujourd’hui' : d === 1 ? 'Demain' : `Dans ${d} jours`} à ${t}.`,
    deposit: 'Montant placé', ratePct: 'Taux annuel (%)', term: 'Durée', termUnit: (n) => (n % 12 === 0 ? `${n / 12} an${n > 12 ? 's' : ''}` : `${n} mois`), interestMain: (v) => `Vous touchez ${v} d’intérêts.`, interestSub: (g, t, tot) => `Total à l’échéance : ${tot}. Intérêts simples, avant impôts.`,
    areaValue: 'Surface', unit: { pyeong: 'pyeong', m2: 'm²', ft2: 'pieds carrés', acre: 'acres' }, areaMain: (a, b) => `${a} = ${b}.`, reverse: 'Convertir dans l’autre sens',
  },
  es: {
    birth: 'Fecha de nacimiento', age: (n) => `${n} años.`, ageSub: (d) => `Faltan ${d} días para el próximo cumpleaños.`, ageToday: 'Hoy es el cumpleaños. ¡Felicidades!', zodiac: null, pickBirth: 'Elige la fecha de nacimiento para ver la edad.',
    start: 'Hora de inicio', hoursQ: '¿Dentro de cuántas horas?', hoursUnit: (n) => `${n} h`, plusMin: 'Sumar minutos', minUnit: (n) => `${n} min`, at: (t, d) => `${d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `Dentro de ${d} días`} a las ${t}.`,
    deposit: 'Importe', ratePct: 'Tipo anual (%)', term: 'Plazo', termUnit: (n) => (n % 12 === 0 ? `${n / 12} año${n > 12 ? 's' : ''}` : `${n} meses`), interestMain: (v) => `Recibes ${v} de intereses.`, interestSub: (g, t, tot) => `Total al vencimiento: ${tot}. Interés simple, antes de impuestos.`,
    areaValue: 'Superficie', unit: { pyeong: 'pyeong', m2: 'm²', ft2: 'pies cuadrados', acre: 'acres' }, areaMain: (a, b) => `${a} = ${b}.`, reverse: 'Convertir al revés',
  },
};

function Age({ locale }: { locale: Locale }) {
  const w = W2_[locale];
  const [birth, setBirth] = useState('');
  const [today, setToday] = useState('');
  useEffect(() => { setToday(todayIso()); }, []);
  const r = birth && today ? ageOn(birth, today) : null;
  const z = r && w.zodiac ? w.zodiac[zodiacIndex(r.birthYear)] : '';
  const main = r ? w.age(r.age) : w.pickBirth;
  const sub = r ? (r.toNext === 0 ? w.ageToday : w.ageSub(r.toNext, z)) : undefined;
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="sc-birth" className={labelCls}>{w.birth}</label>
        <input id="sc-birth" type="date" className={inputCls} min="1900-01-01" max={today || undefined} value={birth} onChange={(e) => setBirth(e.target.value)} />
      </div>
      <Answer locale={locale} main={main} sub={sub} />
    </div>
  );
}

function TimeAfter({ locale }: { locale: Locale }) {
  const w = W2_[locale];
  const [start, setStart] = useState('');
  const [hours, setHours] = useState(8);
  const [mins, setMins] = useState(0);
  useEffect(() => { const d = new Date(); setStart(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`); }, []);
  const r = start ? addTime(start, hours, mins) : null;
  const time = r ? new Intl.DateTimeFormat(INTL[locale], { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 0, 1, r.hour, r.minute))) : '';
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="sc-start" className={labelCls}>{w.start}</label>
        <input id="sc-start" type="time" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} />
      </div>
      <Chips label={w.hoursQ} options={[1, 2, 4, 6, 8, 12]} value={hours} onChange={setHours} show={w.hoursUnit} />
      <Chips label={w.plusMin} options={[0, 10, 15, 30, 45]} value={mins} onChange={setMins} show={w.minUnit} />
      <Answer locale={locale} main={r ? w.at(time, r.dayOffset) : W_[locale].enter} />
    </div>
  );
}

function Interest({ locale }: { locale: Locale }) {
  const w = W2_[locale]; const cur = HOME[locale]; const money = useMoney(locale);
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(DEPOSIT_RATE[locale]);
  const [months, setMonths] = useState(12);
  const taxRate = DEPOSIT_TAX[locale];
  const p = parseAmount(amount.replace(/,/g, ''));
  const r = depositInterest(p, parseAmount(rate.replace(',', '.')), months, taxRate ?? 0);
  const pct = taxRate ? `${new Intl.NumberFormat(INTL[locale], { maximumFractionDigits: 3 }).format(taxRate * 100)}%` : null;
  return (
    <div className="space-y-6">
      <AmountInput locale={locale} id="sc-dep" label={w.deposit} value={amount} onChange={setAmount} suffix={locale === 'ko' ? '원' : cur} />
      <div className="space-y-2">
        <label htmlFor="sc-rate" className={labelCls}>{w.ratePct}</label>
        <input id="sc-rate" className={inputCls} type="text" inputMode="decimal" autoComplete="off" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.,]/g, '').slice(0, 6))} />
      </div>
      <Chips label={w.term} options={[6, 12, 24, 36]} value={months} onChange={setMonths} show={w.termUnit} />
      <Answer locale={locale} main={p > 0 ? w.interestMain(money(r.net, cur)) : W_[locale].enter} sub={p > 0 ? w.interestSub(money(r.gross, cur), money(r.tax, cur), money(r.total, cur), pct) : undefined} />
    </div>
  );
}

function Area({ locale }: { locale: Locale }) {
  const w = W2_[locale];
  const [a, b] = AREA_PAIRS[locale];
  const [value, setValue] = useState('');
  const [rev, setRev] = useState(false);
  const from = rev ? b : a; const to = rev ? a : b;
  const v = parseAmount(value.replace(/,/g, ''));
  const out = convertArea(v, from, to);
  const nf = new Intl.NumberFormat(INTL[locale], { maximumFractionDigits: 2 });
  const show = (n: number, u: string) => `${nf.format(n)}${locale === 'ko' || locale === 'ja' || locale === 'zh' ? '' : ' '}${w.unit[u]}`;
  const main = v > 0 ? (locale === 'ko' ? `${josa(show(v, from), '은', '는')} ${josa(show(out, to), '이에요', '예요')}.` : w.areaMain(show(v, from), show(out, to))) : W_[locale].enter;
  return (
    <div className="space-y-6">
      <AmountInput locale={locale} id="sc-area" label={w.areaValue} value={value} onChange={setValue} suffix={w.unit[from]} />
      <button type="button" onClick={() => setRev((x) => !x)} className={`${bigBtn} ${btnOff} w-full text-lg`}>⇅ {w.reverse}: {w.unit[to]} → {w.unit[from]}</button>
      <Answer locale={locale} main={main} />
    </div>
  );
}

// ── 3차(2026-11-24): 어느 게 더 싼가·몇 % 올랐나·약 며칠 치·비만도·온도 ─────────
interface W3 {
  itemA: string; itemB: string; priceOf: string; qtyOf: string; qtyHint: string;
  cheaper: (which: string, pct: string) => string; same: string; perUnit: (a: string, b: string) => string;
  before: string; after: string; up: (pct: string) => string; down: (pct: string) => string; flat: string; more: (v: string) => string; less: (v: string) => string;
  pillCount: string; pillUnit: string; perDay: string; perDayUnit: (n: number) => string;
  pillDays: (n: number, last: string) => string; pillShort: string; refill: (d: string) => string; refillNow: string; pillExtra: (n: number) => string;
  height: string; weight: string; ft: string; inch: string; lb: string; imperial: string;
  bmiMain: (v: string, band: string) => string; bmiSub: (h: string, lo: string, hi: string) => string;
  temp: string; minus: string; tempMain: (a: string, b: string) => string; reverse: string; fever: string;
}
const W3_: Record<Locale, W3> = {
  ko: {
    itemA: '첫째 물건', itemB: '둘째 물건', priceOf: '가격', qtyOf: '양 (g·ml·개)', qtyHint: '양은 두 물건 모두 같은 단위로 넣으세요.',
    cheaper: (w, p) => `${josa(w, '이', '가')} ${p} 더 싸요.`, same: '두 물건 값이 같아요.', perUnit: (a, b) => `양 1당 가격: 첫째 ${a}, 둘째 ${b}.`,
    before: '예전 값', after: '지금 값', up: (p) => `${p} 올랐어요.`, down: (p) => `${p} 내렸어요.`, flat: '값이 그대로예요.', more: (v) => `예전보다 ${v} 더 내요.`, less: (v) => `예전보다 ${v} 덜 내요.`,
    pillCount: '남은 약 개수', pillUnit: '알', perDay: '하루에 몇 알?', perDayUnit: (n) => `${n}알`,
    pillDays: (n, l) => `${n}일 치 남았어요. ${l}까지 드실 수 있어요.`, pillShort: '오늘 먹을 양보다 적게 남았어요.', refill: (d) => `${d}쯤 미리 병원이나 약국에 가 보세요.`, refillNow: '오늘 바로 약을 새로 타세요.', pillExtra: (n) => `(${n}알이 더 남아요.)`,
    height: '키', weight: '몸무게', ft: '피트', inch: '인치', lb: '파운드', imperial: '피트·파운드로 넣기',
    bmiMain: (v, b) => `BMI ${v}, '${b}'이에요.`, bmiSub: (h, lo, hi) => `키 ${h}의 정상 몸무게는 ${lo}~${hi}예요. 대한비만학회 기준(23 미만 정상, 25부터 비만)이고, 근육이 많으면 높게 나올 수 있어요.`,
    temp: '온도', minus: '영하(−)', tempMain: (a, b) => `${josa(a, '은', '는')} ${josa(b, '이에요', '예요')}.`, reverse: '거꾸로 바꾸기', fever: '몸 온도라면 37.5℃ 이상은 열이 있는 편이에요.',
  },
  en: {
    itemA: 'Item 1', itemB: 'Item 2', priceOf: 'Price', qtyOf: 'Size (oz, g, count)', qtyHint: 'Use the same unit for both sizes.',
    cheaper: (w, p) => `${w} is cheaper by ${p}.`, same: 'Both cost the same per unit.', perUnit: (a, b) => `Price per unit: item 1 ${a}, item 2 ${b}.`,
    before: 'Old amount', after: 'New amount', up: (p) => `It went up ${p}.`, down: (p) => `It went down ${p}.`, flat: 'No change.', more: (v) => `You pay ${v} more.`, less: (v) => `You pay ${v} less.`,
    pillCount: 'Pills left', pillUnit: 'pills', perDay: 'Pills a day', perDayUnit: (n) => `${n} a day`,
    pillDays: (n, l) => `${n} days left. They last until ${l}.`, pillShort: 'Fewer pills than one day’s dose are left.', refill: (d) => `Ask for a refill around ${d}.`, refillNow: 'Ask for a refill today.', pillExtra: (n) => `(${n} extra left over.)`,
    height: 'Height', weight: 'Weight', ft: 'feet', inch: 'inches', lb: 'pounds', imperial: 'Use feet and pounds',
    bmiMain: (v, b) => `BMI ${v}: “${b}”.`, bmiSub: (h, lo, hi) => `For ${h}, a healthy weight is ${lo} to ${hi} (WHO: 18.5 to 24.9). Muscle can push BMI up.`,
    temp: 'Temperature', minus: 'Below zero (−)', tempMain: (a, b) => `${a} is ${b}.`, reverse: 'Convert the other way', fever: 'For body temperature, 100.4°F (38°C) or higher is a fever.',
  },
  ja: {
    itemA: '1つ目の商品', itemB: '2つ目の商品', priceOf: '値段', qtyOf: '量（g・ml・個）', qtyHint: '量は2つとも同じ単位で入れてください。',
    cheaper: (w, p) => `${w}の方が${p}安いです。`, same: '2つとも同じ値段です。', perUnit: (a, b) => `量1あたり：1つ目 ${a}、2つ目 ${b}。`,
    before: '前の金額', after: '今の金額', up: (p) => `${p}上がりました。`, down: (p) => `${p}下がりました。`, flat: '変わっていません。', more: (v) => `前より${v}多く払います。`, less: (v) => `前より${v}少なく払います。`,
    pillCount: '残っている薬の数', pillUnit: '錠', perDay: '1日に何錠？', perDayUnit: (n) => `${n}錠`,
    pillDays: (n, l) => `${n}日分あります。${l}まで飲めます。`, pillShort: '1日分より少なくなっています。', refill: (d) => `${d}ごろ、早めに病院か薬局へ行きましょう。`, refillNow: '今日、薬を受け取りに行きましょう。', pillExtra: (n) => `（${n}錠余ります）`,
    height: '身長', weight: '体重', ft: 'フィート', inch: 'インチ', lb: 'ポンド', imperial: 'フィート・ポンドで入れる',
    bmiMain: (v, b) => `BMI ${v}で「${b}」です。`, bmiSub: (h, lo, hi) => `身長${h}の普通体重は${lo}〜${hi}です（日本肥満学会：25以上は肥満）。筋肉が多いと高めに出ます。`,
    temp: '温度', minus: '氷点下（−）', tempMain: (a, b) => `${a}は${b}です。`, reverse: '逆に変換', fever: '体温なら、37.5℃以上は発熱の目安です。',
  },
  zh: {
    itemA: '第一件', itemB: '第二件', priceOf: '价格', qtyOf: '数量（克·毫升·个）', qtyHint: '两件的数量请用同一单位。',
    cheaper: (w, p) => `${w}更便宜，便宜 ${p}。`, same: '两件单价一样。', perUnit: (a, b) => `每单位价格：第一件 ${a}，第二件 ${b}。`,
    before: '原来的金额', after: '现在的金额', up: (p) => `涨了 ${p}。`, down: (p) => `降了 ${p}。`, flat: '没有变化。', more: (v) => `比原来多付 ${v}。`, less: (v) => `比原来少付 ${v}。`,
    pillCount: '剩余药片', pillUnit: '片', perDay: '每天吃几片？', perDayUnit: (n) => `${n}片`,
    pillDays: (n, l) => `还够 ${n} 天，可以吃到${l}。`, pillShort: '剩下的不够一天的量。', refill: (d) => `请在${d}左右提前去医院或药店配药。`, refillNow: '请今天就去配药。', pillExtra: (n) => `（还多出 ${n} 片）`,
    height: '身高', weight: '体重', ft: '英尺', inch: '英寸', lb: '磅', imperial: '用英尺和磅输入',
    bmiMain: (v, b) => `BMI ${v}，属于“${b}”。`, bmiSub: (h, lo, hi) => `身高${h}的正常体重是${lo}~${hi}（中国成人标准：24起超重，28起肥胖）。肌肉多的人数值会偏高。`,
    temp: '温度', minus: '零下（−）', tempMain: (a, b) => `${a} 等于 ${b}。`, reverse: '反向换算', fever: '如果是体温，37.3℃以上算发热。',
  },
  fr: {
    itemA: 'Produit 1', itemB: 'Produit 2', priceOf: 'Prix', qtyOf: 'Quantité (g, ml, pièces)', qtyHint: 'Utilisez la même unité pour les deux.',
    cheaper: (w, p) => `Le ${w.toLowerCase()} est moins cher de ${p}.`, same: 'Les deux coûtent pareil à l’unité.', perUnit: (a, b) => `Prix par unité : produit 1 ${a}, produit 2 ${b}.`,
    before: 'Ancien montant', after: 'Nouveau montant', up: (p) => `Hausse de ${p}.`, down: (p) => `Baisse de ${p}.`, flat: 'Aucun changement.', more: (v) => `Vous payez ${v} de plus.`, less: (v) => `Vous payez ${v} de moins.`,
    pillCount: 'Comprimés restants', pillUnit: 'comprimés', perDay: 'Par jour', perDayUnit: (n) => `${n} par jour`,
    pillDays: (n, l) => `Il reste ${n} jours. Ils durent jusqu’au ${l}.`, pillShort: 'Il reste moins qu’une journée de traitement.', refill: (d) => `Pensez à renouveler vers le ${d}.`, refillNow: 'Renouvelez dès aujourd’hui.', pillExtra: (n) => `(${n} en plus)`,
    height: 'Taille', weight: 'Poids', ft: 'pieds', inch: 'pouces', lb: 'livres', imperial: 'Saisir en pieds et livres',
    bmiMain: (v, b) => `IMC ${v} : « ${b} ».`, bmiSub: (h, lo, hi) => `Pour ${h}, le poids normal va de ${lo} à ${hi} (OMS : 18,5 à 24,9). Les muscles font monter l’IMC.`,
    temp: 'Température', minus: 'Sous zéro (−)', tempMain: (a, b) => `${a} = ${b}.`, reverse: 'Convertir dans l’autre sens', fever: 'Pour la température du corps, on parle de fièvre à partir de 38 °C.',
  },
  es: {
    itemA: 'Producto 1', itemB: 'Producto 2', priceOf: 'Precio', qtyOf: 'Cantidad (g, ml, unidades)', qtyHint: 'Usa la misma unidad en los dos.',
    cheaper: (w, p) => `El ${w.toLowerCase()} es más barato, un ${p}.`, same: 'Los dos cuestan lo mismo por unidad.', perUnit: (a, b) => `Precio por unidad: producto 1 ${a}, producto 2 ${b}.`,
    before: 'Importe anterior', after: 'Importe actual', up: (p) => `Ha subido un ${p}.`, down: (p) => `Ha bajado un ${p}.`, flat: 'No ha cambiado.', more: (v) => `Pagas ${v} más.`, less: (v) => `Pagas ${v} menos.`,
    pillCount: 'Pastillas que quedan', pillUnit: 'pastillas', perDay: 'Al día', perDayUnit: (n) => `${n} al día`,
    pillDays: (n, l) => `Quedan para ${n} días. Llegan hasta el ${l}.`, pillShort: 'Quedan menos que la dosis de un día.', refill: (d) => `Pide más hacia el ${d}.`, refillNow: 'Pide más hoy mismo.', pillExtra: (n) => `(sobran ${n})`,
    height: 'Altura', weight: 'Peso', ft: 'pies', inch: 'pulgadas', lb: 'libras', imperial: 'Usar pies y libras',
    bmiMain: (v, b) => `IMC ${v}: «${b}».`, bmiSub: (h, lo, hi) => `Para ${h}, el peso normal va de ${lo} a ${hi} (OMS: 18,5 a 24,9). El músculo sube el IMC.`,
    temp: 'Temperatura', minus: 'Bajo cero (−)', tempMain: (a, b) => `${a} = ${b}.`, reverse: 'Convertir al revés', fever: 'Si es la temperatura del cuerpo, desde 38 °C se considera fiebre.',
  },
};
const qtyNum = (v: string) => parseAmount(v.replace(/,/g, ''));

function UnitPrice({ locale }: { locale: Locale }) {
  const w = W3_[locale]; const cur = HOME[locale];
  const [pa, setPa] = useState(''); const [qa, setQa] = useState('');
  const [pb, setPb] = useState(''); const [qb, setQb] = useState('');
  const r = comparePrice({ price: qtyNum(pa), qty: qtyNum(qa) }, { price: qtyNum(pb), qty: qtyNum(qb) });
  const per = (v: number) => (locale === 'ko'
    ? `${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(v)}원`
    : new Intl.NumberFormat(INTL[locale], { style: 'currency', currency: cur, minimumFractionDigits: 0, maximumFractionDigits: dpOf(cur) + 2 }).format(v));
  const pct = r ? new Intl.NumberFormat(INTL[locale], { style: 'percent', maximumFractionDigits: 0 }).format(Math.round(r.savePct) / 100) : '';
  const main = !r ? W_[locale].enter : r.cheaper === 'same' ? w.same : w.cheaper(r.cheaper === 'a' ? w.itemA : w.itemB, pct);
  const suffix = locale === 'ko' ? '원' : cur;
  const box = (title: string, id: string, p: string, sp: (v: string) => void, q: string, sq: (v: string) => void, win: boolean) => (
    <fieldset className={`space-y-4 rounded-2xl border-2 p-4 ${win ? 'border-primary bg-primary/5' : 'border-border'}`}>
      <legend className="px-2 text-2xl font-black text-foreground">{title}{win ? ' ✅' : ''}</legend>
      <AmountInput locale={locale} id={`${id}-p`} label={w.priceOf} value={p} onChange={sp} suffix={suffix} />
      <AmountInput locale={locale} id={`${id}-q`} label={w.qtyOf} value={q} onChange={sq} />
    </fieldset>
  );
  return (
    <div className="space-y-6">
      {box(w.itemA, 'sc-ua', pa, setPa, qa, setQa, r?.cheaper === 'a')}
      {box(w.itemB, 'sc-ub', pb, setPb, qb, setQb, r?.cheaper === 'b')}
      <p className="text-lg text-muted-foreground">{w.qtyHint}</p>
      <Answer locale={locale} main={main} sub={r ? w.perUnit(per(r.ua), per(r.ub)) : undefined} />
    </div>
  );
}

function PercentChange({ locale }: { locale: Locale }) {
  const w = W3_[locale]; const cur = HOME[locale]; const money = useMoney(locale);
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const r = b ? percentChange(qtyNum(a), qtyNum(b)) : null;
  const pf = new Intl.NumberFormat(INTL[locale], { style: 'percent', maximumFractionDigits: 1 });
  const pct = r ? pf.format(Math.abs(Math.round(r.pct * 10) / 10) / 100) : '';
  const flat = r ? Math.abs(r.pct) < 0.05 : false;
  const main = !r ? W_[locale].enter : flat ? w.flat : r.pct > 0 ? w.up(pct) : w.down(pct);
  const sub = r && !flat ? (r.diff > 0 ? w.more(money(r.diff, cur)) : w.less(money(-r.diff, cur))) : undefined;
  const suffix = locale === 'ko' ? '원' : cur;
  return (
    <div className="space-y-6">
      <AmountInput locale={locale} id="sc-before" label={w.before} value={a} onChange={setA} suffix={suffix} />
      <AmountInput locale={locale} id="sc-after" label={w.after} value={b} onChange={setB} suffix={suffix} />
      <Answer locale={locale} main={main} sub={sub} />
    </div>
  );
}

function Pills({ locale }: { locale: Locale }) {
  const w = W3_[locale];
  const [count, setCount] = useState('');
  const [perDay, setPerDay] = useState(1);
  const [today, setToday] = useState('');
  useEffect(() => { setToday(todayIso()); }, []);
  const n = Math.floor(qtyNum(count));
  const r = today && n > 0 ? pillsLeft(n, perDay, today) : null;
  const fmt = (iso: string) => new Intl.DateTimeFormat(INTL[locale], { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  const main = !r ? W_[locale].enter : r.lastDay ? w.pillDays(r.days, fmt(r.lastDay)) : w.pillShort;
  const sub = !r ? undefined : [r.days > 3 ? w.refill(fmt(r.refillBy)) : w.refillNow, r.extra > 0 && r.days > 0 ? w.pillExtra(r.extra) : ''].filter(Boolean).join(' ');
  return (
    <div className="space-y-6">
      <AmountInput locale={locale} id="sc-pills" label={w.pillCount} value={count} onChange={setCount} suffix={w.pillUnit} />
      <Chips label={w.perDay} options={[1, 2, 3, 4, 6]} value={perDay} onChange={setPerDay} show={w.perDayUnit} />
      <Answer locale={locale} main={main} sub={sub} />
    </div>
  );
}

function Bmi({ locale }: { locale: Locale }) {
  const w = W3_[locale];
  const [imperial, setImperial] = useState(locale === 'en');
  const [h, setH] = useState(''); const [wt, setWt] = useState('');
  const [ft, setFt] = useState(''); const [inch, setInch] = useState(''); const [lb, setLb] = useState('');
  const hCm = imperial ? FT_IN_TO_CM(qtyNum(ft), qtyNum(inch)) : qtyNum(h);
  const wKg = imperial ? LB_TO_KG(qtyNum(lb)) : qtyNum(wt);
  const v = bmiValue(hCm, wKg);
  const nf = new Intl.NumberFormat(INTL[locale], { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const bands = locale === 'ko' ? BMI_BANDS : BMI_BANDS_L[locale as Exclude<Locale, 'ko'>];
  const top = locale === 'ko' ? 23 : NORMAL_TOP[locale as Exclude<Locale, 'ko'>];
  const band = v != null ? bands.find((b) => v < b.max)!.label : '';
  const lo = 18.5 * (hCm / 100) ** 2; const hi = (top - 0.1) * (hCm / 100) ** 2;
  const sp = locale === 'ko' || locale === 'ja' || locale === 'zh' ? '' : ' ';
  const kg = (x: number) => (imperial ? `${Math.round(x / 0.45359237)}${sp}lb` : `${nf.format(x)}${sp}kg`);
  const hShow = imperial ? `${qtyNum(ft)}′${qtyNum(inch)}″` : `${qtyNum(h)}${sp}cm`;
  const main = v != null ? w.bmiMain(nf.format(v), band) : W_[locale].enter;
  const sub = v != null ? w.bmiSub(hShow, kg(lo), kg(hi)) : undefined;
  return (
    <div className="space-y-6">
      {imperial ? (
        <div className="grid grid-cols-2 gap-3">
          <AmountInput locale={locale} id="sc-ft" label={`${w.height} (${w.ft})`} value={ft} onChange={setFt} />
          <AmountInput locale={locale} id="sc-in" label={w.inch} value={inch} onChange={setInch} />
        </div>
      ) : <AmountInput locale={locale} id="sc-h" label={w.height} value={h} onChange={setH} suffix="cm" />}
      {imperial
        ? <AmountInput locale={locale} id="sc-lb" label={w.weight} value={lb} onChange={setLb} suffix={w.lb} />
        : <AmountInput locale={locale} id="sc-w" label={w.weight} value={wt} onChange={setWt} suffix="kg" />}
      <label className={`${bigBtn} ${imperial ? btnOn : btnOff} flex cursor-pointer items-center gap-3 text-lg`}>
        <input type="checkbox" className="size-6 accent-primary" checked={imperial} onChange={(e) => setImperial(e.target.checked)} />
        <span>{w.imperial}</span>
      </label>
      <Answer locale={locale} main={main} sub={sub} />
    </div>
  );
}

const TEMP_FROM: Record<Locale, 'c' | 'f'> = { ko: 'f', ja: 'f', zh: 'f', fr: 'f', es: 'f', en: 'c' };
function Temperature({ locale }: { locale: Locale }) {
  const w = W3_[locale];
  const [value, setValue] = useState('');
  const [neg, setNeg] = useState(false);
  const [from, setFrom] = useState<'c' | 'f'>(TEMP_FROM[locale]);
  const to = from === 'c' ? 'f' : 'c';
  const raw = qtyNum(value);
  const x = neg ? -raw : raw;
  const out = convertTemp(x, from);
  const nf = new Intl.NumberFormat(INTL[locale], { maximumFractionDigits: 1 });
  const sym = (u: 'c' | 'f') => (u === 'c' ? '℃' : '℉');
  const sp = locale === 'fr' || locale === 'es' ? ' ' : '';
  const show = (n: number, u: 'c' | 'f') => `${nf.format(Math.round(n * 10) / 10)}${sp}${sym(u)}`;
  const celsius = from === 'c' ? x : out;
  const main = value ? w.tempMain(show(x, from), show(out, to)) : W_[locale].enter;
  const sub = value && celsius >= 35 && celsius <= 43 ? w.fever : undefined;
  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3">
        <div className="flex-1"><AmountInput locale={locale} id="sc-temp" label={w.temp} value={value} onChange={setValue} suffix={sym(from)} /></div>
        <button type="button" aria-pressed={neg} onClick={() => setNeg((v) => !v)} className={`${bigBtn} ${neg ? btnOn : btnOff} min-h-16 text-lg`}>{w.minus}</button>
      </div>
      <button type="button" onClick={() => setFrom(to)} className={`${bigBtn} ${btnOff} w-full text-lg`}>⇅ {w.reverse}: {sym(to)} → {sym(from)}</button>
      <Answer locale={locale} main={main} sub={sub} />
    </div>
  );
}

const KEYS = ['C', '⌫', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '00', '.', '='];
function DeskCalculator({ locale }: { locale: Locale }) {
  const w = W_[locale];
  const [s, setS] = useState<CalcState>(initialCalc);
  const press = (k: string) => setS((cur) => pressKey(cur, k));
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
      const map: Record<string, string> = { '*': '×', x: '×', X: '×', '/': '÷', Enter: '=', '=': '=', Backspace: '⌫', Escape: 'C', Delete: 'C', ',': '.' };
      const k = map[e.key] ?? e.key;
      if (KEYS.includes(k) && k !== '00') {
        // Enter/스페이스로 포커스된 버튼을 누를 때는 버튼이 처리해요.
        if ((e.key === 'Enter' || e.key === ' ') && t?.tagName === 'BUTTON') return;
        e.preventDefault(); press(k);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const nf = new Intl.NumberFormat(INTL[locale], { maximumFractionDigits: 10 });
  const pretty = (v: string) => (/^-?\d+(\.\d+)?$/.test(v) ? nf.format(Number(v)) : v);
  const shown = s.error ? '—' : s.display.endsWith('.') ? `${pretty(s.display.slice(0, -1))}${nf.format(1.1).charAt(1)}` : pretty(s.display);
  const speakExpr = s.expr ? s.expr.split(' ').map((x) => w.ops[x] ?? (/^-?[\d.]+$/.test(x) ? nf.format(Number(x)) : x)).join(' ') : '';
  const main = s.error ? 'Error' : shown;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4 text-right">
        <p className="min-h-7 text-lg text-muted-foreground" aria-hidden="true">{s.expr.replace(/-?\d+(\.\d+)?/g, (m) => nf.format(Number(m)))}</p>
        <output aria-label={w.display} className="block break-all text-5xl font-black tabular-nums text-foreground">{main}</output>
      </div>
      <div role="group" aria-label={w.keypad} className="grid grid-cols-4 gap-3">
        {KEYS.map((k) => {
          const op = ['÷', '×', '-', '+', '='].includes(k);
          const fn = ['C', '⌫', '%'].includes(k);
          return (
            <button key={k} type="button" onClick={() => press(k)} aria-label={w.keys[k]} className={`min-h-16 rounded-xl border-2 text-3xl font-black transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring ${k === '=' ? 'border-primary bg-primary text-primary-foreground' : op ? 'border-primary bg-primary/10 text-foreground hover:bg-primary/20' : fn ? 'border-border bg-muted text-foreground hover:border-primary' : 'border-border bg-card text-foreground hover:border-primary'}`}>
              {k === '-' ? '−' : k}
            </button>
          );
        })}
      </div>
      <Answer locale={locale} main={s.expr.endsWith('=') ? `${s.expr.replace(/-?\d+(\.\d+)?/g, (m) => nf.format(Number(m)))} ${shown}` : shown} speech={s.expr.endsWith('=') ? `${speakExpr} ${shown}` : shown} />
    </div>
  );
}

export default function SimpleCalc({ tool, locale }: { tool: SimpleTool; locale: Locale }) {
  const body = useMemo(() => {
    if (tool === 'calculator') return <DeskCalculator locale={locale} />;
    if (tool === 'split-bill') return <SplitBill locale={locale} />;
    if (tool === 'exchange-rate') return <ExchangeRate locale={locale} />;
    if (tool === 'discount') return <Discount locale={locale} />;
    if (tool === 'days-left') return <DaysLeft locale={locale} />;
    if (tool === 'age') return <Age locale={locale} />;
    if (tool === 'time-after') return <TimeAfter locale={locale} />;
    if (tool === 'interest') return <Interest locale={locale} />;
    if (tool === 'area') return <Area locale={locale} />;
    if (tool === 'unit-price') return <UnitPrice locale={locale} />;
    if (tool === 'percent-change') return <PercentChange locale={locale} />;
    if (tool === 'pills') return <Pills locale={locale} />;
    if (tool === 'bmi') return <Bmi locale={locale} />;
    if (tool === 'temperature') return <Temperature locale={locale} />;
    return <Installment locale={locale} />;
  }, [tool, locale]);
  return <div data-simple-calc={tool}>{body}</div>;
}
