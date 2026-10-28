import {useState} from 'react';
import {weightedGpa} from '../../lib/small-utilities';
import type {Locale} from '../../lib/i18n';
const copy={
ko:['확인된 평점으로 계산해요','학교의 성적표에 적힌 숫자 평점과 이수 학점을 입력하세요. 문자 등급을 임의로 환산하지 않아요.','만점','과목','숫자 평점','이수 학점','과목 추가','삭제','가중 평균','학교의 평가 규칙을 확인하고 모든 칸에 유효한 값을 입력하세요.','초기화'],
en:['Use confirmed grade points','Enter numeric points and credits from your institution. Letter grades are not automatically converted.','Maximum grade','Course','Grade points','Credits','Add course','Remove','Weighted average','Check your institution’s policy and enter valid values in every field.','Reset'],
ja:['確認済みの評点で計算','学校で定められた数値の評点と単位数を入力してください。文字評価を自動換算しません。','満点','科目','数値の評点','単位数','科目を追加','削除','加重平均','学校の評価規則を確認し、すべての欄に有効な値を入力してください。','リセット'],
zh:['使用已确认的绩点','输入学校规定的数字绩点和学分，不自动转换字母等级。','满分','课程','数字绩点','学分','添加课程','删除','加权平均','请确认学校的评分规则，并在所有输入框填写有效值。','重置'],
fr:['Utilisez les points confirmés','Saisissez les points et crédits définis par votre établissement. Les lettres ne sont pas converties automatiquement.','Note maximale','Cours','Points','Crédits','Ajouter un cours','Supprimer','Moyenne pondérée','Vérifiez les règles de votre établissement et remplissez tous les champs avec des valeurs valides.','Réinitialiser'],
es:['Usa puntos confirmados','Introduce los puntos numéricos y créditos definidos por tu institución. No se convierten letras automáticamente.','Puntuación máxima','Asignatura','Puntos','Créditos','Añadir asignatura','Eliminar','Media ponderada','Comprueba las reglas de tu institución e introduce valores válidos en todos los campos.','Restablecer']
};
export default function GpaCalculator({locale='ko'}:{locale?:Locale}){
 const t=copy[locale], [scale,setScale]=useState('4.5'),[rows,setRows]=useState([{id:1,points:'',credits:''}]);
 const result=weightedGpa(scale,rows);
 return <section className="space-y-3 rounded-xl border border-border p-4"><h2 className="font-semibold">{t[0]}</h2><p className="text-sm text-muted-foreground">{t[1]}</p><label className="block text-sm">{t[2]}<input type="text" inputMode="decimal" value={scale} onChange={e=>setScale(e.target.value)} className="ml-2 min-h-11 w-24 rounded-lg border border-border bg-background px-2"/></label>
 <div className="space-y-3">{rows.map((r,i)=><fieldset key={r.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3"><legend className="px-1 text-sm">{t[3]} {i+1}</legend>{(['points','credits'] as const).map((key,j)=><label key={key} className="text-sm">{t[j+4]}<input type="text" inputMode="decimal" value={r[key]} onChange={e=>setRows(v=>v.map(x=>x.id===r.id?{...x,[key]:e.target.value}:x))} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-2"/></label>)}<button type="button" disabled={rows.length===1} className="min-h-11 rounded-lg border border-border px-2 text-sm disabled:opacity-50" onClick={()=>setRows(v=>v.filter(x=>x.id!==r.id))}>{t[7]}</button></fieldset>)}</div>
 <button type="button" disabled={rows.length>=50} onClick={()=>setRows(v=>[...v,{id:Math.max(...v.map(r=>r.id))+1,points:'',credits:''}])} className="min-h-11 rounded-lg border border-border px-3 text-sm">{t[6]}</button>
 <div aria-live="polite" className="rounded-lg border border-border p-3">{result===null?<p className="text-sm text-muted-foreground">{t[9]}</p>:<><p className="font-semibold">{t[8]}: {new Intl.NumberFormat(locale,{maximumFractionDigits:3}).format(result)} / {scale}</p><p className="text-sm">Σ(points × credits) ÷ Σ(credits)</p></>}</div>
 <button type="button" className="min-h-11 rounded-lg border border-border px-3 text-sm" onClick={()=>{setScale('4.5');setRows([{id:1,points:'',credits:''}]);}}>{t[10]}</button></section>;
}
