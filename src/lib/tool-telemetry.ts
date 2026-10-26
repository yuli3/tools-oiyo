// 2026-10-27 세운 결정(도구는 Tools로 모은다, 선행작업=계측): GA4에는 페이지뷰만 있어
// 도구별 "실제로 계산했는지"를 알 수 없었다. 페이지마다 계산 코드가 달라(React 18종,
// 인라인 스크립트 다수) 각 계산 함수에 이벤트를 심지 않고, 사용자가 입력한 뒤
// 본문이 바뀌는 첫 순간을 계산 완료의 대리 신호로 쓴다.
// 개인정보: 입력값·결과 금액·파일명은 보내지 않는다. tool_id와 locale만 보낸다.

export const LOCALES = ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const;

// `/ko/gas-bill-calculator/` → `gas-bill-calculator`. 홈(`/`, `/en/`)은 도구가 아니다.
export function toolIdFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  if (!(LOCALES as readonly string[]).includes(parts[0])) return null;
  const slug = parts[1];
  return /^[a-z0-9-]{2,80}$/.test(slug) ? slug : null;
}

// 광고는 사용자 입력과 무관하게 본문 DOM을 바꾼다. 이 변화를 계산으로 세면 안 된다.
export const IGNORE_SELECTOR =
  '[data-manual-ad], ins, iframe, .adsbygoogle, .google-auto-placed, [data-telemetry-ignore]';

export interface TelemetryNode {
  closest?: (selector: string) => unknown;
  parentElement?: TelemetryNode | null;
}

export function isIgnoredNode(node: TelemetryNode | null | undefined): boolean {
  if (!node) return true;
  const el = typeof node.closest === 'function' ? node : node.parentElement;
  if (!el || typeof el.closest !== 'function') return true;
  return Boolean(el.closest(IGNORE_SELECTOR));
}
