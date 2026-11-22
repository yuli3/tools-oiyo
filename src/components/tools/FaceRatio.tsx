// 얼굴 비율 분석 — 삼정·오안·좌우 대칭·입/코 폭 (2026-11-22). 계산: src/lib/face-ratio.ts
// 옛 ahoxy.com/face("AI 얼굴평가") 수요를 받는다. 외모 점수가 아니라 잴 수 있는 비율만 보여 준다.
// 사진은 서버로 보내지 않는다. MediaPipe 실행 파일(wasm)과 모델만 CDN에서 받고, 분석은 브라우저 안에서 한다.
import { useRef, useState } from "react";
import type { Locale } from "../../lib/i18n";
import { IDX, balance, faceRatios, type FaceRatios, type P } from "../../lib/face-ratio";

const VERSION = "1.2.3";
const WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const MAX_SIDE = 900;

const L: Record<Locale, Record<string, string>> = {
  ko: {
    turned: "고개가 옆으로 돌아간 사진 같아요. 오안·대칭 숫자가 크게 틀어질 수 있으니 정면 사진으로 다시 해 보세요.",
    pick: "얼굴 사진 고르기", hint: "정면을 보고, 머리카락이 이마를 가리지 않은 사진이 잘 나와요. 사진은 이 기기 밖으로 나가지 않아요.",
    loading: "분석 도구를 불러오는 중이에요(처음 한 번, 약 8MB)…", analyzing: "얼굴 점을 찾는 중이에요…",
    noFace: "얼굴을 찾지 못했어요. 얼굴이 크게, 정면으로 나온 사진으로 다시 해 보세요.", error: "분석 도구를 불러오지 못했어요. 네트워크를 확인하고 다시 해 보세요.",
    overall: "비율 균형", thirds: "삼정(세로 3등분)", fifths: "오안(가로 5등분)", mouth: "입 폭 ÷ 코 폭", symmetry: "좌우 대칭",
    upper: "이마", middle: "코", lower: "턱", lw: "얼굴 길이 ÷ 폭", ideal: "기준", again: "다른 사진",
    note: "기준값(삼정 각 33%, 오안 각 20%, 입÷코 1.5)과 얼마나 가까운지를 0~100으로 보여 줘요. 매력이나 외모 점수가 아니에요. 각도·조명·표정에 따라 바뀌어요.",
    canvas: "사진 위에 삼정·오안 선을 그린 그림",
  },
  en: {
    turned: "The head looks turned to the side. Fifths and symmetry can be far off, so try a straight-on photo.",
    pick: "Choose a face photo", hint: "A straight-on photo with the forehead visible works best. Your photo never leaves this device.",
    loading: "Loading the analysis tool (first time only, about 8 MB)…", analyzing: "Finding face points…",
    noFace: "No face found. Try a photo where the face is large and facing the camera.", error: "Couldn't load the analysis tool. Check your connection and try again.",
    overall: "Proportion balance", thirds: "Facial thirds (vertical)", fifths: "Facial fifths (horizontal)", mouth: "Mouth width ÷ nose width", symmetry: "Left-right symmetry",
    upper: "Forehead", middle: "Nose", lower: "Chin", lw: "Face length ÷ width", ideal: "reference", again: "Another photo",
    note: "Shows how close each ratio is to the classic reference (thirds 33% each, fifths 20% each, mouth÷nose 1.5) on a 0–100 scale. It is not an attractiveness score. Angle, lighting and expression change the result.",
    canvas: "Photo with facial thirds and fifths lines drawn on it",
  },
  ja: {
    turned: "顔が横を向いているようです。五分割・対称の数値が大きくずれることがあるので、正面の写真で試してください。",
    pick: "顔写真を選ぶ", hint: "正面を向き、前髪が額を隠していない写真がおすすめです。写真はこの端末の外に送られません。",
    loading: "分析ツールを読み込み中です(初回のみ、約8MB)…", analyzing: "顔のポイントを探しています…",
    noFace: "顔が見つかりませんでした。顔が大きく正面に写った写真で試してください。", error: "分析ツールを読み込めませんでした。通信を確認してもう一度お試しください。",
    overall: "比率バランス", thirds: "三分割(縦)", fifths: "五分割(横)", mouth: "口の幅 ÷ 鼻の幅", symmetry: "左右対称",
    upper: "額", middle: "鼻", lower: "あご", lw: "顔の長さ ÷ 幅", ideal: "基準", again: "別の写真",
    note: "基準値(縦三分割は各33%、横五分割は各20%、口÷鼻は1.5)にどれだけ近いかを0〜100で示します。魅力や容姿の点数ではありません。角度・照明・表情で変わります。",
    canvas: "写真に三分割・五分割の線を描いた図",
  },
  zh: {
    turned: "头部似乎侧转了。五眼和对称的数值可能偏差很大，请换一张正面照片。",
    pick: "选择脸部照片", hint: "正脸、额头不被头发遮住的照片效果最好。照片不会离开这台设备。",
    loading: "正在加载分析工具(仅首次，约 8MB)…", analyzing: "正在寻找面部关键点…",
    noFace: "没有找到人脸。请换一张脸部较大、正对镜头的照片。", error: "分析工具加载失败。请检查网络后重试。",
    overall: "比例均衡", thirds: "三庭(纵向三等分)", fifths: "五眼(横向五等分)", mouth: "嘴宽 ÷ 鼻宽", symmetry: "左右对称",
    upper: "额头", middle: "鼻子", lower: "下巴", lw: "脸长 ÷ 脸宽", ideal: "参考", again: "换一张",
    note: "用 0–100 表示各比例与经典参考值(三庭各 33%、五眼各 20%、嘴÷鼻 1.5)的接近程度。这不是颜值评分。角度、光线和表情都会影响结果。",
    canvas: "在照片上画出三庭五眼线",
  },
  fr: {
    turned: "La tête semble tournée de côté. Les cinquièmes et la symétrie peuvent être très faussés : essayez une photo de face.",
    pick: "Choisir une photo du visage", hint: "Une photo de face, front dégagé, donne le meilleur résultat. La photo ne quitte jamais cet appareil.",
    loading: "Chargement de l'outil d'analyse (première fois, environ 8 Mo)…", analyzing: "Recherche des points du visage…",
    noFace: "Aucun visage trouvé. Essayez une photo où le visage est grand et de face.", error: "Impossible de charger l'outil d'analyse. Vérifiez la connexion et réessayez.",
    overall: "Équilibre des proportions", thirds: "Tiers du visage (vertical)", fifths: "Cinquièmes du visage (horizontal)", mouth: "Largeur bouche ÷ nez", symmetry: "Symétrie gauche-droite",
    upper: "Front", middle: "Nez", lower: "Menton", lw: "Longueur ÷ largeur du visage", ideal: "référence", again: "Autre photo",
    note: "Indique, de 0 à 100, la proximité de chaque rapport avec la référence classique (tiers à 33 %, cinquièmes à 20 %, bouche÷nez 1,5). Ce n'est pas une note de beauté. L'angle, la lumière et l'expression changent le résultat.",
    canvas: "Photo avec les lignes des tiers et cinquièmes du visage",
  },
  es: {
    turned: "La cabeza parece girada hacia un lado. Los quintos y la simetría pueden salir muy desviados: prueba con una foto de frente.",
    pick: "Elegir una foto del rostro", hint: "Funciona mejor una foto de frente con la frente despejada. La foto nunca sale de este dispositivo.",
    loading: "Cargando la herramienta de análisis (solo la primera vez, unos 8 MB)…", analyzing: "Buscando puntos del rostro…",
    noFace: "No se encontró ningún rostro. Prueba con una foto donde la cara sea grande y de frente.", error: "No se pudo cargar la herramienta de análisis. Revisa la conexión e inténtalo de nuevo.",
    overall: "Equilibrio de proporciones", thirds: "Tercios faciales (vertical)", fifths: "Quintos faciales (horizontal)", mouth: "Ancho de boca ÷ nariz", symmetry: "Simetría izquierda-derecha",
    upper: "Frente", middle: "Nariz", lower: "Barbilla", lw: "Largo ÷ ancho de la cara", ideal: "referencia", again: "Otra foto",
    note: "Muestra de 0 a 100 cuánto se acerca cada proporción a la referencia clásica (tercios del 33 %, quintos del 20 %, boca÷nariz 1,5). No es una nota de atractivo. El ángulo, la luz y la expresión cambian el resultado.",
    canvas: "Foto con las líneas de tercios y quintos faciales",
  },
};

type Landmarker = { detect: (img: HTMLCanvasElement) => { faceLandmarks: { x: number; y: number }[][] } };
let landmarker: Promise<Landmarker> | null = null;
function getLandmarker(): Promise<Landmarker> {
  if (!landmarker) {
    landmarker = (async () => {
      const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
      const files = await FilesetResolver.forVisionTasks(WASM);
      const make = (delegate: "GPU" | "CPU") =>
        FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: "IMAGE", numFaces: 1 });
      return (await make("GPU").catch(() => make("CPU"))) as unknown as Landmarker;
    })();
    landmarker.catch(() => { landmarker = null; });
  }
  return landmarker;
}

function draw(cv: HTMLCanvasElement, pts: P[]) {
  const g = cv.getContext("2d");
  if (!g) return;
  const at = (i: number) => pts[i];
  const xs = [IDX.faceR, IDX.faceL].map((i) => at(i).x);
  const ys = [IDX.top, IDX.chin].map((i) => at(i).y);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  g.lineWidth = Math.max(2, cv.width / 300);
  g.setLineDash([g.lineWidth * 4, g.lineWidth * 3]);
  g.strokeStyle = "rgba(16,185,129,0.95)"; // 삼정: 가로선
  for (const i of [IDX.top, IDX.brow, IDX.subnasale, IDX.chin]) {
    g.beginPath(); g.moveTo(x0, at(i).y); g.lineTo(x1, at(i).y); g.stroke();
  }
  g.strokeStyle = "rgba(245,158,11,0.95)"; // 오안: 세로선
  for (const i of [IDX.faceR, IDX.eyeROut, IDX.eyeRIn, IDX.eyeLIn, IDX.eyeLOut, IDX.faceL]) {
    g.beginPath(); g.moveTo(at(i).x, y0); g.lineTo(at(i).x, y1); g.stroke();
  }
  g.setLineDash([]);
  g.fillStyle = "rgba(255,255,255,0.9)";
  for (const p of pts) g.fillRect(p.x - 1, p.y - 1, 2, 2);
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

export default function FaceRatio({ locale }: { locale: Locale }) {
  const tx = L[locale] ?? L.en;
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "analyzing" | "done" | "noFace" | "error">("idle");
  const [ratios, setRatios] = useState<FaceRatios | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file || !canvas.current) return;
    setRatios(null);
    setState("loading");
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const cv = canvas.current;
      cv.width = Math.round(img.naturalWidth * k);
      cv.height = Math.round(img.naturalHeight * k);
      cv.getContext("2d")?.drawImage(img, 0, 0, cv.width, cv.height);
      let lm: Landmarker;
      try { lm = await getLandmarker(); } catch { setState("error"); return; }
      setState("analyzing");
      const face = lm.detect(cv).faceLandmarks[0];
      if (!face || face.length < 468) { setState("noFace"); return; }
      const pts = face.map((p) => ({ x: p.x * cv.width, y: p.y * cv.height }));
      setRatios(faceRatios(pts));
      draw(cv, pts);
      setState("done");
    } catch {
      setState("noFace");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const b = ratios ? balance(ratios) : null;
  const busy = state === "loading" || state === "analyzing";
  const rows = b && ratios ? [
    { label: tx.thirds, score: b.thirds, detail: `${tx.upper} ${pct(ratios.thirds[0])} · ${tx.middle} ${pct(ratios.thirds[1])} · ${tx.lower} ${pct(ratios.thirds[2])} (${tx.ideal} 33%)` },
    { label: tx.fifths, score: b.fifths, detail: `${ratios.fifths.map(pct).join(" · ")} (${tx.ideal} 20%)` },
    { label: tx.mouth, score: b.mouth, detail: `${ratios.mouthToNose.toFixed(2)} (${tx.ideal} 1.5)` },
    { label: tx.symmetry, score: b.symmetry, detail: "" },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 text-center">
        <input ref={input} id="face-ratio-file" type="file" accept="image/*" className="sr-only" onChange={(e) => { void onFile(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
        <label htmlFor="face-ratio-file" className={"inline-flex min-h-11 cursor-pointer items-center rounded-md bg-primary px-5 text-base font-semibold text-primary-foreground hover:opacity-90 " + (busy ? "pointer-events-none opacity-60" : "")}>
          {state === "done" || state === "noFace" ? tx.again : tx.pick}
        </label>
        <p className="text-xs leading-5 text-muted-foreground">{tx.hint}</p>
      </div>

      <p role="status" aria-live="polite" className={"text-sm " + (state === "noFace" || state === "error" ? "font-semibold text-destructive" : "text-muted-foreground")}>
        {state === "loading" ? tx.loading : state === "analyzing" ? tx.analyzing : state === "noFace" ? tx.noFace : state === "error" ? tx.error : ""}
      </p>

      <canvas ref={canvas} role="img" aria-label={tx.canvas} className={"mx-auto block h-auto max-h-[70vh] max-w-full rounded-md border border-border " + (state === "idle" ? "hidden" : "")} />

      {b && ratios && (
        <section className="space-y-3 rounded-md border border-border bg-card p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground">{tx.overall}</h3>
            <p className="text-3xl font-bold tabular-nums text-foreground">{b.overall}<span className="text-sm font-normal text-muted-foreground"> / 100</span></p>
          </div>
          {Math.max(ratios.fifths[0], ratios.fifths[4]) > 2.5 * Math.min(ratios.fifths[0], ratios.fifths[4]) && (
            <p className="rounded-md border border-destructive p-3 text-sm font-semibold text-destructive">{tx.turned}</p>
          )}
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.label} className="space-y-1">
                <div className="flex justify-between gap-2 text-sm"><span className="font-semibold text-foreground">{r.label}</span><span className="tabular-nums text-foreground">{r.score}</span></div>
                <progress max={100} value={r.score} className="h-2 w-full accent-primary" aria-label={r.label} />
                {r.detail && <p className="text-xs tabular-nums text-muted-foreground">{r.detail}</p>}
              </li>
            ))}
          </ul>
          <p className="text-sm text-foreground">{tx.lw}: <span className="tabular-nums">{ratios.lengthToWidth.toFixed(2)}</span></p>
          <p className="text-xs leading-5 text-muted-foreground">{tx.note}</p>
        </section>
      )}
    </div>
  );
}
