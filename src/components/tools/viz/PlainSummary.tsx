import { useVizText } from "./i18n";
/** 결과 맨 위: 핵심 문장, 가장 크게 흔드는 가정, 예시·가정 경고. 화면 낭독기가 바뀔 때마다 읽어요. */
export default function PlainSummary({ headline, driver, hasExample, hasGuess }: { headline: string; driver?: string | null; hasExample: boolean; hasGuess: boolean }) {
  const t = useVizText();
  return (
    <div aria-live="polite">
      <p className="text-lg font-semibold leading-7 text-foreground">{headline}</p>
      {driver && <p className="mt-2 text-sm leading-6 text-foreground">{driver}</p>}
      {(hasExample || hasGuess) && (
        <p className="mt-2 rounded-md bg-warning px-3 py-2 text-xs leading-5 text-warning-foreground">
          {hasExample ? t.hasExample : ""}
          {hasGuess ? t.hasGuess : ""}
          {t.improve}
        </p>
      )}
    </div>
  );
}

export function ReasonList({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
      {reasons.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}

export function AskAdviser({ items, title: given }: { items: string[]; title?: string }) {
  const t = useVizText();
  const title = given ?? t.askTitle;
  return (
    <section aria-label={title} className="rounded-md bg-muted px-3 py-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-foreground">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">{t.askNote}</p>
    </section>
  );
}
