// Generated 2026-10-27 (W6) from the Blog unit converter pages. Blog had ko/en/ja copy for the
// ten physical converters; zh/fr/es were written for Tools with the same facts. Pyeong now uses
// the exact 400/121 m² (Blog rounded it to 3.305785).
import type { Locale } from '../lib/i18n';
import type { UtilityContent } from '../components/UtilityArticle.astro';
export interface UnitPage { title: string; description: string; c: UtilityContent }
export const unitPageSlugs = ["percent-converter", "fraction-converter", "scientific-notation-converter", "angle-converter", "universal-converter", "length-converter", "weight-converter", "volume-converter", "temperature-converter", "speed-converter", "pressure-converter", "energy-converter", "area-converter", "data-storage-converter", "time-converter"] as const;
export type UnitPageSlug = (typeof unitPageSlugs)[number];
export const unitPages: Record<UnitPageSlug, Record<Locale, UnitPage>> = {
 "percent-converter": {
  "ko": {
   "title": "퍼센트 계산기 — B의 A%, A는 B의 몇%, 증감률",
   "description": "가장 많이 쓰는 백분율 계산 3가지(어떤 값의 몇 퍼센트, 비율, 증감률)를 한 번에. 공식·예시·FAQ 포함.",
   "c": {
    "introTitle": "백분율은 '전체를 100으로 봤을 때의 비율'입니다",
    "intro": "퍼센트(%) 계산은 일상에서 가장 자주 쓰는 산수예요. 이 계산기는 ① 어떤 값의 몇 퍼센트, ② 한 값이 다른 값의 몇 퍼센트인지, ③ 값이 얼마나 늘거나 줄었는지(증감률) 세 가지를 한 화면에서 즉시 계산해요.",
    "formulaTitle": "계산 공식",
    "formulas": [
     {
      "title": "B의 A%",
      "body": "결과 = (A ÷ 100) × B"
     },
     {
      "title": "A는 B의 몇 %",
      "body": "결과 = (A ÷ B) × 100"
     },
     {
      "title": "증감률",
      "body": "결과 = ((나중 − 처음) ÷ |처음|) × 100"
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "계산하려는 유형(몇 퍼센트 / 비율 / 증감률)을 고릅니다.",
     "두 숫자를 입력하면 결과가 즉시 표시됩니다.",
     "할인가, 시험 점수 비율, 가격 변동 등에 활용하세요."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "20%를 소수로 바꾸면?",
      "answer": "퍼센트를 100으로 나누면 됩니다. 20% = 20 ÷ 100 = 0.2 입니다."
     },
     {
      "question": "증감률에서 처음 값이 0이면?",
      "answer": "처음 값이 0이면 증감률은 정의되지 않습니다(0으로 나눌 수 없음). 절대 변화량으로 표현하세요."
     },
     {
      "question": "할인율 계산은 어떻게 하나요?",
      "answer": "'증감률'에 원가와 할인가를 넣으면 감소율이 나옵니다. 또는 '몇 퍼센트'로 (원가의 할인%)를 빼서 할인가를 구할 수 있습니다."
     }
    ],
    "disclaimer": "이 도구는 일반적인 산술 계산용이에요. 세금·금융 등 공식 수치는 해당 기관의 기준을 확인하세요."
   }
  },
  "en": {
   "title": "Percentage Calculator — % of a number, ratio, and change",
   "description": "Do the three most common percentage calculations in one place: A% of B, A is what % of B, and percent change. With formulas, examples, and FAQ.",
   "c": {
    "introTitle": "A percentage is simply a ratio out of 100",
    "intro": "Percentage math is one of the most common everyday calculations. This tool instantly handles three operations on one screen: (1) A% of a value, (2) what percent one value is of another, and (3) how much a value went up or down (percent change).",
    "formulaTitle": "Formulas",
    "formulas": [
     {
      "title": "A% of B",
      "body": "result = (A ÷ 100) × B"
     },
     {
      "title": "A is what % of B",
      "body": "result = (A ÷ B) × 100"
     },
     {
      "title": "Percent change",
      "body": "result = ((To − From) ÷ |From|) × 100"
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Pick the type you need (percent of, ratio, or change).",
     "Enter the two numbers and the result appears instantly.",
     "Use it for discounts, test scores, price changes, and more."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "How do I convert 20% to a decimal?",
      "answer": "Divide the percent by 100. 20% = 20 ÷ 100 = 0.2."
     },
     {
      "question": "What if the starting value is 0 for percent change?",
      "answer": "Percent change is undefined when the starting value is 0 (you cannot divide by zero). Use the absolute change instead."
     },
     {
      "question": "How do I calculate a discount?",
      "answer": "Use 'percent change' with the original and sale price to get the decrease, or use 'A% of B' to take the discount percent off the original."
     }
    ],
    "disclaimer": "This tool is for general arithmetic. For official figures such as taxes or finance, confirm with the relevant authority."
   }
  },
  "ja": {
   "title": "パーセント計算機 — BのA%、AはBの何%、増減率",
   "description": "よく使う割合計算3種（ある値の何%、割合、増減率）をまとめて。公式・例・FAQ付き。",
   "c": {
    "introTitle": "パーセントは「全体を100としたときの割合」です",
    "intro": "割合計算は日常で最もよく使う計算の一つです。この計算機は、①ある値の何%、②ある値が別の値の何%か、③値がどれだけ増減したか（増減率）の3つを1画面で即座に計算します。",
    "formulaTitle": "計算式",
    "formulas": [
     {
      "title": "BのA%",
      "body": "結果 = (A ÷ 100) × B"
     },
     {
      "title": "AはBの何%",
      "body": "結果 = (A ÷ B) × 100"
     },
     {
      "title": "増減率",
      "body": "結果 = ((後 − 最初) ÷ |最初|) × 100"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "計算したい種類（何% / 割合 / 増減率）を選びます。",
     "2つの数値を入力すると結果がすぐ表示されます。",
     "割引価格、テストの得点率、価格変動などに使えます。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "20%を小数にすると？",
      "answer": "パーセントを100で割ります。20% = 20 ÷ 100 = 0.2 です。"
     },
     {
      "question": "増減率で最初の値が0のときは？",
      "answer": "最初が0だと増減率は定義されません（0で割れない）。絶対的な変化量で表してください。"
     },
     {
      "question": "割引率はどう計算しますか？",
      "answer": "『増減率』に元値と割引後価格を入れると減少率が出ます。または『何%』で割引額を引いて求めます。"
     }
    ],
    "disclaimer": "このツールは一般的な計算用です。税金・金融などの公式数値は各機関の基準をご確認ください。"
   }
  },
  "zh": {
   "title": "百分比计算器 — B的A%、A是B的百分之几、变化率",
   "description": "把最常用的三种百分比计算放在一起：A%是多少、占比、变化率。附公式、示例与常见问题。",
   "c": {
    "introTitle": "百分比就是「以100为整体时的比例」",
    "intro": "百分比计算是日常最常用的运算之一。本工具在一个页面即时处理三种运算：①某值的百分之几、②一个值占另一个值的百分之几、③数值上升或下降了多少（变化率）。",
    "formulaTitle": "计算公式",
    "formulas": [
     {
      "title": "B 的 A%",
      "body": "结果 = (A ÷ 100) × B"
     },
     {
      "title": "A 是 B 的百分之几",
      "body": "结果 = (A ÷ B) × 100"
     },
     {
      "title": "变化率",
      "body": "结果 = ((结束 − 起始) ÷ |起始|) × 100"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "选择需要的类型（百分之几 / 占比 / 变化率）。",
     "输入两个数字，结果会立即显示。",
     "可用于折扣、考试得分率、价格变动等。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "20% 转成小数是多少？",
      "answer": "把百分比除以100。20% = 20 ÷ 100 = 0.2。"
     },
     {
      "question": "变化率中起始值为0怎么办？",
      "answer": "起始值为0时变化率无定义（不能除以0）。请改用绝对变化量。"
     },
     {
      "question": "如何计算折扣？",
      "answer": "用「变化率」输入原价和折后价得到下降比例，或用「百分之几」从原价减去折扣额。"
     }
    ],
    "disclaimer": "本工具用于一般运算。税务、金融等官方数字请以相关机构标准为准。"
   }
  },
  "fr": {
   "title": "Calculateur de Pourcentage — % d'un nombre, ratio et variation",
   "description": "Les trois calculs de pourcentage les plus courants au même endroit : A% de B, A représente quel % de B, et variation en %. Formules, exemples, FAQ.",
   "c": {
    "introTitle": "Un pourcentage est simplement un ratio sur 100",
    "intro": "Le calcul de pourcentage est l'un des plus courants au quotidien. Cet outil effectue instantanément trois opérations sur un seul écran : (1) A% d'une valeur, (2) quel pourcentage une valeur représente d'une autre, et (3) de combien une valeur a augmenté ou diminué (variation).",
    "formulaTitle": "Formules",
    "formulas": [
     {
      "title": "A% de B",
      "body": "résultat = (A ÷ 100) × B"
     },
     {
      "title": "A représente quel % de B",
      "body": "résultat = (A ÷ B) × 100"
     },
     {
      "title": "Variation en %",
      "body": "résultat = ((Fin − Début) ÷ |Début|) × 100"
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Choisissez le type voulu (pourcentage de, ratio ou variation).",
     "Saisissez les deux nombres et le résultat apparaît instantanément.",
     "Pour les remises, notes d'examen, variations de prix, etc."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Comment convertir 20% en décimal ?",
      "answer": "Divisez le pourcentage par 100. 20% = 20 ÷ 100 = 0,2."
     },
     {
      "question": "Et si la valeur de départ est 0 pour la variation ?",
      "answer": "La variation est indéfinie quand le départ est 0 (division par zéro impossible). Utilisez la variation absolue."
     },
     {
      "question": "Comment calculer une remise ?",
      "answer": "Utilisez « variation » avec le prix initial et le prix soldé, ou « A% de B » pour retirer le pourcentage de remise du prix initial."
     }
    ],
    "disclaimer": "Cet outil sert au calcul général. Pour des chiffres officiels (impôts, finance), vérifiez auprès de l'autorité compétente."
   }
  },
  "es": {
   "title": "Calculadora de Porcentaje — % de un número, proporción y cambio",
   "description": "Los tres cálculos de porcentaje más comunes en un lugar: A% de B, A es qué % de B y cambio porcentual. Con fórmulas, ejemplos y FAQ.",
   "c": {
    "introTitle": "Un porcentaje es simplemente una proporción sobre 100",
    "intro": "El cálculo de porcentajes es uno de los más comunes a diario. Esta herramienta realiza al instante tres operaciones en una pantalla: (1) el A% de un valor, (2) qué porcentaje es un valor de otro, y (3) cuánto subió o bajó un valor (cambio porcentual).",
    "formulaTitle": "Fórmulas",
    "formulas": [
     {
      "title": "A% de B",
      "body": "resultado = (A ÷ 100) × B"
     },
     {
      "title": "A es qué % de B",
      "body": "resultado = (A ÷ B) × 100"
     },
     {
      "title": "Cambio porcentual",
      "body": "resultado = ((Final − Inicial) ÷ |Inicial|) × 100"
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Elige el tipo que necesitas (porcentaje de, proporción o cambio).",
     "Introduce los dos números y el resultado aparece al instante.",
     "Úsalo para descuentos, notas de examen, cambios de precio y más."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cómo convierto 20% a decimal?",
      "answer": "Divide el porcentaje entre 100. 20% = 20 ÷ 100 = 0,2."
     },
     {
      "question": "¿Y si el valor inicial es 0 en el cambio porcentual?",
      "answer": "El cambio porcentual no está definido cuando el inicial es 0 (no se puede dividir por cero). Usa el cambio absoluto."
     },
     {
      "question": "¿Cómo calculo un descuento?",
      "answer": "Usa 'cambio porcentual' con el precio original y el rebajado, o 'A% de B' para restar el porcentaje de descuento del original."
     }
    ],
    "disclaimer": "Esta herramienta es para cálculo general. Para cifras oficiales como impuestos o finanzas, confirma con la autoridad correspondiente."
   }
  }
 },
 "fraction-converter": {
  "ko": {
   "title": "분수 변환기 — 분수, 소수, 퍼센트",
   "description": "분수를 소수와 퍼센트로, 소수를 기약분수로 변환합니다. 공식·사용법·FAQ 포함.",
   "c": {
    "introTitle": "분수, 소수, 퍼센트는 같은 비율을 다른 방식으로 씁니다",
    "intro": "3/4, 0.75, 75%는 모두 같은 값을 나타내요. 이 변환기는 분수를 입력하면 기약분수, 소수, 퍼센트를 함께 보여 주고, 소수를 입력하면 소수점 자리수를 기준으로 기약분수를 계산해요.",
    "formulaTitle": "계산 공식",
    "formulas": [
     {
      "title": "분수 → 소수",
      "body": "소수 = 분자 ÷ 분모"
     },
     {
      "title": "소수 → 퍼센트",
      "body": "퍼센트 = 소수 × 100"
     },
     {
      "title": "기약분수",
      "body": "분자와 분모를 최대공약수로 나눕니다"
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "분자와 분모를 입력하면 소수와 퍼센트가 즉시 표시됩니다.",
     "분모에는 0을 입력할 수 없습니다.",
     "소수를 입력하면 해당 소수점 자리수를 기준으로 기약분수를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "3/4는 소수와 퍼센트로 얼마인가요?",
      "answer": "3 ÷ 4 = 0.75이고, 퍼센트로는 75%입니다."
     },
     {
      "question": "0.625는 어떤 분수인가요?",
      "answer": "0.625는 625/1000으로 쓴 뒤 약분하면 5/8입니다."
     },
     {
      "question": "6/8은 왜 3/4가 되나요?",
      "answer": "6과 8의 최대공약수는 2이므로 둘 다 2로 나누면 3/4가 됩니다."
     }
    ],
    "disclaimer": "이 도구는 일반적인 산술 계산용이에요. 공식 수치는 해당 기관의 기준을 확인하세요."
   }
  },
  "en": {
   "title": "Fraction Converter — fraction, decimal, and percent",
   "description": "Convert fractions to decimals and percentages, and decimals to reduced fractions. Includes formulas, steps, and FAQ.",
   "c": {
    "introTitle": "Fractions, decimals, and percents can describe the same ratio",
    "intro": "3/4, 0.75, and 75% all represent the same value. This converter shows the reduced fraction, decimal, and percent for a fraction, and converts a decimal to a reduced fraction based on its decimal places.",
    "formulaTitle": "Formulas",
    "formulas": [
     {
      "title": "Fraction to decimal",
      "body": "decimal = numerator ÷ denominator"
     },
     {
      "title": "Decimal to percent",
      "body": "percent = decimal × 100"
     },
     {
      "title": "Reduce a fraction",
      "body": "divide numerator and denominator by their greatest common divisor"
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter a numerator and denominator to see the decimal and percent instantly.",
     "Do not use 0 as the denominator.",
     "Enter a decimal to get the reduced fraction based on its decimal places."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "What are 3/4 as a decimal and percent?",
      "answer": "3 ÷ 4 = 0.75, which is 75%."
     },
     {
      "question": "What fraction is 0.625?",
      "answer": "0.625 is 625/1000, which reduces to 5/8."
     },
     {
      "question": "Why does 6/8 reduce to 3/4?",
      "answer": "The greatest common divisor of 6 and 8 is 2, so dividing both by 2 gives 3/4."
     }
    ],
    "disclaimer": "This tool is for general arithmetic. For official figures, confirm with the relevant authority."
   }
  },
  "ja": {
   "title": "分数変換ツール — 分数、小数、パーセント",
   "description": "分数を小数・パーセントへ、小数を約分済み分数へ変換します。公式・使い方・FAQ付き。",
   "c": {
    "introTitle": "分数・小数・パーセントは同じ割合を別の形で表します",
    "intro": "3/4、0.75、75%はいずれも同じ値を表します。この変換ツールでは、分数から約分済み分数・小数・パーセントを確認でき、小数からは小数点以下の桁数を基準に約分済み分数を求めます。",
    "formulaTitle": "計算式",
    "formulas": [
     {
      "title": "分数 → 小数",
      "body": "小数 = 分子 ÷ 分母"
     },
     {
      "title": "小数 → パーセント",
      "body": "パーセント = 小数 × 100"
     },
     {
      "title": "約分",
      "body": "分子と分母を最大公約数で割ります"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "分子と分母を入力すると小数とパーセントが表示されます。",
     "分母に0は入力できません。",
     "小数を入力すると、その桁数を基準に約分済み分数を確認できます。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "3/4は小数とパーセントでいくつですか？",
      "answer": "3 ÷ 4 = 0.75、パーセントでは75%です。"
     },
     {
      "question": "0.625はどんな分数ですか？",
      "answer": "0.625は625/1000と書け、約分すると5/8です。"
     },
     {
      "question": "6/8が3/4になるのはなぜですか？",
      "answer": "6と8の最大公約数は2なので、両方を2で割ると3/4になります。"
     }
    ],
    "disclaimer": "このツールは一般的な計算用です。公式数値は各機関の基準をご確認ください。"
   }
  },
  "zh": {
   "title": "分数换算器 — 分数、小数、百分比",
   "description": "把分数换算为小数和百分比，也可把小数换算为最简分数。附公式、步骤与常见问题。",
   "c": {
    "introTitle": "分数、小数和百分比可以表示同一个比例",
    "intro": "3/4、0.75 和 75% 表示的是同一个值。本工具输入分数后会显示最简分数、小数和百分比；输入小数后，会根据小数位数换算为最简分数。",
    "formulaTitle": "计算公式",
    "formulas": [
     {
      "title": "分数 → 小数",
      "body": "小数 = 分子 ÷ 分母"
     },
     {
      "title": "小数 → 百分比",
      "body": "百分比 = 小数 × 100"
     },
     {
      "title": "约分",
      "body": "用最大公约数同时除分子和分母"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入分子和分母，即可看到小数和百分比。",
     "分母不能为0。",
     "输入小数，即可按小数位数得到最简分数。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "3/4 等于多少小数和百分比？",
      "answer": "3 ÷ 4 = 0.75，也就是 75%。"
     },
     {
      "question": "0.625 是什么分数？",
      "answer": "0.625 可写作 625/1000，约分后是 5/8。"
     },
     {
      "question": "为什么 6/8 会约成 3/4？",
      "answer": "6 和 8 的最大公约数是 2，同时除以 2 后得到 3/4。"
     }
    ],
    "disclaimer": "本工具用于一般运算。官方数字请以相关机构标准为准。"
   }
  },
  "fr": {
   "title": "Convertisseur de Fractions — fraction, décimal et pourcentage",
   "description": "Convertissez les fractions en décimaux et pourcentages, et les décimaux en fractions réduites. Avec formules, étapes et FAQ.",
   "c": {
    "introTitle": "Fractions, décimaux et pourcentages peuvent décrire le même ratio",
    "intro": "3/4, 0,75 et 75% représentent la même valeur. Ce convertisseur affiche la fraction réduite, le décimal et le pourcentage d'une fraction, puis convertit un décimal en fraction réduite selon ses décimales.",
    "formulaTitle": "Formules",
    "formulas": [
     {
      "title": "Fraction vers décimal",
      "body": "décimal = numérateur ÷ dénominateur"
     },
     {
      "title": "Décimal vers pourcentage",
      "body": "pourcentage = décimal × 100"
     },
     {
      "title": "Réduire une fraction",
      "body": "divisez numérateur et dénominateur par leur plus grand diviseur commun"
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez un numérateur et un dénominateur pour obtenir le décimal et le pourcentage.",
     "N'utilisez pas 0 comme dénominateur.",
     "Saisissez un décimal pour obtenir la fraction réduite correspondante."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Que valent 3/4 en décimal et en pourcentage ?",
      "answer": "3 ÷ 4 = 0,75, soit 75%."
     },
     {
      "question": "Quelle fraction représente 0,625 ?",
      "answer": "0,625 vaut 625/1000, ce qui se réduit à 5/8."
     },
     {
      "question": "Pourquoi 6/8 se réduit-il à 3/4 ?",
      "answer": "Le plus grand diviseur commun de 6 et 8 est 2 ; en divisant les deux par 2, on obtient 3/4."
     }
    ],
    "disclaimer": "Cet outil sert au calcul général. Pour des chiffres officiels, vérifiez auprès de l'autorité compétente."
   }
  },
  "es": {
   "title": "Convertidor de Fracciones — fracción, decimal y porcentaje",
   "description": "Convierte fracciones a decimales y porcentajes, y decimales a fracciones reducidas. Incluye fórmulas, pasos y FAQ.",
   "c": {
    "introTitle": "Fracciones, decimales y porcentajes pueden describir la misma proporción",
    "intro": "3/4, 0,75 y 75% representan el mismo valor. Este convertidor muestra la fracción reducida, el decimal y el porcentaje de una fracción, y convierte un decimal en fracción reducida según sus cifras decimales.",
    "formulaTitle": "Fórmulas",
    "formulas": [
     {
      "title": "Fracción a decimal",
      "body": "decimal = numerador ÷ denominador"
     },
     {
      "title": "Decimal a porcentaje",
      "body": "porcentaje = decimal × 100"
     },
     {
      "title": "Reducir una fracción",
      "body": "divide numerador y denominador por su máximo común divisor"
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce numerador y denominador para ver el decimal y el porcentaje.",
     "No uses 0 como denominador.",
     "Introduce un decimal para obtener la fracción reducida correspondiente."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuánto es 3/4 como decimal y porcentaje?",
      "answer": "3 ÷ 4 = 0,75, que equivale a 75%."
     },
     {
      "question": "¿Qué fracción es 0,625?",
      "answer": "0,625 es 625/1000, que se reduce a 5/8."
     },
     {
      "question": "¿Por qué 6/8 se reduce a 3/4?",
      "answer": "El máximo común divisor de 6 y 8 es 2; al dividir ambos por 2 se obtiene 3/4."
     }
    ],
    "disclaimer": "Esta herramienta es para cálculo general. Para cifras oficiales, confirma con la autoridad correspondiente."
   }
  }
 },
 "scientific-notation-converter": {
  "ko": {
   "title": "과학적 표기법 변환기 — 숫자와 a × 10^n",
   "description": "일반 숫자를 과학적 표기법으로, 가수와 지수를 다시 일반 숫자로 변환합니다. 공식·사용법·FAQ 포함.",
   "c": {
    "introTitle": "과학적 표기법은 아주 크거나 작은 수를 읽기 쉽게 만듭니다",
    "intro": "과학적 표기법은 수를 a × 10^n 꼴로 쓰는 방식이에요. 여기서 a는 보통 1 이상 10 미만의 크기를 갖고, n은 소수점을 몇 자리 옮겼는지를 나타내요. 이 도구는 일반 숫자와 과학적 표기를 양방향으로 즉시 변환해요.",
    "formulaTitle": "계산 공식",
    "formulas": [
     {
      "title": "일반수 → 과학적 표기",
      "body": "n = a × 10^e, 1 ≤ |a| < 10"
     },
     {
      "title": "지수",
      "body": "e = floor(log10(|n|))"
     },
     {
      "title": "과학적 표기 → 일반수",
      "body": "일반수 = a × 10^e"
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "일반 숫자를 입력하면 a × 10^n 형태가 즉시 표시됩니다.",
     "반대로 가수 a와 지수 n을 입력하면 일반 숫자가 표시됩니다.",
     "큰 수, 작은 수, 측정값, 과학 수업 예제에 활용하세요."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "12345는 과학적 표기로 어떻게 쓰나요?",
      "answer": "12345 = 1.2345 × 10^4 입니다."
     },
     {
      "question": "0.00056은 어떻게 변환되나요?",
      "answer": "0.00056 = 5.6 × 10^-4 입니다."
     },
     {
      "question": "가수 a는 꼭 1 이상 10 미만이어야 하나요?",
      "answer": "표준 과학적 표기에서는 0이 아닌 수의 |a|가 1 이상 10 미만이 되도록 씁니다."
     }
    ],
    "disclaimer": "이 도구는 일반적인 산술 계산용이에요. 공식 수치는 해당 기관의 기준을 확인하세요."
   }
  },
  "en": {
   "title": "Scientific Notation Converter — number and a × 10^n",
   "description": "Convert regular numbers to scientific notation and convert coefficient plus exponent back to a regular number. Includes formulas, steps, and FAQ.",
   "c": {
    "introTitle": "Scientific notation makes very large or tiny numbers easier to read",
    "intro": "Scientific notation writes a number as a × 10^n. The coefficient a is usually scaled so its absolute value is at least 1 and less than 10, while n records how far the decimal point moved. This tool converts both directions instantly.",
    "formulaTitle": "Formulas",
    "formulas": [
     {
      "title": "Number to scientific notation",
      "body": "n = a × 10^e, where 1 ≤ |a| < 10"
     },
     {
      "title": "Exponent",
      "body": "e = floor(log10(|n|))"
     },
     {
      "title": "Scientific notation to number",
      "body": "number = a × 10^e"
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter a regular number to see its a × 10^n form.",
     "Enter a coefficient a and exponent n to convert back to a regular number.",
     "Use it for large values, small measurements, and science class examples."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "How is 12345 written in scientific notation?",
      "answer": "12345 = 1.2345 × 10^4."
     },
     {
      "question": "How does 0.00056 convert?",
      "answer": "0.00056 = 5.6 × 10^-4."
     },
     {
      "question": "Does a have to be between 1 and 10?",
      "answer": "In normalized scientific notation, a nonzero number is written so that 1 ≤ |a| < 10."
     }
    ],
    "disclaimer": "This tool is for general arithmetic. For official figures, confirm with the relevant authority."
   }
  },
  "ja": {
   "title": "科学的記数法変換ツール — 数値と a × 10^n",
   "description": "通常の数値を科学的記数法へ、仮数と指数を通常の数値へ変換します。公式・使い方・FAQ付き。",
   "c": {
    "introTitle": "科学的記数法は大きな数や小さな数を読みやすくします",
    "intro": "科学的記数法は数を a × 10^n の形で表す方法です。通常、a の絶対値は1以上10未満にし、n は小数点を動かした桁数を示します。このツールは通常表記と科学的記数法を双方向に変換します。",
    "formulaTitle": "計算式",
    "formulas": [
     {
      "title": "通常の数値 → 科学的記数法",
      "body": "n = a × 10^e、1 ≤ |a| < 10"
     },
     {
      "title": "指数",
      "body": "e = floor(log10(|n|))"
     },
     {
      "title": "科学的記数法 → 通常の数値",
      "body": "数値 = a × 10^e"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "通常の数値を入力すると a × 10^n の形が表示されます。",
     "仮数 a と指数 n を入力すると通常の数値に戻せます。",
     "大きな数、小さな測定値、理科や数学の例題に使えます。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "12345は科学的記数法でどう書きますか？",
      "answer": "12345 = 1.2345 × 10^4 です。"
     },
     {
      "question": "0.00056はどう変換されますか？",
      "answer": "0.00056 = 5.6 × 10^-4 です。"
     },
     {
      "question": "aは必ず1以上10未満ですか？",
      "answer": "標準的な科学的記数法では、0以外の数は 1 ≤ |a| < 10 になるように書きます。"
     }
    ],
    "disclaimer": "このツールは一般的な計算用です。公式数値は各機関の基準をご確認ください。"
   }
  },
  "zh": {
   "title": "科学记数法换算器 — 数字与 a × 10^n",
   "description": "把普通数字转换为科学记数法，也可把系数和指数转换回普通数字。附公式、步骤与常见问题。",
   "c": {
    "introTitle": "科学记数法让极大或极小的数更容易阅读",
    "intro": "科学记数法把数字写成 a × 10^n 的形式。通常 a 的绝对值不小于1且小于10，n 表示小数点移动的位数。本工具可在普通数字与科学记数法之间双向即时换算。",
    "formulaTitle": "计算公式",
    "formulas": [
     {
      "title": "普通数字 → 科学记数法",
      "body": "n = a × 10^e，1 ≤ |a| < 10"
     },
     {
      "title": "指数",
      "body": "e = floor(log10(|n|))"
     },
     {
      "title": "科学记数法 → 普通数字",
      "body": "普通数字 = a × 10^e"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入普通数字，即可看到 a × 10^n 形式。",
     "输入系数 a 和指数 n，即可转换回普通数字。",
     "适用于大数、小测量值以及科学课程例题。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "12345 的科学记数法是什么？",
      "answer": "12345 = 1.2345 × 10^4。"
     },
     {
      "question": "0.00056 如何转换？",
      "answer": "0.00056 = 5.6 × 10^-4。"
     },
     {
      "question": "a 必须在 1 到 10 之间吗？",
      "answer": "标准科学记数法中，非零数会写成 1 ≤ |a| < 10 的形式。"
     }
    ],
    "disclaimer": "本工具用于一般运算。官方数字请以相关机构标准为准。"
   }
  },
  "fr": {
   "title": "Convertisseur de Notation Scientifique — nombre et a × 10^n",
   "description": "Convertissez un nombre ordinaire en notation scientifique, puis un coefficient et un exposant en nombre ordinaire. Avec formules, étapes et FAQ.",
   "c": {
    "introTitle": "La notation scientifique rend lisibles les très grands et très petits nombres",
    "intro": "La notation scientifique écrit un nombre sous la forme a × 10^n. Le coefficient a est généralement choisi avec une valeur absolue au moins égale à 1 et inférieure à 10, tandis que n indique le déplacement de la virgule.",
    "formulaTitle": "Formules",
    "formulas": [
     {
      "title": "Nombre vers notation scientifique",
      "body": "n = a × 10^e, avec 1 ≤ |a| < 10"
     },
     {
      "title": "Exposant",
      "body": "e = floor(log10(|n|))"
     },
     {
      "title": "Notation scientifique vers nombre",
      "body": "nombre = a × 10^e"
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez un nombre ordinaire pour obtenir sa forme a × 10^n.",
     "Saisissez un coefficient a et un exposant n pour revenir au nombre ordinaire.",
     "Utilisez-le pour les grands nombres, les petites mesures et les exercices scientifiques."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Comment écrire 12345 en notation scientifique ?",
      "answer": "12345 = 1,2345 × 10^4."
     },
     {
      "question": "Comment convertir 0,00056 ?",
      "answer": "0,00056 = 5,6 × 10^-4."
     },
     {
      "question": "a doit-il être entre 1 et 10 ?",
      "answer": "En notation scientifique normalisée, un nombre non nul s'écrit avec 1 ≤ |a| < 10."
     }
    ],
    "disclaimer": "Cet outil sert au calcul général. Pour des chiffres officiels, vérifiez auprès de l'autorité compétente."
   }
  },
  "es": {
   "title": "Convertidor de Notación Científica — número y a × 10^n",
   "description": "Convierte números normales a notación científica y coeficiente más exponente a número normal. Incluye fórmulas, pasos y FAQ.",
   "c": {
    "introTitle": "La notación científica facilita leer números muy grandes o muy pequeños",
    "intro": "La notación científica escribe un número como a × 10^n. El coeficiente a suele tener valor absoluto mayor o igual que 1 y menor que 10, y n indica cuántos lugares se movió el punto decimal.",
    "formulaTitle": "Fórmulas",
    "formulas": [
     {
      "title": "Número a notación científica",
      "body": "n = a × 10^e, con 1 ≤ |a| < 10"
     },
     {
      "title": "Exponente",
      "body": "e = floor(log10(|n|))"
     },
     {
      "title": "Notación científica a número",
      "body": "número = a × 10^e"
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce un número normal para ver su forma a × 10^n.",
     "Introduce un coeficiente a y un exponente n para convertirlo de vuelta.",
     "Úsalo con números grandes, medidas pequeñas y ejemplos de ciencias."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cómo se escribe 12345 en notación científica?",
      "answer": "12345 = 1,2345 × 10^4."
     },
     {
      "question": "¿Cómo se convierte 0,00056?",
      "answer": "0,00056 = 5,6 × 10^-4."
     },
     {
      "question": "¿a debe estar entre 1 y 10?",
      "answer": "En notación científica normalizada, un número distinto de cero se escribe con 1 ≤ |a| < 10."
     }
    ],
    "disclaimer": "Esta herramienta es para cálculo general. Para cifras oficiales, confirma con la autoridad correspondiente."
   }
  }
 },
 "angle-converter": {
  "ko": {
   "title": "각도 변환기 — 도, 라디안, 그라드",
   "description": "도(deg), 라디안(rad), 그라드(grad)를 한 번에 변환합니다. 공식·사용법·FAQ 포함.",
   "c": {
    "introTitle": "각도 단위는 회전을 서로 다른 기준으로 표현합니다",
    "intro": "도는 원 한 바퀴를 360으로, 라디안은 반지름과 호의 길이 관계로, 그라드는 한 바퀴를 400으로 나눠 표현해요. 이 변환기는 하나의 값을 입력하면 세 단위를 동시에 보여 주므로 수학, 공학, 지도·측량 계산에서 빠르게 확인할 수 있어요.",
    "formulaTitle": "계산 공식",
    "formulas": [
     {
      "title": "라디안 → 도",
      "body": "도 = 라디안 × 180 ÷ π"
     },
     {
      "title": "그라드 → 도",
      "body": "도 = 그라드 × 0.9"
     },
     {
      "title": "도 → 다른 단위",
      "body": "라디안 = 도 × π ÷ 180, 그라드 = 도 ÷ 0.9"
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "각도 값을 입력합니다.",
     "입력값의 단위(deg, rad, grad)를 선택합니다.",
     "도, 라디안, 그라드 결과를 동시에 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "180도는 몇 라디안인가요?",
      "answer": "180도는 π 라디안입니다. 십진수로는 약 3.14159 rad 입니다."
     },
     {
      "question": "100그라드는 몇 도인가요?",
      "answer": "400그라드가 360도이므로 100그라드는 90도입니다."
     },
     {
      "question": "라디안은 언제 쓰나요?",
      "answer": "삼각함수, 미적분, 물리 계산처럼 원과 회전을 수식으로 다룰 때 라디안을 주로 씁니다."
     }
    ],
    "disclaimer": "이 도구는 일반적인 산술 계산용이에요. 공식 수치는 해당 기관의 기준을 확인하세요."
   }
  },
  "en": {
   "title": "Angle Converter — degrees, radians, and gradians",
   "description": "Convert degrees (deg), radians (rad), and gradians (grad) in one place. Includes formulas, steps, and FAQ.",
   "c": {
    "introTitle": "Angle units describe rotation with different reference scales",
    "intro": "Degrees divide a full turn into 360 parts, radians relate arc length to radius, and gradians divide a full turn into 400 parts. Enter one value and this converter shows all three units at once for math, engineering, mapping, or survey work.",
    "formulaTitle": "Formulas",
    "formulas": [
     {
      "title": "Radians to degrees",
      "body": "degrees = radians × 180 ÷ π"
     },
     {
      "title": "Gradians to degrees",
      "body": "degrees = gradians × 0.9"
     },
     {
      "title": "Degrees to other units",
      "body": "radians = degrees × π ÷ 180, gradians = degrees ÷ 0.9"
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the angle value.",
     "Choose the input unit: deg, rad, or grad.",
     "Read the degree, radian, and gradian results instantly."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "How many radians are in 180 degrees?",
      "answer": "180 degrees equals π radians, or about 3.14159 rad."
     },
     {
      "question": "How many degrees are in 100 gradians?",
      "answer": "Since 400 gradians equal 360 degrees, 100 gradians equal 90 degrees."
     },
     {
      "question": "When should I use radians?",
      "answer": "Radians are standard in trigonometry, calculus, and physics because they connect rotation directly to arc length."
     }
    ],
    "disclaimer": "This tool is for general arithmetic. For official figures, confirm with the relevant authority."
   }
  },
  "ja": {
   "title": "角度変換ツール — 度、ラジアン、グラード",
   "description": "度(deg)、ラジアン(rad)、グラード(grad)を一度に変換します。公式・使い方・FAQ付き。",
   "c": {
    "introTitle": "角度の単位は回転を異なる基準で表します",
    "intro": "度は1回転を360等分し、ラジアンは半径と弧の長さの関係で表し、グラードは1回転を400等分します。この変換ツールでは1つの値を入力するだけで3単位を同時に確認できます。",
    "formulaTitle": "計算式",
    "formulas": [
     {
      "title": "ラジアン → 度",
      "body": "度 = ラジアン × 180 ÷ π"
     },
     {
      "title": "グラード → 度",
      "body": "度 = グラード × 0.9"
     },
     {
      "title": "度 → 他の単位",
      "body": "ラジアン = 度 × π ÷ 180、グラード = 度 ÷ 0.9"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "角度の値を入力します。",
     "入力単位（deg、rad、grad）を選びます。",
     "度、ラジアン、グラードの結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "180度は何ラジアンですか？",
      "answer": "180度はπラジアン、十進表記では約3.14159 radです。"
     },
     {
      "question": "100グラードは何度ですか？",
      "answer": "400グラードが360度なので、100グラードは90度です。"
     },
     {
      "question": "ラジアンはいつ使いますか？",
      "answer": "三角関数、微積分、物理のように回転を数式で扱う場面でよく使われます。"
     }
    ],
    "disclaimer": "このツールは一般的な計算用です。公式数値は各機関の基準をご確認ください。"
   }
  },
  "zh": {
   "title": "角度换算器 — 度、弧度、百分度",
   "description": "在度(deg)、弧度(rad)和百分度(grad)之间换算。附公式、步骤与常见问题。",
   "c": {
    "introTitle": "角度单位用不同基准描述旋转",
    "intro": "度把一整圈分成360份，弧度用弧长与半径的关系表示角度，百分度把一整圈分成400份。输入一个数值后，本工具会同时显示三种单位，适合数学、工程、地图和测量场景。",
    "formulaTitle": "计算公式",
    "formulas": [
     {
      "title": "弧度 → 度",
      "body": "度 = 弧度 × 180 ÷ π"
     },
     {
      "title": "百分度 → 度",
      "body": "度 = 百分度 × 0.9"
     },
     {
      "title": "度 → 其他单位",
      "body": "弧度 = 度 × π ÷ 180，百分度 = 度 ÷ 0.9"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入角度数值。",
     "选择输入单位：deg、rad 或 grad。",
     "立即查看度、弧度和百分度结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "180度是多少弧度？",
      "answer": "180度等于π弧度，约为3.14159 rad。"
     },
     {
      "question": "100百分度是多少度？",
      "answer": "400百分度等于360度，所以100百分度等于90度。"
     },
     {
      "question": "什么时候使用弧度？",
      "answer": "三角函数、微积分和物理计算通常使用弧度，因为它直接连接旋转与弧长。"
     }
    ],
    "disclaimer": "本工具用于一般运算。官方数字请以相关机构标准为准。"
   }
  },
  "fr": {
   "title": "Convertisseur d'Angles — degrés, radians et grades",
   "description": "Convertissez degrés (deg), radians (rad) et grades (grad) au même endroit. Avec formules, étapes et FAQ.",
   "c": {
    "introTitle": "Les unités d'angle décrivent une rotation avec des repères différents",
    "intro": "Les degrés divisent un tour complet en 360 parties, les radians relient la longueur d'arc au rayon, et les grades divisent un tour complet en 400 parties. Saisissez une valeur et l'outil affiche les trois unités en même temps.",
    "formulaTitle": "Formules",
    "formulas": [
     {
      "title": "Radians vers degrés",
      "body": "degrés = radians × 180 ÷ π"
     },
     {
      "title": "Grades vers degrés",
      "body": "degrés = grades × 0,9"
     },
     {
      "title": "Degrés vers autres unités",
      "body": "radians = degrés × π ÷ 180, grades = degrés ÷ 0,9"
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur de l'angle.",
     "Choisissez l'unité d'entrée : deg, rad ou grad.",
     "Consultez les résultats en degrés, radians et grades."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien de radians font 180 degrés ?",
      "answer": "180 degrés correspondent à π radians, soit environ 3,14159 rad."
     },
     {
      "question": "Combien de degrés font 100 grades ?",
      "answer": "Comme 400 grades valent 360 degrés, 100 grades valent 90 degrés."
     },
     {
      "question": "Quand utiliser les radians ?",
      "answer": "Les radians sont la norme en trigonométrie, calcul et physique, car ils relient directement la rotation à la longueur d'arc."
     }
    ],
    "disclaimer": "Cet outil sert au calcul général. Pour des chiffres officiels, vérifiez auprès de l'autorité compétente."
   }
  },
  "es": {
   "title": "Convertidor de Ángulos — grados, radianes y gradianes",
   "description": "Convierte grados (deg), radianes (rad) y gradianes (grad) en un lugar. Incluye fórmulas, pasos y FAQ.",
   "c": {
    "introTitle": "Las unidades de ángulo describen la rotación con escalas distintas",
    "intro": "Los grados dividen una vuelta completa en 360 partes, los radianes relacionan la longitud de arco con el radio y los gradianes dividen una vuelta en 400 partes. Introduce un valor y verás las tres unidades a la vez.",
    "formulaTitle": "Fórmulas",
    "formulas": [
     {
      "title": "Radianes a grados",
      "body": "grados = radianes × 180 ÷ π"
     },
     {
      "title": "Gradianes a grados",
      "body": "grados = gradianes × 0,9"
     },
     {
      "title": "Grados a otras unidades",
      "body": "radianes = grados × π ÷ 180, gradianes = grados ÷ 0,9"
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor del ángulo.",
     "Elige la unidad de entrada: deg, rad o grad.",
     "Consulta los resultados en grados, radianes y gradianes."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuántos radianes son 180 grados?",
      "answer": "180 grados equivalen a π radianes, aproximadamente 3,14159 rad."
     },
     {
      "question": "¿Cuántos grados son 100 gradianes?",
      "answer": "Como 400 gradianes equivalen a 360 grados, 100 gradianes equivalen a 90 grados."
     },
     {
      "question": "¿Cuándo se usan radianes?",
      "answer": "Los radianes se usan en trigonometría, cálculo y física porque conectan la rotación directamente con la longitud de arco."
     }
    ],
    "disclaimer": "Esta herramienta es para cálculo general. Para cifras oficiales, confirma con la autoridad correspondiente."
   }
  }
 },
 "universal-converter": {
  "ko": {
   "title": "통합 변환기 — 텍스트·진법·2진수·날짜 한 번에",
   "description": "텍스트를 2진수·16진수로, 숫자를 진법 간으로, 2진수를 10진수·텍스트로, 날짜를 로마 숫자로 변환합니다. 개발자용 통합 변환 도구.",
   "c": {
    "introTitle": "네 가지 변환을 한 화면에 모은 개발자 도구",
    "intro": "통합 변환기는 자주 쓰이지만 흩어져 있는 변환 작업을 한 곳에 모았어요. 텍스트의 바이트 표현 확인, 진법 간 변환, 2진수 디코딩, 날짜의 로마 숫자 표기까지 탭 하나로 오갈 수 있어 코드 디버깅과 학습에 유용해요.",
    "howToTitle": "사용 방법",
    "steps": [
     "상단 탭에서 원하는 변환기를 선택합니다.",
     "값을 입력하면 결과가 즉시 표시됩니다.",
     "진법·2진수 변환은 입력 형식이 맞지 않으면 '잘못된 입력'이 표시됩니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "텍스트 변환은 어떤 인코딩을 쓰나요?",
      "answer": "각 문자의 유니코드 코드포인트를 사용합니다. 기본 ASCII 문자는 8비트로, 그 밖의 문자는 코드포인트 값으로 표시됩니다."
     },
     {
      "question": "2진수를 텍스트로 되돌릴 수 있나요?",
      "answer": "네. 2진수 디코더는 8비트 단위로 묶어 ASCII 텍스트로 복원합니다. 공백은 무시됩니다."
     },
     {
      "question": "로마 숫자에 0이나 음수도 되나요?",
      "answer": "로마 숫자 체계에는 0과 음수 표기가 없습니다. 이 도구는 양의 정수(연·월·일)만 변환합니다."
     }
    ],
    "disclaimer": "이 도구는 일반적인 변환·학습용이에요. 중요한 데이터 처리에는 결과를 별도로 검증하세요.",
    "formulaTitle": "포함된 변환기",
    "formulas": [
     {
      "title": "텍스트 → 2진수·16진수",
      "body": "각 문자를 ASCII 코드로 바꿔 8비트 2진수와 16진수로 표시합니다."
     },
     {
      "title": "진법 변환",
      "body": "2·8·10·16진수 사이를 입력 진법과 출력 진법을 골라 변환합니다."
     },
     {
      "title": "2진수 디코더",
      "body": "2진수를 10진수, 16진수, 그리고 ASCII 텍스트로 한 번에 복원합니다."
     },
     {
      "title": "날짜 → 로마 숫자",
      "body": "연·월·일을 각각 로마 숫자로 표기해 줍니다."
     }
    ]
   }
  },
  "en": {
   "title": "Universal Converter — Text, Base, Binary & Date",
   "description": "Convert text to binary and hex, numbers between bases, binary to decimal and text, and dates to Roman numerals — a developer-friendly all-in-one converter.",
   "c": {
    "introTitle": "Four everyday conversions in a single developer tool",
    "intro": "The Universal Converter gathers small but frequent conversion tasks into one place. Inspect the byte representation of text, switch between number bases, decode binary, and write dates as Roman numerals — all from one set of tabs, which is handy for debugging and learning.",
    "howToTitle": "How to use",
    "steps": [
     "Pick the converter you need from the tabs at the top.",
     "Enter a value and the result appears instantly.",
     "Base and binary converters show 'Invalid input' when the format does not match."
    ],
    "faqTitle": "Frequently asked questions",
    "faqs": [
     {
      "question": "Which encoding does the text converter use?",
      "answer": "It uses each character's Unicode code point. Basic ASCII characters fit in 8 bits; others are shown by their code point value."
     },
     {
      "question": "Can I turn binary back into text?",
      "answer": "Yes. The binary decoder groups bits into bytes of 8 and restores them to ASCII text. Spaces are ignored."
     },
     {
      "question": "Do Roman numerals support zero or negatives?",
      "answer": "The Roman numeral system has no symbol for zero or negative numbers. This tool converts positive integers (year, month, day) only."
     }
    ],
    "disclaimer": "This tool is for general conversion and learning. Verify results independently for critical data processing.",
    "formulaTitle": "What's included",
    "formulas": [
     {
      "title": "Text → Binary & Hex",
      "body": "Turns each character into its ASCII code and shows it as 8-bit binary and hexadecimal."
     },
     {
      "title": "Base converter",
      "body": "Converts among binary, octal, decimal, and hex by choosing an input and output base."
     },
     {
      "title": "Binary decoder",
      "body": "Restores binary to decimal, hexadecimal, and ASCII text at once."
     },
     {
      "title": "Date → Roman numerals",
      "body": "Writes the year, month, and day each as Roman numerals."
     }
    ]
   }
  },
  "ja": {
   "title": "統合コンバーター — テキスト・基数・2進数・日付",
   "description": "テキストを2進数・16進数へ、数値を基数間で、2進数を10進数・テキストへ、日付をローマ数字へ変換する開発者向けオールインワン変換ツール。",
   "c": {
    "introTitle": "4つの日常変換をひとつの開発者ツールに",
    "intro": "統合コンバーターは、よく使うけれど散らばりがちな変換作業をひとつにまとめました。テキストのバイト表現の確認、基数変換、2進数のデコード、日付のローマ数字表記までタブで切り替えられ、デバッグや学習に便利です。",
    "howToTitle": "使い方",
    "steps": [
     "上部のタブから使いたい変換を選びます。",
     "値を入力すると結果がすぐ表示されます。",
     "基数・2進数変換は形式が合わないと「無効な入力」と表示されます。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "テキスト変換のエンコードは？",
      "answer": "各文字のUnicodeコードポイントを使います。基本的なASCII文字は8ビット、その他はコードポイント値で表示されます。"
     },
     {
      "question": "2進数をテキストに戻せますか？",
      "answer": "はい。2進数デコーダーは8ビット単位でまとめてASCIIテキストに復元します。空白は無視されます。"
     },
     {
      "question": "ローマ数字に0や負数は使えますか？",
      "answer": "ローマ数字には0や負数の表記がありません。このツールは正の整数（年・月・日）のみを変換します。"
     }
    ],
    "disclaimer": "このツールは一般的な変換・学習用です。重要なデータ処理では結果を別途ご確認ください。",
    "formulaTitle": "含まれる変換",
    "formulas": [
     {
      "title": "テキスト → 2進数・16進数",
      "body": "各文字をASCIIコードに変換し、8ビット2進数と16進数で表示します。"
     },
     {
      "title": "基数変換",
      "body": "入力と出力の基数を選んで、2・8・10・16進数の間を変換します。"
     },
     {
      "title": "2進数デコーダー",
      "body": "2進数を10進数・16進数・ASCIIテキストへ一度に復元します。"
     },
     {
      "title": "日付 → ローマ数字",
      "body": "年・月・日をそれぞれローマ数字で表記します。"
     }
    ]
   }
  },
  "zh": {
   "title": "通用转换器 — 文本、进制、二进制和日期",
   "description": "把文本转成二进制和十六进制，把数字在进制间转换，把二进制转成十进制和文本，把日期转成罗马数字——面向开发者的多合一转换工具。",
   "c": {
    "introTitle": "把四种日常转换装进一个开发者工具",
    "intro": "通用转换器把零散却常用的转换任务集中到一处：查看文本的字节表示、在进制间切换、解码二进制、把日期写成罗马数字——通过标签即可切换，方便调试与学习。",
    "howToTitle": "使用方法",
    "steps": [
     "在顶部标签中选择需要的转换器。",
     "输入数值后立即显示结果。",
     "进制和二进制转换在格式不符时会显示“输入无效”。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "文本转换用哪种编码？",
      "answer": "使用每个字符的 Unicode 码点。基本 ASCII 字符占 8 位，其他字符按码点值显示。"
     },
     {
      "question": "能把二进制还原成文本吗？",
      "answer": "可以。二进制解码器按 8 位一组还原为 ASCII 文本，空格会被忽略。"
     },
     {
      "question": "罗马数字支持 0 或负数吗？",
      "answer": "罗马数字系统没有 0 或负数的符号。本工具只转换正整数（年、月、日）。"
     }
    ],
    "disclaimer": "本工具用于一般转换和学习。处理重要数据时请另行核验结果。",
    "formulaTitle": "包含的转换",
    "formulas": [
     {
      "title": "文本 → 二进制和十六进制",
      "body": "把每个字符转成 ASCII 码，并以 8 位二进制和十六进制显示。"
     },
     {
      "title": "进制转换",
      "body": "选择输入和输出进制，在二、八、十、十六进制之间转换。"
     },
     {
      "title": "二进制解码",
      "body": "把二进制一次性还原为十进制、十六进制和 ASCII 文本。"
     },
     {
      "title": "日期 → 罗马数字",
      "body": "把年、月、日分别写成罗马数字。"
     }
    ]
   }
  },
  "fr": {
   "title": "Convertisseur Universel — Texte, Base, Binaire et Date",
   "description": "Convertissez du texte en binaire et hexadécimal, des nombres entre bases, du binaire en décimal et texte, et des dates en chiffres romains — un outil tout-en-un.",
   "c": {
    "introTitle": "Quatre conversions quotidiennes dans un seul outil",
    "intro": "Le Convertisseur Universel rassemble des tâches de conversion fréquentes mais dispersées : inspecter la représentation en octets d'un texte, changer de base, décoder du binaire et écrire des dates en chiffres romains — le tout depuis des onglets, pratique pour le débogage et l'apprentissage.",
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Choisissez le convertisseur voulu dans les onglets en haut.",
     "Saisissez une valeur : le résultat apparaît aussitôt.",
     "Les convertisseurs de base et binaire affichent « Entrée invalide » si le format ne correspond pas."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Quel encodage le convertisseur de texte utilise-t-il ?",
      "answer": "Il utilise le point de code Unicode de chaque caractère. Les caractères ASCII de base tiennent sur 8 bits ; les autres sont affichés par leur point de code."
     },
     {
      "question": "Puis-je reconvertir du binaire en texte ?",
      "answer": "Oui. Le décodeur binaire regroupe les bits par octets de 8 et les restitue en texte ASCII. Les espaces sont ignorés."
     },
     {
      "question": "Les chiffres romains gèrent-ils le zéro ou les négatifs ?",
      "answer": "Le système romain n'a pas de symbole pour zéro ni pour les négatifs. Cet outil convertit uniquement des entiers positifs (année, mois, jour)."
     }
    ],
    "disclaimer": "Cet outil sert à la conversion générale et à l'apprentissage. Vérifiez les résultats séparément pour les traitements critiques.",
    "formulaTitle": "Ce qui est inclus",
    "formulas": [
     {
      "title": "Texte → Binaire et Hex",
      "body": "Transforme chaque caractère en code ASCII affiché en binaire 8 bits et en hexadécimal."
     },
     {
      "title": "Convertisseur de bases",
      "body": "Convertit entre binaire, octal, décimal et hexadécimal selon les bases choisies."
     },
     {
      "title": "Décodeur binaire",
      "body": "Restitue le binaire en décimal, hexadécimal et texte ASCII en une fois."
     },
     {
      "title": "Date → Chiffres romains",
      "body": "Écrit l'année, le mois et le jour en chiffres romains."
     }
    ]
   }
  },
  "es": {
   "title": "Convertidor Universal — Texto, Base, Binario y Fecha",
   "description": "Convierte texto a binario y hexadecimal, números entre bases, binario a decimal y texto, y fechas a números romanos: una herramienta todo en uno.",
   "c": {
    "introTitle": "Cuatro conversiones cotidianas en una sola herramienta",
    "intro": "El Convertidor Universal reúne tareas de conversión frecuentes pero dispersas: inspeccionar la representación en bytes de un texto, cambiar de base, decodificar binario y escribir fechas como números romanos, todo desde pestañas, útil para depurar y aprender.",
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Elige el convertidor que necesitas en las pestañas superiores.",
     "Introduce un valor y el resultado aparece al instante.",
     "Los convertidores de base y binario muestran «Entrada no válida» si el formato no coincide."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Qué codificación usa el convertidor de texto?",
      "answer": "Usa el punto de código Unicode de cada carácter. Los caracteres ASCII básicos caben en 8 bits; los demás se muestran por su punto de código."
     },
     {
      "question": "¿Puedo volver a convertir binario en texto?",
      "answer": "Sí. El decodificador binario agrupa los bits en bytes de 8 y los restaura a texto ASCII. Los espacios se ignoran."
     },
     {
      "question": "¿Los números romanos admiten cero o negativos?",
      "answer": "El sistema romano no tiene símbolo para el cero ni para negativos. Esta herramienta convierte solo enteros positivos (año, mes, día)."
     }
    ],
    "disclaimer": "Esta herramienta es para conversión general y aprendizaje. Verifica los resultados por separado para procesamientos críticos.",
    "formulaTitle": "Qué incluye",
    "formulas": [
     {
      "title": "Texto → Binario y Hex",
      "body": "Convierte cada carácter en su código ASCII y lo muestra en binario de 8 bits y hexadecimal."
     },
     {
      "title": "Convertidor de bases",
      "body": "Convierte entre binario, octal, decimal y hexadecimal según las bases elegidas."
     },
     {
      "title": "Decodificador binario",
      "body": "Restaura el binario a decimal, hexadecimal y texto ASCII a la vez."
     },
     {
      "title": "Fecha → Números romanos",
      "body": "Escribe el año, el mes y el día como números romanos."
     }
    ]
   }
  }
 },
 "length-converter": {
  "ko": {
   "title": "길이 변환기 — m·cm·인치·피트·마일 변환",
   "description": "미터(m), 센티미터(cm), 밀리미터, 킬로미터, 인치, 피트, 야드, 마일을 즉시 상호 변환합니다.",
   "c": {
    "introTitle": "길이 변환기란?",
    "intro": "미터법(mm·cm·m·km)과 야드파운드법(인치·피트·야드·마일) 사이를 변환하는 도구예요. 한 단위에 입력하면 나머지로 즉시 환산돼요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "표준 계수",
      "body": "1인치=2.54cm, 1마일=1609.344m 등 정확한 계수를 사용합니다."
     },
     {
      "title": "동시 변환",
      "body": "한 번 입력으로 모든 단위를 보여줍니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다.",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "1인치는 몇 cm인가요?",
      "answer": "1인치 = 2.54cm 입니다."
     },
     {
      "question": "1마일은 몇 km인가요?",
      "answer": "1마일 = 약 1.609km 입니다."
     },
     {
      "question": "1피트는 몇 cm인가요?",
      "answer": "1피트 = 30.48cm = 12인치 입니다."
     }
    ],
    "disclaimer": "본 변환기는 국제 표준 단위 정의에 따른 계산이며, 일반적인 참고용이에요."
   }
  },
  "en": {
   "title": "Length Converter — m, cm, inch, feet, miles",
   "description": "Instantly convert meters (m), centimeters (cm), millimeters, kilometers, inches, feet, yards, and miles.",
   "c": {
    "introTitle": "What is the length converter?",
    "intro": "It converts between metric (mm, cm, m, km) and imperial (inch, foot, yard, mile) units. Enter a value in one unit and the rest update instantly.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Standard factors",
      "body": "Uses exact factors such as 1 inch=2.54cm and 1 mile=1609.344m."
     },
     {
      "title": "All at once",
      "body": "One input shows every unit simultaneously."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit.",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How many cm in an inch?",
      "answer": "1 inch = 2.54 cm."
     },
     {
      "question": "How many km in a mile?",
      "answer": "1 mile ≈ 1.609 km."
     },
     {
      "question": "How many cm in a foot?",
      "answer": "1 foot = 30.48 cm = 12 inches."
     }
    ],
    "disclaimer": "This converter uses international standard unit definitions and is for general reference."
   }
  },
  "ja": {
   "title": "長さ変換 — m・cm・インチ・フィート・マイル",
   "description": "メートル(m)、センチ(cm)、ミリ、キロ、インチ、フィート、ヤード、マイルを即時に相互変換します。",
   "c": {
    "introTitle": "長さ変換とは？",
    "intro": "メートル法(mm・cm・m・km)とヤードポンド法(インチ・フィート・ヤード・マイル)を相互変換するツールです。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "標準係数",
      "body": "1インチ=2.54cm、1マイル=1609.344mなど正確な係数を使用します。"
     },
     {
      "title": "同時変換",
      "body": "1回の入力で全単位を表示します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "1インチは何cm？",
      "answer": "1インチ = 2.54cm です。"
     },
     {
      "question": "1マイルは何km？",
      "answer": "1マイル ≈ 1.609km です。"
     },
     {
      "question": "1フィートは何cm？",
      "answer": "1フィート = 30.48cm = 12インチ です。"
     }
    ],
    "disclaimer": "本変換ツールは国際標準の単位定義に基づく計算で、一般的な参考用です。"
   }
  },
  "zh": {
   "title": "长度转换器 — 米、厘米、英寸、英尺、英里",
   "description": "在米(m)、厘米(cm)、毫米、千米、英寸、英尺、码、英里之间即时换算。",
   "c": {
    "introTitle": "什么是长度转换器？",
    "intro": "在公制（毫米、厘米、米、千米）和英制（英寸、英尺、码、英里）之间换算。在一个单位中输入数值，其余单位会立即更新。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "标准系数",
      "body": "使用精确系数，如 1 英寸 = 2.54 厘米，1 英里 = 1609.344 米。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "1 英寸是多少厘米？",
      "answer": "1 英寸 = 2.54 厘米。"
     },
     {
      "question": "1 英里是多少千米？",
      "answer": "1 英里 ≈ 1.609 千米。"
     },
     {
      "question": "1 英尺是多少厘米？",
      "answer": "1 英尺 = 30.48 厘米 = 12 英寸。"
     }
    ],
    "disclaimer": "本转换器使用国际标准单位定义，仅供一般参考。"
   }
  },
  "fr": {
   "title": "Convertisseur de Longueur — m, cm, pouce, pied, miles",
   "description": "Convertissez mètres, centimètres, pouces, pieds, yards et miles instantanément.",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur de longueur ?",
    "intro": "Il convertit entre le système métrique (mm, cm, m, km) et les unités impériales (pouce, pied, yard, mile). Saisissez une valeur dans une unité et les autres se mettent à jour.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Facteurs exacts",
      "body": "Facteurs exacts : 1 pouce = 2,54 cm et 1 mile = 1 609,344 m."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien de cm dans un pouce ?",
      "answer": "1 pouce = 2,54 cm."
     },
     {
      "question": "Combien de km dans un mile ?",
      "answer": "1 mile ≈ 1,609 km."
     },
     {
      "question": "Combien de cm dans un pied ?",
      "answer": "1 pied = 30,48 cm = 12 pouces."
     }
    ],
    "disclaimer": "Ce convertisseur utilise les définitions internationales des unités. Pour information générale."
   }
  },
  "es": {
   "title": "Conversor de Longitud — m, cm, pulgada, pie, millas",
   "description": "Convierte metros, centímetros, pulgadas, pies, yardas y millas al instante.",
   "c": {
    "introTitle": "¿Qué es el conversor de longitud?",
    "intro": "Convierte entre el sistema métrico (mm, cm, m, km) y las unidades imperiales (pulgada, pie, yarda, milla). Introduce un valor en una unidad y las demás se actualizan.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Factores exactos",
      "body": "Factores exactos: 1 pulgada = 2,54 cm y 1 milla = 1609,344 m."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuántos cm tiene una pulgada?",
      "answer": "1 pulgada = 2,54 cm."
     },
     {
      "question": "¿Cuántos km tiene una milla?",
      "answer": "1 milla ≈ 1,609 km."
     },
     {
      "question": "¿Cuántos cm tiene un pie?",
      "answer": "1 pie = 30,48 cm = 12 pulgadas."
     }
    ],
    "disclaimer": "Este conversor usa las definiciones internacionales de unidades. Solo como referencia general."
   }
  }
 },
 "weight-converter": {
  "ko": {
   "title": "무게 변환기 — kg·파운드·온스 변환 (kg lb oz)",
   "description": "킬로그램(kg), 파운드(lb), 온스(oz), 그램, 스톤을 즉시 상호 변환합니다. 값을 입력하면 모든 단위로 환산됩니다.",
   "c": {
    "introTitle": "무게 변환기란?",
    "intro": "킬로그램(kg), 그램(g), 파운드(lb), 온스(oz), 스톤(st) 사이를 변환하는 도구예요. 한 단위에 입력하면 나머지로 즉시 환산돼요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "표준 계수",
      "body": "1kg=2.20462lb, 1oz=28.3495g 등 정확한 계수를 사용합니다."
     },
     {
      "title": "동시 변환",
      "body": "한 번 입력으로 모든 단위를 보여줍니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다.",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "1kg은 몇 파운드인가요?",
      "answer": "1kg = 약 2.20462lb 입니다."
     },
     {
      "question": "1파운드는 몇 g인가요?",
      "answer": "1lb = 453.592g 입니다."
     },
     {
      "question": "스톤(stone)은 무엇인가요?",
      "answer": "영국에서 쓰는 단위로 1스톤 = 14파운드 ≈ 6.35kg 입니다."
     }
    ],
    "disclaimer": "본 변환기는 국제 표준 단위 정의에 따른 계산이며, 일반적인 참고용이에요."
   }
  },
  "en": {
   "title": "Weight Converter — kg, Pounds, Ounces (kg lb oz)",
   "description": "Instantly convert kilograms (kg), pounds (lb), ounces (oz), grams, and stone. Enter a value and see all units.",
   "c": {
    "introTitle": "What is the weight converter?",
    "intro": "It converts between kilograms (kg), grams (g), pounds (lb), ounces (oz), and stone (st). Enter a value in one unit and the rest update instantly.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Standard factors",
      "body": "Uses exact factors such as 1kg=2.20462lb and 1oz=28.3495g."
     },
     {
      "title": "All at once",
      "body": "One input shows every unit simultaneously."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit.",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How many pounds is 1 kg?",
      "answer": "1 kg is about 2.20462 lb."
     },
     {
      "question": "How many grams in a pound?",
      "answer": "1 lb = 453.592 g."
     },
     {
      "question": "What is a stone?",
      "answer": "A British unit: 1 stone = 14 pounds ≈ 6.35 kg."
     }
    ],
    "disclaimer": "This converter uses international standard unit definitions and is for general reference."
   }
  },
  "ja": {
   "title": "重さ変換 — kg・ポンド・オンス (kg lb oz)",
   "description": "キログラム(kg)、ポンド(lb)、オンス(oz)、グラム、ストーンを即時に相互変換します。",
   "c": {
    "introTitle": "重さ変換とは？",
    "intro": "キログラム(kg)、グラム(g)、ポンド(lb)、オンス(oz)、ストーン(st)を相互変換するツールです。1つの単位に入力すると他が即時更新されます。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "標準係数",
      "body": "1kg=2.20462lb、1oz=28.3495gなど正確な係数を使用します。"
     },
     {
      "title": "同時変換",
      "body": "1回の入力で全単位を表示します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "1kgは何ポンド？",
      "answer": "1kg = 約2.20462lb です。"
     },
     {
      "question": "1ポンドは何g？",
      "answer": "1lb = 453.592g です。"
     },
     {
      "question": "ストーンとは？",
      "answer": "英国の単位で、1ストーン = 14ポンド ≈ 6.35kg です。"
     }
    ],
    "disclaimer": "本変換ツールは国際標準の単位定義に基づく計算で、一般的な参考用です。"
   }
  },
  "zh": {
   "title": "重量转换器 — 千克、磅、盎司 (kg lb oz)",
   "description": "在千克(kg)、磅(lb)、盎司(oz)、克、英石之间即时换算。",
   "c": {
    "introTitle": "什么是重量转换器？",
    "intro": "在千克（kg）、克（g）、磅（lb）、盎司（oz）和英石（st）之间换算。在一个单位中输入数值，其余单位会立即更新。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "标准系数",
      "body": "1 磅 = 453.59237 克，1 盎司 ≈ 28.3495 克。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "1 千克是多少磅？",
      "answer": "1 千克约为 2.20462 磅。"
     },
     {
      "question": "1 磅是多少克？",
      "answer": "1 磅 = 453.592 克。"
     },
     {
      "question": "英石是什么？",
      "answer": "英国单位：1 英石 = 14 磅 ≈ 6.35 千克。"
     }
    ],
    "disclaimer": "本转换器使用国际标准单位定义，仅供一般参考。"
   }
  },
  "fr": {
   "title": "Convertisseur de Poids — kg, livres, onces",
   "description": "Convertissez kilogrammes (kg), livres (lb), onces (oz), grammes et stone.",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur de poids ?",
    "intro": "Il convertit entre kilogrammes (kg), grammes (g), livres (lb), onces (oz) et stone (st). Saisissez une valeur dans une unité et les autres se mettent à jour.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Facteurs exacts",
      "body": "1 lb = 453,59237 g et 1 oz ≈ 28,3495 g."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien de livres dans 1 kg ?",
      "answer": "1 kg ≈ 2,20462 lb."
     },
     {
      "question": "Combien de grammes dans une livre ?",
      "answer": "1 lb = 453,592 g."
     },
     {
      "question": "Qu’est-ce qu’un stone ?",
      "answer": "Une unité britannique : 1 stone = 14 livres ≈ 6,35 kg."
     }
    ],
    "disclaimer": "Ce convertisseur utilise les définitions internationales des unités. Pour information générale."
   }
  },
  "es": {
   "title": "Conversor de Peso — kg, libras, onzas",
   "description": "Convierte kilogramos (kg), libras (lb), onzas (oz), gramos y stone.",
   "c": {
    "introTitle": "¿Qué es el conversor de peso?",
    "intro": "Convierte entre kilogramos (kg), gramos (g), libras (lb), onzas (oz) y stone (st). Introduce un valor en una unidad y las demás se actualizan.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Factores exactos",
      "body": "1 lb = 453,59237 g y 1 oz ≈ 28,3495 g."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuántas libras es 1 kg?",
      "answer": "1 kg ≈ 2,20462 lb."
     },
     {
      "question": "¿Cuántos gramos tiene una libra?",
      "answer": "1 lb = 453,592 g."
     },
     {
      "question": "¿Qué es un stone?",
      "answer": "Una unidad británica: 1 stone = 14 libras ≈ 6,35 kg."
     }
    ],
    "disclaimer": "Este conversor usa las definiciones internacionales de unidades. Solo como referencia general."
   }
  }
 },
 "volume-converter": {
  "ko": {
   "title": "부피 변환기 — 리터·mL·컵·온스·갤런 변환",
   "description": "리터(L), 밀리리터(mL), 컵, 테이블스푼, 액량온스(fl oz), 갤런을 즉시 상호 변환합니다. 요리·레시피 계량에 유용합니다.",
   "c": {
    "introTitle": "부피 변환기란?",
    "intro": "리터(L), 밀리리터(mL), 컵, 티스푼·테이블스푼, 액량온스(fl oz), 파인트·쿼트·갤런 사이를 변환하는 도구예요. 요리 레시피 계량에 특히 유용해요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "미국식 계량",
      "body": "1컵=236.6mL, 1테이블스푼=14.8mL 등 미국 표준을 사용합니다."
     },
     {
      "title": "레시피에 유용",
      "body": "해외 레시피의 컵·온스를 mL로 빠르게 환산합니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다.",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "1컵은 몇 mL인가요?",
      "answer": "미국 기준 1컵 = 약 236.6mL 입니다."
     },
     {
      "question": "1리터는 몇 액량온스인가요?",
      "answer": "1L = 약 33.814 fl oz(미국) 입니다."
     },
     {
      "question": "테이블스푼과 티스푼 차이는?",
      "answer": "1테이블스푼 = 3티스푼 ≈ 14.8mL, 1티스푼 ≈ 4.93mL 입니다."
     }
    ],
    "disclaimer": "컵·스푼·온스는 미국 관습 단위 기준이에요. 영국식 등 다른 정의와는 값이 다를 수 있어요."
   }
  },
  "en": {
   "title": "Volume Converter — Liters, mL, Cups, fl oz, Gallons",
   "description": "Instantly convert liters (L), milliliters (mL), cups, tablespoons, fluid ounces (fl oz), and gallons. Great for cooking and recipes.",
   "c": {
    "introTitle": "What is the volume converter?",
    "intro": "It converts between liters (L), milliliters (mL), cups, teaspoons/tablespoons, fluid ounces (fl oz), pints, quarts, and gallons. Especially handy for cooking recipes.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "US customary",
      "body": "Uses US standards such as 1 cup=236.6mL and 1 tbsp=14.8mL."
     },
     {
      "title": "Recipe-friendly",
      "body": "Quickly turn cups/oz from foreign recipes into mL."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit.",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How many mL in a cup?",
      "answer": "1 US cup is about 236.6 mL."
     },
     {
      "question": "How many fluid ounces in a liter?",
      "answer": "1 L is about 33.814 US fl oz."
     },
     {
      "question": "Tablespoon vs teaspoon?",
      "answer": "1 tbsp = 3 tsp ≈ 14.8 mL; 1 tsp ≈ 4.93 mL."
     }
    ],
    "disclaimer": "Cups, spoons, and ounces use US customary units. UK and other definitions may differ."
   }
  },
  "ja": {
   "title": "体積変換 — リットル・mL・カップ・オンス・ガロン",
   "description": "リットル(L)、ミリリットル(mL)、カップ、大さじ、液量オンス(fl oz)、ガロンを即時に相互変換します。",
   "c": {
    "introTitle": "体積変換とは？",
    "intro": "リットル(L)、ミリリットル(mL)、カップ、小さじ・大さじ、液量オンス(fl oz)、パイント・クォート・ガロンを相互変換するツールです。料理レシピの計量に便利です。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "米国式計量",
      "body": "1カップ=236.6mL、1大さじ=14.8mLなど米国標準を使用します。"
     },
     {
      "title": "レシピに便利",
      "body": "海外レシピのカップ・ozをmLに素早く換算します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "1カップは何mL？",
      "answer": "米国基準で1カップ = 約236.6mL です。"
     },
     {
      "question": "1リットルは何液量オンス？",
      "answer": "1L = 約33.814 fl oz（米国）です。"
     },
     {
      "question": "大さじと小さじの違いは？",
      "answer": "1大さじ = 3小さじ ≈ 14.8mL、1小さじ ≈ 4.93mL です。"
     }
    ],
    "disclaimer": "カップ・スプーン・オンスは米国慣用単位基準です。英国式など他の定義とは値が異なる場合があります。"
   }
  },
  "zh": {
   "title": "体积转换器 — 升、毫升、杯、盎司、加仑",
   "description": "在升(L)、毫升(mL)、杯、汤匙、液量盎司、加仑之间即时换算。适合烹饪与食谱。",
   "c": {
    "introTitle": "什么是体积转换器？",
    "intro": "在升（L）、毫升（mL）、杯、茶匙/汤匙、液量盎司（fl oz）、品脱、夸脱和加仑之间换算，特别适合换算外国食谱。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "美制单位",
      "body": "使用美制标准：1 杯 ≈ 236.6 毫升，1 汤匙 ≈ 14.8 毫升。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "1 杯是多少毫升？",
      "answer": "1 美制杯约 236.6 毫升。"
     },
     {
      "question": "1 升是多少液量盎司？",
      "answer": "1 升约 33.814 美制液量盎司。"
     },
     {
      "question": "汤匙和茶匙的关系？",
      "answer": "1 汤匙 = 3 茶匙 ≈ 14.8 毫升；1 茶匙 ≈ 4.93 毫升。"
     }
    ],
    "disclaimer": "杯、匙和盎司均为美制单位，英制等其他定义可能不同。"
   }
  },
  "fr": {
   "title": "Convertisseur de Volume — litres, mL, tasses, oz, gallons",
   "description": "Convertissez litres (L), millilitres (mL), tasses, cuillères, onces liquides et gallons.",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur de volume ?",
    "intro": "Il convertit litres (L), millilitres (mL), tasses, cuillères à café et à soupe, onces liquides (fl oz), pintes, quarts et gallons. Pratique pour les recettes américaines.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Unités US",
      "body": "Mesures américaines : 1 tasse ≈ 236,6 mL et 1 cuillère à soupe ≈ 14,8 mL."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien de mL dans une tasse ?",
      "answer": "1 tasse US ≈ 236,6 mL."
     },
     {
      "question": "Combien d’onces liquides dans un litre ?",
      "answer": "1 L ≈ 33,814 fl oz US."
     },
     {
      "question": "Cuillère à soupe ou à café ?",
      "answer": "1 c. à soupe = 3 c. à café ≈ 14,8 mL ; 1 c. à café ≈ 4,93 mL."
     }
    ],
    "disclaimer": "Tasses, cuillères et onces suivent les mesures américaines. Les définitions britanniques peuvent différer."
   }
  },
  "es": {
   "title": "Conversor de Volumen — litros, mL, tazas, oz, galones",
   "description": "Convierte litros (L), mililitros (mL), tazas, cucharadas, onzas líquidas y galones.",
   "c": {
    "introTitle": "¿Qué es el conversor de volumen?",
    "intro": "Convierte litros (L), mililitros (mL), tazas, cucharaditas y cucharadas, onzas líquidas (fl oz), pintas, cuartos y galones. Útil para recetas estadounidenses.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Medidas de EE. UU.",
      "body": "Medidas estadounidenses: 1 taza ≈ 236,6 mL y 1 cucharada ≈ 14,8 mL."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuántos mL tiene una taza?",
      "answer": "1 taza de EE. UU. ≈ 236,6 mL."
     },
     {
      "question": "¿Cuántas onzas líquidas tiene un litro?",
      "answer": "1 L ≈ 33,814 fl oz de EE. UU."
     },
     {
      "question": "¿Cucharada o cucharadita?",
      "answer": "1 cucharada = 3 cucharaditas ≈ 14,8 mL; 1 cucharadita ≈ 4,93 mL."
     }
    ],
    "disclaimer": "Tazas, cucharas y onzas usan medidas de EE. UU. Las definiciones británicas pueden variar."
   }
  }
 },
 "temperature-converter": {
  "ko": {
   "title": "온도 변환기 — 섭씨·화씨·켈빈 변환 (°C °F K)",
   "description": "섭씨(°C), 화씨(°F), 켈빈(K)을 즉시 상호 변환합니다. 값을 입력하면 모든 단위로 동시에 환산됩니다.",
   "c": {
    "introTitle": "온도 변환기란?",
    "intro": "섭씨(°C), 화씨(°F), 켈빈(K) 사이를 변환하는 도구예요. 한 단위에 값을 입력하면 나머지 단위로 즉시 환산돼요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "정확한 공식",
      "body": "°F=°C×9/5+32, K=°C+273.15를 정확히 적용합니다."
     },
     {
      "title": "동시 변환",
      "body": "한 번 입력으로 세 단위를 동시에 보여줍니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다(°C/°F/K).",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "섭씨를 화씨로 바꾸는 공식은?",
      "answer": "°F = °C × 9/5 + 32 입니다. 예: 100°C = 212°F."
     },
     {
      "question": "절대영도는 몇 도인가요?",
      "answer": "0K = -273.15°C = -459.67°F 입니다."
     },
     {
      "question": "사람 체온은?",
      "answer": "약 36.5°C = 97.7°F = 309.65K 입니다."
     }
    ],
    "disclaimer": "본 변환기는 표준 정의에 따른 계산이며, 일반적인 참고용이에요."
   }
  },
  "en": {
   "title": "Temperature Converter — Celsius, Fahrenheit, Kelvin (°C °F K)",
   "description": "Instantly convert between Celsius (°C), Fahrenheit (°F), and Kelvin (K). Enter a value and see all units at once.",
   "c": {
    "introTitle": "What is the temperature converter?",
    "intro": "It converts between Celsius (°C), Fahrenheit (°F), and Kelvin (K). Enter a value in one unit and the others update instantly.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Exact formulas",
      "body": "Applies °F=°C×9/5+32 and K=°C+273.15 precisely."
     },
     {
      "title": "All at once",
      "body": "One input shows all three units simultaneously."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit (°C/°F/K).",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How do I convert Celsius to Fahrenheit?",
      "answer": "°F = °C × 9/5 + 32. For example, 100°C = 212°F."
     },
     {
      "question": "What is absolute zero?",
      "answer": "0K = -273.15°C = -459.67°F."
     },
     {
      "question": "What is normal body temperature?",
      "answer": "About 36.5°C = 97.7°F = 309.65K."
     }
    ],
    "disclaimer": "This converter uses standard definitions and is for general reference."
   }
  },
  "ja": {
   "title": "温度変換 — 摂氏・華氏・ケルビン (°C °F K)",
   "description": "摂氏(°C)、華氏(°F)、ケルビン(K)を即時に相互変換します。値を入力すると全単位に同時換算します。",
   "c": {
    "introTitle": "温度変換とは？",
    "intro": "摂氏(°C)、華氏(°F)、ケルビン(K)を相互変換するツールです。1つの単位に値を入力すると他の単位が即時更新されます。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "正確な式",
      "body": "°F=°C×9/5+32、K=°C+273.15を正確に適用します。"
     },
     {
      "title": "同時変換",
      "body": "1回の入力で3単位を同時に表示します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます(°C/°F/K)。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "摂氏を華氏に変換する式は？",
      "answer": "°F = °C × 9/5 + 32 です。例: 100°C = 212°F。"
     },
     {
      "question": "絶対零度は？",
      "answer": "0K = -273.15°C = -459.67°F です。"
     },
     {
      "question": "平熱は？",
      "answer": "約36.5°C = 97.7°F = 309.65K です。"
     }
    ],
    "disclaimer": "本変換ツールは標準定義に基づく計算で、一般的な参考用です。"
   }
  },
  "zh": {
   "title": "温度转换器 — 摄氏、华氏、开尔文 (°C °F K)",
   "description": "在摄氏(°C)、华氏(°F)和开尔文(K)之间即时换算。",
   "c": {
    "introTitle": "什么是温度转换器？",
    "intro": "在摄氏度（°C）、华氏度（°F）和开尔文（K）之间换算。在一个单位中输入数值，其余单位会立即更新。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "精确公式",
      "body": "°F = °C × 9/5 + 32，K = °C + 273.15。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "摄氏度怎么换算成华氏度？",
      "answer": "°F = °C × 9/5 + 32。例如 100°C = 212°F。"
     },
     {
      "question": "绝对零度是多少？",
      "answer": "0 K = −273.15°C = −459.67°F。"
     },
     {
      "question": "正常体温是多少？",
      "answer": "约 36.5°C = 97.7°F = 309.65 K。"
     }
    ],
    "disclaimer": "本转换器使用标准定义，仅供一般参考。"
   }
  },
  "fr": {
   "title": "Convertisseur de Température — Celsius, Fahrenheit, Kelvin",
   "description": "Convertissez instantanément Celsius (°C), Fahrenheit (°F) et Kelvin (K).",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur de température ?",
    "intro": "Il convertit entre Celsius (°C), Fahrenheit (°F) et Kelvin (K). Saisissez une valeur dans une unité et les autres se mettent à jour.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Formules exactes",
      "body": "°F = °C × 9/5 + 32 et K = °C + 273,15."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Comment passer de Celsius à Fahrenheit ?",
      "answer": "°F = °C × 9/5 + 32. Par exemple, 100 °C = 212 °F."
     },
     {
      "question": "Qu’est-ce que le zéro absolu ?",
      "answer": "0 K = −273,15 °C = −459,67 °F."
     },
     {
      "question": "Quelle est la température corporelle normale ?",
      "answer": "Environ 36,5 °C = 97,7 °F = 309,65 K."
     }
    ],
    "disclaimer": "Ce convertisseur utilise les définitions standard. Pour information générale."
   }
  },
  "es": {
   "title": "Conversor de Temperatura — Celsius, Fahrenheit, Kelvin",
   "description": "Convierte al instante entre Celsius (°C), Fahrenheit (°F) y Kelvin (K).",
   "c": {
    "introTitle": "¿Qué es el conversor de temperatura?",
    "intro": "Convierte entre Celsius (°C), Fahrenheit (°F) y Kelvin (K). Introduce un valor en una unidad y las demás se actualizan.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Fórmulas exactas",
      "body": "°F = °C × 9/5 + 32 y K = °C + 273,15."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cómo paso de Celsius a Fahrenheit?",
      "answer": "°F = °C × 9/5 + 32. Por ejemplo, 100 °C = 212 °F."
     },
     {
      "question": "¿Qué es el cero absoluto?",
      "answer": "0 K = −273,15 °C = −459,67 °F."
     },
     {
      "question": "¿Cuál es la temperatura corporal normal?",
      "answer": "Unos 36,5 °C = 97,7 °F = 309,65 K."
     }
    ],
    "disclaimer": "Este conversor usa definiciones estándar. Solo como referencia general."
   }
  }
 },
 "speed-converter": {
  "ko": {
   "title": "속도 변환기 — km/h·mph·m/s·노트 변환",
   "description": "시속(km/h), 마일/시(mph), 초속(m/s), 노트(knot), ft/s를 즉시 상호 변환합니다.",
   "c": {
    "introTitle": "속도 변환기란?",
    "intro": "시속(km/h), 마일/시(mph), 초속(m/s), 노트(knot), ft/s 사이를 변환하는 도구예요. 한 단위에 입력하면 나머지로 즉시 환산돼요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "표준 계수",
      "body": "1mph=1.60934km/h, 1노트=1.852km/h 등 정확한 계수를 사용합니다."
     },
     {
      "title": "동시 변환",
      "body": "한 번 입력으로 모든 단위를 보여줍니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다.",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "100km/h는 몇 mph인가요?",
      "answer": "100km/h = 약 62.137mph 입니다."
     },
     {
      "question": "노트(knot)는 무엇인가요?",
      "answer": "항해·항공에서 쓰는 속도 단위로 1노트 = 1.852km/h 입니다."
     },
     {
      "question": "m/s를 km/h로 바꾸려면?",
      "answer": "m/s 값에 3.6을 곱하면 km/h가 됩니다. 예: 10m/s = 36km/h."
     }
    ],
    "disclaimer": "본 변환기는 국제 표준 단위 정의에 따른 계산이며, 일반적인 참고용이에요."
   }
  },
  "en": {
   "title": "Speed Converter — km/h, mph, m/s, knots",
   "description": "Instantly convert km/h, mph, m/s, knots, and ft/s. Enter a value and see all units at once.",
   "c": {
    "introTitle": "What is the speed converter?",
    "intro": "It converts between km/h, mph, m/s, knots, and ft/s. Enter a value in one unit and the rest update instantly.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Standard factors",
      "body": "Uses exact factors such as 1mph=1.60934km/h and 1knot=1.852km/h."
     },
     {
      "title": "All at once",
      "body": "One input shows every unit simultaneously."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit.",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "What is 100 km/h in mph?",
      "answer": "100 km/h is about 62.137 mph."
     },
     {
      "question": "What is a knot?",
      "answer": "A speed unit used in sailing and aviation: 1 knot = 1.852 km/h."
     },
     {
      "question": "How to convert m/s to km/h?",
      "answer": "Multiply m/s by 3.6. For example, 10 m/s = 36 km/h."
     }
    ],
    "disclaimer": "This converter uses international standard unit definitions and is for general reference."
   }
  },
  "ja": {
   "title": "速度変換 — km/h・mph・m/s・ノット",
   "description": "時速(km/h)、マイル毎時(mph)、秒速(m/s)、ノット(knot)、ft/sを即時に相互変換します。",
   "c": {
    "introTitle": "速度変換とは？",
    "intro": "時速(km/h)、マイル毎時(mph)、秒速(m/s)、ノット(knot)、ft/sを相互変換するツールです。1つの単位に入力すると他が即時更新されます。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "標準係数",
      "body": "1mph=1.60934km/h、1ノット=1.852km/hなど正確な係数を使用します。"
     },
     {
      "title": "同時変換",
      "body": "1回の入力で全単位を表示します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "100km/hは何mph？",
      "answer": "100km/h = 約62.137mph です。"
     },
     {
      "question": "ノットとは？",
      "answer": "航海・航空で使う速度単位で、1ノット = 1.852km/h です。"
     },
     {
      "question": "m/sをkm/hにするには？",
      "answer": "m/sに3.6を掛けます。例: 10m/s = 36km/h。"
     }
    ],
    "disclaimer": "本変換ツールは国際標準の単位定義に基づく計算で、一般的な参考用です。"
   }
  },
  "zh": {
   "title": "速度转换器 — km/h、mph、m/s、节",
   "description": "在公里/时(km/h)、英里/时(mph)、米/秒(m/s)、节(knot)之间即时换算。",
   "c": {
    "introTitle": "什么是速度转换器？",
    "intro": "在公里/时（km/h）、英里/时（mph）、米/秒（m/s）、节和英尺/秒之间换算。在一个单位中输入数值，其余单位会立即更新。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "标准系数",
      "body": "1 mph ≈ 1.60934 km/h，1 节 = 1.852 km/h。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "100 km/h 是多少 mph？",
      "answer": "100 km/h 约为 62.137 mph。"
     },
     {
      "question": "节是什么？",
      "answer": "航海和航空使用的速度单位：1 节 = 1.852 km/h。"
     },
     {
      "question": "m/s 怎么换算成 km/h？",
      "answer": "乘以 3.6。例如 10 m/s = 36 km/h。"
     }
    ],
    "disclaimer": "本转换器使用国际标准单位定义，仅供一般参考。"
   }
  },
  "fr": {
   "title": "Convertisseur de Vitesse — km/h, mph, m/s, nœuds",
   "description": "Convertissez km/h, mph, m/s, nœuds et ft/s instantanément.",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur de vitesse ?",
    "intro": "Il convertit km/h, mph, m/s, nœuds et ft/s. Saisissez une valeur dans une unité et les autres se mettent à jour.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Facteurs exacts",
      "body": "1 mph ≈ 1,60934 km/h et 1 nœud = 1,852 km/h."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien font 100 km/h en mph ?",
      "answer": "100 km/h ≈ 62,137 mph."
     },
     {
      "question": "Qu’est-ce qu’un nœud ?",
      "answer": "L’unité de vitesse de la marine et de l’aviation : 1 nœud = 1,852 km/h."
     },
     {
      "question": "Comment passer de m/s à km/h ?",
      "answer": "Multipliez par 3,6. Par exemple, 10 m/s = 36 km/h."
     }
    ],
    "disclaimer": "Ce convertisseur utilise les définitions internationales des unités. Pour information générale."
   }
  },
  "es": {
   "title": "Conversor de Velocidad — km/h, mph, m/s, nudos",
   "description": "Convierte km/h, mph, m/s, nudos y ft/s al instante.",
   "c": {
    "introTitle": "¿Qué es el conversor de velocidad?",
    "intro": "Convierte km/h, mph, m/s, nudos y ft/s. Introduce un valor en una unidad y las demás se actualizan.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Factores exactos",
      "body": "1 mph ≈ 1,60934 km/h y 1 nudo = 1,852 km/h."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuánto es 100 km/h en mph?",
      "answer": "100 km/h ≈ 62,137 mph."
     },
     {
      "question": "¿Qué es un nudo?",
      "answer": "Unidad de velocidad de la navegación y la aviación: 1 nudo = 1,852 km/h."
     },
     {
      "question": "¿Cómo paso de m/s a km/h?",
      "answer": "Multiplica por 3,6. Por ejemplo, 10 m/s = 36 km/h."
     }
    ],
    "disclaimer": "Este conversor usa las definiciones internacionales de unidades. Solo como referencia general."
   }
  }
 },
 "pressure-converter": {
  "ko": {
   "title": "압력 변환기 — bar·psi·atm·kPa·mmHg 변환",
   "description": "파스칼(Pa), 킬로파스칼(kPa), bar, 기압(atm), psi, mmHg를 즉시 상호 변환합니다. 타이어 공기압(psi↔bar)에 유용합니다.",
   "c": {
    "introTitle": "압력 변환기란?",
    "intro": "파스칼(Pa)·kPa·bar·기압(atm)·psi·mmHg 사이를 변환하는 도구예요. 타이어 공기압이나 기상·공학 단위 환산에 유용해요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "타이어 공기압",
      "body": "psi↔bar 환산으로 타이어 적정 공기압을 맞출 수 있습니다."
     },
     {
      "title": "표준 계수",
      "body": "1atm=101325Pa, 1psi=6894.76Pa를 정확히 적용합니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다(예: psi 또는 bar).",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "타이어 공기압 32psi는 몇 bar인가요?",
      "answer": "32psi = 약 2.21bar 입니다."
     },
     {
      "question": "1기압(atm)은?",
      "answer": "1atm = 101325Pa = 1.01325bar = 14.696psi = 760mmHg 입니다."
     },
     {
      "question": "bar와 psi 관계는?",
      "answer": "1bar = 약 14.504psi 입니다."
     }
    ],
    "disclaimer": "본 변환기는 국제 표준 단위 정의에 따른 계산이며, 일반적인 참고용이에요."
   }
  },
  "en": {
   "title": "Pressure Converter — bar, psi, atm, kPa, mmHg",
   "description": "Instantly convert pascal (Pa), kPa, bar, atmospheres (atm), psi, and mmHg. Handy for tire pressure (psi↔bar).",
   "c": {
    "introTitle": "What is the pressure converter?",
    "intro": "It converts between pascal (Pa), kPa, bar, atmospheres (atm), psi, and mmHg. Useful for tire pressure and weather/engineering units.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Tire pressure",
      "body": "Convert psi↔bar to set correct tire pressure."
     },
     {
      "title": "Standard factors",
      "body": "Uses 1 atm=101325 Pa and 1 psi=6894.76 Pa precisely."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit (e.g. psi or bar).",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "What is 32 psi in bar?",
      "answer": "32 psi is about 2.21 bar."
     },
     {
      "question": "What is 1 atmosphere?",
      "answer": "1 atm = 101325 Pa = 1.01325 bar = 14.696 psi = 760 mmHg."
     },
     {
      "question": "bar vs psi?",
      "answer": "1 bar ≈ 14.504 psi."
     }
    ],
    "disclaimer": "This converter uses international standard unit definitions and is for general reference."
   }
  },
  "ja": {
   "title": "圧力変換 — bar・psi・atm・kPa・mmHg",
   "description": "パスカル(Pa)、kPa、bar、気圧(atm)、psi、mmHgを即時に相互変換します。",
   "c": {
    "introTitle": "圧力変換とは？",
    "intro": "パスカル(Pa)・kPa・bar・気圧(atm)・psi・mmHgを相互変換するツールです。タイヤ空気圧や気象・工学単位の換算に便利です。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "タイヤ空気圧",
      "body": "psi↔barの換算で適正空気圧に調整できます。"
     },
     {
      "title": "標準係数",
      "body": "1atm=101325Pa、1psi=6894.76Paを正確に適用します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます(例: psi または bar)。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "タイヤ空気圧32psiは何bar？",
      "answer": "32psi = 約2.21bar です。"
     },
     {
      "question": "1気圧(atm)は？",
      "answer": "1atm = 101325Pa = 1.01325bar = 14.696psi = 760mmHg です。"
     },
     {
      "question": "barとpsiの関係は？",
      "answer": "1bar ≈ 14.504psi です。"
     }
    ],
    "disclaimer": "本変換ツールは国際標準の単位定義に基づく計算で、一般的な参考用です。"
   }
  },
  "zh": {
   "title": "压力转换器 — bar、psi、atm、kPa、mmHg",
   "description": "在帕斯卡(Pa)、kPa、bar、大气压(atm)、psi、mmHg之间即时换算。",
   "c": {
    "introTitle": "什么是压力转换器？",
    "intro": "在帕斯卡（Pa）、kPa、bar、标准大气压（atm）、psi 和 mmHg 之间换算，适用于轮胎气压和气象、工程单位。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "轮胎气压",
      "body": "在 psi 和 bar 之间换算，设定正确的胎压。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "32 psi 是多少 bar？",
      "answer": "32 psi 约为 2.21 bar。"
     },
     {
      "question": "1 个标准大气压是多少？",
      "answer": "1 atm = 101325 Pa = 1.01325 bar = 14.696 psi = 760 mmHg。"
     },
     {
      "question": "bar 和 psi 的关系？",
      "answer": "1 bar ≈ 14.504 psi。"
     }
    ],
    "disclaimer": "本转换器使用国际标准单位定义，仅供一般参考。"
   }
  },
  "fr": {
   "title": "Convertisseur de Pression — bar, psi, atm, kPa, mmHg",
   "description": "Convertissez pascal, kPa, bar, atmosphères, psi et mmHg instantanément.",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur de pression ?",
    "intro": "Il convertit pascal (Pa), kPa, bar, atmosphère (atm), psi et mmHg. Utile pour la pression des pneus, la météo et l’ingénierie.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Pression des pneus",
      "body": "Passez de psi à bar pour régler la pression des pneus."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien font 32 psi en bar ?",
      "answer": "32 psi ≈ 2,21 bar."
     },
     {
      "question": "Que vaut 1 atmosphère ?",
      "answer": "1 atm = 101 325 Pa = 1,01325 bar = 14,696 psi = 760 mmHg."
     },
     {
      "question": "bar ou psi ?",
      "answer": "1 bar ≈ 14,504 psi."
     }
    ],
    "disclaimer": "Ce convertisseur utilise les définitions internationales des unités. Pour information générale."
   }
  },
  "es": {
   "title": "Conversor de Presión — bar, psi, atm, kPa, mmHg",
   "description": "Convierte pascal, kPa, bar, atmósferas, psi y mmHg al instante.",
   "c": {
    "introTitle": "¿Qué es el conversor de presión?",
    "intro": "Convierte pascal (Pa), kPa, bar, atmósferas (atm), psi y mmHg. Útil para la presión de los neumáticos, la meteorología y la ingeniería.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Presión de neumáticos",
      "body": "Pasa de psi a bar para ajustar la presión de los neumáticos."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuánto es 32 psi en bar?",
      "answer": "32 psi ≈ 2,21 bar."
     },
     {
      "question": "¿Cuánto es 1 atmósfera?",
      "answer": "1 atm = 101 325 Pa = 1,01325 bar = 14,696 psi = 760 mmHg."
     },
     {
      "question": "¿bar o psi?",
      "answer": "1 bar ≈ 14,504 psi."
     }
    ],
    "disclaimer": "Este conversor usa las definiciones internacionales de unidades. Solo como referencia general."
   }
  }
 },
 "energy-converter": {
  "ko": {
   "title": "에너지 변환기 — J·kcal·kWh·cal 변환",
   "description": "줄(J), 킬로줄(kJ), 칼로리(cal·kcal), 와트시(Wh·kWh)를 즉시 상호 변환합니다. 식품 칼로리와 전력량 환산에 유용합니다.",
   "c": {
    "introTitle": "에너지 변환기란?",
    "intro": "줄(J)·킬로줄(kJ)·칼로리(cal·kcal)·와트시(Wh·kWh) 사이를 변환하는 도구예요. 식품 영양성분의 kcal↔kJ, 전력 사용량(kWh) 환산에 유용해요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "식품 칼로리",
      "body": "영양성분표의 kcal↔kJ를 정확히 환산합니다(1kcal=4.184kJ)."
     },
     {
      "title": "전력량",
      "body": "Wh·kWh로 전기 사용량을 환산합니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다(예: kcal).",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "1kcal은 몇 kJ인가요?",
      "answer": "1kcal = 4.184kJ 입니다. 영양성분표에서 자주 함께 표기됩니다."
     },
     {
      "question": "1kWh는 몇 kJ인가요?",
      "answer": "1kWh = 3600kJ = 3,600,000J 입니다."
     },
     {
      "question": "식품 칼로리와 cal 차이는?",
      "answer": "식품에서 말하는 1칼로리는 보통 1kcal(=1000cal)을 뜻합니다."
     }
    ],
    "disclaimer": "식품 칼로리는 통상 kcal(=1000cal)을 의미해요. 일반적인 참고용이에요."
   }
  },
  "en": {
   "title": "Energy Converter — J, kcal, kWh, cal",
   "description": "Instantly convert joules (J), kJ, calories (cal, kcal), and watt-hours (Wh, kWh). Handy for food calories and electricity.",
   "c": {
    "introTitle": "What is the energy converter?",
    "intro": "It converts between joules (J), kJ, calories (cal, kcal), and watt-hours (Wh, kWh). Useful for food labels (kcal↔kJ) and electricity use (kWh).",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Food calories",
      "body": "Converts kcal↔kJ on nutrition labels (1 kcal=4.184 kJ)."
     },
     {
      "title": "Electricity",
      "body": "Convert Wh/kWh for energy usage."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit (e.g. kcal).",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How many kJ in a kcal?",
      "answer": "1 kcal = 4.184 kJ, often shown together on nutrition labels."
     },
     {
      "question": "How many kJ in a kWh?",
      "answer": "1 kWh = 3600 kJ = 3,600,000 J."
     },
     {
      "question": "Food calorie vs cal?",
      "answer": "A food 'calorie' usually means 1 kcal (=1000 cal)."
     }
    ],
    "disclaimer": "Food 'calories' usually mean kcal (=1000 cal). For general reference."
   }
  },
  "ja": {
   "title": "エネルギー変換 — J・kcal・kWh・cal",
   "description": "ジュール(J)、kJ、カロリー(cal・kcal)、ワット時(Wh・kWh)を即時に相互変換します。",
   "c": {
    "introTitle": "エネルギー変換とは？",
    "intro": "ジュール(J)・kJ・カロリー(cal・kcal)・ワット時(Wh・kWh)を相互変換するツールです。食品のkcal↔kJ、電力使用量(kWh)の換算に便利です。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "食品カロリー",
      "body": "栄養表示のkcal↔kJを正確に換算します(1kcal=4.184kJ)。"
     },
     {
      "title": "電力量",
      "body": "Wh・kWhで電気使用量を換算します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます(例: kcal)。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "1kcalは何kJ？",
      "answer": "1kcal = 4.184kJ です。栄養表示でよく併記されます。"
     },
     {
      "question": "1kWhは何kJ？",
      "answer": "1kWh = 3600kJ = 3,600,000J です。"
     },
     {
      "question": "食品カロリーとcalの違いは？",
      "answer": "食品でいう1カロリーは通常1kcal(=1000cal)を指します。"
     }
    ],
    "disclaimer": "食品の「カロリー」は通常kcal(=1000cal)を指します。一般的な参考用です。"
   }
  },
  "zh": {
   "title": "能量转换器 — 焦耳、千卡、千瓦时、卡",
   "description": "在焦耳(J)、kJ、卡路里(cal·kcal)、瓦时(Wh·kWh)之间即时换算。",
   "c": {
    "introTitle": "什么是能量转换器？",
    "intro": "在焦耳（J）、kJ、卡路里（cal、kcal）和瓦时（Wh、kWh）之间换算，适用于食品标签（kcal↔kJ）和用电量（kWh）。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "食品热量",
      "body": "换算营养标签上的 kcal 和 kJ（1 kcal = 4.184 kJ）。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "1 千卡是多少千焦？",
      "answer": "1 kcal = 4.184 kJ，营养标签上常同时标出。"
     },
     {
      "question": "1 千瓦时是多少千焦？",
      "answer": "1 kWh = 3600 kJ = 3,600,000 J。"
     },
     {
      "question": "食品“卡路里”和 cal 有什么区别？",
      "answer": "食品上的“卡路里”通常指 1 kcal（= 1000 cal）。"
     }
    ],
    "disclaimer": "食品“卡路里”通常指千卡（= 1000 cal），仅供一般参考。"
   }
  },
  "fr": {
   "title": "Convertisseur d'Énergie — J, kcal, kWh, cal",
   "description": "Convertissez joules, kJ, calories et wattheures instantanément.",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur d’énergie ?",
    "intro": "Il convertit joules (J), kJ, calories (cal, kcal) et wattheures (Wh, kWh). Utile pour les étiquettes nutritionnelles (kcal↔kJ) et la consommation électrique (kWh).",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Calories alimentaires",
      "body": "Convertit kcal↔kJ des étiquettes nutritionnelles (1 kcal = 4,184 kJ)."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien de kJ dans une kcal ?",
      "answer": "1 kcal = 4,184 kJ, souvent affichés ensemble sur les étiquettes."
     },
     {
      "question": "Combien de kJ dans un kWh ?",
      "answer": "1 kWh = 3 600 kJ = 3 600 000 J."
     },
     {
      "question": "Calorie alimentaire ou cal ?",
      "answer": "Une « calorie » alimentaire désigne en général 1 kcal (= 1 000 cal)."
     }
    ],
    "disclaimer": "Les « calories » alimentaires désignent en général des kcal (= 1 000 cal). Pour information générale."
   }
  },
  "es": {
   "title": "Conversor de Energía — J, kcal, kWh, cal",
   "description": "Convierte julios, kJ, calorías y vatios-hora al instante.",
   "c": {
    "introTitle": "¿Qué es el conversor de energía?",
    "intro": "Convierte julios (J), kJ, calorías (cal, kcal) y vatios-hora (Wh, kWh). Útil para etiquetas nutricionales (kcal↔kJ) y el consumo eléctrico (kWh).",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Calorías de alimentos",
      "body": "Convierte kcal↔kJ de las etiquetas nutricionales (1 kcal = 4,184 kJ)."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuántos kJ tiene una kcal?",
      "answer": "1 kcal = 4,184 kJ; a menudo aparecen juntos en las etiquetas."
     },
     {
      "question": "¿Cuántos kJ tiene un kWh?",
      "answer": "1 kWh = 3600 kJ = 3 600 000 J."
     },
     {
      "question": "¿Caloría de alimentos o cal?",
      "answer": "La «caloría» de los alimentos suele ser 1 kcal (= 1000 cal)."
     }
    ],
    "disclaimer": "Las «calorías» de los alimentos suelen ser kcal (= 1000 cal). Solo como referencia general."
   }
  }
 },
 "area-converter": {
  "ko": {
   "title": "면적 변환기 — 제곱미터·평·에이커·헥타르 변환",
   "description": "제곱미터(m²), 평, 제곱피트, 에이커, 헥타르를 즉시 상호 변환합니다. 부동산 평수 환산에 유용합니다.",
   "c": {
    "introTitle": "면적 변환기란?",
    "intro": "제곱미터(m²), 평, 제곱센티미터, 제곱킬로미터, 제곱피트, 에이커, 헥타르 사이를 변환하는 도구예요. 특히 한국 부동산의 평수(㎡↔평) 환산에 유용해요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "평수 환산",
      "body": "1평=400/121m²(≈3.3058m²) 기준으로 ㎡↔평을 정확히 환산합니다."
     },
     {
      "title": "동시 변환",
      "body": "한 번 입력으로 모든 단위를 보여줍니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다(예: 평 또는 m²).",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "1평은 몇 m²인가요?",
      "answer": "1평 = 약 3.3058m² 입니다. 반대로 1m² ≈ 0.3025평."
     },
     {
      "question": "33평은 몇 m²인가요?",
      "answer": "33평 = 약 109.1m² 입니다(전용/공급 기준에 따라 표기 차이 있음)."
     },
     {
      "question": "1에이커는 얼마인가요?",
      "answer": "1에이커 = 4046.86m² ≈ 1224평 입니다."
     }
    ],
    "disclaimer": "평 환산은 1평=400/121m²(≈3.3058m²)(약 3.3058) 기준이에요. 일반적인 참고용이에요."
   }
  },
  "en": {
   "title": "Area Converter — m², ft², acre, hectare, pyeong",
   "description": "Instantly convert square meters (m²), square feet, acres, hectares, and Korean pyeong. Handy for real-estate areas.",
   "c": {
    "introTitle": "What is the area converter?",
    "intro": "It converts between square meters (m²), pyeong, square centimeters, square kilometers, square feet, acres, and hectares. Especially useful for Korean real-estate pyeong (㎡↔pyeong).",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "Pyeong conversion",
      "body": "Converts ㎡↔pyeong precisely with 1 pyeong=400/121 m²(≈3.3058 m²)."
     },
     {
      "title": "All at once",
      "body": "One input shows every unit simultaneously."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit (e.g. pyeong or m²).",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How many m² in a pyeong?",
      "answer": "1 pyeong ≈ 3.3058 m²; conversely 1 m² ≈ 0.3025 pyeong."
     },
     {
      "question": "What is 33 pyeong in m²?",
      "answer": "33 pyeong ≈ 109.1 m² (exact figures vary by net/gross area)."
     },
     {
      "question": "How big is an acre?",
      "answer": "1 acre = 4046.86 m² ≈ 1224 pyeong."
     }
    ],
    "disclaimer": "Pyeong uses 1 pyeong=400/121 m²(≈3.3058 m²). For general reference."
   }
  },
  "ja": {
   "title": "面積変換 — 平方メートル・坪・エーカー・ヘクタール",
   "description": "平方メートル(m²)、坪、平方フィート、エーカー、ヘクタールを即時に相互変換します。",
   "c": {
    "introTitle": "面積変換とは？",
    "intro": "平方メートル(m²)、坪、平方センチ、平方キロ、平方フィート、エーカー、ヘクタールを相互変換するツールです。韓国不動産の坪(㎡↔坪)換算に便利です。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "坪換算",
      "body": "1坪=400/121m²(≈3.3058m²)を基準に㎡↔坪を正確に換算します。"
     },
     {
      "title": "同時変換",
      "body": "1回の入力で全単位を表示します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます(例: 坪 または m²)。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "1坪は何m²？",
      "answer": "1坪 ≈ 3.3058m²、逆に1m² ≈ 0.3025坪 です。"
     },
     {
      "question": "33坪は何m²？",
      "answer": "33坪 ≈ 109.1m² です（専有/供給で表記差あり）。"
     },
     {
      "question": "1エーカーは？",
      "answer": "1エーカー = 4046.86m² ≈ 1224坪 です。"
     }
    ],
    "disclaimer": "坪は1坪=400/121m²(≈3.3058m²)基準です。一般的な参考用です。"
   }
  },
  "zh": {
   "title": "面积转换器 — 平方米、坪、英亩、公顷",
   "description": "在平方米(m²)、坪、平方英尺、英亩、公顷之间即时换算。适合房产面积换算。",
   "c": {
    "introTitle": "什么是面积转换器？",
    "intro": "在平方米（m²）、坪、平方厘米、平方千米、平方英尺、英亩和公顷之间换算，也可换算韩国房产常用的“坪”。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "坪的换算",
      "body": "1 坪 = 400/121 m²（约 3.3058 m²）。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "1 坪是多少平方米？",
      "answer": "1 坪 ≈ 3.3058 m²；反过来 1 m² ≈ 0.3025 坪。"
     },
     {
      "question": "33 坪是多少平方米？",
      "answer": "33 坪 ≈ 109.1 m²（实际面积因专用/供应面积而异）。"
     },
     {
      "question": "1 英亩有多大？",
      "answer": "1 英亩 = 4046.86 m² ≈ 1224 坪。"
     }
    ],
    "disclaimer": "坪按 1 坪 = 400/121 m² 计算，仅供一般参考。"
   }
  },
  "fr": {
   "title": "Convertisseur de Surface — m², ft², acre, hectare",
   "description": "Convertissez mètres carrés, pieds carrés, acres et hectares instantanément.",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur de surface ?",
    "intro": "Il convertit mètres carrés (m²), pyeong, cm², km², pieds carrés, acres et hectares. Il couvre aussi le pyeong, l’unité des annonces immobilières coréennes.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Pyeong",
      "body": "1 pyeong = 400/121 m² (≈ 3,3058 m²)."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien de m² dans un pyeong ?",
      "answer": "1 pyeong ≈ 3,3058 m² ; inversement 1 m² ≈ 0,3025 pyeong."
     },
     {
      "question": "Combien font 33 pyeong en m² ?",
      "answer": "33 pyeong ≈ 109,1 m² (la surface réelle dépend de la surface privative ou totale)."
     },
     {
      "question": "Quelle taille fait un acre ?",
      "answer": "1 acre = 4 046,86 m² ≈ 1 224 pyeong."
     }
    ],
    "disclaimer": "Le pyeong est calculé à 400/121 m². Pour information générale."
   }
  },
  "es": {
   "title": "Conversor de Área — m², ft², acre, hectárea",
   "description": "Convierte metros cuadrados, pies cuadrados, acres y hectáreas al instante.",
   "c": {
    "introTitle": "¿Qué es el conversor de área?",
    "intro": "Convierte metros cuadrados (m²), pyeong, cm², km², pies cuadrados, acres y hectáreas. Incluye el pyeong, la unidad de los anuncios inmobiliarios coreanos.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Pyeong",
      "body": "1 pyeong = 400/121 m² (≈ 3,3058 m²)."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuántos m² tiene un pyeong?",
      "answer": "1 pyeong ≈ 3,3058 m²; a la inversa, 1 m² ≈ 0,3025 pyeong."
     },
     {
      "question": "¿Cuánto es 33 pyeong en m²?",
      "answer": "33 pyeong ≈ 109,1 m² (la superficie real depende de si es útil o construida)."
     },
     {
      "question": "¿Cuánto mide un acre?",
      "answer": "1 acre = 4046,86 m² ≈ 1224 pyeong."
     }
    ],
    "disclaimer": "El pyeong se calcula como 400/121 m². Solo como referencia general."
   }
  }
 },
 "data-storage-converter": {
  "ko": {
   "title": "데이터 용량 변환기 — KB·MB·GB·TB 변환",
   "description": "바이트(B), 킬로바이트(KB), 메가바이트(MB), 기가바이트(GB), 테라바이트(TB)를 1024 기준으로 즉시 변환합니다.",
   "c": {
    "introTitle": "데이터 용량 변환기란?",
    "intro": "바이트(B)부터 페타바이트(PB)까지 디지털 저장 용량 단위를 변환하는 도구예요. 1KB=1024B의 이진(binary) 기준을 사용해요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "1024 기준",
      "body": "파일 시스템 관례인 1KB=1024B(이진)를 사용합니다."
     },
     {
      "title": "B~PB",
      "body": "바이트부터 페타바이트까지 한눈에 변환합니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다(예: GB).",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "1GB는 몇 MB인가요?",
      "answer": "이진 기준 1GB = 1024MB 입니다."
     },
     {
      "question": "왜 1TB 디스크가 약 931GB로 보이나요?",
      "answer": "제조사는 1TB=1000⁴B(십진)로 표기하지만 OS는 1024⁴B(이진)로 계산하기 때문입니다."
     },
     {
      "question": "KB와 KiB 차이는?",
      "answer": "엄밀히 KiB=1024B(이진), KB=1000B(십진)지만, 실무에서는 KB를 1024로 쓰는 경우가 많습니다."
     }
    ],
    "disclaimer": "1KB=1024B(이진) 기준이에요. 저장장치 제조사는 1KB=1000B(십진)로 표기하기도 해 실제 용량 표시와 차이가 날 수 있어요."
   }
  },
  "en": {
   "title": "Data Storage Converter — KB, MB, GB, TB",
   "description": "Instantly convert bytes (B), kilobytes (KB), megabytes (MB), gigabytes (GB), and terabytes (TB) using the 1024 base.",
   "c": {
    "introTitle": "What is the data storage converter?",
    "intro": "It converts digital storage units from bytes (B) to petabytes (PB), using the binary base where 1 KB = 1024 B.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "1024 base",
      "body": "Uses the file-system convention 1 KB = 1024 B (binary)."
     },
     {
      "title": "B to PB",
      "body": "Converts from bytes up to petabytes at a glance."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit (e.g. GB).",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How many MB in a GB?",
      "answer": "Binary: 1 GB = 1024 MB."
     },
     {
      "question": "Why does a 1TB disk show ~931GB?",
      "answer": "Makers label 1TB=1000⁴B (decimal) but the OS counts 1024⁴B (binary)."
     },
     {
      "question": "KB vs KiB?",
      "answer": "Strictly KiB=1024B (binary), KB=1000B (decimal); in practice KB often means 1024."
     }
    ],
    "disclaimer": "Uses 1 KB = 1024 B (binary). Storage makers sometimes use 1 KB = 1000 B (decimal), so labeled capacity can differ."
   }
  },
  "ja": {
   "title": "データ容量変換 — KB・MB・GB・TB",
   "description": "バイト(B)、キロバイト(KB)、メガバイト(MB)、ギガバイト(GB)、テラバイト(TB)を1024基準で即時変換します。",
   "c": {
    "introTitle": "データ容量変換とは？",
    "intro": "バイト(B)からペタバイト(PB)までのデジタル容量単位を変換するツールです。1KB=1024Bの二進基準を使用します。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "1024基準",
      "body": "ファイルシステム慣例の1KB=1024B(二進)を使用します。"
     },
     {
      "title": "B〜PB",
      "body": "バイトからペタバイトまで一目で変換します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます(例: GB)。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "1GBは何MB？",
      "answer": "二進基準で1GB = 1024MB です。"
     },
     {
      "question": "なぜ1TBディスクが約931GB？",
      "answer": "メーカーは1TB=1000⁴B(十進)で表記し、OSは1024⁴B(二進)で計算するためです。"
     },
     {
      "question": "KBとKiBの違いは？",
      "answer": "厳密にはKiB=1024B(二進)、KB=1000B(十進)ですが、実務ではKBを1024とすることが多いです。"
     }
    ],
    "disclaimer": "1KB=1024B(二進)基準です。記憶装置メーカーは1KB=1000B(十進)で表記する場合があり、表示容量と差が出ることがあります。"
   }
  },
  "zh": {
   "title": "数据容量转换器 — KB、MB、GB、TB",
   "description": "以1024为基准即时换算字节(B)、KB、MB、GB、TB。",
   "c": {
    "introTitle": "什么是数据容量转换器？",
    "intro": "以二进制（1 KB = 1024 B）在字节（B）到 PB 之间换算数字存储单位。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "1024 进制",
      "body": "采用文件系统惯例 1 KB = 1024 B（二进制）。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "1 GB 是多少 MB？",
      "answer": "二进制：1 GB = 1024 MB。"
     },
     {
      "question": "为什么 1 TB 硬盘只显示约 931 GB？",
      "answer": "厂商按 1 TB = 1000⁴ B（十进制）标注，而系统按 1024⁴ B（二进制）计算。"
     },
     {
      "question": "KB 和 KiB 有什么区别？",
      "answer": "严格来说 KiB = 1024 B（二进制），KB = 1000 B（十进制）；实际中 KB 常指 1024。"
     }
    ],
    "disclaimer": "采用 1 KB = 1024 B（二进制）。存储厂商有时采用 1 KB = 1000 B（十进制），标称容量可能不同。"
   }
  },
  "fr": {
   "title": "Convertisseur de Stockage — Ko, Mo, Go, To",
   "description": "Convertissez octets, Ko, Mo, Go et To en base 1024 instantanément.",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur de stockage ?",
    "intro": "Il convertit les unités de stockage de l’octet (B) au pétaoctet (PB) en base binaire, où 1 KB = 1 024 B.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Base 1024",
      "body": "Convention des systèmes de fichiers : 1 KB = 1 024 B (binaire)."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien de MB dans un GB ?",
      "answer": "En binaire : 1 GB = 1 024 MB."
     },
     {
      "question": "Pourquoi un disque de 1 To affiche-t-il ~931 Go ?",
      "answer": "Le fabricant compte 1 To = 1000⁴ octets (décimal), le système 1024⁴ octets (binaire)."
     },
     {
      "question": "KB ou KiB ?",
      "answer": "Strictement, KiB = 1 024 B (binaire) et KB = 1 000 B (décimal) ; en pratique KB désigne souvent 1 024."
     }
    ],
    "disclaimer": "Utilise 1 KB = 1 024 B (binaire). Les fabricants utilisent parfois 1 KB = 1 000 B (décimal) : la capacité annoncée peut différer."
   }
  },
  "es": {
   "title": "Conversor de Almacenamiento — KB, MB, GB, TB",
   "description": "Convierte bytes, KB, MB, GB y TB en base 1024 al instante.",
   "c": {
    "introTitle": "¿Qué es el conversor de almacenamiento?",
    "intro": "Convierte unidades de almacenamiento desde bytes (B) hasta petabytes (PB) en base binaria, donde 1 KB = 1024 B.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Base 1024",
      "body": "Convención de los sistemas de archivos: 1 KB = 1024 B (binario)."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuántos MB tiene un GB?",
      "answer": "En binario: 1 GB = 1024 MB."
     },
     {
      "question": "¿Por qué un disco de 1 TB muestra unos 931 GB?",
      "answer": "El fabricante cuenta 1 TB = 1000⁴ bytes (decimal) y el sistema 1024⁴ bytes (binario)."
     },
     {
      "question": "¿KB o KiB?",
      "answer": "En sentido estricto, KiB = 1024 B (binario) y KB = 1000 B (decimal); en la práctica KB suele significar 1024."
     }
    ],
    "disclaimer": "Usa 1 KB = 1024 B (binario). Los fabricantes a veces usan 1 KB = 1000 B (decimal), así que la capacidad anunciada puede variar."
   }
  }
 },
 "time-converter": {
  "ko": {
   "title": "시간 변환기 — 초·분·시간·일·주 변환",
   "description": "밀리초, 초, 분, 시간, 일, 주를 즉시 상호 변환합니다. 예: 2시간은 몇 분, 90분은 몇 시간.",
   "c": {
    "introTitle": "시간 변환기란?",
    "intro": "밀리초·초·분·시간·일·주 사이를 변환하는 도구예요. 한 단위에 입력하면 나머지로 즉시 환산돼요.",
    "formulaTitle": "주요 특징",
    "formulas": [
     {
      "title": "동시 변환",
      "body": "한 번 입력으로 초~주를 동시에 보여줍니다."
     },
     {
      "title": "정확한 환산",
      "body": "1시간=3600초, 1일=86400초를 정확히 적용합니다."
     },
     {
      "title": "즉시 계산",
      "body": "값을 바꾸면 바로 갱신됩니다."
     }
    ],
    "howToTitle": "사용 방법",
    "steps": [
     "변환할 값을 입력합니다.",
     "기준 단위를 선택합니다.",
     "모든 단위의 변환 결과를 확인합니다."
    ],
    "faqTitle": "자주 묻는 질문",
    "faqs": [
     {
      "question": "2시간은 몇 분인가요?",
      "answer": "2시간 = 120분 = 7200초 입니다."
     },
     {
      "question": "90분은 몇 시간인가요?",
      "answer": "90분 = 1.5시간 입니다."
     },
     {
      "question": "1주는 몇 시간인가요?",
      "answer": "1주 = 168시간 = 10080분 입니다."
     }
    ],
    "disclaimer": "월·년은 길이가 일정하지 않아 포함하지 않았어요. 일반적인 참고용이에요."
   }
  },
  "en": {
   "title": "Time Converter — seconds, minutes, hours, days, weeks",
   "description": "Instantly convert milliseconds, seconds, minutes, hours, days, and weeks. E.g. how many minutes in 2 hours.",
   "c": {
    "introTitle": "What is the time converter?",
    "intro": "It converts between milliseconds, seconds, minutes, hours, days, and weeks. Enter a value in one unit and the rest update instantly.",
    "formulaTitle": "Highlights",
    "formulas": [
     {
      "title": "All at once",
      "body": "One input shows seconds through weeks simultaneously."
     },
     {
      "title": "Exact",
      "body": "Uses 1 hour=3600s and 1 day=86400s precisely."
     },
     {
      "title": "Instant",
      "body": "Results update as you type."
     }
    ],
    "howToTitle": "How to use",
    "steps": [
     "Enter the value to convert.",
     "Choose the source unit.",
     "Read the converted results in every unit."
    ],
    "faqTitle": "FAQ",
    "faqs": [
     {
      "question": "How many minutes in 2 hours?",
      "answer": "2 hours = 120 minutes = 7200 seconds."
     },
     {
      "question": "How many hours is 90 minutes?",
      "answer": "90 minutes = 1.5 hours."
     },
     {
      "question": "How many hours in a week?",
      "answer": "1 week = 168 hours = 10080 minutes."
     }
    ],
    "disclaimer": "Months and years are not included as their lengths vary. For general reference."
   }
  },
  "ja": {
   "title": "時間変換 — 秒・分・時間・日・週",
   "description": "ミリ秒、秒、分、時間、日、週を即時に相互変換します。",
   "c": {
    "introTitle": "時間変換とは？",
    "intro": "ミリ秒・秒・分・時間・日・週を相互変換するツールです。1つの単位に入力すると他が即時更新されます。",
    "formulaTitle": "主な特徴",
    "formulas": [
     {
      "title": "同時変換",
      "body": "1回の入力で秒〜週を同時に表示します。"
     },
     {
      "title": "正確な換算",
      "body": "1時間=3600秒、1日=86400秒を正確に適用します。"
     },
     {
      "title": "即時計算",
      "body": "入力するとすぐに更新されます。"
     }
    ],
    "howToTitle": "使い方",
    "steps": [
     "変換する値を入力します。",
     "基準単位を選びます。",
     "全単位の変換結果を確認します。"
    ],
    "faqTitle": "よくある質問",
    "faqs": [
     {
      "question": "2時間は何分？",
      "answer": "2時間 = 120分 = 7200秒 です。"
     },
     {
      "question": "90分は何時間？",
      "answer": "90分 = 1.5時間 です。"
     },
     {
      "question": "1週間は何時間？",
      "answer": "1週間 = 168時間 = 10080分 です。"
     }
    ],
    "disclaimer": "月・年は長さが一定でないため含めていません。一般的な参考用です。"
   }
  },
  "zh": {
   "title": "时间转换器 — 秒、分、小时、天、周",
   "description": "在毫秒、秒、分、小时、天、周之间即时换算。",
   "c": {
    "introTitle": "什么是时间转换器？",
    "intro": "在毫秒、秒、分钟、小时、天和周之间换算。在一个单位中输入数值，其余单位会立即更新。",
    "formulaTitle": "主要特点",
    "formulas": [
     {
      "title": "精确换算",
      "body": "1 小时 = 3600 秒，1 天 = 86400 秒。"
     },
     {
      "title": "同时换算",
      "body": "一次输入即可显示所有单位。"
     },
     {
      "title": "即时计算",
      "body": "输入时结果立即更新。"
     }
    ],
    "howToTitle": "使用方法",
    "steps": [
     "输入要换算的数值。",
     "选择原单位。",
     "查看所有单位的换算结果。"
    ],
    "faqTitle": "常见问题",
    "faqs": [
     {
      "question": "2 小时是多少分钟？",
      "answer": "2 小时 = 120 分钟 = 7200 秒。"
     },
     {
      "question": "90 分钟是多少小时？",
      "answer": "90 分钟 = 1.5 小时。"
     },
     {
      "question": "1 周有多少小时？",
      "answer": "1 周 = 168 小时 = 10080 分钟。"
     }
    ],
    "disclaimer": "月和年的长度不固定，因此不包括在内。仅供一般参考。"
   }
  },
  "fr": {
   "title": "Convertisseur de Temps — secondes, minutes, heures, jours",
   "description": "Convertissez millisecondes, secondes, minutes, heures, jours et semaines.",
   "c": {
    "introTitle": "Qu’est-ce que le convertisseur de temps ?",
    "intro": "Il convertit millisecondes, secondes, minutes, heures, jours et semaines. Saisissez une valeur dans une unité et les autres se mettent à jour.",
    "formulaTitle": "Points clés",
    "formulas": [
     {
      "title": "Exact",
      "body": "1 heure = 3 600 s et 1 jour = 86 400 s."
     },
     {
      "title": "Tout à la fois",
      "body": "Une saisie affiche toutes les unités."
     },
     {
      "title": "Instantané",
      "body": "Le résultat se met à jour pendant la saisie."
     }
    ],
    "howToTitle": "Comment l'utiliser",
    "steps": [
     "Saisissez la valeur à convertir.",
     "Choisissez l'unité de départ.",
     "Lisez le résultat dans toutes les unités."
    ],
    "faqTitle": "Questions fréquentes",
    "faqs": [
     {
      "question": "Combien de minutes dans 2 heures ?",
      "answer": "2 heures = 120 minutes = 7 200 secondes."
     },
     {
      "question": "Combien d’heures font 90 minutes ?",
      "answer": "90 minutes = 1,5 heure."
     },
     {
      "question": "Combien d’heures dans une semaine ?",
      "answer": "1 semaine = 168 heures = 10 080 minutes."
     }
    ],
    "disclaimer": "Les mois et les années ne sont pas inclus car leur durée varie. Pour information générale."
   }
  },
  "es": {
   "title": "Conversor de Tiempo — segundos, minutos, horas, días",
   "description": "Convierte milisegundos, segundos, minutos, horas, días y semanas.",
   "c": {
    "introTitle": "¿Qué es el conversor de tiempo?",
    "intro": "Convierte milisegundos, segundos, minutos, horas, días y semanas. Introduce un valor en una unidad y las demás se actualizan.",
    "formulaTitle": "Puntos clave",
    "formulas": [
     {
      "title": "Exacto",
      "body": "1 hora = 3600 s y 1 día = 86 400 s."
     },
     {
      "title": "Todo a la vez",
      "body": "Una entrada muestra todas las unidades."
     },
     {
      "title": "Instantáneo",
      "body": "El resultado se actualiza mientras escribes."
     }
    ],
    "howToTitle": "Cómo usarlo",
    "steps": [
     "Introduce el valor a convertir.",
     "Elige la unidad de origen.",
     "Consulta el resultado en todas las unidades."
    ],
    "faqTitle": "Preguntas frecuentes",
    "faqs": [
     {
      "question": "¿Cuántos minutos son 2 horas?",
      "answer": "2 horas = 120 minutos = 7200 segundos."
     },
     {
      "question": "¿Cuántas horas son 90 minutos?",
      "answer": "90 minutos = 1,5 horas."
     },
     {
      "question": "¿Cuántas horas tiene una semana?",
      "answer": "1 semana = 168 horas = 10 080 minutos."
     }
    ],
    "disclaimer": "No se incluyen meses ni años porque su duración varía. Solo como referencia general."
   }
  }
 }
};
