// World legal aid eligibility (2026-11-24, CHOSEUN "사람들의 니즈(전세계) 확인 후 작업 추가").
// Autocomplete: "法テラス 収入要件", "法テラス 利用条件", "弁護士 費用 払えない" (ja-JP) / "aide juridictionnelle plafond", "aide juridictionnelle simulation" (fr-FR).
// Sources (checked 2026-11-24):
// - 法テラス「無料法律相談のご利用の流れ」 houterasu.or.jp/site/soudan-tatekae/goriyounonagare.html: 収入基準・資産基準・家賃控除表
// - Service-Public F18074 "Aide juridictionnelle lors d'une procédure en France" (plafonds per circulaire du 16 janvier 2026), foyer de 1 à 5 personnes.
// Not covered (unverified): FR foyers of 6+ (the 7-person row on the page looks inconsistent), JP rent deduction for 5+ people, Spain (IPREM 2026 value not confirmed).

export const AID_AS_OF = "2026-11-24";
export type Tone = "warn" | "info" | "good";
export type WItem = { tone: Tone; text: string; cite: string };

// ── Japan 法テラス ──
const JP = "法テラス 無料法律相談のご利用の流れ";
const JP_INCOME = { big: [200_200, 276_100, 299_200, 328_900], other: [182_000, 251_000, 272_000, 299_000] };
const JP_ASSET = [1_800_000, 2_500_000, 2_700_000, 3_000_000];
const JP_RENT = { tokyo23: [53_000, 68_000, 85_000, 92_000], other: [41_000, 53_000, 66_000, 71_000] };

export function jpIncomeLimit(people: number, bigCity: boolean): number {
  const n = Math.max(1, Math.floor(people || 1));
  const t = bigCity ? JP_INCOME.big : JP_INCOME.other;
  return n <= 4 ? t[n - 1] : t[3] + (n - 4) * (bigCity ? 33_000 : 30_000);
}
export const jpAssetLimit = (people: number) => JP_ASSET[Math.min(4, Math.max(1, Math.floor(people || 1))) - 1];

export function jpHouterasu(x: { people: number; bigCity: boolean; tokyo23?: boolean; monthlyTakeHome: number; rentOrLoan: number; cashSavings: number }) {
  const n = Math.max(1, Math.floor(x.people || 1));
  const limit = jpIncomeLimit(n, x.bigCity || Boolean(x.tokyo23));
  const rentCap = n <= 4 ? (x.tokyo23 ? JP_RENT.tokyo23 : JP_RENT.other)[n - 1] : null;
  const rentDeduct = rentCap === null ? 0 : Math.min(Math.max(0, x.rentOrLoan || 0), rentCap);
  const counted = Math.max(0, (x.monthlyTakeHome || 0) - rentDeduct);
  const asset = jpAssetLimit(n);
  const incomeOk = counted <= limit, assetOk = (x.cashSavings || 0) <= asset;
  const yen = (v: number) => `${Math.round(v).toLocaleString("ja-JP")}円`;
  const items: WItem[] = [
    { tone: incomeOk ? "good" : "warn", text: `収入: 手取り平均月収（賞与を含む）${yen(x.monthlyTakeHome || 0)}${rentDeduct ? ` − 家賃・住宅ローン控除 ${yen(rentDeduct)}` : ""} = ${yen(counted)}。基準 ${yen(limit)}${incomeOk ? "以下です" : "を超えます"}。`, cite: JP },
    { tone: assetOk ? "good" : "warn", text: `資産（現金・預貯金）${yen(x.cashSavings || 0)}。基準 ${yen(asset)}以下${assetOk ? "です" : "を超えます"}。`, cite: JP },
    { tone: "info", text: "収入と資産は原則として本人と配偶者の合計で見ます。離婚など配偶者が相手方の事件では本人分だけで判断します。", cite: JP },
    { tone: "info", text: "無料法律相談は1回30分、同じ問題につき3回まで。民事・家事・行政が対象で、刑事事件は対象外です。弁護士・司法書士費用の立替えには別に審査があります。", cite: JP },
  ];
  if (rentCap === null && (x.rentOrLoan || 0) > 0) items.push({ tone: "info", text: "5人以上の家賃・住宅ローン控除限度額は公表表にないため差し引いていません。", cite: JP });
  if (!incomeOk) items.push({ tone: "info", text: "基準を超えても、医療費・教育費などやむを得ない事情があれば基準を満たす可能性があります。", cite: JP });
  return { asOf: AID_AS_OF, eligible: incomeOk && assetOk, limit, asset, counted, items };
}

// ── France aide juridictionnelle ──
const FR = "Service-Public F18074 (circulaire du 16 janvier 2026)";
/** [RFR 100 %, 55 % upper, 25 % upper, patrimoine mobilier, patrimoine immobilier] for foyer of 1..5 */
const FR_TABLE: [number, number, number, number, number][] = [
  [12_957, 15_316, 19_433, 12_957, 38_866],
  [15_289, 17_648, 21_765, 15_289, 45_861],
  [17_621, 19_980, 24_097, 17_621, 52_857],
  [19_095, 21_454, 25_570, 19_095, 57_276],
  [20_568, 22_927, 27_044, 20_568, 61_695],
];
export const FR_MAX_PEOPLE = FR_TABLE.length;

export function frAideJuridictionnelle(x: { people: number; rfr: number; movable: number; property: number }) {
  const n = Math.floor(x.people || 1);
  if (n < 1 || n > FR_MAX_PEOPLE) return { asOf: AID_AS_OF, rate: null as number | null, items: [{ tone: "info" as Tone, text: "Foyers de 6 personnes ou plus : non couvert ici. Utilisez le simulateur officiel.", cite: FR }] };
  const [full, p55, p25, mob, imm] = FR_TABLE[n - 1];
  const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;
  const items: WItem[] = [];
  const assetsOk = (x.movable || 0) <= mob && (x.property || 0) <= imm;
  const r = x.rfr || 0;
  const rate = !assetsOk ? 0 : r <= full ? 100 : r <= p55 ? 55 : r <= p25 ? 25 : 0;
  items.push({ tone: assetsOk ? "good" : "warn", text: `Patrimoine : mobilier ${eur(x.movable || 0)} (plafond ${eur(mob)}), immobilier hors résidence principale ${eur(x.property || 0)} (plafond ${eur(imm)}). ${assetsOk ? "Sous les plafonds." : "Un plafond est dépassé : ni aide totale ni partielle."}`, cite: FR });
  items.push({ tone: rate > 0 ? "good" : "warn", text: `Revenu fiscal de référence ${eur(r)} pour ${n} personne${n > 1 ? "s" : ""} : 100 % jusqu'à ${eur(full)}, 55 % jusqu'à ${eur(p55)}, 25 % jusqu'à ${eur(p25)}.`, cite: FR });
  items.push({ tone: "info", text: "Sans revenu fiscal de référence, on retient le double des revenus imposables des 6 derniers mois après abattement de 10 %.", cite: FR });
  items.push({ tone: "info", text: "Si la procédure vous oppose à un membre du foyer fiscal (divorce par exemple), le patrimoine est examiné individuellement. Les frais ne doivent pas être couverts par une protection juridique ou une assurance.", cite: FR });
  return { asOf: AID_AS_OF, rate, items };
}
