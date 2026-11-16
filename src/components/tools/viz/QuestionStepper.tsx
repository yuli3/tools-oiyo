import { useState, type ReactNode, type RefObject } from "react";

export interface Question<K extends string> {
  title: string;
  keys: readonly K[];
  body: ReactNode;
}

/** 쉬운 설명 모드의 질문 카드: 한 번에 하나, 이전·잘 모르겠어요·다음. 답할 때마다 아래 결과가 바로 바뀌어요. */
export default function QuestionStepper<K extends string>({ questions, onUnknown, resultRef }: { questions: Question<K>[]; onUnknown: (keys: readonly K[]) => void; resultRef?: RefObject<HTMLElement | null> }) {
  const [q, setQ] = useState(0);
  const i = Math.min(q, questions.length - 1);
  const cur = questions[i];
  const last = i === questions.length - 1;
  return (
    <section aria-label="질문" className="rounded-md border border-border bg-background px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-primary">
          질문 {i + 1} / {questions.length}
        </p>
        <div className="flex gap-1" aria-hidden="true">
          {questions.map((_, n) => (
            <span key={n} className={"size-2 rounded-full " + (n === i ? "bg-primary" : n < i ? "bg-muted-foreground" : "bg-border")} />
          ))}
        </div>
      </div>
      <h2 className="mt-2 text-lg font-semibold text-foreground">{cur.title}</h2>
      <div className="mt-3">{cur.body}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={i === 0} onClick={() => setQ(i - 1)} className="min-h-11 rounded-md border border-border px-3 text-sm text-foreground disabled:opacity-40">
          이전
        </button>
        <button type="button" onClick={() => onUnknown(cur.keys)} className="min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
          잘 모르겠어요
        </button>
        <button
          type="button"
          onClick={() => (last ? resultRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" }) : setQ(i + 1))}
          className="ml-auto min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          {last ? "결과 보기" : "다음"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">답할 때마다 아래 결과가 바로 바뀌어요. "잘 모르겠어요"는 예시 값을 그대로 두고 "가정"으로 표시해요.</p>
    </section>
  );
}
