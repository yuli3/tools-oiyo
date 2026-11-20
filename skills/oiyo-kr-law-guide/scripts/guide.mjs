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
//   node scripts/guide.mjs calc appeal 2026-11-20 [분야 id] [오늘]   (불복·이의·청구 기한 전 분야)
//   node scripts/guide.mjs calc inherit '{"family":{"spouse":true,"children":2,"parents":0,"siblings":0},"estate":300000000,"gifts":{"child1":200000000}}'
//   node scripts/guide.mjs calc auction '{"sale":200000000,"region":"seoul","baseDate":"2023-05-01","tenants":[{"label":"임차인","deposit":150000000,"date":"2024-03-02"}],"claims":[{"label":"근저당","amount":120000000,"date":"2023-05-01","kind":"mortgage"}]}' [오늘]
//   node scripts/guide.mjs calc customs travel '{"totalUsd":1800,"fx":1400,"selfReport":true}'   (travel|direct|rvc|refund)
//   node scripts/guide.mjs calc points '{"events":[{"date":"2026-03-15","violation":"speed40"}]}' [오늘]  |  calc surcharge '{"months":1,"perDay":1000000}'
//   node scripts/guide.mjs calc compensation '{"land":{"officialPrice":3000000,"area":200,"landChange":0.032}}'  |  calc appraisal '<json>'
//   node scripts/guide.mjs calc ip '{"kind":"patent","disclosed":"2026-03-02","filed":"2026-05-15"}' [오늘]
//   node scripts/guide.mjs calc franchise '{"infoGiven":"2026-11-01","signed":"2026-11-10"}'  |  calc apartment '{"households":320,"useApproval":"2024-03-15"}' [오늘]
//   node scripts/guide.mjs calc workforce count '[6,6,4,4,6]'  |  calc workforce schedule '{"shifts":[{"day":"월","start":"09:00","end":"18:00","breakMin":60}]}'
//   node scripts/guide.mjs practice [<길잡이 slug> [<상황 id> '<{"기한id":"YYYY-MM-DD"}>']]
import { readFileSync } from "node:fs";
import { LAW_GUIDE_AS_OF, PROFESSIONS, SCOPE_MATRIX, TOPICS, findStatutes, intake, statuteUrl, suggestTopics } from "./kr-expert-guide-2026.mjs";
import { analyzeEntries, claimPlain, claimResult, csmPlain, csmResult, dutyPlain, dutyResult, finePlain, fineResult, kicsPlain, kicsResult, parseEntries } from "./pro-practice-2026.mjs";
import { GUIDES, guideBySlug, guideDeadlines, recordCheck, recordText } from "./pro-practice-guides-2026.mjs";
import { breachClock, checkPolicy } from "./privacy-check-2026.mjs";
import { checkContract } from "./freelance-contract-check-2026.mjs";
import { appealsFrom, APPEAL_NOTE } from "./kr-appeal-deadlines-2026.mjs";
import { legalHeirs, reserveShortfall, INHERIT_NOTE } from "./kr-inheritance-share-2026.mjs";
import { auctionDistribution, AUCTION_NOTE } from "./kr-auction-distribution-2026.mjs";
import { FH_NOTE, apartmentSchedule, franchiseCheck } from "./kr-franchise-housing-2026.mjs";
import { IP_NOTE, ipDeadlines } from "./kr-ip-deadlines-2026.mjs";
import { APPRAISAL_NOTE, businessLoss, costApproach, incomeApproach, landCompensation, reconcile, relocationAllowance, salesComparison } from "./kr-appraisal-2026.mjs";
import { POINTS_NOTE, VIOLATIONS, licenseStatus, suspensionToSurcharge, violationPoints, accidentPoints } from "./kr-license-points-2026.mjs";
import { WORKFORCE_NOTE, checkSchedule, headcountThresholds } from "./kr-workforce-2026.mjs";
import { CUSTOMS_NOTE, TRAVELER_EXTRA, directBundles, rvc, simpleRefund, travelerTax } from "./kr-customs-pack-2026.mjs";

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
    } else if (a1 === "appeal") {
      // a2: 통지를 받은 날 YYYY-MM-DD, a3: 분야 id(선택, 예: tax, customs, appraisal), a4: 오늘(선택)
      print({ from: a2, deadlines: appealsFrom(a2, a4 ?? new Date().toISOString().slice(0, 10), a3 || undefined), note: APPEAL_NOTE });
    } else if (a1 === "inherit") {
      // a2: {"family":{spouse,children,parents,siblings},"estate","debts","gifts":{heirId:원},"bequests","thirdGifts","thirdBequests","death"}
      const i = JSON.parse(a2 ?? "{}");
      print({ heirs: legalHeirs(i.family ?? {}), reserve: reserveShortfall(i), note: INHERIT_NOTE });
    } else if (a1 === "auction") {
      // a2: {"sale","cost","region":"seoul|overcrowded|metro|other","baseDate","tenants":[{label,deposit,date?}],"claims":[{label,amount,date,kind}],"wagePriority","currentTax","wageOther","general"}
      print({ ...auctionDistribution(JSON.parse(a2 ?? "{}"), a3 ?? today()), note: AUCTION_NOTE });
    } else if (a1 === "customs") {
      // a2: travel|direct|rvc|refund, a3: JSON. travel {"totalUsd","fx","rate"?,"selfReport","caught":"no|once|repeat"}
      // direct {"orders":[{label,priceUsd,shippingUsd,arrival,fromUs}],"fx","dutyRate"}, rvc {"value","nonOriginating","originating","threshold","method":"build-down|build-up"}, refund {"fobKrw","perTenThousand","accepted"}
      const i = JSON.parse(a3 ?? "{}");
      const r = a2 === "travel" ? { ...travelerTax(i), extra: TRAVELER_EXTRA } : a2 === "direct" ? { bundles: directBundles(i.orders ?? [], i.fx, i.dutyRate) } : a2 === "rvc" ? rvc(i) : a2 === "refund" ? simpleRefund(i) : null;
      if (!r) { console.error("calc customs: travel, direct, rvc, refund"); process.exit(1); }
      print({ ...r, note: CUSTOMS_NOTE });
    } else if (a1 === "workforce") {
      // a2: count|schedule, a3: count → [6,6,4,...] (가동일별 인원), schedule → {"shifts":[{day,start,end,breakMin,holiday?}],"small":false,"minor":false}
      const i = JSON.parse(a3 ?? "null");
      if (a2 === "count") print({ thresholds: headcountThresholds(i ?? []), note: WORKFORCE_NOTE });
      else if (a2 === "schedule") print({ ...checkSchedule(i ?? { shifts: [] }), note: WORKFORCE_NOTE });
      else { console.error("calc workforce: count, schedule"); process.exit(1); }
    } else if (a1 === "points") {
      // a2: {"events":[{"date","points"} 또는 {"date","violation":"speed40","schoolZone":true} 또는 {"date","accident":{"serious":1,"minor":0,"bothFault":false}}],"education":false,"mileage":0}, a3: 오늘(선택)
      const i = JSON.parse(a2 ?? "{}");
      const events = (i.events ?? []).map((e) => ({ date: e.date, points: e.points ?? (e.violation ? violationPoints(e.violation, e.schoolZone) : accidentPoints(e.accident ?? {})) }));
      print({ events, status: licenseStatus(events, a3 ?? today(), { education: i.education, mileage: i.mileage }), violations: VIOLATIONS, note: POINTS_NOTE });
    } else if (a1 === "surcharge") {
      // a2: {"months":1,"days":0,"perDay":1000000,"cap":1000000000}
      print({ ...suspensionToSurcharge(JSON.parse(a2 ?? "{}")), note: POINTS_NOTE });
    } else if (a1 === "appraisal") {
      // a2: {"cost":{replacementCost,usefulLife,age,residualRate,land},"sales":{"area":100,"comps":[{price,area,situation,time,regional,individual,weight}]},"income":{grossIncome,vacancy,expenses,capRate},"weights":{"cost":1,"sales":2,"income":1}}
      const i = JSON.parse(a2 ?? "{}");
      const c = i.cost ? costApproach(i.cost) : null, s = i.sales ? salesComparison(i.sales.area, i.sales.comps ?? []) : null, n = i.income ? incomeApproach(i.income) : null;
      const w = i.weights ?? {};
      print({ cost: c, sales: s, income: n, reconciled: reconcile([{ label: "원가", value: c?.value ?? 0, weight: w.cost ?? 1 }, { label: "비교", value: s?.value ?? 0, weight: w.sales ?? 1 }, { label: "수익", value: n?.value ?? 0, weight: w.income ?? 1 }]), note: APPRAISAL_NOTE });
    } else if (a1 === "compensation") {
      // a2: {"land":{officialPrice,area,landChange,regional,individual,other},"business":{annualProfit,kind:"pause|close",months,fixedCosts,moving,saleLoss},"relocation":{monthlySpending,tenant}}
      const i = JSON.parse(a2 ?? "{}");
      const land = i.land ? landCompensation(i.land) : null, biz = i.business ? businessLoss(i.business) : null, home = i.relocation ? relocationAllowance(i.relocation.monthlySpending, i.relocation.tenant) : null;
      print({ land, business: biz, relocation: home, total: (land?.value ?? 0) + (biz?.total ?? 0) + (home?.amount ?? 0), note: APPRAISAL_NOTE });
    } else if (a1 === "ip") {
      // a2: {"kind":"patent|utility|design|trademark","disclosed","filed","priority","noticeServed","noticeMonths","rejectionServed","decisionServed","registered"}, a3: 오늘(선택)
      print({ deadlines: ipDeadlines(JSON.parse(a2 ?? "{}"), a3 ?? today()), note: IP_NOTE });
    } else if (a1 === "franchise") {
      // a2: {"infoGiven","contractGiven","signed","advised":false,"firstStart","currentEnd","bigHq":true}
      print({ items: franchiseCheck(JSON.parse(a2 ?? "{}")), note: FH_NOTE });
    } else if (a1 === "apartment") {
      // a2: {"households":320,"elevator":true,"centralHeating":false,"mixedUse":false,"useApproval","handover"}, a3: 오늘(선택)
      print({ ...apartmentSchedule(JSON.parse(a2 ?? "{}"), a3 ?? today()), note: FH_NOTE });
    } else if (a1 === "record") {
      const i = JSON.parse(a2 ?? "{}");
      print({ check: recordCheck(i), text: recordText(i) });
    } else if (CALC[a1]) {
      const i = JSON.parse(a2 ?? "{}");
      print({ result: CALC[a1][0](i), plain: CALC[a1][1](i) });
    } else {
      console.error(`calc: ${Object.keys(CALC).join(", ")}, entries, record, breach, policy, contract, appeal, inherit, auction, customs, workforce, points, surcharge, appraisal, compensation, ip, franchise, apartment`);
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
