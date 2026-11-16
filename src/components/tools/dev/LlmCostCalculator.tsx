// LLM API 비용 계산기 (2026-11-16, Gemini 이전 D). 계산: lib/dev-tools.ts llmCost.
import { useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { LLM_PRICES, LLM_PRICES_AS_OF, CACHE_WRITE_MULTIPLIER, llmCost, type LlmPrice, type LlmUsage } from "../../../lib/dev-tools";
import BarTrack from "../viz/BarTrack";
import { Chips, CopyButton, Field, ModeSwitch, inputCls, langOf, t } from "./common";

type UseCase = "chat" | "summary" | "agent" | "classify";
const PRESETS: Record<UseCase, { ko: string; en: string; input: number; output: number; cached: number }> = {
  chat: { ko: "고객 상담 챗봇", en: "Support chatbot", input: 3000, output: 400, cached: 0.6 },
  summary: { ko: "문서 요약", en: "Document summary", input: 20000, output: 800, cached: 0 },
  agent: { ko: "코딩·업무 에이전트", en: "Coding / task agent", input: 60000, output: 3000, cached: 0.8 },
  classify: { ko: "짧은 분류·태깅", en: "Short classification", input: 800, output: 30, cached: 0.5 },
};
const SCALES = [100, 1000, 10000, 100000];

const usd = (n: number) => (n >= 100 ? `$${Math.round(n).toLocaleString("en-US")}` : n >= 1 ? `$${n.toFixed(2)}` : `$${n.toFixed(4)}`);
const krw = (n: number) => `₩${Math.round(n).toLocaleString("ko-KR")}`;

export default function LlmCostCalculator({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const [easy, setEasy] = useState(true);
  const [useCase, setUseCase] = useState<UseCase>("chat");
  const [u, setU] = useState<LlmUsage>({ requestsPerDay: 1000, inputTokens: 3000, outputTokens: 400, cachedShare: 0.6, batch: false, days: 30 });
  const [modelId, setModelId] = useState("claude-sonnet-5-5");
  const [fx, setFx] = useState(1450);
  const [custom, setCustom] = useState<LlmPrice>({ id: "custom", label: t(lang, "직접 입력 모델", "Custom model"), input: 1, output: 4, cacheRead: 0.1 });
  const models = [...LLM_PRICES, custom];
  const model = models.find((m) => m.id === modelId) ?? LLM_PRICES[1];
  const cost = llmCost(model, u);
  const all = models.map((m) => ({ m, c: llmCost(m, u) }));
  const max = Math.max(1e-9, ...all.map((x) => x.c.monthly));
  const set = (patch: Partial<LlmUsage>) => setU({ ...u, ...patch });
  const pickCase = (c: UseCase) => {
    setUseCase(c);
    const p = PRESETS[c];
    setU({ ...u, inputTokens: p.input, outputTokens: p.output, cachedShare: p.cached });
  };

  // 어떤 가정이 한 달 비용을 가장 크게 흔드는지: 하나씩 바꿔 본 차이.
  const swing = [
    { label: t(lang, "요청 수 ×2", "Requests ×2"), v: llmCost(model, { ...u, requestsPerDay: u.requestsPerDay * 2 }).monthly },
    { label: t(lang, "입력 토큰 ×2", "Input tokens ×2"), v: llmCost(model, { ...u, inputTokens: u.inputTokens * 2 }).monthly },
    { label: t(lang, "출력 토큰 ×2", "Output tokens ×2"), v: llmCost(model, { ...u, outputTokens: u.outputTokens * 2 }).monthly },
    { label: u.cachedShare > 0 ? t(lang, "캐시 끄기", "No prompt cache") : t(lang, "입력 80% 캐시", "Cache 80% of input"), v: llmCost(model, { ...u, cachedShare: u.cachedShare > 0 ? 0 : 0.8 }).monthly },
    { label: u.batch ? t(lang, "배치 끄기", "No batch") : t(lang, "배치 API(50% 할인)", "Batch API (−50%)"), v: llmCost(model, { ...u, batch: !u.batch }).monthly },
  ].map((s) => ({ ...s, d: s.v - cost.monthly })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  const swingMax = Math.max(1e-9, ...swing.map((s) => Math.abs(s.d)));
  const cheapest = [...all].sort((a, b) => a.c.monthly - b.c.monthly)[0];

  const headline = t(lang, `${model.label}로 하루 ${u.requestsPerDay.toLocaleString("ko-KR")}번 쓰면 한 달 약 ${usd(cost.monthly)}(약 ${krw(cost.monthly * fx)}) 예상이에요.`, `With ${model.label} at ${u.requestsPerDay.toLocaleString("en-US")} requests a day, expect about ${usd(cost.monthly)} a month.`);
  const memo = () =>
    [
      `[LLM API cost] ${model.label}, prices as of ${LLM_PRICES_AS_OF}`,
      `requests/day ${u.requestsPerDay}, input ${u.inputTokens} tok, output ${u.outputTokens} tok, cached ${Math.round(u.cachedShare * 100)}%, batch ${u.batch ? "on" : "off"}`,
      `per request ${usd(cost.perRequest)} · per day ${usd(cost.daily)} · ${u.days} days ${usd(cost.monthly)} (≈ ${krw(cost.monthly * fx)} @ ${fx})`,
      `https://tools.oiyo.net/${locale}/llm-api-cost-calculator/`,
    ].join("\n");
  const num = (v: string) => Math.max(0, Number(v) || 0);

  return (
    <div className="space-y-5">
      <ModeSwitch easy={easy} onChange={setEasy} lang={lang} />
      <section aria-label={t(lang, "입력", "Inputs")} className="space-y-4">
        {easy ? (
          <>
            <Chips<UseCase> legend={t(lang, "어디에 쓰나요?", "What is it for?")} value={useCase} onChange={pickCase} options={(Object.keys(PRESETS) as UseCase[]).map((k) => ({ value: k, label: PRESETS[k][lang] }))} />
            <Chips<string>
              legend={t(lang, "하루 몇 번 부르나요?", "Requests per day")}
              value={String(u.requestsPerDay)}
              onChange={(v) => set({ requestsPerDay: Number(v) })}
              options={SCALES.map((s) => ({ value: String(s), label: s.toLocaleString(lang === "ko" ? "ko-KR" : "en-US") }))}
            />
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t(lang, "하루 요청 수", "Requests per day")}><input type="number" min={0} value={u.requestsPerDay} onChange={(e) => set({ requestsPerDay: num(e.target.value) })} className={inputCls} /></Field>
            <Field label={t(lang, "기간(일)", "Days")}><input type="number" min={1} value={u.days} onChange={(e) => set({ days: num(e.target.value) })} className={inputCls} /></Field>
            <Field label={t(lang, "요청당 입력 토큰", "Input tokens per request")} hint={t(lang, "시스템 프롬프트·대화 기록·문서 포함", "System prompt, history and documents included")}><input type="number" min={0} value={u.inputTokens} onChange={(e) => set({ inputTokens: num(e.target.value) })} className={inputCls} /></Field>
            <Field label={t(lang, "요청당 출력 토큰", "Output tokens per request")} hint={t(lang, "생각(thinking) 토큰도 출력으로 청구돼요", "Thinking tokens bill as output")}><input type="number" min={0} value={u.outputTokens} onChange={(e) => set({ outputTokens: num(e.target.value) })} className={inputCls} /></Field>
            <Field label={t(lang, `캐시로 읽는 입력 비율 ${Math.round(u.cachedShare * 100)}%`, `Share of input read from cache ${Math.round(u.cachedShare * 100)}%`)}>
              <input type="range" min={0} max={95} step={5} value={Math.round(u.cachedShare * 100)} onChange={(e) => set({ cachedShare: Number(e.target.value) / 100 })} className="mt-3 w-full" />
            </Field>
            <Field label={t(lang, "환율(원/달러)", "KRW per USD")}><input type="number" min={0} value={fx} onChange={(e) => setFx(num(e.target.value))} className={inputCls} /></Field>
            <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={u.batch} onChange={(e) => set({ batch: e.target.checked })} className="size-5" />
              {t(lang, "배치 API로 보내기(결과를 늦게 받아도 됨, 50% 할인)", "Use the Batch API (async, 50% off)")}
            </label>
          </div>
        )}
        <Field label={t(lang, `하루 요청 수 ${u.requestsPerDay.toLocaleString("ko-KR")}번 — 끌어서 바꿔 보세요`, `Requests per day: ${u.requestsPerDay.toLocaleString("en-US")} — drag to explore`)}>
          <input type="range" min={0} max={50} value={Math.round(Math.log10(Math.max(10, u.requestsPerDay)) * 10)} onChange={(e) => set({ requestsPerDay: Math.round(10 ** (Number(e.target.value) / 10)) })} className="mt-2 w-full" />
        </Field>
        <Chips<string> legend={t(lang, "모델", "Model")} value={modelId} onChange={setModelId} options={models.map((m) => ({ value: m.id, label: m.label }))} />
        {modelId === "custom" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t(lang, "입력 $/100만 토큰", "Input $/1M tokens")}><input type="number" min={0} step="0.01" value={custom.input} onChange={(e) => setCustom({ ...custom, input: num(e.target.value) })} className={inputCls} /></Field>
            <Field label={t(lang, "출력 $/100만 토큰", "Output $/1M tokens")}><input type="number" min={0} step="0.01" value={custom.output} onChange={(e) => setCustom({ ...custom, output: num(e.target.value) })} className={inputCls} /></Field>
            <Field label={t(lang, "캐시 읽기 $/100만 토큰", "Cache read $/1M tokens")}><input type="number" min={0} step="0.01" value={custom.cacheRead} onChange={(e) => setCustom({ ...custom, cacheRead: num(e.target.value) })} className={inputCls} /></Field>
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        <p className="text-base font-semibold text-foreground">{headline}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            [t(lang, "요청 1번", "Per request"), usd(cost.perRequest)],
            [t(lang, "하루", "Per day"), usd(cost.daily)],
            [t(lang, `${u.days}일`, `${u.days} days`), usd(cost.monthly)],
            [t(lang, "캐시로 아낀 돈", "Saved by cache"), usd(cost.cacheSaving)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="font-mono font-semibold text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
        {cost.long && <p className="text-xs font-semibold text-foreground">{t(lang, "입력이 10만 토큰을 넘어 Haiku 5.5의 긴 입력 단가($0.50/$2.50)를 적용했어요.", "Input is over 100K tokens, so Haiku 5.5's long-prompt price ($0.50/$2.50) applies.")}</p>}

        <figure>
          <figcaption className="text-sm font-semibold text-foreground">{t(lang, `모델별 ${u.days}일 비용 (같은 사용량)`, `Cost for ${u.days} days by model (same usage)`)}</figcaption>
          <ul className="mt-2 space-y-2">
            {all.map(({ m, c }) => (
              <li key={m.id}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className={m.id === modelId ? "font-semibold text-foreground" : "text-muted-foreground"}>{m.label}</span>
                  <span className="font-mono text-foreground">{usd(c.monthly)}</span>
                </div>
                <BarTrack segments={[{ from: 0, to: (c.monthly / max) * 100, tone: m.id === modelId ? "primary" : "muted" }]} />
              </li>
            ))}
          </ul>
          {cheapest.m.id !== modelId && <p className="mt-2 text-xs text-muted-foreground">{t(lang, `가장 싼 선택은 ${cheapest.m.label}(${usd(cheapest.c.monthly)})이에요. 품질이 충분한지는 실제 요청 몇 개로 먼저 확인하세요.`, `Cheapest here is ${cheapest.m.label} (${usd(cheapest.c.monthly)}). Check quality on a sample of real requests first.`)}</p>}
        </figure>

        <figure>
          <figcaption className="text-sm font-semibold text-foreground">{t(lang, "무엇이 비용을 가장 크게 바꾸나", "What moves the bill most")}</figcaption>
          <ul className="mt-2 space-y-2">
            {swing.map((s) => (
              <li key={s.label}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-mono text-foreground">{s.d >= 0 ? "+" : "−"}{usd(Math.abs(s.d))}</span>
                </div>
                <BarTrack segments={[s.d >= 0 ? { from: 50, to: 50 + (s.d / swingMax) * 50, tone: "warning" } : { from: 50 + (s.d / swingMax) * 50, to: 50, tone: "primary" }]} marker={50} />
              </li>
            ))}
          </ul>
        </figure>

        <ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
          <li>{t(lang, `Claude 가격은 ${LLM_PRICES_AS_OF} 기준 Anthropic API 정가예요(100만 토큰당 달러). Bedrock·Vertex는 가격이 다를 수 있어요.`, `Claude prices are Anthropic API list prices as of ${LLM_PRICES_AS_OF} (USD per 1M tokens). Bedrock and Vertex may differ.`)}</li>
          <li>{t(lang, `캐시를 처음 쓸 때는 입력 단가의 ${CACHE_WRITE_MULTIPLIER}배를 한 번 더 내요. 요청이 많으면 무시할 만해서 계산에서 뺐어요.`, `Writing to the cache costs ${CACHE_WRITE_MULTIPLIER}× the input price once; it is left out because it is small at volume.`)}</li>
          <li>{t(lang, "다른 회사 모델은 '직접 입력 모델'에 그 회사 가격표 값을 넣어 비교하세요.", "For other providers, type their current prices into 'Custom model'.")}</li>
        </ul>
        <CopyButton text={memo} lang={lang} label={t(lang, "결과 메모 복사", "Copy summary")} />
      </div>
    </div>
  );
}
