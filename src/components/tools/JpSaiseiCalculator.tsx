import { useMemo, useState } from 'react';
import { jpSaiseiEstimate } from '../../lib/debt-relief';

/* 🇯🇵 債務整理の道しるべ + 個人再生の最低弁済額 (W5, 2026-10-27).
 * 民事再生法 §221①・§229②・§231②3–4 を e-Gov で確認。判定ではなく目安です。保存・送信しません。 */

type Answer = 'yes' | 'no' | '';
const Q = [
  { id: 'income', q: '今後も給与や事業収入など、継続した収入が見込めますか？' },
  { id: 'principal', q: '利息をカットすれば、元本を3〜5年で分割返済できそうですか？' },
  { id: 'home', q: '住宅ローンのある自宅を残したいですか？' },
] as const;

function route(a: Record<string, Answer>): [string, string] | null {
  if (!a.income) return null;
  if (a.income === 'no') return ['自己破産を検討', '継続収入がない場合、返済計画を前提とする任意整理・個人再生は難しくなります。自己破産（免責）を弁護士・司法書士や法テラスに相談してください。'];
  if (!a.principal) return null;
  if (a.principal === 'yes') return ['任意整理が候補', '裁判所を通さず、債権者と将来利息のカットや分割を交渉します。元本は原則として減りません。'];
  if (!a.home) return null;
  return a.home === 'yes'
    ? ['個人再生（住宅資金特別条項）が候補', '住宅ローンはそのまま払い、ほかの借金を下の最低弁済額まで減らして原則3年で返します。']
    : ['個人再生または自己破産', '元本の大幅な圧縮が必要です。下の最低弁済額と、財産を手放す自己破産を比べて専門家に相談してください。'];
}

export default function JpSaiseiCalculator() {
  const [ans, setAns] = useState<Record<string, Answer>>({ income: '', principal: '', home: '' });
  const [base, setBase] = useState('');
  const [liq, setLiq] = useState('');
  const [disp, setDisp] = useState('');
  const n = (s: string) => Number(s.replace(/[^0-9]/g, '')) || 0;
  const yen = (v: number) => `${new Intl.NumberFormat('ja-JP').format(Math.round(v))}円`;
  const show = (s: string) => (s ? new Intl.NumberFormat('ja-JP').format(n(s)) : '');
  const r = useMemo(() => jpSaiseiEstimate({ base: n(base), liquidation: n(liq), annualDisposable: n(disp) }), [base, liq, disp]);
  const path = route(ans);
  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base';
  const visible = Q.filter((_, i) => i === 0 || (i === 1 && ans.income === 'yes') || (i === 2 && ans.principal === 'no'));

  return (
    <div className="space-y-4">
      <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold">🇯🇵 日本の民事再生法・破産法</span>
      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-base font-bold">① 手続きの道しるべ</h2>
        {visible.map((q) => (
          <fieldset key={q.id} className="space-y-2">
            <legend className="text-sm font-medium">{q.q}</legend>
            <div className="flex gap-2">
              {(['yes', 'no'] as const).map((v) => (
                <button key={v} type="button" aria-pressed={ans[q.id] === v} onClick={() => setAns((p) => ({ ...p, [q.id]: v, ...(q.id === 'income' ? { principal: '', home: '' } : q.id === 'principal' ? { home: '' } : {}) }))}
                  className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-semibold ${ans[q.id] === v ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
                  {v === 'yes' ? 'はい' : 'いいえ'}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        {path && (
          <div className="rounded-xl border border-primary bg-background p-3" aria-live="polite">
            <p className="font-extrabold">{path[0]}</p>
            <p className="mt-1 text-sm text-muted-foreground">{path[1]}</p>
          </div>
        )}
      </section>
      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-base font-bold">② 個人再生の最低弁済額</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm font-medium">借金の総額（住宅ローン・担保で回収される分を除く）
            <input inputMode="numeric" className={field} value={show(base)} onChange={(e) => setBase(e.target.value)} placeholder="例：8,000,000" />
          </label>
          <label className="block text-sm font-medium">清算価値（財産の評価額、任意）
            <input inputMode="numeric" className={field} value={show(liq)} onChange={(e) => setLiq(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">年間の可処分所得（給与所得者等再生のみ、任意）
            <input inputMode="numeric" className={field} value={show(disp)} onChange={(e) => setDisp(e.target.value)} />
          </label>
        </div>
        {n(base) > 0 && (
          <div className="rounded-xl border border-border bg-background p-3" aria-live="polite">
            {r.eligible ? (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">法定の最低弁済額（§231）</dt><dd className="text-right font-mono">{yen(r.legalMinimum)}</dd>
                {r.salaryMinimum > 0 && <><dt className="text-muted-foreground">可処分所得の2年分（§241）</dt><dd className="text-right font-mono">{yen(r.salaryMinimum)}</dd></>}
                <dt className="font-semibold">返済総額の目安</dt><dd className="text-right font-mono text-base font-bold">{yen(r.plan)}</dd>
                <dt className="text-muted-foreground">3年（36回）なら月</dt><dd className="text-right font-mono">{yen(r.monthly36)}</dd>
                <dt className="text-muted-foreground">5年（60回）なら月</dt><dd className="text-right font-mono">{yen(r.monthly60)}</dd>
              </dl>
            ) : (
              <p className="text-sm">5,000万円を超えるため個人再生（小規模・給与所得者等）は使えません（民事再生法 §221①）。通常の民事再生や自己破産を専門家に相談してください。</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
