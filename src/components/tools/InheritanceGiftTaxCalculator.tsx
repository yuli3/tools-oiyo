// 상속세·증여세 (2026-11-16 쉬운 설명·가정 변화 적용). 두 페이지(상속·증여)가 같이 쓰고, 각자 자기 탭으로 열려요.
// 세율·공제 숫자: lib/kr-payroll-2026.ts(INHERITANCE_GIFT_2026), 계산·가정·문장: lib/kr-tax-scenarios.ts.
import { useState } from "react";
import {
  GIFT_ASSUMPTIONS,
  GIFT_RELATIONS,
  giftBridge,
  giftMarks,
  giftPlain,
  giftTax,
  giftTotal,
  INHERITANCE_ASSUMPTIONS,
  inheritanceBridge,
  inheritancePlain,
  inheritanceTax,
  inheritanceTotal,
  type GiftInput,
  type GiftRelation,
  type InheritanceInput,
} from "../../lib/kr-tax-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

type Mode = "inheritance" | "gift";
const YN = [
  { value: "y", label: "있어요" },
  { value: "n", label: "없어요" },
] as const;

const I_KEYS = ["estate", "debts", "funeral", "spouse", "spouseAmount", "financial"] as const;
type IKey = (typeof I_KEYS)[number];
const I_EXAMPLE: InheritanceInput = { estate: 1_200_000_000, debts: 100_000_000, funeral: 10_000_000, spouse: true, spouseAmount: 500_000_000, financial: 200_000_000 };

function Inheritance() {
  return (
    <ScenarioTool<InheritanceInput, IKey>
      toolId="inheritance-tax-calculator"
      example={I_EXAMPLE}
      assumptions={INHERITANCE_ASSUMPTIONS}
      keys={I_KEYS}
      evaluate={inheritanceTotal}
      resultName="상속세"
      questions={({ input, edit }) => [
        {
          title: "돌아가신 분이 남긴 재산은 모두 얼마인가요?",
          keys: ["estate"],
          body: (
            <>
              <MoneyField label="집·땅·예금·주식 등 모두" value={input.estate} onChange={(v) => edit({ estate: v }, ["estate"])} />
              <p className="mt-2 text-xs text-muted-foreground">아파트는 시세, 땅은 공시지가로 보는 경우가 많아요. 10년 안에 미리 준 재산이 있으면 더해 주세요.</p>
            </>
          ),
        },
        {
          title: "남은 빚과 장례비는 얼마인가요?",
          keys: ["debts", "funeral"],
          body: (
            <div className="space-y-3">
              <MoneyField label="대출·카드값·내지 않은 세금" value={input.debts} onChange={(v) => edit({ debts: v }, ["debts"])} />
              <MoneyField label="장례비(영수증 없어도 500만 원은 빼 줘요)" value={input.funeral} onChange={(v) => edit({ funeral: v }, ["funeral"])} />
            </div>
          ),
        },
        {
          title: "배우자가 있나요? 얼마를 받나요?",
          keys: ["spouse", "spouseAmount"],
          body: (
            <div className="space-y-3">
              <ChoiceChips legend="돌아가신 분의 배우자" value={input.spouse ? "y" : "n"} options={YN} onChange={(v) => edit({ spouse: v === "y" }, ["spouse"])} />
              {input.spouse && <MoneyField label="배우자가 실제로 받는 몫" value={input.spouseAmount} onChange={(v) => edit({ spouseAmount: v }, ["spouseAmount"])} />}
            </div>
          ),
        },
        {
          title: "그중 예금·주식 같은 금융재산은요?",
          keys: ["financial"],
          body: <MoneyField label="예금·적금·주식(금융 빚은 뺀 금액)" value={input.financial} onChange={(v) => edit({ financial: v }, ["financial"])} />,
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField label="총 상속재산가액" value={input.estate} onChange={(v) => edit({ estate: v }, ["estate"])} />
            <MoneyField label="채무·공과금" value={input.debts} onChange={(v) => edit({ debts: v }, ["debts"])} />
            <MoneyField label="장례비용" value={input.funeral} onChange={(v) => edit({ funeral: v }, ["funeral"])} />
          </div>
          <ChoiceChips legend="배우자" value={input.spouse ? "y" : "n"} options={YN} onChange={(v) => edit({ spouse: v === "y" }, ["spouse"])} />
          <div className="grid gap-3 sm:grid-cols-2">
            {input.spouse && <MoneyField label="배우자 실제 상속액" value={input.spouseAmount} onChange={(v) => edit({ spouseAmount: v }, ["spouseAmount"])} />}
            <MoneyField label="순금융재산" value={input.financial} onChange={(v) => edit({ financial: v }, ["financial"])} />
          </div>
        </div>
      )}
      summary={inheritancePlain}
      metrics={(i, s) => {
        const r = inheritanceTax(i);
        return [
          { label: "낼 상속세", value: s.money(r.total), tone: "primary" },
          { label: "공제 합계", value: s.money(r.deductions) },
          { label: "순 상속재산 대비", value: `${(r.rate * 100).toFixed(1)}%` },
        ];
      }}
      sliders={["estate", "debts", "spouseAmount", "financial"]}
      sweeps={["estate", "spouseAmount", "debts", "financial"]}
      sweepCaption={(a) =>
        a.key === "spouseAmount"
          ? "배우자공제는 받는 몫만큼이지만 최소 5억, 최대 30억이에요(법정상속분 한도는 넣지 않았어요)."
          : a.key === "financial"
            ? "금융재산은 20%를 빼 주는데 2억 원(금융재산 10억 원)에서 멈춰요."
            : undefined
      }
      charts={(i, s) => <BridgeChart title="남긴 재산에서 세금 매기는 금액까지" steps={inheritanceBridge(i)} format={s.money} />}
      ask={[
        "배우자공제는 법정상속분까지만 돼요. 자녀 수에 따라 한도가 달라지니 꼭 확인해 주세요.",
        "같이 산 집(동거주택), 가업·영농 상속공제를 받으면 세금이 크게 줄 수 있어요.",
        "사망한 달 말일부터 6개월 안에 신고해야 해요. 큰 금액이면 나눠 내기(연부연납)도 돼요.",
      ]}
      expertFooter={(i) => {
        const r = inheritanceTax(i);
        return (
          <ResultSteps
            steps={[
              `과세가액 = ${exactWon(i.estate)} − 채무 ${exactWon(i.debts)} − 장례비(시행령 제9조) ${exactWon(r.funeral)} = ${exactWon(r.netEstate)}`,
              `일괄공제(제21조) ${exactWon(r.lumpSum)} + 배우자공제(제19조) ${exactWon(r.spouseDeduction)} + 금융재산공제(제22조) ${exactWon(r.financialDeduction)} = ${exactWon(r.deductions)}`,
              `과세표준 ${exactWon(r.base)} → 산출세액(제26조) ${exactWon(r.raw)}`,
              `신고세액공제(제69조) 3% ${exactWon(r.credit)} → 납부세액 ${exactWon(r.total)}`,
              "자녀와 함께 상속하는 경우를 가정했어요. 법정상속분 한도, 동거주택·가업상속공제, 세대생략 할증은 넣지 않았어요.",
            ]}
            next={[
              { href: "/ko/family-business-inheritance-calculator/", label: "가업상속 계산" },
              { href: "/ko/gift-tax-calculator/", label: "증여세 계산기" },
            ]}
          />
        );
      }}
    />
  );
}


const G_KEYS = ["relation", "amount"] as const;
type GKey = (typeof G_KEYS)[number];
const G_EXAMPLE: GiftInput = { amount: 150_000_000, relation: "marriage_child" };

function Gift() {
  return (
    <ScenarioTool<GiftInput, GKey>
      toolId="gift-tax-calculator"
      example={G_EXAMPLE}
      assumptions={GIFT_ASSUMPTIONS}
      keys={G_KEYS}
      evaluate={giftTotal}
      resultName="증여세"
      marksFor={(key, i) => (key === "amount" ? giftMarks(i.relation) : undefined)}
      questions={({ input, edit }) => [
        {
          title: "누가 누구에게 주나요?",
          keys: ["relation"],
          body: <ChoiceChips<GiftRelation> legend="받는 사람 기준" value={input.relation} options={GIFT_RELATIONS.map((r) => ({ value: r.value, label: r.plain }))} onChange={(v) => edit({ relation: v }, ["relation"])} />,
        },
        {
          title: "얼마를 주나요?",
          keys: ["amount"],
          body: (
            <>
              <MoneyField label="주는 돈(10년 안에 같은 사람에게 받은 것 합쳐서)" value={input.amount} onChange={(v) => edit({ amount: v }, ["amount"])} />
              <p className="mt-2 text-xs text-muted-foreground">부모님 두 분에게 받은 돈은 한 사람에게 받은 것처럼 합쳐요.</p>
            </>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-4">
          <ChoiceChips<GiftRelation> legend="수증자 관계(제53조·제53조의2)" value={input.relation} options={GIFT_RELATIONS.map((r) => ({ value: r.value, label: r.label }))} onChange={(v) => edit({ relation: v }, ["relation"])} />
          <MoneyField label="증여재산가액(10년 합산)" value={input.amount} onChange={(v) => edit({ amount: v }, ["amount"])} />
        </div>
      )}
      summary={(i) => giftPlain(i)}
      metrics={(i, s) => {
        const r = giftTax(i);
        return [
          { label: "낼 증여세", value: s.money(r.total), tone: "primary" },
          { label: "세금 없이 줄 수 있는 돈", value: s.money(r.deduction) },
          { label: "받는 돈 대비", value: `${(r.rate * 100).toFixed(1)}%` },
        ];
      }}
      sliders={["amount"]}
      sweepCaption={() => "점선은 공제가 끝나는 지점과 세율이 20%·30%로 오르는 지점이에요(관계를 바꾸면 같이 움직여요)."}
      charts={(i, s) => <BridgeChart title="주는 돈에서 증여세까지" steps={giftBridge(i)} format={s.money} />}
      ask={[
        "부모님 집에 무상으로 살거나 돈을 싸게 빌려도 증여로 볼 수 있어요.",
        "혼인·출산 공제 1억 원은 혼인신고 전후 2년, 출생 후 2년 안에 받은 것만 돼요(둘 합쳐 평생 1억).",
        "받은 달 말일부터 3개월 안에 신고해야 해요.",
      ]}
      expertFooter={(i) => {
        const r = giftTax(i);
        return (
          <ResultSteps
            steps={[
              `증여재산가액 ${exactWon(r.gross)} − 증여재산공제 ${exactWon(r.deduction)} = 과세표준 ${exactWon(r.base)}`,
              `산출세액(제56조) ${exactWon(r.raw)} − 신고세액공제 3% ${exactWon(r.credit)} = ${exactWon(r.total)}`,
              "세대생략 할증(30%·40%), 부담부증여, 재차증여 기납부세액 공제는 넣지 않았어요.",
            ]}
            next={[
              { href: "/ko/inheritance-tax-calculator/", label: "상속세 계산기" },
              { href: "/ko/acquisition-tax-calculator/", label: "취득세 계산기" },
            ]}
          />
        );
      }}
    />
  );
}

export default function InheritanceGiftTaxCalculator({ initialMode = "inheritance" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  return (
    <div className="space-y-5">
      <div className="flex rounded-md bg-muted p-1" role="tablist" aria-label="계산 종류">
        {(
          [
            ["inheritance", "상속세"],
            ["gift", "증여세"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={"min-h-11 flex-1 rounded-md text-sm font-semibold " + (mode === m ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "inheritance" ? <Inheritance /> : <Gift />}
    </div>
  );
}
