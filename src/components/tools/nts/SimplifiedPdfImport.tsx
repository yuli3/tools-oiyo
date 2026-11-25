// 연말정산 간소화 PDF 넣기 (2026-11-25). 읽기: lib/nts-pdf-extract-2026.ts → lib/nts-simplified-xml-2026.ts.
// 파일은 이 브라우저 안에서만 읽어요. 서버로 보내거나 저장하지 않아요. 읽은 값은 "칸에 넣기"를 눌러야 계산기에 들어가요.
import { useState } from "react";
import { withZeros, type YeFill, type YeImport } from "../../../lib/nts-simplified-xml-2026";

const LABEL: Record<keyof YeFill, string> = {
  insurancePremium: "보장성보험료", disabledInsurance: "장애인 보장성보험료", medical: "가족 의료비(일반)", medicalSpecific: "본인 의료비",
  educationSelf: "본인 교육비", credit: "신용카드(일반)", debit: "체크카드·현금영수증(일반)", culture: "문화체육", market: "전통시장", transit: "대중교통",
  pensionSavings: "연금저축", irp: "퇴직연금(IRP)", isaTransfer: "ISA 만기 이전", rent: "월세", leaseRepaid: "전세대출 원리금", subscriptionPaid: "주택청약",
  mortgageInterest: "주택담보대출 이자", donation: "기부금(법정·지정)", religiousDonation: "종교단체 기부금", politicalDonation: "정치자금 기부금",
  hometownDonation: "고향사랑기부금", nationalPension: "국민연금", healthEmployment: "건강·장기요양·고용보험료",
};
const REASON = {
  encrypted: "암호가 걸린 PDF예요. 홈택스에서 비밀번호 없이 다시 내려받아 넣어 주세요.",
  notPdf: "간소화 PDF나 XML 파일이 아니에요.",
  noXml: "이 PDF 안에서 간소화 자료(XML)를 찾지 못했어요. 홈택스 '연말정산 간소화'에서 내려받은 PDF인지 확인해 주세요.",
  bad: "자료를 읽다가 멈췄어요. 파일이 손상됐을 수 있어요.",
} as const;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export default function SimplifiedPdfImport({ onApply, note }: { onApply: (fill: YeFill) => void; note?: string }) {
  const [res, setRes] = useState<YeImport | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const read = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true); setErr(""); setRes(null); setDone(false);
    try {
      const [{ extractYesoneFromPdf }, { readNtsXml, toYearEndFill }] = await Promise.all([import("../../../lib/nts-pdf-extract-2026"), import("../../../lib/nts-simplified-xml-2026")]);
      const out = await extractYesoneFromPdf(new Uint8Array(await file.arrayBuffer()));
      if (!out.ok) setErr(REASON[out.reason]);
      else setRes(toYearEndFill(out.xml.flatMap((x) => readNtsXml(x))));
    } catch {
      setErr(REASON.bad);
    } finally {
      setBusy(false);
    }
  };
  const rows = res ? (Object.entries(res.fill) as [keyof YeFill, number][]) : [];

  return (
    <section aria-labelledby="ye-pdf" className="space-y-3 rounded-2xl border-2 border-primary/40 bg-card p-4">
      <h2 id="ye-pdf" className="text-lg font-bold text-foreground">간소화 PDF 넣기</h2>
      <p className="text-sm leading-6 text-foreground">홈택스에서 내려받은 연말정산 간소화 PDF를 넣으면 보험료·의료비·카드·연금저축 같은 칸을 채워 드려요. <strong>파일은 이 브라우저 안에서만 읽고 서버로 보내지 않아요.</strong></p>
      <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-background px-4 py-3 text-sm font-bold text-foreground hover:border-primary">
        {busy ? "읽는 중…" : "PDF 고르기 (또는 XML)"}
        <input type="file" accept=".pdf,.xml,application/pdf,text/xml" className="sr-only" onChange={(e) => { void read(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      <div aria-live="polite" className="space-y-3">
        {err && <p className="rounded-lg border border-destructive/40 bg-background px-3 py-2 text-sm text-foreground">{err}</p>}
        {res && rows.length === 0 && <p className="text-sm text-foreground">계산기에 옮길 금액이 없어요.</p>}
        {res && rows.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">{res.year ? `${res.year}년 귀속 · ` : ""}서식 {res.forms.length}종 · {res.people}명 자료</p>
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => <li key={k} className="flex justify-between gap-2 rounded-md bg-background px-3 py-1"><span>{LABEL[k]}</span><span className="font-mono font-semibold tabular-nums">{won(v)}</span></li>)}
            </ul>
            <button type="button" onClick={() => { onApply(withZeros(res.fill)); setDone(true); }} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">{done ? "칸에 넣었어요" : "이 금액을 계산기 칸에 넣기"}</button>
            {note && <p className="text-xs text-foreground">{note}</p>}
            <p className="text-xs text-muted-foreground">PDF에 없는 칸은 0으로 바꿔요. 총급여·기납부세액·부양가족 수는 PDF에 없어 그대로 둬요. 회사 원천징수영수증으로 넣어요.</p>
          </>
        )}
        {res && res.checks.length > 0 && (
          <div className="rounded-lg border border-border bg-muted px-3 py-2">
            <p className="text-sm font-semibold text-foreground">직접 확인할 것 {res.checks.length}개</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground">
              {res.checks.map((c, i) => <li key={i}><strong>{c.what}</strong>{c.amount ? ` ${won(c.amount)}` : ""}: {c.why}</li>)}
            </ul>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">읽는 규칙: 국세청 연말정산간소화 전자문서 XML 정의서 v1.79. 상세내역이 있으면 기본내역과 겹치지 않게 상세만 써요.</p>
    </section>
  );
}
