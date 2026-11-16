// 부양가족 기본공제 판정 (2026-11-16). 계산: lib/kr-household-tax-2026.ts(연말정산 공식은 kr-year-end-2026.ts).
import { useMemo } from "react";
import { HOUSEHOLD_TAX_AS_OF, RELATION_LABEL, dependentsTax, type Dependent, type DependentsInput, type Relation } from "../../../lib/kr-household-tax-2026";
import { DEPENDENTS_ASSUMPTIONS, dependentsSaving } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "dependent-deduction-checker";
const EXAMPLE: DependentsInput = {
  salary: 50_000_000,
  married: true,
  people: [
    { relation: "spouse", birthYear: 1990, wage: 4_000_000 },
    { relation: "child", birthYear: 2015 },
    { relation: "parent", birthYear: 1954 },
  ],
};
const short = (r: Relation) => RELATION_LABEL[r].split("(")[0];
const RELATIONS = (Object.keys(RELATION_LABEL) as Relation[]).map((value) => ({ value, label: short(value) }));
const yn = (b: boolean | undefined) => (b ? "yes" : "no");
const STATUS_TONE = { ok: "text-primary", age: "text-destructive", income: "text-destructive", living: "text-destructive", duplicate: "text-muted-foreground" } as const;

export default function DependentsCheck() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<DependentsInput>("household-dependents", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const r = dependentsTax(input);
  const relKey = input.people.map((p) => p.relation).join();
  const assumptions = useMemo(() => DEPENDENTS_ASSUMPTIONS(input), [relKey]);
  const sliders = assumptions.map((a) => a.key);
  const edit = (p: Partial<DependentsInput>) => setInput({ ...input, ...p });
  const editPerson = (i: number, p: Partial<Dependent>) => edit({ people: input.people.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const remove = (i: number) => edit({ people: input.people.filter((_, j) => j !== i) });
  const add = () => edit({ people: [...input.people, { relation: "parent", birthYear: 1960 }] });

  const reasons: string[] = [];
  if (r.eligibleCount > 0) reasons.push(`${r.eligibleCount}명을 올리면 소득공제가 ${roughWon(r.deductionTotal)} 늘어요(1명 기본 150만, 70세 이상·장애인은 추가).`);
  if (r.creditChildren > 0) reasons.push(`자녀세액공제 대상 자녀가 ${r.creditChildren}명이에요(2026년 귀속은 9~20세, 2017년생 제외).`);
  r.verdicts.forEach((v, i) => {
    if (!v.eligible) reasons.push(`${input.people[i].label || short(input.people[i].relation)}: ${v.reason}`);
  });
  if (r.eligibleCount > 0) reasons.push("같은 공제라도 월급이 많아 세율이 높을수록 세금이 더 많이 줄어요.");

  const memo = () =>
    [
      `[부양가족 기본공제 판정] ${r.taxYear}년 귀속, 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      ...input.people.map((p, i) => `- ${p.label || RELATION_LABEL[p.relation]} ${p.birthYear}년생: ${r.verdicts[i].reason}${r.perPerson[i] ? ` (세금 약 ${exactWon(r.perPerson[i])} 감소)` : ""}`),
      `본인 총급여 ${exactWon(input.salary)}, 다른 공제 없이 비교: ${exactWon(r.taxWithout)} → ${exactWon(r.taxWith)} (줄어드는 세금 ${exactWon(r.saving)}, 지방소득세 포함)`,
      "근거: 소득세법 제50조·제51조·제53조·제59조의2.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "내 1년 월급 합계(세전)" : "본인 총급여(비과세 제외)"} value={input.salary} onChange={(v) => edit({ salary: v })} />
          <ChoiceChips legend="배우자가 있나요?" value={yn(input.married)} options={YES_NO} onChange={(v) => edit({ married: v === "yes" })} />
        </div>
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceChips legend="본인이 여성인가요?(부녀자 공제)" value={yn(input.selfFemale)} options={YES_NO} onChange={(v) => edit({ selfFemale: v === "yes" })} />
            <ChoiceChips legend="본인이 장애인인가요?" value={yn(input.selfDisabled)} options={YES_NO} onChange={(v) => edit({ selfDisabled: v === "yes" })} />
          </div>
        )}
        <ol className="space-y-3">
          {input.people.map((p, i) => {
            const v = r.verdicts[i];
            return (
              <li key={i} className="space-y-3 rounded-md border border-border px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-sm font-semibold ${STATUS_TONE[v.status]}`}>
                    {i + 1}. {v.eligible ? "공제 가능" : "공제 안 됨"}
                    {r.perPerson[i] > 0 && <span className="ml-2 font-normal text-muted-foreground">세금 약 {roughWon(r.perPerson[i])} 줄어요</span>}
                  </p>
                  <button type="button" onClick={() => remove(i)} className="min-h-11 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted" aria-label={`${i + 1}번 가족 빼기`}>
                    빼기
                  </button>
                </div>
                <ChoiceChips<Relation> legend="관계" value={p.relation} options={RELATIONS} onChange={(rel) => editPerson(i, { relation: rel })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <NumberField label="태어난 해" value={p.birthYear} onChange={(n) => editPerson(i, { birthYear: Math.round(n) })} suffix="년" />
                  <MoneyField label={easy ? "1년 월급 합계(없으면 0)" : "총급여(근로소득)"} value={p.wage ?? 0} onChange={(n) => editPerson(i, { wage: n })} hint="근로소득만 있으면 500만 원까지 괜찮아요" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceChips legend="장애인인가요?" value={yn(p.disabled)} options={YES_NO} onChange={(x) => editPerson(i, { disabled: x === "yes" })} />
                  {(p.relation === "sibling" || p.relation === "grandchild" || p.relation === "foster") && (
                    <ChoiceChips legend="주민등록상 함께 사나요?" value={p.livingTogether === false ? "no" : "yes"} options={YES_NO} onChange={(x) => editPerson(i, { livingTogether: x === "yes" })} />
                  )}
                </div>
                {!easy && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MoneyField label="근로 외 소득금액(사업·연금·기타·양도)" value={p.otherIncome ?? 0} onChange={(n) => editPerson(i, { otherIncome: n })} hint="분리과세 이자·배당은 빼요" />
                    <ChoiceChips legend="다른 가족이 이미 공제받나요?" value={yn(p.claimedByOther)} options={YES_NO} onChange={(x) => editPerson(i, { claimedByOther: x === "yes" })} />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{v.reason}</p>
              </li>
            );
          })}
        </ol>
        <button type="button" onClick={add} className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">
          + 가족 더하기
        </button>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.eligibleCount === 0 ? "지금 넣은 가족은 기본공제를 받을 수 없어요." : `${r.eligibleCount}명을 올리면 세금이 약 ${roughWon(r.saving)} 줄어요(추정).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "공제 가능 인원", value: `${r.eligibleCount}명` },
            { label: "늘어나는 소득공제", value: money(r.deductionTotal) },
            { label: "줄어드는 세금", value: money(r.saving) },
          ]}
        >
          {r.eligibleCount > 0 && (
            <CompareBars
              title="가족을 올리기 전과 후, 1년 세금"
              caption="다른 공제(카드·보험·의료비 등)는 없다고 보고 차이만 봤어요. 지방소득세를 포함해요."
              items={[
                { label: "가족 없이", value: r.taxWithout },
                { label: "가족 올림", value: r.taxWith, current: true },
              ]}
              format={money}
            />
          )}
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={assumptions}
          evaluate={dependentsSaving}
          sliders={sliders}
          sweeps={sliders}
          yLabel="줄어드는 세금"
          formatY={roughWon}
          noTornado={sliders.length < 2}
          caption={(key) => (key === "depWage" ? "총급여가 500만 원을 넘는 순간 공제가 통째로 사라져요. 그래프의 절벽이 그 지점이에요." : key === "salary" ? "월급이 많아 세율이 높을수록 같은 공제로 세금이 더 많이 줄어요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 올려요"
            items={["회사 연말정산(1~2월) 때 홈택스 간소화 자료에서 부양가족 '자료 제공 동의'를 받아요.", "가족관계증명서가 필요할 수 있어요. 따로 사는 형제자매·손자녀는 주민등록등본으로 동거를 확인해요.", "맞벌이면 한 가족은 한 사람만 공제받아요. 세율이 높은 사람이 받는 게 보통 유리해요."]}
            note="빠뜨렸으면 5년 안에 경정청구로 돌려받을 수 있어요. 이 결과는 추정이에요."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <CopyMemo text={memo} />
            <button type="button" onClick={reset} className="min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
              예시로 되돌리기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
