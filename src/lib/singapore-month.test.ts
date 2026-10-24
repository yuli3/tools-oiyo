import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSingaporeMonth } from './singapore-month.ts';
test('MOM gross / working days × paid working days, synthetic 5,000/22×12 example',()=>{
  const r=calculateSingaporeMonth({gross:5000,workingDays:22,paidDays:12});
  assert.equal(r.ok && r.amount,2727.27);
});
test('half-days and zero paid days stay explicit',()=>{
  const half=calculateSingaporeMonth({gross:4000,workingDays:20,paidDays:0.5});
  const zero=calculateSingaporeMonth({gross:4000,workingDays:20,paidDays:0});
  assert.equal(half.ok && half.amount,100);
  assert.equal(zero.ok && zero.amount,0);
});
test('invalid counts, mismatched paid days and nonfinite money are rejected',()=>{
  for(const input of [{gross:5000,workingDays:0,paidDays:1},{gross:5000,workingDays:22,paidDays:23},{gross:5000,workingDays:22,paidDays:-1},{gross:Infinity,workingDays:22,paidDays:1},{gross:5000,workingDays:22,paidDays:0.2},{gross:1e308,workingDays:22,paidDays:1}]) assert.equal(calculateSingaporeMonth(input).ok,false);
});
