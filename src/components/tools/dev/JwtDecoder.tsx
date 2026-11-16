// JWT 해석·보안 점검 (2026-11-16, Gemini 이전 D2 — AgentJwtSecurityGuard 대체). 계산: lib/dev-security.ts inspectJwt.
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { inspectJwt, type JwtFinding } from "../../../lib/dev-security";
import { CopyButton, Field, areaCls, langOf, t, type Lang } from "./common";

const b64u = (o: unknown) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const SAMPLE = `${b64u({ alg: "HS256", typ: "JWT" })}.${b64u({ sub: "user_42", name: "Kim", role: "admin", iat: 1763251200, exp: 1794787200 })}.Zm9vYmFyc2lnbmF0dXJl`;

const MSG: Record<string, { ko: string; en: string }> = {
  "alg-none": { ko: "alg가 none(서명 없음)이에요. 서버가 이 토큰을 받아들이면 누구나 내용을 바꿔 위조할 수 있어요. 검증할 때 허용 알고리즘을 고정하세요.", en: "alg is none (unsigned). If a server accepts it, anyone can forge claims. Pin the allowed algorithms when verifying." },
  "no-signature": { ko: "서명 부분이 비어 있어요.", en: "The signature part is empty." },
  hmac: { ko: "HMAC(대칭키) 서명이에요. 비밀키가 32바이트 이상 무작위 값인지, 토큰을 받는 모든 서비스가 같은 키를 갖는 게 괜찮은지 확인하세요.", en: "HMAC (shared secret). Make sure the secret is 32+ random bytes and that every verifier holding it is trusted." },
  "remote-key": { ko: "헤더의 jku/x5u가 외부 키 주소를 가리켜요. 서버가 이 주소를 그대로 믿으면 공격자 키로 검증될 수 있어요.", en: "jku/x5u points to a remote key URL. Never let the token choose where its key comes from." },
  "embedded-jwk": { ko: "헤더 안에 공개키(jwk)가 들어 있어요. 토큰이 준 키로 검증하면 위조를 막을 수 없어요.", en: "The header embeds its own jwk. Verifying with a key supplied by the token defeats the signature." },
  "kid-injection": { ko: "kid에 경로·따옴표 문자가 있어요. kid로 파일이나 DB를 찾는다면 경로 조작·SQL 주입을 막으세요.", en: "kid contains path or quote characters. If kid is used to look up files or rows, guard against traversal and SQL injection." },
  "no-exp": { ko: "만료(exp)가 없어요. 유출되면 영원히 쓸 수 있어요.", en: "No exp claim: a leaked token works forever." },
  expired: { ko: "이미 만료된 토큰이에요.", en: "This token has expired." },
  "long-lived": { ko: "유효기간이 깁니다. 접근 토큰은 보통 15분~1시간, 길면 리프레시 토큰으로 나눠요.", en: "Long lifetime. Access tokens usually live 15–60 minutes; use refresh tokens for longer sessions." },
  "not-yet": { ko: "nbf(사용 시작 시각)가 아직 오지 않았어요.", en: "nbf is in the future; the token is not valid yet." },
  "future-iat": { ko: "발급 시각(iat)이 미래예요. 서버 시계를 확인하세요.", en: "iat is in the future; check server clocks." },
  "no-aud": { ko: "aud(대상 서비스)가 없어요. 다른 서비스용 토큰을 그대로 받아들이는 실수를 막으려면 aud를 넣고 검증하세요.", en: "No aud claim. Add and check aud so a token for one service is not accepted by another." },
  "no-iss": { ko: "iss(발급자)가 없어요.", en: "No iss claim." },
  "sensitive-claim": { ko: "민감해 보이는 값이 들어 있어요. JWT 내용은 암호화가 아니라 누구나 읽을 수 있어요.", en: "Sensitive-looking claims. JWT payloads are encoded, not encrypted: anyone can read them." },
};
const ERR: Record<string, { ko: string; en: string }> = {
  parts: { ko: "JWT는 점(.)으로 나뉜 세 부분이어야 해요.", en: "A JWT has three dot-separated parts." },
  base64: { ko: "Base64URL로 읽을 수 없는 부분이 있어요.", en: "A part is not valid Base64URL." },
  json: { ko: "헤더나 내용이 JSON이 아니에요.", en: "Header or payload is not JSON." },
  jwe: { ko: "다섯 부분짜리 암호화 토큰(JWE)이에요. 키 없이는 내용을 볼 수 없어요.", en: "This is an encrypted JWE (five parts); it cannot be read without the key." },
};
const LEVEL = { high: { ko: "위험", en: "Risk" }, medium: { ko: "주의", en: "Check" }, info: { ko: "참고", en: "Note" } };
const TIME_CLAIMS = ["iat", "nbf", "exp"] as const;

function Finding({ f, lang }: { f: JwtFinding; lang: Lang }) {
  return (
    <li className="flex gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
      <span className={"w-10 shrink-0 font-semibold " + (f.level === "high" ? "text-destructive" : f.level === "medium" ? "text-foreground" : "text-muted-foreground")}>{LEVEL[f.level][lang]}</span>
      <span className="min-w-0 text-foreground">
        {MSG[f.id][lang]}
        {f.id === "long-lived" && f.detail ? t(lang, ` (${f.detail}일)`, ` (${f.detail} days)`) : f.detail && f.id !== "expired" ? <code className="ml-1 break-all font-mono text-xs text-muted-foreground">{f.detail}</code> : null}
      </span>
    </li>
  );
}

export default function JwtDecoder({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const [token, setToken] = useState(SAMPLE);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Math.floor(Date.now() / 1000)), []);
  const r = useMemo(() => inspectJwt(token, now ?? 0), [token, now]);
  const fmt = (s: number) => new Date(s * 1000).toLocaleString(lang === "ko" ? "ko-KR" : "en-US");
  const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");

  return (
    <div className="space-y-5">
      <Field label={t(lang, "JWT 붙여 넣기 (Bearer 포함 가능)", "Paste a JWT (with or without Bearer)")}>
        <textarea value={token} onChange={(e) => setToken(e.target.value)} rows={4} spellCheck={false} className={areaCls + " break-all"} />
      </Field>
      {parts.length === 3 && (
        <p className="break-all font-mono text-xs leading-5">
          <span className="text-destructive">{parts[0]}</span>.<span className="text-primary">{parts[1]}</span>.<span className="text-muted-foreground">{parts[2]}</span>
        </p>
      )}
      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        {!r.ok ? (
          <p className="text-sm text-destructive">{ERR[r.error][lang]}</p>
        ) : (
          <>
            <p className="text-base font-semibold text-foreground">
              {r.findings.some((f) => f.level === "high")
                ? t(lang, `위험 ${r.findings.filter((f) => f.level === "high").length}개를 찾았어요.`, `${r.findings.filter((f) => f.level === "high").length} risk(s) found.`)
                : t(lang, "큰 위험은 보이지 않아요. 서명은 서버에서 키로 따로 검증해야 해요.", "No major risks spotted. The signature still has to be verified server-side with the key.")}
            </p>
            {now !== null && r.times.exp !== undefined && (
              <p className="text-sm text-muted-foreground">
                {r.times.exp > now ? t(lang, `만료까지 ${Math.round((r.times.exp - now) / 3600).toLocaleString()}시간 남았어요.`, `Expires in ${Math.round((r.times.exp - now) / 3600).toLocaleString()} hours.`) : t(lang, `${Math.round((now - r.times.exp) / 3600).toLocaleString()}시간 전에 만료됐어요.`, `Expired ${Math.round((now - r.times.exp) / 3600).toLocaleString()} hours ago.`)}
              </p>
            )}
            <ul className="space-y-2">{r.findings.map((f) => <Finding key={f.id} f={f} lang={lang} />)}</ul>
            <div className="grid gap-3 md:grid-cols-2">
              {([["Header", r.header], ["Payload", r.payload]] as const).map(([name, obj]) => (
                <div key={name}>
                  <h2 className="text-sm font-semibold text-foreground">{name}</h2>
                  <pre className="mt-1 max-h-72 overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs leading-5 text-foreground">{JSON.stringify(obj, null, 2)}</pre>
                </div>
              ))}
            </div>
            {now !== null && TIME_CLAIMS.some((k) => r.times[k] !== undefined) && (
              <dl className="grid grid-cols-3 gap-2 text-xs">
                {TIME_CLAIMS.filter((k) => r.times[k] !== undefined).map((k) => (
                  <div key={k}><dt className="font-mono text-muted-foreground">{k}</dt><dd className="text-foreground">{fmt(r.times[k]!)}</dd></div>
                ))}
              </dl>
            )}
            <CopyButton text={() => JSON.stringify(r.payload, null, 2)} lang={lang} label={t(lang, "Payload 복사", "Copy payload")} />
          </>
        )}
        <p className="text-xs leading-5 text-muted-foreground">{t(lang, "토큰은 이 브라우저 안에서만 풀어요. 그래도 운영 중인 실제 토큰은 붙여 넣지 말고, 만료됐거나 테스트용 토큰을 쓰세요. 서명이 맞는지는 키가 있어야 확인할 수 있어 여기서는 검증하지 않아요.", "Tokens are decoded only in this browser. Still, avoid pasting live production tokens; use expired or test tokens. Signatures need the key and are not verified here.")}</p>
      </div>
    </div>
  );
}
