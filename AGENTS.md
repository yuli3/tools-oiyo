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
   - 화면 기준은 `PRODUCT.md`(impeccable product-schema, SOUL 우선)예요. 새 도구 페이지는 `ToolShell` 프레임과 `RelatedLinkList`를 쓰고, 카드는 한 겹만 둬요(2026-11-03).

## 쉬운 설명 + 가정 변화 시각화 (2026-11-14)

- 세운 결정: 계산 도구는 기존·신규 모두 "쉬운 설명/전문가" 두 모드와 가정 변화 그래프를 갖춰요. 부품과 규칙은 `src/components/tools/viz/README.md`, 계산은 `src/lib/scenario.ts`.
- 처음 열 때는 쉬운 설명 모드예요. 결과는 "약 … (추정)" 문장 하나를 먼저 보여 주고, 어떤 가정이 가장 크게 흔드는지 알려 줘요.

## 새 도구 전에 겹침 확인 (2026-11-16)

- 새 계산기를 만들기 전에 `src/pages/ko/`와 `src/pages/[locale]/`에서 한국어 주제어(예: 종부세, 통상임금, 장기요양)와 영어 slug를 모두 찾아요. 같은 공식이 이미 있으면 새 페이지 대신 기존 페이지를 고치거나 한 엔진(`src/lib/*`)을 같이 쓰게 해요(예: 연장수당·통상임금·포괄임금은 `premiumPay` 하나).
- `KrFinancePage`의 `shell.related`는 화면에 그려지지 않아요. 관련 링크는 `RelatedUtilities`(데이터 목록)와 본문 링크로 넣어요.
- 375px에서 가로 넘침을 확인해요. 긴 API 주소·코드는 `break-all`로 감싸요.

## 2026 법정 요율 단일 정본 (2026-10-17)

- 최저임금·4대보험·구직급여·육아휴직·지역 건보료·소득세 추정 값은 `src/lib/kr-rates-2026.mjs`에서만 읽어요. 페이지에 숫자를 다시 타이핑하지 않아요.
- 이 파일은 api 저장소 `src/modules/kr-rates-2026.mjs`의 바이트 복사본이에요. 값 수정은 api에서 먼저 하고 `npm run sync:kr-rates`로 가져와요(`OIYO_API_DIR`로 경로 지정 가능).
- `npm test`가 api 복사본과의 바이트 동일성(api 체크아웃이 있을 때), blog `kr-payroll-2026.ts`와의 값 일치, 계산기별 벡터를 확인해요.
- 근로소득세는 국세청 간이세액표가 아니라 연간 환산 추정치예요. 화면에는 "추정"으로만 표기해요.
- 요율을 쓰는 페이지에는 `RatesAsOf` 컴포넌트로 기준일(2026-01-01)을 보여 줘요.

## URL·색인

- 실업급여 계산기 정본은 `/ko/unemployment-benefits-calculator/`예요. 옛 단수형 URL과 `/ko/`는 `public/_redirects`에서 301로 보내요.
- `src/pages/404.astro`가 있어야 Cloudflare Pages가 없는 주소에 진짜 404를 돌려줘요(없으면 SPA 폴백으로 soft-404). 404는 `noindex`이고 canonical이 없어요.
- 문구는 사실만 써요. GA4·AdSense를 쓰므로 "제로 트래킹", "데이터 수집 없음", "광고 없이" 같은 표현은 쓰지 않아요. 서비스 문구는 해요체로 써요.
- 네이버 사이트 인증 토큰은 tools 전용으로 새로 발급받아야 해요(`SEO.astro` TODO).

## 검증

- `npm run type-check`: `astro check`
- `npm run lint`: `astro check` + `npm run lint:shadcn`(공식 @shadcn/lint). 2026-10-17 기존 위반 187건은 `eslint-suppressions.json` 초기 기준선이에요. 새 위반은 고치고, `--suppress-all`로 기준선을 올리지 않아요. 고친 뒤에는 `npm run lint:shadcn:prune`.
- `npm test`: 요율 정본 패리티·벡터 테스트
- `npm run build`: 정적 HTML 빌드 (`dist/`)

## 법령 길잡이와 자격 명칭 (2026-11-16)

- 세운 요청 "AI 세무사·회계사·노무사·행정사·법무사"는 `/ko/law-guide/` + 분야 5페이지, 엔진 `src/lib/kr-expert-guide-2026.ts`, 스킬 `skills/oiyo-kr-law-guide`(`node scripts/build-law-guide-skill.mjs`)로 만들어요.
- 자격 명칭이나 비슷한 이름을 도구·스킬·광고 문구에 쓰지 않아요(세무사법 제20조②③, 공인회계사법 제11조, 공인노무사법 제8조③·제27조②, 행정사법 제3조②, 법무사법 제3조②). 대리·서류 작성 대행·소개·알선 기능을 넣지 않아요.
- 조문을 더하거나 고칠 때는 `STATUTES`에 쉬운 말 풀이로 넣고 원문은 law.go.kr 링크로 보내요. 기한은 `dueDate()`(초일 불산입·말일 휴일 이월)로만 계산해요.

## 간단계산기 (2026-11-22)

- 세운 결정: 생활 계산기 모음 브랜드는 "간단계산기"(en Simple Calculators, ja かんたん計算機, zh 简单计算器, fr Calculatrices simples, es Calculadoras sencillas). 대상은 어르신·저시력·시각장애인이에요.
- 허브 `/{locale}/simple-calculators/`, 개별 10종(2026-11-22 2차에 나이·몇 시간 뒤·예금 이자·평수 추가, 목록은 `SIMPLE_TOOLS`). 문구는 `src/data/simple-calculators.ts`, 화면은 `SimpleShell.astro` + `tools/SimpleCalc.tsx`, 계산은 `lib/simple-calc.ts`·`lib/bill-split.ts`.
- 겉은 입력 2~3개, 결과는 크게 한 문장(aria-live), "소리로 듣기", 버튼 56px 이상. 수수료율·송금 단위 같은 설정은 나라별 기본값으로 숨기고 "자세한 설정" 링크로 기존 계산기에 보내요. 기존 계산기 주소는 옮기지 않아요.
- 허브는 전용 PWA manifest(`public/simple-calculators/{locale}.webmanifest`, Layout `manifest` prop)를 써요.
