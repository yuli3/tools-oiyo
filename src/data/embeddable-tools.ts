// 블로그·카페에 붙이는 계산기 위젯 (2026-11-22, 창의 제안 #3).
// 붙여 넣는 코드의 iframe 바깥 출처 링크가 자연 백링크가 돼요(game embeddable-games.ts와 같은 방식).
// 임베드 페이지는 noindex이고, public/_headers의 /ko/embed/* 예외로만 다른 사이트 안에 뜰 수 있어요.
export const EMBEDDABLE_TOOLS = [
  { slug: "salary-calculator", name: "연봉 실수령액 계산기", blurb: "연봉을 넣으면 4대보험·세금을 뺀 월 실수령액이 나와요.", height: 900 },
  { slug: "unemployment-benefits-calculator", name: "실업급여 계산기", blurb: "평균임금·나이·가입기간으로 하루 구직급여와 받는 날수를 계산해요.", height: 900 },
  { slug: "loan-calculator", name: "대출 이자 계산기", blurb: "원리금균등·원금균등·만기일시 상환의 월 납입액과 총이자를 비교해요.", height: 900 },
  { slug: "annual-leave-calculator", name: "연차 계산기", blurb: "입사일로 지금 받을 수 있는 연차 일수를 계산해요.", height: 820 },
  { slug: "bmi-calculator", name: "BMI 계산기", blurb: "키·몸무게로 체질량지수와 비만도를 봐요.", height: 760 },
] as const;
export type EmbeddableTool = (typeof EMBEDDABLE_TOOLS)[number];

export const toolPageUrl = (slug: string) => `https://tools.oiyo.net/ko/${slug}/`;
export const toolEmbedUrl = (slug: string) => `https://tools.oiyo.net/ko/embed/${slug}/`;

/** 복사해 붙이는 코드: iframe + 프레임 바깥의 평범한 출처 링크 */
export function toolEmbedSnippet(t: EmbeddableTool): string {
  return `<iframe src="${toolEmbedUrl(t.slug)}" width="100%" height="${t.height}" style="border:0;border-radius:12px;max-width:720px" loading="lazy" title="${t.name}"></iframe>\n<p><a href="${toolPageUrl(t.slug)}">${t.name}</a> · OIYO 도구</p>`;
}
