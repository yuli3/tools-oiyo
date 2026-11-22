// 얼굴 비율 분석 계산 (2026-11-22). UI: src/components/tools/FaceRatio.tsx
// 옛 ahoxy.com/face("AI 얼굴평가", 네이버 90%, 최고 월 1,357세션)를 대신한다. 외모 점수가 아니라
// 삼정(세로 3등분)·오안(가로 5등분)·좌우 대칭·얼굴 길이/폭처럼 잴 수 있는 비율만 보여 준다.
// 입력은 MediaPipe Face Landmarker 468점(정규화 좌표). 사진은 기기 밖으로 나가지 않는다.
export type P = { x: number; y: number };

// MediaPipe Face Mesh 인덱스
export const IDX = {
  top: 10, brow: 9, subnasale: 2, chin: 152,
  faceL: 234, faceR: 454,
  eyeROut: 33, eyeRIn: 133, eyeLIn: 362, eyeLOut: 263,
  mouthR: 61, mouthL: 291, noseR: 98, noseL: 327,
  bridge: 168,
} as const;

const d = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);

export type FaceRatios = {
  thirds: [number, number, number]; // 이마~미간, 미간~코밑, 코밑~턱 (합 1)
  fifths: [number, number, number, number, number]; // 얼굴 폭 대비 다섯 구간 (합 1)
  lengthToWidth: number; // 얼굴 길이 ÷ 폭
  mouthToNose: number; // 입 폭 ÷ 코 폭
  symmetry: number; // 0~100, 좌우 대응점 거리 차이 기반
};

/** 기울어진 얼굴도 비교할 수 있게 미간-턱 축을 세로로 돌린 좌표계로 바꾼다. */
function frame(pts: P[]) {
  const a = pts[IDX.bridge], b = pts[IDX.chin];
  const ang = Math.atan2(b.x - a.x, b.y - a.y);
  const c = Math.cos(ang), s = Math.sin(ang);
  return (p: P): P => ({ x: (p.x - a.x) * c - (p.y - a.y) * s, y: (p.x - a.x) * s + (p.y - a.y) * c });
}

export function faceRatios(pts: P[]): FaceRatios {
  const t = frame(pts);
  const q = (i: number) => t(pts[i]);
  const top = q(IDX.top).y, brow = q(IDX.brow).y, sub = q(IDX.subnasale).y, chin = q(IDX.chin).y;
  const h = [brow - top, sub - brow, chin - sub].map((v) => Math.max(v, 0));
  const hs = h.reduce((a, b) => a + b, 0) || 1;
  const xs = [IDX.faceR, IDX.eyeROut, IDX.eyeRIn, IDX.eyeLIn, IDX.eyeLOut, IDX.faceL].map((i) => q(i).x).sort((a, b) => a - b);
  const w = xs.slice(1).map((v, i) => v - xs[i]);
  const ws = w.reduce((a, b) => a + b, 0) || 1;
  const width = d(pts[IDX.faceL], pts[IDX.faceR]);
  const length = d(pts[IDX.top], pts[IDX.chin]);
  const pairs: [number, number][] = [[IDX.eyeROut, IDX.eyeLOut], [IDX.eyeRIn, IDX.eyeLIn], [IDX.mouthR, IDX.mouthL], [IDX.noseR, IDX.noseL], [IDX.faceR, IDX.faceL]];
  // 축(x=0) 기준으로 좌우 대응점의 거리·높이 차이를 얼굴 폭으로 나눈 평균
  const tw = Math.abs(q(IDX.faceL).x - q(IDX.faceR).x) || 1;
  const asym = pairs.reduce((sum, [r, l]) => {
    const a = q(r), b = q(l);
    return sum + (Math.abs(Math.abs(a.x) - Math.abs(b.x)) + Math.abs(a.y - b.y)) / tw;
  }, 0) / pairs.length;
  return {
    thirds: h.map((v) => v / hs) as FaceRatios["thirds"],
    fifths: w.map((v) => v / ws) as FaceRatios["fifths"],
    lengthToWidth: length / (width || 1),
    mouthToNose: d(pts[IDX.mouthR], pts[IDX.mouthL]) / (d(pts[IDX.noseR], pts[IDX.noseL]) || 1),
    symmetry: Math.max(0, Math.min(100, Math.round(100 - asym * 400))),
  };
}

/** 기준값과의 근접도 0~100. tol은 '50점이 되는 상대 오차'. */
export function closeness(value: number, ideal: number, tol: number): number {
  const rel = Math.abs(value - ideal) / ideal;
  return Math.round(100 / (1 + (rel / tol) ** 2));
}

export function balance(r: FaceRatios) {
  const thirds = Math.round(r.thirds.reduce((s, v) => s + closeness(v, 1 / 3, 0.15), 0) / 3);
  const fifths = Math.round(r.fifths.reduce((s, v) => s + closeness(v, 1 / 5, 0.2), 0) / 5);
  const mouth = closeness(r.mouthToNose, 1.5, 0.15);
  // 얼굴 길이/폭은 메시 상단(머리선이 아님)을 쓰므로 기준값과 비교하지 않고 값만 보여 준다.
  return { thirds, fifths, mouth, symmetry: r.symmetry, overall: Math.round((thirds + fifths + mouth + r.symmetry) / 4) };
}
