// Black Friday · Cyber Monday cart calculator (en·ja·zh·fr·es), 2026-11-21. Math: lib/black-friday.ts
import { useMemo, useState } from "react";
import { bfCart, dealCheck, salePrice, worthTopUp, type BfCart, type BfItem } from "../../../lib/black-friday";
import { WL_CURRENCY, type WL } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import { VizLangProvider, money } from "../viz/i18n";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { track } from "../viz/track";

interface Copy {
  price: string; sale: string; coupon: string; item: (n: number) => string; add: string; remove: string;
  couponType: string; pct: string; amount: string; minSpend: string; tax: string; taxHint: string; ship: string; freeOver: string;
  pay: string; saved: string; eff: string; summary: (pay: string, saved: string, eff: string) => string;
  lockedCoupon: (gap: string, off: string, worth: boolean) => string; shipGap: (gap: string, ship: string, worth: boolean) => string;
  chart: string; cap: string; bars: [string, string, string, string];
  dealTitle: string; dealNow: string; dealLow: string; deal: Record<"real" | "same" | "worse", (d: string, p: string) => string>; dealNote: string;
}

const C: Record<WL, Copy> = {
  en: {
    price: "Regular price", sale: "Black Friday discount", coupon: "Extra coupon (code, app, card)", item: (n) => `Item ${n}`, add: "Add item", remove: "Remove",
    couponType: "Cart coupon", pct: "% off", amount: "$ off", minSpend: "Minimum spend for the coupon", tax: "Sales tax rate", taxHint: "Your state + local rate. Use 0 if your state has no sales tax.", ship: "Shipping", freeOver: "Free shipping over",
    pay: "You pay", saved: "You save", eff: "Real discount",
    summary: (p, s, e) => `You pay about ${p} and save ${s}, a real discount of ${e} off the regular price.`,
    lockedCoupon: (g, o, w) => `The coupon is not unlocked yet. Add ${g} more to get ${o} off${w ? " — worth it only if you would buy that anyway." : ", which costs more than it saves."}`,
    shipGap: (g, s, w) => `Add ${g} more for free shipping (saves ${s})${w ? "." : " — paying shipping is cheaper."}`,
    chart: "From regular price to checkout", cap: "Tax is charged on the price after coupons. Shipping is added last.",
    bars: ["Regular price", "After sale prices", "After coupon", "Checkout total"],
    dealTitle: "Is it really a deal?", dealNow: "Black Friday price", dealLow: "Lowest price you saw in the last 30–90 days",
    deal: { real: (d, p) => `Real deal: ${d} (${p}) below the earlier low.`, same: () => "Same as the earlier low. The sale only matches a price you could already get.", worse: (d) => `Not a deal: ${d} more than the earlier low.` },
    dealNote: "Price trackers and your order history show past prices. A big “was” price is not proof of a discount.",
  },
  es: {
    price: "Precio habitual", sale: "Descuento Black Friday", coupon: "Cupón extra (código, app, tarjeta)", item: (n) => `Producto ${n}`, add: "Añadir producto", remove: "Quitar",
    couponType: "Cupón del carrito", pct: "% de descuento", amount: "€ de descuento", minSpend: "Compra mínima para el cupón", tax: "Impuesto aparte", taxHint: "En España el IVA ya está incluido en el precio: deja 0.", ship: "Envío", freeOver: "Envío gratis desde",
    pay: "Pagas", saved: "Ahorras", eff: "Descuento real",
    summary: (p, s, e) => `Pagas unos ${p} y ahorras ${s}: un descuento real del ${e} sobre el precio habitual.`,
    lockedCoupon: (g, o, w) => `El cupón aún no se activa. Añade ${g} para ahorrar ${o}${w ? "; solo compensa si ibas a comprarlo igualmente." : "; cuesta más de lo que ahorras."}`,
    shipGap: (g, s, w) => `Añade ${g} para el envío gratis (ahorras ${s})${w ? "." : "; sale más barato pagar el envío."}`,
    chart: "Del precio habitual al pago", cap: "El cupón se aplica tras las rebajas de cada producto; el envío se suma al final.",
    bars: ["Precio habitual", "Con rebajas", "Con cupón", "Total a pagar"],
    dealTitle: "¿Es una rebaja de verdad?", dealNow: "Precio Black Friday", dealLow: "Precio más bajo de los 30 días anteriores",
    deal: { real: (d, p) => `Rebaja real: ${d} (${p}) por debajo del mínimo anterior.`, same: () => "Igual que el mínimo anterior: no es más barato que antes.", worse: (d) => `No es rebaja: ${d} más caro que el mínimo anterior.` },
    dealNote: "En la UE, el «precio anterior» de un anuncio de rebaja debe ser el más bajo de al menos los 30 días previos (Directiva 98/6/CE, art. 6 bis).",
  },
  fr: {
    price: "Prix habituel", sale: "Remise Black Friday", coupon: "Code promo en plus (code, appli, carte)", item: (n) => `Article ${n}`, add: "Ajouter un article", remove: "Retirer",
    couponType: "Code sur le panier", pct: "% de remise", amount: "€ de remise", minSpend: "Montant minimum pour le code", tax: "Taxe en plus", taxHint: "En France, la TVA est déjà comprise dans le prix : laissez 0.", ship: "Livraison", freeOver: "Livraison offerte dès",
    pay: "Vous payez", saved: "Économie", eff: "Remise réelle",
    summary: (p, s, e) => `Vous payez environ ${p} et économisez ${s}, soit une remise réelle de ${e} sur le prix habituel.`,
    lockedCoupon: (g, o, w) => `Le code n’est pas encore actif. Ajoutez ${g} pour obtenir ${o} de remise${w ? ", utile seulement si vous l’auriez acheté de toute façon." : " : cela coûte plus que ça ne rapporte."}`,
    shipGap: (g, s, w) => `Ajoutez ${g} pour la livraison offerte (économie ${s})${w ? "." : " : payer la livraison revient moins cher."}`,
    chart: "Du prix habituel au paiement", cap: "Le code s’applique après les remises de chaque article ; la livraison s’ajoute à la fin.",
    bars: ["Prix habituel", "Après remises", "Après code promo", "Total payé"],
    dealTitle: "Vraie promo ou pas ?", dealNow: "Prix Black Friday", dealLow: "Prix le plus bas des 30 jours précédents",
    deal: { real: (d, p) => `Vraie promo : ${d} (${p}) sous le plus bas précédent.`, same: () => "Identique au plus bas précédent : pas moins cher qu’avant.", worse: (d) => `Pas une promo : ${d} de plus que le plus bas précédent.` },
    dealNote: "Dans l’UE, le « prix antérieur » affiché pour une réduction doit être le plus bas des 30 jours au moins avant la baisse (directive 98/6/CE, art. 6 bis).",
  },
  ja: {
    price: "通常価格", sale: "ブラックフライデー割引", coupon: "追加クーポン（コード・アプリ・カード）", item: (n) => `商品${n}`, add: "商品を追加", remove: "削除",
    couponType: "カートのクーポン", pct: "％引き", amount: "円引き", minSpend: "クーポンの最低購入金額", tax: "別途の税率", taxHint: "日本の表示価格は税込みが原則です。0のままにしてください。", ship: "送料", freeOver: "送料無料になる金額",
    pay: "支払う金額", saved: "お得な金額", eff: "実際の割引率",
    summary: (p, s, e) => `支払いは約${p}、通常価格より${s}お得で、実際の割引率は${e}です。`,
    lockedCoupon: (g, o, w) => `クーポンはまだ使えません。あと${g}買うと${o}引きになります${w ? "。もともと買う予定の物なら得です。" : "が、足す金額のほうが大きくなります。"}`,
    shipGap: (g, s, w) => `あと${g}で送料無料（${s}お得）${w ? "。" : "。送料を払うほうが安くなります。"}`,
    chart: "通常価格から支払いまで", cap: "クーポンは商品ごとの割引のあとに引かれ、送料は最後に足されます。",
    bars: ["通常価格", "セール価格", "クーポン後", "支払い合計"],
    dealTitle: "本当に安い？", dealNow: "ブラックフライデー価格", dealLow: "過去30〜90日の最安値",
    deal: { real: (d, p) => `本当に安い：これまでの最安値より${d}（${p}）安いです。`, same: () => "これまでの最安値と同じです。前から買えた値段です。", worse: (d) => `安くありません：これまでの最安値より${d}高いです。` },
    dealNote: "価格比較サイトや購入履歴で過去の値段を確かめましょう。大きな「通常価格」表示だけでは割引の証拠になりません。",
  },
  zh: {
    price: "平时价格", sale: "黑五折扣", coupon: "额外优惠券（代码、App、银行卡）", item: (n) => `商品 ${n}`, add: "添加商品", remove: "删除",
    couponType: "购物车优惠券", pct: "% 折扣", amount: "元立减", minSpend: "优惠券最低消费", tax: "另加税率", taxHint: "中国大陆标价通常已含增值税，填 0。在美国下单请填所在州的销售税率。", ship: "运费", freeOver: "满额包邮",
    pay: "实付", saved: "省下", eff: "实际折扣",
    summary: (p, s, e) => `实付约 ${p}，比平时价格省 ${s}，实际折扣 ${e}。`,
    lockedCoupon: (g, o, w) => `优惠券还没达到门槛。再买 ${g} 可减 ${o}${w ? "，前提是你本来就要买。" : "，凑单花的比省的多。"}`,
    shipGap: (g, s, w) => `再买 ${g} 包邮（省 ${s}）${w ? "。" : "，直接付运费更便宜。"}`,
    chart: "从平时价格到结账", cap: "优惠券在单品折扣之后扣减，运费最后加上。",
    bars: ["平时价格", "单品折后", "用券后", "结账总额"],
    dealTitle: "真的便宜吗？", dealNow: "黑五价格", dealLow: "过去 30–90 天见过的最低价",
    deal: { real: (d, p) => `真便宜：比之前最低价低 ${d}（${p}）。`, same: () => "和之前最低价一样，并没有更便宜。", worse: (d) => `不划算：比之前最低价贵 ${d}。` },
    dealNote: "用比价工具或订单记录查看历史价格。标出很高的“原价”并不能证明真的打折。",
  },
};

const DEFAULTS: Record<WL, { items: BfItem[]; coupon: number; couponType: "pct" | "amount"; minSpend: number; taxRate: number; shipping: number; freeShipOver: number; now: number; low: number }> = {
  en: { items: [{ price: 120, pct: 0.3 }, { price: 45, pct: 0.2 }], coupon: 0.1, couponType: "pct", minSpend: 0, taxRate: 0.07, shipping: 7.99, freeShipOver: 35, now: 84, low: 89 },
  es: { items: [{ price: 120, pct: 0.3 }, { price: 45, pct: 0.2 }], coupon: 0.1, couponType: "pct", minSpend: 0, taxRate: 0, shipping: 4.99, freeShipOver: 29, now: 84, low: 89 },
  fr: { items: [{ price: 120, pct: 0.3 }, { price: 45, pct: 0.2 }], coupon: 0.1, couponType: "pct", minSpend: 0, taxRate: 0, shipping: 4.99, freeShipOver: 35, now: 84, low: 89 },
  ja: { items: [{ price: 15000, pct: 0.3 }, { price: 5000, pct: 0.2 }], coupon: 0.1, couponType: "pct", minSpend: 0, taxRate: 0, shipping: 550, freeShipOver: 3980, now: 10500, low: 11000 },
  zh: { items: [{ price: 800, pct: 0.3 }, { price: 300, pct: 0.2 }], coupon: 0.1, couponType: "pct", minSpend: 0, taxRate: 0, shipping: 10, freeShipOver: 99, now: 560, low: 599 },
};

const MAX_ITEMS = 8;

export default function BlackFridayCart({ lang }: { lang: WL }) {
  const t = C[lang];
  const d = DEFAULTS[lang];
  const cur = WL_CURRENCY[lang];
  const step = cur === "JPY" ? 100 : 1;
  const m = (n: number) => money(n, lang, cur);
  const pc = (f: number) => new Intl.NumberFormat(lang === "en" ? "en-US" : lang, { style: "percent", maximumFractionDigits: 1 }).format(f);
  const [mode, setMode] = useAdvisoryMode("black-friday-calculator");
  const [items, setItems] = useState<BfItem[]>(d.items);
  const [coupon, setCoupon] = useState(d.coupon);
  const [couponType, setCouponType] = useState<"pct" | "amount">(d.couponType);
  const [minSpend, setMinSpend] = useState(d.minSpend);
  const [taxRate, setTaxRate] = useState(d.taxRate);
  const [shipping, setShipping] = useState(d.shipping);
  const [freeShipOver, setFreeShipOver] = useState(d.freeShipOver);
  const [now, setNow] = useState(d.now);
  const [low, setLow] = useState(d.low);
  const [touched, setTouched] = useState(false);

  const easy = mode === "easy";
  const cart: BfCart = easy
    ? { items: items.slice(0, 1), couponType: "pct", coupon: couponType === "pct" ? coupon : 0, minSpend: 0, taxRate, shipping: 0, freeShipOver: 0 }
    : { items, couponType, coupon, minSpend, taxRate, shipping, freeShipOver };
  const r = useMemo(() => bfCart(cart), [JSON.stringify(cart)]);
  const deal = dealCheck(now, low);
  const touch = () => {
    if (!touched) {
      setTouched(true);
      track("tool_input", { tool_id: "black-friday-calculator", mode });
    }
  };
  const setItem = (i: number, patch: Partial<BfItem>) => {
    touch();
    setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  };
  const couponReward = couponType === "pct" ? (r.sale + r.gapCoupon) * coupon : coupon;
  const shown = easy ? items.slice(0, 1) : items;

  return (
    <VizLangProvider value={{ lang, currency: cur }}>
      <div className="space-y-5" data-tool="black-friday-calculator">
        <ModeToggle mode={mode} onChange={setMode} />

        <ul className="space-y-3">
          {shown.map((it, i) => (
            <li key={i} className="rounded-xl border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{easy ? t.price : t.item(i + 1)}</span>
                {!easy && items.length > 1 && (
                  <button type="button" className="min-h-11 px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground" onClick={() => { touch(); setItems((xs) => xs.filter((_, j) => j !== i)); }}>
                    {t.remove}
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <NumberField label={t.price} value={it.price} onChange={(v) => setItem(i, { price: v })} suffix={cur} step={step} min={0} />
                <NumberField label={t.sale} value={Math.round(it.pct * 100)} onChange={(v) => setItem(i, { pct: v / 100 })} suffix="%" step={5} min={0} />
                <div className="flex flex-col justify-end text-sm text-muted-foreground">
                  <span>→</span>
                  <span className="font-mono text-base font-semibold text-foreground">{m(salePrice(it))}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {!easy && items.length < MAX_ITEMS && (
          <button type="button" className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted" onClick={() => { touch(); setItems((xs) => [...xs, { price: d.items[1].price, pct: 0.2 }]); }}>
            + {t.add}
          </button>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {!easy && (
            <fieldset className="space-y-1">
              <legend className="text-sm font-medium text-muted-foreground">{t.couponType}</legend>
              <div role="group" className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
                {(["pct", "amount"] as const).map((k) => (
                  <button key={k} type="button" aria-pressed={couponType === k} onClick={() => { touch(); setCouponType(k); setCoupon(k === "pct" ? 0.1 : cur === "JPY" ? 1000 : 10); }}
                    className={"min-h-11 rounded-md px-3 text-sm " + (couponType === k ? "bg-background font-semibold text-foreground shadow-sm" : "text-muted-foreground")}>
                    {k === "pct" ? t.pct : t.amount}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {couponType === "pct" || easy ? (
            <NumberField label={t.coupon} value={Math.round(coupon * 100)} onChange={(v) => { touch(); setCouponType("pct"); setCoupon(v / 100); }} suffix="%" step={5} min={0} />
          ) : (
            <NumberField label={t.coupon} value={coupon} onChange={(v) => { touch(); setCoupon(v); }} suffix={cur} step={step} min={0} />
          )}
          {!easy && <NumberField label={t.minSpend} value={minSpend} onChange={(v) => { touch(); setMinSpend(v); }} suffix={cur} step={step} min={0} />}
          <div>
            <NumberField label={t.tax} value={Math.round(taxRate * 10000) / 100} onChange={(v) => { touch(); setTaxRate(v / 100); }} suffix="%" step={0.25} min={0} />
            <p className="mt-1 text-xs text-muted-foreground">{t.taxHint}</p>
          </div>
          {!easy && <NumberField label={t.ship} value={shipping} onChange={(v) => { touch(); setShipping(v); }} suffix={cur} step={step} min={0} />}
          {!easy && <NumberField label={t.freeOver} value={freeShipOver} onChange={(v) => { touch(); setFreeShipOver(v); }} suffix={cur} step={step} min={0} />}
        </div>

        <section aria-live="polite" className="rounded-xl border border-primary bg-primary/10 p-4">
          <p className="text-sm leading-relaxed text-foreground">{t.summary(m(r.total), m(r.saved), pc(r.effective))}</p>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[[t.pay, m(r.total)], [t.saved, m(r.saved)], [t.eff, pc(r.effective)]].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-background p-2">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-mono text-base font-bold text-foreground sm:text-lg">{v}</dd>
              </div>
            ))}
          </dl>
          {!easy && r.gapCoupon > 0 && <p className="mt-3 text-sm text-foreground">{t.lockedCoupon(m(r.gapCoupon), m(couponReward), worthTopUp(r.gapCoupon, couponReward))}</p>}
          {!easy && r.gapShip > 0 && <p className="mt-2 text-sm text-foreground">{t.shipGap(m(r.gapShip), m(shipping), worthTopUp(r.gapShip, shipping))}</p>}
        </section>

        <CompareBars
          title={t.chart}
          caption={t.cap}
          format={m}
          items={[
            { label: t.bars[0], value: r.list },
            { label: t.bars[1], value: r.sale },
            { label: t.bars[2], value: r.afterCoupon },
            { label: t.bars[3], value: r.total, current: true },
          ]}
        />

        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-bold text-foreground">{t.dealTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label={t.dealNow} value={now} onChange={(v) => { touch(); setNow(v); }} suffix={cur} step={step} min={0} />
            <NumberField label={t.dealLow} value={low} onChange={(v) => { touch(); setLow(v); }} suffix={cur} step={step} min={0} />
          </div>
          <p className="text-sm font-semibold text-foreground">{t.deal[deal.verdict](m(Math.abs(deal.diff)), pc(Math.abs(deal.pct)))}</p>
          <p className="text-xs text-muted-foreground">{t.dealNote}</p>
        </section>
      </div>
    </VizLangProvider>
  );
}
