# 쉬운 설명 + 가정 변화 시각화 부품 (2026-11-14)

세운 결정(2026-11-14): 기존 도구와 앞으로 만들 도구 모두 이 방향을 따라요.
법을 모르는 사람은 질문에 답하고 결과 문장을 읽고, 전문가는 숫자를 직접 넣어요.
가정을 바꾸면 결과와 그래프가 같이 움직여요. 첫 적용: `advisory/UnlistedShareValuation.tsx`.

## 계산 (순수 함수, `src/lib/scenario.ts`)

| 함수 | 하는 일 |
| --- | --- |
| `Assumption<I>` | 가정 하나: `key, label(전문가), plain(쉬운 말), unit, kind("fact"/"assumption"), get, set, range(anchor), marks?` |
| `sweep(input, a, evaluate, [min,max], steps)` | 가정 하나를 훑은 결과 곡선. 지금 값과 marks를 정확히 포함 |
| `tornado(input, assumptions, evaluate, 0.2)` | ±20% 영향 폭, 큰 순서. fact와 0인 값은 빼요 |
| `bridgeLayout(steps)` | 다리(워터폴) 막대 위치 |
| `parseKoreanAmount("6억 3천만")`, `roughWon(n)` | 한국어 금액 읽기·쉬운 표기 |

도구별 가정 목록과 결과 문장은 `src/lib/<도메인>-scenarios.ts`에 두고 테스트해요(예: `kr-advisory-scenarios.ts`).
"사실"(기간·업종처럼 바꿀 수 없는 값)은 `kind: "fact"`로 둬서 토네이도에 넣지 않아요.

## 화면 부품 (이 폴더)

| 부품 | props |
| --- | --- |
| `ModeToggle` + `useAdvisoryMode(toolId)` | `mode: "easy" \| "expert"`, `onChange`. 처음엔 easy, 고른 모드는 localStorage에 기억 |
| `AssumptionSlider` | `label, unit, value, range, onChange, mode, tag?("example"/"guess")` |
| `SweepChart` | `title, caption?, points, current, marks?, formatX, formatY, onPick?, xLabel, yLabel` |
| `TornadoChart` | `bars, mode, format, delta?, limit?` |
| `BridgeChart` | `title, caption?, steps, format` |
| `CompareBars` | `title, caption?, items[{label,value,current?}], format` |
| `MoneyField` | `label, value, onChange, allowNegative?, hint?` ("6억 3천만" 입력 가능) |
| `Term` | `k`(용어 키, `src/data/advisory-glossary.ts`), children. 누르면 아래에 한 줄 풀이 |
| `ChartFrame`, `BarTrack` | 새 그래프를 만들 때 쓰는 틀(제목·표로 보기)과 가로 막대 |

규칙: 차트 라이브러리 없이 SVG·HTML로 그려요. 색은 테마 토큰(`fill-primary` 등)만, 인라인 스타일·임의 값 금지(shadcn lint).
그래프마다 "표로 보기"를 두고, 375px에서 가로 스크롤이 없어야 해요. GA4에는 `track()`으로 모드·슬라이더 사용 여부만 보내요(값은 보내지 않아요).
새 범용 그래프(2×2 사분면, 간트 등)는 이 폴더에 새 파일로 더하고 이 표에 한 줄 추가해요.
