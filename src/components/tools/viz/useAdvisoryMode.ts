import { useCallback, useEffect, useState } from "react";
import type { AdvisoryMode } from "./format";
import { track } from "./track";

const KEY = "oiyo-advisory-mode";

/** 처음엔 쉬운 설명으로 열고, 한 번 고른 모드는 이 브라우저에 기억해요. */
export function useAdvisoryMode(toolId: string) {
  const [mode, setModeState] = useState<AdvisoryMode>("easy");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "easy" || saved === "expert") setModeState(saved);
    } catch {
      /* 저장소를 못 쓰면 쉬운 설명으로 */
    }
  }, []);
  const setMode = useCallback(
    (next: AdvisoryMode) => {
      setModeState(next);
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* noop */
      }
      track("advisory_mode", { tool_id: toolId, mode: next });
    },
    [toolId],
  );
  return [mode, setMode] as const;
}
