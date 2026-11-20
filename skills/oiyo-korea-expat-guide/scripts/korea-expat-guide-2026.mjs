// GENERATED from tools-oiyo src/lib/korea-expat-guide-2026.ts by scripts/build-advisor-skill.mjs. Do not edit here.
// Korea guide for foreign residents (2026-11-20, next-10 #7). English web page /en/korea-foreign-resident-guide/ and the
// English skill oiyo-korea-expat-guide (scripts/expat.mjs) use this same code.
// Sources (checked 2026-11-20, Korean statutes on law.go.kr):
// - Immigration Act 제31조 (register within 90 days of entry), 제35조 (report changes within 15 days),
//   제36조 (report a new address within 15 days), 제25조 (extend before expiry), 제88조의2② (registration and address reports
//   count as resident registration and move-in report, so a foreign tenant gets lease protection).
// - Labor Standards Act 제36조 (all pay within 14 days of leaving), 제49조 (wage claims 3 years), Minimum Wage Notice 2026 (KRW 10,320/h),
//   Employee Retirement Benefit Security Act 제8조 (severance after 1 year, 15+ h/week).
// - Industrial Accident Compensation Insurance Act 제112조 (claims 3 years); covers foreign workers regardless of visa status.
// - National Health Insurance Act 제109조 (foreigners staying 6+ months join automatically if not covered at work).
// - National Pension Act 제126조 and 제77조 (lump-sum refund for foreigners depends on the home country's agreement).
// - Restriction of Special Taxation Act 제18조의2 (19% flat rate option for eligible foreign workers).
// Deadlines: the first day is not counted and a last day on a weekend or public holiday moves to the next day (Civil Act 제157조·제161조).
// Information only. No visa application, filing or representation.
import { holidaysKnown, isKrNonBusinessDay } from "./kr-business-day.mjs";

export const EXPAT_AS_OF = "2026-11-20";

                            
               
              
 

                             
             
                
                  
                  
                 
                    
 

const H = {
  immigration: { name: "Immigration Contact Center", how: "call 1345 (many languages) · hikorea.go.kr" },
  moel: { name: "Ministry of Employment and Labor", how: "call 1350 (interpreters available) · moel.go.kr" },
  foreignWorker: { name: "Foreign Workforce Counseling Center", how: "call 1577-0071 (many languages)" },
  comwel: { name: "Korea Workers' Compensation & Welfare Service", how: "call 1588-0075 · comwel.or.kr" },
  nhis: { name: "National Health Insurance Service", how: "call 1577-1000 (foreign language line available) · nhis.or.kr" },
  nps: { name: "National Pension Service", how: "call 1355 · nps.or.kr" },
  nts: { name: "National Tax Service", how: "call 126 (foreign language service) · hometax.go.kr (English menu)" },
  klac: { name: "Korea Legal Aid Corporation", how: "call 132 · free legal advice" },
}                                    ;

export const EXPAT_TOPICS               = [
  {
    id: "register",
    title: "Register as a foreign resident and report a new address",
    summary: "If you stay longer than 90 days, register within 90 days of entry. After that, report a new address within 15 days of moving and other changes (passport, employer or school) within 15 days.",
    steps: [
      "Book a visit on HiKorea, then bring your passport, a photo, the application form, documents for your visa type and proof of address (such as a lease).",
      "When you move, report the new address at the community center (주민센터) or immigration office within 15 days.",
      "This address report also counts as a move-in report, so add a fixed date (확정일자) to your lease to protect your deposit.",
    ],
    cite: ["Immigration Act Art. 31, 35, 36, 88-2"],
    help: [H.immigration],
  },
  {
    id: "extend",
    title: "Extend your stay or change your visa status",
    summary: "Apply before your period of stay ends. Extensions usually open 4 months before expiry. If your activity changes (for example, from study to work), get a status change approved first.",
    steps: [
      "Check the expiry date on your residence card.",
      "Apply online on HiKorea or book a visit, with documents showing why you need to stay (school, job, marriage).",
      "Working without permission for your status can lead to fines or removal, so ask before taking a new job.",
    ],
    cite: ["Immigration Act Art. 18, 20, 24, 25"],
    help: [H.immigration],
  },
  {
    id: "wages",
    title: "Unpaid wages, minimum wage and severance pay",
    summary: "Your employer must pay everything within 14 days after you leave. The 2026 minimum wage is KRW 10,320 an hour for every worker, whatever the visa. After a year of 15+ hours a week, you are owed severance pay. Wage claims expire after 3 years.",
    steps: [
      "Keep your contract, pay slips, bank records and a record of your hours.",
      "File a wage complaint (진정) with the Ministry of Employment and Labor online or at a local labor office; interpreters are available.",
      "If the company cannot pay, ask about the government wage guarantee (대지급금) through the labor office.",
    ],
    cite: ["Labor Standards Act Art. 36, 43, 49", "Minimum Wage Act Art. 6", "Employee Retirement Benefit Security Act Art. 8"],
    help: [H.moel, H.foreignWorker, H.klac],
  },
  {
    id: "injury",
    title: "Injured at work",
    summary: "Workplace accidents and work-related illness are covered by industrial accident insurance for foreign workers too, even if your status has a problem. You can apply yourself without the employer's approval. Claims expire after 3 years.",
    steps: [
      "Get treatment and ask the hospital for a medical certificate stating how long you need care.",
      "Apply to the Korea Workers' Compensation & Welfare Service; the hospital can help with the form.",
      "If treatment needs 4 days or more, the insurance pays medical costs and 70% of average wages while you cannot work.",
    ],
    cite: ["Industrial Accident Compensation Insurance Act Art. 40, 52, 112"],
    help: [H.comwel, H.foreignWorker],
  },
  {
    id: "health",
    title: "Health insurance",
    summary: "If you work for a company with health insurance, you join through work. Otherwise, foreigners who stay 6 months or more join the national health insurance automatically and pay monthly premiums.",
    steps: [
      "Check whether your employer enrolled you (look for the deduction on your pay slip).",
      "If you are self-covered, premiums start automatically after 6 months; unpaid premiums can affect visa extensions.",
      "Students (D-2) and some others have special rules, so ask NHIS if unsure.",
    ],
    cite: ["National Health Insurance Act Art. 109"],
    help: [H.nhis],
  },
  {
    id: "tax",
    title: "Income tax: year-end settlement and tax refunds",
    summary: "Employers withhold tax monthly and settle it in February. Other income is filed in May on Hometax. Some foreign workers can choose a 19% flat rate instead of the normal rates; check whether you qualify before choosing.",
    steps: [
      "Give your employer your deduction documents for the year-end settlement in January.",
      "If you leave Korea, ask your employer to settle tax when you leave, or file yourself.",
      "Compare the flat 19% rate with the normal calculation; the flat rate gives no deductions.",
    ],
    cite: ["Income Tax Act Art. 70, 137", "Restriction of Special Taxation Act Art. 18-2"],
    help: [H.nts],
  },
  {
    id: "pension",
    title: "National Pension refund when you leave",
    summary: "Many foreign workers pay into the National Pension. Whether you can get a lump-sum refund when you leave Korea depends on your country's agreement with Korea, so check before you go.",
    steps: [
      "Ask NPS whether your nationality qualifies for the lump-sum refund (반환일시금).",
      "Apply before leaving or from abroad with your passport, residence card and bank details.",
      "E-9 and H-2 workers also have departure guarantee insurance (출국만기보험) paid by the employer; ask the insurer.",
    ],
    cite: ["National Pension Act Art. 77, 126"],
    help: [H.nps],
  },
];

                             
                                 
                   
                                        
                 
                                                                          
                   
                                                                
                  
                              
                   
                                  
                  
 

                                
             
                
              
                                        
                   
               
                
                    
 

const pad = (n        ) => String(n).padStart(2, "0");
const iso = (d      ) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function parse(s         )              {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? "");
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 ? d : null;
}
function addMonths(d      , n        ) {
  const day = d.getDate();
  const out = new Date(d.getFullYear(), d.getMonth() + n, 1);
  out.setDate(Math.min(day, new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate()));
  return out;
}
function roll(d      ) {
  const out = new Date(d);
  while (isKrNonBusinessDay(out)) out.setDate(out.getDate() + 1);
  return { due: iso(out), shifted: out.getTime() !== d.getTime() };
}

/** Deadlines from the dates you know. today adds days left. */
export function expatDeadlines(input            , today         )                  {
  const out                  = [];
  const days = (id        , label        , from                    , n        , cite        , topic        ) => {
    const d = parse(from);
    if (!d) return;
    const r = roll(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
    out.push({ id, label, ...r, cite, topic });
  };
  const years = (id        , label        , from                    , n        , cite        , topic        ) => {
    const d = parse(from);
    if (!d) return;
    const end = addMonths(d, n * 12);
    out.push({ id, label, ...roll(end), cite, topic });
  };
  days("register", "Register as a foreign resident", input.arrival, 90, "Immigration Act Art. 31", "register");
  const a = parse(input.arrival);
  if (a) out.push({ id: "nhis", label: "Automatic health insurance (if not covered at work)", due: iso(addMonths(a, 6)), shifted: false, cite: "National Health Insurance Act Art. 109", topic: "health" });
  days("move", "Report your new address", input.moved, 15, "Immigration Act Art. 36", "register");
  days("change", "Report changed details (passport, employer, school)", input.changed, 15, "Immigration Act Art. 35", "register");
  const e = parse(input.expiry);
  if (e) {
    out.push({ id: "extend-open", label: "Extension applications usually open", due: iso(addMonths(e, -4)), shifted: false, cite: "HiKorea guidance", topic: "extend" });
    out.push({ id: "extend-last", label: "Last day of stay: apply before this", due: iso(e), shifted: false, cite: "Immigration Act Art. 25", topic: "extend" });
  }
  days("final-pay", "Employer must pay all wages and severance", input.leftJob, 14, "Labor Standards Act Art. 36", "wages");
  years("wage-claim", "Wage claims expire (roughly; each payday counts separately)", input.leftJob, 3, "Labor Standards Act Art. 49", "wages");
  years("injury-claim", "Work injury benefit claims expire", input.injury, 3, "Industrial Accident Compensation Insurance Act Art. 112", "injury");
  const t = parse(today);
  return out
    .map((x) => (t ? { ...x, daysLeft: Math.round((parse(x.due) .getTime() - t.getTime()) / 86_400_000) } : x))
    .sort((p, q) => (p.due < q.due ? -1 : p.due > q.due ? 1 : 0));
}

/** Pick topics from a plain-English question (keyword match). */
export function suggestExpatTopics(question        )               {
  const q = (question ?? "").toLowerCase();
  const KEYS                         = {
    register: /regist|arc|residence card|address|move|moving|lease|deposit|jeonse/,
    extend: /extend|extension|expire|expiry|visa|status change|overstay/,
    wages: /wage|salary|paid|pay\b|minimum|severance|overtime|fired|quit|boss/,
    injury: /injur|accident|hurt|sick|illness/,
    health: /health|insurance|nhis|hospital|premium/,
    tax: /tax|refund|year-end|settlement|hometax|19%/,
    pension: /pension|nps|leaving korea|leave korea|lump/,
  };
  return EXPAT_TOPICS.filter((t) => KEYS[t.id]?.test(q));
}

export const EXPAT_NOTE = "Information only, not legal, tax or immigration advice. We do not file applications or represent you. Check with the official office before you act.";
export { holidaysKnown };
