export type LaborTool = 'jp'|'sg'|'tw';
export const countryLabor = {
  jp:{locale:'ja',languageTag:'ja-JP',ogLocale:'ja_JP',slug:'japan-overtime-calculator',title:'日本の残業・深夜・法定休日手当を計算',description:'時給と重複しない時間区分から、通常賃金と割増分を分けて試算します。月60時間以内の時間外労働に対応します。',jurisdiction:'日本の労働基準法・通常の時間給制',
    fields:[['割増計算の基礎となる時給（円）','1000','number'],['通常勤務（深夜を除く・時間）','8','number'],['時間外のみ（深夜を除く・時間）','1','number'],['深夜のみ（時間外・法定休日を除く・時間）','0','number'],['時間外かつ深夜（時間）','0','number'],['法定休日のみ（深夜を除く・時間）','0','number'],['法定休日かつ深夜（時間）','0','number']],
    labels:['通常勤務','時間外のみ','深夜のみ','時間外＋深夜','法定休日のみ','法定休日＋深夜'],ack:'時間区分は重複せず、適用除外・変形労働時間制・固定残業代を含まない試算だと確認しました。',
    intro:'同じ1時間を二つの欄へ入れないでください。深夜は原則22時〜翌5時、法定休日は単なる土日とは異なります。月60時間を超える時間外労働、適用除外、固定残業代の精算は対象外です。',
    method:'入力した時間の通常賃金に、時間外25％・深夜25％・法定休日35％の割増分を加えます。時間外＋深夜は50％、法定休日＋深夜は60％の割増です。法定休日に時間外割増を重ねません。',
    note:'最低割増率による税・社会保険控除前の比較です。月給全体や未払賃金の認定ではありません。会社がより高い率を定める場合や端数処理は反映していません。支給額を保証せず、表示は小数2桁までです。',
    error:'数値を確認してください。時給は0超〜1,000万円、時間は0以上、合計744時間以下で入力します。',unsupported:'時間外のみ＋時間外かつ深夜が月60時間を超える場合は、この計算の対象外です。低い率の結果は表示しません。',
    result:'試算の内訳',base:'入力時間の通常賃金',extra:'割増分',total:'入力時間の合計額',unconfirmed:'適用範囲を確認すると結果が表示されます。',example:'例の値に戻す',loading:'計算の準備中です…',value:'金額（円）',unit:'時間',sources:'公式の説明と適用範囲',date:'根拠確認：2026-10-24',
    sourcesList:[['厚生労働省：法定労働時間と割増賃金','https://www.mhlw.go.jp/bunya/roudoukijun/faq_kijyungyosei07.html'],['青森労働局：月60時間超の割増率など','https://jsite.mhlw.go.jp/aomori-roudoukyoku/newpage_00295.html']]},
  sg:{locale:'en',languageTag:'en-SG',ogLocale:'en_SG',slug:'singapore-incomplete-month-calculator',title:'Singapore incomplete-month salary calculator',description:'Compare paid working days with the full working month. See how monthly gross pay becomes a prorated estimate, before CPF and tax.',jurisdiction:'Singapore · monthly-rated full-time employment',
    fields:[['Monthly gross rate of pay (SGD)','5000','number'],['Total working days in the calendar month','22','number'],['Days counted as worked / paid in that month','12','number']],labels:['Paid portion','Remaining portion'],
    ack:'I have checked the monthly-rated full-time scope and the working-day counts, including applicable paid leave and public holidays.',
    intro:'Use the gross rate, not basic salary or take-home pay. Rest days and non-working days are excluded from the working-day denominator; a public holiday on a normal working day is included. Enter eligible paid leave and holidays in the paid count. Do not subtract a holiday just because it was not physically worked.',
    method:'Monthly gross rate ÷ total working days in that calendar month × days counted as worked. A contractual working day of 5 hours or less counts as half a day. You enter the counts: this tool does not infer a schedule or determine leave eligibility.',
    note:'For starting or leaving mid-month or taking no-pay leave. Reservist training, part-time/hourly pay, variable schedules and disputed classifications are not supported. CPF, tax, overtime and holiday-work premiums are not calculated. The estimate is displayed to cents; this is not a ruling on payroll rounding.',
    error:'Enter finite, non-negative values. Gross pay must be at most SGD 100,000,000. Working days must be above 0 and at most 31, in half-day steps; paid days cannot exceed working days.',unsupported:'This employment arrangement is outside the supported scope.',
    result:'How the estimate is built',base:'Full-month gross pay',extra:'Portion outside the paid-day count',total:'Prorated gross estimate',unconfirmed:'Confirm the scope and day counts to see the estimate.',example:'Restore example',loading:'Preparing calculator…',value:'Amount (SGD)',unit:'days',sources:'Official guidance and scope',date:'Sources checked: 24 October 2026',
    sourcesList:[['MOM: monthly and daily salary — formula and definitions','https://www.mom.gov.sg/employment-practices/salary/monthly-and-daily-salary'],['MOM: incomplete-month calculator and working-day table','https://www.mom.gov.sg/employment-practices/salary/calculate-pay-for-incomplete-month']]},
  tw:{locale:'zh',languageTag:'zh-Hant-TW',ogLocale:'zh_TW',slug:'taiwan-annual-leave-calculator',title:'台灣特休天數與週年制日曆',description:'依到職日與查詢日，查看週年制當期特休、已休與未休天數。半年3天與滿一年7天分開顯示，不套用其他國家的年假規則。',jurisdiction:'台灣《勞動基準法》第38條・全時勞工週年制',
    fields:[['到職日期','2025-01-01','date'],['查詢日期','2026-10-24','date'],['本期已休特休（天）','0','number']],labels:['本期已休','本期未休'],
    ack:'我確認採週年制、持續在職，沒有年資中斷或留職停薪；此處不計部分工時、遞延與離職結算。',
    intro:'滿半年取得的3天與滿一年另取得的7天是不同期間的權利，不應合併當成每年10天。本工具只顯示查詢日所在期間，不把過期或遞延天數自動加進來。',
    method:'滿6個月未滿1年為3天，滿1年7天、滿2年10天、滿3年14天、滿5年15天；滿10年16天，其後每年加1天，上限30天。已休天數僅從本期額度扣除。',
    note:'本版只支援每月1日至28日到職者及2017年起的查詢。29日至月底到職（含閏日）的週年日判定、曆年制、部分工時、年資中斷、遞延及離職未休工資，請使用勞動部工具或確認個案。這不是權利或雇主違法的認定。',
    error:'請確認日期先後與本期已休天數。已休不可超過本期額度，僅接受0.5天的倍數；不足半年的本期額度為0天。',unsupported:'此日期或到職日超出本版支援範圍。請參考下方勞動部工具，不會以猜測的週年日顯示結果。',
    result:'本期特休與日期',base:'本期額度',extra:'本期已休',total:'本期未休',unconfirmed:'請先確認適用範圍，再查看試算結果。',example:'恢復範例',loading:'正在準備計算…',value:'天數',unit:'天',sources:'官方依據與適用範圍',date:'依據確認：2026-10-24',
    sourcesList:[['勞動部：特別休假日數、排定原則及遞延','https://www.mol.gov.tw/1607/28162/28166/28218/28226/81492/post'],['勞動部：特別休假日數試算系統','https://calcr2.mol.gov.tw/RestDays']]},
} as const;
// WHY 2026-10-24: discovery follows the supported interface language; that
// language is never a selector for a different legal formula.
export const laborToolsForLocale=(locale:string)=>Object.values(countryLabor).filter(t=>t.locale===locale);
