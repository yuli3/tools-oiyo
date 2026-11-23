// 1년 낮 길이 포스터용 일출·일몰 근사식(NOAA, 대기차 포함 천정거리 90.833°). 브라우저에서 바로 돌아요.
// daylight.test.ts가 astronomy-engine과 2분 안인지 확인해요. (2026-11-22, 창의 제안 #6 데이터 아트)
const RAD = Math.PI / 180;

function solar(jd: number) {
  const t = (jd - 2451545) / 36525;
  const L0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360;
  const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const C = Math.sin(M * RAD) * (1.914602 - t * (0.004817 + 0.000014 * t)) + Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * t) + Math.sin(3 * M * RAD) * 0.000289;
  const omega = 125.04 - 1934.136 * t;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD));
  const y = Math.tan((eps / 2) * RAD) ** 2;
  const eqTime = (4 / RAD) * (y * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(M * RAD) + 4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) - 0.5 * y * y * Math.sin(4 * L0 * RAD) - 1.25 * e * e * Math.sin(2 * M * RAD));
  return { decl, eqTime };
}

/** 그날(UTC 날짜) 일출·일몰을 UTC 0시부터의 분으로. 극야·백야면 null */
function event(lat: number, lon: number, y: number, m: number, d: number, rise: boolean): number | null {
  const jd0 = Date.UTC(y, m - 1, d) / 86_400_000 + 2440587.5;
  let min = 720 - 4 * lon;
  for (let i = 0; i < 3; i++) {
    const { decl, eqTime } = solar(jd0 + min / 1440);
    const cosH = (Math.cos(90.833 * RAD) - Math.sin(lat * RAD) * Math.sin(decl)) / (Math.cos(lat * RAD) * Math.cos(decl));
    if (cosH > 1 || cosH < -1) return null;
    const H = Math.acos(cosH) / RAD;
    min = 720 - 4 * (lon + (rise ? H : -H)) - eqTime;
  }
  return min;
}

export interface DayLight { date: string; rise: number | null; set: number | null; /** 낮 길이(분) */ length: number | null }

/** 그해 매일의 현지 일출·일몰(현지 시각, 0시부터 분). tzHours: 표준시 UTC 오프셋 */
export function yearDaylight(lat: number, lon: number, year: number, tzHours: number): DayLight[] {
  const out: DayLight[] = [];
  for (let t = Date.UTC(year, 0, 1); t < Date.UTC(year + 1, 0, 1); t += 86_400_000) {
    const dt = new Date(t);
    const [y, m, d] = [dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()];
    // 현지 날짜의 일출은 UTC로 전날일 수 있어 현지 정오 기준 날짜로 계산해요
    const r = event(lat, lon, y, m, d, true);
    const s = event(lat, lon, y, m, d, false);
    const rise = r == null ? null : (((r + tzHours * 60) % 1440) + 1440) % 1440;
    const set = s == null ? null : (((s + tzHours * 60) % 1440) + 1440) % 1440;
    out.push({ date: dt.toISOString().slice(0, 10), rise, set, length: rise != null && set != null ? (set - rise + 1440) % 1440 : null });
  }
  return out;
}

export const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(Math.round(min % 60) === 60 ? 59 : Math.round(min % 60)).padStart(2, "0")}`;

export interface City { id: string; name: string; lat: number; lon: number; tz: number }
export const KR_CITIES: City[] = [
  { id: "seoul", name: "서울", lat: 37.5665, lon: 126.978, tz: 9 },
  { id: "busan", name: "부산", lat: 35.1796, lon: 129.0756, tz: 9 },
  { id: "incheon", name: "인천", lat: 37.4563, lon: 126.7052, tz: 9 },
  { id: "daegu", name: "대구", lat: 35.8714, lon: 128.6014, tz: 9 },
  { id: "daejeon", name: "대전", lat: 36.3504, lon: 127.3845, tz: 9 },
  { id: "gwangju", name: "광주", lat: 35.1595, lon: 126.8526, tz: 9 },
  { id: "ulsan", name: "울산", lat: 35.5384, lon: 129.3114, tz: 9 },
  { id: "gangneung", name: "강릉", lat: 37.7519, lon: 128.8761, tz: 9 },
  { id: "jeju", name: "제주", lat: 33.4996, lon: 126.5312, tz: 9 },
  { id: "dokdo", name: "독도", lat: 37.2412, lon: 131.8648, tz: 9 },
];
