// GA4 이벤트: 모드 전환·가정 슬라이더 사용 여부만 보내요. 입력값·결과 금액은 보내지 않아요.
type Gtag = (...args: unknown[]) => void;
const sent = new Set<string>();

export function track(name: string, params: Record<string, string>, once = false) {
  if (typeof window === "undefined") return;
  const key = `${name}:${JSON.stringify(params)}`;
  if (once && sent.has(key)) return;
  sent.add(key);
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  try {
    gtag?.("event", name, params);
  } catch {
    /* 계측 실패는 화면에 영향 없음 */
  }
}
