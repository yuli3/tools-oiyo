// 법정상속분·유류분 계산 (2026-11-20, 전수조사 4번). 계산: lib/kr-inheritance-share-2026.ts (법령 길잡이 스킬 guide.mjs calc inherit와 같은 코드)
import { useState } from "react";
import { INHERIT_AS_OF, INHERIT_NOTE, reserveShortfall, type Family } from "../../../lib/kr-inheritance-share-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { krwShort } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "inheritance-share-calculator";
const MAN = 10_000;
const man = (n: number) => {
  const m = Math.round(n / MAN);
  const eok = Math.floor(m / 10_000), rest = m % 10_000;
  return eok ? `${eok.toLocaleString("ko-KR")}억${rest ? ` ${rest.toLocaleString("ko-KR")}만` : ""} 원` : `${m.toLocaleString("ko-KR")}만 원`;
};
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export default function InheritanceShare() {
  const [fam, setFam] = useState<Family>({ spouse: true, children: 2, parents: 0, siblings: 0 });
  const [estate, setEstate] = useState(10000);
  const [debts, setDebts] = useState(0);
  const [gifts, setGifts] = useState<Record<string, number>>({ child1: 40000 });
  const [bequests, setBequests] = useState<Record<string, number>>({});
  const [thirdGifts, setThirdGifts] = useState(0);
  const [thirdBequests, setThirdBequests] = useState(0);
  const [death, setDeath] = useState("2026-06-01");
  const tick = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const toWon = (m: Record<string, number>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v * MAN]));
  const calc = (est: number) => reserveShortfall({ family: fam, estate: est * MAN, debts: debts * MAN, gifts: toWon(gifts), bequests: toWon(bequests), thirdGifts: thirdGifts * MAN, thirdBequests: thirdBequests * MAN, death });
  const r = calc(estate);
  const units = r.rows.reduce((s, h) => s + (h.kind === "spouse" ? 3 : 2), 0);
  const frac = (kind: string) => { const nu = kind === "spouse" ? 3 : 2; const g = gcd(nu, units); return `${nu / g}/${units / g}`; };
  const setF = (p: Partial<Family>) => { setFam({ ...fam, ...p }); tick(); };
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{
        title: "남긴 재산에 따라 유류분 부족액이 이렇게 바뀌어요", caption: "생전 증여는 그대로 두고 남긴 재산만 바꿔요. 재산이 늘면 부족액이 줄어요.",
        xLabel: "남긴 재산", yLabel: "유류분 부족 합계", min: 0, max: Math.max(50000, estate * 3), step: 500, current: estate,
        f: (v) => calc(v).totalShortfall,
        formatX: (n: number) => krwShort(n * MAN), formatY: krwShort,
        onPick: (v) => { setEstate(v); tick(); },
      }}
    >
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceChips<"yes" | "no"> legend="배우자가 있나요?" value={fam.spouse ? "yes" : "no"} options={[{ value: "yes", label: "있어요" }, { value: "no", label: "없어요" }]} onChange={(v) => setF({ spouse: v === "yes" })} />
        <NumberField label="살아 있는 자녀 수" suffix="명" value={fam.children} onChange={(v) => setF({ children: Math.max(0, Math.floor(v)) })} />
        {fam.children === 0 && <NumberField label="살아 계신 부모 수" suffix="명" value={fam.parents} onChange={(v) => setF({ parents: Math.min(2, Math.max(0, Math.floor(v))) })} />}
        {fam.children === 0 && fam.parents === 0 && !fam.spouse && <NumberField label="형제자매 수" suffix="명" value={fam.siblings} onChange={(v) => setF({ siblings: Math.max(0, Math.floor(v)) })} />}
        <NumberField label="남긴 재산(유언으로 준 것 포함)" suffix="만 원" value={estate} onChange={(v) => { setEstate(Math.max(0, v)); tick(); }} />
        <NumberField label="남긴 빚" suffix="만 원" value={debts} onChange={(v) => { setDebts(Math.max(0, v)); tick(); }} />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-muted-foreground">상속인별로 미리 받은 것(부양·기여 대가로 받은 것은 빼요)</legend>
        {r.rows.map((h) => (
          <div key={h.id} className="grid gap-2 sm:grid-cols-2">
            <NumberField label={`${h.label} 생전 증여`} suffix="만 원" value={gifts[h.id] ?? 0} onChange={(v) => { setGifts({ ...gifts, [h.id]: Math.max(0, v) }); tick(); }} />
            {mode === "expert" && <NumberField label={`${h.label} 유증`} suffix="만 원" value={bequests[h.id] ?? 0} onChange={(v) => { setBequests({ ...bequests, [h.id]: Math.max(0, v) }); tick(); }} />}
          </div>
        ))}
      </fieldset>
      {mode === "easy" && <p className="text-xs text-muted-foreground">유증·제3자 증여·사망일은 전문가 모드에서 넣어요.</p>}
      {mode === "expert" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="상속인 아닌 사람에게 1년 안에 한 증여" suffix="만 원" value={thirdGifts} onChange={(v) => { setThirdGifts(Math.max(0, v)); tick(); }} />
          <NumberField label="상속인 아닌 사람에게 한 유증" suffix="만 원" value={thirdBequests} onChange={(v) => { setThirdBequests(Math.max(0, v)); tick(); }} />
          <DateField label="돌아가신 날" value={death} onChange={(v) => { setDeath(v); tick(); }} />
        </div>
      )}
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        {r.rows.length === 0 ? (
          <p className="text-foreground">이 가족 구성으로는 4촌 이내 방계혈족이 상속하거나, 없으면 국가에 귀속돼요(민법 제1000조·제1058조).</p>
        ) : (
          <>
            <p className="text-lg font-semibold text-foreground">{r.totalShortfall > 0 ? `유류분 부족 합계 ${man(r.totalShortfall)}` : "유류분 부족이 없어요"}</p>
            <p className="mt-1 text-muted-foreground">유류분 기초재산 {man(r.basis)}</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="text-muted-foreground"><th className="py-1 pr-2 font-medium">상속인</th><th className="pr-2 font-medium">법정상속분</th><th className="pr-2 font-medium">유류분</th><th className="pr-2 font-medium">받는 것</th><th className="font-medium">부족</th></tr></thead>
                <tbody>
                  {r.rows.map((h) => (
                    <tr key={h.id} className="border-t border-border text-foreground">
                      <td className="py-1 pr-2">{h.label}</td>
                      <td className="pr-2">{frac(h.kind)}</td>
                      <td className="pr-2">{h.reserveRatio ? man(h.reserve) : "없음"}</td>
                      <td className="pr-2">{man(h.received)}</td>
                      <td>{h.shortfall ? man(h.shortfall) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {r.totalShortfall > 0 && <p className="mt-2 text-muted-foreground">반환 청구는 {r.deadline.knowRule}{r.deadline.tenYear ? `, 늦어도 ${r.deadline.tenYear}까지` : ""} 해야 해요. {r.returnRule}</p>}
          </>
        )}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{INHERIT_NOTE} 남은 재산은 법정상속분대로 나눈다고 봤어요. 기준일 {INHERIT_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </>
      )}
    </CurveShell>
  );
}
