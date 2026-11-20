// 결혼 예산 다른 언어 판(en·ja·zh·fr·es) (2026-11-20). 한국어는 WeddingPlanningScenario. 계산: lib/life-scenarios.ts weddingResult.
// 금액은 언어별 통화(WL_CURRENCY), 예시는 그 나라 흔한 규모로 잡았어요(시세 아님).
import { useMemo } from "react";
import { weddingBalance, weddingResult, type WeddingLite } from "../../../lib/life-scenarios";
import type { Assumption, TornadoBar } from "../../../lib/scenario";
import { cash, driverOf, num, WL_CURRENCY, type WL } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import BridgeChart from "../viz/BridgeChart";
import ScenarioLite from "../viz/ScenarioLite";

const KEYS = ["guests", "gift", "meal", "venue", "sdm", "honeymoon"] as const;
type Key = (typeof KEYS)[number];

const EXAMPLE: Record<WL, WeddingLite> = {
  en: { guests: 120, gift: 150, meal: 90, venue: 8000, sdm: 5000, honeymoon: 6000 },
  ja: { guests: 70, gift: 30000, meal: 20000, venue: 1000000, sdm: 800000, honeymoon: 600000 },
  zh: { guests: 150, gift: 800, meal: 400, venue: 20000, sdm: 15000, honeymoon: 20000 },
  fr: { guests: 100, gift: 100, meal: 110, venue: 6000, sdm: 4000, honeymoon: 5000 },
  es: { guests: 120, gift: 150, meal: 110, venue: 5000, sdm: 4000, honeymoon: 5000 },
};

const T = {
  en: {
    guests: "Guests", ppl: "people", gift: "Average gift per guest", meal: "Catering per guest", venue: "Venue hire", sdm: "Photo, attire and styling", honeymoon: "Honeymoon",
    plainGuests: "the number of guests", plainGift: "the average gift", plainMeal: "catering per guest", plainSdm: "photo, attire and styling", plainHoney: "the honeymoon",
    result: "money left over", left: "Left over", cost: "Total cost", be: "Break-even guests", none: "None", chart: "Gifts minus costs", gifts: "Gifts", food: "Catering",
    hint: "Count cash gifts, or the cash value of registry gifts you could use for the wedding.",
    caption: "If each gift is larger than catering per guest, more guests means more left over.",
    surplus: (a: string) => `Gifts cover every cost and leave about ${a}.`,
    deficit: (a: string) => `Costs exceed gifts by about ${a}, which comes out of savings.`,
    beLine: (n: string, g: number) => `Above ${n} guests, gifts overtake costs. You have ${g} now.`,
    noBe: "Each gift is smaller than catering per guest, so every extra guest adds to the shortfall.",
    margin: (g: string, m: string, d: string) => `A ${g} gift minus ${m} of catering leaves ${d} per guest. That difference adds up with every guest.`,
    warn: "Gifts are often shared between both families and may be expected back at future weddings. Do not spend the surplus in advance.",
  },
  ja: {
    guests: "招待客", ppl: "人", gift: "1人あたりのご祝儀", meal: "1人あたりの料理・飲物", venue: "会場費", sdm: "写真・衣装・ヘアメイク", honeymoon: "新婚旅行",
    plainGuests: "招待客数", plainGift: "ご祝儀", plainMeal: "料理・飲物", plainSdm: "写真・衣装・ヘアメイク", plainHoney: "新婚旅行",
    result: "残るお金", left: "残るお金", cost: "総費用", be: "損益分岐の人数", none: "なし", chart: "ご祝儀から費用を引くと", gifts: "ご祝儀", food: "料理・飲物",
    hint: "引出物などのお返しは料理・飲物に含めて考えると近くなります。",
    caption: "ご祝儀が1人あたりの料理代より多ければ、招待客が増えるほど残るお金が増えます。",
    surplus: (a: string) => `ご祝儀で費用をすべてまかなって、約${a}残ります。`,
    deficit: (a: string) => `費用がご祝儀より約${a}多く、その分は貯金から出ます。`,
    beLine: (n: string, g: number) => `招待客が${n}人を超えるとご祝儀が費用を上回ります。いまは${g}人です。`,
    noBe: "ご祝儀が1人あたりの料理代より少ないので、招待客が増えるほど不足が大きくなります。",
    margin: (g: string, m: string, d: string) => `ご祝儀${g}から料理代${m}を引くと、1人あたり${d}残ります。この差が人数分たまります。`,
    warn: "ご祝儀は両家で分けることが多く、いずれお返しするお金です。残る分を先に使わないでください。",
  },
  zh: {
    guests: "宾客", ppl: "人", gift: "人均礼金", meal: "每人餐费", venue: "场地费", sdm: "婚纱照、礼服与化妆", honeymoon: "蜜月",
    plainGuests: "宾客人数", plainGift: "礼金", plainMeal: "餐费", plainSdm: "婚纱照、礼服与化妆", plainHoney: "蜜月",
    result: "结余", left: "结余", cost: "总花费", be: "保本人数", none: "无", chart: "礼金减去各项花费", gifts: "礼金", food: "餐费",
    hint: "按桌计价时，用每桌价格除以每桌人数。",
    caption: "人均礼金高于每人餐费时，宾客越多结余越多。",
    surplus: (a: string) => `礼金付清全部花费后还剩约${a}。`,
    deficit: (a: string) => `花费比礼金多约${a}，这部分要从积蓄中支出。`,
    beLine: (n: string, g: number) => `宾客超过${n}人时，礼金开始超过花费。现在是${g}人。`,
    noBe: "人均礼金低于每人餐费，宾客越多缺口越大。",
    margin: (g: string, m: string, d: string) => `礼金${g}减去餐费${m}，每位宾客结余${d}，这个差额随人数累积。`,
    warn: "礼金常由双方家庭分配，以后也要随礼回去。不要提前花掉结余。",
  },
  fr: {
    guests: "Invités", ppl: "pers.", gift: "Cadeau moyen par invité", meal: "Traiteur par invité", venue: "Location de salle", sdm: "Photo, tenues et beauté", honeymoon: "Voyage de noces",
    plainGuests: "le nombre d'invités", plainGift: "le cadeau moyen", plainMeal: "le traiteur par invité", plainSdm: "photo, tenues et beauté", plainHoney: "le voyage de noces",
    result: "le reste", left: "Reste", cost: "Coût total", be: "Invités pour l'équilibre", none: "Aucun", chart: "Cadeaux moins les coûts", gifts: "Cadeaux", food: "Traiteur",
    hint: "Comptez l'argent reçu (cagnotte, urne) ou la valeur des cadeaux utilisables pour le mariage.",
    caption: "Si le cadeau moyen dépasse le traiteur par invité, plus d'invités laisse plus d'argent.",
    surplus: (a: string) => `Les cadeaux couvrent tous les coûts et il reste environ ${a}.`,
    deficit: (a: string) => `Les coûts dépassent les cadeaux d'environ ${a}, à prendre sur l'épargne.`,
    beLine: (n: string, g: number) => `Au-delà de ${n} invités, les cadeaux dépassent les coûts. Vous en avez ${g}.`,
    noBe: "Le cadeau moyen est inférieur au traiteur par invité : chaque invité de plus creuse le déficit.",
    margin: (g: string, m: string, d: string) => `Un cadeau de ${g} moins ${m} de traiteur laisse ${d} par invité, qui s'additionne à chaque invité.`,
    warn: "Les cadeaux sont souvent partagés entre les deux familles. Ne dépensez pas le reste à l'avance.",
  },
  es: {
    guests: "Invitados", ppl: "pers.", gift: "Regalo medio por invitado", meal: "Cubierto por invitado", venue: "Alquiler del espacio", sdm: "Fotografía, vestuario y maquillaje", honeymoon: "Luna de miel",
    plainGuests: "el número de invitados", plainGift: "el regalo medio", plainMeal: "el cubierto", plainSdm: "fotografía, vestuario y maquillaje", plainHoney: "la luna de miel",
    result: "lo que sobra", left: "Sobra", cost: "Coste total", be: "Invitados para cubrir", none: "Ninguno", chart: "Regalos menos los costes", gifts: "Regalos", food: "Cubiertos",
    hint: "En España es habitual regalar dinero que cubra al menos el cubierto.",
    caption: "Si el regalo medio supera el cubierto, cada invitado más deja más dinero.",
    surplus: (a: string) => `Los regalos cubren todos los costes y sobran unos ${a}.`,
    deficit: (a: string) => `Los costes superan los regalos en unos ${a}, que salen de los ahorros.`,
    beLine: (n: string, g: number) => `Con más de ${n} invitados, los regalos superan los costes. Ahora hay ${g}.`,
    noBe: "El regalo medio es menor que el cubierto, así que cada invitado más aumenta el déficit.",
    margin: (g: string, m: string, d: string) => `Un regalo de ${g} menos ${m} de cubierto deja ${d} por invitado, que se acumula con cada uno.`,
    warn: "Los regalos suelen repartirse entre las dos familias. No gastes el sobrante por adelantado.",
  },
};

export default function WeddingWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const ex = EXAMPLE[lang];
  const a = (n: number) => cash(n, lang, cur);
  const signed = (n: number) => `${n < 0 ? "−" : ""}${a(Math.abs(n))}`;
  const assumptions = useMemo<Assumption<WeddingLite>[]>(() => {
    const m = (key: "gift" | "meal" | "sdm" | "honeymoon", label: string, plain: string, range: (v: number) => [number, number]): Assumption<WeddingLite> => ({
      key, label, plain, unit: "won", kind: "assumption", get: (i) => i[key], set: (i, v) => ({ ...i, [key]: Math.max(0, v) }), range,
    });
    return [
      { key: "guests", label: t.guests, plain: t.plainGuests, unit: "people", kind: "assumption", get: (i) => i.guests, set: (i, v) => ({ ...i, guests: Math.max(0, Math.round(v)) }), range: (v) => [Math.max(20, v * 0.5), Math.max(v * 1.6, 21)] },
      m("gift", t.gift, t.plainGift, () => [ex.gift * 0.4, ex.gift * 2]),
      m("meal", t.meal, t.plainMeal, () => [ex.meal * 0.5, ex.meal * 2]),
      m("sdm", t.sdm, t.plainSdm, (v) => [v * 0.5, Math.max(v * 2, 1)]),
      m("honeymoon", t.honeymoon, t.plainHoney, (v) => [v * 0.3, Math.max(v * 2, 1)]),
    ];
  }, [t, ex]);
  const summary = useMemo(
    () => (i: WeddingLite, top?: TornadoBar) => {
      const r = weddingResult(i);
      return {
        headline: r.balance >= 0 ? t.surplus(a(r.balance)) : t.deficit(a(-r.balance)),
        driver: driverOf(lang, top, t.result, a),
        reasons: [Number.isFinite(r.breakEven) ? t.beLine(num(r.breakEven, lang, 0), i.guests) : t.noBe, t.margin(a(i.gift), a(i.meal), signed(i.gift - i.meal)), t.warn],
      };
    },
    [lang],
  );
  return (
    <ScenarioLite<WeddingLite, Key>
      lang={lang}
      currency={cur}
      toolId="wedding-planning-calculator"
      example={ex}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={weddingBalance}
      resultName={t.result}
      formatResult={signed}
      inputs={(input, edit) => (
        <div className="space-y-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label={t.guests} value={input.guests} onChange={(v) => edit({ guests: v }, ["guests"])} suffix={t.ppl} step={10} min={0} />
            <NumberField label={t.gift} value={input.gift} onChange={(v) => edit({ gift: v }, ["gift"])} suffix={cur} step={ex.gift / 10} />
            <NumberField label={t.meal} value={input.meal} onChange={(v) => edit({ meal: v }, ["meal"])} suffix={cur} step={ex.meal / 10} />
            <NumberField label={t.venue} value={input.venue} onChange={(v) => edit({ venue: v }, ["venue"])} suffix={cur} step={ex.venue / 10} />
            <NumberField label={t.sdm} value={input.sdm} onChange={(v) => edit({ sdm: v }, ["sdm"])} suffix={cur} step={ex.sdm / 10} />
            <NumberField label={t.honeymoon} value={input.honeymoon} onChange={(v) => edit({ honeymoon: v }, ["honeymoon"])} suffix={cur} step={ex.honeymoon / 10} />
          </div>
          <p className="text-xs text-muted-foreground">{t.hint}</p>
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = weddingResult(i);
        return [
          { label: t.left, value: signed(r.balance), tone: "primary" },
          { label: t.cost, value: a(r.cost) },
          { label: t.be, value: Number.isFinite(r.breakEven) ? `${num(r.breakEven, lang, 0)} ${t.ppl}` : t.none },
        ];
      }}
      sliders={["guests", "gift", "meal", "honeymoon"]}
      sweepCaption={(x) => (x.key === "guests" ? t.caption : undefined)}
      charts={(i) => {
        const r = weddingResult(i);
        return (
          <BridgeChart
            title={t.chart}
            steps={[
              { label: t.gifts, value: r.gifts, kind: "total" },
              { label: t.food, value: -r.food, kind: "add" },
              { label: t.venue, value: -i.venue, kind: "add" },
              { label: t.sdm, value: -i.sdm, kind: "add" },
              { label: t.honeymoon, value: -i.honeymoon, kind: "add" },
              { label: t.left, value: r.balance, kind: "total" },
            ]}
            format={a}
          />
        );
      }}
    />
  );
}
