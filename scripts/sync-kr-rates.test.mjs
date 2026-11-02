import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { RATE_FILES, syncRates } from "./sync-kr-rates.mjs";
const source = JSON.parse(readFileSync(new URL("./kr-rates-source.json", import.meta.url)));
const data = Object.fromEntries(RATE_FILES.map(n => [n, readFileSync(new URL(`../src/lib/${n}`, import.meta.url))]));
function isolated(fn) {
  const dir = mkdtempSync(resolve(tmpdir(), "rates-remote-"));
  try { for (const n of RATE_FILES) writeFileSync(resolve(dir, n), data[n]); fn(dir); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}
test("pinned source works without API checkout; check does not write", () => isolated(target => {
  assert.equal(syncRates({ source, target, getFile: n => data[n], check: true }), 3);
  for (const n of RATE_FILES) assert.deepEqual(readFileSync(resolve(target, n)), data[n]);
}));
test("network failure, missing and corrupt files preserve the full target set", () => isolated(target => {
  for (const getFile of [n => { if(n===RATE_FILES[2]) throw Error("offline"); return data[n]; },
    n => n===RATE_FILES[2] ? undefined : data[n], n => n===RATE_FILES[2] ? Buffer.from("corrupt") : data[n]]) {
    assert.throws(() => syncRates({ source, target, getFile }));
    for(const n of RATE_FILES) assert.deepEqual(readFileSync(resolve(target, n)), data[n]);
  }
}));
test("untrusted source metadata fails before any request", () => isolated(target => {
  for(const bad of [{...source,commit:"main"},{...source,repository:"other/repo"},{...source,files:{}}]) {
    let called=false;
    assert.throws(() => syncRates({ source:bad,target,getFile:()=>{called=true;} }));
    assert.equal(called,false);
  }
}));
test("check detects local drift; explicit sync can repair it", () => isolated(target => {
  writeFileSync(resolve(target,RATE_FILES[0]),"drift");
  assert.throws(() => syncRates({source,target,getFile:n=>data[n],check:true}));
  syncRates({source,target,getFile:n=>data[n]});
  assert.deepEqual(readFileSync(resolve(target,RATE_FILES[0])),data[RATE_FILES[0]]);
}));
test("unknown CLI option fails without changing checked-in copies", () => {
  assert.throws(() => execFileSync(process.execPath,[new URL('./sync-kr-rates.mjs',import.meta.url).pathname,'--unknown'],{stdio:'pipe'}));
  for(const n of RATE_FILES) assert.deepEqual(readFileSync(new URL(`../src/lib/${n}`,import.meta.url)),data[n]);
});
