import {useState} from 'react';
import {confirmedDifference} from '../../lib/labor-confirmed-arithmetic';
type Props={steps:readonly (readonly string[])[];locale:string;kind?:'hours'|'money'};
const copy={
de:{heading:'Ihre Dokumentenprüfung',progress:'Geprüfte Punkte',note:'Die Markierungen bestätigen nur Ihre eigene Durchsicht, keine rechtliche Freigabe.',reset:'Zurücksetzen'},
nl:{heading:'Uw documentcontrole',progress:'Gecontroleerde onderdelen',note:'Vinkjes registreren alleen uw eigen controle. Ze bevestigen geen wettelijk recht.',reset:'Wissen'},
fr:{heading:'Votre vérification documentaire',progress:'Points vérifiés',note:'Les cases décrivent votre vérification, pas une validation juridique.',reset:'Effacer'},
es:{heading:'Tu revisión documental',progress:'Puntos revisados',note:'Las marcas registran tu revisión; no confirman derechos ni importes correctos.',reset:'Borrar'}
};
export default function LaborChecklist({steps,locale,kind}:Props){
 const c=copy[locale as keyof typeof copy];const [checked,setChecked]=useState<boolean[]>(steps.map(()=>false));const [values,setValues]=useState(['','','']);
 const complete=checked.every(Boolean);let result:number|undefined;
 if(kind&&complete){try{result=confirmedDifference(kind,values);}catch{/* WHY: incomplete inputs must hide every previous comparison. */}}
 const fields=kind==='hours'?['Bevestigd beginsaldo (uren)','Bevestigde nieuwe opbouw (uren)','Opgenomen uren in dezelfde periode']:['Bevestigde bruto loonbasis (€)','Bevestigd percentage (%)','Al betaald bruto vakantiegeld (€)'];
 return <section className="space-y-3 rounded-lg border border-border p-3" aria-label={c.heading} data-labor-checklist>
 <h2 className="text-lg font-semibold">{c.heading}</h2>
 <div className="space-y-2">{steps.map((step,i)=><label key={step[0]} className="flex min-h-11 items-start gap-2 text-sm leading-relaxed"><input type="checkbox" className="mt-1 size-4 shrink-0 accent-primary" checked={checked[i]} onChange={e=>setChecked(v=>v.map((x,j)=>i===j?e.target.checked:x))}/><span>{step[2]}</span></label>)}</div>
 <p className="text-sm" role="status">{c.progress}: {checked.filter(Boolean).length}/{steps.length}. {c.note}</p>
 {kind&&<div className="space-y-3 border-t border-border pt-3"><h3 className="font-semibold">Alleen bevestigde gegevens vergelijken</h3><p className="text-sm text-muted-foreground">Gebruik dezelfde periode en eenheid. Geen automatische rechtenberekening. Velden worden niet opgeslagen of aan de URL toegevoegd.</p>
 <div className="grid gap-3 sm:grid-cols-3">{fields.map((f,i)=><label key={f} className="space-y-1 text-sm"><span className="block">{f}</span><input type="text" inputMode="decimal" className="min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-2" value={values[i]} onChange={e=>setValues(v=>v.map((x,j)=>i===j?e.target.value:x))}/></label>)}</div>
 <div aria-live="polite">{result===undefined?<p className="text-sm text-muted-foreground">Bevestig de controles en vul drie geldige, niet-negatieve waarden in (maximaal twee decimalen). Er wordt geen oud resultaat getoond. {kind==='money'&&'Het percentage mag maximaal 100% zijn.'}</p>:<div className="space-y-2 rounded-lg border border-border p-3"><h3 className="font-semibold">Rekenkundig verschil: {new Intl.NumberFormat('nl-NL',{maximumFractionDigits:2}).format(result)} {kind==='hours'?'uur':'€ bruto'}</h3><p className="text-sm">{kind==='hours'?'Beginsaldo + bevestigde opbouw − opgenomen uren.':'Bevestigde loonbasis × bevestigd percentage ÷ 100 − betaald bruto bedrag.'} Een negatief verschil is geen juridische vaststelling van een tekort of overbetaling.</p></div>}</div></div>}
 <button type="button" className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold" onClick={()=>{setChecked(steps.map(()=>false));setValues(['','','']);}}>{c.reset}</button>
 </section>;
}
