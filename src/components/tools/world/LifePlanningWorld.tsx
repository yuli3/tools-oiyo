// 생애 설계 다른 언어 판(en·ja·zh·fr·es) (2026-11-20). 한국어는 LifePlanningScenario. 탭 3개가 각각 ScenarioTool이에요.
// 계산: lib/life-plan-scenarios.ts (통화와 무관). 금액은 언어별 통화(WL_CURRENCY), 예시는 그 나라 흔한 규모.
import { useMemo, useState } from "react";
import { eduMonthly, eduResult, jeonseRatio, startNet, type EduLite, type JeonseLite, type StartLite } from "../../../lib/life-plan-scenarios";
import { fixedRange, type Assumption, type TornadoBar } from "../../../lib/scenario";
import { cash, driverOf, pctOf, sc, WL_CURRENCY, type WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";

type Tab = "start" | "edu" | "deposit";
type Copy = (typeof T)["en"];

const T = {
  en: {
    pick: "What do you want to plan?", tabs: { start: "Starting out as a couple", edu: "Education fund", deposit: "Rental deposit safety" }, yrs: "years", ask: "Good to know",
    mine: "My assets", partner: "Partner's assets", wedding: "Wedding cost", housing: "First home (deposit or purchase)", startQ: "Tell us both your assets and what you will spend",
    left: "Left over", both: "Combined assets", spend: "To spend", startChart: "Assets minus spending", startResult: "money left over",
    startOk: (a: string) => `After the wedding and the first home, ${a} is left.`, startShort: (a: string) => `You are ${a} short of your combined assets. A loan or family help would need to cover it.`,
    startR1: (b: string, w: string, h: string) => `From combined assets of ${b}, the wedding (${w}) and home (${h}) were taken off.`,
    startR2: "Large gifts from parents may have tax consequences. Check your country's gift tax rules.", startR3: "Set aside an emergency fund of 3–6 months of living costs first.",
    startAsk: ["Agree early on whose assets go into the home and how ownership is recorded."], startStep: "Left over = my assets + partner's assets − wedding − home",
    cost: "Yearly education cost (today's prices)", until: "Years until it starts", duration: "Years of study", infl: "Education cost inflation", ret: "Return on savings", eduQ: "When, and how much, will you need?",
    monthly: "Monthly saving", future: "Needed then", today: "In today's money", eduChart: "Monthly saving by cost inflation", eduResult: "monthly saving", perYear: (p: string) => `${p} a year`,
    eduHead: (y: number, d: number, f: string, m: string) => `Education over ${d} years starting in ${y} years will cost about ${f}. Saving about ${m} a month from now covers it.`,
    eduR1: (t: string, p: string, g: string) => `It is ${t} in today's money, but rising ${p} a year adds ${g}.`, eduR2: (p: string) => `Savings are assumed to grow at ${p} a year. The longer the time, the bigger the difference a return makes.`,
    eduR3: "Fees, living costs and tutoring can rise faster than general inflation. Compare two or three rates.", eduAsk: ["Scholarships, grants and student loans reduce what you need.", "A high return assumption lowers the monthly amount. For guaranteed products use 2–3%."],
    plainInfl: "how fast costs rise", plainRet: "the return on savings", plainUntil: "years until it starts", plainCost: "the yearly cost",
    price: "Home market value", deposit: "Your rental deposit", debt: "Prior mortgages on the home", depQ: "Tell us the home value, your deposit and the debt", depHint: "Prior mortgages are loans registered on the property before your lease; check the land registry.",
    ratio: "Share of home value", verdict: "Verdict", plusDebt: "Deposit + debt", depChart: "If the home value falls", depCaption: "Deposit plus prior debt as a share of the home value.", now: "Today", drop: (p: number) => `${p}% fall`,
    bands: ["Fairly safe", "Caution", "Risky", "Very risky"], depResult: "share of home value",
    depHead: (r: string, b: string) => `Your deposit plus prior debt is ${r} of the home value: ${b}.`,
    depR1: "If the owner defaults, the home may be sold and earlier lenders are paid first. The lower this share, the safer your deposit.",
    depR2: "A 10–20% fall in home prices can push the share over the danger line.",
    depAsk: ["Check the land registry for mortgages, seizures and trusts before signing.", "Register your lease or address on the day you pay, where your country allows it.", "Ask whether deposit protection insurance is available."],
    depStep: (d: string, c: string, p: string, r: string) => `(deposit ${d} + prior debt ${c}) ÷ home value ${p} = ${r}`, depStep2: "70% or less fairly safe · up to 80% caution · up to 90% risky · above that very risky",
    plainPrice: "the home value", plainDeposit: "your deposit", plainDebt: "prior debt",
  },
  ja: {
    pick: "何を計算しますか？", tabs: { start: "結婚のスタート資金", edu: "教育資金", deposit: "賃貸保証金の安全度" }, yrs: "年", ask: "知っておきたいこと",
    mine: "自分の資産", partner: "配偶者の資産", wedding: "結婚式の費用", housing: "新居の費用（敷金・購入）", startQ: "2人の資産と使うお金を教えてください",
    left: "残るお金", both: "2人の資産", spend: "使うお金", startChart: "資産から使うお金を引くと", startResult: "残るお金",
    startOk: (a: string) => `結婚式と新居を用意して、${a}残ります。`, startShort: (a: string) => `2人の資産より${a}足りません。ローンや援助で補う必要があります。`,
    startR1: (b: string, w: string, h: string) => `2人の資産${b}から、結婚式${w}と新居${h}を引きました。`,
    startR2: "親からの援助が大きい場合は、結婚・子育て資金の贈与非課税などの要件を確認してください。", startR3: "残るお金は、まず生活費3〜6か月分の緊急資金に回してください。",
    startAsk: ["新居にどちらの資産をいくら入れるか、名義をどうするか早めに決めておきましょう。"], startStep: "残るお金 = 自分の資産 + 配偶者の資産 − 結婚式 − 新居",
    cost: "1年の教育費（今の値段）", until: "入学までの年数", duration: "在学年数", infl: "教育費の上昇率", ret: "貯めるお金の利回り", eduQ: "いつ、いくら必要ですか？",
    monthly: "毎月の積立額", future: "その時に必要な額", today: "今の値段で", eduChart: "教育費の上昇率ごとの毎月の積立額", eduResult: "毎月の積立額", perYear: (p: string) => `年${p}`,
    eduHead: (y: number, d: number, f: string, m: string) => `${y}年後から${d}年間の教育費は約${f}です。今から毎月約${m}ずつ貯めれば足ります。`,
    eduR1: (t: string, p: string, g: string) => `今の値段では${t}ですが、毎年${p}ずつ上がると${g}増えます。`, eduR2: (p: string) => `貯めるお金は年${p}で運用すると仮定しました。期間が長いほど利回りの差が大きくなります。`,
    eduR3: "学費・生活費・塾代は物価より速く上がることがあります。2〜3通りの上昇率で比べてください。", eduAsk: ["奨学金や教育ローンを使えば必要な額は減ります。", "利回りを高くすると積立額は少なく出ます。元本保証型なら1〜2%で見てください。"],
    plainInfl: "教育費の上昇率", plainRet: "利回り", plainUntil: "入学までの年数", plainCost: "1年の教育費",
    price: "物件の時価", deposit: "あなたの保証金", debt: "先順位の抵当（借入）", depQ: "物件の価値、保証金、借入を教えてください", depHint: "先順位の抵当は登記簿の乙区で確認できます。",
    ratio: "物件価値に対する割合", verdict: "判定", plusDebt: "保証金＋借入", depChart: "物件価値が下がると", depCaption: "保証金と先順位の借入が物件価値の何%になるかを見ました。", now: "現在", drop: (p: number) => `${p}%下落`,
    bands: ["比較的安全", "注意", "危険", "非常に危険"], depResult: "物件価値に対する割合",
    depHead: (r: string, b: string) => `保証金と先順位の借入は物件価値の${r}で、${b}です。`,
    depR1: "家主が返済できなくなると物件が売られ、先に登記した債権者から返済されます。割合が低いほど保証金は安全です。",
    depR2: "物件価格が10〜20%下がるだけで危険ラインを超えることがあります。",
    depAsk: ["契約前に登記簿で抵当権・差押え・信託を確認してください。", "入居日に住民票の移動など、権利を守る手続きをしてください。", "保証金を守る保険や保証が使えるか確認してください。"],
    depStep: (d: string, c: string, p: string, r: string) => `（保証金 ${d} + 先順位 ${c}）÷ 物件価値 ${p} = ${r}`, depStep2: "70%以下 比較的安全 · 80%以下 注意 · 90%以下 危険 · それ以上 非常に危険",
    plainPrice: "物件の価値", plainDeposit: "保証金", plainDebt: "先順位の借入",
  },
  zh: {
    pick: "想规划什么？", tabs: { start: "婚后起步资金", edu: "教育金", deposit: "租房押金安全度" }, yrs: "年", ask: "需要了解",
    mine: "我的资产", partner: "配偶的资产", wedding: "婚礼费用", housing: "婚房（押金或购房）", startQ: "告诉我们两人的资产和要花的钱",
    left: "结余", both: "两人资产", spend: "要花的钱", startChart: "资产减去开支", startResult: "结余",
    startOk: (a: string) => `办完婚礼、准备好婚房后还剩${a}。`, startShort: (a: string) => `比两人资产少了${a}，需要贷款或家人支持来补足。`,
    startR1: (b: string, w: string, h: string) => `从两人资产${b}中减去婚礼${w}和婚房${h}。`,
    startR2: "父母资助较多时，请了解当地关于赠与和婚前财产的规定。", startR3: "结余先留出3～6个月生活费作为应急金。",
    startAsk: ["尽早商量好婚房用谁的钱、产权如何登记。"], startStep: "结余 = 我的资产 + 配偶资产 − 婚礼 − 婚房",
    cost: "每年教育费（现价）", until: "距入学年数", duration: "就读年数", infl: "教育费上涨率", ret: "储蓄收益率", eduQ: "什么时候、需要多少？",
    monthly: "每月储蓄", future: "届时所需", today: "按现价", eduChart: "不同教育费上涨率下的每月储蓄", eduResult: "每月储蓄", perYear: (p: string) => `年${p}`,
    eduHead: (y: number, d: number, f: string, m: string) => `${y}年后起${d}年的教育费约为${f}。从现在起每月存约${m}即可。`,
    eduR1: (t: string, p: string, g: string) => `按现价是${t}，但每年上涨${p}，会多出${g}。`, eduR2: (p: string) => `假设储蓄按年${p}增长。时间越长，收益率差距越大。`,
    eduR3: "学费、生活费和课外辅导可能比物价涨得快。请用两三种上涨率比较。", eduAsk: ["奖学金、助学贷款可以减少所需金额。", "收益率设得高，月存额就显得少。保本产品按2%～3%估算。"],
    plainInfl: "教育费上涨率", plainRet: "收益率", plainUntil: "距入学年数", plainCost: "每年教育费",
    price: "房屋市值", deposit: "你的押金", debt: "在先抵押贷款", depQ: "告诉我们房屋价值、押金和贷款", depHint: "在先抵押可在不动产登记信息中查到。",
    ratio: "占房屋价值", verdict: "判断", plusDebt: "押金＋贷款", depChart: "如果房价下跌", depCaption: "押金加在先贷款占房屋价值的比例。", now: "现在", drop: (p: number) => `下跌${p}%`,
    bands: ["较安全", "注意", "危险", "非常危险"], depResult: "占房屋价值比例",
    depHead: (r: string, b: string) => `押金加在先贷款占房屋价值的${r}，属于${b}。`,
    depR1: "房东无力还款时房屋可能被拍卖，先登记的债权人优先受偿。比例越低，押金越安全。",
    depR2: "房价下跌10%～20%就可能越过危险线。",
    depAsk: ["签约前查清抵押、查封和信托登记。", "交款当天办理租赁登记备案等保护手续。", "了解是否有押金保障保险。"],
    depStep: (d: string, c: string, p: string, r: string) => `（押金 ${d} + 在先贷款 ${c}）÷ 房屋价值 ${p} = ${r}`, depStep2: "70%以下较安全 · 80%以下注意 · 90%以下危险 · 以上非常危险",
    plainPrice: "房屋价值", plainDeposit: "押金", plainDebt: "在先贷款",
  },
  fr: {
    pick: "Que voulez-vous planifier ?", tabs: { start: "Démarrer à deux", edu: "Épargne études", deposit: "Sécurité du dépôt de garantie" }, yrs: "ans", ask: "Bon à savoir",
    mine: "Mon patrimoine", partner: "Patrimoine du conjoint", wedding: "Coût du mariage", housing: "Premier logement (apport ou achat)", startQ: "Indiquez vos patrimoines et vos dépenses",
    left: "Reste", both: "Patrimoine commun", spend: "À dépenser", startChart: "Patrimoine moins dépenses", startResult: "le reste",
    startOk: (a: string) => `Après le mariage et le premier logement, il reste ${a}.`, startShort: (a: string) => `Il manque ${a} par rapport à votre patrimoine commun : un prêt ou une aide familiale devra combler l'écart.`,
    startR1: (b: string, w: string, h: string) => `Du patrimoine commun de ${b}, on a retiré le mariage (${w}) et le logement (${h}).`,
    startR2: "Une donation importante des parents peut être taxée : vérifiez les abattements en vigueur.", startR3: "Mettez d'abord de côté une épargne de précaution de 3 à 6 mois de dépenses.",
    startAsk: ["Décidez tôt qui apporte quoi au logement et comment la propriété est enregistrée."], startStep: "Reste = mon patrimoine + patrimoine du conjoint − mariage − logement",
    cost: "Coût annuel des études (prix actuels)", until: "Années avant le début", duration: "Durée des études", infl: "Hausse du coût des études", ret: "Rendement de l'épargne", eduQ: "Quand, et combien vous faudra-t-il ?",
    monthly: "Épargne mensuelle", future: "Besoin à l'époque", today: "En euros d'aujourd'hui", eduChart: "Épargne mensuelle selon la hausse des coûts", eduResult: "l'épargne mensuelle", perYear: (p: string) => `${p} par an`,
    eduHead: (y: number, d: number, f: string, m: string) => `Des études de ${d} ans commençant dans ${y} ans coûteront environ ${f}. Épargner environ ${m} par mois dès maintenant suffit.`,
    eduR1: (t: string, p: string, g: string) => `C'est ${t} aux prix actuels, mais une hausse de ${p} par an ajoute ${g}.`, eduR2: (p: string) => `L'épargne est supposée rapporter ${p} par an. Plus la durée est longue, plus le rendement compte.`,
    eduR3: "Frais, logement étudiant et cours particuliers peuvent augmenter plus vite que l'inflation. Comparez deux ou trois taux.", eduAsk: ["Bourses et prêts étudiants réduisent le besoin.", "Un rendement élevé réduit l'épargne affichée. Pour un placement garanti, comptez 2 à 3 %."],
    plainInfl: "la hausse des coûts", plainRet: "le rendement", plainUntil: "les années avant le début", plainCost: "le coût annuel",
    price: "Valeur du logement", deposit: "Votre dépôt de garantie", debt: "Hypothèques antérieures", depQ: "Indiquez la valeur du logement, votre dépôt et les dettes", depHint: "Les hypothèques antérieures figurent au fichier immobilier (service de publicité foncière).",
    ratio: "Part de la valeur", verdict: "Verdict", plusDebt: "Dépôt + dettes", depChart: "Si la valeur baisse", depCaption: "Dépôt plus dettes antérieures en part de la valeur du logement.", now: "Aujourd'hui", drop: (p: number) => `Baisse de ${p} %`,
    bands: ["Plutôt sûr", "Prudence", "Risqué", "Très risqué"], depResult: "la part de la valeur",
    depHead: (r: string, b: string) => `Votre dépôt plus les dettes antérieures représentent ${r} de la valeur du logement : ${b}.`,
    depR1: "Si le propriétaire fait défaut, le logement peut être vendu et les créanciers inscrits avant vous passent en premier. Plus la part est faible, plus le dépôt est sûr.",
    depR2: "Une baisse de 10 à 20 % des prix peut faire passer la part au-dessus du seuil de danger.",
    depAsk: ["Vérifiez les hypothèques et saisies avant de signer.", "Faites un état des lieux et gardez les preuves de paiement.", "Renseignez-vous sur une garantie du dépôt si elle existe."],
    depStep: (d: string, c: string, p: string, r: string) => `(dépôt ${d} + dettes ${c}) ÷ valeur ${p} = ${r}`, depStep2: "70 % ou moins plutôt sûr · jusqu'à 80 % prudence · jusqu'à 90 % risqué · au-delà très risqué",
    plainPrice: "la valeur du logement", plainDeposit: "le dépôt", plainDebt: "les dettes antérieures",
  },
  es: {
    pick: "¿Qué quieres planificar?", tabs: { start: "Empezar en pareja", edu: "Ahorro para estudios", deposit: "Seguridad de la fianza" }, yrs: "años", ask: "Conviene saber",
    mine: "Mis ahorros", partner: "Ahorros de la pareja", wedding: "Coste de la boda", housing: "Primera vivienda (entrada o compra)", startQ: "Indica los ahorros de los dos y lo que vais a gastar",
    left: "Sobra", both: "Ahorros juntos", spend: "A gastar", startChart: "Ahorros menos gastos", startResult: "lo que sobra",
    startOk: (a: string) => `Tras la boda y la primera vivienda os quedan ${a}.`, startShort: (a: string) => `Faltan ${a} respecto a vuestros ahorros. Habrá que cubrirlo con un préstamo o ayuda familiar.`,
    startR1: (b: string, w: string, h: string) => `De unos ahorros conjuntos de ${b} se restaron la boda (${w}) y la vivienda (${h}).`,
    startR2: "Las donaciones grandes de los padres pueden tributar: revisa el impuesto de donaciones de tu comunidad.", startR3: "Reserva primero un fondo de emergencia de 3 a 6 meses de gastos.",
    startAsk: ["Acordad pronto quién aporta qué a la vivienda y cómo se registra la propiedad."], startStep: "Sobra = mis ahorros + ahorros de la pareja − boda − vivienda",
    cost: "Coste anual de estudios (precios de hoy)", until: "Años hasta empezar", duration: "Años de estudio", infl: "Subida del coste", ret: "Rentabilidad del ahorro", eduQ: "¿Cuándo y cuánto vas a necesitar?",
    monthly: "Ahorro mensual", future: "Necesario entonces", today: "En dinero de hoy", eduChart: "Ahorro mensual según la subida del coste", eduResult: "el ahorro mensual", perYear: (p: string) => `${p} al año`,
    eduHead: (y: number, d: number, f: string, m: string) => `${d} años de estudios que empiezan dentro de ${y} años costarán unos ${f}. Ahorrar unos ${m} al mes desde ahora es suficiente.`,
    eduR1: (t: string, p: string, g: string) => `Son ${t} a precios de hoy, pero una subida del ${p} anual añade ${g}.`, eduR2: (p: string) => `Se supone que el ahorro rinde un ${p} anual. Cuanto más largo el plazo, más pesa la rentabilidad.`,
    eduR3: "Matrículas, alojamiento y clases particulares pueden subir más que la inflación. Compara dos o tres tasas.", eduAsk: ["Las becas y los préstamos de estudio reducen lo necesario.", "Una rentabilidad alta reduce el ahorro mostrado. Para productos garantizados usa un 2–3 %."],
    plainInfl: "la subida del coste", plainRet: "la rentabilidad", plainUntil: "los años hasta empezar", plainCost: "el coste anual",
    price: "Valor de la vivienda", deposit: "Tu fianza", debt: "Hipotecas anteriores", depQ: "Indica el valor de la vivienda, tu fianza y las deudas", depHint: "Las cargas anteriores aparecen en la nota simple del Registro de la Propiedad.",
    ratio: "Parte del valor", verdict: "Valoración", plusDebt: "Fianza + deudas", depChart: "Si baja el valor", depCaption: "Fianza más deudas anteriores como parte del valor de la vivienda.", now: "Hoy", drop: (p: number) => `Bajada del ${p} %`,
    bands: ["Bastante segura", "Precaución", "Arriesgada", "Muy arriesgada"], depResult: "la parte del valor",
    depHead: (r: string, b: string) => `Tu fianza más las deudas anteriores suponen el ${r} del valor de la vivienda: ${b}.`,
    depR1: "Si el propietario no paga, la vivienda puede subastarse y cobran primero los acreedores inscritos antes. Cuanto menor la parte, más segura tu fianza.",
    depR2: "Una bajada de precios del 10–20 % puede superar la línea de peligro.",
    depAsk: ["Pide una nota simple para ver hipotecas y embargos antes de firmar.", "Comprueba que la fianza se deposita en el organismo de tu comunidad.", "Guarda los justificantes de pago."],
    depStep: (d: string, c: string, p: string, r: string) => `(fianza ${d} + deudas ${c}) ÷ valor ${p} = ${r}`, depStep2: "70 % o menos bastante segura · hasta 80 % precaución · hasta 90 % arriesgada · más, muy arriesgada",
    plainPrice: "el valor de la vivienda", plainDeposit: "la fianza", plainDebt: "las deudas anteriores",
  },
};

const NEXT: Record<WL, { wedding: string; compound: string }> = {
  en: { wedding: "Wedding budget", compound: "Compound interest" },
  ja: { wedding: "結婚予算", compound: "複利" },
  zh: { wedding: "婚礼预算", compound: "复利" },
  fr: { wedding: "Budget mariage", compound: "Intérêts composés" },
  es: { wedding: "Presupuesto de boda", compound: "Interés compuesto" },
};

const band = (t: Copy, r: number) => t.bands[r <= 0.7 ? 0 : r <= 0.8 ? 1 : r <= 0.9 ? 2 : 3];
const moneyA = <I,>(key: keyof I & string, label: string, plain: string, lo = 0.5, hi = 2): Assumption<I> => ({
  key, label, plain, unit: "won", kind: "assumption",
  get: (i) => i[key] as unknown as number, set: (i, v) => ({ ...i, [key]: Math.max(0, v) }),
  range: (a) => [a * lo, Math.max(a * hi, 1)],
});

function Start({ lang, t }: { lang: WL; t: Copy }) {
  const KEYS = ["mine", "partner", "wedding", "housing"] as const;
  type K = (typeof KEYS)[number];
  const cur = WL_CURRENCY[lang];
  const k = sc(cur);
  const a = (n: number) => `${n < 0 ? "−" : ""}${cash(Math.abs(n), lang, cur)}`;
  const assumptions = useMemo(() => [moneyA<StartLite>("housing", t.housing, t.housing), moneyA<StartLite>("wedding", t.wedding, t.wedding), moneyA<StartLite>("mine", t.mine, t.mine), moneyA<StartLite>("partner", t.partner, t.partner)], [t]);
  const f = (i: StartLite, edit: (p: Partial<StartLite>, k: K[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label={t.mine} value={i.mine} onChange={(v) => edit({ mine: v }, ["mine"])} suffix={cur} step={1_000 * k} />
      <NumberField label={t.partner} value={i.partner} onChange={(v) => edit({ partner: v }, ["partner"])} suffix={cur} step={1_000 * k} />
      <NumberField label={t.wedding} value={i.wedding} onChange={(v) => edit({ wedding: v }, ["wedding"])} suffix={cur} step={1_000 * k} />
      <NumberField label={t.housing} value={i.housing} onChange={(v) => edit({ housing: v }, ["housing"])} suffix={cur} step={1_000 * k} />
    </div>
  );
  const summary = (i: StartLite, top?: TornadoBar) => {
    const net = startNet(i);
    return { headline: net >= 0 ? t.startOk(a(net)) : t.startShort(a(-net)), driver: driverOf(lang, top, t.startResult, a), reasons: [t.startR1(a(i.mine + i.partner), a(i.wedding), a(i.housing)), t.startR2, t.startR3] };
  };
  return (
    <ScenarioTool<StartLite, K>
      lang={lang}
      currency={cur}
      toolId="life-planning-start"
      example={{ mine: 40_000 * k, partner: 40_000 * k, wedding: 25_000 * k, housing: 50_000 * k }}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={startNet}
      resultName={t.startResult}
      questions={({ input, edit }) => [{ title: t.startQ, keys: [...KEYS], body: f(input, edit) }]}
      expert={({ input, edit }) => f(input, edit)}
      summary={summary}
      metrics={(i) => [
        { label: t.left, value: a(startNet(i)), tone: "primary" },
        { label: t.both, value: a(i.mine + i.partner) },
        { label: t.spend, value: a(i.wedding + i.housing) },
      ]}
      sliders={["housing", "wedding"]}
      charts={(i) => (
        <BridgeChart
          title={t.startChart}
          steps={[
            { label: t.both, value: i.mine + i.partner, kind: "total" },
            { label: t.wedding, value: -i.wedding, kind: "add" },
            { label: t.housing, value: -i.housing, kind: "add" },
            { label: t.left, value: startNet(i), kind: "total" },
          ]}
          format={a}
        />
      )}
      askTitle={t.ask}
      ask={t.startAsk}
      expertFooter={() => <ResultSteps steps={[t.startStep]} next={[{ href: `/${lang}/wedding-planning-calculator/`, label: NEXT[lang].wedding }]} />}
    />
  );
}

function Edu({ lang, t }: { lang: WL; t: Copy }) {
  const KEYS = ["cost", "years", "duration", "inflation", "ret"] as const;
  type K = (typeof KEYS)[number];
  const cur = WL_CURRENCY[lang];
  const k = sc(cur);
  const a = (n: number) => cash(n, lang, cur);
  const p = (r: number) => pctOf(r, lang);
  const assumptions = useMemo<Assumption<EduLite>[]>(
    () => [
      { key: "inflation", label: t.infl, plain: t.plainInfl, unit: "rate", kind: "assumption", get: (i) => i.inflation, set: (i, v) => ({ ...i, inflation: Math.max(0, v) }), range: fixedRange(0, 0.07) },
      { key: "ret", label: t.ret, plain: t.plainRet, unit: "rate", kind: "assumption", get: (i) => i.ret, set: (i, v) => ({ ...i, ret: Math.max(0, v) }), range: fixedRange(0, 0.08) },
      { key: "years", label: t.until, plain: t.plainUntil, unit: "years", kind: "fact", get: (i) => i.years, set: (i, v) => ({ ...i, years: Math.max(1, Math.round(v)) }), range: fixedRange(1, 20) },
      moneyA<EduLite>("cost", t.cost, t.plainCost),
    ],
    [t],
  );
  const f = (i: EduLite, edit: (p: Partial<EduLite>, k: K[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label={t.cost} value={i.cost} onChange={(v) => edit({ cost: v }, ["cost"])} suffix={cur} step={500 * k} />
      <NumberField label={t.until} value={i.years} onChange={(v) => edit({ years: v }, ["years"])} suffix={t.yrs} step={1} min={1} />
      <NumberField label={t.duration} value={i.duration} onChange={(v) => edit({ duration: v }, ["duration"])} suffix={t.yrs} step={1} min={1} />
      <NumberField label={t.infl} value={Math.round(i.inflation * 1000) / 10} onChange={(v) => edit({ inflation: v / 100 }, ["inflation"])} suffix="%" step={0.5} min={0} />
      <NumberField label={t.ret} value={Math.round(i.ret * 1000) / 10} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={0.5} min={0} />
    </div>
  );
  const summary = (i: EduLite, top?: TornadoBar) => {
    const r = eduResult(i);
    return { headline: t.eduHead(i.years, i.duration, a(r.future), a(r.monthly)), driver: driverOf(lang, top, t.eduResult, a), reasons: [t.eduR1(a(r.today), p(i.inflation), a(r.future - r.today)), t.eduR2(p(i.ret)), t.eduR3] };
  };
  return (
    <ScenarioTool<EduLite, K>
      lang={lang}
      currency={cur}
      toolId="life-planning-edu"
      example={{ cost: 15_000 * k, years: 10, duration: 4, inflation: 0.03, ret: 0.035 }}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={eduMonthly}
      resultName={t.eduResult}
      questions={({ input, edit }) => [{ title: t.eduQ, keys: ["cost", "years", "duration"], body: f(input, edit) }]}
      expert={({ input, edit }) => f(input, edit)}
      summary={summary}
      metrics={(i) => {
        const r = eduResult(i);
        return [
          { label: t.monthly, value: a(r.monthly), tone: "primary" },
          { label: t.future, value: a(r.future) },
          { label: t.today, value: a(r.today) },
        ];
      }}
      sliders={["inflation", "ret", "years"]}
      charts={(i) => (
        <CompareBars
          title={t.eduChart}
          items={[0, 0.02, 0.03, 0.05].map((x) => ({ label: t.perYear(p(x)), value: eduMonthly({ ...i, inflation: x }), current: Math.abs(x - i.inflation) < 1e-9 }))}
          format={a}
        />
      )}
      askTitle={t.ask}
      ask={t.eduAsk}
      expertFooter={(i) => {
        const r = eduResult(i);
        return (
          <ResultSteps
            steps={[`Σ ${a(i.cost)} × (1 + ${p(i.inflation)})^(${i.years} + k), k = 0…${i.duration - 1} = ${a(r.future)}`, `${a(r.future)} × r ÷ ((1 + r)^${i.years * 12} − 1), r = ${p(i.ret)} / 12 = ${a(r.monthly)}`]}
            next={[{ href: `/${lang}/compound-interest-calculator/`, label: NEXT[lang].compound }]}
          />
        );
      }}
    />
  );
}

function Deposit({ lang, t }: { lang: WL; t: Copy }) {
  const KEYS = ["price", "deposit", "debt"] as const;
  type K = (typeof KEYS)[number];
  const cur = WL_CURRENCY[lang];
  const k = sc(cur);
  const a = (n: number) => cash(n, lang, cur);
  const p = (r: number) => pctOf(r, lang);
  const assumptions = useMemo(() => [moneyA<JeonseLite>("price", t.price, t.plainPrice, 0.6, 1.4), moneyA<JeonseLite>("deposit", t.deposit, t.plainDeposit), moneyA<JeonseLite>("debt", t.debt, t.plainDebt)], [t]);
  const f = (i: JeonseLite, edit: (p: Partial<JeonseLite>, k: K[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <NumberField label={t.price} value={i.price} onChange={(v) => edit({ price: v }, ["price"])} suffix={cur} step={10_000 * k} />
      <NumberField label={t.deposit} value={i.deposit} onChange={(v) => edit({ deposit: v }, ["deposit"])} suffix={cur} step={1_000 * k} />
      <NumberField label={t.debt} value={i.debt} onChange={(v) => edit({ debt: v }, ["debt"])} suffix={cur} step={10_000 * k} />
    </div>
  );
  const summary = (i: JeonseLite, top?: TornadoBar) => {
    const r = jeonseRatio(i);
    return { headline: t.depHead(p(r), band(t, r)), driver: driverOf(lang, top, t.depResult, p), reasons: [t.depR1, t.depR2] };
  };
  return (
    <ScenarioTool<JeonseLite, K>
      lang={lang}
      currency={cur}
      toolId="life-planning-jeonse"
      example={{ price: 300_000 * k, deposit: 60_000 * k, debt: 150_000 * k }}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={jeonseRatio}
      resultName={t.depResult}
      formatResult={p}
      questions={({ input, edit }) => [
        {
          title: t.depQ,
          keys: [...KEYS],
          body: (
            <>
              {f(input, edit)}
              <p className="mt-2 text-xs text-muted-foreground">{t.depHint}</p>
            </>
          ),
        },
      ]}
      expert={({ input, edit }) => f(input, edit)}
      summary={summary}
      metrics={(i) => [
        { label: t.ratio, value: p(jeonseRatio(i)), tone: "primary" },
        { label: t.verdict, value: band(t, jeonseRatio(i)) },
        { label: t.plusDebt, value: a(i.deposit + i.debt) },
      ]}
      sliders={["price", "deposit", "debt"]}
      charts={(i) => (
        <CompareBars
          title={t.depChart}
          caption={t.depCaption}
          items={[0, 0.1, 0.2, 0.3].map((d) => ({ label: d === 0 ? t.now : t.drop(Math.round(d * 100)), value: jeonseRatio({ ...i, price: i.price * (1 - d) }), current: d === 0 }))}
          format={p}
        />
      )}
      askTitle={t.ask}
      ask={t.depAsk}
      expertFooter={(i) => <ResultSteps steps={[t.depStep(a(i.deposit), a(i.debt), a(i.price), p(jeonseRatio(i))), t.depStep2]} next={[{ href: `/${lang}/compound-interest-calculator/`, label: NEXT[lang].compound }]} />}
    />
  );
}

export default function LifePlanningWorld({ lang }: { lang: WL }) {
  const [tab, setTab] = useState<Tab>("start");
  const t = T[lang];
  const tabs = (Object.keys(t.tabs) as Tab[]).map((value) => ({ value, label: t.tabs[value] }));
  return (
    <div className="space-y-4">
      <ChoiceChips<Tab> legend={t.pick} value={tab} options={tabs} onChange={setTab} />
      {tab === "start" ? <Start lang={lang} t={t} /> : tab === "edu" ? <Edu lang={lang} t={t} /> : <Deposit lang={lang} t={t} />}
    </div>
  );
}
