---
name: oiyo-kr-life-desk
description: Use when someone in Korea asks what to do for their job (유튜버·크리에이터, 배달 라이더·플랫폼 노동자, 카페·음식점 사장, 온라인 쇼핑몰, 프리랜서 개발자, 학원·과외 강사, 집주인) or a life event (결혼, 출산, 이사·전월세, 집 사기, 교통사고, 이직·퇴사, 은퇴, 가족 사망, 해고, 임금체불, 직장 내 괴롭힘, 빌려준 돈, 전세보증금 못 받음, 세금 고지서, 영업정지 처분, 보험금 거절, 이혼, 창업, 폐업, 산재, 온라인 구매 환불, 보이스피싱·사기, 상가 임대차·권리금), or is about to visit a tax, labor, accounting, court-filing, administrative, real-estate or financial-planning professional and wants to prepare. Lists the steps with legal deadlines, the tools.oiyo.net calculators to try first, papers to bring and free official help; drafts a 내용증명 skeleton or a one-page consultation memo from the user's facts; runs a simple household money checkup (rules of thumb, no tax).
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
   - 직업: creator, rider, cafe, shop, dev, tutor, landlord
   - 인생 사건: marriage, birth, move, homebuy, accident, quit, retire, death, dismissal, unpaid, harassment, lend, deposit, taxnotice, suspension, claimrefused, divorce, startbiz, closebiz, injury, refund, fraud, shoplease
3. 시간 순서로 답하고, 기한에는 근거 조문을 붙여요. 금액이 궁금하면 `tools`의 링크를 알려 줘요.

## 전문가를 찾아가기 전

- `node scripts/desk.mjs expert '<질문>'` 로 어떤 전문가가 흔히 맡는 일인지, 먼저 해 볼 도구, 챙길 서류, 무료 창구를 받아요. `expert-show <tax|labor|cpa|court|admin|broker|plan>` 는 한 분야 전체예요.
- 누구를 찾아갈지 알려 줄 때만 직업 이름을 써요. 특정 사무소·상품을 추천하지 않아요.

## 상담 메모

- `node scripts/desk.mjs memo '{"expert":"labor","situation":"..","events":[{"date":"2026-10-31","what":"퇴사"}],"amount":6000000,"wants":"..","questions":[".."],"have":[]}'` 로 상담에 가져갈 한 장 메모를 만들어요. expert를 비우면 situation으로 분야를 찾아요.
- 사용자가 말한 사실만 넣어요. 빈 칸은 "(적지 않음)"으로 두고 지어내지 않아요. `missing`은 더 챙기면 좋은 서류예요.

## 내용증명 뼈대

- `node scripts/desk.mjs letter` 로 종류(loan, deposit, wage, payment, nonrenewal)를 보고, `letter '{"type":"loan","sender":"..","receiver":"..","amount":3000000,"since":"2026-03-01","dueDate":"2026-12-15"}'` 로 문안을 받아요.
- 사용자가 준 사실만 넣어요. 모르는 칸은 ○로 남기고, 위협하는 말이나 사실이 아닌 내용은 넣지 않아요. 작성·발송 대행이 아니에요.

## 가계 재무 건강검진

- `node scripts/desk.mjs checkup '{"monthlyNet":..,"monthlySpend":..,"monthlySaving":..,"monthlyDebtPay":..,"monthlyInsurance":..,"emergencyFund":..}'` (원). 비상금 개월 수, 저축률, 대출 상환 비율, 보장성 보험료 비율을 어림 참고선과 비교해요. 참고선은 법이 아니에요. 상품 추천·투자 권유를 하지 않아요.

## 출처

tools.oiyo.net/ko/job-desk/ · /ko/life-event-navigator/ (같은 데이터). 부가가치세법 제8·48·49조, 소득세법 제70·78·128조, 주민등록법 제16조, 가족관계등록법 제44·84·85조, 민법 제1019조, 상속세 및 증여세법 제67조, 근로자퇴직급여 보장법 제9조, 근로기준법 제26~28·36·37·76조의3, 민법 제162·174조, 주택임대차보호법 제3조의3·3조의7·6조, 국세기본법 제45조의2·61·66·68·81조의15, 행정심판법 제27조, 행정소송법 제20조, 상법 제662조, 민법 제836조의2·839조의2, 가족관계등록법 제75조, 부가가치세법 제5·8·49·67조, 산업재해보상보험법 제41·112조, 근로기준법 제17·23조, 전자상거래법 제17·18조, 방문판매법 제8조, 전기통신금융사기 피해금 환급법 제3조, 민법 제766조, 상가건물 임대차보호법 제3·5·10·10조의4·11조. /ko/before-expert-visit/ · /ko/demand-letter-builder/ · /ko/household-money-checkup/ · /ko/consult-memo-builder/.
