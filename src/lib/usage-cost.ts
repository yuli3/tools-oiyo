export type UsageInput = { name: string; cost: string; hours: string };
export type UsageRow = UsageInput & { index: number; amount: number | null; hourly: number | null; state: 'ready' | 'unused' | 'pending' | 'invalid' };

// 2026-10-25: blank hours mean unknown, not unused. Keep zero-hour items out
// of the chart instead of presenting Infinity as a meaningful comparison.
export function compareUsageCosts(inputs: readonly UsageInput[]): UsageRow[] {
  return inputs.map((input, index): UsageRow => {
    const costText = input.cost.trim(), hoursText = input.hours.trim();
    const amount = costText === '' ? null : Number(costText);
    const hours = hoursText === '' ? null : Number(hoursText);
    const invalid = (amount !== null && (!Number.isFinite(amount) || amount < 0)) || (hours !== null && (!Number.isFinite(hours) || hours < 0));
    if (invalid) return { ...input, index, amount: null, hourly: null, state: 'invalid' };
    if (amount === null || hours === null) return { ...input, index, amount, hourly: null, state: 'pending' };
    if (hours === 0) return { ...input, index, amount, hourly: null, state: 'unused' };
    const hourly = amount / hours;
    if (!Number.isFinite(hourly)) return { ...input, index, amount: null, hourly: null, state: 'invalid' };
    return { ...input, index, amount, hourly, state: 'ready' };
  });
}

export function rankUsageCosts(rows: readonly UsageRow[]): UsageRow[] {
  return rows.filter(row => row.state === 'ready').sort((a, b) => (b.hourly! - a.hourly!) || a.index - b.index);
}
