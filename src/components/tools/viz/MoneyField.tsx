import { useEffect, useId, useState } from "react";
import { parseKoreanAmount, roughWon } from "../../../lib/scenario";

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  allowNegative?: boolean;
  hint?: string;
}

const show = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString("ko-KR") : "");

/** 금액 입력: 쉼표로 보여 주고 "6억 3천만"처럼 써도 읽어요. 아래에 억·만 단위로 다시 보여 줘요. */
export default function MoneyField({ label, value, onChange, allowNegative = false, hint }: Props) {
  const id = useId();
  const [text, setText] = useState(show(value));
  const [focused, setFocused] = useState(false);
  const [bad, setBad] = useState(false);
  useEffect(() => {
    if (!focused) setText(show(value));
  }, [value, focused]);

  const commit = (raw: string) => {
    setText(raw);
    const n = parseKoreanAmount(raw);
    if (n === null || (!allowNegative && n < 0)) {
      setBad(raw.trim() !== "");
      return;
    }
    setBad(false);
    onChange(n);
  };

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          id={id}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={text}
          aria-invalid={bad}
          aria-describedby={`${id}-read`}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setBad(false);
            setText(show(value));
          }}
          onChange={(e) => commit(e.target.value)}
          className="min-h-11 w-full rounded-md border border-border bg-background px-3 font-mono text-base text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        />
        <span className="shrink-0 text-sm text-muted-foreground">원</span>
      </div>
      <span id={`${id}-read`} className={"mt-1 block text-xs " + (bad ? "text-destructive" : "text-muted-foreground")}>
        {bad ? `"6억 3천만", "-2억"처럼 써 주세요${allowNegative ? "" : " (0 이상)"}` : `= ${roughWon(value)}${hint ? ` · ${hint}` : ""}`}
      </span>
    </label>
  );
}
