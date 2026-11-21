// 국가장학금 1차 신청 안내·지원금액 (2026-11-21). 계산: lib/kr-scholarship-2027.ts
import { useEffect, useState } from "react";
import { SCHOLARSHIP_AS_OF, SCHOLARSHIP_SCHEDULE, bracketBars, scholarship, type Bracket, type Children } from "../../../lib/kr-scholarship-2027";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { Items, won } from "./Items";

const TOOL_ID = "national-scholarship-apply-calculator";
const man = (n: number) => `${Math.round(n / 10_000).toLocaleString("ko-KR")}만 원`;
const label = (b: Bracket) => (b === "basic" ? "기초·차상위" : `${b}구간`);
const left = (m: number | null) => (m == null ? "" : m < 0 ? "마감됐어요" : m < 60 * 24 ? `${Math.floor(m / 60)}시간 ${m % 60}분 남았어요` : `${Math.floor(m / 60 / 24)}일 남았어요`);
const BRACKETS: Bracket[] = ["basic", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const fmt = (s: string) => s.replace("T", " ");

export default function Scholarship() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [x, setX] = useState({ bracket: 4 as Bracket, children: "none" as Children, student: "enrolled" as "enrolled" | "freshman" | "returning", tuition: 400 });
  const [now, setNow] = useState<string>();
  useEffect(() => setNow(new Date().toISOString()), []);
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = scholarship({ bracket: x.bracket, children: x.children, student: x.student, tuitionPerSemester: x.tuition * 10_000, now });
  const bars = bracketBars(x.children, x.tuition * 20_000).map((b) => ({ label: label(b.bracket), value: b.value, current: b.bracket === x.bracket }));
  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section className="rounded-md border border-border bg-card px-4 py-4 text-sm">
        <p className="font-semibold text-foreground">2027학년도 1학기 1차 신청</p>
        <ul className="mt-2 space-y-1">
          <li><span className="font-mono">{fmt(SCHOLARSHIP_SCHEDULE.applyStart)} ~ {fmt(SCHOLARSHIP_SCHEDULE.applyEnd)}</span> 신청 <span className="text-primary">{r.startsInMinutes != null && r.startsInMinutes > 0 ? `아직 시작 전이에요(${left(r.startsInMinutes).replace(" 남았어요", " 뒤 시작")})` : left(r.applyMinutesLeft)}</span></li>
          <li><span className="font-mono">~ {fmt(SCHOLARSHIP_SCHEDULE.docsEnd)}</span> 서류 제출·가구원 동의 <span className="text-primary">{left(r.docsMinutesLeft)}</span></li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">한국장학재단 홈페이지나 앱에서 신청해요. 상담 1599-2000.</p>
      </section>
      <ChoiceChips<typeof x.student> legend="어떤 학생인가요?" value={x.student} options={[{ value: "enrolled", label: "재학생" }, { value: "freshman", label: "신입생(입학 예정)" }, { value: "returning", label: "복학·편입·재입학" }]} onChange={(v) => upd({ student: v })} />
      <ChoiceChips<string> legend="학자금 지원구간(지난번 산정 결과, 모르면 비슷한 구간)" value={String(x.bracket)} options={BRACKETS.map((b) => ({ value: String(b), label: label(b) }))} onChange={(v) => upd({ bracket: (v === "basic" ? "basic" : Number(v)) as Bracket })} />
      <ChoiceChips<Children> legend="다자녀(자녀 3명 이상) 가구인가요?" value={x.children} options={[{ value: "none", label: "아니요" }, { value: "firstSecond", label: "네, 첫째·둘째" }, { value: "third", label: "네, 셋째 이상" }]} onChange={(v) => upd({ children: v })} />
      {mode === "expert" && <NumberField label="한 학기 등록금" suffix="만 원" value={x.tuition} step={10} onChange={(v) => upd({ tuition: Math.max(0, v) })} />}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          {r.fullTuition ? "등록금 전액 지원 대상이에요" : r.yearly ? `연 ${man(r.yearly)}, 한 학기 약 ${man(r.semester)}` : "I유형 지원 대상이 아니에요"}
        </p>
        <p className="mt-1 text-muted-foreground">2026년 지원금액 기준이에요{mode === "expert" && r.yearly ? `. 등록금 ${man(x.tuition * 10_000)}을 넘지 않아 실제 한 학기 최대 ${won(r.capped)}` : ""}.</p>
        <Items items={mode === "easy" ? r.items.slice(0, 3) : r.items} />
      </div>
      <CompareBars title="학자금 지원구간별 연간 지원금액(2026년 기준)" caption={`같은 다자녀 조건으로 그렸어요. 등록금 전액은 등록금(한 학기 ${man(x.tuition * 10_000)} × 2)으로 표시해요.`} items={bars} format={man} />
      <p className="text-xs leading-5 text-muted-foreground">한국장학재단 공지와 교육부 발표를 정리한 일반 정보예요. 실제 지원 여부와 금액은 재단 심사 결과로 정해져요. 2027년 새 구간(가~마)과 금액이 발표되면 고칠게요. 기준일 {SCHOLARSHIP_AS_OF}.</p>
    </div>
  );
}
