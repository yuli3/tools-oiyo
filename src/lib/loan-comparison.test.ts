import test from 'node:test';
import assert from 'node:assert/strict';
import { compareLoans } from './loan-comparison.ts';
const base = {principal:1200, annualRate:12, months:3, graceMonths:0};
test('three repayment methods reproduce a hand-computable three-month example', () => {
  const result = compareLoans(base);
  if (!result.ok) throw Error('Expected schedules');
  assert.ok(Math.abs(result.schedules[0].rows[0].payment - 408.026533777763) < 1e-9);
  assert.equal(result.schedules[1].totalInterest, 24);
  assert.equal(result.schedules[2].totalInterest, 36);
});
test('zero-rate grace months pay no principal or interest, then repay the loan', () => {
  const result = compareLoans({...base, annualRate:0, months:12, graceMonths:3});
  if (!result.ok) throw Error('Expected schedules');
  for (const schedule of result.schedules) {
    assert.equal(schedule.firstPayment, 0);
    assert.equal(schedule.totalInterest, 0);
    assert.equal(schedule.totalPayment, 1200);
    assert.equal(schedule.rows.at(-1)?.balance, 0);
  }
  assert.equal(result.schedules[0].repaymentStart, 1200/9);
});
test('tiny positive rates produce finite results rather than a cancellation division', () => {
  const result = compareLoans({...base, annualRate:1e-15, months:360});
  if (!result.ok) throw Error('Expected schedules');
  assert.ok(Math.abs(result.schedules[0].repaymentStart - 1200/360) < 1e-10);
});
test('each method preserves principal and ends at zero, including one repayment month', () => {
  for (const graceMonths of [0,3,11]) for (const annualRate of [0,0.001,4.2,100]) {
    const result = compareLoans({...base, principal:200000, annualRate, months:12, graceMonths});
    if (!result.ok) throw Error('Expected schedules');
    for (const schedule of result.schedules) {
      assert.equal(schedule.rows.length, 12);
      assert.ok(Math.abs(schedule.rows.reduce((n,row) => n + row.principal,0)-200000)<1e-7);
      assert.equal(schedule.rows.at(-1)?.balance,0);
      assert.ok(schedule.rows.every(row=>row.principal>=0 && row.interest>=0 && row.balance>=0));
    }
  }
});
test('invalid numeric inputs and fractional or excessive grace periods return explicit errors', () => {
  for (const principal of [0,-1,NaN,Infinity,Number.MAX_VALUE]) assert.deepEqual(compareLoans({...base,principal}),{ok:false,error:'principal'});
  for (const annualRate of [-1,NaN,Infinity,1001]) assert.deepEqual(compareLoans({...base,annualRate}),{ok:false,error:'rate'});
  for (const months of [0,-1,1.5,NaN,Infinity,1201]) assert.deepEqual(compareLoans({...base,months}),{ok:false,error:'months'});
  for (const graceMonths of [-1,1.5,3,4,NaN,Infinity]) assert.deepEqual(compareLoans({...base,graceMonths}),{ok:false,error:'grace'});
});
test('a term reduction does not silently clamp an already-selected grace period', () => {
  assert.deepEqual(compareLoans({...base,months:12,graceMonths:24}),{ok:false,error:'grace'});
});
test('long high-rate annuities do not postpone all principal to an oversized last payment',()=>{
  const result=compareLoans({...base,principal:1000000,annualRate:1000,months:1200});
  if(!result.ok) throw Error('Expected schedules');
  const rows=result.schedules[0].rows;
  assert.ok(Math.abs(rows[0].payment-rows.at(-1)!.payment)<0.001);
  assert.ok(rows.slice(-20).every(row=>row.principal>0));
});
test('underflowing monthly inputs are rejected rather than silently replaced by zero',()=>{
  assert.deepEqual(compareLoans({...base,principal:Number.MIN_VALUE}),{ok:false,error:'unrepresentable'});
  assert.deepEqual(compareLoans({...base,annualRate:Number.MIN_VALUE}),{ok:false,error:'unrepresentable'});
});
