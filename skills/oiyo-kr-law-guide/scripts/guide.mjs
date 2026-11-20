#!/usr/bin/env node
// OIYO 법령 길잡이 CLI. tools.oiyo.net/ko/law-guide/ 와 같은 자료·기한 계산(kr-expert-guide-2026.mjs는 생성 파일, 고치지 않아요).
// Usage:
//   node scripts/guide.mjs suggest "회사에서 문자로 해고됐어요"
//   node scripts/guide.mjs topics [tax|accounting|labor|admin|court]
//   node scripts/guide.mjs intake <topicId> '<answers json>' [YYYY-MM-DD]
//   node scripts/guide.mjs statutes "<키워드>" [domain]
//   node scripts/guide.mjs scope <domain>
//   node scripts/guide.mjs calc <fine|duty|csm|kics|claim|record> '<input json>'
//   node scripts/guide.mjs calc entries <csv 파일> [결재 한도]
//   node scripts/guide.mjs calc breach '{"knownAt":"2026-11-20T09:00","affected":1200,"sensitive":false,"hacking":false}'
//   node scripts/guide.mjs calc policy <처리방침.txt> '{"website":true,"outsource":true}'
//   node scripts/guide.mjs calc contract <계약서.txt> '{"creative":true,"registered":false}' [계약 금액]
//   node scripts/guide.mjs practice [<길잡이 slug> [<상황 id> '<{"기한id":"YYYY-MM-DD"}>']]
import { readFileSync } from "node:fs";
import { LAW_GUIDE_AS_OF, PROFESSIONS, SCOPE_MATRIX, TOPICS, findStatutes, intake, statuteUrl, suggestTopics } from "./kr-expert-guide-2026.mjs";
import { analyzeEntries, claimPlain, claimResult, csmPlain, csmResult, dutyPlain, dutyResult, finePlain, fineResult, kicsPlain, kicsResult, parseEntries } from "./pro-practice-2026.mjs";
import { GUIDES, guideBySlug, guideDeadlines, recordCheck, recordText } from "./pro-practice-guides-2026.mjs";
import { breachClock, checkPolicy } from "./privacy-check-2026.mjs";
import { checkContract } from "./freelance-contract-check-2026.mjs";

const CALC = {
  fine: [fineResult, finePlain],
  duty: [dutyResult, dutyPlain],
  csm: [csmResult, csmPlain],
  kics: [kicsResult, kicsPlain],
  claim: [claimResult, claimPlain],
};

const [cmd, a1, a2, a3, a4] = process.argv.slice(2);
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
  case "calc": {
    if (a1 === "entries") {
      const { rows, skipped } = parseEntries(readFileSync(a2, "utf8"));
      const r = analyzeEntries(rows, { approvalLimit: Number(a3 ?? 0) });
      print({ ...r, skipped, flagged: r.flagged.slice(0, 50) });
    } else if (a1 === "breach") {
      print(breachClock(JSON.parse(a2 ?? "{}")));
    } else if (a1 === "policy") {
      // a2: 처리방침 텍스트 파일, a3: 상황 JSON {"website":true,"outsource":true,"thirdParty":false,"overseas":false}
      print(checkPolicy(readFileSync(a2, "utf8"), a3 ? JSON.parse(a3) : {}));
    } else if (a1 === "contract") {
      // a2: 계약서 텍스트 파일, a3: 상황 JSON {"creative":true,"registered":false}, a4: 계약 금액(원)
      print(checkContract(readFileSync(a2, "utf8"), a3 ? JSON.parse(a3) : {}, a4 ? Number(a4) : undefined));
    } else if (a1 === "record") {
      const i = JSON.parse(a2 ?? "{}");
      print({ check: recordCheck(i), text: recordText(i) });
    } else if (CALC[a1]) {
      const i = JSON.parse(a2 ?? "{}");
      print({ result: CALC[a1][0](i), plain: CALC[a1][1](i) });
    } else {
      console.error(`calc: ${Object.keys(CALC).join(", ")}, entries, record, breach, policy, contract`);
      process.exit(1);
    }
    break;
  }
  case "practice": {
    if (!a1) print(GUIDES.map((g) => ({ slug: g.slug, title: g.title, cases: g.cases.map((c) => `${c.id} ${c.label}`) })));
    else {
      const g = guideBySlug(a1);
      const c = g?.cases.find((x) => x.id === a2);
      if (!g) { console.error("practice: 길잡이 slug를 확인하세요"); process.exit(1); }
      print(c ? { ...c, deadlines: guideDeadlines(c, a3 ? JSON.parse(a3) : {}) } : g);
    }
    break;
  }
  default:
    console.log(`기준일 ${LAW_GUIDE_AS_OF}\ncommands: suggest, topics, intake, statutes, scope, calc, practice\n예: node scripts/guide.mjs intake labor-dismissal '{"size":"5plus","dismissDate":"2026-10-30"}'`);
    process.exit(cmd ? 1 : 0);
}
