import type {Locale} from '../lib/i18n';
import type {UtilityContent} from '../components/UtilityArticle.astro';
export const smallUtilities:Record<string,Record<Locale,{meta:{title:string;description:string};content:UtilityContent}>> = {
  "pace-calculator": {
    "ko": {
      "meta": {
        "title": "러닝 페이스 계산기 — 페이스·속도·완주시간 (5K·10K·하프·풀)",
        "description": "km당 페이스를 입력하면 속도(km/h·mph), 마일 페이스, 5K·10K·하프·풀코스 완주 예상 시간을 계산합니다."
      },
      "content": {
        "introTitle": "러닝 페이스 계산기란?",
        "intro": "1km당 페이스(분:초)를 입력하면 속도(km/h·mph), 마일당 페이스, 그리고 5K·10K·하프마라톤·풀마라톤 완주 예상 시간을 계산하는 도구예요.",
        "formulaTitle": "주요 특징",
        "formulas": [
          {
            "title": "페이스↔속도",
            "body": "페이스를 km/h·mph 속도로 즉시 환산합니다."
          },
          {
            "title": "완주시간 예측",
            "body": "현재 페이스로 5K·10K·하프·풀 완주 시간을 추정합니다."
          },
          {
            "title": "마일 페이스",
            "body": "마일당 페이스도 함께 표시합니다."
          }
        ],
        "howToTitle": "사용 방법",
        "steps": [
          "km당 목표 페이스를 분과 초로 입력합니다.",
          "속도(km/h·mph)와 마일 페이스를 확인합니다.",
          "대표 거리별 완주 예상 시간을 확인합니다."
        ],
        "faqTitle": "자주 묻는 질문",
        "faqs": [
          {
            "question": "페이스와 속도의 차이는?",
            "answer": "페이스는 단위 거리당 걸리는 시간(분/km), 속도는 단위 시간당 거리(km/h)입니다. 서로 역수 관계입니다."
          },
          {
            "question": "5분/km는 시속 몇 km인가요?",
            "answer": "5:00/km = 12km/h 입니다."
          },
          {
            "question": "완주 시간은 정확한가요?",
            "answer": "입력한 페이스를 끝까지 유지한다는 가정의 추정치입니다. 실제로는 후반 페이스 저하 등으로 달라질 수 있습니다."
          }
        ],
        "disclaimer": "완주 시간 예측은 일정한 페이스를 가정한 추정치이며, 실제 기록은 코스·컨디션·페이스 변화에 따라 달라져요."
      }
    },
    "en": {
      "meta": {
        "title": "Running Pace Calculator — Pace, Speed & Finish Time (5K, 10K, Half, Full)",
        "description": "Enter your per-km pace to get speed (km/h, mph), per-mile pace, and predicted finish times for 5K, 10K, half, and full marathon."
      },
      "content": {
        "introTitle": "What is the running pace calculator?",
        "intro": "Enter your pace per kilometer (min:sec) to get speed (km/h, mph), pace per mile, and predicted finish times for 5K, 10K, half marathon, and full marathon.",
        "formulaTitle": "Highlights",
        "formulas": [
          {
            "title": "Pace ↔ speed",
            "body": "Instantly turns pace into km/h and mph."
          },
          {
            "title": "Finish prediction",
            "body": "Estimates 5K, 10K, half, and full times at your pace."
          },
          {
            "title": "Mile pace",
            "body": "Shows per-mile pace alongside per-km."
          }
        ],
        "howToTitle": "How to use",
        "steps": [
          "Enter your target pace per km in minutes and seconds.",
          "Read the speed (km/h, mph) and per-mile pace.",
          "Check predicted finish times for each distance."
        ],
        "faqTitle": "Questions",
        "faqs": [
          {
            "question": "Pace vs speed?",
            "answer": "Pace is time per distance (min/km); speed is distance per time (km/h). They are reciprocals."
          },
          {
            "question": "What speed is 5 min/km?",
            "answer": "5:00/km equals 12 km/h."
          },
          {
            "question": "Are finish times accurate?",
            "answer": "They assume you hold the entered pace the whole way; real results vary with late-race slowdown."
          }
        ],
        "disclaimer": "Finish-time predictions assume a constant pace; real times vary with course, conditions, and pace changes."
      }
    },
    "ja": {
      "meta": {
        "title": "ランニングペース計算機 — ペース・速度・完走時間 (5K·10K·ハーフ·フル)",
        "description": "1kmあたりのペースを入力すると、速度(km/h·mph)、マイルペース、5K·10K·ハーフ·フルの完走予想時間を計算します。"
      },
      "content": {
        "introTitle": "ランニングペース計算機とは？",
        "intro": "1kmあたりのペース(分:秒)を入力すると、速度(km/h·mph)、1マイルあたりのペース、5K·10K·ハーフ·フルマラソンの完走予想時間を計算するツールです。",
        "formulaTitle": "主な特徴",
        "formulas": [
          {
            "title": "ペース↔速度",
            "body": "ペースをkm/h·mphに即時換算します。"
          },
          {
            "title": "完走予測",
            "body": "現ペースで5K·10K·ハーフ·フルの時間を推定します。"
          },
          {
            "title": "マイルペース",
            "body": "1マイルあたりのペースも表示します。"
          }
        ],
        "howToTitle": "使い方",
        "steps": [
          "1kmあたりの目標ペースを分と秒で入力します。",
          "速度(km/h·mph)とマイルペースを確認します。",
          "距離別の完走予想時間を確認します。"
        ],
        "faqTitle": "よくある質問",
        "faqs": [
          {
            "question": "ペースと速度の違いは？",
            "answer": "ペースは距離あたりの時間(分/km)、速度は時間あたりの距離(km/h)で、互いに逆数の関係です。"
          },
          {
            "question": "5分/kmは時速何km？",
            "answer": "5:00/km = 12km/h です。"
          },
          {
            "question": "完走時間は正確？",
            "answer": "入力ペースを最後まで維持する前提の推定値です。実際は後半の失速などで変わります。"
          }
        ],
        "disclaimer": "完走時間の予測は一定ペースを仮定した推定値で、実際の記録はコース・コンディション・ペース変化により異なります。"
      }
    },
    "zh": {
      "meta": {
        "title": "跑步配速计算器 — 配速、速度与完成时间 (5K·10K·半马·全马)",
        "description": "输入每公里配速，计算速度(km/h·mph)、每英里配速，以及5K·10K·半马·全马的预计完成时间。"
      },
      "content": {
        "introTitle": "跑步配速计算器 — 配速、速度与完成时间 (5K·10K·半马·全马)",
        "intro": "每公里配速可换算为速度和固定距离的用时。所有距离都假设始终保持同一配速，不预测体能、天气或休息的影响。",
        "formulaTitle": "计算原理",
        "formulas": [
          {
            "title": "计算原理",
            "body": "速度 = 3600 ÷ 每公里秒数；用时 = 距离 × 配速。"
          },
          {
            "title": "常见问题",
            "body": "5分/公里等于12公里/小时。实际比赛表现可能不同。"
          }
        ],
        "howToTitle": "使用方法",
        "steps": [
          "输入每公里的分钟和秒数。",
          "秒数需为0至59，配速必须大于零。",
          "比较公里速度、英里配速和各距离用时。"
        ],
        "faqTitle": "常见问题",
        "faqs": [
          {
            "question": "计算原理?",
            "answer": "5分/公里等于12公里/小时。实际比赛表现可能不同。"
          }
        ],
        "disclaimer": "结果仅根据输入条件计算。请确认实际情况或机构规定。"
      }
    },
    "fr": {
      "meta": {
        "title": "Calculateur d'Allure de Course — allure, vitesse, temps",
        "description": "Saisissez votre allure au km pour obtenir vitesse, allure au mile et temps estimés (5K, 10K, semi, marathon)."
      },
      "content": {
        "introTitle": "Calculateur d'Allure de Course — allure, vitesse, temps",
        "intro": "Convertissez une allure par kilomètre en vitesse et en durée à allure constante. Le calcul ne prédit pas votre forme, les pauses ni la météo.",
        "formulaTitle": "Calcul",
        "formulas": [
          {
            "title": "Calcul",
            "body": "Vitesse = 3600 ÷ secondes par kilomètre ; durée = distance × allure."
          },
          {
            "title": "Questions",
            "body": "5 min/km correspondent à 12 km/h. Une course réelle peut donner un autre résultat."
          }
        ],
        "howToTitle": "Mode d’emploi",
        "steps": [
          "Saisissez les minutes et secondes par kilomètre.",
          "Les secondes vont de 0 à 59 ; l’allure doit être positive.",
          "Comparez la vitesse, l’allure par mile et les durées par distance."
        ],
        "faqTitle": "Questions",
        "faqs": [
          {
            "question": "Calcul?",
            "answer": "5 min/km correspondent à 12 km/h. Une course réelle peut donner un autre résultat."
          }
        ],
        "disclaimer": "Les résultats dépendent de vos saisies. Vérifiez les conditions réelles ou les règles de votre établissement."
      }
    },
    "es": {
      "meta": {
        "title": "Calculadora de Ritmo de Carrera — ritmo, velocidad, tiempo",
        "description": "Introduce tu ritmo por km para obtener velocidad, ritmo por milla y tiempos estimados (5K, 10K, media, maratón)."
      },
      "content": {
        "introTitle": "Calculadora de Ritmo de Carrera — ritmo, velocidad, tiempo",
        "intro": "Convierte el ritmo por kilómetro en velocidad y duración a ritmo constante. El cálculo no predice tu condición física, las pausas ni el tiempo meteorológico.",
        "formulaTitle": "Cálculo",
        "formulas": [
          {
            "title": "Cálculo",
            "body": "Velocidad = 3600 ÷ segundos por kilómetro; duración = distancia × ritmo."
          },
          {
            "title": "Preguntas",
            "body": "5 min/km equivalen a 12 km/h. El resultado real de una carrera puede ser distinto."
          }
        ],
        "howToTitle": "Cómo usarlo",
        "steps": [
          "Introduce minutos y segundos por kilómetro.",
          "Los segundos deben estar entre 0 y 59 y el ritmo debe ser positivo.",
          "Compara velocidad, ritmo por milla y tiempos por distancia."
        ],
        "faqTitle": "Preguntas",
        "faqs": [
          {
            "question": "Cálculo?",
            "answer": "5 min/km equivalen a 12 km/h. El resultado real de una carrera puede ser distinto."
          }
        ],
        "disclaimer": "Los resultados dependen de tus datos. Comprueba las condiciones reales o las normas de tu institución."
      }
    }
  },
  "recipe-scaler": {
    "ko": {
      "meta": {
        "title": "레시피 배수 계산기 — 인분 조절·재료량 자동 환산",
        "description": "원래 인분과 목표 인분을 입력하면 모든 재료의 양을 비율에 맞게 자동으로 환산합니다. 2인분 레시피를 4인분으로 손쉽게 늘리세요."
      },
      "content": {
        "introTitle": "레시피 배수 계산기란?",
        "intro": "원래 인분과 목표 인분을 입력하면 배율이 계산되고, 입력한 모든 재료의 양이 비율에 맞춰 자동 환산돼요. 인원에 맞게 레시피를 늘리거나 줄일 때 유용해요.",
        "formulaTitle": "주요 특징",
        "formulas": [
          {
            "title": "자동 배율",
            "body": "목표/원래 인분으로 배율을 계산해 모든 재료에 적용합니다."
          },
          {
            "title": "재료 자유 입력",
            "body": "원하는 만큼 재료 행을 추가·삭제할 수 있습니다."
          },
          {
            "title": "즉시 환산",
            "body": "값을 바꾸면 바로 환산됩니다."
          }
        ],
        "howToTitle": "사용 방법",
        "steps": [
          "원래 인분과 목표 인분을 입력합니다.",
          "재료 이름·양·단위를 입력합니다(행 추가 가능).",
          "비율로 환산된 재료량을 확인합니다."
        ],
        "faqTitle": "자주 묻는 질문",
        "faqs": [
          {
            "question": "배율은 어떻게 계산되나요?",
            "answer": "목표 인분 ÷ 원래 인분 입니다. 예: 2인분→4인분이면 ×2."
          },
          {
            "question": "베이킹 레시피도 그대로 되나요?",
            "answer": "기본 재료는 비례하지만, 베이킹 팬 크기·굽는 시간 등은 단순 비례가 아닐 수 있어 조정이 필요합니다."
          },
          {
            "question": "단위는 자동 변환되나요?",
            "answer": "양만 비례 환산되고 단위는 그대로 표시됩니다. 컵↔mL 변환은 부피 변환기를 이용하세요."
          }
        ],
        "disclaimer": "단순 비율 환산이에요. 베이킹 등 일부 레시피는 양을 비례로만 늘리면 결과가 달라질 수 있어 조정이 필요할 수 있어요."
      }
    },
    "en": {
      "meta": {
        "title": "Recipe Scaler — Adjust Servings & Scale Ingredients",
        "description": "Enter the original and target servings to automatically scale every ingredient amount. Easily turn a 2-serving recipe into 4."
      },
      "content": {
        "introTitle": "What is the recipe scaler?",
        "intro": "Enter the original and target servings to get a scale factor, and every ingredient you add is scaled proportionally. Handy for resizing a recipe up or down for any number of people.",
        "formulaTitle": "Highlights",
        "formulas": [
          {
            "title": "Automatic factor",
            "body": "Computes target/original and applies it to every ingredient."
          },
          {
            "title": "Free ingredient list",
            "body": "Add or remove as many ingredient rows as you like."
          },
          {
            "title": "Instant",
            "body": "Amounts update as you type."
          }
        ],
        "howToTitle": "How to use",
        "steps": [
          "Enter the original and target servings.",
          "Add each ingredient's name, amount, and unit.",
          "Read the proportionally scaled amounts."
        ],
        "faqTitle": "Questions",
        "faqs": [
          {
            "question": "How is the factor computed?",
            "answer": "Target servings ÷ original servings. E.g., 2→4 servings is ×2."
          },
          {
            "question": "Does it work for baking?",
            "answer": "Base ingredients scale proportionally, but pan size and bake time may not — adjust as needed."
          },
          {
            "question": "Are units converted?",
            "answer": "Only amounts are scaled; units stay as entered. Use the volume converter for cups↔mL."
          }
        ],
        "disclaimer": "This is a simple proportional scale. Some recipes (especially baking) may not scale linearly and can need adjustment."
      }
    },
    "ja": {
      "meta": {
        "title": "レシピ倍率計算機 — 人数分の調整・材料量を自動換算",
        "description": "元の人数分と目標の人数分を入力すると、全材料の量を比率に合わせて自動換算します。"
      },
      "content": {
        "introTitle": "レシピ倍率計算機とは？",
        "intro": "元の人数分と目標の人数分を入力すると倍率が計算され、追加した全材料の量が比率に合わせて自動換算されます。人数に合わせてレシピを増減する際に便利です。",
        "formulaTitle": "主な特徴",
        "formulas": [
          {
            "title": "自動倍率",
            "body": "目標/元の人数分で倍率を計算し全材料に適用します。"
          },
          {
            "title": "材料自由入力",
            "body": "材料行を自由に追加・削除できます。"
          },
          {
            "title": "即時換算",
            "body": "入力するとすぐに換算されます。"
          }
        ],
        "howToTitle": "使い方",
        "steps": [
          "元の人数分と目標の人数分を入力します。",
          "材料の名前・量・単位を入力します（行追加可）。",
          "比率で換算された材料量を確認します。"
        ],
        "faqTitle": "よくある質問",
        "faqs": [
          {
            "question": "倍率はどう計算しますか？",
            "answer": "目標の人数分 ÷ 元の人数分 です。例: 2人分→4人分なら×2。"
          },
          {
            "question": "ベーキングでも使えますか？",
            "answer": "基本材料は比例しますが、型のサイズや焼き時間は比例しない場合があり調整が必要です。"
          },
          {
            "question": "単位は変換されますか？",
            "answer": "量のみ比例換算され、単位はそのまま表示します。カップ↔mLは体積変換をご利用ください。"
          }
        ],
        "disclaimer": "単純な比率換算です。ベーキングなど一部のレシピは比例だけでは結果が変わることがあり、調整が必要な場合があります。"
      }
    },
    "zh": {
      "meta": {
        "title": "食谱倍数计算器 — 调整份数·自动换算食材用量",
        "description": "输入原份数和目标份数，自动按比例换算所有食材用量。"
      },
      "content": {
        "introTitle": "食谱倍数计算器 — 调整份数·自动换算食材用量",
        "intro": "按目标份数与原始份数的比例调整配料数量。保留原单位，不自动换算克、毫升或杯，也不按比例推算烹饪时间。",
        "formulaTitle": "计算原理",
        "formulas": [
          {
            "title": "计算原理",
            "body": "新数量 = 原数量 × 目标份数 ÷ 原始份数。"
          },
          {
            "title": "常见问题",
            "body": "2份改为6份时，125克变为375克。烘焙容器、温度和时间不能简单按三倍处理。"
          }
        ],
        "howToTitle": "使用方法",
        "steps": [
          "输入大于零的原始份数和目标份数。",
          "填写每种配料的数量和单位。",
          "检查换算量，并遵循原配方的操作与安全要求。"
        ],
        "faqTitle": "常见问题",
        "faqs": [
          {
            "question": "计算原理?",
            "answer": "2份改为6份时，125克变为375克。烘焙容器、温度和时间不能简单按三倍处理。"
          }
        ],
        "disclaimer": "结果仅根据输入条件计算。请确认实际情况或机构规定。"
      }
    },
    "fr": {
      "meta": {
        "title": "Calculateur de Recette — Ajuster les portions et les ingrédients",
        "description": "Saisissez les portions d'origine et cibles pour ajuster automatiquement chaque ingrédient."
      },
      "content": {
        "introTitle": "Calculateur de Recette — Ajuster les portions et les ingrédients",
        "intro": "Adaptez les quantités au rapport entre portions souhaitées et portions d’origine. Les unités restent inchangées : ce n’est ni une conversion grammes/millilitres ni un calcul du temps de cuisson.",
        "formulaTitle": "Calcul",
        "formulas": [
          {
            "title": "Calcul",
            "body": "Nouvelle quantité = quantité initiale × portions souhaitées ÷ portions initiales."
          },
          {
            "title": "Questions",
            "body": "De 2 à 6 portions, 125 g deviennent 375 g. Le récipient, la température et la durée ne se multiplient pas automatiquement par trois."
          }
        ],
        "howToTitle": "Mode d’emploi",
        "steps": [
          "Saisissez deux nombres de portions strictement positifs.",
          "Ajoutez la quantité et l’unité de chaque ingrédient.",
          "Vérifiez le résultat et respectez les instructions et règles de sécurité de la recette."
        ],
        "faqTitle": "Questions",
        "faqs": [
          {
            "question": "Calcul?",
            "answer": "De 2 à 6 portions, 125 g deviennent 375 g. Le récipient, la température et la durée ne se multiplient pas automatiquement par trois."
          }
        ],
        "disclaimer": "Les résultats dépendent de vos saisies. Vérifiez les conditions réelles ou les règles de votre établissement."
      }
    },
    "es": {
      "meta": {
        "title": "Calculadora de Recetas — Ajustar porciones e ingredientes",
        "description": "Introduce las porciones originales y objetivo para escalar automáticamente cada ingrediente."
      },
      "content": {
        "introTitle": "Calculadora de Recetas — Ajustar porciones e ingredientes",
        "intro": "Ajusta cantidades según la proporción entre raciones deseadas y originales. Conserva las unidades: no convierte gramos a mililitros ni calcula el tiempo de cocción.",
        "formulaTitle": "Cálculo",
        "formulas": [
          {
            "title": "Cálculo",
            "body": "Nueva cantidad = cantidad original × raciones deseadas ÷ raciones originales."
          },
          {
            "title": "Preguntas",
            "body": "Al pasar de 2 a 6 raciones, 125 g son 375 g. El recipiente, la temperatura y el tiempo no se multiplican automáticamente por tres."
          }
        ],
        "howToTitle": "Cómo usarlo",
        "steps": [
          "Introduce dos números de raciones mayores que cero.",
          "Añade la cantidad y la unidad de cada ingrediente.",
          "Revisa los resultados y sigue las instrucciones y la seguridad de la receta."
        ],
        "faqTitle": "Preguntas",
        "faqs": [
          {
            "question": "Cálculo?",
            "answer": "Al pasar de 2 a 6 raciones, 125 g son 375 g. El recipiente, la temperatura y el tiempo no se multiplican automáticamente por tres."
          }
        ],
        "disclaimer": "Los resultados dependen de tus datos. Comprueba las condiciones reales o las normas de tu institución."
      }
    }
  },
  "anniversary-calculator": {
    "ko": {
      "meta": {
        "title": "기념일·디데이 계산기 — 100일·1주년·D-Day 카운트",
        "description": "연인·결혼·입사 등 중요한 날부터 지난 일수(D+N)를 계산하고, 100일·200일·1000일 등 주요 기념일 날짜를 한눈에 확인합니다."
      },
      "content": {
        "introTitle": "기념일 계산은 기준일과 포함 방식이 핵심입니다",
        "intro": "100일, 1주년, D-Day처럼 같은 날짜 계산도 기준일을 포함하는지에 따라 결과가 달라질 수 있어요. 이 계산기는 시작일 또는 목표일을 기준으로 지난 일수와 남은 일수, 자주 찾는 기념일 날짜를 한 번에 확인하도록 도와요.",
        "formulaTitle": "계산 기준",
        "formulas": [
          {
            "title": "D+N",
            "body": "기준일 이후 얼마나 많은 날이 지났는지 계산합니다."
          },
          {
            "title": "D-Day",
            "body": "오늘부터 목표일까지 남은 일수를 계산합니다."
          },
          {
            "title": "기념일",
            "body": "100일, 200일, 1주년처럼 기준일에 일정 일수를 더합니다."
          }
        ],
        "howToTitle": "사용 방법",
        "steps": [
          "연애, 결혼, 입사 등 기준이 되는 날짜를 입력합니다.",
          "지난 일수 또는 목표일까지 남은 일수를 확인합니다.",
          "100일, 365일, 1000일 같은 주요 기념일 날짜를 일정에 옮겨 둡니다."
        ],
        "faqTitle": "자주 묻는 질문",
        "faqs": [
          {
            "question": "시작일을 1일째로 보나요?",
            "answer": "일반적인 기념일 문화에서는 만난 날을 1일째로 세는 경우가 많습니다. 공식 일정이나 계약일 계산은 별도 기준을 확인하세요."
          },
          {
            "question": "윤년은 반영되나요?",
            "answer": "날짜 객체를 기준으로 계산하므로 2월 29일이 포함된 기간도 실제 달력 일수에 맞춰 처리됩니다."
          },
          {
            "question": "1주년은 365일과 항상 같나요?",
            "answer": "기념일로서의 1주년은 다음 해 같은 월일입니다. 기간 중 윤년이 있으면 단순 365일째와 다를 수 있습니다."
          }
        ],
        "disclaimer": "이 도구는 개인 일정 관리를 위한 참고 계산기예요. 법적 기한, 계약 기간, 공식 제출일은 해당 기관의 기준을 확인하세요."
      }
    },
    "en": {
      "meta": {
        "title": "Anniversary & D-Day Calculator — Count Days & Milestones",
        "description": "Calculate days since any special event (D+ mode) or days until a future target (D-Day mode). See key milestones like 100, 365, 1000 days at a glance."
      },
      "content": {
        "introTitle": "Anniversary counting depends on the start date and counting rule",
        "intro": "A 100-day celebration, first anniversary, and D-Day countdown can use different counting conventions. This calculator helps you check elapsed days, remaining days, and common milestone dates from one chosen event date.",
        "formulaTitle": "Counting concepts",
        "formulas": [
          {
            "title": "D+ count",
            "body": "Shows how many days have passed since the base date."
          },
          {
            "title": "D-Day",
            "body": "Shows how many days remain until a target date."
          },
          {
            "title": "Milestones",
            "body": "Adds fixed day counts such as 100, 200, 365, or 1000 days to the base date."
          }
        ],
        "howToTitle": "How to use",
        "steps": [
          "Enter the date that marks the event or relationship start.",
          "Check the elapsed-day count or countdown to a future target.",
          "Save key milestone dates such as 100 days, one year, or 1000 days to your calendar."
        ],
        "faqTitle": "Frequently asked questions",
        "faqs": [
          {
            "question": "Is the start date counted as day one?",
            "answer": "For personal anniversaries, many people count the first day as day one. Legal and administrative deadlines may use a different convention."
          },
          {
            "question": "Does the calculator handle leap years?",
            "answer": "Yes. It works from real calendar dates, so periods that include February 29 follow the actual calendar day count."
          },
          {
            "question": "Is a first anniversary always the same as 365 days?",
            "answer": "A first anniversary is usually the same month and day in the next year. If a leap day is involved, it may not match a simple 365-day milestone."
          }
        ],
        "disclaimer": "This calculator is for personal planning. Confirm legal deadlines, contract periods, and official due dates with the relevant authority."
      }
    },
    "ja": {
      "meta": {
        "title": "記念日・Dデイ計算機 — 経過日数と節目を確認",
        "description": "大切な日からの経過日数(D+N)を計算し、100日・365日・1000日などの節目の日付を一覧表示します。"
      },
      "content": {
        "introTitle": "記念日の計算は基準日と数え方で変わります",
        "intro": "100日記念、1周年、Dデイのカウントは、基準日を含めるかどうかで結果が変わることがあります。この計算機では、指定した日からの経過日数、目標日までの日数、よく使う節目の日付をまとめて確認できます。",
        "formulaTitle": "計算の考え方",
        "formulas": [
          {
            "title": "D+カウント",
            "body": "基準日から何日経過したかを表示します。"
          },
          {
            "title": "Dデイ",
            "body": "今日から目標日まで残り何日かを表示します。"
          },
          {
            "title": "節目の日",
            "body": "100日、200日、365日、1000日などを基準日に加算します。"
          }
        ],
        "howToTitle": "使い方",
        "steps": [
          "記念日や開始日となる日付を入力します。",
          "経過日数または目標日までの残り日数を確認します。",
          "100日、1周年、1000日などの節目をカレンダーに控えます。"
        ],
        "faqTitle": "よくある質問",
        "faqs": [
          {
            "question": "開始日は1日目として数えますか？",
            "answer": "個人的な記念日では開始日を1日目とすることがよくあります。法的期限や公的な期間計算では別の基準を確認してください。"
          },
          {
            "question": "うるう年は反映されますか？",
            "answer": "実際のカレンダー日付をもとに計算するため、2月29日を含む期間も実日数に沿って扱います。"
          },
          {
            "question": "1周年は必ず365日目ですか？",
            "answer": "1周年は通常、翌年の同じ月日です。うるう日が関係する場合、単純な365日目とずれることがあります。"
          }
        ],
        "disclaimer": "この計算機は個人の予定管理向けです。法的期限、契約期間、公的な提出日は該当機関の基準をご確認ください。"
      }
    },
    "zh": {
      "meta": {
        "title": "纪念日・倒数计算机 — 天数与重要里程碑",
        "description": "计算特别日期起的经过天数（D+N），或距离目标日期的倒数天数，并自动显示100天、周年、1000天等重要里程碑。"
      },
      "content": {
        "introTitle": "纪念日计算取决于起始日期和计数规则",
        "intro": "100天纪念日、一周年和倒数日可能采用不同的计数方式，尤其是起始日是否算作第一天。这个计算器可以根据一个基准日期查看已过去天数、剩余天数和常见里程碑日期。",
        "formulaTitle": "计算概念",
        "formulas": [
          {
            "title": "D+天数",
            "body": "显示从基准日期开始已经过去多少天。"
          },
          {
            "title": "倒数日",
            "body": "显示从今天到目标日期还剩多少天。"
          },
          {
            "title": "里程碑",
            "body": "把100天、200天、365天或1000天加到基准日期上。"
          }
        ],
        "howToTitle": "使用方法",
        "steps": [
          "输入事件、恋爱、结婚或入职的基准日期。",
          "查看已过去天数，或查看到目标日期的剩余天数。",
          "把100天、一周年、1000天等重要日期记录到日历中。"
        ],
        "faqTitle": "常见问题",
        "faqs": [
          {
            "question": "起始日算第一天吗？",
            "answer": "个人纪念日通常会把开始当天算作第一天。法律、合同或行政期限可能采用不同规则。"
          },
          {
            "question": "会处理闰年吗？",
            "answer": "会。计算基于真实日历日期，因此包含2月29日的期间也会按实际天数处理。"
          },
          {
            "question": "一周年一定等于365天吗？",
            "answer": "一周年通常是下一年的同月同日。如果期间涉及闰日，可能和单纯的第365天不同。"
          }
        ],
        "disclaimer": "本工具用于个人日程参考。法律期限、合同期间和正式提交日期请以相关机构标准为准。"
      }
    },
    "fr": {
      "meta": {
        "title": "Calculateur d'anniversaire & Compte à rebours",
        "description": "Calculez le nombre de jours depuis un événement spécial ou le nombre de jours avant une date cible. Visualisez les jalons clés : 100, 365, 1000 jours."
      },
      "content": {
        "introTitle": "Le calcul d'un anniversaire dépend de la date de départ et de la convention",
        "intro": "Une célébration des 100 jours, un premier anniversaire et un compte à rebours ne suivent pas toujours la même convention. Cet outil aide à vérifier les jours écoulés, les jours restants et les jalons courants depuis une date choisie.",
        "formulaTitle": "Repères de calcul",
        "formulas": [
          {
            "title": "D+N",
            "body": "Indique le nombre de jours écoulés depuis la date de départ."
          },
          {
            "title": "Compte à rebours",
            "body": "Indique le nombre de jours restants avant une date cible."
          },
          {
            "title": "Jalons",
            "body": "Ajoute 100, 200, 365 ou 1000 jours à la date de départ."
          }
        ],
        "howToTitle": "Comment l'utiliser",
        "steps": [
          "Saisissez la date de l'événement ou du début de la relation.",
          "Consultez le nombre de jours écoulés ou le compte à rebours vers une date cible.",
          "Notez les jalons importants comme 100 jours, un an ou 1000 jours."
        ],
        "faqTitle": "Questions fréquentes",
        "faqs": [
          {
            "question": "La date de départ compte-t-elle comme premier jour ?",
            "answer": "Pour les anniversaires personnels, c'est souvent le cas. Les délais légaux ou administratifs peuvent utiliser une autre règle."
          },
          {
            "question": "Les années bissextiles sont-elles prises en compte ?",
            "answer": "Oui. Le calcul utilise les dates réelles du calendrier, y compris les périodes contenant le 29 février."
          },
          {
            "question": "Un premier anniversaire équivaut-il toujours à 365 jours ?",
            "answer": "Un anniversaire correspond généralement au même jour et mois l'année suivante. Avec une année bissextile, cela peut différer d'un simple jalon de 365 jours."
          }
        ],
        "disclaimer": "Cet outil sert à l'organisation personnelle. Vérifiez les délais légaux, contractuels ou officiels auprès de l'autorité compétente."
      }
    },
    "es": {
      "meta": {
        "title": "Calculadora de aniversario y cuenta atrás",
        "description": "Calcula los días transcurridos desde una fecha especial o los días restantes hasta un objetivo. Muestra hitos clave como 100, 365 y 1000 días."
      },
      "content": {
        "introTitle": "El cálculo de aniversarios depende de la fecha base y la convención",
        "intro": "Una celebración de 100 días, un primer aniversario y una cuenta atrás pueden usar reglas distintas. Esta calculadora permite revisar días transcurridos, días restantes e hitos habituales desde una fecha elegida.",
        "formulaTitle": "Conceptos de cálculo",
        "formulas": [
          {
            "title": "D+N",
            "body": "Muestra cuántos días han pasado desde la fecha base."
          },
          {
            "title": "D-Day",
            "body": "Muestra cuántos días faltan para una fecha objetivo."
          },
          {
            "title": "Hitos",
            "body": "Suma 100, 200, 365 o 1000 días a la fecha base."
          }
        ],
        "howToTitle": "Cómo usarlo",
        "steps": [
          "Introduce la fecha del evento o del inicio de la relación.",
          "Consulta los días transcurridos o los días restantes hasta un objetivo.",
          "Guarda en tu calendario hitos como 100 días, un año o 1000 días."
        ],
        "faqTitle": "Preguntas frecuentes",
        "faqs": [
          {
            "question": "¿La fecha inicial cuenta como día uno?",
            "answer": "En aniversarios personales suele contarse así. Los plazos legales o administrativos pueden seguir otra convención."
          },
          {
            "question": "¿Tiene en cuenta años bisiestos?",
            "answer": "Sí. El cálculo usa fechas reales del calendario, por lo que incluye correctamente el 29 de febrero."
          },
          {
            "question": "¿Un primer aniversario siempre son 365 días?",
            "answer": "Normalmente es el mismo día y mes del año siguiente. Si interviene un año bisiesto, puede no coincidir con el día 365 exacto."
          }
        ],
        "disclaimer": "Esta calculadora es para planificación personal. Confirma plazos legales, contratos y fechas oficiales con la autoridad correspondiente."
      }
    }
  },
  "gpa-calculator": {
    "ko": {
      "meta": {
        "title": "학점 계산기 — GPA 및 평균 학점 계산",
        "description": "과목별 성적과 학점을 입력해 평균 학점(GPA)을 계산하세요. 4.5점 만점과 4.3점 만점 방식 모두 지원합니다."
      },
      "content": {
        "introTitle": "학점 계산기 — GPA 및 평균 학점 계산",
        "intro": "GPA는 확인된 숫자 평점에 학점을 곱해 더한 뒤 총 학점으로 나눈 값이에요. 문자 등급의 환산표·재수강·이수 인정·반올림 규칙은 학교마다 달라 자동 추정하지 않아요.",
        "formulaTitle": "계산 원리",
        "formulas": [
          {
            "title": "GPA",
            "body": "Σ(points × credits) ÷ Σ(credits)"
          },
          {
            "title": "계산 원리",
            "body": "평점4인 3학점과 평점2인 1학점의 평균은 (4×3+2×1)÷4=3.5예요."
          }
        ],
        "howToTitle": "이렇게 입력해요",
        "steps": [
          "학교의 평점 만점을 입력해요.",
          "과목별 확정 숫자 평점과 양수 학점을 입력해요.",
          "과목을 추가하고 가중 평균을 확인해요."
        ],
        "faqTitle": "자주 묻는 질문",
        "faqs": [
          {
            "question": "계산 원리?",
            "answer": "GPA는 확인된 숫자 평점에 학점을 곱해 더한 뒤 총 학점으로 나눈 값이에요. 문자 등급의 환산표·재수강·이수 인정·반올림 규칙은 학교마다 달라 자동 추정하지 않아요."
          }
        ],
        "disclaimer": "입력한 조건을 계산한 참고값이에요. 실제 상황이나 기관의 규정을 확인하세요."
      }
    },
    "en": {
      "meta": {
        "title": "GPA Calculator",
        "description": "Calculate your GPA by entering grades and credit hours for each course. Supports both 4.5 and 4.3 scale systems."
      },
      "content": {
        "introTitle": "GPA Calculator",
        "intro": "GPA is the sum of confirmed numeric points times credits, divided by total credits. Letter conversion, repeated courses, excluded credits and rounding depend on your institution and are not inferred.",
        "formulaTitle": "Calculation",
        "formulas": [
          {
            "title": "GPA",
            "body": "Σ(points × credits) ÷ Σ(credits)"
          },
          {
            "title": "Calculation",
            "body": "A 3-credit course at 4 points and a 1-credit course at 2 points give (4×3+2×1)÷4=3.5."
          }
        ],
        "howToTitle": "How to use it",
        "steps": [
          "Enter your institution’s maximum grade points.",
          "Enter confirmed numeric points and positive credits for every course.",
          "Add courses and review the weighted average."
        ],
        "faqTitle": "Questions",
        "faqs": [
          {
            "question": "Calculation?",
            "answer": "GPA is the sum of confirmed numeric points times credits, divided by total credits. Letter conversion, repeated courses, excluded credits and rounding depend on your institution and are not inferred."
          }
        ],
        "disclaimer": "Results reflect your inputs. Check the relevant real-world conditions or institution rules."
      }
    },
    "ja": {
      "meta": {
        "title": "GPA計算機",
        "description": "各科目の成績と単位数を入力してGPAを計算します。4.5点満点と4.3点満点の両方に対応しています。"
      },
      "content": {
        "introTitle": "GPA計算機",
        "intro": "GPAは確認済みの評点と単位数の積を合計し、総単位数で割った値です。文字評価の換算、再履修、対象単位、丸め方は学校ごとに異なるため推定しません。",
        "formulaTitle": "計算の仕組み",
        "formulas": [
          {
            "title": "GPA",
            "body": "Σ(points × credits) ÷ Σ(credits)"
          },
          {
            "title": "計算の仕組み",
            "body": "評点4の3単位科目と評点2の1単位科目なら、(4×3+2×1)÷4=3.5です。"
          }
        ],
        "howToTitle": "入力方法",
        "steps": [
          "学校の評点の満点を入力します。",
          "各科目の確定した評点と正の単位数を入力します。",
          "科目を追加し、加重平均を確認します。"
        ],
        "faqTitle": "よくある質問",
        "faqs": [
          {
            "question": "計算の仕組み?",
            "answer": "GPAは確認済みの評点と単位数の積を合計し、総単位数で割った値です。文字評価の換算、再履修、対象単位、丸め方は学校ごとに異なるため推定しません。"
          }
        ],
        "disclaimer": "入力した条件から算出する参考値です。実際の状況や所属機関の規則を確認してください。"
      }
    },
    "zh": {
      "meta": {
        "title": "GPA计算机",
        "description": "输入各科成绩和学分计算平均绩点(GPA)。支持4.5分制和4.3分制。"
      },
      "content": {
        "introTitle": "GPA计算机",
        "intro": "GPA为已确认的数字绩点乘以学分后的总和，再除以总学分。字母等级换算、重修、计入范围和取整因学校而异，本工具不自动推定。",
        "formulaTitle": "计算原理",
        "formulas": [
          {
            "title": "GPA",
            "body": "Σ(points × credits) ÷ Σ(credits)"
          },
          {
            "title": "计算原理",
            "body": "3学分、绩点4的课程与1学分、绩点2的课程，加权平均为(4×3+2×1)÷4=3.5。"
          }
        ],
        "howToTitle": "使用方法",
        "steps": [
          "输入学校规定的绩点满分。",
          "逐门填写已确认的数字绩点和大于零的学分。",
          "添加课程并核对加权平均。"
        ],
        "faqTitle": "常见问题",
        "faqs": [
          {
            "question": "计算原理?",
            "answer": "GPA为已确认的数字绩点乘以学分后的总和，再除以总学分。字母等级换算、重修、计入范围和取整因学校而异，本工具不自动推定。"
          }
        ],
        "disclaimer": "结果仅根据输入条件计算。请确认实际情况或机构规定。"
      }
    },
    "fr": {
      "meta": {
        "title": "Calculateur de GPA",
        "description": "Calculez votre GPA en saisissant les notes et les heures de crédit pour chaque cours."
      },
      "content": {
        "introTitle": "Calculateur de GPA",
        "intro": "La moyenne est la somme des points numériques confirmés multipliés par les crédits, divisée par les crédits totaux. Conversion des lettres, redoublements, crédits exclus et arrondis dépendent de votre établissement.",
        "formulaTitle": "Calcul",
        "formulas": [
          {
            "title": "GPA",
            "body": "Σ(points × credits) ÷ Σ(credits)"
          },
          {
            "title": "Calcul",
            "body": "Un cours de 3 crédits à 4 points et un cours de 1 crédit à 2 points donnent (4×3+2×1)÷4=3,5."
          }
        ],
        "howToTitle": "Mode d’emploi",
        "steps": [
          "Saisissez le maximum de points de votre établissement.",
          "Renseignez les points confirmés et les crédits positifs de chaque cours.",
          "Ajoutez les cours et vérifiez la moyenne pondérée."
        ],
        "faqTitle": "Questions",
        "faqs": [
          {
            "question": "Calcul?",
            "answer": "La moyenne est la somme des points numériques confirmés multipliés par les crédits, divisée par les crédits totaux. Conversion des lettres, redoublements, crédits exclus et arrondis dépendent de votre établissement."
          }
        ],
        "disclaimer": "Les résultats dépendent de vos saisies. Vérifiez les conditions réelles ou les règles de votre établissement."
      }
    },
    "es": {
      "meta": {
        "title": "Calculadora de GPA",
        "description": "Calcula tu GPA ingresando calificaciones y créditos para cada materia."
      },
      "content": {
        "introTitle": "Calculadora de GPA",
        "intro": "La media es la suma de los puntos numéricos confirmados multiplicados por sus créditos, dividida por los créditos totales. La conversión de letras, las repeticiones, las exclusiones y el redondeo dependen de tu institución.",
        "formulaTitle": "Cálculo",
        "formulas": [
          {
            "title": "GPA",
            "body": "Σ(points × credits) ÷ Σ(credits)"
          },
          {
            "title": "Cálculo",
            "body": "Una asignatura de 3 créditos con 4 puntos y otra de 1 crédito con 2 puntos dan (4×3+2×1)÷4=3,5."
          }
        ],
        "howToTitle": "Cómo usarlo",
        "steps": [
          "Introduce el máximo de puntos de tu institución.",
          "Añade los puntos confirmados y los créditos positivos de cada asignatura.",
          "Añade asignaturas y comprueba la media ponderada."
        ],
        "faqTitle": "Preguntas",
        "faqs": [
          {
            "question": "Cálculo?",
            "answer": "La media es la suma de los puntos numéricos confirmados multiplicados por sus créditos, dividida por los créditos totales. La conversión de letras, las repeticiones, las exclusiones y el redondeo dependen de tu institución."
          }
        ],
        "disclaimer": "Los resultados dependen de tus datos. Comprueba las condiciones reales o las normas de tu institución."
      }
    }
  },
  "final-grade-calculator": {
    "ko": {
      "meta": {
        "title": "기말고사 성적 계산기 — 목표 점수에 필요한 기말 점수",
        "description": "현재 성적, 기말고사 비중, 목표 최종 성적을 입력하면 목표 달성에 필요한 기말고사 점수를 계산합니다. 도달 불가/이미 확보 여부도 안내."
      },
      "content": {
        "introTitle": "기말고사 성적 계산기란?",
        "intro": "지금까지의 성적과 기말고사가 차지하는 비중을 알면, 목표한 최종 성적을 받기 위해 기말에서 몇 점을 받아야 하는지 역산할 수 있어요. 최종 성적 = 현재 성적 × (1 − 비중) + 기말 점수 × 비중 공식을 풀어요.",
        "formulaTitle": "주요 특징",
        "formulas": [
          {
            "title": "정확한 역산",
            "body": "가중 평균 공식으로 필요한 기말 점수를 계산합니다."
          },
          {
            "title": "현실성 안내",
            "body": "100% 초과로 불가능하거나 이미 목표를 확보한 경우를 알려줍니다."
          },
          {
            "title": "즉시 계산",
            "body": "값을 바꾸면 바로 갱신됩니다."
          }
        ],
        "howToTitle": "사용 방법",
        "steps": [
          "현재까지의 성적(%)을 입력합니다.",
          "기말고사가 차지하는 비중(%)을 입력합니다.",
          "목표 최종 성적(%)을 입력하고 필요한 기말 점수를 확인합니다."
        ],
        "faqTitle": "자주 묻는 질문",
        "faqs": [
          {
            "question": "필요 점수가 100%를 넘으면요?",
            "answer": "기말 만점으로도 목표에 못 미친다는 뜻입니다. 가산점이 없다면 목표를 조정해야 합니다."
          },
          {
            "question": "필요 점수가 음수로 나오면요?",
            "answer": "이미 목표를 확보했다는 뜻으로, 기말 0점이어도 목표 성적을 유지합니다."
          },
          {
            "question": "비중은 어떻게 넣나요?",
            "answer": "기말고사가 최종 성적에서 차지하는 퍼센트(예: 30%)를 넣으면 나머지(70%)는 현재 성적으로 계산됩니다."
          }
        ],
        "disclaimer": "성적 산정 방식(가중치·반올림·가산점)은 학교·강의마다 달라요. 실제 기준은 강의계획서를 확인하세요."
      }
    },
    "en": {
      "meta": {
        "title": "Final Grade Calculator — What You Need on the Final",
        "description": "Enter your current grade, the final exam weight, and your target grade to see exactly what score you need on the final. Flags impossible or already-secured targets."
      },
      "content": {
        "introTitle": "What is the final grade calculator?",
        "intro": "If you know your grade so far and how much the final exam is worth, you can work backward to the score you need on the final to hit your target. It solves: final grade = current × (1 − weight) + final score × weight.",
        "formulaTitle": "Highlights",
        "formulas": [
          {
            "title": "Accurate reverse math",
            "body": "Uses the weighted-average formula to find the needed score."
          },
          {
            "title": "Reality check",
            "body": "Tells you if the target needs over 100% or is already secured."
          },
          {
            "title": "Instant",
            "body": "Results update as you type."
          }
        ],
        "howToTitle": "How to use",
        "steps": [
          "Enter your current grade (%).",
          "Enter the final exam's weight (%).",
          "Enter your target overall grade and read the score you need."
        ],
        "faqTitle": "Questions",
        "faqs": [
          {
            "question": "What if the needed score is over 100%?",
            "answer": "Even a perfect final won't reach your target. Without extra credit, adjust the goal."
          },
          {
            "question": "What if it's negative?",
            "answer": "You've already secured the target — even a 0% final keeps your grade at or above it."
          },
          {
            "question": "How do I enter the weight?",
            "answer": "Enter the percentage the final counts toward your grade (e.g. 30%); the rest (70%) uses your current grade."
          }
        ],
        "disclaimer": "Grading schemes (weights, rounding, extra credit) vary by school and course. Confirm the actual rules in your syllabus."
      }
    },
    "ja": {
      "meta": {
        "title": "期末成績計算機 — 目標達成に必要な期末点",
        "description": "現在の成績・期末試験の比重・目標の最終成績を入力すると、目標達成に必要な期末点を計算します。到達不可・確保済みも判定。"
      },
      "content": {
        "introTitle": "期末成績計算機とは？",
        "intro": "これまでの成績と期末試験の比重が分かれば、目標の最終成績を取るために期末で何点必要かを逆算できます。最終成績 = 現在 ×(1 − 比重) + 期末点 × 比重 を解きます。",
        "formulaTitle": "主な特徴",
        "formulas": [
          {
            "title": "正確な逆算",
            "body": "加重平均の式で必要な期末点を計算します。"
          },
          {
            "title": "現実性の判定",
            "body": "100%超で不可能か、すでに確保済みかを示します。"
          },
          {
            "title": "即時計算",
            "body": "入力するとすぐ更新されます。"
          }
        ],
        "howToTitle": "使い方",
        "steps": [
          "現在までの成績(%)を入力します。",
          "期末試験の比重(%)を入力します。",
          "目標の最終成績(%)を入力し必要な期末点を確認します。"
        ],
        "faqTitle": "よくある質問",
        "faqs": [
          {
            "question": "必要点が100%を超えたら？",
            "answer": "期末満点でも目標に届きません。加点がなければ目標を調整しましょう。"
          },
          {
            "question": "マイナスになったら？",
            "answer": "すでに目標を確保しており、期末0点でも目標を維持できます。"
          },
          {
            "question": "比重はどう入れますか？",
            "answer": "期末が最終成績に占める割合(例:30%)を入れると、残り(70%)が現在の成績で計算されます。"
          }
        ],
        "disclaimer": "成績算定方式(加重・四捨五入・加点)は学校・講義で異なります。実際の基準はシラバスでご確認ください。"
      }
    },
    "zh": {
      "meta": {
        "title": "期末成绩计算器 — 期末需要多少分",
        "description": "输入当前成绩、期末考试占比和目标总成绩，计算达到目标所需的期末分数。提示无法达到或已锁定的情况。"
      },
      "content": {
        "introTitle": "期末成绩计算器 — 期末需要多少分",
        "intro": "根据已完成部分的平均分、期末权重和目标总分，反推所需期末分数。假设各项使用同一百分制，不包含额外加分或学校的取整规则。",
        "formulaTitle": "计算原理",
        "formulas": [
          {
            "title": "计算原理",
            "body": "期末所需分数 =（目标 − 当前分数 ×（1 − 权重））÷ 权重。"
          },
          {
            "title": "常见问题",
            "body": "当前70、期末占50%、目标80时，需要90。若结果超过100，不含额外加分时无法达到目标。"
          }
        ],
        "howToTitle": "使用方法",
        "steps": [
          "输入已完成部分的平均分，范围0至100。",
          "输入期末权重，大于0且不超过100%。",
          "输入目标总分，查看所需分数及是否超过100。"
        ],
        "faqTitle": "常见问题",
        "faqs": [
          {
            "question": "计算原理?",
            "answer": "当前70、期末占50%、目标80时，需要90。若结果超过100，不含额外加分时无法达到目标。"
          }
        ],
        "disclaimer": "结果仅根据输入条件计算。请确认实际情况或机构规定。"
      }
    },
    "fr": {
      "meta": {
        "title": "Calculateur de note finale — Ce qu'il faut à l'examen",
        "description": "Saisissez votre note actuelle, le poids de l'examen final et votre objectif pour connaître la note nécessaire à l'examen. Indique les cas impossibles ou déjà acquis."
      },
      "content": {
        "introTitle": "Calculateur de note finale — Ce qu'il faut à l'examen",
        "intro": "Calculez la note nécessaire à l’examen final à partir de la moyenne déjà obtenue, du poids du final et de votre objectif. Toutes les notes utilisent la même échelle de 0 à 100, sans bonus ni règle d’arrondi scolaire.",
        "formulaTitle": "Calcul",
        "formulas": [
          {
            "title": "Calcul",
            "body": "Note nécessaire = (objectif − moyenne actuelle × (1 − poids)) ÷ poids."
          },
          {
            "title": "Questions",
            "body": "Avec 70 actuellement, un final de 50 % et un objectif de 80, il faut 90. Au-delà de 100, l’objectif est hors d’atteinte sans bonus."
          }
        ],
        "howToTitle": "Mode d’emploi",
        "steps": [
          "Saisissez la moyenne de la partie déjà évaluée, de 0 à 100.",
          "Indiquez le poids du final, strictement positif et au plus égal à 100 %.",
          "Saisissez l’objectif et vérifiez si la note nécessaire dépasse 100."
        ],
        "faqTitle": "Questions",
        "faqs": [
          {
            "question": "Calcul?",
            "answer": "Avec 70 actuellement, un final de 50 % et un objectif de 80, il faut 90. Au-delà de 100, l’objectif est hors d’atteinte sans bonus."
          }
        ],
        "disclaimer": "Les résultats dépendent de vos saisies. Vérifiez les conditions réelles ou les règles de votre établissement."
      }
    },
    "es": {
      "meta": {
        "title": "Calculadora de nota final — Lo que necesitas en el examen",
        "description": "Introduce tu nota actual, el peso del examen final y tu meta para saber qué nota necesitas en el final. Señala metas imposibles o ya aseguradas."
      },
      "content": {
        "introTitle": "Calculadora de nota final — Lo que necesitas en el examen",
        "intro": "Calcula la nota necesaria en el examen final a partir de la media ya obtenida, el peso del final y la nota objetivo. Todas usan la misma escala de 0 a 100, sin puntos extra ni reglas de redondeo de la institución.",
        "formulaTitle": "Cálculo",
        "formulas": [
          {
            "title": "Cálculo",
            "body": "Nota necesaria = (objetivo − media actual × (1 − peso)) ÷ peso."
          },
          {
            "title": "Preguntas",
            "body": "Con una media de 70, un final del 50 % y un objetivo de 80, necesitas 90. Si el resultado supera 100, no se alcanza sin puntos extra."
          }
        ],
        "howToTitle": "Cómo usarlo",
        "steps": [
          "Introduce la media de la parte ya evaluada, entre 0 y 100.",
          "Indica el peso del final, mayor que 0 y como máximo 100 %.",
          "Introduce la nota objetivo y comprueba si necesitas más de 100."
        ],
        "faqTitle": "Preguntas",
        "faqs": [
          {
            "question": "Cálculo?",
            "answer": "Con una media de 70, un final del 50 % y un objetivo de 80, necesitas 90. Si el resultado supera 100, no se alcanza sin puntos extra."
          }
        ],
        "disclaimer": "Los resultados dependen de tus datos. Comprueba las condiciones reales o las normas de tu institución."
      }
    }
  }
};
