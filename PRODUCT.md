# OIYO tools (tools.oiyo.net)

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

검색에서 바로 들어와 한 가지 계산을 끝내려는 사람이다. 대부분 휴대폰(320~430px)으로 들어오고, 실업급여·월급·세금·환율처럼 숫자 하나를 확인한 뒤 떠난다. 한국어 사용자가 가장 많고 en·ja·zh·fr·es 사용자는 자기 나라 기준을 기대한다.

## Product Purpose

설치·로그인 없이 브라우저 안에서 즉시 계산하고, 결과가 어떤 기준(법령·요율·기준일)으로 나왔는지 같은 화면에서 확인하게 한다. 도구 수보다 정확성, 첫 화면에서 입력이 보이는 속도, 근거 표시를 우선한다.

## Positioning

광고 수익 사이트지만 계산기 템플릿 농장처럼 보이지 않는다. 기준일과 공식 출처를 결과 바로 옆에 두고, 국가별 법령은 번역이 아니라 각 나라 기준으로 만든다.

## Operating Context

Astro 정적 빌드 + React 섬(client:load). Cloudflare Pages. GA4·AdSense 사용. 요율 정본은 `src/lib/kr-rates-2026.mjs`(api 저장소 복사본). 입력값은 서버로 보내지 않는다.

## Mode

모든 도구 화면은 impeccable **Operate** 모드다. 허브(`/`)만 탐색 화면이다. 표현보다 훑어보기·일관성·실제 사용 장면이 우선이다.

## Capabilities and Constraints

- 공용 프레임은 `src/components/ToolShell.astro` 하나다: H1 → 설명(+관할) → 도구 → 근거·해설 → 관련 도구.
- 도구 컴포넌트는 `ToolPanel`로 감싸도 겉 카드가 생기지 않는다. 카드는 입력 묶음·결과 묶음처럼 의미 있는 단위에만 한 겹 쓴다.
- 관련 도구는 `RelatedLinkList`(구분선 + h2 + 목록, 12개 넘으면 접기)로만 보여 준다.
- 기존 URL은 동결한다. 디자인 변경이 slug·canonical·JSON-LD를 바꾸지 않는다.

## Brand Commitments

SOUL.md가 이긴다: 올리브/그린 primary 토큰, 시스템 글꼴, 다크모드 없음, 애니메이션은 필요한 곳에만, 해요체, 사실만 쓰는 문구("제로 트래킹" 금지). impeccable의 bolder·overdrive·colorize는 요청이 있을 때만 쓴다.

## Accessibility & Inclusion

44px 이상 터치 대상, 입력 글꼴 16px 이상(iOS 확대 방지), 제목 단계 건너뛰지 않기(결과 숫자는 제목 태그가 아니라 강조 글씨), 빈 입력은 오류가 아닌 안내로 보여 주기, 색만으로 구분하지 않기.

## Evidence on Hand

- impeccable 감사(2026-11-03): 검출기 1,073쪽 2,412건 → ToolShell 1차 후 nested-cards 2,168 → 1,105건. 보고서: company-brain 기록과 프로젝트 문서 "Tools에 impeccable 적용 연구".
- 사용 지표: GA4 `tool_engage`·`tool_calculate`(`src/lib/tool-telemetry.ts`).

## Product Principles

1. 첫 화면에 입력이 보인다.
2. 결과 옆에 기준일과 출처가 있다.
3. 한 화면에 카드는 한 겹이다.
4. 같은 종류의 도구는 같은 순서로 읽힌다.
5. 추정치는 "추정"이라고 쓴다.
