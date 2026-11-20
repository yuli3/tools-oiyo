// 운전면허 벌점·영업정지 과징금 환산 (2026-11-20, 전수조사 7번). 계산: lib/kr-license-points-2026.ts (법령 길잡이 스킬 guide.mjs calc points·surcharge와 같은 코드)
import { useState } from "react";
import { POINTS_AS_OF, POINTS_NOTE, VIOLATIONS, accidentPoints, licenseStatus, suspensionToSurcharge, violationPoints, type ViolationId } from "../../../lib/kr-license-points-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "license-points-calculator";
type Mode = "points" | "surcharge";
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
type Ev = { date: string; kind: ViolationId | "accident"; school: boolean; serious: number; minor: number; death: number; both: boolean };

export default function LicensePoints() {
  const today = todayIso();
  const [mode, setMode] = useState<Mode>("points");
  const [events, setEvents] = useState<Ev[]>([
    { date: "2026-03-15", kind: "speed40", school: false, serious: 0, minor: 0, death: 0, both: false },
    { date: "2026-10-02", kind: "signal", school: true, serious: 0, minor: 0, death: 0, both: false },
  ]);
  const [edu, setEdu] = useState(false);
  const [mileage, setMileage] = useState(0);
  const [sc, setSc] = useState({ months: 1, days: 0, perDay: 100 });
  const tick = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const pts = (e: Ev) => (e.kind === "accident" ? accidentPoints({ death: e.death, serious: e.serious, minor: e.minor, bothFault: e.both }) : violationPoints(e.kind, e.school));
  const st = licenseStatus(events.map((e) => ({ date: e.date, points: pts(e) })), today, { education: edu, mileage });
  const s = suspensionToSurcharge({ months: sc.months, days: sc.days, perDay: sc.perDay * 10_000 });
  const setEv = (i: number, p: Partial<Ev>) => { setEvents(events.map((e, j) => (j === i ? { ...e, ...p } : e))); tick(); };
  const sel = "min-h-11 w-full rounded-md border border-border bg-background px-2 text-base text-foreground";
  return (
    <div className="space-y-5">
      <ChoiceChips<Mode> legend="무엇을 볼까요?" value={mode} options={[{ value: "points", label: "운전면허 벌점" }, { value: "surcharge", label: "영업정지 ↔ 과징금" }]} onChange={(v) => { setMode(v); tick(); }} />
      {mode === "points" ? (
        <>
          {events.map((e, i) => (
            <div key={i} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
              <DateField label={`${i + 1}번째 위반·사고 날짜`} value={e.date} onChange={(v) => setEv(i, { date: v })} />
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground">무엇이었나요?</span>
                <select value={e.kind} onChange={(ev) => setEv(i, { kind: ev.target.value as Ev["kind"] })} className={`mt-1 ${sel}`}>
                  {VIOLATIONS.map((v) => <option key={v.id} value={v.id}>{v.label} ({v.points}점)</option>)}
                  <option value="accident">교통사고(사람이 다침)</option>
                </select>
              </label>
              {e.kind === "accident" ? (
                <>
                  <NumberField label="사망(72시간 안)" suffix="명" value={e.death} onChange={(v) => setEv(i, { death: Math.max(0, Math.round(v)) })} />
                  <NumberField label="중상(3주 이상)" suffix="명" value={e.serious} onChange={(v) => setEv(i, { serious: Math.max(0, Math.round(v)) })} />
                  <NumberField label="경상(5일~3주)" suffix="명" value={e.minor} onChange={(v) => setEv(i, { minor: Math.max(0, Math.round(v)) })} />
                  <ChoiceChips<"no" | "yes"> legend="쌍방과실인가요?" value={e.both ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예(1/2)" }]} onChange={(v) => setEv(i, { both: v === "yes" })} />
                </>
              ) : (
                VIOLATIONS.find((v) => v.id === e.kind)?.school && <ChoiceChips<"no" | "yes"> legend="어린이보호구역 08~20시였나요?" value={e.school ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예(2배)" }]} onChange={(v) => setEv(i, { school: v === "yes" })} />
              )}
              <p className="text-sm text-foreground">벌점 {pts(e)}점</p>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm" onClick={() => { setEvents([...events, { date: today, kind: "speed20", school: false, serious: 0, minor: 0, death: 0, both: false }]); tick(); }}>위반 추가</button>
            {events.length > 1 && <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm" onClick={() => { setEvents(events.slice(0, -1)); tick(); }}>마지막 빼기</button>}
            <ChoiceChips<"no" | "yes"> legend="벌점 감경교육을 받을 건가요?" value={edu ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => { setEdu(v === "yes"); tick(); }} />
            <div className="w-40"><NumberField label="무위반 서약 달성 횟수" suffix="회" value={mileage} onChange={(v) => { setMileage(Math.max(0, Math.round(v))); tick(); }} /></div>
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
            <p className="text-lg font-semibold text-foreground">
              {st.revoked ? `면허 취소 기준(${st.revokeRule})에 해당해요` : st.suspension ? `면허 정지 약 ${st.suspension.days}일` : `처분벌점 ${st.pending}점 · 정지까지 ${st.toSuspension}점`}
            </p>
            <p className="mt-1 text-foreground">누산점수: 최근 1년 {st.cumulative.y1}점(121점 취소) · 2년 {st.cumulative.y2}점(201점) · 3년 {st.cumulative.y3}점(271점)</p>
            {st.expiresOn && !st.revoked && <p className="mt-1 text-muted-foreground">{st.expiresOn}까지 위반·사고가 없으면 지금 벌점이 사라져요.</p>}
            {st.suspension && <p className="mt-1 text-muted-foreground">{st.suspension.points}점이 쌓인 날 정지가 결정돼요. 1점 = 1일{edu ? ", 교육 20일 감경" : ""}{mileage ? `, 특혜점수 ${mileage * 10}점` : ""}.</p>}
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="영업정지 개월" suffix="개월" value={sc.months} onChange={(v) => { setSc({ ...sc, months: Math.max(0, v) }); tick(); }} />
            <NumberField label="추가 일수" suffix="일" value={sc.days} onChange={(v) => { setSc({ ...sc, days: Math.max(0, Math.round(v)) }); tick(); }} />
            <NumberField label="매출 등급의 1일당 과징금" suffix="만 원" value={sc.perDay} onChange={(v) => { setSc({ ...sc, perDay: Math.max(0, v) }); tick(); }} />
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
            <p className="text-lg font-semibold text-foreground">과징금 약 {Math.round(s.amount).toLocaleString("ko-KR")}원</p>
            <p className="mt-1 text-muted-foreground">영업정지 {s.days}일(1개월 = 30일) × 1일 {sc.perDay.toLocaleString("ko-KR")}만 원{s.capped ? ", 10억 원 한도 적용" : ""}. 1일당 금액은 업종별 법 시행령 별표(예: 식품위생법 시행령 별표 1)에서 전년도 매출액 등급으로 찾아요. 과징금으로 바꿀 수 있는지는 처분청이 정해요.</p>
          </div>
        </>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{POINTS_NOTE} 기준일 {POINTS_AS_OF}. 입력값은 서버로 보내지 않아요. <a className="underline" href="/ko/appeal-deadline-calculator/">행정심판 기한</a></p>
    </div>
  );
}
