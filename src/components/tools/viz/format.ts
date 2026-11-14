import type { AssumptionUnit } from "../../../lib/scenario";
import { roughWon } from "../../../lib/scenario";

export type AdvisoryMode = "easy" | "expert";

const exactWon = (n: number) => (Number.isFinite(n) ? `${Math.round(n).toLocaleString("ko-KR")}원` : "—");

/** 단위별 표기. 쉬운 모드는 "약 26.4억 원", 전문가 모드는 원 단위까지. */
export function formatUnit(unit: AssumptionUnit, v: number, mode: AdvisoryMode = "expert"): string {
  if (!Number.isFinite(v)) return "—";
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
  }
}

export { roughWon, exactWon };
