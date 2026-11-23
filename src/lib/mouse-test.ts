// 마우스 테스트 계산 (2026-11-22). UI: src/components/tools/MouseTest.tsx
// 더블클릭 불량(채터링): 스위치가 낡으면 한 번 눌러도 접점이 튀어 '뗌→누름'이 수십 ms 안에 다시 들어와요.
// 사람이 일부러 빠르게 두 번 누르는 간격은 보통 80ms보다 길어서, 같은 버튼의 뗌 뒤 80ms 안의 누름을 의심 신호로 셉니다.
export const CHATTER_MS = 80;

export type ButtonStats = { presses: number; chatter: number; lastUp: number | null; minGap: number | null };
export const emptyStats = (): ButtonStats => ({ presses: 0, chatter: 0, lastUp: null, minGap: null });

/** 누름(down) 하나를 반영한 새 통계. t는 ms(performance.now 등). */
export function press(s: ButtonStats, t: number, threshold = CHATTER_MS): ButtonStats {
  const gap = s.lastUp === null ? null : t - s.lastUp;
  const chatter = gap !== null && gap >= 0 && gap < threshold;
  return {
    ...s,
    presses: s.presses + 1,
    chatter: s.chatter + (chatter ? 1 : 0),
    minGap: gap !== null && gap >= 0 ? (s.minGap === null ? gap : Math.min(s.minGap, gap)) : s.minGap,
  };
}

/** 뗌(up) 시각을 기록한 새 통계. */
export const release = (s: ButtonStats, t: number): ButtonStats => ({ ...s, lastUp: t });

/** 최근 1초 안의 누름 수(CPS). times는 오름차순 누름 시각. */
export function cps(times: number[], now: number, windowMs = 1000): number {
  let n = 0;
  for (let i = times.length - 1; i >= 0 && now - times[i] <= windowMs; i--) n++;
  return n;
}

/** 버튼 번호(MouseEvent.button) → 이름 키. 0 왼쪽, 1 휠, 2 오른쪽, 3 뒤로, 4 앞으로. */
export const BUTTON_KEYS = ["left", "middle", "right", "back", "forward"] as const;
export type ButtonKey = (typeof BUTTON_KEYS)[number];
export const buttonKey = (b: number): ButtonKey | null => BUTTON_KEYS[b] ?? null;
