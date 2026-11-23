// 구독형 달력 피드: /cal/<slug>.ics (정적 파일로 빌드). 문서는 /ko/calendar-subscribe/.
import type { APIRoute, GetStaticPaths } from "astro";
import { FEEDS, buildIcs } from "../../lib/calendar-feeds.ts";

export const getStaticPaths: GetStaticPaths = () => FEEDS.map((f) => ({ params: { feed: f.slug }, props: { slug: f.slug } }));

export const GET: APIRoute = ({ props }) => {
  const feed = FEEDS.find((f) => f.slug === props.slug)!;
  return new Response(buildIcs(feed), { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
};
