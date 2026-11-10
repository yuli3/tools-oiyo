import { useState } from "react";
import {
  AGE_LABEL,
  findBenefits,
  GROUP_LABEL,
  STAGE_LABEL,
  type AgeBand,
  type Answer,
  type ChildStage,
  type FinderResult,
  type Group,
} from "../../lib/kr-benefits-2026";
import ChoiceChips from "./payroll/ChoiceChips";

const YES_NO = [
  { value: "yes", label: "예" },
  { value: "no", label: "아니요" },
  { value: "unknown", label: "모름" },
] as const;

const HUB: Record<Group, { href: string; label: string }> = {
  senior: { href: "https://blog.oiyo.net/ko/magazine-senior-benefits-65-roundup/", label: "65세 이상 혜택 30가지 글 보기" },
  child: { href: "https://blog.oiyo.net/ko/magazine-pregnancy-to-elementary-benefits-roundup/", label: "임신~초등 지원금 총정리 글 보기" },
  newlywed: { href: "https://blog.oiyo.net/ko/magazine-newlywed-benefits-roundup/", label: "결혼·신혼부부 혜택 총정리 글 보기" },
};

function ResultCard({ r }: { r: FinderResult }) {
  const b = r.benefit;
  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-foreground">{b.name}</p>
        <span className="text-xs text-muted-foreground">{b.category}</span>
      </div>
      <p className="mt-1 text-sm text-foreground">{b.amount}</p>
      <p className="mt-1 text-sm text-muted-foreground">대상: {b.who}</p>
      <p className="mt-1 text-sm text-muted-foreground">신청: {b.apply}</p>
      {r.unknown.length > 0 && <p className="mt-2 text-sm text-foreground">확인할 조건: {r.unknown.join(", ")}</p>}
      {b.note2027 && <p className="mt-2 text-sm text-muted-foreground">2027년: {b.note2027} (국회 의결 전)</p>}
      {b.source === "press" && <p className="mt-1 text-xs text-muted-foreground">언론·세법 안내 기준이라 신청 전 기관에 한 번 더 확인하세요.</p>}
    </li>
  );
}

export default function BenefitFinder() {
  const [group, setGroup] = useState<Group>("senior");
  const [age, setAge] = useState<AgeBand>("65-69");
  const [stage, setStage] = useState<ChildStage>("pregnant");
  const [basicPension, setBasicPension] = useState<Answer>("unknown");
  const [lowIncome, setLowIncome] = useState<Answer>("unknown");
  const [alone, setAlone] = useState<Answer>("unknown");
  const [employed, setEmployed] = useState<Answer>("unknown");
  const [noHome, setNoHome] = useState<Answer>("unknown");
  const [registered2026, setRegistered2026] = useState<Answer>("unknown");
  const [hasBaby, setHasBaby] = useState<Answer>("unknown");

  const results = findBenefits({ group, age, stage, basicPension, lowIncome, alone, employed, noHome, registered2026, hasBaby });
  const matches = results.filter((r) => r.fit === "match");
  const checks = results.filter((r) => r.fit === "check");

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <ChoiceChips
          legend="누구의 혜택을 찾을까요?"
          value={group}
          onChange={setGroup}
          options={(Object.keys(GROUP_LABEL) as Group[]).map((g) => ({ value: g, label: GROUP_LABEL[g] }))}
        />
        {group === "senior" && (
          <>
            <ChoiceChips legend="나이" value={age} onChange={setAge} options={(Object.keys(AGE_LABEL) as AgeBand[]).map((a) => ({ value: a, label: AGE_LABEL[a] }))} />
            <ChoiceChips legend="기초연금을 받고 있나요?" value={basicPension} onChange={setBasicPension} options={YES_NO} />
            <ChoiceChips legend="기초생활수급자나 차상위계층인가요?" value={lowIncome} onChange={setLowIncome} options={YES_NO} />
            <ChoiceChips legend="혼자 사시나요?" value={alone} onChange={setAlone} options={YES_NO} />
          </>
        )}
        {group === "child" && (
          <>
            <ChoiceChips legend="지금 시기" value={stage} onChange={setStage} options={(Object.keys(STAGE_LABEL) as ChildStage[]).map((s) => ({ value: s, label: STAGE_LABEL[s] }))} />
            <ChoiceChips legend="부모 중 고용보험에 가입한 직장인이 있나요?" value={employed} onChange={setEmployed} options={YES_NO} />
            <ChoiceChips legend="기초생활수급·차상위·한부모 가구인가요?" value={lowIncome} onChange={setLowIncome} options={YES_NO} />
          </>
        )}
        {group === "newlywed" && (
          <>
            <ChoiceChips legend="무주택인가요?" value={noHome} onChange={setNoHome} options={YES_NO} />
            <ChoiceChips legend="2024~2026년에 혼인신고를 했거나 올해 안에 할 예정인가요?" value={registered2026} onChange={setRegistered2026} options={YES_NO} />
            <ChoiceChips legend="2023년 이후 태어난 아이가 있나요?" value={hasBaby} onChange={setHasBaby} options={YES_NO} />
          </>
        )}
      </div>

      <div aria-live="polite" className="space-y-5">
        <p className="text-sm text-muted-foreground">
          해당 {matches.length}개, 조건 확인 {checks.length}개
        </p>
        {matches.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground">받을 수 있어요</h2>
            <ul className="mt-3 space-y-3">
              {matches.map((r) => (
                <ResultCard key={r.benefit.id} r={r} />
              ))}
            </ul>
          </section>
        )}
        {checks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground">조건을 확인해 보세요</h2>
            <p className="mt-1 text-sm text-muted-foreground">위에서 "모름"을 고른 조건이 맞으면 받을 수 있어요.</p>
            <ul className="mt-3 space-y-3">
              {checks.map((r) => (
                <ResultCard key={r.benefit.id} r={r} />
              ))}
            </ul>
          </section>
        )}
        <a href={HUB[group].href} className="inline-flex min-h-11 items-center rounded-full border border-border bg-background px-3 text-sm text-foreground hover:bg-muted">
          {HUB[group].label}
        </a>
      </div>
    </div>
  );
}
