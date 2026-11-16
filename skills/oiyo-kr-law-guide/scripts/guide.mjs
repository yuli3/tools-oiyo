#!/usr/bin/env node
// OIYO 법령 길잡이 CLI. tools.oiyo.net/ko/law-guide/ 와 같은 자료·기한 계산(kr-expert-guide-2026.mjs는 생성 파일, 고치지 않아요).
// Usage:
//   node scripts/guide.mjs suggest "회사에서 문자로 해고됐어요"
//   node scripts/guide.mjs topics [tax|accounting|labor|admin|court]
//   node scripts/guide.mjs intake <topicId> '<answers json>' [YYYY-MM-DD]
//   node scripts/guide.mjs statutes "<키워드>" [domain]
//   node scripts/guide.mjs scope <domain>
import { LAW_GUIDE_AS_OF, PROFESSIONS, SCOPE_MATRIX, TOPICS, findStatutes, intake, statuteUrl, suggestTopics } from "./kr-expert-guide-2026.mjs";

const [cmd, a1, a2, a3] = process.argv.slice(2);
const print = (x) => console.log(JSON.stringify(x, null, 2));
const today = () => new Date().toISOString().slice(0, 10);

switch (cmd) {
  case "suggest":
    print({ asOf: LAW_GUIDE_AS_OF, topics: suggestTopics(a1 ?? "", a2) });
    break;
  case "topics":
    print(TOPICS.filter((t) => !a1 || t.domain === a1).map((t) => ({ id: t.id, domain: t.domain, label: t.label })));
    break;
  case "intake":
    print(intake(a1, a2 ? JSON.parse(a2) : {}, a3 ?? today(), 3));
    break;
  case "statutes":
    print(findStatutes(a1 ?? "", a2).map((s) => ({ ...s, url: statuteUrl(s) })));
    break;
  case "scope":
    print({ profession: PROFESSIONS[a1], matrix: SCOPE_MATRIX });
    break;
  default:
    console.log(`기준일 ${LAW_GUIDE_AS_OF}\ncommands: suggest, topics, intake, statutes, scope\n예: node scripts/guide.mjs intake labor-dismissal '{"size":"5plus","dismissDate":"2026-10-30"}'`);
    process.exit(cmd ? 1 : 0);
}
