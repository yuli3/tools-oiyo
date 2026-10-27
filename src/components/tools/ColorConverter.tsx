import { type CSSProperties, useState, useEffect, useRef, useCallback } from "react";
import type { Locale } from "../../lib/i18n";
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, rgbToCmyk, cmykToRgb } from "../../lib/color-math";

// ─── CSS color name table ────────────────────────────────────────────────────
const CSS_COLORS: Record<string, [number, number, number]> = {
  red: [255, 0, 0], blue: [0, 0, 255], green: [0, 128, 0],
  yellow: [255, 255, 0], orange: [255, 165, 0], purple: [128, 0, 128],
  pink: [255, 192, 203], brown: [165, 42, 42], gray: [128, 128, 128],
  black: [0, 0, 0], white: [255, 255, 255], cyan: [0, 255, 255],
  magenta: [255, 0, 255], lime: [0, 255, 0], navy: [0, 0, 128],
  teal: [0, 128, 128], gold: [255, 215, 0], silver: [192, 192, 192],
  coral: [255, 127, 80], salmon: [250, 128, 114], violet: [238, 130, 238],
  indigo: [75, 0, 130], crimson: [220, 20, 60], turquoise: [64, 224, 208],
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const nearestCssColor = (r: number, g: number, b: number): string => {
  let best = "";
  let bestDist = Infinity;
  for (const [name, [cr, cg, cb]] of Object.entries(CSS_COLORS)) {
    const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (dist < bestDist) { bestDist = dist; best = name; }
  }
  return best;
};

// ─── i18n ────────────────────────────────────────────────────────────────────
const UI: Record<Locale, {
  title: string; subtitle: string; hex: string; rgb: string; hsl: string;
  hsv: string; cmyk: string; copy: string; copied: string; sliders: string;
  recent: string; nearest: string; noRecent: string;
}> = {
  ko: {
    title: "색상 변환기", subtitle: "HEX · RGB · HSL · HSV · CMYK",
    hex: "HEX", rgb: "RGB", hsl: "HSL", hsv: "HSV", cmyk: "CMYK",
    copy: "복사", copied: "복사됨", sliders: "RGB 슬라이더",
    recent: "최근 색상", nearest: "CSS 이름", noRecent: "최근 색상 없음",
  },
  en: {
    title: "Color Converter", subtitle: "HEX · RGB · HSL · HSV · CMYK",
    hex: "HEX", rgb: "RGB", hsl: "HSL", hsv: "HSV", cmyk: "CMYK",
    copy: "Copy", copied: "Copied", sliders: "RGB Sliders",
    recent: "Recent Colors", nearest: "CSS Name", noRecent: "No recent colors",
  },
  ja: {
    title: "カラーコード変換器", subtitle: "HEX · RGB · HSL · HSV · CMYK",
    hex: "HEX", rgb: "RGB", hsl: "HSL", hsv: "HSV", cmyk: "CMYK",
    copy: "コピー", copied: "コピー済", sliders: "RGBスライダー",
    recent: "最近の色", nearest: "CSS名", noRecent: "最近の色なし",
  },
  fr: {
    title: "Convertisseur de couleurs", subtitle: "HEX · RGB · HSL · HSV · CMYK",
    hex: "HEX", rgb: "RGB", hsl: "HSL", hsv: "HSV", cmyk: "CMYK",
    copy: "Copier", copied: "Copié", sliders: "Curseurs RGB",
    recent: "Couleurs récentes", nearest: "Nom CSS", noRecent: "Aucune couleur récente",
  },
  es: {
    title: "Convertidor de colores", subtitle: "HEX · RGB · HSL · HSV · CMYK",
    hex: "HEX", rgb: "RGB", hsl: "HSL", hsv: "HSV", cmyk: "CMYK",
    copy: "Copiar", copied: "Copiado", sliders: "Controles RGB",
    recent: "Colores recientes", nearest: "Nombre CSS", noRecent: "Sin colores recientes",
  },
  zh: {
    title: "颜色转换器", subtitle: "HEX · RGB · HSL · HSV · CMYK",
    hex: "HEX", rgb: "RGB", hsl: "HSL", hsv: "HSV", cmyk: "CMYK",
    copy: "复制", copied: "已复制", sliders: "RGB 滑块",
    recent: "最近颜色", nearest: "CSS 名称", noRecent: "无最近颜色",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────
const RECENT_KEY = "color-converter-recent";

export default function ColorConverter({ locale = "ko" }: { locale?: Locale }) {
  const t = UI[locale] ?? UI.en;

  const [rgb, setRgb] = useState<[number, number, number]>([99, 102, 241]);

  // derived
  const hex = rgbToHex(...rgb);
  const hsl = rgbToHsl(...rgb);
  const hsv = rgbToHsv(...rgb);
  const cmyk = rgbToCmyk(...rgb);
  const cssName = nearestCssColor(...rgb);

  // input strings (allow partial editing without losing cursor)
  const [hexInput, setHexInput] = useState(hex);
  const [rgbInput, setRgbInput] = useState(`${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);
  const [hslInput, setHslInput] = useState(`${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%`);
  const [hsvInput, setHsvInput] = useState(`${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%`);
  const [cmykInput, setCmykInput] = useState(`${cmyk[0]}, ${cmyk[1]}, ${cmyk[2]}, ${cmyk[3]}`);

  // copy state per format
  const [copied, setCopied] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch { /* noop */ }
  }, []);

  const syncFromRgb = useCallback((r: number, g: number, b: number) => {
    const newHex = rgbToHex(r, g, b);
    const newHsl = rgbToHsl(r, g, b);
    const newHsv = rgbToHsv(r, g, b);
    const newCmyk = rgbToCmyk(r, g, b);
    setRgb([r, g, b]);
    setHexInput(newHex);
    setRgbInput(`${r}, ${g}, ${b}`);
    setHslInput(`${newHsl[0]}, ${newHsl[1]}%, ${newHsl[2]}%`);
    setHsvInput(`${newHsv[0]}, ${newHsv[1]}%, ${newHsv[2]}%`);
    setCmykInput(`${newCmyk[0]}, ${newCmyk[1]}, ${newCmyk[2]}, ${newCmyk[3]}`);

    // save to recent
    setRecent((prev) => {
      const next = [newHex, ...prev.filter((c) => c !== newHex)].slice(0, 10);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  // ── HEX input ──────────────────────────────────────────────────────────────
  const handleHexChange = (v: string) => {
    setHexInput(v);
    const cleaned = v.trim().replace(/^#?/, "#");
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      const [r, g, b] = hexToRgb(cleaned);
      syncFromRgb(r, g, b);
    }
  };

  // ── RGB input ──────────────────────────────────────────────────────────────
  const handleRgbChange = (v: string) => {
    setRgbInput(v);
    const parts = v.split(",").map((s) => parseInt(s.trim(), 10));
    if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
      const [r, g, b] = parts.map((n) => clamp(n, 0, 255)) as [number, number, number];
      syncFromRgb(r, g, b);
    }
  };

  // ── HSL input ─────────────────────────────────────────────────────────────
  const handleHslChange = (v: string) => {
    setHslInput(v);
    const parts = v.replace(/%/g, "").split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
      const [h, s, l] = [clamp(parts[0], 0, 360), clamp(parts[1], 0, 100), clamp(parts[2], 0, 100)];
      const [r, g, b] = hslToRgb(h, s, l);
      syncFromRgb(r, g, b);
    }
  };

  // ── HSV input ─────────────────────────────────────────────────────────────
  const handleHsvChange = (v: string) => {
    setHsvInput(v);
    const parts = v.replace(/%/g, "").split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
      const [h, s, vv] = [clamp(parts[0], 0, 360), clamp(parts[1], 0, 100), clamp(parts[2], 0, 100)];
      const [r, g, b] = hsvToRgb(h, s, vv);
      syncFromRgb(r, g, b);
    }
  };

  // ── CMYK input ────────────────────────────────────────────────────────────
  const handleCmykChange = (v: string) => {
    setCmykInput(v);
    const parts = v.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      const [c, m, y, k] = parts.map((n) => clamp(n, 0, 100)) as [number, number, number, number];
      const [r, g, b] = cmykToRgb(c, m, y, k);
      syncFromRgb(r, g, b);
    }
  };

  // ── Copy ──────────────────────────────────────────────────────────────────
  const copyText = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => { /* noop */ });
    setCopied(key);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(null), 1500);
  }, []);

  // ── Slider change ─────────────────────────────────────────────────────────
  const handleSlider = (channel: 0 | 1 | 2, v: number) => {
    const next: [number, number, number] = [...rgb] as [number, number, number];
    next[channel] = clamp(v, 0, 255);
    syncFromRgb(...next);
  };

  const previewColor = hex;

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-black text-foreground">{t.title}</h1>
        <p className="text-xs font-semibold text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* Color preview */}
      <div
        className="h-20 w-full rounded-2xl border border-border bg-(--preview) shadow-inner"
        style={{ '--preview': previewColor } as CSSProperties}
      />

      {/* CSS name + HEX badge */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {t.nearest}:
        </span>
        <span className="px-3 py-1 rounded-full bg-muted text-sm font-bold text-foreground">
          {cssName}
        </span>
        <span
          className="px-3 py-1 rounded-full bg-(--preview) text-sm font-mono font-bold text-white text-shadow-sm"
          style={{ '--preview': previewColor } as CSSProperties}
        >
          {hex.toUpperCase()}
        </span>
      </div>

      {/* Format rows */}
      <div className="flex flex-col gap-3">
        {/* HEX */}
        <FormatRow
          label={t.hex}
          value={hexInput}
          copyValue={hexInput}
          onChange={handleHexChange}
          copyKey="hex"
          copied={copied}
          onCopy={copyText}
          copyLabel={t.copy}
          copiedLabel={t.copied}
          placeholder="#6366f1"
        />
        {/* RGB */}
        <FormatRow
          label={t.rgb}
          value={rgbInput}
          copyValue={`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`}
          onChange={handleRgbChange}
          copyKey="rgb"
          copied={copied}
          onCopy={copyText}
          copyLabel={t.copy}
          copiedLabel={t.copied}
          placeholder="99, 102, 241"
        />
        {/* HSL */}
        <FormatRow
          label={t.hsl}
          value={hslInput}
          copyValue={`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}
          onChange={handleHslChange}
          copyKey="hsl"
          copied={copied}
          onCopy={copyText}
          copyLabel={t.copy}
          copiedLabel={t.copied}
          placeholder="239, 84%, 67%"
        />
        {/* HSV */}
        <FormatRow
          label={t.hsv}
          value={hsvInput}
          copyValue={`hsv(${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%)`}
          onChange={handleHsvChange}
          copyKey="hsv"
          copied={copied}
          onCopy={copyText}
          copyLabel={t.copy}
          copiedLabel={t.copied}
          placeholder="239, 59%, 95%"
        />
        {/* CMYK */}
        <FormatRow
          label={t.cmyk}
          value={cmykInput}
          copyValue={`cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)`}
          onChange={handleCmykChange}
          copyKey="cmyk"
          copied={copied}
          onCopy={copyText}
          copyLabel={t.copy}
          copiedLabel={t.copied}
          placeholder="59, 58, 0, 5"
        />
      </div>

      {/* RGB sliders */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col gap-3">
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
          {t.sliders}
        </p>
        {([
          { ch: 0 as const, color: "#ef4444", label: "R" },
          { ch: 1 as const, color: "#22c55e", label: "G" },
          { ch: 2 as const, color: "#3b82f6", label: "B" },
        ]).map(({ ch, color, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-4 text-xs font-black text-(--channel)" style={{ '--channel': color } as CSSProperties}>{label}</span>
            <input
              type="range"
              min={0}
              max={255}
              value={rgb[ch]}
              onChange={(e) => handleSlider(ch, parseInt(e.target.value, 10))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-(--channel)"
              style={{ '--channel': color } as CSSProperties}
            />
            <span className="w-8 text-right text-xs font-mono text-muted-foreground">
              {rgb[ch]}
            </span>
          </div>
        ))}
      </div>

      {/* Recent colors */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
          {t.recent}
        </p>
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t.noRecent}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recent.map((color) => (
              <button
                key={color}
                title={color}
                onClick={() => {
                  const [r, g, b] = hexToRgb(color);
                  syncFromRgb(r, g, b);
                }}
                className="w-8 h-8 rounded-lg border-2 border-border shadow-sm hover:scale-110 transition-transform bg-(--swatch)"
                style={{ '--swatch': color } as CSSProperties}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FormatRow sub-component ─────────────────────────────────────────────────
function FormatRow({
  label, value, copyValue, onChange, copyKey, copied,
  onCopy, copyLabel, copiedLabel, placeholder,
}: {
  label: string;
  value: string;
  copyValue: string;
  onChange: (v: string) => void;
  copyKey: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
  copyLabel: string;
  copiedLabel: string;
  placeholder: string;
}) {
  const isCopied = copied === copyKey;
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-xs font-black text-muted-foreground uppercase tracking-widest shrink-0">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 px-3 py-2 rounded-xl bg-muted/30 border border-border text-base font-mono outline-none focus:ring-2 focus:ring-primary/50 transition"
      />
      <button
        onClick={() => onCopy(copyValue, copyKey)}
        className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
          isCopied
            ? "bg-success text-white"
            : "bg-muted hover:bg-muted/80 text-muted-foreground"
        }`}
      >
        {isCopied ? "✓" : "📋"}
        <span className="ml-1 hidden sm:inline">{isCopied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  );
}
