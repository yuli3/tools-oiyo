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
        "title": "기념일·디데이 계산기 — 100일·365일째·D-Day",
        "description": "연인·결혼·입사 등 중요한 날부터 지난 일수(D+N)를 계산하고, 100일·200일·1000일 등 주요 기념일 날짜를 한눈에 확인합니다."
      },
      "content": {
        "introTitle": "기념일 계산은 기준일과 포함 방식이 핵심입니다",
        "intro": "시작일을 1일째로 세어 100일·365일째 날짜를 계산해요. D-Day는 오늘을 0일로 세며, 오늘은 방문자 기기의 날짜를 사용해요. 달력상 1주년은 계산하지 않아요.",
        "formulaTitle": "계산 기준",
        "formulas": [
          {
            "title": "D+N",
            "body": "시작일을 1일째로 포함해 D+N을 표시해요."
          },
          {
            "title": "D-Day",
            "body": "목표일 − 방문자 기기의 오늘 날짜예요. 오늘이면0이에요."
          },
          {
            "title": "기념일",
            "body": "N일째 날짜 = 시작일 + (N − 1)일이에요. 달력상1주년 계산과 달라요."
          }
        ],
        "howToTitle": "사용 방법",
        "steps": [
          "연애, 결혼, 입사 등 기준이 되는 날짜를 입력합니다.",
          "지난 일수 또는 목표일까지 남은 일수를 확인합니다.",
          "100일째·365일째·1000일째 날짜를 확인해요."
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
        "title": "Anniversary & D-Day Calculator — Day Counts & Milestones",
        "description": "Calculate days since any special event (D+ mode) or days until a future target (D-Day mode). See key milestones like 100, 365, 1000 days at a glance."
      },
      "content": {
        "introTitle": "Anniversary counting depends on the start date and counting rule",
        "intro": "Milestones count the start date as day 1. D-Day counts today as day 0, using your device’s local calendar date. A 365th-day milestone is not a calendar-year anniversary.",
        "formulaTitle": "Counting concepts",
        "formulas": [
          {
            "title": "D+ count",
            "body": "D+N counts the start date as day 1."
          },
          {
            "title": "D-Day",
            "body": "Target date minus the device’s local today; today is 0."
          },
          {
            "title": "Milestones",
            "body": "The Nth day is start date plus N − 1 days, not a calendar-year anniversary."
          }
        ],
        "howToTitle": "How to use",
        "steps": [
          "Enter the date that marks the event or relationship start.",
          "Check the elapsed-day count or countdown to a future target.",
          "Check the 100th, 365th and 1000th days."
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
        "title": "記念日・Dデイ計算機 — 経過日数と節目",
        "description": "大切な日からの経過日数(D+N)を計算し、100日・365日・1000日などの節目の日付を一覧表示します。"
      },
      "content": {
        "introTitle": "記念日の計算は基準日と数え方で変わります",
        "intro": "節目は開始日を1日目として数えます。Dデイは端末の今日を0日とします。365日目は暦の1周年ではありません。",
        "formulaTitle": "計算の考え方",
        "formulas": [
          {
            "title": "D+カウント",
            "body": "D+Nは開始日を1日目に含めます。"
          },
          {
            "title": "Dデイ",
            "body": "目標日から端末の今日を引きます。当日は0です。"
          },
          {
            "title": "節目の日",
            "body": "N日目は開始日にN−1日を加えます。暦の1周年とは異なります。"
          }
        ],
        "howToTitle": "使い方",
        "steps": [
          "記念日や開始日となる日付を入力します。",
          "経過日数または目標日までの残り日数を確認します。",
          "100日目・365日目・1000日目を確認します。"
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
        "title": "纪念日与倒数计算器 — 天数与里程碑",
        "description": "计算特别日期起的经过天数（D+N），或距离目标日期的倒数天数，并自动显示100天、周年、1000天等重要里程碑。"
      },
      "content": {
        "introTitle": "纪念日计算取决于起始日期和计数规则",
        "intro": "里程碑把开始日期算作第1天。倒数把设备当地的今天算作第0天。第365天并不等于日历上的一周年。",
        "formulaTitle": "计算概念",
        "formulas": [
          {
            "title": "D+天数",
            "body": "D+N把开始日期计为第1天。"
          },
          {
            "title": "倒数日",
            "body": "目标日期减去设备当地的今天；当天为0。"
          },
          {
            "title": "里程碑",
            "body": "第N天是开始日期加N−1天，并非日历上的一周年。"
          }
        ],
        "howToTitle": "使用方法",
        "steps": [
          "输入事件、恋爱、结婚或入职的基准日期。",
          "查看已过去天数，或查看到目标日期的剩余天数。",
          "查看第100天、第365天和第1000天。"
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
        "title": "Dates repères et compte à rebours",
        "description": "Calculez le nombre de jours depuis un événement spécial ou le nombre de jours avant une date cible. Visualisez les jalons clés : 100, 365, 1000 jours."
      },
      "content": {
        "introTitle": "Le calcul d'un anniversaire dépend de la date de départ et de la convention",
        "intro": "Les jalons comptent la date de début comme jour 1. Le compte à rebours prend aujourd’hui comme jour 0, selon la date locale de votre appareil. Le 365e jour n’est pas un anniversaire calendaire.",
        "formulaTitle": "Repères de calcul",
        "formulas": [
          {
            "title": "D+N",
            "body": "D+N inclut la date de début comme jour 1."
          },
          {
            "title": "Compte à rebours",
            "body": "Date cible moins la date locale de l’appareil ; aujourd’hui vaut 0."
          },
          {
            "title": "Jalons",
            "body": "Le Ne jour est le début plus N − 1 jours, sans calcul d’anniversaire calendaire."
          }
        ],
        "howToTitle": "Comment l'utiliser",
        "steps": [
          "Saisissez la date de l'événement ou du début de la relation.",
          "Consultez le nombre de jours écoulés ou le compte à rebours vers une date cible.",
          "Consultez les 100e, 365e et 1000e jours."
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
        "title": "Fechas señaladas y cuenta atrás",
        "description": "Calcula los días transcurridos desde una fecha especial o los días restantes hasta un objetivo. Muestra hitos clave como 100, 365 y 1000 días."
      },
      "content": {
        "introTitle": "El cálculo de aniversarios depende de la fecha base y la convención",
        "intro": "Los hitos cuentan la fecha inicial como día 1. La cuenta atrás usa hoy como día 0, según la fecha local del dispositivo. El día 365 no equivale al aniversario del año siguiente.",
        "formulaTitle": "Conceptos de cálculo",
        "formulas": [
          {
            "title": "D+N",
            "body": "D+N incluye la fecha inicial como día 1."
          },
          {
            "title": "D-Day",
            "body": "Fecha objetivo menos la fecha local del dispositivo; hoy es 0."
          },
          {
            "title": "Hitos",
            "body": "El día N es la fecha inicial más N − 1 días, no un aniversario anual."
          }
        ],
        "howToTitle": "Cómo usarlo",
        "steps": [
          "Introduce la fecha del evento o del inicio de la relación.",
          "Consulta los días transcurridos o los días restantes hasta un objetivo.",
          "Consulta los días 100, 365 y 1000."
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
  },
  "dead-pixel-test": {
    "ko": {
      "meta": {
        "title": "모니터 불량화소 테스트 — 데드픽셀·핫픽셀·빛샘 확인",
        "description": "화면을 검정·흰색·빨강·초록·파랑·회색으로 가득 채워 불량화소(데드·핫·스턱 픽셀)와 얼룩, 밴딩을 눈으로 찾아요. 새 모니터·노트북·휴대폰 검수용, 설치 없이 바로 써요."
      },
      "content": {
        "introTitle": "모니터 불량화소 테스트란?",
        "intro": "화면 전체를 한 가지 색으로 채워서, 꺼지거나(데드 픽셀) 계속 켜져 있거나(핫 픽셀) 다른 색으로 굳은(스턱 픽셀) 점을 찾는 도구예요. 새 모니터나 노트북, 중고 기기를 받았을 때 교환 기간 안에 확인하는 데 써요.",
        "formulaTitle": "무엇을 보나요",
        "formulas": [
          {
            "title": "검정·흰색",
            "body": "검정에서는 밝은 점, 흰색에서는 검은 점을 찾아요."
          },
          {
            "title": "빨강·초록·파랑",
            "body": "한 색에서만 다르게 보이는 점은 스턱 픽셀일 가능성이 커요."
          },
          {
            "title": "회색·그라데이션·격자",
            "body": "얼룩(무라), 계단처럼 끊기는 밴딩, 선명도를 봐요."
          }
        ],
        "howToTitle": "사용 방법",
        "steps": [
          "화면을 깨끗이 닦고 밝기를 최대로 올려요.",
          "\"전체 화면으로 테스트 시작\"을 눌러요.",
          "화면을 누르거나 → 키로 색을 바꾸며 30cm 거리에서 구석까지 천천히 살펴요.",
          "점이 보이면 다른 색에서도 같은 자리인지 확인하고 사진을 찍어 둬요."
        ],
        "faqTitle": "자주 묻는 질문",
        "faqs": [
          {
            "question": "불량화소가 몇 개부터 교환되나요?",
            "answer": "제조사와 판매처마다 기준이 달라요. 무결점 정책을 두는 곳도 있고 개수·위치 기준을 두는 곳도 있으니 구매처 보증 정책을 확인하세요."
          },
          {
            "question": "먼지와 불량화소는 어떻게 구분하나요?",
            "answer": "천으로 닦아서 사라지면 먼지예요. 색을 바꿔도 같은 자리에 남아 있으면 불량화소일 가능성이 커요."
          },
          {
            "question": "휴대폰에서도 되나요?",
            "answer": "네. 브라우저가 전체 화면을 지원하면 화면 전체로, 아니면 브라우저 창 크기만큼 채워요."
          }
        ],
        "disclaimer": "이 도구는 눈으로 확인하도록 화면을 칠할 뿐 하드웨어를 진단하지 않아요. 교환·수리 판단은 판매처와 제조사 기준을 따르세요."
      }
    },
    "en": {
      "meta": {
        "title": "Dead Pixel Test — Check Your Monitor for Dead, Stuck & Hot Pixels",
        "description": "Fill the screen with black, white, red, green, blue and gray to spot dead, hot and stuck pixels, clouding and banding. For new monitors, laptops and phones, right in the browser."
      },
      "content": {
        "introTitle": "What is the dead pixel test?",
        "intro": "It fills the whole screen with one color at a time so you can spot pixels that stay dark (dead), stay lit (hot) or are stuck on another color. Use it when a new or used monitor, laptop or phone arrives, while you can still return it.",
        "formulaTitle": "What to look for",
        "formulas": [
          {
            "title": "Black and white",
            "body": "Bright dots on black, dark dots on white."
          },
          {
            "title": "Red, green, blue",
            "body": "A dot that looks wrong on only one color is likely stuck."
          },
          {
            "title": "Gray, gradient, grid",
            "body": "Clouding (mura), banding and sharpness."
          }
        ],
        "howToTitle": "How to use",
        "steps": [
          "Clean the screen and turn brightness up.",
          "Press \"Start full-screen test\".",
          "Tap or press → to change colors and scan slowly into the corners from about 30 cm away.",
          "If you see a dot, check it on other colors and take a photo."
        ],
        "faqTitle": "FAQ",
        "faqs": [
          {
            "question": "How many dead pixels qualify for a return?",
            "answer": "It depends on the maker and the shop. Some have a zero-defect policy, others count pixels by number and position. Check your seller warranty."
          },
          {
            "question": "Dust or dead pixel?",
            "answer": "Dust wipes off with a cloth. A bad pixel stays in the same place when the color changes."
          },
          {
            "question": "Does it work on phones?",
            "answer": "Yes. It uses full screen where the browser allows it and fills the browser window otherwise."
          }
        ],
        "disclaimer": "This tool only paints the screen so you can look; it does not diagnose hardware. Follow your seller and manufacturer rules for returns and repairs."
      }
    },
    "ja": {
      "meta": {
        "title": "ドット抜けチェック — モニターの滅点・輝点・固定ドットを確認",
        "description": "画面を黒・白・赤・緑・青・グレーで塗りつぶし、ドット抜け(滅点・輝点・固定ドット)やムラ、バンディングを目で確認します。新品モニター・ノートPC・スマホの検品に、インストール不要。"
      },
      "content": {
        "introTitle": "ドット抜けチェックとは?",
        "intro": "画面全体を1色ずつ塗りつぶし、消えたままの点(滅点)、光ったままの点(輝点)、別の色で固まった点を探すツールです。新品や中古のモニター・ノートPC・スマホが届いたら、返品期間内に確認しましょう。",
        "formulaTitle": "見るポイント",
        "formulas": [
          {
            "title": "黒・白",
            "body": "黒では明るい点、白では黒い点を探します。"
          },
          {
            "title": "赤・緑・青",
            "body": "1色だけで違って見える点は固定ドットの可能性が高いです。"
          },
          {
            "title": "グレー・グラデーション・格子",
            "body": "ムラ、バンディング、鮮明さを確認します。"
          }
        ],
        "howToTitle": "使い方",
        "steps": [
          "画面をきれいに拭き、明るさを最大にします。",
          "「全画面でテスト開始」を押します。",
          "タップか → キーで色を変え、30cmほどの距離から隅までゆっくり見ます。",
          "点が見えたらほかの色でも同じ場所か確かめ、写真を撮っておきます。"
        ],
        "faqTitle": "よくある質問",
        "faqs": [
          {
            "question": "何個から交換になりますか?",
            "answer": "メーカーや販売店によって基準が違います。購入先の保証規定を確認してください。"
          },
          {
            "question": "ほこりとの見分け方は?",
            "answer": "布で拭いて消えればほこりです。色を変えても同じ場所に残ればドット抜けの可能性が高いです。"
          },
          {
            "question": "スマホでも使えますか?",
            "answer": "はい。ブラウザが対応していれば全画面、そうでなければブラウザの表示範囲を塗りつぶします。"
          }
        ],
        "disclaimer": "このツールは目で確認するために画面を塗るだけで、ハードウェアを診断するものではありません。交換・修理の判断は販売店・メーカーの基準に従ってください。"
      }
    },
    "zh": {
      "meta": {
        "title": "屏幕坏点测试 — 检查显示器坏点、亮点和卡色点",
        "description": "用黑、白、红、绿、蓝、灰色填满屏幕，用眼睛找出坏点、亮点、卡色点以及云斑和色带。适合验收新显示器、笔记本和手机，无需安装。"
      },
      "content": {
        "introTitle": "什么是屏幕坏点测试?",
        "intro": "它一次用一种颜色填满整个屏幕，帮你找出一直不亮的点(坏点)、一直亮着的点(亮点)或停在其他颜色的点。收到新的或二手的显示器、笔记本、手机时，在退换期内检查一下。",
        "formulaTitle": "看什么",
        "formulas": [
          {
            "title": "黑色与白色",
            "body": "黑屏找亮点，白屏找黑点。"
          },
          {
            "title": "红绿蓝",
            "body": "只在一种颜色下异常的点，多半是卡色点。"
          },
          {
            "title": "灰色、渐变、棋盘",
            "body": "检查云斑、色带断层和清晰度。"
          }
        ],
        "howToTitle": "使用方法",
        "steps": [
          "擦干净屏幕并把亮度调到最高。",
          "点击“全屏开始测试”。",
          "点击屏幕或按 → 键换色，在约30厘米外慢慢看到四个角。",
          "发现点后换几种颜色确认位置，并拍照留存。"
        ],
        "faqTitle": "常见问题",
        "faqs": [
          {
            "question": "几个坏点可以换货?",
            "answer": "各厂商和商家标准不同，请查看购买渠道的保修政策。"
          },
          {
            "question": "怎么区分灰尘和坏点?",
            "answer": "用布擦掉就消失的是灰尘；换颜色后仍在原处的多半是坏点。"
          },
          {
            "question": "手机能用吗?",
            "answer": "可以。浏览器支持时全屏显示，否则填满浏览器窗口。"
          }
        ],
        "disclaimer": "本工具只是为了肉眼检查而给屏幕上色，不能诊断硬件。退换和维修请以商家和厂商标准为准。"
      }
    },
    "fr": {
      "meta": {
        "title": "Test de pixels morts — Vérifier un écran (pixels morts, bloqués, chauds)",
        "description": "Remplissez l'écran de noir, blanc, rouge, vert, bleu et gris pour repérer pixels morts, chauds et bloqués, taches et effet de bandes. Pour un nouvel écran, portable ou téléphone, sans installation."
      },
      "content": {
        "introTitle": "Qu'est-ce que le test de pixels morts ?",
        "intro": "Il remplit tout l'écran d'une seule couleur à la fois pour repérer les pixels qui restent éteints (morts), allumés (chauds) ou bloqués sur une autre couleur. À faire dès réception d'un écran, d'un portable ou d'un téléphone, neuf ou d'occasion, pendant le délai de retour.",
        "formulaTitle": "Que regarder",
        "formulas": [
          {
            "title": "Noir et blanc",
            "body": "Points brillants sur le noir, points noirs sur le blanc."
          },
          {
            "title": "Rouge, vert, bleu",
            "body": "Un point anormal sur une seule couleur est probablement bloqué."
          },
          {
            "title": "Gris, dégradé, damier",
            "body": "Taches (mura), bandes et netteté."
          }
        ],
        "howToTitle": "Mode d’emploi",
        "steps": [
          "Nettoyez l'écran et montez la luminosité.",
          "Appuyez sur « Lancer le test en plein écran ».",
          "Touchez ou appuyez sur → pour changer de couleur et balayez lentement jusqu’aux coins à 30 cm.",
          "Si vous voyez un point, vérifiez-le sur d’autres couleurs et prenez une photo."
        ],
        "faqTitle": "Questions fréquentes",
        "faqs": [
          {
            "question": "Combien de pixels morts pour un échange ?",
            "answer": "Cela dépend du fabricant et du vendeur. Consultez la garantie de votre vendeur."
          },
          {
            "question": "Poussière ou pixel mort ?",
            "answer": "La poussière s'essuie. Un pixel défectueux reste au même endroit quand la couleur change."
          },
          {
            "question": "Ça marche sur téléphone ?",
            "answer": "Oui. En plein écran si le navigateur le permet, sinon dans la fenêtre du navigateur."
          }
        ],
        "disclaimer": "Cet outil colore seulement l'écran pour un contrôle visuel ; il ne diagnostique pas le matériel. Pour un retour ou une réparation, suivez les règles du vendeur et du fabricant."
      }
    },
    "es": {
      "meta": {
        "title": "Test de píxeles muertos — Revisa tu pantalla (muertos, atascados, calientes)",
        "description": "Llena la pantalla de negro, blanco, rojo, verde, azul y gris para encontrar píxeles muertos, calientes y atascados, manchas y bandas. Para monitores, portátiles y móviles nuevos, sin instalar nada."
      },
      "content": {
        "introTitle": "¿Qué es el test de píxeles muertos?",
        "intro": "Llena toda la pantalla con un solo color cada vez para encontrar píxeles que siguen apagados (muertos), encendidos (calientes) o atascados en otro color. Úsalo al recibir un monitor, portátil o móvil, nuevo o usado, mientras aún puedas devolverlo.",
        "formulaTitle": "Qué mirar",
        "formulas": [
          {
            "title": "Negro y blanco",
            "body": "Puntos brillantes sobre negro, puntos oscuros sobre blanco."
          },
          {
            "title": "Rojo, verde, azul",
            "body": "Un punto que solo falla en un color probablemente está atascado."
          },
          {
            "title": "Gris, degradado, damero",
            "body": "Manchas (mura), bandas y nitidez."
          }
        ],
        "howToTitle": "Cómo usarlo",
        "steps": [
          "Limpia la pantalla y sube el brillo.",
          "Pulsa «Empezar la prueba en pantalla completa».",
          "Toca o pulsa → para cambiar de color y revisa despacio hasta las esquinas a unos 30 cm.",
          "Si ves un punto, compruébalo con otros colores y haz una foto."
        ],
        "faqTitle": "Preguntas frecuentes",
        "faqs": [
          {
            "question": "¿Cuántos píxeles muertos dan derecho a cambio?",
            "answer": "Depende del fabricante y de la tienda. Revisa la garantía del vendedor."
          },
          {
            "question": "¿Polvo o píxel muerto?",
            "answer": "El polvo se quita con un paño. Un píxel defectuoso sigue en el mismo sitio al cambiar el color."
          },
          {
            "question": "¿Funciona en el móvil?",
            "answer": "Sí. Usa pantalla completa si el navegador lo permite y, si no, llena la ventana del navegador."
          }
        ],
        "disclaimer": "Esta herramienta solo colorea la pantalla para revisarla a simple vista; no diagnostica el hardware. Para cambios o reparaciones sigue las normas del vendedor y del fabricante."
      }
    }
  },
  "face-ratio": {
    "ko": {
      "meta": {
        "title": "얼굴 비율 분석 — 삼정오안·좌우 대칭을 사진으로 재 보기",
        "description": "얼굴 사진 한 장으로 삼정(이마·코·턱 세로 비율), 오안(가로 5등분), 좌우 대칭, 입과 코 폭 비율을 재요. 사진은 서버로 보내지 않고 내 기기 안에서만 분석해요."
      },
      "content": {
        "introTitle": "얼굴 비율 분석이란?",
        "intro": "사진에서 얼굴 점 468개를 찾아 동양 관상·미술에서 오래 써 온 기준인 삼정오안과 좌우 대칭을 숫자로 보여 주는 도구예요. 예전 'AI 얼굴평가'처럼 외모에 점수를 매기지 않고, 잴 수 있는 비율만 알려 줘요.",
        "formulaTitle": "무엇을 재나요",
        "formulas": [
          {
            "title": "삼정",
            "body": "머리선 근처~미간, 미간~코밑, 코밑~턱 끝 세 구간의 길이 비율이에요. 기준은 각 33%예요."
          },
          {
            "title": "오안",
            "body": "얼굴 폭을 눈 바깥·안쪽 끝으로 나눈 다섯 구간이에요. 기준은 각 20%(눈 하나 폭이 한 칸)예요."
          },
          {
            "title": "좌우 대칭·입÷코",
            "body": "눈·코·입·얼굴 윤곽의 좌우 대응점이 얼마나 같은 거리·높이에 있는지, 입 폭이 코 폭의 몇 배인지(기준 1.5배) 봐요."
          }
        ],
        "howToTitle": "사용 방법",
        "steps": [
          "정면을 보고 찍은, 이마가 보이는 사진을 골라요.",
          "'얼굴 사진 고르기'를 눌러요. 처음 한 번은 분석 도구를 받아요.",
          "사진 위에 그려진 초록(삼정)·주황(오안) 선을 확인해요.",
          "항목별 기준 근접도와 실제 비율을 읽어요."
        ],
        "faqTitle": "자주 묻는 질문",
        "faqs": [
          {
            "question": "사진이 어딘가에 저장되나요?",
            "answer": "아니요. 사진은 브라우저 안에서만 열리고 서버로 보내지 않아요. 분석 프로그램과 모델 파일만 처음에 내려받아요."
          },
          {
            "question": "점수가 낮으면 못생겼다는 뜻인가요?",
            "answer": "아니요. 기준 비율과 얼마나 가까운지일 뿐이에요. 실제 사람의 인상과 매력은 이 비율과 거의 상관이 없어요."
          },
          {
            "question": "같은 사람인데 사진마다 숫자가 달라요.",
            "answer": "고개 각도, 렌즈 왜곡(셀카는 코가 커 보임), 표정, 앞머리에 따라 바뀌어요. 정면·무표정 사진 여러 장의 평균을 보세요."
          }
        ],
        "disclaimer": "이 도구는 재미와 참고용이에요. 의료·성형 상담이나 외모 평가를 대신하지 않아요."
      }
    },
    "en": {
      "meta": {
        "title": "Face Proportion Analyzer — Facial Thirds, Fifths & Symmetry",
        "description": "Measure facial thirds, facial fifths, left-right symmetry and the mouth-to-nose width ratio from one photo. The photo is analyzed on your device and never uploaded."
      },
      "content": {
        "introTitle": "What is the face proportion analyzer?",
        "intro": "It finds 468 points on a face photo and turns the classic artist's guides, facial thirds and fifths, plus left-right symmetry into numbers. Unlike old 'AI face rating' apps, it doesn't score looks. It only reports ratios you can measure.",
        "formulaTitle": "What it measures",
        "formulas": [
          {
            "title": "Facial thirds",
            "body": "Lengths of hairline area to brow, brow to under the nose, and under the nose to chin. The reference is 33% each."
          },
          {
            "title": "Facial fifths",
            "body": "Face width split at the outer and inner eye corners into five parts. The reference is 20% each (one eye width per part)."
          },
          {
            "title": "Symmetry and mouth÷nose",
            "body": "How evenly matching left and right points of the eyes, nose, mouth and jaw sit, and how many nose widths the mouth spans (reference 1.5)."
          }
        ],
        "howToTitle": "How to use",
        "steps": [
          "Pick a straight-on photo with your forehead visible.",
          "Tap 'Choose a face photo'. The analysis tool downloads the first time.",
          "Check the green (thirds) and orange (fifths) lines drawn on the photo.",
          "Read each score and the actual ratios."
        ],
        "faqTitle": "FAQ",
        "faqs": [
          {
            "question": "Is my photo saved anywhere?",
            "answer": "No. The photo opens only in your browser and is never sent to a server. Only the analysis program and model file download at first."
          },
          {
            "question": "Does a low score mean I'm unattractive?",
            "answer": "No. It only shows closeness to reference ratios. Real attractiveness has very little to do with these numbers."
          },
          {
            "question": "Different photos of the same person give different numbers.",
            "answer": "Head angle, lens distortion (selfies enlarge the nose), expression and bangs all change it. Average several straight-on, neutral photos."
          }
        ],
        "disclaimer": "This tool is for fun and reference only. It does not replace medical or cosmetic advice or any judgment of appearance."
      }
    },
    "ja": {
      "meta": {
        "title": "顔の比率分析 — 三分割・五分割・左右対称を写真で測る",
        "description": "顔写真1枚で縦の三分割(額・鼻・あご)、横の五分割、左右対称、口と鼻の幅の比率を測ります。写真はサーバーに送らず、端末の中だけで分析します。"
      },
      "content": {
        "introTitle": "顔の比率分析とは?",
        "intro": "写真から顔のポイント468点を見つけ、美術や似顔絵で使われてきた三分割・五分割と左右対称を数値で示すツールです。昔の「AI顔診断」のように容姿を採点せず、測れる比率だけを伝えます。",
        "formulaTitle": "測るもの",
        "formulas": [
          {
            "title": "縦の三分割",
            "body": "生え際付近〜眉間、眉間〜鼻の下、鼻の下〜あご先の3区間の長さの比率です。基準は各33%です。"
          },
          {
            "title": "横の五分割",
            "body": "顔の幅を目尻・目頭で5つに分けた区間です。基準は各20%(目ひとつ分の幅)です。"
          },
          {
            "title": "左右対称・口÷鼻",
            "body": "目・鼻・口・輪郭の左右の対応点が同じ距離・高さにあるか、口の幅が鼻の幅の何倍か(基準1.5倍)を見ます。"
          }
        ],
        "howToTitle": "使い方",
        "steps": [
          "正面から撮った、額が見える写真を選びます。",
          "「顔写真を選ぶ」を押します。初回だけ分析ツールを読み込みます。",
          "写真に描かれた緑(三分割)・オレンジ(五分割)の線を確認します。",
          "項目ごとの基準への近さと実際の比率を読みます。"
        ],
        "faqTitle": "よくある質問",
        "faqs": [
          {
            "question": "写真はどこかに保存されますか?",
            "answer": "いいえ。写真はブラウザの中だけで開き、サーバーには送りません。最初に分析プログラムとモデルファイルだけをダウンロードします。"
          },
          {
            "question": "点数が低いと顔が良くないということ?",
            "answer": "いいえ。基準の比率にどれだけ近いかだけです。実際の印象や魅力はこの比率とほとんど関係ありません。"
          },
          {
            "question": "同じ人でも写真ごとに数値が違います。",
            "answer": "顔の角度、レンズのゆがみ(自撮りは鼻が大きく写る)、表情、前髪で変わります。正面・無表情の写真数枚の平均を見てください。"
          }
        ],
        "disclaimer": "このツールは娯楽と参考のためのものです。医療・美容の相談や容姿の評価の代わりにはなりません。"
      }
    },
    "zh": {
      "meta": {
        "title": "脸部比例分析 — 用照片测三庭五眼与左右对称",
        "description": "用一张脸部照片测量三庭(额头·鼻子·下巴纵向比例)、五眼(横向五等分)、左右对称以及嘴宽与鼻宽之比。照片不会上传，只在你的设备上分析。"
      },
      "content": {
        "introTitle": "什么是脸部比例分析?",
        "intro": "它在照片上找出 468 个面部关键点，把绘画和传统相学中常用的三庭五眼和左右对称变成数字。它不像以前的“AI 颜值打分”那样给长相打分，只告诉你能测量的比例。",
        "formulaTitle": "测什么",
        "formulas": [
          {
            "title": "三庭",
            "body": "发际线附近到眉间、眉间到鼻底、鼻底到下巴三段长度的比例。参考值各 33%。"
          },
          {
            "title": "五眼",
            "body": "以外眼角和内眼角把脸宽分成五段。参考值各 20%(一只眼睛的宽度)。"
          },
          {
            "title": "左右对称·嘴÷鼻",
            "body": "看眼、鼻、嘴和脸部轮廓左右对应点的距离与高度是否一致，以及嘴宽是鼻宽的几倍(参考 1.5 倍)。"
          }
        ],
        "howToTitle": "使用方法",
        "steps": [
          "选择一张正面拍摄、露出额头的照片。",
          "点“选择脸部照片”。首次使用会下载分析工具。",
          "查看照片上画出的绿色(三庭)和橙色(五眼)线。",
          "阅读各项与参考值的接近程度和实际比例。"
        ],
        "faqTitle": "常见问题",
        "faqs": [
          {
            "question": "照片会被保存吗?",
            "answer": "不会。照片只在浏览器里打开，不会发送到服务器。首次只会下载分析程序和模型文件。"
          },
          {
            "question": "分数低就是长得不好看吗?",
            "answer": "不是。它只表示与参考比例的接近程度。真实的印象和魅力与这些比例几乎无关。"
          },
          {
            "question": "同一个人不同照片数字不一样。",
            "answer": "头部角度、镜头畸变(自拍会让鼻子显大)、表情和刘海都会影响结果。请取几张正面、无表情照片的平均值。"
          }
        ],
        "disclaimer": "本工具仅供娱乐和参考，不能代替医疗、整形咨询或任何外貌评价。"
      }
    },
    "fr": {
      "meta": {
        "title": "Analyse des proportions du visage — tiers, cinquièmes et symétrie",
        "description": "Mesurez les tiers du visage, les cinquièmes, la symétrie gauche-droite et le rapport largeur bouche/nez à partir d'une photo. L'analyse se fait sur votre appareil, sans envoi."
      },
      "content": {
        "introTitle": "Qu'est-ce que l'analyse des proportions du visage ?",
        "intro": "Elle repère 468 points sur une photo et traduit en chiffres les repères classiques du dessin, tiers et cinquièmes du visage, ainsi que la symétrie. Contrairement aux anciennes applis de « note de beauté IA », elle ne note pas l'apparence et ne donne que des rapports mesurables.",
        "formulaTitle": "Ce qui est mesuré",
        "formulas": [
          {
            "title": "Tiers du visage",
            "body": "Longueurs de la zone de la racine des cheveux aux sourcils, des sourcils au dessous du nez, puis jusqu'au menton. La référence est 33 % chacun."
          },
          {
            "title": "Cinquièmes du visage",
            "body": "Largeur du visage découpée aux coins externes et internes des yeux en cinq parts. La référence est 20 % chacune (la largeur d'un œil)."
          },
          {
            "title": "Symétrie et bouche÷nez",
            "body": "Régularité des points gauche et droite des yeux, du nez, de la bouche et de la mâchoire, et combien de largeurs de nez couvre la bouche (référence 1,5)."
          }
        ],
        "howToTitle": "Mode d'emploi",
        "steps": [
          "Choisissez une photo de face, front visible.",
          "Touchez « Choisir une photo du visage ». L'outil se télécharge la première fois.",
          "Regardez les lignes vertes (tiers) et orange (cinquièmes) tracées sur la photo.",
          "Lisez chaque score et les rapports réels."
        ],
        "faqTitle": "Questions fréquentes",
        "faqs": [
          {
            "question": "Ma photo est-elle enregistrée ?",
            "answer": "Non. Elle s'ouvre uniquement dans le navigateur et n'est jamais envoyée à un serveur. Seuls le programme d'analyse et le fichier du modèle sont téléchargés au début."
          },
          {
            "question": "Un score bas veut-il dire que je ne suis pas beau ?",
            "answer": "Non. Il indique seulement la proximité avec des rapports de référence. L'attrait réel n'a presque rien à voir avec ces chiffres."
          },
          {
            "question": "La même personne obtient des chiffres différents selon la photo.",
            "answer": "L'angle de la tête, la déformation de l'objectif (le selfie grossit le nez), l'expression et la frange changent le résultat. Faites la moyenne de plusieurs photos de face, visage neutre."
          }
        ],
        "disclaimer": "Cet outil est ludique et indicatif. Il ne remplace ni un avis médical ou esthétique ni un jugement sur l'apparence."
      }
    },
    "es": {
      "meta": {
        "title": "Análisis de proporciones faciales — tercios, quintos y simetría",
        "description": "Mide los tercios faciales, los quintos, la simetría izquierda-derecha y la proporción entre el ancho de la boca y la nariz con una foto. Se analiza en tu dispositivo y no se sube."
      },
      "content": {
        "introTitle": "¿Qué es el análisis de proporciones faciales?",
        "intro": "Encuentra 468 puntos en una foto del rostro y convierte en números las guías clásicas del dibujo, tercios y quintos faciales, además de la simetría. A diferencia de las antiguas apps de «puntuación de belleza con IA», no califica el aspecto: solo muestra proporciones que se pueden medir.",
        "formulaTitle": "Qué mide",
        "formulas": [
          {
            "title": "Tercios faciales",
            "body": "Longitudes de la zona del nacimiento del pelo al entrecejo, del entrecejo a debajo de la nariz y de ahí a la barbilla. La referencia es 33 % cada uno."
          },
          {
            "title": "Quintos faciales",
            "body": "El ancho de la cara dividido en cinco partes por las esquinas externas e internas de los ojos. La referencia es 20 % cada una (el ancho de un ojo)."
          },
          {
            "title": "Simetría y boca÷nariz",
            "body": "Cuánto coinciden en distancia y altura los puntos izquierdo y derecho de ojos, nariz, boca y mandíbula, y cuántos anchos de nariz abarca la boca (referencia 1,5)."
          }
        ],
        "howToTitle": "Cómo se usa",
        "steps": [
          "Elige una foto de frente con la frente a la vista.",
          "Pulsa «Elegir una foto del rostro». La herramienta se descarga la primera vez.",
          "Mira las líneas verdes (tercios) y naranjas (quintos) dibujadas sobre la foto.",
          "Lee cada puntuación y las proporciones reales."
        ],
        "faqTitle": "Preguntas frecuentes",
        "faqs": [
          {
            "question": "¿Se guarda mi foto en algún sitio?",
            "answer": "No. La foto solo se abre en tu navegador y nunca se envía a un servidor. Al principio solo se descargan el programa de análisis y el archivo del modelo."
          },
          {
            "question": "¿Una puntuación baja significa que soy poco atractivo?",
            "answer": "No. Solo indica cercanía a proporciones de referencia. El atractivo real tiene muy poco que ver con estos números."
          },
          {
            "question": "La misma persona da números distintos en cada foto.",
            "answer": "El ángulo de la cabeza, la distorsión del objetivo (los selfis agrandan la nariz), la expresión y el flequillo lo cambian. Promedia varias fotos de frente y con gesto neutro."
          }
        ],
        "disclaimer": "Esta herramienta es solo para entretenimiento y referencia. No sustituye un consejo médico o estético ni ningún juicio sobre el aspecto."
      }
    }
  },
  "mouse-test": {
    "ko": {
      "meta": {
        "title": "마우스 테스트 — 클릭·더블클릭 불량(채터링)·휠·CPS 확인",
        "description": "왼쪽·오른쪽·휠·사이드 버튼이 제대로 눌리는지, 한 번 눌렀는데 두 번 들어가는 더블클릭 불량(채터링)이 있는지, 휠 위아래와 초당 클릭 수(CPS)까지 브라우저에서 바로 확인해요."
      },
      "content": {
        "introTitle": "마우스 테스트란?",
        "intro": "마우스 버튼 다섯 개(왼쪽·휠 클릭·오른쪽·뒤로·앞으로)와 휠이 제대로 인식되는지 확인하는 도구예요. 오래 쓴 마우스에서 흔한 '한 번 눌렀는데 더블클릭이 되는' 고장(스위치 채터링)도 잡아내요.",
        "formulaTitle": "무엇을 보나요",
        "formulas": [
          {
            "title": "버튼 인식",
            "body": "누르는 동안 해당 칸이 켜지고 횟수가 올라가요. 안 켜지는 버튼은 인식이 안 되는 거예요."
          },
          {
            "title": "더블클릭 불량(채터링)",
            "body": "같은 버튼을 뗀 뒤 80ms 안에 다시 눌림이 들어오면 의심 신호로 세요. 사람이 일부러 빠르게 눌러도 보통 이보다 길어요."
          },
          {
            "title": "휠·CPS",
            "body": "휠을 위아래로 굴린 횟수와 최근 1초 동안 왼쪽 버튼을 누른 횟수(CPS)를 보여 줘요."
          }
        ],
        "howToTitle": "사용 방법",
        "steps": [
          "점선 영역 안에 마우스를 올려요.",
          "왼쪽·오른쪽·휠·사이드 버튼을 하나씩 천천히 10번씩 눌러 봐요.",
          "'의심' 숫자가 늘어나는 버튼이 있는지 봐요.",
          "휠을 위아래로 굴려 한 칸씩 잘 세는지 확인해요."
        ],
        "faqTitle": "자주 묻는 질문",
        "faqs": [
          {
            "question": "의심 신호가 한두 번 나왔어요. 고장인가요?",
            "answer": "천천히 한 번씩 눌렀는데도 같은 버튼에서 계속 나오면 채터링일 가능성이 커요. 빠르게 연타하다 한두 번 나온 것은 정상일 수 있어요."
          },
          {
            "question": "사이드 버튼이 안 잡혀요.",
            "answer": "일부 브라우저나 마우스 소프트웨어가 뒤로·앞으로 버튼을 가로채요. 마우스 프로그램 설정을 확인하세요."
          },
          {
            "question": "휴대폰에서도 되나요?",
            "answer": "터치는 왼쪽 버튼으로 세서 CPS 측정은 돼요. 버튼·휠 테스트는 마우스를 연결해야 해요."
          }
        ],
        "disclaimer": "이 도구는 브라우저가 받은 입력만 보여 줘요. 하드웨어를 진단하지 않으니 수리·교환은 제조사와 판매처 기준을 따르세요."
      }
    },
    "en": {
      "meta": {
        "title": "Mouse Test — Check Clicks, Double-Click Fault, Wheel & CPS",
        "description": "Check that left, right, wheel and side buttons register, catch the double-click fault (switch chattering) where one press counts twice, and see wheel scrolls and clicks per second, right in the browser."
      },
      "content": {
        "introTitle": "What is the mouse test?",
        "intro": "It checks that all five mouse buttons (left, wheel click, right, back, forward) and the wheel register. It also catches the common fault on worn mice where a single press becomes a double click (switch chattering).",
        "formulaTitle": "What it checks",
        "formulas": [
          {
            "title": "Button input",
            "body": "A box lights up while a button is held and its count goes up. A box that never lights means that button is not registering."
          },
          {
            "title": "Double-click fault",
            "body": "A new press on the same button within 80 ms of releasing it counts as a suspect signal. Deliberate fast clicks are usually slower than that."
          },
          {
            "title": "Wheel and CPS",
            "body": "Counts wheel steps up and down and how many left clicks you made in the last second (CPS)."
          }
        ],
        "howToTitle": "How to use it",
        "steps": [
          "Move the pointer into the dashed area.",
          "Press each button slowly about ten times.",
          "Watch whether the Suspect count rises on any button.",
          "Roll the wheel up and down and check each step is counted."
        ],
        "faqTitle": "FAQ",
        "faqs": [
          {
            "question": "I got one or two suspect signals. Is it broken?",
            "answer": "If it keeps happening on the same button while you click slowly, the switch is probably chattering. One or two during fast clicking can be normal."
          },
          {
            "question": "My side buttons do not register.",
            "answer": "Some browsers or mouse apps take over back and forward. Check your mouse software settings."
          },
          {
            "question": "Does it work on a phone?",
            "answer": "Taps count as the left button, so CPS works. Button and wheel tests need a mouse."
          }
        ],
        "disclaimer": "This tool only shows the input your browser receives. It does not diagnose hardware; follow the maker's and seller's rules for repairs or returns."
      }
    },
    "ja": {
      "meta": {
        "title": "マウステスト — クリック・チャタリング・ホイール・CPSを確認",
        "description": "左・右・ホイール・サイドボタンが反応するか、1回押したのに2回入るチャタリングがないか、ホイールの上下と1秒あたりのクリック数(CPS)までブラウザですぐ確認できます。"
      },
      "content": {
        "introTitle": "マウステストとは？",
        "intro": "マウスの5つのボタン(左・ホイールクリック・右・戻る・進む)とホイールが正しく認識されるかを確かめるツールです。使い込んだマウスに多い「1回押したのにダブルクリックになる」故障(チャタリング)も見つけます。",
        "formulaTitle": "確認できること",
        "formulas": [
          {
            "title": "ボタンの認識",
            "body": "押している間そのボタンが点灯し、回数が増えます。点灯しないボタンは認識されていません。"
          },
          {
            "title": "チャタリング",
            "body": "同じボタンを離してから80ms以内に再び押された場合を疑いとして数えます。意図的な速いクリックはふつうこれより長い間隔です。"
          },
          {
            "title": "ホイール・CPS",
            "body": "ホイールの上下の回数と、直近1秒の左クリック数(CPS)を表示します。"
          }
        ],
        "howToTitle": "使い方",
        "steps": [
          "点線のエリアにポインターを置きます。",
          "各ボタンをゆっくり10回ずつ押します。",
          "「疑い」の数が増えるボタンがないか見ます。",
          "ホイールを上下に回し、1段ずつ数えられるか確かめます。"
        ],
        "faqTitle": "よくある質問",
        "faqs": [
          {
            "question": "疑いが1〜2回出ました。故障ですか？",
            "answer": "ゆっくり押しても同じボタンで続くならチャタリングの可能性が高いです。速い連打で1〜2回出るのは正常なこともあります。"
          },
          {
            "question": "サイドボタンが反応しません。",
            "answer": "ブラウザやマウスのソフトが戻る・進むを横取りすることがあります。マウスソフトの設定を確認してください。"
          },
          {
            "question": "スマホでも使えますか？",
            "answer": "タップは左ボタンとして数えるのでCPSは測れます。ボタンとホイールのテストにはマウスが必要です。"
          }
        ],
        "disclaimer": "このツールはブラウザが受け取った入力を表示するだけで、ハードウェアを診断しません。修理・交換はメーカーと販売店の基準に従ってください。"
      }
    },
    "zh": {
      "meta": {
        "title": "鼠标测试 — 检查按键、双击故障、滚轮和 CPS",
        "description": "检查左键、右键、滚轮和侧键是否正常响应，找出按一下却变成双击的故障(微动抖动)，并查看滚轮上下次数和每秒点击数(CPS)，在浏览器里直接完成。"
      },
      "content": {
        "introTitle": "什么是鼠标测试？",
        "intro": "用来检查鼠标五个按键(左键、滚轮点击、右键、后退、前进)和滚轮是否被正确识别，也能发现旧鼠标常见的“按一下变双击”故障(微动抖动)。",
        "formulaTitle": "能检查什么",
        "formulas": [
          {
            "title": "按键识别",
            "body": "按住时对应格子会亮起并计数。始终不亮的按键说明没有被识别。"
          },
          {
            "title": "双击故障",
            "body": "同一按键松开后 80 毫秒内再次按下，计为可疑信号。人刻意快速连点的间隔通常比这更长。"
          },
          {
            "title": "滚轮和 CPS",
            "body": "显示滚轮上下滚动次数，以及最近 1 秒内左键点击次数(CPS)。"
          }
        ],
        "howToTitle": "使用方法",
        "steps": [
          "把指针移到虚线区域内。",
          "每个按键慢慢按十次左右。",
          "看是否有按键的“可疑”次数在增加。",
          "上下滚动滚轮，确认每一格都被计数。"
        ],
        "faqTitle": "常见问题",
        "faqs": [
          {
            "question": "出现了一两次可疑信号，是坏了吗？",
            "answer": "如果慢慢按也在同一按键上反复出现，很可能是微动抖动。快速连点时偶尔出现一两次可能是正常的。"
          },
          {
            "question": "侧键没有反应。",
            "answer": "有些浏览器或鼠标驱动会接管后退和前进键，请检查鼠标软件设置。"
          },
          {
            "question": "手机上能用吗？",
            "answer": "触摸按左键计算，可以测 CPS。按键和滚轮测试需要连接鼠标。"
          }
        ],
        "disclaimer": "本工具只显示浏览器收到的输入，不诊断硬件。维修或退换请以厂商和商家的规定为准。"
      }
    },
    "fr": {
      "meta": {
        "title": "Test de souris — clics, double-clic involontaire, molette et CPS",
        "description": "Vérifiez que les boutons gauche, droit, molette et latéraux répondent, repérez le double-clic involontaire (rebond de l'interrupteur) et comptez les crans de molette et les clics par seconde, dans le navigateur."
      },
      "content": {
        "introTitle": "Qu'est-ce que le test de souris ?",
        "intro": "Il vérifie que les cinq boutons (gauche, clic molette, droit, précédent, suivant) et la molette sont bien reconnus. Il repère aussi la panne courante des souris usées où un seul appui devient un double-clic (rebond).",
        "formulaTitle": "Ce qu'il vérifie",
        "formulas": [
          {
            "title": "Boutons",
            "body": "La case s'allume tant que le bouton est enfoncé et le compteur augmente. Une case qui ne s'allume jamais signale un bouton non reconnu."
          },
          {
            "title": "Double-clic involontaire",
            "body": "Un nouvel appui sur le même bouton moins de 80 ms après le relâchement compte comme suspect. Un double-clic volontaire est généralement plus lent."
          },
          {
            "title": "Molette et CPS",
            "body": "Compte les crans vers le haut et le bas et vos clics gauches de la dernière seconde (CPS)."
          }
        ],
        "howToTitle": "Mode d'emploi",
        "steps": [
          "Placez le pointeur dans la zone en pointillés.",
          "Appuyez lentement une dizaine de fois sur chaque bouton.",
          "Regardez si le compteur « Suspects » augmente sur un bouton.",
          "Faites tourner la molette et vérifiez que chaque cran est compté."
        ],
        "faqTitle": "Questions fréquentes",
        "faqs": [
          {
            "question": "J'ai un ou deux signaux suspects. Est-ce cassé ?",
            "answer": "Si cela se répète sur le même bouton en cliquant lentement, l'interrupteur rebondit probablement. Un ou deux pendant des clics rapides peuvent être normaux."
          },
          {
            "question": "Mes boutons latéraux ne répondent pas.",
            "answer": "Certains navigateurs ou logiciels de souris interceptent précédent et suivant. Vérifiez les réglages du logiciel."
          },
          {
            "question": "Ça marche sur téléphone ?",
            "answer": "Un toucher compte comme bouton gauche, donc le CPS fonctionne. Les tests de boutons et de molette demandent une souris."
          }
        ],
        "disclaimer": "Cet outil affiche seulement ce que le navigateur reçoit ; il ne diagnostique pas le matériel. Pour une réparation ou un échange, suivez les règles du fabricant et du vendeur."
      }
    },
    "es": {
      "meta": {
        "title": "Test de ratón — clics, doble clic involuntario, rueda y CPS",
        "description": "Comprueba que los botones izquierdo, derecho, rueda y laterales responden, detecta el doble clic involuntario (rebote del interruptor) y cuenta los pasos de rueda y los clics por segundo, en el navegador."
      },
      "content": {
        "introTitle": "¿Qué es el test de ratón?",
        "intro": "Comprueba que los cinco botones (izquierdo, clic de rueda, derecho, atrás, adelante) y la rueda se reconocen bien. También detecta la avería típica de ratones gastados en la que una pulsación se convierte en doble clic (rebote).",
        "formulaTitle": "Qué comprueba",
        "formulas": [
          {
            "title": "Botones",
            "body": "La casilla se ilumina mientras mantienes el botón y el contador sube. Si nunca se ilumina, ese botón no se reconoce."
          },
          {
            "title": "Doble clic involuntario",
            "body": "Una nueva pulsación del mismo botón menos de 80 ms después de soltarlo cuenta como sospechosa. Un doble clic intencionado suele ser más lento."
          },
          {
            "title": "Rueda y CPS",
            "body": "Cuenta los pasos de rueda hacia arriba y abajo y tus clics izquierdos del último segundo (CPS)."
          }
        ],
        "howToTitle": "Cómo usarlo",
        "steps": [
          "Lleva el puntero a la zona punteada.",
          "Pulsa cada botón despacio unas diez veces.",
          "Mira si el contador «Sospechosas» sube en algún botón.",
          "Gira la rueda arriba y abajo y comprueba que cuenta cada paso."
        ],
        "faqTitle": "Preguntas frecuentes",
        "faqs": [
          {
            "question": "Me salieron una o dos señales sospechosas. ¿Está roto?",
            "answer": "Si se repite en el mismo botón pulsando despacio, probablemente el interruptor rebota. Una o dos durante clics rápidos pueden ser normales."
          },
          {
            "question": "Los botones laterales no responden.",
            "answer": "Algunos navegadores o programas del ratón capturan atrás y adelante. Revisa la configuración del programa."
          },
          {
            "question": "¿Funciona en el móvil?",
            "answer": "Los toques cuentan como botón izquierdo, así que el CPS funciona. Las pruebas de botones y rueda necesitan un ratón."
          }
        ],
        "disclaimer": "Esta herramienta solo muestra la entrada que recibe el navegador; no diagnostica el hardware. Para reparaciones o cambios sigue las normas del fabricante y del vendedor."
      }
    }
  }
};
