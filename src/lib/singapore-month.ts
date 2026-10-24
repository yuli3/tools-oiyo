export function calculateSingaporeMonth(input:{gross:number;workingDays:number;paidDays:number}) {
  if(!Object.values(input).every(n=>Number.isFinite(n)&&n>=0)||input.gross>100_000_000||input.workingDays<=0||input.workingDays>31||input.paidDays>input.workingDays||!Number.isInteger(input.workingDays*2)||!Number.isInteger(input.paidDays*2)) return {ok:false as const,reason:'invalid' as const};
  // WHY 2026-10-24: round only the displayed total, not the daily rate. Gross
  // is not basic pay; CPF, tax and rest-day/holiday premiums are outside scope.
  const amount=Math.round(input.gross/input.workingDays*input.paidDays*100)/100;
  return {ok:true as const,amount,unpaid:Math.round((input.gross-amount)*100)/100};
}
