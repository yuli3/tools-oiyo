// Generated 2026-10-27 (W7) from the Blog date, time and everyday calculator pages. Copy that Blog
// only had in ko/en/ja (and none for world-clock and dutch-pay) was written for Tools with the same facts.
import type { Locale } from '../lib/i18n';
import type { UtilityContent } from '../components/UtilityArticle.astro';
export interface W7Page { title: string; description: string; c: UtilityContent }
export const w7TimeSlugs = ["date-calculator", "dday-counter", "hours-calculator", "world-clock", "timer", "pomodoro", "metronome"] as const;
export const w7Slugs = ["date-calculator", "dday-counter", "hours-calculator", "world-clock", "timer", "pomodoro", "metronome", "percentage-calculator", "ratio-calculator", "discount-calculator", "tip-calculator", "dutch-pay-calculator", "unit-price-calculator", "travel-budget-calculator", "fuel-cost-calculator", "fuel-efficiency-calculator", "calculator", "word-counter"] as const;
export type W7Slug = (typeof w7Slugs)[number];
export const w7Pages: Record<W7Slug, Record<Locale, W7Page>> = {
 "date-calculator": {
  "ko": {
   "title": "날짜 계산기 — 날짜 간격·며칠 후/전 계산",
   "description": "두 날짜 사이의 일수를 구하거나, 기준 날짜에서 일·주·개월·년을 더하고 빼서 결과 날짜와 요일을 계산합니다.",
   "c": {
    "introTitle": "날짜 계산기란?",
    "intro": "두 날짜 사이가 며칠인지 세거나, 어떤 날짜로부터 며칠·몇 주·몇 개월·몇 년 후(또는 전)가 언제인지 계산해요. 마감일, D-day 환산, 90일 후 날짜 같은 계산을 빠르게 처리해요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "두 가지 모드",
      "body": "날짜 간격 계산과 날짜 더하기/빼기를 한 도구에서."
     },
     {
      "title": "요일 표시",
      "body": "결과 날짜의 요일을 함께 보여줍니다."
     },
     {
      "title": "월·년 단위 지원",
      "body": "일·주뿐 아니라 개월·년 단위 가감도 정확히 처리합니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "'날짜 간격' 또는 '더하기/빼기' 모드를 고릅니다.",
     "간격은 시작·종료 날짜를, 더하기/빼기는 기준 날짜와 수량·단위를 입력합니다.",
     "결과 일수 또는 결과 날짜(요일 포함)를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "종료일이 시작일보다 빠르면요?",
      "answer": "간격은 절대값(일수)으로 표시되므로 순서가 바뀌어도 같은 일수가 나옵니다."
     },
     {
      "question": "개월을 더하면 말일 처리는 어떻게 되나요?",
      "answer": "달력 규칙을 따릅니다. 예를 들어 1월 31일에 1개월을 더하면 2월 말일로 보정됩니다(브라우저 표준 동작)."
     },
     {
      "question": "'90일 후' 같은 계산도 되나요?",
      "answer": "네. 더하기/빼기 모드에서 기준 날짜에 90일을 더하면 결과 날짜와 요일이 나옵니다."
     }
    ],
    "disclaimer": "결과는 그레고리력 기준 계산값이에요. 윤년·월말 등 경계는 일반 달력 규칙을 따라요."
   }
  },
  "en": {
   "title": "Date Calculator — Days Between & Add/Subtract Dates",
   "description": "Find the number of days between two dates, or add and subtract days, weeks, months, or years from a date to get the resulting date and weekday.",
   "c": {
    "introTitle": "What is the date calculator?",
    "intro": "Count the days between two dates, or find what date falls a number of days, weeks, months, or years after (or before) a starting date. Handy for deadlines, '90 days from today', and D-day style counting.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Two modes",
      "body": "Days-between and date add/subtract in one tool."
     },
     {
      "title": "Shows weekday",
      "body": "Displays the weekday of the resulting date."
     },
     {
      "title": "Months & years",
      "body": "Adds or subtracts months and years, not just days and weeks."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Pick 'Days between' or 'Add / subtract' mode.",
     "For days between, enter start and end dates; for add/subtract, enter a base date plus amount and unit.",
     "Read the total days or the resulting date with its weekday."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "What if the end date is before the start?",
      "answer": "The difference is shown as an absolute number of days, so the order doesn't change the result."
     },
     {
      "question": "How are month-ends handled when adding months?",
      "answer": "It follows calendar rules. Adding one month to Jan 31 lands on the end of February (standard browser behavior)."
     },
     {
      "question": "Can it do '90 days from today'?",
      "answer": "Yes. In add/subtract mode, add 90 days to your base date to get the resulting date and weekday."
     }
    ],
    "disclaimer": "Results use the Gregorian calendar. Leap years and month ends follow standard calendar rules."
   }
  },
  "ja": {
   "title": "日付計算機 — 日数の差・◯日後/前を計算",
   "description": "2つの日付の間の日数を求めたり、基準日に日・週・月・年を加減して結果の日付と曜日を計算します。",
   "c": {
    "introTitle": "日付計算機とは？",
    "intro": "2つの日付の間の日数を数えたり、ある日付から日・週・月・年だけ後(または前)がいつかを計算します。締切や「90日後」、D-day換算などに便利です。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "2つのモード",
      "body": "日数の差と日付の加減を1つのツールで。"
     },
     {
      "title": "曜日を表示",
      "body": "結果の日付の曜日も表示します。"
     },
     {
      "title": "月・年に対応",
      "body": "日・週だけでなく月・年の加減も正確に処理します。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "「日数の差」または「加算/減算」モードを選びます。",
     "差は開始・終了日を、加減は基準日と数量・単位を入力します。",
     "合計日数または結果の日付(曜日付き)を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "終了日が開始日より前なら？",
      "answer": "差は絶対値(日数)で表示されるため、順序が逆でも同じ日数になります。"
     },
     {
      "question": "月を加えると月末はどう処理されますか？",
      "answer": "暦の規則に従います。1月31日に1ヶ月加えると2月末日に補正されます(ブラウザ標準動作)。"
     },
     {
      "question": "「90日後」のような計算もできますか？",
      "answer": "はい。加算/減算モードで基準日に90日を加えると結果の日付と曜日が出ます。"
     }
    ],
    "disclaimer": "結果はグレゴリオ暦に基づく計算値です。閏年・月末などの境界は一般的な暦の規則に従います。"
   }
  },
  "zh": {
   "title": "日期计算器 — 日期间隔与加减日期",
   "description": "计算两个日期之间的天数，或在某日期上加减天、周、月、年，得出结果日期和星期。",
   "c": {
    "introTitle": "什么是日期计算器？",
    "intro": "计算两个日期之间相差多少天，或求出某个日期之后（或之前）若干天、周、月、年是哪一天。适合计算截止日期、“今天起90天后”以及倒数日。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "两种模式",
      "body": "日期间隔和日期加减集于一个工具。"
     },
     {
      "title": "显示星期",
      "body": "显示结果日期是星期几。"
     },
     {
      "title": "支持月和年",
      "body": "不仅能加减天和周，也能加减月和年。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "选择“日期间隔”或“加减日期”模式。",
     "间隔模式输入开始和结束日期；加减模式输入基准日期、数量和单位。",
     "查看总天数，或结果日期及其星期。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "结束日期早于开始日期怎么办？",
      "answer": "差值以天数的绝对值显示，先后顺序不影响结果。"
     },
     {
      "question": "加月份时月末怎么处理？",
      "answer": "按日历规则处理。1月31日加一个月会落在2月月末（浏览器标准行为）。"
     },
     {
      "question": "能算“今天起90天后”吗？",
      "answer": "可以。在加减模式中给基准日期加90天，即可得到结果日期和星期。"
     }
    ],
    "disclaimer": "结果按公历计算，闰年和月末遵循标准日历规则。"
   }
  },
  "fr": {
   "title": "Calculateur de dates — Jours entre & ajouter/soustraire",
   "description": "Trouvez le nombre de jours entre deux dates, ou ajoutez et soustrayez des jours, semaines, mois ou années à une date.",
   "c": {
    "introTitle": "Qu’est-ce que le calculateur de dates ?",
    "intro": "Comptez les jours entre deux dates, ou trouvez la date qui tombe un certain nombre de jours, semaines, mois ou années après (ou avant) une date de départ. Pratique pour les échéances, « dans 90 jours » et les comptes à rebours.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Deux modes",
      "body": "Écart entre dates et ajout/retrait dans un seul outil."
     },
     {
      "title": "Jour de la semaine",
      "body": "Affiche le jour de la semaine de la date obtenue."
     },
     {
      "title": "Mois et années",
      "body": "Ajoute ou retire des mois et des années, pas seulement des jours et des semaines."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Choisissez le mode « Écart » ou « Ajouter / retirer ».",
     "Pour l’écart, saisissez les dates de début et de fin ; pour ajouter/retirer, une date de base, une quantité et une unité.",
     "Lisez le nombre total de jours ou la date obtenue avec son jour de la semaine."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Et si la date de fin est avant le début ?",
      "answer": "L’écart est affiché en valeur absolue : l’ordre ne change pas le résultat."
     },
     {
      "question": "Comment sont gérées les fins de mois ?",
      "answer": "Selon les règles du calendrier : un mois après le 31 janvier tombe à la fin février (comportement standard du navigateur)."
     },
     {
      "question": "Peut-on calculer « dans 90 jours » ?",
      "answer": "Oui. En mode ajouter/retirer, ajoutez 90 jours à la date de base pour obtenir la date et le jour."
     }
    ],
    "disclaimer": "Résultats selon le calendrier grégorien. Années bissextiles et fins de mois suivent les règles standard."
   }
  },
  "es": {
   "title": "Calculadora de fechas — Días entre y sumar/restar",
   "description": "Calcula los días entre dos fechas, o suma y resta días, semanas, meses o años a una fecha para obtener la fecha resultante.",
   "c": {
    "introTitle": "¿Qué es la calculadora de fechas?",
    "intro": "Cuenta los días entre dos fechas o averigua qué fecha cae cierto número de días, semanas, meses o años después (o antes) de una fecha inicial. Útil para plazos, «dentro de 90 días» y cuentas regresivas.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Dos modos",
      "body": "Diferencia entre fechas y sumar/restar en una sola herramienta."
     },
     {
      "title": "Día de la semana",
      "body": "Muestra el día de la semana de la fecha resultante."
     },
     {
      "title": "Meses y años",
      "body": "Suma o resta meses y años, no solo días y semanas."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Elige el modo «Diferencia» o «Sumar / restar».",
     "Para la diferencia, introduce las fechas de inicio y fin; para sumar/restar, una fecha base, una cantidad y una unidad.",
     "Consulta el total de días o la fecha resultante con su día de la semana."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Y si la fecha final es anterior a la inicial?",
      "answer": "La diferencia se muestra en valor absoluto, así que el orden no cambia el resultado."
     },
     {
      "question": "¿Cómo se manejan los fines de mes?",
      "answer": "Según las reglas del calendario: un mes después del 31 de enero cae a fin de febrero (comportamiento estándar del navegador)."
     },
     {
      "question": "¿Puede calcular «dentro de 90 días»?",
      "answer": "Sí. En el modo sumar/restar, suma 90 días a la fecha base para obtener la fecha y su día."
     }
    ],
    "disclaimer": "Resultados según el calendario gregoriano. Los años bisiestos y fines de mes siguen las reglas estándar."
   }
  }
 },
 "dday-counter": {
  "ko": {
   "title": "디데이 카운터 — D-Day 계산기, 시험·기념일",
   "description": "생일, 시험, 기념일 등 중요한 날을 D-Day로 등록하고 남은 날수를 실시간으로 확인하세요. 7일 이내는 초 단위 카운트다운 제공.",
   "c": {
    "introTitle": "D-Day는 중요한 날짜를 남은 시간과 지난 시간으로 나누어 관리하는 방식입니다",
    "intro": "이 카운터는 시험, 생일, 여행, 기념일처럼 기억해야 할 날짜를 등록하고 오늘 기준 D-일수 또는 D+일수로 정렬해요. 7일 이내의 미래 이벤트는 초 단위 카운트다운을 함께 보여주어 가까운 일정의 긴박감을 바로 확인할 수 있어요.",
    "formulaTitle": "계산 기준",
    "formulas": [
     {
      "title": "D-일수",
      "body": "목표일이 미래이면 목표일-오늘 날짜를 D-n으로 표시합니다."
     },
     {
      "title": "D-Day",
      "body": "목표일과 오늘이 같으면 D-Day로 표시합니다."
     },
     {
      "title": "D+일수",
      "body": "목표일이 지났으면 오늘-목표일을 D+n으로 표시합니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "이벤트 이름과 목표 날짜를 입력합니다.",
     "최대 10개까지 등록해 가까운 미래 일정부터 확인합니다.",
     "완료했거나 더 이상 필요 없는 이벤트는 삭제합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "등록한 일정은 어디에 저장되나요?",
      "answer": "브라우저의 localStorage에 저장되므로 같은 브라우저에서는 다시 열어도 유지됩니다."
     },
     {
      "question": "다른 기기와 동기화되나요?",
      "answer": "아니요. 이 도구는 계정 기반 동기화를 하지 않으며 기기와 브라우저별로 저장됩니다."
     },
     {
      "question": "7일 이내만 초 단위 카운트다운이 보이는 이유는 무엇인가요?",
      "answer": "가까운 일정에만 실시간 초 단위 표시를 제공해 화면 부담을 줄이고 중요한 이벤트를 강조하기 위해서입니다."
     }
    ],
    "disclaimer": "이 도구는 개인 일정 관리를 돕는 일반 계산기이며 공식 마감일은 해당 기관의 공지를 확인하세요."
   }
  },
  "en": {
   "title": "D-Day Counter — Track Important Dates",
   "description": "Add birthdays, exams, anniversaries and more as D-Day events. See countdowns in real-time. Events within 7 days show a live seconds countdown.",
   "c": {
    "introTitle": "A D-Day counter tracks important dates as time remaining or time passed",
    "intro": "This counter lets you save exams, birthdays, trips, anniversaries, and other dates, then sorts them as D-minus, D-Day, or D-plus from today. Events within the next 7 days also show a live seconds countdown for closer planning.",
    "formulaTitle": "Calculation rules",
    "formulas": [
     {
      "title": "D-minus",
      "body": "If the target is in the future, target date - today is shown as D-n."
     },
     {
      "title": "D-Day",
      "body": "If the target date is today, it is shown as D-Day."
     },
     {
      "title": "D-plus",
      "body": "If the target has passed, today - target date is shown as D+n."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter an event name and target date.",
     "Save up to 10 events and review the closest future dates first.",
     "Delete completed or unnecessary events."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Where are events stored?",
      "answer": "They are stored in your browser's localStorage, so they remain on the same browser."
     },
     {
      "question": "Do events sync across devices?",
      "answer": "No. This tool does not use account sync; storage is local to each browser and device."
     },
     {
      "question": "Why do only events within 7 days show seconds?",
      "answer": "The live countdown is limited to near-term events to keep the page focused and lightweight."
     }
    ],
    "disclaimer": "This tool is for personal date tracking. Confirm official deadlines with the relevant institution or organizer."
   }
  },
  "ja": {
   "title": "Dデイカウンター — 重要な日程を管理",
   "description": "誕生日、試験、記念日などをDデイとして登録し、残り日数をリアルタイムで確認。7日以内のイベントは秒単位のカウントダウンも表示。",
   "c": {
    "introTitle": "D-Dayは大切な日までの残り時間と過ぎた時間を管理する方法です",
    "intro": "このカウンターでは試験、誕生日、旅行、記念日などを登録し、今日を基準にD-、D-Day、D+で並べます。7日以内の未来イベントは秒単位のカウントダウンも表示します。",
    "formulaTitle": "計算ルール",
    "formulas": [
     {
      "title": "D-日数",
      "body": "目標日が未来なら、目標日-今日をD-nで表示します。"
     },
     {
      "title": "D-Day",
      "body": "目標日が今日ならD-Dayで表示します。"
     },
     {
      "title": "D+日数",
      "body": "目標日が過ぎていれば、今日-目標日をD+nで表示します。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "イベント名と目標日を入力します。",
     "最大10件まで登録し、近い予定から確認します。",
     "完了したイベントや不要なイベントは削除します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "予定はどこに保存されますか？",
      "answer": "ブラウザのlocalStorageに保存されるため、同じブラウザでは保持されます。"
     },
     {
      "question": "別の端末と同期されますか？",
      "answer": "いいえ。アカウント同期はなく、端末とブラウザごとの保存です。"
     },
     {
      "question": "7日以内だけ秒表示なのはなぜ？",
      "answer": "近い予定だけを強調し、画面を軽く保つためです。"
     }
    ],
    "disclaimer": "このツールは個人の予定管理用です。公式な締切は各機関や主催者の案内をご確認ください。"
   }
  },
  "zh": {
   "title": "倒数计时器 — 追踪重要日期",
   "description": "将生日、考试、纪念日等重要日期设为倒数事件，即时查看剩余天数。7天以内的事件显示秒数倒计时。",
   "c": {
    "introTitle": "倒数日用剩余时间与已过时间管理重要日期",
    "intro": "这个计数器可登录考试、生日、旅行、纪念日等日期，并依今天显示为 D-、D-Day 或 D+。未来 7 天内的事件还会显示秒级倒数，方便掌握临近安排。",
    "formulaTitle": "计算规则",
    "formulas": [
     {
      "title": "D-天数",
      "body": "目标日在未来时，以目标日-今天显示为 D-n。"
     },
     {
      "title": "D-Day",
      "body": "目标日就是今天时显示 D-Day。"
     },
     {
      "title": "D+天数",
      "body": "目标日已过时，以今天-目标日显示为 D+n。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入事件名称与目标日期。",
     "最多登录 10 个事件，先查看最近的未来日期。",
     "完成或不需要的事件可以删除。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "事件储存在哪里？",
      "answer": "事件会储存在浏览器 localStorage，因此同一浏览器再次开启仍会保留。"
     },
     {
      "question": "会跨装置同步吗？",
      "answer": "不会。此工具没有帐号同步，资料只存在各自的浏览器与装置。"
     },
     {
      "question": "为什么只有 7 天内显示秒数？",
      "answer": "即时秒数倒数只用于近期事件，让页面更清楚也更轻量。"
     }
    ],
    "disclaimer": "本工具用于个人日期管理；正式截止日期请以相关机构或主办方公告为准。"
   }
  },
  "fr": {
   "title": "Compteur J-Day — Suivez vos dates importantes",
   "description": "Ajoutez vos anniversaires, examens et événements spéciaux. Voyez le compte à rebours en temps réel. Les événements dans les 7 jours affichent un décompte en secondes.",
   "c": {
    "introTitle": "Un compteur J-Day suit les dates importantes en temps restant ou écoulé",
    "intro": "Ce compteur permet d'enregistrer examens, anniversaires, voyages ou dates spéciales, puis les trie en J-, J-Day ou J+ depuis aujourd'hui. Les événements dans les 7 prochains jours affichent aussi un compte à rebours en secondes.",
    "formulaTitle": "Règles de calcul",
    "formulas": [
     {
      "title": "J-",
      "body": "Si la date cible est future, cible - aujourd'hui est affiché en J-n."
     },
     {
      "title": "J-Day",
      "body": "Si la date cible est aujourd'hui, elle est affichée comme J-Day."
     },
     {
      "title": "J+",
      "body": "Si la date est passée, aujourd'hui - cible est affiché en J+n."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez un nom d'événement et une date cible.",
     "Enregistrez jusqu'à 10 événements et consultez les plus proches d'abord.",
     "Supprimez les événements terminés ou inutiles."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Où les événements sont-ils stockés ?",
      "answer": "Dans le localStorage du navigateur, donc ils restent sur le même navigateur."
     },
     {
      "question": "Sont-ils synchronisés entre appareils ?",
      "answer": "Non. Il n'y a pas de compte ni de synchronisation ; le stockage est local."
     },
     {
      "question": "Pourquoi les secondes seulement sous 7 jours ?",
      "answer": "Le compte à rebours en direct est réservé aux dates proches pour garder l'interface légère."
     }
    ],
    "disclaimer": "Cet outil sert au suivi personnel des dates. Pour les échéances officielles, vérifiez auprès de l'organisme concerné."
   }
  },
  "es": {
   "title": "Contador D-Day — Gestiona tus fechas importantes",
   "description": "Agrega cumpleaños, exámenes, aniversarios y más como eventos D-Day. Ve las cuentas regresivas en tiempo real. Los eventos en 7 días muestran cuenta regresiva en segundos.",
   "c": {
    "introTitle": "Un contador D-Day muestra el tiempo restante o transcurrido para fechas importantes",
    "intro": "Este contador permite guardar exámenes, cumpleaños, viajes, aniversarios y otras fechas, ordenándolas como D-, D-Day o D+ desde hoy. Los eventos dentro de 7 días muestran además una cuenta regresiva en segundos.",
    "formulaTitle": "Reglas de cálculo",
    "formulas": [
     {
      "title": "D-",
      "body": "Si la fecha está en el futuro, objetivo - hoy se muestra como D-n."
     },
     {
      "title": "D-Day",
      "body": "Si la fecha objetivo es hoy, se muestra como D-Day."
     },
     {
      "title": "D+",
      "body": "Si la fecha ya pasó, hoy - objetivo se muestra como D+n."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce nombre del evento y fecha objetivo.",
     "Guarda hasta 10 eventos y revisa primero los más cercanos.",
     "Elimina eventos completados o innecesarios."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Dónde se guardan los eventos?",
      "answer": "En el localStorage del navegador, por lo que se mantienen en el mismo navegador."
     },
     {
      "question": "¿Se sincronizan entre dispositivos?",
      "answer": "No. No hay sincronización por cuenta; el almacenamiento es local por navegador y dispositivo."
     },
     {
      "question": "¿Por qué solo hay segundos en eventos de 7 días?",
      "answer": "La cuenta regresiva en vivo se limita a fechas cercanas para mantener la página clara y ligera."
     }
    ],
    "disclaimer": "Esta herramienta es para seguimiento personal de fechas. Confirma plazos oficiales con la institución u organizador correspondiente."
   }
  }
 },
 "hours-calculator": {
  "ko": {
   "title": "근무시간 계산기 — 시작·종료 시각으로 시간 계산",
   "description": "출근·퇴근 시각과 휴게 시간을 입력하면 총 근무 시간과 십진 시간을 계산합니다. 시급을 넣으면 급여도 추정합니다. 야간 근무(익일 종료) 지원.",
   "c": {
    "introTitle": "근무시간 계산기란?",
    "intro": "출근 시각과 퇴근 시각, 휴게 시간을 입력하면 실제 근무 시간을 시:분과 십진 시간(예: 8.5시간)으로 계산해요. 급여 계산에 쓰이는 십진 시간을 자동으로 변환하고, 시급을 넣으면 급여까지 추정해요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "십진 시간 자동 변환",
      "body": "8시간 30분을 급여 계산용 8.5로 바꿔줍니다."
     },
     {
      "title": "야간 근무 지원",
      "body": "퇴근이 다음 날이면 24시간을 넘겨 정확히 계산합니다."
     },
     {
      "title": "급여 추정",
      "body": "시급을 입력하면 근무 급여를 바로 보여줍니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "출근·퇴근 시각을 입력합니다.",
     "휴게 시간(분)을 입력합니다.",
     "필요하면 시급을 넣어 급여를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "십진 시간이 뭔가요?",
      "answer": "분을 60으로 나눠 시간 단위로 표현한 값입니다. 30분=0.5시간이라 8시간 30분은 8.5로 표시됩니다."
     },
     {
      "question": "밤샘 근무도 계산되나요?",
      "answer": "네. 퇴근 시각이 출근보다 이르면 다음 날로 보고 24시간을 더해 계산합니다."
     },
     {
      "question": "휴게 시간은 어떻게 반영되나요?",
      "answer": "총 근무 시간에서 입력한 휴게 분을 빼고 계산합니다."
     }
    ],
    "disclaimer": "추정치이며 실제 급여는 세금·수당·연장근로 규정에 따라 달라요. 근로 조건은 근로계약과 관련 법규를 확인하세요."
   }
  },
  "en": {
   "title": "Hours Calculator — Time Card & Work Hours",
   "description": "Enter start and end time plus break minutes to get total hours worked and decimal hours. Add an hourly rate to estimate pay. Handles overnight shifts.",
   "c": {
    "introTitle": "What is the hours calculator?",
    "intro": "Enter your clock-in and clock-out times plus any break, and it computes hours worked in both h:m and decimal hours (e.g. 8.5 hours). Decimal hours are what payroll uses, and adding an hourly rate estimates your pay.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Decimal hours",
      "body": "Converts 8 h 30 m to 8.5 for payroll."
     },
     {
      "title": "Overnight shifts",
      "body": "If the end is next day, it rolls past midnight correctly."
     },
     {
      "title": "Pay estimate",
      "body": "Add an hourly rate to see estimated earnings."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter start and end times.",
     "Enter break minutes.",
     "Optionally add an hourly rate to see pay."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "What are decimal hours?",
      "answer": "Minutes divided by 60. 30 minutes = 0.5, so 8 h 30 m shows as 8.5."
     },
     {
      "question": "Does it handle overnight shifts?",
      "answer": "Yes. If the end time is earlier than the start, it treats it as the next day and adds 24 hours."
     },
     {
      "question": "How is the break applied?",
      "answer": "The break minutes you enter are subtracted from the total worked time."
     }
    ],
    "disclaimer": "Estimates only; actual pay depends on tax, allowances, and overtime rules. Confirm terms with your employment contract and local law."
   }
  },
  "ja": {
   "title": "勤務時間計算機 — 出退勤から時間を計算",
   "description": "出勤・退勤時刻と休憩時間を入力すると総勤務時間と10進時間を計算します。時給を入れると給与も試算。夜勤(翌日終了)に対応。",
   "c": {
    "introTitle": "勤務時間計算機とは？",
    "intro": "出勤・退勤時刻と休憩を入力すると、勤務時間を時:分と10進時間(例:8.5時間)で計算します。給与計算に使う10進時間に自動変換し、時給を入れると給与も試算します。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "10進時間に変換",
      "body": "8時間30分を給与計算用の8.5に変換します。"
     },
     {
      "title": "夜勤に対応",
      "body": "退勤が翌日でも24時間を超えて正しく計算します。"
     },
     {
      "title": "給与試算",
      "body": "時給を入れると勤務給与を表示します。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "出勤・退勤時刻を入力します。",
     "休憩時間(分)を入力します。",
     "必要なら時給を入れて給与を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "10進時間とは？",
      "answer": "分を60で割って時間で表した値です。30分=0.5なので8時間30分は8.5になります。"
     },
     {
      "question": "夜勤も計算できますか？",
      "answer": "はい。退勤が出勤より早ければ翌日とみなし24時間を加えて計算します。"
     },
     {
      "question": "休憩はどう反映されますか？",
      "answer": "総勤務時間から入力した休憩分を差し引いて計算します。"
     }
    ],
    "disclaimer": "試算であり、実際の給与は税・手当・残業規定で異なります。労働条件は雇用契約と関連法規をご確認ください。"
   }
  },
  "zh": {
   "title": "工时计算器 — 上下班时间计算",
   "description": "输入上班、下班时间和休息分钟，计算总工时和十进制小时。输入时薪即可估算薪资。支持跨夜班次。",
   "c": {
    "introTitle": "什么是工时计算器？",
    "intro": "输入上班、下班时间和休息时间，即可算出工作时长，同时以“时:分”和小数小时（如8.5小时）显示。工资计算通常使用小数小时，填入时薪还能估算工资。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "小数小时",
      "body": "把8小时30分换算成8.5，便于计算工资。"
     },
     {
      "title": "跨夜班次",
      "body": "下班时间在次日时，会正确跨过午夜计算。"
     },
     {
      "title": "工资估算",
      "body": "填入时薪即可查看预计收入。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入开始和结束时间。",
     "输入休息分钟数。",
     "可选：填入时薪查看工资。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "什么是小数小时？",
      "answer": "分钟除以60。30分钟=0.5，所以8小时30分显示为8.5。"
     },
     {
      "question": "能处理跨夜班吗？",
      "answer": "可以。结束时间早于开始时间时，按次日处理并加24小时。"
     },
     {
      "question": "休息时间怎么扣？",
      "answer": "从总工作时间中减去你输入的休息分钟数。"
     }
    ],
    "disclaimer": "仅为估算；实际工资取决于税费、津贴和加班规定。请以劳动合同和当地法律为准。"
   }
  },
  "fr": {
   "title": "Calculateur d'heures — Pointeuse & heures travaillées",
   "description": "Saisissez l'heure de début, de fin et la pause pour obtenir les heures travaillées et les heures décimales. Ajoutez un taux horaire pour estimer la paie.",
   "c": {
    "introTitle": "Qu’est-ce que le calculateur d’heures ?",
    "intro": "Saisissez l’heure d’arrivée, de départ et la pause : il calcule les heures travaillées en h:min et en heures décimales (ex. 8,5 h). Les heures décimales servent à la paie, et un taux horaire donne une estimation du salaire.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Heures décimales",
      "body": "Convertit 8 h 30 en 8,5 pour la paie."
     },
     {
      "title": "Postes de nuit",
      "body": "Si la fin est le lendemain, le calcul passe minuit correctement."
     },
     {
      "title": "Estimation de paie",
      "body": "Ajoutez un taux horaire pour voir le montant estimé."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez les heures de début et de fin.",
     "Saisissez les minutes de pause.",
     "Ajoutez si besoin un taux horaire pour voir la paie."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Que sont les heures décimales ?",
      "answer": "Les minutes divisées par 60. 30 minutes = 0,5, donc 8 h 30 s’affiche 8,5."
     },
     {
      "question": "Gère-t-il les postes de nuit ?",
      "answer": "Oui. Si l’heure de fin est avant celle du début, elle est comptée le lendemain (+24 h)."
     },
     {
      "question": "Comment la pause est-elle appliquée ?",
      "answer": "Les minutes de pause saisies sont retirées du temps total."
     }
    ],
    "disclaimer": "Estimation uniquement ; la paie réelle dépend des impôts, primes et règles d’heures supplémentaires. Vérifiez votre contrat et le droit applicable."
   }
  },
  "es": {
   "title": "Calculadora de horas — Horas trabajadas y fichaje",
   "description": "Introduce la hora de inicio, de fin y el descanso para obtener las horas trabajadas y las horas decimales. Añade una tarifa por hora para estimar el pago.",
   "c": {
    "introTitle": "¿Qué es la calculadora de horas?",
    "intro": "Introduce la hora de entrada, de salida y el descanso: calcula las horas trabajadas en h:min y en horas decimales (p. ej., 8,5 h). Las horas decimales se usan en nómina y, con una tarifa por hora, estima el pago.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Horas decimales",
      "body": "Convierte 8 h 30 min en 8,5 para la nómina."
     },
     {
      "title": "Turnos nocturnos",
      "body": "Si la salida es al día siguiente, pasa la medianoche correctamente."
     },
     {
      "title": "Estimación de pago",
      "body": "Añade una tarifa por hora para ver el importe estimado."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce la hora de inicio y de fin.",
     "Introduce los minutos de descanso.",
     "Opcional: añade una tarifa por hora para ver el pago."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Qué son las horas decimales?",
      "answer": "Los minutos divididos entre 60. 30 minutos = 0,5, así que 8 h 30 min se muestra como 8,5."
     },
     {
      "question": "¿Admite turnos nocturnos?",
      "answer": "Sí. Si la hora de fin es anterior a la de inicio, se toma como el día siguiente (+24 h)."
     },
     {
      "question": "¿Cómo se aplica el descanso?",
      "answer": "Los minutos de descanso se restan del tiempo total trabajado."
     }
    ],
    "disclaimer": "Solo es una estimación; el pago real depende de impuestos, pluses y reglas de horas extra. Consulta tu contrato y la ley aplicable."
   }
  }
 },
 "world-clock": {
  "ko": {
   "title": "세계 시계 — 주요 도시 실시간 시각",
   "description": "서울·뉴욕·런던·파리·도쿄·시드니 등 세계 주요 도시의 현재 시각을 실시간으로 확인합니다. UTC 오프셋 및 날짜 표시 지원.",
   "c": {
    "introTitle": "세계 주요 도시의 지금 시각을 한 화면에",
    "intro": "서울, 뉴욕, 런던, 파리, 도쿄, 시드니 등 15개 도시의 현재 시각·날짜·UTC 오프셋을 1초마다 갱신해 보여 줘요. 시각은 기기 시계와 브라우저의 시간대 데이터(Intl)로 계산하므로 서머타임 전환도 자동으로 반영돼요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "15개 도시",
      "body": "아시아·유럽·미주·오세아니아 주요 도시를 한눈에 봅니다."
     },
     {
      "title": "서머타임 자동 반영",
      "body": "브라우저 시간대 데이터를 써서 일광절약시간 전환을 따로 계산하지 않아도 됩니다."
     },
     {
      "title": "UTC 오프셋",
      "body": "각 도시가 협정세계시보다 몇 시간 빠르거나 느린지 표시합니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "페이지를 열면 바로 시각이 표시됩니다.",
     "도시 카드에서 현지 시각과 날짜를 확인합니다.",
     "UTC 오프셋으로 내 시간과의 차이를 계산합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "시각이 정확한가요?",
      "answer": "기기 시계를 기준으로 하므로 기기 시계가 맞으면 정확합니다."
     },
     {
      "question": "서머타임은 반영되나요?",
      "answer": "네. 브라우저의 시간대 데이터가 각 지역 규칙에 따라 자동으로 반영합니다."
     },
     {
      "question": "한국과 뉴욕의 시차는?",
      "answer": "뉴욕이 서머타임일 때 13시간, 아닐 때 14시간 늦습니다."
     }
    ],
    "disclaimer": "시각은 기기 시계와 브라우저 시간대 데이터 기준이에요. 항공·법적 기한 등 중요한 일정은 공식 출처로 다시 확인하세요."
   }
  },
  "en": {
   "title": "World Clock — Live Time in Major Cities",
   "description": "See the current local time in Seoul, New York, London, Paris, Tokyo, Sydney and more. Real-time clock with UTC offset and date display.",
   "c": {
    "introTitle": "The current time in major cities, on one screen",
    "intro": "See the local time, date and UTC offset for 15 cities including Seoul, New York, London, Paris, Tokyo and Sydney, updated every second. Times come from your device clock and the browser’s time zone data (Intl), so daylight saving changes are applied automatically.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "15 cities",
      "body": "Major cities across Asia, Europe, the Americas and Oceania at a glance."
     },
     {
      "title": "Daylight saving built in",
      "body": "The browser’s time zone data handles DST switches for you."
     },
     {
      "title": "UTC offset",
      "body": "Shows how far each city is ahead of or behind Coordinated Universal Time."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Open the page and the clocks start.",
     "Read the local time and date on each city card.",
     "Use the UTC offset to work out the gap from your own time."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How accurate is it?",
      "answer": "It uses your device clock, so it is as accurate as that clock."
     },
     {
      "question": "Is daylight saving time handled?",
      "answer": "Yes. The browser’s time zone data applies each region’s rules automatically."
     },
     {
      "question": "What is the time difference between London and New York?",
      "answer": "New York is usually 5 hours behind London; it can be 4 for a few weeks when DST dates differ."
     }
    ],
    "disclaimer": "Times rely on your device clock and the browser’s time zone data. Double-check flights and legal deadlines with an official source."
   }
  },
  "ja": {
   "title": "世界時計 — 主要都市のリアルタイム時刻",
   "description": "ソウル・ニューヨーク・ロンドン・パリ・東京・シドニーなど世界の主要都市の現在時刻をリアルタイムで確認。UTC時差と日付表示対応。",
   "c": {
    "introTitle": "世界の主要都市の現在時刻を1画面で",
    "intro": "ソウル・ニューヨーク・ロンドン・パリ・東京・シドニーなど15都市の現在時刻・日付・UTCオフセットを毎秒更新して表示します。時刻は端末の時計とブラウザのタイムゾーンデータ（Intl）で計算するため、サマータイムの切り替えも自動で反映されます。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "15都市",
      "body": "アジア・ヨーロッパ・南北アメリカ・オセアニアの主要都市を一覧できます。"
     },
     {
      "title": "サマータイム自動対応",
      "body": "ブラウザのタイムゾーンデータが夏時間の切り替えを処理します。"
     },
     {
      "title": "UTCオフセット",
      "body": "各都市が協定世界時より何時間進んでいるか遅れているかを表示します。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "ページを開くとすぐに時刻が表示されます。",
     "都市カードで現地の時刻と日付を確認します。",
     "UTCオフセットで自分の時刻との差を計算します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "時刻は正確ですか？",
      "answer": "端末の時計を基準にするため、端末の時計が正しければ正確です。"
     },
     {
      "question": "サマータイムは反映されますか？",
      "answer": "はい。ブラウザのタイムゾーンデータが各地域のルールに従って自動で反映します。"
     },
     {
      "question": "日本とニューヨークの時差は？",
      "answer": "ニューヨークがサマータイムのときは13時間、それ以外は14時間遅れです。"
     }
    ],
    "disclaimer": "時刻は端末の時計とブラウザのタイムゾーンデータに基づきます。航空便や法的期限など重要な予定は公式情報で再確認してください。"
   }
  },
  "zh": {
   "title": "世界时钟 — 主要城市即时时间",
   "description": "即时查看首尔、纽约、伦敦、巴黎、东京、雪梨等世界主要城市的当前时间，支援UTC时差与日期显示。",
   "c": {
    "introTitle": "一屏查看世界主要城市的当前时间",
    "intro": "每秒更新首尔、纽约、伦敦、巴黎、东京、悉尼等15个城市的当前时间、日期和UTC偏移。时间由设备时钟和浏览器的时区数据（Intl）计算，夏令时切换会自动生效。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "15个城市",
      "body": "一眼看到亚洲、欧洲、美洲和大洋洲的主要城市。"
     },
     {
      "title": "自动处理夏令时",
      "body": "浏览器时区数据会自动处理夏令时切换。"
     },
     {
      "title": "UTC偏移",
      "body": "显示每个城市比协调世界时快或慢几个小时。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "打开页面即开始显示时间。",
     "在城市卡片上查看当地时间和日期。",
     "用UTC偏移算出与你所在地的时差。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "时间准确吗？",
      "answer": "以设备时钟为准，设备时钟准确则时间准确。"
     },
     {
      "question": "会处理夏令时吗？",
      "answer": "会。浏览器的时区数据按各地规则自动处理。"
     },
     {
      "question": "北京和纽约差几个小时？",
      "answer": "纽约实行夏令时时晚12小时，否则晚13小时。"
     }
    ],
    "disclaimer": "时间基于设备时钟和浏览器时区数据。航班、法定期限等重要安排请以官方信息为准。"
   }
  },
  "fr": {
   "title": "Horloge Mondiale — Heure en direct dans les grandes villes",
   "description": "Consultez l'heure locale actuelle à Séoul, New York, Londres, Paris, Tokyo, Sydney et ailleurs. Horloge en temps réel avec décalage UTC.",
   "c": {
    "introTitle": "L’heure actuelle des grandes villes sur un seul écran",
    "intro": "Affiche l’heure locale, la date et le décalage UTC de 15 villes dont Séoul, New York, Londres, Paris, Tokyo et Sydney, mis à jour chaque seconde. Les heures viennent de l’horloge de votre appareil et des données de fuseaux du navigateur (Intl) : les changements d’heure d’été sont appliqués automatiquement.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "15 villes",
      "body": "Les grandes villes d’Asie, d’Europe, des Amériques et d’Océanie d’un coup d’œil."
     },
     {
      "title": "Heure d’été incluse",
      "body": "Les données de fuseaux du navigateur gèrent les changements d’heure."
     },
     {
      "title": "Décalage UTC",
      "body": "Indique l’avance ou le retard de chaque ville sur le temps universel coordonné."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Ouvrez la page : les horloges démarrent.",
     "Lisez l’heure et la date locales sur chaque carte.",
     "Servez-vous du décalage UTC pour calculer l’écart avec votre heure."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Est-ce précis ?",
      "answer": "L’outil utilise l’horloge de votre appareil : il est aussi précis qu’elle."
     },
     {
      "question": "L’heure d’été est-elle prise en compte ?",
      "answer": "Oui. Les données de fuseaux du navigateur appliquent automatiquement les règles de chaque région."
     },
     {
      "question": "Quel est le décalage entre Paris et New York ?",
      "answer": "New York a en général 6 heures de retard sur Paris, parfois 5 pendant quelques semaines quand les dates d’heure d’été diffèrent."
     }
    ],
    "disclaimer": "Les heures dépendent de l’horloge de votre appareil et des données de fuseaux du navigateur. Vérifiez vols et échéances légales auprès d’une source officielle."
   }
  },
  "es": {
   "title": "Reloj Mundial — Hora en vivo en ciudades principales",
   "description": "Consulta la hora local actual en Seúl, Nueva York, Londres, París, Tokio, Sídney y más. Reloj en tiempo real con desplazamiento UTC.",
   "c": {
    "introTitle": "La hora actual de las grandes ciudades en una sola pantalla",
    "intro": "Muestra la hora local, la fecha y el desfase UTC de 15 ciudades como Seúl, Nueva York, Londres, París, Tokio y Sídney, actualizados cada segundo. Las horas salen del reloj de tu dispositivo y de los datos de zonas horarias del navegador (Intl), así que los cambios de horario de verano se aplican solos.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "15 ciudades",
      "body": "Las principales ciudades de Asia, Europa, América y Oceanía de un vistazo."
     },
     {
      "title": "Horario de verano incluido",
      "body": "Los datos de zonas horarias del navegador gestionan los cambios de hora."
     },
     {
      "title": "Desfase UTC",
      "body": "Indica cuántas horas va cada ciudad por delante o por detrás del tiempo universal coordinado."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Abre la página y los relojes empiezan a funcionar.",
     "Consulta la hora y la fecha local en cada tarjeta.",
     "Usa el desfase UTC para calcular la diferencia con tu hora."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Es exacto?",
      "answer": "Usa el reloj de tu dispositivo, así que es tan exacto como ese reloj."
     },
     {
      "question": "¿Tiene en cuenta el horario de verano?",
      "answer": "Sí. Los datos de zonas horarias del navegador aplican las reglas de cada región automáticamente."
     },
     {
      "question": "¿Qué diferencia hay entre Madrid y Nueva York?",
      "answer": "Nueva York suele ir 6 horas por detrás de Madrid, y 5 durante unas semanas cuando las fechas del horario de verano no coinciden."
     }
    ],
    "disclaimer": "Las horas dependen del reloj de tu dispositivo y de los datos de zonas horarias del navegador. Confirma vuelos y plazos legales con una fuente oficial."
   }
  }
 },
 "timer": {
  "ko": {
   "title": "타이머 — 스톱워치 & 카운트다운",
   "description": "랩 기능이 있는 스톱워치와 알람 카운트다운 타이머. 스페이스바로 시작/정지, 원형 프로그레스바, Web Audio 알람음 제공.",
   "c": {
    "introTitle": "스톱워치와 카운트다운은 시간을 서로 다른 방향에서 관리합니다",
    "intro": "운동, 발표 연습, 요리, 업무 블록처럼 시간의 흐름을 재거나 제한해야 하는 상황이 있어요. 이 타이머는 랩 기록이 있는 스톱워치와 알람이 있는 카운트다운을 함께 제공해 시작, 일시정지, 리셋, 스페이스바 조작을 빠르게 처리해요.",
    "formulaTitle": "시간 관리 개념",
    "formulas": [
     {
      "title": "스톱워치",
      "body": "시작 시점부터 얼마나 지났는지 측정합니다. 랩 기록으로 구간별 시간을 비교할 수 있습니다."
     },
     {
      "title": "카운트다운",
      "body": "정한 시간에서 0까지 줄어드는 방식입니다. 제한 시간, 휴식, 조리 시간에 적합합니다."
     },
     {
      "title": "알림음",
      "body": "브라우저의 Web Audio 기능으로 시간이 끝났음을 알려주지만 기기 음량과 권한 상태의 영향을 받습니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "스톱워치 또는 카운트다운 탭을 선택합니다.",
     "필요한 시간을 설정하고 시작 버튼이나 스페이스바로 실행합니다.",
     "랩, 일시정지, 리셋을 사용해 구간 기록이나 제한 시간을 관리합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "스페이스바로 조작할 수 있나요?",
      "answer": "예. 도구가 포커스된 상태에서 스페이스바로 시작과 일시정지를 빠르게 전환할 수 있습니다."
     },
     {
      "question": "알람 소리가 항상 나나요?",
      "answer": "브라우저, 기기 음량, 자동재생 정책, 음소거 상태에 따라 알림음이 제한될 수 있습니다."
     },
     {
      "question": "정밀 측정용으로 써도 되나요?",
      "answer": "일상 작업에는 충분하지만 경기 판정, 실험, 법적 기록처럼 고정밀 시간이 필요한 용도에는 전용 장비를 사용하세요."
     }
    ],
    "disclaimer": "브라우저 타이머는 탭 비활성화, 절전 모드, 기기 성능의 영향을 받을 수 있어요."
   }
  },
  "en": {
   "title": "Timer — Stopwatch & Countdown",
   "description": "Stopwatch with lap tracking and a countdown timer with alarm. Start/stop with spacebar, circular progress bar, and Web Audio API alarm.",
   "c": {
    "introTitle": "Stopwatch and countdown timers manage time from opposite directions",
    "intro": "Work blocks, workouts, presentations, cooking, and breaks all need either elapsed time or remaining time. This timer combines a lap-enabled stopwatch with an alarm countdown, plus start, pause, reset, and spacebar control for quick everyday timing.",
    "formulaTitle": "Timing concepts",
    "formulas": [
     {
      "title": "Stopwatch",
      "body": "Measures elapsed time from a start point and records laps for comparing intervals."
     },
     {
      "title": "Countdown",
      "body": "Counts down from a chosen duration to zero, useful for limits, breaks, cooking, and practice blocks."
     },
     {
      "title": "Audio alert",
      "body": "Uses browser Web Audio, so volume, permissions, mute state, and browser policy can affect playback."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Choose the stopwatch or countdown tab.",
     "Set the duration if needed, then start with the button or spacebar.",
     "Use lap, pause, and reset to manage intervals or fixed time limits."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Can I control it with the keyboard?",
      "answer": "Yes. When the tool is focused, the spacebar toggles start and pause."
     },
     {
      "question": "Will the alarm always play?",
      "answer": "Not always. Browser autoplay rules, device volume, mute mode, and permissions can limit sound."
     },
     {
      "question": "Is it suitable for precision timing?",
      "answer": "It is fine for everyday tasks, but use dedicated equipment for official sports, experiments, or legal records."
     }
    ],
    "disclaimer": "Browser timers can be affected by inactive tabs, power saving, system load, and device performance."
   }
  },
  "ja": {
   "title": "タイマー — ストップウォッチ & カウントダウン",
   "description": "ラップ機能付きストップウォッチとアラーム付きカウントダウンタイマー。スペースキーで開始・停止、円形プログレスバー、Web Audioアラーム。",
   "c": {
    "introTitle": "ストップウォッチとカウントダウンは時間を逆方向から管理します",
    "intro": "運動、発表練習、料理、作業ブロック、休憩では、経過時間または残り時間をすばやく確認したい場面があります。このタイマーはラップ付きストップウォッチとアラーム付きカウントダウンを一つにまとめています。",
    "formulaTitle": "時間管理の考え方",
    "formulas": [
     {
      "title": "ストップウォッチ",
      "body": "開始時点からの経過時間を測り、ラップで区間ごとの時間を比較できます。"
     },
     {
      "title": "カウントダウン",
      "body": "設定した時間から0まで減らします。制限時間、休憩、調理、練習に向いています。"
     },
     {
      "title": "通知音",
      "body": "ブラウザのWeb Audioを使うため、音量、権限、ミュート、ブラウザ設定の影響を受けます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "ストップウォッチまたはカウントダウンのタブを選びます。",
     "必要な時間を設定し、ボタンまたはスペースキーで開始します。",
     "ラップ、一時停止、リセットで区間や制限時間を管理します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "キーボードで操作できますか？",
      "answer": "はい。ツールにフォーカスがある状態では、スペースキーで開始と一時停止を切り替えられます。"
     },
     {
      "question": "アラーム音は必ず鳴りますか？",
      "answer": "ブラウザの自動再生ルール、端末音量、ミュート、権限設定により鳴らない場合があります。"
     },
     {
      "question": "精密な計測に使えますか？",
      "answer": "日常用途には十分ですが、公式競技、実験、法的記録には専用機器を使ってください。"
     }
    ],
    "disclaimer": "ブラウザのタイマーは非アクティブタブ、省電力、システム負荷、端末性能の影響を受けることがあります。"
   }
  },
  "zh": {
   "title": "计时器 — 码表与倒数计时",
   "description": "带分段记录的码表和倒数计时闹钟。空白键开始/暂停，圆形进度条，Web Audio API闹钟提示音。",
   "c": {
    "introTitle": "秒表和倒计时从两个方向管理时间",
    "intro": "运动、演讲练习、烹饪、工作块和休息都可能需要查看已用时间或剩余时间。这个计时器把带分段记录的秒表和带提醒的倒计时放在一起，并支持开始、暂停、重置和空格键操作。",
    "formulaTitle": "计时概念",
    "formulas": [
     {
      "title": "秒表",
      "body": "从开始时刻起测量已过去的时间，并可用分段记录比较不同区间。"
     },
     {
      "title": "倒计时",
      "body": "从设定时长递减到 0，适合时间限制、休息、烹饪和练习。"
     },
     {
      "title": "声音提醒",
      "body": "使用浏览器 Web Audio，播放会受到音量、权限、静音和浏览器策略影响。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "选择秒表或倒计时标签。",
     "按需设置时间，然后用按钮或空格键开始。",
     "使用分段、暂停和重置管理区间记录或固定时限。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "可以用键盘控制吗？",
      "answer": "可以。工具获得焦点时，空格键可切换开始和暂停。"
     },
     {
      "question": "提醒声音一定会播放吗？",
      "answer": "不一定。浏览器自动播放规则、设备音量、静音状态和权限都可能影响声音。"
     },
     {
      "question": "适合精密计时吗？",
      "answer": "日常任务可以使用；正式比赛、实验或法律记录应使用专用设备。"
     }
    ],
    "disclaimer": "浏览器计时器可能受后台标签页、省电模式、系统负载和设备性能影响。"
   }
  },
  "fr": {
   "title": "Minuteur — Chronomètre & Compte à rebours",
   "description": "Chronomètre avec suivi des tours et minuterie avec alarme. Démarrez/arrêtez avec la barre d'espace, barre de progression circulaire et alarme Web Audio.",
   "c": {
    "introTitle": "Chronomètre et compte à rebours gèrent le temps dans deux sens",
    "intro": "Travail, entraînement, présentation, cuisine ou pause peuvent demander de suivre le temps écoulé ou le temps restant. Ce minuteur combine chronomètre avec tours, compte à rebours avec alarme, commandes démarrer, pause, réinitialiser et raccourci clavier.",
    "formulaTitle": "Notions de minutage",
    "formulas": [
     {
      "title": "Chronomètre",
      "body": "Mesure le temps écoulé depuis le départ et enregistre des tours pour comparer les intervalles."
     },
     {
      "title": "Compte à rebours",
      "body": "Part d'une durée choisie et descend à zéro, pratique pour limites, pauses, cuisson et exercices."
     },
     {
      "title": "Alerte audio",
      "body": "Utilise Web Audio ; volume, permissions, mode muet et règles du navigateur peuvent l'affecter."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Choisissez l'onglet chronomètre ou compte à rebours.",
     "Réglez la durée si nécessaire, puis démarrez avec le bouton ou la barre d'espace.",
     "Utilisez tour, pause et réinitialisation pour gérer intervalles ou limites fixes."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Puis-je le contrôler au clavier ?",
      "answer": "Oui. Lorsque l'outil a le focus, la barre d'espace lance ou met en pause."
     },
     {
      "question": "L'alarme sonne-t-elle toujours ?",
      "answer": "Pas toujours. Les règles d'autoplay, le volume, le mode muet et les permissions peuvent limiter le son."
     },
     {
      "question": "Convient-il à une mesure précise ?",
      "answer": "Il convient aux tâches quotidiennes, mais utilisez un équipement dédié pour sport officiel, expérience ou preuve légale."
     }
    ],
    "disclaimer": "Les minuteurs de navigateur peuvent être affectés par onglets inactifs, économie d'énergie, charge système et performance de l'appareil."
   }
  },
  "es": {
   "title": "Temporizador — Cronómetro & Cuenta regresiva",
   "description": "Cronómetro con seguimiento de vueltas y temporizador con alarma. Inicia/detén con la barra espaciadora, progreso circular y alarma Web Audio.",
   "c": {
    "introTitle": "Cronómetro y cuenta regresiva gestionan el tiempo desde lados opuestos",
    "intro": "Bloques de trabajo, ejercicio, presentaciones, cocina y descansos necesitan medir tiempo transcurrido o restante. Este temporizador combina cronómetro con vueltas y cuenta regresiva con alarma, además de iniciar, pausar, restablecer y controlar con la barra espaciadora.",
    "formulaTitle": "Conceptos de temporización",
    "formulas": [
     {
      "title": "Cronómetro",
      "body": "Mide el tiempo transcurrido desde el inicio y registra vueltas para comparar intervalos."
     },
     {
      "title": "Cuenta regresiva",
      "body": "Desciende desde una duración elegida hasta cero, útil para límites, pausas, cocina y práctica."
     },
     {
      "title": "Alerta sonora",
      "body": "Usa Web Audio del navegador, por lo que volumen, permisos, silencio y políticas pueden afectar el sonido."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Elige la pestaña de cronómetro o cuenta regresiva.",
     "Configura la duración si hace falta y comienza con el botón o la barra espaciadora.",
     "Usa vuelta, pausa y reinicio para gestionar intervalos o límites fijos."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Puedo controlarlo con el teclado?",
      "answer": "Sí. Cuando la herramienta tiene foco, la barra espaciadora alterna iniciar y pausar."
     },
     {
      "question": "¿La alarma siempre suena?",
      "answer": "No siempre. Las reglas del navegador, volumen, modo silencio y permisos pueden limitar el sonido."
     },
     {
      "question": "¿Sirve para medición precisa?",
      "answer": "Es adecuado para tareas cotidianas, pero usa equipo dedicado para deporte oficial, experimentos o registros legales."
     }
    ],
    "disclaimer": "Los temporizadores del navegador pueden verse afectados por pestañas inactivas, ahorro de energía, carga del sistema y rendimiento del dispositivo."
   }
  }
 },
 "pomodoro": {
  "ko": {
   "title": "뽀모도로 타이머 — 집중력 향상 시간 관리 도구",
   "description": "25분 집중 + 5분 휴식 사이클로 생산성을 높이는 뽀모도로 타이머. SVG 원형 프로그레스, 소리 알림, 오늘 통계 지원.",
   "c": {
    "introTitle": "뽀모도로는 집중과 회복을 한 세트로 다루는 시간 관리법입니다",
    "intro": "긴 업무를 계속 밀어붙이면 집중력이 떨어지고 시작 장벽도 커져요. 이 타이머는 기본 25분 집중, 5분 짧은 휴식, 4회 후 긴 휴식 흐름을 시각적 진행 링과 알림음, 오늘의 집중 통계로 관리해 학습과 작업을 작은 단위로 나누게 도와요.",
    "formulaTitle": "뽀모도로 개념",
    "formulas": [
     {
      "title": "집중 세션",
      "body": "방해를 줄이고 하나의 작업에 몰입하는 시간입니다. 기본값은 25분입니다."
     },
     {
      "title": "짧은 휴식",
      "body": "세션 사이의 회복 시간입니다. 기본 5분으로, 다음 집중을 준비하는 역할을 합니다."
     },
     {
      "title": "긴 휴식",
      "body": "여러 집중 세션 후 누적 피로를 낮추기 위한 긴 회복 구간입니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "집중, 짧은 휴식, 긴 휴식 시간을 필요에 맞게 조정합니다.",
     "집중 모드에서 시작하고 한 세션 동안 한 가지 작업만 진행합니다.",
     "알림이 울리면 휴식하고, 완료 세션과 오늘 집중 시간을 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "꼭 25분을 써야 하나요?",
      "answer": "아닙니다. 25분은 기본값일 뿐입니다. 깊은 작업은 더 길게, 시작이 어려운 작업은 더 짧게 조정할 수 있습니다."
     },
     {
      "question": "긴 휴식은 언제 나오나요?",
      "answer": "컴포넌트는 집중 세션 4회 후 긴 휴식으로 전환되는 사이클을 기준으로 설계되어 있습니다."
     },
     {
      "question": "오늘 통계는 무엇을 의미하나요?",
      "answer": "완료한 집중 세션 수와 누적 집중 시간을 보여주어 하루 작업량을 대략 확인하게 돕습니다."
     }
    ],
    "disclaimer": "이 도구는 생산성 보조용이며 수면, 번아웃, ADHD 등 건강·의학적 문제를 진단하거나 치료하지 않아요."
   }
  },
  "en": {
   "title": "Pomodoro Timer — Focus & Productivity Tool",
   "description": "Boost your productivity with the Pomodoro technique. 25-min focus + 5-min break cycles with visual progress ring, sound alerts, and daily stats.",
   "c": {
    "introTitle": "Pomodoro treats focus and recovery as one work cycle",
    "intro": "Pushing through long work sessions can reduce attention and make starting harder. This timer organizes work into focus sessions, short breaks, and longer recovery after repeated sessions, with a visual progress ring, sound alerts, and daily focus stats.",
    "formulaTitle": "Pomodoro concepts",
    "formulas": [
     {
      "title": "Focus session",
      "body": "A protected block for one task. The default is 25 minutes, but it can be adjusted."
     },
     {
      "title": "Short break",
      "body": "A brief recovery period between sessions, usually enough to reset attention without losing momentum."
     },
     {
      "title": "Long break",
      "body": "A longer recovery block after several focus sessions to reduce accumulated fatigue."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Adjust focus, short-break, and long-break durations if the defaults do not fit.",
     "Start in focus mode and work on one task until the alert.",
     "Take the prompted break, then review completed sessions and today's focus time."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Do I have to use 25 minutes?",
      "answer": "No. It is only the default. Deep work may need longer blocks, while difficult starts may benefit from shorter blocks."
     },
     {
      "question": "When does the long break happen?",
      "answer": "The component is designed around a cycle where four focus sessions lead into a long break."
     },
     {
      "question": "What do the daily stats mean?",
      "answer": "They show completed focus sessions and accumulated focus minutes as a lightweight view of today's effort."
     }
    ],
    "disclaimer": "This tool supports productivity habits and does not diagnose or treat sleep, burnout, ADHD, or other health conditions."
   }
  },
  "ja": {
   "title": "ポモドーロタイマー — 集中力・生産性向上ツール",
   "description": "ポモドーロテクニックで生産性を高めよう。25分集中＋5分休憩サイクル、ビジュアルプログレスリング、音声アラート、本日の統計対応。",
   "c": {
    "introTitle": "ポモドーロは集中と回復を一つのサイクルで扱います",
    "intro": "長時間の作業を続けると集中力が下がり、始める負担も大きくなります。このタイマーは集中、短い休憩、数回後の長い休憩を、進捗リング、通知音、今日の集中統計で管理します。",
    "formulaTitle": "ポモドーロの考え方",
    "formulas": [
     {
      "title": "集中セッション",
      "body": "一つの作業に取り組む時間です。初期値は25分ですが調整できます。"
     },
     {
      "title": "短い休憩",
      "body": "セッション間の回復時間です。勢いを保ちながら注意を戻すための短い区切りです。"
     },
     {
      "title": "長い休憩",
      "body": "複数の集中後に疲労を下げるための長めの回復時間です。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "集中、短い休憩、長い休憩の時間を必要に応じて調整します。",
     "集中モードで開始し、通知まで一つの作業に絞ります。",
     "通知後は休憩し、完了セッション数と今日の集中時間を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "必ず25分にする必要がありますか？",
      "answer": "いいえ。25分は初期値です。深い作業は長めに、始めにくい作業は短めにしても構いません。"
     },
     {
      "question": "長い休憩はいつ入りますか？",
      "answer": "コンポーネントは集中4回の後に長い休憩へ進むサイクルを基準にしています。"
     },
     {
      "question": "今日の統計は何を示しますか？",
      "answer": "完了した集中セッションと累計集中時間を表示し、その日の作業量を大まかに把握できます。"
     }
    ],
    "disclaimer": "このツールは生産性習慣の補助であり、睡眠、燃え尽き、ADHDなどの健康問題を診断・治療するものではありません。"
   }
  },
  "zh": {
   "title": "番茄钟计时器 — 专注力与生产力工具",
   "description": "用番茄工作法提升生产力。25分钟专注+5分钟休息循环，带可视化进度环、声音提醒和今日统计。",
   "c": {
    "introTitle": "番茄工作法把专注和恢复放在同一个循环中",
    "intro": "长时间硬撑容易降低注意力，也会增加开始任务的阻力。这个计时器用专注、短休息和多轮后的长休息组织工作，并提供进度环、声音提醒和今日专注统计。",
    "formulaTitle": "番茄钟概念",
    "formulas": [
     {
      "title": "专注时段",
      "body": "为一个任务保留的工作时间。默认 25 分钟，也可以调整。"
     },
     {
      "title": "短休息",
      "body": "两个专注时段之间的短恢复，用来重置注意力但不打断节奏。"
     },
     {
      "title": "长休息",
      "body": "多次专注后进行较长恢复，帮助降低累积疲劳。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "根据需要调整专注、短休息和长休息时长。",
     "从专注模式开始，在提醒前只处理一个任务。",
     "提醒后休息，并查看完成次数和今日专注时间。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "必须使用 25 分钟吗？",
      "answer": "不必。25 分钟只是默认值。深度工作可更长，难以开始的任务可更短。"
     },
     {
      "question": "什么时候进入长休息？",
      "answer": "组件按完成 4 次专注后进入长休息的循环设计。"
     },
     {
      "question": "今日统计表示什么？",
      "answer": "它显示已完成的专注次数和累计专注分钟数，帮助快速了解当天投入。"
     }
    ],
    "disclaimer": "本工具用于辅助生产力习惯，不能诊断或治疗睡眠、倦怠、ADHD 等健康问题。"
   }
  },
  "fr": {
   "title": "Minuterie Pomodoro — Outil de Concentration et Productivité",
   "description": "Boostez votre productivité avec la technique Pomodoro. Cycles de 25 min de concentration + 5 min de pause avec anneau de progression visuel.",
   "c": {
    "introTitle": "Pomodoro associe concentration et récupération dans un même cycle",
    "intro": "Travailler trop longtemps sans pause peut réduire l'attention et rendre le démarrage plus difficile. Ce minuteur organise concentration, pauses courtes et pause longue après plusieurs sessions, avec anneau de progression, alertes sonores et statistiques du jour.",
    "formulaTitle": "Notions Pomodoro",
    "formulas": [
     {
      "title": "Session de concentration",
      "body": "Bloc protégé pour une seule tâche. La valeur par défaut est 25 minutes, ajustable."
     },
     {
      "title": "Pause courte",
      "body": "Court temps de récupération entre deux sessions pour retrouver l'attention sans perdre l'élan."
     },
     {
      "title": "Pause longue",
      "body": "Récupération plus longue après plusieurs sessions afin de limiter la fatigue cumulée."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Ajustez les durées de concentration, pause courte et pause longue si besoin.",
     "Démarrez en mode concentration et gardez une seule tâche jusqu'à l'alerte.",
     "Prenez la pause indiquée, puis consultez les sessions terminées et le temps du jour."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Dois-je utiliser 25 minutes ?",
      "answer": "Non. C'est seulement la valeur par défaut. Un travail profond peut demander plus long, un démarrage difficile plus court."
     },
     {
      "question": "Quand arrive la pause longue ?",
      "answer": "Le composant suit un cycle où quatre sessions de concentration mènent à une pause longue."
     },
     {
      "question": "Que signifient les statistiques du jour ?",
      "answer": "Elles indiquent les sessions terminées et les minutes de concentration cumulées pour la journée."
     }
    ],
    "disclaimer": "Cet outil soutient les habitudes de productivité et ne diagnostique ni ne traite sommeil, épuisement, TDAH ou autre condition de santé."
   }
  },
  "es": {
   "title": "Temporizador Pomodoro — Herramienta de Enfoque y Productividad",
   "description": "Aumenta tu productividad con la técnica Pomodoro. Ciclos de 25 min de enfoque + 5 min de pausa con anillo de progreso visual y estadísticas diarias.",
   "c": {
    "introTitle": "Pomodoro trata enfoque y recuperación como un mismo ciclo",
    "intro": "Trabajar durante demasiado tiempo seguido puede reducir la atención y hacer más difícil empezar. Este temporizador organiza sesiones de enfoque, pausas cortas y una pausa larga tras varias rondas, con anillo de progreso, alertas sonoras y estadísticas diarias.",
    "formulaTitle": "Conceptos Pomodoro",
    "formulas": [
     {
      "title": "Sesión de enfoque",
      "body": "Bloque protegido para una sola tarea. El valor predeterminado es 25 minutos, pero puede ajustarse."
     },
     {
      "title": "Pausa corta",
      "body": "Recuperación breve entre sesiones para resetear la atención sin perder impulso."
     },
     {
      "title": "Pausa larga",
      "body": "Descanso más largo después de varias sesiones para reducir la fatiga acumulada."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Ajusta duración de enfoque, pausa corta y pausa larga si lo necesitas.",
     "Empieza en modo enfoque y trabaja en una sola tarea hasta la alerta.",
     "Toma la pausa indicada y revisa sesiones completadas y tiempo de enfoque del día."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Tengo que usar 25 minutos?",
      "answer": "No. Es solo el valor predeterminado. El trabajo profundo puede requerir más tiempo y empezar una tarea difícil puede requerir menos."
     },
     {
      "question": "¿Cuándo aparece la pausa larga?",
      "answer": "El componente sigue un ciclo en el que cuatro sesiones de enfoque llevan a una pausa larga."
     },
     {
      "question": "¿Qué significan las estadísticas diarias?",
      "answer": "Muestran sesiones completadas y minutos acumulados de enfoque como vista ligera del esfuerzo del día."
     }
    ],
    "disclaimer": "Esta herramienta apoya hábitos de productividad y no diagnostica ni trata sueño, agotamiento, TDAH u otras condiciones de salud."
   }
  }
 },
 "metronome": {
  "ko": {
   "title": "메트로놈 — 온라인 무료 메트로놈",
   "description": "Web Audio API 기반 정확한 타이밍의 온라인 메트로놈. BPM 40~240, 탭 템포, 박자표(2/4·3/4·4/4·6/8), 프리셋 지원.",
   "c": {
    "introTitle": "메트로놈은 박자를 일정하게 유지하는 연습 기준입니다",
    "intro": "악기 연습, 보컬 리듬, 낭독 속도, 반복 동작 훈련에서는 일정한 박자가 필요해요. 이 온라인 메트로놈은 BPM 40-240, 탭 템포, 2/4·3/4·4/4·6/8 박자표, 기본 프리셋을 제공해 브라우저에서 바로 연습 기준을 만들 수 있어요.",
    "formulaTitle": "리듬 개념",
    "formulas": [
     {
      "title": "BPM",
      "body": "분당 박자 수입니다. 숫자가 높을수록 클릭 간격이 짧아져 더 빠른 템포가 됩니다."
     },
     {
      "title": "박자표",
      "body": "한 마디에 몇 박이 들어가는지 정합니다. 첫 박은 강조되어 구조를 느끼기 쉽습니다."
     },
     {
      "title": "탭 템포",
      "body": "직접 두드린 간격으로 현재 머릿속 템포를 숫자로 추정할 때 유용합니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "BPM 슬라이더, 입력칸, 프리셋, 탭 템포 중 하나로 속도를 정합니다.",
     "연습할 박자표를 선택하고 시작 버튼을 누릅니다.",
     "클릭과 시각 표시를 기준으로 연주, 낭독, 반복 동작을 맞춥니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "BPM은 어느 범위까지 지원하나요?",
      "answer": "페이지 메타와 컴포넌트 기준으로 40부터 240까지 조정할 수 있습니다."
     },
     {
      "question": "첫 박이 다르게 들리나요?",
      "answer": "예. 각 마디의 첫 박은 더 높은 음으로 스케줄되어 박자 구조를 파악하기 쉽습니다."
     },
     {
      "question": "전문 연주 녹음에 써도 되나요?",
      "answer": "연습용으로 적합합니다. 녹음 세션이나 무대에서는 지연이 검증된 전용 장비나 DAW 클릭을 쓰는 편이 안전합니다."
     }
    ],
    "disclaimer": "브라우저 오디오 타이밍은 기기 성능, 블루투스 지연, 절전 상태, 백그라운드 탭의 영향을 받을 수 있어요."
   }
  },
  "en": {
   "title": "Metronome — Free Online Metronome",
   "description": "Precise Web Audio API metronome. BPM 40–240, tap tempo, time signatures (2/4·3/4·4/4·6/8), and BPM presets included.",
   "c": {
    "introTitle": "A metronome gives practice a steady rhythmic reference",
    "intro": "Instrument practice, vocal rhythm, reading pace, and repeated movement drills all benefit from a stable beat. This online metronome offers BPM 40-240, tap tempo, 2/4, 3/4, 4/4, and 6/8 time signatures, plus tempo presets directly in the browser.",
    "formulaTitle": "Rhythm concepts",
    "formulas": [
     {
      "title": "BPM",
      "body": "Beats per minute. A higher number means shorter time between clicks and a faster tempo."
     },
     {
      "title": "Time signature",
      "body": "Defines how many beats belong in each measure. The first beat is accented for orientation."
     },
     {
      "title": "Tap tempo",
      "body": "Estimates the tempo you are feeling by measuring the spacing between your taps."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Set the tempo with the slider, input field, preset, or tap tempo.",
     "Choose the time signature for the pattern you want to practice.",
     "Start the metronome and align playing, speaking, or movement to the clicks."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "What BPM range is supported?",
      "answer": "The tool supports adjustment from 40 to 240 BPM."
     },
     {
      "question": "Is the first beat accented?",
      "answer": "Yes. The first beat of each measure is scheduled with a higher tone to make the meter easier to follow."
     },
     {
      "question": "Can I use this for professional recording?",
      "answer": "It is best for practice. For recording sessions or live performance, use a DAW click or dedicated hardware with verified latency."
     }
    ],
    "disclaimer": "Browser audio timing can be affected by device performance, Bluetooth latency, power saving, and background tab behavior."
   }
  },
  "ja": {
   "title": "メトロノーム — 無料オンラインメトロノーム",
   "description": "Web Audio API ベースの正確なタイミングのオンラインメトロノーム。BPM 40〜240、タップテンポ、拍子記号(2/4・3/4・4/4・6/8)対応。",
   "c": {
    "introTitle": "メトロノームは練習に一定のリズム基準を与えます",
    "intro": "楽器練習、歌のリズム、朗読速度、反復動作の練習では安定した拍が役立ちます。このオンラインメトロノームはBPM 40〜240、タップテンポ、2/4・3/4・4/4・6/8、テンポプリセットをブラウザで使えます。",
    "formulaTitle": "リズムの基本概念",
    "formulas": [
     {
      "title": "BPM",
      "body": "1分あたりの拍数です。数値が高いほどクリック間隔が短く、速いテンポになります。"
     },
     {
      "title": "拍子記号",
      "body": "1小節に何拍入るかを決めます。最初の拍は強調され、構造をつかみやすくなります。"
     },
     {
      "title": "タップテンポ",
      "body": "自分で叩いた間隔から、感じているテンポを数値として推定します。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "スライダー、入力欄、プリセット、タップテンポでBPMを設定します。",
     "練習したい拍子記号を選びます。",
     "開始して、演奏、発声、動作をクリックに合わせます。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "BPMはいくつまで設定できますか？",
      "answer": "このツールは40〜240 BPMの範囲で調整できます。"
     },
     {
      "question": "1拍目は強調されますか？",
      "answer": "はい。各小節の1拍目は高めの音で鳴り、拍子を追いやすくしています。"
     },
     {
      "question": "プロの録音に使えますか？",
      "answer": "練習用に適しています。録音や本番では、遅延を確認したDAWクリックや専用機材を使う方が安全です。"
     }
    ],
    "disclaimer": "ブラウザ音声のタイミングは端末性能、Bluetooth遅延、省電力、バックグラウンドタブの影響を受ける場合があります。"
   }
  },
  "zh": {
   "title": "节拍器 — 免费在线节拍器",
   "description": "基于 Web Audio API 的精准在线节拍器。支持 BPM 40–240、点击速度、拍号(2/4·3/4·4/4·6/8)和预设。",
   "c": {
    "introTitle": "节拍器为练习提供稳定的节奏参照",
    "intro": "乐器练习、声乐节奏、朗读速度和重复动作训练都需要稳定拍点。这个在线节拍器支持 BPM 40-240、点击速度、2/4、3/4、4/4、6/8 拍号和常用速度预设，可直接在浏览器中使用。",
    "formulaTitle": "节奏概念",
    "formulas": [
     {
      "title": "BPM",
      "body": "每分钟拍数。数值越高，点击间隔越短，速度越快。"
     },
     {
      "title": "拍号",
      "body": "定义每小节有几拍。每小节第一拍会被强调，便于感受结构。"
     },
     {
      "title": "点击速度",
      "body": "根据你连续点击的间隔估算当前心中的节奏速度。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "用滑块、输入框、预设或点击速度设置 BPM。",
     "选择练习所需的拍号。",
     "启动节拍器，并让演奏、朗读或动作跟随点击声。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "支持什么 BPM 范围？",
      "answer": "工具支持从 40 到 240 BPM 调整。"
     },
     {
      "question": "第一拍会强调吗？",
      "answer": "会。每小节第一拍使用更高音调，帮助你跟随拍号结构。"
     },
     {
      "question": "可以用于专业录音吗？",
      "answer": "它适合练习。录音或现场演出建议使用经过延迟验证的 DAW 点击或专用设备。"
     }
    ],
    "disclaimer": "浏览器音频计时可能受设备性能、蓝牙延迟、省电模式和后台标签页影响。"
   }
  },
  "fr": {
   "title": "Métronome — Métronome en Ligne Gratuit",
   "description": "Métronome en ligne précis basé sur Web Audio API. BPM 40–240, tap tempo, signatures rythmiques (2/4·3/4·4/4·6/8) et préréglages.",
   "c": {
    "introTitle": "Un métronome donne un repère rythmique stable à la pratique",
    "intro": "Instrument, chant, lecture à voix haute et exercices répétitifs gagnent à suivre un battement régulier. Ce métronome en ligne propose BPM 40-240, tap tempo, signatures 2/4, 3/4, 4/4 et 6/8, ainsi que des préréglages.",
    "formulaTitle": "Notions de rythme",
    "formulas": [
     {
      "title": "BPM",
      "body": "Battements par minute. Plus le nombre est élevé, plus l'intervalle entre les clics est court."
     },
     {
      "title": "Signature",
      "body": "Définit le nombre de battements par mesure. Le premier temps est accentué pour se repérer."
     },
     {
      "title": "Tap tempo",
      "body": "Estime le tempo ressenti en mesurant l'intervalle entre vos frappes."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Réglez le tempo avec le curseur, le champ, un préréglage ou le tap tempo.",
     "Choisissez la signature rythmique à pratiquer.",
     "Démarrez le métronome et alignez jeu, parole ou mouvement sur les clics."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Quelle plage BPM est prise en charge ?",
      "answer": "L'outil permet un réglage de 40 à 240 BPM."
     },
     {
      "question": "Le premier temps est-il accentué ?",
      "answer": "Oui. Le premier temps de chaque mesure utilise un son plus aigu pour suivre plus facilement la métrique."
     },
     {
      "question": "Puis-je l'utiliser en enregistrement professionnel ?",
      "answer": "Il convient surtout à la pratique. En session ou sur scène, préférez un clic DAW ou du matériel à latence vérifiée."
     }
    ],
    "disclaimer": "Le timing audio du navigateur peut être affecté par performance, latence Bluetooth, économie d'énergie et onglets en arrière-plan."
   }
  },
  "es": {
   "title": "Metrónomo — Metrónomo en Línea Gratuito",
   "description": "Metrónomo en línea preciso basado en Web Audio API. BPM 40–240, tap tempo, compases (2/4·3/4·4/4·6/8) y ajustes preestablecidos.",
   "c": {
    "introTitle": "Un metrónomo da una referencia rítmica estable para practicar",
    "intro": "La práctica instrumental, el ritmo vocal, la lectura en voz alta y los ejercicios repetitivos mejoran con un pulso estable. Este metrónomo en línea ofrece BPM 40-240, tap tempo, compases 2/4, 3/4, 4/4 y 6/8, además de preajustes.",
    "formulaTitle": "Conceptos de ritmo",
    "formulas": [
     {
      "title": "BPM",
      "body": "Pulsos por minuto. Un número más alto significa menos tiempo entre clics y tempo más rápido."
     },
     {
      "title": "Compás",
      "body": "Define cuántos pulsos hay en cada medida. El primer pulso se acentúa para orientarte."
     },
     {
      "title": "Tap tempo",
      "body": "Estima el tempo que sientes midiendo el intervalo entre tus pulsaciones."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Ajusta el tempo con el deslizador, campo, preajuste o tap tempo.",
     "Elige el compás que quieres practicar.",
     "Inicia el metrónomo y alinea interpretación, habla o movimiento con los clics."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Qué rango de BPM admite?",
      "answer": "La herramienta permite ajustar de 40 a 240 BPM."
     },
     {
      "question": "¿El primer pulso está acentuado?",
      "answer": "Sí. El primer pulso de cada compás usa un tono más alto para seguir mejor la métrica."
     },
     {
      "question": "¿Sirve para grabación profesional?",
      "answer": "Es mejor para práctica. En grabaciones o directo, usa un clic de DAW o hardware con latencia verificada."
     }
    ],
    "disclaimer": "La temporización de audio del navegador puede verse afectada por rendimiento, latencia Bluetooth, ahorro de energía y pestañas en segundo plano."
   }
  }
 },
 "percentage-calculator": {
  "ko": {
   "title": "퍼센트 계산기 4종 올인원 — 비율·증감율(%)·할인율 판매가 계산",
   "description": "전체의 N% 값 구하기, 특정 수량의 비율(%), 기준값 대비 증감률(%), 할인율 적용 후 최종 가격과 할인 절약액을 실시간으로 동시 계산합니다.",
   "c": {
    "introTitle": "퍼센트(%) 계산이 필요한 모든 순간을 한 화면에서 해결",
    "intro": "쇼핑할 때의 세일 할인율, 주식이나 매출의 전월 대비 증감률, 전체 목표치 중 현재 달성률 등 일상과 업무에서 자주 마주치는 4대 퍼센트 수식을 한눈에 계산할 수 있습니다.",
    "formulaTitle": "퍼센트 공식 및 활용 팁",
    "formulas": [
     {
      "title": "1. 전체의 N% 구하기",
      "body": "수식: 전체값 × (N / 100). 예: 50,000원의 15% 팁이나 부가세는 50,000 × 0.15 = 7,500원입니다."
     },
     {
      "title": "2. 특정 값의 비중(%) 구하기",
      "body": "수식: (특정값 / 전체값) × 100. 예: 120명 중 18명이 찬성했다면 (18 / 120) × 100 = 15%입니다."
     },
     {
      "title": "3. 증감률(%) 구하기",
      "body": "수식: ((변화값 - 기존값) / 기존값) × 100. 주가 변동이나 매출 신장률을 분석할 때 표준 공식입니다."
     },
     {
      "title": "4. 할인 가격 구하기",
      "body": "수식: 원가 × (1 - 할인율 / 100). 백화점이나 이커머스 세일 기간에 실제 결제할 금액을 즉시 확인합니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "계산하려는 유형(전체의 N%, 비중, 증감률, 할인가)의 칸을 찾습니다.",
     "숫자를 입력하면 바로 결과가 나옵니다.",
     "공식 설명으로 계산 과정을 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "퍼센트(%)와 퍼센트포인트(%p)의 차이는 무엇인가요?",
      "answer": "퍼센트(%)는 기존 값 대비 변화 비율을 의미하고, 퍼센트포인트(%p)는 이자율이나 지지율 등 퍼센트 단위 자체의 단순 산술적 차이를 말합니다. 예: 금리가 3%에서 4%로 오르면 1%p 상승이며, 33.3% 인상된 것입니다."
     },
     {
      "question": "모바일에서도 즉시 계산되나요?",
      "answer": "네, 숫자를 입력하거나 수정하는 즉시 별도의 계산 버튼 클릭 없이 4개 영역이 실시간 자동 연산됩니다."
     }
    ],
    "disclaimer": "결과는 소수점 둘째 자리 등에서 반올림될 수 있어요. 세금·금리 같은 공식 계산은 해당 기관 기준을 확인하세요."
   }
  },
  "en": {
   "title": "Percentage Calculator All-in-One — Proportion, Growth Rate & Discount Price",
   "description": "Calculate what is N% of X, what percentage X is of Y, percentage increase/decrease, and discounted price with savings in real time.",
   "c": {
    "introTitle": "All Essential Percentage Calculations on One Screen",
    "intro": "Whether calculating retail discounts, investment returns, market share, or growth curves, this tool provides instant answers across all four core percentage formulas.",
    "formulaTitle": "Percentage Formulas & Guide",
    "formulas": [
     {
      "title": "1. Finding N% of X",
      "body": "Formula: Total × (N / 100). Example: 15% tip on $50 is 50 × 0.15 = $7.50."
     },
     {
      "title": "2. Finding the Percentage Share",
      "body": "Formula: (Part / Whole) × 100. Example: 18 out of 120 people is 15%."
     },
     {
      "title": "3. Percentage Increase or Decrease",
      "body": "Formula: ((New - Old) / Old) × 100. Key for measuring revenue, traffic, or stock performance."
     },
     {
      "title": "4. Discount Price Calculation",
      "body": "Formula: Price × (1 - Discount / 100). Essential for shopping and clearance sales."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Find the box for the calculation you need (N% of a total, share, change, or sale price).",
     "Type the numbers and the result appears at once.",
     "Check the formula notes to see how it was worked out."
    ],
    "faqTitle": "Frequently Asked Questions",
    "faqs": [
     {
      "question": "What is the difference between % and percentage points (%p)?",
      "answer": "Percentage represents relative change, whereas percentage points represent the arithmetic difference between two percentage values."
     },
     {
      "question": "Does it update in real time?",
      "answer": "Yes, all 4 cards update simultaneously as you type without requiring page reloads."
     }
    ],
    "disclaimer": "Results may be rounded (for example to two decimals). For official tax or interest figures, check the issuing body’s rules."
   }
  },
  "ja": {
   "title": "パーセント計算機 4機能統合 — 割合・増減率(%)・割引価格シミュレーター",
   "description": "全体のN%、ある値が占める割合(%)、前年比・前回比の増減率(%)、セール割引後の支払額とお得額を同時に計算します。",
   "c": {
    "introTitle": "パーセント計算のすべてを1画面で完結",
    "intro": "セールの割引額、売上や株価の増減率、目標達成率など、日常やビジネスで頻繁に使う4大パーセント計算をリアルタイムで提供します。",
    "formulaTitle": "計算式と活用のヒント",
    "formulas": [
     {
      "title": "1. 全体のN%",
      "body": "計算式: 全体 × (N / 100)。消費税やチップの計算に便利です。"
     },
     {
      "title": "2. 全体に対する割合",
      "body": "計算式: (部分 / 全体) × 100。シェアやアンケート比率の計算に最適です。"
     },
     {
      "title": "3. 増減率(%)",
      "body": "計算式: ((変化後 - 変化前) / 変化前) × 100。売上や業績推移を分析します。"
     },
     {
      "title": "4. 割引計算",
      "body": "計算式: 元価格 × (1 - 割引率 / 100)。お買い物時の支払額を即座に確認できます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "必要な計算（全体のN%、割合、増減率、割引価格）の欄を探します。",
     "数字を入力するとすぐに結果が表示されます。",
     "公式の説明で計算過程を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "リアルタイムで計算されますか？",
      "answer": "はい、数値を入力した瞬間に4つのカードが同時に自動計算されます。"
     },
     {
      "question": "%と%ポイントの違いは？",
      "answer": "%は相対的な変化比率、%ポイントはパーセント数値同士の差分を表します。"
     }
    ],
    "disclaimer": "結果は小数点第2位などで四捨五入される場合があります。税金・金利など公式の計算は各機関の基準をご確認ください。"
   }
  },
  "zh": {
   "title": "多功能百分比计算器 — 比例数值·占比·涨跌幅(%)·折扣到手价",
   "description": "一站式实时计算某数的百分比、部分占整体的百分比、初始值与终值的增减百分比，以及打折后的优惠价格和立省金额。",
   "c": {
    "introTitle": "一站式解决生活与办公中的全部百分比计算",
    "intro": "无论是购物折扣、销售涨跌幅、完成率还是投资收益比，本工具均提供实时精准计算。",
    "formulaTitle": "百分比核心计算公式",
    "formulas": [
     {
      "title": "1. 计算N%数值",
      "body": "公式：总量 × (N / 100)。适用于计算服务费、税费等。"
     },
     {
      "title": "2. 计算占比份额",
      "body": "公式：(部分 / 总量) × 100。适用于统计占比、市场占有率。"
     },
     {
      "title": "3. 涨跌幅度计算",
      "body": "公式：((终值 - 初值) / 初值) × 100。适用于对比增长率。"
     },
     {
      "title": "4. 折扣优惠价格",
      "body": "公式：原价 × (1 - 折扣 / 100)。即刻知晓到手价与节省金额。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "找到所需计算（总数的N%、占比、增减率、折后价）对应的栏目。",
     "输入数字，结果立即显示。",
     "查看公式说明了解计算过程。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "是否支持实时计算？",
      "answer": "支持，输入数字即可实时看到四个模块的换算结果。"
     },
     {
      "question": "百分比与百分点的区别？",
      "answer": "百分比表示相对比例变动，百分点表示百分数之间的绝对差值。"
     }
    ],
    "disclaimer": "结果可能四舍五入（例如保留两位小数）。税费、利率等正式计算请以相关机构规定为准。"
   }
  },
  "fr": {
   "title": "Calculateur de Pourcentage Tout-en-Un — Part, Évolution & Prix Remisé",
   "description": "Calculez la valeur d'un pourcentage, la proportion relative, le taux d'augmentation ou de baisse, ainsi que le prix final avec remise.",
   "c": {
    "introTitle": "Tous vos calculs de pourcentage sur une seule interface",
    "intro": "Pourcentage d'une somme, part relative, taux d'évolution ou remise en magasin, obtenez vos résultats instantanément.",
    "formulaTitle": "Formules et astuces",
    "formulas": [
     {
      "title": "1. Portion (N% de X)",
      "body": "Formule : Total × (N / 100)."
     },
     {
      "title": "2. Proportion (X sur Y)",
      "body": "Formule : (Part / Total) × 100."
     },
     {
      "title": "3. Évolution en %",
      "body": "Formule : ((Valeur finale - Valeur initiale) / Valeur initiale) × 100."
     },
     {
      "title": "4. Prix après remise",
      "body": "Formule : Prix d'origine × (1 - Remise / 100)."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Repérez le bloc du calcul voulu (N % d’un total, part, variation ou prix soldé).",
     "Saisissez les nombres : le résultat s’affiche aussitôt.",
     "Consultez les formules pour voir le détail du calcul."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Le calcul est-il instantané ?",
      "answer": "Oui, la mise à jour se fait à la frappe sans rechargement de page."
     },
     {
      "question": "Différence entre % et point de pourcentage ?",
      "answer": "Le % exprime une variation relative, le point exprime la différence arithmétique directe."
     }
    ],
    "disclaimer": "Les résultats peuvent être arrondis (par exemple à deux décimales). Pour des montants officiels d’impôt ou d’intérêt, vérifiez les règles de l’organisme concerné."
   }
  },
  "es": {
   "title": "Calculadora de Porcentajes Todo en Uno — Proporción, Variación y Descuento",
   "description": "Calcula el N% de un total, qué porcentaje representa una cifra, el porcentaje de aumento o rebaja, y el precio final con descuento.",
   "c": {
    "introTitle": "Todas las operaciones con porcentajes en una sola pantalla",
    "intro": "Descuentos en compras, tasas de crecimiento económico, proporciones y aumentos calculados en tiempo real.",
    "formulaTitle": "Fórmulas clave de porcentaje",
    "formulas": [
     {
      "title": "1. Parte de un total (N% de X)",
      "body": "Fórmula: Total × (N / 100)."
     },
     {
      "title": "2. Proporción (X respecto a Y)",
      "body": "Fórmula: (Parte / Total) × 100."
     },
     {
      "title": "3. Tasa de cambio (%)",
      "body": "Fórmula: ((Valor final - Valor inicial) / Valor inicial) × 100."
     },
     {
      "title": "4. Precio con descuento",
      "body": "Fórmula: Precio original × (1 - Descuento / 100)."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Busca el bloque del cálculo que necesitas (N % de un total, proporción, variación o precio rebajado).",
     "Escribe los números y el resultado aparece al instante.",
     "Revisa las fórmulas para ver cómo se calculó."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Se actualiza al instante?",
      "answer": "Sí, todos los cálculos se realizan en tiempo real mientras escribes."
     },
     {
      "question": "¿Diferencia entre % y puntos porcentuales?",
      "answer": "El % es la variación relativa; los puntos representan la diferencia aritmética simple entre dos porcentajes."
     }
    ],
    "disclaimer": "Los resultados pueden redondearse (por ejemplo, a dos decimales). Para cifras oficiales de impuestos o intereses, consulta las normas del organismo correspondiente."
   }
  }
 },
 "ratio-calculator": {
  "ko": {
   "title": "비율 계산기 — a:b 기약화와 a:b = c:x 풀이",
   "description": "두 수의 비율을 가장 간단한 a:b 형태로 줄이고, a:b = c:x 비례식에서 x를 즉시 계산합니다.",
   "c": {
    "introTitle": "비율은 두 값의 상대적인 크기를 비교합니다",
    "intro": "비율은 화면 해상도, 레시피 배합, 지도 축척, 단가 비교처럼 서로 다른 두 값을 함께 볼 때 자주 쓰여요. 이 계산기는 a:b를 가장 간단한 정수비로 줄이고, a:b = c:x 형태의 비례식에서 빠진 x 값을 바로 계산해요.",
    "formulaTitle": "계산 공식",
    "formulas": [
     {
      "title": "a:b 기약화",
      "body": "a와 b를 최대공약수로 나누어 가장 작은 정수비로 만듭니다."
     },
     {
      "title": "비례식",
      "body": "a:b = c:x 이면 x = (b × c) ÷ a"
     },
     {
      "title": "예시",
      "body": "1920:1080 → 16:9, 2:3 = 10:x → x = 15"
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "비율 기약화에는 a와 b 값을 입력합니다.",
     "비례식 풀이에는 a, b, c 값을 입력하면 x가 즉시 표시됩니다.",
     "단위가 있는 값은 먼저 같은 단위로 맞춘 뒤 계산합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "1920:1080은 왜 16:9인가요?",
      "answer": "1920과 1080의 최대공약수는 120입니다. 둘 다 120으로 나누면 16과 9가 됩니다."
     },
     {
      "question": "소수 비율도 입력할 수 있나요?",
      "answer": "입력은 숫자로 받을 수 있지만 기약화는 반올림한 정수 기준으로 처리됩니다. 정밀한 소수 비율은 단위를 조정해 정수로 바꾼 뒤 계산하는 편이 좋습니다."
     },
     {
      "question": "a:b = c:x에서 a가 0이면?",
      "answer": "공식이 a로 나누기 때문에 a가 0이면 x를 정의할 수 없습니다."
     }
    ],
    "disclaimer": "이 도구는 일반적인 산술 계산용이에요. 세금·금융 등 공식 수치는 해당 기관의 기준을 확인하세요."
   }
  },
  "en": {
   "title": "Ratio Calculator — Simplify a:b and solve a:b = c:x",
   "description": "Simplify a two-number ratio into its smallest a:b form and solve x in the proportion a:b = c:x instantly.",
   "c": {
    "introTitle": "A ratio compares the relative size of two values",
    "intro": "Ratios show up in screen sizes, recipes, map scales, unit prices, and many everyday comparisons. This calculator reduces a:b to its simplest whole-number form and solves the missing x in a proportion written as a:b = c:x.",
    "formulaTitle": "Formulas",
    "formulas": [
     {
      "title": "Simplify a:b",
      "body": "Divide a and b by their greatest common divisor."
     },
     {
      "title": "Proportion",
      "body": "If a:b = c:x, then x = (b × c) ÷ a"
     },
     {
      "title": "Examples",
      "body": "1920:1080 → 16:9, 2:3 = 10:x → x = 15"
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "For ratio simplification, enter the a and b values.",
     "For proportion solving, enter a, b, and c; x appears instantly.",
     "When values have units, convert them to the same unit before calculating."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Why does 1920:1080 become 16:9?",
      "answer": "The greatest common divisor of 1920 and 1080 is 120. Dividing both by 120 gives 16 and 9."
     },
     {
      "question": "Can I enter decimal ratios?",
      "answer": "You can enter numeric values, but simplification uses rounded whole numbers. For precise decimal ratios, scale the units first so the inputs become integers."
     },
     {
      "question": "What if a is 0 in a:b = c:x?",
      "answer": "The formula divides by a, so x is not defined when a is 0."
     }
    ],
    "disclaimer": "This tool is for general arithmetic. For official figures such as taxes or finance, confirm with the relevant authority."
   }
  },
  "ja": {
   "title": "比率計算機 — a:bの簡約と a:b = c:x の解",
   "description": "2つの数の比を最も簡単なa:bにし、比例式 a:b = c:x のxをすぐに計算します。",
   "c": {
    "introTitle": "比率は2つの値の相対的な大きさを比べます",
    "intro": "比率は画面サイズ、レシピ、地図の縮尺、単価比較などでよく使われます。この計算機は a:b を最も簡単な整数比にし、a:b = c:x の形で欠けている x をすぐに求めます。",
    "formulaTitle": "計算式",
    "formulas": [
     {
      "title": "a:bを簡約",
      "body": "aとbを最大公約数で割り、最小の整数比にします。"
     },
     {
      "title": "比例式",
      "body": "a:b = c:x なら、x = (b × c) ÷ a"
     },
     {
      "title": "例",
      "body": "1920:1080 → 16:9、2:3 = 10:x → x = 15"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "比の簡約では a と b を入力します。",
     "比例式では a、b、c を入力すると x がすぐ表示されます。",
     "単位がある値は、先に同じ単位へそろえてから計算してください。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "1920:1080が16:9になるのはなぜ？",
      "answer": "1920と1080の最大公約数は120です。両方を120で割ると16と9になります。"
     },
     {
      "question": "小数の比も入力できますか？",
      "answer": "数値は入力できますが、簡約は丸めた整数を基準にします。正確な小数比では、先に単位を調整して整数にすると扱いやすくなります。"
     },
     {
      "question": "a:b = c:x で a が0なら？",
      "answer": "式では a で割るため、a が0のとき x は定義できません。"
     }
    ],
    "disclaimer": "このツールは一般的な計算用です。税金・金融などの公式数値は各機関の基準をご確認ください。"
   }
  },
  "zh": {
   "title": "比例计算器 — 化简 a:b 并求解 a:b = c:x",
   "description": "将两个数的比例化为最简 a:b，并即时求出比例式 a:b = c:x 中的 x。",
   "c": {
    "introTitle": "比例用于比较两个数值的相对大小",
    "intro": "比例常见于屏幕尺寸、配方、地图比例尺、单价比较等场景。这个计算器可以把 a:b 化为最简整数比，也可以在 a:b = c:x 的比例式中快速求出缺失的 x。",
    "formulaTitle": "计算公式",
    "formulas": [
     {
      "title": "化简 a:b",
      "body": "用 a 和 b 的最大公约数同时相除，得到最小整数比。"
     },
     {
      "title": "比例式",
      "body": "若 a:b = c:x，则 x = (b × c) ÷ a"
     },
     {
      "title": "示例",
      "body": "1920:1080 → 16:9，2:3 = 10:x → x = 15"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "化简比例时，输入 a 和 b。",
     "求解比例式时，输入 a、b、c，x 会即时显示。",
     "如果数值带有单位，请先换算为同一单位再计算。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "为什么 1920:1080 会化为 16:9？",
      "answer": "1920 和 1080 的最大公约数是 120。两者同时除以 120，就得到 16 和 9。"
     },
     {
      "question": "可以输入小数比例吗？",
      "answer": "可以输入数字，但化简会按四舍五入后的整数处理。若需要精确小数比例，建议先调整单位，使输入变成整数。"
     },
     {
      "question": "a:b = c:x 中 a 为 0 怎么办？",
      "answer": "公式需要除以 a，因此 a 为 0 时 x 没有定义。"
     }
    ],
    "disclaimer": "本工具用于一般运算。税务、金融等官方数字请以相关机构标准为准。"
   }
  },
  "fr": {
   "title": "Calculateur de Ratio — Simplifier a:b et résoudre a:b = c:x",
   "description": "Simplifiez un ratio à deux nombres dans sa forme a:b minimale et résolvez x dans la proportion a:b = c:x.",
   "c": {
    "introTitle": "Un ratio compare la taille relative de deux valeurs",
    "intro": "Les ratios apparaissent dans les tailles d'écran, les recettes, les échelles de carte, les prix unitaires et de nombreuses comparaisons. Ce calculateur réduit a:b à sa forme entière la plus simple et résout x dans a:b = c:x.",
    "formulaTitle": "Formules",
    "formulas": [
     {
      "title": "Simplifier a:b",
      "body": "Divisez a et b par leur plus grand commun diviseur."
     },
     {
      "title": "Proportion",
      "body": "Si a:b = c:x, alors x = (b × c) ÷ a"
     },
     {
      "title": "Exemples",
      "body": "1920:1080 → 16:9, 2:3 = 10:x → x = 15"
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Pour simplifier un ratio, saisissez les valeurs a et b.",
     "Pour résoudre une proportion, saisissez a, b et c ; x apparaît aussitôt.",
     "Si les valeurs ont des unités, convertissez-les d'abord dans la même unité."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Pourquoi 1920:1080 devient-il 16:9 ?",
      "answer": "Le plus grand commun diviseur de 1920 et 1080 est 120. En divisant les deux par 120, on obtient 16 et 9."
     },
     {
      "question": "Puis-je entrer des ratios décimaux ?",
      "answer": "Vous pouvez saisir des nombres, mais la simplification utilise des entiers arrondis. Pour un ratio décimal précis, changez d'abord l'échelle des unités afin d'obtenir des entiers."
     },
     {
      "question": "Que se passe-t-il si a vaut 0 dans a:b = c:x ?",
      "answer": "La formule divise par a ; x n'est donc pas défini lorsque a vaut 0."
     }
    ],
    "disclaimer": "Cet outil sert au calcul général. Pour des chiffres officiels (impôts, finance), vérifiez auprès de l'autorité compétente."
   }
  },
  "es": {
   "title": "Calculadora de Razones — Simplificar a:b y resolver a:b = c:x",
   "description": "Simplifica una razón de dos números a su forma mínima a:b y resuelve x en la proporción a:b = c:x al instante.",
   "c": {
    "introTitle": "Una razón compara el tamaño relativo de dos valores",
    "intro": "Las razones aparecen en tamaños de pantalla, recetas, escalas de mapas, precios unitarios y muchas comparaciones cotidianas. Esta calculadora reduce a:b a su forma entera más simple y resuelve la x faltante en a:b = c:x.",
    "formulaTitle": "Fórmulas",
    "formulas": [
     {
      "title": "Simplificar a:b",
      "body": "Divide a y b por su máximo común divisor."
     },
     {
      "title": "Proporción",
      "body": "Si a:b = c:x, entonces x = (b × c) ÷ a"
     },
     {
      "title": "Ejemplos",
      "body": "1920:1080 → 16:9, 2:3 = 10:x → x = 15"
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Para simplificar una razón, introduce los valores a y b.",
     "Para resolver una proporción, introduce a, b y c; x aparece al instante.",
     "Si los valores tienen unidades, conviértelos primero a la misma unidad."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Por qué 1920:1080 se convierte en 16:9?",
      "answer": "El máximo común divisor de 1920 y 1080 es 120. Al dividir ambos por 120 se obtiene 16 y 9."
     },
     {
      "question": "¿Puedo introducir razones decimales?",
      "answer": "Puedes introducir valores numéricos, pero la simplificación usa enteros redondeados. Para razones decimales precisas, escala primero las unidades para convertirlas en enteros."
     },
     {
      "question": "¿Qué pasa si a es 0 en a:b = c:x?",
      "answer": "La fórmula divide por a, así que x no está definida cuando a es 0."
     }
    ],
    "disclaimer": "Esta herramienta es para cálculo general. Para cifras oficiales como impuestos o finanzas, confirma con la autoridad correspondiente."
   }
  }
 },
 "discount-calculator": {
  "ko": {
   "title": "할인가 계산기 — 세일 가격·절약 금액",
   "description": "정가와 할인율을 입력하면 최종 할인가와 절약 금액을 계산합니다. 쿠폰 추가 할인(중복 할인)과 실질 할인율도 함께 보여줍니다.",
   "c": {
    "introTitle": "할인가 계산기란?",
    "intro": "정가에 할인율을 적용해 실제로 내는 최종 가격과 절약 금액을 계산해요. 쿠폰을 더 적용하는 중복 할인은 단순히 두 비율을 더하는 것이 아니라 차례로 곱해야 정확합니다(예: 20% + 추가 10%는 28% 할인).",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "중복 할인 정확 계산",
      "body": "1차 할인가에 추가 할인을 곱해 실질 할인율까지 보여줍니다."
     },
     {
      "title": "절약 금액 표시",
      "body": "최종 가격과 함께 얼마를 아끼는지 바로 확인합니다."
     },
     {
      "title": "통화 자동 표기",
      "body": "언어에 맞춰 통화 기호와 자릿수를 적용합니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "정가를 입력합니다.",
     "할인율(%)을 입력합니다.",
     "쿠폰 등 추가 할인이 있으면 입력하고 최종 가격을 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "20% 할인에 추가 10% 쿠폰이면 30% 할인인가요?",
      "answer": "아닙니다. 차례로 곱하므로 0.8 × 0.9 = 0.72, 즉 실질 28% 할인입니다."
     },
     {
      "question": "할인율을 모를 때 거꾸로 계산할 수 있나요?",
      "answer": "정가와 할인가를 알면 절약 금액 ÷ 정가 × 100으로 할인율을 구합니다."
     },
     {
      "question": "세금과 배송비는 포함되나요?",
      "answer": "이 도구는 상품 가격만 계산합니다. 세금·배송비는 결제 단계에서 별도로 확인하세요."
     }
    ],
    "disclaimer": "표시 가격은 추정치예요. 실제 결제 금액·세금·배송비는 판매처 기준을 확인하세요."
   }
  },
  "en": {
   "title": "Discount Calculator — Sale Price & Savings",
   "description": "Enter the original price and discount % to get the final sale price and how much you save. Supports stacked coupon discounts and effective discount rate.",
   "c": {
    "introTitle": "What is the discount calculator?",
    "intro": "It applies a discount to the original price to show the final price you pay and how much you save. Stacking a coupon is not simply adding the percentages — they multiply in sequence (e.g. 20% then an extra 10% equals 28% off, not 30%).",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Accurate stacked discounts",
      "body": "Multiplies the extra discount onto the sale price and shows the effective rate."
     },
     {
      "title": "Shows savings",
      "body": "See the final price and exactly how much you save."
     },
     {
      "title": "Locale currency",
      "body": "Applies the right currency symbol and decimals per language."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the original price.",
     "Enter the discount percentage.",
     "Add any extra coupon discount and read the final price."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "Is 20% off plus a 10% coupon 30% off?",
      "answer": "No. They multiply: 0.8 × 0.9 = 0.72, an effective 28% off."
     },
     {
      "question": "Can I find the discount rate in reverse?",
      "answer": "If you know the original and sale price, divide the savings by the original price and multiply by 100."
     },
     {
      "question": "Are tax and shipping included?",
      "answer": "This tool prices the item only. Confirm tax and shipping at checkout."
     }
    ],
    "disclaimer": "Prices shown are estimates. Confirm the actual total, tax, and shipping with the seller."
   }
  },
  "ja": {
   "title": "割引計算機 — セール価格・割引額",
   "description": "定価と割引率を入力すると最終価格と割引額を計算します。クーポンの追加割引（重ね掛け）と実質割引率も表示します。",
   "c": {
    "introTitle": "割引計算機とは？",
    "intro": "定価に割引率を適用して、実際に支払う最終価格と割引額を計算します。クーポンの重ね掛けは割引率を単純に足すのではなく、順番に掛け合わせます（例：20%＋追加10%は28%引き）。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "重ね割引も正確",
      "body": "1次割引価格に追加割引を掛け、実質割引率まで表示します。"
     },
     {
      "title": "割引額を表示",
      "body": "最終価格といくら得かを同時に確認できます。"
     },
     {
      "title": "通貨を自動表記",
      "body": "言語に合わせて通貨記号と桁数を適用します。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "定価を入力します。",
     "割引率(%)を入力します。",
     "クーポンなど追加割引があれば入力し最終価格を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "20%引きに10%クーポンで30%引き？",
      "answer": "いいえ。順に掛けるので 0.8 × 0.9 = 0.72、実質28%引きです。"
     },
     {
      "question": "割引率を逆算できますか？",
      "answer": "定価と割引価格が分かれば、割引額 ÷ 定価 × 100 で求められます。"
     },
     {
      "question": "税や送料は含まれますか？",
      "answer": "本ツールは商品価格のみです。税・送料は決済時にご確認ください。"
     }
    ],
    "disclaimer": "表示価格は推定値です。実際の支払額・税・送料は販売者にご確認ください。"
   }
  },
  "zh": {
   "title": "折扣计算器 — 折后价与节省金额",
   "description": "输入原价和折扣率，计算折后价和节省金额。支持优惠券叠加折扣和实际折扣率。",
   "c": {
    "introTitle": "什么是折扣计算器？",
    "intro": "把折扣率应用到原价上，显示实际支付的最终价格和节省的金额。叠加优惠券时折扣不是简单相加，而是依次相乘（例如先打8折再减10%，相当于优惠28%，而不是30%）。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "叠加折扣算得准",
      "body": "把追加折扣乘到折后价上，并显示实际折扣率。"
     },
     {
      "title": "显示节省金额",
      "body": "同时看到最终价格和省下多少钱。"
     },
     {
      "title": "按语言显示货币",
      "body": "根据语言使用相应的货币符号和小数位。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入原价。",
     "输入折扣率（%）。",
     "如有优惠券等追加折扣，一并输入并查看最终价格。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "打8折再用10%优惠券，等于优惠30%吗？",
      "answer": "不是。两者相乘：0.8 × 0.9 = 0.72，实际优惠28%。"
     },
     {
      "question": "能反推折扣率吗？",
      "answer": "知道原价和折后价时，用节省金额 ÷ 原价 × 100 即可。"
     },
     {
      "question": "包含税费和运费吗？",
      "answer": "本工具只计算商品价格。税费和运费请在结算时确认。"
     }
    ],
    "disclaimer": "显示的价格为估算值。实际支付金额、税费和运费以商家为准。"
   }
  },
  "fr": {
   "title": "Calculateur de remise — Prix soldé & économies",
   "description": "Saisissez le prix initial et la remise % pour obtenir le prix final et l'économie. Gère les remises cumulées (coupon) et la remise effective.",
   "c": {
    "introTitle": "Qu’est-ce que le calculateur de remise ?",
    "intro": "Il applique une remise au prix initial pour afficher le prix final payé et l’économie réalisée. Un coupon cumulé ne s’additionne pas : les remises se multiplient (ex. 20 % puis 10 % de plus = 28 % de remise, pas 30 %).",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Remises cumulées exactes",
      "body": "Multiplie la remise supplémentaire sur le prix soldé et affiche le taux effectif."
     },
     {
      "title": "Économie affichée",
      "body": "Voyez le prix final et ce que vous économisez."
     },
     {
      "title": "Devise selon la langue",
      "body": "Applique le symbole monétaire et les décimales adaptés."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez le prix initial.",
     "Saisissez le pourcentage de remise.",
     "Ajoutez une remise de coupon si besoin et lisez le prix final."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "20 % de remise plus un coupon de 10 %, cela fait 30 % ?",
      "answer": "Non. Elles se multiplient : 0,8 × 0,9 = 0,72, soit 28 % de remise effective."
     },
     {
      "question": "Peut-on retrouver le taux de remise ?",
      "answer": "Si vous connaissez le prix initial et le prix soldé : économie ÷ prix initial × 100."
     },
     {
      "question": "Taxes et livraison sont-elles incluses ?",
      "answer": "L’outil calcule seulement le prix de l’article. Vérifiez taxes et livraison au paiement."
     }
    ],
    "disclaimer": "Les prix affichés sont des estimations. Vérifiez le total, les taxes et la livraison auprès du vendeur."
   }
  },
  "es": {
   "title": "Calculadora de descuento — Precio rebajado y ahorro",
   "description": "Introduce el precio original y el descuento % para obtener el precio final y el ahorro. Admite descuentos acumulados (cupón) y descuento efectivo.",
   "c": {
    "introTitle": "¿Qué es la calculadora de descuento?",
    "intro": "Aplica un descuento al precio original para mostrar el precio final que pagas y cuánto ahorras. Un cupón acumulado no se suma: los descuentos se multiplican (p. ej., 20 % y luego otro 10 % = 28 % de descuento, no 30 %).",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Descuentos acumulados exactos",
      "body": "Multiplica el descuento extra sobre el precio rebajado y muestra el descuento efectivo."
     },
     {
      "title": "Muestra el ahorro",
      "body": "Ve el precio final y cuánto ahorras."
     },
     {
      "title": "Moneda según el idioma",
      "body": "Aplica el símbolo de moneda y los decimales adecuados."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el precio original.",
     "Introduce el porcentaje de descuento.",
     "Añade un cupón si lo hay y consulta el precio final."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿20 % de descuento más un cupón del 10 % es un 30 %?",
      "answer": "No. Se multiplican: 0,8 × 0,9 = 0,72, un 28 % de descuento efectivo."
     },
     {
      "question": "¿Puedo calcular el descuento al revés?",
      "answer": "Si conoces el precio original y el rebajado: ahorro ÷ precio original × 100."
     },
     {
      "question": "¿Incluye impuestos y envío?",
      "answer": "La herramienta solo calcula el precio del artículo. Confirma impuestos y envío al pagar."
     }
    ],
    "disclaimer": "Los precios mostrados son estimaciones. Confirma el total, impuestos y envío con el vendedor."
   }
  }
 },
 "tip-calculator": {
  "ko": {
   "title": "팁 계산기 — 총액·1인당·비율 계산",
   "description": "청구 금액에 팁 비율을 적용하고 인원수로 나누어 1인당 부담액을 계산합니다. 10~25% 프리셋 제공.",
   "c": {
    "introTitle": "팁 계산은 총액과 1인당 부담을 분명하게 나눕니다",
    "intro": "팁 문화가 있는 지역에서 식사나 택시, 서비스 비용을 나눌 때는 원래 청구 금액, 팁 비율, 인원수를 함께 봐야 해요. 이 계산기는 팁 총액, 팁 포함 총액, 1인당 부담액을 한 번에 계산해 계산 실수를 줄여요.",
    "formulaTitle": "계산식",
    "formulas": [
     {
      "title": "팁 금액",
      "body": "팁 = 청구 금액 × 팁 비율"
     },
     {
      "title": "총 결제액",
      "body": "총액 = 청구 금액 + 팁"
     },
     {
      "title": "1인당 부담",
      "body": "1인당 = 총액 / 인원수"
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "청구 금액을 입력합니다.",
     "팁 비율을 프리셋 또는 슬라이더로 정합니다.",
     "나누어 낼 인원수를 조정하고 1인당 금액을 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "세전 금액과 세후 금액 중 무엇을 넣나요?",
      "answer": "지역 관행에 따라 다릅니다. 미국처럼 세전 금액 기준으로 팁을 계산하는 경우가 많지만, 현장 관행을 확인하세요."
     },
     {
      "question": "팁 비율은 몇 %가 적당한가요?",
      "answer": "국가와 서비스 종류에 따라 다릅니다. 도구는 10~25% 프리셋을 제공하지만 의무 기준은 아닙니다."
     },
     {
      "question": "각자 주문 금액이 다르면 어떻게 하나요?",
      "answer": "이 도구는 균등 분할용입니다. 각자 주문 금액이 크게 다르면 개별 계산이 더 공정합니다."
     },
     {
      "question": "나라마다 팁 문화가 다른데 어떻게 맞추나요?",
      "answer": "미국은 세전 금액의 15~20%가 기준이고 6인 이상 단체에는 18~20%가 자동 청구되는 경우가 많습니다. 일본·한국은 팁 관행이 없고, 유럽 다수 국가는 청구서에 서비스료가 이미 포함되는 편입니다. 계산서의 'gratuity' 또는 'service charge' 항목을 먼저 확인하고, 이미 붙어 있으면 중복해서 얹지 마세요."
     }
    ],
    "disclaimer": "이 도구는 일반적인 계산용이에요. 공식 청구액과 현지 서비스 관행은 결제처 기준을 확인하세요."
   }
  },
  "en": {
   "title": "Tip Calculator — Split Bills with Any Tip %",
   "description": "Enter bill amount, tip percentage, and number of people to instantly calculate total, tip per person, and amount each owes.",
   "c": {
    "introTitle": "A tip calculation makes the total and each person's share clear",
    "intro": "When splitting a meal, ride, or service bill, the bill amount, tip percentage, and number of people all matter. This calculator shows the tip, total with tip, tip per person, and final amount owed by each person.",
    "formulaTitle": "Formulas",
    "formulas": [
     {
      "title": "Tip amount",
      "body": "Tip = bill amount × tip percentage"
     },
     {
      "title": "Total",
      "body": "Total = bill amount + tip"
     },
     {
      "title": "Per person",
      "body": "Per person = total / number of people"
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the bill amount.",
     "Choose a tip percentage with a preset or the slider.",
     "Set the number of people and read each person's share."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Should I tip on the pre-tax or after-tax amount?",
      "answer": "It depends on local custom. In many U.S. contexts people tip on the pre-tax subtotal, but the receipt and setting matter."
     },
     {
      "question": "What tip percentage is appropriate?",
      "answer": "It varies by country and service. The presets are common ranges, not a legal or universal requirement."
     },
     {
      "question": "What if everyone ordered different amounts?",
      "answer": "This tool assumes an equal split. If orders differ a lot, calculate each person's share separately."
     },
     {
      "question": "How do I adjust for different tipping cultures?",
      "answer": "In the US, 15-20% of the pre-tax subtotal is standard, and parties of six or more are often charged an automatic 18-20%. Japan and Korea have no tipping custom, and many European bills already include a service charge. Check the bill for a 'gratuity' or 'service charge' line first and do not tip twice on top of it."
     }
    ],
    "disclaimer": "This tool is for general calculation. Confirm official bill totals and local service customs with the relevant venue."
   }
  },
  "ja": {
   "title": "チップ計算機 — 合計・1人分・割り勘対応",
   "description": "請求額・チップ率・人数を入力してチップ合計と1人あたりの負担額を即座に計算します。",
   "c": {
    "introTitle": "チップ計算は合計額と1人分を明確にします",
    "intro": "チップ文化のある地域で食事やサービス代を分けるときは、請求額、チップ率、人数を同時に見る必要があります。このツールはチップ額、チップ込み合計、1人あたりの負担額をまとめて計算します。",
    "formulaTitle": "計算式",
    "formulas": [
     {
      "title": "チップ額",
      "body": "チップ = 請求額 × チップ率"
     },
     {
      "title": "合計",
      "body": "合計 = 請求額 + チップ"
     },
     {
      "title": "1人分",
      "body": "1人分 = 合計 / 人数"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "請求額を入力します。",
     "プリセットまたはスライダーでチップ率を選びます。",
     "人数を調整し、1人あたりの金額を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "税抜と税込のどちらで計算しますか？",
      "answer": "地域の慣習によります。米国では税抜小計を基準にすることが多いですが、現地の慣習を確認してください。"
     },
     {
      "question": "何%が適切ですか？",
      "answer": "国やサービスによって異なります。プリセットは一般的な目安で、必須ルールではありません。"
     },
     {
      "question": "注文額が人によって違う場合は？",
      "answer": "このツールは均等割り向けです。差が大きい場合は個別計算が公平です。"
     },
     {
      "question": "国によってチップ文化が違いますが、どう合わせますか？",
      "answer": "米国は税抜き小計の15〜20%が目安で、6人以上の団体には18〜20%が自動加算されることが多いです。日本や韓国にはチップの習慣がなく、欧州の多くは請求書にサービス料が含まれます。まず伝票の「gratuity」「service charge」欄を確認し、既に付いていれば重ねて払わないでください。"
     }
    ],
    "disclaimer": "このツールは一般的な計算用です。正式な請求額と現地の慣習は店舗・サービス提供者にご確認ください。"
   }
  },
  "zh": {
   "title": "小费计算机 — 轻松分摊帐单",
   "description": "输入消费金额、小费比例与人数，立即计算每人应付金额，支援10%至25%常见比例。",
   "c": {
    "introTitle": "小费计算能清楚分出总额和每人应付",
    "intro": "在有小费文化的地区分摊餐费、车费或服务费时，需要同时考虑账单金额、小费比例和人数。这个工具会计算小费、含小费总额、每人小费和每人最终应付金额。",
    "formulaTitle": "计算公式",
    "formulas": [
     {
      "title": "小费金额",
      "body": "小费 = 账单金额 × 小费比例"
     },
     {
      "title": "总额",
      "body": "总额 = 账单金额 + 小费"
     },
     {
      "title": "每人应付",
      "body": "每人 = 总额 / 人数"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入账单金额。",
     "用预设或滑杆选择小费比例。",
     "调整人数并查看每人应付金额。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "按税前还是税后金额给小费？",
      "answer": "取决于当地习惯。美国很多场景按税前小计计算，但应以具体账单和当地习惯为准。"
     },
     {
      "question": "小费比例多少合适？",
      "answer": "不同国家和服务类型差异很大。预设只是常见范围，不是强制标准。"
     },
     {
      "question": "每个人点的不一样怎么办？",
      "answer": "本工具适合平均分摊。若消费差异较大，建议分别计算更公平。"
     },
     {
      "question": "各国小费文化不同，该怎么调整？",
      "answer": "美国以税前小计的15~20%为标准，6人以上团体常自动加收18~20%。日本和韩国没有小费习惯，欧洲多数国家的账单已包含服务费。请先查看账单上的 gratuity 或 service charge 项目，若已包含就不要重复支付。"
     }
    ],
    "disclaimer": "本工具用于一般计算。正式账单金额和当地服务惯例请以商家或服务方为准。"
   }
  },
  "fr": {
   "title": "Calculateur de pourboire — Partager l'addition facilement",
   "description": "Saisissez le montant, le pourcentage de pourboire et le nombre de personnes pour calculer le total et la part de chacun.",
   "c": {
    "introTitle": "Le calcul du pourboire clarifie le total et la part de chacun",
    "intro": "Pour partager une addition avec pourboire, il faut combiner le montant, le pourcentage et le nombre de personnes. Ce calculateur affiche le pourboire, le total avec pourboire et la part finale de chacun.",
    "formulaTitle": "Formules",
    "formulas": [
     {
      "title": "Pourboire",
      "body": "Pourboire = montant × pourcentage"
     },
     {
      "title": "Total",
      "body": "Total = montant + pourboire"
     },
     {
      "title": "Par personne",
      "body": "Part = total / nombre de personnes"
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez le montant de l'addition.",
     "Choisissez un pourcentage de pourboire.",
     "Indiquez le nombre de personnes et lisez la part de chacun."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Faut-il calculer sur le montant HT ou TTC ?",
      "answer": "Cela dépend des usages locaux. Dans certains pays on utilise le sous-total avant taxe."
     },
     {
      "question": "Quel pourcentage choisir ?",
      "answer": "Il varie selon le pays et le service. Les préréglages sont des repères, pas une règle universelle."
     },
     {
      "question": "Et si chacun a consommé différemment ?",
      "answer": "L'outil suppose un partage égal. Si les montants varient, un calcul individuel est préférable."
     },
     {
      "question": "Comment m'adapter aux différentes cultures du pourboire ?",
      "answer": "Aux États-Unis, 15 à 20 % du sous-total hors taxes est la norme, et les groupes de six personnes ou plus se voient souvent appliquer 18 à 20 % automatiquement. Le Japon et la Corée n'ont pas de culture du pourboire, et de nombreuses additions européennes incluent déjà le service. Vérifiez d'abord la ligne « gratuity » ou « service charge » et ne payez pas deux fois."
     }
    ],
    "disclaimer": "Cet outil sert au calcul général. Pour le total officiel et les usages locaux, vérifiez auprès de l'établissement."
   }
  },
  "es": {
   "title": "Calculadora de propina — Divide la cuenta fácilmente",
   "description": "Ingresa el importe, el porcentaje de propina y el número de personas para calcular el total y la parte de cada uno al instante.",
   "c": {
    "introTitle": "Calcular la propina aclara el total y la parte de cada persona",
    "intro": "Al dividir una comida o servicio con propina, importan el importe, el porcentaje y el número de personas. Esta calculadora muestra propina, total con propina y pago final por persona.",
    "formulaTitle": "Fórmulas",
    "formulas": [
     {
      "title": "Propina",
      "body": "Propina = importe × porcentaje"
     },
     {
      "title": "Total",
      "body": "Total = importe + propina"
     },
     {
      "title": "Por persona",
      "body": "Por persona = total / número de personas"
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el importe de la cuenta.",
     "Elige el porcentaje de propina.",
     "Ajusta el número de personas y revisa cuánto paga cada una."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Se calcula antes o después de impuestos?",
      "answer": "Depende de la costumbre local. En muchos casos de EE. UU. se usa el subtotal antes de impuestos."
     },
     {
      "question": "¿Qué porcentaje es adecuado?",
      "answer": "Varía según país y servicio. Los preajustes son rangos comunes, no una obligación universal."
     },
     {
      "question": "¿Y si cada persona pidió algo distinto?",
      "answer": "La herramienta asume reparto igual. Si los consumos difieren mucho, conviene calcular por separado."
     },
     {
      "question": "¿Cómo me adapto a las distintas culturas de propina?",
      "answer": "En EE. UU. lo estándar es 15-20 % del subtotal antes de impuestos, y a los grupos de seis o más se les suele cargar un 18-20 % automático. Japón y Corea no tienen costumbre de propina, y muchas cuentas europeas ya incluyen el servicio. Revisa primero la línea «gratuity» o «service charge» y no pagues dos veces."
     }
    ],
    "disclaimer": "Esta herramienta es para cálculo general. Confirma el total oficial y las costumbres locales con el establecimiento correspondiente."
   }
  }
 },
 "dutch-pay-calculator": {
  "ko": {
   "title": "n빵 계산기 — 더치페이, 균등·비율 분배",
   "description": "총 금액과 인원을 입력해 더치페이를 계산합니다. 균등, 비율, 개별 고정금액 방식을 모두 지원합니다.",
   "c": {
    "introTitle": "n빵을 균등·비율·개별 금액으로 나누기",
    "intro": "총 금액을 참가자 수로 똑같이 나누거나, 비율(예: 2:1:1)이나 사람별 고정 금액으로 나눠요. 1인당 금액은 원 단위로 반올림해요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "균등 분배",
      "body": "총액 ÷ 인원으로 1인당 금액을 계산합니다."
     },
     {
      "title": "비율 분배",
      "body": "사람마다 비율을 정해 많이 먹은 사람이 더 내게 합니다."
     },
     {
      "title": "개별 지정",
      "body": "정해진 금액을 낸 사람을 빼고 나머지를 나눕니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "총 금액을 입력합니다.",
     "분배 방식(균등·비율·개별지정)을 고릅니다.",
     "참가자를 추가하고 비율이나 금액을 넣어 각자 낼 돈을 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "나누어떨어지지 않으면?",
      "answer": "1인당 금액을 원 단위로 반올림하므로 합계가 총액과 몇 원 다를 수 있어요. 그 차이는 한 사람이 맞춰 내면 됩니다."
     },
     {
      "question": "술 안 마신 사람은 덜 내게 할 수 있나요?",
      "answer": "비율 방식에서 그 사람의 비율을 낮추거나, 개별 지정으로 금액을 정하면 됩니다."
     },
     {
      "question": "송금까지 되나요?",
      "answer": "아니요. 계산만 하고, 입력한 값은 저장하거나 보내지 않아요."
     }
    ],
    "disclaimer": "계산 결과는 참고용이에요. 입력값은 브라우저 안에서만 계산하고 저장·전송하지 않아요."
   }
  },
  "en": {
   "title": "Dutch Pay Calculator — Equal, Ratio, or Custom Split",
   "description": "Calculate how to split a bill equally, by ratio, or with custom fixed amounts for each person.",
   "c": {
    "introTitle": "Split a bill equally, by ratio, or with fixed amounts",
    "intro": "Divide a total equally among people, by a ratio (for example 2:1:1), or with a fixed amount for some people. The calculator works in Korean won and rounds each share to a whole won.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Equal split",
      "body": "Total ÷ number of people gives each share."
     },
     {
      "title": "Ratio split",
      "body": "Give each person a weight so bigger eaters pay more."
     },
     {
      "title": "Custom amounts",
      "body": "Take out fixed payments, then split the rest."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the total amount.",
     "Choose a split mode: equal, ratio or custom.",
     "Add people, set ratios or amounts, and read what each person pays."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "What if it does not divide evenly?",
      "answer": "Each share is rounded to a whole won, so the shares can add up to a few won more or less than the total. One person can cover that gap."
     },
     {
      "question": "Can someone who did not drink pay less?",
      "answer": "Yes. Lower their ratio, or set a fixed amount for them in custom mode."
     },
     {
      "question": "Does it send money?",
      "answer": "No. It only calculates. Nothing you enter is stored or sent."
     }
    ],
    "disclaimer": "Results are a guide. The calculation runs in your browser and nothing is stored or sent."
   }
  },
  "ja": {
   "title": "割り勘計算機 — 均等・比率・個別設定に対応",
   "description": "合計金額と人数を入力して割り勘を計算します。均等、比率、個別固定額の分割に対応しています。",
   "c": {
    "introTitle": "割り勘を均等・比率・個別金額で計算",
    "intro": "合計金額を人数で均等に割るほか、比率（例：2:1:1）や人ごとの固定額で分けられます。計算は韓国ウォン単位で、1人あたりの金額を1ウォン単位に丸めます。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "均等割り",
      "body": "合計 ÷ 人数で1人あたりの金額を計算します。"
     },
     {
      "title": "比率割り",
      "body": "人ごとに比率を決め、多く食べた人が多く払うようにできます。"
     },
     {
      "title": "個別指定",
      "body": "固定額を払う人を除き、残りを分けます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "合計金額を入力します。",
     "分け方（均等・比率・個別指定）を選びます。",
     "参加者を追加して比率や金額を入れ、各自の支払額を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "割り切れないときは？",
      "answer": "1人あたりを1ウォン単位に丸めるため、合計が総額と数ウォン違うことがあります。差額は誰か1人が調整してください。"
     },
     {
      "question": "飲まなかった人の負担を減らせますか？",
      "answer": "比率方式でその人の比率を下げるか、個別指定で金額を決めます。"
     },
     {
      "question": "送金もできますか？",
      "answer": "いいえ。計算のみで、入力した値は保存・送信しません。"
     }
    ],
    "disclaimer": "結果は目安です。計算はブラウザ内で行い、入力値は保存・送信しません。"
   }
  },
  "zh": {
   "title": "AA制计算机 — 支援均分、比例和个别设定",
   "description": "输入总金额和人数，计算AA制分摊金额，支援均等、比例和个别固定金额模式。",
   "c": {
    "introTitle": "按均分、比例或固定金额分摊账单",
    "intro": "把总金额平均分给每个人，或按比例（如2:1:1）、按个人固定金额分摊。计算以韩元为单位，每人金额取整到1韩元。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "平均分摊",
      "body": "总额 ÷ 人数得出每人金额。"
     },
     {
      "title": "按比例分摊",
      "body": "为每人设定比例，吃得多的人多付。"
     },
     {
      "title": "个别指定",
      "body": "先扣除固定金额，再分摊剩余部分。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入总金额。",
     "选择分摊方式：平均、比例或个别指定。",
     "添加参与者，填写比例或金额，查看每人应付多少。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "除不尽怎么办？",
      "answer": "每人金额取整到1韩元，合计可能与总额相差几韩元，由一人补齐即可。"
     },
     {
      "question": "没喝酒的人能少付吗？",
      "answer": "可以。在比例模式下调低此人的比例，或在个别指定中设定金额。"
     },
     {
      "question": "能直接转账吗？",
      "answer": "不能。只做计算，输入内容不会保存或发送。"
     }
    ],
    "disclaimer": "结果仅供参考。计算在浏览器中完成，不保存也不发送任何输入。"
   }
  },
  "fr": {
   "title": "Calculateur de partage — Égal, ratio ou montant fixe",
   "description": "Calculez comment partager une note de façon égale, par ratio ou avec des montants fixes personnalisés.",
   "c": {
    "introTitle": "Partager une note à parts égales, par ratio ou par montant fixe",
    "intro": "Divisez un total à parts égales, selon un ratio (par exemple 2:1:1) ou avec un montant fixe pour certains. Le calcul se fait en wons coréens et chaque part est arrondie au won.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Parts égales",
      "body": "Total ÷ nombre de personnes = la part de chacun."
     },
     {
      "title": "Par ratio",
      "body": "Donnez un poids à chacun pour que les gros mangeurs paient plus."
     },
     {
      "title": "Montants fixes",
      "body": "Retirez les paiements fixes, puis partagez le reste."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez le montant total.",
     "Choisissez le mode : égal, ratio ou personnalisé.",
     "Ajoutez les personnes, réglez ratios ou montants et lisez ce que chacun paie."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Et si la division ne tombe pas juste ?",
      "answer": "Chaque part est arrondie au won : la somme peut différer du total de quelques wons, qu’une personne peut compléter."
     },
     {
      "question": "Quelqu’un qui n’a pas bu peut-il payer moins ?",
      "answer": "Oui : baissez son ratio ou fixez-lui un montant en mode personnalisé."
     },
     {
      "question": "L’outil envoie-t-il de l’argent ?",
      "answer": "Non. Il calcule seulement ; rien n’est enregistré ni envoyé."
     }
    ],
    "disclaimer": "Résultats indicatifs. Le calcul se fait dans votre navigateur ; rien n’est enregistré ni envoyé."
   }
  },
  "es": {
   "title": "Calculadora de pago compartido — Igual, ratio o personalizado",
   "description": "Calcula cómo dividir una cuenta de forma igual, por ratio o con montos fijos personalizados.",
   "c": {
    "introTitle": "Dividir una cuenta a partes iguales, por proporción o con importes fijos",
    "intro": "Divide un total a partes iguales, según una proporción (por ejemplo 2:1:1) o con un importe fijo para algunas personas. El cálculo se hace en wones coreanos y cada parte se redondea al won.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Partes iguales",
      "body": "Total ÷ número de personas = la parte de cada uno."
     },
     {
      "title": "Por proporción",
      "body": "Asigna un peso a cada persona para que quien más consumió pague más."
     },
     {
      "title": "Importes fijos",
      "body": "Descuenta los pagos fijos y divide el resto."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el importe total.",
     "Elige el modo: igual, proporción o personalizado.",
     "Añade personas, fija proporciones o importes y mira cuánto paga cada uno."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Y si no sale exacto?",
      "answer": "Cada parte se redondea al won, así que la suma puede diferir del total en unos wones; una persona puede cubrir esa diferencia."
     },
     {
      "question": "¿Puede pagar menos quien no bebió?",
      "answer": "Sí: baja su proporción o fija su importe en el modo personalizado."
     },
     {
      "question": "¿Envía dinero?",
      "answer": "No. Solo calcula; no se guarda ni se envía nada."
     }
    ],
    "disclaimer": "Resultados orientativos. El cálculo se hace en tu navegador y no se guarda ni se envía nada."
   }
  }
 },
 "unit-price-calculator": {
  "ko": {
   "title": "단위가격 계산기 — 어느 게 더 쌀까? 가성비 비교",
   "description": "가격과 용량을 입력하면 단위당 가격(g·mL·개당)을 계산해 어느 상품이 더 저렴한지 비교합니다. 대용량 vs 소용량 가성비 판단에 유용합니다.",
   "c": {
    "introTitle": "단위가격 계산기란?",
    "intro": "상품별 가격과 용량을 입력하면 단위당 가격(예: 1g당, 1mL당, 1개당)을 계산해 어느 쪽이 더 저렴한지 비교하는 도구예요. 마트에서 대용량과 소용량 중 가성비를 따질 때 유용해요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "가성비 비교",
      "body": "단위당 가격으로 진짜 더 싼 상품을 가립니다."
     },
     {
      "title": "최저가 강조",
      "body": "여러 상품 중 가장 저렴한 항목을 표시합니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "상품의 가격과 용량(수량), 단위를 입력합니다.",
     "상품을 원하는 만큼 추가합니다.",
     "단위가격이 가장 낮은 '최저가' 상품을 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "단위가격은 어떻게 계산하나요?",
      "answer": "가격 ÷ 용량 입니다. 예: 3,000원 500g = 6원/g."
     },
     {
      "question": "대용량이 항상 싼가요?",
      "answer": "아닙니다. 단위가격으로 비교해야 정확합니다. 가끔 소용량이 1g당 더 쌀 때도 있습니다."
     },
     {
      "question": "단위가 다르면?",
      "answer": "g과 kg처럼 단위가 다르면 같은 단위로 맞춰 입력해야 비교가 정확합니다(부피 변환기 참고)."
     }
    ],
    "disclaimer": "단위가격은 가격÷용량으로 계산해요. 단위가 다른 상품은 같은 단위로 맞춰 입력하세요."
   }
  },
  "en": {
   "title": "Unit Price Calculator — Compare Which Is Cheaper",
   "description": "Enter price and amount to get the price per unit (per g, mL, item) and see which product is the better value. Great for bulk vs small comparisons.",
   "c": {
    "introTitle": "What is the unit price calculator?",
    "intro": "Enter each product's price and amount to get the price per unit (per g, mL, item) and compare which is cheaper. Great for deciding bulk vs small sizes at the store.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "True value",
      "body": "Unit price reveals which is actually cheaper."
     },
     {
      "title": "Best highlighted",
      "body": "Marks the cheapest item among several."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter each product's price, amount, and unit.",
     "Add as many products as you like.",
     "See the 'best value' product with the lowest unit price."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How is unit price calculated?",
      "answer": "Price ÷ amount. E.g. $3.00 for 500 g = $0.006/g."
     },
     {
      "question": "Is bulk always cheaper?",
      "answer": "No. Compare by unit price; sometimes the smaller size is cheaper per gram."
     },
     {
      "question": "What if units differ?",
      "answer": "Convert to the same unit first (see the volume converter) for a fair comparison."
     }
    ],
    "disclaimer": "Unit price = price ÷ amount. Enter products in the same unit to compare fairly."
   }
  },
  "ja": {
   "title": "単価計算機 — どちらが安い？コスパ比較",
   "description": "価格と容量を入力すると単位あたりの価格(g・mL・個あたり)を計算し、どちらが安いか比較します。",
   "c": {
    "introTitle": "単価計算機とは？",
    "intro": "商品ごとの価格と容量を入力すると、単位あたりの価格(例: 1gあたり、1mLあたり、1個あたり)を計算し、どちらが安いか比較するツールです。大容量と小容量のコスパ判断に便利です。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "コスパ比較",
      "body": "単価で本当に安い商品を見極めます。"
     },
     {
      "title": "最安を強調",
      "body": "複数商品から最も安い項目を表示します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "商品の価格・容量(数量)・単位を入力します。",
     "商品を必要なだけ追加します。",
     "単価が最も低い「最安」商品を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "単価はどう計算しますか？",
      "answer": "価格 ÷ 容量 です。例: 3,000円 500g = 6円/g。"
     },
     {
      "question": "大容量は常に安い？",
      "answer": "いいえ。単価で比較すべきです。小容量の方が1gあたり安いこともあります。"
     },
     {
      "question": "単位が異なる場合は？",
      "answer": "g と kg のように単位が違う場合は同じ単位に揃えて入力してください(体積変換を参照)。"
     }
    ],
    "disclaimer": "単価は価格÷容量で計算します。単位が異なる商品は同じ単位に揃えて入力してください。"
   }
  },
  "zh": {
   "title": "单价计算器 — 比较哪个更划算",
   "description": "输入价格和容量，计算每单位价格(每g·mL·个)，比较哪个商品更便宜。",
   "c": {
    "introTitle": "什么是单价计算器？",
    "intro": "输入每件商品的价格和数量，算出每单位价格（每克、每毫升、每件），比较哪个更便宜。适合在商店里判断大包装和小包装哪个划算。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "看清真实价格",
      "body": "单价揭示哪件商品真正更便宜。"
     },
     {
      "title": "标出最划算",
      "body": "在多件商品中标记单价最低的一件。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入每件商品的价格、数量和单位。",
     "可以添加任意多件商品。",
     "查看单价最低的“最划算”商品。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "单价怎么算？",
      "answer": "价格 ÷ 数量。例如500克卖15元 = 每克0.03元。"
     },
     {
      "question": "大包装一定更便宜吗？",
      "answer": "不一定。按单价比较，有时小包装每克更便宜。"
     },
     {
      "question": "单位不同怎么办？",
      "answer": "先换算成同一单位（可用体积换算器）再比较。"
     }
    ],
    "disclaimer": "单价 = 价格 ÷ 数量。请用同一单位输入商品，才能公平比较。"
   }
  },
  "fr": {
   "title": "Calculateur de Prix Unitaire — comparer le meilleur prix",
   "description": "Saisissez le prix et la quantité pour obtenir le prix par unité et voir quel produit est le plus avantageux.",
   "c": {
    "introTitle": "Qu’est-ce que le calculateur de prix unitaire ?",
    "intro": "Saisissez le prix et la quantité de chaque produit pour obtenir le prix par unité (par g, mL, pièce) et voir lequel est le moins cher. Idéal pour choisir entre grand format et petit format en magasin.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Vrai rapport qualité-prix",
      "body": "Le prix unitaire montre lequel est vraiment moins cher."
     },
     {
      "title": "Meilleur choix signalé",
      "body": "Marque le produit le moins cher parmi plusieurs."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez le prix, la quantité et l’unité de chaque produit.",
     "Ajoutez autant de produits que vous voulez.",
     "Repérez le produit « meilleur prix » au prix unitaire le plus bas."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Comment le prix unitaire est-il calculé ?",
      "answer": "Prix ÷ quantité. Ex. 3,00 € pour 500 g = 0,006 €/g."
     },
     {
      "question": "Le grand format est-il toujours moins cher ?",
      "answer": "Non. Comparez au prix unitaire : le petit format est parfois moins cher au gramme."
     },
     {
      "question": "Et si les unités diffèrent ?",
      "answer": "Convertissez d’abord dans la même unité (voir le convertisseur de volume) pour comparer équitablement."
     }
    ],
    "disclaimer": "Prix unitaire = prix ÷ quantité. Saisissez les produits dans la même unité pour une comparaison juste."
   }
  },
  "es": {
   "title": "Calculadora de Precio Unitario — comparar cuál es más barato",
   "description": "Introduce precio y cantidad para obtener el precio por unidad y ver qué producto conviene más.",
   "c": {
    "introTitle": "¿Qué es la calculadora de precio unitario?",
    "intro": "Introduce el precio y la cantidad de cada producto para obtener el precio por unidad (por g, mL, pieza) y ver cuál es más barato. Ideal para decidir entre formato grande y pequeño en la tienda.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Valor real",
      "body": "El precio unitario revela cuál es realmente más barato."
     },
     {
      "title": "Mejor opción destacada",
      "body": "Marca el producto más barato entre varios."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el precio, la cantidad y la unidad de cada producto.",
     "Añade tantos productos como quieras.",
     "Mira el producto de «mejor valor» con el precio unitario más bajo."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cómo se calcula el precio unitario?",
      "answer": "Precio ÷ cantidad. P. ej., 3,00 € por 500 g = 0,006 €/g."
     },
     {
      "question": "¿El formato grande siempre es más barato?",
      "answer": "No. Compara por precio unitario: a veces el pequeño sale más barato por gramo."
     },
     {
      "question": "¿Y si las unidades son distintas?",
      "answer": "Convierte primero a la misma unidad (ver el conversor de volumen) para comparar de forma justa."
     }
    ],
    "disclaimer": "Precio unitario = precio ÷ cantidad. Introduce los productos en la misma unidad para comparar de forma justa."
   }
  }
 },
 "travel-budget-calculator": {
  "ko": {
   "title": "여행 예산 계산기 — 목적지별 여행 비용 계산",
   "description": "일본, 태국, 유럽 등 10개 여행지의 항공, 숙박, 식비, 교통비를 한번에 계산하세요. 예산 절약 팁도 제공.",
   "c": {
    "introTitle": "여행 예산은 항공권보다 숙박, 식비, 이동비의 누적이 더 중요할 때가 많습니다",
    "intro": "여행 비용은 목적지와 기간, 여행 스타일에 따라 크게 달라져요. 이 계산기는 항공, 숙박, 식비, 교통비를 나누어 입력하게 해 총예산과 1일 평균을 빠르게 확인하고 과소 예산을 줄이도록 도와요.",
    "formulaTitle": "예산 구성",
    "formulas": [
     {
      "title": "고정비",
      "body": "항공권, 보험, 비자처럼 인원이나 일정 전에 확정되는 비용입니다."
     },
     {
      "title": "일별 비용",
      "body": "lodging + food + transport + activities를 여행 일수만큼 누적합니다."
     },
     {
      "title": "예비비",
      "body": "환율, 수하물, 팁, 현지 변수에 대비해 여유 금액을 더합니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "목적지와 여행 일수를 선택하고 항공권 또는 이동 고정비를 입력합니다.",
     "숙박, 식비, 현지 교통, 관광 비용을 하루 기준으로 입력합니다.",
     "총액과 1일 평균을 확인한 뒤 환율과 예비비를 더해 최종 예산을 정합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "항공권 가격은 실시간인가요?",
      "answer": "아닙니다. 항공권과 숙박 가격은 시기와 예약 채널에 따라 변하므로 실제 예약 화면을 확인해야 합니다."
     },
     {
      "question": "예비비는 얼마나 잡는 것이 좋나요?",
      "answer": "여행 성격에 따라 다르지만 환율 변동과 돌발 비용을 위해 총액의 10-20% 정도를 별도로 보는 경우가 많습니다."
     },
     {
      "question": "여러 명이 갈 때는 어떻게 보나요?",
      "answer": "공유 가능한 숙박이나 렌터카는 인원수로 나누고, 식비와 입장료처럼 개인별 비용은 각자 계산하는 것이 정확합니다."
     }
    ],
    "disclaimer": "이 계산기는 여행 계획용 추정 도구예요. 실제 가격, 환율, 수수료, 성수기 요금, 현지 세금은 예약 전 반드시 확인하세요."
   }
  },
  "en": {
   "title": "Travel Budget Calculator — Estimate Trip Costs by Destination",
   "description": "Calculate flight, accommodation, food, and transport costs for 10 destinations. Get money-saving tips for your next trip.",
   "c": {
    "introTitle": "Travel budgets often depend as much on daily costs as on flights",
    "intro": "Trip cost changes with destination, length, season, and travel style. This calculator separates flights, lodging, food, transport, and activities so you can estimate the total and daily average before booking.",
    "formulaTitle": "Budget concepts",
    "formulas": [
     {
      "title": "Fixed costs",
      "body": "Flights, insurance, visas, and other costs known before daily spending."
     },
     {
      "title": "Daily costs",
      "body": "lodging + food + transport + activities multiplied by trip days."
     },
     {
      "title": "Buffer",
      "body": "Extra money for exchange rates, baggage, tips, delays, and local surprises."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Choose a destination and trip length, then enter flight or long-distance transport costs.",
     "Add daily lodging, food, local transport, and activity estimates.",
     "Review total and daily average, then add an exchange-rate and emergency buffer."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Are flight prices live?",
      "answer": "No. Flight and hotel prices change by date and booking channel, so confirm on the actual booking page."
     },
     {
      "question": "How much buffer should I add?",
      "answer": "It depends on the trip, but many travelers add 10-20% for exchange-rate changes and unexpected costs."
     },
     {
      "question": "How do I budget for a group?",
      "answer": "Split shared costs like lodging or rental cars, and calculate individual costs like meals and tickets per person."
     }
    ],
    "disclaimer": "This calculator is an estimate for travel planning. Confirm real prices, exchange rates, fees, peak-season charges, and local taxes before booking."
   }
  },
  "ja": {
   "title": "旅行予算計算機 — 目的地別旅行費用の見積もり",
   "description": "日本、タイ、ヨーロッパなど10か所の航空券、宿泊、食費、交通費を一括計算。節約ヒントも提供。",
   "c": {
    "introTitle": "旅行予算は航空券だけでなく日々の支出の積み上げが重要です",
    "intro": "旅行費用は目的地、日数、時期、旅のスタイルで大きく変わります。この計算機では航空券、宿泊、食事、交通、観光費を分けて入力し、総額と1日平均を確認できます。",
    "formulaTitle": "予算の考え方",
    "formulas": [
     {
      "title": "固定費",
      "body": "航空券、保険、ビザなど、日々の支出とは別に発生する費用です。"
     },
     {
      "title": "日別費用",
      "body": "lodging + food + transport + activitiesを旅行日数分だけ合計します。"
     },
     {
      "title": "予備費",
      "body": "為替、荷物、チップ、遅延、現地での予定外支出に備えます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "目的地と日数を選び、航空券や長距離移動費を入力します。",
     "宿泊、食費、現地交通、観光費を1日単位で入力します。",
     "総額と1日平均を見て、為替や予備費を加えた最終予算を考えます。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "航空券価格はリアルタイムですか？",
      "answer": "いいえ。航空券や宿泊費は日程と予約サイトで変わるため、実際の予約画面で確認してください。"
     },
     {
      "question": "予備費はいくら必要ですか？",
      "answer": "旅行内容によりますが、為替変動や突発費用に備えて総額の10-20%を見込むことがあります。"
     },
     {
      "question": "複数人旅行ではどう計算しますか？",
      "answer": "宿泊やレンタカーなど共有費は人数で割り、食費や入場料など個人費は一人ずつ計算すると正確です。"
     }
    ],
    "disclaimer": "この計算機は旅行計画の目安です。実際の価格、為替、手数料、繁忙期料金、現地税は予約前に確認してください。"
   }
  },
  "zh": {
   "title": "旅行预算计算器 — 按目的地估算旅行费用",
   "description": "一键计算日本、泰国、欧洲等10个目的地的机票、住宿、餐饮和交通费用，并获取省钱攻略。",
   "c": {
    "introTitle": "旅行预算不只看机票，日常支出的累积同样重要",
    "intro": "旅行费用会随目的地、天数、季节和旅行方式大幅变化。这个计算器把机票、住宿、餐饮、交通和活动费用分开输入，帮助在预订前估算总额和每日平均费用。",
    "formulaTitle": "预算概念",
    "formulas": [
     {
      "title": "固定费用",
      "body": "机票、保险、签证等在日常消费前就能确认的费用。"
     },
     {
      "title": "每日费用",
      "body": "lodging + food + transport + activities 再乘以旅行天数。"
     },
     {
      "title": "预备金",
      "body": "为汇率、行李、服务费、延误和当地意外支出预留金额。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "选择目的地和旅行天数，输入机票或长途交通费用。",
     "按天输入住宿、餐饮、当地交通和活动费用。",
     "查看总额和每日平均，再加入汇率和应急预备金。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "机票价格是实时的吗？",
      "answer": "不是。机票和住宿价格会随日期和预订渠道变化，请以实际预订页面为准。"
     },
     {
      "question": "预备金应留多少？",
      "answer": "视旅行情况而定，很多人会额外预留总额的10-20%，用于汇率变化和突发费用。"
     },
     {
      "question": "多人旅行怎么计算？",
      "answer": "住宿或租车等共享费用可按人数分摊，餐饮和门票等个人费用则按个人分别计算。"
     }
    ],
    "disclaimer": "本计算器用于旅行计划估算。实际价格、汇率、手续费、旺季价格和当地税费，请在预订前确认。"
   }
  },
  "fr": {
   "title": "Calculateur de budget voyage — Estimez vos coûts par destination",
   "description": "Calculez les frais de vol, hébergement, nourriture et transport pour 10 destinations. Obtenez des conseils pour économiser.",
   "c": {
    "introTitle": "Un budget voyage dépend autant des dépenses quotidiennes que du vol",
    "intro": "Le coût varie selon la destination, la durée, la saison et le style de voyage. Ce calculateur sépare vols, hébergement, repas, transport et activités pour estimer le total et la moyenne par jour.",
    "formulaTitle": "Repères de budget",
    "formulas": [
     {
      "title": "Coûts fixes",
      "body": "Vols, assurance, visa et frais connus avant les dépenses quotidiennes."
     },
     {
      "title": "Coûts par jour",
      "body": "lodging + food + transport + activities multipliés par le nombre de jours."
     },
     {
      "title": "Marge",
      "body": "Somme en plus pour change, bagages, pourboires, retards et imprévus locaux."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Choisissez la destination et la durée, puis saisissez les vols ou transports longue distance.",
     "Ajoutez hébergement, repas, transport local et activités par jour.",
     "Vérifiez le total et la moyenne quotidienne, puis ajoutez une marge de change et d'urgence."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Les prix des vols sont-ils en direct ?",
      "answer": "Non. Vols et hôtels changent selon les dates et les plateformes ; vérifiez la page de réservation."
     },
     {
      "question": "Quelle marge prévoir ?",
      "answer": "Cela dépend du voyage, mais 10-20% est souvent utile pour le change et les imprévus."
     },
     {
      "question": "Comment calculer pour un groupe ?",
      "answer": "Divisez les coûts partagés comme hébergement ou voiture, et comptez repas et billets par personne."
     }
    ],
    "disclaimer": "Ce calculateur fournit une estimation. Vérifiez prix réels, taux de change, frais, tarifs de haute saison et taxes locales avant de réserver."
   }
  },
  "es": {
   "title": "Calculadora de presupuesto de viaje — Costos por destino",
   "description": "Calcula vuelos, alojamiento, comida y transporte para 10 destinos. Obtén consejos para ahorrar en tu próximo viaje.",
   "c": {
    "introTitle": "El presupuesto de viaje depende tanto de gastos diarios como de vuelos",
    "intro": "El coste cambia según destino, duración, temporada y estilo de viaje. Esta calculadora separa vuelos, alojamiento, comida, transporte y actividades para estimar total y media diaria.",
    "formulaTitle": "Conceptos de presupuesto",
    "formulas": [
     {
      "title": "Costes fijos",
      "body": "Vuelos, seguro, visado y otros costes conocidos antes del gasto diario."
     },
     {
      "title": "Costes diarios",
      "body": "lodging + food + transport + activities multiplicado por días de viaje."
     },
     {
      "title": "Margen",
      "body": "Dinero extra para cambio, equipaje, propinas, retrasos e imprevistos locales."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Elige destino y duración, e introduce vuelos o transporte de larga distancia.",
     "Añade alojamiento, comida, transporte local y actividades por día.",
     "Revisa total y media diaria, y suma margen por cambio y emergencias."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Los precios de vuelos son en tiempo real?",
      "answer": "No. Vuelos y hoteles cambian por fecha y canal de reserva; confirma en la página real de compra."
     },
     {
      "question": "¿Cuánto margen conviene añadir?",
      "answer": "Depende del viaje, pero muchas personas añaden 10-20% para tipo de cambio e imprevistos."
     },
     {
      "question": "¿Cómo calculo para un grupo?",
      "answer": "Divide costes compartidos como alojamiento o coche, y calcula por persona comidas, entradas y otros gastos individuales."
     }
    ],
    "disclaimer": "Esta calculadora es una estimación para planificar. Confirma precios reales, cambio, comisiones, temporada alta e impuestos locales antes de reservar."
   }
  }
 },
 "fuel-cost-calculator": {
  "ko": {
   "title": "주유비 계산기 — 구간별 연료비·1인당 비용 무료 계산",
   "description": "서울↔부산 등 자주 찾는 구간 프리셋과 휘발유·경유·LPG 유종 선택으로 총 연료비와 1인당 주유비를 빠르게 계산하세요.",
   "c": {
    "introTitle": "주유비는 거리, 연비, 유가, 동승자 수의 조합입니다",
    "intro": "장거리 이동이나 함께 타는 여행에서는 총 주유비뿐 아니라 1인당 부담액을 미리 보는 것이 중요해요. 이 계산기는 이동 거리와 차량 연비, 유종별 가격, 인원수를 바탕으로 예상 연료비를 빠르게 계산해요.",
    "formulaTitle": "핵심 공식",
    "formulas": [
     {
      "title": "사용 연료",
      "body": "fuel = distance / efficiency"
     },
     {
      "title": "총 주유비",
      "body": "cost = fuel × pricePerLiter"
     },
     {
      "title": "1인당 비용",
      "body": "perPerson = totalCost / people"
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "주행 거리 또는 노선 프리셋을 선택합니다.",
     "차량 연비와 휘발유, 경유, LPG 등 유종 가격을 입력합니다.",
     "동승자 수를 넣어 총액과 1인당 예상 부담액을 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "고속도로 통행료도 포함되나요?",
      "answer": "이 페이지는 연료비 중심 계산입니다. 통행료, 주차비, 렌터카 비용은 별도로 더해야 합니다."
     },
     {
      "question": "실제 주유비와 차이가 나는 이유는 무엇인가요?",
      "answer": "정체, 공회전, 적재량, 에어컨 사용, 운전 습관, 실제 유가가 연비와 비용을 바꿀 수 있습니다."
     },
     {
      "question": "왕복 비용은 어떻게 계산하나요?",
      "answer": "편도 거리를 두 배로 입력하거나 왕복 거리 프리셋이 있으면 해당 값을 선택하면 됩니다."
     }
    ],
    "disclaimer": "이 계산기는 여행 예산을 위한 추정 도구예요. 실제 유가, 통행료, 차량 상태, 교통 상황에 따라 비용은 달라질 수 있어요."
   }
  },
  "en": {
   "title": "Fuel Cost Calculator — Trip Fuel Cost & Per-Person Split",
   "description": "Quickly calculate total fuel cost and cost per person for popular routes. Preset routes and fuel types (gasoline, diesel, LPG) included.",
   "c": {
    "introTitle": "Fuel cost combines distance, economy, fuel price, and passengers",
    "intro": "For road trips and shared rides, it helps to estimate both the total fuel cost and the per-person split before leaving. This calculator uses trip distance, vehicle efficiency, fuel price, and passenger count to give a practical estimate.",
    "formulaTitle": "Core formulas",
    "formulas": [
     {
      "title": "Fuel used",
      "body": "fuel = distance / efficiency"
     },
     {
      "title": "Total cost",
      "body": "cost = fuel × pricePerLiter"
     },
     {
      "title": "Per person",
      "body": "perPerson = totalCost / people"
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the driving distance or choose a route preset.",
     "Enter vehicle fuel efficiency and the gasoline, diesel, or LPG price.",
     "Add passenger count to see total fuel cost and an estimated split."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Are tolls included?",
      "answer": "No. This page focuses on fuel. Add tolls, parking, rental, and other trip costs separately."
     },
     {
      "question": "Why can actual fuel cost differ?",
      "answer": "Traffic, idling, cargo weight, air conditioning, driving style, and live fuel prices can all change the result."
     },
     {
      "question": "How do I calculate a round trip?",
      "answer": "Enter double the one-way distance, or choose a round-trip preset if one is available."
     }
    ],
    "disclaimer": "This calculator is an estimate for trip budgeting. Actual prices, tolls, vehicle condition, and traffic can change the final cost."
   }
  },
  "ja": {
   "title": "ガソリン代計算機 — ルート別燃料費・1人あたり費用を無料計算",
   "description": "ソウル↔釜山などよく使うルートと燃料種別（ガソリン・軽油・LPG）を選ぶだけで総燃料費と1人あたり費用をすぐ計算。",
   "c": {
    "introTitle": "ガソリン代は距離、燃費、単価、人数で決まります",
    "intro": "長距離移動や相乗りでは、総額だけでなく1人あたりの負担額も事前に見ておくと便利です。この計算機は走行距離、車の燃費、燃料単価、人数から燃料費の目安を計算します。",
    "formulaTitle": "基本公式",
    "formulas": [
     {
      "title": "使用燃料",
      "body": "fuel = distance / efficiency"
     },
     {
      "title": "総燃料費",
      "body": "cost = fuel × pricePerLiter"
     },
     {
      "title": "1人あたり",
      "body": "perPerson = totalCost / people"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "走行距離を入力するか、ルートのプリセットを選びます。",
     "車の燃費とガソリン、軽油、LPGなどの単価を入力します。",
     "人数を入れて総額と1人あたりの目安を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "高速料金も含まれますか？",
      "answer": "いいえ。このページは燃料費の計算が中心です。通行料、駐車場、レンタカー代は別途加算してください。"
     },
     {
      "question": "実際の費用と違うのはなぜ？",
      "answer": "渋滞、アイドリング、荷物、エアコン、運転方法、実際の燃料価格で結果は変わります。"
     },
     {
      "question": "往復はどう計算しますか？",
      "answer": "片道距離を2倍して入力するか、往復プリセットがあればそれを選びます。"
     }
    ],
    "disclaimer": "この計算機は旅行予算の目安です。実際の燃料価格、通行料、車両状態、交通状況により費用は変わります。"
   }
  },
  "zh": {
   "title": "油费计算器 — 路线油费与每人费用免费计算",
   "description": "通过首尔↔釜山等常用路线预设和汽油、柴油、LPG燃料类型，快速计算总油费及每人费用。",
   "c": {
    "introTitle": "油费由距离、油耗、油价和乘车人数共同决定",
    "intro": "长途出行或拼车时，提前估算总油费和每人分摊金额会更方便。这个计算器根据行驶距离、车辆油耗、燃料价格和人数，快速给出预算参考。",
    "formulaTitle": "核心公式",
    "formulas": [
     {
      "title": "使用燃料",
      "body": "fuel = distance / efficiency"
     },
     {
      "title": "总油费",
      "body": "cost = fuel × pricePerLiter"
     },
     {
      "title": "每人费用",
      "body": "perPerson = totalCost / people"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入行驶距离，或选择路线预设。",
     "输入车辆油耗，以及汽油、柴油或LPG价格。",
     "输入乘车人数，查看总油费和每人预计分摊金额。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "包含高速通行费吗？",
      "answer": "不包含。本页主要计算燃料费，通行费、停车费、租车费等需要另外加入。"
     },
     {
      "question": "为什么实际油费会不同？",
      "answer": "拥堵、怠速、载重、空调、驾驶习惯和实时油价都会影响结果。"
     },
     {
      "question": "往返怎么计算？",
      "answer": "可以输入单程距离的两倍，或选择可用的往返路线预设。"
     }
    ],
    "disclaimer": "本计算器用于旅行预算估算。实际油价、通行费、车辆状态和交通状况都可能改变最终费用。"
   }
  },
  "fr": {
   "title": "Calculateur de coût de carburant — Coût par trajet et par personne",
   "description": "Calculez rapidement le coût total en carburant et le coût par personne pour les trajets fréquents. Prédéfinis de routes et types de carburant inclus.",
   "c": {
    "introTitle": "Le coût carburant dépend de la distance, de la consommation, du prix et des passagers",
    "intro": "Pour un trajet ou un covoiturage, estimer le total et la part par personne évite les surprises. Ce calculateur combine distance, consommation du véhicule, prix du carburant et nombre de passagers.",
    "formulaTitle": "Formules clés",
    "formulas": [
     {
      "title": "Carburant utilisé",
      "body": "fuel = distance / efficiency"
     },
     {
      "title": "Coût total",
      "body": "cost = fuel × pricePerLiter"
     },
     {
      "title": "Par personne",
      "body": "perPerson = totalCost / people"
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la distance ou choisissez un itinéraire prédéfini.",
     "Indiquez la consommation et le prix de l'essence, du diesel ou du LPG.",
     "Ajoutez le nombre de passagers pour obtenir le total et la part estimée."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Les péages sont-ils inclus ?",
      "answer": "Non. L'outil calcule surtout le carburant. Ajoutez péages, parking, location et autres frais séparément."
     },
     {
      "question": "Pourquoi le coût réel peut-il varier ?",
      "answer": "Trafic, ralenti, charge, climatisation, conduite et prix du jour peuvent modifier la consommation."
     },
     {
      "question": "Comment calculer un aller-retour ?",
      "answer": "Doublez la distance aller ou choisissez un préréglage aller-retour s'il existe."
     }
    ],
    "disclaimer": "Ce calculateur fournit une estimation de budget. Prix réels, péages, état du véhicule et trafic peuvent changer le coût final."
   }
  },
  "es": {
   "title": "Calculadora de coste de combustible — Coste por trayecto y por persona",
   "description": "Calcula rápidamente el coste total de combustible y el coste por persona para rutas habituales. Incluye rutas y tipos de combustible predefinidos.",
   "c": {
    "introTitle": "El coste de combustible combina distancia, consumo, precio y pasajeros",
    "intro": "En viajes por carretera o coche compartido conviene estimar el total y la parte por persona antes de salir. Esta calculadora usa distancia, eficiencia del vehículo, precio del combustible y número de pasajeros.",
    "formulaTitle": "Fórmulas clave",
    "formulas": [
     {
      "title": "Combustible usado",
      "body": "fuel = distance / efficiency"
     },
     {
      "title": "Coste total",
      "body": "cost = fuel × pricePerLiter"
     },
     {
      "title": "Por persona",
      "body": "perPerson = totalCost / people"
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce la distancia o elige una ruta predefinida.",
     "Indica eficiencia del coche y precio de gasolina, diésel o LPG.",
     "Añade pasajeros para ver coste total y reparto estimado."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Incluye peajes?",
      "answer": "No. Esta página se centra en combustible. Añade peajes, aparcamiento, alquiler y otros costes por separado."
     },
     {
      "question": "¿Por qué puede variar el coste real?",
      "answer": "Tráfico, ralentí, carga, aire acondicionado, forma de conducir y precios reales cambian el consumo."
     },
     {
      "question": "¿Cómo calculo ida y vuelta?",
      "answer": "Introduce el doble de la distancia de ida o elige un preajuste de ida y vuelta si existe."
     }
    ],
    "disclaimer": "Esta calculadora es una estimación para presupuesto de viaje. Precios reales, peajes, estado del vehículo y tráfico pueden cambiar el coste final."
   }
  }
 },
 "fuel-efficiency-calculator": {
  "ko": {
   "title": "연비 계산기 — km/L · L/100km · MPG 단위 변환",
   "description": "연비를 km/L, L/100km, MPG 세 단위로 자유롭게 변환하세요. 자동차 연비 비교 무료 계산기.",
   "c": {
    "introTitle": "연비 단위는 높을수록 좋은 단위와 낮을수록 좋은 단위가 섞여 있습니다",
    "intro": "km/L와 MPG는 숫자가 클수록 효율이 좋고, L/100km는 숫자가 작을수록 효율이 좋아요. 이 계산기는 서로 다른 국가와 차량 자료에서 쓰는 단위를 한 화면에서 변환해 비교 실수를 줄여요.",
    "formulaTitle": "변환 공식",
    "formulas": [
     {
      "title": "km/L → L/100km",
      "body": "L/100km = 100 / kmPerLiter"
     },
     {
      "title": "L/100km → km/L",
      "body": "kmPerLiter = 100 / litersPer100km"
     },
     {
      "title": "MPG 변환",
      "body": "US MPG ≈ km/L × 2.352"
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "가지고 있는 연비 값의 단위를 선택합니다.",
     "숫자를 입력하면 다른 단위로 즉시 변환됩니다.",
     "차량 비교 시 같은 단위와 같은 측정 조건인지 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "L/100km는 왜 낮을수록 좋은가요?",
      "answer": "100km를 가는 데 필요한 연료량을 뜻하므로 숫자가 낮을수록 같은 거리를 더 적은 연료로 이동합니다."
     },
     {
      "question": "미국 MPG와 영국 MPG는 같나요?",
      "answer": "아닙니다. 갤런 크기가 달라 값이 다릅니다. 이 페이지의 MPG 기준은 일반적으로 쓰이는 US MPG입니다."
     },
     {
      "question": "공인 연비와 실제 연비가 다른 이유는 무엇인가요?",
      "answer": "주행 속도, 도로, 기온, 타이어, 정비 상태, 운전 습관이 실제 연비에 영향을 줍니다."
     }
    ],
    "disclaimer": "이 도구는 단위 변환과 비교 참고용이에요. 공인 연비, 구매 판단, 비용 계산은 제조사·정부 자료와 실제 운행 조건을 함께 확인하세요."
   }
  },
  "en": {
   "title": "Fuel Efficiency Calculator — km/L · L/100km · MPG Converter",
   "description": "Convert fuel efficiency between km/L, L/100km, and MPG instantly. Free car fuel economy comparison calculator.",
   "c": {
    "introTitle": "Fuel economy units mix higher-is-better and lower-is-better values",
    "intro": "km/L and MPG increase as efficiency improves, while L/100km gets smaller as efficiency improves. This converter keeps the units side by side so vehicle comparisons are less confusing.",
    "formulaTitle": "Conversion formulas",
    "formulas": [
     {
      "title": "km/L to L/100km",
      "body": "L/100km = 100 / kmPerLiter"
     },
     {
      "title": "L/100km to km/L",
      "body": "kmPerLiter = 100 / litersPer100km"
     },
     {
      "title": "MPG conversion",
      "body": "US MPG ≈ km/L × 2.352"
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Choose the unit your fuel economy value is currently in.",
     "Enter the number and review the converted values instantly.",
     "When comparing vehicles, make sure the unit and test conditions match."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Why is lower better for L/100km?",
      "answer": "It measures fuel used to drive 100 km, so a lower number means less fuel for the same distance."
     },
     {
      "question": "Are US MPG and UK MPG the same?",
      "answer": "No. The gallon size differs. This page treats MPG as US MPG unless otherwise stated."
     },
     {
      "question": "Why does real fuel economy differ from official figures?",
      "answer": "Speed, roads, weather, tires, maintenance, load, and driving style can all change real-world results."
     }
    ],
    "disclaimer": "This tool is for unit conversion and comparison. For official economy, purchase decisions, or cost planning, check manufacturer and government data plus real driving conditions."
   }
  },
  "ja": {
   "title": "燃費計算機 — km/L・L/100km・MPG 単位変換",
   "description": "燃費をkm/L、L/100km、MPGの3単位で自由に変換。自動車燃費比較の無料計算ツール。",
   "c": {
    "introTitle": "燃費単位には大きいほど良いものと小さいほど良いものがあります",
    "intro": "km/LとMPGは数値が大きいほど効率が良く、L/100kmは数値が小さいほど効率が良い単位です。この計算機は各単位を並べて変換し、車両比較の混乱を減らします。",
    "formulaTitle": "変換公式",
    "formulas": [
     {
      "title": "km/L → L/100km",
      "body": "L/100km = 100 / kmPerLiter"
     },
     {
      "title": "L/100km → km/L",
      "body": "kmPerLiter = 100 / litersPer100km"
     },
     {
      "title": "MPG変換",
      "body": "US MPG ≈ km/L × 2.352"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "手元の燃費値の単位を選びます。",
     "数値を入力すると他の単位にすぐ変換されます。",
     "車を比較するときは単位と測定条件が同じか確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "L/100kmはなぜ小さいほど良いのですか？",
      "answer": "100km走るために使う燃料量なので、数値が小さいほど同じ距離を少ない燃料で走れます。"
     },
     {
      "question": "米国MPGと英国MPGは同じですか？",
      "answer": "違います。ガロンの大きさが異なります。このページでは通常のUS MPGを基準にしています。"
     },
     {
      "question": "公称燃費と実燃費が違うのはなぜ？",
      "answer": "速度、道路、気温、タイヤ、整備状態、積載量、運転方法が実燃費に影響します。"
     }
    ],
    "disclaimer": "このツールは単位変換と比較の目安です。公称燃費、購入判断、費用計算ではメーカーや政府資料、実走行条件も確認してください。"
   }
  },
  "zh": {
   "title": "油耗计算器 — km/L · L/100km · MPG 单位换算",
   "description": "即时换算km/L、L/100km和MPG之间的油耗。免费汽车油耗比较计算器。",
   "c": {
    "introTitle": "油耗单位中既有越高越好，也有越低越好的指标",
    "intro": "km/L和MPG数值越高表示效率越好，而L/100km数值越低表示越省油。这个转换器把常用单位放在一起，帮助减少跨国家或跨车型比较时的误解。",
    "formulaTitle": "换算公式",
    "formulas": [
     {
      "title": "km/L转L/100km",
      "body": "L/100km = 100 / kmPerLiter"
     },
     {
      "title": "L/100km转km/L",
      "body": "kmPerLiter = 100 / litersPer100km"
     },
     {
      "title": "MPG换算",
      "body": "US MPG ≈ km/L × 2.352"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "选择当前油耗数值使用的单位。",
     "输入数字后，其他单位会即时显示。",
     "比较车辆时，请确认单位和测试条件是否一致。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "为什么L/100km越低越好？",
      "answer": "它表示行驶100公里需要的燃料量，数字越低说明同样距离消耗更少。"
     },
     {
      "question": "美国MPG和英国MPG一样吗？",
      "answer": "不一样。两者使用的加仑大小不同。本页默认按US MPG处理。"
     },
     {
      "question": "为什么实际油耗和官方数据不同？",
      "answer": "速度、道路、天气、轮胎、保养、载重和驾驶习惯都会影响真实油耗。"
     }
    ],
    "disclaimer": "本工具用于单位换算和比较参考。官方油耗、购车判断或费用预算，请结合厂家、政府资料和实际驾驶条件确认。"
   }
  },
  "fr": {
   "title": "Calculateur de Consommation de Carburant — km/L · L/100km · MPG",
   "description": "Convertissez la consommation de carburant entre km/L, L/100km et MPG instantanément. Calculateur gratuit d'économie de carburant.",
   "c": {
    "introTitle": "Les unités de consommation mélangent valeurs hautes et basses favorables",
    "intro": "km/L et MPG augmentent avec l'efficacité, tandis que L/100km diminue quand la voiture consomme moins. Ce convertisseur affiche les unités ensemble pour comparer plus clairement.",
    "formulaTitle": "Formules de conversion",
    "formulas": [
     {
      "title": "km/L vers L/100km",
      "body": "L/100km = 100 / kmPerLiter"
     },
     {
      "title": "L/100km vers km/L",
      "body": "kmPerLiter = 100 / litersPer100km"
     },
     {
      "title": "Conversion MPG",
      "body": "US MPG ≈ km/L × 2.352"
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Choisissez l'unité de la valeur que vous possédez.",
     "Saisissez le nombre pour voir les conversions instantanément.",
     "Pour comparer des voitures, vérifiez que l'unité et les conditions d'essai sont comparables."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Pourquoi un L/100km plus bas est-il meilleur ?",
      "answer": "Il indique le carburant nécessaire pour 100 km. Plus le chiffre est bas, moins la voiture consomme."
     },
     {
      "question": "US MPG et UK MPG sont-ils identiques ?",
      "answer": "Non. Le gallon n'a pas la même taille. Cette page utilise le US MPG sauf mention contraire."
     },
     {
      "question": "Pourquoi la consommation réelle diffère-t-elle des chiffres officiels ?",
      "answer": "Vitesse, route, météo, pneus, entretien, charge et conduite modifient la consommation réelle."
     }
    ],
    "disclaimer": "Cet outil sert à convertir et comparer. Pour les chiffres officiels, l'achat ou le budget, vérifiez les données constructeur, publiques et vos conditions de conduite."
   }
  },
  "es": {
   "title": "Calculadora de Eficiencia de Combustible — km/L · L/100km · MPG",
   "description": "Convierte la eficiencia de combustible entre km/L, L/100km y MPG al instante. Calculadora gratuita de comparación de consumo de combustible.",
   "c": {
    "introTitle": "Las unidades de consumo mezclan valores donde más o menos es mejor",
    "intro": "km/L y MPG suben cuando mejora la eficiencia, mientras que L/100km baja cuando el coche consume menos. Este conversor muestra las unidades juntas para evitar confusiones al comparar.",
    "formulaTitle": "Fórmulas de conversión",
    "formulas": [
     {
      "title": "km/L a L/100km",
      "body": "L/100km = 100 / kmPerLiter"
     },
     {
      "title": "L/100km a km/L",
      "body": "kmPerLiter = 100 / litersPer100km"
     },
     {
      "title": "Conversión MPG",
      "body": "US MPG ≈ km/L × 2.352"
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Elige la unidad en la que está tu dato de consumo.",
     "Introduce el número y revisa las conversiones al instante.",
     "Al comparar vehículos, confirma que la unidad y las condiciones de prueba sean equivalentes."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Por qué en L/100km es mejor un número bajo?",
      "answer": "Mide el combustible necesario para recorrer 100 km. Cuanto más bajo, menos combustible se usa."
     },
     {
      "question": "¿US MPG y UK MPG son iguales?",
      "answer": "No. El galón tiene distinto tamaño. Esta página usa US MPG salvo que se indique otra cosa."
     },
     {
      "question": "¿Por qué el consumo real difiere del oficial?",
      "answer": "Velocidad, ruta, clima, neumáticos, mantenimiento, carga y conducción pueden cambiar el resultado real."
     }
    ],
    "disclaimer": "Esta herramienta sirve para convertir y comparar. Para cifras oficiales, compra o presupuesto, revisa datos del fabricante, organismos públicos y condiciones reales."
   }
  }
 },
 "calculator": {
  "ko": {
   "title": "계산기 — 기본 사칙연산과 퍼센트",
   "description": "덧셈, 뺄셈, 곱셈, 나눗셈, 퍼센트, 소수 입력을 지원하는 간단한 웹 계산기입니다.",
   "c": {
    "introTitle": "기본 계산기는 빠른 산술 확인용입니다",
    "intro": "ahoxy 계산기에서 표준 계산기 부분의 표시 연산자 처리와 결과 포맷 방식을 가져오고, 요청 범위에 맞춰 사칙연산, 퍼센트, 소수, 지우기 기능만 남겼습니다.",
    "formulaTitle": "계산식",
    "formulas": [
     {
      "title": "Operators",
      "body": "+ - × ÷ %"
     },
     {
      "title": "Evaluation",
      "body": "visual × ÷ -> * /"
     },
     {
      "title": "Precision",
      "body": "integer or toFixed(8)"
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "입력값을 현재 상황에 맞게 수정합니다.",
     "결과와 공식 카드를 함께 확인합니다.",
     "공식 수치가 필요한 경우 관련 기관 기준으로 다시 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "이 계산기는 무엇을 계산하나요?",
      "answer": "ahoxy 계산기에서 표준 계산기 부분의 표시 연산자 처리와 결과 포맷 방식을 가져오고, 요청 범위에 맞춰 사칙연산, 퍼센트, 소수, 지우기 기능만 남겼습니다."
     },
     {
      "question": "결과가 공식 확정액인가요?",
      "answer": "이 계산기는 일반적인 추정과 학습용입니다. 법률·세금·금융 등 공식 수치는 관련 기관과 전문가의 최신 기준을 확인하세요."
     },
     {
      "question": "어떤 로직을 사용했나요?",
      "answer": "ahoxy 계산기에서 표준 계산기 부분의 표시 연산자 처리와 결과 포맷 방식을 가져오고, 요청 범위에 맞춰 사칙연산, 퍼센트, 소수, 지우기 기능만 남겼습니다."
     }
    ],
    "disclaimer": "이 계산기는 일반적인 추정과 학습용입니다. 법률·세금·금융 등 공식 수치는 관련 기관과 전문가의 최신 기준을 확인하세요."
   }
  },
  "en": {
   "title": "Calculator — Basic Arithmetic and Percent",
   "description": "A simple web calculator for addition, subtraction, multiplication, division, percent, decimals, clear, and delete.",
   "c": {
    "introTitle": "A basic calculator is for quick arithmetic checks",
    "intro": "This ports the ahoxy standard calculator expression handling and result formatting, scoped to arithmetic operators, percent, decimals, clear, and delete.",
    "formulaTitle": "Formula",
    "formulas": [
     {
      "title": "Operators",
      "body": "+ - × ÷ %"
     },
     {
      "title": "Evaluation",
      "body": "visual × ÷ -> * /"
     },
     {
      "title": "Precision",
      "body": "integer or toFixed(8)"
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Adjust the inputs to match your situation.",
     "Read the result together with the formula cards.",
     "Confirm official figures with the relevant authority before acting."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "What does this calculator estimate?",
      "answer": "This ports the ahoxy standard calculator expression handling and result formatting, scoped to arithmetic operators, percent, decimals, clear, and delete."
     },
     {
      "question": "Is the result official?",
      "answer": "This calculator is a general estimate for learning and planning. Confirm official legal, tax, finance, or institutional figures before acting."
     },
     {
      "question": "What logic is used?",
      "answer": "This ports the ahoxy standard calculator expression handling and result formatting, scoped to arithmetic operators, percent, decimals, clear, and delete."
     }
    ],
    "disclaimer": "This calculator is a general estimate for learning and planning. Confirm official legal, tax, finance, or institutional figures before acting."
   }
  },
  "ja": {
   "title": "計算機 — 基本四則演算とパーセント",
   "description": "足し算、引き算、掛け算、割り算、パーセント、小数入力に対応するシンプルな計算機です。",
   "c": {
    "introTitle": "基本計算機は素早い計算確認用です",
    "intro": "ahoxy の標準計算機の式処理と結果形式を使い、四則演算、パーセント、小数、消去に絞っています。",
    "formulaTitle": "計算式",
    "formulas": [
     {
      "title": "Operators",
      "body": "+ - × ÷ %"
     },
     {
      "title": "Evaluation",
      "body": "visual × ÷ -> * /"
     },
     {
      "title": "Precision",
      "body": "integer or toFixed(8)"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "入力値を状況に合わせて修正します。",
     "結果と公式カードを合わせて確認します。",
     "公式数値が必要な場合は関係機関で確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "この計算機は何を計算しますか？",
      "answer": "ahoxy の標準計算機の式処理と結果形式を使い、四則演算、パーセント、小数、消去に絞っています。"
     },
     {
      "question": "結果は公式確定額ですか？",
      "answer": "この計算機は一般的な推定と学習用です。法律・税務・金融などの公式数値は最新の機関情報で確認してください。"
     },
     {
      "question": "どのロジックですか？",
      "answer": "ahoxy の標準計算機の式処理と結果形式を使い、四則演算、パーセント、小数、消去に絞っています。"
     }
    ],
    "disclaimer": "この計算機は一般的な推定と学習用です。法律・税務・金融などの公式数値は最新の機関情報で確認してください。"
   }
  },
  "zh": {
   "title": "计算器 — 基础四则运算和百分号",
   "description": "支持加、减、乘、除、百分号、小数、清除和删除的简洁网页计算器。",
   "c": {
    "introTitle": "基础计算器用于快速算术检查",
    "intro": "本工具移植 ahoxy 标准计算器的表达式处理和结果格式，并限定为四则运算、百分号、小数、清除和删除。",
    "formulaTitle": "计算公式",
    "formulas": [
     {
      "title": "Operators",
      "body": "+ - × ÷ %"
     },
     {
      "title": "Evaluation",
      "body": "visual × ÷ -> * /"
     },
     {
      "title": "Precision",
      "body": "integer or toFixed(8)"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "根据自己的情况修改输入值。",
     "结合结果和公式卡片一起查看。",
     "如需官方数字，请向相关机构确认。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "这个计算器估算什么？",
      "answer": "本工具移植 ahoxy 标准计算器的表达式处理和结果格式，并限定为四则运算、百分号、小数、清除和删除。"
     },
     {
      "question": "结果是官方确定金额吗？",
      "answer": "本计算器用于一般估算和学习规划。涉及法律、税务、金融或官方数字时，请确认相关机构的最新标准。"
     },
     {
      "question": "使用什么逻辑？",
      "answer": "本工具移植 ahoxy 标准计算器的表达式处理和结果格式，并限定为四则运算、百分号、小数、清除和删除。"
     }
    ],
    "disclaimer": "本计算器用于一般估算和学习规划。涉及法律、税务、金融或官方数字时，请确认相关机构的最新标准。"
   }
  },
  "fr": {
   "title": "Calculatrice — Arithmétique de Base et Pourcentage",
   "description": "Calculatrice simple pour addition, soustraction, multiplication, division, pourcentage, décimales et effacement.",
   "c": {
    "introTitle": "Une calculatrice basique sert aux vérifications rapides",
    "intro": "Il reprend le traitement d’expression et le formatage du calculateur ahoxy, limités aux opérations de base, pourcentage, décimales et effacement.",
    "formulaTitle": "Formule",
    "formulas": [
     {
      "title": "Operators",
      "body": "+ - × ÷ %"
     },
     {
      "title": "Evaluation",
      "body": "visual × ÷ -> * /"
     },
     {
      "title": "Precision",
      "body": "integer or toFixed(8)"
     }
    ],
    "howToTitle": "Comment l’utiliser",
    "steps": [
     "Adaptez les entrées à votre situation.",
     "Lisez le résultat avec les cartes de formule.",
     "Vérifiez les chiffres officiels auprès de l’autorité compétente."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Que calcule cet outil ?",
      "answer": "Il reprend le traitement d’expression et le formatage du calculateur ahoxy, limités aux opérations de base, pourcentage, décimales et effacement."
     },
     {
      "question": "Le résultat est-il officiel ?",
      "answer": "Ce calculateur fournit une estimation générale pour apprendre et planifier. Vérifiez les chiffres officiels juridiques, fiscaux ou financiers avant décision."
     },
     {
      "question": "Quelle logique est utilisée ?",
      "answer": "Il reprend le traitement d’expression et le formatage du calculateur ahoxy, limités aux opérations de base, pourcentage, décimales et effacement."
     }
    ],
    "disclaimer": "Ce calculateur fournit une estimation générale pour apprendre et planifier. Vérifiez les chiffres officiels juridiques, fiscaux ou financiers avant décision."
   }
  },
  "es": {
   "title": "Calculadora — Aritmética Básica y Porcentaje",
   "description": "Calculadora web sencilla para suma, resta, multiplicación, división, porcentaje, decimales y borrado.",
   "c": {
    "introTitle": "Una calculadora básica sirve para comprobaciones rápidas",
    "intro": "Porta el manejo de expresiones y formato de ahoxy, limitado a operaciones básicas, porcentaje, decimales y borrado.",
    "formulaTitle": "Fórmula",
    "formulas": [
     {
      "title": "Operators",
      "body": "+ - × ÷ %"
     },
     {
      "title": "Evaluation",
      "body": "visual × ÷ -> * /"
     },
     {
      "title": "Precision",
      "body": "integer or toFixed(8)"
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Ajusta los datos a tu situación.",
     "Lee el resultado junto con las tarjetas de fórmula.",
     "Confirma cifras oficiales con la autoridad correspondiente."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Qué estima esta calculadora?",
      "answer": "Porta el manejo de expresiones y formato de ahoxy, limitado a operaciones básicas, porcentaje, decimales y borrado."
     },
     {
      "question": "¿El resultado es oficial?",
      "answer": "Esta calculadora ofrece una estimación general para aprender y planificar. Confirma cifras oficiales legales, fiscales o financieras antes de actuar."
     },
     {
      "question": "¿Qué lógica se usa?",
      "answer": "Porta el manejo de expresiones y formato de ahoxy, limitado a operaciones básicas, porcentaje, decimales y borrado."
     }
    ],
    "disclaimer": "Esta calculadora ofrece una estimación general para aprender y planificar. Confirma cifras oficiales legales, fiscales o financieras antes de actuar."
   }
  }
 },
 "word-counter": {
  "ko": {
   "title": "글자수·바이트수 세기 — X·페이스북 글자수 제한 확인",
   "description": "텍스트를 붙여넣으면 단어 수, 글자 수, 바이트 수(UTF-8), 문장·단락 수, 읽기 시간을 즉시 확인합니다. X(트위터) 280자·Threads·Instagram·Facebook 글자수 제한도 함께 표시합니다.",
   "c": {
    "introTitle": "글자수와 단어수는 문장의 밀도와 분량을 점검하는 기본 지표입니다",
    "intro": "자기소개서, 이메일, 블로그 초안, 과제 문서는 분량 제한과 읽기 부담을 함께 관리해야 해요. 이 도구는 붙여넣은 텍스트의 단어 수, 글자 수, 문장·단락 수, 예상 읽기 시간, 자주 쓰는 단어를 즉시 보여주어 초안을 다듬는 기준을 제공해요.",
    "formulaTitle": "텍스트 통계 개념",
    "formulas": [
     {
      "title": "단어 수",
      "body": "공백으로 나뉜 토큰을 기준으로 글의 분량과 읽기 부담을 대략 파악합니다."
     },
     {
      "title": "공백 제외 글자수",
      "body": "지원서, 제목, 광고 문구처럼 글자 제한이 있는 입력칸을 확인할 때 유용합니다."
     },
     {
      "title": "읽기 시간",
      "body": "분당 약 200단어 기준으로 읽는 데 걸리는 시간을 추정해 문서 길이를 조절하게 돕습니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "검토할 텍스트를 입력창에 붙여넣거나 직접 작성합니다.",
     "단어, 글자, 문장, 단락, 읽기 시간 통계를 확인합니다.",
     "자주 쓰는 단어 목록을 보고 반복 표현이나 핵심어 비중을 조정합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "한국어 단어 수는 정확한가요?",
      "answer": "공백 기준으로 세기 때문에 형태소 분석과는 다릅니다. 빠른 분량 확인에는 유용하지만 공식 제출 기준은 해당 플랫폼의 카운터를 확인하세요."
     },
     {
      "question": "텍스트가 서버로 전송되나요?",
      "answer": "이 컴포넌트는 브라우저 상태에서 입력 텍스트를 계산합니다. 민감한 원문은 사용 환경과 브라우저 보안을 함께 고려하세요."
     },
     {
      "question": "읽기 시간은 어떤 기준인가요?",
      "answer": "분당 200단어의 일반적인 읽기 속도를 기준으로 추정합니다. 전문 문서나 외국어 텍스트는 실제 시간이 달라질 수 있습니다."
     }
    ],
    "disclaimer": "이 도구의 통계는 빠른 편집 참고용이며, 입사지원·시험·플랫폼 제출 기준과 다를 수 있어요."
   }
  },
  "en": {
   "title": "Word, Character & Byte Counter — X, Facebook Limits",
   "description": "Paste your text to instantly see word count, character count, UTF-8 byte count, sentences, paragraphs, and reading time — with live limits for X (Twitter) 280 characters, Threads, Instagram, and Facebook.",
   "c": {
    "introTitle": "Word and character counts help control length and density",
    "intro": "Applications, emails, article drafts, and school assignments often need both a length check and a readability check. This counter shows words, characters, sentences, paragraphs, estimated reading time, and frequent terms so you can revise with concrete signals instead of guessing.",
    "formulaTitle": "Text statistic concepts",
    "formulas": [
     {
      "title": "Word count",
      "body": "A whitespace-based estimate that helps judge length, scope, and reading effort."
     },
     {
      "title": "Characters without spaces",
      "body": "Useful for forms, titles, ads, and platforms that enforce strict character limits."
     },
     {
      "title": "Reading time",
      "body": "Estimated from about 200 words per minute, giving a quick sense of audience effort."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Paste or type the text you want to review.",
     "Check the word, character, sentence, paragraph, and reading-time statistics.",
     "Use the frequent-word list to spot repetition or adjust keyword focus."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Is the word count exact for every language?",
      "answer": "No. It uses a practical whitespace-based method, so languages and platforms with different token rules may count differently."
     },
     {
      "question": "Is my text sent to a server?",
      "answer": "The component calculates the statistics in browser state. Still, treat sensitive text carefully according to your device and browser environment."
     },
     {
      "question": "How is reading time estimated?",
      "answer": "It uses a general pace of about 200 words per minute. Technical documents or non-native reading can take longer."
     }
    ],
    "disclaimer": "These statistics are editing aids and may differ from official application, exam, or platform counters."
   }
  },
  "ja": {
   "title": "文字数・単語数カウンター — テキスト統計を即時確認",
   "description": "テキストを貼り付けると単語数、文字数、文章数、段落数、読書時間、頻出単語TOP5を即座に確認できます。",
   "c": {
    "introTitle": "文字数と単語数は文章の量と密度を確認する基本指標です",
    "intro": "応募文、メール、記事の下書き、課題文では、分量制限と読みやすさの両方を管理する必要があります。このツールは単語数、文字数、文、段落、推定読了時間、頻出語をすぐに表示し、推測ではなく数値で推敲できます。",
    "formulaTitle": "テキスト統計の考え方",
    "formulas": [
     {
      "title": "単語数",
      "body": "空白で区切られた単位をもとに、文章の長さや読む負担を大まかに見ます。"
     },
     {
      "title": "空白を除く文字数",
      "body": "フォーム、タイトル、広告文など、文字数制限がある場面で役立ちます。"
     },
     {
      "title": "読了時間",
      "body": "分あたり約200語を基準に、読者が必要とする時間を概算します。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "確認したいテキストを貼り付けるか入力します。",
     "単語数、文字数、文数、段落数、読了時間を確認します。",
     "頻出語を見て、繰り返し表現やキーワードの偏りを調整します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "日本語の単語数は正確ですか？",
      "answer": "空白を基準にするため、形態素解析とは異なります。公式提出では提出先のカウンターも確認してください。"
     },
     {
      "question": "入力した文章はサーバーに送られますか？",
      "answer": "このコンポーネントはブラウザ上の状態で統計を計算します。機密文書は利用環境にも注意してください。"
     },
     {
      "question": "読了時間の基準は何ですか？",
      "answer": "分あたり約200語の一般的な速度を使った推定です。専門文書や外国語では実際の時間が変わります。"
     }
    ],
    "disclaimer": "この統計は編集の参考用であり、応募、試験、各プラットフォームの公式カウントとは異なる場合があります。"
   }
  },
  "zh": {
   "title": "字数·单词计数器 — 即时确认文字统计",
   "description": "贴上文字后可立即查看单词数、字符数、句子数、段落数、阅读时间和使用频率最高的5个词。",
   "c": {
    "introTitle": "字数和词数是检查篇幅与信息密度的基础指标",
    "intro": "求职材料、邮件、文章草稿和作业常常既有篇幅限制，也需要控制阅读负担。这个工具会即时显示词数、字符数、句子数、段落数、预计阅读时间和高频词，帮助你用具体数据修改文本。",
    "formulaTitle": "文本统计概念",
    "formulas": [
     {
      "title": "词数",
      "body": "按空白分隔估算文本长度和阅读负担，适合快速判断篇幅。"
     },
     {
      "title": "不含空格字符数",
      "body": "适用于表单、标题、广告文案等有严格字数限制的场景。"
     },
     {
      "title": "阅读时间",
      "body": "按每分钟约 200 个词估算，帮助判断读者需要投入多少时间。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "粘贴或输入需要检查的文本。",
     "查看词数、字符数、句子、段落和阅读时间统计。",
     "根据高频词列表检查重复表达或关键词比例。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "中文词数一定准确吗？",
      "answer": "不一定。工具采用实用的空白分隔方式，不等同于中文分词算法。正式提交请再核对平台计数。"
     },
     {
      "question": "文本会发送到服务器吗？",
      "answer": "组件在浏览器状态中计算统计值。处理敏感文本时，仍需考虑设备和浏览器环境。"
     },
     {
      "question": "阅读时间如何估算？",
      "answer": "按每分钟约 200 个词的通用速度估算。专业文本或外语阅读的实际时间可能更长。"
     }
    ],
    "disclaimer": "这些统计用于编辑参考，可能与求职、考试或平台的官方计数不同。"
   }
  },
  "fr": {
   "title": "Compteur de Mots et Caractères",
   "description": "Collez votre texte pour voir instantanément le nombre de mots, caractères, phrases, paragraphes, le temps de lecture et les 5 mots les plus fréquents.",
   "c": {
    "introTitle": "Le nombre de mots et de caractères aide à maîtriser longueur et densité",
    "intro": "Candidatures, e-mails, brouillons d'articles et devoirs exigent souvent un contrôle de longueur et de lisibilité. Ce compteur affiche mots, caractères, phrases, paragraphes, temps de lecture estimé et termes fréquents pour réviser avec des repères concrets.",
    "formulaTitle": "Notions de statistiques textuelles",
    "formulas": [
     {
      "title": "Nombre de mots",
      "body": "Estimation basée sur les espaces, utile pour juger longueur, portée et effort de lecture."
     },
     {
      "title": "Caractères sans espaces",
      "body": "Pratique pour formulaires, titres, annonces et plateformes avec limites strictes."
     },
     {
      "title": "Temps de lecture",
      "body": "Estimation à partir d'environ 200 mots par minute pour mesurer l'effort du lecteur."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Collez ou saisissez le texte à examiner.",
     "Consultez mots, caractères, phrases, paragraphes et temps de lecture.",
     "Utilisez les mots fréquents pour repérer répétitions ou accentuer les bons termes."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Le comptage est-il exact dans toutes les langues ?",
      "answer": "Non. Il utilise une méthode pratique basée sur les espaces ; certaines langues ou plateformes appliquent d'autres règles."
     },
     {
      "question": "Mon texte est-il envoyé à un serveur ?",
      "answer": "Le composant calcule les statistiques dans l'état du navigateur. Traitez toutefois les textes sensibles avec prudence."
     },
     {
      "question": "Comment le temps de lecture est-il estimé ?",
      "answer": "Il repose sur une vitesse générale d'environ 200 mots par minute. Les textes techniques ou en langue étrangère peuvent prendre plus de temps."
     }
    ],
    "disclaimer": "Ces statistiques servent d'aide à l'édition et peuvent différer des compteurs officiels de candidature, d'examen ou de plateforme."
   }
  },
  "es": {
   "title": "Contador de Palabras y Caracteres",
   "description": "Pega tu texto para ver al instante el recuento de palabras, caracteres, oraciones, párrafos, tiempo de lectura y las 5 palabras más frecuentes.",
   "c": {
    "introTitle": "Los recuentos de palabras y caracteres ayudan a controlar longitud y densidad",
    "intro": "Solicitudes, correos, borradores y trabajos suelen requerir control de extensión y legibilidad. Este contador muestra palabras, caracteres, oraciones, párrafos, tiempo de lectura estimado y términos frecuentes para revisar con señales concretas.",
    "formulaTitle": "Conceptos de estadística textual",
    "formulas": [
     {
      "title": "Palabras",
      "body": "Estimación basada en espacios para juzgar extensión, alcance y esfuerzo de lectura."
     },
     {
      "title": "Caracteres sin espacios",
      "body": "Útil para formularios, títulos, anuncios y plataformas con límites estrictos."
     },
     {
      "title": "Tiempo de lectura",
      "body": "Estimado con unas 200 palabras por minuto para medir rápidamente el esfuerzo del lector."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Pega o escribe el texto que quieres revisar.",
     "Comprueba palabras, caracteres, oraciones, párrafos y tiempo de lectura.",
     "Usa la lista de palabras frecuentes para detectar repeticiones o ajustar el foco."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿El conteo es exacto en todos los idiomas?",
      "answer": "No. Usa un método práctico basado en espacios; algunas lenguas y plataformas aplican reglas diferentes."
     },
     {
      "question": "¿Mi texto se envía a un servidor?",
      "answer": "El componente calcula las estadísticas en el estado del navegador. Aun así, trata los textos sensibles con cuidado."
     },
     {
      "question": "¿Cómo se estima el tiempo de lectura?",
      "answer": "Usa una velocidad general de unas 200 palabras por minuto. Documentos técnicos o en otro idioma pueden tardar más."
     }
    ],
    "disclaimer": "Estas estadísticas son ayudas de edición y pueden diferir de contadores oficiales de solicitudes, exámenes o plataformas."
   }
  }
 }
};
