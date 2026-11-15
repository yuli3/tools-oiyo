import { useId, useState, type ReactNode } from "react";
import { ADVISORY_GLOSSARY, type GlossaryKey } from "../../../data/advisory-glossary";

/** 누르면 바로 아래에 한 줄 풀이가 열리는 용어. 팝오버 대신 본문을 밀어 내려 320px에서도 넘치지 않아요. */
export default function Term({ k, children }: { k: GlossaryKey; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline cursor-help font-semibold text-foreground underline decoration-dotted underline-offset-4"
      >
        {children}
      </button>
      {open && (
        <span id={id} className="my-1 block rounded-md bg-muted px-3 py-2 text-sm font-normal leading-6 text-foreground">
          {ADVISORY_GLOSSARY[k]}
        </span>
      )}
    </>
  );
}
