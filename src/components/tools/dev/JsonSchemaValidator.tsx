// JSON 스키마 검사기 (2026-11-16, Gemini 이전 D). 계산: lib/dev-tools.ts validateSchema·inferSchema.
import { useMemo, useState } from "react";
import type { Locale } from "../../../lib/i18n";
import { inferSchema, validateSchema, type Json, type SchemaIssue } from "../../../lib/dev-tools";
import { CopyButton, Field, areaCls, langOf, t, type Lang } from "./common";

const SAMPLE_SCHEMA = JSON.stringify({
  type: "object",
  required: ["id", "email", "plan"],
  additionalProperties: false,
  properties: {
    id: { type: "integer", minimum: 1 },
    email: { type: "string", format: "email" },
    plan: { enum: ["free", "pro"] },
    tags: { type: "array", items: { type: "string", minLength: 2 }, uniqueItems: true },
  },
}, null, 2);
const SAMPLE_DATA = JSON.stringify({ id: 0, email: "kim@example", plan: "team", tags: ["ai", "ai"], nickname: "k" }, null, 2);

function parse(text: string): { ok: true; value: Json } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) as Json };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** 오류 코드(keyword:값)를 사람이 읽는 말로. */
function explain(i: SchemaIssue, lang: Lang): string {
  const [code, ...rest] = i.message.split(":");
  const v = rest.join(":");
  const ko: Record<string, string> = {
    type: `자료형이 달라요: ${v.split(":")[0]} 필요, 지금은 ${v.split(":")[1]}`,
    required: `필수 키 "${v}"가 없어요`,
    enum: `허용 값이 아니에요 (${v})`,
    const: `값이 ${v}여야 해요`,
    additional: `스키마에 없는 키 "${v}"예요 (additionalProperties: false)`,
    format: `${v} 형식이 아니에요`,
    pattern: `정규식 ${v}에 맞지 않아요`,
    minLength: `글자가 ${v.split(":")[0]}자 이상이어야 해요 (지금 ${v.split(":")[1]})`,
    maxLength: `글자가 ${v.split(":")[0]}자 이하여야 해요 (지금 ${v.split(":")[1]})`,
    minimum: `${v} 이상이어야 해요`,
    maximum: `${v} 이하여야 해요`,
    exclusiveMinimum: `${v}보다 커야 해요`,
    exclusiveMaximum: `${v}보다 작아야 해요`,
    multipleOf: `${v}의 배수여야 해요`,
    minItems: `항목이 ${v.split(":")[0]}개 이상이어야 해요`,
    maxItems: `항목이 ${v.split(":")[0]}개 이하여야 해요`,
    uniqueItems: "같은 항목이 두 번 들어 있어요",
    anyOf: "anyOf의 어느 조건에도 맞지 않아요",
    oneOf: `oneOf 중 정확히 하나만 맞아야 하는데 ${v}개가 맞아요`,
    not: "not 조건에 걸렸어요",
    "not-allowed": "이 위치에는 값이 오면 안 돼요 (스키마 false)",
  };
  const en: Record<string, string> = {
    type: `Wrong type: expected ${v.split(":")[0]}, got ${v.split(":")[1]}`,
    required: `Missing required key "${v}"`,
    enum: `Not an allowed value (${v})`,
    const: `Must equal ${v}`,
    additional: `Key "${v}" is not in the schema (additionalProperties: false)`,
    format: `Not a valid ${v}`,
    pattern: `Does not match ${v}`,
    minLength: `Must be at least ${v.split(":")[0]} characters (has ${v.split(":")[1]})`,
    maxLength: `Must be at most ${v.split(":")[0]} characters (has ${v.split(":")[1]})`,
    minimum: `Must be ≥ ${v}`,
    maximum: `Must be ≤ ${v}`,
    exclusiveMinimum: `Must be > ${v}`,
    exclusiveMaximum: `Must be < ${v}`,
    multipleOf: `Must be a multiple of ${v}`,
    minItems: `Needs at least ${v.split(":")[0]} items`,
    maxItems: `Allows at most ${v.split(":")[0]} items`,
    uniqueItems: "Contains duplicate items",
    anyOf: "Matches none of anyOf",
    oneOf: `Must match exactly one of oneOf; matches ${v}`,
    not: "Matches the not schema",
    "not-allowed": "No value is allowed here (schema false)",
  };
  return (lang === "ko" ? ko : en)[code] ?? i.message;
}

export default function JsonSchemaValidator({ locale }: { locale: Locale }) {
  const lang = langOf(locale);
  const [schemaText, setSchemaText] = useState(SAMPLE_SCHEMA);
  const [dataText, setDataText] = useState(SAMPLE_DATA);
  const schema = useMemo(() => parse(schemaText), [schemaText]);
  const data = useMemo(() => parse(dataText), [dataText]);
  const result = schema.ok && data.ok ? validateSchema(schema.value, data.value) : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="JSON Schema">
          <textarea value={schemaText} onChange={(e) => setSchemaText(e.target.value)} rows={14} spellCheck={false} className={areaCls} aria-invalid={!schema.ok} />
        </Field>
        <Field label={t(lang, "검사할 JSON", "JSON to validate")}>
          <textarea value={dataText} onChange={(e) => setDataText(e.target.value)} rows={14} spellCheck={false} className={areaCls} aria-invalid={!data.ok} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!data.ok} onClick={() => data.ok && setSchemaText(JSON.stringify(inferSchema(data.value), null, 2))} className="min-h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-muted disabled:opacity-50">
          {t(lang, "이 JSON으로 스키마 초안 만들기", "Draft a schema from this JSON")}
        </button>
        <button type="button" disabled={!data.ok} onClick={() => data.ok && setDataText(JSON.stringify(data.value, null, 2))} className="min-h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-muted disabled:opacity-50">
          {t(lang, "JSON 보기 좋게 정렬", "Pretty-print JSON")}
        </button>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-card px-4 py-4" aria-live="polite">
        {!schema.ok && <p className="text-sm text-destructive">{t(lang, "스키마가 올바른 JSON이 아니에요: ", "Schema is not valid JSON: ")}{schema.error}</p>}
        {!data.ok && <p className="text-sm text-destructive">{t(lang, "검사할 값이 올바른 JSON이 아니에요: ", "Data is not valid JSON: ")}{data.error}</p>}
        {result && (
          <>
            <p className="text-base font-semibold text-foreground">
              {result.issues.length === 0 ? t(lang, "통과했어요. 스키마의 조건을 모두 지켜요.", "Valid. The JSON satisfies the schema.") : t(lang, `${result.issues.length}곳이 스키마와 맞지 않아요.`, `${result.issues.length} problem${result.issues.length > 1 ? "s" : ""} found.`)}
            </p>
            {result.issues.length > 0 && (
              <ul className="space-y-2">
                {result.issues.map((i, k) => (
                  <li key={k} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <code className="break-all font-mono text-xs text-muted-foreground">{i.path || "/"}</code>
                    <span className="block text-foreground">{explain(i, lang)}</span>
                  </li>
                ))}
              </ul>
            )}
            {result.unsupported.length > 0 && (
              <p className="text-xs leading-5 text-muted-foreground">
                {t(lang, "아래 키워드는 이 도구가 아직 검사하지 않아 건너뛰었어요: ", "These keywords are not checked by this tool and were skipped: ")}
                <code className="break-all font-mono">{result.unsupported.join(", ")}</code>
              </p>
            )}
            <CopyButton text={() => result.issues.map((i) => `${i.path || "/"}: ${explain(i, lang)}`).join("\n") || "valid"} lang={lang} label={t(lang, "결과 복사", "Copy result")} />
          </>
        )}
        <p className="text-xs leading-5 text-muted-foreground">{t(lang, "Draft 2020-12·07의 자주 쓰는 키워드(type, required, properties, items, enum, format, $ref, anyOf, oneOf, allOf 등)를 브라우저에서 검사해요. if/then/else·$dynamicRef·외부 $ref는 지원하지 않아요. 운영 검증에는 Ajv 같은 정식 검증기를 쓰세요.", "Checks the common Draft 2020-12/07 keywords (type, required, properties, items, enum, format, $ref, anyOf/oneOf/allOf…) in your browser. if/then/else, $dynamicRef and remote $ref are not supported; use a full validator such as Ajv in production.")}</p>
      </div>
    </div>
  );
}
