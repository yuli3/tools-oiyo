// 국세청 주제 5종 공용: 확인할 점 목록과 오늘 날짜(수화 뒤에만 읽어 SSR과 어긋나지 않게).
import { useEffect, useState } from "react";

const TONE: Record<string, string> = { warn: "text-warning", info: "text-foreground", good: "text-success" };
export const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export function Items({ items }: { items: { tone: string; text: string; cite: string }[] }) {
  return (
    <ul className="mt-2 space-y-2">
      {items.map((i, k) => (
        <li key={k} className={TONE[i.tone] ?? "text-foreground"}>
          {i.text} <span className="text-xs text-muted-foreground">({i.cite})</span>
        </li>
      ))}
    </ul>
  );
}

export function useToday(): string | undefined {
  const [t, setT] = useState<string>();
  useEffect(() => {
    const d = new Date();
    setT(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);
  return t;
}
