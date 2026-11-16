// 개발·AI 도구 공통 UI (2026-11-16). 화면 글자는 ko/en 두 벌만 두고 나머지 언어는 en을 쓴다(UuidGenerator와 같은 규칙).
import { useState, type ReactNode } from "react";
import type { Locale } from "../../../lib/i18n";

export type Lang = "ko" | "en";
export const langOf = (locale: Locale | string): Lang => (locale === "ko" ? "ko" : "en");
export const t = (lang: Lang, ko: string, en: string) => (lang === "ko" ? ko : en);

export function CopyButton({ text, lang, label }: { text: () => string; lang: Lang; label?: string }) {
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
      {done ? t(lang, "복사했어요", "Copied") : label ?? t(lang, "복사", "Copy")}
    </button>
  );
}

export function ModeSwitch({ easy, onChange, lang }: { easy: boolean; onChange: (easy: boolean) => void; lang: Lang }) {
  const opts = [
    { v: true, label: t(lang, "쉬운 설명", "Simple"), hint: t(lang, "몇 가지만 고르면 돼요", "Answer a few questions") },
    { v: false, label: t(lang, "전문가", "Expert"), hint: t(lang, "숫자를 직접 넣어요", "Enter exact numbers") },
  ];
  return (
    <div role="group" aria-label={t(lang, "화면 모드", "View mode")} className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
      {opts.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          aria-pressed={easy === o.v}
          onClick={() => onChange(o.v)}
          className={"min-h-11 rounded-md px-3 py-1 text-left transition-colors " + (easy === o.v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          <span className="block text-sm font-semibold">{o.label}</span>
          <span className="block text-xs">{o.hint}</span>
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls = "mt-1 block min-h-11 w-full rounded-md border border-border bg-background px-3 text-base";
export const areaCls = "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm leading-6";

export function Chips<T extends string>({ value, options, onChange, legend }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; legend: string }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-muted-foreground">{legend}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={"min-h-11 rounded-md border px-3 text-sm " + (value === o.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-muted")}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
