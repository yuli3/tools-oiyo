import type { ReactNode } from "react";

/** 전문가 모드 아래에 기존(정밀) 계산기를 펼쳐 보이는 칸. 날짜·자격 확인·한 줄 입력처럼 쉬운 화면에 없는 기능을 그대로 남겨요. */
export default function LegacyDetails({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-md border border-border bg-background px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">{title}</summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
