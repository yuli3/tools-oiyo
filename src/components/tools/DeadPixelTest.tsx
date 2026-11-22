// 모니터 불량화소(데드·핫·스턱 픽셀) 테스트 (2026-11-22).
// 옛 ahoxy.com/monitor(Bing 83%, 1,103세션)가 대응 도구 없이 목록 허브로 가던 수요를 다시 받는다.
// 화면을 단색으로 채워 눈으로 찾는 도구라 계산은 없다. 깜박임(스턱 픽셀 '풀기')은 광과민 위험이 있어 넣지 않는다.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "../../lib/i18n";

type Screen = { key: string; cls: string; dark: boolean };
const SCREENS: Screen[] = [
  { key: "black", cls: "dpt-black", dark: true },
  { key: "white", cls: "dpt-white", dark: false },
  { key: "red", cls: "dpt-red", dark: true },
  { key: "green", cls: "dpt-green", dark: false },
  { key: "blue", cls: "dpt-blue", dark: true },
  { key: "gray", cls: "dpt-gray", dark: false },
  { key: "gradient", cls: "dpt-gradient", dark: false },
  { key: "checker", cls: "dpt-checker", dark: false },
];

const L: Record<Locale, Record<string, string>> = {
  ko: {
    start: "전체 화면으로 테스트 시작", next: "다음 색", prev: "이전 색", exit: "끝내기", pick: "색을 골라 바로 보기",
    hint: "화면을 누르거나 → 키로 다음 색, ← 키로 이전 색, Esc로 끝내요.",
    black: "검정 — 밝게 빛나는 점(핫 픽셀)", white: "흰색 — 검게 꺼진 점(데드 픽셀)", red: "빨강 — 다른 색으로 남은 점(스턱 픽셀)", green: "초록 — 스턱 픽셀", blue: "파랑 — 스턱 픽셀",
    gray: "회색 — 얼룩·멍(무라)", gradient: "그라데이션 — 계단 현상·밴딩", checker: "1픽셀 격자 — 선명도·깜빡임",
    info: "이 화면 정보", res: "화면 해상도", css: "CSS 픽셀", dpr: "기기 픽셀 비율", hz: "주사율(추정)", measuring: "재는 중…",
    found: "점을 찾았다면", foundBody: "같은 자리에 계속 보이는지 다른 색에서도 확인하세요. 먼지는 천으로 닦으면 사라지고, 불량화소는 색을 바꿔도 같은 자리에 남아요. 화면을 사진으로 찍어 두면 교환·환불 문의 때 도움이 돼요.",
  },
  en: {
    start: "Start full-screen test", next: "Next color", prev: "Previous color", exit: "Exit", pick: "Pick a color to view",
    hint: "Tap the screen or press → for the next color, ← for the previous one, Esc to exit.",
    black: "Black — bright dots (hot pixels)", white: "White — dark dots (dead pixels)", red: "Red — dots stuck on another color", green: "Green — stuck pixels", blue: "Blue — stuck pixels",
    gray: "Gray — clouding and blotches (mura)", gradient: "Gradient — banding", checker: "1-pixel checkerboard — sharpness and flicker",
    info: "This screen", res: "Screen resolution", css: "CSS pixels", dpr: "Device pixel ratio", hz: "Refresh rate (estimate)", measuring: "measuring…",
    found: "If you spot a dot", foundBody: "Check whether it stays in the same place on other colors. Dust wipes off with a cloth; a bad pixel stays put when the color changes. Take a photo of the screen if you plan to ask for a return or replacement.",
  },
  ja: {
    start: "全画面でテスト開始", next: "次の色", prev: "前の色", exit: "終了", pick: "色を選んで表示",
    hint: "画面をタップするか → キーで次の色、← キーで前の色、Esc で終了します。",
    black: "黒 — 明るく光る点(輝点)", white: "白 — 黒く消えた点(滅点)", red: "赤 — 別の色のまま残る点", green: "緑 — 固定ドット", blue: "青 — 固定ドット",
    gray: "グレー — ムラ・にじみ", gradient: "グラデーション — バンディング", checker: "1ピクセル格子 — 鮮明さ・ちらつき",
    info: "この画面の情報", res: "画面解像度", css: "CSSピクセル", dpr: "デバイスピクセル比", hz: "リフレッシュレート(推定)", measuring: "計測中…",
    found: "点を見つけたら", foundBody: "ほかの色でも同じ場所に見えるか確かめてください。ほこりは布で拭けば消え、ドット欠けは色を変えても同じ場所に残ります。返品・交換の相談に備えて画面を撮影しておくと役立ちます。",
  },
  zh: {
    start: "全屏开始测试", next: "下一种颜色", prev: "上一种颜色", exit: "退出", pick: "选择颜色直接查看",
    hint: "点击屏幕或按 → 键切换到下一种颜色，按 ← 键返回上一种，按 Esc 退出。",
    black: "黑色 — 发亮的点(亮点)", white: "白色 — 发黑的点(坏点)", red: "红色 — 停在其他颜色的点", green: "绿色 — 卡色点", blue: "蓝色 — 卡色点",
    gray: "灰色 — 云斑和色块", gradient: "渐变 — 色带断层", checker: "1像素棋盘 — 清晰度与闪烁",
    info: "当前屏幕信息", res: "屏幕分辨率", css: "CSS 像素", dpr: "设备像素比", hz: "刷新率(估算)", measuring: "测量中…",
    found: "如果发现了点", foundBody: "换几种颜色看它是否还在同一位置。灰尘用布擦掉就会消失，坏点在换颜色后仍留在原处。如需退换货，先拍下屏幕照片会有帮助。",
  },
  fr: {
    start: "Lancer le test en plein écran", next: "Couleur suivante", prev: "Couleur précédente", exit: "Quitter", pick: "Choisir une couleur",
    hint: "Touchez l'écran ou appuyez sur → pour la couleur suivante, ← pour la précédente, Échap pour quitter.",
    black: "Noir — points brillants (pixels chauds)", white: "Blanc — points noirs (pixels morts)", red: "Rouge — points bloqués sur une autre couleur", green: "Vert — pixels bloqués", blue: "Bleu — pixels bloqués",
    gray: "Gris — taches et nuages (mura)", gradient: "Dégradé — effet de bandes", checker: "Damier 1 pixel — netteté et scintillement",
    info: "Cet écran", res: "Résolution de l'écran", css: "Pixels CSS", dpr: "Rapport de pixels", hz: "Fréquence (estimation)", measuring: "mesure…",
    found: "Si vous voyez un point", foundBody: "Vérifiez s'il reste au même endroit sur les autres couleurs. La poussière s'essuie avec un chiffon ; un pixel défectueux reste en place quand la couleur change. Prenez une photo de l'écran si vous comptez demander un échange.",
  },
  es: {
    start: "Empezar la prueba en pantalla completa", next: "Color siguiente", prev: "Color anterior", exit: "Salir", pick: "Elige un color para verlo",
    hint: "Toca la pantalla o pulsa → para el color siguiente, ← para el anterior y Esc para salir.",
    black: "Negro — puntos brillantes (píxeles calientes)", white: "Blanco — puntos negros (píxeles muertos)", red: "Rojo — puntos atascados en otro color", green: "Verde — píxeles atascados", blue: "Azul — píxeles atascados",
    gray: "Gris — manchas y nubes (mura)", gradient: "Degradado — bandas", checker: "Damero de 1 píxel — nitidez y parpadeo",
    info: "Esta pantalla", res: "Resolución de pantalla", css: "Píxeles CSS", dpr: "Relación de píxeles", hz: "Frecuencia (estimada)", measuring: "midiendo…",
    found: "Si encuentras un punto", foundBody: "Comprueba si sigue en el mismo sitio con otros colores. El polvo se quita con un paño; un píxel defectuoso se queda en su sitio al cambiar el color. Haz una foto de la pantalla si vas a pedir un cambio o devolución.",
  },
};

export default function DeadPixelTest({ locale }: { locale: Locale }) {
  const tx = L[locale] ?? L.en;
  const [index, setIndex] = useState<number | null>(null);
  const [info, setInfo] = useState<{ w: number; h: number; cw: number; ch: number; dpr: number } | null>(null);
  const [hz, setHz] = useState<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    setInfo({ w: Math.round(screen.width * dpr), h: Math.round(screen.height * dpr), cw: screen.width, ch: screen.height, dpr });
    // 주사율: 60프레임 간격의 중앙값으로 추정한다(탭이 백그라운드면 브라우저가 늦춰서 부정확).
    const stamps: number[] = [];
    let id = 0;
    const tick = (t: number) => {
      stamps.push(t);
      if (stamps.length < 61) id = requestAnimationFrame(tick);
      else {
        const gaps = stamps.slice(1).map((v, i) => v - stamps[i]).sort((a, b) => a - b);
        const mid = gaps[Math.floor(gaps.length / 2)];
        if (mid > 0) setHz(Math.round(1000 / mid));
      }
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const open = useCallback((i: number) => {
    setIndex(i);
    const el = stage.current;
    if (el && document.fullscreenElement !== el && el.requestFullscreen) el.requestFullscreen().catch(() => {});
  }, []);
  const close = useCallback(() => {
    setIndex(null);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + SCREENS.length) % SCREENS.length)), []);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") step(-1);
    };
    const onFs = () => { if (!document.fullscreenElement) setIndex(null); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("fullscreenchange", onFs); };
  }, [index, close, step]);

  const cur = index === null ? null : SCREENS[index];
  return (
    <div className="space-y-5">
      <button type="button" onClick={() => open(0)} className="min-h-12 w-full rounded-md bg-primary px-4 text-base font-semibold text-primary-foreground hover:bg-primary/90">
        {tx.start}
      </button>
      <p className="text-sm text-muted-foreground">{tx.hint}</p>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">{tx.pick}</p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SCREENS.map((s, i) => (
            <li key={s.key}>
              <button type="button" onClick={() => open(i)} className="flex min-h-11 w-full items-center gap-2 rounded-md border border-border bg-background px-2 py-2 text-left text-sm text-foreground hover:bg-muted">
                <span aria-hidden="true" className={"size-6 shrink-0 rounded border border-border " + s.cls} />
                <span>{tx[s.key]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-2 gap-2 rounded-md border border-border bg-card p-4 text-sm">
        <dt className="col-span-2 font-semibold text-foreground">{tx.info}</dt>
        <dt className="text-muted-foreground">{tx.res}</dt><dd className="text-foreground">{info ? `${info.w} × ${info.h}` : "—"}</dd>
        <dt className="text-muted-foreground">{tx.css}</dt><dd className="text-foreground">{info ? `${info.cw} × ${info.ch}` : "—"}</dd>
        <dt className="text-muted-foreground">{tx.dpr}</dt><dd className="text-foreground">{info ? info.dpr : "—"}</dd>
        <dt className="text-muted-foreground">{tx.hz}</dt><dd className="text-foreground">{hz ? `${hz} Hz` : tx.measuring}</dd>
      </dl>

      <div className="rounded-md border border-border bg-card p-4 text-sm">
        <p className="font-semibold text-foreground">{tx.found}</p>
        <p className="mt-1 leading-6 text-muted-foreground">{tx.foundBody}</p>
      </div>

      <div
        ref={stage}
        role="dialog"
        aria-modal="true"
        aria-label={cur ? tx[cur.key] : tx.start}
        hidden={cur === null}
        onClick={() => step(1)}
        className={"fixed inset-0 z-50 cursor-pointer select-none " + (cur ? cur.cls : "")}
      >
        {cur && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
            <span className={"rounded-md px-3 py-2 text-xs opacity-60 " + (cur.dark ? "text-white" : "text-black")}>
              {index! + 1}/{SCREENS.length} · {tx[cur.key]}
            </span>
          </div>
        )}
        {cur && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); close(); }}
            className={"absolute right-3 top-3 min-h-11 rounded-md px-3 text-sm opacity-60 hover:opacity-100 " + (cur.dark ? "text-white" : "text-black")}
          >
            {tx.exit}
          </button>
        )}
      </div>
    </div>
  );
}
