import { useMemo, useState } from "react";
import { quartiles } from "../../lib/quartile";
import type { Locale } from "../../lib/i18n";

// 2026-10-29: migrated from the statistical Blog utility, not the Lost Ark q1q3 route.
const L: Record<Locale, {
  inputLabel: string; placeholder: string; calc: string; clear: string;
  n: string; min: string; q1: string; median: string; q3: string; max: string; iqr: string;
  outliers: string; none: string; fence: string; invalid: string; sorted: string;
}> = {
  ko: { inputLabel: "숫자 목록 (쉼표·공백·줄바꿈 구분)", placeholder: "예: 12, 7, 3, 15, 9, 21, 5", calc: "계산", clear: "지우기", n: "개수", min: "최솟값", q1: "제1사분위수 (Q1)", median: "중앙값", q3: "제3사분위수 (Q3)", max: "최댓값", iqr: "사분위범위 (IQR)", outliers: "이상치 (1.5×IQR 기준)", none: "없음", fence: "1.5×IQR 울타리", invalid: "유효한 숫자 2~1,000개를 입력해 주세요. 소수점은 점(.)을 쓰고 잘못된 값은 지워 주세요.", sorted: "정렬된 데이터" },
  en: { inputLabel: "Numbers (comma, space or newline separated)", placeholder: "e.g. 12, 7, 3, 15, 9, 21, 5", calc: "Calculate", clear: "Clear", n: "Count", min: "Min", q1: "First quartile (Q1)", median: "Median", q3: "Third quartile (Q3)", max: "Max", iqr: "Interquartile range (IQR)", outliers: "Outliers (1.5×IQR rule)", none: "None", fence: "1.5×IQR fences", invalid: "Enter 2–1,000 valid numbers. Use a decimal point; invalid tokens are not ignored.", sorted: "Sorted data" },
  ja: { inputLabel: "数値リスト（カンマ・空白・改行区切り）", placeholder: "例: 12, 7, 3, 15, 9, 21, 5", calc: "計算", clear: "クリア", n: "個数", min: "最小値", q1: "第1四分位数 (Q1)", median: "中央値", q3: "第3四分位数 (Q3)", max: "最大値", iqr: "四分位範囲 (IQR)", outliers: "外れ値（1.5×IQR基準）", none: "なし", fence: "1.5×IQRの境界", invalid: "有効な数値を2〜1,000個入力してください。小数点はピリオドを使い、無効な値は除いてください。", sorted: "整列データ" },
  zh: { inputLabel: "数字列表（逗号、空格或换行分隔）", placeholder: "例: 12, 7, 3, 15, 9, 21, 5", calc: "计算", clear: "清空", n: "个数", min: "最小值", q1: "第一四分位数 (Q1)", median: "中位数", q3: "第三四分位数 (Q3)", max: "最大值", iqr: "四分位距 (IQR)", outliers: "离群值（1.5×IQR 规则）", none: "无", fence: "1.5×IQR边界", invalid: "请输入2至1,000个有效数字。小数点使用点号，无效值不会被忽略。", sorted: "排序后的数据" },
  fr: { inputLabel: "Nombres (séparés par virgule, espace ou retour)", placeholder: "ex. 12, 7, 3, 15, 9, 21, 5", calc: "Calculer", clear: "Effacer", n: "Effectif", min: "Min", q1: "Premier quartile (Q1)", median: "Médiane", q3: "Troisième quartile (Q3)", max: "Max", iqr: "Écart interquartile (IQR)", outliers: "Valeurs aberrantes (règle 1,5×IQR)", none: "Aucune", fence: "Bornes à 1,5×IQR", invalid: "Saisissez 2 à 1 000 nombres valides avec un point décimal. Les valeurs invalides ne sont pas ignorées.", sorted: "Données triées" },
  es: { inputLabel: "Números (separados por coma, espacio o salto)", placeholder: "ej. 12, 7, 3, 15, 9, 21, 5", calc: "Calcular", clear: "Borrar", n: "Cantidad", min: "Mín", q1: "Primer cuartil (Q1)", median: "Mediana", q3: "Tercer cuartil (Q3)", max: "Máx", iqr: "Rango intercuartílico (IQR)", outliers: "Valores atípicos (regla 1,5×IQR)", none: "Ninguno", fence: "Límites de 1,5×IQR", invalid: "Introduce entre 2 y 1.000 números válidos con punto decimal. No se omiten valores inválidos.", sorted: "Datos ordenados" },
};

function fmt(x: number): string {
  return Number.isInteger(x) ? String(x) : x.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export default function QuartileCalculator({ locale }: { locale: Locale }) {
  const t = L[locale] ?? L.en;
  const [raw, setRaw] = useState("");
  const [show, setShow] = useState(false);

  const result = useMemo(() => {
    try { return quartiles(raw); } catch { return null; }
  }, [raw]);

  return (
    <div className="my-5 sm:my-8 mx-auto max-w-xl rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="q1q3-in">{t.inputLabel}</label>
      <textarea id="q1q3-in" rows={3} value={raw} placeholder={t.placeholder}
        onChange={(e) => { setRaw(e.target.value); setShow(false); }}
        className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <div className="mt-3 flex gap-2">
        <button onClick={() => setShow(true)} disabled={!result}
          className="min-h-11 flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40">{t.calc}</button>
        <button onClick={() => { setRaw(""); setShow(false); }}
          className="min-h-11 rounded-xl border border-border px-4 py-2.5 text-sm font-bold hover:bg-muted">{t.clear}</button>
      </div>
      {raw.trim() && !result && <p className="mt-3 text-xs text-destructive">{t.invalid}</p>}
      {show && result && (
        <div className="mt-5 space-y-3" role="status" aria-live="polite">
          <svg viewBox="0 0 400 100" className="w-full text-primary" role="img" aria-label={`${t.q1}: ${fmt(result.q1)}, ${t.median}: ${fmt(result.med)}, ${t.q3}: ${fmt(result.q3)}`}>
            {(() => {
              const range = result.max - result.min;
              const x = (n: number) => range === 0 ? 200 : 20 + ((n-result.min)/range)*360;
              return <g stroke="currentColor" fill="none">
                <line x1={x(result.whiskerMin)} y1="50" x2={x(result.whiskerMax)} y2="50" />
                <line x1={x(result.whiskerMin)} y1="35" x2={x(result.whiskerMin)} y2="65" />
                <line x1={x(result.whiskerMax)} y1="35" x2={x(result.whiskerMax)} y2="65" />
                <rect x={x(result.q1)} y="25" width={Math.max(1,x(result.q3)-x(result.q1))} height="50" fill="currentColor" fillOpacity="0.15" />
                <line x1={x(result.med)} y1="25" x2={x(result.med)} y2="75" strokeWidth="3" />
                {result.outliers.map((n,i) => <circle key={i} cx={x(n)} cy="50" r="3" />)}
              </g>;
            })()}
          </svg>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {([
              [t.n, String(result.n)], [t.min, fmt(result.min)], [t.max, fmt(result.max)],
              [t.q1, fmt(result.q1)], [t.median, fmt(result.med)], [t.q3, fmt(result.q3)],
            ] as const).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{k}</p>
                <p className="text-lg font-black tabular-nums">{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">{t.iqr}</p>
            <p className="text-2xl font-black tabular-nums text-primary">{fmt(result.iqr)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.fence}: {fmt(result.lo)} ~ {fmt(result.hi)}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-3 text-xs">
            <b>{t.outliers}:</b> {result.outliers.length ? result.outliers.map(fmt).join(", ") : t.none}
          </div>
          <p className="break-all text-xs text-muted-foreground"><b>{t.sorted}:</b> {result.s.map(fmt).join(", ")}</p>
        </div>
      )}
    </div>
  );
}
