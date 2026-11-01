import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compareWorldMeans} from './height-world.ts';
const data=JSON.parse(fs.readFileSync(new URL('../data/height-world-means.json',import.meta.url),'utf8'));
test('world reference has 200 distinct country/territory pairs and explicit historical scope',()=>{
 assert.equal(data.rows.length,200);assert.equal(new Set(data.rows.map((r:any)=>r.country)).size,200);
 assert.equal(data.birthYear,1996);assert.equal(data.referenceAge,18);assert.equal(data.referenceYear,2014);
 for(const row of data.rows){assert.match(row.country,/^[A-Z]{2}$/);for(const sex of ['male','female'])assert.ok(Number.isFinite(row[sex])&&row[sex]>130&&row[sex]<200);}
 for(const code of ['JP','CN','FR','ES','BR','KR','US'])assert.ok(data.rows.some((r:any)=>r.country===code));
});
test('mean comparisons do not generate individual percentile estimates; malformed heights return no result',()=>{
 const rows=[{country:'JP',male:170,female:158},{country:'FR',male:179,female:165}];
 assert.equal(compareWorldMeans(rows,175,'male')[0].row.country,'FR');
 assert.equal(compareWorldMeans(rows,175,'male')[0].difference,-4);
 assert.equal(compareWorldMeans(rows,158,'female')[0].difference,0);
 assert.deepEqual(Object.keys(compareWorldMeans(rows,175,'male')[0]).sort(),['difference','mean','row']);
 for(const cm of [NaN,Infinity,49,251])assert.deepEqual(compareWorldMeans(rows,cm,'male'),[]);
});
