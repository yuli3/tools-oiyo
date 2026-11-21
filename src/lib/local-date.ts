/**
 * 브라우저(사용자) 기준 날짜 문자열 YYYY-MM-DD.
 * new Date().toISOString().slice(0, 10)은 UTC 날짜라 한국에서는 오전 9시 전까지 하루 전 날짜가 나와요.
 */
export function localIsoDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 한국 시간 기준 오늘. 서버·빌드 환경 시간대와 상관없이 같아요. */
export function kstIsoDate(d: Date = new Date()): string {
  return new Date(d.getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
}

/** 사용자 기준 오늘에서 n일 더한 날짜. */
export function localIsoDateOffset(days: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return localIsoDate(d);
}
