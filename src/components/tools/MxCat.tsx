import { useState } from "react";
import { mxCat } from "../../lib/country-finance-5";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const mxn = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

export default function MxCat() {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("30");
  const [months, setMonths] = useState("24");
  const [commission, setCommission] = useState("2");
  const [fee, setFee] = useState("100");
  let r: ReturnType<typeof mxCat> | null = null;
  try {
    r = mxCat({ amount: num(amount), annualRatePct: num(rate), months: num(months), openingCommissionPct: num(commission), monthlyFee: num(fee) });
  } catch {
    r = null;
  }
  const rows: [string, string, (v: string) => void][] = [
    ["Monto del crédito (MXN)", amount, setAmount],
    ["Tasa de interés anual fija (%)", rate, setRate],
    ["Plazo (meses)", months, setMonths],
    ["Comisión por apertura (% del monto)", commission, setCommission],
    ["Seguro u otro cargo fijo al mes (MXN)", fee, setFee],
  ];
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        {rows.map(([label, value, set]) => (
          <label key={label} className="block text-sm">{label}<input inputMode="decimal" className={field} value={value} onChange={(e) => set(e.target.value)} /></label>
        ))}
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? (
          <p>Escribe un monto mayor que 0, una tasa de 0 a 300 %, un plazo de 1 a 480 meses y cargos de 0 o más.</p>
        ) : (
          <>
            <p className="text-xl font-bold">CAT aproximado: {r.catPct.toFixed(1)} % sin IVA</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Pago mensual de capital e intereses: {mxn(r.payment)}</li>
              <li>Recibes en realidad: {mxn(r.netReceived)} (después de la comisión por apertura)</li>
              <li>Pagas en total: {mxn(r.totalPaid)}</li>
            </ul>
          </>
        )}
        <p className="mt-3 text-sm">El CAT oficial lo calcula cada institución con todos sus cargos. Úsalo para comparar ofertas con los mismos supuestos; el IVA sobre intereses no está incluido.</p>
      </section>
    </div>
  );
}
