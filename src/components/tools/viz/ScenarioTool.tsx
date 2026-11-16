// 쉬운 설명/전문가 + 가정 변화 그래프를 한 번에 갖춘 도구 틀 (2026-11-16).
// 도구는 설정만 넘겨요: 예시 입력, 가정 목록, 질문 카드, 전문가 입력, 결과 문장·숫자, 추가 그래프.
// 직접 조립이 필요하면 advisory/ 도구처럼 useScenario·QuestionStepper·SweepPanel을 따로 써도 돼요.
import { useMemo, useRef, type ReactNode } from "react";
import {
  tornado,
  type Assumption,
  type TornadoBar,
} from "../../../lib/scenario";
import AssumptionPanel from "./AssumptionPanel";
import ModeToggle from "./ModeToggle";
import PlainSummary, { AskAdviser, ReasonList } from "./PlainSummary";
import QuestionStepper, { type Question } from "./QuestionStepper";
import SweepPanel from "./SweepPanel";
import TornadoChart from "./TornadoChart";
import { exactWon, roughWon, type AdvisoryMode } from "./format";
import { useAdvisoryMode } from "./useAdvisoryMode";
import {
  VIZ_TEXT,
  VizLangProvider,
  money as intlMoney,
  type VizLang,
} from "./i18n";
import { useScenario } from "./useScenario";

export type ScenarioState<I, K extends string> = ReturnType<
  typeof useScenario<I, K>
> & { mode: AdvisoryMode; money: (n: number) => string };

export interface Metric {
  label: ReactNode;
  value: string;
  tone?: "primary" | "default";
}

interface Props<I, K extends string> {
  toolId: string;
  example: I;
  assumptions: Assumption<I>[];
  keys: readonly K[];
  /** 그래프·토네이도가 보는 결과 하나 */
  evaluate: (i: I) => number;
  resultName: string;
  formatResult?: (n: number) => string;
  questions: (s: ScenarioState<I, K>) => Question<K>[];
  expert: (s: ScenarioState<I, K>) => ReactNode;
  summary: (
    i: I,
    top: TornadoBar | undefined,
  ) => { headline: string; driver: string | null; reasons: string[] };
  metrics: (i: I, s: ScenarioState<I, K>) => Metric[];
  /** 가정 카드로 보여 줄 가정 key(없으면 앞의 4개) */
  sliders?: string[];
  /** 훑기 곡선 후보 key(없으면 sliders) */
  sweeps?: string[];
  sweepCaption?: (a: Assumption<I>) => string | undefined;
  /** 입력에 따라 바뀌는 경계 점선(예: 증여 관계별 공제 한도) */
  marksFor?: (key: string, i: I) => Assumption<I>["marks"] | undefined;
  /** 다리·전후 비교 같은 도구별 그래프 */
  charts?: (i: I, s: ScenarioState<I, K>) => ReactNode;
  /** 쉬운 모드 아래 "세무사에게 확인할 것" */
  ask?: string[];
  askTitle?: string;
  /** 전문가 모드 아래(계산 단계 등) */
  expertFooter?: (i: I, s: ScenarioState<I, K>) => ReactNode;
  /** 쉬운 모드 아래 추가 안내 */
  easyFooter?: (i: I, s: ScenarioState<I, K>) => ReactNode;
  /** 화면 틀 언어(기본 한국어). 도구 문구는 도구가 그 언어로 넘겨요. */
  lang?: VizLang;
  /** 금액 통화(기본 KRW) */
  currency?: string;
}

export default function ScenarioTool<I, K extends string>(p: Props<I, K>) {
  const [mode, setMode] = useAdvisoryMode(p.toolId);
  const base = useScenario<I, K>(p.toolId, p.example, p.assumptions, p.keys);
  const resultRef = useRef<HTMLDivElement>(null);
  const easy = mode === "easy";
  const lang = p.lang ?? "ko";
  const currency = p.currency ?? "KRW";
  const t = VIZ_TEXT[lang];
  const moneyFmt =
    lang === "ko"
      ? easy
        ? roughWon
        : exactWon
      : (n: number) => intlMoney(n, lang, currency, easy);
  const s: ScenarioState<I, K> = { ...base, mode, money: moneyFmt };
  const { input } = s;
  const bars = useMemo(
    () => tornado(input, p.assumptions, p.evaluate),
    [input, p.assumptions, p.evaluate],
  );
  const plain = p.summary(input, bars[0]);
  const live = p.marksFor
    ? p.assumptions.map((a) => ({
        ...a,
        marks: p.marksFor!(a.key, input) ?? a.marks,
      }))
    : p.assumptions;
  const pick = (keys?: string[]) =>
    keys ? live.filter((a) => keys.includes(a.key)) : live.slice(0, 4);
  const sliders = pick(p.sliders);
  const sweeps = pick(p.sweeps ?? p.sliders);
  const fmt =
    p.formatResult ??
    (lang === "ko"
      ? roughWon
      : (n: number) => intlMoney(n, lang, currency, true));
  const metrics = p.metrics(input, s);

  return (
    <VizLangProvider value={{ lang, currency }}>
      <div className="space-y-5">
        <ModeToggle mode={mode} onChange={setMode} />
        {easy ? (
          <QuestionStepper
            questions={p.questions(s)}
            onUnknown={s.keepAsGuess}
            resultRef={resultRef}
          />
        ) : (
          <section aria-label={t.input} className="space-y-4">
            {p.expert(s)}
          </section>
        )}

        <div
          ref={resultRef}
          className="scroll-mt-4 space-y-4 rounded-md border border-border bg-card px-4 py-4"
        >
          <PlainSummary
            headline={plain.headline}
            driver={plain.driver}
            hasExample={s.hasExample}
            hasGuess={s.hasGuess}
          />
          {metrics.length > 0 && (
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              {metrics.map((m, i) => (
                <div key={i}>
                  <dt className="text-muted-foreground">{m.label}</dt>
                  <dd
                    className={
                      "font-mono text-xl font-bold " +
                      (m.tone === "primary"
                        ? "text-primary"
                        : "text-foreground")
                    }
                  >
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <ReasonList reasons={plain.reasons} />
          {sliders.length > 0 && (
            <AssumptionPanel
              assumptions={sliders}
              input={input}
              anchors={s.anchors}
              tags={s.tags}
              mode={mode}
              onSlide={s.slide}
            />
          )}
          {sweeps.length > 0 && (
            <SweepPanel
              options={sweeps}
              input={input}
              anchors={s.anchors}
              evaluate={p.evaluate}
              mode={mode}
              resultName={p.resultName}
              formatY={fmt}
              onSlide={s.slide}
              caption={p.sweepCaption}
            />
          )}
          {p.charts?.(input, s)}
          <TornadoChart bars={bars} mode={mode} format={fmt} />
          {easy ? (
            <>
              {p.easyFooter?.(input, s)}
              {p.ask && <AskAdviser items={p.ask} title={p.askTitle} />}
            </>
          ) : (
            p.expertFooter?.(input, s)
          )}
        </div>
      </div>
    </VizLangProvider>
  );
}
