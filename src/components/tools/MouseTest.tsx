// 마우스 테스트 — 버튼·더블클릭 불량(채터링)·휠·CPS (2026-11-22).
// 옛 ahoxy.com/mouse(세션 127, 노출 283)가 대응 도구 없이 목록 허브로 가던 수요를 다시 받는다. 계산: src/lib/mouse-test.ts
import { useCallback, useRef, useState } from "react";
import type { Locale } from "../../lib/i18n";
import { BUTTON_KEYS, CHATTER_MS, buttonKey, cps, emptyStats, press, release, type ButtonKey, type ButtonStats } from "../../lib/mouse-test";

const L: Record<Locale, Record<string, string>> = {
  ko: {
    pad: "이 영역 안에서 마우스 버튼을 눌러 보세요", padTouch: "터치는 왼쪽 버튼으로 세요",
    left: "왼쪽", middle: "휠 클릭", right: "오른쪽", back: "뒤로(4번)", forward: "앞으로(5번)",
    presses: "누른 횟수", chatter: "의심", wheel: "휠", up: "위로", down: "아래로", cps: "지금 CPS", best: "최고 CPS",
    reset: "처음부터", ok: "더블클릭 불량 신호가 아직 없어요.", warn: "한 번 눌렀는데 두 번 들어간 신호가 {n}번 있었어요(뗀 뒤 {ms}ms 안에 다시 눌림). 같은 버튼에서 계속 나오면 스위치 채터링일 수 있어요.",
    minGap: "가장 짧은 뗌→누름 간격", none: "—",
  },
  en: {
    pad: "Press your mouse buttons inside this area", padTouch: "Taps count as the left button",
    left: "Left", middle: "Wheel click", right: "Right", back: "Back (4)", forward: "Forward (5)",
    presses: "Presses", chatter: "Suspect", wheel: "Wheel", up: "Up", down: "Down", cps: "CPS now", best: "Best CPS",
    reset: "Reset", ok: "No double-click fault signals yet.", warn: "{n} press(es) registered twice (pressed again within {ms} ms of release). If it keeps happening on the same button, the switch may be chattering.",
    minGap: "Shortest release→press gap", none: "—",
  },
  ja: {
    pad: "このエリアの中でマウスのボタンを押してください", padTouch: "タップは左ボタンとして数えます",
    left: "左", middle: "ホイールクリック", right: "右", back: "戻る(4)", forward: "進む(5)",
    presses: "押した回数", chatter: "疑い", wheel: "ホイール", up: "上", down: "下", cps: "現在のCPS", best: "最高CPS",
    reset: "リセット", ok: "チャタリングの兆候はまだありません。", warn: "1回押したのに2回入った兆候が{n}回ありました(離してから{ms}ms以内に再入力)。同じボタンで続く場合はスイッチのチャタリングかもしれません。",
    minGap: "最短の離す→押す間隔", none: "—",
  },
  zh: {
    pad: "在此区域内按下鼠标按键", padTouch: "触摸按左键计算",
    left: "左键", middle: "滚轮点击", right: "右键", back: "后退(4)", forward: "前进(5)",
    presses: "按下次数", chatter: "可疑", wheel: "滚轮", up: "向上", down: "向下", cps: "当前 CPS", best: "最高 CPS",
    reset: "重置", ok: "暂未发现双击故障信号。", warn: "有 {n} 次按一下却记成两下(松开后 {ms} 毫秒内再次按下)。如果同一按键反复出现，可能是微动开关抖动。",
    minGap: "最短松开→按下间隔", none: "—",
  },
  fr: {
    pad: "Appuyez sur les boutons de la souris dans cette zone", padTouch: "Un toucher compte comme bouton gauche",
    left: "Gauche", middle: "Clic molette", right: "Droit", back: "Précédent (4)", forward: "Suivant (5)",
    presses: "Appuis", chatter: "Suspects", wheel: "Molette", up: "Haut", down: "Bas", cps: "CPS actuel", best: "Meilleur CPS",
    reset: "Recommencer", ok: "Aucun signe de double-clic involontaire pour l'instant.", warn: "{n} appui(s) compté(s) deux fois (nouvel appui moins de {ms} ms après le relâchement). Si cela se répète sur le même bouton, l'interrupteur rebondit peut-être.",
    minGap: "Plus court relâchement→appui", none: "—",
  },
  es: {
    pad: "Pulsa los botones del ratón dentro de esta zona", padTouch: "Los toques cuentan como botón izquierdo",
    left: "Izquierdo", middle: "Clic de rueda", right: "Derecho", back: "Atrás (4)", forward: "Adelante (5)",
    presses: "Pulsaciones", chatter: "Sospechosas", wheel: "Rueda", up: "Arriba", down: "Abajo", cps: "CPS ahora", best: "Mejor CPS",
    reset: "Reiniciar", ok: "Aún no hay señales de doble clic involuntario.", warn: "{n} pulsación(es) contada(s) dos veces (se volvió a pulsar menos de {ms} ms después de soltar). Si se repite en el mismo botón, el interruptor puede estar fallando.",
    minGap: "Menor intervalo soltar→pulsar", none: "—",
  },
};

const fresh = () => Object.fromEntries(BUTTON_KEYS.map((k) => [k, emptyStats()])) as Record<ButtonKey, ButtonStats>;

export default function MouseTest({ locale }: { locale: Locale }) {
  const tx = L[locale] ?? L.en;
  const [stats, setStats] = useState(fresh);
  const [held, setHeld] = useState<Set<ButtonKey>>(new Set());
  const [wheel, setWheel] = useState({ up: 0, down: 0 });
  const [now, setNow] = useState({ cps: 0, best: 0 });
  const times = useRef<number[]>([]);

  const onDown = useCallback((e: React.PointerEvent) => {
    const k = e.pointerType === "mouse" ? buttonKey(e.button) : "left";
    if (!k) return;
    e.preventDefault();
    const t = e.timeStamp || performance.now();
    setStats((s) => ({ ...s, [k]: press(s[k], t) }));
    setHeld((h) => new Set(h).add(k));
    if (k === "left") {
      times.current = [...times.current.filter((x) => t - x <= 1000), t];
      const c = cps(times.current, t);
      setNow((n) => ({ cps: c, best: Math.max(n.best, c) }));
    }
  }, []);
  const onUp = useCallback((e: React.PointerEvent) => {
    const k = e.pointerType === "mouse" ? buttonKey(e.button) : "left";
    if (!k) return;
    const t = e.timeStamp || performance.now();
    setStats((s) => ({ ...s, [k]: release(s[k], t) }));
    setHeld((h) => { const n = new Set(h); n.delete(k); return n; });
  }, []);
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY === 0) return;
    setWheel((w) => (e.deltaY < 0 ? { ...w, up: w.up + 1 } : { ...w, down: w.down + 1 }));
  }, []);
  const reset = () => { setStats(fresh()); setHeld(new Set()); setWheel({ up: 0, down: 0 }); setNow({ cps: 0, best: 0 }); times.current = []; };

  const totalChatter = BUTTON_KEYS.reduce((n, k) => n + stats[k].chatter, 0);
  const gaps = BUTTON_KEYS.map((k) => stats[k].minGap).filter((g): g is number => g !== null);
  const minGap = gaps.length ? Math.round(Math.min(...gaps)) : null;

  return (
    <div className="space-y-5">
      <div
        role="application"
        aria-label={tx.pad}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onContextMenu={(e) => e.preventDefault()}
        onAuxClick={(e) => e.preventDefault()}
        onWheel={onWheel}
        className="flex min-h-56 touch-none select-none flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 text-center"
      >
        <p className="text-base font-semibold text-foreground">{tx.pad}</p>
        <p className="text-xs text-muted-foreground">{tx.padTouch}</p>
        <ul className="grid w-full max-w-md grid-cols-3 gap-2 sm:grid-cols-5">
          {BUTTON_KEYS.map((k) => (
            <li
              key={k}
              className={"rounded-md border px-2 py-2 text-sm " + (held.has(k) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground")}
            >
              <span className="block font-semibold">{tx[k]}</span>
              <span className="block tabular-nums">{stats[k].presses}</span>
              {stats[k].chatter > 0 && <span className="block text-xs font-semibold text-destructive">{tx.chatter} {stats[k].chatter}</span>}
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-2 gap-2 rounded-md border border-border bg-card p-4 text-sm sm:grid-cols-4">
        <div><dt className="text-muted-foreground">{tx.wheel} {tx.up}</dt><dd className="text-lg font-semibold tabular-nums text-foreground">{wheel.up}</dd></div>
        <div><dt className="text-muted-foreground">{tx.wheel} {tx.down}</dt><dd className="text-lg font-semibold tabular-nums text-foreground">{wheel.down}</dd></div>
        <div><dt className="text-muted-foreground">{tx.cps}</dt><dd className="text-lg font-semibold tabular-nums text-foreground">{now.cps}</dd></div>
        <div><dt className="text-muted-foreground">{tx.best}</dt><dd className="text-lg font-semibold tabular-nums text-foreground">{now.best}</dd></div>
        <div className="col-span-2 sm:col-span-4"><dt className="text-muted-foreground">{tx.minGap}</dt><dd className="tabular-nums text-foreground">{minGap === null ? tx.none : `${minGap} ms`}</dd></div>
      </dl>

      <p role="status" aria-live="polite" className={"rounded-md border p-4 text-sm leading-6 " + (totalChatter ? "border-destructive text-destructive" : "border-border text-muted-foreground")}>
        {totalChatter ? tx.warn.replace("{n}", String(totalChatter)).replace("{ms}", String(CHATTER_MS)) : tx.ok}
      </p>

      <button type="button" onClick={reset} className="min-h-11 rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted">
        {tx.reset}
      </button>
    </div>
  );
}
