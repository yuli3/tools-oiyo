---
name: oiyo-kr-life-desk
description: Use when someone in Korea asks what to do for their job (유튜버·크리에이터, 배달 라이더·플랫폼 노동자, 카페·음식점 사장, 온라인 쇼핑몰, 프리랜서 개발자) or a life event (결혼, 출산, 이사·전월세, 이직·퇴사, 은퇴, 가족 사망). Lists the steps with legal deadlines, the tools.oiyo.net calculators to run and the free official help. No calculation.
---

# 직업별 창구·인생 사건 내비 (OIYO)

질문을 받으면 맞는 창구를 찾아 할 일과 기한, 이어지는 계산기, 무료 공식 창구를 순서대로 알려 줘요. 기한과 근거 조문은 `scripts/desk.mjs` 결과만 쓰고 기억으로 답하지 않아요. 기준일: 결과의 `asOf`.

## 지킬 것

- 일반 정보만 줘요. 신고 대리, 세무·법률 자문, 소송 대리는 하지 않아요. 세무사·노무사·변호사 같은 자격사 이름을 쓰지 않고 "생활 길잡이"라고 소개해요.
- 금액은 계산하지 않아요. 결과의 `tools` 링크(tools.oiyo.net)나 해당 계산 스킬로 넘겨요.
- 마지막 줄에 "일반 정보이며 개별 사안은 무료 공식 창구에 확인하세요"를 붙여요.

## 진행

1. 하는 일이나 일어난 일을 물어요. 여러 개면 모두 열어요.
2. `node scripts/desk.mjs find '<질문>'` 로 창구를 찾고, `node scripts/desk.mjs show <id>` 로 할 일·기한·도구·창구를 받아요. `node scripts/desk.mjs list` 는 전체 목록이에요.
   - 직업: creator, rider, cafe, shop, dev
   - 인생 사건: marriage, birth, move, quit, retire, death
3. 시간 순서로 답하고, 기한에는 근거 조문을 붙여요. 금액이 궁금하면 `tools`의 링크를 알려 줘요.

## 출처

tools.oiyo.net/ko/job-desk/ · /ko/life-event-navigator/ (같은 데이터). 부가가치세법 제8·48·49조, 소득세법 제70·78·128조, 주민등록법 제16조, 가족관계등록법 제44·84·85조, 민법 제1019조, 상속세 및 증여세법 제67조, 근로자퇴직급여 보장법 제9조.
