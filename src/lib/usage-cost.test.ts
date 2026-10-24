import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareUsageCosts, rankUsageCosts } from './usage-cost.ts';

test('cost divided by actual hours; free use remains zero', () => {
  const rows = compareUsageCosts([{name:'A',cost:'20000',hours:'10'}, {name:'B',cost:'12000',hours:'2'}, {name:'D',cost:'0',hours:'2'}]);
  assert.deepEqual(rows.map(r => r.hourly), [2000,6000,0]);
  assert.deepEqual(rankUsageCosts(rows).map(r => r.name), ['B','A','D']);
});
test('blank inputs do not become unused or free', () => {
  const rows = compareUsageCosts([{name:'A',cost:'9000',hours:''}, {name:'B',cost:'',hours:'2'}, {name:'C',cost:'9000',hours:'0'}]);
  assert.deepEqual(rows.map(r => r.state), ['pending','pending','unused']);
  assert.equal(rows[2].amount, 9000);
  assert.equal(rows[2].hourly, null);
  assert.deepEqual(rankUsageCosts(rows), []);
});
test('negative, nonfinite and overflow inputs are invalid', () => {
  for (const [cost,hours] of [['-1','2'],['1','-2'],['Infinity','1'],['1','NaN'],['1e309','1'],['1e308','1e-308']]) {
    assert.equal(compareUsageCosts([{name:'x',cost,hours}])[0].state, 'invalid');
  }
});
test('ties retain input order and ranking does not mutate input', () => {
  const rows = compareUsageCosts([{name:'first',cost:'20',hours:'2'}, {name:'second',cost:'30',hours:'3'}]);
  const before = structuredClone(rows);
  assert.deepEqual(rankUsageCosts(rows).map(r=>r.name), ['first','second']);
  assert.deepEqual(rows, before);
});
test('empty input produces no invented result', () => assert.deepEqual(compareUsageCosts([]), []));
