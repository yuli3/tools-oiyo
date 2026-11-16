import { useState } from "react";
import type { Assumption } from "../../../lib/scenario";
import type { ValueTag } from "./AssumptionSlider";
import { track } from "./track";

const anchorOf = <I,>(assumptions: Assumption<I>[], i: I) => Object.fromEntries(assumptions.map((a) => [a.key, a.get(i)])) as Record<string, number>;

/**
 * 도구 화면 공용 상태: 입력값, 값마다 "예시/가정" 표시, 슬라이더 기준점.
 * - edit: 사용자가 직접 넣은 값(표시를 지우고 슬라이더 기준점을 옮겨요)
 * - slide: 슬라이더·그래프로 바꾼 값(기준점은 그대로라 끄는 동안 범위가 흔들리지 않아요)
 * - keepAsGuess: "잘 모르겠어요" → 지금 값을 두고 "가정"으로 표시
 */
export function useScenario<I, K extends string>(toolId: string, example: I, assumptions: Assumption<I>[], keys: readonly K[]) {
  const [input, setInput] = useState<I>(example);
  const [tags, setTags] = useState<Partial<Record<K, ValueTag>>>(() => Object.fromEntries(keys.map((k) => [k, "example"])) as Partial<Record<K, ValueTag>>);
  const [anchors, setAnchors] = useState<Record<string, number>>(() => anchorOf(assumptions, example));

  const mark = (ks: readonly K[], tag: ValueTag) => setTags((t) => ({ ...t, ...Object.fromEntries(ks.map((k) => [k, tag])) }));
  const edit = (patch: Partial<I>, ks: readonly K[], tag: ValueTag = null) => {
    const next = { ...input, ...patch };
    setInput(next);
    mark(ks, tag);
    setAnchors(anchorOf(assumptions, next));
  };
  const slide = (key: string, v: number) => {
    const a = assumptions.find((x) => x.key === key);
    if (!a) return;
    setInput((cur) => a.set(cur, v));
    track("advisory_slider", { tool_id: toolId }, true);
  };
  const values = Object.values(tags);
  return {
    input,
    setInput,
    tags,
    anchors,
    edit,
    slide,
    keepAsGuess: (ks: readonly K[]) => mark(ks, "guess"),
    hasExample: values.includes("example"),
    hasGuess: values.includes("guess"),
  };
}
