'use client';
/**
 * 간단계산기 (2026-11-22). 어르신·저시력·시각장애인용 큰 글씨 계산기 6종.
 * 규칙: 입력 2~3개, 결과는 크게 한 문장(aria-live), "소리로 듣기", 버튼 최소 56px, 키보드 완전 지원.
 * 수수료율·송금 단위 같은 설정은 나라별 기본값으로 숨기고, 자세한 계산기는 페이지 아래 링크로 보내요.
 */
import { useEffect, useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import type { SimpleTool } from '../../data/simple-calculators';
import { SIMPLE_UI } from '../../data/simple-calculators';
import { splitBill, cardInstallment, type InstallmentMethod } from '../../lib/bill-split';
import { pressKey, initialCalc, koreanUnits, parseAmount, discount, daysBetween, todayIso, type CalcState } from '../../lib/simple-calc';
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
    return <Installment locale={locale} />;
  }, [tool, locale]);
  return <div data-simple-calc={tool}>{body}</div>;
}
