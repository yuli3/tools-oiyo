// 2026-11-11: Grok Build 그림(도구 아이콘 154·묶음 공유 이미지 10)을 경로로만 찾는다. 그림이 없는 도구는 undefined.
import toolArt from './tool-art.json';
import { utilityCatalog } from './utility-catalog';

const icons = new Set<string>(toolArt.icons);
const groupOg = new Set<string>(toolArt.groupOg);

/** /ko/loan-calculator/ → loan-calculator */
export function toolSlugFromPath(pathname: string): string | undefined {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length >= 2 ? parts[1] : undefined;
}

export function toolIcon(slug: string | undefined): string | undefined {
  return slug && icons.has(slug) ? `/images/tool-icons/${slug}.webp` : undefined;
}

export function toolOgImage(slug: string | undefined): string | undefined {
  const group = utilityCatalog.find((t) => t.slug === slug)?.group;
  return group && groupOg.has(group) ? `https://tools.oiyo.net/images/og/tools-${group}.jpg` : undefined;
}
