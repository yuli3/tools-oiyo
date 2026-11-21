// F-2-7 점수제 거주 비자 점수 (2026-11-21, 전수조사 남은 빈칸). 계산: lib/kr-f27-points-2026.ts (법령 길잡이 스킬 guide.mjs calc f27과 같은 코드)
import { useState } from "react";
import { F27_AS_OF, F27_NOTE, F27_PASS, f27Points, type Degree, type F27Input, type FineTier } from "../../../lib/kr-f27-points-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "f27-points-calculator";
type Uni = "none" | "bachelor" | "master" | "phd";
const UNI: { value: Uni; label: string }[] = [{ value: "none", label: "없음" }, { value: "bachelor", label: "학사" }, { value: "master", label: "석사" }, { value: "phd", label: "박사" }];
const yn = (v: boolean) => (v ? "yes" : "no") as "yes" | "no";
const YN = [{ value: "no" as const, label: "아니요" }, { value: "yes" as const, label: "예" }];

export default function F27Points() {
  const [x, setX] = useState<F27Input>({ age: 31, degree: "master", stemOrDouble: true, korean: 4, income: 45_000_000, koreanUniDegree: "master", topUniDegree: "none", volunteer: 0, immigration: "none", criminal: "none" });
  const upd = (p: Partial<F27Input>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = f27Points(x);
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{
        title: "연간 소득에 따라 합계 점수가 이렇게 바뀌어요", caption: "다른 항목은 그대로 두고 소득만 바꿔 다시 계산해요. 80점이 합격선이에요.",
        xLabel: "연간 소득", yLabel: "합계 점수", min: 0, max: 12000, step: 100, current: x.income / 10_000,
        f: (v) => f27Points({ ...x, income: v * 10_000 }).total,
        formatX: (n: number) => `${Math.round(n).toLocaleString("ko-KR")}만`, formatY: (n: number) => `${Math.round(n)}점`,
        onPick: (v) => upd({ income: v * 10_000 }),
      }}
    >
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="나이(만)" suffix="세" value={x.age} onChange={(v) => upd({ age: Math.max(0, Math.round(v)) })} />
        <NumberField label="TOPIK 급수 또는 사회통합 단계(높은 것, 0~5)" suffix="" value={x.korean} onChange={(v) => upd({ korean: Math.min(5, Math.max(0, Math.round(v))) })} />
        <NumberField label="연간 소득(소득금액증명)" suffix="만 원" value={x.income / 10_000} onChange={(v) => upd({ income: Math.max(0, v) * 10_000 })} />
      </div>
      <ChoiceChips<Degree> legend="최종 학위" value={x.degree} options={[{ value: "none", label: "없음" }, { value: "associate", label: "전문학사" }, { value: "bachelor", label: "학사" }, { value: "master", label: "석사" }, { value: "phd", label: "박사" }]} onChange={(v) => upd({ degree: v })} />
      <div className="flex flex-wrap gap-3">
        <ChoiceChips<"no" | "yes"> legend="이공계 학위이거나 학위 2개 이상" value={yn(!!x.stemOrDouble)} options={YN} onChange={(v) => upd({ stemOrDouble: v === "yes" })} />
        {mode === "expert" && <ChoiceChips<"no" | "yes"> legend="중앙행정기관 추천" value={yn(!!x.ministryRecommend)} options={YN} onChange={(v) => upd({ ministryRecommend: v === "yes" })} />}
        <ChoiceChips<"no" | "yes"> legend="사회통합프로그램 5단계 이수" value={yn(!!x.kiip5)} options={YN} onChange={(v) => upd({ kiip5: v === "yes" })} />
        {mode === "expert" && <ChoiceChips<"no" | "yes"> legend="한국전 참전국 우수인재" value={yn(!!x.warCountry)} options={YN} onChange={(v) => upd({ warCountry: v === "yes" })} />}
      </div>
      <ChoiceChips<Uni> legend="국내 대학 학위(가점)" value={x.koreanUniDegree ?? "none"} options={UNI} onChange={(v) => upd({ koreanUniDegree: v })} />
      {mode === "expert" && (
        <>
      <ChoiceChips<Uni> legend="세계 우수대학 학위(QS 500·THE 200, 가점)" value={x.topUniDegree ?? "none"} options={UNI} onChange={(v) => upd({ topUniDegree: v })} />
      <ChoiceChips<"0" | "1" | "2" | "3"> legend="국내 사회봉사" value={String(x.volunteer ?? 0) as "0"} options={[{ value: "0", label: "1년 미만" }, { value: "1", label: "1~2년" }, { value: "2", label: "2~3년" }, { value: "3", label: "3년 이상" }]} onChange={(v) => upd({ volunteer: Number(v) as 0 | 1 | 2 | 3 })} />
      <ChoiceChips<FineTier> legend="3년 안 출입국관리법 위반 범칙금·과태료" value={x.immigration ?? "none"} options={[{ value: "none", label: "없음" }, { value: "low", label: "50~100만" }, { value: "mid", label: "100~300만" }, { value: "high", label: "300만 이상·출국명령" }]} onChange={(v) => upd({ immigration: v })} />
      <ChoiceChips<FineTier> legend="형사 벌금(확정 3년 지난 것)" value={x.criminal ?? "none"} options={[{ value: "none", label: "없음" }, { value: "low", label: "200만 미만" }, { value: "mid", label: "200~300만" }, { value: "high", label: "300만 이상" }]} onChange={(v) => upd({ criminal: v })} />
        </>
      )}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{r.total}점 · {r.pass ? `${F27_PASS}점 이상이라 점수 요건을 채워요` : `${r.need}점 더 필요해요`}</p>
        <p className="mt-1 text-foreground">나이 {r.age} + 학력 {r.education} + 한국어 {r.korean} + 소득 {r.income} = {r.base}점, 가점 {r.bonus}점{r.bonusRaw > r.bonus ? `(${r.bonusRaw}점 중 상한 40)` : ""}, 감점 −{r.penalty}점</p>
        {r.gaps.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{r.gaps.map((g) => <li key={g}>{g}</li>)}</ul>}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{F27_NOTE} 기준: 법무부고시 제2025-408호. 기준일 {F27_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </>
      )}
    </CurveShell>
  );
}
