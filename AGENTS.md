# Tools 작업 규칙 (tools.oiyo.net)

시작·안전·승인 계약은 `/Users/seuncho/coding/AGENTS.md`, 현재 작업은 `/Users/seuncho/coding/company-brain/NOW.md`를 따른다.

## 역할 및 도메인 원칙

1. **신규 도구 전용 포털**:
   - `tools.oiyo.net`은 신규 인터랙티브 계산기, 변환기, 판별기 등 순수 웹 유틸리티 도구의 중앙 허브입니다.
2. **기존 고순위 도구 영구 보존(Defend/Frozen)**:
   - `blog.oiyo.net/en/height-converter/` (영문 키 변환기)
   - `oiyo.net/ko/saju/calculator/` (사주 만세력 계산기)
   - `game.oiyo.net/ko/lostark-raid-distribution/` (로아 분배 계산기)
   - 위와 같이 이미 구글 검색 노출과 AdSense 수익을 내고 있는 기존 도구는 **절대로 `tools.oiyo.net`으로 이전하거나 리다이렉트하지 않고 기존 URL을 동결 방어**합니다.
3. **디자인 및 성능**:
   - Tailwind 4 시맨틱 테마 토큰 및 shadcn 디자인 시스템을 준수합니다.
   - 모바일 320px 완벽 반응형 및 클라이언트 사이드 즉각 반응 UI.

## 검증

- `npm run type-check`: `astro check`
- `npm run build`: 정적 HTML 빌드 (`dist/`)
