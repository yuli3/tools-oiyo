/**
 * 간단계산기 브랜드 (2026-11-22, 세운 결정: 이름 "간단계산기").
 * 대상: 어르신·저시력·시각장애인. 겉은 큰 글씨·큰 버튼·입력 2~3개·한 문장 결과, 복잡한 설정은 숨겨요.
 * 자세한 설정이 필요한 사람은 detail 링크로 기존 계산기(주소 그대로)에 가요.
 */
import type { Locale } from '../lib/i18n';

export const SIMPLE_LOCALES = ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const satisfies readonly Locale[];
export type SimpleTool = 'calculator' | 'split-bill' | 'exchange-rate' | 'discount' | 'days-left' | 'card-installment' | 'age' | 'time-after' | 'interest' | 'area'
  | 'unit-price' | 'percent-change' | 'pills' | 'bmi' | 'temperature';
// 2026-11-22 2차: 어르신이 자주 묻는 나이·약 먹는 시간·예금 이자·평수를 더했어요. 허브에는 이 순서대로 보여요.
// 2026-11-24 3차: 장보기(어느 게 더 싼가)·값 오름(몇 % 올랐나)·약 며칠 치·비만도·온도를 더했어요(법률·세금 계산 없음).
export const SIMPLE_TOOLS: SimpleTool[] = ['calculator', 'split-bill', 'discount', 'unit-price', 'percent-change', 'exchange-rate', 'days-left', 'age', 'time-after', 'pills', 'bmi', 'interest', 'card-installment', 'area', 'temperature'];
export const SIMPLE_ICON: Record<SimpleTool, string> = { calculator: '🧮', 'split-bill': '👥', 'exchange-rate': '💱', discount: '🏷️', 'days-left': '📅', 'card-installment': '💳', age: '🎂', 'time-after': '⏰', interest: '🏦', area: '📐', 'unit-price': '🛒', 'percent-change': '📈', pills: '💊', bmi: '⚖️', temperature: '🌡️' };
export const SIMPLE_DETAIL: Record<SimpleTool, string> = {
  calculator: 'calculator', 'split-bill': 'dutch-pay-calculator', 'exchange-rate': 'currency-converter',
  discount: 'discount-calculator', 'days-left': 'dday-counter', 'card-installment': 'card-installment-calculator',
  age: 'date-calculator', 'time-after': 'hours-calculator', interest: 'compound-interest-calculator', area: 'area-converter',
  'unit-price': 'unit-price-calculator', 'percent-change': 'percentage-calculator', pills: 'date-calculator', bmi: 'bmi-calculator', temperature: 'temperature-converter',
};
/** 자세한 계산기 주소. 한국어 예금 이자는 세금까지 다루는 예금 계산기로 보내요. */
export const simpleDetailHref = (locale: Locale, tool: SimpleTool) => (locale === 'ko' && tool === 'interest' ? '/ko/deposit-calculator/' : `/${locale}/${SIMPLE_DETAIL[tool]}/`);

export const simpleHref = (locale: Locale, tool?: SimpleTool) => `/${locale}/simple-calculators/${tool ? `${tool}/` : ''}`;

export interface SimpleToolCopy { name: string; short: string; title: string; description: string; help: string }
export interface SimpleUi {
  brand: string; hubTitle: string; hubDescription: string; hubLead: string; listen: string; stop: string; again: string; bigger: string; smaller: string;
  detail: string; home: string; allTools: string; install: string; installHow: string; howTitle: string; how: string[]; noSpeech: string; seniorNote: string;
  langName: string; speechLang: string;
}

export const SIMPLE_UI: Record<Locale, SimpleUi> = {
  ko: {
    brand: '간단계산기', hubTitle: '간단계산기 — 큰 글씨로 쉽게 쓰는 생활 계산기', hubDescription: '어르신도 쉽게 쓰는 큰 글씨 계산기 모음이에요. 기본 계산기, N분의 1, 할인, 환율, 며칠 남았나, 만 나이, 약 먹는 시간, 예금 이자, 카드 할부, 평수, 어느 게 더 싼가, 몇 % 올랐나, 약 며칠 치, 비만도, 화씨·섭씨를 숫자 두세 개만 넣어 바로 계산하고 소리로 들을 수 있어요.',
    hubLead: '숫자 두세 개만 넣으면 답을 크게 한 줄로 알려 드려요. 결과는 소리로도 들을 수 있어요.',
    listen: '소리로 듣기', stop: '그만 듣기', again: '처음부터', bigger: '글씨 크게', smaller: '글씨 보통', detail: '자세한 설정으로 계산하기', home: '간단계산기 처음으로', allTools: '다른 간단계산기',
    install: '휴대폰 첫 화면에 두기', installHow: '휴대폰 브라우저 메뉴(⋮ 또는 공유 버튼)에서 "홈 화면에 추가"를 누르면 앱처럼 바로 열 수 있어요.',
    howTitle: '이렇게 쓰세요', how: ['쓰고 싶은 계산기를 누르세요.', '큰 칸에 숫자를 넣으세요. 쉼표는 저절로 찍혀요.', '아래에 답이 크게 나와요. "소리로 듣기"를 누르면 읽어 드려요.'],
    noSpeech: '이 브라우저는 소리 읽기를 지원하지 않아요.', seniorNote: '글씨가 작으면 위의 "글씨 크게"를 누르세요. 화면 읽기 프로그램(톡백·보이스오버)으로도 쓸 수 있어요.',
    langName: '한국어', speechLang: 'ko-KR',
  },
  en: {
    brand: 'Simple Calculators', hubTitle: 'Simple Calculators — large-print everyday calculators', hubDescription: 'Large-print, easy calculators for seniors and low-vision users: a basic calculator, bill splitting, discounts, currency, days until a date, age, medicine times, savings interest, card installments, area, which is cheaper, percent change, pills left, BMI and temperature. Type two or three numbers, get one clear answer, and hear it read aloud.',
    hubLead: 'Type two or three numbers and get one big, clear answer. You can also hear the answer read aloud.',
    listen: 'Read aloud', stop: 'Stop', again: 'Start over', bigger: 'Bigger text', smaller: 'Normal text', detail: 'Open the detailed calculator', home: 'All simple calculators', allTools: 'More simple calculators',
    install: 'Put it on your home screen', installHow: 'In your phone’s browser menu (⋮ or the Share button), choose “Add to Home Screen” to open it like an app.',
    howTitle: 'How to use', how: ['Tap the calculator you need.', 'Type numbers in the big box. Commas appear by themselves.', 'The answer appears in large print below. Tap “Read aloud” to hear it.'],
    noSpeech: 'This browser cannot read text aloud.', seniorNote: 'If the text is small, tap “Bigger text” at the top. Works with screen readers (TalkBack, VoiceOver).',
    langName: 'English', speechLang: 'en-US',
  },
  ja: {
    brand: 'かんたん計算機', hubTitle: 'かんたん計算機 — 大きな文字で使える暮らしの計算', hubDescription: '高齢の方や目の不自由な方にも使いやすい、大きな文字の計算機です。電卓、割り勘、割引、為替、あと何日、満年齢、服薬時間、預金利息、カード分割払い、坪数、どちらが安いか、何％上がったか、薬は何日分、BMI、温度を、数字を2〜3個入れるだけで計算し、音声で聞けます。',
    hubLead: '数字を2〜3個入れると、答えを大きく1行でお知らせします。音声でも聞けます。',
    listen: '読み上げる', stop: '止める', again: '最初から', bigger: '文字を大きく', smaller: '文字を普通に', detail: '詳しい設定で計算する', home: 'かんたん計算機のトップへ', allTools: 'ほかのかんたん計算機',
    install: 'スマホのホーム画面に置く', installHow: 'ブラウザのメニュー（⋮ または共有ボタン）で「ホーム画面に追加」を選ぶと、アプリのようにすぐ開けます。',
    howTitle: '使い方', how: ['使いたい計算機を押します。', '大きな枠に数字を入れます。カンマは自動で入ります。', '下に答えが大きく出ます。「読み上げる」で音声で聞けます。'],
    noSpeech: 'このブラウザは読み上げに対応していません。', seniorNote: '文字が小さいときは上の「文字を大きく」を押してください。スクリーンリーダー（TalkBack・VoiceOver）でも使えます。',
    langName: '日本語', speechLang: 'ja-JP',
  },
  zh: {
    brand: '简单计算器', hubTitle: '简单计算器 — 大字体生活计算器', hubDescription: '为老年人和视力不好的用户设计的大字体计算器：基础计算器、AA分摊、折扣、汇率、还有几天、周岁、吃药时间、存款利息、信用卡分期、面积换算、哪个更便宜、涨了百分之几、药还够几天、BMI和温度换算。只需输入两三个数字，就能看到一句清楚的答案，还可以语音朗读。',
    hubLead: '输入两三个数字，答案用大字一句话显示，还能语音朗读。',
    listen: '朗读结果', stop: '停止', again: '重新开始', bigger: '字体放大', smaller: '字体正常', detail: '打开详细计算器', home: '回到简单计算器首页', allTools: '其他简单计算器',
    install: '放到手机主屏幕', installHow: '在手机浏览器菜单（⋮ 或分享按钮）中选择“添加到主屏幕”，就能像应用一样直接打开。',
    howTitle: '使用方法', how: ['点击需要的计算器。', '在大输入框里输入数字，会自动加上千位分隔符。', '答案会用大字显示在下方，点“朗读结果”即可听到。'],
    noSpeech: '此浏览器不支持语音朗读。', seniorNote: '字太小时，点上方的“字体放大”。也支持读屏软件（TalkBack、VoiceOver）。',
    langName: '中文', speechLang: 'zh-CN',
  },
  fr: {
    brand: 'Calculatrices simples', hubTitle: 'Calculatrices simples — en gros caractères pour le quotidien', hubDescription: 'Des calculatrices en gros caractères, faciles pour les seniors et les personnes malvoyantes : calculatrice, partage d’addition, remises, devises, jours restants, âge, prise de médicaments, intérêts d’épargne, paiement en plusieurs fois, surfaces, le moins cher, hausse en %, médicaments restants, IMC et température. Deux ou trois chiffres, une réponse claire, lue à voix haute.',
    hubLead: 'Entrez deux ou trois chiffres : la réponse s’affiche en grand, en une phrase, et peut être lue à voix haute.',
    listen: 'Écouter', stop: 'Arrêter', again: 'Recommencer', bigger: 'Texte plus grand', smaller: 'Texte normal', detail: 'Ouvrir le calculateur détaillé', home: 'Toutes les calculatrices simples', allTools: 'Autres calculatrices simples',
    install: 'Mettre sur l’écran d’accueil', installHow: 'Dans le menu du navigateur (⋮ ou bouton Partager), choisissez « Ajouter à l’écran d’accueil » pour l’ouvrir comme une application.',
    howTitle: 'Mode d’emploi', how: ['Touchez la calculatrice voulue.', 'Tapez les chiffres dans la grande case. Les séparateurs s’ajoutent seuls.', 'La réponse s’affiche en grand. Touchez « Écouter » pour l’entendre.'],
    noSpeech: 'Ce navigateur ne peut pas lire le texte à voix haute.', seniorNote: 'Si le texte est petit, touchez « Texte plus grand » en haut. Compatible avec les lecteurs d’écran (TalkBack, VoiceOver).',
    langName: 'Français', speechLang: 'fr-FR',
  },
  es: {
    brand: 'Calculadoras sencillas', hubTitle: 'Calculadoras sencillas — con letra grande para el día a día', hubDescription: 'Calculadoras con letra grande, fáciles para personas mayores y con baja visión: calculadora, dividir la cuenta, descuentos, divisas, días que faltan, edad, toma de medicamentos, intereses de ahorro, pago a plazos, superficies, qué sale más barato, subida en %, pastillas que quedan, IMC y temperatura. Dos o tres números, una respuesta clara y lectura en voz alta.',
    hubLead: 'Escribe dos o tres números y verás la respuesta en grande, en una frase. También puedes escucharla.',
    listen: 'Escuchar', stop: 'Parar', again: 'Empezar de nuevo', bigger: 'Letra más grande', smaller: 'Letra normal', detail: 'Abrir la calculadora detallada', home: 'Todas las calculadoras sencillas', allTools: 'Otras calculadoras sencillas',
    install: 'Ponerla en la pantalla de inicio', installHow: 'En el menú del navegador (⋮ o el botón Compartir), elige «Añadir a pantalla de inicio» para abrirla como una app.',
    howTitle: 'Cómo se usa', how: ['Toca la calculadora que necesitas.', 'Escribe los números en la casilla grande. Los separadores se ponen solos.', 'La respuesta aparece en grande abajo. Toca «Escuchar» para oírla.'],
    noSpeech: 'Este navegador no puede leer en voz alta.', seniorNote: 'Si la letra es pequeña, toca «Letra más grande» arriba. Funciona con lectores de pantalla (TalkBack, VoiceOver).',
    langName: 'Español', speechLang: 'es-ES',
  },
};

export const SIMPLE_COPY: Record<Locale, Record<SimpleTool, SimpleToolCopy>> = {
  ko: {
    calculator: { name: '계산기', short: '더하기·빼기·곱하기·나누기', title: '큰 글씨 계산기 — 어르신도 쉬운 간단계산기', description: '버튼이 크고 글씨가 큰 기본 계산기예요. 누른 순서대로 계산하고, 답을 소리로 읽어 줘요. 키보드로도 쓸 수 있어요.', help: '숫자와 기호를 차례로 누르고 = 을 누르세요.' },
    'split-bill': { name: 'N분의 1', short: '여럿이 똑같이 나누기', title: 'N분의 1 계산기 — 카드값 똑같이 나누기 (간단계산기)', description: '낸 돈과 사람 수만 넣으면 한 사람당 얼마씩 보내면 되는지 크게 알려 줘요. 남는 몇 원은 결제한 사람이 내도록 맞춰 줘요.', help: '모두 낸 돈과 사람 수를 넣으세요.' },
    'exchange-rate': { name: '환율', short: '외국 돈을 원으로', title: '쉬운 환율 계산기 — 달러·엔·유로를 원으로 (간단계산기)', description: '외국 돈 금액만 넣으면 우리 돈으로 얼마인지 크게 알려 줘요. 달러, 엔, 유로, 위안 등 자주 쓰는 돈을 골라요.', help: '돈 종류를 고르고 금액을 넣으세요.' },
    discount: { name: '할인', short: '몇 % 할인하면 얼마?', title: '할인 계산기 — 몇 % 할인이면 얼마? (간단계산기)', description: '원래 가격과 할인율만 넣으면 내야 할 돈과 아끼는 돈을 크게 알려 줘요.', help: '원래 가격을 넣고 할인율을 누르세요.' },
    'days-left': { name: '며칠 남았나', short: '그날까지 며칠?', title: '며칠 남았나 계산기 — 그날까지 남은 날 (간단계산기)', description: '날짜 하나만 고르면 오늘부터 며칠 남았는지, 며칠 지났는지 크게 알려 줘요. 생신, 병원 예약, 약속 날짜에 써요.', help: '날짜를 고르세요.' },
    'card-installment': { name: '카드 할부', short: '할부하면 한 달에 얼마?', title: '카드 할부 계산기 — 한 달에 얼마씩? (간단계산기)', description: '물건값과 할부 개월만 넣으면 한 달에 얼마씩 나가는지, 수수료가 모두 얼마인지 크게 알려 줘요.', help: '물건값을 넣고 몇 개월로 나눌지 고르세요.' },
    age: { name: '나이', short: '만 나이·띠·다음 생일', title: '만 나이 계산기 — 큰 글씨로 나이·띠 확인 (간단계산기)', description: '생년월일만 넣으면 오늘 기준 만 나이, 띠, 다음 생일까지 남은 날을 크게 알려 줘요. 2023년 6월부터 나이는 만 나이로 통일됐어요.', help: '태어난 날을 고르세요.' },
    'time-after': { name: '몇 시간 뒤', short: '약 먹을 시간 계산', title: '몇 시간 뒤 몇 시? — 약 먹는 시간 계산기 (간단계산기)', description: '지금부터 몇 시간 뒤가 몇 시인지 크게 알려 줘요. 8시간마다 약 먹기, 금식 시간, 찜질·충전 끝나는 시간에 써요.', help: '몇 시간 뒤인지 고르세요. 시작 시각은 지금으로 맞춰져 있어요.' },
    interest: { name: '예금 이자', short: '만기에 이자 얼마?', title: '예금 이자 계산기 — 세금 떼고 얼마? (간단계산기)', description: '맡길 돈, 연 이자율, 기간만 넣으면 만기에 받는 이자를 세금(15.4%) 떼고 크게 알려 줘요.', help: '맡길 돈과 이자율을 넣고 기간을 고르세요.' },
    area: { name: '평수', short: '평 ↔ 제곱미터', title: '평수 계산기 — 평을 제곱미터로, 제곱미터를 평으로 (간단계산기)', description: '아파트 84㎡가 몇 평인지, 34평이 몇 ㎡인지 크게 알려 줘요. 1평은 약 3.3058㎡예요.', help: '숫자를 넣고 어느 쪽으로 바꿀지 고르세요.' },
    'unit-price': { name: '어느 게 더 싼가', short: '큰 것 vs 작은 것', title: '어느 게 더 싼가? — 단위 가격 비교 계산기 (간단계산기)', description: '두 물건의 가격과 양(g, ml, 개)만 넣으면 어느 쪽이 더 싼지, 몇 % 싼지 크게 알려 줘요. 마트에서 큰 통과 작은 통을 비교할 때 써요.', help: '두 물건의 가격과 양을 넣으세요. 양은 같은 단위(g이면 둘 다 g)로 넣어요.' },
    'percent-change': { name: '몇 % 올랐나', short: '값이 얼마나 올랐나·내렸나', title: '몇 % 올랐나 계산기 — 가격 인상률 쉽게 (간단계산기)', description: '예전 값과 지금 값만 넣으면 몇 % 올랐는지(내렸는지), 얼마 더 내는지 크게 알려 줘요. 관리비, 장바구니 물가, 연금 인상에 써요.', help: '예전 값과 지금 값을 넣으세요.' },
    pills: { name: '약 며칠 치', short: '약이 언제 떨어지나', title: '약 며칠 치 남았나 — 약 떨어지는 날 계산기 (간단계산기)', description: '남은 약 개수와 하루에 먹는 개수만 넣으면 며칠 치가 남았는지, 언제 약을 새로 타야 하는지 크게 알려 줘요.', help: '남은 약 개수를 넣고 하루에 몇 개 먹는지 고르세요. 오늘 먹을 약도 포함해서 세요.' },
    bmi: { name: '비만도', short: '키·몸무게로 BMI', title: '비만도(BMI) 계산기 — 큰 글씨로 쉽게 (간단계산기)', description: '키와 몸무게만 넣으면 BMI와 대한비만학회 기준 판정(정상·비만 전단계 등), 정상 몸무게 범위를 크게 알려 줘요.', help: '키(cm)와 몸무게(kg)를 넣으세요.' },
    temperature: { name: '온도', short: '화씨 ↔ 섭씨', title: '화씨 섭씨 변환 — 쉬운 온도 계산기 (간단계산기)', description: '미국 일기예보나 외국 체온계의 화씨(℉)를 섭씨(℃)로, 섭씨를 화씨로 크게 바꿔 줘요.', help: '온도를 넣고 어느 쪽으로 바꿀지 고르세요.' },
  },
  en: {
    calculator: { name: 'Calculator', short: 'Add, subtract, multiply, divide', title: 'Large Print Calculator — Big Buttons, Read Aloud', description: 'A basic calculator with big buttons and large numbers. It works in the order you press, reads the answer aloud and works with a keyboard.', help: 'Press numbers and signs in order, then press =.' },
    'split-bill': { name: 'Split the bill', short: 'Share a bill equally', title: 'Split the Bill — Simple Large Print Calculator', description: 'Enter the bill and the number of people to see how much each person sends, in large print. Leftover cents go to the person who paid.', help: 'Enter the bill total and how many people.' },
    'exchange-rate': { name: 'Currency', short: 'Foreign money to dollars', title: 'Simple Currency Converter — Large Print', description: 'Enter an amount of foreign money and see what it is worth in your currency, in large print. Choose euros, pounds, yen and more.', help: 'Choose the currency and enter the amount.' },
    discount: { name: 'Discount', short: 'Price after % off', title: 'Discount Calculator — Price After % Off (Large Print)', description: 'Enter the price and the discount to see what you pay and how much you save, in large print.', help: 'Enter the price, then tap the discount.' },
    'days-left': { name: 'Days until', short: 'How many days left?', title: 'Days Until a Date — Simple Large Print Countdown', description: 'Pick one date to see how many days are left, or how many have passed, in large print. For birthdays, appointments and trips.', help: 'Pick a date.' },
    'card-installment': { name: 'Card installments', short: 'Monthly payment', title: 'Installment Payment Calculator — Monthly Amount (Large Print)', description: 'Enter the price and the number of months to see the monthly payment and total interest, in large print.', help: 'Enter the price and choose the months.' },
    age: { name: 'Age', short: 'Exact age and next birthday', title: 'Age Calculator — Exact Age in Large Print', description: 'Enter a date of birth to see the exact age today and how many days until the next birthday, in large print.', help: 'Pick the date of birth.' },
    'time-after': { name: 'Hours from now', short: 'When is the next dose?', title: 'What Time Will It Be in X Hours? — Medicine Timer (Large Print)', description: 'See what time it will be a number of hours from now, in large print. For medicine every 8 hours, fasting or anything with a timer.', help: 'Choose how many hours. The start time is set to now.' },
    interest: { name: 'Savings interest', short: 'Interest at maturity', title: 'Savings Interest Calculator — Simple, Large Print', description: 'Enter the deposit, interest rate and term to see the interest you earn at maturity, in large print (before tax).', help: 'Enter the deposit and rate, then choose the term.' },
    area: { name: 'Area', short: 'Square feet ↔ square meters', title: 'Square Feet to Square Meters — Simple Area Converter', description: 'Convert square feet, square meters and acres in large print.', help: 'Type the number and choose the conversion.' },
    'unit-price': { name: 'Which is cheaper?', short: 'Compare unit prices', title: 'Which Is Cheaper? — Unit Price Comparison (Large Print)', description: 'Enter the price and size (oz, g, count) of two items to see which one is cheaper and by how much, in large print. Handy at the grocery store.', help: 'Enter the price and size of both items. Use the same unit for both sizes.' },
    'percent-change': { name: 'Percent change', short: 'How much did it go up?', title: 'Percent Change Calculator — Price Increase in Large Print', description: 'Enter the old and new amounts to see the percent increase or decrease and the difference, in large print. For bills, groceries and benefits.', help: 'Enter the old amount and the new amount.' },
    pills: { name: 'Pills left', short: 'When will my pills run out?', title: 'How Many Days of Pills Are Left? — Refill Date Calculator', description: 'Enter how many pills you have and how many you take a day to see how many days they last and when to refill, in large print.', help: 'Enter how many pills are left and choose how many you take a day. Count today’s pills too.' },
    bmi: { name: 'BMI', short: 'Body mass index', title: 'BMI Calculator — Large Print, Feet and Pounds', description: 'Enter height and weight to see your BMI, the WHO category and the healthy weight range, in large print. Works with feet and pounds or cm and kg.', help: 'Enter your height and weight.' },
    temperature: { name: 'Temperature', short: '°F ↔ °C', title: 'Fahrenheit to Celsius — Simple Temperature Converter', description: 'Convert Fahrenheit to Celsius and back in large print. Handy for travel, recipes and thermometers.', help: 'Type the temperature and choose the direction.' },
  },
  ja: {
    calculator: { name: '電卓', short: '足し算・引き算・掛け算・割り算', title: '大きい文字の電卓 — 読み上げ付き（かんたん計算機）', description: 'ボタンも数字も大きい電卓です。押した順に計算し、答えを読み上げます。キーボードでも使えます。', help: '数字と記号を順に押して、= を押します。' },
    'split-bill': { name: '割り勘', short: 'みんなで同じ額に分ける', title: '割り勘計算 — かんたん計算機（大きい文字）', description: '支払った金額と人数を入れるだけで、1人いくら送ればよいかを大きく表示します。端数は支払った人が負担します。', help: '合計金額と人数を入れてください。' },
    'exchange-rate': { name: '為替', short: '外国のお金を円に', title: 'かんたん為替計算 — ドル・ユーロ・ウォンを円に', description: '外国のお金の金額を入れると、円でいくらかを大きく表示します。ドル、ユーロ、ウォンなどから選べます。', help: '通貨を選び、金額を入れてください。' },
    discount: { name: '割引', short: '何％引きでいくら？', title: '割引計算 — 何％引きでいくら？（かんたん計算機）', description: '元の値段と割引率を入れると、支払う金額と安くなる金額を大きく表示します。', help: '元の値段を入れ、割引率を押してください。' },
    'days-left': { name: 'あと何日', short: 'その日まで何日？', title: 'あと何日 — 日数計算（かんたん計算機）', description: '日付を1つ選ぶだけで、今日からあと何日か、何日たったかを大きく表示します。誕生日や通院の予定に。', help: '日付を選んでください。' },
    'card-installment': { name: 'カード分割払い', short: '毎月いくら？', title: 'カード分割払い計算 — 毎月いくら？（かんたん計算機）', description: '値段と支払回数を入れると、毎月の支払額と手数料の合計を大きく表示します。', help: '値段を入れ、支払回数を選んでください。' },
    age: { name: '年齢', short: '満年齢・干支・次の誕生日', title: '満年齢計算 — 大きい文字で年齢と干支（かんたん計算機）', description: '生年月日を入れるだけで、今日の満年齢、干支、次の誕生日まであと何日かを大きく表示します。', help: '生年月日を選んでください。' },
    'time-after': { name: '何時間後', short: '薬を飲む時間', title: '何時間後は何時？ — 服薬時間の計算（かんたん計算機）', description: '今から何時間後が何時かを大きく表示します。8時間ごとの服薬や絶食時間に。', help: '何時間後かを選んでください。開始時刻は今に合わせてあります。' },
    interest: { name: '預金利息', short: '満期の利息はいくら？', title: '定期預金の利息計算 — 税引後いくら？（かんたん計算機）', description: '預ける金額、年利、期間を入れると、満期に受け取る利息を税引後(20.315%)で大きく表示します。', help: '金額と年利を入れ、期間を選んでください。' },
    area: { name: '坪数', short: '坪 ↔ 平方メートル', title: '坪数計算 — 坪と㎡を変換（かんたん計算機）', description: '何坪が何㎡か、何㎡が何坪かを大きく表示します。1坪は約3.3058㎡です。', help: '数字を入れ、変換の向きを選んでください。' },
    'unit-price': { name: 'どっちが安い', short: '大きい方と小さい方', title: 'どっちが安い？ — 単価比較の計算（かんたん計算機）', description: '2つの商品の値段と量（g・ml・個）を入れると、どちらが安いか、何％安いかを大きく表示します。スーパーでの比較に。', help: '2つの商品の値段と量を入れてください。量は同じ単位でそろえます。' },
    'percent-change': { name: '何％上がった', short: '値上がり・値下がり', title: '何％上がった？ — 値上げ率の計算（かんたん計算機）', description: '前の金額と今の金額を入れると、何％上がったか（下がったか）、いくら増えたかを大きく表示します。', help: '前の金額と今の金額を入れてください。' },
    pills: { name: '薬は何日分', short: '薬がなくなる日', title: '薬は何日分？ — 薬がなくなる日の計算（かんたん計算機）', description: '残っている薬の数と1日に飲む数を入れると、何日分あるか、いつ受け取りに行けばよいかを大きく表示します。', help: '残りの数を入れ、1日に何錠飲むかを選んでください。今日の分も含めて数えます。' },
    bmi: { name: 'BMI', short: '身長と体重で肥満度', title: 'BMI計算 — 大きい文字で肥満度（かんたん計算機）', description: '身長と体重を入れると、BMIと日本肥満学会の判定、普通体重の範囲を大きく表示します。', help: '身長（cm）と体重（kg）を入れてください。' },
    temperature: { name: '温度', short: '華氏 ↔ 摂氏', title: '華氏・摂氏の変換 — かんたん温度計算', description: '海外の天気予報や体温計の華氏（℉）を摂氏（℃）に、摂氏を華氏に大きく変換します。', help: '温度を入れ、変換の向きを選んでください。' },
  },
  zh: {
    calculator: { name: '计算器', short: '加减乘除', title: '大字体计算器 — 大按键、可语音朗读', description: '按键大、数字大的基础计算器，按顺序计算，可朗读答案，也能用键盘操作。', help: '依次按数字和符号，再按 =。' },
    'split-bill': { name: 'AA分摊', short: '大家平均分', title: 'AA分摊计算 — 简单计算器（大字体）', description: '输入总金额和人数，大字显示每人应转多少钱，零头由付款人承担。', help: '输入总金额和人数。' },
    'exchange-rate': { name: '汇率', short: '外币换人民币', title: '简单汇率换算 — 美元、日元、欧元换人民币', description: '输入外币金额，大字显示折合多少人民币，可选择美元、欧元、日元、韩元等。', help: '选择币种并输入金额。' },
    discount: { name: '折扣', short: '打几折是多少？', title: '折扣计算 — 优惠后多少钱（简单计算器）', description: '输入原价和折扣比例，大字显示应付金额和省下的钱。', help: '输入原价，再点折扣比例。' },
    'days-left': { name: '还有几天', short: '离那天还有几天？', title: '还有几天 — 倒数日计算（简单计算器）', description: '选一个日期，大字显示从今天起还有几天或已过几天，适合生日、看病预约等。', help: '请选择日期。' },
    'card-installment': { name: '信用卡分期', short: '每月还多少？', title: '信用卡分期计算 — 每月还多少（简单计算器）', description: '输入金额和期数，大字显示每月还款额和手续费合计。', help: '输入金额并选择期数。' },
    age: { name: '年龄', short: '周岁、生肖、下次生日', title: '周岁计算 — 大字体看年龄和生肖（简单计算器）', description: '输入出生日期，大字显示今天的周岁、生肖和距离下次生日还有几天。', help: '请选择出生日期。' },
    'time-after': { name: '几小时后', short: '吃药时间', title: '几小时后是几点？— 吃药时间计算（简单计算器）', description: '大字显示从现在起几小时后是几点，适合每8小时吃药、空腹时间等。', help: '选择几小时后，开始时间已设为现在。' },
    interest: { name: '存款利息', short: '到期利息多少？', title: '定期存款利息计算 — 简单计算器（大字体）', description: '输入存款金额、年利率和期限，大字显示到期利息（目前存款利息免个税）。', help: '输入金额和利率，再选择期限。' },
    area: { name: '面积', short: '平方米 ↔ 平方英尺', title: '面积换算 — 平方米和平方英尺（简单计算器）', description: '大字换算平方米、平方英尺和英亩。', help: '输入数字并选择换算方向。' },
    'unit-price': { name: '哪个更便宜', short: '比较单价', title: '哪个更便宜？— 单价比较（简单计算器）', description: '输入两件商品的价格和数量（克、毫升、个），大字显示哪个更便宜、便宜百分之几。超市比较大小包装时用。', help: '输入两件商品的价格和数量，数量用同一单位。' },
    'percent-change': { name: '涨了百分之几', short: '涨价、降价幅度', title: '涨了百分之几？— 涨幅计算（简单计算器）', description: '输入原来的金额和现在的金额，大字显示涨了（降了）百分之几、多付多少钱。', help: '输入原来的金额和现在的金额。' },
    pills: { name: '药还够几天', short: '药什么时候吃完', title: '药还够几天？— 吃完日期计算（简单计算器）', description: '输入剩下的药片数和每天吃几片，大字显示还够几天、什么时候该去配药。', help: '输入剩余片数，选择每天吃几片。今天要吃的也算在内。' },
    bmi: { name: 'BMI', short: '身高体重算胖瘦', title: 'BMI计算 — 大字体看胖瘦（简单计算器）', description: '输入身高和体重，大字显示BMI、中国成人标准判定和正常体重范围。', help: '输入身高（厘米）和体重（公斤）。' },
    temperature: { name: '温度', short: '华氏 ↔ 摄氏', title: '华氏摄氏换算 — 简单温度计算器', description: '把国外天气预报或体温计的华氏度（℉）换成摄氏度（℃），也可以反过来，大字显示。', help: '输入温度并选择换算方向。' },
  },
  fr: {
    calculator: { name: 'Calculatrice', short: 'Additions, soustractions…', title: 'Calculatrice en gros caractères — grosses touches, lecture à voix haute', description: 'Une calculatrice avec de grosses touches et de grands chiffres. Elle calcule dans l’ordre des touches, lit le résultat à voix haute et fonctionne au clavier.', help: 'Tapez les chiffres et les signes dans l’ordre, puis =.' },
    'split-bill': { name: 'Partager l’addition', short: 'Diviser à parts égales', title: 'Partager l’addition — calculatrice simple en gros caractères', description: 'Entrez le montant et le nombre de personnes pour voir, en grand, combien chacun doit envoyer. Les centimes restants sont pour celui qui a payé.', help: 'Entrez le total et le nombre de personnes.' },
    'exchange-rate': { name: 'Devises', short: 'Convertir en euros', title: 'Convertisseur de devises simple — gros caractères', description: 'Entrez un montant en devise étrangère et voyez, en grand, sa valeur en euros. Dollars, livres, yens et plus.', help: 'Choisissez la devise et entrez le montant.' },
    discount: { name: 'Remise', short: 'Prix après réduction', title: 'Calcul de remise — prix après réduction (gros caractères)', description: 'Entrez le prix et le pourcentage de remise pour voir, en grand, ce que vous payez et économisez.', help: 'Entrez le prix, puis touchez la remise.' },
    'days-left': { name: 'Jours restants', short: 'Combien de jours avant ?', title: 'Combien de jours avant une date — compte à rebours simple', description: 'Choisissez une date pour voir, en grand, combien de jours il reste ou sont passés. Anniversaires, rendez-vous, voyages.', help: 'Choisissez une date.' },
    'card-installment': { name: 'Paiement en plusieurs fois', short: 'Combien par mois ?', title: 'Paiement en plusieurs fois — combien par mois ? (gros caractères)', description: 'Entrez le prix et le nombre de mois pour voir, en grand, la mensualité et le total des frais.', help: 'Entrez le prix et choisissez le nombre de mois.' },
    age: { name: 'Âge', short: 'Âge exact et prochain anniversaire', title: 'Calcul de l’âge — en gros caractères', description: 'Entrez la date de naissance pour voir, en grand, l’âge exact aujourd’hui et les jours avant le prochain anniversaire.', help: 'Choisissez la date de naissance.' },
    'time-after': { name: 'Dans combien d’heures', short: 'Heure de la prochaine prise', title: 'Quelle heure sera-t-il dans X heures ? — prise de médicaments', description: 'Voyez en grand l’heure qu’il sera dans quelques heures : médicaments toutes les 8 heures, jeûne, minuterie.', help: 'Choisissez le nombre d’heures. L’heure de départ est maintenant.' },
    interest: { name: 'Intérêts d’épargne', short: 'Intérêts à l’échéance', title: 'Calcul des intérêts d’un placement — simple, gros caractères', description: 'Entrez le montant, le taux et la durée pour voir, en grand, les intérêts à l’échéance (avant impôts).', help: 'Entrez le montant et le taux, puis la durée.' },
    area: { name: 'Surface', short: 'm² ↔ pieds carrés', title: 'Convertir une surface — m², pieds carrés, acres', description: 'Convertissez mètres carrés, pieds carrés et acres en gros caractères.', help: 'Tapez le nombre et choisissez la conversion.' },
    'unit-price': { name: 'Le moins cher', short: 'Comparer le prix au kilo', title: 'Lequel est le moins cher ? — comparer le prix unitaire', description: 'Entrez le prix et la quantité (g, ml, pièces) de deux produits pour voir, en grand, lequel est le moins cher et de combien.', help: 'Entrez le prix et la quantité des deux produits, dans la même unité.' },
    'percent-change': { name: 'Hausse en %', short: 'De combien ça a augmenté ?', title: 'Calcul d’une hausse en pourcentage — gros caractères', description: 'Entrez l’ancien et le nouveau montant pour voir, en grand, la hausse ou la baisse en % et la différence.', help: 'Entrez l’ancien montant et le nouveau.' },
    pills: { name: 'Médicaments restants', short: 'Quand renouveler ?', title: 'Combien de jours de médicaments reste-t-il ? — date de renouvellement', description: 'Entrez le nombre de comprimés restants et la prise par jour pour voir, en grand, combien de jours il reste et quand renouveler.', help: 'Entrez les comprimés restants et choisissez la prise par jour. Comptez ceux d’aujourd’hui.' },
    bmi: { name: 'IMC', short: 'Indice de masse corporelle', title: 'Calcul de l’IMC — en gros caractères', description: 'Entrez la taille et le poids pour voir, en grand, l’IMC, la catégorie de l’OMS et la plage de poids normal.', help: 'Entrez la taille (cm) et le poids (kg).' },
    temperature: { name: 'Température', short: '°F ↔ °C', title: 'Convertir Fahrenheit en Celsius — simple', description: 'Convertissez les degrés Fahrenheit en Celsius et inversement, en gros caractères.', help: 'Tapez la température et choisissez le sens.' },
  },
  es: {
    calculator: { name: 'Calculadora', short: 'Sumar, restar, multiplicar…', title: 'Calculadora de letra grande — botones grandes y voz', description: 'Una calculadora con botones y números grandes. Calcula en el orden en que pulsas, lee el resultado en voz alta y funciona con teclado.', help: 'Pulsa números y signos en orden y después =.' },
    'split-bill': { name: 'Dividir la cuenta', short: 'Pagar a partes iguales', title: 'Dividir la cuenta — calculadora sencilla de letra grande', description: 'Escribe el total y el número de personas para ver, en grande, cuánto envía cada uno. Los céntimos sobrantes los pone quien pagó.', help: 'Escribe el total y cuántas personas sois.' },
    'exchange-rate': { name: 'Divisas', short: 'Pasar a euros', title: 'Conversor de divisas sencillo — letra grande', description: 'Escribe una cantidad en moneda extranjera y verás, en grande, cuánto es en euros. Dólares, libras, yenes y más.', help: 'Elige la moneda y escribe la cantidad.' },
    discount: { name: 'Descuento', short: 'Precio con % de descuento', title: 'Calcular descuento — precio final (letra grande)', description: 'Escribe el precio y el descuento para ver, en grande, lo que pagas y lo que ahorras.', help: 'Escribe el precio y toca el descuento.' },
    'days-left': { name: 'Días que faltan', short: '¿Cuántos días faltan?', title: 'Cuántos días faltan para una fecha — cuenta atrás sencilla', description: 'Elige una fecha para ver, en grande, cuántos días faltan o cuántos han pasado. Cumpleaños, citas médicas y viajes.', help: 'Elige una fecha.' },
    'card-installment': { name: 'Pago a plazos', short: '¿Cuánto al mes?', title: 'Pago a plazos con tarjeta — cuánto al mes (letra grande)', description: 'Escribe el precio y el número de meses para ver, en grande, la cuota mensual y el total de intereses.', help: 'Escribe el precio y elige los meses.' },
    age: { name: 'Edad', short: 'Edad exacta y próximo cumpleaños', title: 'Calcular la edad — con letra grande', description: 'Escribe la fecha de nacimiento para ver, en grande, la edad exacta hoy y los días que faltan para el próximo cumpleaños.', help: 'Elige la fecha de nacimiento.' },
    'time-after': { name: 'Dentro de X horas', short: 'Hora de la próxima toma', title: '¿Qué hora será dentro de X horas? — toma de medicamentos', description: 'Mira en grande qué hora será dentro de unas horas: medicinas cada 8 horas, ayuno o temporizadores.', help: 'Elige cuántas horas. La hora de inicio es ahora.' },
    interest: { name: 'Intereses de ahorro', short: 'Intereses al vencimiento', title: 'Calculadora de intereses de un depósito — sencilla', description: 'Escribe el importe, el tipo y el plazo para ver, en grande, los intereses al vencimiento (antes de impuestos).', help: 'Escribe el importe y el tipo, y elige el plazo.' },
    area: { name: 'Superficie', short: 'm² ↔ pies cuadrados', title: 'Convertir superficie — m², pies cuadrados y acres', description: 'Convierte metros cuadrados, pies cuadrados y acres con letra grande.', help: 'Escribe el número y elige la conversión.' },
    'unit-price': { name: '¿Cuál es más barato?', short: 'Comparar precio por unidad', title: '¿Cuál sale más barato? — comparar precio por unidad', description: 'Escribe el precio y la cantidad (g, ml, unidades) de dos productos para ver, en grande, cuál es más barato y cuánto.', help: 'Escribe el precio y la cantidad de los dos productos, en la misma unidad.' },
    'percent-change': { name: 'Subida en %', short: '¿Cuánto ha subido?', title: 'Calcular subida en porcentaje — letra grande', description: 'Escribe el importe anterior y el actual para ver, en grande, cuánto ha subido o bajado en % y la diferencia.', help: 'Escribe el importe anterior y el actual.' },
    pills: { name: 'Pastillas que quedan', short: '¿Cuándo se acaban?', title: '¿Para cuántos días quedan pastillas? — fecha de reponer', description: 'Escribe cuántas pastillas quedan y cuántas tomas al día para ver, en grande, para cuántos días llegan y cuándo reponer.', help: 'Escribe las pastillas que quedan y elige cuántas tomas al día. Cuenta las de hoy.' },
    bmi: { name: 'IMC', short: 'Índice de masa corporal', title: 'Calcular el IMC — con letra grande', description: 'Escribe la altura y el peso para ver, en grande, el IMC, la categoría de la OMS y el rango de peso normal.', help: 'Escribe la altura (cm) y el peso (kg).' },
    temperature: { name: 'Temperatura', short: '°F ↔ °C', title: 'Pasar Fahrenheit a Celsius — sencillo', description: 'Convierte grados Fahrenheit a Celsius y al revés, con letra grande.', help: 'Escribe la temperatura y elige el sentido.' },
  },
};
