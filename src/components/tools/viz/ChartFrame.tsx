import type { ReactNode } from "react";

interface Props {
  title: string;
  caption?: string;
  /** 같은 값을 표로: [머리행, ...행] */
  table: string[][];
  children: ReactNode;
}

/** 그래프 공통 틀: 제목, 한 줄 설명, 그래프, "표로 보기"(화면 낭독기·인쇄용) */
export default function ChartFrame({ title, caption, table, children }: Props) {
  const [head, ...rows] = table;
  return (
    <figure className="rounded-md border border-border bg-background px-3 py-3">
      <figcaption>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        {caption && <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{caption}</span>}
      </figcaption>
      <div className="mt-3" aria-hidden="true">
        {children}
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-muted-foreground">표로 보기</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                {head.map((h) => (
                  <th key={h} className="p-1 font-semibold text-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  {r.map((c, j) => (
                    <td key={j} className="p-1 font-mono text-muted-foreground">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
