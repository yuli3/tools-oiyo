'use client';
/**
 * 간단계산기 — N분의 1 (2026-11-22 rewrite).
 * WHY: 카드로 한 사람이 결제하고 나머지가 송금하는 상황이 대부분이에요. 송금 단위로 내림하고
 * 남는 돈은 결제한 사람이 떠안아 합계가 결제 금액과 정확히 같아요. 6개 언어·통화를 지원해요.
 */
import { useMemo, useState } from 'react';
import type { Locale } from '../../lib/i18n';
import { splitBill, type SplitMode } from '../../lib/bill-split';

type Cur = 'KRW' | 'JPY' | 'USD' | 'EUR' | 'CNY' | 'GBP';
const SCALE: Record<Cur, number> = { KRW: 1, JPY: 1, USD: 100, EUR: 100, CNY: 100, GBP: 100 };
const UNITS: Record<Cur, number[]> = { KRW: [1, 10, 100, 1000], JPY: [1, 10, 100, 1000], USD: [0.01, 0.25, 1, 5], EUR: [0.01, 0.1, 1, 5], CNY: [0.01, 0.1, 1, 10], GBP: [0.01, 0.1, 1, 5] };
const DEFAULT: Record<Locale, { cur: Cur; total: string; unit: number }> = {
  ko: { cur: 'KRW', total: '87000', unit: 100 },
  ja: { cur: 'JPY', total: '12800', unit: 100 },
  en: { cur: 'USD', total: '128.40', unit: 0.01 },
  fr: { cur: 'EUR', total: '96.50', unit: 0.1 },
  es: { cur: 'EUR', total: '96.50', unit: 0.1 },
  zh: { cur: 'CNY', total: '688', unit: 1 },
};
const INTL: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', fr: 'fr-FR', es: 'es-ES' };

interface T {
  total: string; currency: string; mode: string; modes: Record<SplitMode, string>; unit: string; people: string; person: (n: number) => string;
  add: string; remove: string; weight: string; fixed: string; fixedHint: string; payer: string; payerMark: string;
  each: string; collect: string; extra: (a: string) => string; over: string; copy: string; copied: string;
  message: (title: string, rows: string, payer: string) => string; title: string; perHead: string;
}
const L: Record<Locale, T> = {
  ko: {
    total: '카드 결제 금액', currency: '통화', mode: '나누는 방법', modes: { equal: 'N분의 1', ratio: '비율', custom: '일부 금액 지정' }, unit: '송금 단위', people: '함께한 사람', person: (n) => `사람 ${n}`,
    add: '사람 추가', remove: '빼기', weight: '몫', fixed: '정한 금액', fixedHint: '비우면 나머지를 똑같이 나눠요', payer: '결제한 사람', payerMark: '결제',
    each: '각자 낼 돈', collect: '결제한 사람이 받을 돈', extra: (a) => `송금 단위로 내림해서 결제한 사람이 ${a} 더 내요.`, over: '정한 금액 합계가 결제 금액보다 커요. 금액을 확인해 주세요.',
    copy: '정산 문구 복사', copied: '복사했어요', title: '정산', perHead: '1인당',
    message: (title, rows, payer) => `[${title}]\n${rows}\n→ ${payer}에게 보내 주세요.`,
  },
  en: {
    total: 'Card bill total', currency: 'Currency', mode: 'How to split', modes: { equal: 'Equal (1/N)', ratio: 'By shares', custom: 'Some fixed' }, unit: 'Round transfers to', people: 'People', person: (n) => `Person ${n}`,
    add: 'Add person', remove: 'Remove', weight: 'Shares', fixed: 'Fixed amount', fixedHint: 'Leave empty to split the rest equally', payer: 'Who paid', payerMark: 'Paid',
    each: 'Each person pays', collect: 'Payer collects', extra: (a) => `Transfers are rounded down, so the payer covers ${a} extra.`, over: 'Fixed amounts add up to more than the bill. Check the numbers.',
    copy: 'Copy summary', copied: 'Copied', title: 'Bill split', perHead: 'Per person',
    message: (title, rows, payer) => `[${title}]\n${rows}\n→ Please send to ${payer}.`,
  },
  ja: {
    total: 'カード支払い合計', currency: '通貨', mode: '分け方', modes: { equal: '均等割り', ratio: '比率', custom: '一部金額指定' }, unit: '送金単位', people: '参加者', person: (n) => `参加者${n}`,
    add: '人を追加', remove: '削除', weight: '比率', fixed: '指定額', fixedHint: '空欄なら残りを均等に分けます', payer: '支払った人', payerMark: '支払',
    each: 'それぞれの支払額', collect: '支払った人が受け取る額', extra: (a) => `送金単位で切り捨てるため、支払った人が${a}多く負担します。`, over: '指定額の合計が支払額を超えています。金額を確認してください。',
    copy: '精算メッセージをコピー', copied: 'コピーしました', title: '割り勘', perHead: '1人あたり',
    message: (title, rows, payer) => `【${title}】\n${rows}\n→ ${payer}さんに送金してください。`,
  },
  zh: {
    total: '刷卡总额', currency: '货币', mode: '分摊方式', modes: { equal: '平均分', ratio: '按比例', custom: '部分指定' }, unit: '转账单位', people: '参与者', person: (n) => `参与者${n}`,
    add: '添加', remove: '删除', weight: '份数', fixed: '指定金额', fixedHint: '留空则平分剩余金额', payer: '付款人', payerMark: '付款',
    each: '每人应付', collect: '付款人应收', extra: (a) => `转账金额向下取整，付款人多承担 ${a}。`, over: '指定金额合计超过总额，请检查。',
    copy: '复制结算文字', copied: '已复制', title: 'AA结算', perHead: '人均',
    message: (title, rows, payer) => `【${title}】\n${rows}\n→ 请转给${payer}。`,
  },
  fr: {
    total: 'Montant payé par carte', currency: 'Devise', mode: 'Répartition', modes: { equal: 'Parts égales', ratio: 'Par parts', custom: 'Montants fixes' }, unit: 'Arrondir les virements à', people: 'Participants', person: (n) => `Personne ${n}`,
    add: 'Ajouter', remove: 'Retirer', weight: 'Parts', fixed: 'Montant fixe', fixedHint: 'Vide = partage égal du reste', payer: 'Qui a payé', payerMark: 'A payé',
    each: 'Chacun paie', collect: 'À récupérer par le payeur', extra: (a) => `Les virements sont arrondis vers le bas : le payeur avance ${a} de plus.`, over: 'Les montants fixes dépassent la note. Vérifiez les chiffres.',
    copy: 'Copier le récapitulatif', copied: 'Copié', title: 'Partage de la note', perHead: 'Par personne',
    message: (title, rows, payer) => `[${title}]\n${rows}\n→ À virer à ${payer}.`,
  },
  es: {
    total: 'Total pagado con tarjeta', currency: 'Moneda', mode: 'Cómo dividir', modes: { equal: 'A partes iguales', ratio: 'Por partes', custom: 'Importes fijos' }, unit: 'Redondear transferencias a', people: 'Personas', person: (n) => `Persona ${n}`,
    add: 'Añadir', remove: 'Quitar', weight: 'Partes', fixed: 'Importe fijo', fixedHint: 'Vacío = el resto a partes iguales', payer: 'Quién pagó', payerMark: 'Pagó',
    each: 'Cada uno paga', collect: 'Recibe quien pagó', extra: (a) => `Las transferencias se redondean a la baja: quien pagó pone ${a} más.`, over: 'Los importes fijos superan el total. Revisa las cifras.',
    copy: 'Copiar resumen', copied: 'Copiado', title: 'Cuenta dividida', perHead: 'Por persona',
    message: (title, rows, payer) => `[${title}]\n${rows}\n→ Envía a ${payer}.`,
  },
};

interface Row { id: number; name: string; weight: string; fixed: string }
const field = 'min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring';
const chip = 'min-h-11 rounded-lg border px-3 text-sm font-semibold transition-colors';
const chipOn = 'border-primary bg-primary text-primary-foreground';
const chipOff = 'border-border bg-card text-foreground hover:border-primary/50';

export default function DutchPayCalculator({ locale = 'ko' }: { locale?: Locale }) {
  const t = L[locale] ?? L.en;
  const d = DEFAULT[locale] ?? DEFAULT.en;
  const [cur, setCur] = useState<Cur>(d.cur);
  const [total, setTotal] = useState(d.total);
  const [unit, setUnit] = useState<number>(d.unit);
  const [mode, setMode] = useState<SplitMode>('equal');
  const [payer, setPayer] = useState(0);
  const [copied, setCopied] = useState(false);
  const [rows, setRows] = useState<Row[]>(() => [1, 2, 3, 4].map((n) => ({ id: n, name: t.person(n), weight: '1', fixed: '' })));

  const scale = SCALE[cur];
  const fmt = useMemo(() => new Intl.NumberFormat(INTL[locale], { style: 'currency', currency: cur, minimumFractionDigits: scale === 1 ? 0 : 2, maximumFractionDigits: scale === 1 ? 0 : 2 }), [locale, cur, scale]);
  const money = (minor: number) => fmt.format(minor / scale);

  const result = useMemo(() => {
    const totalMinor = Math.round((Number(total) || 0) * scale);
    return splitBill({
      total: totalMinor,
      unit: Math.round(unit * scale),
      mode,
      payer,
      people: rows.map((r) => ({ name: r.name.trim() || '—', weight: Number(r.weight) || 0, fixed: r.fixed.trim() === '' ? null : Math.round((Number(r.fixed) || 0) * scale) })),
    });
  }, [total, unit, mode, payer, rows, scale]);

  const setRow = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const add = () => setRows((rs) => (rs.length >= 30 ? rs : [...rs, { id: Date.now(), name: t.person(rs.length + 1), weight: '1', fixed: '' }]));
  const remove = (i: number) => {
    setRows((rs) => (rs.length <= 2 ? rs : rs.filter((_, j) => j !== i)));
    setPayer((p) => (p === i ? 0 : p > i ? p - 1 : p));
  };
  const changeCur = (c: Cur) => { setCur(c); setUnit(UNITS[c][0]); };

  const payerName = result.rows[payer]?.name ?? '';
  const message = t.message(
    `${t.title} ${money(Math.round((Number(total) || 0) * scale))}`,
    result.rows.filter((r) => !r.isPayer).map((r) => `${r.name} ${money(r.share)}`).join('\n'),
    payerName,
  );
  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };
  const perHead = rows.length > 0 ? Math.round((Number(total) || 0) * scale) / rows.length : 0;

  return (
    <div className="space-y-5" data-tool="dutch-pay">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm font-semibold text-foreground sm:col-span-2">
          <span>{t.total}</span>
          <input className={field} type="number" inputMode="decimal" min="0" step="any" value={total} onChange={(e) => setTotal(e.target.value)} />
        </label>
        <label className="space-y-1 text-sm font-semibold text-foreground">
          <span>{t.currency}</span>
          <select className={field} value={cur} onChange={(e) => changeCur(e.target.value as Cur)}>
            {(Object.keys(SCALE) as Cur[]).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-foreground">{t.mode}</legend>
        <div className="grid grid-cols-3 gap-2">
          {(['equal', 'ratio', 'custom'] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`${chip} ${mode === m ? chipOn : chipOff}`}>{t.modes[m]}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-foreground">{t.unit}</legend>
        <div className="grid grid-cols-4 gap-2">
          {UNITS[cur].map((u) => (
            <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)} className={`${chip} ${unit === u ? chipOn : chipOff}`}>{fmt.format(u)}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-foreground">{t.people} · {rows.length}</legend>
        {mode === 'custom' && <p className="text-xs text-muted-foreground">{t.fixedHint}</p>}
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.id} className="flex items-center gap-2">
              <label className={`${chip} flex shrink-0 cursor-pointer items-center gap-1 ${payer === i ? chipOn : chipOff}`}>
                <input type="radio" name="dutch-payer" className="sr-only" checked={payer === i} onChange={() => setPayer(i)} aria-label={`${t.payer}: ${r.name}`} />
                <span aria-hidden="true">{payer === i ? '💳' : '○'}</span>
                <span className="text-xs">{t.payerMark}</span>
              </label>
              <input className={`${field} min-w-0 flex-1`} value={r.name} onChange={(e) => setRow(r.id, { name: e.target.value })} aria-label={t.person(i + 1)} />
              {mode === 'ratio' && <input className={`${field} w-16 shrink-0 text-center`} type="number" inputMode="decimal" min="0" value={r.weight} onChange={(e) => setRow(r.id, { weight: e.target.value })} aria-label={`${t.weight}: ${r.name}`} />}
              {mode === 'custom' && <input className={`${field} w-24 shrink-0`} type="number" inputMode="decimal" min="0" placeholder="—" value={r.fixed} onChange={(e) => setRow(r.id, { fixed: e.target.value })} aria-label={`${t.fixed}: ${r.name}`} />}
              <button type="button" onClick={() => remove(i)} disabled={rows.length <= 2} aria-label={`${t.remove}: ${r.name}`} className="min-h-11 min-w-11 shrink-0 rounded-lg text-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30">×</button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={add} className={`${chip} ${chipOff} w-full`}>+ {t.add}</button>
      </fieldset>

      <section aria-live="polite" className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-foreground">{t.each}</h2>
          {mode === 'equal' && <span className="text-sm text-muted-foreground">{t.perHead} {money(perHead)}</span>}
        </div>
        {result.overFixed ? (
          <p role="alert" className="text-sm text-destructive">{t.over}</p>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {result.rows.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate font-medium text-foreground">{r.isPayer ? '💳 ' : ''}{r.name}</span>
                  <span className="shrink-0 font-bold tabular-nums text-foreground">{money(r.share)}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold text-foreground">{t.collect}: <span className="tabular-nums text-primary">{money(result.toCollect)}</span></p>
            {result.payerExtra > 0 && <p className="text-xs text-muted-foreground">{t.extra(money(result.payerExtra))}</p>}
            <button type="button" onClick={copy} className={`${chip} ${chipOn} w-full`}>{copied ? t.copied : t.copy}</button>
          </>
        )}
      </section>
    </div>
  );
}
