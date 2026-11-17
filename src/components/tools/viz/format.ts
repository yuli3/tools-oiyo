import type { AssumptionUnit } from "../../../lib/scenario";
import { roughWon } from "../../../lib/scenario";
import { intlOf, money, type VizLang } from "./i18n";

export type AdvisoryMode = "easy" | "expert";

const exactWon = (n: number) => (Number.isFinite(n) ? `${Math.round(n).toLocaleString("ko-KR")}원` : "—");

/** 단위별 표기. 쉬운 모드는 "약 26.4억 원", 전문가 모드는 원 단위까지. */
type Other = Exclude<VizLang, "ko">;
/** 한국어 밖에서 쓰는 단위 꼬리표 */
const SUFFIX: Record<Other, Partial<Record<AssumptionUnit, (n: string) => string>>> = {
  en: { years: (n) => `${n} yr`, months: (n) => `${n} mo`, days: (n) => `${n} d`, hours: (n) => `${n} h`, people: (n) => `${n} ppl`, age: (n) => `age ${n}`, shares: (n) => `${n} sh`, count: (n) => n, reps: (n) => `${n}×`, nights: (n) => `${n} nights`, bpm: (n) => `${n} bpm`, times: (n) => `${n}×` },
  ja: { years: (n) => `${n}年`, months: (n) => `${n}か月`, days: (n) => `${n}日`, hours: (n) => `${n}時間`, people: (n) => `${n}人`, age: (n) => `${n}歳`, shares: (n) => `${n}株`, count: (n) => `${n}件`, reps: (n) => `${n}回`, nights: (n) => `${n}泊`, bpm: (n) => `${n}拍/分` },
  zh: { years: (n) => `${n}年`, months: (n) => `${n}个月`, days: (n) => `${n}天`, hours: (n) => `${n}小时`, people: (n) => `${n}人`, age: (n) => `${n}岁`, shares: (n) => `${n}股`, count: (n) => `${n}套`, reps: (n) => `${n}次`, nights: (n) => `${n}晚`, bpm: (n) => `${n}次/分` },
  fr: { years: (n) => `${n} ans`, months: (n) => `${n} mois`, days: (n) => `${n} j`, hours: (n) => `${n} h`, people: (n) => `${n} pers.`, age: (n) => `${n} ans`, shares: (n) => `${n} actions`, count: (n) => n, reps: (n) => `${n} rép.`, nights: (n) => `${n} nuits`, bpm: (n) => `${n} bpm` },
  es: { years: (n) => `${n} años`, months: (n) => `${n} meses`, days: (n) => `${n} días`, hours: (n) => `${n} h`, people: (n) => `${n} pers.`, age: (n) => `${n} años`, shares: (n) => `${n} acc.`, count: (n) => n, reps: (n) => `${n} rep.`, nights: (n) => `${n} noches`, bpm: (n) => `${n} lpm` },
};

export function formatUnit(unit: AssumptionUnit, v: number, mode: AdvisoryMode = "expert", lang: VizLang = "ko", currency = "KRW"): string {
  if (!Number.isFinite(v)) return "—";
  if (lang !== "ko") {
    if (unit === "won") return money(v, lang, currency, mode === "easy");
    const suffix = SUFFIX[lang][unit];
    if (suffix) return suffix(Math.round(v).toLocaleString(intlOf(lang)));
    if (unit !== "pct" && unit !== "rate") return formatUnit(unit, v, mode).replace(/,/g, lang === "fr" ? "\u202f" : lang === "es" ? "." : ",");
  }
  switch (unit) {
    case "won":
      return mode === "easy" ? roughWon(v) : exactWon(v);
    case "pct":
      return `${Math.round(v * 100)}%`;
    case "rate":
      return `${(v * 100).toFixed(1)}%`;
    case "shares":
      return `${Math.round(v).toLocaleString("ko-KR")}주`;
    case "years":
      return `${Math.round(v)}년`;
    case "months":
      return `${Math.round(v)}개월`;
    case "days":
      return `${Math.round(v)}일`;
    case "hours":
      return `${Math.round(v)}시간`;
    case "count":
      return `${Math.round(v)}채`;
    case "kwh":
      return `${Math.round(v).toLocaleString("ko-KR")}kWh`;
    case "people":
      return `${Math.round(v)}명`;
    case "age":
      return `${Math.round(v)}세`;
    case "kg":
      return `${(Math.round(v * 10) / 10).toLocaleString("ko-KR")}kg`;
    case "cm":
      return `${(Math.round(v * 10) / 10).toLocaleString("ko-KR")}cm`;
    case "kcal":
      return `${Math.round(v).toLocaleString("ko-KR")}kcal`;
    case "g":
      return `${Math.round(v).toLocaleString("ko-KR")}g`;
    case "ml":
      return `${Math.round(v).toLocaleString("ko-KR")}ml`;
    case "mg":
      return `${Math.round(v).toLocaleString("ko-KR")}mg`;
    case "bpm":
      return `${Math.round(v)}회/분`;
    case "reps":
      return `${Math.round(v)}회`;
    case "km":
      return `${Math.round(v).toLocaleString("ko-KR")}km`;
    case "kmpl":
      return `${(Math.round(v * 10) / 10).toLocaleString("ko-KR")}km/L`;
    case "nights":
      return `${Math.round(v)}박`;
    case "amount":
      return (Math.round(v * 100) / 100).toLocaleString("ko-KR");
    case "times":
      return `${(Math.round(v * 10) / 10).toLocaleString("ko-KR")}배`;
  }
}

export { roughWon, exactWon };
