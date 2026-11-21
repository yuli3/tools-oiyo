// Recargos por presentación tardía, sanciones y plazos de recurso. Cálculo: lib/es-tax-pack-2026.ts
import { useState } from "react";
import { ES_TAX_AS_OF, ES_TAX_NOTE, SANCION_191, esPlazos, esRecargo, esSancion, type Gravedad } from "../../../lib/es-tax-pack-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";
import { Items } from "../nts/Items";

const TOOL_ID = "recargo-extemporaneo-sanciones-plazos";
const eur = (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`;
type YN = "y" | "n";
type Ac = "acuerdo" | "conformidad" | "ninguno";

export default function EsRecargo() {
  const [x, setX] = useState({ cuota: 2_000, due: "2026-04-20", filed: "2026-07-21", interes: 0, pago: "n" as YN, grav: "leve" as Gravedad, ac: "ninguno" as Ac, pronto: "n" as YN, notif: "2026-11-21", fin: "2026-06-30" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = esRecargo({ cuota: x.cuota, due: x.due, filed: x.filed, interesAnual: x.interes || undefined, pagoEnPlazo: x.pago === "y" });
  const s = esSancion({ base: x.cuota, gravedad: x.grav, acuerdo: x.ac, pronto: x.pronto === "y" });
  const p = esPlazos({ notificacion: x.notif || undefined, finPlazoVoluntario: x.fin || undefined });
  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <h3 className="font-semibold">1. Presento tarde sin que me lo pidan (recargo)</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Cuota a ingresar" value={x.cuota} onChange={(v) => upd({ cuota: v })} suffix="€" step={100} />
          <DateField label="Fin del plazo" value={x.due} onChange={(v) => upd({ due: v })} />
          <DateField label="Fecha de presentación" value={x.filed} onChange={(v) => upd({ filed: v })} />
          <NumberField label="Interés de demora anual (solo si pasan 12 meses)" value={x.interes} onChange={(v) => upd({ interes: v })} suffix="%" step={0.0625} />
        </div>
        <ChoiceChips<YN> legend="¿Pagarás el recargo en plazo (reducción del 25 %)?" value={x.pago} options={[{ value: "y", label: "Sí" }, { value: "n", label: "No" }]} onChange={(v) => upd({ pago: v })} />
        <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
          <p className="text-lg font-semibold text-foreground">Recargo aproximado: {eur(r.total)}</p>
          <Items items={r.items} />
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="font-semibold">2. Me han sancionado (art. 191)</h3>
        <ChoiceChips<Gravedad> legend="Calificación" value={x.grav} options={(Object.keys(SANCION_191) as Gravedad[]).map((k) => ({ value: k, label: SANCION_191[k].label }))} onChange={(v) => upd({ grav: v })} />
        <ChoiceChips<Ac> legend="Reducción" value={x.ac} options={[{ value: "ninguno", label: "Ninguna" }, { value: "conformidad", label: "Conformidad (30 %)" }, { value: "acuerdo", label: "Acta con acuerdo (65 %)" }]} onChange={(v) => upd({ ac: v })} />
        <ChoiceChips<YN> legend="¿Pagas en periodo voluntario sin recurrir (40 %)?" value={x.pronto} options={[{ value: "y", label: "Sí" }, { value: "n", label: "No" }]} onChange={(v) => upd({ pronto: v })} />
        <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
          <p className="text-lg font-semibold text-foreground">Sanción tras reducciones: {s.min === s.max ? eur(s.min) : `${eur(s.min)} – ${eur(s.max)}`} (base = cuota de arriba)</p>
          <Items items={s.items} />
        </div>
      </section>
      <section className="space-y-3 rounded-md border border-border bg-card px-4 py-4 text-sm">
        <h3 className="font-semibold">3. Quiero recurrir: plazos</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <DateField label="Fecha de notificación" value={x.notif} onChange={(v) => upd({ notif: v })} />
          <DateField label="Fin del plazo voluntario de la declaración" value={x.fin} onChange={(v) => upd({ fin: v })} />
        </div>
        <ul className="space-y-2">{p.plazos.map((a) => <li key={a.id}><span className="font-mono font-semibold">{a.date} </span>{a.label} <span className="text-xs text-muted-foreground">({a.cite})</span></li>)}</ul>
        <p className="text-xs text-muted-foreground">{p.note}</p>
      </section>
      <p className="text-xs leading-5 text-muted-foreground">{ES_TAX_NOTE} Actualizado el {ES_TAX_AS_OF}.</p>
    </div>
  );
}
