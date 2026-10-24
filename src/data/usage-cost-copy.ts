import type { Locale } from '../lib/i18n';

type UsageCopy = {
  title: string; description: string; scope: string; privacy: string; example: string;
  name: string; cost: string; hours: string; currency: string; period: string; periods: [string,string];
  add: string; remove: string; reset: string; entry: string; result: string; hourly: string;
  pending: string; invalid: string; unused: string; unusedNote: string; chart: string;
  mathTitle: string; math: string; judgment: string; empty: string; exampleNames: [string,string,string];
};
export const usageCostCopy: Record<Locale, UsageCopy> = {
  ko: {
    title:'구독·취미 사용비 비교', description:'같은 기간에 쓴 비용을 실제 사용시간으로 나눠 비교해요. 사용하지 않은 항목과 입력을 기다리는 항목은 따로 보여 드려요.',
    scope:'비교기간과 통화는 모든 항목에 같게 적용해요. 연간 결제는 직접 월별로 나눈 추정액을 넣어 주세요. 통화를 바꾸면 숫자는 그대로이고 환율 변환은 하지 않아요.',
    privacy:'이 도구의 항목명·금액·시간은 브라우저 메모리에서만 계산하며 서버로 보내거나 저장하지 않아요. 새로고침하면 초기화돼요. 사이트는 방문 통계와 광고를 사용해요.',
    example:'가상 예시예요. 실제 결제액과 사용시간으로 바꿔 보세요.',name:'항목명',cost:'기간 내 비용',hours:'실제 사용시간',currency:'통화',period:'비교기간',periods:['한 달','최근 30일'],
    add:'항목 추가',remove:'삭제',reset:'가상 예시로 초기화',entry:'항목',result:'비교 결과',hourly:'시간당 비용',pending:'입력 대기',invalid:'0 이상의 유한한 숫자를 넣어 주세요.',unused:'미사용',unusedNote:'시간이 0인 항목은 시간당 비용을 계산하지 않아요. 이번 기간 비용을 따로 확인하세요.',chart:'시간당 비용 비교 · 높은 순',
    mathTitle:'어떻게 비교하나요?',math:'시간당 비용 = 같은 기간의 비용 ÷ 실제 사용시간. 막대 길이는 계산 가능한 항목 중 가장 큰 시간당 비용에 대한 상대값이에요. 표에는 전체 항목과 수치를 표시해요.',
    judgment:'저렴하다고 더 좋은 취미는 아니에요. 만족도·필요성·함께 쓰는 사람도 고려하세요. 금융 수익률이나 해지 권고가 아니에요.',empty:'비용과 0보다 큰 사용시간을 입력하면 비교 막대가 나와요.',exampleNames:['영상 구독','취미 수업','음악 구독'],
  },
  en: {
    title:'Subscription and hobby cost per hour',description:'Compare spending with actual time used over the same period. Unused items and entries awaiting input are shown separately.',
    scope:'One period and one currency apply to every item. For annual payments, enter your own estimated monthly allocation. Changing the currency relabels amounts; it does not convert them.',
    privacy:'Item names, costs and hours are calculated in browser memory only, not saved or sent to a server by this tool. Refreshing resets them. This site uses analytics and advertising.',
    example:'Fictional examples. Replace the amounts and hours with your own.',name:'Item name',cost:'Cost for the period',hours:'Actual hours used',currency:'Currency',period:'Comparison period',periods:['One month','Last 30 days'],
    add:'Add item',remove:'Remove',reset:'Reset fictional examples',entry:'Item',result:'Comparison results',hourly:'Cost per hour',pending:'Awaiting input',invalid:'Enter finite numbers greater than or equal to zero.',unused:'Unused',unusedNote:'Items with zero hours have no hourly cost calculation. Review their spending for the period separately.',chart:'Cost per hour · highest first',
    mathTitle:'How the comparison works',math:'Cost per hour = cost for the period ÷ actual hours used. Bar lengths are relative to the highest calculable hourly cost. The table shows every item and its values.',
    judgment:'Cheaper does not mean a better hobby. Consider enjoyment, necessity and shared use. This is not an investment return or a cancellation recommendation.',empty:'Enter a cost and more than zero hours to see comparison bars.',exampleNames:['Video subscription','Hobby classes','Music subscription'],
  },
  ja: {
    title:'サブスク・趣味の時間単価比較',description:'同じ期間の費用を実際の利用時間で割って比較します。未使用の項目と入力待ちの項目は分けて表示します。',
    scope:'すべての項目に同じ期間・通貨を適用します。年払いはご自身で月割りした概算額を入力してください。通貨を変えても数値は変わらず、為替換算はしません。',
    privacy:'項目名・金額・時間はブラウザーのメモリー内でのみ計算し、このツールからサーバーへ送信・保存しません。再読み込みすると初期化されます。サイトではアクセス解析と広告を使用しています。',
    example:'架空の入力例です。実際の金額と利用時間に変えてみてください。',name:'項目名',cost:'期間内の費用',hours:'実際の利用時間',currency:'通貨',period:'比較期間',periods:['1か月','直近30日'],
    add:'項目を追加',remove:'削除',reset:'架空の例に戻す',entry:'項目',result:'比較結果',hourly:'1時間あたりの費用',pending:'入力待ち',invalid:'0以上の有限の数値を入力してください。',unused:'未使用',unusedNote:'利用時間が0の項目は時間単価を計算しません。期間内の費用を別に確認してください。',chart:'時間単価の比較・高い順',
    mathTitle:'比較の仕組み',math:'時間単価＝同じ期間の費用÷実際の利用時間。棒の長さは計算可能な項目の最大時間単価に対する割合です。表ではすべての項目と数値を確認できます。',
    judgment:'安い趣味ほど良いわけではありません。満足度・必要性・共同利用も考えましょう。投資収益率の計算や解約の推奨ではありません。',empty:'費用と0より大きい利用時間を入力すると比較の棒が表示されます。',exampleNames:['動画サブスク','趣味の教室','音楽サブスク'],
  },
  zh: {
    title:'订阅与爱好的每小时成本比较',description:'将同一期间的花费除以实际使用时间，比较每小时成本。未使用的项目和等待输入的项目会分别显示。',
    scope:'所有项目使用同一期间和同一币种。年费请自行估算每月分摊金额。更改币种只更改标注，不改变数字，也不进行汇率换算。',
    privacy:'本工具仅在浏览器内存中计算项目名称、金额和时间，不保存或发送到服务器。刷新页面会重置输入。本站使用访问统计和广告。',
    example:'以下是虚构示例，请换成实际金额和使用时间。',name:'项目名称',cost:'期间内花费',hours:'实际使用小时数',currency:'币种',period:'比较期间',periods:['一个月','最近30天'],
    add:'添加项目',remove:'删除',reset:'恢复虚构示例',entry:'项目',result:'比较结果',hourly:'每小时成本',pending:'等待输入',invalid:'请输入大于或等于0的有限数字。',unused:'未使用',unusedNote:'使用时间为0的项目不计算每小时成本，请单独查看本期花费。',chart:'每小时成本比较 · 从高到低',
    mathTitle:'如何比较？',math:'每小时成本＝同一期间的花费÷实际使用小时数。条形长度以可计算项目中最高的每小时成本为基准。表格显示所有项目及其数值。',
    judgment:'更便宜不代表爱好更有价值，也请考虑满意度、必要性和共同使用情况。这不是投资收益率计算，也不是取消订阅的建议。',empty:'输入花费和大于0的使用时间后，即可查看比较条形图。',exampleNames:['视频订阅','兴趣课程','音乐订阅'],
  },
  fr: {
    title:'Coût horaire des abonnements et loisirs',description:'Comparez les dépenses au temps réellement utilisé sur une même période. Les éléments inutilisés et les saisies incomplètes sont affichés séparément.',
    scope:'Une seule période et une seule devise pour tous les éléments. Pour un paiement annuel, saisissez votre estimation mensuelle. Changer de devise modifie le libellé, sans convertir les montants.',
    privacy:'Cet outil calcule les noms, montants et heures uniquement dans la mémoire du navigateur, sans les enregistrer ni les envoyer à un serveur. Recharger la page les réinitialise. Le site utilise des statistiques de visite et de la publicité.',
    example:'Exemples fictifs. Remplacez les montants et les heures par les vôtres.',name:'Nom',cost:'Coût sur la période',hours:'Heures réellement utilisées',currency:'Devise',period:'Période de comparaison',periods:['Un mois','Les 30 derniers jours'],
    add:'Ajouter un élément',remove:'Supprimer',reset:'Rétablir les exemples fictifs',entry:'Élément',result:'Résultats de la comparaison',hourly:'Coût par heure',pending:'Saisie incomplète',invalid:'Saisissez des nombres finis supérieurs ou égaux à zéro.',unused:'Inutilisé',unusedNote:'Le coût horaire ne se calcule pas pour zéro heure. Examinez séparément les dépenses correspondantes sur la période.',chart:'Coût horaire · du plus élevé au plus faible',
    mathTitle:'Comment comparer ?',math:'Coût horaire = coût sur la période ÷ heures réellement utilisées. La longueur des barres est relative au coût horaire calculable le plus élevé. Le tableau présente tous les éléments et leurs valeurs.',
    judgment:'Un loisir moins cher n’est pas forcément meilleur. Pensez au plaisir, au besoin et à l’usage partagé. Ce n’est ni un rendement financier ni une recommandation de résiliation.',empty:'Saisissez un coût et un temps supérieur à zéro pour afficher les barres.',exampleNames:['Abonnement vidéo','Cours de loisir','Abonnement musical'],
  },
  es: {
    title:'Coste por hora de suscripciones y aficiones',description:'Compara el gasto con el tiempo real de uso durante un mismo período. Los elementos sin uso y los datos incompletos se muestran por separado.',
    scope:'Todos los elementos comparten período y moneda. Para pagos anuales, introduce tu estimación mensual. Cambiar la moneda solo cambia la etiqueta: no convierte los importes.',
    privacy:'Esta herramienta calcula nombres, importes y horas solo en la memoria del navegador, sin guardarlos ni enviarlos a un servidor. Al recargar la página se restablecen. El sitio usa estadísticas de visitas y publicidad.',
    example:'Ejemplos ficticios. Sustituye los importes y las horas por los tuyos.',name:'Nombre',cost:'Coste del período',hours:'Horas reales de uso',currency:'Moneda',period:'Período de comparación',periods:['Un mes','Últimos 30 días'],
    add:'Añadir elemento',remove:'Eliminar',reset:'Restablecer ejemplos ficticios',entry:'Elemento',result:'Resultados de la comparación',hourly:'Coste por hora',pending:'Datos incompletos',invalid:'Introduce números finitos mayores o iguales a cero.',unused:'Sin uso',unusedNote:'No se calcula el coste por hora con cero horas de uso. Consulta por separado el gasto del período.',chart:'Coste por hora · de mayor a menor',
    mathTitle:'¿Cómo se compara?',math:'Coste por hora = coste del período ÷ horas reales de uso. La longitud de las barras es relativa al mayor coste por hora calculable. La tabla muestra todos los elementos y sus valores.',
    judgment:'Una afición más barata no es necesariamente mejor. Considera el disfrute, la necesidad y el uso compartido. No es una rentabilidad financiera ni una recomendación de cancelación.',empty:'Introduce un coste y más de cero horas para ver las barras.',exampleNames:['Suscripción de vídeo','Clases de afición','Suscripción musical'],
  },
};
