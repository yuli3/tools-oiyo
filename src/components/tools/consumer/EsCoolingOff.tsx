// Plazo de desistimiento (TRLGDCU). Cálculo: lib/world-consumer-pack-2026.ts
import { useState } from "react";
import { CONSUMER_AS_OF, esCoolingOff, type EsKind } from "../../../lib/world-consumer-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { coolingCurve } from "./CoolingCurve";

const TOOL_ID = "plazo-desistimiento-compra-online";

export default function EsCoolingOff() {
  const [x, setX] = useState({ kind: "bienes" as EsKind, date: "2026-11-20", infoGiven: true, infoDate: "", withdrawalSent: "", elapsed: 3 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const svc = x.kind === "servicios";
  const r = esCoolingOff({ kind: x.kind, delivered: svc ? undefined : x.date, contractDate: svc ? x.date : undefined, infoGiven: x.infoGiven, infoDate: x.infoDate || undefined, withdrawalSent: x.withdrawalSent || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="es" currency="EUR"
      curve={coolingCurve({ start: x.date, lastDay: r.lastDay, title: "Días que le quedan para desistir", caption: "Contados desde la fecha que ha puesto. Envíe el desistimiento antes de llegar a cero.", xLabel: "Días transcurridos", yLabel: "Días restantes", unit: (n) => `${Math.round(n)} d`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 20 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<EsKind> legend="¿Qué ha contratado?" value={x.kind} options={[{ value: "bienes", label: "Un producto" }, { value: "servicios", label: "Un servicio" }]} onChange={(v) => upd({ kind: v })} />
          <DateField label={svc ? "Fecha de celebración del contrato" : "Fecha de recepción del producto"} value={x.date} onChange={(v) => upd({ date: v })} />
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="¿Le informaron del derecho de desistimiento?" value={x.infoGiven ? "y" : "n"} options={[{ value: "y", label: "Sí" }, { value: "n", label: "No" }]} onChange={(v) => upd({ infoGiven: v === "y" })} />}
          {mode === "expert" && !x.infoGiven && <DateField label="Fecha en que recibió la información (si la recibió)" value={x.infoDate} onChange={(v) => upd({ infoDate: v })} />}
          {mode === "expert" && <DateField label="Fecha en que comunicó el desistimiento" value={x.withdrawalSent} onChange={(v) => upd({ withdrawalSent: v })} />}
          <LaborResult mode={mode} headline={r.lastDay ? `Puede desistir hasta el ${r.lastDay}` : "Tiene 14 días naturales"} sub="Compras a distancia y fuera del establecimiento" items={r.items} dates={r.dates} datesTitle="Fechas" note={`Información general (Ley General para la Defensa de los Consumidores y Usuarios, guía de Consumo Responde). No es asesoramiento jurídico. Para reclamar: la OMIC de su municipio. Actualizado ${CONSUMER_AS_OF}. Lo que escribe no sale de su navegador.`} />
        </>
      )}
    </CurveShell>
  );
}
