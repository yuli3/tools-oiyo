// HTTP 보안 헤더 점검 (2026-11-16, Gemini 이전 D2 — AgentCorsHeaderGuard 대체·확장). 계산: lib/dev-security.ts checkSecurityHeaders.
import { useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { checkSecurityHeaders, type HeaderCheck } from "../../../lib/dev-security";
import BarTrack from "../viz/BarTrack";
import { CopyButton, Field, areaCls, langOf, t, type Lang } from "./common";

const SAMPLE = `HTTP/2 200
content-type: text/html; charset=utf-8
server: nginx/1.18.0
x-powered-by: Express
strict-transport-security: max-age=86400
access-control-allow-origin: *
set-cookie: session=abc123; Path=/; HttpOnly`;

const INFO: Record<string, { ko: [string, string]; en: [string, string]; fix: string }> = {
  hsts: { ko: ["HTTPS 강제(HSTS)", "6개월(15552000초) 이상 권장. 하위 도메인까지 HTTPS라면 includeSubDomains를 더하세요."], en: ["HTTPS enforcement (HSTS)", "Use at least 6 months (15552000 s); add includeSubDomains when all subdomains are HTTPS."], fix: "Strict-Transport-Security: max-age=63072000; includeSubDomains" },
  csp: { ko: ["콘텐츠 보안 정책(CSP)", "XSS를 막는 가장 강한 헤더예요. unsafe-inline 대신 nonce나 해시를 쓰세요."], en: ["Content-Security-Policy", "The strongest XSS defense. Prefer nonces or hashes over unsafe-inline."], fix: "Content-Security-Policy: default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
  frame: { ko: ["다른 사이트 안에 넣기 막기(클릭재킹)", "X-Frame-Options: DENY 또는 CSP frame-ancestors를 쓰세요."], en: ["Clickjacking protection", "Use X-Frame-Options: DENY or CSP frame-ancestors."], fix: "X-Frame-Options: DENY" },
  nosniff: { ko: ["파일 형식 추측 막기", "nosniff를 넣어요."], en: ["MIME sniffing protection", "Send nosniff."], fix: "X-Content-Type-Options: nosniff" },
  referrer: { ko: ["주소 전달 범위(Referrer-Policy)", "strict-origin-when-cross-origin을 권장해요."], en: ["Referrer-Policy", "strict-origin-when-cross-origin is a safe default."], fix: "Referrer-Policy: strict-origin-when-cross-origin" },
  permissions: { ko: ["기능 권한(Permissions-Policy)", "쓰지 않는 카메라·마이크·위치를 끄세요."], en: ["Permissions-Policy", "Disable camera, microphone and geolocation you do not use."], fix: "Permissions-Policy: camera=(), microphone=(), geolocation=()" },
  cors: { ko: ["CORS 허용 출처", "* 와 credentials=true를 함께 쓰면 안 돼요. 허용할 출처를 적으세요."], en: ["CORS allowed origin", "Never combine * with credentials=true; list allowed origins."], fix: "Access-Control-Allow-Origin: https://app.example.com" },
  cookies: { ko: ["쿠키 보안 속성", "Secure·HttpOnly·SameSite가 빠진 쿠키가 있어요."], en: ["Cookie flags", "Some cookies lack Secure, HttpOnly or SameSite."], fix: "Set-Cookie: session=…; Secure; HttpOnly; SameSite=Lax" },
  "version-leak": { ko: ["서버 버전 노출", "버전 번호는 공격자에게 알려진 취약점을 알려 줘요. 숨기세요."], en: ["Server version disclosure", "Version numbers point attackers to known CVEs; hide them."], fix: "" },
  corp: { ko: ["창 격리(COOP)", "same-origin이면 다른 창의 접근을 막아요."], en: ["Cross-Origin-Opener-Policy", "same-origin isolates your window from others."], fix: "Cross-Origin-Opener-Policy: same-origin" },
};
const ST = (s: HeaderCheck["status"], lang: Lang) => (s === "pass" ? t(lang, "좋아요", "Pass") : s === "warn" ? t(lang, "보완", "Improve") : t(lang, "없음", "Missing"));

export default function SecurityHeadersChecker({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const [raw, setRaw] = useState(SAMPLE);
  const r = useMemo(() => checkSecurityHeaders(raw), [raw]);
  const fixes = r.checks.filter((c) => c.status !== "pass" && INFO[c.id].fix).map((c) => INFO[c.id].fix);

  return (
    <div className="space-y-5">
      <Field label={t(lang, "응답 헤더 붙여 넣기", "Paste response headers")} hint={t(lang, "개발자 도구 → 네트워크 → 문서 요청 → 응답 헤더 복사, 또는 curl -sI https://사이트", "DevTools → Network → document request → copy response headers, or curl -sI https://your-site")}>
        <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={9} spellCheck={false} className={areaCls} />
      </Field>
      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        <div>
          <p className="text-base font-semibold text-foreground">{t(lang, `보안 헤더 점수 ${r.score}/100.`, `Security header score ${r.score}/100.`)}</p>
          <div className="mt-2"><BarTrack segments={[{ from: 0, to: r.score, tone: r.score >= 80 ? "primary" : r.score >= 50 ? "warning" : "destructive" }]} /></div>
        </div>
        <ul className="space-y-2">
          {r.checks.map((c) => (
            <li key={c.id} className="flex gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <span className={"w-12 shrink-0 font-semibold " + (c.status === "pass" ? "text-success" : c.status === "warn" ? "text-foreground" : "text-destructive")}>{ST(c.status, lang)}</span>
              <span className="min-w-0">
                <span className="block text-foreground">{INFO[c.id][lang][0]}</span>
                {c.value && <code className="block break-all font-mono text-xs text-muted-foreground">{c.value}</code>}
                {c.status !== "pass" && <span className="block text-xs leading-5 text-muted-foreground">{INFO[c.id][lang][1]}</span>}
              </span>
            </li>
          ))}
        </ul>
        {fixes.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t(lang, "출발점으로 쓸 헤더", "Starter headers")}</h2>
            <pre className="mt-1 overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs leading-5 text-foreground">{fixes.join("\n")}</pre>
            <div className="mt-2"><CopyButton text={() => fixes.join("\n")} lang={lang} label={t(lang, "헤더 복사", "Copy headers")} /></div>
          </div>
        )}
        <p className="text-xs leading-5 text-muted-foreground">{t(lang, "붙여 넣은 헤더만 이 브라우저에서 읽어요. CSP는 사이트마다 필요한 출처가 달라 그대로 붙이면 화면이 깨질 수 있으니 Report-Only로 먼저 시험하세요.", "Only the pasted headers are read, in your browser. CSP needs site-specific sources; try it as Report-Only first so nothing breaks.")}</p>
      </div>
    </div>
  );
}
