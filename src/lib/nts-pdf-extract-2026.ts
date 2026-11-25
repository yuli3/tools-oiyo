// 연말정산 간소화 PDF에서 XML 꺼내기 (2026-11-25). 브라우저 안에서만 돌아요(서버로 보내지 않음). pdf-lib만 써요.
// WHY: 정의서(v1.79)에는 XML을 PDF에 어떻게 담는지(첨부 이름·압축·암호)가 없어요(미확인).
//   그래서 첨부 이름에 기대지 않고, PDF 안 모든 스트림을 풀어 <yesone> 덩어리를 찾아요. 첨부(EmbeddedFile)든 다른 스트림이든 같아요.
//   암호가 걸린 PDF는 풀지 않아요. 홈택스에서 비밀번호 없이 다시 내려받도록 안내해요.
import { PDFDocument, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import { findYesoneXml } from "./nts-simplified-xml-2026.ts";

export type PdfExtract = { ok: true; xml: string[] } | { ok: false; reason: "encrypted" | "notPdf" | "noXml" };

const td = new TextDecoder("utf-8");

export async function extractYesoneFromPdf(bytes: Uint8Array): Promise<PdfExtract> {
  if (td.decode(bytes.subarray(0, 1024)).indexOf("%PDF") < 0) {
    // XML 파일을 바로 넣은 경우도 받아요.
    const xml = findYesoneXml(td.decode(bytes));
    return xml.length ? { ok: true, xml } : { ok: false, reason: "notPdf" };
  }
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  } catch {
    return { ok: false, reason: "notPdf" };
  }
  const found: string[] = [];
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    let data: Uint8Array;
    try {
      data = decodePDFRawStream(obj).decode();
    } catch {
      continue; // 모르는 필터(이미지 등)는 건너뛰어요.
    }
    if (data.length < 20) continue;
    const text = td.decode(data);
    if (text.indexOf("<yesone") < 0) continue;
    for (const x of findYesoneXml(text)) if (!found.includes(x)) found.push(x);
  }
  if (found.length) return { ok: true, xml: found };
  return { ok: false, reason: doc.isEncrypted ? "encrypted" : "noXml" };
}
