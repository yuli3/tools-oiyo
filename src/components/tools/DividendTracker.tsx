import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Locale } from '../../lib/i18n';
import { annualDividend, DIVIDEND_FREQ, monthlyNetSchedule, topPayers, yearOverYear, type DividendFreq } from '../../lib/savings-math';

/* Dividend record book, moved from blog.oiyo.net/{locale}/dividend-tracker/ on 2026-10-27 (W4).
 * Rows live in this browser's localStorage only. Browsers keep storage per site, so rows saved
 * on Blog do not appear here; the CSV import brings a Blog export across. */

type Holding = { id: string; ticker: string; shares: string; perShare: string; freq: DividendFreq; exDate: string; taxPct: string };
const KEY = 'oiyo:dividend-tracker:v1';
const HISTORY_KEY = 'oiyo:dividend-tracker:history:v1';
type YearRecord = { id: string; year: string; amount: string };
const HISTORY_COLS = { '--cols': '5.5rem 1fr auto auto' } as CSSProperties;
const FREQS = Object.keys(DIVIDEND_FREQ) as DividendFreq[];

const T: Record<Locale, Record<string, string>> = {
  ko: { ticker: '종목', shares: '수량', perShare: '1주 배당', freq: '주기', exDate: '배당기준일', tax: '세율 %', add: '+ 종목 추가', annualGross: '연 배당(세전)', annualNet: '연 배당(세후)', total: '합계', csv: 'CSV 내보내기', importCsv: 'CSV 불러오기', monthly: '월', quarterly: '분기', semiannual: '반기', annual: '연', local: '🔒 이 브라우저에만 저장돼요 · 서버로 보내지 않아요', remove: '종목 삭제', holding: '종목', moved: 'Blog에서 쓰던 기록은 Blog 화면에서 CSV로 내보낸 뒤 여기서 불러오세요.', bad: 'CSV를 읽지 못했어요.', monthlyTitle: '월별 배당(세후)', monthlyNote: '배당기준일이 있는 달부터 주기마다 받는다고 보고 나눴어요. 실제 지급 달은 종목마다 다를 수 있어요.', emptyMonth: '배당이 없는 달', topTitle: '많이 주는 종목 Top 5', historyTitle: '연도별로 받은 배당', historyNote: '실제로 받은 금액을 해마다 적으면 전년 대비 증감을 보여줘요.', year: '연도', amount: '받은 금액', addYear: '+ 연도 추가', yoy: '전년 대비', noPrev: '—' },
  en: { ticker: 'Ticker', shares: 'Shares', perShare: 'Div/share', freq: 'Frequency', exDate: 'Ex-date', tax: 'Tax %', add: '+ Add holding', annualGross: 'Annual (gross)', annualNet: 'Annual (net)', total: 'Total', csv: 'Export CSV', importCsv: 'Import CSV', monthly: 'Monthly', quarterly: 'Quarterly', semiannual: 'Semiannual', annual: 'Annual', local: '🔒 Stored in this browser only · never uploaded', remove: 'Remove holding', holding: 'Holding', moved: 'Used the Blog version? Export CSV there and import it here.', bad: 'Could not read that CSV.', monthlyTitle: 'Monthly dividends (net)', monthlyNote: 'Spread from each ex-date month at the payout frequency. Actual pay months vary by holding.', emptyMonth: 'No dividend', topTitle: 'Top 5 payers', historyTitle: 'Dividends received by year', historyNote: 'Log what you actually received each year to see the change from the year before.', year: 'Year', amount: 'Received', addYear: '+ Add year', yoy: 'vs prior year', noPrev: '—' },
  ja: { ticker: '銘柄', shares: '株数', perShare: '1株配当', freq: '頻度', exDate: '権利落ち日', tax: '税率 %', add: '+ 銘柄を追加', annualGross: '年間配当（税前）', annualNet: '年間配当（税後）', total: '合計', csv: 'CSVを書き出す', importCsv: 'CSVを読み込む', monthly: '毎月', quarterly: '四半期', semiannual: '半期', annual: '年次', local: '🔒 このブラウザーだけに保存 · サーバー送信なし', remove: '銘柄を削除', holding: '銘柄', moved: 'Blog版の記録は、Blog側でCSVを書き出してここで読み込んでください。', bad: 'CSVを読み込めませんでした。', monthlyTitle: '月別配当（税後）', monthlyNote: '権利落ち日の月から頻度ごとに受け取るとみなして配分しています。実際の支払月は銘柄により異なります。', emptyMonth: '配当なし', topTitle: '配当が多い銘柄 Top 5', historyTitle: '年別の受取配当', historyNote: '毎年実際に受け取った額を記録すると、前年比を表示します。', year: '年', amount: '受取額', addYear: '+ 年を追加', yoy: '前年比', noPrev: '—' },
  zh: { ticker: '代码', shares: '股数', perShare: '每股股息', freq: '频率', exDate: '除息日', tax: '税率 %', add: '+ 添加持仓', annualGross: '年度股息（税前）', annualNet: '年度股息（税后）', total: '合计', csv: '导出 CSV', importCsv: '导入 CSV', monthly: '每月', quarterly: '每季', semiannual: '半年', annual: '每年', local: '🔒 只保存在此浏览器 · 不上传服务器', remove: '删除持仓', holding: '持仓', moved: '使用过 Blog 版？请在那里导出 CSV，再在此导入。', bad: '无法读取该 CSV。', monthlyTitle: '每月股息（税后）', monthlyNote: '按除息日所在月份和频率推算分布，实际派息月份因持仓而异。', emptyMonth: '无股息', topTitle: '股息最多的 Top 5', historyTitle: '每年实收股息', historyNote: '每年记录实际收到的金额，即可查看同比变化。', year: '年份', amount: '实收金额', addYear: '+ 添加年份', yoy: '同比', noPrev: '—' },
  fr: { ticker: 'Ticker', shares: 'Parts', perShare: 'Div./part', freq: 'Fréquence', exDate: 'Date ex-div.', tax: 'Impôt %', add: '+ Ajouter une ligne', annualGross: 'Annuel brut', annualNet: 'Annuel net', total: 'Total', csv: 'Exporter CSV', importCsv: 'Importer CSV', monthly: 'Mensuel', quarterly: 'Trimestriel', semiannual: 'Semestriel', annual: 'Annuel', local: '🔒 Stocké dans ce navigateur seulement · aucun envoi', remove: 'Supprimer la ligne', holding: 'Ligne', moved: 'Vous utilisiez la version Blog ? Exportez le CSV là-bas puis importez-le ici.', bad: 'Impossible de lire ce CSV.', monthlyTitle: 'Dividendes par mois (net)', monthlyNote: 'Réparti à partir du mois de la date ex-dividende selon la fréquence. Les mois de versement réels varient.', emptyMonth: 'Aucun dividende', topTitle: 'Top 5 des payeurs', historyTitle: 'Dividendes reçus par année', historyNote: 'Notez chaque année le montant réellement reçu pour voir la variation sur un an.', year: 'Année', amount: 'Reçu', addYear: '+ Ajouter une année', yoy: 'sur un an', noPrev: '—' },
  es: { ticker: 'Ticker', shares: 'Acciones', perShare: 'Div./acción', freq: 'Frecuencia', exDate: 'Fecha ex-div.', tax: 'Impuesto %', add: '+ Añadir posición', annualGross: 'Anual bruto', annualNet: 'Anual neto', total: 'Total', csv: 'Exportar CSV', importCsv: 'Importar CSV', monthly: 'Mensual', quarterly: 'Trimestral', semiannual: 'Semestral', annual: 'Anual', local: '🔒 Guardado solo en este navegador · no se sube', remove: 'Eliminar posición', holding: 'Posición', moved: '¿Usabas la versión del Blog? Exporta el CSV allí e impórtalo aquí.', bad: 'No se pudo leer ese CSV.', monthlyTitle: 'Dividendos por mes (neto)', monthlyNote: 'Repartido desde el mes de la fecha ex-dividendo según la frecuencia. Los meses de pago reales varían.', emptyMonth: 'Sin dividendo', topTitle: 'Top 5 pagadores', historyTitle: 'Dividendos recibidos por año', historyNote: 'Anota lo que recibiste cada año para ver la variación interanual.', year: 'Año', amount: 'Recibido', addYear: '+ Añadir año', yoy: 'interanual', noPrev: '—' },
};

const newId = () => Math.random().toString(36).slice(2, 8);
const blank = (locale: Locale): Holding => ({ id: newId(), ticker: '', shares: '', perShare: '', freq: 'quarterly', exDate: '', taxPct: locale === 'ko' ? '15.4' : '' });
const num = (s: string) => Number.parseFloat(s) || 0;
const calc = (h: Holding) => annualDividend(num(h.shares), num(h.perShare), h.freq, num(h.taxPct));

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}

export default function DividendTracker({ locale }: { locale: Locale }) {
  const t = T[locale] ?? T.en;
  const [rows, setRows] = useState<Holding[]>(() => [blank(locale)]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<YearRecord[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length) setRows(p); }
      const hs = localStorage.getItem(HISTORY_KEY);
      if (hs) { const p = JSON.parse(hs); if (Array.isArray(p)) setHistory(p.filter((x) => x && typeof x.id === 'string')); }
    } catch { /* storage blocked: keep the blank row */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch { /* ignore */ } }, [rows, hydrated]);
  useEffect(() => { if (hydrated) try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ } }, [history, hydrated]);

  const parsed = useMemo(() => rows.map((h) => ({ ticker: h.ticker, shares: num(h.shares), perShare: num(h.perShare), freq: h.freq, exDate: h.exDate, taxPct: num(h.taxPct) })), [rows]);
  const months = useMemo(() => monthlyNetSchedule(parsed), [parsed]);
  const monthMax = Math.max(0, ...months);
  const top = useMemo(() => topPayers(parsed, 5), [parsed]);
  const yoy = useMemo(() => yearOverYear(history.filter((r) => r.year.trim() && r.amount.trim()).map((r) => ({ year: Number.parseInt(r.year, 10), amount: num(r.amount) }))), [history]);
  const monthName = useMemo(() => { const f = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : locale, { month: 'short' }); return Array.from({ length: 12 }, (_, i) => f.format(new Date(2026, i, 15))); }, [locale]);
  const setH = (id: string, k: 'year' | 'amount', v: string) => setHistory((r) => r.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const addYear = () => setHistory((r) => { const last = r.reduce((m, x) => Math.max(m, Number.parseInt(x.year, 10) || 0), 0); return [...r, { id: newId(), year: String(last ? last + 1 : new Date().getFullYear() - 1), amount: '' }]; });

  const totals = useMemo(() => rows.reduce((a, h) => { const c = calc(h); return { gross: a.gross + c.gross, net: a.net + c.net }; }, { gross: 0, net: 0 }), [rows]);
  const fmt = (n: number) => n.toLocaleString(locale, { maximumFractionDigits: 2 });
  const set = (id: string, k: keyof Holding, v: string) => setRows((r) => r.map((h) => (h.id === id ? { ...h, [k]: v } : h)));
  const del = (id: string) => setRows((r) => (r.length > 1 ? r.filter((h) => h.id !== id) : [blank(locale)]));

  const exportCsv = () => {
    const header = ['ticker', 'shares', 'perShare', 'freq', 'exDate', 'taxPct', 'annualGross', 'annualNet'];
    const lines = rows.map((h) => { const c = calc(h); return [h.ticker, h.shares, h.perShare, h.freq, h.exDate, h.taxPct, c.gross.toFixed(2), c.net.toFixed(2)].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','); });
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dividends.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (file: File) => {
    setError('');
    try {
      const lines = (await file.text()).split(/\r?\n/).filter((l) => l.trim());
      const head = parseCsvLine(lines[0] ?? '');
      const at = (name: string) => head.indexOf(name);
      if (at('ticker') < 0 || at('shares') < 0 || at('perShare') < 0) throw new Error('header');
      const next = lines.slice(1).map((l) => {
        const c = parseCsvLine(l);
        const freq = c[at('freq')] as DividendFreq;
        return { id: newId(), ticker: c[at('ticker')] ?? '', shares: c[at('shares')] ?? '', perShare: c[at('perShare')] ?? '', freq: FREQS.includes(freq) ? freq : 'quarterly', exDate: c[at('exDate')] ?? '', taxPct: c[at('taxPct')] ?? '' } satisfies Holding;
      });
      if (!next.length) throw new Error('empty');
      setRows(next);
    } catch { setError(t.bad); }
  };

  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
  return (
    <div className="space-y-4">
      {rows.map((h, i) => {
        const c = calc(h);
        return (
          <section key={h.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{t.holding} {i + 1}</span>
              <button type="button" aria-label={t.remove} onClick={() => del(h.id)} className="size-11 rounded-full text-muted-foreground">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <label className="col-span-2 block text-sm font-medium sm:col-span-1">{t.ticker}<input className={field} value={h.ticker} onChange={(e) => set(h.id, 'ticker', e.target.value)} placeholder="SCHD" /></label>
              <label className="block text-sm font-medium">{t.shares}<input className={field} inputMode="decimal" value={h.shares} onChange={(e) => set(h.id, 'shares', e.target.value)} /></label>
              <label className="block text-sm font-medium">{t.perShare}<input className={field} inputMode="decimal" value={h.perShare} onChange={(e) => set(h.id, 'perShare', e.target.value)} /></label>
              <label className="block text-sm font-medium">{t.freq}
                <select className={field} value={h.freq} onChange={(e) => set(h.id, 'freq', e.target.value)}>
                  {FREQS.map((f) => <option key={f} value={f}>{t[f]}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">{t.tax}<input className={field} inputMode="decimal" value={h.taxPct} onChange={(e) => set(h.id, 'taxPct', e.target.value)} /></label>
              <label className="col-span-2 block text-sm font-medium sm:col-span-1">{t.exDate}<input className={field} type="date" value={h.exDate} onChange={(e) => set(h.id, 'exDate', e.target.value)} /></label>
            </div>
            <p className="mt-3 flex flex-wrap justify-between gap-x-3 text-sm"><span className="text-muted-foreground">{t.annualNet}</span><span className="font-mono font-bold">{fmt(c.net)}</span></p>
          </section>
        );
      })}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setRows((r) => [...r, blank(locale)])} className="min-h-11 rounded-lg border border-border bg-background px-4 text-sm font-bold">{t.add}</button>
        <button type="button" onClick={exportCsv} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground">{t.csv}</button>
        <button type="button" onClick={() => fileRef.current?.click()} className="min-h-11 rounded-lg border border-border bg-background px-4 text-sm font-bold">{t.importCsv}</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importCsv(f); e.target.value = ''; }} />
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
      <section className="rounded-2xl border border-border bg-muted p-4">
        <p className="text-sm font-semibold">{t.total}</p>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.annualGross}</dt><dd className="font-mono">{fmt(totals.gross)}</dd></div>
          <div className="flex flex-wrap justify-between gap-x-3"><dt className="text-muted-foreground">{t.annualNet}</dt><dd className="font-mono text-lg font-extrabold text-primary">{fmt(totals.net)}</dd></div>
        </dl>
      </section>
      {totals.net > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4" aria-labelledby="div-monthly">
          <h2 id="div-monthly" className="text-sm font-semibold">{t.monthlyTitle}</h2>
          <div className="mt-3 grid h-40 grid-cols-12 items-end gap-1" role="img" aria-label={months.map((v, i) => `${monthName[i]} ${fmt(v)}`).join(', ')}>
            {months.map((v, i) => (
              <div key={i} className="flex h-full min-w-0 flex-col items-center justify-end gap-1" title={`${monthName[i]} ${fmt(v)}`}>
                <div className={v > 0 ? 'h-(--bar-h) w-full rounded-t bg-primary' : 'h-1 w-full rounded-t border border-dashed border-border'} style={{ '--bar-h': `${Math.max(4, (v / monthMax) * 100)}%` } as CSSProperties} />
                <span className="w-full text-center text-xs text-muted-foreground" aria-hidden="true">{i + 1}</span>
              </div>
            ))}
          </div>
          {months.some((v) => v === 0) && <p className="mt-2 text-xs text-muted-foreground">{t.emptyMonth}: {months.map((v, i) => (v === 0 ? monthName[i] : '')).filter(Boolean).join(', ')}</p>}
          <p className="mt-1 text-xs text-muted-foreground">{t.monthlyNote}</p>
        </section>
      )}
      {top.length > 1 && (
        <section className="rounded-2xl border border-border bg-card p-4" aria-labelledby="div-top">
          <h2 id="div-top" className="text-sm font-semibold">{t.topTitle}</h2>
          <ol className="mt-3 space-y-2">
            {top.map((x) => (
              <li key={x.ticker} className="text-sm">
                <div className="flex flex-wrap justify-between gap-x-3"><span className="font-semibold">{x.ticker}</span><span className="font-mono">{fmt(x.net)} · {x.share.toFixed(1)}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 w-(--bar-w) rounded-full bg-primary" style={{ '--bar-w': `${x.share}%` } as CSSProperties} /></div>
              </li>
            ))}
          </ol>
        </section>
      )}
      <section className="rounded-2xl border border-border bg-card p-4" aria-labelledby="div-history">
        <h2 id="div-history" className="text-sm font-semibold">{t.historyTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t.historyNote}</p>
        <div className="mt-3 space-y-2">
          {history.map((r) => {
            const row = yoy.find((y) => String(y.year) === r.year.trim());
            return (
              <div key={r.id} style={HISTORY_COLS} className="grid grid-cols-(--cols) items-end gap-2">
                <label className="block text-xs font-medium">{t.year}<input className={field} inputMode="numeric" value={r.year} onChange={(e) => setH(r.id, 'year', e.target.value)} /></label>
                <label className="block text-xs font-medium">{t.amount}<input className={field} inputMode="decimal" value={r.amount} onChange={(e) => setH(r.id, 'amount', e.target.value)} /></label>
                <span className={`min-h-11 py-3 font-mono text-xs ${row?.change == null ? 'text-muted-foreground' : row.change >= 0 ? 'text-primary' : 'text-destructive'}`} aria-label={t.yoy}>{row?.change == null ? t.noPrev : `${row.change >= 0 ? '+' : ''}${row.change.toFixed(1)}%`}</span>
                <button type="button" aria-label={t.remove} onClick={() => setHistory((h) => h.filter((x) => x.id !== r.id))} className="size-11 rounded-full text-muted-foreground">✕</button>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={addYear} className="mt-3 min-h-11 rounded-lg border border-border bg-background px-4 text-sm font-bold">{t.addYear}</button>
      </section>
      <p className="text-xs text-muted-foreground">{t.local}</p>
      <p className="text-xs text-muted-foreground">{t.moved}</p>
    </div>
  );
}
