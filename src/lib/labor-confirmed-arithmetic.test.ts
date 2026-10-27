import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmedAmount,confirmedDifference} from './labor-confirmed-arithmetic.ts';
test('confirmed hours preserve old balance and signed result',()=>{assert.equal(confirmedDifference('hours',['40','16','8']),48);assert.equal(confirmedDifference('hours',['0','0','3']),-3);});
test('confirmed allowance has no default percentage or net-tax inference',()=>{assert.equal(confirmedDifference('money',['25000','8','1500']),500);assert.equal(confirmedDifference('money',['100','0','10']),-10);assert.equal(confirmedAmount('12,50'),12.5);});
test('unknown, nonfinite, negative and invalid precision are rejected',()=>{for(const n of ['', 'NaN','Infinity','-1','1e3','1,234.00','1.234','1000000001']) assert.throws(()=>confirmedAmount(n),RangeError);assert.throws(()=>confirmedDifference('money',['1','101','0']),RangeError);assert.throws(()=>confirmedDifference('hours',['1']),RangeError);});
