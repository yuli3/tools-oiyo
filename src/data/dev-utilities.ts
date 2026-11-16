// 개발·AI 도구 6종 페이지 문구 (2026-11-16, Gemini 이전 D). 생성: /tmp gen dev_copy.py — 손으로 고쳐도 된다.
import type { Locale } from '../lib/i18n';
import type { UtilityContent } from '../components/UtilityArticle.astro';
export const devUtilities: Record<string, Record<Locale, { meta: { title: string; description: string }; content: UtilityContent }>> = {
 "llm-api-cost-calculator": {
  "ko": {
   "meta": {
    "title": "LLM API 비용 계산기 — Claude 모델별 월 비용·캐시·배치 할인",
    "description": "하루 요청 수와 입력·출력 토큰으로 Claude Fable·Opus·Sonnet·Haiku의 한 달 API 비용을 계산해요. 프롬프트 캐시와 배치 할인을 켜고 끄며 무엇이 비용을 가장 크게 바꾸는지 그래프로 봐요."
   },
   "content": {
    "introTitle": "LLM API 비용은 토큰 수 × 단가로 정해져요",
    "intro": "AI 기능을 서비스에 붙이기 전에 가장 궁금한 건 '한 달에 얼마 나오나'예요. 이 계산기는 요청 1번에 들어가는 입력 토큰(시스템 프롬프트·대화 기록·문서)과 출력 토큰(답변·생각 토큰)에 모델별 100만 토큰당 가격을 곱해 하루·한 달 비용을 보여 줘요. 쉬운 설명 모드에서는 용도와 규모만 고르면 되고, 전문가 모드에서는 토큰 수·캐시 비율·배치·환율을 직접 넣어요.",
    "formulaTitle": "핵심 개념",
    "formulas": [
     {
      "title": "입력과 출력 단가",
      "body": "출력 토큰이 입력보다 5배 비싸요. 답을 짧게 받는 것만으로 비용이 크게 줄어요."
     },
     {
      "title": "프롬프트 캐시",
      "body": "같은 앞부분(시스템 프롬프트·긴 문서)을 다시 보내면 캐시 읽기 단가(입력의 약 5%)만 내요."
     },
     {
      "title": "배치 API",
      "body": "결과를 바로 받지 않아도 되는 작업은 배치로 보내면 50% 할인돼요."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "용도(챗봇·요약·에이전트·분류)와 하루 요청 수를 고릅니다.",
     "모델을 바꿔 가며 모델별 한 달 비용 막대를 비교합니다.",
     "'무엇이 비용을 가장 크게 바꾸나'에서 줄일 곳을 찾고 메모를 복사합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "토큰은 글자 몇 개인가요?",
      "answer": "영어는 1토큰이 약 4글자, 한국어는 1~2글자 정도예요. 정확한 수는 API의 토큰 세기(count_tokens)로 확인하세요."
     },
     {
      "question": "생각(thinking) 토큰도 돈이 드나요?",
      "answer": "네. 화면에 보이지 않아도 출력 토큰으로 청구돼요. 어려운 작업일수록 출력 토큰을 넉넉히 잡으세요."
     },
     {
      "question": "다른 회사 모델과도 비교할 수 있나요?",
      "answer": "'직접 입력 모델'에 그 회사의 현재 가격(100만 토큰당 달러)을 넣으면 같은 사용량으로 비교돼요."
     }
    ],
    "disclaimer": "가격은 2026-11-03 기준 Anthropic API 정가이고, 실제 청구액은 토큰 수·캐시 적중·요금제·세금에 따라 달라요."
   }
  },
  "en": {
   "meta": {
    "title": "LLM API Cost Calculator — monthly Claude cost with caching and batch",
    "description": "Estimate monthly API cost for Claude Fable, Opus, Sonnet and Haiku from requests per day and input/output tokens. Toggle prompt caching and the Batch API and see what moves the bill most."
   },
   "content": {
    "introTitle": "LLM API cost is tokens × price",
    "intro": "Before shipping an AI feature, the first question is what it will cost each month. This calculator multiplies the input tokens of each request (system prompt, history, documents) and the output tokens (answer plus thinking) by each model's price per million tokens. Simple mode only asks what it is for and how often; Expert mode takes exact token counts, cache share, batch and exchange rate.",
    "formulaTitle": "Key concepts",
    "formulas": [
     {
      "title": "Input vs output price",
      "body": "Output tokens cost five times more than input, so shorter answers cut cost fast."
     },
     {
      "title": "Prompt caching",
      "body": "Re-sending the same prefix (system prompt, long document) bills at the cache-read price, about 5% of input."
     },
     {
      "title": "Batch API",
      "body": "Work that can wait is 50% cheaper through the Batch API."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Pick a use case and requests per day.",
     "Switch models and compare the monthly cost bars.",
     "Use 'What moves the bill most' to find savings, then copy the summary."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "How many characters is a token?",
      "answer": "About 4 characters of English. Use the API's count_tokens endpoint for exact numbers."
     },
     {
      "question": "Are thinking tokens billed?",
      "answer": "Yes, as output tokens, even when the thinking is not shown."
     },
     {
      "question": "Can I compare other providers?",
      "answer": "Enter their current per-million prices into 'Custom model' to compare at the same usage."
     }
    ],
    "disclaimer": "Prices are Anthropic API list prices as of 2026-11-03. Actual bills depend on token counts, cache hits, plan and taxes."
   }
  },
  "ja": {
   "meta": {
    "title": "LLM API料金計算機 — Claudeモデル別の月額・キャッシュ・バッチ割引",
    "description": "1日のリクエスト数と入力・出力トークンから、Claude Fable・Opus・Sonnet・Haikuの月額API料金を計算します。プロンプトキャッシュとバッチ割引の効果もグラフで比較できます。"
   },
   "content": {
    "introTitle": "LLM APIの料金はトークン数×単価で決まります",
    "intro": "AI機能を導入する前に、月にいくらかかるかを見積もるツールです。1リクエストの入力トークン（システムプロンプト・履歴・文書）と出力トークン（回答・思考）に、モデルごとの100万トークン単価を掛けて日額・月額を出します。",
    "formulaTitle": "基本概念",
    "formulas": [
     {
      "title": "入力と出力の単価",
      "body": "出力は入力の5倍の単価です。回答を短くするだけで費用が下がります。"
     },
     {
      "title": "プロンプトキャッシュ",
      "body": "同じ前半部分を再送するとキャッシュ読み取り単価（入力の約5%）になります。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "用途と1日のリクエスト数を選びます。",
     "モデルを切り替えて月額を比較します。",
     "費用を大きく動かす要因を確認し、メモをコピーします。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "思考トークンも課金されますか？",
      "answer": "はい、表示されなくても出力トークンとして課金されます。"
     },
     {
      "question": "他社モデルと比べられますか？",
      "answer": "「カスタムモデル」に現在の単価を入力すると同じ使用量で比較できます。"
     }
    ],
    "disclaimer": "料金は2026-11-03時点のAnthropic API定価です。実際の請求額は使用状況により異なります。"
   }
  },
  "zh": {
   "meta": {
    "title": "LLM API 费用计算器 — Claude 各模型月费、缓存与批量折扣",
    "description": "按每日请求数和输入、输出 token 计算 Claude Fable、Opus、Sonnet、Haiku 的每月 API 费用，并比较提示缓存和批量 API 折扣的效果。"
   },
   "content": {
    "introTitle": "LLM API 费用 = token 数 × 单价",
    "intro": "上线 AI 功能前，先估算每月要花多少钱。本工具把每次请求的输入 token（系统提示、历史、文档）和输出 token（回答与思考）乘以各模型每百万 token 的价格，得出每日和每月费用。",
    "formulaTitle": "核心概念",
    "formulas": [
     {
      "title": "输入与输出单价",
      "body": "输出单价是输入的 5 倍，缩短回答就能明显降本。"
     },
     {
      "title": "提示缓存",
      "body": "重复发送相同前缀时按缓存读取价计费，约为输入价的 5%。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "选择用途和每日请求数。",
     "切换模型，比较每月费用。",
     "查看最影响费用的因素并复制摘要。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "思考 token 收费吗？",
      "answer": "收费，即使不显示也按输出 token 计费。"
     },
     {
      "question": "能和其他厂商比较吗？",
      "answer": "在“自定义模型”中填入对方当前价格即可按相同用量比较。"
     }
    ],
    "disclaimer": "价格为 2026-11-03 的 Anthropic API 标价，实际账单以用量和套餐为准。"
   }
  },
  "fr": {
   "meta": {
    "title": "Calculateur de coût d'API LLM — coût mensuel Claude, cache et batch",
    "description": "Estimez le coût mensuel de l'API pour Claude Fable, Opus, Sonnet et Haiku à partir des requêtes par jour et des tokens d'entrée et de sortie. Comparez l'effet du cache de prompt et de l'API Batch."
   },
   "content": {
    "introTitle": "Le coût d'une API LLM = tokens × prix",
    "intro": "Avant de lancer une fonction IA, il faut savoir combien elle coûtera chaque mois. L'outil multiplie les tokens d'entrée (prompt système, historique, documents) et de sortie (réponse et réflexion) par le prix par million de tokens de chaque modèle.",
    "formulaTitle": "Notions clés",
    "formulas": [
     {
      "title": "Prix d'entrée et de sortie",
      "body": "La sortie coûte cinq fois plus que l'entrée : des réponses plus courtes réduisent vite la facture."
     },
     {
      "title": "Cache de prompt",
      "body": "Renvoyer le même préfixe est facturé au prix de lecture du cache, environ 5 % du prix d'entrée."
     }
    ],
    "howToTitle": "Mode d'emploi",
    "steps": [
     "Choisissez l'usage et le nombre de requêtes par jour.",
     "Changez de modèle et comparez les coûts mensuels.",
     "Repérez ce qui pèse le plus sur la facture et copiez le résumé."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Les tokens de réflexion sont-ils facturés ?",
      "answer": "Oui, comme tokens de sortie, même s'ils ne sont pas affichés."
     },
     {
      "question": "Puis-je comparer d'autres fournisseurs ?",
      "answer": "Saisissez leurs prix actuels dans « Modèle personnalisé »."
     }
    ],
    "disclaimer": "Prix publics de l'API Anthropic au 2026-11-03. La facture réelle dépend de l'usage et de l'offre."
   }
  },
  "es": {
   "meta": {
    "title": "Calculadora de coste de API LLM — coste mensual de Claude, caché y batch",
    "description": "Calcula el coste mensual de la API de Claude Fable, Opus, Sonnet y Haiku a partir de solicitudes diarias y tokens de entrada y salida. Compara el efecto de la caché de prompts y de la API Batch."
   },
   "content": {
    "introTitle": "El coste de una API LLM = tokens × precio",
    "intro": "Antes de lanzar una función de IA conviene saber cuánto costará al mes. La herramienta multiplica los tokens de entrada (prompt de sistema, historial, documentos) y de salida (respuesta y razonamiento) por el precio por millón de tokens de cada modelo.",
    "formulaTitle": "Conceptos clave",
    "formulas": [
     {
      "title": "Precio de entrada y salida",
      "body": "La salida cuesta cinco veces más que la entrada: respuestas más cortas bajan mucho el coste."
     },
     {
      "title": "Caché de prompts",
      "body": "Reenviar el mismo prefijo se cobra al precio de lectura de caché, cerca del 5 % de la entrada."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Elige el uso y las solicitudes por día.",
     "Cambia de modelo y compara el coste mensual.",
     "Mira qué mueve más la factura y copia el resumen."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Se cobran los tokens de razonamiento?",
      "answer": "Sí, como tokens de salida, aunque no se muestren."
     },
     {
      "question": "¿Puedo comparar otros proveedores?",
      "answer": "Introduce sus precios actuales en «Modelo personalizado»."
     }
    ],
    "disclaimer": "Precios de lista de la API de Anthropic a 2026-11-03. La factura real depende del uso y del plan."
   }
  }
 },
 "cron-expression-explainer": {
  "ko": {
   "meta": {
    "title": "cron 표현식 해석기 — 사람 말로 풀이·다음 실행 시각",
    "description": "*/5 * * * * 같은 cron 표현식을 붙여 넣으면 '매일 5분마다 실행해요'처럼 풀어 주고, 내 시간대 기준 다음 실행 시각 5~20개와 시간대별 실행 횟수를 보여 줘요."
   },
   "content": {
    "introTitle": "cron 표현식은 '분 시 일 월 요일' 다섯 칸이에요",
    "intro": "cron은 리눅스 서버, GitHub Actions, Kubernetes CronJob, 클라우드 스케줄러가 정해진 시각에 작업을 돌릴 때 쓰는 문법이에요. 칸마다 *(전부), 1-5(범위), */15(15마다), 1,15(목록)를 쓸 수 있어 짧지만 잘못 읽기 쉬워요. 이 도구는 표현식을 문장으로 바꾸고, 실제로 언제 돌지 다음 실행 시각을 보여 줘서 배포 전에 실수를 잡게 도와요.",
    "formulaTitle": "핵심 개념",
    "formulas": [
     {
      "title": "다섯 칸",
      "body": "분(0~59) 시(0~23) 일(1~31) 월(1~12) 요일(0~7, 0과 7은 일요일)."
     },
     {
      "title": "일과 요일을 함께 쓰면",
      "body": "둘 다 정하면 둘 중 하나만 맞아도 실행돼요. '매월 1일이면서 월요일'이 아니라 '1일 또는 월요일'이에요."
     },
     {
      "title": "단축어",
      "body": "@hourly, @daily, @weekly, @monthly, @yearly도 읽어요."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "cron 표현식을 입력하거나 예시를 누릅니다.",
     "풀이 문장과 칸별 의미를 확인합니다.",
     "다음 실행 시각과 시간대별 횟수를 보고, 주석을 붙여 복사합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "칸이 6개인 표현식은요?",
      "answer": "초나 연도가 붙은 Quartz·Spring 형식이에요. 이 도구는 표준 5칸 cron을 읽어요."
     },
     {
      "question": "서버 시간과 다르게 나와요",
      "answer": "다음 실행 시각은 브라우저 시간대 기준이에요. GitHub Actions와 Kubernetes CronJob은 기본이 UTC라 한국 시간과 9시간 차이가 나요."
     },
     {
      "question": "2월 30일처럼 없는 날짜를 넣으면?",
      "answer": "5년 안에 실행할 날이 없다고 알려 줘요."
     }
    ],
    "disclaimer": "실행 시각 계산은 브라우저 시간대를 따르며, 서머타임 전환 시각에는 스케줄러마다 동작이 다를 수 있어요."
   }
  },
  "en": {
   "meta": {
    "title": "Cron Expression Explainer — plain English and next run times",
    "description": "Paste a cron expression like */5 * * * * to read it in plain words, see the next 5–20 run times in your time zone and how runs spread across the day."
   },
   "content": {
    "introTitle": "A cron expression has five fields: minute hour day month weekday",
    "intro": "Cron schedules jobs on Linux servers, GitHub Actions, Kubernetes CronJobs and cloud schedulers. Each field accepts * (every), 1-5 (range), */15 (step) and 1,15 (list), which is compact but easy to misread. This tool turns the expression into a sentence and lists the real next run times so you catch mistakes before deploying.",
    "formulaTitle": "Key concepts",
    "formulas": [
     {
      "title": "Five fields",
      "body": "minute (0–59), hour (0–23), day of month (1–31), month (1–12), day of week (0–7, where 0 and 7 are Sunday)."
     },
     {
      "title": "Day of month plus weekday",
      "body": "When both are set, a run happens if either matches — '1st or Monday', not '1st that is a Monday'."
     },
     {
      "title": "Macros",
      "body": "@hourly, @daily, @weekly, @monthly and @yearly are supported."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Type an expression or tap an example.",
     "Read the sentence and what each field means.",
     "Check the next run times and hourly spread, then copy it with a comment."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "What about six-field expressions?",
      "answer": "Those are Quartz/Spring formats with seconds or year. This tool reads standard five-field cron."
     },
     {
      "question": "Why do times differ from my server?",
      "answer": "Run times use your browser's time zone. GitHub Actions and Kubernetes CronJobs default to UTC."
     },
     {
      "question": "What if the date never exists, like Feb 30?",
      "answer": "The tool reports that nothing matches within five years."
     }
    ],
    "disclaimer": "Run times follow your browser's time zone; schedulers differ around daylight-saving changes."
   }
  },
  "ja": {
   "meta": {
    "title": "cron式の解説ツール — 日本語で読む・次回実行時刻",
    "description": "*/5 * * * * のようなcron式を貼り付けると意味を文章で表示し、次回の実行時刻と時間帯ごとの実行回数を確認できます。"
   },
   "content": {
    "introTitle": "cron式は「分 時 日 月 曜日」の5つの欄です",
    "intro": "cronはLinuxサーバー、GitHub Actions、Kubernetes CronJobなどで定期実行に使う書式です。*、範囲、間隔、リストを組み合わせるため読み間違えやすく、本ツールで実際の実行時刻を確かめられます。",
    "formulaTitle": "基本概念",
    "formulas": [
     {
      "title": "5つの欄",
      "body": "分(0–59) 時(0–23) 日(1–31) 月(1–12) 曜日(0–7、0と7は日曜)。"
     },
     {
      "title": "日と曜日の両方",
      "body": "両方を指定すると、どちらか一方に一致すれば実行されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "cron式を入力するか例を選びます。",
     "説明文と各欄の意味を確認します。",
     "次回実行時刻を確認してコピーします。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "6欄の式は？",
      "answer": "秒や年を含むQuartz形式です。本ツールは標準の5欄を読みます。"
     },
     {
      "question": "サーバーの時刻と違います",
      "answer": "ブラウザのタイムゾーン基準です。GitHub ActionsはUTCが既定です。"
     }
    ],
    "disclaimer": "実行時刻はブラウザのタイムゾーンに従います。"
   }
  },
  "zh": {
   "meta": {
    "title": "Cron 表达式解析器 — 解释含义与下次运行时间",
    "description": "粘贴 */5 * * * * 等 cron 表达式，即可看到含义说明、按本地时区的下次运行时间，以及每小时运行次数分布。"
   },
   "content": {
    "introTitle": "cron 表达式由“分 时 日 月 周”五个字段组成",
    "intro": "cron 用于 Linux 服务器、GitHub Actions、Kubernetes CronJob 等定时任务。字段可用 *、范围、步长和列表，写法简短却容易看错。本工具把表达式转成句子，并列出实际运行时间。",
    "formulaTitle": "核心概念",
    "formulas": [
     {
      "title": "五个字段",
      "body": "分(0–59) 时(0–23) 日(1–31) 月(1–12) 周(0–7，0 和 7 都是周日)。"
     },
     {
      "title": "同时指定日和周",
      "body": "两者都指定时，满足其中一个就会运行。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入表达式或点击示例。",
     "查看说明和各字段含义。",
     "确认下次运行时间并复制。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "六个字段的表达式呢？",
      "answer": "那是带秒或年的 Quartz 格式，本工具读取标准五字段 cron。"
     },
     {
      "question": "为什么和服务器时间不同？",
      "answer": "按浏览器时区计算。GitHub Actions 默认使用 UTC。"
     }
    ],
    "disclaimer": "运行时间按浏览器时区计算。"
   }
  },
  "fr": {
   "meta": {
    "title": "Explication d'expression cron — en clair et prochaines exécutions",
    "description": "Collez une expression cron comme */5 * * * * pour la lire en clair et voir les prochaines exécutions dans votre fuseau horaire."
   },
   "content": {
    "introTitle": "Une expression cron compte cinq champs : minute heure jour mois jour-de-semaine",
    "intro": "Cron planifie des tâches sur les serveurs Linux, GitHub Actions ou les CronJobs Kubernetes. Les champs acceptent *, plages, pas et listes : c'est court mais facile à mal lire. L'outil traduit l'expression en phrase et liste les vraies exécutions.",
    "formulaTitle": "Notions clés",
    "formulas": [
     {
      "title": "Cinq champs",
      "body": "minute (0–59), heure (0–23), jour du mois (1–31), mois (1–12), jour de semaine (0–7, 0 et 7 = dimanche)."
     },
     {
      "title": "Jour du mois et jour de semaine",
      "body": "Si les deux sont fixés, l'un ou l'autre suffit à déclencher."
     }
    ],
    "howToTitle": "Mode d'emploi",
    "steps": [
     "Saisissez une expression ou un exemple.",
     "Lisez la phrase et le sens de chaque champ.",
     "Vérifiez les prochaines exécutions et copiez."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Et les expressions à six champs ?",
      "answer": "Ce sont des formats Quartz/Spring avec secondes ou année ; l'outil lit le cron standard à cinq champs."
     },
     {
      "question": "Pourquoi l'heure diffère-t-elle du serveur ?",
      "answer": "Le calcul suit le fuseau du navigateur ; GitHub Actions utilise l'UTC par défaut."
     }
    ],
    "disclaimer": "Les heures suivent le fuseau horaire de votre navigateur."
   }
  },
  "es": {
   "meta": {
    "title": "Explicador de expresiones cron — en palabras y próximas ejecuciones",
    "description": "Pega una expresión cron como */5 * * * * para leerla en palabras y ver las próximas ejecuciones en tu zona horaria."
   },
   "content": {
    "introTitle": "Una expresión cron tiene cinco campos: minuto hora día mes día-de-semana",
    "intro": "Cron programa tareas en servidores Linux, GitHub Actions y CronJobs de Kubernetes. Los campos admiten *, rangos, pasos y listas: es breve pero fácil de malinterpretar. La herramienta lo traduce a una frase y lista las ejecuciones reales.",
    "formulaTitle": "Conceptos clave",
    "formulas": [
     {
      "title": "Cinco campos",
      "body": "minuto (0–59), hora (0–23), día del mes (1–31), mes (1–12), día de la semana (0–7, 0 y 7 = domingo)."
     },
     {
      "title": "Día del mes y día de la semana",
      "body": "Si se fijan ambos, basta con que coincida uno."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Escribe una expresión o elige un ejemplo.",
     "Lee la frase y el significado de cada campo.",
     "Revisa las próximas ejecuciones y copia."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Y las expresiones de seis campos?",
      "answer": "Son formatos Quartz/Spring con segundos o año; la herramienta lee cron estándar de cinco campos."
     },
     {
      "question": "¿Por qué no coincide con mi servidor?",
      "answer": "Se calcula con la zona horaria del navegador; GitHub Actions usa UTC por defecto."
     }
    ],
    "disclaimer": "Las horas siguen la zona horaria de tu navegador."
   }
  }
 },
 "text-diff-checker": {
  "ko": {
   "meta": {
    "title": "텍스트 비교(diff) — 두 글의 바뀐 줄 찾기",
    "description": "두 글을 붙여 넣으면 추가·삭제된 줄을 색으로 표시하고 같은 비율을 보여 줘요. 공백·대소문자 무시, 바뀐 곳만 보기, git 형식 unified diff 복사를 지원해요."
   },
   "content": {
    "introTitle": "diff는 두 글에서 바뀐 줄만 골라 보여 줘요",
    "intro": "계약서 수정본, 설정 파일, 번역 원고처럼 비슷한 두 글에서 어디가 바뀌었는지 눈으로 찾기는 어려워요. 이 도구는 두 글의 가장 긴 공통 줄(LCS)을 찾아, 나머지를 추가(초록)와 삭제(빨강)로 표시해요. 글은 브라우저 안에서만 비교해요.",
    "formulaTitle": "핵심 개념",
    "formulas": [
     {
      "title": "줄 단위 비교",
      "body": "한 줄 안에서 한 글자만 바뀌어도 그 줄 전체가 삭제+추가로 보여요."
     },
     {
      "title": "unified diff",
      "body": "git diff와 같은 형식이라 코드 리뷰나 이슈에 그대로 붙여 넣을 수 있어요."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "왼쪽에 원본, 오른쪽에 변경본을 붙여 넣습니다.",
     "필요하면 공백·대소문자 무시를 켭니다.",
     "바뀐 곳을 확인하고 unified diff를 복사합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "글이 서버로 가나요?",
      "answer": "아니요. 비교는 이 브라우저 안에서만 해요."
     },
     {
      "question": "아주 긴 글도 되나요?",
      "answer": "앞뒤 같은 부분을 빼고 바뀐 구간이 4,000줄 이하일 때 비교해요."
     },
     {
      "question": "단어 단위로 볼 수 있나요?",
      "answer": "지금은 줄 단위예요. 문장을 한 줄씩 나눠 넣으면 더 잘게 볼 수 있어요."
     }
    ],
    "disclaimer": "비교 결과는 참고용이에요. 법률 문서처럼 중요한 글은 원문을 다시 확인하세요."
   }
  },
  "en": {
   "meta": {
    "title": "Text Diff Checker — compare two texts line by line",
    "description": "Paste two texts to highlight added and removed lines and see how similar they are. Ignore whitespace or case, show only changes, and copy a git-style unified diff."
   },
   "content": {
    "introTitle": "A diff shows only the lines that changed",
    "intro": "Spotting edits between two versions of a contract, config file or translation is hard by eye. This tool finds the longest common sequence of lines (LCS) and marks the rest as added (green) or removed (red). Everything runs in your browser.",
    "formulaTitle": "Key concepts",
    "formulas": [
     {
      "title": "Line-based",
      "body": "Changing one character marks the whole line as removed and added."
     },
     {
      "title": "Unified diff",
      "body": "Same format as git diff, ready for code reviews and issues."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Paste the original on the left and the changed text on the right.",
     "Turn on ignore whitespace or case if needed.",
     "Review the changes and copy the unified diff."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Is my text uploaded?",
      "answer": "No. The comparison runs only in this browser."
     },
     {
      "question": "How long can the texts be?",
      "answer": "Up to 4,000 changed lines after trimming identical starts and ends."
     },
     {
      "question": "Can it diff by word?",
      "answer": "It is line-based for now; put one sentence per line for finer results."
     }
    ],
    "disclaimer": "Results are for reference; re-check important documents against the originals."
   }
  },
  "ja": {
   "meta": {
    "title": "テキスト比較（diff）— 2つの文章の変更行を表示",
    "description": "2つの文章を貼り付けると、追加・削除された行を色分けし、一致率を表示します。空白・大文字小文字の無視、unified diffのコピーに対応。"
   },
   "content": {
    "introTitle": "diffは変更された行だけを示します",
    "intro": "契約書の修正版や設定ファイルなど、似た2つの文章の違いを目で探すのは大変です。本ツールは共通部分（LCS）を求め、残りを追加と削除で表示します。処理はブラウザ内で行います。",
    "formulaTitle": "基本概念",
    "formulas": [
     {
      "title": "行単位の比較",
      "body": "1文字の変更でも行全体が削除と追加になります。"
     },
     {
      "title": "unified diff",
      "body": "git diffと同じ形式でコピーできます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "左に元の文章、右に変更後を貼り付けます。",
     "必要なら空白や大文字小文字を無視します。",
     "変更点を確認しdiffをコピーします。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "文章はサーバーに送られますか？",
      "answer": "いいえ、ブラウザ内だけで比較します。"
     },
     {
      "question": "長い文章も比較できますか？",
      "answer": "変更区間が4,000行以下なら比較できます。"
     }
    ],
    "disclaimer": "結果は参考用です。重要な文書は原本で再確認してください。"
   }
  },
  "zh": {
   "meta": {
    "title": "文本对比（diff）— 逐行找出两段文字的差异",
    "description": "粘贴两段文字，即可用颜色标出新增和删除的行，并显示相似度。支持忽略空白和大小写，可复制 unified diff。"
   },
   "content": {
    "introTitle": "diff 只显示发生变化的行",
    "intro": "合同修订稿、配置文件、译稿等相似文本，肉眼很难找出差异。本工具求出最长公共行序列（LCS），把其余部分标为新增或删除。全部在浏览器内完成。",
    "formulaTitle": "核心概念",
    "formulas": [
     {
      "title": "按行比较",
      "body": "一行中改动一个字，整行都会显示为删除加新增。"
     },
     {
      "title": "unified diff",
      "body": "与 git diff 相同的格式，可直接粘贴到代码评审中。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "左侧粘贴原文，右侧粘贴修改稿。",
     "按需忽略空白或大小写。",
     "查看差异并复制 diff。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "文字会上传吗？",
      "answer": "不会，只在浏览器内比较。"
     },
     {
      "question": "能比较很长的文本吗？",
      "answer": "变化区间在 4,000 行以内即可。"
     }
    ],
    "disclaimer": "结果仅供参考，重要文件请以原文为准。"
   }
  },
  "fr": {
   "meta": {
    "title": "Comparateur de texte (diff) — voir les lignes modifiées",
    "description": "Collez deux textes pour surligner les lignes ajoutées et supprimées et voir leur taux de similarité. Ignorer espaces ou casse, copier un diff unifié."
   },
   "content": {
    "introTitle": "Un diff ne montre que les lignes modifiées",
    "intro": "Repérer les changements entre deux versions d'un contrat, d'un fichier de configuration ou d'une traduction est difficile à l'œil. L'outil cherche la plus longue suite commune de lignes (LCS) et marque le reste en ajout ou suppression, dans votre navigateur.",
    "formulaTitle": "Notions clés",
    "formulas": [
     {
      "title": "Comparaison par ligne",
      "body": "Un seul caractère modifié marque toute la ligne."
     },
     {
      "title": "Diff unifié",
      "body": "Même format que git diff, prêt pour une revue de code."
     }
    ],
    "howToTitle": "Mode d'emploi",
    "steps": [
     "Collez l'original à gauche et la version modifiée à droite.",
     "Ignorez espaces ou casse si besoin.",
     "Vérifiez les changements et copiez le diff."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Mon texte est-il envoyé ?",
      "answer": "Non, tout se fait dans le navigateur."
     },
     {
      "question": "Quelle longueur maximale ?",
      "answer": "Jusqu'à 4 000 lignes modifiées."
     }
    ],
    "disclaimer": "Résultat indicatif : vérifiez les documents importants sur l'original."
   }
  },
  "es": {
   "meta": {
    "title": "Comparador de texto (diff) — ver las líneas cambiadas",
    "description": "Pega dos textos para resaltar líneas añadidas y eliminadas y ver su similitud. Ignora espacios o mayúsculas y copia un diff unificado."
   },
   "content": {
    "introTitle": "Un diff muestra solo las líneas que cambiaron",
    "intro": "Encontrar a ojo los cambios entre dos versiones de un contrato, un archivo de configuración o una traducción es difícil. La herramienta busca la secuencia común más larga (LCS) y marca el resto como añadido o eliminado, en tu navegador.",
    "formulaTitle": "Conceptos clave",
    "formulas": [
     {
      "title": "Comparación por línea",
      "body": "Cambiar un carácter marca la línea entera."
     },
     {
      "title": "Diff unificado",
      "body": "El mismo formato que git diff, listo para revisiones de código."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Pega el original a la izquierda y el cambiado a la derecha.",
     "Ignora espacios o mayúsculas si hace falta.",
     "Revisa los cambios y copia el diff."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Se sube mi texto?",
      "answer": "No, todo ocurre en el navegador."
     },
     {
      "question": "¿Qué longitud admite?",
      "answer": "Hasta 4.000 líneas cambiadas."
     }
    ],
    "disclaimer": "Resultado orientativo: revisa los documentos importantes con el original."
   }
  }
 },
 "json-schema-validator": {
  "ko": {
   "meta": {
    "title": "JSON 스키마 검사기 — 오류 위치를 쉬운 말로",
    "description": "JSON Schema와 JSON을 붙여 넣으면 어느 경로(/tags/0 등)가 왜 틀렸는지 쉬운 말로 알려 줘요. 예시 JSON으로 스키마 초안을 만들고, AI 도구 호출(function calling)·API 응답 검사에 써요."
   },
   "content": {
    "introTitle": "JSON Schema는 JSON의 모양을 약속하는 문서예요",
    "intro": "API 요청·응답, 설정 파일, AI 모델의 도구 호출 입력과 구조화 출력은 모두 JSON Schema로 형식을 정해요. 이 도구는 붙여 넣은 JSON이 스키마를 지키는지 검사하고, 틀린 곳의 경로와 이유를 한국어로 보여 줘요. 예시 JSON 하나로 스키마 초안을 만들 수도 있어요.",
    "formulaTitle": "핵심 개념",
    "formulas": [
     {
      "title": "경로(JSON Pointer)",
      "body": "/tags/0은 tags 배열의 첫 번째 항목이에요. 오류마다 이 경로가 붙어요."
     },
     {
      "title": "additionalProperties: false",
      "body": "스키마에 없는 키를 막아요. AI 도구 호출의 strict 모드에서 꼭 필요해요."
     },
     {
      "title": "$ref",
      "body": "#/$defs/이름 형식의 내부 참조를 따라가요."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "왼쪽에 스키마, 오른쪽에 검사할 JSON을 붙여 넣습니다.",
     "결과에서 오류 경로와 이유를 확인합니다.",
     "스키마가 없으면 '스키마 초안 만들기'로 시작합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "어떤 버전을 지원하나요?",
      "answer": "Draft 2020-12와 07에서 자주 쓰는 키워드를 지원해요. if/then/else·외부 $ref는 건너뛰고 화면에 알려 줘요."
     },
     {
      "question": "운영 서버에서도 이 결과를 믿어도 되나요?",
      "answer": "빠른 확인용이에요. 운영 검증에는 Ajv 같은 정식 검증기를 쓰세요."
     },
     {
      "question": "데이터가 밖으로 나가나요?",
      "answer": "아니요. 브라우저 안에서만 검사해요."
     }
    ],
    "disclaimer": "지원하지 않는 키워드는 검사하지 않고 넘어가므로, 통과가 완전한 적합성을 뜻하지는 않아요."
   }
  },
  "en": {
   "meta": {
    "title": "JSON Schema Validator — errors explained in plain words",
    "description": "Paste a JSON Schema and JSON to see which path (like /tags/0) fails and why. Draft a schema from sample JSON; handy for API payloads and LLM tool-calling inputs."
   },
   "content": {
    "introTitle": "A JSON Schema is a contract for the shape of JSON",
    "intro": "API requests and responses, config files and LLM tool inputs or structured outputs are all described with JSON Schema. This tool checks pasted JSON against a schema and explains each failure with its path. It can also draft a schema from one sample.",
    "formulaTitle": "Key concepts",
    "formulas": [
     {
      "title": "Paths (JSON Pointer)",
      "body": "/tags/0 is the first item of the tags array; every error carries one."
     },
     {
      "title": "additionalProperties: false",
      "body": "Rejects keys the schema does not list — required for strict tool calling."
     },
     {
      "title": "$ref",
      "body": "Follows internal references such as #/$defs/name."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Paste the schema on the left and the JSON on the right.",
     "Read each error path and reason.",
     "No schema yet? Start with 'Draft a schema from this JSON'."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Which drafts are supported?",
      "answer": "Common keywords from Draft 2020-12 and 07. if/then/else and remote $ref are skipped and listed."
     },
     {
      "question": "Can I rely on it in production?",
      "answer": "Use it for quick checks; use a full validator such as Ajv in production."
     },
     {
      "question": "Is my data uploaded?",
      "answer": "No. Validation runs in your browser."
     }
    ],
    "disclaimer": "Unsupported keywords are skipped, so a pass is not a full conformance guarantee."
   }
  },
  "ja": {
   "meta": {
    "title": "JSONスキーマ検証ツール — エラー箇所をわかりやすく",
    "description": "JSON SchemaとJSONを貼り付けると、どのパスがなぜ不正かを表示します。サンプルJSONからスキーマの下書きも作れます。"
   },
   "content": {
    "introTitle": "JSON SchemaはJSONの形を約束する文書です",
    "intro": "APIの入出力、設定ファイル、AIのツール呼び出しはJSON Schemaで形式を定めます。本ツールは貼り付けたJSONを検証し、エラーのパスと理由を示します。",
    "formulaTitle": "基本概念",
    "formulas": [
     {
      "title": "パス（JSON Pointer）",
      "body": "/tags/0 は tags 配列の最初の要素です。"
     },
     {
      "title": "additionalProperties: false",
      "body": "スキーマにないキーを拒否します。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "左にスキーマ、右にJSONを貼り付けます。",
     "エラーのパスと理由を確認します。",
     "スキーマがなければ下書きを作成します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "対応バージョンは？",
      "answer": "Draft 2020-12と07の主要キーワードです。"
     },
     {
      "question": "データは送信されますか？",
      "answer": "いいえ、ブラウザ内で検証します。"
     }
    ],
    "disclaimer": "未対応のキーワードはスキップされるため、合格は完全な適合を保証しません。"
   }
  },
  "zh": {
   "meta": {
    "title": "JSON Schema 校验器 — 用白话说明错误位置",
    "description": "粘贴 JSON Schema 和 JSON，即可看到哪个路径（如 /tags/0）不符合以及原因。还能根据示例 JSON 生成草稿 schema。"
   },
   "content": {
    "introTitle": "JSON Schema 是约定 JSON 结构的文档",
    "intro": "API 请求与响应、配置文件、大模型工具调用的输入和结构化输出，都用 JSON Schema 描述格式。本工具校验粘贴的 JSON，并给出每个错误的路径和原因。",
    "formulaTitle": "核心概念",
    "formulas": [
     {
      "title": "路径（JSON Pointer）",
      "body": "/tags/0 表示 tags 数组的第一个元素。"
     },
     {
      "title": "additionalProperties: false",
      "body": "拒绝 schema 未列出的键。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "左侧粘贴 schema，右侧粘贴 JSON。",
     "查看错误路径和原因。",
     "没有 schema 时先生成草稿。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "支持哪些版本？",
      "answer": "支持 Draft 2020-12 和 07 的常用关键字。"
     },
     {
      "question": "数据会上传吗？",
      "answer": "不会，只在浏览器内校验。"
     }
    ],
    "disclaimer": "不支持的关键字会被跳过，通过并不代表完全符合规范。"
   }
  },
  "fr": {
   "meta": {
    "title": "Validateur JSON Schema — erreurs expliquées clairement",
    "description": "Collez un JSON Schema et un JSON pour voir quel chemin (/tags/0…) échoue et pourquoi. Générez un brouillon de schéma à partir d'un exemple."
   },
   "content": {
    "introTitle": "Un JSON Schema décrit la forme attendue d'un JSON",
    "intro": "Requêtes et réponses d'API, fichiers de configuration et appels d'outils de LLM sont décrits par JSON Schema. L'outil vérifie le JSON collé et explique chaque erreur avec son chemin.",
    "formulaTitle": "Notions clés",
    "formulas": [
     {
      "title": "Chemins (JSON Pointer)",
      "body": "/tags/0 désigne le premier élément du tableau tags."
     },
     {
      "title": "additionalProperties: false",
      "body": "Refuse les clés absentes du schéma."
     }
    ],
    "howToTitle": "Mode d'emploi",
    "steps": [
     "Collez le schéma à gauche et le JSON à droite.",
     "Lisez le chemin et la raison de chaque erreur.",
     "Sans schéma, générez d'abord un brouillon."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Quelles versions sont prises en charge ?",
      "answer": "Les mots-clés courants des drafts 2020-12 et 07."
     },
     {
      "question": "Mes données sont-elles envoyées ?",
      "answer": "Non, la validation se fait dans le navigateur."
     }
    ],
    "disclaimer": "Les mots-clés non pris en charge sont ignorés : une validation réussie n'est pas une garantie complète."
   }
  },
  "es": {
   "meta": {
    "title": "Validador de JSON Schema — errores explicados con claridad",
    "description": "Pega un JSON Schema y un JSON para ver qué ruta (/tags/0…) falla y por qué. Genera un borrador de schema a partir de un ejemplo."
   },
   "content": {
    "introTitle": "Un JSON Schema describe la forma esperada de un JSON",
    "intro": "Peticiones y respuestas de API, archivos de configuración y llamadas a herramientas de LLM se describen con JSON Schema. La herramienta valida el JSON pegado y explica cada error con su ruta.",
    "formulaTitle": "Conceptos clave",
    "formulas": [
     {
      "title": "Rutas (JSON Pointer)",
      "body": "/tags/0 es el primer elemento del array tags."
     },
     {
      "title": "additionalProperties: false",
      "body": "Rechaza claves que el schema no incluye."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Pega el schema a la izquierda y el JSON a la derecha.",
     "Lee la ruta y el motivo de cada error.",
     "Sin schema, genera primero un borrador."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Qué versiones admite?",
      "answer": "Las palabras clave habituales de los drafts 2020-12 y 07."
     },
     {
      "question": "¿Se envían mis datos?",
      "answer": "No, se valida en el navegador."
     }
    ],
    "disclaimer": "Las palabras clave no admitidas se omiten: pasar la validación no garantiza conformidad total."
   }
  }
 },
 "markdown-table-generator": {
  "ko": {
   "meta": {
    "title": "마크다운 표 만들기 — 엑셀·CSV를 Markdown 표로",
    "description": "엑셀·구글 시트에서 복사한 표나 CSV를 붙여 넣으면 GitHub·Notion·Obsidian에서 쓰는 마크다운 표로 바꿔요. 열 정렬, 한글 폭 맞춤, 마크다운 표 → CSV 되돌리기도 돼요."
   },
   "content": {
    "introTitle": "마크다운 표는 | 와 - 로 그리는 글자 표예요",
    "intro": "README, 위키, 이슈, AI 프롬프트에 표를 넣을 때 마크다운 표 문법을 손으로 맞추기는 번거로워요. 이 도구는 탭·쉼표·세미콜론 구분 표를 자동으로 읽어 마크다운 표로 바꾸고, 숫자 열은 오른쪽 정렬해요. 한글은 2칸으로 계산해 원문에서도 줄이 맞아요.",
    "formulaTitle": "핵심 개념",
    "formulas": [
     {
      "title": "구분자 자동 인식",
      "body": "시트에서 복사하면 탭, CSV는 쉼표로 읽어요. 따옴표 안의 쉼표도 지켜요."
     },
     {
      "title": "정렬 표시",
      "body": "--: 는 오른쪽, :-: 는 가운데, :-- 는 왼쪽 정렬이에요."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "시트나 CSV에서 표를 복사해 붙여 넣습니다.",
     "열마다 정렬을 확인하고 바꿉니다.",
     "마크다운 또는 CSV를 복사합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "칸 안에 | 가 있으면요?",
      "answer": "\\| 로 바꿔서 표가 깨지지 않게 해요."
     },
     {
      "question": "마크다운 표를 다시 엑셀로 옮길 수 있나요?",
      "answer": "마크다운 표를 붙여 넣고 형식을 CSV로 바꾸면 돼요."
     },
     {
      "question": "병합된 칸은요?",
      "answer": "마크다운 표는 셀 병합을 지원하지 않아 빈칸으로 남아요."
     }
    ],
    "disclaimer": "표 문법은 GitHub 확장 마크다운(GFM)을 따르며, 사이트마다 일부 표시가 다를 수 있어요."
   }
  },
  "en": {
   "meta": {
    "title": "Markdown Table Generator — turn Excel or CSV into a Markdown table",
    "description": "Paste a table copied from Excel or Google Sheets, or CSV, and get a GitHub-flavored Markdown table for GitHub, Notion or Obsidian. Set column alignment, pad CJK text and convert Markdown back to CSV."
   },
   "content": {
    "introTitle": "A Markdown table is drawn with | and -",
    "intro": "Hand-aligning Markdown tables for READMEs, wikis, issues or AI prompts is tedious. This tool reads tab-, comma- or semicolon-separated tables, outputs a Markdown table and right-aligns numeric columns. CJK characters count as two cells so the raw text lines up.",
    "formulaTitle": "Key concepts",
    "formulas": [
     {
      "title": "Delimiter detection",
      "body": "Sheet copies are tab-separated, CSV uses commas; quoted commas are kept."
     },
     {
      "title": "Alignment markers",
      "body": "--: is right, :-: is center and :-- is left."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Copy a table from a sheet or CSV and paste it.",
     "Check or change each column's alignment.",
     "Copy the Markdown or CSV."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "What if a cell contains |?",
      "answer": "It is escaped as \\| so the table stays intact."
     },
     {
      "question": "Can I go back from Markdown to a spreadsheet?",
      "answer": "Paste the Markdown table and switch the output to CSV."
     },
     {
      "question": "What about merged cells?",
      "answer": "Markdown tables have no merged cells; they stay empty."
     }
    ],
    "disclaimer": "Output follows GitHub-flavored Markdown; rendering may differ slightly between sites."
   }
  },
  "ja": {
   "meta": {
    "title": "Markdown表ジェネレーター — Excel・CSVをMarkdown表に",
    "description": "ExcelやGoogleスプレッドシートからコピーした表やCSVを、GitHub・Notion・Obsidianで使えるMarkdown表に変換します。列の配置や全角文字の幅揃えにも対応。"
   },
   "content": {
    "introTitle": "Markdown表は | と - で描く文字の表です",
    "intro": "READMEやWiki、AIプロンプトに表を入れるとき、Markdown表を手で揃えるのは面倒です。本ツールは区切り文字を自動判定して変換し、数値列は右揃えにします。",
    "formulaTitle": "基本概念",
    "formulas": [
     {
      "title": "区切り文字の自動判定",
      "body": "シートからのコピーはタブ、CSVはカンマとして読みます。"
     },
     {
      "title": "配置記号",
      "body": "--: は右、:-: は中央、:-- は左揃えです。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "表をコピーして貼り付けます。",
     "列ごとの配置を確認します。",
     "MarkdownまたはCSVをコピーします。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "セルに | があると？",
      "answer": "\\| に置き換えて表が崩れないようにします。"
     },
     {
      "question": "Markdown表をCSVに戻せますか？",
      "answer": "貼り付けて出力をCSVに切り替えます。"
     }
    ],
    "disclaimer": "GitHub Flavored Markdownに従います。"
   }
  },
  "zh": {
   "meta": {
    "title": "Markdown 表格生成器 — 把 Excel、CSV 转成 Markdown 表格",
    "description": "粘贴从 Excel、Google 表格复制的内容或 CSV，即可生成适用于 GitHub、Notion、Obsidian 的 Markdown 表格。支持列对齐、中文宽度对齐和反向转 CSV。"
   },
   "content": {
    "introTitle": "Markdown 表格用 | 和 - 画出",
    "intro": "在 README、Wiki 或 AI 提示词中放表格时，手动对齐 Markdown 表格很麻烦。本工具自动识别分隔符并转换，数字列自动右对齐，中文按两格宽度计算。",
    "formulaTitle": "核心概念",
    "formulas": [
     {
      "title": "自动识别分隔符",
      "body": "表格复制为制表符，CSV 为逗号，引号内的逗号会保留。"
     },
     {
      "title": "对齐标记",
      "body": "--: 右对齐，:-: 居中，:-- 左对齐。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "复制表格并粘贴。",
     "检查每列对齐方式。",
     "复制 Markdown 或 CSV。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "单元格里有 | 怎么办？",
      "answer": "会转为 \\|，表格不会错乱。"
     },
     {
      "question": "能把 Markdown 表格转回 CSV 吗？",
      "answer": "粘贴后把输出改为 CSV 即可。"
     }
    ],
    "disclaimer": "输出遵循 GitHub Flavored Markdown。"
   }
  },
  "fr": {
   "meta": {
    "title": "Générateur de tableau Markdown — Excel ou CSV en Markdown",
    "description": "Collez un tableau copié d'Excel ou Google Sheets, ou un CSV, et obtenez un tableau Markdown pour GitHub, Notion ou Obsidian. Alignement des colonnes et retour vers CSV inclus."
   },
   "content": {
    "introTitle": "Un tableau Markdown se dessine avec | et -",
    "intro": "Aligner à la main un tableau Markdown pour un README, un wiki ou un prompt est fastidieux. L'outil détecte le séparateur, produit le tableau et aligne à droite les colonnes numériques.",
    "formulaTitle": "Notions clés",
    "formulas": [
     {
      "title": "Séparateur détecté",
      "body": "Copie de tableur = tabulation, CSV = virgule ; les virgules entre guillemets sont conservées."
     },
     {
      "title": "Marqueurs d'alignement",
      "body": "--: à droite, :-: centré, :-- à gauche."
     }
    ],
    "howToTitle": "Mode d'emploi",
    "steps": [
     "Copiez un tableau et collez-le.",
     "Vérifiez l'alignement de chaque colonne.",
     "Copiez le Markdown ou le CSV."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Et si une cellule contient | ?",
      "answer": "Il est échappé en \\| pour ne pas casser le tableau."
     },
     {
      "question": "Peut-on revenir au CSV ?",
      "answer": "Collez le tableau Markdown et choisissez la sortie CSV."
     }
    ],
    "disclaimer": "La sortie suit GitHub Flavored Markdown."
   }
  },
  "es": {
   "meta": {
    "title": "Generador de tablas Markdown — de Excel o CSV a Markdown",
    "description": "Pega una tabla copiada de Excel o Google Sheets, o un CSV, y obtén una tabla Markdown para GitHub, Notion u Obsidian. Incluye alineación de columnas y conversión de vuelta a CSV."
   },
   "content": {
    "introTitle": "Una tabla Markdown se dibuja con | y -",
    "intro": "Alinear a mano una tabla Markdown para un README, una wiki o un prompt es tedioso. La herramienta detecta el separador, genera la tabla y alinea a la derecha las columnas numéricas.",
    "formulaTitle": "Conceptos clave",
    "formulas": [
     {
      "title": "Separador detectado",
      "body": "Copia de hoja de cálculo = tabulador, CSV = coma; las comas entre comillas se respetan."
     },
     {
      "title": "Marcas de alineación",
      "body": "--: derecha, :-: centro, :-- izquierda."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Copia una tabla y pégala.",
     "Revisa la alineación de cada columna.",
     "Copia el Markdown o el CSV."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Y si una celda contiene | ?",
      "answer": "Se escapa como \\| para no romper la tabla."
     },
     {
      "question": "¿Puedo volver a CSV?",
      "answer": "Pega la tabla Markdown y elige la salida CSV."
     }
    ],
    "disclaimer": "La salida sigue GitHub Flavored Markdown."
   }
  }
 },
 "ai-search-readiness-checker": {
  "ko": {
   "meta": {
    "title": "AI 검색 노출 준비도 진단 — ChatGPT·Claude·Perplexity 인용 점검",
    "description": "페이지 HTML과 robots.txt를 붙여 넣으면 AI 검색(ChatGPT 검색, Claude, Perplexity, Google AI 개요)이 내 글을 읽고 인용하기 좋은지 14개 항목으로 점수를 매기고, 어떤 AI 크롤러를 막았는지 보여 줘요."
   },
   "content": {
    "introTitle": "AI 검색은 읽을 수 있고, 나눠 인용하기 쉬운 글을 고르기 쉬워요",
    "intro": "검색 사용자가 AI 답변으로 옮겨 가면서, 내 글이 답의 출처로 인용되는지가 중요해졌어요. 기본은 일반 검색과 같아요: 크롤러가 접근할 수 있고, 제목·설명·구조화 데이터가 분명하고, 질문별로 나뉜 충분한 본문이 있어야 해요. 이 도구는 붙여 넣은 HTML과 robots.txt만 브라우저에서 읽어 그 기본 항목을 점검해요.",
    "formulaTitle": "핵심 개념",
    "formulas": [
     {
      "title": "학습용과 검색용 크롤러",
      "body": "GPTBot·ClaudeBot·Google-Extended는 학습용, OAI-SearchBot·Claude-SearchBot·PerplexityBot은 검색·인용용이에요. 학습만 막고 검색은 열어 둘 수 있어요."
     },
     {
      "title": "noindex·nosnippet",
      "body": "이 지시가 있으면 AI 검색도 인용하지 못해요."
     },
     {
      "title": "구조화 데이터",
      "body": "FAQPage·Article 같은 JSON-LD는 글의 종류와 질문·답을 기계가 읽게 해요."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "브라우저에서 페이지 소스 보기로 HTML을 복사해 붙여 넣습니다.",
     "사이트 주소 뒤에 /robots.txt를 열어 내용을 붙여 넣습니다.",
     "점수와 '먼저 고칠 것'을 보고 결과를 복사합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "점수가 높으면 AI 답에 꼭 나오나요?",
      "answer": "아니요. 기본 조건을 갖췄는지 보는 점검표예요. 인용 여부는 글의 질과 질문에 따라 달라요."
     },
     {
      "question": "GPTBot을 막으면 ChatGPT 검색에서 빠지나요?",
      "answer": "GPTBot은 학습용이라 검색 노출은 OAI-SearchBot이 정해요. 둘을 따로 설정할 수 있어요."
     },
     {
      "question": "주소만 넣고 검사할 수는 없나요?",
      "answer": "브라우저 보안(CORS) 때문에 다른 사이트를 직접 읽을 수 없어요. 소스를 붙여 넣어 주세요."
     }
    ],
    "disclaimer": "점검 항목은 공개된 검색 가이드에 기반한 참고용이며, 검색·AI 서비스의 노출을 보장하지 않아요."
   }
  },
  "en": {
   "meta": {
    "title": "AI Search Readiness Checker — can ChatGPT, Claude and Perplexity cite your page?",
    "description": "Paste a page's HTML and robots.txt to score 14 basics that help AI search (ChatGPT search, Claude, Perplexity, Google AI Overviews) read and cite it, and see which AI crawlers you block."
   },
   "content": {
    "introTitle": "AI search favors pages it can reach and quote section by section",
    "intro": "As searchers move to AI answers, being cited as a source matters. The basics match classic SEO: crawlers can reach the page, title, description and structured data are clear, and there is enough body text split by question. This tool reads only the HTML and robots.txt you paste, in your browser.",
    "formulaTitle": "Key concepts",
    "formulas": [
     {
      "title": "Training vs search crawlers",
      "body": "GPTBot, ClaudeBot and Google-Extended collect training data; OAI-SearchBot, Claude-SearchBot and PerplexityBot power search and citations. You can block one group and allow the other."
     },
     {
      "title": "noindex and nosnippet",
      "body": "These stop AI search from citing the page."
     },
     {
      "title": "Structured data",
      "body": "JSON-LD such as FAQPage or Article tells machines what the page is."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Copy the HTML with View Source and paste it.",
     "Open /robots.txt on your site and paste it.",
     "Read the score and 'Fix first', then copy the report."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Does a high score guarantee AI citations?",
      "answer": "No. It checks the basics; citations depend on content quality and the question."
     },
     {
      "question": "If I block GPTBot, do I vanish from ChatGPT search?",
      "answer": "GPTBot is for training; search visibility is controlled by OAI-SearchBot. Configure them separately."
     },
     {
      "question": "Why can't I just enter a URL?",
      "answer": "Browser security (CORS) prevents reading other sites directly, so paste the source."
     }
    ],
    "disclaimer": "The checklist is based on public search guidance and does not guarantee visibility in any search or AI product."
   }
  },
  "ja": {
   "meta": {
    "title": "AI検索対応チェッカー — ChatGPT・Claude・Perplexityに引用されやすいか",
    "description": "ページのHTMLとrobots.txtを貼り付けると、AI検索が読み取り引用しやすいかを14項目で採点し、どのAIクローラーをブロックしているかを表示します。"
   },
   "content": {
    "introTitle": "AI検索は読み取りやすく、区切って引用しやすいページを選びます",
    "intro": "検索がAIの回答へ移るにつれ、出典として引用されることが重要になりました。基本は通常のSEOと同じで、クローラーがアクセスでき、タイトル・説明・構造化データが明確で、質問ごとに分かれた十分な本文が必要です。",
    "formulaTitle": "基本概念",
    "formulas": [
     {
      "title": "学習用と検索用クローラー",
      "body": "GPTBot・ClaudeBotは学習用、OAI-SearchBot・Claude-SearchBot・PerplexityBotは検索・引用用です。"
     },
     {
      "title": "noindex・nosnippet",
      "body": "これらがあるとAI検索でも引用されません。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "ページのソースを表示してHTMLを貼り付けます。",
     "/robots.txt の内容を貼り付けます。",
     "点数と優先して直す項目を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "点数が高ければ必ず引用されますか？",
      "answer": "いいえ、基本条件の確認です。"
     },
     {
      "question": "URLだけで検査できませんか？",
      "answer": "ブラウザのCORS制限のため、ソースを貼り付けてください。"
     }
    ],
    "disclaimer": "公開された検索ガイドに基づく参考用チェックで、表示を保証するものではありません。"
   }
  },
  "zh": {
   "meta": {
    "title": "AI 搜索就绪度检测 — ChatGPT、Claude、Perplexity 能否引用你的页面",
    "description": "粘贴页面 HTML 和 robots.txt，按 14 项基础指标评估 AI 搜索是否容易读取和引用你的页面，并显示屏蔽了哪些 AI 爬虫。"
   },
   "content": {
    "introTitle": "AI 搜索偏爱可访问、可分段引用的页面",
    "intro": "随着用户转向 AI 答案，能否被引用为来源变得重要。基础与传统 SEO 相同：爬虫可访问，标题、描述和结构化数据清晰，并有按问题分段的充足正文。本工具只在浏览器中读取你粘贴的 HTML 和 robots.txt。",
    "formulaTitle": "核心概念",
    "formulas": [
     {
      "title": "训练爬虫与搜索爬虫",
      "body": "GPTBot、ClaudeBot 用于训练；OAI-SearchBot、Claude-SearchBot、PerplexityBot 用于搜索和引用。"
     },
     {
      "title": "noindex 与 nosnippet",
      "body": "有这些指令时 AI 搜索也无法引用。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "查看网页源代码并粘贴 HTML。",
     "打开 /robots.txt 并粘贴内容。",
     "查看得分和优先修复项。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "高分就一定会被引用吗？",
      "answer": "不会，这只是基础检查。"
     },
     {
      "question": "为什么不能只输入网址？",
      "answer": "浏览器的 CORS 限制无法直接读取其他网站，请粘贴源代码。"
     }
    ],
    "disclaimer": "检查项基于公开的搜索指南，仅供参考，不保证展示。"
   }
  },
  "fr": {
   "meta": {
    "title": "Vérificateur de préparation à la recherche IA — votre page peut-elle être citée ?",
    "description": "Collez le HTML d'une page et le robots.txt pour noter 14 points qui aident la recherche IA (ChatGPT, Claude, Perplexity, AI Overviews) à lire et citer la page, et voir quels robots IA sont bloqués."
   },
   "content": {
    "introTitle": "La recherche IA privilégie les pages accessibles et faciles à citer par section",
    "intro": "Avec le passage aux réponses IA, être cité comme source compte. Les bases restent celles du SEO : robots autorisés, titre, description et données structurées clairs, et un texte suffisant découpé par question. L'outil lit seulement ce que vous collez, dans le navigateur.",
    "formulaTitle": "Notions clés",
    "formulas": [
     {
      "title": "Robots d'entraînement et de recherche",
      "body": "GPTBot et ClaudeBot servent à l'entraînement ; OAI-SearchBot, Claude-SearchBot et PerplexityBot à la recherche et aux citations."
     },
     {
      "title": "noindex et nosnippet",
      "body": "Ils empêchent la recherche IA de citer la page."
     }
    ],
    "howToTitle": "Mode d'emploi",
    "steps": [
     "Copiez le HTML via « Afficher la source » et collez-le.",
     "Ouvrez /robots.txt et collez-le.",
     "Lisez le score et les priorités, puis copiez le rapport."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Un bon score garantit-il une citation ?",
      "answer": "Non, il vérifie seulement les bases."
     },
     {
      "question": "Pourquoi ne pas saisir une URL ?",
      "answer": "La sécurité du navigateur (CORS) empêche de lire un autre site ; collez la source."
     }
    ],
    "disclaimer": "Liste fondée sur des guides publics ; aucune visibilité n'est garantie."
   }
  },
  "es": {
   "meta": {
    "title": "Comprobador de preparación para búsqueda con IA — ¿pueden citar tu página?",
    "description": "Pega el HTML de una página y el robots.txt para puntuar 14 aspectos que ayudan a la búsqueda con IA (ChatGPT, Claude, Perplexity, AI Overviews) a leerla y citarla, y ver qué rastreadores de IA bloqueas."
   },
   "content": {
    "introTitle": "La búsqueda con IA prefiere páginas accesibles y fáciles de citar por secciones",
    "intro": "Con el paso a las respuestas de IA, ser citado como fuente importa. Lo básico coincide con el SEO clásico: rastreadores permitidos, título, descripción y datos estructurados claros, y texto suficiente dividido por preguntas. La herramienta solo lee lo que pegas, en el navegador.",
    "formulaTitle": "Conceptos clave",
    "formulas": [
     {
      "title": "Rastreadores de entrenamiento y de búsqueda",
      "body": "GPTBot y ClaudeBot recogen datos de entrenamiento; OAI-SearchBot, Claude-SearchBot y PerplexityBot sirven a la búsqueda y las citas."
     },
     {
      "title": "noindex y nosnippet",
      "body": "Impiden que la búsqueda con IA cite la página."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Copia el HTML con «Ver código fuente» y pégalo.",
     "Abre /robots.txt y pégalo.",
     "Lee la puntuación y las prioridades, y copia el informe."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Una buena puntuación garantiza citas?",
      "answer": "No, solo revisa lo básico."
     },
     {
      "question": "¿Por qué no puedo poner solo la URL?",
      "answer": "La seguridad del navegador (CORS) impide leer otros sitios; pega el código fuente."
     }
    ],
    "disclaimer": "Lista basada en guías públicas; no garantiza visibilidad."
   }
  }
 }
};
