// 경영 도구 공용 조각 (2026-11-14). 그래프·모드는 ../viz/ 부품을 그대로 써요.
import { useEffect, useRef, useState, type ReactNode } from "react";

/** 입력을 이 브라우저에 저장해 다시 열어도 이어서 쓰게 해요(서버로 보내지 않아요). */
export function useSaved<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`oiyo-biz:${key}`);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* 저장소를 못 쓰면 예시로 시작 */
    }
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(`oiyo-biz:${key}`, JSON.stringify(value));
    } catch {
      /* noop */
    }
  }, [key, value]);
  const reset = () => setValue(initial);
  return [value, setValue, reset] as const;
}

export function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      />
    </label>
  );
}

/** 결과를 문장으로: 쉬운 모드에서 가장 먼저 읽는 칸 */
export function Verdict({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div aria-live="polite" className="rounded-md border border-primary bg-background px-4 py-4">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <div className="mt-1 text-base leading-7 text-foreground">{children}</div>
    </div>
  );
}

export function SmallButton({ onClick, children, tone = "plain", label }: { onClick: () => void; children: ReactNode; tone?: "plain" | "danger"; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors " +
        (tone === "danger" ? "border-border text-destructive hover:bg-muted" : "border-border bg-background text-foreground hover:bg-muted")
      }
    >
      {children}
    </button>
  );
}

/** 결과를 메모로 복사(상담·회의록에 붙이기) */
export function CopyMemo({ text }: { text: () => string }) {
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
      className="inline-flex min-h-11 items-center rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted"
    >
      {done ? "복사했어요" : "결과 메모 복사"}
    </button>
  );
}

export const pct0 = (r: number) => `${Math.round(r * 100)}%`;
export const pct1 = (r: number) => `${(r * 100).toFixed(1)}%`;
export const uid = () => Math.random().toString(36).slice(2, 8);

/** 금액·비율이 아닌 값(일수, 점수 등)용 슬라이더. 금액·비율은 ../viz/AssumptionSlider를 써요. */
export function RangeField({ label, value, min, max, step = 1, onChange, format }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="block rounded-md border border-border bg-background px-3 py-2">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-mono text-sm font-semibold text-foreground">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, value))} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 h-11 w-full cursor-pointer accent-primary" />
    </label>
  );
}
