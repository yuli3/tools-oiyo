// 비상장주식 평가 (2026-11-14 2단계 파일럿): 쉬운 설명/전문가 모드 + 가정 카드 + 그래프.
// 계산: lib/kr-advisory-2026.ts, 가정·문장: lib/kr-advisory-scenarios.ts, 부품: ../viz/.
import { useMemo, useRef, useState } from "react";
import { ADVISORY_AS_OF, valueUnlistedShares, type UnlistedShareInput } from "../../../lib/kr-advisory-2026";
import { UNLISTED_ASSUMPTIONS, unlistedAssumption, unlistedBridge, unlistedPerShare, unlistedPlain } from "../../../lib/kr-advisory-scenarios";
import { sweep, tornado } from "../../../lib/scenario";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import AssumptionSlider, { type ValueTag } from "../viz/AssumptionSlider";
import BridgeChart from "../viz/BridgeChart";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import SweepChart from "../viz/SweepChart";
import Term from "../viz/Term";
import TornadoChart from "../viz/TornadoChart";
import { exactWon, formatUnit, roughWon } from "../viz/format";
import { track } from "../viz/track";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";

const TOOL_ID = "unlisted-share-valuation-calculator";
const EXAMPLE: UnlistedShareInput = {
  sharesOutstanding: 100_000,
  netIncome: [600_000_000, 500_000_000, 400_000_000],
  netAssets: 3_000_000_000,
  goodwill: 0,
  realEstateRatio: 0.2,
  netAssetOnlyReason: false,
  heldShares: 60_000,
  isMajorityHolder: true,
  premiumExempt: true,
};
const ALL_KEYS = ["shares", "held", "y1", "y2", "y3", "netAssets", "goodwill", "realEstateRatio", "netOnly", "majority", "exempt"] as const;
type Key = (typeof ALL_KEYS)[number];
const SLIDERS = ["y1", "y2", "netAssets", "realEstateRatio"] as const;
const SWEEPS = [
  { value: "y1", label: "작년 순이익" },
  { value: "netAssets", label: "재산 − 빚" },
  { value: "realEstateRatio", label: "땅·건물 비율" },
] as const;
type SweepKey = (typeof SWEEPS)[number]["value"];

type YesNo = "no" | "yes";
type YesNoUnknown = YesNo | "unknown";
const YES_NO = [
  { value: "yes", label: "예" },
  { value: "no", label: "아니요" },
] as const satisfies readonly { value: YesNo; label: string }[];
const YES_NO_UNKNOWN = [...YES_NO, { value: "unknown", label: "잘 모르겠어요" }] as const satisfies readonly { value: YesNoUnknown; label: string }[];
const RE_BANDS = [
  { value: "low", label: "절반 미만", ratio: 0.2 },
  { value: "mid", label: "절반 ~ 80%", ratio: 0.6 },
  { value: "high", label: "80% 이상", ratio: 0.85 },
] as const;
type ReBand = (typeof RE_BANDS)[number]["value"];
const bandOf = (r: number): ReBand => (r >= 0.8 ? "high" : r >= 0.5 ? "mid" : "low");

const CLASS_LABEL = { general: "일반법인 (순손익 3 : 순자산 2)", realEstateHeavy: "부동산과다법인 (순손익 2 : 순자산 3)", netAssetOnly: "순자산가치만 평가" } as const;
const ASK_ADVISER = [
  "넣은 이익이 세금 기준으로 다시 맞춘 '순손익액'인지 확인해 주세요. 장부상 순이익과 다를 수 있어요.",
  "회사 땅·건물을 장부값이 아니라 시가로 다시 평가해야 재산 쪽 값이 맞아요.",
  "최근 6개월 안에 이 회사 주식을 사고판 기록이 있으면, 이 계산보다 그 값이 먼저 쓰일 수 있어요.",
];

export default function UnlistedShareValuation() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput] = useState<UnlistedShareInput>(EXAMPLE);
  const [tags, setTags] = useState<Partial<Record<Key, ValueTag>>>(() => Object.fromEntries(ALL_KEYS.map((k) => [k, "example"])));
  const [anchors, setAnchors] = useState<Record<string, number>>(() => anchorOf(EXAMPLE));
  const [sweepKey, setSweepKey] = useState<SweepKey>("y1");
  const [q, setQ] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  /** 직접 넣은 값: 입력을 바꾸고, 표시(예시·가정)를 정하고, 슬라이더 기준점도 옮겨요. */
  const edit = (patch: Partial<UnlistedShareInput>, keys: Key[], tag: ValueTag = null) => {
    const next = { ...input, ...patch };
    setInput(next);
    setTags((t) => ({ ...t, ...Object.fromEntries(keys.map((k) => [k, tag])) }));
    setAnchors(anchorOf(next));
  };
  const keepAsGuess = (keys: Key[]) => setTags((t) => ({ ...t, ...Object.fromEntries(keys.map((k) => [k, "guess"])) }));
  const slide = (key: string, v: number) => {
    setInput((cur) => unlistedAssumption(key).set(cur, v));
    track("advisory_slider", { tool_id: TOOL_ID }, true);
  };
  const setIncome = (idx: 0 | 1 | 2, v: number) => {
    const netIncome = [...input.netIncome] as [number, number, number];
    netIncome[idx] = v;
    edit({ netIncome }, [`y${idx + 1}` as Key]);
  };

  const r = valueUnlistedShares(input);
  const bars = useMemo(() => tornado(input, UNLISTED_ASSUMPTIONS, unlistedPerShare), [input]);
  const sweepA = unlistedAssumption(sweepKey);
  const sweepRange = sweepA.range(anchors[sweepKey]);
  const points = useMemo(() => sweep(input, sweepA, unlistedPerShare, sweepRange, sweepKey === "realEstateRatio" ? 100 : 60), [input, sweepA, sweepRange[0], sweepRange[1], sweepKey]);
  const plain = unlistedPlain(r, bars[0]);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const hasExample = Object.values(tags).includes("example");
  const hasGuess = Object.values(tags).includes("guess");

  const questions = [
    {
      title: "주식은 몇 주인가요?",
      keys: ["shares", "held"] as Key[],
      body: (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="회사 주식 전체(회사가 산 자기 주식은 빼요)" value={input.sharesOutstanding} onChange={(v) => edit({ sharesOutstanding: v }, ["shares"])} suffix="주" step={1000} />
          <NumberField label="그중 값을 알고 싶은 주식" value={input.heldShares} onChange={(v) => edit({ heldShares: v }, ["held"])} suffix="주" step={1000} />
        </div>
      ),
    },
    {
      title: "최근 3년 동안 회사가 한 해에 번 돈(순이익)은 얼마인가요?",
      keys: ["y1", "y2", "y3"] as Key[],
      body: (
        <>
          <p className="text-sm leading-6 text-muted-foreground">
            정확히는 세금 기준으로 맞춘 <Term k="순손익액">순손익액</Term>이 필요해요. 모르면 재무제표의 당기순이익으로 먼저 대강 보세요. 손실이면 "-2억"처럼 써요.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <MoneyField label="작년" value={input.netIncome[0]} onChange={(v) => setIncome(0, v)} allowNegative />
            <MoneyField label="2년 전" value={input.netIncome[1]} onChange={(v) => setIncome(1, v)} allowNegative />
            <MoneyField label="3년 전" value={input.netIncome[2]} onChange={(v) => setIncome(2, v)} allowNegative />
          </div>
        </>
      ),
    },
    {
      title: "회사 재산에서 빚을 빼면 얼마인가요?",
      keys: ["netAssets", "realEstateRatio"] as Key[],
      body: (
        <>
          <p className="text-sm leading-6 text-muted-foreground">
            땅·건물은 장부값보다 지금 팔면 받을 값(시가)으로 보는 게 맞아요. 이 금액이 <Term k="순자산가액">순자산가액</Term>이에요.
          </p>
          <div className="mt-3">
            <MoneyField label="재산 − 빚" value={input.netAssets} onChange={(v) => edit({ netAssets: v }, ["netAssets"])} allowNegative />
          </div>
          <div className="mt-4">
            <ChoiceChips
              legend="회사 재산 중 땅·건물은 어느 정도인가요?"
              value={bandOf(input.realEstateRatio)}
              options={RE_BANDS}
              onChange={(b) => edit({ realEstateRatio: RE_BANDS.find((x) => x.value === b)?.ratio ?? 0.2 }, ["realEstateRatio"])}
            />
          </div>
        </>
      ),
    },
    {
      title: "회사 상황을 골라 주세요",
      keys: ["netOnly", "exempt"] as Key[],
      body: (
        <div className="grid gap-4">
          <ChoiceChips<YesNo> legend="회사를 시작한 지 3년이 지났나요?" value={input.netAssetOnlyReason ? "no" : "yes"} options={YES_NO} onChange={(v) => edit({ netAssetOnlyReason: v === "no" }, ["netOnly"])} />
          <ChoiceChips<YesNoUnknown>
            legend="중소기업이거나, 최근 3년 평균 매출이 5천억 원 미만인 중견기업인가요?"
            value={tags.exempt === "guess" ? "unknown" : input.premiumExempt ? "yes" : "no"}
            options={YES_NO_UNKNOWN}
            onChange={(v) => edit({ premiumExempt: v !== "no" }, ["exempt"], v === "unknown" ? "guess" : null)}
          />
        </div>
      ),
    },
    {
      title: "이 주식의 주인이 가족과 합쳐 가장 많은 주식을 가진 쪽인가요?",
      keys: ["majority"] as Key[],
      body: (
        <>
          <p className="text-sm leading-6 text-muted-foreground">
            그렇다면 경영권 값으로 20%를 더할 수 있어요(<Term k="최대주주할증">최대주주 할증</Term>). 다만 앞에서 중소·중견기업이라고 답했다면 더하지 않아요.
          </p>
          <div className="mt-3">
            <ChoiceChips<YesNoUnknown>
              legend="가장 많은 주식을 가진 쪽인가요?"
              value={tags.majority === "guess" ? "unknown" : input.isMajorityHolder ? "yes" : "no"}
              options={YES_NO_UNKNOWN}
              onChange={(v) => edit({ isMajorityHolder: v !== "no" }, ["majority"], v === "unknown" ? "guess" : null)}
            />
          </div>
        </>
      ),
    },
  ];
  const cur = questions[q];

  const memo = () =>
    [
      `[비상장주식 보충적 평가 추정] 기준일 ${ADVISORY_AS_OF}`,
      `발행주식 ${input.sharesOutstanding.toLocaleString("ko-KR")}주, 평가 주식 ${input.heldShares.toLocaleString("ko-KR")}주`,
      `순손익액(1·2·3년 전) ${input.netIncome.map((v) => exactWon(v)).join(" / ")}`,
      `순자산가액 ${exactWon(input.netAssets)}, 영업권 ${exactWon(input.goodwill ?? 0)}, 부동산 등 비율 ${Math.round(input.realEstateRatio * 100)}%`,
      `${CLASS_LABEL[r.shareClass]}: 순손익가치 ${exactWon(r.incomeValue)}, 순자산가치 ${exactWon(r.assetValue)}, 가중평균 ${exactWon(r.blended)}${r.floorApplied ? `, 80% 하한 ${exactWon(r.floorValue)} 적용` : ""}${r.premiumApplied ? ", 최대주주 할증 20%" : ""}`,
      `1주당 ${exactWon(r.perShare)}, 평가액 ${exactWon(r.total)}`,
      `민감도(±20%): ${bars.slice(0, 3).map((b) => `${b.label} ${exactWon(b.low)}~${exactWon(b.high)}`).join("; ")}`,
      "근거: 상증법 제63조, 시행령 제53조·제54조·제56조, 시행규칙 제17조. 추정이익 평가·증자·감자 환산·매매사례가액 미반영.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />

      {easy ? (
        <section aria-label="질문" className="rounded-md border border-border bg-background px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-primary">
              질문 {q + 1} / {questions.length}
            </p>
            <div className="flex gap-1" aria-hidden="true">
              {questions.map((_, i) => (
                <span key={i} className={"size-2 rounded-full " + (i === q ? "bg-primary" : i < q ? "bg-muted-foreground" : "bg-border")} />
              ))}
            </div>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-foreground">{cur.title}</h2>
          <div className="mt-3">{cur.body}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={q === 0} onClick={() => setQ(q - 1)} className="min-h-11 rounded-md border border-border px-3 text-sm text-foreground disabled:opacity-40">
              이전
            </button>
            <button type="button" onClick={() => keepAsGuess(cur.keys)} className="min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
              잘 모르겠어요
            </button>
            <button
              type="button"
              onClick={() => (q < questions.length - 1 ? setQ(q + 1) : resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))}
              className="ml-auto min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {q < questions.length - 1 ? "다음" : "결과 보기"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">답할 때마다 아래 결과가 바로 바뀌어요. "잘 모르겠어요"는 예시 값을 그대로 두고 "가정"으로 표시해요.</p>
        </section>
      ) : (
        <section aria-label="입력" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="발행주식총수(자기주식 제외)" value={input.sharesOutstanding} onChange={(v) => edit({ sharesOutstanding: v }, ["shares"])} suffix="주" step={1000} />
            <NumberField label="평가할 보유 주식 수" value={input.heldShares} onChange={(v) => edit({ heldShares: v }, ["held"])} suffix="주" step={1000} />
            <MoneyField label="최근 1년 순손익액(직전 사업연도)" value={input.netIncome[0]} onChange={(v) => setIncome(0, v)} allowNegative />
            <MoneyField label="2년 전 순손익액" value={input.netIncome[1]} onChange={(v) => setIncome(1, v)} allowNegative />
            <MoneyField label="3년 전 순손익액" value={input.netIncome[2]} onChange={(v) => setIncome(2, v)} allowNegative />
            <MoneyField label="평가기준일 순자산가액(상증법 시가 기준)" value={input.netAssets} onChange={(v) => edit({ netAssets: v }, ["netAssets"])} allowNegative />
            <MoneyField label="영업권 평가액(시행령 제59조, 없으면 0)" value={input.goodwill ?? 0} onChange={(v) => edit({ goodwill: v }, ["goodwill"])} />
            <NumberField label="자산 중 부동산 등 비율" value={Math.round(input.realEstateRatio * 1000) / 10} onChange={(v) => edit({ realEstateRatio: v / 100 }, ["realEstateRatio"])} suffix="%" step={1} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ChoiceChips<YesNo> legend="순자산가치만 평가하는 법인인가요?" value={input.netAssetOnlyReason ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ netAssetOnlyReason: v === "yes" }, ["netOnly"])} />
            <ChoiceChips<YesNo> legend="최대주주 등인가요?" value={input.isMajorityHolder ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ isMajorityHolder: v === "yes" }, ["majority"])} />
            <ChoiceChips<YesNo> legend="할증 제외 대상인가요?" value={input.premiumExempt ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ premiumExempt: v === "yes" }, ["exempt"])} />
          </div>
          <p className="text-xs text-muted-foreground">
            순자산가치만 평가: 사업개시 3년 미만, 휴·폐업·청산 중, 주식 등 비율 80% 이상 등(시행령 제54조 제4항). 할증 제외: 중소기업, 직전 3년 평균 매출 5천억 원 미만 중견기업, 3년 연속 결손 등(시행령 제53조 제8항).
          </p>
        </section>
      )}

      <div ref={resultRef} className="scroll-mt-4 space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <div aria-live="polite">
          <p className="text-lg font-semibold leading-7 text-foreground">{plain.headline}</p>
          {plain.driver && <p className="mt-2 text-sm leading-6 text-foreground">{plain.driver}</p>}
          {(hasExample || hasGuess) && (
            <p className="mt-2 rounded-md bg-warning px-3 py-2 text-xs leading-5 text-warning-foreground">
              {hasExample ? "아직 예시 값이 들어 있어요. " : ""}
              {hasGuess ? "모른다고 답한 항목은 가정으로 계산했어요. " : ""}
              아는 값으로 바꾸면 더 정확해져요.
            </p>
          )}
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">1주당 평가액</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{money(r.perShare)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{easy ? "값을 알고 싶은 주식 전체" : "보유 주식 평가액"}</dt>
            <dd className="font-mono text-xl font-bold text-foreground">{money(r.total)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              {easy ? (
                <>
                  <Term k="순손익가치">이익으로 본 값</Term> / <Term k="순자산가치">재산으로 본 값</Term>
                </>
              ) : (
                "순손익가치 / 순자산가치"
              )}
            </dt>
            <dd className="font-mono text-base font-semibold text-foreground">
              {money(r.incomeValue)} / {money(r.assetValue)}
            </dd>
          </div>
        </dl>
        {easy && (
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            {plain.reasons.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}

        <section aria-label="가정 바꿔 보기">
          <h2 className="text-base font-semibold text-foreground">가정을 바꿔 보세요</h2>
          <p className="text-xs text-muted-foreground">슬라이더를 움직이면 위 결과와 아래 그래프가 같이 바뀌어요.</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SLIDERS.map((key) => {
              const a = unlistedAssumption(key);
              return (
                <AssumptionSlider
                  key={key}
                  label={easy ? a.plain : a.label}
                  unit={a.unit}
                  value={a.get(input)}
                  range={a.range(anchors[key])}
                  onChange={(v) => slide(key, v)}
                  mode={mode}
                  tag={tags[key as Key] ?? null}
                  marks={a.marks}
                />
              );
            })}
          </div>
        </section>

        <div className="space-y-3">
          <ChoiceChips<SweepKey> legend="한 가지 가정을 끝까지 바꿔 보기" value={sweepKey} options={SWEEPS} onChange={setSweepKey} />
          <SweepChart
            title={`${easy ? sweepA.plain : sweepA.label}에 따라 1주당 값이 이렇게 바뀌어요`}
            caption={sweepKey === "realEstateRatio" ? "점선은 법이 바뀌는 지점이에요. 50%부터 재산 쪽 비중이 커지고, 80%부터는 재산만 봐요." : "그래프를 누르거나 끌어도 값이 바뀌어요. 평평해지는 구간은 80% 하한이 걸린 곳이에요."}
            points={points}
            current={{ x: sweepA.get(input), y: r.perShare }}
            marks={sweepA.marks}
            formatX={(v) => formatUnit(sweepA.unit, v, "easy")}
            formatY={(v) => roughWon(v)}
            onPick={(x) => slide(sweepKey, sweepA.unit === "pct" ? Math.round(x * 100) / 100 : x)}
            xLabel={easy ? sweepA.plain : sweepA.label}
            yLabel="1주당 평가액"
          />
          <BridgeChart
            title="1주당 값은 이렇게 만들어져요"
            caption={easy ? "이익으로 본 값과 재산으로 본 값을 섞고, 최저선과 할증을 차례로 반영해요." : CLASS_LABEL[r.shareClass]}
            steps={unlistedBridge(r)}
            format={money}
          />
          <TornadoChart bars={bars} mode={mode} format={roughWon} />
          {input.isMajorityHolder && (
            <CompareBars
              title={r.premiumApplied ? "최대주주 할증이 더해진 만큼" : "중소·중견기업이라 할증이 빠졌어요"}
              caption={r.premiumApplied ? "중소기업이나 매출 5천억 원 미만 중견기업이면 할증이 빠져요." : "대기업 등이었다면 이만큼 더해졌을 거예요."}
              items={[
                { label: "할증 없이", value: r.basePerShare, current: !r.premiumApplied },
                { label: "할증 20% 더하면", value: Math.floor(r.basePerShare * 1.2), current: r.premiumApplied },
              ]}
              format={money}
            />
          )}
        </div>

        {easy ? (
          <section aria-label="세무사에게 확인할 것" className="rounded-md bg-muted px-3 py-3">
            <h2 className="text-sm font-semibold text-foreground">세무사에게 확인할 것</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-foreground">
              {ASK_ADVISER.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">이 결과는 추정이에요. 실제 신고 금액은 세무사와 확인하세요.</p>
          </section>
        ) : (
          <>
            <ResultSteps
              steps={[
                `1주당 순손익액: ${r.perShareIncome.map((v) => exactWon(Math.floor(v))).join(", ")} → 가중평균 (3·2·1) ${exactWon(Math.floor(r.weightedRaw))}${r.weightedRaw < 0 ? " → 음수라 0" : ""}`,
                `순손익가치 = 가중평균 ÷ 10%(순손익가치환원율) = ${exactWon(r.incomeValue)}`,
                `순자산가치 = (순자산 + 영업권) ÷ 발행주식수 = ${exactWon(r.assetValue)}`,
                r.shareClass === "netAssetOnly" ? "순자산가치만 적용" : `가중평균 ${exactWon(r.blended)}, 하한(순자산가치 80%) ${exactWon(r.floorValue)}${r.floorApplied ? " → 하한 적용" : ""}`,
                r.premiumApplied ? `최대주주 할증 20%: ${exactWon(r.basePerShare)} × 1.2 = ${exactWon(r.perShare)}` : "최대주주 할증 없음",
                "추정이익 평가(시행령 제56조 제2항), 증자·감자 시 주식수 환산, 매매사례가액 등 시가는 넣지 않았어요.",
              ]}
              next={[
                { href: "/ko/family-business-inheritance-calculator/", label: "가업상속공제 계산" },
                { href: "/ko/dcf-valuation-calculator/", label: "DCF 기업가치" },
              ]}
            />
            <CopyButton text={memo} />
          </>
        )}
      </div>
    </div>
  );
}

function anchorOf(i: UnlistedShareInput): Record<string, number> {
  return Object.fromEntries(UNLISTED_ASSUMPTIONS.map((a) => [a.key, a.get(i)]));
}

function CopyButton({ text }: { text: () => string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text());
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
      className="min-h-11 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground hover:bg-muted"
    >
      {done ? "복사했어요" : "상담 메모 복사"}
    </button>
  );
}
