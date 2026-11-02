import { useState } from "react";
import {
  compareGenerations,
  GENERATION_LABEL,
  GENERATIONS,
  type Care,
  type Generation,
  type Tier,
} from "../../lib/kr-silson-generations";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const MAX = 100_000_000;

export default function SilsonGenerationCalculator() {
  const [mine, setMine] = useState<Generation>("g4");
  const [care, setCare] = useState<Care>("outpatient");
  const [tier, setTier] = useState<Tier>("clinic");
  const [covered, setCovered] = useState(20_000);
  const [nonCovered, setNonCovered] = useState(30_000);
  const [riderItems, setRiderItems] = useState(0);
  const [severe, setSevere] = useState<"no" | "yes">("no");

  const ok = [covered, nonCovered, riderItems].every((v) => Number.isFinite(v) && v >= 0 && v <= MAX);
  const results = ok
    ? compareGenerations({ care, tier, covered, nonCovered, riderItems, severe: severe === "yes" })
    : null;
  const me = results?.find((r) => r.generation === mine) ?? null;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <ChoiceChips
          legend="내 실손보험 세대 (가입 시기)"
          value={mine}
          onChange={setMine}
          options={GENERATIONS.map((g) => ({ value: g, label: GENERATION_LABEL[g] }))}
        />
        <ChoiceChips
          legend="진료 형태"
          value={care}
          onChange={setCare}
          options={[
            { value: "outpatient", label: "통원 (외래)" },
            { value: "inpatient", label: "입원" },
          ]}
        />
        {care === "outpatient" && (
          <ChoiceChips
            legend="병원 종류"
            value={tier}
            onChange={setTier}
            options={[
              { value: "clinic", label: "의원" },
              { value: "hospital", label: "병원" },
              { value: "general", label: "종합·상급종합병원" },
            ]}
          />
        )}
        <NumberField label="급여 본인부담금 (영수증 '급여 - 본인부담금')" value={covered} onChange={setCovered} suffix="원" step={1_000} />
        <NumberField label="비급여 (아래 3가지 제외)" value={nonCovered} onChange={setNonCovered} suffix="원" step={1_000} />
        <NumberField label="도수치료·체외충격파·증식치료, 비급여 주사, 비급여 MRI" value={riderItems} onChange={setRiderItems} suffix="원" step={1_000} />
        <ChoiceChips
          legend="5세대: 비급여가 중증 질환(산정특례 대상) 치료인가요?"
          value={severe}
          onChange={setSevere}
          options={[
            { value: "no", label: "아니요 (비중증)" },
            { value: "yes", label: "예 (중증)" },
          ]}
        />
      </div>

      <div aria-live="polite">
        {results === null || me === null ? (
          <p className="text-sm text-muted-foreground">금액은 0원 이상, 1억 원 이하로 넣어 주세요.</p>
        ) : (
          <div className="rounded-lg border border-border bg-card px-5 py-5">
            <p className="text-sm text-muted-foreground">{GENERATION_LABEL[mine]} 예상 보험금</p>
            <p className="mt-1 font-mono text-3xl font-bold text-foreground">{won(me.payout)}</p>
            <ResultSteps
              steps={[
                ...me.lines.map((l) => `${l.label} ${won(l.base)} − 공제 ${won(l.deductible)} (${l.rule})`),
                `보험금 = 청구 대상 ${won(me.claimed)} − 공제 합계 ${won(me.deductible)} = ${won(me.payout)}`,
                "보장 한도, 연간 자기부담 상한, 통원 횟수 한도와 약국 처방 공제는 넣지 않았어요.",
              ]}
              next={[
                { href: "/ko/copay-cap-refund-calculator/", label: "본인부담상한제 환급 계산" },
                { href: "/ko/medical-expense-tax-credit-calculator/", label: "의료비 세액공제 계산" },
              ]}
            />
          </div>
        )}
      </div>

      {results && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-foreground">같은 영수증, 세대별 보험금</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">세대</th>
                  <th className="py-2 pr-3 font-medium">공제</th>
                  <th className="py-2 font-medium">보험금</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.generation} className={r.generation === mine ? "bg-muted font-semibold text-foreground" : "text-foreground"}>
                    <td className="py-2 pr-3">{GENERATION_LABEL[r.generation].split(" ")[0]}</td>
                    <td className="py-2 pr-3 font-mono">{won(r.deductible)}</td>
                    <td className="py-2 font-mono">{won(r.payout)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            1세대(2009.9 이전)·2세대(2009.10~2017.3)는 상품과 시기마다 공제가 달라 넣지 않았어요. 가입한 보험사 약관을 확인하세요. 3세대 선택형은 원문끼리 맞지 않아 표준형만 계산해요.
          </p>
        </div>
      )}
    </div>
  );
}
