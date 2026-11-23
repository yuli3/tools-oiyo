// 근로소득 간이세액표 월 원천징수 계산 (2026-11-23). 계산: lib/kr-payroll-month-2026.ts (별표2 2026.2.27 개정 표 그대로).
import { useState } from "react";
import { simplifiedWithholding } from "../../../lib/kr-payroll-month-2026";
import NumberField from "../payroll/NumberField";
import ChoiceChips from "../payroll/ChoiceChips";
import { track } from "../viz/track";

const TOOL_ID = "simplified-withholding-tax-calculator";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
type R = "80" | "100" | "120";

export default function SimplifiedWithholding() {
  const [pay, setPay] = useState(3_500_000);
  const [family, setFamily] = useState(1);
  const [children, setChildren] = useState(0);
  const [ratio, setRatio] = useState<R>("100");
  const r = simplifiedWithholding({ pay, family, children, ratio: Number(ratio) as 80 | 100 | 120 });
  const mark = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const compare = ([80, 100, 120] as const).map((x) => ({ x, v: simplifiedWithholding({ pay, family, children, ratio: x }).total }));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-3" aria-label="입력">
        <NumberField label="월급여액(비과세·학자금 제외)" value={pay} onChange={(v) => { setPay(v); mark(); }} suffix="원" step={10000} />
        <NumberField label="공제대상가족 수(본인·배우자 포함)" value={family} onChange={(v) => { setFamily(Math.max(1, Math.round(v))); mark(); }} suffix="명" min={1} />
        <NumberField label="그중 8세 이상 20세 이하 자녀" value={children} onChange={(v) => { setChildren(Math.max(0, Math.round(v))); mark(); }} suffix="명" />
        <div className="sm:col-span-3">
          <ChoiceChips<R> legend="원천징수 비율(근로자가 신청한 경우)" value={ratio} options={[{ value: "80", label: "80%" }, { value: "100", label: "100%(기본)" }, { value: "120", label: "120%" }]} onChange={(v) => { setRatio(v); mark(); }} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="결과">
        <div className="rounded-xl border border-primary bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">이번 달 뗄 소득세</p>
          <p className="mt-1 text-2xl font-bold text-primary">{won(r.incomeTax)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">지방소득세(10%)</p>
          <p className="mt-1 text-2xl font-bold">{won(r.localTax)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">합계</p>
          <p className="mt-1 text-2xl font-bold">{won(r.total)}</p>
        </div>
      </section>

      <section className="rounded-xl border p-4 text-sm" aria-labelledby="sw-how">
        <h2 id="sw-how" className="text-base font-semibold">이렇게 나왔어요</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>{r.bracket ? `간이세액표 ${r.bracket.from.toLocaleString("ko-KR")}천원${r.bracket.from === r.bracket.to ? "" : ` 이상 ${r.bracket.to.toLocaleString("ko-KR")}천원 미만`} 구간, 가족 ${family}명 칸: ${won(r.tableTax)}` : r.belowTable ? "표가 시작하는 77만 원보다 적어 세액 0원으로 봤어요(표 아래 구간 문구는 원문 확인 전)" : `1천만 원 초과: 1천만 원 세액 + 원문 산식 = ${won(r.tableTax)}`}</li>
          {r.childReduction > 0 && <li>8~20세 자녀 {children}명 차감 −{won(r.childReduction)} → {won(r.baseTax)}</li>}
          {r.ratio !== 100 && <li>{r.ratio}% 선택 → {won(r.incomeTax)} (10원 미만 버림)</li>}
          <li>지방소득세 = 소득세 × 10% → {won(r.localTax)}</li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          {compare.map((c) => (<span key={c.x} className="rounded-full border px-3 py-1">{c.x}%: {won(c.v)}</span>))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">80%를 고르면 매달 덜 떼고 연말정산 때 덜 돌려받거나 더 내요. 비율은 고른 뒤 그해 끝까지 적용돼요(소득세법 시행령 제194조).</p>
      </section>
    </div>
  );
}
