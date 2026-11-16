# 쉬운 설명 + 가정 변화 시각화 부품 (2026-11-14)

세운 결정(2026-11-14): 기존 도구와 앞으로 만들 도구 모두 이 방향을 따라요.
법을 모르는 사람은 질문에 답하고 결과 문장을 읽고, 전문가는 숫자를 직접 넣어요.
가정을 바꾸면 결과와 그래프가 같이 움직여요. 적용 예: `advisory/` 4종(가업상속·법인전환·DCF는 공용 틀 `useScenario`·`QuestionStepper`·`SweepPanel`을 씀).

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
| `useScenario(toolId, example, assumptions, keys)` (2026-11-16) | 입력값·예시/가정 표시·슬라이더 기준점. `edit(patch, keys, tag?)`, `slide(key, v)`, `keepAsGuess(keys)`, `hasExample`, `hasGuess` |
| `QuestionStepper` (2026-11-16) | `questions[{title, keys, body}], onUnknown, resultRef?`. 쉬운 모드 질문 카드 |
| `PlainSummary`, `ReasonList`, `AskAdviser` (2026-11-16) | 결과 문장·예시 경고 / 이유 목록 / "세무사에게 확인할 것" |
| `AssumptionPanel` (2026-11-16) | `assumptions, input, anchors, tags, mode, onSlide`. 가정 카드 묶음 |
| `SweepPanel` (2026-11-16) | `options, input, anchors, evaluate, mode, resultName, formatY, onSlide, caption?`. 칩으로 고르는 훑기 곡선 |
| `HeatmapChart` (2026-11-16) | `title, caption?, rows, cols(5개), cell, rowLabel, colLabel, formatRow, formatCol, formatCell, current?`. 두 가정 열지도 |
| `ChartFrame`, `BarTrack` | 새 그래프를 만들 때 쓰는 틀(제목·표로 보기)과 가로 막대 |
| `QuadrantChart` (2026-11-14) | `title, caption?, points[{label,x,y,size?,tone?}], xDomain, yDomain, xSplit, ySplit, logX?, reverseX?, xLabel, yLabel, quadrants[4], ring?, formatX, formatY`. BCG·포지셔닝·SWOT처럼 2×2 판. 이름표가 겹치면 비켜서 선으로 이어요 |
| `GanttChart` (2026-11-14) | `rows[{id,name,start,end,slack,critical,milestone,progress?}], total, formatDay, deadline?, highlight?`. 일정 막대와 여유(점선), 핵심 경로 강조 |
| `TreeDiagram` (2026-11-14) | `title, caption?, root`(biz-strategy `EvaluatedNode`), `format`. 의사결정 트리, 고른 가지 강조. 좁은 화면에선 이름을 줄이고 비용을 숨겨요 |

규칙: 차트 라이브러리 없이 SVG·HTML로 그려요. 색은 테마 토큰(`fill-primary` 등)만, 인라인 스타일·임의 값 금지(shadcn lint).
그래프마다 "표로 보기"를 두고, 375px에서 가로 스크롤이 없어야 해요. GA4에는 `track()`으로 모드·슬라이더 사용 여부만 보내요(값은 보내지 않아요).
새 범용 그래프(2×2 사분면, 간트 등)는 이 폴더에 새 파일로 더하고 이 표에 한 줄 추가해요.
| 단위 `months`·`days` (2026-11-16) | `Assumption.unit`에 개월·일수를 더했어요(대지급금 체불 개월, 산재 휴업 일수). 생활 지원금 도구는 `../welfare/common.tsx`의 `ScenarioBlock`으로 슬라이더·훑기·토네이도를 한 번에 그려요 |
| 단위 `hours`·`count` (2026-11-16) | 연장근로 시간, 주택 수(채)를 위해 더했어요 |
| `DeadlineChart` (2026-11-16) | `title, caption?, rows[{id,label,due,daysLeft,cite,note?}], delay?, cap?`. 기한까지 남은 날 막대, "며칠 뒤에 움직이면?" 표시를 넘는 기한은 놓친 것으로 칠해요(법령 길잡이) |
