import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { parseXml, readNtsXml, toYearEndFill, findYesoneXml, withZeros, YE_FILL_KEYS } from "./nts-simplified-xml-2026.ts";
import { extractYesoneFromPdf } from "./nts-pdf-extract-2026.ts";

// 정의서 v1.79 구조대로 만든 시험용 XML(가짜 이름·번호).
const SELF = "9001011000000";
const KID = "1501013000000";
const XML = `<?xml version="1.0" encoding="utf-8" ?>
<yesone>
<doc><doc_type>A</doc_type><seq>2027011500000001</seq><att_year>2026</att_year><att_inqrMm>1월,2월</att_inqrMm><resid>${SELF}</resid><name>홍길동</name>
<form form_cd="A102Y"><man resid="${SELF}" name="홍길동"><data dat_cd="G0001" busnid="1" trade_nm="보험" acc_no="x"><goods_nm>보장</goods_nm><sum>1,200,000</sum></data></man></form>
<form form_cd="A102M"><man resid="${SELF}" name="홍길동"><data dat_cd="G0001" busnid="1" trade_nm="보험" acc_no="x"><sum>1200000</sum><amt mm="01" fix_cd="C">100000</amt></data><data dat_cd="G0002"><sum>300000</sum></data></man></form>
<form form_cd="B101Y"><man resid="${SELF}" name="홍길동"><data dat_cd="G0003"><sum>500000</sum></data></man><man resid="${KID}" name="홍아기"><data dat_cd="G0003"><sum>800000</sum></data></man></form>
<form form_cd="B201Y"><man resid="${KID}" name="홍아기"><data dat_cd="G0040"><sum>300000</sum></data></man></form>
<form form_cd="C102Y"><man resid="${KID}" name="홍아기"><data dat_cd="G0004" edu_tp="2" edu_cl="A"><sum>400000</sum></data></man></form>
<form form_cd="E103Y"><man resid="${SELF}" name="홍길동"><data dat_cd="G0010"><ann_tot_amt>3000000</ann_tot_amt><ddct_bs_ass_amt>2800000</ddct_bs_ass_amt><isa_ddct_bs_ass_amt>0</isa_ddct_bs_ass_amt><sum>2800000</sum></data></man></form>
<form form_cd="G113Y"><man resid="${SELF}" name="홍길동"><data dat_cd="G0012" use_place_cd="1"><sum>10000000</sum></data><data dat_cd="G0012" use_place_cd="2"><sum>200000</sum></data><data dat_cd="G0012" use_place_cd="3"><sum>300000</sum></data></man></form>
<form form_cd="G213M"><man resid="${SELF}" name="홍길동"><data dat_cd="G0013" use_place_cd="1"><sum>700000</sum><amt mm="01">700000</amt></data><data dat_cd="G0013" use_place_cd="8"><sum>600000</sum></data></man></form>
<form form_cd="L102Y"><man resid="${SELF}" name="홍길동"><data dat_cd="G0020" donation_cd="43"><sum>100000</sum></data><data dat_cd="G0020" donation_cd="41"><sum>50000</sum></data><data dat_cd="G0020" donation_cd="42"><sum>70000</sum></data></man></form>
<form form_cd="O101M"><man resid="${SELF}" name="홍길동"><data dat_cd="G0030"><sum hi_yrs="1" ltrm_yrs="1" hi_ntf="0" ltrm_ntf="0" hi_pmt="1800000" ltrm_pmt="230000">0</sum></data></man></form>
<form form_cd="T101M"><man resid="${SELF}" name="홍길동"><data dat_cd="G0047" rlt_cd="1" sup_resid="x" sup_name="홍엄마" inc_exc="Y"/></man></form>
</doc>
</yesone>`;

test("작은 XML 읽기: 속성·글자·빈 요소·엔티티", () => {
  const r = parseXml(`<a x="1 &amp; 2"><b/>A&lt;B</a>`);
  assert.equal(r.children[0].attrs.x, "1 & 2");
  assert.equal(r.children[0].text, "A<B");
  assert.throws(() => parseXml("<a><b></a>"));
});

test("정의서 구조로 읽기: 본인 구분, 쉼표 금액", () => {
  const [doc] = readNtsXml(XML);
  assert.equal(doc.year, "2026");
  const b101 = doc.forms.find((f) => f.formCd === "B101Y")!;
  assert.deepEqual(b101.men.map((m) => m.self), [true, false]);
  assert.equal(doc.forms[0].men[0].data[0].sum, 1_200_000);
  assert.throws(() => readNtsXml("<root/>"));
});

test("계산기 칸으로 옮기기", () => {
  const r = toYearEndFill(readNtsXml(XML));
  // 상세(A102M)가 있으면 기본(A102Y)은 건너뛰어 두 번 더하지 않아요.
  assert.equal(r.fill.insurancePremium, 1_200_000);
  assert.equal(r.fill.disabledInsurance, 300_000);
  assert.equal(r.fill.medicalSpecific, 500_000);
  assert.equal(r.fill.medical, 500_000); // 80만 - 실손 30만
  assert.equal(r.fill.educationSelf, undefined); // 가족 교육비는 칸에 넣지 않아요
  assert.equal(r.fill.pensionSavings, 2_800_000);
  assert.equal(r.fill.credit, 10_000_000);
  assert.equal(r.fill.market, 200_000);
  assert.equal(r.fill.transit, 300_000);
  assert.equal(r.fill.debit, 700_000); // 주택임차료(8)는 빼요
  assert.equal(r.fill.hometownDonation, 100_000);
  assert.equal(r.fill.religiousDonation, 50_000);
  assert.equal(r.fill.healthEmployment, 2_030_000);
  const what = r.checks.map((c) => c.what).join("|");
  assert.ok(!what.includes("유형 43") && !what.includes("유형 41"));
  for (const w of ["가족 의료비", "가족 교육비", "주택임차료", "유형 42", "소득기준 초과 부양가족: 홍엄마", "부양가족 수"]) assert.ok(what.includes(w), w);
  const z = withZeros(r.fill);
  assert.equal(z.irp, 0);
  assert.equal(z.credit, 10_000_000);
  assert.equal(Object.keys(z).length, YE_FILL_KEYS.length);
  assert.ok(!JSON.stringify(r).includes(SELF), "주민등록번호를 남기지 않아요");
});

test("PDF 첨부에서 꺼내기 (첨부 이름과 상관없이)", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  await pdf.attach(new TextEncoder().encode(XML), "anything.xml", { mimeType: "text/xml" });
  const out = await extractYesoneFromPdf(await pdf.save());
  assert.ok(out.ok);
  if (out.ok) assert.equal(toYearEndFill(readNtsXml(out.xml[0])).fill.credit, 10_000_000);
  const plain = await PDFDocument.create();
  plain.addPage();
  assert.deepEqual(await extractYesoneFromPdf(await plain.save()), { ok: false, reason: "noXml" });
  assert.deepEqual(await extractYesoneFromPdf(new TextEncoder().encode("hello")), { ok: false, reason: "notPdf" });
  const direct = await extractYesoneFromPdf(new TextEncoder().encode(XML));
  assert.ok(direct.ok);
  assert.equal(findYesoneXml("x" + XML + "y").length, 1);
});
