// Korean lottery prize tax (복권 당첨금), checked on law.go.kr 2026-10-27:
// - 소득세법 §84 2호: a prize of 2,000,000 won or less per ticket is not taxed.
// - 소득세법 §129①6: withholding is 20% on income up to 300,000,000 won and 30% on the excess.
// - Income is the prize minus the ticket price (필요경비, §37②).
// - Local income tax withheld with it is 10% of that income tax.
// Amounts under 10 won are dropped, as on a withholding slip.

export const LOTTO_TAX_FREE_LIMIT = 2_000_000;
export const LOTTO_BRACKET = 300_000_000;

export interface LottoTax {
  prize: number;
  income: number;
  incomeTax: number;
  localTax: number;
  totalTax: number;
  net: number;
  effectiveRate: number;
}

const floor10 = (n: number) => Math.floor(n / 10) * 10;

export function lottoTax(prize: number, ticketCost = 1000): LottoTax {
  const p = Math.max(0, Math.floor(prize));
  if (p <= LOTTO_TAX_FREE_LIMIT) {
    return { prize: p, income: 0, incomeTax: 0, localTax: 0, totalTax: 0, net: p, effectiveRate: 0 };
  }
  const income = Math.max(0, p - Math.max(0, Math.floor(ticketCost)));
  const low = Math.min(income, LOTTO_BRACKET);
  const high = Math.max(0, income - LOTTO_BRACKET);
  const incomeTax = floor10(low * 0.2 + high * 0.3);
  const localTax = floor10(incomeTax * 0.1);
  const totalTax = incomeTax + localTax;
  return { prize: p, income, incomeTax, localTax, totalTax, net: p - totalTax, effectiveRate: totalTax / p };
}
