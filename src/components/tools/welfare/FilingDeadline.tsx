// 상속·증여 신고기한 계산 (2026-11-16, Gemini 이전 B 4차). 계산: lib/kr-household-tax-2026.ts filingDeadlines.
import { useState } from "react";
import { HOUSEHOLD_TAX_AS_OF, filingDeadlines, type FilingDeadlineInput } from "../../../lib/kr-household-tax-2026";
import { daysBetween } from "../../../lib/kr-expert-guide-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import CompareBars from "../viz/CompareBars";
import DeadlineChart from "../viz/DeadlineChart";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, YES_NO, useSaved } from "./common";

const TOOL_ID = "inheritance-gift-filing-deadline-calculator";
const EXAMPLE: FilingDeadlineInput = { kind: "inheritance", date: "2026-11-01", abroad: false, tax: 50_000_000 };
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function FilingDeadline() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<FilingDeadlineInput>("household-filing-deadline", EXAMPLE);
  const [late, setLate] = useState(0);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<FilingDeadlineInput>) => setInput({ ...input, ...p });
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(input.date);
  const r = filingDeadlines({ ...input, lateDays: late });
  const today = todayIso();
  const left = daysBetween(today, r.filingDue);
  const name = input.kind === "inheritance" ? "상속세" : "증여세";
  const rows = r.steps.map((s) => ({ id: s.id, label: s.label, due: s.due, daysLeft: daysBetween(today, s.due), cite: s.cite }));

  const reasons: string[] = [
    input.kind === "inheritance"
      ? `상속세는 돌아가신 날이 속한 달의 말일부터 ${input.abroad ? "9" : "6"}개월 안에 신고·납부해요: ${r.filingDue}.`
      : `증여세는 증여받은 날이 속한 달의 말일부터 3개월 안에 신고·납부해요: ${r.filingDue}.`,
    `기한 안에 신고하면 산출세액의 3%(${roughWon(r.credit)})를 빼 줘요.`,
    late > 0
      ? `${late}일 늦으면 3% 공제가 없어지고, 무신고 가산세 20%에서 ${Math.round(r.relief * 100)}% 감면된 ${roughWon(r.noFiling)}, 납부지연 가산세 하루 0.022%로 ${roughWon(r.latePayment)}가 붙어요.`
      : "기한 뒤 1개월 안에 신고하면 무신고 가산세의 50%, 3개월 안 30%, 6개월 안 20%를 깎아 줘요.",
  ];
  if (input.kind === "gift") reasons.push("현금이 아닌 재산은 신고기한 안에 돌려주면 처음부터 증여가 아니고, 그 뒤 3개월 안에 돌려주면 돌려준 몫만 과세하지 않아요.");
  else reasons.push("빚이 더 많으면 상속을 안 날부터 3개월 안에 가정법원에 상속포기·한정승인을 신청해요.");

  const memo = () =>
    [
      `[${name} 신고기한] 기준일 ${HOUSEHOLD_TAX_AS_OF}, ${input.kind === "inheritance" ? "상속개시일" : "증여일"} ${input.date}`,
      ...r.steps.map((s) => `- ${s.label}: ${s.due} (${s.cite})`),
      `산출세액 ${exactWon(input.tax ?? 0)}: 기한 안 ${exactWon(r.onTime)} / ${late}일 늦으면 ${exactWon(r.pay)}`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceChips<"inheritance" | "gift"> legend="무엇을 신고하나요?" value={input.kind} options={[{ value: "inheritance", label: "상속" }, { value: "gift", label: "증여" }]} onChange={(v) => edit({ kind: v })} />
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">{input.kind === "inheritance" ? (easy ? "돌아가신 날" : "상속개시일") : easy ? "받은 날(등기 접수일·입금일)" : "증여일"}</span>
            <input type="date" value={input.date} onChange={(e) => edit({ date: e.target.value })} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base" />
          </label>
          <MoneyField label={easy ? "예상 세금" : "예상 산출세액"} value={input.tax ?? 0} onChange={(v) => edit({ tax: v })} />
          {input.kind === "inheritance" && !easy && <ChoiceChips<"yes" | "no"> legend="돌아가신 분·상속인 모두 해외에 사나요?" value={input.abroad ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ abroad: v === "yes" })} />}
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={valid ? `${name} 신고·납부 기한은 ${r.filingDue}이에요(${left < 0 ? `${-left}일 지났어요` : `D-${left}`}).` : "날짜를 YYYY-MM-DD로 넣어 주세요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "신고기한", value: r.filingDue },
            { label: "기한 안 낼 돈", value: money(r.onTime) },
            { label: `${late}일 늦으면`, value: money(r.pay) },
          ]}
        >
          <CompareBars
            title="기한 안에 낼 때와 늦을 때"
            items={[
              { label: "기한 안(3% 공제)", value: r.onTime, current: late === 0 },
              { label: `${late}일 늦게`, value: r.pay, current: late > 0 },
            ]}
            format={money}
          />
        </ResultCard>
        {valid && <DeadlineChart title="챙길 날짜" caption="오늘부터 남은 날이에요. 슬라이더로 며칠 늦으면 무엇을 놓치고 얼마를 더 내는지 봐요." rows={rows} delay={Math.max(0, left) + late} />}
        <label className="block">
          <span className="text-sm text-muted-foreground">신고기한보다 며칠 늦으면? {late}일</span>
          <input type="range" min={0} max={365} value={late} onChange={(e) => setLate(Number(e.target.value))} className="mt-1 w-full" aria-label="신고기한보다 며칠 늦으면" />
        </label>
        {easy ? (
          <HowToApply
            title="이렇게 챙겨요"
            items={[
              "홈택스에서 직접 신고하거나 세무서에 서면으로 내요. 납부할 돈이 1천만 원을 넘으면 나눠 내거나(분납) 연부연납을 신청할 수 있어요.",
              "부동산이 있으면 시·군·구청 취득세 신고도 같은 기한 안에 따로 해요.",
              "기한을 넘겼다면 하루라도 빨리 기한 후 신고를 해서 가산세 감면을 받아요.",
            ]}
            note="법령 정보이며 세무 자문이 아니에요. 사망신고·상속포기 기한은 사망·상속을 안 날부터 세요."
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
