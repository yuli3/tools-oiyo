import test from 'node:test';
import assert from 'node:assert/strict';
import { quartiles } from './quartile.ts';
test('explicit odd/even halves and IQR convention',()=>{
 const odd=quartiles('1 2 3 4 5 6 7');assert.deepEqual([odd.q1,odd.med,odd.q3,odd.iqr],[2,4,6,4]);
 const even=quartiles('1,2,3,4,5,6,7,8');assert.deepEqual([even.q1,even.med,even.q3],[2.5,4.5,6.5]);
 assert.deepEqual(quartiles('1; 2').s,[1,2]);assert.equal(quartiles('4 4 4').iqr,0);
});
test('empty tokens never become zero and invalid tokens are never silently dropped',()=>{
 assert.deepEqual(quartiles('  2, 4,  ').s,[2,4]);
 for(const raw of ['', '1', '1 nonsense 2','1 NaN 2','1 Infinity 2','0x10 2','1e101 2',Array(1001).fill('1').join(' ')])assert.throws(()=>quartiles(raw),raw);
});
test('whiskers use observed inlier values, not fences or outlier extrema',()=>{
 const r=quartiles('1 2 3 4 5 6 7 8 100');assert.deepEqual(r.outliers,[100]);assert.equal(r.whiskerMax,8);assert.equal(r.whiskerMin,1);
 assert.deepEqual(quartiles('-1.5 0 2.5').s,[-1.5,0,2.5]);
});
