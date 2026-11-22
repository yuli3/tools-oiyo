import { test } from "node:test";
import assert from "node:assert/strict";
import { IDX, balance, closeness, faceRatios, type P } from "./face-ratio.ts";

// 이상적인 비율로 만든 가짜 얼굴(폭 1, 삼정 같은 길이, 오안 같은 폭, 완전 대칭)
function ideal(): P[] {
  const pts: P[] = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5 }));
  const set = (i: number, x: number, y: number) => { pts[i] = { x, y }; };
  set(IDX.top, 0.5, 0.1); set(IDX.brow, 0.5, 0.4); set(IDX.bridge, 0.5, 0.42); set(IDX.subnasale, 0.5, 0.7); set(IDX.chin, 0.5, 1.0);
  set(IDX.faceR, 0.0, 0.5); set(IDX.eyeROut, 0.2, 0.45); set(IDX.eyeRIn, 0.4, 0.45); set(IDX.eyeLIn, 0.6, 0.45); set(IDX.eyeLOut, 0.8, 0.45); set(IDX.faceL, 1.0, 0.5);
  set(IDX.noseR, 0.4, 0.68); set(IDX.noseL, 0.6, 0.68); set(IDX.mouthR, 0.35, 0.8); set(IDX.mouthL, 0.65, 0.8);
  return pts;
}

test("이상 비율 얼굴은 삼정·오안·대칭이 모두 100에 가깝다", () => {
  const r = faceRatios(ideal());
  r.thirds.forEach((v) => assert.ok(Math.abs(v - 1 / 3) < 1e-9));
  r.fifths.forEach((v) => assert.ok(Math.abs(v - 0.2) < 1e-9));
  assert.equal(r.symmetry, 100);
  const b = balance(r);
  assert.equal(b.thirds, 100);
  assert.equal(b.fifths, 100);
  assert.equal(b.mouth, 100);
});

test("기울인 사진도 같은 비율로 잰다", () => {
  const ang = 0.3, c = Math.cos(ang), s = Math.sin(ang);
  const rot = ideal().map((p) => ({ x: 0.5 + (p.x - 0.5) * c - (p.y - 0.5) * s, y: 0.5 + (p.x - 0.5) * s + (p.y - 0.5) * c }));
  const r = faceRatios(rot);
  r.thirds.forEach((v) => assert.ok(Math.abs(v - 1 / 3) < 1e-6));
  assert.equal(r.symmetry, 100);
});

test("한쪽 입꼬리가 올라가면 대칭 점수가 내려간다", () => {
  const pts = ideal();
  pts[IDX.mouthL] = { x: 0.65, y: 0.74 };
  assert.ok(faceRatios(pts).symmetry < 100);
});

test("근접도는 기준값에서 100, tol만큼 벗어나면 50", () => {
  assert.equal(closeness(1, 1, 0.1), 100);
  assert.equal(closeness(1.1, 1, 0.1), 50);
});
